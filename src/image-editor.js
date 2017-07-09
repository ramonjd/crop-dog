import { debounce } from 'lodash';
import {
    noop,
    createElement,
    calculateAspectRatioFit,
    getRadianFromDegrees,
    transformCSS,
    hasClass,
    removeClass,
    getMousePosition } from './utils';

const NAMESPACE = 'image-editor';
const IMAGE_ALT_TEXT = 'Image being edited';
const EDITOR_GUTTER = 0.85;
const DEBUG = true;

// animationframe
// drawImage while resizing crop area
// https://stackoverflow.com/questions/6198771/drawing-image-in-canvas-at-an-angle-without-rotating-the-canvas
// https://stackoverflow.com/questions/41847928/scaling-the-image-and-fitting-in-the-canvas-after-rotation

// when crop tool hits boundary and there's image overflow, zoom/scale image down
// when cropping down, cropped area zooms out to max width and height according to aspect ratio of container


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
                width: 0,
                height: 0
            },
            // this will contain the last offset position of the image
            position: {
                left: 0,
                top: 0
            },
            rotated: false
        };

        this.cropBounds = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        this.crop = {
            transform: {
                translateX: 0,
                translateY: 0,
                degrees: 0,
                width: 0,
                height: 0
            }
        };

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


        // this is the working space
        this.canvas = createElement( {
            tagName: 'canvas',
            className: `${NAMESPACE}__canvas`
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
                this.canvas ]

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
        console.log('fsdsdsrag')

        // if we've hit a drag handle, stop propagation
        // and throw the event to the crop resize setup method
        if  ( hasClass( event.target, `${NAMESPACE}__draggable-corner` ) ) {
            console.log('frag')
            event.stopImmediatePropagation();
            this.dragRequestId = window.requestAnimationFrame( this.updateWorkspace );
            this.onStartCropResize(event);
            return false;
        }

    }

    onStartCropResize ( event ) {

        event.preventDefault();

        this.eventTarget = event.target;

        document.addEventListener( 'touchmove', this.onCropResize );
        document.addEventListener( 'touchend', this.onStopCropResize );
        document.addEventListener( 'mousemove', this.onCropResize );
        document.addEventListener( 'mouseup', this.onStopCropResize );

        this.dragging = true;

        const mousePos = getMousePosition( event );

        this.mousePos = {
            x: 0,
            y: 0
        };

        this.relativePos = {
            x: mousePos.x - this.mousePos.x,
            y: mousePos.y - this.mousePos.y
        };

    }

    onCropResize ( event ) {

        this.mousePos = getMousePosition( event, this.imageEditorContainer );

        // first check the mouse boundaries

        // now calculate the new dimensions of the crop area
        let width, height, left, top;

        if ( this.eventTarget.classList.contains( `${NAMESPACE}__draggable-corner-se` ) ) {
            width  = this.mousePos.x - this.cropAreaContainer.offsetLeft;
            height = this.mousePos.y - this.cropAreaContainer.offsetTop;
            left = this.cropAreaContainer.offsetLeft;
            top = this.cropAreaContainer.offsetTop;
        }

        if ( this.eventTarget.classList.contains( `${NAMESPACE}__draggable-corner-sw` ) ) {
            width  = this.cropAreaContainer.offsetWidth - ( this.mousePos.x - this.cropAreaContainer.offsetLeft );
            height = this.mousePos.y - this.cropAreaContainer.offsetTop;
            left = this.mousePos.x;
            top = this.cropAreaContainer.offsetTop;
        }

        if ( this.eventTarget.classList.contains( `${NAMESPACE}__draggable-corner-nw` ) ) {
            width = this.cropAreaContainer.offsetWidth - ( this.mousePos.x - this.cropAreaContainer.offsetLeft );
            height = this.cropAreaContainer.offsetHeight - ( this.mousePos.y - this.cropAreaContainer.offsetTop );
            left = this.mousePos.x;
            top = this.mousePos.y ;
            if ( this.constrain || event.shiftKey ) {
                top = this.mousePos.y - (  Math.round( width / ( this.imageObjClone.width / this.imageObjClone.height ) ) - height );
            }
        }

        if ( this.eventTarget.classList.contains( `${NAMESPACE}__draggable-corner-ne` ) ) {
            width = ( this.mousePos.x - this.cropAreaContainer.offsetLeft );
            height = this.cropAreaContainer.offsetHeight - ( this.mousePos.y - this.cropAreaContainer.offsetTop );
            left = this.cropAreaContainer.offsetLeft;
            top = this.mousePos.y ;
            if ( this.constrain || event.shiftKey ) {
                top = this.mousePos.y - (  Math.round( width / ( this.imageObjClone.width / this.imageObjClone.height ) ) - height );
            }
        }

        if ( this.constrain || event.shiftKey ){
            height = Math.round( width / ( this.imageObjClone.width/this.imageObjClone.height ) )
        }


        // // only apply the new dimensions if fall within the min and max values
        // if ( width > this.state.minCropWidth
        //     && height > this.state.minCropHeight
        //     && width < this.state.maxCropWidth
        //     && height < this.state.maxCropHeight ) {

            // set new crop container data
            this.cropAreaContainer.style.width = `${width}px`;
            this.cropAreaContainer.style.height = `${height}px`;
            this.cropAreaContainer.style.left = `${left}px`;
            this.cropAreaContainer.style.top = `${top}px`;

        // }

    }

    onStopCropResize () {

        this.dragging = false;
        this.mousePos = null;

        document.removeEventListener( 'mousemove', this.onCropResize );
        document.removeEventListener( 'mouseup', this.onStopCropResize );

        document.removeEventListener( 'touchmove', this.onCropResize );
        document.removeEventListener( 'touchend', this.onStopCropResize );

        this.updateWorkspace();
        this.drawImage();

        window.cancelAnimationFrame( this.dragRequestId );
    }


    updateWorkspace() {

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


        const outerContainerCenterX = ( this.outerContainer.width / 2 );
        const outerContainerCenterY = ( this.outerContainer.height / 2 );
        const translateX = Math.floor( ( ( outerContainerCenterX - ( scaleRatio.width / 2 ) ) ) );
        const translateY = Math.floor( ( ( outerContainerCenterY - ( scaleRatio.height / 2 ) ) ) );

        this.cropAreaContainer.style.width = `${ scaleRatio.width }px`;
        this.cropAreaContainer.style.height = `${ scaleRatio.height }px`;
        this.imageObj.width = scaleRatio.width;
        this.imageObj.height = scaleRatio.height;

        transformCSS( this.imageObj, translateX, translateY, 1, this.image.transform.radians );
        transformCSS( this.cropAreaContainer, translateX, translateY, 1, this.image.transform.radians );

        // save translate values
        this.image.transform = Object.assign( {}, this.image.transform, {
            translateX,
            translateY,
            ...scaleRatio
        } );

        this.crop.transform = Object.assign( {}, this.crop.transform, {
            translateX,
            translateY,
            ...scaleRatio
        } );

        this.drawImage();
        this.resizing = false;

    }

    drawImage() {

        const context = this.canvas.getContext('2d');
        const rotated = this.image.rotated;

        //const cropBounds = this.cropBounds;
        // this will cause a redraw, so the next plan is to calc the coords via math then cache
        // well, that's the plan
        this.cropBounds = this.cropAreaContainer.getBoundingClientRect();
        console.log('this.cropBounds', this.cropBounds);

        // set size of canvas
        // for now we're just flipping by 90deg
        const scaledCropWidth = Math.floor( ( this.cropBounds.width / this.image.transform.ratio  ) - 1 );
        const scaledCropHeight = Math.floor( ( this.cropBounds.height / this.image.transform.ratio  ) - 1 );
        this.canvas.width = scaledCropWidth;
        this.canvas.height =  scaledCropHeight;

        context.clearRect( 0, 0, this.canvas.width, this.canvas.height );

        if ( rotated ) {
            // origin of the canvas rotate is the middle
            context.translate( this.canvas.width / 2, this.canvas.height / 2 );
            context.rotate( this.image.transform.radians );
        }

        context.save();

        // because of the 1px border
        // TODO: make a CONSTANT out of this
        const sourceX = this.crop.transform.translateX - this.crop.transform.translateX - 1;
        const sourceY = this.crop.transform.translateY - this.crop.transform.translateY - 1;

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
            canvas: this.canvas,
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