import { debounce } from 'lodash';
import {
    noop,
    createElement,
    calculateAspectRatioFit,
    getRadianFromDegrees,
    hasClass,
    removeClass,
    getMousePosition } from './utils';

const NAMESPACE = 'image-editor';
const IMAGE_ALT_TEXT = 'Image being edited';
const EDITOR_GUTTER = 0.85;
const DEBUG = true;

// https://codepen.io/anon/pen/YQJmMr
//https://stackoverflow.com/questions/34597160/html-canvas-mouse-position-after-scale-and-translate
var matrix = [1,0,0,1,0,0];
var invMatrix = [1,0,0,1];
function createMatrix(x, y, scale, rotate){
    var m = matrix; // just to make it easier to type and read
    var im = invMatrix; // just to make it easier to type and read

    // create the rotation and scale parts of the matrix
    m[3] =   m[0] = Math.cos(rotate) * scale;
    m[2] = -(m[1] = Math.sin(rotate) * scale);

    // add the translation
    m[4] = x;
    m[5] = y;

    // calculate the inverse transformation

    // first get the cross product of x axis and y axis
    var cross = m[0] * m[3] - m[1] * m[2];

    // now get the inverted axis
    im[0] =  m[3] / cross;
    im[1] = -m[1] / cross;
    im[2] = -m[2] / cross;
    im[3] =  m[0] / cross;
}

function toWorld(x,y){
    var xx, yy, m, result;
    m = invMatrix;
    xx = x - matrix[4];     // remove the translation
    yy = y - matrix[5];     // by subtracting the origin
    // return the point {x:?,y:?} by multiplying xx,yy by the inverse matrix
    return {
        x:   xx * m[0] + yy * m[2],
        y:   xx * m[1] + yy * m[3]
    }
}


// animationframe
// drawImage while resizing crop area
// https://stackoverflow.com/questions/6198771/drawing-image-in-canvas-at-an-angle-without-rotating-the-canvas
// https://stackoverflow.com/questions/41847928/scaling-the-image-and-fitting-in-the-canvas-after-rotation

// when crop tool hits boundary and there's image overflow, zoom/scale image down
// when cropping down, cropped area zooms out to max width and height according to aspect ratio of container
/*
 * Cropping area
 * on page load dimensions of the cropping area = the scaled dims of the image
 *
 * 1.    the min dimensions of the cropping area:
 *
 *       a) when the scaled image dims are >= than the cropped area ? 50px square (or according to the aspect ratio)
 *       b) when the scaled image dims === cropped area ? image dims
 *
 * 2.    the max dimensions of the cropping area:
 *       a) when the image dims are > than the cropped area ? = the container bounds - gutter
 *
 *       b) when a crop handler reaches its max bound in any corner
 *       i) if scaled image dim are greater than the cropped area ? make transform-origin the dragged corner of the cropped Area and scale the image
 *      while the mouse is down according to mouse position * sensitivity (the more image overflow there is the faster the growth) until the
 *      cropped area dims reach the scaled height or width of the image
 *
 *      c) when scaled image dims === cropping area dims ?
 *
 * */


export default class ImageEditor {

