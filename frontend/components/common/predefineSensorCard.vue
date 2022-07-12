<template>
    <Card id="predefineSensorCard" :class="predefineSensorCardClass">
        <template #header>
            <div class="p-d-flex">
                <div class="p-as-center p-pl-2 i-header-title">
                    NODE ID: {{ nodeId }}
                </div>
                <div class="p-ml-auto p-d-flex">
                    <div class="p-field-checkbox p-mb-0 p-mr-4">
                        <Checkbox
                            id="is_mkstat"
                            v-model="chkStat"
                            :binary="true"
                        />
                        <label for="is_mkstat">통계생성</label>
                    </div>
                    <div class="p-field-checkbox p-mb-0 p-mr-2">
                        <Checkbox
                            id="chk_event"
                            v-model="is_event"
                            :binary="true"
                        />
                        <label for="chk_event">알림</label>
                    </div>
                    <Button
                        class="p-button-rounded p-button-text p-button-help"
                        icon="pi pi-copy"
                        @click="copySensorCard"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text"
                        icon="pi pi-save"
                        :disabled="saveButtonDisabled"
                        @click="saveSensorCard"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-minus"
                        @click="deleteSensorCard"
                    ></Button>
                </div>
            </div>
            <Divider class="p-my-1" />
        </template>
        <template #content>
            <div class="p-fluid p-formgrid p-grid p-input-filled">
                <div class="p-field p-col-2 p-mb-0">
                    <label for="p-sensor-name">NAME</label>
                    <InputText
                        id="p-sensor-name"
                        v-model="data.NAME"
                        type="text"
                        aria-describedby="p-sensor-name-help"
                        autocomplete="off"
                        @input="inputName"
                    >
                    </InputText>
                </div>
                <div class="p-field p-col-1 p-mb-0">
                    <label for="adjust-value">표현식</label>
                    <InputText
                        id="adjust-value"
                        v-model="data.ADJUST_VALUE"
                        type="text"
                        aria-describedby="adjust-value-help"
                        autocomplete="off"
                        @input="inputAdjustValue"
                    >
                    </InputText>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="data-address">ADDRESS</label>
                    <InputText
                        id="data-address"
                        v-model="data.DATA_ADDRESS"
                        type="text"
                        aria-describedby="data-address-help"
                        autocomplete="off"
                        @input="inputDataAddress"
                    >
                    </InputText>
                </div>
                <div v-if="hasComm" class="p-field p-col-2 p-mb-0">
                    <label for="mc-id">MODBUS ID</label>
                    <Dropdown
                        id="mc-id"
                        v-model="data.MC_ID"
                        :options="modbusCommandList"
                        :option-label="modbusCommandLabel"
                        option-value="MC_ID"
                        data-key="MC_ID"
                        placeholder="MODBUS CMD"
                        empty-filter-message="MODBUS 명령어가 존재하지 않습니다"
                        append-to="body"
                        @input="inputMcId"
                    >
                    </Dropdown>
                </div>
                <div class="p-field p-col-1 p-mb-0">
                    <label for="sensor-cd">TYPE</label>
                    <Dropdown
                        id="sensor-cd"
                        v-model="data.SENSOR_CD"
                        :options="sensorCodeList"
                        option-label="NAME"
                        option-value="CODE"
                        data-key="CODE"
                        placeholder="Sensor Type"
                        empty-filter-message="센서 타입이 존재하지 않습니다"
                        append-to="body"
                        @input="inputSensorType"
                    >
                    </Dropdown>
                </div>
                <div v-if="isDispConv" class="p-field p-col-1 p-mb-0">
                    <label for="disp-power">단위</label>
                    <Dropdown
                        id="disp-power"
                        v-model="data.DISP_POWER"
                        :options="displayPowerList"
                        option-label="NAME"
                        option-value="VALUE"
                        data-key="CODE"
                        placeholder="단위"
                        empty-filter-message="선택 가능한 단위가 존재하지 않습니다"
                        append-to="body"
                        @input="inputDispPower"
                    >
                    </Dropdown>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="threshold">임계치 지정</label>
                    <Dropdown
                        v-if="isAnalogValue"
                        id="threshold"
                        v-model="data.PD_THRESHOLD_ID"
                        :options="pdThresholdAIList"
                        option-label="NAME"
                        option-value="ID"
                        data-key="ID"
                        placeholder="임계치"
                        empty-filter-message="선택 가능한 임계치가 존재하지 않습니다"
                        append-to="body"
                        @input="inputPdThresholdId"
                    >
                    </Dropdown>
                    <Dropdown
                        v-if="!isAnalogValue"
                        id="threshold"
                        v-model="data.PD_THRESHOLD_ID"
                        :options="pdThresholdDIList"
                        option-label="NAME"
                        option-value="ID"
                        data-key="ID"
                        placeholder="임계치"
                        empty-filter-message="선택 가능한 임계치가 존재하지 않습니다"
                        append-to="body"
                        @input="inputPdThresholdId"
                    >
                    </Dropdown>
                </div>
            </div>
            <Panel
                :header="thresholdLabel"
                :toggleable="true"
                class="p-mt-2"
                :collapsed.sync="is_collapsed_panel"
            >
                <div
                    v-if="
                        isAnalogValue &&
                        data.PD_THRESHOLD_ID > 0 &&
                        aiThresholdData !== null
                    "
                >
                    <threshold-analog
                        :show-min-max="aiThresholdData.IS_VALID === 1"
                        :n3="aiThresholdData.POINT_N3"
                        :n2="aiThresholdData.POINT_N2"
                        :n1="aiThresholdData.POINT_N1"
                        :p1="aiThresholdData.POINT_P1"
                        :p2="aiThresholdData.POINT_P2"
                        :p3="aiThresholdData.POINT_P3"
                        :min="aiThresholdData.VALID_MIN"
                        :max="aiThresholdData.VALID_MAX"
                        :disabled="true"
                    ></threshold-analog>
                </div>
                <div
                    v-else-if="
                        !isAnalogValue &&
                        data.PD_THRESHOLD_ID > 0 &&
                        diThresholdData !== null
                    "
                >
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

