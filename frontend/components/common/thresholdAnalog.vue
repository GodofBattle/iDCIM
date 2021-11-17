<template>
    <div ref="container" class="p-grid">
        <div class="p-col-fiexed p-text-center" style="width: 40px">
            <span v-if="showMinMax">{{ rangeMin }}</span>
            <span v-else>
                <Tag :value="n3" class="i-critical"></Tag>
            </span>
        </div>
        <div class="p-col">
            <div :class="containerClass" :style="{ opacity: 1 }">
                <span
                    v-if="showMinMax"
                    class="p-slider-range"
                    :style="rangeMinToN3Style"
                ></span>
                <span class="p-slider-range" :style="rangeN3ToN2Style"></span>
                <span class="p-slider-range" :style="rangeN2ToN1Style"></span>
                <span class="p-slider-range" :style="rangeN1ToP1Style"></span>
                <span class="p-slider-range" :style="rangeP1ToP2Style"></span>
                <span class="p-slider-range" :style="rangeP2ToP3Style"></span>
                <span
                    v-if="showMinMax"
                    class="p-slider-range"
                    :style="rangeP3ToMaxStyle"
                ></span>
                <span
                    v-if="showMinMax && n3"
                    class="p-slider-handle"
                    :style="rangeN3HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="n3"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                >
                    <Tag :value="n3" class="i-tag-position i-critical"></Tag>
                </span>
                <span
                    v-if="n2"
                    class="p-slider-handle"
                    :style="rangeN2HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="n2"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                >
                    <Tag :value="n2" class="i-tag-position i-major"></Tag>
                </span>
                <span
                    v-if="n1"
                    class="p-slider-handle"
                    :style="rangeN1HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="n1"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                >
                    <Tag :value="n1" class="i-tag-position i-warning"></Tag>
                </span>
                <span
                    v-if="p1"
                    class="p-slider-handle"
                    :style="rangeP1HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="p1"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                >
                    <Tag :value="p1" class="i-tag-position i-warning"></Tag>
                </span>
                <span
                    v-if="p2"
                    class="p-slider-handle"
                    :style="rangeP2HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="p2"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                >
                    <Tag :value="p2" class="i-tag-position i-major"></Tag>
                </span>
                <span
                    v-if="showMinMax && p3"
                    class="p-slider-handle"
                    :style="rangeP3HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="p3"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                >
                    <Tag :value="p3" class="i-tag-position i-critical"></Tag>
                </span>
            </div>
        </div>
        <div class="p-col-fiexed p-text-center" style="width: 40px">
            <span v-if="showMinMax">{{ rangeMax }}</span>
            <span v-else>
                <Tag :value="p3" class="i-critical"></Tag>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component({
    props: {
        n3: {
            type: Number,
            default: 20
        },
        n2: {
            type: Number,
            default: 30
        },
        n1: {
            type: Number,
            default: 40
        },
        p1: {
            type: Number,
            default: 60
        },
        p2: {
            type: Number,
            default: 70
        },
        p3: {
            type: Number,
            default: 80
        },
        min: {
            type: Number,
            default: undefined
        },
        max: {
            type: Number,
            default: undefined
        },
        step: {
            type: Number,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        },
        showMinMax: {
            type: Boolean,
            default: false
        },
        ariaLabelledBy: {
            type: String,
            default: null
        }
    }
})
export default class ThresholdAnalog extends Vue {
    get containerClass(): Array<string | object> {
        return [
            'p-slider p-component',
            'p-slider-horizontal',
            {
                'p-disabled': this.$props.disabled
            }
        ];
    }

    get rangeMin() {
        const _min =
            this.$props.min ??
            this.$props.n3 - (this.$props.p3 - this.$props.n3) * 0.1;
        return this.$props.showMinMax ? _min : this.$props.n3;
    }

    get rangeMax() {
        const _max =
            this.$props.max ??
            this.$props.p3 + (this.$props.p3 - this.$props.n3) * 0.1;
        return this.$props.showMinMax ? _max : this.$props.p3;
    }

    // by shkoh 20211116: min - n3 구간, critical range
    get rangeMinToN3Style() {
        return {
            left: '0%',
            width: this.rangeN3Position + '%',
            background: 'var(--critical)'
        };
    }

