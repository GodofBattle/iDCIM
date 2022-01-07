<template>
    <div>
        <div v-if="!isEditable">
            <Tag
                v-for="dval of di"
                :key="dval.INDEX"
                :class="containerClass(dval.LEVEL)"
            >
                {{ dval.INDEX }}: {{ dval.LABEL }}
            </Tag>
        </div>
        <div v-else class="i-editable-threshold-digital">
            <div v-for="(data, index) in di" :key="index">
                <div
                    :class="[
                        'p-d-inline-flex',
                        'p-px-2',
                        'p-my-1',
                        'p-ai-center',
                        'i-digit-row'
                    ]"
                >
                    <div class="p-mr-2">
                        <Inplace
                            class="p-py-3"
                            :active.sync="data.isEditableGrade"
                        >
                            <template #display>
                                <span :class="thresholdEditClass(data.LEVEL)">
                                    {{ levelName(data.LEVEL) }}
                                </span>
                            </template>
                            <template #content>
                                <span class="p-inputgroup">
                                    <Dropdown
                                        v-model="data.LEVEL"
                                        :options="levelGrade"
                                        option-label="NAME"
                                        option-value="VALUE"
                                        data-key="CODE"
                                        append-to="body"
                                        auto-complete="off"
                                    ></Dropdown>
                                    <Button
                                        class="p-button-secondary p-button-sm"
                                        icon="pi pi-check"
                                        @click="
                                            onCloseEditorMode(
                                                index,
                                                'isEditableGrade'
                                            )
                                        "
                                    ></Button>
                                </span>
                            </template>
                        </Inplace>
                    </div>
                    <div class="p-mr-2">
                        <Inplace
                            class="p-py-3"
                            :active.sync="data.isEditableValue"
                        >
                            <template #display>
                                <span>
                                    {{ data.INDEX }}: {{ data.LABEL }}
                                </span>
                            </template>
                            <template #content>
                                <span class="p-d-inline-flex">
                                    <span>
                                        <InputNumber
                                            id="threshold_digit_index"
                                            v-model="data.INDEX"
                                            mode="decimal"
                                            :min="0"
                                            :max="29"
                                            show-buttons
                                            button-layout="horizontal"
                                            :step="1"
                                            decrement-button-class="p-button-secondary"
                                            decrement-button-icon="pi pi-minus"
                                            increment-button-class="p-button-secondary"
                                            increment-button-icon="pi pi-plus"
                                            aria-describedby="func-num-help"
                                            auto-complete="off"
                                            :input-style="{ width: '60px' }"
                                            @input="
                                                inputThresholdDigitIndex(
                                                    index,
                                                    data.INDEX
                                                )
                                            "
                                        ></InputNumber>
                                    </span>
                                    <span class="p-px-1 p-py-2">:</span>
                                    <span class="p-inputgroup">
                                        <InputText
                                            id="threshold_digit_label"
                                            v-model="data.LABEL"
                                            type="text"
                                            auto-complete="off"
                                            :input-style="{ width: '200px' }"
                                        >
                                        </InputText>
                                        <Button
                                            class="
                                                p-button-secondary p-button-sm
                                            "
                                            icon="pi pi-check"
                                            @click="
                                                onCloseEditorMode(
                                                    index,
                                                    'isEditableValue'
                                                )
                                            "
                                        ></Button>
                                    </span>
                                </span>
                            </template>
                        </Inplace>
                    </div>
                    <div v-if="data.hasSameINDEX" class="p-mx-2">
                        <span class="p-error">{{ same_index_message }}</span>
                    </div>
                    <div class="p-mr-2">
                        <Button
                            icon="pi pi-times"
                            class="
                                p-button-rounded p-button-danger p-button-text
                            "
                            @click="deleteDigitalValue(index)"
                        ></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<ThresholdDigital>({
    props: {
        initDi: {
            type: Array,
            default: []
        },
        di: {
            type: Array,
            default: []
        },
        levelCodes: Array,
        isEditable: {
            type: Boolean,
            default: false
        }
    }
})
export default class ThresholdDigital extends Vue {
    // by shkoh 20220116: 임계치 수정 시에, 값의 변화를 확인하기 위한 초기값
    init_value = 0;
    same_index_message = 'DI 값 중복';

    containerClass(level: number): Array<string | object> {
        return [
            'p-mt-1',
            'p-mr-2',
            'p-mb-1',
            'p-px-3',
            'i-digital-tag',
            {
                'i-normal': level === 0,
                'i-warning': level === 1,
                'i-major': level === 2,
                'i-critical': level === 3
            }
        ];
    }

    thresholdEditClass(level: number): Array<string | object> {
        return [
            'p-p-2',
            'p-text-center',
            'i-level',
            {
                'i-normal': level === 0,
                'i-warning': level === 1,
                'i-major': level === 2,
                'i-critical': level === 3
            }
        ];
    }

    levelName(level: number): string {
        return this.$props.levelCodes
            .filter((code: any) => code.VALUE === level)
            .pop().NAME;
    }

    deleteDigitalValue(index: number) {
        this.$emit('delete', index);
    }

    get levelGrade(): Array<any> {
        const lvls = this.$props.levelCodes.filter((c: any) => c.VALUE < 4);
        return lvls;
    }

    onCloseEditorMode(index: number, target: string) {
        if (!this.$props.di[index].hasSameINDEX) {
            this.$props.di[index][target] = false;
        } else {
            this.$toast.add({
                severity: 'warn',
                summary: 'DI 값 중복',
                detail: `임계치의 값은 중복될 수 없습니다`,
                life: 1200
            });
        }
    }

    inputThresholdDigitIndex(index: number, value: number) {
        let has_same_index = false;

        // by shkoh 20220107: input 이벤트가 일어나지 않은 모든 항목들 중에 INDEX가 동일한 경우에는 'DI 값 중복' 메시지를 보여줌
        this.$props.di.forEach((d: any, _idx: number, _arr: []) => {
            if (index !== _idx && d.INDEX === value) {
                d.hasSameINDEX = true;
                has_same_index = true;
            } else {
                d.hasSameINDEX = false;
            }
        });

        this.$props.di[index].hasSameINDEX = has_same_index;
    }
}
</script>

<style scoped>
.i-editable-threshold-digital {
    margin: 0rem;
}

.i-digital-tag {
    font-size: 1.25rem;
    line-height: 1.7;
}

.i-normal {
    background: var(--normal);
    color: var(--text-color);
}

.i-warning {
    background: var(--warning);
    color: var(--primary-color-text);
}

.i-major {
    background: var(--major);
    color: var(--text-color);
}

.i-critical {
    background: var(--critical);
    color: var(--text-color);
}

.i-digit-row {
    border-radius: var(--border-radius);
    background: #304562;
    cursor: pointer;
}

.i-level {
    font-size: 1.05rem;
    border-radius: var(--border-radius);
}
</style>
