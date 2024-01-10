<template>
    <div id="i-ds-asset-card" class="p-p-3">
        <Card :class="lvlCardStatus">
            <template #header>
                <div class="p-d-flex p-pl-3 p-pr-2 p-ai-center i-card-header">
                    <div :class="lvlStatus" />
                    <div class="i-header-text">
                        <span>{{ assetName }}</span>
                        <span class="i-header-type">- {{ assetTypeName }}</span>
                    </div>
                    <div class="p-ml-auto p-d-flex i-header-set">
                        <div class="i-comm-status">
                            <svg-sensor-on
                                v-if="commStatus"
                                class="i-comm-icon"
                            />
                            <svg-sensor-off v-else class="i-comm-icon" />
                        </div>
                        <Button
                            class="p-button-sm p-button-text p-button-secondary"
                            icon="pi pi-clone"
                            title="상세설정"
                            @click="onClickAssetCard"
                        />
                    </div>
                </div>
                <div class="p-px-3">
                    <Divider class="p-my-1" />
                </div>
            </template>
            <template #content>
                <div class="p-d-flex p-column">
                    <div v-if="sensorIndex > 1" class="p-mr-1 p-as-center">
                        <Button
                            icon="pi pi-chevron-left"
                            class="p-button-sm p-button-text p-button-rounded p-button-secondary p-px-1"
                            @click="onClickPrev"
                        />
                    </div>
                    <div class="i-sensor-content p-pr-1 p-pl-2">
                        <div v-if="sensor1" class="p-d-inline-flex">
                            {{ sensor1Name }}
                        </div>
                        <div v-if="sensor1" :class="sensor1Style">
                            <span class="i-sensor-value">
                                {{ sensor1Value }}
                            </span>
                            <span class="i-sensor-unit">
                                {{ sensor1Unit }}
                            </span>
                        </div>
                    </div>
                    <div class="i-sensor-content p-pl-1 p-pr-2">
                        <div v-if="sensor2" class="p-d-inline-flex">
                            {{ sensor2Name }}
                        </div>
                        <div v-if="sensor2" :class="sensor2Style">
                            <span class="i-sensor-value">
                                {{ sensor2Value }}
                            </span>
                            <span class="i-sensor-unit">
                                {{ sensor2Unit }}
                            </span>
                        </div>
                    </div>
                    <div
                        v-if="sensorIndex < sensors.length - 2"
                        class="p-ml-1 p-as-center"
                    >
                        <Button
                            icon="pi pi-chevron-right"
                            class="p-button-sm p-button-text p-button-rounded p-button-secondary p-px-1"
                            @click="onClickNext"
                        />
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';

interface Threshold_DI {
    [index: string]: string | null;
    VALUE_0_LABEL: string | null;
    VALUE_1_LABEL: string | null;
    VALUE_2_LABEL: string | null;
    VALUE_3_LABEL: string | null;
    VALUE_4_LABEL: string | null;
    VALUE_5_LABEL: string | null;
    VALUE_6_LABEL: string | null;
    VALUE_7_LABEL: string | null;
    VALUE_8_LABEL: string | null;
    VALUE_9_LABEL: string | null;
    VALUE_10_LABEL: string | null;
    VALUE_11_LABEL: string | null;
    VALUE_12_LABEL: string | null;
    VALUE_13_LABEL: string | null;
    VALUE_14_LABEL: string | null;
    VALUE_15_LABEL: string | null;
    VALUE_16_LABEL: string | null;
    VALUE_17_LABEL: string | null;
    VALUE_18_LABEL: string | null;
    VALUE_19_LABEL: string | null;
    VALUE_20_LABEL: string | null;
    VALUE_21_LABEL: string | null;
    VALUE_22_LABEL: string | null;
    VALUE_23_LABEL: string | null;
    VALUE_24_LABEL: string | null;
    VALUE_25_LABEL: string | null;
    VALUE_26_LABEL: string | null;
    VALUE_27_LABEL: string | null;
    VALUE_28_LABEL: string | null;
    VALUE_29_LABEL: string | null;
}

interface Sensor {
    [index: string]: number | string | boolean | null | Threshold_DI;
    ID: number;
    INTF_ID: number;
    NAME: string;
    SENSOR_CD: string;
    NODE_ID: number;
    CURR_VALUE: number;
    CURR_STATUS: number;
    COMM_STATUS: number;
    CURR_LEVEL: number;
    DISP_POWER: number;
    IS_USE: number;
    IS_EVENT: number;
    THRESHOLD_DI: Threshold_DI | null;
}

