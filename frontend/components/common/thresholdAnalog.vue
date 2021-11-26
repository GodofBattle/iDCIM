<template>
    <div class="p-grid p-ai-center vertical-container">
        <div
            v-if="showMinMax"
            class="p-col-fiexed p-text-center p-py-5"
            :style="{ width: new_value_active.min ? '100px' : '60px' }"
        >
            <Inplace :active.sync="new_value_active.min" :class="editorClass">
                <template #display>
                    <span>Min: {{ min }}</span>
                </template>
                <template #content>
                    <div class="p-inputgroup">
                        <InputNumber
                            v-model="inputValueMin"
                            auto-focus
                            :min-fraction-digits="1"
                            :max-fraction-digits="1"
                            :max="n3"
                            :input-style="{ width: '60px' }"
                            @blur="onInputBlur('min')"
                            @keyup.enter="onInputBlur('min')"
                        />
                        <Button
                            class="p-button-secondary p-button-sm"
                            icon="pi pi-times"
                            @click="onInputBlur('min')"
                        ></Button>
                    </div>
                </template>
            </Inplace>
        </div>
        <div
            class="p-col-fiexed p-text-center p-py-5"
            :style="{ width: new_value_active.n3 ? '100px' : '60px' }"
        >
            <span>
                <Inplace :active.sync="new_value_active.n3">
                    <template #display>
                        <Tag :value="n3" class="i-critical"></Tag>
                    </template>
                    <template #content>
                        <div class="p-inputgroup">
                            <InputNumber
                                v-model="inputValueN3"
                                auto-focus
                                :min-fraction-digits="1"
                                :max-fraction-digits="1"
                                :min="min"
                                :max="n2"
                                :input-style="{ width: '60px' }"
                                @blur="onInputBlur('n3')"
                                @keyup.enter="onInputBlur('n3')"
                            />
                            <Button
                                class="p-button-secondary p-button-sm"
                                icon="pi pi-times"
                                @click="onInputBlur('n3')"
                            ></Button>
                        </div>
                    </template>
                </Inplace>
            </span>
        </div>
        <div class="p-col p-py-5">
            <div
                ref="container"
                :class="containerClass"
                :style="{ opacity: 1 }"
            >
                <span class="p-slider-range" :style="rangeN3ToN2Style"></span>
                <span class="p-slider-range" :style="rangeN2ToN1Style"></span>
                <span class="p-slider-range" :style="rangeN1ToP1Style"></span>
                <span class="p-slider-range" :style="rangeP1ToP2Style"></span>
                <span class="p-slider-range" :style="rangeP2ToP3Style"></span>
                <span
                    v-if="n1 !== null"
                    class="p-slider-handle"
                    :style="rangeN1HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="n1"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                    @touchstart="onDragStart($event, 'n1')"
                    @touchmove="onDrag($event, 'n1')"
                    @touchend="onDragEnd($event, 'n1')"
                    @mousedown="onMouseDown($event, 'n1')"
                >
                    <Inplace :active.sync="new_value_active.n1">
                        <template #display>
                            <Tag
                                :value="n1"
                                class="i-tag-position i-warning"
                            ></Tag>
                        </template>
                        <template #content>
                            <div class="p-inputgroup i-tag-position">
                                <InputNumber
                                    v-model="inputValueN1"
                                    auto-focus
                                    :min-fraction-digits="1"
                                    :max-fraction-digits="1"
                                    :min="n2"
                                    :max="p1 - barStep"
                                    :input-style="{ width: '60px' }"
                                    @blur="onInputBlur('n1')"
                                    @keyup.enter="onInputBlur('n1')"
                                />
                                <Button
                                    class="p-button-secondary p-button-sm"
                                    icon="pi pi-times"
                                    @click="onInputBlur('n1')"
                                ></Button>
                            </div>
                        </template>
                    </Inplace>
                </span>
                <span
                    v-if="p1 !== null"
                    class="p-slider-handle"
                    :style="rangeP1HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="p1"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                    @touchstart="onDragStart($event, 'p1')"
                    @touchmove="onDrag($event, 'p1')"
                    @touchend="onDragEnd($event, 'p1')"
                    @mousedown="onMouseDown($event, 'p1')"
                >
                    <Inplace :active.sync="new_value_active.p1">
                        <template #display>
                            <Tag
                                :value="p1"
                                class="i-tag-position-top i-warning"
                            ></Tag>
                        </template>
                        <template #content>
                            <div
                                class="p-inputgroup i-tag-position-top"
                                :style="{ 'margin-top': '-32px' }"
                            >
                                <InputNumber
                                    v-model="inputValueP1"
                                    auto-focus
                                    :min-fraction-digits="1"
                                    :max-fraction-digits="1"
                                    :min="n1 + barStep"
                                    :max="p2"
                                    :input-style="{ width: '60px' }"
                                    @blur="onInputBlur('p1')"
                                    @keyup.enter="onInputBlur('p1')"
                                />
                                <Button
                                    class="p-button-secondary p-button-sm"
                                    icon="pi pi-times"
                                    @click="onInputBlur('p1')"
                                ></Button>
                            </div>
                        </template>
                    </Inplace>
                </span>
                <span
                    v-if="n2 !== null"
                    class="p-slider-handle"
                    :style="rangeN2HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="n2"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                    @touchstart="onDragStart($event, 'n2')"
                    @touchmove="onDrag($event, 'n2')"
                    @touchend="onDragEnd($event, 'n2')"
                    @mousedown="onMouseDown($event, 'n2')"
                >
                    <Inplace :active.sync="new_value_active.n2">
                        <template #display>
                            <Tag
                                :value="n2"
                                class="i-tag-position-top i-major"
                            ></Tag>
                        </template>
                        <template #content>
                            <div
                                class="p-inputgroup i-tag-position-top"
                                :style="{ 'margin-top': '-32px' }"
                            >
                                <InputNumber
                                    v-model="inputValueN2"
                                    auto-focus
                                    :min-fraction-digits="1"
                                    :max-fraction-digits="1"
                                    :min="n3"
                                    :max="n1"
                                    :input-style="{ width: '60px' }"
                                    @blur="onInputBlur('n2')"
                                    @keyup.enter="onInputBlur('n2')"
                                />
                                <Button
                                    class="p-button-secondary p-button-sm"
                                    icon="pi pi-times"
                                    @click="onInputBlur('n2')"
                                ></Button>
                            </div>
                        </template>
                    </Inplace>
                </span>
                <span
                    v-if="p2 !== null"
                    class="p-slider-handle"
                    :style="rangeP2HandleStyle"
                    tabindex="0"
                    role="slider"
                    :aria-valuemin="min"
                    :aria-valuenow="p2"
                    :aria-valuemax="max"
                    :aria-labelledby="ariaLabelledBy"
                    @touchstart="onDragStart($event, 'p2')"
                    @touchmove="onDrag($event, 'p2')"
                    @touchend="onDragEnd($event, 'p2')"
                    @mousedown="onMouseDown($event, 'p2')"
                >
                    <Inplace :active.sync="new_value_active.p2">
                        <template #display>
                            <Tag
                                :value="p2"
                                class="i-tag-position i-major"
                            ></Tag>
                        </template>
                        <template #content>
                            <div class="p-inputgroup i-tag-position">
                                <InputNumber
                                    v-model="inputValueP2"
                                    auto-focus
                                    :min-fraction-digits="1"
                                    :max-fraction-digits="1"
                                    :min="p1"
                                    :max="p3"
                                    :input-style="{ width: '60px' }"
                                    @blur="onInputBlur('p2')"
                                    @keyup.enter="onInputBlur('p2')"
                                />
                                <Button
                                    class="p-button-secondary p-button-sm"
                                    icon="pi pi-times"
                                    @click="onInputBlur('p2')"
                                ></Button>
                            </div>
                        </template>
                    </Inplace>
                </span>
            </div>
        </div>
        <div
            class="p-col-fiexed p-text-center p-py-5"
            :style="{ width: new_value_active.p3 ? '120px' : '80px' }"
        >
            <span>
                <Inplace :active.sync="new_value_active.p3">
                    <template #display>
                        <Tag :value="p3" class="i-critical"></Tag>
                    </template>
                    <template #content>
                        <div class="p-inputgroup">
                            <InputNumber
                                v-model="inputValueP3"
                                auto-focus
                                :min-fraction-digits="1"
                                :max-fraction-digits="1"
                                :min="p2"
                                :max="showMinMax ? max : null"
                                :input-style="{ width: '60px' }"
                                @blur="onInputBlur('p3')"
                                @keyup.enter="onInputBlur('p3')"
                            />
                            <Button
                                class="p-button-secondary p-button-sm"
                                icon="pi pi-times"
                                @click="onInputBlur('p3')"
                            ></Button>
                        </div>
                    </template>
                </Inplace>
            </span>
        </div>
        <div
            v-if="showMinMax"
            class="p-col-fiexed p-text-center p-py-5"
            :style="{ width: new_value_active.max ? '120px' : '80px' }"
        >
            <Inplace :active.sync="new_value_active.max" :class="editorClass">
                <template #display>
                    <span>Max: {{ max }}</span>
                </template>
                <template #content>
                    <div class="p-inputgroup">
                        <InputNumber
                            v-model="inputValueMax"
                            auto-focus
                            :min-fraction-digits="1"
                            :max-fraction-digits="1"
                            :min="p3"
                            :input-style="{ width: '60px' }"
                            @blur="onInputBlur('max')"
                            @keyup.enter="onInputBlur('max')"
                        />
                        <Button
                            class="p-button-secondary p-button-sm"
                            icon="pi pi-times"
                            @click="onInputBlur('max')"
                        ></Button>
                    </div>
                </template>
            </Inplace>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import DomHandler from '@/plugins/primevue.DomHandler';

