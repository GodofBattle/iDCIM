<template>
    <Card v-if="!$apollo.loading" id="i-sensor-card" :class="sensorCardClass">
        <template #header>
            <div class="p-d-flex">
                <div class="p-field-checkbox p-mb-0 p-mr-4">
                    <Checkbox
                        :id="`is_use_${nodeId}`"
                        v-model="is_use"
                        :binary="true"
                    />
                    <label :for="`is_use_${nodeId}`" class="i-header-title">
                        NODE ID: {{ nodeId }}
                    </label>
                </div>
                <div class="p-ml-auto p-d-flex">
                    <div class="p-field-checkbox p-mb-0 p-mr-4">
                        <Checkbox
                            :id="`is_mkstats_${nodeId}`"
                            v-model="is_mkstats"
                            :binary="true"
                        />
                        <label :for="`is_mkstats_${nodeId}`">통계생성</label>
                    </div>
                    <div class="p-field-checkbox p-mb-0 p-mr-2">
                        <Checkbox
                            :id="`is_event_${nodeId}`"
                            v-model="is_event"
                            :binary="true"
                        />
                        <label :for="`is_event_${nodeId}`">알림</label>
                    </div>
                    <Button
                        v-if="hasComm"
                        class="p-button-rounded p-button-text p-button-secondary"
                        :label="modbusLabel"
                        @click="showModbusCommandSettingPanel"
                    />
                    <i-overlay-panel
                        ref="modbusCommandOverlayPanel"
                        :show-close-icon="true"
                        append-to="body"
                    >
                        <Card class="i-setting-mc-panel">
                            <template #content>
                                <div class="p-fluid">
                                    <div
                                        class="p-field p-mb-1"
                                        :style="{ 'font-weight': 'bold' }"
                                    >
                                        MODBUS 명령어 설정
                                    </div>
                                    <Divider class="p-mt-0" />
                                    <div
                                        v-for="(
                                            command, index
                                        ) of modbusCommands"
                                        :key="command.ID"
                                        :class="[
                                            'p-field-radiobutton',
                                            {
                                                'p-mb-3':
                                                    index <
                                                    modbusCommands.length - 1,
                                                'p-mb-0':
                                                    index ===
                                                    modbusCommands.length - 1
                                            }
                                        ]"
                                    >
                                        <RadioButton
                                            :id="command.ID"
                                            v-model="sensor.MC_ID"
                                            name="modbusCommands"
                                            :value="Number(command.MC_ID)"
                                        />
                                        <label :for="command.ID" class="p-pl-2">
                                            {{ modbusCommandLabel(command) }}
                                        </label>
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </i-overlay-panel>
                    <Button
                        class="p-button-rounded p-button-text p-button-help"
                        icon="pi pi-copy"
                    />
                    <Button
                        class="p-button-rounded p-button-text"
                        icon="pi pi-save"
                        :disabled="saveButtonDisabled || checkDiThreshold"
                        @click="saveSensor"
                    />
                    <Button
                        class="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-minus"
                    />
                </div>
            </div>
            <Divider class="p-my-1" />
        </template>
        <template #content>
            <div class="p-fluid p-formgird p-grid p-input-filled">
                <div class="p-field p-col-2 p-mb-0">
                    <label for="sensor-name">NAME</label>
                    <InputText
                        id="sensor-name"
                        v-model="sensor.NAME"
                        type="text"
                        aria-describedby="sensor-name-help"
                        autocomplete="off"
                        :class="{ 'p-invalid': invalidMessage.NAME }"
                        @input="inputSensorName"
                    />
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="sensor-cd">TYPE</label>
                    <Dropdown
                        id="sensor-cd"
                        v-model="sensor.SENSOR_CD"
                        :options="sensorCodes"
                        option-label="NAME"
                        option-value="CODE"
                        data-key="CODE"
                        placeholer="Item Type"
                        empty-filter-message="센서타입이 존재하지 않습니다"
                        append-to="body"
                        @input="inputSensorCode"
                    />
                </div>
                <div class="p-field p-col-1 p-mb-0">
                    <label for="adjust-value">표현식</label>
                    <InputText
                        id="adjust-value"
                        v-model="sensor.ADJUST_VALUE"
                        type="text"
                        aria-describedby="adjust-value-help"
                        autocomplete="off"
                    />
                </div>
                <div class="p-field p-col-3 p-mb-0">
                    <label for="data-address">ADDRESS</label>
                    <InputText
                        id="data-address"
                        v-model="sensor.DATA_ADDRESS"
                        type="text"
                        aria-describedby="data-address-help"
                        autocomplete="off"
                    />
                </div>
            </div>
            <Panel
                ref="thresholdPanel"
                :toggleable="true"
                :collapsed.sync="isCollapsedThresholdPanel"
                class="p-mt-2"
            >
                <template #header>
                    <div v-if="isAnalog" class="p-d-flex">
                        <Button
                            class="p-button-text"
                            :disabled="!isDispConv"
                            :label="sensorValueLabel"
                            :style="{ opacity: 1 }"
                            @click="showDisplayPowerSettingPanel"
                        />
                        <i-overlay-panel
                            ref="dispPowerOverlayPanel"
                            :show-close-icon="true"
                            append-to="body"
                        >
                            <Card class="i-setting-mc-panel">
                                <template #content>
                                    <div class="p-fluid">
                                        <div
                                            class="p-field p-mb-1"
                                            :style="{ 'font-weight': 'bold' }"
                                        >
                                            {{ sensorCode.NAME }}의 단위 설정
                                        </div>
                                        <Divider class="p-mt-0" />
                                        <div
                                            v-for="(
                                                disp, index
                                            ) of displayPowerList"
                                            :key="disp.CODE"
                                            :class="[
                                                'p-field-radiobutton',
                                                {
                                                    'p-mb-3':
                                                        index <
                                                        displayPowerList.length -
                                                            1,
                                                    'p-mb-0':
                                                        index ===
                                                        displayPowerList.length -
                                                            1
                                                }
                                            ]"
                                        >
                                            <RadioButton
                                                :id="disp.CODE"
                                                v-model="sensor.DISP_POWER"
                                                name="dispPower"
                                                :value="disp.VALUE"
                                            />
                                            <label
                                                :for="disp.CODE"
                                                class="p-pl-2"
                                            >
                                                {{ displayPowerLabel(disp) }}
                                            </label>
                                        </div>
                                    </div>
                                </template>
                            </Card>
                        </i-overlay-panel>
                    </div>
                    <div v-else class="p-d-flex">
                        <Button
                            class="p-button-text"
                            :disabled="true"
                            :label="sensorValueLabel"
                            :style="{ opacity: 1 }"
                        />
                    </div>
                </template>
                <template v-if="is_event" #icons>
                    <label
                        v-if="aiThreshold.HOLD_TIME > 0"
                        class="i-threshold-header-label"
                    >
                        상태 지속시간: {{ aiThreshold.HOLD_TIME }}초
                    </label>
                    <label
                        v-else-if="diThreshold.HOLD_TIME > 0"
                        class="i-threshold-header-label"
                    >
                        상태 지속시간: {{ diThreshold.HOLD_TIME }}초
                    </label>
                    <Button
                        icon="pi pi-cog"
                        class="p-panel-header-icon"
                        @click="showThresholdSettingPanel"
                    />
                    <i-overlay-panel
                        ref="thresholdSettingOverlayPanel"
                        :show-close-icon="false"
                        append-to="body"
                        :style="{ width: '12vw' }"
                    >
                        <Card class="i-setting-mc-panel">
                            <template #content>
                                <div class="p-fluid p-input-filled">
                                    <div
                                        class="p-field p-mb-1"
                                        :style="{ 'font-weight': 'bold' }"
                                    >
                                        임계치 부가기능 설정
                                    </div>
                                    <Divider class="p-mt-0" />
                                    <div
                                        v-if="isAnalog"
                                        class="p-field-checkbox p-mb-4"
                                    >
                                        <InputSwitch
                                            id="is_valid_min_max"
                                            v-model="is_valid_min_max"
                                        />
                                        <label for="is_valid_min_max">
                                            {{ validMinMaxLabel }}
                                        </label>
                                    </div>
                                    <div class="p-field p-mb-1">
                                        <label>임계치 상태 지속시간(초)</label>
                                        <InputNumber
                                            id="hold-time"
                                            v-model="holdingTime"
                                            mode="decimal"
                                            :min="0"
                                            :max="3600"
                                            :show-buttons="true"
                                            button-layout="horizontal"
                                            :step="1"
                                            decrement-button-class="p-button-secondary"
                                            decrement-button-icon="pi pi-minus"
                                            increment-button-class="p-button-secondary"
                                            increment-button-icon="pi pi-plus"
                                            aria-describedby="func-num-help"
                                            autocomplete="off"
                                        />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </i-overlay-panel>
                </template>

                <div
                    v-if="isAnalog && aiThreshold !== null"
                    class="p-py-3 p-px-2"
                >
                    <threshold-analog
                        :show-min-max="aiThreshold.IS_VALID === 1"
                        :curr-val.sync="sensor.CURR_VALUE"
                        :n3.sync="aiThreshold.POINT_N3"
                        :n2.sync="aiThreshold.POINT_N2"
                        :n1.sync="aiThreshold.POINT_N1"
                        :p1.sync="aiThreshold.POINT_P1"
                        :p2.sync="aiThreshold.POINT_P2"
                        :p3.sync="aiThreshold.POINT_P3"
                        :min.sync="aiThreshold.VALID_MIN"
                        :max.sync="aiThreshold.VALID_MAX"
                        :disabled="false"
                    />
                </div>
                <i-scroll-panel
                    v-else-if="!isAnalog && diThreshold !== null"
                    class="p-py-2 p-px-2 p-mr-3"
                    :style="{
                        'max-height': '50vh',
                        height: heightDIThresholdContent
                    }"
                >
                    <threshold-digital
                        :di.sync="diThreshold.DI"
                        :is-editable="true"
                        :level-codes="levelCodes"
                        :show-level="is_event"
                        :style="{ padding: 0 }"
                        @delete="deleteDiThresholdItem"
                    />
                    <Button
                        class="p-mt-2 p-mb-1 p-ml-1 p-p-0"
                        icon="pi pi-plus"
                        :style="{
                            width: '24px',
                            height: '24px'
                        }"
                        @click="addDiThresholdItem"
                    />
                </i-scroll-panel>
            </Panel>
        </template>
    </Card>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import IOverlayPanel from '../custom/iOverlayPanel.vue';
