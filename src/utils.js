/**
 * Create a noop call
 * @returns {Function}
 */
export function noop() {
    setTimeout( Function.prototype, 10000 );
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
export function throttle( type, name, obj = window ) {
    let running = false;
    const func = function() {
        if (running) { return; }
        running = true;
        requestAnimationFrame(function throttledRequestAnimationFrame() {
            obj.dispatchEvent( new CustomEvent( name ) );
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
export function createElement( options ) {

    const element = document.createElement( options.tagName );

    if ( options.className ) {
        element.className = options.className;
    }

    if ( options.attributes ) {
        for ( let attr in options.attributes ) {
            element.setAttribute( attr, options.attributes[attr] )
        }
    }

    if ( options.text ) {
        element.appendChild( document.createTextNode( options.text ) );
    }

    if ( options.children && options.children.length ) {
        let i = 0;
        let childrenLength = options.children.length;
        for (; i < childrenLength; i++ ) {
            element.appendChild( options.children[i] instanceof window.HTMLElement ? options.children[i] : createElement( options.children[i] ) );
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
export function getOffsetRelativeToParent( childCssSelector, parentCssSelector) {

    // we have to query the DOM elements to get the latest position data
    // in case there has been a CSS transform on the element(s)
    const childElem = document.querySelector( childCssSelector );
    const parentElem = document.querySelector( parentCssSelector );

    if ( ! childElem || ! parentElem ) {
        throw new Error( `One or more DOM elements can't be found with: ${childCssSelector} or ${parentCssSelector}` );
    }

    const childRect = childElem.getBoundingClientRect();
    const parentRect = parentElem.getBoundingClientRect();

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
export function getCenterPositionRelativeToParent( childElement, parentElement ) {
    return {
        left: ( parentElement.offsetWidth / 2 - childElement.offsetWidth / 2 ),
        top: ( parentElement.offsetHeight / 2 - childElement.offsetHeight / 2 )
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
export function getMousePosition( event, contextElement = null ) {

    const offsetLeft = contextElement ? contextElement.offsetLeft : window.pageXOffset;
    const offsetTop = contextElement ? contextElement.offsetTop : window.pageYOffset;

    const x = ( event.pageX || ( event.touches && event.touches[0].pageX ) ) - offsetLeft;
    const y = ( event.pageY || ( event.touches && event.touches[0].pageY ) ) - offsetTop;

    return {
        x,
        y
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
export function calculateAspectRatioFit( srcWidth, srcHeight, maxWidth, maxHeight, rotated = false, gutter = 1 ) {

    const aspectRatio = rotated ? Math.min( maxHeight / srcWidth, maxWidth / srcHeight ) : Math.min( maxWidth / srcWidth, maxHeight / srcHeight );
    // reduce ratio to gutter percentage amount
    const ratio = aspectRatio * gutter;

    // widths with ratio applied
    const width = Math.floor( srcWidth * ratio ) ;
    const height = Math.floor( srcHeight * ratio ) ;

    return {
        ratio,
        width,
        height
    };
}

export function calculateOriginalDimensionsFromScaled( scaledWidth, scaledHeight, ratio ) {

    // widths with ratio applied
    const width = Math.floor( scaledWidth / ratio ) ;
    const height = Math.floor( scaledHeight / ratio ) ;

    return {
        width,
        height
    };
}

export function transformCSS( element, translateX = 0, translateY = 0, scale = 0, radians = 0 ) {
    element.style.transform = `translate( ${ translateX }px, ${ translateY }px ) scale( ${ scale } ) rotate( ${ radians }rad ) translateZ( 0px )`;
    return element;
}

// Converts from degrees to radians.
export function getRadianFromDegrees( degrees ) {
    return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
export function getDegreesFromRadians( radians ) {
    return radians * 180 / Math.PI;
}

export function regExp( name ) {
    return new RegExp( `(^| )${name}( |$)` );
}

export function hasClass( element, className ) {
    if ( ! ( 'classList' in Element.prototype )  ) {
        return regExp( name ).test( this.element.className );
    }
    return element.classList.contains( className );
}

export function removeClass( element, className ) {
    if ( ! ( 'classList' in Element.prototype ) ) {
        return element.className =  element.className.replace( regExp( name ), '' );
    }
    return element.classList.remove( className );
}

export function addClass( element, className ) {
    if ( ! ( 'classList' in Element.prototype ) ) {
        return element.className += ' ' + className;
    }
    return element.classList.add( className );
}

export function createTransformMatrix( transformMatrix, inverseTransformMatrix, x, y, scale, rotate ) {

    // create the rotation and scale parts of the transformMatrix
    transformMatrix[3] =   transformMatrix[0] = Math.cos(rotate) * scale;
    transformMatrix[2] = -(transformMatrix[1] = Math.sin(rotate) * scale);

    // add the translation
    transformMatrix[4] = x;
    transformMatrix[5] = y;

    // calculate the inverse transformation

    // first get the cross product of x axis and y axis
    var cross = transformMatrix[0] * transformMatrix[3] - transformMatrix[1] * transformMatrix[2];

    // now get the inverted axis
    inverseTransformMatrix[0] =  transformMatrix[3] / cross;
    inverseTransformMatrix[1] = -transformMatrix[1] / cross;
    inverseTransformMatrix[2] = -transformMatrix[2] / cross;
    inverseTransformMatrix[3] =  transformMatrix[0] / cross;
    

    return {
        transformMatrix,
        inverseTransformMatrix
    };
};

// params: x, y coords in current, transformed matrix
// returns x,y coords from original, untransformed matrix
export function getOriginalCoordinatesFromTransformedMatrix( transformMatrix, inverseTransformMatrix, x, y ) {
    var xx, yy;
    xx = x - transformMatrix[4];     // remove the translation
    yy = y - transformMatrix[5];     // by subtracting the origin
    // return the point {x:?,y:?} by multiplying xx,yy by the inverse matrix
    return {
        x:   xx * inverseTransformMatrix[0] + yy * inverseTransformMatrix[2],
        y:   xx * inverseTransformMatrix[1] + yy * inverseTransformMatrix[3]
    }
}