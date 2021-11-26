<template>
    <Card id="predefineThresholdCard">
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
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text"
                        icon="pi pi-save"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-minus"
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
                <div v-else-if="!is_analog && diThresholdData !== null">
                    <threshold-digital
                        :di="diThresholdData.DI"
                    ></threshold-digital>
                </div>
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
    [index: string]: number;
    ID: number;
    HOLD_TIME: number;
    VALID_MIN: number;
    VALID_MAX: number;
    IS_VALID: number;
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
}

type DigitalThreshold = {
    [index: string]: number | string | Array<DIValue>;
    ID: number;
    HOLD_TIME: number;
    DI: Array<DIValue>;
};

@Component<PredefineThresholdCard>({
    props: {
        id: Number,
        type: String,
        unit: String,
        name: String,
        holdTime: Number
    },
    apollo: {
        aiThresholdData: {
            query: gql`
                query PredefineThresholdByAI($ID: Int!) {
                    PredefineThresholdByAI(ID: $ID) {
                        ID
                        HOLD_TIME
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
                    ID: this.id ? this.id : -1
                };
            },
            update: ({ PredefineThresholdByAI }) => PredefineThresholdByAI
        },
        diThresholdData: {
            query: gql`
                query PredefineThresholdByDI($ID: Int!) {
                    PredefineThresholdByDI(ID: $ID) {
                        ID
                        HOLD_TIME
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
                    ID: this.id ? this.id : -1
                };
            },
            update: ({ PredefineThresholdByDI }) => PredefineThresholdByDI
        }
    }
})
export default class PredefineThresholdCard extends Vue {
    data: PredefineThreshold = {
        NAME: this.$props.name,
        HOLD_TIME: this.$props.holdTime
    };

    aiThresholdData: AnalogThreshold | null = null;
    diThresholdData: DigitalThreshold | null = null;

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
}
</script>

<style lang="scss" scoped>
#predefineThresholdCard::v-deep {
    border: 1px solid var(--surface-d);

    .i-header-title {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .p-card-header {
        padding: 0.5rem 1rem 0 1rem;
    }

    .p-card-content {
        padding: 0;
    }
}
</style>
