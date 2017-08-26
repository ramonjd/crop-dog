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

const NAMESPACE = 'image-editor';
const IMAGE_ALT_TEXT = 'Image being edited';
const ACTIVE_CLASS = 'image-editor__active';
const EDITOR_GUTTER = .8;
const DEBUG = true;

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

/*

// experimental zoom out calculations, might not work
// which is distance between the dragged corner and the nearest corner of the scaled image
// it should form some sort of rectangle so the distance is the hypotenuse  
function getHypotenuse ( a, b ) {
    return Math.sqrt( (a * a) + ( b * b ) );
}
function getZoomRatio ( newHypontenuse, oldHypontenuse ) {
    return newHypontenuse / oldHypontenuse   ;
}
*/


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
        this.updateWorkspace = this.updateWorkspace.bind( this );
        this.onStartDragCropArea = this.onStartDragCropArea.bind( this );
        this.onDragCropArea = this.onDragCropArea.bind( this );
        this.onStopDragCropArea = this.onStopDragCropArea.bind( this );
        this.onStartCropResize = this.onStartCropResize.bind( this );
        this.onCropResize = this.onCropResize.bind( this );
        this.onStopCropResize = this.onStopCropResize.bind( this );


        // create elements
        const fragment = document.createDocumentFragment();

        // the image to manipulate
        this.imageObj = new Image();
        this.imageObj.setAttribute('crossOrigin', 'anonymous');
        this.imageObj.className = `${NAMESPACE}__image-layer`;
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
            className: `${NAMESPACE}__canvas-workspace`
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
                this.canvasWorkspace ]

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

        // TODO: requestAnimationFrame to optimize constant coordinate updates
        this.dragRequestId = null;

        // TODO: these flags are fairly arbitraty now
        // and are meant to solve immediate dev problems
        // need review
        this.resizing = false;
        this.cropActionTriggered

        this.frameRateInterval = 1000 / 30;
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
            removeClass( this.imageEditorContainer, `${NAMESPACE}__container-loading` );
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
            //this.dragRequestId = window.requestAnimationFrame( this.updateWorkspace );

            // signals to maintain crop dimensions
            this.croppingArea.touched = true;
            this.cropAreaContainer.style.transition = 'unset';
            this.imageObj.style.transition = 'unset';

            // cache the event
            this.cropEvent = event;
          
            this.onStartCropResize( event );
            return false;
        }

        // otherwise we're free to drag the image
        document.addEventListener( 'mouseup', this.onStopDragCropArea );
        document.addEventListener( 'touchend', this.onStopDragCropArea );
        document.addEventListener( 'mouseleave', this.onStopDragCropArea );

        const mousePos = getMousePosition( event, this.imageEditorContainer );

        // we're translating the image so we have to know the delta position
        // the start position is the mouse position - the last known position
        this.image.drag.startX = mousePos.x - this.image.transform.translateX;
        this.image.drag.startY = mousePos.y - this.image.transform.translateY;

        // drag the image
        document.addEventListener( 'mousemove', this.onDragCropArea );
        document.addEventListener( 'touchmove', this.onDragCropArea, { passive: true } );
    }


    onDragCropArea( event ) {

        this.dragging = true;
        const mousePos = getMousePosition( event, this.imageEditorContainer );

        let newDx = mousePos.x - this.image.drag.startX;
        let newDy = mousePos.y - this.image.drag.startY;

        if ( this.image.width > this.croppingArea.width && 
            this.image.height > this.croppingArea.height
            && newDx <= this.croppingArea.position.left
            && newDy <= this.croppingArea.position.top
            && (-1 * newDy) + this.croppingArea.height <= this.image.height
            && newDx >=  this.croppingArea.width - this.image.width ) {


            this.transformMatrices = {
                ...createTransformMatrix( 
                    this.transformMatrices.transformMatrix, 
                    this.transformMatrices.inverseTransformMatrix, 
                    newDx, 
                    newDy, 
                    this.image.transform.scale,
                    this.image.transform.radians 
                )
            };

            this.imageObj.style.transform = `matrix(    
                ${this.transformMatrices.transformMatrix[0]}, 
                ${this.transformMatrices.transformMatrix[1]}, 
                ${this.transformMatrices.transformMatrix[2]}, 
                ${this.transformMatrices.transformMatrix[3]}, 
                ${this.transformMatrices.transformMatrix[4]}, 
                ${this.transformMatrices.transformMatrix[5]})`;

            // save the last known offset
            // TODO: we can create some internal reducer-like methods to manage this state
            this.image.drag = Object.assign( {},  this.image.drag, {
                dx: newDx,
                dy: newDy
            });
        }
   }

    onStopDragCropArea() {
            this.dragging = false;
            removeClass( this.cropAreaContainer, ACTIVE_CLASS );
            document.removeEventListener( 'mousemove', this.onDragCropArea );
            document.removeEventListener( 'touchmove', this.onDragCropArea, { passive: true } );

            this.image.transform = Object.assign( {}, this.image.transform, {
                translateX: this.image.drag.dx,
                translateY: this.image.drag.dy
            } );

            this.drawImage();
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

              // height = height >= this.croppingArea.maxDimensions.height ? this.croppingArea.maxDimensions.height : height;
              // height = height <= this.croppingArea.minDimensions.height ? this.croppingArea.minDimensions.height : height;
              // width = width >= this.croppingArea.maxDimensions.width ? this.croppingArea.maxDimensions.width : width;
              // width = width <= this.croppingArea.minDimensions.width ? this.croppingArea.minDimensions.width : width;

              // if ( this.constrain || event.shiftKey ) {
              //     height = width / this.image.width * this.image.height;
              // }

              // this.croppingArea.position.left = left;
              // this.cropAreaContainer.style.left = `${ this.croppingArea.position.left  }px`;

              // this.croppingArea.width = width; 
              // this.cropAreaContainer.style.width = `${ this.croppingArea.width }px`;

              // this.croppingArea.height = height; 
              // this.cropAreaContainer.style.height = `${ this.croppingArea.height }px`;

              // this.croppingArea.position.top = top;
              // this.cropAreaContainer.style.top = `${ this.croppingArea.position.top }px`; 

              
              // return false;
        }

        if ( this.cropEvent.target.classList.contains( `${NAMESPACE}__draggable-corner-sw` ) ) {

              // origin of image scale should be set to the opposite corner of this handle
              this.image.transform.origin = [ 'right', 'top' ];

              width  = this.croppingArea.width - ( this.mousePos.x - this.croppingArea.position.left );
              left = this.mousePos.x;
              height = this.mousePos.y - this.croppingArea.position.top;
              top = this.croppingArea.position.top;

              // height = height >= this.croppingArea.maxDimensions.height ? this.croppingArea.maxDimensions.height : height;
              // height = height <= this.croppingArea.minDimensions.height ? this.croppingArea.minDimensions.height : height;
              // width = width >= this.croppingArea.maxDimensions.width ? this.croppingArea.maxDimensions.width : width;
              // width = width <= this.croppingArea.minDimensions.width ? this.croppingArea.minDimensions.width : width;
              // left = left >= this.croppingArea.boundary.right - this.croppingArea.minDimensions.width 
              //   ? this.croppingArea.boundary.right - this.croppingArea.minDimensions.width : left;
              // left = left <= this.croppingArea.boundary.left ? this.croppingArea.boundary.left : left;

              // if ( this.constrain || event.shiftKey ) {
              //     height = width / this.image.width * this.image.height;
              // }

              // this.croppingArea.position.left = left;
              // this.cropAreaContainer.style.left = `${ this.croppingArea.position.left  }px`;

              // this.croppingArea.width = width; 
              // this.cropAreaContainer.style.width = `${ this.croppingArea.width }px`;

              // this.croppingArea.height = height; 
              // this.cropAreaContainer.style.height = `${ this.croppingArea.height }px`;

              // this.croppingArea.position.top = top;
              // this.cropAreaContainer.style.top = `${ this.croppingArea.position.top }px`; 

              
              // return false;

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

              // height = isNaN(height) ? this.croppingArea.height : height;
              // height = height >= this.croppingArea.maxDimensions.height ? this.croppingArea.maxDimensions.height : height;
              // height = height <= this.croppingArea.minDimensions.height ? this.croppingArea.minDimensions.height : height;
              // width = width >= this.croppingArea.maxDimensions.width ? this.croppingArea.maxDimensions.width : width;
              // width = width <= this.croppingArea.minDimensions.width ? this.croppingArea.minDimensions.width : width;
              // left = left >= this.croppingArea.boundary.right - this.croppingArea.minDimensions.width 
              //   ? this.croppingArea.boundary.right - this.croppingArea.minDimensions.width : left;
              // left = left <= this.croppingArea.boundary.left ? this.croppingArea.boundary.left : left;
              
              // top = top >= this.croppingArea.boundary.bottom - this.croppingArea.minDimensions.height 
              //   ? this.croppingArea.boundary.bottom - this.croppingArea.minDimensions.height : top;

              // top = (
              //   top <= this.croppingArea.boundary.top 
              //   || isNaN(top) ) 
              //   ? this.croppingArea.boundary.top : top;

              // if ( this.constrain || event.shiftKey ) {
              //     height = width / this.image.width * this.image.height;
              // }

              // this.croppingArea.position.left = left;
              // this.cropAreaContainer.style.left = `${ this.croppingArea.position.left  }px`;

              // this.croppingArea.width = width; 
              // this.cropAreaContainer.style.width = `${ this.croppingArea.width }px`;

              // this.croppingArea.height = height; 
              // this.cropAreaContainer.style.height = `${ this.croppingArea.height }px`;

              // this.croppingArea.position.top = top;
              // this.cropAreaContainer.style.top = `${ this.croppingArea.position.top }px`; 
              
              // return false;

        }


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
              
              return false;


          // zoom out diagonally
            // this.zoomOut = false;
            // this.cropActionTriggered = true;

            // if ( width > this.croppingArea.width && height > this.croppingArea.height )  {
            //   this.zoomOut = true;
            // }
            //  if (this.zoomOut)   {
            //     this.zoomOutImage() ;
            //  }  

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
        this.cropAreaContainer.style.transition = 'all 0.09s linear';
        this.imageObj.style.transition = 'transform 0.1s linear';
        if (!this.cropActionTriggered) {
          return;
        }

        this.cropActionTriggered = false;

        // are we zooming out?
        // TODO: implement this
        if (this.zoomOut) {
            this.zoomOut = false;
            this.croppingArea.scale = {
                width: this.croppingArea.width / this.image.width,
                height: this.croppingArea.height / this.image.height,
                top: this.croppingArea.position.top / this.image.height ,
                left: this.croppingArea.position.left / this.image.width
            };
        } else {
            //this.zoomInImage();
        }

        //this.drawImage();
    }

    zoomInImage() {

         // get aspect ratio of to-be-resized crop area
        const scaleRatio = calculateAspectRatioFit(
              this.croppingArea.width,
              this.croppingArea.height,
              this.outerContainer.width,
              this.outerContainer.height,
              this.image.rotated,
              EDITOR_GUTTER );


       
        const scale = this.image.transform.scale * scaleRatio.ratio;
        
        if (scale >= this.image.maxRatio) {
            return;
        }
        const translateY =  (-1 * (this.croppingArea.position.top * scaleRatio.ratio ))
              + (this.image.transform.translateY * scaleRatio.ratio);
        const translateX =  (-1 * (this.croppingArea.position.left * scaleRatio.ratio ))
              + (this.image.transform.translateX * scaleRatio.ratio);

        this.transformMatrices = {
            ...createTransformMatrix( 
                this.transformMatrices.transformMatrix, 
                this.transformMatrices.inverseTransformMatrix, 
                // play with this
                translateX, 
                translateY, 
                scale,
                this.image.transform.radians 
                )
        };

        this.imageObj.style.transform = `matrix(    
            ${this.transformMatrices.transformMatrix[0]}, 
            ${this.transformMatrices.transformMatrix[1]}, 
            ${this.transformMatrices.transformMatrix[2]}, 
            ${this.transformMatrices.transformMatrix[3]}, 
            ${this.transformMatrices.transformMatrix[4]}, 
            ${this.transformMatrices.transformMatrix[5]})`;

        this.image.width = this.image.width * scaleRatio.ratio;
        this.image.height = this.image.height * scaleRatio.ratio;

        this.croppingArea.maxDimensions = {
            width: this.image.width >= this.outerContainer.width ? this.outerContainer.width : this.image.width,
            height: this.image.height >= this.outerContainer.height ? this.outerContainer.height : this.image.height
        };

        this.croppingArea.width = scaleRatio.width >= this.croppingArea.maxDimensions.width ? this.croppingArea.maxDimensions.width : scaleRatio.width;
        this.croppingArea.height = scaleRatio.height >= this.croppingArea.maxDimensions.height ? this.croppingArea.maxDimensions.height : scaleRatio.height;
        
        this.croppingArea.position.top = 0;
        this.croppingArea.position.left =  0 ;

        this.cropAreaContainer.style.left = `${ this.croppingArea.position.left   }px`;
        this.cropAreaContainer.style.top = `${ this.croppingArea.position.top  }px`;
        this.cropAreaContainer.style.width =  `${ this.croppingArea.width  }px`;
        this.cropAreaContainer.style.height =  `${ this.croppingArea.height  }px`;

        this.croppingArea.scale = {
            width: this.croppingArea.width / this.image.width,
            height: this.croppingArea.height / this.image.height,
            top: this.croppingArea.position.top / this.image.height ,
            left: this.croppingArea.position.left / this.image.width,
        };
  
 
        this.image.transform = Object.assign( {}, this.image.transform, {
            translateX,
            translateY,
            scale
        } );

        this.drawImage();

    }


    // TODO: zoom out when pulling the draggable corners
    zoomOutImage() {
       console.log('zoom out!!!');
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


        let scaleRatio;
        
        // if nothing has been touched, size the image to the workspace
        if ( ! this.croppingArea.touched ) {
            // get aspect ratio
            scaleRatio = calculateAspectRatioFit(
                  this.imageObj.naturalWidth,
                  this.imageObj.naturalHeight,
                  this.outerContainer.width,
                  this.outerContainer.height,
                  this.image.rotated,
                  EDITOR_GUTTER );
            
            // apply the initial dimensions to the image      
            this.image.width = scaleRatio.width;
            this.image.height = scaleRatio.height;
            this.image.transform.scale = scaleRatio.ratio;
            
            // apply them to the cropping area
            this.croppingArea.height = this.image.height;
            this.croppingArea.width = this.image.width;

            // center coords of container
            const outerContainerCenterX = this.outerContainer.width / 2;
            const outerContainerCenterY = this.outerContainer.height / 2 ;
            const imageHalfWidth = this.croppingArea.width / 2;
            const imageHalfHeight = this.croppingArea.height / 2;
            const newPositionX = outerContainerCenterX - imageHalfWidth;
            const newPositionY = outerContainerCenterY - imageHalfHeight;

            this.croppingArea.position = {
                top:  newPositionY,
                right: newPositionX + this.image.width,
                bottom: newPositionY + this.image.height,
                left: newPositionX
            };

            this.croppingArea.boundary = {
                ...this.croppingArea.position
            };

            this.image.transform = Object.assign( {}, this.image.transform, {
                translateX: ( -1 * ( this.imageObj.naturalWidth - this.image.width ) / 2 ) + newPositionX,
                translateY: ( -1 * ( this.imageObj.naturalHeight - this.image.height ) / 2 ) + newPositionY
            } );

        // else the ratio we care about is the resized cropping area 
        } else {
            scaleRatio = calculateAspectRatioFit(
                  this.croppingArea.width,
                  this.croppingArea.height,
                  this.outerContainer.width,
                  this.outerContainer.height,
                  this.image.rotated,
                  EDITOR_GUTTER );


            this.image.width = this.image.width * scaleRatio.ratio;
            this.image.height = this.image.height * scaleRatio.ratio;       
            this.image.transform.scale = this.image.transform.scale * scaleRatio.ratio;

            this.croppingArea.width = this.croppingArea.scale.width * this.image.width;
            this.croppingArea.height = this.croppingArea.scale.height * this.image.height;
            this.croppingArea.position.top = ( this.croppingArea.scale.top * this.image.height );
            this.croppingArea.position.left =  ( this.croppingArea.scale.left * this.image.width);
        }

      // TODO: this is not exactly right. 
      // translateX is constantly updated, so we need to apply the correct ratio when scaling
      // haven't worked that out yet  
      // this.image.transform = Object.assign( {}, this.image.transform, {
      //     translateX: this.image.transform.translateX * scaleRatio.ratio,
      //     translateY: this.image.transform.translateY *  scaleRatio.ratio
      // } );

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

        // resize the cropping area
        this.cropAreaContainer.style.left = `${ this.croppingArea.position.left   }px`;
        this.cropAreaContainer.style.top = `${ this.croppingArea.position.top  }px`;
        this.cropAreaContainer.style.width =  `${ this.croppingArea.width  }px`;
        this.cropAreaContainer.style.height =  `${ this.croppingArea.height  }px`;

        // reset the cropping area's limits
        this.croppingArea.maxDimensions = {
            width: this.image.width >= this.outerContainer.width ? this.outerContainer.width : this.image.width,
            height: this.image.height >= this.outerContainer.height ? this.outerContainer.height : this.image.height
        };

        // draw to canvas
        // TODO: we don't actually have to do this at all until the final save
        this.drawImage();

    }


    // TODO: at the moment we're calling this after every image transformation
    // in fact, because we're keeping track of the transforms, we don't need to call it at all until the end
    // it's just for the preview
    drawImage() {

        const context = this.canvasWorkspace.getContext('2d');
        const rotated = this.image.rotated;

       
        const scaledCropWidth = Math.floor( ( this.croppingArea.width / this.image.transform.scale  ) );
        const scaledCropHeight = Math.floor( ( this.croppingArea.height / this.image.transform.scale  ) );



        this.canvasWorkspace.width = scaledCropWidth;
        this.canvasWorkspace.height =  scaledCropHeight;

        context.clearRect( 0, 0, scaledCropWidth / 2, scaledCropWidth / 2  );

        // TODO
        if ( rotated ) {
            // origin of the canvas rotate is the middle
            // context.translate( this.canvasWorkspace.width / 2, this.canvasWorkspace.width / 2 );
            // context.rotate( this.image.transform.radians );
        }
        

        context.save();


        // invert the matrix and get the original coords 
        // from the top, left  of the cropping tool
        const sourceCoords = getOriginalCoordinatesFromTransformedMatrix( 
            this.transformMatrices.transformMatrix, 
            this.transformMatrices.inverseTransformMatrix,
            this.croppingArea.position.left,
            this.croppingArea.position.top
        );

        // this is where and how far we want to crop the original image
        const sourceX = sourceCoords.x,
              sourceY = sourceCoords.y,
              sourceWidth = scaledCropWidth,
              sourceHeight = scaledCropHeight;

        // get the destination x, y
        const destX = 0,
              destY = 0,

        // the cropped area
            destWidth = scaledCropWidth,
            destHeight = scaledCropHeight;


        // now draw!    
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

        if ( DEBUG ) {

            this.onWorkSpaceUpdated( {
                canvas: this.canvasWorkspace,
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
    }

    rotate( degrees ) {
        // TODO: check if one of 90/180/270
        this.image.transform.degrees = degrees;
        this.image.transform.radians = getRadianFromDegrees( degrees );
        this.image.rotated = ! ( ( this.image.transform.degrees % 180 ) === 0 );
        this.updateWorkspace();
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