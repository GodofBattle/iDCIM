<template>
    <div v-if="maskVisible" ref="mask" :class="maskClass" @click="onMaskClick">
        <transition
            name="p-dialog"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @before-leave="onBeforeLeave"
            @leave="onLeave"
            @after-leave="onAfterLeave"
            @appear="onAppear"
        >
            <div
                v-if="visible"
                ref="dialog"
                :class="dialogClass"
                :style="dialogStyle"
                v-bind="$attrs"
                role="dialog"
                :aria-labelledby="ariaLabelledById"
                :aria-modal="modal"
                v-on="listeners"
            >
                <div
                    v-if="showHeader"
                    class="p-dialog-header"
                    @mousedown="initDrag"
                >
                    <slot name="header">
                        <span
                            v-if="header"
                            :id="ariaLabelledById"
                            class="p-dialog-title"
                        >
                            {{ header }}
                        </span>
                    </slot>
                    <div class="p-dialog-header-icons">
                        <button
                            v-if="maximizable"
                            v-ripple
                            class="p-dialog-header-icon p-dialog-header-maximize p-link"
                            type="button"
                            tabindex="-1"
                            @click="maximize"
                        >
                            <span :class="maximizeIconClass"></span>
                        </button>
                        <button
                            v-if="closable"
                            v-ripple
                            class="p-dialog-header-icon p-dialog-header-close p-link"
                            :aria-label="ariaCloseLabel"
                            type="button"
                            tabindex="-1"
                            @click="close"
                        >
                            <span
                                class="p-dialog-header-close-icon pi pi-times"
                            >
                            </span>
                        </button>
                    </div>
                </div>
                <div class="p-dialog-content" :style="contentStyle">
                    <slot></slot>
                </div>
                <div v-if="footer || $slots.footer" class="p-dialog-footer">
                    <slot name="footer"> {{ footer }} </slot>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import UniqueComponentId from 'primevue/utils/UniqueComponentId';
import DomHandler from 'primevue/utils/DomHandler';
import Ripple from 'primevue/ripple/Ripple';