type EditControl = {
    [index: string]: boolean;
    min: boolean;
    max: boolean;
    n3: boolean;
    n2: boolean;
    n1: boolean;
    p1: boolean;
    p2: boolean;
    p3: boolean;
};

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
    },
    watch: {
        showMinMax(_is_show) {
            // by shkoh 20211126: 최대/최소 유효값을 지정할 때, min / max 값이 정해져 있지 않은 경우 min / max 값을 강제 지정
            if (_is_show) {
                if (this.$props.max === undefined) {
                    this.$emit('update:max', this.$props.p3);
                } else if (
                    this.$props.max !== undefined &&
                    this.$props.max < this.$props.p3
                ) {
                    this.$emit('update:max', this.$props.p3);
                }

                if (this.$props.min === undefined) {
                    this.$emit('update:min', this.$props.n3);
                } else if (
                    this.$props.min !== undefined &&
                    this.$props.min > this.$props.n3
                ) {
                    this.$emit('update:min', this.$props.n3);
                }
            }
        }
    }
})
export default class ThresholdAnalog extends Vue {
    $refs!: {
        container: any;
    };

    dragging = false;
    handleTarget: any = null;

    initX: number | null = null;
    initY: number | null = null;
    barWidth: number | null = null;
    barHeight: number | null = null;

