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


var _imageEditor = __webpack_require__(3);

var _imageEditor2 = _interopRequireDefault(_imageEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.imageEditor = new _imageEditor2.default({
    imagePath: 'http://localhost:8888/src/lamda-lamda-lamda.jpg',
    imageAltText: 'A village after dark',
    onWorkSpaceUpdated: onWorkSpaceUpdated
}, document.querySelector('.media-image-editor__canvas-container'));

// DEBUG
function onWorkSpaceUpdated(state) {
    //const croppedImageObj = document.querySelector( '.media-image-editor_debug__preview-container img' );
    //const croppedImageAtag = document.querySelector( '.media-image-editor_debug__preview-container a' );
    //const previewImage = newImageEditorState.canvas.toDataURL('image/jpeg', 0.8 );
    //croppedImageObj.src = previewImage;
    //croppedImageObj.width = newImageEditorState.cropped.width;
    //croppedImageObj.height = newImageEditorState.cropped.height;
    //croppedImageAtag.href = previewImage;

    var template = '\n        <li>\n            <var>App container dimensions</var>\n            <samp>\n                ' + state.appContainer.width + ' x ' + state.appContainer.height + '\n            </samp>\n        </li>\n         <li>\n            <var>Image editor container dimensions</var>\n            <samp>\n                ' + state.imageEditorContainer.width + ' x ' + state.imageEditorContainer.height + '\n            </samp>\n        </li>\n        <li>\n            <var>Original image dimensions</var>\n            <samp>\n                ' + state.image.originalWidth + ' x ' + state.image.originalHeight + '\n            </samp>\n        </li>\n\t\t<li>\n\t\t\t<var>Scaled image dimensions</var>\n\t\t\t<samp>\n\t\t\t\t' + state.image.width + ' x ' + state.image.height + '\n\t\t\t</samp>\n\t\t</li>\n        <li>\n\t\t\t<var>Ratio to original image</var>\n\t\t\t<samp>' + state.image.ratio + '</samp>\n        </li>\n    ';

    document.querySelector('.media-image-editor_debug-values ul').innerHTML = template;
}

/***/ }),
/* 1 */,
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

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(2);

var _canvasWorkspace = __webpack_require__(4);

var _canvasWorkspace2 = _interopRequireDefault(_canvasWorkspace);

var _cropContainer = __webpack_require__(6);

var _cropContainer2 = _interopRequireDefault(_cropContainer);

