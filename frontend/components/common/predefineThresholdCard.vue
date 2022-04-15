<template>
    <Card id="predefineThresholdCard" :class="predefineThresholdCardClass">
        <template #header>
            <div class="p-d-flex">
                <div class="p-as-center p-pl-2 i-header-title">
                    {{ type }} ID: {{ id }}
                </div>
                <div class="p-ml-auto p-d-flex">
                    <div
                        v-if="is_analog"
                        class="p-field-checkbox p-mb-0 p-mr-4"
                    >
                        <Checkbox
                            id="is_valid"
                            v-model="is_valid"
                            :binary="true"
                        />
                        <label for="is_valid">최대/최소 유효값 정의</label>
                    </div>
                    <Button
                        class="p-button-rounded p-button-text p-button-help"
                        icon="pi pi-copy"
                        @click="copyThreshold"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text"
                        icon="pi pi-save"
                        :disabled="saveButtonDisabled || checkThresholdDI"
                        @click="saveThreshold"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-minus"
                        @click="deleteThreshold"
                    ></Button>
                </div>
            </div>
            <Divider class="p-my-1" />
        </template>
        <template #content>
            <div class="p-fluid p-formgrid p-grid p-input-filled">
                <div class="p-field p-col-2 p-mb-0">
                    <label for="p-sensor-threshold-name">사전 임계치명</label>
                    <InputText
                        id="p-sensor-threshold-name"
                        v-model="data.NAME"
                        type="text"
                        aria-describedby="p-sensor-threshold-name-help"
                        autocomplte="off"
                    >
                    </InputText>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="p-hold-time">상태 지속시간(초)</label>
                    <InputNumber
                        id="p-hold-time"
                        v-model="data.HOLD_TIME"
                        mode="decimal"
                        :min="0"
                        :max="86400"
                        show-buttons
                        button-layout="horizontal"
                        :step="1"
                        decrement-button-class="p-button-secondary"
                        decrement-button-icon="pi pi-minus"
                        increment-button-class="p-button-secondary"
                        increment-button-icon="pi pi-plus"
                        aria-describedby="func-num-help"
                        autocomplete="off"
                    ></InputNumber>
                </div>
                <div v-if="unit" class="p-field p-col-1 p-mb-0 p-as-end">
                    <label>단위: {{ unit }}</label>
                </div>
            </div>
            <Panel
                class="p-mt-2"
                header="임계치 정의"
                :toggleable="true"
                :collapsed="false"
            >
                <div v-if="is_analog && aiThresholdData !== null">
                    <threshold-analog
                        :show-min-max="aiThresholdData.IS_VALID === 1"
                        :n3.sync="aiThresholdData.POINT_N3"
                        :n2.sync="aiThresholdData.POINT_N2"
                        :n1.sync="aiThresholdData.POINT_N1"
                        :p1.sync="aiThresholdData.POINT_P1"
                        :p2.sync="aiThresholdData.POINT_P2"
                        :p3.sync="aiThresholdData.POINT_P3"
                        :min.sync="aiThresholdData.VALID_MIN"
                        :max.sync="aiThresholdData.VALID_MAX"
                        :disabled="false"
                    ></threshold-analog>
                </div>
                <ScrollPanel
                    v-else-if="!is_analog && diThresholdData !== null"
                    :style="{
                        'max-height': '50vh',
                        height: heightDIThresholdContent,
                    }"
                >
                    <div class="p-d-flex p-flex-column">
                        <threshold-digital
                            :init-di="dbDiThresholdData && dbDiThresholdData.DI"
                            :di.sync="diThresholdData.DI"
                            :is-editable="true"
                            :level-codes="levelCodes"
                            style="padding: 0"
                            @delete="deleteThresholdDigital"
                        ></threshold-digital>
                        <Button
                            class="p-mt-2"
                            icon="pi pi-plus"
                            :style="{
                                width: '24px',
                                height: '24px',
                                padding: '0px',
                            }"
                            @click="addThresholdDigital"
                        ></Button>
                    </div>
                </ScrollPanel>
            </Panel>
        </template>
    </Card>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type PredefineThreshold = {
    [index: string]: string | number;
    NAME: string;
    HOLD_TIME: number;
};

