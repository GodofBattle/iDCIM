<template>
    <Card id="i-virtual-sensor-card" :class="sensorCardClass">
        <template #header>
            <div class="p-d-flex">
                <div class="p-field-checkbox p-mb-0 p-mr-4">
                    <Checkbox
                        :id="`is_use_${nodeId}`"
                        :binary="true"
                        v-model="is_use"
                    />
                    <label :for="`is_use_${nodeId}`" class="i-header-title">
                        INDEX: {{ nodeId }}
                        <span class="i-header-sub-title p-ml-2">
                            {{ sensorTypeName }}
                        </span>
                    </label>
                </div>
                <div class="p-ml-auto p-d-flex">
                    <div v-if="isAnalog" class="p-field-checkbox p-mb-0 p-mr-4">
                        <Checkbox
                            :id="`is_mkstats_${nodeId}`"
                            :binary="true"
                            v-model="is_mkstats"
                        />
                        <label :for="`is_mkstats_${nodeId}`">통계생성</label>
                    </div>
                    <div class="p-field-checkbox p-mb-0 p-mr-2">
                        <Checkbox
                            :id="`is_event_${nodeId}`"
                            :binary="true"
                            v-model="is_event"
                        />
                        <label :for="`is_event_${nodeId}`">통보</label>
                    </div>
                    <Button
                        class="p-button-rounded p-button-text p-button-help"
                        icon="pi pi-copy"
                        title="복사"
                        @click="copyVirtualSensor"
                    />
                    <Button
                        class="p-button-rounded p-button-text"
                        icon="pi pi-save"
                        title="저장"
                        :disabled="saveButtonDisabled || checkDiThreshold"
                        @click="saveVirtualSensor"
                    />
                    <Button
                        class="p-button-rounded p-button-text p-button-secondary"
                        icon="pi pi-times"
                        title="삭제"
                        @click="deleteVirtualSensor"
                    />
                </div>
            </div>
            <Divider class="p-my-1" />
        </template>
        <template #content>
            <div class="p-fluid p-formgrid p-grid p-input-filled">
                <div class="p-field p-col-2 p-mb-0">
                    <label :for="`sensor-name-${nodeId}`">수집항목 명칭</label>
                    <InputText
                        :disabled="!is_use"
                        :id="`sensor-name-${nodeId}`"
                        v-model="sensor.NAME"
                        type="text"
                        aria-describedby="sensor-name-help"
                        aria-autocomplete="off"
                        :class="{ 'p-invalid': invalidMessage.NAME }"
                        maxlength="64"
                        @input="onInputName"
                        @blur="onBlurName"
                    />
                    <small id="sensor-name-help" class="p-error">
                        {{ invalidMessage.NAME }}
                    </small>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label :for="`adjust-value-${nodeId}`">표현식</label>
                    <InputText
                        :disabled="!is_use"
                        :id="`adjust-value-${nodeId}`"
                        v-model="sensor.ADJUST_VALUE"
                        type="text"
                        aria-describedby="adjust-value-help"
                        aria-autocomplete="off"
                        maxlength="64"
                        :class="{ 'p-invalid': invalidMessage.ADJUST_VALUE }"
                        @input="onInputAdjustValue"
                        @blur="onBlurAdjustValue"
                    />
                    <small id="adjust-value-help" class="p-error">
                        {{ invalidMessage.ADJUST_VALUE }}
                    </small>
                </div>
                <div class="p-field p-col-8 p-mb-0">
                    <label>계산식</label>
                    <Button
                        :disabled="!is_use"
                        class="p-button-secondary p-button-sm"
                        :label="sensor.DATA_ADDRESS"
                        :style="{ border: 'none' }"
                        @click="showVirtualSensorDialog"
                    />
                    <virtual-sensor-dialog
                        :visible.sync="isShowVirtualSensorDialog"
                        :asset-name="assetName"
                        :init-sensor="initSensorData"
                    />
                </div>
            </div>
            <Panel
                ref="thresholdPanel"
                :toggleable="true"
                class="p-mt-2"
                :collapsed.sync="isCollapsedThresholdPanel"
            >
                <template #header>
                    <div v-if="isAnalog" class="p-d-flex">
                        <Button
                            class="p-button-text"
                            :style="{ opacity: 1 }"
                            :disabled="!isDispConv"
                            :label="sensorValueLabel"
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
                                            input-id="is_valid_min_max"
                                            v-model="is_valid_min_max"
                                        />
                                        <label for="is_valid_min_max">
                                            {{ validMinMaxLabel }}
                                        </label>
                                    </div>
                                    <div class="p-field p-mb-1">
                                        <label>임계치 상태 지속시간(초)</label>
                                        <i-input-number
                                            v-model="holdingTime"
                                            :min="0"
                                            :max="3600"
                                            :show-buttons="true"
                                            :auto-focus="true"
                                            :step="1"
                                            :max-fraction-digits="0"
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
                        :power="sensor.DISP_POWER"
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
                        :disabled="!is_event || !is_use"
                    />
                </div>
                <i-scroll-panel
                    v-else-if="!isAnalog && diThreshold !== null"
                    class="p-p-2 p-mr-3"
                    :style="{
                        'max-height': '50vh',
                        height: heightDIThresholdContent
                    }"
                >
                    <threshold-digital
                        :disabled="!is_use"
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
                        :disabled="!is_use"
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
import Component from '@/plugins/nuxt-class-component';
import IOverlayPanel from '../custom/iOverlayPanel.vue';

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
    NAME: string;
    SENSOR_CD: string;
    ADJUST_VALUE: string;
    DISP_POWER: number;
    DATA_ADDRESS: string;
    CURR_VALUE: number;
    CURR_STATUS: number;
    CURR_LEVEL: number;
    COMM_STATUS: number;
    NOTI_ADDMSG: string;
    IS_EVENT: number;
    IS_USE: number;
    IS_MKSTATS: number;
    IS_VIRTUAL: number;
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

