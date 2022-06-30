<template>
    <div class="p-scrollpanel p-component">
        <div class="p-scrollpanel-wrapper">
            <div
                ref="content"
                class="p-scrollpanel-content"
                @scroll="moveBar"
                @mouseenter="moveBar"
            >
                <slot></slot>
            </div>
        </div>
        <div
            ref="xBar"
            class="p-scrollpanel-bar p-scrollpanel-bar-x"
            @mousedown="onXBarMouseDown"
        ></div>
        <div
            ref="yBar"
            class="p-scrollpanel-bar p-scrollpanel-bar-y"
            @mousedown="onYBarMouseDown"
        ></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import DomHandler from '~/plugins/primevue.DomHandler';

@Component<IScrollPanel>({})
export default class IScrollPanel extends Vue {
    $refs!: {
        content: HTMLDivElement;
        xBar: HTMLDivElement;
        yBar: HTMLDivElement;
    };

    initialized: boolean = false;

    scrollXRatio: null | number = null;
    scrollYRatio: null | number = null;
    lastPageX: null | number = null;
    lastPageY: null | number = null;
    isXBarClicked: boolean = false;
    isYBarClicked: boolean = false;

    documentResizeListener: any = null;
    documentMouseMoveListener: any = null;
    documentMouseUpListener: any = null;

    frame: any = null;

    mounted() {
        if ((this.$el as HTMLElement).offsetParent) {
            this.initialize();
        }
    }

    updated() {
        if (!this.initialized && (this.$el as HTMLElement).offsetParent) {
            this.initialize();
        }
    }

    beforeDestory() {
        this.unbindDocumentResizeListener();

        if (this.frame) {
            window.cancelAnimationFrame(this.frame);
        }
    }

    bindDocumentMouseListeners() {
        if (!this.documentMouseMoveListener) {
            this.documentMouseMoveListener = (event: MouseEvent) => {
                this.onDocumentMouseMove(event);
            };

            document.addEventListener(
                'mousemove',
                this.documentMouseMoveListener
            );
        }

        if (!this.documentMouseUpListener) {
            this.documentMouseUpListener = (event: MouseEvent) => {};

            document.addEventListener('mouseup', this.documentMouseUpListener);
        }
    }

    bindDocumentResizeListener() {
        if (!this.documentResizeListener) {
            this.documentResizeListener = () => {
                this.moveBar();
            };

            window.addEventListener('resize', this.documentResizeListener);
        }
    }

    calculateContainerHeight() {
        const containerStyles = getComputedStyle(this.$el);
        const xBarStyels = getComputedStyle(this.$refs.xBar);
        const pureContainerHeight =
            DomHandler.getHeight(this.$el as HTMLElement) -
            parseInt(xBarStyels.height, 10);

        if (containerStyles.maxHeight !== 'none' && pureContainerHeight === 0) {
            const contentOffsetHeight = this.$refs.content.offsetHeight;
            const containerMaxHeight = parseInt(containerStyles.maxHeight, 10);
            const xBarHeight = parseInt(xBarStyels.height, 10);

            if (contentOffsetHeight + xBarHeight > containerMaxHeight) {
                (this.$el as HTMLElement).style.height =
                    containerStyles.maxHeight;
            } else {
                (this.$el as HTMLElement).style.height = `
                    ${
                        contentOffsetHeight +
                        parseFloat(containerStyles.paddingTop) +
                        parseFloat(containerStyles.paddingBottom) +
                        parseFloat(containerStyles.borderTopWidth) +
                        parseFloat(containerStyles.borderBottomWidth)
                    }px
                `;
            }
        }
    }

    initialize() {
        this.moveBar();
        this.bindDocumentResizeListener();
        this.calculateContainerHeight();
    }

