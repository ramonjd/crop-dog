/**
 * Create a noop call
 * @returns {Function}
 */
export function noop() {
    setTimeout( Function.prototype, 10000 );
}

/**
 * Throttle a func call every {threshhold}ms
 * @param {Function} fn - function to throttle
 * @param {Number} threshhold - in milliseconds
 * @param {Object} scope - context
 * @returns {Function}
 */
export function throttle( fn, threshhold = 250, scope ) {
    let last;
    let deferTimer;

    return function () {

        const context = scope || this;
        let now = new Date().getTime();
        let args = arguments;

        if ( last && now < ( last + threshhold ) ) {
            // hold on to it
            clearTimeout(deferTimer);

            deferTimer = setTimeout( function () {
                last = now;
                fn.apply( context, args );
            }, threshhold + last - now);

        } else {
            last = now;
            fn.apply( context, args );
        }
    };
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

    const offsetLeft = contextElement ? contextElement.offsetLeft : 0;
    const offsetTop = contextElement ? contextElement.offsetTop : 0;

    const x = ( event.pageX || event.touches[0].pageX ) - offsetLeft;
    const y = ( event.pageY || event.touches[0].pageY ) - offsetTop;

    return {
        x,
        y
    };
}