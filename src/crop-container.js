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
import {
	CSS_NAMESPACE,
	IMAGE_ALT_TEXT,
	ACTIVE_CLASS,
	EDITOR_GUTTER,
	DEBUG,
} from './constants';

export default class CropContainer {

	constructor( { appContainer, imageObj, canvasWorkspace } ) {
		this.state = {
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
			imageCoords: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			},
			// current position of the crop rectangle
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			// current dimensions
			width: 0,
			height: 0,
			// flag to tell the world that the crop container has been resized
			initialized: false,
		};


		this.appContainer = appContainer;
		this.imageObj = imageObj;
		this.canvasWorkspace = canvasWorkspace;

		this.onStartDragCropArea = this.onStartDragCropArea.bind( this );
		// this.onDragCropArea = this.onDragCropArea.bind( this );
		// this.onStopDragCropArea = this.onStopDragCropArea.bind( this );
		this.onStartCropResize = this.onStartCropResize.bind( this );
		this.onCropResize = this.onCropResize.bind( this );
		this.onStopCropResize = this.onStopCropResize.bind( this );
		this.dragging = false;
		this.element = createElement( {
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
				} ],
		} );

		// add event listeners for dragging
		// TODO: add helper for multiple event handlers
		this.element.addEventListener( 'mousedown', this.onStartDragCropArea );
		this.element.addEventListener( 'touchstart', this.onStartDragCropArea, { passive: true } );

	}

	getElement() {
		return this.element;
	}

	getState() {
		return this.state;
	}

	update( { top, left, width, height } ) {
/*		this.element.width = anotherScaleRatio.width > this.imageObj.width ? this.imageObj.width : anotherScaleRatio.width;
		this.element.height = anotherScaleRatio.height > this.imageObj.height ? this.imageObj.height : anotherScaleRatio.height;	*/

		// console.log( 'update( { top, left, width, height } )', top, left, width, height );

		this.element.width = width;
		this.element.height = height;

		this.element.style.left = `${ left }px`;
		this.element.style.top = `${ top }px`;
		this.element.style.width = `${ width }px`;
		this.element.style.height = `${ height }px`;

		this.state = {
			...this.state,
			width,
			height,
			top,
			left,
		};

	}

	/*

	 onStartDragCropArea - main event delegator
	 Since all the interaction takes place on the cropArea,
	 we don't need to assign multiple events to each drag handle and so on

	 */
	onStartDragCropArea( event ) {

		event.preventDefault();
		addClass( this.element, ACTIVE_CLASS );
		// if we've hit a drag handle, stop propagation
		// and throw the event to the crop resize setup method
		if  ( hasClass( event.target, `${ CSS_NAMESPACE }__draggable-corner` ) ) {
			event.stopImmediatePropagation();
			// remove css transitions to avoid mouse delay
			// this.cropAreaContainer.style.transition = 'unset';
			// this.image.style.transition = 'unset';
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
		this.mousePos = getMousePosition( event, this.appContainer );
		// first check the mouse boundaries
		// now calculate the new dimensions of the crop area
		let width, height, left, top, right, bottom, imageX, imageY, drawX, drawY, drawWidth, drawHeight, imageWidth, imageHeight;

		const imageAspectRatio = calculateAspectRatioFit(
			this.imageObj.naturalWidth,
			this.imageObj.naturalHeight,
			this.appContainer.offsetWidth,
			this.appContainer.offsetHeight,
			false,
			1 );

		if ( this.cropEvent.target.classList.contains( `${CSS_NAMESPACE}__draggable-corner-se` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			//this.image.transform.origin = [ 'left', 'top' ];



			width  = this.mousePos.x - this.state.left;
			height = this.mousePos.y - this.state.top;
			left = this.state.left;
			top = this.state.top;

		}

		if ( this.cropEvent.target.classList.contains( `${CSS_NAMESPACE}__draggable-corner-sw` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			//this.image.transform.origin = [ 'right', 'top' ];

			width  = this.state.width - ( this.mousePos.x - this.state.left );
			left = this.mousePos.x;
			height = this.mousePos.y - this.state.top;
			top = this.state.top;

		}

		if ( this.cropEvent.target.classList.contains( `${CSS_NAMESPACE}__draggable-corner-nw` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			//this.image.transform.origin = [ 'right', 'bottom' ];

			width = this.state.width - ( this.mousePos.x - this.state.left );
			height = this.state.height - ( this.mousePos.y - this.state.top );
			left = this.mousePos.x;
			top = this.mousePos.y ;




			if ( this.constrain || event.shiftKey ) {
				top = this.mousePos.y - ( ( width / this.imageObj.width * this.imageObj.height ) - height );
			}

		}

		if ( this.cropEvent.target.classList.contains( `${CSS_NAMESPACE}__draggable-corner-ne` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			//this.image.transform.origin = [ 'left', 'bottom' ];

			width = ( this.mousePos.x - this.state.left );
			height = this.state.height - ( this.mousePos.y - this.state.top );
			left = this.state.left;
			top = this.mousePos.y;



			if ( this.constrain || event.shiftKey ) {
				top = this.mousePos.y - ( (width / this.imageObj.width * this.imageObj.height ) - height );
			}

		}

		// all this is about ensuring there is no 'sticking' at the extremes
/*		height = isNaN(height) ? this.state.height : height;
		height = height >= this.state.maxDimensions.height ? this.state.maxDimensions.height : height;
		height = height <= this.state.minDimensions.height ? this.state.minDimensions.height : height;
		width = width >= this.state.maxDimensions.width ? this.state.maxDimensions.width : width;
		width = width <= this.state.minDimensions.width ? this.state.minDimensions.width : width;
		left = left >= this.state.boundary.right - this.state.minDimensions.width
			? this.state.boundary.right - this.state.minDimensions.width : left;
		left = left <= this.state.boundary.left ? this.state.boundary.left : left;
		top = top >= this.state.boundary.bottom - this.state.minDimensions.height
			? this.state.boundary.bottom - this.state.minDimensions.height : top;
		top = (top <= this.state.boundary.top || isNaN(top)) ? this.state.boundary.top : top;*/

		if ( this.constrain || event.shiftKey ) {
			height = width / this.imageObj.width * this.imageObj.height;
		}


		const appContainerCenterX = this.appContainer.offsetWidth / 2;
		const appContainerCenterY = this.appContainer.offsetHeight / 2;
		const imageLeft = appContainerCenterX - ( this.imageObj.width / 2 );
		const imageTop = appContainerCenterY - ( this.imageObj.width / 2 );




		imageX = 0 + ( ( left - imageLeft ) / imageAspectRatio.ratio );
		imageY = 0 + ( ( top - imageTop ) / imageAspectRatio.ratio );

		imageWidth = width / imageAspectRatio.ratio;
		imageHeight = height / imageAspectRatio.ratio;
		drawX = left;
		drawY = top;
		drawWidth = width;
		drawHeight = height;

		//console.log( 'imageX, imageY, imageWidth, imageHeight, drawX, drawY, drawWidth, drawHeight', imageX, imageY, imageWidth, imageHeight, drawX, drawY, drawWidth, drawHeight );

		this.canvasWorkspace.drawImage( {
			imageObj: this.imageObj,
			canvasWidth: this.appContainer.offsetWidth,
			canvasHeight: this.appContainer.offsetHeight,
			imageX,
			imageY,
			imageWidth,
			imageHeight,
			drawWidth,
			drawHeight,
			drawX,
			drawY,
		} );

		this.state.left = left;
		this.element.style.left = `${ this.state.left  }px`;

		this.state.width = width;
		this.element.style.width = `${ this.state.width }px`;

		this.state.height = height;
		this.element.style.height = `${ this.state.height }px`;

		this.state.top = top;
		this.element.style.top = `${ this.state.top }px`;

		this.state.bottom = this.state.top + height;
		this.state.right = this.state.left + width;
		this.cropActionTriggered = true;


/*		this.onWorkSpaceUpdated( {
			image: {
				...this.image
			},
			cropped: {
				...this.croppingArea,
			},
			original: {
				width: this.image.naturalWidth,
				height: this.image.naturalHeight,
			}
		} );*/
		this.state.initialized = true;
		return false;

	}

	onStopCropResize () {

		this.dragging = false;
		this.mousePos = null;
		this.cropEvent = null;
		removeClass( this.element, ACTIVE_CLASS );
		document.removeEventListener( 'mousemove', this.onCropResize );
		document.removeEventListener( 'mouseup', this.onStopCropResize );
		document.removeEventListener( 'touchmove', this.onCropResize );
		document.removeEventListener( 'touchend', this.onStopCropResize );

		// this.cropAreaContainer.style.transition = 'all 0.09s linear';
		// this.image.style.transition = 'transform 0.1s linear';

		if (!this.cropActionTriggered) {
			return;
		}

		this.cropActionTriggered = false;
		this.state.scale = {
			width: this.state.width / this.imageObj.width,
			height: this.state.height / this.imageObj.height,
			top: this.state.top / this.imageObj.height,
			left: this.state.left / this.imageObj.width
		};



	}

}
