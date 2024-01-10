<template>
    <i-dialog
        id="asset-add-dialog-sensor"
        :modal="true"
        :content-style="{
            width: '20vw',
            height: '40vh'
        }"
        :visible.sync="showDialog"
        @show="onShow"
        @hide="onHide"
    >
        <template #header>수집항목 추가</template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small>
                    {{ subTitle }}
                </small>
            </div>
            <div class="p-field">
                <label for="name"> 수집항목 명칭 </label>
                <InputText
                    v-model="sensor.NAME"
                    id="name"
                    type="text"
                    autocomplete="off"
                    aria-autocomplete="none"
                    maxLength="65"
                    :class="{ 'p-invalid': invalidMessage.NAME }"
                    @input="onInputName"
                    @blur="onBlurSensorName"
                />
                <div>
                    <small class="p-error">
                        {{ invalidMessage.NAME }}
                    </small>
                </div>
            </div>
            <div class="p-field">
                <label for="adjust-value"> 표현식 </label>
                <InputText
                    v-model="sensor.ADJUST_VALUE"
                    id="adjust-value"
                    type="text"
                    autocomplete="off"
                    aria-autocomplete="none"
                    maxLength="65"
                    :class="{ 'p-invalid': invalidMessage.ADJUST_VALUE }"
                    @input="onInputAdjustValue"
                    @blur="onBlurAdjustValue"
                />
                <div>
                    <small class="p-error">
                        {{ invalidMessage.ADJUST_VALUE }}
                    </small>
                </div>
            </div>
            <div class="p-field">
                <label> 종류{{ addedInfoText }} </label>
                <div class="p-d-flex">
                    <Dropdown
                        input-id="sensor-codes"
                        class="p-mr-1"
                        v-model="sensor.SENSOR_CD"
                        :options="sensorCodes"
                        option-label="NAME"
                        option-value="CODE"
                        data-key="CODE"
                        empty-filter-message="수집항목의 종류를 불러올 수 없습니다"
                        appendTo="body"
                        :style="{ flex: 2 }"
                    />
                    <Dropdown
                        v-if="isShowDisplayPower"
                        input-id="disp-power-list"
                        class="p-ml-1"
                        :style="{ flex: 1 }"
                        v-model="sensor.DISP_POWER"
                        :options="displayPowerList"
                        option-label="NAME"
                        option-value="VALUE"
                        data-key="CODE"
                        empty-filter-message="단위정보를 불러올 수 없습니다"
                        appendTo="body"
                    />
                </div>
            </div>
            <div class="p-field">
                <label> 임계값 </label>
                <Dropdown
                    :disabled="thresholdList.length === 0"
                    v-model="sensor.THRESHOLD_ID"
                    input-id="threshold"
                    :options="thresholdList"
                    option-label="NAME"
                    option-value="ID"
                    data-key="ID"
                    emptyFilterMessage="사전 정의된 임계값이 없습니다"
                    placeholder="임계값을 지정합니다"
                    append-to="body"
                />
            </div>
            <Divider />
            <div class="p-field-checkbox">
                <Checkbox
                    id="is_stat"
                    v-model="is_mkstats"
                    :binary="true"
                    :disabled="isDi"
                />
                <label> 통계생성 </label>
            </div>
            <div class="p-field-checkbox">
                <Checkbox id="is_alert" v-model="is_event" :binary="true" />
                <label> 통보 </label>
            </div>
            <Divider />
            <div class="p-field-checkbox">
                <Checkbox id="is_virtual" v-model="is_virtual" :binary="true" />
                <label> 가상 수집항목 </label>
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    :disabled="applyAddSensorDisabled"
                    label="추가"
                    icon="pi pi-plus"
                    :style="{ width: '100%' }"
                    @click="onClickAddSensor"
                />
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface AddSensorInfo {
    [index: string]: string | number;
    INTF_ID: number;
    NAME: string;
    SENSOR_CD: string;
    ADJUST_VALUE: string;
    DISP_POWER: number;
    IS_EVENT: number;
    IS_MKSTATS: number;
    IS_VIRTUAL: number;
    THRESHOLD_ID: number;
    NODE_ID: number;
}

