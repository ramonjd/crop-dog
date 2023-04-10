import { CSS_NAMESPACE } from './constants';
import { createElement } from './utils';

export default class CanvasWorkspace {
		constructor() {
		this.state = {
			imageObj: null,
			cropped: {
				x: 0,
				y: 0,
				dx: 0,
				dy: 0,
				width: 0,
				height: 0,
				imageWidth: 0,
				imageHeight: 0
			}
		};
		this.element = createElement( {
			tagName: 'canvas',
			className: `${CSS_NAMESPACE}__canvas-workspace`
		} );
	}

	getElement() {
		return this.element;
	}

	exportImageURI() {
		// Create a new canvas element with the same dimensions as the section to be exported
				const tempCanvas = document.createElement('canvas');
				// TODO where to get the width and height from? Pass it in?
				const scaleFactor =  this.state.imageObj.naturalWidth / this.state.imageObj.width;
				tempCanvas.width = this.state.cropped.width * scaleFactor;
				tempCanvas.height = this.state.cropped.height * scaleFactor;

		// Draw the section onto the new canvas element
				const context = tempCanvas.getContext('2d');
				context.drawImage(
					this.state.imageObj,
					this.state.cropped.x,
					this.state.cropped.y,
					tempCanvas.width,
					tempCanvas.height,
					0,
					0,
					tempCanvas.width,
					tempCanvas.height );

		// Export the new canvas element as a PNG image data URI
				const dataURI = tempCanvas.toDataURL('image/png');
		//this.element.toDataURL( 'image/jpeg', 0.8 )

		return dataURI;
	}

	// TODO: at the moment we're calling this after every image transformation
	// in fact, because we're keeping track of the transforms, we don't need to call it at all until the end
	// it's just for the preview
	drawImage( { imageObj, canvasWidth, canvasHeight, imageX, imageY, imageWidth, imageHeight, drawX, drawY, drawWidth, drawHeight } ) {

		this.element.width = canvasWidth;
		this.element.height = canvasHeight;


		const context = this.element.getContext( '2d' );
		context.clearRect( 0, 0, this.element.width, this.element.height );
		context.save();
		this.state.imageObj = imageObj;
		this.state.cropped.x = imageX;
		this.state.cropped.y = imageY;
		this.state.cropped.dx = drawX;
		this.state.cropped.dy = drawY;
		this.state.cropped.width = drawWidth;
		this.state.cropped.height = drawHeight;
		this.state.cropped.imageWidth = imageWidth;
		this.state.cropped.imageHeight = imageHeight;


		// now draw!
		context.drawImage(
			imageObj,
			// x, y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
			imageX, imageY,
			// w and h of the sub-rectangle of the source image to draw into the destination context.
			imageWidth, imageHeight,
			// x, y coordinates in the destination canvas at which to place the top-left corner of the source image.
			drawX, drawY,
			// w and h of the image in the destination canvas. Changing these values scales the sub-rectangle in the destination context.
			drawWidth, drawHeight
		);

		context.restore();

	}
}