interface SensorCode {
    [index: string]: number | string;
    CODE: string;
    NAME: string;
    TYPE: string;
    UNIT: string;
    IS_DISP_CONV: number;
}

interface DisplayPowerCode {
    [index: string]: number | string;
    CODE: string;
    NAME: string;
    VALUE: number;
    REMARK: string;
}

@Component<DsAssetCard>({
    props: {
        asset: {
            type: Object,
            default: null
        }
    },
    apollo: {
        assetCodes: {
            query: gql`
                query {
                    PredefinedAssetCodes {
                        CODE
                        NAME
                        ALIAS
                    }
                }
            `,
            update: ({ PredefinedAssetCodes }) => PredefinedAssetCodes
        },
        sensors: {
            query: gql`
                query ($INTF_ID: Int!) {
                    AssetSensors(INTF_ID: $INTF_ID) {
                        ID
                        INTF_ID
                        NAME
                        SENSOR_CD
                        NODE_ID
                        CURR_VALUE
                        CURR_STATUS
                        COMM_STATUS
                        CURR_LEVEL
                        DISP_POWER
                        IS_USE
                        IS_EVENT
                        THRESHOLD_DI {
                            VALUE_0_LABEL
                            VALUE_1_LABEL
                            VALUE_2_LABEL
                            VALUE_3_LABEL
                            VALUE_4_LABEL
                            VALUE_5_LABEL
                            VALUE_6_LABEL
                            VALUE_7_LABEL
                            VALUE_8_LABEL
                            VALUE_9_LABEL
                            VALUE_10_LABEL
                            VALUE_11_LABEL
                            VALUE_12_LABEL
                            VALUE_13_LABEL
                            VALUE_14_LABEL
                            VALUE_15_LABEL
                            VALUE_16_LABEL
                            VALUE_17_LABEL
                            VALUE_18_LABEL
                            VALUE_19_LABEL
                            VALUE_20_LABEL
                            VALUE_21_LABEL
                            VALUE_22_LABEL
                            VALUE_23_LABEL
                            VALUE_24_LABEL
                            VALUE_25_LABEL
                            VALUE_26_LABEL
                            VALUE_27_LABEL
                            VALUE_28_LABEL
                            VALUE_29_LABEL
                        }
                    }
                }
            `,
            skip() {
                //by mj 2023.05.09 : asset.ID가 null or 0보다 작을때 쿼리를 건너뜀
                return (
                    this.$props.asset === null ||
                    Number(this.$props.asset.ID) < 0
                );
            },
            //by mj 2023.05.09 :컴포넌트가 마운트 될 때 자동으로 쿼리가 실행
            prefetch: true,
            variables() {
                return {
                    INTF_ID: Number(this.$props.asset.ID)
                };
            },
            //by mj 2023.05.09 : update()은 쿼리 결과에서 AssetSensors 값을 추출하고 반환(=데이터 수정), 수집항목 설정 유,무 = IS_USE(0 or 1)
            update: ({ AssetSensors }) =>
                AssetSensors.filter((sensor: Sensor) => sensor.IS_USE === 1)
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
        sensorCodeList: {
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
        }
    },
    watch: {
        lvlCardStatus() {
            this.$apollo.queries.sensors.refresh();
        }
    }
})
export default class DsAssetCard extends Vue {
    timeInst: NodeJS.Timer | null;

    assetCodes: Array<any> = [];

    sensors: Array<Sensor> = [];
    sensorCodeList: Array<SensorCode> = [];
    displayPowerList: Array<DisplayPowerCode> = [];

    sensorIndex: number = 0;
    isLoop: boolean = true;

    mounted() {
        this.startLoop();
    }

    beforeDestroy() {
        if (this.timeInst) {
            clearInterval(this.timeInst);
        }
    }

    startLoop() {
        this.timeInst = setInterval(() => {
            if (this.sensors.length === 0 && this.timeInst) {
                clearInterval(this.timeInst);
                return;
            }

            if (this.sensorIndex + 2 < this.sensors.length) {
                this.sensorIndex += 2;
            } else {
                this.sensorIndex = 0;
            }

            this.$apollo.queries.sensors.refresh();
        }, 6000);
    }

    onClickAssetCard() {
        eventBus.$emit('showAssetDialog', this.$props.asset);
    }

    valueText(item: Sensor): string {
        let text = '';
        const { CURR_STATUS } = this.$props.asset.INTERFACE;
        if (CURR_STATUS > 1) {
            return ' - ';
        }

        if (item.THRESHOLD_DI === null) {
            let num = item.CURR_VALUE;

            const dispCode = this.displayPowerList.find(
                (disp: DisplayPowerCode) => disp.VALUE === item.DISP_POWER
            );
            if (dispCode) {
                num *= Math.pow(10, -dispCode.VALUE);
            }

            text = `${Number(num.toFixed(1)).toLocaleString()}`;
        } else {
            text =
                item.THRESHOLD_DI[`VALUE_${item.CURR_VALUE}_LABEL`] ??
                '미설정 값';
        }

        return text;
    }

    unitText(item: Sensor): string | undefined {
        let text: string | undefined;
        const { CURR_STATUS } = this.$props.asset.INTERFACE;
        if (CURR_STATUS > 1) {
            return undefined;
        }

        if (item.THRESHOLD_DI === null) {
            let num = item.CURR_VALUE;
            let prefix = '';
            let unit = '';

            const dispCode = this.displayPowerList.find(
                (disp: DisplayPowerCode) => disp.VALUE === item.DISP_POWER
            );
            if (dispCode) {
                num *= Math.pow(10, -dispCode.VALUE);
                prefix = dispCode.REMARK;
            }

            const sensorCode = this.sensorCodeList.find(
                (sensor: SensorCode) => sensor.CODE === item.SENSOR_CD
            );
            if (sensorCode) {
                unit = sensorCode.UNIT;
            }

            text = `${prefix}${unit}`;
        } else {
            text = undefined;
        }

        return text;
    }

    sensorStatus(item: Sensor): Array<object | string> {
        const is_use = item.IS_USE;
        const is_event = item.IS_EVENT;
        const lvl = item.CURR_LEVEL;

        return [
            'p-mr-2 i-sensor-icon',
            {
                'i-not-used': is_use === 0,
                'i-lvl-null': is_event === 0,
                'i-lvl00': is_use === 1 && is_event === 1 && lvl === 0,
                'i-lvl01': is_use === 1 && is_event === 1 && lvl === 1,
                'i-lvl02': is_use === 1 && is_event === 1 && lvl === 2,
                'i-lvl03': is_use === 1 && is_event === 1 && lvl === 3,
                'i-lvl04': is_use === 1 && is_event === 1 && lvl === 4,
                'i-lvl05': is_use === 1 && is_event === 1 && lvl === 5
            }
        ];
    }

    is_used_interface({ IS_USE_INTF }: any): boolean {
        return IS_USE_INTF === 1;
    }

    onClickPrev() {
        this.sensorIndex -= 2;
    }

    onClickNext() {
        this.sensorIndex += 2;
    }

    get lvlCardStatus(): Array<object | string> {
        const { CURR_LEVEL, CURR_STATUS } = this.$props.asset.INTERFACE;

        return [
            {
                'i-card-box-lvl01': CURR_STATUS <= 1 && CURR_LEVEL === 1,
                'i-card-box-lvl02': CURR_STATUS <= 1 && CURR_LEVEL === 2,
                'i-card-box-lvl03': CURR_STATUS <= 1 && CURR_LEVEL === 3
            }
        ];
    }

    get lvlStatus(): Array<object | string> {
        const { CURR_LEVEL, CURR_STATUS } = this.$props.asset.INTERFACE;

        return [
            'p-mr-2',
            {
                'i-header-level': CURR_STATUS <= 1 && CURR_LEVEL > 0,
                'i-card-lvl01': CURR_STATUS <= 1 && CURR_LEVEL === 1,
                'i-card-lvl02': CURR_STATUS <= 1 && CURR_LEVEL === 2,
                'i-card-lvl03': CURR_STATUS <= 1 && CURR_LEVEL === 3
            }
        ];
    }

    get commStatus(): boolean {
        return this.$props.asset.INTERFACE.CURR_STATUS <= 1;
    }

    get sensor1Style(): Array<object | string> {
        let lvl = 0;

        if (this.sensor1 && this.sensor1.IS_EVENT === 1) {
            lvl = this.sensor1.CURR_LEVEL;
        }

        return [
            'i-sensor-content-value',
            {
                'i-value-lvl-text i-value-lvl01': lvl === 1,
                'i-value-lvl-text i-value-lvl02': lvl === 2,
                'i-value-lvl-text i-value-lvl03': lvl === 3
            }
        ];
    }

    get sensor2Style(): Array<object | string> {
        let lvl = 0;

        if (this.sensor2 && this.sensor2.IS_EVENT === 1) {
            lvl = this.sensor2.CURR_LEVEL;
        }

        return [
            'i-sensor-content-value',
            {
                'i-value-lvl-text i-value-lvl01': lvl === 1,
                'i-value-lvl-text i-value-lvl02': lvl === 2,
                'i-value-lvl-text i-value-lvl03': lvl === 3
            }
        ];
    }

    get assetName(): string {
        return this.$props.asset?.NAME;
    }

    get assetTypeName(): string {
        const type = this.assetCodes.find(
            (c: any) => c.CODE === this.$props.asset.PRODUCT.ASSET_CD
        );

        return type?.ALIAS && type?.ALIAS.length > 0 ? type?.ALIAS : type?.NAME;
    }

    get sensor1(): Sensor | undefined {
        return Array.isArray(this.sensors)
            ? this.sensors[this.sensorIndex]
            : undefined;
    }

    get sensor2(): Sensor | undefined {
        return Array.isArray(this.sensors)
            ? this.sensors[this.sensorIndex + 1]
            : undefined;
    }

    get sensor1Name(): string {
        const sensor = this.sensor1;
        return sensor ? sensor.NAME : '';
    }

    get sensor2Name(): string {
        const sensor = this.sensor2;
        return sensor ? sensor.NAME : '';
    }

    get sensor1Value(): string | undefined {
        const sensor = this.sensor1;
        return sensor ? this.valueText(sensor) : undefined;
    }

    get sensor2Value(): string | undefined {
        const sensor = this.sensor2;
        return sensor ? this.valueText(sensor) : undefined;
    }

    get sensor1Unit(): string | undefined {
        const sensor = this.sensor1;
        return sensor ? this.unitText(sensor) : undefined;
    }

    get sensor2Unit(): string | undefined {
        const sensor = this.sensor2;
        return sensor ? this.unitText(sensor) : undefined;
    }
}
</script>

<style lang="scss" scoped>
#i-ds-asset-card::v-deep {
    .p-card {
        border-radius: 0.5rem;
        border: 1px solid var(--surface-border);
        box-shadow: none;

        .p-card-header {
            padding: 0.5rem 0;
        }

        .p-card .p-card-body {
            padding: 0.5rem;

            .p-card-content {
                padding: 0.5rem 0;
                height: 100%;
            }
        }
    }

    .i-comm-status {
        display: flex;
        align-items: center;

        .i-comm-icon {
            width: 1.2rem;
            height: 1.2rem;
        }
    }

    .i-card-header {
        height: 3vh;
    }

    .i-card-footer {
        width: 100%;
    }

    .i-header-text {
        font-size: 1.6rem;
        font-weight: bold;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .i-header-type {
        font-size: 0.8rem;
        font-weight: 600;
    }

    .i-header-level {
        border-radius: 2px;
        min-width: 1rem;
        flex: 0 1 1rem;
        height: 70%;
    }

    .i-card-box-lvl01 {
        box-shadow: inset 0px 0px 4px 3px var(--warning);
    }

    .i-card-box-lvl02 {
        box-shadow: inset 0px 0px 4px 3px var(--major);
    }

    .i-card-box-lvl03 {
        box-shadow: inset 0px 0px 4px 3px var(--critical);
    }

    .i-card-lvl01 {
        background-color: var(--warning);
        color: var(--text-alert-warning-color);
    }

    .i-card-lvl02 {
        background-color: var(--major);
    }

    .i-card-lvl03 {
        background-color: var(--critical);
    }

    .i-card-lvl01-text {
        color: var(--warning);
        font-weight: bold;
    }

    .i-card-lvl02-text {
        color: var(--major);
    }

    .i-card-lvl03-text {
        color: var(--critical);
    }

    .i-value-lvl-text {
        flex: 1 1 auto;
        text-shadow: 1px 1px #111111;
    }

    .i-header-set {
        flex: 0 0 auto;
    }

    .i-value-lvl01 {
        color: var(--warning);
    }

    .i-value-lvl02 {
        color: var(--major);
    }

    .i-value-lvl03 {
        color: var(--critical);
    }

    .i-sensor-content {
        flex: 1 1 auto;
        flex-wrap: nowrap;
        overflow: hidden;
    }

    .i-sensor-content-value {
        text-align: right;
    }

    .i-asset-index {
        position: relative;
        width: 1.5rem;
        height: 1.5rem;

        .i-asset-comm-status {
            position: absolute;
            top: 0;
            right: 0;
            transform-origin: 100% 0;
            transform: translate(40%, -40%);
            width: 0.8rem;
            height: 0.8rem;
        }
    }

    .i-sensor-icon {
        width: 1rem;
        height: 1rem;
    }

    .i-sensor-value {
        font-size: 3.2rem;
        font-weight: bold;
        letter-spacing: -0.2rem;
    }

    .i-sensor-unit {
        font-size: 1.2rem;
    }
}
</style>
