<template>
    <transition name="p-overlaypanel" @enter="onEnter" @leave="onLeave">
        <div v-if="visible" ref="container" class="p-overlaypanel p-component">
            <div class="p-overlaypanel-content" @click="onContentClick">
                <slot></slot>
            </div>
            <button
                v-if="showCloseIcon"
                class="p-overlaypanel-close p-link"
                type="button"
                :aria-label="ariaCloseLabel"
                @click="hide"
            >
                <span class="p-overlaypanel-close-icon pi pi-times"></span>
            </button>
        </div>
    </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import DomHandler from '@/plugins/primevue.DomHandler';
import ConnectedOverlayScrollHandler from '@/plugins/primevue.ConnectedOverlayScrollHandler';

@Component<IOverlayPanel>({
    props: {
        appendTo: {
            type: String,
            default: null
        },
        ariaCloseLabel: {
            type: String,
            default: 'close'
        },
        autoZIndex: {
            type: Boolean,
            default: true
        },
        baseZIndex: {
            type: Number,
            default: 0
        },
        dismissable: {
            type: Boolean,
            default: true
        },
        showCloseIcon: {
            type: Boolean,
            default: false
        }
    }
})
export default class IOverlayPanel extends Vue {
    $refs!: {
        container: HTMLDivElement;
    };

    visible: boolean = false;
    selfClick: boolean = false;

    target: null | HTMLElement = null;
    outsideClickListener: any = null;
    scrollHandler: ConnectedOverlayScrollHandler | null = null;
    resizeListener: any = null;

    toggle(event: Event) {
        if (this.visible) {
            this.hide();
        } else {
            this.show(event);
        }
    }

    show(event: Event) {
        this.visible = true;
        this.target = (event.currentTarget || event.target) as HTMLElement;
    }

    hide() {
        this.visible = false;
    }

    alignOverlay() {
        if (this.target) {
            DomHandler.absolutePosition(this.$refs.container, this.target);

            const containerOffset = DomHandler.getOffset(this.$refs.container);
            const targetOffset = DomHandler.getOffset(this.target);

            let arrowLeft = 0;
            if (containerOffset.left < targetOffset.left) {
                arrowLeft = targetOffset.left - containerOffset.left;
            }

            this.$refs.container.style.setProperty(
                '--overlayArrowLeft',
                `${arrowLeft}px`
            );

            if (containerOffset.top < targetOffset.top) {
                DomHandler.addClass(
                    this.$refs.container,
                    'p-overlaypanel-flipped'
                );
            }
        }
    }

    appendContainer() {
        if (this.$props.appendTo) {
            if (this.$props.appendTo === 'body') {
                document.body.appendChild(this.$refs.container);
            } else {
                document
                    .getElementById(this.$props.appendTo)
                    ?.appendChild(this.$refs.container);
            }
        }
    }

    beforeDestroy() {
        this.restoreAppend();

        if (this.$props.dismissable) {
            this.unbindOutsideClickListener();
        }

        if (this.scrollHandler) {
            this.scrollHandler.destory();
            this.scrollHandler = null;
        }

        this.unbindResizeListener();
        this.target = null;
    }

    bindOutsideClickListener() {
        if (!this.outsideClickListener) {
            this.outsideClickListener = (event: PointerEvent) => {
                if (
                    this.visible &&
                    !this.selfClick &&
                    !this.isTargetClicked(event)
                ) {
                    this.visible = false;
                }

                this.selfClick = false;
            };

            document.addEventListener('click', this.outsideClickListener);
        }
    }

    bindResizeListener() {
        if (!this.resizeListener) {
            this.resizeListener = () => {
                if (this.visible && !DomHandler.isAndroid()) {
                    this.visible = false;
                }
            };

            window.addEventListener('resize', this.resizeListener);
        }
    }

    bindScrollListener() {
        if (!this.scrollHandler && this.target) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(
                this.target,
                () => {
                    if (this.visible) {
                        this.visible = false;
                    }
                }
            );
        } else if (this.scrollHandler) {
            this.scrollHandler.bindScrollListener();
        }
    }

    isTargetClicked(event: PointerEvent) {
        return (
            this.target &&
            (this.target === event.target ||
                this.target.contains(event.target as Node))
        );
    }

    onContentClick() {
        this.selfClick = true;
    }

    onEnter() {
        this.appendContainer();
        this.alignOverlay();

        if (this.$props.dismissable) {
            this.bindOutsideClickListener();
        }

        this.bindScrollListener();
        this.bindResizeListener();

        if (this.$props.autoZIndex) {
            this.$refs.container.style.zIndex = String(
                this.$props.baseZIndex + DomHandler.generateZIndex()
            );
        }
    }

    onLeave() {
        this.unbindOutsideClickListener();
        this.unbindScrollListener();
        this.unbindResizeListener();
    }

    restoreAppend() {
        if (this.$refs.container && this.$props.appendTo) {
            if (this.$props.appendTo === 'body') {
                document.body.removeChild(this.$refs.container);
            } else {
                document
                    .getElementById(this.$props.appendTo)
                    ?.removeChild(this.$refs.container);
            }
        }
    }

    unbindOutsideClickListener() {
        if (this.outsideClickListener) {
            document.removeEventListener('click', this.outsideClickListener);
            this.outsideClickListener = null;
            this.selfClick = false;
        }
    }

    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }

    unbindResizeListener() {
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }
    }
}
</script>