    constructor( props, container ) {

        // cache of computed image properties
        this.image = {
            transform: {
                ratio: 0,
                translateX: 0,
                translateY: 0,
                degrees: 0,
                radians: getRadianFromDegrees( 0 ),
                origin: [ 'center', 'center' ]
            },
            // this will contain the last offset position of the image
            // calculated from traslated origin
            position: {
                left: 0,
                top: 0
            },
            rotated: false,
            width: 0,
            height: 0
        };

        // the crop tool
        this.croppingArea = {
            // maximum dimensions of the crop tool
            // crop rectangle cannot be bigger than these values
            // update with viewport size * aspect ratio
            maxDimensions: {
                width: 0,
                height: 0
            },
            // minimum dimensions of the crop tool
            // crop rectangle cannot be smaller than these values
            // update with aspect ratio
            minDimensions: {
                width: 50,
                height: 50
            },
            // current position of the crop rectangle  
            position: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            // current dimensions
            width: 0,
            height: 0
        };

        this.constrain = false;

        // cache of computed this.imageEditorContainer properties
        this.outerContainer = {
            width: 0,
            height: 0
        };

        // this will be an ajax call
        this.imagePath = props.imagePath;

        // container for the original image
        this.imageObjClone = null;

        // append elements
        this.container = container;

        // bind class methods to this
        this.onImageLoaded = this.onImageLoaded.bind( this );
        this.updateWorkspace = this.updateWorkspace.bind( this );
        this.onWindowResize = this.onWindowResize.bind( this );
        this.updateWorkspace = this.updateWorkspace.bind( this );
        this.onStartDragCropArea = this.onStartDragCropArea.bind( this );
        // this.onDragCropArea = this.onDragCropArea.bind( this );
        // this.onStopDragCropArea = this.onStopDragCropArea.bind( this );
        this.onStartCropResize = this.onStartCropResize.bind( this );
        this.onCropResize = this.onCropResize.bind( this );
        this.onStopCropResize = this.onStopCropResize.bind( this );


        // create elements
        const fragment = document.createDocumentFragment();

        // the image to manipulate
        this.imageObj = new Image();
        this.imageObj.className = `${NAMESPACE}__image-layer`;
        this.imageObj.setAttribute( 'alt', this.imageAltText || IMAGE_ALT_TEXT );
        this.imageObj.onload = this.onImageLoaded;
        this.imageObj.onerror = noop;

        // create a clone of the original image
        this.imageObjClone = this.imageObj.cloneNode(true);


        // this is the canvas that we display to the UI 
        // its purpose is to present a preview of the crop area
        // it will be cropped, rotated and resized in line with the cropping area's state
        // mostly by CSS
        // it does no canvas resizing, rotating and translation relative to the sourceImage (i.e., the final export)
        // which is done by the offPage workspace
        this.canvasUI = createElement( {
            tagName: 'canvas',
            className: `${NAMESPACE}__canvas-ui`
        } );

       // this is the offPage workspace
       // it takes the output of this.canvasUIUI, and calculates the positions and ratios required to create output image
       // https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-pre-render
       // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas 
        this.canvasWorkspace = createElement( {
            tagName: 'canvas',
            className: `${NAMESPACE}__canvas-workspace`
        } );

        // this is the cropping tool
        // add the cropping tool and the canvas element
        this.cropAreaContainer = createElement( {
            tagName: 'div',
            className: `${NAMESPACE}__crop-container`,
            'aria-label': 'Cropping area',
            children : [
                {
                    tagName: 'div',
                    className: `image-editor__draggable-corner ${NAMESPACE}__draggable-corner-nw`
                },
                {
                    tagName: 'div',
                    className: `image-editor__draggable-corner ${NAMESPACE}__draggable-corner-ne`
                },
                {
                    tagName: 'div',
                    className: `image-editor__draggable-corner ${NAMESPACE}__draggable-corner-sw`
                },
                {
                    tagName: 'div',
                    className: `image-editor__draggable-corner ${NAMESPACE}__draggable-corner-se`
                },
                {
                    tagName: 'span',
                    className: `image-editor__guide ${NAMESPACE}__guide-horiz-top`
                },
                {
                    tagName: 'span',
                    className: `image-editor__guide ${NAMESPACE}__guide-horiz-bottom`
                },
                this.canvasUI ]

        } );

        // this is the workspace wrapper
        this.imageEditorWorkspace = createElement( {
            tagName: 'div',
            className: `${NAMESPACE}__workspace`,
            children : [ this.cropAreaContainer, this.imageObj ]
        } );

        // this is the main container
        this.imageEditorContainer = createElement( {
            tagName: 'div',
            className: `${NAMESPACE}__container ${NAMESPACE}__container-loading`,
            children : [ this.imageEditorWorkspace ]
        } );


        // add event listeners for dragging
        // TODO: add helper for multiple event handlers
        this.cropAreaContainer.addEventListener( 'mousedown', this.onStartDragCropArea );
        this.cropAreaContainer.addEventListener( 'touchstart', this.onStartDragCropArea, { passive: true } );

        // dragging flag
        this.dragging = false;


        // append elements
        fragment.appendChild( this.imageEditorContainer );
        this.container.appendChild( fragment );

        // requestAnimationFrame to optimize constant coordinate updates
        this.frameRequestId = null;
        this.dragRequestId = null;
        this.resizing = false;

        // callbacks
        this.onWorkSpaceUpdated = props.onWorkSpaceUpdated;

        // load image and prepare workspace
        this.imageObj.src = this.imagePath;

        return this;

    }