type AnalogThreshold = {
    [index: string]: number | undefined;
    ID: number;
    VALID_MIN: number;
    VALID_MAX: number;
    IS_VALID: number | undefined;
    POINT_N3: number;
    POINT_N2: number;
    POINT_N1: number;
    POINT_P1: number;
    POINT_P2: number;
    POINT_P3: number;
};

interface DIValue {
    INDEX: number;
    LEVEL: number;
    LABEL: string;
    isEditableGrade: boolean | undefined;
    isEditableValue: boolean | undefined;
    hasSameINDEX: boolean | undefined;
}

type DigitalThreshold = {
    [index: string]: number | string | Array<DIValue>;
    ID: number;
    DI: Array<DIValue>;
};

@Component<PredefineThresholdCard>({
    props: {
        id: Number,
        type: String,
        unit: String,
        name: String,
        holdTime: Number,
        levelCodes: Array,
    },
    watch: {
        saveButtonDisabled(is_flag: boolean) {
            this.$emit('change', is_flag || this.checkThresholdDI);
        },
        checkThresholdDI(is_flag: boolean) {
            this.$emit('change', this.saveButtonDisabled || is_flag);
        },
    },
    apollo: {
        dbAiThresholdData: {
            query: gql`
                query PredefineThresholdByAI($ID: Int!) {
                    PredefineThresholdByAI(ID: $ID) {
                        ID
                        VALID_MIN
                        VALID_MAX
                        IS_VALID
                        POINT_N3
                        POINT_N2
                        POINT_N1
                        POINT_P1
                        POINT_P2
                        POINT_P3
                    }
                }
            `,
            prefetch: false,
            fetchPolicy: 'no-cache',
            variables(): any {
                return {
                    ID: this.id ? this.id : -1,
                };
            },
            update: ({ PredefineThresholdByAI }) => PredefineThresholdByAI,
            result({ loading, data }) {
                if (!loading) {
                    const { PredefineThresholdByAI } = data;

                    if (PredefineThresholdByAI) {
                        this.apolloFetchAI(PredefineThresholdByAI);
                    }
                }
            },
        },
        dbDiThresholdData: {
            query: gql`
                query PredefineThresholdByDI($ID: Int!) {
                    PredefineThresholdByDI(ID: $ID) {
                        ID
                        DI {
                            INDEX
                            LEVEL
                            LABEL
                        }
                    }
                }
            `,
            prefetch: false,
            fetchPolicy: 'no-cache',
            variables(): any {
                return {
                    ID: this.id ? this.id : -1,
                };
            },
            update: ({ PredefineThresholdByDI }) => PredefineThresholdByDI,
            result({ loading, data }) {
                if (!loading) {
                    const { PredefineThresholdByDI } = data;

                    if (PredefineThresholdByDI) {
                        this.apolloFetchDI(PredefineThresholdByDI);
                    }
                }
            },
        },
    },
})
export default class PredefineThresholdCard extends Vue {
    initData: PredefineThreshold = {
        NAME: this.$props.name,
        HOLD_TIME: this.$props.holdTime,
    };

    data: PredefineThreshold = {
        NAME: this.$props.name,
        HOLD_TIME: this.$props.holdTime,
    };

    dbAiThresholdData: AnalogThreshold | null = null;
    dbDiThresholdData: DigitalThreshold | null = null;

    aiThresholdData: AnalogThreshold = {
        ID: 0,
        VALID_MIN: 0,
        VALID_MAX: 0,
        IS_VALID: 0,
        POINT_N3: 0,
        POINT_N2: 0,
        POINT_N1: 0,
        POINT_P1: 0,
        POINT_P2: 0,
        POINT_P3: 0,
    };

    diThresholdData: DigitalThreshold = {
        ID: 0,
        DI: [],
    };

    apolloFetchAI(_data: AnalogThreshold) {
        for (const key of Object.keys(this.aiThresholdData)) {
            this.aiThresholdData[key] = _data[key];
        }
    }

    apolloFetchDI(_data: DigitalThreshold) {
        for (const key of Object.keys(this.diThresholdData)) {
            if (key === 'DI') {
                _data[key].forEach((dv: DIValue) => {
                    this.diThresholdData[key].push({
                        INDEX: dv.INDEX,
                        LEVEL: dv.LEVEL,
                        LABEL: dv.LABEL,
                        isEditableGrade: false,
                        isEditableValue: false,
                        hasSameINDEX: false,
                    });
                });
            } else {
                this.diThresholdData[key] = _data[key];
            }
        }
    }

