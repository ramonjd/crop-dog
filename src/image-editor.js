import { debounce } from 'lodash';
import {
    noop,
    createElement,
    calculateAspectRatioFit } from './utils';

const NAMESPACE = 'image-editor';
const IMAGE_ALT_TEXT = 'Image being edited';
const EDITOR_GUTTER = 0.85;
const DEBUG = true;

// animationframe
// drawImage while resizing crop area
// https://stackoverflow.com/questions/6198771/drawing-image-in-canvas-at-an-angle-without-rotating-the-canvas
// https://stackoverflow.com/questions/41847928/scaling-the-image-and-fitting-in-the-canvas-after-rotation

// when crop tool hits boundary and there's image overflow, zoom/scale image down
// when cropping down, cropped area zooms out to max width and heigh according to aspect ratio of container

function transformCSS( element, translateX = 0, translateY = 0, scale = 0, radians = 0 ) {
    element.style.transform = `translate( ${ translateX }px, ${ translateY }px ) scale( ${ scale } ) rotate( ${ radians }rad ) translateZ( 0px )`;
    return element;

}

// Converts from degrees to radians.
function getRadianFromDegrees( degrees ) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
function getDegreesFromRadians( radians ) {
    return radians * 180 / Math.PI;
}

function floorDimensions( element ) {
    element.width = Math.floor( element.width );
    element.height = Math.floor( element.height );
    return element;
}


function roundDimensions( element ) {
    element.width = Math.round( element.width );
    element.height = Math.round( element.height );
    return element;
}

function scaleDimensions( element, scaleX, scaleY, rotated = false ) {
    const newScaleY = ( rotated === true ) ? scaleY : scaleX;
    element.width = element.width * scaleX;
    element.height = element.height * newScaleY;
    return element;
}


function calculateZoom () {
    // scalechange = newscale - oldscale;
    // offsetX = -(zoomPointX * scalechange);
    // offsetY = -(zoomPointY * scalechange);
}



function regExp( name ) {
    return new RegExp( `(^| )${name}( |$)` );
}

function hasClass( element, className ) {
    if ( ! ( 'classList' in Element.prototype )  ) {
        return regExp( name ).test( this.element.className );
    }
    return element.classList.remove( className );
}

function removeClass( element, className ) {
    if ( ! ( 'classList' in Element.prototype ) ) {
        return element.className =  element.className.replace( regExp( name ), '' );
    }
    return element.classList.remove( className );
}

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
            children : [ this.canvas ]

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

        // append elements
        fragment.appendChild( this.imageEditorContainer );
        this.container.appendChild( fragment );

        // requestAnimationFrame to optimize constant coordinate updates
        this.frameRequestId = null;
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
        const translateX = Math.floor( ( ( outerContainerCenterX - scaleRatio.width ) + ( scaleRatio.width / 2 ) ) );
        const translateY = Math.floor( ( ( outerContainerCenterY - scaleRatio.height ) + ( scaleRatio.height / 2 ) ) );

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
        this.canvas.width = Math.floor( ( this.cropBounds.width / this.image.transform.ratio  ) - 1 );
        this.canvas.height =  Math.floor( ( this.cropBounds.height / this.image.transform.ratio  ) - 1 );

        context.clearRect( 0, 0, this.canvas.width, this.canvas.height );

        if ( rotated ) {
            // origin of the canvas rotate is the middle
            context.translate( this.canvas.width / 2, this.canvas.height / 2 );
            context.rotate( this.image.transform.radians );
        }

        context.save();

        // because of the 1px border
        // TODO: make a CONSTANT out of this
        const sourceX = rotated ? this.cropBounds.top - this.image.transform.translateY - 1  : this.cropBounds.left - this.image.transform.translateX - 1;
        const sourceY = rotated ? this.cropBounds.left - this.image.transform.translateX - 1 : this.cropBounds.top - this.image.transform.translateY - 1;

        const sourceWidth = this.imageObj.naturalWidth;
        const sourceHeight = this.imageObj.naturalHeight;


        const destX = rotated ?  -1 * ( sourceWidth / 2 ) : 0;
        const destY =  rotated ? -1 * ( sourceHeight / 2 ) : 0;
        // const destWidth = sourceWidth * Math.floor( this.cropBounds.width / ( rotated ? this.imageObj.height : this.imageObj.width ) ) ;
        // const destHeight = sourceHeight * Math.floor( this.cropBounds.height / ( rotated ? this.imageObj.width : this.imageObj.height ) );


        const destWidth = this.canvas.width;
        const destHeight = this.canvas.height;

        console.log('drawImage source ',  this.imageObj.naturalWidth, destWidth );


        //console.log('drawImage',  this.cropBounds.height *  Math.floor( this.cropBounds.height / this.imageObj.height )  );


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
                width: destWidth,
                height: destHeight,
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