    dragListener: any = null;
    dragEndListener: any = null;

    new_value_active: EditControl = {
        min: false,
        max: false,
        n3: false,
        n2: false,
        n1: false,
        p1: false,
        p2: false,
        p3: false
    };

    beforeDestroy() {
        this.unbindDragListeners();
    }

    get containerClass(): Array<string | object> {
        return [
            'p-slider p-component',
            'p-slider-horizontal',
            {
                'p-disabled': this.$props.disabled
            }
        ];
    }

    get editorClass(): Array<string | object> {
        return [
            {
                'p-disabled': this.$props.disabled
            }
        ];
    }

    get inputValueMin() {
        return this.$props.min;
    }

    set inputValueMin(_new_value) {
        this.$emit('update:min', _new_value);
    }

    get inputValueMax() {
        return this.$props.max;
    }

    set inputValueMax(_new_value) {
        this.$emit('update:max', _new_value);
    }

    get inputValueN3() {
        return this.$props.n3;
    }

    set inputValueN3(_new_value) {
        this.$emit('update:n3', _new_value);
    }

    get inputValueN2() {
        return this.$props.n2;
    }

    set inputValueN2(_new_value) {
        this.$emit('update:n2', _new_value);
    }

    get inputValueN1() {
        return this.$props.n1;
    }

    set inputValueN1(_new_value) {
        this.$emit('update:n1', _new_value);
    }

    get inputValueP1() {
        return this.$props.p1;
    }

    set inputValueP1(_new_value) {
        this.$emit('update:p1', _new_value);
    }

    get inputValueP2() {
        return this.$props.p2;
    }

    set inputValueP2(_new_value) {
        this.$emit('update:p2', _new_value);
    }

    get inputValueP3() {
        return this.$props.p3;
    }

    set inputValueP3(_new_value) {
        this.$emit('update:p3', _new_value);
    }

    get barStep() {
        const range = this.$props.p3 - this.$props.n3;
        if (range < 10) return 0.1;
        else if (range < 100) return 1;
        else return (this.$props.p3 - this.$props.n3) / 100;
    }

    get rangeMin() {
        return this.$props.n3;
    }

    get rangeMax() {
        return this.$props.p3;
    }

