type Dimension = {
    width: number;
    height: number;
}

const _createForOfIteratorHelper = (o: any, allowArrayLike: any) => {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    
    if (!it) {
        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o, null)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            var F = function F() {};
            return {
                s: F,
                n: function n() {
                    if (i >= o.length) return { done: true };
                    return {
                        done: false,
                        value: o[i++]
                    };
                },
                e: function e(_e: any) {
                    throw _e;
                },
                f: F
            };
        }
        
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    
    var normalCompletion = true, didErr = false, err: any;
    
    return {
        s: function s() {
            it = it.call(o);
        },
        n: function n() {
            var step = it.next();
            normalCompletion = step.done;
            return step;
        },
        e: function e(_e2: any) {
            didErr = true;
            err = _e2;
        },
        f: function f() {
            try {
                if (!normalCompletion && it.return != null) it.return();
            } finally {
                if (didErr) throw err;
            }
        }
    };
}

const _unsupportedIterableToArray = (o: any, minLen: any) => {
    if (!o) return;
    
    if (typeof o === "string") {
        return _arrayLikeToArray(o, minLen);
    }
    
    var n = Object.prototype.toString.call(o).slice(8, -1);
    
    if (n === "Object" && o.constructor) {
        n = o.constructor.name;
    }
    
    if (n === "Map" || n === "Set") {
        return Array.from(o);
    }
    
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) {
        return _arrayLikeToArray(o, minLen);
    }
}

const _arrayLikeToArray = (arr: any, len: any) => {
    if (len == null || len > arr.length) {
        len = arr.length;
    }
    
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
    }
    
    return arr2;
}