import Component from '@/plugins/nuxt-class-component';

interface Code {
    CODE: string;
    NAME: string;
    VALUE: number;
    REMARK: string;
}

interface SensorCode {
    CODE: string;
    NAME: string;
    TYPE: string;
    UNIT: string;
    IS_DISP_CONV: number;
}

interface Sensor {
    [index: string]: number | string;
    ID: number;
    INTF_ID: number;
    NAME: string;
    SENSOR_CD: string;
    DATA_ADDRESS: string;
    NODE_ID: number;
    ADJUST_VALUE: string;
    MC_ID: number;
    CURR_VALUE: number;
    CURR_STATUS: number;
    CURR_LEVEL: number;
    COMM_STATUS: number;
    DISP_POWER: number;
    NOTI_ADDMSG: string;
    IS_USE: number;
    IS_EVENT: number;
    IS_VIRTUAL: number;
    IS_MKSTATS: number;
    IS_LG_1MIN: number;
}

interface AnalogThreshold {
    [index: string]: number | string;
    ID: number;
    SENSOR_ID: number;
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
}

interface DIValue {
    INDEX: number;
    LEVEL: number;
    LABEL: string;
    isEditableGrade: boolean | undefined;
    isEditableValue: boolean | undefined;
    hasSameINDEX: boolean | undefined;
}

