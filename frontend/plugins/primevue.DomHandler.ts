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

    getWindowScrollLeft: () => {
        const doc = document.documentElement;
        return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    },

    getWindowScrollTop: () => {
        const doc = document.documentElement;
        return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    }
};

export default DomHandler;
