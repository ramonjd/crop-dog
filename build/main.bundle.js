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
    imagePath: 'http://localhost:8888/src/amsler.jpg',
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

    var template = '\n        <li>\n            <var>App container dimensions</var>\n            <samp>\n                ' + state.appContainer.width + ' x ' + state.appContainer.height + '\n            </samp>\n        </li>\n        <li>\n            <var>Original image dimensions</var>\n            <samp>\n                ' + state.image.originalWidth + ' x ' + state.image.originalHeight + '\n            </samp>\n        </li>\n\t\t<li>\n\t\t\t<var>Scaled image dimensions</var>\n\t\t\t<samp>\n\t\t\t\t' + state.image.width + ' x ' + state.image.height + '\n\t\t\t</samp>\n\t\t</li>\n        <li>\n\t\t\t<var>Ratio to original image</var>\n\t\t\t<samp>' + state.image.ratio + '</samp>\n        </li>\n         <li>\n            <var>Image coordinates relative to window</var>\n            <samp>\n                left: ' + state.image.left + ', top:  ' + state.image.top + '\n            </samp>\n        </li>\n         <li>\n            <var>Crop container height and width</var>\n            <samp>\n                ' + state.cropContainer.width + ' x ' + state.cropContainer.height + '\n            </samp>\n        </li>\n         <li>\n            <var>Crop container coordinates relative to window</var>\n            <samp>\n                left: ' + state.cropContainer.left + ', top:  ' + state.cropContainer.top + ',\n                right: ' + state.cropContainer.right + ', bottom:  ' + state.cropContainer.bottom + '\n            </samp>\n        </li>\n    ';

    document.querySelector('.media-image-editor_debug-values ul').innerHTML = template;
    document.querySelector('.media-image-editor_debug-values ul').innerHTML = template;
}

/***/ }),
/* 1 */
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
/* 2 */
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rematrix = __webpack_require__(4);

var Rematrix = _interopRequireWildcard(_rematrix);

var _utils = __webpack_require__(1);

var _canvasWorkspace = __webpack_require__(5);

var _canvasWorkspace2 = _interopRequireDefault(_canvasWorkspace);

var _cropContainer = __webpack_require__(6);

var _cropContainer2 = _interopRequireDefault(_cropContainer);

