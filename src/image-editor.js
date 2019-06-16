import * as Rematrix from 'rematrix';

import {
    noop,
    createElement,
    calculateAspectRatioFit,
    getRadianFromDegrees,
    addClass,
    hasClass,
    removeClass,
    getMousePosition ,
getOffsetRelativeToParent,
createTransformMatrix,
getOriginalCoordinatesFromTransformedMatrix } from './utils';
import CanvasWorkspace from './canvas-workspace';
import CropContainer from './crop-container';
import {
	CSS_NAMESPACE,
	IMAGE_ALT_TEXT,
	ACTIVE_CLASS,
	EDITOR_GUTTER,
	DEBUG,
} from './constants';



// https://codepen.io/anon/pen/YQJmMr
//https://stackoverflow.com/questions/34597160/html-canvas-mouse-position-after-scale-and-translate



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
        this.state = {
			image: {
				width: 0,
				height: 0,
				originalWidth: 0,
				originalHeight: 0,
				rotated: false,
				ratio: 1,
				left: 0,
				top: 0,
				centerX: 0,
				centerY: 0,
				originX: 0,
				originY: 0,
			},
			// The image container
			imageEditorContainer: {
				width: 0,
				height: 0,
			},

			// The app container
			appContainer: {
				width: 0,
				height: 0,
			},
			// center of app container
			center: {
				x: 0,
				y: 0,
			}
        };


        // this will be an ajax call
        this.imagePath = props.imagePath;

        // append elements
        this.appContainer = container;

        // bind class methods to this
        this.onImageLoaded = this.onImageLoaded.bind( this );
        this.updateWorkspace = this.updateWorkspace.bind( this );
        this.onWindowResize = this.onWindowResize.bind( this );

        // the image to manipulate
        this.imageObj = new Image();
        this.imageObj.setAttribute('crossOrigin', 'anonymous');
        this.imageObj.className = `${CSS_NAMESPACE}__image-layer`;
        this.imageObj.setAttribute( 'alt', this.imageAltText || IMAGE_ALT_TEXT );
        this.imageObj.onload = this.onImageLoaded;
        this.imageObj.onerror = noop;


		// create elements
        // this is the offPage workspace
        // it takes the transformed image, and calculates the positions and ratios required to create output image
        // https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-pre-render
        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
        this.canvasWorkspace = createElement( {
            tagName: 'canvas',
            className: `${CSS_NAMESPACE}__canvas-workspace`
        } );

        this.canvasWorkspace = new CanvasWorkspace();
        this.cropContainer = new CropContainer( {
			appContainer: this.appContainer,
			imageObj: this.imageObj,
			canvasWorkspace: this.canvasWorkspace,
		} );

        // this is the workspace wrapper
        this.imageEditorWorkspace = createElement( {
            tagName: 'div',
            className: `${CSS_NAMESPACE}__workspace`,
            children : [ this.imageObj, this.canvasWorkspace.getElement(), this.cropContainer.getElement() ]
        } );

        // this is the main container
        this.imageEditorContainer = createElement( {
            tagName: 'div',
            className: `${CSS_NAMESPACE}__container ${CSS_NAMESPACE}__container-loading`,
            children : [ this.imageEditorWorkspace ]
        } );

        // append elements
		const fragment = document.createDocumentFragment();
        fragment.appendChild( this.imageEditorContainer );
        this.appContainer.appendChild( fragment );

        this.frameRateInterval = 1000 / 30;
        this.requestAnimationFrameId = null;
        this.lastTimestamp = null;

        // callbacks
        this.onWorkSpaceUpdated = props.onWorkSpaceUpdated;

        // load image and prepare workspace
        this.imageObj.src = this.imagePath;

        return this;

    }

    onImageLoaded() {
		this.state.image.originalWidth = this.imageObj.naturalWidth;
		this.state.image.originalHeight = this.imageObj.naturalHeight;
		this.state.appContainer.width = this.appContainer.offsetWidth;
		this.state.appContainer.height = this.appContainer.offsetHeight;

        // initial update of coordinates
        this.updateWorkspace();

        if ( typeof window !== 'undefined' ) {
              this.lastTimestamp = window.performance.now();
              window.addEventListener( 'resize', this.onWindowResize );
        }

        // finally, we show the workspace
        // place it on the end of the stack to ensure the update takes place first
        setTimeout( () => {
            removeClass( this.imageEditorContainer, `${CSS_NAMESPACE}__container-loading` );
        } );
    }

    onWindowResize() {
        this.requestAnimationFrameId = window.requestAnimationFrame( this.updateWorkspace );
    }

    // update the positions and dimensions
    // when the workspace changes
    updateWorkspace( timestamp ) {
      const now = timestamp,
          elapsedTime = now - this.lastTimestamp;

        if ( elapsedTime < this.frameRateInterval ) {
          return;
        }

        // if enough time has passed to call the next frame
        // reset lastTimeStamp minus 1 frame in ms ( to adjust for frame rates other than 60fps )
        this.lastTimestamp = now - ( elapsedTime % this.frameRateInterval );





		// get aspect ratio for the original image based on container size
		const imageAspectRatio = calculateAspectRatioFit(
				this.imageObj.naturalWidth,
				this.imageObj.naturalHeight,
				this.appContainer.offsetWidth,
				this.appContainer.offsetHeight,
				this.state.image.rotated,
			1 );

		// apply the initial dimensions to the image
		this.state.image.width = imageAspectRatio.width;
		this.state.image.height = imageAspectRatio.height;
		this.state.image.ratio = imageAspectRatio.ratio;


		this.imageObj.width = this.state.image.width;
		this.imageObj.height = this.state.image.height;







		/*
			Matrix:
				Center the image
		*/

		// center coords of container
		// new center - old centre
		const appContainerCenterX = this.appContainer.offsetWidth / 2;
		const appContainerCenterY = this.appContainer.offsetHeight / 2;
		const imageCenterTranslateX = appContainerCenterX - ( this.state.image.width / 2 );
		const imageCenterTranslateY = appContainerCenterY - ( this.state.image.height / 2 );

		const imageObjStyle = getComputedStyle( this.imageObj ).transform;
		const transform = Rematrix.parse( imageObjStyle );
		const r1 = Rematrix.translateX( imageCenterTranslateX - this.state.image.originX );
		const r2 = Rematrix.translateY( imageCenterTranslateY - this.state.image.originY );
		//const r3 = Rematrix.scale( cropContainerAspectRatio.ratio );
		const product = [ transform, r1, r2 ].reduce( Rematrix.multiply );
		this.imageObj.style.transform = Rematrix.toString( product );
		this.state.image.originX = imageCenterTranslateX;
		this.state.image.originY = imageCenterTranslateY;
		this.state.image.left = appContainerCenterX - ( this.state.image.width / 2 );
		this.state.image.top = appContainerCenterY - ( this.state.image.height / 2 );

		/*
			Crop container:

		*/
		// now we want the scale ratio for the cropping area
		// so we get the dimensions of the scaled image
		// we're scaling the image based on the container dimensions
		// we want to the crop container to fit the outerContainer, but be no bigger than the image
		const cropContainerState = this.cropContainer.getState();
		const cropContainerWidth = cropContainerState.initialized ? cropContainerState.width : this.state.image.width;
		const cropContainerHeight = cropContainerState.initialized ? cropContainerState.height : this.state.image.height;
		const cropContainerLeft = cropContainerState.initialized ? cropContainerState.left : this.state.image.left;
		const cropContainerTop = cropContainerState.initialized ? cropContainerState.top : this.state.image.top;






		this.cropContainer.update( {
			left: cropContainerLeft,
			top: cropContainerTop,
			width: cropContainerWidth,
			height: cropContainerHeight,
		} );

		// cache the container offset width
		this.state.appContainer.width = this.appContainer.offsetWidth;
		this.state.appContainer.height = this.appContainer.offsetHeight;
		/*
			Canvas update:

		*/
        // TODO: we don't actually have to do this at all until the final save
        this.canvasWorkspace.drawImage( {
			imageObj: this.imageObj,
			canvasWidth: this.state.appContainer.width,
			canvasHeight: this.state.appContainer.height,
			imageWidth: this.imageObj.naturalWidth,
			imageHeight: this.imageObj.naturalHeight,
			imageX: 0,
			imageY: 0,
			drawWidth: cropContainerWidth,
			drawHeight: cropContainerHeight,
			drawX: cropContainerLeft,
			drawY: cropContainerTop,
		} );

		if ( DEBUG ) {
			this.onWorkSpaceUpdated( this.state );
		}
    }


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