    addThresholdDigital() {
        if (this.diThresholdData.DI.length === 30) {
            this.$toast.add({
                severity: 'error',
                summary: '임계치 초과',
                detail: `임계값은 최대 30개까지 가능합니다`,
                life: 1200,
            });
            return;
        }

        this.diThresholdData.DI.push({
            INDEX: this.minimumDiThresholdIndex,
            LEVEL: 0,
            LABEL: '새로운 임계값',
            isEditableGrade: false,
            isEditableValue: false,
            hasSameINDEX: false,
        });
    }

    deleteThresholdDigital(index: number) {
        this.diThresholdData.DI.splice(index, 1);
    }

    copyThreshold() {
        const copy_data = {
            NAME: this.data.NAME,
            HOLD_TIME: this.data.HOLD_TIME,
        };

        if (this.is_analog) {
            for (const key of Object.keys(this.aiThresholdData)) {
                let val = this.aiThresholdData[key];
                if (
                    (key === 'VALID_MIN' || key === 'VALID_MAX') &&
                    this.aiThresholdData.IS_VALID === 0
                ) {
                    val = undefined;
                }

                Object.defineProperty(copy_data, key, {
                    value: val,
                    configurable: true,
                    enumerable: true,
                    writable: true,
                });
            }
        } else {
            const _di = Array<any>();
            for (let idx = 0; idx < this.diThresholdData.DI.length; idx++) {
                const { INDEX, LEVEL, LABEL } = this.diThresholdData.DI[idx];
                _di.push({ INDEX, LEVEL, LABEL });
            }

            Object.defineProperty(copy_data, 'DI', {
                value: _di,
                configurable: true,
                enumerable: true,
                writable: true,
            });
        }

        this.$emit('copy', this.is_analog, this.$props.id, copy_data);
    }

    saveThreshold() {
        // by shkoh 20220107: 임계치의 저장은 크게 2가지 형태로 구분(아날로그 / 디지털)
        this.$emit(
            'save',
            this.is_analog,
            this.data.NAME,
            this.changedThresholdData
        );
    }