    // by shkoh 20211116: n3 - n2 구간, major range
    get rangeN3ToN2Style() {
        return {
            left: '0%',
            width: this.rangeN2Position + '%',
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
            width: 100 - this.rangeP2Position + '%',
            background: 'var(--major)'
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
        4;
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

    updateDomData() {
        const rect = this.$refs.container.getBoundingClientRect();

        this.initX = rect.left + DomHandler.getWindowScrollLeft();
        this.initY = rect.top + DomHandler.getWindowScrollTop();

        this.barWidth = this.$refs.container.offsetWidth;
        this.barHeight = this.$refs.container.offsetHeight;
    }

    setValue(event: any) {
        let handleValue;

        const pageX = event.touches ? event.touches[0].pageX : event.pageX;

        handleValue =
            ((pageX - (this.initX ?? 0)) * 100) / (this.barWidth ?? 1);

        let newValue =
            (this.rangeMax - this.rangeMin) * (handleValue / 100) +
            this.rangeMin;

        if (this.barStep) {
            const oldValue = this.$props[this.handleTarget];
            const diff = newValue - oldValue;

            if (diff < 0) {
                newValue =
                    oldValue +
                    Math.ceil(
                        newValue / this.barStep - oldValue / this.barStep
                    ) *
                        this.barStep;
            } else if (diff > 0) {
                newValue =
                    oldValue +
                    Math.floor(
                        newValue / this.barStep - oldValue / this.barStep
                    ) *
                        this.barStep;
            }
        } else {
            newValue = Math.floor(newValue);
        }

        this.updateModel(event, newValue);
    }

    updateModel(event: any, value: any) {
        let newValue = parseFloat(value.toFixed(10));

        if (newValue < this.rangeMin) newValue = this.rangeMin;
        else if (newValue > this.rangeMax) newValue = this.rangeMax;

        switch (this.handleTarget) {
            case 'n3': {
                if (newValue > this.$props.n2) newValue = this.$props.n2;
                break;
            }
            case 'n2': {
                if (newValue < this.$props.n3) newValue = this.$props.n3;
                else if (newValue > this.$props.n1) newValue = this.$props.n1;
                break;
            }
            case 'n1': {
                if (newValue < this.$props.n2) newValue = this.$props.n2;
                else if (newValue >= this.$props.p1)
                    newValue = this.$props.p1 - (this.barStep ?? 1);
                break;
            }
            case 'p1': {
                if (newValue <= this.$props.n1)
                    newValue = this.$props.n1 + (this.barStep ?? 1);
                else if (newValue > this.$props.p2) newValue = this.$props.p2;
                break;
            }
            case 'p2': {
                if (newValue < this.$props.p1) newValue = this.$props.p1;
                else if (newValue > this.$props.p3) newValue = this.$props.p3;
                break;
            }
            case 'p3': {
                if (newValue < this.$props.p2) newValue = this.$props.p2;
                break;
            }
        }

        this.$emit(`update:${this.handleTarget}`, newValue);
    }

    onDrageStart(event: any, target: any) {
        if (this.$props.disabled) {
            return;
        }

        DomHandler.addClass(this.$el, 'p-slider-sliding');

        this.dragging = true;
        this.updateDomData();
        this.handleTarget = target;
        event.preventDefault();
    }

    onDrag(event: any) {
        if (this.dragging) {
            this.setValue(event);
            event.preventDefault();
        }
    }

    onDragEnd(event: any) {
        if (this.dragging) {
            this.dragging = false;

            DomHandler.removeClass(this.$el, 'p-slider-sliding');
        }
    }

    onMouseDown(event: any, target: any) {
        if (!this.new_value_active[target]) {
            this.bindDragListeners();
            this.onDrageStart(event, target);
        }
    }

    bindDragListeners() {
        if (!this.dragListener) {
            this.dragListener = this.onDrag.bind(this);
            document.addEventListener('mousemove', this.dragListener);
        }

        if (!this.dragEndListener) {
            this.dragEndListener = this.onDragEnd.bind(this);
            document.addEventListener('mouseup', this.dragEndListener);
        }
    }

    unbindDragListeners() {
        if (this.dragListener) {
            document.removeEventListener('mousemove', this.dragListener);
            this.dragListener = null;
        }

        if (this.dragEndListener) {
            document.removeEventListener('mouseup', this.dragEndListener);
            this.dragEndListener = null;
        }
    }

    onInputBlur(target: string) {
        this.new_value_active[target] = false;
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

.i-tag-position-top {
    margin-left: auto;
    margin-top: -24px;
    position: absolute;
}

.i-tag-position {
    margin-left: auto;
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

.i-input-minmax {
    width: 50px;
}
</style>