    onImageLoaded() {

        // initial update of coordinates
        this.updateWorkspace();

        // capture window resize event streams
        // this will be request animation frame
        if ( typeof window !== 'undefined' ) {
            window.addEventListener( 'resize', this.onWindowResize );

            // temp debounce
            // we'll draw to the hidden workspace image when needed
            this.drawImage = debounce( this.drawImage, 250 );
        }

        // finally, we show the workspace
        // place it on the end of the stack to ensure the update takes place first
        setTimeout( () => {
            removeClass( this.imageEditorContainer, `${NAMESPACE}__container-loading` );
        } );
    }

    onWindowResize() {
        if ( ! this.resizing ) {
            this.frameRequestId = window.requestAnimationFrame( this.updateWorkspace );
        }
        this.resizing = true;
    }

    /*

     onStartDragCropArea - main event delegator
     Since all the interaction takes place on the cropArea,
     we don't need to assign multiple events to each drag handle and so on

     */
    onStartDragCropArea( event ) {

        event.preventDefault();

        // if we've hit a drag handle, stop propagation
        // and throw the event to the crop resize setup method
        if  ( hasClass( event.target, `${NAMESPACE}__draggable-corner` ) ) {
            event.stopImmediatePropagation();
            //this.dragRequestId = window.requestAnimationFrame( this.updateWorkspace );

            // cache the event
            this.cropEvent = event;

            this.onStartCropResize(event);
            return false;
        }

    }

    onStartCropResize ( event ) {

        this.dragging = true;

        event.preventDefault();


        document.addEventListener( 'touchmove', this.onCropResize );
        document.addEventListener( 'touchend', this.onStopCropResize );
        document.addEventListener( 'mousemove', this.onCropResize );
        document.addEventListener( 'mouseup', this.onStopCropResize );


        this.mousePos = {
            x: 0,
            y: 0
        };

        // TODO: delete
        // this.relativePos = {
        //     x: mousePos.x - this.mousePos.x,
        //     y: mousePos.y - this.mousePos.y
        // };

    }