interface SensorCode {
    CODE: string;
    NAME: string;
    TYPE: string;
    UNIT: string;
    IS_DISP_CONV: number;
}

type PredefineSensor = {
    [index: string]: undefined | string | number;
    NAME: string;
    ADJUST_VALUE: string;
    DATA_ADDRESS: string;
    MC_ID: number;
    SENSOR_CD: string;
    DISP_POWER: number;
    PD_THRESHOLD_ID: number;
    IS_EVENT: number;
    IS_MKSTATS: number;
};

interface DIValue {
    INDEX: number;
    LEVEL: number;
    LABEL: string;
}

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

type DigitalThreshold = {
    [index: string]: number | string | Array<DIValue>;
    ID: number;
    HOLD_TIME: number;
    DI: Array<DIValue>;
};

@Component<PredefineSensorCard>({
    props: {
        interfaceId: Number,
        sensorId: Number,
        nodeId: Number,
        hasComm: Boolean,
        initSensorData: Object,
        modbusCommandList: Array,
        sensorCodeList: Array,
        displayPowerList: Array,
        name: String,
        adjustValue: String,
        dataAddress: String,
        mcId: Number,
        sensorCd: String,
        dispPower: Number,
        pdThresholdId: Number,
        isEvent: Number,
        isMkStats: Number
    },
    apollo: {
        pdThresholdAIList: {
            query: gql`
                query PredefineThresholdsByAI($SENSOR_CD: String!) {
                    PredefineThresholdsByAI(SENSOR_CD: $SENSOR_CD) {
                        ID
                        NAME
                        SENSOR_CD
                        HOLD_TIME
                    }
                }
            `,
            prefetch: false,
            variables(): any {
                return {
                    SENSOR_CD: this.sensorCode?.CODE ?? ''
                };
            },
            update: ({ PredefineThresholdsByAI }) => PredefineThresholdsByAI
        },
        pdThresholdDIList: {
            query: gql`
                query PredefineThresholdsByDI($SENSOR_CD: String!) {
                    PredefineThresholdsByDI(SENSOR_CD: $SENSOR_CD) {
                        ID
                        NAME
                        SENSOR_CD
                        HOLD_TIME
                    }
                }
            `,
            prefetch: false,
            variables(): any {
                return {
                    SENSOR_CD: this.sensorCode?.CODE ?? ''
                };
            },
            update: ({ PredefineThresholdsByDI }) => PredefineThresholdsByDI
        },
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
            variables(): any {
                return {
                    ID:
                        this.sensorCode?.TYPE === 'A' &&
                        this.data.PD_THRESHOLD_ID > 0
                            ? this.data.PD_THRESHOLD_ID
                            : 0
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
            variables(): any {
                return {
                    ID:
                        this.sensorCode?.TYPE === 'D' &&
                        this.data.PD_THRESHOLD_ID > 0
                            ? this.data.PD_THRESHOLD_ID
                            : 0
                };
            },
            update: ({ PredefineThresholdByDI }) => PredefineThresholdByDI
        }
    }
})
export default class PredefineSensorCard extends Vue {
    data: PredefineSensor = {
        NAME: this.$props.name,
        ADJUST_VALUE: this.$props.adjustValue,
        DATA_ADDRESS: this.$props.dataAddress,
        MC_ID: this.$props.mcId,
        SENSOR_CD: this.$props.sensorCd,
        DISP_POWER: this.$props.dispPower,
        PD_THRESHOLD_ID: this.$props.pdThresholdId,
        IS_EVENT: this.$props.isEvent,
        IS_MKSTATS: this.$props.isMkStats
    };

    pdThresholdAIList: Array<any> = [];
    pdThresholdDIList: Array<any> = [];

    aiThresholdData: AnalogThreshold | null = null;
    diThresholdData: DigitalThreshold | null = null;

    is_collapsed_panel: boolean = true;

    get saveButtonDisabled(): boolean {
        let is_disabled = true;
        for (const key of Object.keys(this.data)) {
            if (this.data[key] !== this.$props.initSensorData[key]) {
                is_disabled = false;
                break;
            }
        }

        this.$emit('change', {
            id: this.$props.sensorId,
            isEdit: !is_disabled
        });
        return is_disabled;
    }

    get predefineSensorCardClass(): Array<string | object> {
        return [{ 'i-editable': !this.saveButtonDisabled }];
    }

    get is_event(): boolean {
        return this.data.IS_EVENT === 1;
    }

    set is_event(_noti: boolean) {
        this.data.IS_EVENT = _noti ? 1 : 0;
        this.$emit('update:isEvent', this.data.IS_EVENT);
    }

    get chkStat(): boolean {
        return this.data.IS_MKSTATS === 1;
    }

    set chkStat(_stat) {
        this.data.IS_MKSTATS = _stat ? 1 : 0;
        this.$emit('update:isMkStats', this.data.IS_MKSTATS);
    }

    get isDispConv(): boolean {
        return !!this.sensorCode?.IS_DISP_CONV;
    }

    get isAnalogValue(): boolean {
        return this.sensorCode?.TYPE === 'A';
    }

    get thresholdLabel(): string {
        // by shkoh 20211118: Threshold 임계치 보기 단위 및 지속시간을 텍스트로 표현
        let label = '임계치 보기';

        if (this.isAnalogValue && this.sensorCode?.UNIT) {
            const current_power = this.displayPower;

            label += `(${
                this.isDispConv && current_power ? current_power.NAME : ``
            }${this.sensorCode?.UNIT})`;
        }

        return label;
    }

    get sensorCode(): SensorCode {
        return this.$props.sensorCodeList
            .filter((item: any) => item.CODE === this.data.SENSOR_CD)
            .pop();
    }

    get displayPower(): any {
        return this.$props.displayPowerList
            .filter((item: any) => item.VALUE === (this.data.DISP_POWER ?? 0))
            .pop();
    }

    modbusCommandLabel(item: any) {
        return `[ID: ${item.MC_ID}] ${item.FUNC_NO.toString().padStart(
            2,
            '0'
        )} | ${item.START_ADDR.toString().padStart(
            2,
            '0'
        )} | ${item.POINT_CNT.toString().padStart(2, '0')} | ${
            item.DTYPE_NAME
        }`;
    }

    inputName(input: string) {
        this.$emit('update:name', input);
    }

    inputAdjustValue(input: string) {
        this.$emit('update:adjustValue', input);
    }

    inputDataAddress(input: string) {
        this.$emit('update:dataAddress', input);
    }

    inputMcId(input: number) {
        this.$emit('update:mcId', input);
    }

    inputSensorType(input: string) {
        this.data.PD_THRESHOLD_ID = 0;

        this.aiThresholdData = null;
        this.diThresholdData = null;

        this.$emit('update:sensorCd', input);
        this.$emit('update:pdThresholdId', 0);
    }

    inputDispPower(input: number) {
        this.$emit('update:dispPower', input);
    }

    inputPdThresholdId(input: number) {
        this.$emit('update:pdThresholdId', input);
    }

    copySensorCard() {
        this.$emit('copy', {
            PD_INTF_ID: this.$props.interfaceId,
            NODE_ID: this.$props.nodeId,
            NAME: this.data.NAME,
            ADJUST_VALUE: this.data.ADJUST_VALUE,
            DATA_ADDRESS: this.data.DATA_ADDRESS,
            MC_ID: this.data.MC_ID,
            SENSOR_CD: this.data.SENSOR_CD,
            DISP_POWER: this.data.DISP_POWER,
            PD_THRESHOLD_ID: this.data.PD_THRESHOLD_ID,
            IS_EVENT: this.data.IS_EVENT,
            IS_MKSTATS: this.data.IS_MKSTATS
        });
    }

    saveSensorCard() {
        const save_data = {
            ID: this.$props.sensorId
        };

        for (const key of Object.keys(this.data)) {
            if (this.data[key] !== this.$props.initSensorData[key]) {
                Object.defineProperty(save_data, key, {
                    value: this.data[key],
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            }
        }

        this.$emit('save', this.data.NAME, save_data);
    }

    deleteSensorCard() {
        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `[${this.data.NAME}] 수집항목을 삭제하시겠습니까?\n사전정의 항목의 센서 삭제 시, 관련된 모든 항목들이 삭제됩니다.`,
            header: `수집항목 - ${this.data.NAME} 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.$emit('delete');
            }
        });
    }
}
</script>

<style lang="scss" scoped>
#predefineSensorCard::v-deep {
    width: 100%;
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

#predefineSensorCard.i-editable::v-deep {
    border-left: 10px solid;
    border-color: var(--yellow-500);
}
</style>
