import { CSS_NAMESPACE } from './constants';
import { createElement } from './utils';

export default class CanvasWorkspace {
	constructor() {
		this.element = createElement( {
			tagName: 'canvas',
			className: `${CSS_NAMESPACE}__canvas-workspace`
		} );
	}

	getElement() {
		return this.element;
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
