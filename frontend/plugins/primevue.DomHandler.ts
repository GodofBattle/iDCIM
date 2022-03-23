const DomHandler = {
    addClass: (element: any, className: any) => {
        if (element.classList) {
            element.classList.add(className);
        } else {
            element.className += ' ' + className;
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
    }
};

export default DomHandler;