interface DigitalThrehold {
    [index: string]: number | Array<DIValue>;
    ID: number;
    SENSOR_ID: number;
    HOLD_TIME: number;
    DI: Array<DIValue>;
}

@Component<VirtualSensorCard>({
    props: {
        initSensorData: {
            type: Object,
            default: undefined
        },
        assetName: String,
        sensorCodes: Array,
        displayPowerList: Array,
        levelCodes: Array,
        nodeId: Number,
        sensorCd: String,
        dispPower: Number,
        dataAddress: String,
        isUse: Number,
        isMkstats: Number,
        isEvent: Number,
        name: String,
        adjustValue: String,
        commStatus: Number,
        notiAddmsg: String,
        currStatus: Number,
        currLevel: Number,
        currValue: {
            default: 0,
            type: Number
        }
    },
    watch: {
        saveButtonDisabled(_is_disabled: boolean) {
            this.$emit('change', {
                ID: this.$props.initSensorData.ID,
                IS_EDIT: !(_is_disabled || this.checkDiThreshold)
            });
        },
        checkDiThreshold(_is_disabled: boolean) {
            this.$emit('change', {
                ID: this.$props.initSensorData.ID,
                IS_EDIT: !(this.saveButtonDisabled || this.checkDiThreshold)
            });
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
            prefetch: false,
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
                if (!loading && data) {
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
            prefetch: false,
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
                if (!loading && data) {
                    const { AssetThresholdByDI } = data;

                    if (AssetThresholdByDI) {
                        this.apolloFetchDI(AssetThresholdByDI);
                    }
                }
            }
        }
    }
})
export default class VirtualSensorCard extends Vue {
    $refs!: {
        thresholdPanel: any;
        dispPowerOverlayPanel: IOverlayPanel;
        thresholdSettingOverlayPanel: IOverlayPanel;
    };

