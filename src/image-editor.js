import {
    noop,
    throttle,
    createElement,
    getOffsetRelativeToParent,
    getCenterPositionRelativeToParent,
    getMousePosition } from './utils';

const NAMESPACE = 'image-editor';
const IMAGE_ALT_TEXT = 'Image being edited';

// animationframe
// drawImage while resizing crop area
// https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
// https://stackoverflow.com/questions/41847928/scaling-the-image-and-fitting-in-the-canvas-after-rotation

// when crop tool hits boundary and there's image overflow, zoom/scale image down
// when cropping down, cropped area zooms out to max width and heigh according to aspect ratio of container

function transformCSS( element, translateX = 0, translateY = 0, scale = 0, rotateRad = 0 ) {

    element.style.transform = `translate(${ translateX }px, ${ translateY }px) scale(${ scale }) rotate(${ rotateRad }rad) translateZ(0px)`;

    return element;

}


export default class ImageEditor {

    constructor( props, container ) {

        // cache of computed image properties
        this.image = {
            transform: {
                scaleRatio: 0,
                translateX: 0,
                translateY: 0,
                rotate: 0
            },
            width: 0,
            height: 0
        };

        // cache of computed this.imageEditorContainer properties
        this.outerContainer = {
            width: 0,
            height: 0
        };

        // cache of computed editor variables
        this.editor = {
            rotated: false
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
            'aria-label': 'Cropping area'
        } );

        // this is the workspace wrapper
        this.imageEditorWorkspace = createElement( {
            tagName: 'div',
            className: `${NAMESPACE}__workspace`,
            children : [ this.cropAreaContainer, this.imageObj, this.canvas ]
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

        // load image and prepare workspace
        this.imageObj.src = this.imagePath;

    }

    onImageLoaded() {

        // initial update of coordinates
        this.updateWorkspace();
        this.drawImage();


        // capture window resize event streams
        // this will be request animation frame
        if ( typeof window !== 'undefined' ) {
            window.addEventListener( 'resize', throttle( this.updateWorkspace, 333 ) );
        }

        // finally, we show the workspace
        this.imageEditorContainer.classList.remove( `${NAMESPACE}__container-loading` );

    }

    updateWorkspace() {

        this.outerContainer.width = this.imageEditorWorkspace.offsetWidth;
        this.outerContainer.height = this.imageEditorWorkspace.offsetHeight;

        this.canvas.width = this.editor.rotated ? this.outerContainer.height : this.outerContainer.width;
        this.canvas.height = this.editor.rotated ? this.outerContainer.width : this.outerContainer.height;


        let scaleRatio = Math.min(
            this.outerContainer.width / this.imageObj.width,
            this.outerContainer.height / this.imageObj.height
        );



        // this.imageObj.width = this.imageObj.width * scaleRatio;
        // this.imageObj.height = this.imageObj.height * scaleRatio;

        const outerContainerCenterX = ( this.outerContainer.width / 2 );
        const outerContainerCenterY = ( this.outerContainer.height / 2 );
        let newTranslateX = ( outerContainerCenterX);
        let newTranslateY = ( outerContainerCenterY - ((this.imageObj.height * scaleRatio) /2));

        console.log( 'onWindowResize newTranslateY', newTranslateY  );

        transformCSS( this.imageObj, 0, newTranslateY, scaleRatio, 0 );

        // save values
        this.image.transform.translateX = newTranslateX;
        this.image.transform.translateY = newTranslateY;
        this.image.transform.scaleRatio = scaleRatio;




    }


    drawImage() {


        const context = this.canvas.getContext('2d');
        context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
        context.save();

        // context.setTransform( 1, 0, 0, 1, 0, 0 );
        // context.scale( 1, 1 );





        // this.sourceX = this.cropAreaContainer.offsetLeft;
        // this.sourceY = this.cropAreaContainer.offsetTop;
        // this.sourceWidth = this.cropAreaContainer.offsetWidth;
        // this.sourceHeight = this.cropAreaContainer.offsetHeight;
        this.sourceX = 0;
        this.sourceY = 0;
        this.sourceWidth = 500;
        this.sourceHeight = 300;

        this.destX = 0;
        this.destY =  0;
        // this.destWidth =  this.cropAreaContainer.offsetWidth;
        // this.destHeight = this.cropAreaContainer.offsetHeight;
        this.destWidth =  100;
        this.destHeight = 200;


        context.drawImage(
            this.imageObj,
            // x, y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
            this.sourceX, this.sourceY,
            // w and h of the sub-rectangle of the source image to draw into the destination context.
            this.sourceWidth, this.sourceHeight,
            // x, y coordinates in the destination canvas at which to place the top-left corner of the source image.
            this.destX, this.destY,
            // w and h of the image in the destination canvas. Changing these values scales the sub-rectangle in the destination context.
            this.destWidth, this.destHeight );


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