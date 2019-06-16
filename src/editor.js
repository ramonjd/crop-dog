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

const CSS_NAMESPACE = 'image-editor';
const IMAGE_ALT_TEXT = 'Image being edited';
const ACTIVE_CLASS = 'image-editor__active';
const EDITOR_GUTTER = .7;
const DEBUG = true;


export default class Editor {

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
			height: 0,
			drag: {
				startX:0,
				startY:0,
				dx: 0,
				dy: 0
			},
			maxRatio: 20
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
			// differences between old and new crop positions
			delta: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			},
			// current dimensions
			width: 0,
			height: 0,
			touched: false,
			boundary: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			}
		};

		this.constrain = false;

		// cache of computed this.imageEditorContainer properties
		this.outerContainer = {
			width: 0,
			height: 0
		};

		// this will be an ajax call
		this.imagePath = props.imagePath;

		// append elements
		this.container = container;

		// bind class methods to this
		this.onImageLoaded = this.onImageLoaded.bind( this );
		this.updateWorkspace = this.updateWorkspace.bind( this );
		this.onWindowResize = this.onWindowResize.bind( this );
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
		this.imageObj.setAttribute('crossOrigin', 'anonymous');
		this.imageObj.className = `${CSS_NAMESPACE}__image-layer`;
		this.imageObj.setAttribute( 'alt', this.imageAltText || IMAGE_ALT_TEXT );
		this.imageObj.onload = this.onImageLoaded;
		this.imageObj.onerror = noop;

		// create a clone of the original image
		// so we can reset and get original props
		// container for the original image
		this.imageObjClone = null;
		this.imageObjClone = this.imageObj.cloneNode(true);

		// this is the offPage workspace
		// it takes the transformed image, and calculates the positions and ratios required to create output image
		// https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-pre-render
		// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
		this.canvasWorkspace = createElement( {
			tagName: 'canvas',
			className: `${CSS_NAMESPACE}__canvas-workspace`
		} );

		// this is the cropping tool
		// add the cropping tool and the canvas element
		this.cropAreaContainer = createElement( {
			tagName: 'div',
			className: `${CSS_NAMESPACE}__crop-container`,
			'aria-label': 'Cropping area',
			children : [
				{
					tagName: 'div',
					className: `image-editor__draggable-corner ${CSS_NAMESPACE}__draggable-corner-nw`
				},
				{
					tagName: 'div',
					className: `image-editor__draggable-corner ${CSS_NAMESPACE}__draggable-corner-ne`
				},
				{
					tagName: 'div',
					className: `image-editor__draggable-corner ${CSS_NAMESPACE}__draggable-corner-sw`
				},
				{
					tagName: 'div',
					className: `image-editor__draggable-corner ${CSS_NAMESPACE}__draggable-corner-se`
				},
				{
					tagName: 'span',
					className: `image-editor__guide ${CSS_NAMESPACE}__guide-horiz-top`
				},
				{
					tagName: 'span',
					className: `image-editor__guide ${CSS_NAMESPACE}__guide-horiz-bottom`
				},
				this.canvasWorkspace ]

		} );

		// this is the workspace wrapper
		this.imageEditorWorkspace = createElement( {
			tagName: 'div',
			className: `${CSS_NAMESPACE}__workspace`,
			children : [ this.cropAreaContainer, this.imageObj ]
		} );

		// this is the main container
		this.imageEditorContainer = createElement( {
			tagName: 'div',
			className: `${CSS_NAMESPACE}__container ${CSS_NAMESPACE}__container-loading`,
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

		// TODO: requestAnimationFrame to optimize constant coordinate updates
		this.dragRequestId = null;

		// TODO: these flags are fairly arbitraty now
		// and are meant to solve immediate dev problems
		// need review
		this.resizing = false;
		this.cropActionTriggered = false;

		this.frameRateInterval = 1000 / 15;
		this.requestAnimationFrameId = null;
		this.lastTimestamp = null;

		// callbacks
		this.onWorkSpaceUpdated = props.onWorkSpaceUpdated;

		// transform matrix defaults
		this.transformMatrices  = {
			transformMatrix: [ 1, 0, 0, 1, 0, 0 ],
			inverseTransformMatrix: [ 1, 0, 0, 1 ]
		};
		// load image and prepare workspace
		this.imageObj.src = this.imagePath;

		return this;

	}

	onImageLoaded() {


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


	/*

	 onStartDragCropArea - main event delegator
	 Since all the interaction takes place on the cropArea,
	 we don't need to assign multiple events to each drag handle and so on

	 */
	onStartDragCropArea( event ) {

		event.preventDefault();
		addClass( this.cropAreaContainer, ACTIVE_CLASS );
		// if we've hit a drag handle, stop propagation
		// and throw the event to the crop resize setup method
		if  ( hasClass( event.target, `${NAMESPACE}__draggable-corner` ) ) {
			event.stopImmediatePropagation();
			// remove css transitions to avoid mouse delay
			// this.cropAreaContainer.style.transition = 'unset';
			// this.imageObj.style.transition = 'unset';
			// cache the event
			this.cropEvent = event;
			this.onStartCropResize( event );
			return false;
		}
		// otherwise we're free to drag the image
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
	}


	onCropResize ( event ) {
		event.preventDefault();
		this.mousePos = getMousePosition( event, this.imageEditorContainer );
		// first check the mouse boundaries
		// now calculate the new dimensions of the crop area
		let width, height, left, top, right, bottom;

		if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-se` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			this.image.transform.origin = [ 'left', 'top' ];

			width  = this.mousePos.x - this.croppingArea.position.left;
			height = this.mousePos.y - this.croppingArea.position.top;
			left = this.croppingArea.position.left;
			top = this.croppingArea.position.top;
		}

		if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-sw` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			this.image.transform.origin = [ 'right', 'top' ];

			width  = this.croppingArea.width - ( this.mousePos.x - this.croppingArea.position.left );
			left = this.mousePos.x;
			height = this.mousePos.y - this.croppingArea.position.top;
			top = this.croppingArea.position.top;

		}

		if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-nw` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			this.image.transform.origin = [ 'right', 'bottom' ];

			width = this.croppingArea.width - ( this.mousePos.x - this.croppingArea.position.left );
			height = this.croppingArea.height - ( this.mousePos.y - this.croppingArea.position.top );
			left = this.mousePos.x;
			top = this.mousePos.y ;
			if ( this.constrain || event.shiftKey ) {
				top = this.mousePos.y - ( ( width / this.image.width * this.image.height ) - height );
			}

		}

		if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-ne` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			this.image.transform.origin = [ 'left', 'bottom' ];

			width = ( this.mousePos.x - this.croppingArea.position.left );
			height = this.croppingArea.height - ( this.mousePos.y - this.croppingArea.position.top );
			left = this.croppingArea.position.left;
			top = this.mousePos.y ;
			if ( this.constrain || event.shiftKey ) {
				top = this.mousePos.y - ( (width / this.image.width * this.image.height ) - height );
			}

		}

		// all this is about ensuring there is no 'sticking' at the extremes
		height = isNaN(height) ? this.croppingArea.height : height;
		height = height >= this.croppingArea.maxDimensions.height ? this.croppingArea.maxDimensions.height : height;
		height = height <= this.croppingArea.minDimensions.height ? this.croppingArea.minDimensions.height : height;
		width = width >= this.croppingArea.maxDimensions.width ? this.croppingArea.maxDimensions.width : width;
		width = width <= this.croppingArea.minDimensions.width ? this.croppingArea.minDimensions.width : width;
		left = left >= this.croppingArea.boundary.right - this.croppingArea.minDimensions.width
			? this.croppingArea.boundary.right - this.croppingArea.minDimensions.width : left;
		left = left <= this.croppingArea.boundary.left ? this.croppingArea.boundary.left : left;
		top = top >= this.croppingArea.boundary.bottom - this.croppingArea.minDimensions.height
			? this.croppingArea.boundary.bottom - this.croppingArea.minDimensions.height : top;
		top = (top <= this.croppingArea.boundary.top || isNaN(top)) ? this.croppingArea.boundary.top : top;

		if ( this.constrain || event.shiftKey ) {
			height = width / this.image.width * this.image.height;
		}






		this.croppingArea.position.left = left;
		this.cropAreaContainer.style.left = `${ this.croppingArea.position.left  }px`;

		this.croppingArea.width = width;
		this.cropAreaContainer.style.width = `${ this.croppingArea.width }px`;

		this.croppingArea.height = height;
		this.cropAreaContainer.style.height = `${ this.croppingArea.height }px`;

		this.croppingArea.position.top = top;
		this.cropAreaContainer.style.top = `${ this.croppingArea.position.top }px`;

		this.croppingArea.position.bottom = this.croppingArea.position.top + height;
		this.croppingArea.position.right = this.croppingArea.position.left + width;
		this.cropActionTriggered = true;


		this.onWorkSpaceUpdated( {
			image: {
				...this.image
			},
			cropped: {
				...this.croppingArea,
			},
			original: {
				width: this.imageObj.naturalWidth,
				height: this.imageObj.naturalHeight,
			}
		} );

		return false;

	}

	onStopCropResize () {

		this.dragging = false;
		this.mousePos = null;
		this.cropEvent = null;
		removeClass( this.cropAreaContainer, ACTIVE_CLASS );
		document.removeEventListener( 'mousemove', this.onCropResize );
		document.removeEventListener( 'mouseup', this.onStopCropResize );
		document.removeEventListener( 'touchmove', this.onCropResize );
		document.removeEventListener( 'touchend', this.onStopCropResize );

		// this.cropAreaContainer.style.transition = 'all 0.09s linear';
		// this.imageObj.style.transition = 'transform 0.1s linear';

		if (!this.cropActionTriggered) {
			return;
		}

		this.cropActionTriggered = false;
		this.croppingArea.scale = {
			width: this.croppingArea.width / this.image.width,
			height: this.croppingArea.height / this.image.height,
			top: this.croppingArea.position.top / this.image.height,
			left: this.croppingArea.position.left / this.image.width
		};


		this.croppingArea.delta.top = this.croppingArea.position.top - this.croppingArea.delta.top;
		this.croppingArea.delta.right = this.croppingArea.position.right - this.croppingArea.delta.right;
		this.croppingArea.delta.bottom = this.croppingArea.position.bottom - this.croppingArea.delta.bottom;
		this.croppingArea.delta.left = this.croppingArea.position.left - this.croppingArea.delta.left;


		this.zoomInImage();
	}


	zoomInImage() {
/*		let scaleRatio; // for the image
		let anotherScaleRatio; // for the cropping area


		// get aspect ratio for the original image
		scaleRatio = calculateAspectRatioFit(
			this.croppingArea.width,
			this.croppingArea.height,
			this.image.width * this.image.transform.scale,
			this.image.height * this.image.transform.scale,
			this.image.rotated,
			1 );*/
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

		// cache the container offset width
		this.outerContainer.width = this.imageEditorContainer.offsetWidth;
		this.outerContainer.height = this.imageEditorContainer.offsetHeight;


		let scaleRatio; // for the image
		let anotherScaleRatio; // for the cropping area

		// get aspect ratio for the original image
		// we're scaling the image based on the container dimensions
		// we want to scale imageObj to fit outerContainer
		scaleRatio = calculateAspectRatioFit(
			this.imageObj.naturalWidth,
			this.imageObj.naturalHeight,
			this.outerContainer.width,
			this.outerContainer.height,
			this.image.rotated,
			1 );

		// now we want the scale ratio for the cropping area
		// so we get the dimensions of the scaled image
		// we're scaling the image based on the container dimensions
		// we want to the crop container to fit the outerContainer, but be no bigger than the image
		anotherScaleRatio = calculateAspectRatioFit(
			scaleRatio.width,
			scaleRatio.height,
			this.outerContainer.width,
			this.outerContainer.height,
			this.image.rotated,
			EDITOR_GUTTER );

		// save the initial dimensions to the image
		// the image must be AT A MINIMUM the size of the cropping container
		this.image.width = scaleRatio.width < anotherScaleRatio.width ? anotherScaleRatio.width : scaleRatio.width ;
		this.image.height = scaleRatio.height < anotherScaleRatio.height ? anotherScaleRatio.height : scaleRatio.height ;

		// apply the dimensions to the image
		this.imageObj.width = this.image.width;
		this.imageObj.height = this.image.height;

		// save this so we can use it for later transformations/zooms
		this.image.transform.scale = anotherScaleRatio.ratio;



		// center coords of container
		const outerContainerCenterX = this.outerContainer.width / 2;
		const outerContainerCenterY = this.outerContainer.height / 2 ;


		const newPositionX = outerContainerCenterX - ( anotherScaleRatio.width / 2);
		const newPositionY = outerContainerCenterY - (anotherScaleRatio.height / 2);

		this.croppingArea.position = {
			top:  newPositionY,
			right: newPositionX +  anotherScaleRatio.width ,
			bottom: newPositionY + anotherScaleRatio.height ,
			left: newPositionX
		};

		this.croppingArea.boundary = {
			...this.croppingArea.position
		};

		this.image.transform = Object.assign( {}, this.image.transform, {
			translateX: outerContainerCenterX - (scaleRatio.width / 2),
			translateY: outerContainerCenterY - (scaleRatio.height / 2),
		} );


		// set the image transform matrix
		this.transformMatrices = {
			...createTransformMatrix(
				this.transformMatrices.transformMatrix,
				this.transformMatrices.inverseTransformMatrix,
				this.image.transform.translateX,
				this.image.transform.translateY,
				this.image.transform.scale,
				this.image.transform.radians
			)
		};

		// apply the matrix to the image
		this.imageObj.style.transform = `matrix(    
          ${this.transformMatrices.transformMatrix[0]}, 
          ${this.transformMatrices.transformMatrix[1]}, 
          ${this.transformMatrices.transformMatrix[2]}, 
          ${this.transformMatrices.transformMatrix[3]}, 
          ${this.transformMatrices.transformMatrix[4]}, 
          ${this.transformMatrices.transformMatrix[5]})`;

		// save and resize the cropping area
		// the cropping area must be AT A MAXIMUM the size of the image

		this.croppingArea.width = anotherScaleRatio.width > this.image.width ? this.image.width : anotherScaleRatio.width;
		this.croppingArea.height = anotherScaleRatio.height > this.image.height ? this.image.height : anotherScaleRatio.height;
		this.cropAreaContainer.style.left = `${ this.croppingArea.position.left   }px`;
		this.cropAreaContainer.style.top = `${ this.croppingArea.position.top  }px`;
		this.cropAreaContainer.style.width =  `${ this.croppingArea.width  }px`;
		this.cropAreaContainer.style.height =  `${ this.croppingArea.height  }px`;

		// reset the cropping area's limits
		this.croppingArea.maxDimensions = {
			width: anotherScaleRatio.width >= this.outerContainer.width ? this.outerContainer.width : anotherScaleRatio.width,
			height: anotherScaleRatio.height >= this.outerContainer.height ? this.outerContainer.height : anotherScaleRatio.height
		};

		this.onWorkSpaceUpdated( {
			image: {
				...this.image,
			},
			cropped: {
				...this.croppingArea,
			},
			original: {
				width: this.imageObj.naturalWidth,
				height: this.imageObj.naturalHeight,
			},
		} );

	}


	drawImage() {

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
