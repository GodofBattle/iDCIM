<template>
    <div ref="container" :class="containerClass">
        <span class="p-slider-range"></span>
        <span
            v-if="range"
            class="p-slider-handle"
            :style="rangeStartHandleStyle"
            tabindex="0"
            role="slider"
            :aria-valuemin="min"
            :aria-valuenow="value ? value[0] : null"
            :aria-valuemax="max"
            :aria-labelledby="ariaLabelledBy"
        ></span>
        <span
            v-if="range"
            class="p-slider-handle"
            :style="rangeEndHandleStyle"
            tabindex="0"
            role="slider"
            :aria-valuemin="min"
            :aria-valuenow="value ? value[1] : null"
            :aria-valuemax="max"
            :aria-labelledby="ariaLabelledBy"
        ></span>
        <span
            v-if="range"
            class="p-slider-handle"
            :style="rangeEndHandleStyle"
            tabindex="0"
            role="slider"
            :aria-valuemin="min"
            :aria-valuenow="value ? value[2] : null"
            :aria-valuemax="max"
            :aria-labelledby="ariaLabelledBy"
        ></span>
    </div>
</template>

<script>
import DomHandler from 'primevue/utils/DomHandler';

export default {
    props: {
        value: [Number, Array],
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 100
        },
        orientation: {
            type: String,
            default: 'horizontal'
        },
        step: {
            type: Number,
            default: null
        },
        range: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        ariaLabelledBy: {
            type: String,
            default: 'TEST'
        }
    },
    computed: {
        containerClass() {
            return [
                'p-slider p-component',
                {
                    'p-disabled': this.disabled,
                    'p-slider-horizontal': this.orientation === 'horizontal',
                    'p-slider-vertical': this.orientation === 'vertical'
                }
            ];
        },
        horizontal() {
            return this.orientation === 'horizontal';
        },
        vertical() {
            return this.orientation === 'vertical';
        },
        rangeStyle() {
            if (this.range) {
                if (this.horizontal)
                    return {
                        left: this.rangeStartPosition + '%',
                        width:
                            this.rangeEndPosition -
                            this.rangeStartPosition +
                            '%'
                    };
                else
                    return {
                        bottom: this.rangeStartPosition + '%',
                        height:
                            this.rangeEndPosition -
                            this.rangeStartHandlePostion +
                            '%'
                    };
            } else if (this.horizontal)
                return { width: this.handlePostion + '%' };
            else return { height: this.handlePostion + '%' };
        },
        handleStyle() {
            if (this.horizontal) return { left: this.handlePosition + '%' };
            else return { bottom: this.handlePostion + '%' };
        },
        handlePosition() {
            if (this.value < this.min) return 0;
            else if (this.value > this.max) return 100;
            else return ((this.value - this.min) * 100) / (this.max - this.min);
        },
        rangeStartPosition() {
            if (this.value)
                return (
                    ((this.value[0] < this.min ? 0 : this.value[0] - this.min) *
                        100) /
                    (this.max - this.min)
                );
            else return 0;
        },
        rangeEndPosition() {
            if (this.value)
                return (
                    ((this.value[1] > this.max
                        ? 100
                        : this.value[1] - this.min) *
                        100) /
                    (this.max - this.min)
                );
            else return 0;
        },
        rangeStartHandleStyle() {
            if (this.horizontal) return { left: this.rangeStartPosition + '%' };
            else return { bottom: this.rangeStartPosition + '%' };
        },
        rangeEndHandleStyle() {
            if (this.horizontal) return { left: this.rangeEndPosition + '%' };
            else return { bottom: this.rangeEndPosition + '%' };
        }
    }
};
</script>

<style>
.p-slider {
    position: relative;
}

.p-slider .p-slider-handle {
    position: absolute;
    cursor: grab;
    touch-action: none;
    display: block;
}

.p-slider-range {
    position: absolute;
    display: block;
}

.p-slider-horizontal .p-slider-range {
    top: 0;
    left: 0;
    height: 100%;
}

.p-slider-horizontal .p-slider-handle {
    top: 50%;
}

.p-slider-vertical {
    height: 100px;
}

.p-slider-vertical .p-slider-handle {
    left: 50%;
}

.p-slider-vertical .p-slider-range {
    bottom: 0;
    left: 0;
    width: 100%;
}
</style>