    moveBar() {
        if (this.$refs.content === undefined) return;

        // by shkoh 20220629: horizontal scroll
        const totalWidth = this.$refs.content.scrollWidth;
        const ownWidth = this.$refs.content.clientWidth;
        const bottom =
            ((this.$el as HTMLElement).clientHeight -
                this.$refs.xBar.clientHeight) *
            -1;
        this.scrollXRatio = ownWidth / totalWidth;

        // by shkoh 20220629: vertical scroll
        const totalHeight = this.$refs.content.scrollHeight;
        const ownHeight = this.$refs.content.clientHeight;
        const right =
            ((this.$el as HTMLElement).clientWidth -
                this.$refs.yBar.clientWidth) *
            -1;
        this.scrollYRatio = ownHeight / totalHeight;

        this.frame = this.requestAnimationFrame(() => {
            if (this.scrollXRatio) {
                if (this.scrollXRatio >= 1) {
                    DomHandler.addClass(
                        this.$refs.xBar,
                        'p-scrollpanel-hidden'
                    );
                } else {
                    DomHandler.removeClass(
                        this.$refs.xBar,
                        'p-scrollpanel-hidden'
                    );

                    this.$refs.xBar.style.cssText = `
                        width:${Math.max(this.scrollXRatio * 100, 10)}%;
                        left: ${
                            (this.$refs.content.scrollLeft / totalWidth) * 100
                        }%;
                        bottom: ${bottom}px;
                    `;
                }
            }

            if (this.scrollYRatio) {
                if (this.scrollYRatio >= 1) {
                    DomHandler.addClass(
                        this.$refs.yBar,
                        'p-scrollpanel-hidden'
                    );
                } else {
                    DomHandler.removeClass(
                        this.$refs.yBar,
                        'p-scrollpanel-hidden'
                    );

                    this.$refs.yBar.style.cssText = `
                        height: ${Math.max(this.scrollYRatio * 100, 10)}%;
                        top: calc(${
                            (this.$refs.content.scrollTop / totalHeight) * 100
                        }% - ${this.$refs.xBar.clientHeight}px);
                        right: ${right}px;
                    `;
                }
            }
        });
    }

    onDocumentMouseMove(event: MouseEvent) {
        if (this.isXBarClicked) {
            this.onMouseMoveForXBar(event);
        } else if (this.isYBarClicked) {
            this.onMouseMoveForYBar(event);
        } else {
            this.onMouseMoveForXBar(event);
            this.onMouseMoveForYBar(event);
        }
    }

    onDocumentMouseUp(event: MouseEvent) {
        DomHandler.removeClass(this.$refs.yBar, 'p-scrollpanel-grabbed');
        DomHandler.removeClass(this.$refs.xBar, 'p-scrollpanel-grabbed');
        DomHandler.removeClass(document.body, 'p-scrollpanel-grabbed');

        this.unbindDocumentMouseListeners();
        this.isXBarClicked = false;
        this.isYBarClicked = false;
    }

    onMouseMoveForXBar(event: MouseEvent) {
        if (this.lastPageX) {
            const deltaX = event.pageX - this.lastPageX;
            this.lastPageX = event.pageX;

            this.frame = this.requestAnimationFrame(() => {
                if (this.scrollXRatio) {
                    this.$refs.content.scrollLeft += deltaX / this.scrollXRatio;
                }
            });
        }
    }

    onMouseMoveForYBar(event: MouseEvent) {
        if (this.lastPageY) {
            const deltaY = event.pageY - this.lastPageY;
            this.lastPageY = event.pageY;

            this.frame = this.requestAnimationFrame(() => {
                if (this.scrollYRatio) {
                    this.$refs.content.scrollTop += deltaY / this.scrollYRatio;
                }
            });
        }
    }

    onXBarMouseDown(event: MouseEvent) {
        this.isXBarClicked = true;
        this.lastPageX = event.pageX;

        DomHandler.addClass(this.$refs.xBar, 'p-scrollpanel-grabbed');
        DomHandler.addClass(document.body, 'p-scrollpanel-grabbed');

        this.bindDocumentMouseListeners();

        event.preventDefault();
    }

    onYBarMouseDown(event: MouseEvent) {
        this.isYBarClicked = true;
        this.lastPageY = event.pageY;

        DomHandler.addClass(this.$refs.yBar, 'p-scrollpanel-grabbed');
        DomHandler.addClass(document.body, 'p-scrollpanel-grabbed');

        this.bindDocumentMouseListeners();

        event.preventDefault();
    }

    requestAnimationFrame(f: FrameRequestCallback) {
        const frame = window.requestAnimationFrame;
        frame(f);
    }

    unbindDocumentMouseListeners() {
        if (this.documentMouseMoveListener) {
            document.removeEventListener(
                'mousemove',
                this.documentMouseMoveListener
            );
            this.documentMouseMoveListener = null;
        }

        if (this.documentMouseUpListener) {
            document.removeEventListener(
                'mouseup',
                this.documentMouseUpListener
            );
            this.documentMouseUpListener = null;
        }
    }

    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            window.removeEventListener('resize', this.documentResizeListener);
            this.documentResizeListener = null;
        }
    }
}
</script>