    onCropResize ( event ) {

        this.mousePos = getMousePosition( event, this.imageEditorContainer );

        // first check the mouse boundaries

        // now calculate the new dimensions of the crop area
        let width, height, left, top;

        if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-se` ) ) {
            console.log(`${NAMESPACE}__draggable-corner-se`);

            width  = this.mousePos.x - this.croppingArea.position.left;
            height = this.mousePos.y - this.croppingArea.position.top;
            left = this.croppingArea.position.left;
            top = this.croppingArea.position.top;

            // origin of image scale should be set to the opposite corner of this handle
            this.image.transform.origin = [ 'left', 'top' ];

        }

        if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-sw` ) ) {

            width  = this.croppingArea.width - ( this.mousePos.x - this.croppingArea.position.left );
            height = this.mousePos.y - this.croppingArea.position.top;
            left = this.mousePos.x;
            top = this.croppingArea.position.top;

            // origin of image scale should be set to the opposite corner of this handle
            this.image.transform.origin = [ 'right', 'top' ];

        }

        if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-nw` ) ) {

            width = this.croppingArea.width - ( this.mousePos.x - this.croppingArea.position.left );
            height = this.croppingArea.height - ( this.mousePos.y - this.croppingArea.position.top );
            left = this.mousePos.x;
            top = this.mousePos.y ;
            if ( this.constrain || this.cropEvent.shiftKey ) {
                top = this.mousePos.y - ( ( width / this.image.width * this.image.height ) - height );
            }

            // origin of image scale should be set to the opposite corner of this handle
            this.image.transform.origin = [ 'right', 'bottom' ];

        }

        if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-ne` ) ) {

            width = ( this.mousePos.x - this.croppingArea.position.left );
            height = this.croppingArea.height - ( this.mousePos.y - this.croppingArea.position.top );
            left = this.croppingArea.position.left;
            top = this.mousePos.y ;
            if ( this.constrain || this.cropEvent.shiftKey ) {
                top = this.mousePos.y - ( (width / this.image.width * this.image.height ) - height );
            }

            // origin of image scale should be set to the opposite corner of this handle
            this.image.transform.origin = [ 'left', 'bottom' ];

        }

        if ( this.constrain || this.cropEvent.shiftKey ) {
            height = width / this.image.width * this.image.height;
        }

        // only apply the new dimensions if fall within the min and max values
        // this needs to be updated depending on the
        // TODO: the box is sticky when it hits the extremities, and won't resize

        if ( width > this.croppingArea.minDimensions.width
            && height > this.croppingArea.minDimensions.height
            && width < this.croppingArea.maxDimensions.width
            && height < this.croppingArea.maxDimensions.height ) {

            this.croppingArea.width = width;
            this.croppingArea.height = height;

            this.croppingArea.position = {
                top,
                right: left + this.croppingArea.width,
                bottom: top + this.croppingArea.height,
                left
            };

            this.cropAreaContainer.style.width =  `${ this.croppingArea.width }px`;
            this.cropAreaContainer.style.height = `${ this.croppingArea.height }px`;
            this.cropAreaContainer.style.left = `${ this.croppingArea.position.left  }px`;
            this.cropAreaContainer.style.top = `${ this.croppingArea.position.top }px`;
        }

    }


    zoomImage() {



       this.imageObj.style.transformOrigin = this.image.transform.origin.join( ' ' );


        const newScaleRatio = calculateAspectRatioFit(

            this.croppingArea.width,
            this.croppingArea.height,
            this.image.width,
            this.image.height,

            this.image.rotated,
            EDITOR_GUTTER );

var scalechange = newScaleRatio.ratio - this.image.transform.ratio;
var offsetX = -(this.croppingArea.position.left * scalechange);
var offsetY = -(this.croppingArea.position.top * scalechange);


        // center the crop area    
        const outerContainerCenterX = Math.floor( ( this.outerContainer.width / 2 ) );
        const outerContainerCenterY = Math.floor( ( this.outerContainer.height / 2 ) );
        const newXPosition = outerContainerCenterX - ( this.croppingArea.width / 2 ) ;
        const newYPosition = outerContainerCenterY - ( this.croppingArea.height / 2 ) ;
        this.cropAreaContainer.style.left = `${ newXPosition }px`;
        this.cropAreaContainer.style.top = `${ newYPosition }px`;
        // this.cropAreaContainer.style.width = `${ newScaleRatio.width }px`;
        // this.cropAreaContainer.style.height = `${ newScaleRatio.height}px`;

        this.croppingArea.position = Object.assign( {},  this.croppingArea.position, {
            left: newXPosition,
            top: newYPosition
        } );
        // this.croppingArea.width = newScaleRatio.width;
        //  this.croppingArea.height = newScaleRatio.height;






// setTimeout( ()=> {
//     this.cropAreaContainer.style.transition = 'unset';
// });
console.log(this.image.transform, this.croppingArea.position.left, this.croppingArea.position.top);

        // - -
        createMatrix(

            // SW 
            this.image.transform.translateX + (this.croppingArea.position.left - this.image.transform.translateX), 
            this.image.transform.translateY + (this.croppingArea.position.top - this.image.transform.translateY), 

                        // NW
            // this.image.transform.translateX + (this.image.transform.translateX - this.croppingArea.position.left ), 
            // this.image.transform.translateY + (this.image.transform.translateY - this.croppingArea.position.top ), 
        1, 
        this.image.transform.radians );

        var m = matrix;
        this.imageObj.style.transform = `matrix(${m[0]}, ${m[1]}, ${m[2]}, ${m[3]}, ${m[4]}, ${m[5]})`;



       this.image.transform = Object.assign( {}, this.image.transform, {
            // translateX:offsetX,
            // translateY:offsetY,
            // ratio: newScaleRatio.ratio,
           // origin: [ 'left', 'top' ]         // make sure we scale the image from the original origin

        } );
return;

// ( srcWidth, srcHeight, maxWidth, maxHeight, rotated = false, gutter = 1 )
    //const newImageScaleRatio = Math.min( this.croppingArea.width / this.image.width, this.croppingArea.height / this.image.height ) * .85;

// maxWidth / srcWidth, maxHeight / srcHeight



// scalechange = newscale - oldscale;
// offsetX = -(zoomPointX * scalechange);
// offsetY = -(zoomPointY * scalechange);

        // get aspect ratio with cropping tool as max width
        /*
       const outerContainerCenterX = Math.floor( ( this.outerContainer.width / 2 ) );
        const outerContainerCenterY = Math.floor( ( this.outerContainer.height / 2 ) );
        const newScaleRatio = calculateAspectRatioFit(

            this.image.width,
            this.image.height,

            this.croppingArea.width,
            this.croppingArea.height,
            this.image.rotated,
            EDITOR_GUTTER );

var scalechange = newScaleRatio.ratio - this.image.transform.ratio;
var offsetX = -(this.croppingArea.position.left * scalechange);
var offsetY = -(this.croppingArea.position.top * scalechange);



 console.log('ratio', newScaleRatio.ratio, this.image.transform.ratio, scalechange );

       this.imageObj.style.transformOrigin = this.image.transform.origin.join( ' ' );
       const translateX = Math.floor( ( ( outerContainerCenterX  - ( newScaleRatio.width / 2 ) ) ) );


       const translateY = Math.floor( ( ( outerContainerCenterY - ( newScaleRatio.height / 2 ) ) ) );
        
       
                console.log('is this happening?', offsetX, offsetY, scalechange, this.image.transform.radians)

        createMatrix(offsetX, offsetY, scalechange, this.image.transform.radians );

        
        


        var m = matrix;
        this.imageObj.style.transform = `matrix(${m[0]}, ${m[1]}, ${m[2]}, ${m[3]}, ${m[4]}, ${m[5]})`;

   
       // save image translate values
        this.image.transform = Object.assign( {}, this.image.transform, {
            translateX:offsetX,
            translateY:offsetY,
            ratio: newScaleRatio.ratio,
            origin: [ 'left', 'top' ]         // make sure we scale the image from the original origin

        } );

        this.image.width = newScaleRatio.width;
        this.image.height = newScaleRatio.height;*/

    }

    onStopCropResize () {

        this.dragging = false;
        this.mousePos = null;
        this.cropEvent = null;




        document.removeEventListener( 'mousemove', this.onCropResize );
        document.removeEventListener( 'mouseup', this.onStopCropResize );

        document.removeEventListener( 'touchmove', this.onCropResize );
        document.removeEventListener( 'touchend', this.onStopCropResize );

        // this.updateWorkspace();
        // this.drawImage();
            this.zoomImage();   



        //window.cancelAnimationFrame( this.dragRequestId );
    }





    updateWorkspace() {

        console.log( 'tick' );

        // cache the container offset width
        this.outerContainer.width = this.imageEditorWorkspace.offsetWidth;
        this.outerContainer.height = this.imageEditorWorkspace.offsetHeight;

        // get aspect ratio
        const scaleRatio = calculateAspectRatioFit(
            this.imageObj.naturalWidth,
            this.imageObj.naturalHeight,
            this.outerContainer.width,
            this.outerContainer.height,
            this.image.rotated,
            EDITOR_GUTTER );

        const outerContainerCenterX = Math.floor( ( this.outerContainer.width / 2 ) );
        const outerContainerCenterY = Math.floor( ( this.outerContainer.height / 2 ) );

        // transform origin of scaled image should change any time there's a scaled zoom
        // this is trigged by the upscaling drag or downscaling mouse up of the cropArea
        // and will be the opposite corner of the dragged cropArea

        //const transformOrigin = [ `${ outerContainerCenterX }px`, `${ outerContainerCenterY }px` ];
        //this.imageObj.style.transformOrigin = transformOrigin.join( ' ' );

        // image transform
        const translateX = Math.floor( ( ( outerContainerCenterX  - ( this.imageObj.width / 2 ) ) ) );
        const translateY = Math.floor( ( ( outerContainerCenterY - ( this.imageObj.height / 2 ) ) ) );

        this.imageObj.style.transformOrigin = this.image.transform.origin.join( ' ' );

        createMatrix(translateX, translateY, scaleRatio.ratio, this.image.transform.radians );

        // css: matrix(scaleX, 0, 0, scaleY, translateX, translateY);
        // create the matrix at x,y scale, rotation time/3

        //transformCSS( this.imageObj, translateX, translateY, 1, this.image.transform.radians );


        var m = matrix;
        this.imageObj.style.transform = `matrix(${m[0]}, ${m[1]}, ${m[2]}, ${m[3]}, ${m[4]}, ${m[5]})`;

        // save image translate values
        this.image.transform = Object.assign( {}, this.image.transform, {
            translateX,
            translateY,
            ratio: scaleRatio.ratio
        } );

        this.image.width = scaleRatio.width;
        this.image.height = scaleRatio.height;



        // crop area transform
        // requires a massive clean up after the calcs are worked out
        // TODO: calculate left, top in relation to translateX Y
        console.log(this.croppingArea.width, scaleRatio.width);
        this.cropAreaContainer.style.width =  `${ scaleRatio.width }px`;
        this.cropAreaContainer.style.height = `${ scaleRatio.height }px`;
        this.croppingArea.width = scaleRatio.width;
        this.croppingArea.height = scaleRatio.height;


        this.croppingArea.position = {
            top: Math.floor( ( ( outerContainerCenterY - ( scaleRatio.height / 2 ) ) ) ),
            right: ( translateX + scaleRatio.width ),
            bottom: ( translateY + scaleRatio.height ),
            left: Math.floor( ( ( outerContainerCenterX  - ( scaleRatio.width / 2 ) ) ) )
        };

        this.cropAreaContainer.style.left = `${ this.croppingArea.position.left  }px`;
        this.cropAreaContainer.style.top = `${ this.croppingArea.position.top }px`;



        this.croppingArea.maxDimensions = {
            width: scaleRatio.width >= this.outerContainer.width ? this.outerContainer.width : scaleRatio.width,
            height: scaleRatio.height >= this.outerContainer.height ? this.outerContainer.height : scaleRatio.height
        };


console.log(this.croppingArea);




        //this.drawImage();
        this.resizing = false;

    }

    drawImage() {

        const context = this.canvasUI.getContext('2d');
        const rotated = this.image.rotated;

        //const cropBounds = this.croppingArea.position;
        // this will cause a redraw, so the next plan is to calc the coords via math then cache
        // well, that's the plan
        this.croppingArea.position = this.cropAreaContainer.getBoundingClientRect();

        // set size of canvas
        // for now we're just flipping by 90deg
        const scaledCropWidth = Math.floor( ( this.croppingArea.position.width / this.image.transform.ratio  ) - 1 );
        const scaledCropHeight = Math.floor( ( this.croppingArea.position.height / this.image.transform.ratio  ) - 1 );
        this.canvasUI.width = scaledCropWidth;
        this.canvasUI.height =  scaledCropHeight;

        context.clearRect( 0, 0, scaledCropWidth, scaledCropHeight );

        if ( rotated ) {
            // origin of the canvas rotate is the middle
            context.translate( scaledCropWidth / 2, scaledCropHeight / 2 );
            context.rotate( this.image.transform.radians );
        }

        context.save();

        // because of the 1px border
        // TODO: make a CONSTANT out of this
        const sourceX = this.croppingArea.position.left - this.croppingArea.position.lef - 1;
        const sourceY = this.croppingArea.position.top - this.croppingArea.position.top - 1;

        const sourceWidth = this.imageObj.naturalWidth;
        const sourceHeight = this.imageObj.naturalHeight;

        // get the destination x, y
        const destX = rotated ?  -1 * ( sourceWidth / 2 ) : 0;
        const destY =  rotated ? -1 * ( sourceHeight / 2 ) : 0;

        // the cropped area
        const destWidth = rotated ? scaledCropHeight: scaledCropWidth;
        const destHeight = rotated ? scaledCropWidth : scaledCropHeight;


        context.drawImage(
            this.imageObj,
            // x, y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
            sourceX, sourceY,
            // w and h of the sub-rectangle of the source image to draw into the destination context.
            sourceWidth, sourceHeight,
            // x, y coordinates in the destination canvas at which to place the top-left corner of the source image.
            destX, destY,
            // w and h of the image in the destination canvas. Changing these values scales the sub-rectangle in the destination context.
            destWidth, destHeight );

        context.restore();

        this.onWorkSpaceUpdated( {
            canvas: this.canvasUI,
            original: {
                width: this.imageObj.naturalWidth,
                height: this.imageObj.naturalHeight
            },
            cropped: {
                width: scaledCropWidth,
                height: scaledCropHeight,
                rotated: rotated
            }
        } );
    }

    rotate( degrees ) {
        // TODO: check if one of 90/180/270
        this.image.transform.degrees = degrees;
        this.image.transform.radians = getRadianFromDegrees( degrees );
        this.image.rotated = ! ( ( this.image.transform.degrees % 180 ) === 0 );
        this.updateWorkspace();
    }

    reset() { }
    destroy() { }


    // ==== editing API
    // rotate( callback ) // returns new coords
    // reflect( callback ) // returns new coords
    // changeAspectRatio( callback ) // returns new coords
    // save() // returns blob
    // preview() // returns image/png for optional preview before save
    // reset( callback )
    // onImageLoaded( callback ) // allows consumers to do something after bootstrap
    // destroy () clear container and remove all event listeners
    // getOriginalImage() // returns original image
    // getWorkingImage() // returns image at current crop state


}