    // by shkoh 20211116: n3 - n2 구간, major range
    get rangeN3ToN2Style() {
        return {
            left: this.rangeN3Position + '%',
            width: this.rangeN2Position - this.rangeN3Position + '%',
            background: 'var(--major)'
        };
    }

    // by shkoh 20211116: n2 - n1 구간, warning range
    get rangeN2ToN1Style() {
        return {
            left: this.rangeN2Position + '%',
            width: this.rangeN1Position - this.rangeN2Position + '%',
            background: 'var(--warning)'
        };
    }

    // by shkoh 20211116: n1 - p1 구간, normal range
    get rangeN1ToP1Style() {
        return {
            left: this.rangeN1Position + '%',
            width: this.rangeP1Position - this.rangeN1Position + '%',
            background: 'var(--normal)'
        };
    }

    // by shkoh 20211116: p1 - p2 구간, warning range
    get rangeP1ToP2Style() {
        return {
            left: this.rangeP1Position + '%',
            width: this.rangeP2Position - this.rangeP1Position + '%',
            background: 'var(--warning)'
        };
    }

    // by shkoh 20211116: p2 - p3 구간, major range
    get rangeP2ToP3Style() {
        return {
            left: this.rangeP2Position + '%',
            width: this.rangeP3Position - this.rangeP2Position + '%',
            background: 'var(--major)'
        };
    }

    // by shkoh 20211116: p2 - p3 구간, critical range
    get rangeP3ToMaxStyle() {
        return {
            left: this.rangeP3Position + '%',
            width: 100 - this.rangeP3Position + '%',
            background: 'var(--critical)'
        };
    }

    get rangeN3Position() {
        if (this.$props.n3)
            return (
                ((this.$props.n3 < this.$props.min
                    ? 0
                    : this.$props.n3 - this.rangeMin) *
                    100) /
                (this.rangeMax - this.rangeMin)
            );
        else return 0;
    }

    get rangeN3HandleStyle() {
        return { left: this.rangeN3Position + '%' };
    }

    get rangeN2Position() {
        if (this.$props.n2)
            return (
                ((this.$props.n2 < this.$props.n3
                    ? this.$props.n3
                    : this.$props.n2 - this.rangeMin) *
                    100) /
                (this.rangeMax - this.rangeMin)
            );
        else return 0;
    }

    get rangeN2HandleStyle() {
        return { left: this.rangeN2Position + '%' };
    }

    get rangeN1Position() {
        if (this.$props.n1)
            return (
                ((this.$props.n1 < this.$props.n2
                    ? this.$props.n2
                    : this.$props.n1 - this.rangeMin) *
                    100) /
                (this.rangeMax - this.rangeMin)
            );
        else return 0;
    }

    get rangeN1HandleStyle() {
        return { left: this.rangeN1Position + '%' };
    }

    get rangeP1Position() {
        if (this.$props.p1)
            return (
                ((this.$props.p1 < this.$props.n1
                    ? this.$props.n1
                    : this.$props.p1 - this.rangeMin) *
                    100) /
                (this.rangeMax - this.rangeMin)
            );
        else return 100;
    }

    get rangeP1HandleStyle() {
        return { left: this.rangeP1Position + '%' };
    }

    get rangeP2Position() {
        if (this.$props.p2)
            return (
                ((this.$props.p2 < this.$props.p1
                    ? this.$props.p1
                    : this.$props.p2 - this.rangeMin) *
                    100) /
                (this.rangeMax - this.rangeMin)
            );
        else return 100;
    }

    get rangeP2HandleStyle() {
        return { left: this.rangeP2Position + '%' };
    }

    get rangeP3Position() {
        if (this.$props.p3)
            return (
                ((this.$props.p3 < this.$props.p2
                    ? this.$props.p2
                    : this.$props.p3 - this.rangeMin) *
                    100) /
                (this.rangeMax - this.rangeMin)
            );
        else return 100;
    }

    get rangeP3HandleStyle() {
        return { left: this.rangeP3Position + '%' };
    }
}
</script>

<style scoped>
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

.i-tag-position {
    margin-left: -6px;
    margin-top: 15px;
}

.i-warning {
    background: var(--warning);
}

.i-major {
    background: var(--major);
    color: var(--text-color);
}

.i-critical {
    background: var(--critical);
    color: var(--text-color);
}
</style>