interface SensorCode {
    [index: string]: string | number;
    CODE: string;
    NAME: string;
    TYPE: string;
    UNIT: string;
    IS_DISP_CONV: number;
}

interface Code {
    [index: string]: string | number;
    CODE: string;
    NAME: string;
    VALUE: string;
    REMARK: string;
}

interface ThresholdInfo {
    [index: string]: string | number;
    ID: number;
    NAME: string;
    SENSOR_CD: string;
}

@Component<AssetAddDialogSensor>({
    props: {
        visible: {
            default: false,
            type: Boolean
        },
        asset: Object,
        nodeId: {
            default: false,
            type: Number
        }
    },
    apollo: {
        sensorCodes: {
            query: gql`
                query {
                    SensorCodes {
                        CODE
                        NAME
                        TYPE
                        UNIT
                        IS_DISP_CONV
                    }
                }
            `,
            update: ({ SensorCodes }) => SensorCodes
        },
        displayPowerList: {
            query: gql`
                query {
                    Codes(TYPE: "POWER") {
                        CODE
                        NAME
                        VALUE
                        REMARK
                    }
                }
            `,
            update: ({ Codes }) => Codes
        },
        thresholdAIList: {
            query: gql`
                query ($SENSOR_CD: String!) {
                    PredefineThresholdsByAI(SENSOR_CD: $SENSOR_CD) {
                        ID
                        NAME
                        SENSOR_CD
                    }
                }
            `,
            skip() {
                return this.sensor.SENSOR_CD.length === 0;
            },
            variables() {
                return {
                    SENSOR_CD: this.sensor.SENSOR_CD ?? ''
                };
            },
            update: ({ PredefineThresholdsByAI }) => PredefineThresholdsByAI
        },
        thresholdDIList: {
            query: gql`
                query ($SENSOR_CD: String!) {
                    PredefineThresholdsByDI(SENSOR_CD: $SENSOR_CD) {
                        ID
                        NAME
                        SENSOR_CD
                    }
                }
            `,
            skip() {
                return this.sensor.SENSOR_CD.length === 0;
            },
            variables() {
                return {
                    SENSOR_CD: this.sensor.SENSOR_CD ?? ''
                };
            },
            update: ({ PredefineThresholdsByDI }) => PredefineThresholdsByDI
        }
    },
    watch: {
        isDi(_is) {
            if (_is && this.sensor.IS_MKSTATS === 1) {
                this.sensor.IS_MKSTATS = 0;
            }
        }
    }
})
export default class AssetAddDialogSensor extends Vue {
    sensor: AddSensorInfo = {
        INTF_ID:
            this.$props.asset && this.$props.asset.ID
                ? Number(this.$props.asset.ID)
                : -1,
        NAME: '',
        SENSOR_CD: '',
        ADJUST_VALUE: 'VAL',
        DISP_POWER: 0,
        IS_EVENT: 0,
        IS_MKSTATS: 0,
        IS_VIRTUAL: 0,
        THRESHOLD_ID: -1,
        NODE_ID: this.$props.nodeId ? this.$props.nodeId : -1
    };

    sensorCodes: Array<SensorCode> = [];
    displayPowerList: Array<Code> = [];
    thresholdAIList: Array<ThresholdInfo> = [];
    thresholdDIList: Array<ThresholdInfo> = [];

    invalidMessage = {
        NAME: undefined as string | undefined,
        ADJUST_VALUE: undefined as string | undefined
    };

    types: Array<unknown> = [
        { name: '일반 수집항목', value: 1 },
        { name: '가상 수집항목', value: 2 }
    ];

    onShow() {
        this.sensor.INTF_ID =
            this.$props.asset && this.$props.asset.ID
                ? Number(this.$props.asset.ID)
                : -1;
        this.sensor.NODE_ID = this.$props.nodeId;
    }