interface DigitalThreshold {
    [index: string]: number | Array<DIValue>;
    ID: number;
    SENSOR_ID: number;
    HOLD_TIME: number;
    DI: Array<DIValue>;
}

@Component<SensorCard>({
    props: {
        initSensorData: {
            type: Object,
            default: undefined
        },
        sensorCodes: Array,
        modbusCommands: Array,
        displayPowerList: Array,
        levelCodes: Array,
        nodeId: Number,
        isUse: Number,
        isMkstats: Number,
        isEvent: Number,
        name: String,
        adjustValue: String,
        dataAddress: String,
        sensorCd: String,
        mcId: Number,
        currValue: Number,
        dispPower: Number,
        commStatus: Number,
        notiAddmsg: String,
        currStatus: Number,
        currLevel: Number,
        hasComm: {
            type: Boolean,
            default: false
        }
    },
    apollo: {
        dbAiThreshold: {
            query: gql`
                query ($SENSOR_ID: Int!) {
                    AssetThresholdByAI(SENSOR_ID: $SENSOR_ID) {
                        ID
                        SENSOR_ID
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
            fetchPolicy: 'no-cache',
            prefetch: true,
            skip() {
                const id = Number(this.sensor.ID);

                return (
                    !this.isAnalog ||
                    this.sensor === null ||
                    typeof id !== 'number'
                );
            },
            variables() {
                return {
                    SENSOR_ID: Number(this.sensor.ID)
                };
            },
            update: ({ AssetThresholdByAI }) => AssetThresholdByAI,
            result({ loading, data }) {
                if (!loading) {
                    const { AssetThresholdByAI } = data;
                    if (AssetThresholdByAI) {
                        this.apolloFetchAI(AssetThresholdByAI);
                    }
                }
            }
        },
        dbDiThreshold: {
            query: gql`
                query ($SENSOR_ID: Int!) {
                    AssetThresholdByDI(SENSOR_ID: $SENSOR_ID) {
                        ID
                        SENSOR_ID
                        HOLD_TIME
                        DI {
                            INDEX
                            LEVEL
                            LABEL
                        }
                    }
                }
            `,
            fetchPolicy: 'no-cache',
            prefetch: true,
            skip() {
                const id = Number(this.sensor.ID);

                return (
                    this.isAnalog ||
                    this.sensor === null ||
                    typeof id !== 'number'
                );
            },
            variables() {
                return {
                    SENSOR_ID: Number(this.sensor.ID)
                };
            },
            update: ({ AssetThresholdByDI }) => AssetThresholdByDI,
            result({ loading, data }) {
                if (!loading) {
                    const { AssetThresholdByDI } = data;

                    if (AssetThresholdByDI) {
                        this.apolloFetchDI(AssetThresholdByDI);
                    }
                }
            }
        }
    }
})
export default class SensorCard extends Vue {
    $refs!: {
        modbusCommandOverlayPanel: IOverlayPanel;
        dispPowerOverlayPanel: IOverlayPanel;
        thresholdSettingOverlayPanel: IOverlayPanel;
        thresholdPanel: any;
    };

    sensor: Sensor = {
        ID: this.$props.initSensorData.ID,
        INTF_ID: this.$props.initSensorData.INTF_ID,
        NAME: this.$props.name,
        SENSOR_CD: this.$props.sensorCd,
        DATA_ADDRESS: this.$props.dataAddress,
        NODE_ID: this.$props.nodeId,
        ADJUST_VALUE: this.$props.adjustValue,
        MC_ID: this.$props.mcId,
        CURR_VALUE: this.$props.currValue,
        CURR_STATUS: this.$props.currStatus,
        CURR_LEVEL: this.$props.currLevel,
        COMM_STATUS: this.$props.commStatus,
        DISP_POWER: this.$props.dispPower,
        NOTI_ADDMSG: this.$props.notiAddmsg,
        IS_USE: this.$props.isUse,
        IS_EVENT: this.$props.isEvent,
        IS_VIRTUAL: 0,
        IS_MKSTATS: this.$props.isMkstats,
        IS_LG_1MIN: 0
    };

    invalidMessage = {
        NAME: undefined as String | undefined
    };

    dbAiThreshold: AnalogThreshold;
    aiThreshold: AnalogThreshold = {
        ID: 0,
        SENSOR_ID: 0,
        HOLD_TIME: 0,
        VALID_MIN: 0,
        VALID_MAX: 0,
        IS_VALID: 0,
        POINT_N3: 0,
        POINT_N2: 0,
        POINT_N1: 0,
        POINT_P1: 0,
        POINT_P2: 0,
        POINT_P3: 0
    };

    dbDiThreshold: DigitalThreshold;
    diThreshold: DigitalThreshold = {
        ID: 0,
        SENSOR_ID: 0,
        HOLD_TIME: 0,
        DI: [] as Array<DIValue>
    };

    isCollapsedThresholdPanel: boolean = !this.$props.isEvent;

    refetchThreshold() {
        if (this.isAnalog) {
            this.$apollo.queries.dbAiThreshold.refetch();
        } else {
            this.$apollo.queries.dbDiThreshold.refetch();
        }
    }

    apolloFetchAI(data: AnalogThreshold) {
        for (const [key, value] of Object.entries(data)) {
            this.aiThreshold[key] = value;
        }
    }

    apolloFetchDI(data: DigitalThreshold) {
        for (const [key, value] of Object.entries(data)) {
            if (key === 'DI') {
                this.diThreshold[key].splice(0, this.diThreshold[key].length);

                data.DI.forEach((di: DIValue) => {
                    this.diThreshold[key].push({
                        INDEX: di.INDEX,
                        LEVEL: di.LEVEL,
                        LABEL: di.LABEL,
                        isEditableGrade: false,
                        isEditableValue: false,
                        hasSameINDEX: false
                    });
                });
            } else {
                this.diThreshold[key] = value;
            }
        }
    }

    inputSensorName(event: InputEvent) {
        const _input = event.toString();
        if (_input.length > 32) {
            this.invalidMessage.NAME = '센서명은 32자 이하입니다';
        }
        this.$emit('update:name', _input);
    }

    modbusCommandLabel(cmd: any) {
        const func = cmd.FUNC_NO.toString().padStart(2, '0');
        const start = cmd.START_ADDR.toString().padStart(2, '0');
        const point = cmd.POINT_CNT.toString().padStart(2, '0');

        return `
            [ID: ${cmd.MC_ID}]
            ${func} |
            ${start} |
            ${point} |
            ${cmd.DTYPE_NAME}
        `;
    }

    get modbusLabel(): string {
        return `MODBUS ID: ${this.sensor.MC_ID}`;
    }

    showModbusCommandSettingPanel(event: PointerEvent) {
        this.$refs.modbusCommandOverlayPanel.toggle(event);
    }

    displayPowerLabel(disp: any) {
        let num = Number(this.sensor.CURR_VALUE);
        num = num * Math.pow(10, -disp.VALUE);

        let unit = '';
        if (this.isUnit) {
            unit = `${disp.REMARK}${this.sensorCode.UNIT}`;
        }

        return `${disp.NAME} = ${num} ${unit}`;
    }

    showDisplayPowerSettingPanel(event: PointerEvent) {
        this.$refs.dispPowerOverlayPanel.toggle(event);
    }

    get saveButtonDisabled(): boolean {
        let is_disabled = true;

        if (this.$props.initSensorData) {
            is_disabled = !this.isDiffSensor;
        }

        if (is_disabled === true && this.isAnalog) {
            is_disabled = !this.isDiffAiThreshold;
        } else if (is_disabled === true && !this.isAnalog) {
            is_disabled = !this.isDiffDiThreshold;
        }

        return is_disabled;
    }

    get isDiffSensor(): boolean {
        let is_diff = false;

        if (this.$props.initSensorData !== null) {
            const keys = [
                'NAME',
                'SENSOR_CD',
                'DATA_ADDRESS',
                'NODE_ID',
                'ADJUST_VALUE',
                'MC_ID',
                'DISP_POWER',
                'IS_USE',
                'IS_EVENT',
                'IS_MKSTATS'
            ];

            for (const key of keys) {
                if (this.sensor[key] !== this.$props.initSensorData[key]) {
                    is_diff = true;
                    break;
                }
            }
        }

        return is_diff;
    }

    get isDiffAiThreshold(): boolean {
        let is_diff = false;

        if (this.aiThreshold && this.dbAiThreshold) {
            const keys = [
                'HOLD_TIME',
                'VALID_MIN',
                'VALID_MAX',
                'IS_VALID',
                'POINT_N3',
                'POINT_N2',
                'POINT_N1',
                'POINT_P1',
                'POINT_P2',
                'POINT_P3'
            ];

            for (const key of keys) {
                if (this.aiThreshold[key] !== this.dbAiThreshold[key]) {
                    is_diff = true;
                    break;
                }
            }
        }

        return is_diff;
    }

    get isDiffDiThreshold(): boolean {
        let is_diff = false;

        if (this.diThreshold && this.dbDiThreshold) {
            if (
                this.diThreshold.ID !== this.dbDiThreshold.ID ||
                this.diThreshold.SENSOR_ID !== this.dbDiThreshold.SENSOR_ID ||
                this.diThreshold.HOLD_TIME !== this.dbDiThreshold.HOLD_TIME
            ) {
                is_diff = true;
            } else if (
                this.diThreshold.DI.length !== this.dbDiThreshold.DI.length
            ) {
                is_diff = true;
            } else {
                for (let idx = 0; idx < this.diThreshold.DI.length; idx++) {
                    const { INDEX, LEVEL, LABEL } = this.diThreshold.DI[idx];

                    if (
                        INDEX !== this.dbDiThreshold.DI[idx].INDEX ||
                        LEVEL !== this.dbDiThreshold.DI[idx].LEVEL ||
                        LABEL !== this.dbDiThreshold.DI[idx].LABEL
                    ) {
                        is_diff = true;
                        break;
                    }
                }
            }
        }

        return is_diff;
    }

    get checkDiThreshold(): boolean {
        let is_check = false;

        if (!this.isAnalog) {
            for (let idx = 0; idx < this.diThreshold.DI.length; idx++) {
                const { isEditableGrade, isEditableValue, hasSameINDEX } =
                    this.diThreshold.DI[idx];

                if (isEditableGrade || isEditableValue || hasSameINDEX) {
                    is_check = true;
                    break;
                }
            }
        }

        return is_check;
    }

    get sensorCardClass(): Array<object> {
        return [
            {
                'i-not-use-sensorcard': !this.is_use,
                'i-has-editing': !this.saveButtonDisabled
            }
        ];
    }

    get is_use(): boolean {
        return this.sensor.IS_USE === 1;
    }

    set is_use(_is_use: boolean) {
        this.sensor.IS_USE = _is_use ? 1 : 0;
        this.$emit('update:isUse', this.sensor.IS_USE);
    }

    get is_mkstats(): boolean {
        return this.sensor.IS_MKSTATS === 1;
    }

    set is_mkstats(_is_mkstats: boolean) {
        this.sensor.IS_MKSTATS = _is_mkstats ? 1 : 0;
        this.$emit('update:isMkstats', this.sensor.IS_MKSTATS);
    }

    get is_event(): boolean {
        return this.sensor.IS_EVENT === 1;
    }

    set is_event(_is_event: boolean) {
        this.sensor.IS_EVENT = _is_event ? 1 : 0;
        this.$emit('update:isEvent', this.sensor.IS_EVENT);

        this.isCollapsedThresholdPanel = !_is_event;
    }

    get sensorCode(): SensorCode {
        return this.$props.sensorCodes.find(
            (code: SensorCode) => code.CODE === this.sensor.SENSOR_CD
        );
    }

    get isUnit(): boolean {
        return !!this.sensorCode?.UNIT;
    }

    get isAnalog(): boolean {
        return this.sensorCode?.TYPE === 'A';
    }

    get isDispConv(): boolean {
        return !!this.sensorCode?.IS_DISP_CONV;
    }

    get sensorValueLabel(): string {
        let label = '';

        if (this.isAnalog) {
            let num = this.sensor.CURR_VALUE;
            let prefix = '';
            let unit = '';

            if (this.dispCode) {
                num *= Math.pow(10, -this.dispCode.VALUE);
                prefix = this.dispCode.REMARK;
            }

            if (this.isUnit) {
                unit = this.sensorCode.UNIT;
            }

            label = `${num} ${prefix}${unit}`;
        } else if (this.diThreshold) {
            const num = this.sensor.CURR_VALUE;
            const curr = this.diThreshold.DI.find(
                (di: DIValue) => di.INDEX === num
            );

            if (curr) {
                label = `${num}: ${curr.LABEL}`;
            } else {
                label = `${num}`;
            }
        }

        return label;
    }

    get dispCode(): Code {
        return this.$props.displayPowerList.find(
            (d: Code) => d.VALUE === this.sensor.DISP_POWER
        );
    }

    get holdingTime(): number {
        let holding_time = 0;

        if (this.isAnalog) {
            holding_time = this.aiThreshold.HOLD_TIME;
        } else {
            holding_time = this.diThreshold.HOLD_TIME;
        }

        return holding_time;
    }

    set holdingTime(_holding_time: number) {
        if (this.isAnalog) {
            this.aiThreshold.HOLD_TIME = _holding_time;
        } else {
            this.diThreshold.HOLD_TIME = _holding_time;
        }
    }

    showThresholdSettingPanel(event: PointerEvent) {
        this.$refs.thresholdSettingOverlayPanel.toggle(event);
    }

    get is_valid_min_max(): boolean {
        return this.aiThreshold.IS_VALID === 1;
    }

    set is_valid_min_max(_is: boolean) {
        this.aiThreshold.IS_VALID = _is ? 1 : 0;
    }

    get validMinMaxLabel(): string {
        return this.is_valid_min_max
            ? '최대 / 최소값 사용'
            : '최대 / 최소값 사용안함';
    }

    inputSensorCode(new_sensor_cd: string) {
        const new_code: SensorCode = this.$props.sensorCodes.find(
            (code: SensorCode) => code.CODE === new_sensor_cd
        );

        if (new_code) {
            // by shkoh 20220707: 변경될 타입에서 기수 prefix를 사용하지 않는 다면 해당 값을 초기화함
            if (new_code.IS_DISP_CONV === 0) {
                this.sensor.DISP_POWER = 0;
            }
        }
    }

    deleteDiThresholdItem(index: number) {
        this.diThreshold.DI.splice(index, 1);
    }

    addDiThresholdItem() {
        if (this.diThreshold.DI.length === 30) {
            this.$toast.add({
                severity: 'error',
                summary: '임계치 수 초과',
                detail: `임계치는 최대 30가지 경우를 표현할 수 있습니다`,
                life: 2000
            });

            return;
        }

        const idx = this.minimumDiThresholdIndex;
        const new_di = {
            INDEX: this.minimumDiThresholdIndex,
            LEVEL: 0,
            LABEL: '새로운 임계값',
            isEditableGrade: false,
            isEditableValue: false,
            hasSameINDEX: false
        };

        this.diThreshold.DI.splice(idx, 0, new_di);
    }

    get minimumDiThresholdIndex(): number {
        let min = 0;
        for (let seq = 0; seq < 30; seq++) {
            const has_seq = this.diThreshold.DI.some(
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

        this.diThreshold.DI.forEach((d: DIValue) => {
            let di_heihgt = 2;
            if (d.isEditableGrade || d.isEditableValue) {
                di_heihgt += 48;
            } else {
                di_heihgt += 36;
            }

            content_height += di_heihgt;
        });

        // by shkoh 20220712: padding 값 추가
        if (this.diThreshold.DI.length === 0) {
            content_height += 12;
        } else {
            content_height += 6;
        }

        return `${content_height}px`;
    }

    saveSensor() {
        this.$emit(
            'save',
            this.isAnalog,
            {
                NODE_ID: this.sensor.NODE_ID,
                NAME: this.sensor.NAME
            },
            {
                SENSOR_ID: this.sensor.ID,
                SENSOR: this.changedSensorData,
                THRESHOLD_AI:
                    this.isAnalog && this.isDiffAiThreshold
                        ? this.changedAiThresholdData
                        : {},
                THRESHOLD_DI:
                    !this.isAnalog && this.isDiffDiThreshold
                        ? this.changedDiThresholdData
                        : { DI: [] }
            }
        );
    }

    get changedSensorData(): any {
        const changed_data = {};

        [
            'NAME',
            'SENSOR_CD',
            'DATA_ADDRESS',
            'ADJUST_VALUE',
            'MC_ID',
            'DISP_POWER',
            'IS_USE',
            'IS_EVENT',
            'IS_MKSTATS'
        ].forEach((key: string) => {
            if (this.sensor[key] !== this.$props.initSensorData[key]) {
                this.$set(changed_data, key, this.sensor[key]);
            }
        });

        return changed_data;
    }

    get changedAiThresholdData(): any {
        const changed_data = {};

        [
            'HOLD_TIME',
            'VALID_MIN',
            'VALID_MAX',
            'IS_VALID',
            'POINT_N3',
            'POINT_N2',
            'POINT_N1',
            'POINT_P1',
            'POINT_P2',
            'POINT_P3'
        ].forEach((key: string) => {
            if (this.aiThreshold[key] !== this.dbAiThreshold[key]) {
                this.$set(changed_data, key, this.aiThreshold[key]);
            }
        });

        return changed_data;
    }

    get changedDiThresholdData(): any {
        const changed_data = {};

        if (this.diThreshold.HOLD_TIME !== this.dbDiThreshold.HOLD_TIME) {
            this.$set(changed_data, 'HOLD_TIME', this.diThreshold.HOLD_TIME);
        }

        const _di: Array<any> = [];
        for (let idx = 0; idx < this.diThreshold.DI.length; idx++) {
            const { INDEX, LEVEL, LABEL } = this.diThreshold.DI[idx];
            _di.push({ INDEX, LEVEL, LABEL });
        }

        this.$set(changed_data, 'DI', _di);

        return changed_data;
    }
}
</script>

<style lang="scss" scoped>
#i-sensor-card::v-deep {
    width: 100%;
    border: 1px solid var(--surface-d);

    &.i-not-use-sensorcard {
        .p-card-body {
            opacity: 0.4;
        }
    }

    &.i-has-editing {
        border-left: 10px solid;
        border-color: var(--yellow-500);
    }

    .i-header-title {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .p-card-header {
        padding: 0.5rem 1rem 0 1rem;
    }

    .p-card-content {
        padding: 0;

        .i-threshold-header-label {
            color: var(--text-color-secondary);
        }
    }

    .p-panel-header {
        padding: 0.5rem 1rem;
    }

    .p-panel-content {
        padding: 0rem;
    }
}

.i-setting-mc-panel::v-deep {
    box-shadow: none;
    border: 1px solid var(--surface-border);

    .p-card-body {
        .p-card-content {
            padding: 0;
        }
    }
}
</style>
