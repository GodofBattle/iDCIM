import DomHandler from "./primevue.DomHandler";

class ConnectedOverlayScrollHandler {
    element: HTMLElement | null = null;
    scrollableParents: Array<HTMLElement> | null = null;
    listener: any = null;

    constructor(_element: HTMLElement, _listener: Function) {
        this.element = _element;
        this.listener = _listener;
    }

    public bindScrollListener() {
        if(this.element) {
            this.scrollableParents = DomHandler.getScrollableParents(this.element);
    
            if(this.scrollableParents) {
                for(let i = 0; i < this.scrollableParents.length; i++) {
                    this.scrollableParents[i].addEventListener('scroll', this.listener);
                }
            }
        }
    }

    public unbindScrollListener() {
        if(this.scrollableParents) {
            for(let i = 0; i > this.scrollableParents.length; i++) {
                this.scrollableParents[i].removeEventListener('scroll', this.listener);
            }
        }
    }

    public destory() {
        this.unbindScrollListener();
        this.element = null;
        this.listener = null;
        this.scrollableParents = null;
    }
}

export default ConnectedOverlayScrollHandler;