    onHide() {
        // by shkoh 20231110: Dialog가 닫힐 때 데이터의 초기화
        this.sensor.INTF_ID = -1;
        this.sensor.NAME = '';
        this.sensor.SENSOR_CD = '';
        this.sensor.ADJUST_VALUE = 'VAL';
        this.sensor.DISP_POWER = 0;
        this.sensor.IS_EVENT = 0;
        this.sensor.IS_MKSTATS = 0;
        this.sensor.IS_VIRTUAL = 0;
        this.sensor.THRESHOLD_ID = -1;
        this.sensor.NODE_ID = -1;

        this.invalidMessage.NAME = undefined;
        this.invalidMessage.ADJUST_VALUE = undefined;
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get subTitle(): string {
        return `자산 [${this.$props.asset.NAME}]의 수집항목을 추가합니다`;
    }

    get isShowDisplayPower(): boolean {
        this.sensor.DISP_POWER = 0;

        return (
            this.sensorCodes.find(
                (s: SensorCode) => s.CODE === this.sensor.SENSOR_CD
            )?.IS_DISP_CONV === 1
        );
    }

    get thresholdList(): Array<ThresholdInfo> {
        const s_info = this.sensorCodes.find(
            (s: SensorCode) => s.CODE === this.sensor.SENSOR_CD
        );

        if (s_info === undefined) return [];

        if (s_info.TYPE === 'A') return this.thresholdAIList;
        else if (s_info.TYPE === 'D') return this.thresholdDIList;
        else return [];
    }

    get is_mkstats(): boolean {
        return this.sensor.IS_MKSTATS === 1;
    }

    set is_mkstats(_is: boolean) {
        this.sensor.IS_MKSTATS = _is ? 1 : 0;
    }

    get is_event(): boolean {
        return this.sensor.IS_EVENT === 1;
    }

    set is_event(_is: boolean) {
        this.sensor.IS_EVENT = _is ? 1 : 0;
    }

    get is_virtual(): boolean {
        return this.sensor.IS_VIRTUAL === 1;
    }

    set is_virtual(_is: boolean) {
        this.sensor.IS_VIRTUAL = _is ? 1 : 0;
    }

    get applyAddSensorDisabled(): boolean {
        let disabled = false;

        for (const val of Object.values(this.invalidMessage)) {
            if (val !== undefined) {
                disabled = true;
                break;
            }
        }

        if (!disabled) {
            disabled = this.sensor.NAME.length < 1;
        }

        if (!disabled) {
            disabled = this.sensor.SENSOR_CD === '';
        }

        return disabled;
    }

    get isDi(): boolean {
        const sensor_code = this.sensorCodes.find(
            (s: SensorCode) => s.CODE === this.sensor.SENSOR_CD
        );

        return sensor_code ? sensor_code.TYPE === 'D' : true;
    }

    get addedInfoText(): string {
        let prefix = '';
        let unit = '';

        const power = this.displayPowerList.find(
            (d: Code) => Number(d.VALUE) === this.sensor.DISP_POWER
        );
        if (power) {
            prefix = power.REMARK;
        }

        const sensor_code = this.sensorCodes.find(
            (s: SensorCode) => s.CODE === this.sensor.SENSOR_CD
        );

        if (sensor_code && sensor_code.UNIT) {
            unit =
                prefix.length > 0
                    ? `${prefix}${sensor_code.UNIT}`
                    : sensor_code.UNIT;
        }

        return unit.length > 0 ? `(${unit})` : '';
    }

    onInputName(input: string) {
        const text = input.trimStart();

        if (text.length < 1) {
            this.invalidMessage.NAME = '1자 이상 입력해 주세요';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    onBlurSensorName() {
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
        this.sensor.ADJUST_VALUE = this.sensor.ADJUST_VALUE.trim();
    }

    runCalculate(cal: string) {
        try {
            return Function('"use strict";return (' + cal + ')')();
        } catch {
            return NaN;
        }
    }

    onClickAddSensor() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($SENSOR: cn_sensor_add_input!) {
                        AddSensor(SENSOR: $SENSOR)
                    }
                `,
                variables: {
                    SENSOR: this.sensor
                }
            })
            .then(() => {
                this.$emit('refetch');

                this.showDialog = false;

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 추가 완료',
                    detail: `${this.sensor.NAME} 수집항목 추가`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '수집항목 추가 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }
}
</script>