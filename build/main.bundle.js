/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _imageEditor = __webpack_require__(1);

var _imageEditor2 = _interopRequireDefault(_imageEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.imageEditor = new _imageEditor2.default({
    imagePath: 'http://localhost:8888/src/amsler.jpg',
    imageAltText: 'A village after dark',
    onWorkSpaceUpdated: onWorkSpaceUpdated
}, document.querySelector('.media-image-editor__canvas-container'));

// DEBUG
function onWorkSpaceUpdated(newImageEditorState) {
    var croppedImageObj = document.querySelector('.media-image-editor_debug__preview-container img');
    var croppedImageAtag = document.querySelector('.media-image-editor_debug__preview-container a');
    var previewImage = newImageEditorState.canvas.toDataURL('image/jpeg', 0.8);
    croppedImageObj.src = previewImage;
    croppedImageObj.width = newImageEditorState.cropped.width;
    croppedImageObj.height = newImageEditorState.cropped.height;
    croppedImageAtag.href = previewImage;

    var template = '\n        <li>\n            <var>Original image dimensions</var>\n            <samp>\n                ' + newImageEditorState.original.width + '\n                x ' + newImageEditorState.original.height + '\n            </samp>\n        </li>\n        <li>\n            <var>Cropped dimensions</var>\n            <samp>\n                ' + newImageEditorState.cropped.width + ' x ' + newImageEditorState.cropped.height + '\n            </samp>\n        </li>\n        <li><var>Cropped coordinates</var> <samp>TBD</samp></li>\n        <li><var>Rotated</var> <samp>' + newImageEditorState.cropped.rotated + '</samp></li>\n        <li><var>Ratio to original image</var> <samp>TBD</samp></li>\n    ';

    document.querySelector('.media-image-editor_debug-values ul').innerHTML = template;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NAMESPACE = 'image-editor';
var IMAGE_ALT_TEXT = 'Image being edited';
var ACTIVE_CLASS = 'image-editor__active';
var EDITOR_GUTTER = .8;
var DEBUG = true;

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

var ImageEditor = function () {
    function ImageEditor(props, container) {
        _classCallCheck(this, ImageEditor);

        // cache of computed image properties
        this.image = {
            transform: {
                ratio: 0,
                translateX: 0,
                translateY: 0,
                degrees: 0,
                radians: (0, _utils.getRadianFromDegrees)(0),
                origin: ['center', 'center']
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
                startX: 0,
                startY: 0,
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
        this.onImageLoaded = this.onImageLoaded.bind(this);
        this.updateWorkspace = this.updateWorkspace.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.updateWorkspace = this.updateWorkspace.bind(this);
        this.onStartDragCropArea = this.onStartDragCropArea.bind(this);
        this.onDragCropArea = this.onDragCropArea.bind(this);
        this.onStopDragCropArea = this.onStopDragCropArea.bind(this);
        this.onStartCropResize = this.onStartCropResize.bind(this);
        this.onCropResize = this.onCropResize.bind(this);
        this.onStopCropResize = this.onStopCropResize.bind(this);

        // create elements
        var fragment = document.createDocumentFragment();

        // the image to manipulate
        this.imageObj = new Image();
        this.imageObj.setAttribute('crossOrigin', 'anonymous');
        this.imageObj.className = NAMESPACE + '__image-layer';
        this.imageObj.setAttribute('alt', this.imageAltText || IMAGE_ALT_TEXT);
        this.imageObj.onload = this.onImageLoaded;
        this.imageObj.onerror = _utils.noop;

        // create a clone of the original image
        // so we can reset and get original props
        // container for the original image
        this.imageObjClone = null;
        this.imageObjClone = this.imageObj.cloneNode(true);

        // this is the offPage workspace
        // it takes the transformed image, and calculates the positions and ratios required to create output image
        // https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-pre-render
        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas 
        this.canvasWorkspace = (0, _utils.createElement)({
            tagName: 'canvas',
            className: NAMESPACE + '__canvas-workspace'
        });

        // this is the cropping tool
        // add the cropping tool and the canvas element
        this.cropAreaContainer = (0, _utils.createElement)({
            tagName: 'div',
            className: NAMESPACE + '__crop-container',
            'aria-label': 'Cropping area',
            children: [{
                tagName: 'div',
                className: 'image-editor__draggable-corner ' + NAMESPACE + '__draggable-corner-nw'
            }, {
                tagName: 'div',
                className: 'image-editor__draggable-corner ' + NAMESPACE + '__draggable-corner-ne'
            }, {
                tagName: 'div',
                className: 'image-editor__draggable-corner ' + NAMESPACE + '__draggable-corner-sw'
            }, {
                tagName: 'div',
                className: 'image-editor__draggable-corner ' + NAMESPACE + '__draggable-corner-se'
            }, {
                tagName: 'span',
                className: 'image-editor__guide ' + NAMESPACE + '__guide-horiz-top'
            }, {
                tagName: 'span',
                className: 'image-editor__guide ' + NAMESPACE + '__guide-horiz-bottom'
            }, this.canvasWorkspace]

        });

        // this is the workspace wrapper
        this.imageEditorWorkspace = (0, _utils.createElement)({
            tagName: 'div',
            className: NAMESPACE + '__workspace',
            children: [this.cropAreaContainer, this.imageObj]
        });

        // this is the main container
        this.imageEditorContainer = (0, _utils.createElement)({
            tagName: 'div',
            className: NAMESPACE + '__container ' + NAMESPACE + '__container-loading',
            children: [this.imageEditorWorkspace]
        });

        // add event listeners for dragging
        // TODO: add helper for multiple event handlers
        this.cropAreaContainer.addEventListener('mousedown', this.onStartDragCropArea);
        this.cropAreaContainer.addEventListener('touchstart', this.onStartDragCropArea, { passive: true });

        // dragging flag
        this.dragging = false;

        // append elements
        fragment.appendChild(this.imageEditorContainer);
        this.container.appendChild(fragment);

        // TODO: requestAnimationFrame to optimize constant coordinate updates
        this.dragRequestId = null;

        // TODO: these flags are fairly arbitraty now
        // and are meant to solve immediate dev problems
        // need review
        this.resizing = false;
        this.cropActionTriggered;

        this.frameRateInterval = 1000 / 30;
        this.requestAnimationFrameId = null;
        this.lastTimestamp = null;

        // callbacks
        this.onWorkSpaceUpdated = props.onWorkSpaceUpdated;

        // transform matrix defaults
        this.transformMatrices = {
            transformMatrix: [1, 0, 0, 1, 0, 0],
            inverseTransformMatrix: [1, 0, 0, 1]
        };
        // load image and prepare workspace
        this.imageObj.src = this.imagePath;

        return this;
    }

    _createClass(ImageEditor, [{
        key: 'onImageLoaded',
        value: function onImageLoaded() {
            var _this = this;

            // initial update of coordinates
            this.updateWorkspace();

            if (typeof window !== 'undefined') {
                this.lastTimestamp = window.performance.now();
                window.addEventListener('resize', this.onWindowResize);
            }

            // finally, we show the workspace
            // place it on the end of the stack to ensure the update takes place first
            setTimeout(function () {
                (0, _utils.removeClass)(_this.imageEditorContainer, NAMESPACE + '__container-loading');
            });
        }
    }, {
        key: 'onWindowResize',
        value: function onWindowResize() {
            this.requestAnimationFrameId = window.requestAnimationFrame(this.updateWorkspace);
        }

        /*
          onStartDragCropArea - main event delegator
         Since all the interaction takes place on the cropArea,
         we don't need to assign multiple events to each drag handle and so on
          */

    }, {
        key: 'onStartDragCropArea',
        value: function onStartDragCropArea(event) {

            event.preventDefault();
            (0, _utils.addClass)(this.cropAreaContainer, ACTIVE_CLASS);
            // if we've hit a drag handle, stop propagation
            // and throw the event to the crop resize setup method
            if ((0, _utils.hasClass)(event.target, NAMESPACE + '__draggable-corner')) {
                event.stopImmediatePropagation();
                //this.dragRequestId = window.requestAnimationFrame( this.updateWorkspace );

                // signals to maintain crop dimensions
                this.croppingArea.touched = true;
                this.cropAreaContainer.style.transition = 'unset';
                this.imageObj.style.transition = 'unset';

                // cache the event
                this.cropEvent = event;

                this.onStartCropResize(event);
                return false;
            }

            // otherwise we're free to drag the image
            document.addEventListener('mouseup', this.onStopDragCropArea);
            document.addEventListener('touchend', this.onStopDragCropArea);
            document.addEventListener('mouseleave', this.onStopDragCropArea);

            var mousePos = (0, _utils.getMousePosition)(event, this.imageEditorContainer);

            // we're translating the image so we have to know the delta position
            // the start position is the mouse position - the last known position
            this.image.drag.startX = mousePos.x - this.image.transform.translateX;
            this.image.drag.startY = mousePos.y - this.image.transform.translateY;

            // drag the image
            document.addEventListener('mousemove', this.onDragCropArea);
            document.addEventListener('touchmove', this.onDragCropArea, { passive: true });
        }
    }, {
        key: 'onDragCropArea',
        value: function onDragCropArea(event) {

            this.dragging = true;
            var mousePos = (0, _utils.getMousePosition)(event, this.imageEditorContainer);

            var newDx = mousePos.x - this.image.drag.startX;
            var newDy = mousePos.y - this.image.drag.startY;

            if (this.image.width > this.croppingArea.width && this.image.height > this.croppingArea.height && newDx <= this.croppingArea.position.left && newDy <= this.croppingArea.position.top && -1 * newDy + this.croppingArea.height <= this.image.height && newDx >= this.croppingArea.width - this.image.width) {

                this.transformMatrices = _extends({}, (0, _utils.createTransformMatrix)(this.transformMatrices.transformMatrix, this.transformMatrices.inverseTransformMatrix, newDx, newDy, this.image.transform.scale, this.image.transform.radians));

                this.imageObj.style.transform = 'matrix(    \n                ' + this.transformMatrices.transformMatrix[0] + ', \n                ' + this.transformMatrices.transformMatrix[1] + ', \n                ' + this.transformMatrices.transformMatrix[2] + ', \n                ' + this.transformMatrices.transformMatrix[3] + ', \n                ' + this.transformMatrices.transformMatrix[4] + ', \n                ' + this.transformMatrices.transformMatrix[5] + ')';

                // save the last known offset
                // TODO: we can create some internal reducer-like methods to manage this state
                this.image.drag = Object.assign({}, this.image.drag, {
                    dx: newDx,
                    dy: newDy
                });
            }
        }
    }, {
        key: 'onStopDragCropArea',
        value: function onStopDragCropArea() {
            this.dragging = false;
            (0, _utils.removeClass)(this.cropAreaContainer, ACTIVE_CLASS);
            document.removeEventListener('mousemove', this.onDragCropArea);
            document.removeEventListener('touchmove', this.onDragCropArea, { passive: true });

            this.image.transform = Object.assign({}, this.image.transform, {
                translateX: this.image.drag.dx,
                translateY: this.image.drag.dy
            });

            this.drawImage();
        }
    }, {
        key: 'onStartCropResize',
        value: function onStartCropResize(event) {

            this.dragging = true;

            event.preventDefault();

            document.addEventListener('touchmove', this.onCropResize);
            document.addEventListener('touchend', this.onStopCropResize);
            document.addEventListener('mousemove', this.onCropResize);
            document.addEventListener('mouseup', this.onStopCropResize);

            this.mousePos = {
                x: 0,
                y: 0
            };
        }
    }, {
        key: 'onCropResize',
        value: function onCropResize(event) {
            event.preventDefault();
            this.mousePos = (0, _utils.getMousePosition)(event, this.imageEditorContainer);
            // first check the mouse boundaries
            // now calculate the new dimensions of the crop area
            var width = void 0,
                height = void 0,
                left = void 0,
                top = void 0,
                right = void 0,
                bottom = void 0;

            if (this.cropEvent.target.classList.contains(NAMESPACE + '__draggable-corner-se')) {

                // origin of image scale should be set to the opposite corner of this handle
                this.image.transform.origin = ['left', 'top'];

                width = this.mousePos.x - this.croppingArea.position.left;
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

            if (this.cropEvent.target.classList.contains(NAMESPACE + '__draggable-corner-sw')) {

                // origin of image scale should be set to the opposite corner of this handle
                this.image.transform.origin = ['right', 'top'];

                width = this.croppingArea.width - (this.mousePos.x - this.croppingArea.position.left);
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

            if (this.cropEvent.target.classList.contains(NAMESPACE + '__draggable-corner-nw')) {

                // origin of image scale should be set to the opposite corner of this handle
                this.image.transform.origin = ['right', 'bottom'];

                width = this.croppingArea.width - (this.mousePos.x - this.croppingArea.position.left);
                height = this.croppingArea.height - (this.mousePos.y - this.croppingArea.position.top);
                left = this.mousePos.x;
                top = this.mousePos.y;
                if (this.constrain || event.shiftKey) {
                    top = this.mousePos.y - (width / this.image.width * this.image.height - height);
                }
            }

            if (this.cropEvent.target.classList.contains(NAMESPACE + '__draggable-corner-ne')) {

                // origin of image scale should be set to the opposite corner of this handle
                this.image.transform.origin = ['left', 'bottom'];

                width = this.mousePos.x - this.croppingArea.position.left;
                height = this.croppingArea.height - (this.mousePos.y - this.croppingArea.position.top);
                left = this.croppingArea.position.left;
                top = this.mousePos.y;
                if (this.constrain || event.shiftKey) {
                    top = this.mousePos.y - (width / this.image.width * this.image.height - height);
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
            left = left >= this.croppingArea.boundary.right - this.croppingArea.minDimensions.width ? this.croppingArea.boundary.right - this.croppingArea.minDimensions.width : left;
            left = left <= this.croppingArea.boundary.left ? this.croppingArea.boundary.left : left;
            top = top >= this.croppingArea.boundary.bottom - this.croppingArea.minDimensions.height ? this.croppingArea.boundary.bottom - this.croppingArea.minDimensions.height : top;
            top = top <= this.croppingArea.boundary.top || isNaN(top) ? this.croppingArea.boundary.top : top;

            if (this.constrain || event.shiftKey) {
                height = width / this.image.width * this.image.height;
            }

            this.croppingArea.position.left = left;
            this.cropAreaContainer.style.left = this.croppingArea.position.left + 'px';

            this.croppingArea.width = width;
            this.cropAreaContainer.style.width = this.croppingArea.width + 'px';

            this.croppingArea.height = height;
            this.cropAreaContainer.style.height = this.croppingArea.height + 'px';

            this.croppingArea.position.top = top;
            this.cropAreaContainer.style.top = this.croppingArea.position.top + 'px';

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
    }, {
        key: 'onStopCropResize',
        value: function onStopCropResize() {

            this.dragging = false;
            this.mousePos = null;
            this.cropEvent = null;
            (0, _utils.removeClass)(this.cropAreaContainer, ACTIVE_CLASS);
            document.removeEventListener('mousemove', this.onCropResize);
            document.removeEventListener('mouseup', this.onStopCropResize);

            document.removeEventListener('touchmove', this.onCropResize);
            document.removeEventListener('touchend', this.onStopCropResize);
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
                    top: this.croppingArea.position.top / this.image.height,
                    left: this.croppingArea.position.left / this.image.width
                };
            } else {}
            //this.zoomInImage();


            //this.drawImage();
        }
    }, {
        key: 'zoomInImage',
        value: function zoomInImage() {

            // get aspect ratio of to-be-resized crop area
            var scaleRatio = (0, _utils.calculateAspectRatioFit)(this.croppingArea.width, this.croppingArea.height, this.outerContainer.width, this.outerContainer.height, this.image.rotated, EDITOR_GUTTER);

            var scale = this.image.transform.scale * scaleRatio.ratio;

            if (scale >= this.image.maxRatio) {
                return;
            }
            var translateY = -1 * (this.croppingArea.position.top * scaleRatio.ratio) + this.image.transform.translateY * scaleRatio.ratio;
            var translateX = -1 * (this.croppingArea.position.left * scaleRatio.ratio) + this.image.transform.translateX * scaleRatio.ratio;

            this.transformMatrices = _extends({}, (0, _utils.createTransformMatrix)(this.transformMatrices.transformMatrix, this.transformMatrices.inverseTransformMatrix,
            // play with this
            translateX, translateY, scale, this.image.transform.radians));

            this.imageObj.style.transform = 'matrix(    \n            ' + this.transformMatrices.transformMatrix[0] + ', \n            ' + this.transformMatrices.transformMatrix[1] + ', \n            ' + this.transformMatrices.transformMatrix[2] + ', \n            ' + this.transformMatrices.transformMatrix[3] + ', \n            ' + this.transformMatrices.transformMatrix[4] + ', \n            ' + this.transformMatrices.transformMatrix[5] + ')';

            this.image.width = this.image.width * scaleRatio.ratio;
            this.image.height = this.image.height * scaleRatio.ratio;

            this.croppingArea.maxDimensions = {
                width: this.image.width >= this.outerContainer.width ? this.outerContainer.width : this.image.width,
                height: this.image.height >= this.outerContainer.height ? this.outerContainer.height : this.image.height
            };

            this.croppingArea.width = scaleRatio.width >= this.croppingArea.maxDimensions.width ? this.croppingArea.maxDimensions.width : scaleRatio.width;
            this.croppingArea.height = scaleRatio.height >= this.croppingArea.maxDimensions.height ? this.croppingArea.maxDimensions.height : scaleRatio.height;

            this.croppingArea.position.top = 0;
            this.croppingArea.position.left = 0;

            this.cropAreaContainer.style.left = this.croppingArea.position.left + 'px';
            this.cropAreaContainer.style.top = this.croppingArea.position.top + 'px';
            this.cropAreaContainer.style.width = this.croppingArea.width + 'px';
            this.cropAreaContainer.style.height = this.croppingArea.height + 'px';

            this.croppingArea.scale = {
                width: this.croppingArea.width / this.image.width,
                height: this.croppingArea.height / this.image.height,
                top: this.croppingArea.position.top / this.image.height,
                left: this.croppingArea.position.left / this.image.width
            };

            this.image.transform = Object.assign({}, this.image.transform, {
                translateX: translateX,
                translateY: translateY,
                scale: scale
            });

            this.drawImage();
        }

        // TODO: zoom out when pulling the draggable corners

    }, {
        key: 'zoomOutImage',
        value: function zoomOutImage() {
            console.log('zoom out!!!');
        }

        // update the positions and dimensions
        // when the workspace changes

    }, {
        key: 'updateWorkspace',
        value: function updateWorkspace(timestamp) {

            var now = timestamp,
                elapsedTime = now - this.lastTimestamp;

            if (elapsedTime < this.frameRateInterval) {
                return;
            }

            // if enough time has passed to call the next frame
            // reset lastTimeStamp minus 1 frame in ms ( to adjust for frame rates other than 60fps )
            this.lastTimestamp = now - elapsedTime % this.frameRateInterval;

            // cache the container offset width
            this.outerContainer.width = this.imageEditorContainer.offsetWidth;
            this.outerContainer.height = this.imageEditorContainer.offsetHeight;

            var scaleRatio = void 0;

            // if nothing has been touched, size the image to the workspace
            if (!this.croppingArea.touched) {
                // get aspect ratio
                scaleRatio = (0, _utils.calculateAspectRatioFit)(this.imageObj.naturalWidth, this.imageObj.naturalHeight, this.outerContainer.width, this.outerContainer.height, this.image.rotated, EDITOR_GUTTER);

                // apply the initial dimensions to the image      
                this.image.width = scaleRatio.width;
                this.image.height = scaleRatio.height;
                this.image.transform.scale = scaleRatio.ratio;

                // apply them to the cropping area
                this.croppingArea.height = this.image.height;
                this.croppingArea.width = this.image.width;

                // center coords of container
                var outerContainerCenterX = this.outerContainer.width / 2;
                var outerContainerCenterY = this.outerContainer.height / 2;
                var imageHalfWidth = this.croppingArea.width / 2;
                var imageHalfHeight = this.croppingArea.height / 2;
                var newPositionX = outerContainerCenterX - imageHalfWidth;
                var newPositionY = outerContainerCenterY - imageHalfHeight;

                this.croppingArea.position = {
                    top: newPositionY,
                    right: newPositionX + this.image.width,
                    bottom: newPositionY + this.image.height,
                    left: newPositionX
                };

                this.croppingArea.boundary = _extends({}, this.croppingArea.position);

                this.image.transform = Object.assign({}, this.image.transform, {
                    translateX: -1 * (this.imageObj.naturalWidth - this.image.width) / 2 + newPositionX,
                    translateY: -1 * (this.imageObj.naturalHeight - this.image.height) / 2 + newPositionY
                });

                // else the ratio we care about is the resized cropping area 
            } else {
                scaleRatio = (0, _utils.calculateAspectRatioFit)(this.croppingArea.width, this.croppingArea.height, this.outerContainer.width, this.outerContainer.height, this.image.rotated, EDITOR_GUTTER);

                this.image.width = this.image.width * scaleRatio.ratio;
                this.image.height = this.image.height * scaleRatio.ratio;
                this.image.transform.scale = this.image.transform.scale * scaleRatio.ratio;

                this.croppingArea.width = this.croppingArea.scale.width * this.image.width;
                this.croppingArea.height = this.croppingArea.scale.height * this.image.height;
                this.croppingArea.position.top = this.croppingArea.scale.top * this.image.height;
                this.croppingArea.position.left = this.croppingArea.scale.left * this.image.width;
            }

            // TODO: this is not exactly right. 
            // translateX is constantly updated, so we need to apply the correct ratio when scaling
            // haven't worked that out yet  
            // this.image.transform = Object.assign( {}, this.image.transform, {
            //     translateX: this.image.transform.translateX * scaleRatio.ratio,
            //     translateY: this.image.transform.translateY *  scaleRatio.ratio
            // } );

            // set the image transform matrix
            this.transformMatrices = _extends({}, (0, _utils.createTransformMatrix)(this.transformMatrices.transformMatrix, this.transformMatrices.inverseTransformMatrix, this.image.transform.translateX, this.image.transform.translateY, this.image.transform.scale, this.image.transform.radians));

            // apply the matrix to the image 
            this.imageObj.style.transform = 'matrix(    \n          ' + this.transformMatrices.transformMatrix[0] + ', \n          ' + this.transformMatrices.transformMatrix[1] + ', \n          ' + this.transformMatrices.transformMatrix[2] + ', \n          ' + this.transformMatrices.transformMatrix[3] + ', \n          ' + this.transformMatrices.transformMatrix[4] + ', \n          ' + this.transformMatrices.transformMatrix[5] + ')';

            // resize the cropping area
            this.cropAreaContainer.style.left = this.croppingArea.position.left + 'px';
            this.cropAreaContainer.style.top = this.croppingArea.position.top + 'px';
            this.cropAreaContainer.style.width = this.croppingArea.width + 'px';
            this.cropAreaContainer.style.height = this.croppingArea.height + 'px';

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

    }, {
        key: 'drawImage',
        value: function drawImage() {

            var context = this.canvasWorkspace.getContext('2d');
            var rotated = this.image.rotated;

            var scaledCropWidth = Math.floor(this.croppingArea.width / this.image.transform.scale);
            var scaledCropHeight = Math.floor(this.croppingArea.height / this.image.transform.scale);

            this.canvasWorkspace.width = scaledCropWidth;
            this.canvasWorkspace.height = scaledCropHeight;

            context.clearRect(0, 0, scaledCropWidth / 2, scaledCropWidth / 2);

            // TODO
            if (rotated) {
                // origin of the canvas rotate is the middle
                // context.translate( this.canvasWorkspace.width / 2, this.canvasWorkspace.width / 2 );
                // context.rotate( this.image.transform.radians );
            }

            context.save();

            // invert the matrix and get the original coords 
            // from the top, left  of the cropping tool
            var sourceCoords = (0, _utils.getOriginalCoordinatesFromTransformedMatrix)(this.transformMatrices.transformMatrix, this.transformMatrices.inverseTransformMatrix, this.croppingArea.position.left, this.croppingArea.position.top);

            // this is where and how far we want to crop the original image
            var sourceX = sourceCoords.x,
                sourceY = sourceCoords.y,
                sourceWidth = scaledCropWidth,
                sourceHeight = scaledCropHeight;

            // get the destination x, y
            var destX = 0,
                destY = 0,


            // the cropped area
            destWidth = scaledCropWidth,
                destHeight = scaledCropHeight;

            // now draw!    
            context.drawImage(this.imageObj,
            // x, y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
            sourceX, sourceY,
            // w and h of the sub-rectangle of the source image to draw into the destination context.
            sourceWidth, sourceHeight,
            // x, y coordinates in the destination canvas at which to place the top-left corner of the source image.
            destX, destY,
            // w and h of the image in the destination canvas. Changing these values scales the sub-rectangle in the destination context.
            destWidth, destHeight);

            context.restore();

            if (DEBUG) {

                this.onWorkSpaceUpdated({
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
                });
            }
        }
    }, {
        key: 'rotate',
        value: function rotate(degrees) {
            // TODO: check if one of 90/180/270
            this.image.transform.degrees = degrees;
            this.image.transform.radians = (0, _utils.getRadianFromDegrees)(degrees);
            this.image.rotated = !(this.image.transform.degrees % 180 === 0);
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


    }]);

    return ImageEditor;
}();

exports.default = ImageEditor;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.noop = noop;
exports.throttle = throttle;
exports.createElement = createElement;
exports.getOffsetRelativeToParent = getOffsetRelativeToParent;
exports.getCenterPositionRelativeToParent = getCenterPositionRelativeToParent;
exports.getMousePosition = getMousePosition;
exports.calculateAspectRatioFit = calculateAspectRatioFit;
exports.calculateOriginalDimensionsFromScaled = calculateOriginalDimensionsFromScaled;
exports.transformCSS = transformCSS;
exports.getRadianFromDegrees = getRadianFromDegrees;
exports.getDegreesFromRadians = getDegreesFromRadians;
exports.regExp = regExp;
exports.hasClass = hasClass;
exports.removeClass = removeClass;
exports.addClass = addClass;
exports.createTransformMatrix = createTransformMatrix;
exports.getOriginalCoordinatesFromTransformedMatrix = getOriginalCoordinatesFromTransformedMatrix;
/**
 * Create a noop call
 * @returns {Function}
 */
function noop() {
    setTimeout(Function.prototype, 10000);
}

/**
 * Throttle a func call every {threshhold}ms
 * https://developer.mozilla.org/en-US/docs/Web/Events/resize
 * Usage:
    throttle("resize", "optimizedResize");
    // handle event
    window.addEventListener("optimizedResize", function() {
        console.log("Resource conscious resize callback!");
    });
 */
function throttle(type, name) {
    var obj = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

    var running = false;
    var func = function func() {
        if (running) {
            return;
        }
        running = true;
        requestAnimationFrame(function throttledRequestAnimationFrame() {
            obj.dispatchEvent(new CustomEvent(name));
            running = false;
        });
    };
    obj.addEventListener(type, func);
}

/**
 * Creates a simple DOM tree
 * @example
const htmlElementToAppend = createElement({
  tagName: 'span',
  className: 'new-class-name',
  text: 'Spannend!',
  attributes: {
    'title': 'Geil!'
  },
  children: [{ 
      // recursive call to createElement()
  }]
})); // returns => <span class="new-class-name" title="Geil!">Spannend!</span>
 * @typedef {Object} OptionsObject
 * @property {String} tagName
 * @property {String} className
 * @property {String} text
 * @property {Object} attributes
 * @property {Array<options>} children
 * 
 * @param {OptionsObject} options
 * @returns {HTMLElement}
 */
function createElement(options) {

    var element = document.createElement(options.tagName);

    if (options.className) {
        element.className = options.className;
    }

    if (options.attributes) {
        for (var attr in options.attributes) {
            element.setAttribute(attr, options.attributes[attr]);
        }
    }

    if (options.text) {
        element.appendChild(document.createTextNode(options.text));
    }

    if (options.children && options.children.length) {
        var i = 0;
        var childrenLength = options.children.length;
        for (; i < childrenLength; i++) {
            element.appendChild(options.children[i] instanceof window.HTMLElement ? options.children[i] : createElement(options.children[i]));
        }
    }

    return element;
}

/**
 * @example
 const offsetValues = getOffsetRelativeToParent(
    '.child-selector',
    '#parent-selector'
 ); // returns => { top: {n}, right: {n}, bottom: {n}, left: {n} }
 * @typedef {Object} OffsetObject
 * @property {Integer} top
 * @property {Integer} right
 * @property {Integer} bottom
 * @property {Integer} left
 *
 * @param {String} childCssSelector
 * @param {String} parentCssSelector
 * @returns {OffsetObject}
 */
function getOffsetRelativeToParent(childCssSelector, parentCssSelector) {

    // we have to query the DOM elements to get the latest position data
    // in case there has been a CSS transform on the element(s)
    var childElem = document.querySelector(childCssSelector);
    var parentElem = document.querySelector(parentCssSelector);

    if (!childElem || !parentElem) {
        throw new Error('One or more DOM elements can\'t be found with: ' + childCssSelector + ' or ' + parentCssSelector);
    }

    var childRect = childElem.getBoundingClientRect();
    var parentRect = parentElem.getBoundingClientRect();

    return {
        top: childRect.top - parentRect.top,
        right: childRect.right - parentRect.right,
        bottom: childRect.bottom - parentRect.bottom,
        left: childRect.left - parentRect.left
    };
}

/**
 * @example
 const offsetValues = getCenterPositionRelativeToParent(
    HTMLElement,
    HTMLElement.parentNode
 ); // returns => { left: {n}, top: {n} }
 * @typedef {Object} CenterPosition
 * @property {Integer} top
 * @property {Integer} left
 *
 * @param {HTMLElement} childElement
 * @param {HTMLElement} parentElement
 * @returns {CenterPosition}
 */
function getCenterPositionRelativeToParent(childElement, parentElement) {
    return {
        left: parentElement.offsetWidth / 2 - childElement.offsetWidth / 2,
        top: parentElement.offsetHeight / 2 - childElement.offsetHeight / 2
    };
}

/**
 * @example
 const mousePos = getMousePosition(
    DOMEventObject,
    HTMLElement
 ); // returns => { x: {n}, y: {n} }
 * @typedef {Object} PositionObject
 * @property {Integer} x
 * @property {Integer} y
 *
 * @param {DOMEventObject} event
 * @param {HTMLElement} contextElement (optional if you need position relative to parent offset)
 * @returns {PositionObject}
 */
function getMousePosition(event) {
    var contextElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


    var offsetLeft = contextElement ? contextElement.offsetLeft : window.pageXOffset;
    var offsetTop = contextElement ? contextElement.offsetTop : window.pageYOffset;

    var x = (event.pageX || event.touches && event.touches[0].pageX) - offsetLeft;
    var y = (event.pageY || event.touches && event.touches[0].pageY) - offsetTop;

    return {
        x: x,
        y: y
    };
}

/**
 * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 * At the moment we expect rotations of only 90 degrees.
 * This could be improved by always checking if the bounding box of a rotated rectangle fits within the scaled container
 *
 * @param {Number} srcWidth Source area width
 * @param {Number} srcHeight Source area height
 * @param {Number} maxWidth Fittable area maximum available width
 * @param {Number} maxHeight Fittable area maximum available height
 * @param {Boolean} rotated
 * @param {Number} gutter - Optional percentage to increase or decrease the new fit dimensions
 * @return {Object} { width, heigth }
 */
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    var rotated = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var gutter = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;


    var aspectRatio = rotated ? Math.min(maxHeight / srcWidth, maxWidth / srcHeight) : Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    // reduce ratio to gutter percentage amount
    var ratio = aspectRatio * gutter;

    // widths with ratio applied
    var width = Math.floor(srcWidth * ratio);
    var height = Math.floor(srcHeight * ratio);

    return {
        ratio: ratio,
        width: width,
        height: height
    };
}

function calculateOriginalDimensionsFromScaled(scaledWidth, scaledHeight, ratio) {

    // widths with ratio applied
    var width = Math.floor(scaledWidth / ratio);
    var height = Math.floor(scaledHeight / ratio);

    return {
        width: width,
        height: height
    };
}

function transformCSS(element) {
    var translateX = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var translateY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var scale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var radians = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    element.style.transform = 'translate( ' + translateX + 'px, ' + translateY + 'px ) scale( ' + scale + ' ) rotate( ' + radians + 'rad ) translateZ( 0px )';
    return element;
}

// Converts from degrees to radians.
function getRadianFromDegrees(degrees) {
    return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
function getDegreesFromRadians(radians) {
    return radians * 180 / Math.PI;
}

function regExp(name) {
    return new RegExp('(^| )' + name + '( |$)');
}

function hasClass(element, className) {
    if (!('classList' in Element.prototype)) {
        return regExp(name).test(this.element.className);
    }
    return element.classList.contains(className);
}

function removeClass(element, className) {
    if (!('classList' in Element.prototype)) {
        return element.className = element.className.replace(regExp(name), '');
    }
    return element.classList.remove(className);
}

function addClass(element, className) {
    if (!('classList' in Element.prototype)) {
        return element.className += ' ' + className;
    }
    return element.classList.add(className);
}

function createTransformMatrix(transformMatrix, inverseTransformMatrix, x, y, scale, rotate) {

    // create the rotation and scale parts of the transformMatrix
    transformMatrix[3] = transformMatrix[0] = Math.cos(rotate) * scale;
    transformMatrix[2] = -(transformMatrix[1] = Math.sin(rotate) * scale);

    // add the translation
    transformMatrix[4] = x;
    transformMatrix[5] = y;

    // calculate the inverse transformation

    // first get the cross product of x axis and y axis
    var cross = transformMatrix[0] * transformMatrix[3] - transformMatrix[1] * transformMatrix[2];

    // now get the inverted axis
    inverseTransformMatrix[0] = transformMatrix[3] / cross;
    inverseTransformMatrix[1] = -transformMatrix[1] / cross;
    inverseTransformMatrix[2] = -transformMatrix[2] / cross;
    inverseTransformMatrix[3] = transformMatrix[0] / cross;

    return {
        transformMatrix: transformMatrix,
        inverseTransformMatrix: inverseTransformMatrix
    };
};

// params: x, y coords in current, transformed matrix
// returns x,y coords from original, untransformed matrix
function getOriginalCoordinatesFromTransformedMatrix(transformMatrix, inverseTransformMatrix, x, y) {
    var xx, yy;
    xx = x - transformMatrix[4]; // remove the translation
    yy = y - transformMatrix[5]; // by subtracting the origin
    // return the point {x:?,y:?} by multiplying xx,yy by the inverse matrix
    return {
        x: xx * inverseTransformMatrix[0] + yy * inverseTransformMatrix[2],
        y: xx * inverseTransformMatrix[1] + yy * inverseTransformMatrix[3]
    };
}

/***/ })
/******/ ]);
//# sourceMappingURL=main.bundle.js.map