export default {
    directives: {
        ripple: Ripple
    },
    inheritAttrs: false,
    props: {
        header: null,
        footer: null,
        visible: Boolean,
        modal: Boolean,
        contentStyle: null,
        rtl: Boolean,
        maximizable: Boolean,
        dismissableMask: Boolean,
        closable: {
            type: Boolean,
            default: true
        },
        closeOnEscape: {
            type: Boolean,
            default: true
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        baseZIndex: {
            type: Number,
            default: 0
        },
        autoZIndex: {
            type: Boolean,
            default: true
        },
        ariaCloseLabel: {
            type: String,
            default: 'close'
        },
        position: {
            type: String,
            default: 'center'
        },
        draggable: {
            type: Boolean,
            default: true
        },
        minX: {
            type: Number,
            default: 0
        },
        minY: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            dialogClasses: null,
            dialogStyles: null,
            maskVisible: this.visible,
            maximized: false
        };
    },
    documentDragListener: null,
    documentDragEndListener: null,
    documentKeydownListener: null,
    dragging: false,
    lastPageX: null,
    lastPageY: null,
    computed: {
        listeners() {
            return {
                ...this.$listeners
            };
        },
        maskClass() {
            return ['p-dialog-mask', this.getPositionClass()];
        },
        dialogClass() {
            return [
                'p-dialog p-component',
                {
                    'p-dialog-rtl': this.rtl,
                    'p-dialog-maximized': this.maximizable && this.maximized
                },
                this.dialogClasses
            ];
        },
        maximizeIconClass() {
            return [
                'p-dialog-header-maximize-icon pi',
                {
                    'pi-window-maximize': !this.maximized,
                    'pi-window-minimize': this.maximized
                }
            ];
        },
        dialogStyle() {
            return this.dialogStyles;
        },
        ariaId() {
            return UniqueComponentId();
        },
        ariaLabelledById() {
            return this.header != null ? this.ariaId + '_header' : null;
        }
    },
    updated() {
        this.removeStylesFromMask();

        if (this.visible && !this.maskVisible) {
            this.maskVisible = true;
        }

        if (
            this.modal &&
            this.$refs.mask &&
            !DomHandler.hasClass(this.$refs.mask, 'p-component-overlay')
        ) {
            DomHandler.addClass(this.$refs.mask, 'p-component-overlay');
        }
    },
    destroyed() {
        this.unbindGlobalListeners();
    },
    mounted() {
        this.removeStylesFromMask();
    },
    beforeDestroy() {
        this.disableDocumentSettings();
    },
    methods: {
        close() {
            this.$emit('update:visible', false);
        },
        onBeforeEnter(el) {
            if (this.autoZIndex) {
                el.style.zIndex = String(
                    this.baseZIndex + DomHandler.generateZIndex()
                );
            }
        },
        onEnter() {
            this.$refs.mask.style.zIndex = String(
                parseInt(this.$refs.dialog.style.zIndex, 10) - 1
            );

            this.$emit('show');
            this.focus();
            this.enableDocumentSettings();
        },
        onBeforeLeave() {
            DomHandler.addClass(this.$refs.mask, 'p-dialog-mask-leave');
        },
        onLeave() {
            this.$emit('hide');
        },
        onAfterLeave() {
            this.maskVisible = false;
            this.disableDocumentSettings();
        },
        onAppear() {
            if (this.visible) {
                this.onEnter();
            }
        },
        onMaskClick(event) {
            if (
                this.dismissableMask &&
                this.closable &&
                this.modal &&
                this.$refs.mask === event.target
            ) {
                this.close();
            }
        },
        focus() {
            const focusTarget = this.$refs.dialog.querySelector('[autofocus]');
            if (focusTarget) {
                focusTarget.focus();
            }
        },
        maximize() {
            this.maximized = !this.maximized;

            if (!this.modal) {
                if (this.maximized)
                    DomHandler.addClass(document.body, 'p-overflow-hidden');
                else DomHandler.removeClass(document.body, 'p-overflow-hidden');
            }

            // by shkoh 20210618: dialog의 modal 여부와는 별도로 처리
            if (this.maximized) {
                this.$refs.dialog.style.position = 'static';
            } else {
                this.$refs.dialog.style.position = 'fixed';
            }
        },
        enableDocumentSettings() {
            if (this.modal) {
                DomHandler.addClass(document.body, 'p-overflow-hidden');
                this.bindDocumentKeydownListener();
            } else if (this.maximizable && this.maximized) {
                DomHandler.addClass(document.body, 'p-overflow-hidden');
            }
        },
        disableDocumentSettings() {
            if (this.modal) {
                DomHandler.removeClass(document.body, 'p-overflow-hidden');
                this.unbindDocumentKeydownListener();
            } else if (this.maximizable && this.maximized) {
                DomHandler.removeClass(document.body, 'p-overflow-hidden');
            }
        },
        onKeyDown(event) {
            if (event.which === 9) {
                event.preventDefault();
                const focusableElements = DomHandler.getFocusableElements(
                    this.$refs.dialog
                );
                if (focusableElements && focusableElements.length > 0) {
                    if (!document.activeElement) {
                        focusableElements[0].focus();
                    } else {
                        const focusedIndex = focusableElements.indexOf(
                            document.activeElement
                        );
                        if (event.shiftKey) {
                            if (focusedIndex == -1 || focusedIndex === 0)
                                focusableElements[
                                    focusableElements.length - 1
                                ].focus();
                            else focusableElements[focusedIndex - 1].focus();
                        } else if (
                            focusedIndex == -1 ||
                            focusedIndex === focusableElements.length - 1
                        )
                            focusableElements[0].focus();
                        else focusableElements[focusedIndex + 1].focus();
                    }
                }
            } else if (event.which === 27 && this.closeOnEscape) {
                this.close();
            }
        },
        bindDocumentKeydownListener() {
            if (!this.documentKeydownListener) {
                this.documentKeydownListener = this.onKeyDown.bind(this);
                window.document.addEventListener(
                    'keydown',
                    this.documentKeydownListener
                );
            }
        },
        unbindDocumentKeydownListener() {
            if (this.documentKeydownListener) {
                window.document.removeEventListener(
                    'keydown',
                    this.documentKeydownListener
                );
                this.documentKeydownListener = null;
            }
        },
        getPositionClass() {
            const positions = [
                'left',
                'right',
                'top',
                'topleft',
                'topright',
                'bottom',
                'bottomleft',
                'bottomright'
            ];
            const pos = positions.find((item) => item === this.position);

            return pos ? `p-dialog-${pos}` : '';
        },
        removeStylesFromMask() {
            if (this.$refs.mask) {
                this.dialogStyles = this.$vnode.data.style;
                if (this.dialogStyles) {
                    Object.keys(this.dialogStyles).forEach((key) => {
                        this.$refs.mask.style[key] = '';
                    });
                }

                this.dialogClasses =
                    this.$vnode.data.class || this.$vnode.data.staticClass;
                if (this.dialogClasses) {
                    this.$refs.mask.classList =
                        'p-dialog-mask' +
                        (this.modal && ' p-component-overlay ') +
                        this.getPositionClass();
                }
            }
        },
        initDrag(event) {
            if (
                DomHandler.hasClass(event.target, 'p-dialog-header-icon') ||
                DomHandler.hasClass(
                    event.target.parentElement,
                    'p-dialog-header-icon'
                )
            ) {
                return;
            }

            if (this.draggable) {
                this.dragging = true;
                this.lastPageX = event.pageX;
                this.lastPageY = event.pageY;

                this.$refs.dialog.style.margin = '0';

                DomHandler.addClass(document.body, 'p-unselectable-text');

                this.bindGlobalListeners();
            }
        },
        bindGlobalListeners() {
            if (this.draggable) {
                this.bindDocumentDragListeners();
                this.bindDocumentDragEndListeners();
            }
        },
        bindDocumentDragListeners() {
            this.documentDragListener = (event) => {
                if (this.dragging && !this.maximized) {
                    const width = DomHandler.getOuterWidth(this.$refs.dialog);
                    const height = DomHandler.getOuterHeight(this.$refs.dialog);

                    const deltaX = event.pageX - this.lastPageX;
                    const deltaY = event.pageY - this.lastPageY;

                    const offset = this.$refs.dialog.getBoundingClientRect();
                    const leftPos = offset.left + deltaX;
                    const topPos = offset.top + deltaY;

                    const viewport = DomHandler.getViewport();

                    this.$refs.dialog.style.position = 'fixed';

                    if (
                        leftPos >= this.minX &&
                        leftPos + width < viewport.width
                    ) {
                        this.lastPageX = event.pageX;
                        this.$refs.dialog.style.left = leftPos + 'px';
                    }

                    if (
                        topPos >= this.minY &&
                        topPos + height < viewport.height
                    ) {
                        this.lastPageY = event.pageY;
                        this.$refs.dialog.style.top = topPos + 'px';
                    }
                }
            };

            window.document.addEventListener(
                'mousemove',
                this.documentDragListener
            );
        },
        bindDocumentDragEndListeners() {
            this.documentDragEndListener = (event) => {
                if (this.dragging) {
                    this.dragging = false;

                    DomHandler.removeClass(
                        document.body,
                        'p-unselectable-text'
                    );

                    this.unbindGlobalListeners();

                    this.$emit('dragend', event);
                }
            };

            window.document.addEventListener(
                'mouseup',
                this.documentDragEndListener
            );
        },
        unbindGlobalListeners() {
            this.unbindDocumentDragListeners();
            this.unbindDocumentDragEndListeners();
        },
        unbindDocumentDragListeners() {
            if (this.documentDragListener) {
                window.document.removeEventListener(
                    'mousemove',
                    this.documentDragListener
                );
                this.documentDragListener = null;
            }
        },
        unbindDocumentDragEndListeners() {
            if (this.documentDragEndListener) {
                window.document.removeEventListener(
                    'mouseup',
                    this.documentDragEndListener
                );
                this.documentDragEndListener = null;
            }
        }
    }
};
</script>
