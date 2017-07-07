import {
    noop,
    throttle,
    createElement,
    getOffsetRelativeToParent,
    getCenterPositionRelativeToParent,
    getMousePosition } from './utils';

const NAMESPACE = 'image-editor';
const IMAGE_ALT_TEXT = 'Image being edited';



export default class ImageEditor {

    constructor( props, container ) {

        // internal state - this is ugly i know, but i'm using it
        // as a form of ledger until the final state is known
        // TODO: use this to update and refer to values in the class
        // TODO: create reducer-like state management
        // NOT TODO: No going back to React now! :)
        this.state = {
            image: {
                width: 0,
                height: 0,
                dx: 0,
                dy: 0,
                originaDimensions: {
                    width: 0,
                    height: 0
                }
            },
            mousePos: {
                x: 0,
                y: 0
            },
            imageBounds: {

            },
            cropAreaWidth: 0,
            cropAreaHeight: 0,
            scale: null,
            bounds: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            dragging: false,
            drawImageParameters: {
                destX: 0,
                destY: 0,
                destWidth: 0,
                destHeight: 0,
                sourceWidth: 0,
                sourceHeight: 0,
                sourceX: 0,
                sourceY: 0
            },

            // minimum dimensions of the crop area
            minCropWidth: 60,
            minCropHeight: 60,

            // maximum dimensions of the crop area
            // variable with workspace size
            maxCropWidth: 1000,
            maxCropHeight: 1000,

            // constrain the crop aspect ratio is off by default
            constrain: false

        };

        // this will be an ajax call
        this.imagePath = props.imagePath;

        // assign callbacks
        this.onWorkSpaceUpdated = props.onWorkSpaceUpdated || noop;

        // bind class methods to this
        this.onImageLoaded = this.onImageLoaded.bind( this );
        this.onStartDragCropArea = this.onStartDragCropArea.bind( this );
        this.onDragCropArea = this.onDragCropArea.bind( this );
        this.onStopDragCropArea = this.onStopDragCropArea.bind( this );
        this.onStartCropResize = this.onStartCropResize.bind( this );
        this.onCropResize = this.onCropResize.bind( this );
        this.onStopCropResize = this.onStopCropResize.bind( this );
        this.onWindowResize = this.onWindowResize.bind( this );
        this.updateCoordinates = this.updateCoordinates.bind( this );

        this.container = container;

        // create elements
        const fragment = document.createDocumentFragment();

        // the image to manipulate
        this.imageObj = new Image();
        this.imageObj.className = `${NAMESPACE}__image-layer`;
        this.imageObj.setAttribute( 'alt', this.imageAltText || IMAGE_ALT_TEXT );
        this.imageObj.onload = this.onImageLoaded;
        this.imageObj.onerror = noop;

        // container for the original image
        this.imageObjClone = null;

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
            children: [
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

        // this is the main container
        this.imageEditorContainer = createElement( {
            tagName: 'div',
            className: `${NAMESPACE}__canvas-container ${NAMESPACE}__canvas-container-loading`,
            children : [ this.cropAreaContainer, this.imageObj ]
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

        // load image and prepare workspace
        this.imageObj.src = this.imagePath;

    }

    onImageLoaded() {

        // this is our animation/manipulation layer
        this.imageEditorContainer.appendChild( this.imageObj );

        // create a clone of the original image
        this.imageObjClone = this.imageObj.cloneNode(true);

        this.state.image.originaDimensions = {
            width: this.imageObjClone.width,
            height: this.imageObjClone.height
        };

        this.state.image = Object.assign( {}, this.state.image, {
            width: this.imageObj.width,
            height: this.imageObj.height
        } );

        // TODO: create methods for the following assignments

        // temporarily assign width and height of container
        // before scaling dev
        this.imageEditorContainer.style.width = `${ this.state.image.width }px`;
        this.imageEditorContainer.style.height = `${ this.state.image.height }px`;

        // TODO: to be updated onWindowResize
        // we will update the scale ratio
        this.state.scale = Math.min(
            this.imageEditorContainer.offsetWidth / this.state.image.width,
            this.imageEditorContainer.offsetHeight / this.state.image.height
        );


        // TODO: to be updated onWindowResize
        // position the cropArea in the center of the image editing area
        // and keep the aspect ratio, if specified
        // scale the width and height to fit aspect ratio, and about 80%

        this.cropAreaContainer.style.width = `${ this.imageEditorContainer.offsetWidth }px`;
        this.cropAreaContainer.style.height = `${ this.imageEditorContainer.offsetHeight }px`;
        const centerOfImageContainerCoords = getCenterPositionRelativeToParent( this.cropAreaContainer, this.imageEditorContainer );
        this.cropAreaContainer.style.left = `${centerOfImageContainerCoords.left}px`;
        this.cropAreaContainer.style.top = `${centerOfImageContainerCoords.top}px`;


        // TODO: to be updated onWindowResize
        // we will update the scale ratio
        this.canvas.width = this.cropAreaContainer.offsetWidth;
        this.canvas.height = this.cropAreaContainer.offsetHeight;
        this.canvas.style.width = `${ this.cropAreaContainer.offsetWidth }px`;
        this.canvas.style.height = `${ this.cropAreaContainer.offsetHeight }px`;

        // initial update of coordinates
        this.updateCoordinates();
        this.drawImage();

        // capture window resize event streams
        if ( typeof window !== 'undefined' ) {
            window.addEventListener( 'resize', throttle( this.onWindowResize, 333 ) );
        }

        // finally, we show the workspace
        this.imageEditorContainer.classList.remove( `${NAMESPACE}__canvas-container-loading` );

    }

    onWindowResize() {
        //this.updateCoordinates();
    }

    updateCoordinates() {

        // set the crop position coordinates
        // these are not the position: absolute coordinates but the x1, x2, y1, y2 of the rectangle
        this.state.bounds = {
            top: Math.max( this.cropAreaContainer.offsetTop ),
            right: Math.max( this.cropAreaContainer.offsetLeft + this.cropAreaContainer.offsetWidth ),
            bottom: Math.max( this.cropAreaContainer.offsetTop + this.cropAreaContainer.offsetHeight ),
            left: Math.max( this.cropAreaContainer.offsetLeft )
        };

        // set the max drag coordinates of the image layer
        // left get the additional value for the offset of the drag handler width
        // TODO: calc width dynamically
        this.imageBounds = {
            top: this.state.bounds.top,
            right: this.state.bounds.right - this.imageObj.offsetWidth,
            bottom: this.state.bounds.bottom - this.imageObj.offsetHeight,
            left: this.state.bounds.left
        };

        // we have to do this because the changed positions aren't upated on the object after a CSS3 transition
        const rect = getOffsetRelativeToParent( `.${NAMESPACE}__image-layer`, `.${NAMESPACE}__canvas-container` );
        this.state.maxCropWidth = this.imageObj.width - rect.left - this.state.bounds.left;
        this.state.maxCropHeight = this.imageObj.height - rect.top - this.state.bounds.top;


        console.log( ' COORDINATES ', 'this.imageBounds', this.imageBounds );
        console.log( ' COORDINATES ', 'this.state.bounds', this.state.bounds );
        console.log( ' COORDINATES ', 'this.state.maxCrop*', this.state.maxCropWidth, this.state.maxCropHeight );
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
        if ( event.target.classList.contains( `${NAMESPACE}__draggable-corner` ) ) {
            event.stopImmediatePropagation();
            this.onStartCropResize( event );
            return false;
        }

        // otherwise we're free to drag the image
        this.imageEditorContainer.addEventListener( 'mouseup', this.onStopDragCropArea );
        this.imageEditorContainer.addEventListener( 'touchend', this.onStopDragCropArea );
        this.imageEditorContainer.addEventListener( 'mouseleave', this.onStopDragCropArea );

        const mousePos = getMousePosition( event, this.imageEditorContainer );

        // we're translating the image so we have to know the delta position
        // the start position is the mouse position - the last known position
        this.state.image.startX = mousePos.x - ( this.state.image.dx || 0 );
        this.state.image.startY = mousePos.y - ( this.state.image.dy || 0 );

        // drag the image
        document.addEventListener( 'mousemove', this.onDragCropArea );
        document.addEventListener( 'touchmove', this.onDragCropArea, { passive: true } );

    }

    onDragCropArea( event ) {

        this.state.dragging = true;

        const mousePos = getMousePosition( event, this.imageEditorContainer );

        let newDx = mousePos.x - this.state.image.startX;
        let newDy = mousePos.y - this.state.image.startY;

        // check crop area is fully over the moving image
        // right edge of image cannot encroach into right of crop area and so on...
        newDx =  ( newDx <= this.imageBounds.left ) && ( newDx >= this.imageBounds.right ) ? newDx : this.state.image.dx;
        newDy = ( newDy <= this.imageBounds.top ) && ( newDy >= this.imageBounds.bottom ) ? newDy : this.state.image.dy;

        this.imageObj.style.transform = `translate(${ newDx }px, ${ newDy }px)`;

        // save the last known offset
        // TODO: we can create some internal reducer-like methods to manage this state
        this.state.image = Object.assign( {}, this.state.image, {
            dx: newDx,
            dy: newDy
        } );

    }

    onStopDragCropArea() {
        this.dragging = false;
        document.removeEventListener( 'mousemove', this.onDragCropArea );
        document.removeEventListener( 'touchmove', this.onDragCropArea, { passive: true } );
        this.updateCoordinates();
        this.drawImage();
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


        // only apply the new dimensions if fall within the min and max values
        if ( width > this.state.minCropWidth
            && height > this.state.minCropHeight
            && width < this.state.maxCropWidth
            && height < this.state.maxCropHeight ) {

            // set new crop container data
            this.cropAreaContainer.style.width = `${width}px`;
            this.cropAreaContainer.style.height = `${height}px`;
            this.cropAreaContainer.style.left = `${left}px`;
            this.cropAreaContainer.style.top = `${top}px`;

        }

    }

    onStopCropResize () {

        this.dragging = false;
        this.mousePos = null;

        document.removeEventListener( 'mousemove', this.onCropResize );
        document.removeEventListener( 'mouseup', this.onStopCropResize );

        document.removeEventListener( 'touchmove', this.onCropResize );
        document.removeEventListener( 'touchend', this.onStopCropResize );

        this.updateCoordinates();
        this.drawImage();
    }


    drawImage() {


        this.canvas.width = this.cropAreaContainer.offsetWidth;
        this.canvas.height = this.cropAreaContainer.offsetHeight;
        this.canvas.style.width = `${ this.cropAreaContainer.offsetWidth }px`;
        this.canvas.style.height = `${ this.cropAreaContainer.offsetHeight }px`;

        const context = this.canvas.getContext('2d');
        context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
        context.save();

        context.setTransform( 1, 0, 0, 1, 0, 0 );
        context.scale( 1, 1 );

        // TODO: cache the values for each canvas transform so we can undo?
        // abstract this assignment
        // we have to do this because the changed positions aren't upated on the object after a CSS3 transition
        const rect = getOffsetRelativeToParent( `.${NAMESPACE}__image-layer`, `.${NAMESPACE}__canvas-container` );

        // TODO: get this dynamically: 2 === the width of the crop borders

        console.log('drawImage', this.cropAreaContainer.offsetLeft, this.imageObj.offsetLeft, rect)

        this.state.drawImageParameters.sourceX = this.cropAreaContainer.offsetLeft - rect.left + 2;
        this.state.drawImageParameters.sourceY = this.cropAreaContainer.offsetTop - rect.top + 2;
        this.state.drawImageParameters.sourceWidth = this.cropAreaContainer.offsetWidth;
        this.state.drawImageParameters.sourceHeight = this.cropAreaContainer.offsetHeight;


        this.state.drawImageParameters.destX = 0;
        this.state.drawImageParameters.destY =  0;
        this.state.drawImageParameters.destWidth =  this.cropAreaContainer.offsetWidth;
        this.state.drawImageParameters.destHeight = this.cropAreaContainer.offsetHeight;


        context.drawImage(
            this.imageObj,
            // x, y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
            this.state.drawImageParameters.sourceX, this.state.drawImageParameters.sourceY,
            // w and h of the sub-rectangle of the source image to draw into the destination context.
            this.state.drawImageParameters.sourceWidth, this.state.drawImageParameters.sourceHeight,
            // x, y coordinates in the destination canvas at which to place the top-left corner of the source image.
            this.state.drawImageParameters.destX, this.state.drawImageParameters.destY,
            // w and h of the image in the destination canvas. Changing these values scales the sub-rectangle in the destination context.
            this.state.drawImageParameters.destWidth, this.state.drawImageParameters.destHeight );

        context.restore();


        this.onWorkSpaceUpdated( {
            canvas: this.canvas,
            ...this.state
        } );

    }

    reset() {

        // TODO: this is verbose, but only for dev purposes so we know which original vals to store onLoad
        // TODO: let's abstract this, and save a cloned state of the original values
        this.cropAreaContainer.style.width = `${ this.imageEditorContainer.offsetWidth }px`;
        this.cropAreaContainer.style.height = `${ this.imageEditorContainer.offsetHeight }px`;
        const centerOfImageContainerCoords = getCenterPositionRelativeToParent( this.cropAreaContainer, this.imageEditorContainer );
        this.cropAreaContainer.style.left = `${centerOfImageContainerCoords.left}px`;
        this.cropAreaContainer.style.top = `${centerOfImageContainerCoords.top}px`;
        this.imageObj.src = this.imageObjClone.src;
        this.imageObj.width = this.state.image.originaDimensions.width;
        this.imageObj.height = this.state.image.originaDimensions.height;
        this.imageObj.style.transform = 'translate(0px, 0px)';
        this.imageObj.style.left = `${centerOfImageContainerCoords.left}px`;
        this.imageObj.style.top = `${centerOfImageContainerCoords.top}px`;
        this.mousePos = null;
        this.state.image = {
            width: this.imageObj.width,
            height: this.imageObj.height,
            dx: 0,
            dy: 0,
            originaDimensions: {
                width: this.imageObj.width,
                height: this.imageObj.height
            }
        };

        this.updateCoordinates();
        this.drawImage();

    }

    destroy() {

        // remove events listeners
        if ( typeof window !== 'undefined' && this.onWindowResize ) {
            window.removeEventListener( 'resize', this.onWindowResize );
        }
        this.imageEditorContainer.removeEventListener( 'mousedown', this.onStartDragCropArea );
        this.imageEditorContainer.removeEventListener( 'touchstart', this.onStartDragCropArea );
        this.imageEditorContainer.removeEventListener( 'mouseup', this.onStopDragCropArea );
        this.imageEditorContainer.removeEventListener( 'touchend', this.onStopDragCropArea );
        this.imageEditorContainer.removeEventListener( 'mouseleave', this.onStopDragCropArea );

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