var _constants = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
		var _this = this;

		_classCallCheck(this, ImageEditor);

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
				originY: 0
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
			},
			// center of app container
			center: {
				x: 0,
				y: 0
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
		this.cropContainer = new _cropContainer2.default({
			appContainer: this.appContainer,
			imageObj: this.imageObj,
			canvasWorkspace: this.canvasWorkspace,
			onWorkSpaceUpdated: function onWorkSpaceUpdated(croppingContainerState) {
				if (_constants.DEBUG) {
					props.onWorkSpaceUpdated(_extends({}, _this.state, {
						cropContainer: croppingContainerState
					}));
				}
			}
		});

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
			var _this2 = this;

			this.state.image.originalWidth = this.imageObj.naturalWidth;
			this.state.image.originalHeight = this.imageObj.naturalHeight;
			this.state.appContainer.width = this.appContainer.offsetWidth;
			this.state.appContainer.height = this.appContainer.offsetHeight;

			// initial update of coordinates
			this.updateWorkspace();

			if (typeof window !== 'undefined') {
				this.lastTimestamp = window.performance.now();
				window.addEventListener('resize', this.onWindowResize);
			}

			// finally, we show the workspace
			// place it on the end of the stack to ensure the update takes place first
			setTimeout(function () {
				(0, _utils.removeClass)(_this2.imageEditorContainer, _constants.CSS_NAMESPACE + '__container-loading');
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

			// get aspect ratio for the original image based on container size
			var imageAspectRatio = (0, _utils.calculateAspectRatioFit)(this.imageObj.naturalWidth, this.imageObj.naturalHeight, this.appContainer.offsetWidth, this.appContainer.offsetHeight, this.state.image.rotated, 1);

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
			var appContainerCenterX = this.appContainer.offsetWidth / 2;
			var appContainerCenterY = this.appContainer.offsetHeight / 2;
			var imageCenterTranslateX = appContainerCenterX - this.state.image.width / 2;
			var imageCenterTranslateY = appContainerCenterY - this.state.image.height / 2;

			var imageObjStyle = getComputedStyle(this.imageObj).transform;
			var transform = Rematrix.parse(imageObjStyle);
			var r1 = Rematrix.translateX(imageCenterTranslateX - this.state.image.originX);
			var r2 = Rematrix.translateY(imageCenterTranslateY - this.state.image.originY);
			//const r3 = Rematrix.scale( cropContainerAspectRatio.ratio );
			var product = [transform, r1, r2].reduce(Rematrix.multiply);
			this.imageObj.style.transform = Rematrix.toString(product);
			this.state.image.originX = imageCenterTranslateX;
			this.state.image.originY = imageCenterTranslateY;
			this.state.image.left = appContainerCenterX - this.state.image.width / 2;
			this.state.image.top = appContainerCenterY - this.state.image.height / 2;

			/*
   	Crop container:
   	*/
			// now we want the scale ratio for the cropping area
			// so we get the dimensions of the scaled image
			// we're scaling the image based on the container dimensions
			// we want to the crop container to fit the outerContainer, but be no bigger than the image
			var cropContainerState = this.cropContainer.getState();
			var cropContainerWidth = cropContainerState.initialized ? cropContainerState.width : this.state.image.width;
			var cropContainerHeight = cropContainerState.initialized ? cropContainerState.height : this.state.image.height;
			var cropContainerLeft = cropContainerState.initialized ? cropContainerState.left : this.state.image.left;
			var cropContainerTop = cropContainerState.initialized ? cropContainerState.top : this.state.image.top;

			this.cropContainer.update({
				left: cropContainerLeft,
				top: cropContainerTop,
				width: cropContainerWidth,
				height: cropContainerHeight,
				maxWidth: this.state.image.height,
				maxHeight: this.state.image.height,
				imageCoords: {
					left: this.state.image.left,
					top: this.state.image.top,
					right: this.state.image.left + this.state.image.width,
					bottom: this.state.image.top + this.state.image.height
				}

			});

			// cache the container offset width
			this.state.appContainer.width = this.appContainer.offsetWidth;
			this.state.appContainer.height = this.appContainer.offsetHeight;
			/*
   	Canvas update:
   	*/
			// TODO: we don't actually have to do this at all until the final save
			this.canvasWorkspace.drawImage({
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
				drawY: cropContainerTop
			});

			if (_constants.DEBUG) {
				this.onWorkSpaceUpdated(_extends({}, this.state, {
					cropContainer: this.cropContainer.getState()
				}));
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
/*! @license Rematrix v0.3.0

	Copyright 2018 Julian Lloyd.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/
/**
 * @module Rematrix
 */

/**
 * Transformation matrices in the browser come in two flavors:
 *
 *  - `matrix` using 6 values (short)
 *  - `matrix3d` using 16 values (long)
 *
 * This utility follows this [conversion guide](https://goo.gl/EJlUQ1)
 * to expand short form matrices to their equivalent long form.
 *
 * @param  {array} source - Accepts both short and long form matrices.
 * @return {array}
 */
function format(source) {
	if (source.constructor !== Array) {
		throw new TypeError('Expected array.');
	}
	if (source.length === 16) {
		return source;
	}
	if (source.length === 6) {
		var matrix = identity();
		matrix[0] = source[0];
		matrix[1] = source[1];
		matrix[4] = source[2];
		matrix[5] = source[3];
		matrix[12] = source[4];
		matrix[13] = source[5];
		return matrix;
	}
	throw new RangeError('Expected array with either 6 or 16 values.');
}

/**
 * Returns a matrix representing no transformation. The product of any matrix
 * multiplied by the identity matrix will be the original matrix.
 *
 * > **Tip:** Similar to how `5 * 1 === 5`, where `1` is the identity.
 *
 * @return {array}
 */
function identity() {
	var matrix = [];
	for (var i = 0; i < 16; i++) {
		i % 5 == 0 ? matrix.push(1) : matrix.push(0);
	}
	return matrix;
}

/**
 * Returns a matrix describing the inverse transformation of the source
 * matrix. The product of any matrix multiplied by its inverse will be the
 * identity matrix.
 *
 * > **Tip:** Similar to how `5 * (1/5) === 1`, where `1/5` is the inverse.
 *
 * @param  {array} source - Accepts both short and long form matrices.
 * @return {array}
 */
function inverse(source) {
	var m = format(source);

	var s0 = m[0] * m[5] - m[4] * m[1];
	var s1 = m[0] * m[6] - m[4] * m[2];
	var s2 = m[0] * m[7] - m[4] * m[3];
	var s3 = m[1] * m[6] - m[5] * m[2];
	var s4 = m[1] * m[7] - m[5] * m[3];
	var s5 = m[2] * m[7] - m[6] * m[3];

	var c5 = m[10] * m[15] - m[14] * m[11];
	var c4 = m[9] * m[15] - m[13] * m[11];
	var c3 = m[9] * m[14] - m[13] * m[10];
	var c2 = m[8] * m[15] - m[12] * m[11];
	var c1 = m[8] * m[14] - m[12] * m[10];
	var c0 = m[8] * m[13] - m[12] * m[9];

	var determinant = 1 / (s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0);

	if (isNaN(determinant) || determinant === Infinity) {
		throw new Error('Inverse determinant attempted to divide by zero.');
	}

	return [(m[5] * c5 - m[6] * c4 + m[7] * c3) * determinant, (-m[1] * c5 + m[2] * c4 - m[3] * c3) * determinant, (m[13] * s5 - m[14] * s4 + m[15] * s3) * determinant, (-m[9] * s5 + m[10] * s4 - m[11] * s3) * determinant, (-m[4] * c5 + m[6] * c2 - m[7] * c1) * determinant, (m[0] * c5 - m[2] * c2 + m[3] * c1) * determinant, (-m[12] * s5 + m[14] * s2 - m[15] * s1) * determinant, (m[8] * s5 - m[10] * s2 + m[11] * s1) * determinant, (m[4] * c4 - m[5] * c2 + m[7] * c0) * determinant, (-m[0] * c4 + m[1] * c2 - m[3] * c0) * determinant, (m[12] * s4 - m[13] * s2 + m[15] * s0) * determinant, (-m[8] * s4 + m[9] * s2 - m[11] * s0) * determinant, (-m[4] * c3 + m[5] * c1 - m[6] * c0) * determinant, (m[0] * c3 - m[1] * c1 + m[2] * c0) * determinant, (-m[12] * s3 + m[13] * s1 - m[14] * s0) * determinant, (m[8] * s3 - m[9] * s1 + m[10] * s0) * determinant];
}

/**
 * Returns a 4x4 matrix describing the combined transformations
 * of both arguments.
 *
 * > **Note:** Order is very important. For example, rotating 45°
 * along the Z-axis, followed by translating 500 pixels along the
 * Y-axis... is not the same as translating 500 pixels along the
 * Y-axis, followed by rotating 45° along on the Z-axis.
 *
 * @param  {array} m - Accepts both short and long form matrices.
 * @param  {array} x - Accepts both short and long form matrices.
 * @return {array}
 */
function multiply(m, x) {
	var fm = format(m);
	var fx = format(x);
	var product = [];

	for (var i = 0; i < 4; i++) {
		var row = [fm[i], fm[i + 4], fm[i + 8], fm[i + 12]];
		for (var j = 0; j < 4; j++) {
			var k = j * 4;
			var col = [fx[k], fx[k + 1], fx[k + 2], fx[k + 3]];
			var result = row[0] * col[0] + row[1] * col[1] + row[2] * col[2] + row[3] * col[3];

			product[i + k] = result;
		}
	}

	return product;
}

/**
 * Attempts to return a 4x4 matrix describing the CSS transform
 * matrix passed in, but will return the identity matrix as a
 * fallback.
 *
 * > **Tip:** This method is used to convert a CSS matrix (retrieved as a
 * `string` from computed styles) to its equivalent array format.
 *
 * @param  {string} source - `matrix` or `matrix3d` CSS Transform value.
 * @return {array}
 */
function parse(source) {
	if (typeof source === 'string') {
		var match = source.match(/matrix(3d)?\(([^)]+)\)/);
		if (match) {
			var raw = match[2].split(', ').map(parseFloat);
			return format(raw);
		}
	}
	return identity();
}

/**
 * Returns a 4x4 matrix describing Z-axis rotation.
 *
 * > **Tip:** This is just an alias for `Rematrix.rotateZ` for parity with CSS
 *
 * @param  {number} angle - Measured in degrees.
 * @return {array}
 */
function rotate(angle) {
	return rotateZ(angle);
}

/**
 * Returns a 4x4 matrix describing X-axis rotation.
 *
 * @param  {number} angle - Measured in degrees.
 * @return {array}
 */
function rotateX(angle) {
	var theta = Math.PI / 180 * angle;
	var matrix = identity();

	matrix[5] = matrix[10] = Math.cos(theta);
	matrix[6] = matrix[9] = Math.sin(theta);
	matrix[9] *= -1;

	return matrix;
}

/**
 * Returns a 4x4 matrix describing Y-axis rotation.
 *
 * @param  {number} angle - Measured in degrees.
 * @return {array}
 */
function rotateY(angle) {
	var theta = Math.PI / 180 * angle;
	var matrix = identity();

	matrix[0] = matrix[10] = Math.cos(theta);
	matrix[2] = matrix[8] = Math.sin(theta);
	matrix[2] *= -1;

	return matrix;
}

/**
 * Returns a 4x4 matrix describing Z-axis rotation.
 *
 * @param  {number} angle - Measured in degrees.
 * @return {array}
 */
function rotateZ(angle) {
	var theta = Math.PI / 180 * angle;
	var matrix = identity();

	matrix[0] = matrix[5] = Math.cos(theta);
	matrix[1] = matrix[4] = Math.sin(theta);
	matrix[4] *= -1;

	return matrix;
}

/**
 * Returns a 4x4 matrix describing 2D scaling. The first argument
 * is used for both X and Y-axis scaling, unless an optional
 * second argument is provided to explicitly define Y-axis scaling.
 *
 * @param  {number} scalar    - Decimal multiplier.
 * @param  {number} [scalarY] - Decimal multiplier.
 * @return {array}
 */
function scale(scalar, scalarY) {
	var matrix = identity();

	matrix[0] = scalar;
	matrix[5] = typeof scalarY === 'number' ? scalarY : scalar;

	return matrix;
}

/**
 * Returns a 4x4 matrix describing X-axis scaling.
 *
 * @param  {number} scalar - Decimal multiplier.
 * @return {array}
 */
function scaleX(scalar) {
	var matrix = identity();
	matrix[0] = scalar;
	return matrix;
}

/**
 * Returns a 4x4 matrix describing Y-axis scaling.
 *
 * @param  {number} scalar - Decimal multiplier.
 * @return {array}
 */
function scaleY(scalar) {
	var matrix = identity();
	matrix[5] = scalar;
	return matrix;
}

/**
 * Returns a 4x4 matrix describing Z-axis scaling.
 *
 * @param  {number} scalar - Decimal multiplier.
 * @return {array}
 */
function scaleZ(scalar) {
	var matrix = identity();
	matrix[10] = scalar;
	return matrix;
}

/**
 * Returns a 4x4 matrix describing shear. The first argument
 * defines X-axis shearing, and an optional second argument
 * defines Y-axis shearing.
 *
 * @param  {number} angleX   - Measured in degrees.
 * @param  {number} [angleY] - Measured in degrees.
 * @return {array}
 */
function skew(angleX, angleY) {
	var thetaX = Math.PI / 180 * angleX;
	var matrix = identity();

	matrix[4] = Math.tan(thetaX);

	if (angleY) {
		var thetaY = Math.PI / 180 * angleY;
		matrix[1] = Math.tan(thetaY);
	}

	return matrix;
}

/**
 * Returns a 4x4 matrix describing X-axis shear.
 *
 * @param  {number} angle - Measured in degrees.
 * @return {array}
 */
function skewX(angle) {
	var theta = Math.PI / 180 * angle;
	var matrix = identity();

	matrix[4] = Math.tan(theta);

	return matrix;
}

/**
 * Returns a 4x4 matrix describing Y-axis shear.
 *
 * @param  {number} angle - Measured in degrees
 * @return {array}
 */
function skewY(angle) {
	var theta = Math.PI / 180 * angle;
	var matrix = identity();

	matrix[1] = Math.tan(theta);

	return matrix;
}

/**
 * Returns a CSS Transform property value equivalent to the source matrix.
 *
 * @param  {array} source - Accepts both short and long form matrices.
 * @return {string}
 */
function toString(source) {
	return "matrix3d(" + format(source).join(', ') + ")";
}

/**
 * Returns a 4x4 matrix describing 2D translation. The first
 * argument defines X-axis translation, and an optional second
 * argument defines Y-axis translation.
 *
 * @param  {number} distanceX   - Measured in pixels.
 * @param  {number} [distanceY] - Measured in pixels.
 * @return {array}
 */
function translate(distanceX, distanceY) {
	var matrix = identity();
	matrix[12] = distanceX;

	if (distanceY) {
		matrix[13] = distanceY;
	}

	return matrix;
}

/**
 * Returns a 4x4 matrix describing X-axis translation.
 *
 * @param  {number} distance - Measured in pixels.
 * @return {array}
 */
function translateX(distance) {
	var matrix = identity();
	matrix[12] = distance;
	return matrix;
}

/**
 * Returns a 4x4 matrix describing Y-axis translation.
 *
 * @param  {number} distance - Measured in pixels.
 * @return {array}
 */
function translateY(distance) {
	var matrix = identity();
	matrix[13] = distance;
	return matrix;
}

/**
 * Returns a 4x4 matrix describing Z-axis translation.
 *
 * @param  {number} distance - Measured in pixels.
 * @return {array}
 */
function translateZ(distance) {
	var matrix = identity();
	matrix[14] = distance;
	return matrix;
}

exports.format = format;
exports.identity = identity;
exports.inverse = inverse;
exports.multiply = multiply;
exports.parse = parse;
exports.rotate = rotate;
exports.rotateX = rotateX;
exports.rotateY = rotateY;
exports.rotateZ = rotateZ;
exports.scale = scale;
exports.scaleX = scaleX;
exports.scaleY = scaleY;
exports.scaleZ = scaleZ;
exports.skew = skew;
exports.skewX = skewX;
exports.skewY = skewY;
exports.toString = toString;
exports.translate = translate;
exports.translateX = translateX;
exports.translateY = translateY;
exports.translateZ = translateZ;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = __webpack_require__(2);

var _utils = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CanvasWorkspace = function () {
	function CanvasWorkspace() {
		_classCallCheck(this, CanvasWorkspace);

		this.element = (0, _utils.createElement)({
			tagName: 'canvas',
			className: _constants.CSS_NAMESPACE + '__canvas-workspace'
		});
	}

	_createClass(CanvasWorkspace, [{
		key: 'getElement',
		value: function getElement() {
			return this.element;
		}

		// TODO: at the moment we're calling this after every image transformation
		// in fact, because we're keeping track of the transforms, we don't need to call it at all until the end
		// it's just for the preview

	}, {
		key: 'drawImage',
		value: function drawImage(_ref) {
			var imageObj = _ref.imageObj,
			    canvasWidth = _ref.canvasWidth,
			    canvasHeight = _ref.canvasHeight,
			    imageX = _ref.imageX,
			    imageY = _ref.imageY,
			    imageWidth = _ref.imageWidth,
			    imageHeight = _ref.imageHeight,
			    drawX = _ref.drawX,
			    drawY = _ref.drawY,
			    drawWidth = _ref.drawWidth,
			    drawHeight = _ref.drawHeight;


			this.element.width = canvasWidth;
			this.element.height = canvasHeight;

			var context = this.element.getContext('2d');
			context.clearRect(0, 0, this.element.width, this.element.height);
			context.save();

			// now draw!
			context.drawImage(imageObj,
			// x, y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
			imageX, imageY,
			// w and h of the sub-rectangle of the source image to draw into the destination context.
			imageWidth, imageHeight,
			// x, y coordinates in the destination canvas at which to place the top-left corner of the source image.
			drawX, drawY,
			// w and h of the image in the destination canvas. Changing these values scales the sub-rectangle in the destination context.
			drawWidth, drawHeight);

			context.restore();
		}
	}]);

	return CanvasWorkspace;
}();

exports.default = CanvasWorkspace;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(1);

var _constants = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CropContainer = function () {
	function CropContainer(_ref) {
		var appContainer = _ref.appContainer,
		    imageObj = _ref.imageObj,
		    canvasWorkspace = _ref.canvasWorkspace,
		    onWorkSpaceUpdated = _ref.onWorkSpaceUpdated;

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
			initialized: false
		};

		this.appContainer = appContainer;
		this.imageObj = imageObj;
		this.canvasWorkspace = canvasWorkspace;

		// callbacks
		this.onWorkSpaceUpdated = onWorkSpaceUpdated;

		this.onStartDragCropArea = this.onStartDragCropArea.bind(this);
		// this.onDragCropArea = this.onDragCropArea.bind( this );
		// this.onStopDragCropArea = this.onStopDragCropArea.bind( this );
		this.onStartCropResize = this.onStartCropResize.bind(this);
		this.onCropResize = this.onCropResize.bind(this);
		this.onStopCropResize = this.onStopCropResize.bind(this);
		this.dragging = false;
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

		// add event listeners for dragging
		// TODO: add helper for multiple event handlers
		this.element.addEventListener('mousedown', this.onStartDragCropArea);
		this.element.addEventListener('touchstart', this.onStartDragCropArea, { passive: true });
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
		value: function update(_ref2) {
			var top = _ref2.top,
			    left = _ref2.left,
			    width = _ref2.width,
			    height = _ref2.height,
			    maxWidth = _ref2.maxWidth,
			    maxHeight = _ref2.maxHeight,
			    imageCoords = _ref2.imageCoords;

			/*		this.element.width = anotherScaleRatio.width > this.imageObj.width ? this.imageObj.width : anotherScaleRatio.width;
   		this.element.height = anotherScaleRatio.height > this.imageObj.height ? this.imageObj.height : anotherScaleRatio.height;	*/

			// console.log( 'update( { top, left, width, height } )', top, left, width, height );

			this.element.width = width;
			this.element.height = height;

			this.element.style.left = left + 'px';
			this.element.style.top = top + 'px';
			this.element.style.width = width + 'px';
			this.element.style.height = height + 'px';

			this.state = _extends({}, this.state, {
				maxDimensions: {
					width: maxWidth,
					height: maxHeight
				},
				width: width,
				height: height,
				top: top,
				left: left,
				imageCoords: imageCoords
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
			(0, _utils.addClass)(this.element, _constants.ACTIVE_CLASS);
			// if we've hit a drag handle, stop propagation
			// and throw the event to the crop resize setup method
			if ((0, _utils.hasClass)(event.target, _constants.CSS_NAMESPACE + '__draggable-corner')) {
				event.stopImmediatePropagation();
				// remove css transitions to avoid mouse delay
				// this.cropAreaContainer.style.transition = 'unset';
				// this.image.style.transition = 'unset';
				// cache the event
				this.cropEvent = event;
				this.onStartCropResize(event);
				return false;
			}
			// otherwise we're free to drag the image
			// TODO abstract this out to a separate method
			// this.dragging = true;
			// this.mousePos = getMousePosition( event, this.appContainer );
			// this.state.left = this.mousePos.x;
			// this.state.top = this.mousePos.y;

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
			this.mousePos = (0, _utils.getMousePosition)(event, this.appContainer);
			// first check the mouse boundaries
			// now calculate the new dimensions of the crop area
			var width = void 0,
			    height = void 0,
			    left = void 0,
			    top = void 0,
			    right = void 0,
			    bottom = void 0,
			    imageX = void 0,
			    imageY = void 0,
			    drawX = void 0,
			    drawY = void 0,
			    drawWidth = void 0,
			    drawHeight = void 0,
			    imageWidth = void 0,
			    imageHeight = void 0,
			    ignoreResize = void 0;

			var imageAspectRatio = (0, _utils.calculateAspectRatioFit)(this.imageObj.naturalWidth, this.imageObj.naturalHeight, this.appContainer.offsetWidth, this.appContainer.offsetHeight, false, 1);

			if (this.mousePos.x <= this.state.imageCoords.left || this.mousePos.x >= this.state.imageCoords.right || this.mousePos.y <= this.state.imageCoords.top || this.mousePos.y >= this.state.imageCoords.bottom) {
				ignoreResize = true;
			}

			if (this.cropEvent.target.classList.contains(_constants.CSS_NAMESPACE + '__draggable-corner-se')) {
				console.log('se drag', '');
				// origin of image scale should be set to the opposite corner of this handle
				//this.image.transform.origin = [ 'left', 'top' ];

				width = this.mousePos.x - this.state.left;
				height = this.mousePos.y - this.state.top;
				left = this.state.left;
				top = this.state.top;
				right = left + width;
				bottom = top + height;

				if (right >= this.state.imageCoords.right) {
					width = this.state.imageCoords.right - left;
				}
				if (bottom >= this.state.imageCoords.bottom) {
					height = this.state.imageCoords.bottom - top;
				}
				if (this.constrain || event.shiftKey) {
					height = width / this.imageObj.width * this.imageObj.height;
					width = height / this.imageObj.height * this.imageObj.width;
					// left = this.state.left + this.state.width - width;

					bottom = bottom <= this.state.imageCoords.bottom ? this.state.imageCoords.bottom : this.mousePos.y;
				}
			}

			if (this.cropEvent.target.classList.contains(_constants.CSS_NAMESPACE + '__draggable-corner-sw')) {
				console.log('sw drag', '');

				// origin of image scale should be set to the opposite corner of this handle
				//this.image.transform.origin = [ 'right', 'top' ];


				width = this.state.width - (this.mousePos.x - this.state.left);
				left = this.mousePos.x;
				height = this.mousePos.y - this.state.top;
				top = this.state.top;
				bottom = top + height;

				if (width <= this.state.minDimensions.width && left < this.state.imageCoords.right - this.state.minDimensions.width) {
					left = this.state.left + this.state.width - this.state.minDimensions.width;
					width = this.state.minDimensions.width;
				}

				if (left >= this.state.imageCoords.right - this.state.minDimensions.width) {
					left = this.state.left + this.state.width - this.state.minDimensions.width;
				}

				if (bottom >= this.state.imageCoords.bottom) {
					height = this.state.imageCoords.bottom - top;
				}

				if (left <= this.state.imageCoords.left) {
					left = this.state.imageCoords.left;
					width = this.state.width + (this.state.left - this.state.imageCoords.left);
				}
				if (this.constrain || event.shiftKey) {
					height = width / this.imageObj.width * this.imageObj.height;
					width = height / this.imageObj.height * this.imageObj.width;
					left = this.state.left + this.state.width - width;
					bottom = bottom <= this.state.imageCoords.bottom ? this.state.imageCoords.bottom : this.mousePos.y;
				}
			}

			if (this.cropEvent.target.classList.contains(_constants.CSS_NAMESPACE + '__draggable-corner-nw')) {
				console.log('nw drag', '');
				// origin of image scale should be set to the opposite corner of this handle
				//this.image.transform.origin = [ 'right', 'bottom' ];

				width = this.state.width - (this.mousePos.x - this.state.left);
				height = this.state.height - (this.mousePos.y - this.state.top);
				left = this.mousePos.x;
				top = this.mousePos.y;

				if (width <= this.state.minDimensions.width && left < this.state.imageCoords.right - this.state.minDimensions.width) {
					left = this.state.left + this.state.width - this.state.minDimensions.width;
					width = this.state.minDimensions.width;
				}

				if (left >= this.state.imageCoords.right - this.state.minDimensions.width) {
					left = this.state.left + this.state.width - this.state.minDimensions.width;
				}

				if (left <= this.state.imageCoords.left) {
					left = this.state.imageCoords.left;
					width = this.state.width + (this.state.left - this.state.imageCoords.left);
				}

				if (top <= this.state.imageCoords.top) {
					top = this.state.imageCoords.top;
					height = this.state.bottom - top;
				}

				if (height <= this.state.minDimensions.height && top > this.state.imageCoords.top) {
					height = this.state.minDimensions.height;
					top = this.state.top + this.state.height - this.state.minDimensions.height;
				}

				if (this.constrain || event.shiftKey) {
					height = width / this.imageObj.width * this.imageObj.height;
					width = height / this.imageObj.height * this.imageObj.width;
					left = this.state.left + this.state.width - width;
					top = this.state.top + this.state.height - height;
				}
			}

			if (this.cropEvent.target.classList.contains(_constants.CSS_NAMESPACE + '__draggable-corner-ne')) {
				console.log('ne drag', '');
				// origin of image scale should be set to the opposite corner of this handle
				//this.image.transform.origin = [ 'left', 'bottom' ];

				width = this.mousePos.x - this.state.left;
				height = this.state.height - (this.mousePos.y - this.state.top);
				left = this.state.left;
				top = this.mousePos.y;
				right = left + width;

				if (height <= this.state.minDimensions.height) {
					height = this.state.minDimensions.height;
					top = this.state.top + this.state.height - this.state.minDimensions.height;
				}
				if (top <= this.state.imageCoords.top) {
					top = this.state.imageCoords.top;
					height = this.state.bottom - top;
				}
				if (right >= this.state.imageCoords.right) {
					width = this.state.imageCoords.right - left;
				}
				if (bottom >= this.state.imageCoords.bottom) {
					height = this.state.imageCoords.bottom - top;
				}
				if (this.constrain || event.shiftKey) {
					width = height / this.imageObj.height * this.imageObj.width;
				}
			}

			// all this is about ensuring there is no 'sticking' at the extremes
			height = isNaN(height) ? this.state.height : height;
			height = height >= this.state.maxDimensions.height ? this.state.maxDimensions.height : height;
			height = height <= this.state.minDimensions.height ? this.state.minDimensions.height : height;
			width = width >= this.state.maxDimensions.width ? this.state.maxDimensions.width : width;
			width = width <= this.state.minDimensions.width ? this.state.minDimensions.width : width;

			// left = left >= this.state.right - this.state.minDimensions.width
			// 	? this.state.right - this.state.minDimensions.width : left;
			//
			// left = left <= this.state.left ? this.state.left : left;
			//
			// top = top >= this.state.maxDimensions.height - this.state.minDimensions.height
			// 	? this.state.maxDimensions.height - this.state.minDimensions.height : top;
			// top = (top <= this.state.top || isNaN(top)) ? this.state.top : top;


			var appContainerCenterX = this.appContainer.offsetWidth / 2;
			var appContainerCenterY = this.appContainer.offsetHeight / 2;
			var imageLeft = appContainerCenterX - this.imageObj.width / 2;
			var imageTop = appContainerCenterY - this.imageObj.height / 2;

			imageX = 0 + (left - imageLeft) / imageAspectRatio.ratio;
			imageY = 0 + (top - imageTop) / imageAspectRatio.ratio;

			imageWidth = width / imageAspectRatio.ratio;
			imageHeight = height / imageAspectRatio.ratio;
			drawX = left;
			drawY = top;
			drawWidth = width;
			drawHeight = height;

			//console.log( 'imageX, imageY, imageWidth, imageHeight, drawX, drawY, drawWidth, drawHeight', imageX, imageY, imageWidth, imageHeight, drawX, drawY, drawWidth, drawHeight );

			this.canvasWorkspace.drawImage({
				imageObj: this.imageObj,
				canvasWidth: this.appContainer.offsetWidth,
				canvasHeight: this.appContainer.offsetHeight,
				imageX: imageX,
				imageY: imageY,
				imageWidth: imageWidth,
				imageHeight: imageHeight,
				drawWidth: drawWidth,
				drawHeight: drawHeight,
				drawX: drawX,
				drawY: drawY
			});

			this.state.left = left;
			this.element.style.left = this.state.left + 'px';

			this.state.width = width;
			this.element.style.width = this.state.width + 'px';

			this.state.height = height;
			this.element.style.height = this.state.height + 'px';

			this.state.top = top;
			this.element.style.top = this.state.top + 'px';

			this.state.bottom = this.state.top + height;
			this.state.right = this.state.left + width;
			this.cropActionTriggered = true;

			if (_constants.DEBUG) {
				this.onWorkSpaceUpdated(_extends({}, this.getState()));
			}
			this.state.initialized = true;
			return false;
		}
	}, {
		key: 'onStopCropResize',
		value: function onStopCropResize() {

			this.dragging = false;
			this.mousePos = null;
			this.cropEvent = null;
			(0, _utils.removeClass)(this.element, _constants.ACTIVE_CLASS);
			document.removeEventListener('mousemove', this.onCropResize);
			document.removeEventListener('mouseup', this.onStopCropResize);
			document.removeEventListener('touchmove', this.onCropResize);
			document.removeEventListener('touchend', this.onStopCropResize);

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
	}]);

	return CropContainer;
}();

exports.default = CropContainer;

/***/ })
/******/ ]);
//# sourceMappingURL=main.bundle.js.map