    sensor: Sensor = {
        ID: this.$props.initSensorData.ID,
        ADJUST_VALUE: this.$props.adjustValue,
        COMM_STATUS: this.$props.commStatus,
        CURR_LEVEL: this.$props.currLevel,
        CURR_STATUS: this.$props.currStatus,
        CURR_VALUE: this.$props.currValue,
        DISP_POWER: this.$props.dispPower,
        SENSOR_CD: this.$props.sensorCd,
        DATA_ADDRESS: this.$props.dataAddress,
        IS_EVENT: this.$props.isEvent,
        IS_MKSTATS: this.$props.isMkstats,
        IS_USE: this.$props.isUse,
        IS_VIRTUAL: 1,
        NAME: this.$props.name,
        NOTI_ADDMSG: this.$props.notiAddmsg
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        ADJUST_VALUE: undefined as string | undefined
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

    dbDiThreshold: DigitalThrehold;
    diThreshold: DigitalThrehold = {
        ID: 0,
        SENSOR_ID: 0,
        HOLD_TIME: 0,
        DI: [] as Array<DIValue>
    };

    isCollapsedThresholdPanel: boolean = !this.$props.isEvent;

    isShowVirtualSensorDialog: boolean = false;

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

    apolloFetchDI(data: DigitalThrehold) {
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

    get sensorCardClass(): Array<object> {
        return [
            {
                'i-not-use-sensorcard': !this.is_use,
                'i-has-editing': !this.saveButtonDisabled
            }
        ];
    }

    get is_mkstats(): boolean {
        return this.sensor.IS_MKSTATS === 1;
    }

    set is_mkstats(_is_mkstats: boolean) {
        this.sensor.IS_MKSTATS = _is_mkstats ? 1 : 0;
        this.$emit('update:isMkstats', this.sensor.IS_MKSTATS);
    }

    get is_use(): boolean {
        return this.sensor.IS_USE === 1;
    }

    set is_use(_is_use: boolean) {
        this.sensor.IS_USE = _is_use ? 1 : 0;
        this.$emit('update:isUse', this.sensor.IS_USE);

        if (this.diThreshold.DI.length > 0 && !_is_use) {
            this.diThreshold.DI.forEach((di: DIValue) => {
                di.isEditableGrade = false;
                di.isEditableValue = false;
            });
        }
    }

    get isAnalog(): boolean {
        return this.sensorCode?.TYPE === 'A';
    }

    get isDispConv(): boolean {
        return !!this.sensor.IS_USE && !!this.sensorCode?.IS_DISP_CONV;
    }

    get isUnit(): boolean {
        return !!this.sensorCode?.UNIT;
    }

    get is_event(): boolean {
        return this.sensor.IS_EVENT === 1;
    }

    set is_event(_is_event: boolean) {
        this.sensor.IS_EVENT = _is_event ? 1 : 0;
        this.$emit('update:isEvent', this.sensor.IS_EVENT);

        this.isCollapsedThresholdPanel = !_is_event;

        // by shkoh 20231204: 통보가 활성화되면 임계치가 설정이 되어야하는데, 임계값이 존재하지 않는 경우에는 자동으로 임의의 값을 생성해줌
        if (_is_event) this.arrangeAiThreshold();
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

    get sensorValueLabel(): string {
        let label = '';

        if (this.isAnalog) {
            let num = this.currentValue;
            let prefix = '';
            let unit = '';

            if (this.dispCode) {
                num *= Math.pow(10, -this.dispCode.VALUE);
                prefix = this.dispCode.REMARK;
            }

            if (this.isUnit) {
                unit = this.sensorCode.UNIT;
            }

            label = `${Number(num.toFixed(4))} ${prefix}${unit}`;
        } else if (this.diThreshold) {
            const num = this.currentValue;
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

    get currentValue(): number {
        return this.$props.currValue;
    }

    get sensorCode(): SensorCode {
        return this.$props.sensorCodes.find(
            (code: SensorCode) => code.CODE === this.sensor.SENSOR_CD
        );
    }

    get sensorTypeName(): string {
        const code = this.sensorCode;
        return code ? code.NAME : '';
    }

    get dispCode(): Code {
        return this.$props.displayPowerList.find(
            (d: Code) => d.VALUE === this.sensor.DISP_POWER
        );
    }

    get is_valid(): boolean {
        let is_valid = true;

        for (const value of Object.values(this.invalidMessage)) {
            if (value) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
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

    get saveButtonDisabled(): boolean {
        let is_disabled = true;

        // by shkoh 20231206: 수집항목 명칭과 표현식이 공백일 경우에 저장버튼 비활성화
        if (
            this.sensor.NAME.length === 0 ||
            this.sensor.ADJUST_VALUE.length === 0
        ) {
            return true;
        }

        if (this.$props.initSensorData) {
            is_disabled = !this.isDiffSensor;
        }

        // by shkoh 20231206: 임계치 값이 변경되는 경우에도 저장 버튼의 활성화 여부를 체크함
        if (is_disabled === true && this.isAnalog) {
            is_disabled = !this.isDiffAiThreshold;
        } else if (is_disabled === true && !this.isAnalog) {
            is_disabled = !this.isDiffDiThreshold;
        }

        return is_disabled || !this.is_valid;
    }

    get isDiffSensor(): boolean {
        let is_diff = false;

        if (this.$props.initSensorData !== null) {
            const keys = [
                'NAME',
                'ADJUST_VALUE',
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

    get heightDIThresholdContent(): string {
        let content_height = 24 + 12;

        this.diThreshold.DI.forEach((d: DIValue) => {
            let di_height = 2;

            if (d.isEditableGrade || d.isEditableValue) {
                di_height += 48;
            } else {
                di_height += 36;
            }

            content_height += di_height;
        });

        // by shkoh 20231204: padding 값 추가
        if (this.diThreshold.DI.length === 0) {
            content_height += 12;
        } else {
            content_height += 6;
        }

        return `${content_height}px`;
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

    get changedSensorData(): any {
        const changed_data = {};

        [
            'NAME',
            'ADJUST_VALUE',
            'DISP_POWER',
            'IS_USE',
            'IS_EVENT',
            'IS_MKSTATS'
        ].forEach((key: string) => {
            if (this.sensor[key] !== this.$props.initSensorData[key]) {
                const value =
                    typeof this.sensor[key] === 'string'
                        ? this.sensor[key].toString().trimEnd()
                        : this.sensor[key];

                this.$set(changed_data, key, value);
                this.$set(this.sensor, key, value);
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

    arrangeAiThreshold() {
        const keys = [
            'VALID_MIN',
            'VALID_MAX',
            'POINT_N3',
            'POINT_N2',
            'POINT_N1',
            'POINT_P1',
            'POINT_P2',
            'POINT_P3'
        ];

        let do_arrange = true;

        keys.forEach((key: string) => {
            if (this.aiThreshold[key] !== 0) {
                do_arrange = false;
            }
        });

        if (do_arrange) {
            keys.forEach((key: string) => {
                switch (key) {
                    case 'POINT_N2':
                        this.aiThreshold[key] = 20;
                        break;
                    case 'POINT_N1':
                        this.aiThreshold[key] = 40;
                        break;
                    case 'POINT_P1':
                        this.aiThreshold[key] = 60;
                        break;
                    case 'POINT_P2':
                        this.aiThreshold[key] = 80;
                        break;
                    case 'POINT_P3':
                    case 'VALID_MAX':
                        this.aiThreshold[key] = 100;
                        break;
                }
            });
        }
    }

    onInputName(input: string) {
        const text = input.trimStart();

        if (text.length < 1) {
            this.invalidMessage.NAME = '1자 이상 입력해 주세요';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    onBlurName() {
        this.sensor.NAME = this.sensor.NAME.trim();
    }

    onInputAdjustValue(input: string) {
        const text = input.replace('UVAL', 'VAL');

        if (!text.includes('VAL')) {
            this.invalidMessage.ADJUST_VALUE =
                '표현식은 VAL(혹은 UVAL)이 반드시 포함되어야 합니다';
        } else if (text.indexOf('VAL') !== text.lastIndexOf('VAL')) {
            this.invalidMessage.ADJUST_VALUE =
                '표현식에 VAL(혹은 UVAL)은 반드시 하나이어야 합니다';
        } else if (isNaN(Number(this.runCalculate(text.replace('VAL', '1'))))) {
            this.invalidMessage.ADJUST_VALUE = '연산할 수 없는 수식입니다';
        } else {
            this.invalidMessage.ADJUST_VALUE = undefined;
        }
    }

    onBlurAdjustValue() {
        if (!this.sensor.ADJUST_VALUE) return;

        this.sensor.ADJUST_VALUE = this.sensor.ADJUST_VALUE.trim();
    }

    runCalculate(cal: string) {
        try {
            return Function('"use strict";return (' + cal + ')')();
        } catch {
            return NaN;
        }
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

    copyVirtualSensor() {}

    saveVirtualSensor() {
        this.$emit(
            'save',
            this.isAnalog,
            {
                NODE_ID: this.$props.nodeId,
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
                        : {}
            }
        );
    }

    deleteVirtualSensor() {}

    deleteDiThresholdItem(index: number) {
        this.diThreshold.DI.splice(index, 1);
    }

    addDiThresholdItem() {
        if (this.diThreshold.DI.length === 30) {
            this.$toast.add({
                severity: 'error',
                summary: '임계치 수 초과',
                detail: '임계치는 최대 30가지 경우를 표현할 수 있습니다',
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

    showThresholdSettingPanel(event: PointerEvent) {
        this.$refs.thresholdSettingOverlayPanel.toggle(event);
    }

    showDisplayPowerSettingPanel(event: PointerEvent) {
        this.$refs.dispPowerOverlayPanel.toggle(event);
    }

    showVirtualSensorDialog() {
        this.isShowVirtualSensorDialog = true;
    }
}
</script>

<style lang="scss" scoped>
#i-virtual-sensor-card::v-deep {
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

    .i-header-title {
        font-size: 1.2rem;
        font-weight: bold;

        .i-header-sub-title {
            font-weight: normal;
            font-size: 0.8rem;
            color: var(--text-color-secondary);
        }
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