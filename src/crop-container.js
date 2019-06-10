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

	constructor(  ) {
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
			boundary: {
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
		};
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
	}

	getElement() {
		return this.element;
	}

	getState() {
		return this.state;
	}

	update( { top, left, width, height } ) {
/*		this.element.width = anotherScaleRatio.width > this.image.width ? this.image.width : anotherScaleRatio.width;
		this.element.height = anotherScaleRatio.height > this.image.height ? this.image.height : anotherScaleRatio.height;	*/

		this.element.width = width;
		this.element.height = height;

		this.element.style.left = `${ left }px`;
		this.element.style.top = `${ top  }px`;
		this.element.style.width =  `${ width  }px`;
		this.element.style.height =  `${ height  }px`;

		this.state = {
			...this.state,
			width,
			height,
			top,
			left,
		}
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
		if  ( hasClass( event.target, `${CSS_NAMESPACE}__draggable-corner` ) ) {
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

		if ( this.cropEvent.target.classList.contains( `${CSS_NAMESPACE}__draggable-corner-se` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			this.image.transform.origin = [ 'left', 'top' ];

			width  = this.mousePos.x - this.croppingArea.position.left;
			height = this.mousePos.y - this.croppingArea.position.top;
			left = this.croppingArea.position.left;
			top = this.croppingArea.position.top;
		}

		if ( this.cropEvent.target.classList.contains( `${CSS_NAMESPACE}__draggable-corner-sw` ) ) {

			// origin of image scale should be set to the opposite corner of this handle
			this.image.transform.origin = [ 'right', 'top' ];

			width  = this.croppingArea.width - ( this.mousePos.x - this.croppingArea.position.left );
			left = this.mousePos.x;
			height = this.mousePos.y - this.croppingArea.position.top;
			top = this.croppingArea.position.top;

		}

		if ( this.cropEvent.target.classList.contains( `${CSS_NAMESPACE}__draggable-corner-nw` ) ) {

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

		if ( this.cropEvent.target.classList.contains( `${CSS_NAMESPACE}__draggable-corner-ne` ) ) {

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



		this.zoomInImage();
	}

}