    deleteThreshold() {
        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `[${this.data.NAME}] 임계치 항목을 삭제하시겠습니까?\n해당 임계치 정보는 영구히 삭제됩니다`,
            header: `${this.$props.type} 임계치 - ${this.data.NAME} 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.$emit(
                    'delete',
                    this.is_analog,
                    this.$props.id,
                    this.data.NAME
                );
            },
        });
    }

    get saveButtonDisabled(): boolean {
        let is_disabled = !this.isDiffThresholdInfo;

        if (is_disabled === true && this.is_analog) {
            is_disabled = !this.isDiffAiThresholdData;
        } else if (is_disabled === true && !this.is_analog) {
            is_disabled = !this.isDiffDiThresholdData;
        }

        return is_disabled;
    }

    get checkThresholdDI(): boolean {
        let checker = false;

        // by shkoh 20220111: DI인 경우에 Threshold가 Editing 상황이거나, INDEX가 중복 상황에서는 save button을 비활성화한다
        if (!this.is_analog) {
            for (let idx = 0; idx < this.diThresholdData.DI.length; idx++) {
                const { isEditableGrade, isEditableValue, hasSameINDEX } =
                    this.diThresholdData.DI[idx];

                if (isEditableGrade || isEditableValue || hasSameINDEX) {
                    checker = true;
                    break;
                }
            }
        }

        return checker;
    }

    get predefineThresholdCardClass(): Array<string | object> {
        return [{ 'i-editable': !this.saveButtonDisabled }];
    }

    get is_analog(): boolean {
        return this.$props.type === 'Analog';
    }

    get is_valid(): boolean {
        return this.aiThresholdData?.IS_VALID === 1;
    }

    set is_valid(_new_is_valid: boolean) {
        if (this.aiThresholdData !== null) {
            this.aiThresholdData.IS_VALID = _new_is_valid ? 1 : 0;
        }
    }

    get isDiffThresholdInfo(): boolean {
        let is_diff = false;

        for (const key of Object.keys(this.data)) {
            if (this.data[key] !== this.initData[key]) {
                is_diff = true;
                break;
            }
        }

        return is_diff;
    }

    get isDiffAiThresholdData(): boolean {
        let is_diff = false;

        if (this.aiThresholdData && this.dbAiThresholdData) {
            for (const key of Object.keys(this.aiThresholdData)) {
                if (this.aiThresholdData[key] !== this.dbAiThresholdData[key]) {
                    is_diff = true;
                    break;
                }
            }
        }

        return is_diff;
    }

    get isDiffDiThresholdData(): boolean {
        let is_diff = false;

        if (this.diThresholdData && this.dbDiThresholdData) {
            if (this.diThresholdData.ID !== this.dbDiThresholdData.ID)
                is_diff = true;
            else if (
                this.diThresholdData.DI.length !==
                this.dbDiThresholdData.DI.length
            ) {
                is_diff = true;
            } else {
                for (let idx = 0; idx < this.diThresholdData.DI.length; idx++) {
                    const { INDEX, LEVEL, LABEL } =
                        this.diThresholdData.DI[idx];

                    if (
                        INDEX !== this.dbDiThresholdData.DI[idx].INDEX ||
                        LEVEL !== this.dbDiThresholdData.DI[idx].LEVEL ||
                        LABEL !== this.dbDiThresholdData.DI[idx].LABEL
                    ) {
                        is_diff = true;
                        break;
                    }
                }
            }
        }

        return is_diff;
    }

    get minimumDiThresholdIndex(): number {
        let min = 0;

        for (let seq = 0; seq < 30; seq++) {
            const has_seq = this.diThresholdData.DI.some(
                (d: DIValue) => d.INDEX === seq
            );
            if (!has_seq) {
                min = seq;
                break;
            }
        }

        return min;
    }

    get heightDIThresholdContent(): string {
        let content_height = 24 + 12;

        this.diThresholdData.DI.forEach((d: DIValue) => {
            let di_heihgt = 6;
            if (d.isEditableGrade || d.isEditableValue) di_heihgt += 53;
            else di_heihgt += 40;

            content_height += di_heihgt;
        });

        return `${content_height}px`;
    }

    get changedThresholdData(): object {
        const changed_data = {
            ID: this.$props.id,
        };

        // by shkoh 202201107: 저장할 임계치 데이터의 기본값 들 중에서 변경될 값을 비교하여 저장
        for (const key of Object.keys(this.data)) {
            if (this.data[key] !== this.initData[key]) {
                Object.defineProperty(changed_data, key, {
                    value: this.data[key],
                    configurable: true,
                    enumerable: true,
                    writable: true,
                });
            }
        }

        // by shkoh 20220110: 아날로그 임계치인 경우
        if (this.is_analog && this.dbAiThresholdData) {
            for (const key of Object.keys(this.aiThresholdData)) {
                if (this.aiThresholdData[key] !== this.dbAiThresholdData[key]) {
                    Object.defineProperty(changed_data, key, {
                        value: this.aiThresholdData[key],
                        configurable: true,
                        enumerable: true,
                        writable: true,
                    });
                }
            }
        } else if (this.dbDiThresholdData) {
            const _di = Array<any>();
            for (let idx = 0; idx < this.diThresholdData.DI.length; idx++) {
                const { INDEX, LEVEL, LABEL } = this.diThresholdData.DI[idx];
                _di.push({ INDEX, LEVEL, LABEL });
            }

            Object.defineProperty(changed_data, 'DI', {
                value: _di,
                configurable: true,
                enumerable: true,
                writable: true,
            });
        }

        return changed_data;
    }
}
</script>

<style lang="scss" scoped>
#predefineThresholdCard::v-deep {
    width: 100%;
    border: 1px solid var(--surface-d);

    .i-header-title {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .p-card-header {
        padding: 0.3rem 0.8rem 0 0.8rem;
    }

    .p-card-content {
        padding: 0;
    }

    .p-panel .p-panel-content {
        padding: 1.2rem 1rem;
    }
}

#predefineThresholdCard.i-editable::v-deep {
    border-left: 10px solid;
    border-color: var(--yellow-500);
}
</style>
