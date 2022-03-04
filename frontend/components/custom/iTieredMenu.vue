<template>
    <transition name="p-connected-overlay" @enter="onEnter" @leave="onLeave">
        <div
            :ref="containerRef"
            :class="containerClass"
            v-if="popup ? visible : true"
        >
            <i-tiered-menu-sub
                :model="model"
                :root="true"
                :popup="popup"
                :template="$slots.item"
                :exact="exact"
                @leaf-click="onLeafClick"
            ></i-tiered-menu-sub>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'TieredMenu',
    inheritAttrs: false,
    props: {
        appendTo: {
            type: String,
            default: 'body',
        },
        popup: {
            type: Boolean,
            default: false,
        },
        model: {
            type: Array,
            default: null,
        },
        exact: {
            type: Boolean,
            default: true,
        },
    },
    container: null,
    data() {
        return {
            visible: false,
        };
    },
    beforeDestroy() {
        this.restoreAppend();
    },
    methods: {
        containerRef(el) {
            this.container = el;
        },
        onEnter() {
            console.info('enter');
            this.appendContainer();
        },
        onLeave() {
            console.info('leave');
        },
        onLeafClick() {
            if (this.popup) {
                this.hide();
            }
        },
        hide() {
            this.visible = false;
        },
        appendContainer() {
            if (this.appendTo) {
                if (this.appendTo === 'body') {
                    document.body.appendChild(this.$refs.container);
                } else {
                    document
                        .getElementById(this.appendTo)
                        .appendChild(this.$refs.container);
                }
            }
        },
        restoreAppend() {
            if (this.$refs.container && this.appendTo) {
                if (this.appendTo === 'body') {
                    document.body.removeChild(this.$refs.container);
                } else {
                    document
                        .getElementById(this.appendTo)
                        .removeChild(this.$refs.container);
                }
            }
        },
    },
    computed: {
        containerClass() {
            return [
                'p-tieredmenu p-component',
                {
                    'p-tieredmenu-overlay': this.popup,
                },
            ];
        },
    },
};
</script>

<style scoped>
</style>