var _constants = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var ImageEditor = function () {
    function ImageEditor(props, container) {
        _classCallCheck(this, ImageEditor);

        // cache of computed image properties
        this.state = {
            image: {
                width: 0,
                height: 0,
                originalWidth: 0,
                originalHeight: 0,
                rotated: false,
                ratio: 1
            },
            // The image container
            imageEditorContainer: {
                width: 0,
                height: 0
            },

            // The app container
            appContainer: {
                width: 0,
                height: 0
            }
        };

        // this will be an ajax call
        this.imagePath = props.imagePath;

        // append elements
        this.appContainer = container;

        // bind class methods to this
        this.onImageLoaded = this.onImageLoaded.bind(this);
        this.updateWorkspace = this.updateWorkspace.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);

        // the image to manipulate
        this.imageObj = new Image();
        this.imageObj.setAttribute('crossOrigin', 'anonymous');
        this.imageObj.className = _constants.CSS_NAMESPACE + '__image-layer';
        this.imageObj.setAttribute('alt', this.imageAltText || _constants.IMAGE_ALT_TEXT);
        this.imageObj.onload = this.onImageLoaded;
        this.imageObj.onerror = _utils.noop;

        // create elements
        // this is the offPage workspace
        // it takes the transformed image, and calculates the positions and ratios required to create output image
        // https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-pre-render
        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
        this.canvasWorkspace = (0, _utils.createElement)({
            tagName: 'canvas',
            className: _constants.CSS_NAMESPACE + '__canvas-workspace'
        });

        this.canvasWorkspace = new _canvasWorkspace2.default();
        this.cropContainer = new _cropContainer2.default();

        // this is the workspace wrapper
        this.imageEditorWorkspace = (0, _utils.createElement)({
            tagName: 'div',
            className: _constants.CSS_NAMESPACE + '__workspace',
            children: [this.imageObj, this.canvasWorkspace.getElement(), this.cropContainer.getElement()]
        });

        // this is the main container
        this.imageEditorContainer = (0, _utils.createElement)({
            tagName: 'div',
            className: _constants.CSS_NAMESPACE + '__container ' + _constants.CSS_NAMESPACE + '__container-loading',
            children: [this.imageEditorWorkspace]
        });

        // append elements
        var fragment = document.createDocumentFragment();
        fragment.appendChild(this.imageEditorContainer);
        this.appContainer.appendChild(fragment);

        this.frameRateInterval = 1000 / 30;
        this.requestAnimationFrameId = null;
        this.lastTimestamp = null;

        // callbacks
        this.onWorkSpaceUpdated = props.onWorkSpaceUpdated;

        // load image and prepare workspace
        this.imageObj.src = this.imagePath;

        return this;
    }

    _createClass(ImageEditor, [{
        key: 'onImageLoaded',
        value: function onImageLoaded() {
            var _this = this;

            this.state.image.originalWidth = this.imageObj.naturalWidth;
            this.state.image.originalHeight = this.imageObj.naturalHeight;

            // initial update of coordinates
            this.updateWorkspace();

            if (typeof window !== 'undefined') {
                this.lastTimestamp = window.performance.now();
                window.addEventListener('resize', this.onWindowResize);
            }

            // finally, we show the workspace
            // place it on the end of the stack to ensure the update takes place first
            setTimeout(function () {
                (0, _utils.removeClass)(_this.imageEditorContainer, _constants.CSS_NAMESPACE + '__container-loading');
            });
        }
    }, {
        key: 'onWindowResize',
        value: function onWindowResize() {
            this.requestAnimationFrameId = window.requestAnimationFrame(this.updateWorkspace);
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
            this.state.appContainer.width = this.appContainer.offsetWidth;
            this.state.appContainer.height = this.appContainer.offsetHeight;

            var scaleRatio = void 0; // for the image

            // get aspect ratio for the original image based on container size
            scaleRatio = (0, _utils.calculateAspectRatioFit)(this.imageObj.naturalWidth, this.imageObj.naturalHeight, this.state.appContainer.width, this.state.appContainer.height, this.state.image.rotated, 1);

            // apply the initial dimensions to the image
            this.state.image.width = scaleRatio.width;
            this.state.image.height = scaleRatio.height;
            this.state.image.ratio = scaleRatio.ratio;

            this.imageObj.width = this.state.image.width;
            this.imageObj.height = this.state.image.height;

            this.cropContainer.update({
                top: 0,
                left: 0,
                width: this.state.image.width,
                height: this.state.image.height
            });

            // draw to canvas
            // TODO: we don't actually have to do this at all until the final save
            this.canvasWorkspace.drawImage(this.imageObj, this.state.appContainer.width, this.state.appContainer.height, this.state.image.width, this.state.image.height);

            if (_constants.DEBUG) {
                this.onWorkSpaceUpdated(this.state);
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


    }]);

    return ImageEditor;
}();

exports.default = ImageEditor;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = __webpack_require__(5);

var _utils = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CanvasWorkspace = function () {
	function CanvasWorkspace() {
		_classCallCheck(this, CanvasWorkspace);

		this.element = (0, _utils.createElement)({
			tagName: 'canvas',
			className: _constants.CSS_NAMESPACE + "__canvas-workspace"
		});
	}

	_createClass(CanvasWorkspace, [{
		key: "getElement",
		value: function getElement() {
			return this.element;
		}

		// TODO: at the moment we're calling this after every image transformation
		// in fact, because we're keeping track of the transforms, we don't need to call it at all until the end
		// it's just for the preview

	}, {
		key: "drawImage",
		value: function drawImage(imageObj, canvasWidth, canvasHeight, imageWidth, imageHeight) {

			this.element.width = canvasWidth;
			this.element.height = canvasHeight;

			var context = this.element.getContext('2d');
			context.clearRect(0, 0, this.element.width, this.element.height);
			context.save();

			// now draw!
			context.drawImage(imageObj,
			// x, y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
			0, 0,
			// w and h of the sub-rectangle of the source image to draw into the destination context.
			imageWidth, imageHeight
			/*            // x, y coordinates in the destination canvas at which to place the top-left corner of the source image.
   			0, 0,
   			// w and h of the image in the destination canvas. Changing these values scales the sub-rectangle in the destination context.
   			this.state.image.width, this.state.image.height,*/
			);

			context.restore();
		}
	}]);

	return CanvasWorkspace;
}();

exports.default = CanvasWorkspace;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var CSS_NAMESPACE = exports.CSS_NAMESPACE = 'image-editor';
var IMAGE_ALT_TEXT = exports.IMAGE_ALT_TEXT = 'Image being edited';
var ACTIVE_CLASS = exports.ACTIVE_CLASS = 'image-editor__active';
var EDITOR_GUTTER = exports.EDITOR_GUTTER = .7;
var DEBUG = exports.DEBUG = true;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(2);

var _constants = __webpack_require__(5);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CropContainer = function () {
	function CropContainer() {
		_classCallCheck(this, CropContainer);

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
			height: 0
		};
		this.element = (0, _utils.createElement)({
			tagName: 'div',
			className: _constants.CSS_NAMESPACE + '__crop-container',
			'aria-label': 'Cropping area',
			children: [{
				tagName: 'div',
				className: 'image-editor__draggable-corner ' + _constants.CSS_NAMESPACE + '__draggable-corner-nw'
			}, {
				tagName: 'div',
				className: 'image-editor__draggable-corner ' + _constants.CSS_NAMESPACE + '__draggable-corner-ne'
			}, {
				tagName: 'div',
				className: 'image-editor__draggable-corner ' + _constants.CSS_NAMESPACE + '__draggable-corner-sw'
			}, {
				tagName: 'div',
				className: 'image-editor__draggable-corner ' + _constants.CSS_NAMESPACE + '__draggable-corner-se'
			}, {
				tagName: 'span',
				className: 'image-editor__guide ' + _constants.CSS_NAMESPACE + '__guide-horiz-top'
			}, {
				tagName: 'span',
				className: 'image-editor__guide ' + _constants.CSS_NAMESPACE + '__guide-horiz-bottom'
			}]
		});
	}

	_createClass(CropContainer, [{
		key: 'getElement',
		value: function getElement() {
			return this.element;
		}
	}, {
		key: 'getState',
		value: function getState() {
			return this.state;
		}
	}, {
		key: 'update',
		value: function update(_ref) {
			var top = _ref.top,
			    left = _ref.left,
			    width = _ref.width,
			    height = _ref.height;

			/*		this.element.width = anotherScaleRatio.width > this.image.width ? this.image.width : anotherScaleRatio.width;
   		this.element.height = anotherScaleRatio.height > this.image.height ? this.image.height : anotherScaleRatio.height;	*/

			this.element.width = width;
			this.element.height = height;

			this.element.style.left = left + 'px';
			this.element.style.top = top + 'px';
			this.element.style.width = width + 'px';
			this.element.style.height = height + 'px';

			this.state = _extends({}, this.state, {
				width: width,
				height: height,
				top: top,
				left: left
			});
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
			(0, _utils.addClass)(this.cropAreaContainer, _constants.ACTIVE_CLASS);
			// if we've hit a drag handle, stop propagation
			// and throw the event to the crop resize setup method
			if ((0, _utils.hasClass)(event.target, _constants.CSS_NAMESPACE + '__draggable-corner')) {
				event.stopImmediatePropagation();
				// remove css transitions to avoid mouse delay
				// this.cropAreaContainer.style.transition = 'unset';
				// this.imageObj.style.transition = 'unset';
				// cache the event
				this.cropEvent = event;
				this.onStartCropResize(event);
				return false;
			}
			// otherwise we're free to drag the image
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

			if (this.cropEvent.target.classList.contains(_constants.CSS_NAMESPACE + '__draggable-corner-se')) {

				// origin of image scale should be set to the opposite corner of this handle
				this.image.transform.origin = ['left', 'top'];

				width = this.mousePos.x - this.croppingArea.position.left;
				height = this.mousePos.y - this.croppingArea.position.top;
				left = this.croppingArea.position.left;
				top = this.croppingArea.position.top;
			}

			if (this.cropEvent.target.classList.contains(_constants.CSS_NAMESPACE + '__draggable-corner-sw')) {

				// origin of image scale should be set to the opposite corner of this handle
				this.image.transform.origin = ['right', 'top'];

				width = this.croppingArea.width - (this.mousePos.x - this.croppingArea.position.left);
				left = this.mousePos.x;
				height = this.mousePos.y - this.croppingArea.position.top;
				top = this.croppingArea.position.top;
			}

			if (this.cropEvent.target.classList.contains(_constants.CSS_NAMESPACE + '__draggable-corner-nw')) {

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

			if (this.cropEvent.target.classList.contains(_constants.CSS_NAMESPACE + '__draggable-corner-ne')) {

				// origin of image scale should be set to the opposite corner of this handle
				this.image.transform.origin = ['left', 'bottom'];

				width = this.mousePos.x - this.croppingArea.position.left;
				height = this.croppingArea.height - (this.mousePos.y - this.croppingArea.position.top);
				left = this.croppingArea.position.left;
				top = this.mousePos.y;
				if (this.constrain || event.shiftKey) {
					top = this.mousePos.y - (width / this.image.width * this.image.height - height);
				}
			}

			// all this is about ensuring there is no 'sticking' at the extremes
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
			this.cropActionTriggered = true;

			this.onWorkSpaceUpdated({
				image: _extends({}, this.image),
				cropped: _extends({}, this.croppingArea),
				original: {
					width: this.imageObj.naturalWidth,
					height: this.imageObj.naturalHeight
				}
			});

			return false;
		}
	}, {
		key: 'onStopCropResize',
		value: function onStopCropResize() {

			this.dragging = false;
			this.mousePos = null;
			this.cropEvent = null;
			(0, _utils.removeClass)(this.cropAreaContainer, _constants.ACTIVE_CLASS);
			document.removeEventListener('mousemove', this.onCropResize);
			document.removeEventListener('mouseup', this.onStopCropResize);
			document.removeEventListener('touchmove', this.onCropResize);
			document.removeEventListener('touchend', this.onStopCropResize);

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
	}]);

	return CropContainer;
}();

exports.default = CropContainer;

/***/ })
/******/ ]);
//# sourceMappingURL=main.bundle.js.map