const DomHandler = {
    zindex: 0,

    absolutePosition(element: HTMLElement, target: HTMLElement) {
        const elementDimensions: Dimension = element.offsetParent ? { width: element.offsetWidth, height: element.offsetHeight } : this.getHiddenElementDimesions(element);
        
        const elementOuterHeight = elementDimensions.height;
        const elementOuterWidth = elementDimensions.width;
        const targetOuterHeight = target.offsetHeight;
        const targetOuterWidth = target.offsetWidth;

        const targetOffset = target.getBoundingClientRect();

        const windowScrollTop = this.getWindowScrollTop();
        const windowScrollLeft = this.getWindowScrollLeft();

        const viewport = this.getViewport();
        
        let top: number, left: number;
        if(targetOffset.top + targetOuterHeight + elementOuterHeight > viewport.height) {
            top = targetOffset.top + windowScrollTop - elementOuterHeight;
            element.style.transformOrigin = 'bottom'

            if(top < 0) {
                top = windowScrollTop;
            }
        } else {
            top = targetOuterHeight + targetOffset.top + windowScrollTop;
            element.style.transformOrigin = 'top';
        }

        if(targetOffset.left + elementOuterWidth > viewport.width) {
            left = Math.max(0, targetOffset.left + windowScrollLeft + targetOuterWidth - elementOuterWidth);
        } else {
            left = targetOffset.left + windowScrollLeft;
        }

        element.style.top = top + 'px';
        element.style.left = left + 'px';
    },

    addClass: (element: any, className: any) => {
        if (element.classList) {
            element.classList.add(className);
        } else {
            element.className += ' ' + className;
        }
    },

    addMultipleClasses: (element: HTMLElement, className: string) => {
        if(element.classList) {
            const styles = className.split(' ');

            for(let i = 0; i < styles.length; i++) {
                element.classList.add(styles[i]);
            }
        } else {
            const styles = className.split(' ');

            for(let i = 0; i < styles.length; i++) {
                element.className += ' ' + styles[i];
            }
        }
    },

    removeClass: (element: any, className: any) => {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            element.className = element.className.replace(
                new RegExp(
                    '(^}|\\b)' + className.split(' ').join('|') + '(\\b|$)',
                    'gi'
                ),
                ' '
            );
        }
    },

    find: (element: HTMLElement, selector: string) => {
        return element.querySelectorAll(selector);
    },

    getFocusableElements: (element: HTMLElement) => {
        const focusableElements = DomHandler.find(element, 'button:not([tabindex = \"-1\"]):not([disabled]):not([style*=\"display:none\"]):not([hidden]),\n[href][clientHeight][clientWidth]:not([tabindex = \"-1\"]):not([disabled]):not([style*=\"display:none\"]):not([hidden]),\ninput:not([tabindex = \"-1\"]):not([disabled]):not([style*=\"display:none\"]):not([hidden]), select:not([tabindex = \"-1\"]):not([disabled]):not([style*=\"display:none\"]):not([hidden]),\ntextarea:not([tabindex = \"-1\"]):not([disabled]):not([style*=\"display:none\"]):not([hidden]), [tabIndex]:not([tabindex = \"-1\"]):not([disabled]):not([style*=\"display:none\"]):not([hidden]),\n[contenteditable]:not([tabindex = \"-1\"]):not([disabled]):not([style*=\"display:none\"]):not([hidden])');
        const visibleFocusableElements = [];

        const _iterator3 = _createForOfIteratorHelper(focusableElements, null);
        let _step3;

        try {
            for(_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                const focusableElement = _step3.value;
                if(getComputedStyle(focusableElement).display !== 'none' && getComputedStyle(focusableElement).visibility !== 'hidden') {
                    visibleFocusableElements.push(focusableElement);
                }
            }
        } catch(err) {
            _iterator3.e(err);
        } finally {
            _iterator3.f();
        }

        return visibleFocusableElements;
    },

    getHiddenElementDimesions: (element: HTMLElement): Dimension => {
        let dimensions: Dimension = {
            width: 0,
            height: 0
        };
        
        element.style.visibility = 'hidden';
        element.style.display = 'block';
        
        dimensions = {
            width: element.offsetWidth,
            height: element.offsetHeight
        };

        element.style.display = 'none';
        element.style.visibility = 'visible';

        return dimensions;
    },

    getViewport: () => {
        const win = window;
        const doc = document;
        const e = doc.documentElement;
        const g = doc.getElementsByTagName('body')[0];
        
        const w = win.innerWidth || e.clientWidth || g.clientWidth;
        const h = win.innerHeight || e.clientHeight || g.clientHeight;
        
        return {
            width: w,
            height: h
        }
    },

    hasClass: (element: any, className: any) => {
        if (element) {
            if (element.classList) {
                return element.classList.contains(className);
            } else {
                return new RegExp('(^| )' + className + '( |$)', 'gi').test(
                    element.className
                );
            }
        }

        return false;
    },
    
    generateZIndex() {
        this.zindex = this.zindex || 999;
        return ++this.zindex;
    },

    getOffset: (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        return {
            top:
                rect.top +
                (window.pageYOffset ||
                    document.documentElement.scrollTop ||
                    document.body.scrollTop ||
                    0),
            left:
                rect.left +
                (window.pageXOffset ||
                    document.documentElement.scrollLeft ||
                    document.body.scrollLeft ||
                    0)
        };
    },

    getOuterHeight: (element: HTMLElement, margin = false) => {
        if (element) {
            let height = element.offsetHeight;

            if (margin) {
                const style = getComputedStyle(element);
                height +=
                    parseFloat(style.marginTop) +
                    parseFloat(style.marginBottom);
            }

            return height;
        } else {
            return 0;
        }
    },

    getWindowScrollLeft: () => {
        const doc = document.documentElement;
        return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    },

    getWindowScrollTop: () => {
        const doc = document.documentElement;
        return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    },

    getWidth: (element: HTMLElement) => {
        const style = getComputedStyle(element);

        let width = element.offsetWidth;
        width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

        return width;
    },
    
    relativePosition(element: HTMLElement, target: HTMLElement) {
        const elementDimensions: Dimension = element.offsetParent ? { width: element.offsetWidth, height: element.offsetHeight } : this.getHiddenElementDimesions(element);
        const targetHeight = target.offsetHeight;
        const targetOffset = target.getBoundingClientRect();
        const viewport = this.getViewport();

        let top: number, left: number;
        if(targetOffset.top + targetHeight + elementDimensions.height > viewport.height) {
            top = -1 * elementDimensions.height;
            element.style.transformOrigin = 'bottom';

            if(targetOffset.top + top < 0) {
                top = -1 * targetOffset.top;
            }
        } else {
            top = targetHeight;
            element.style.transformOrigin = 'top';
        }

        if(elementDimensions.width > viewport.width) {
            // by shkoh 20220617: element wider then viewport and cannot fit on screen (align at left side of viewport)
            left = targetOffset.left * -1;
        } else if (targetOffset.left + elementDimensions.width > viewport.width) {
            // by shkoh 20220617: element wider than viewport but can be fit on screen (align at right side of viewport)
            left = (targetOffset.left + elementDimensions.width - viewport.width) * -1;
        } else {
            left = 0;
        }

        element.style.top = top + 'px';
        element.style.left = left + 'px';
    }
};

export default DomHandler;
