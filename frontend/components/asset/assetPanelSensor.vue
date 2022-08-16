<template>
    <div
        v-if="!$apollo.loading"
        id="i-asset-panel-sensor"
        class="p-px-2 p-pb-4"
        :style="{ height: '100%' }"
    >
        <DataTable
            :value="sensors"
            data-key="ID"
            :scrollable="true"
            scroll-height="flex"
            :row-hover="true"
        >
            <template #header>
                <div class="i-table-header p-d-flex">
                    <div class="p-ml-auto">
                        <Button
                            icon="pi pi-save"
                            label="SAVE ALL"
                            class="p-button-outlined p-button-secondary"
                            :disabled="isDisabledAllButton"
                            @click="saveAll"
                        />
                        <Button
                            icon="pi pi-plus"
                            label="ADD"
                            class="p-button-outlined p-button-secondary"
                            @click="addSensor"
                        />
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="i-table-empty">수집항목을 추가하세요</div>
            </template>
            <Column
                :row-reorder="true"
                :styles="{ 'flex-grow': 1, 'flex-basis': 0 }"
            />
            <Column key="ID" :styles="{ 'flex-grow': 1, 'flex-basis': '100%' }">
                <template #body="slotProps">
                    <sensor-card
                        :ref="'sensorCard_' + slotProps.data.ID"
                        :has-comm="hasComm"
                        :sensor-codes="sensorCodeList"
                        :modbus-commands="commandList"
                        :display-power-list="displayPowerList"
                        :level-codes="levelCodes"
                        :init-sensor-data="slotProps.data"
                        :node-id="slotProps.index + 1"
                        :is-use="slotProps.data.IS_USE"
                        :is-mkstats="slotProps.data.IS_MKSTATS"
                        :is-event="slotProps.data.IS_EVENT"
                        :name="slotProps.data.NAME"
                        :adjust-value="slotProps.data.ADJUST_VALUE"
                        :data-address="slotProps.data.DATA_ADDRESS"
                        :sensor-cd="slotProps.data.SENSOR_CD"
                        :mc-id="slotProps.data.MC_ID"
                        :curr-value="slotProps.data.CURR_VALUE"
                        :disp-power="slotProps.data.DISP_POWER"
                        :comm-status="slotProps.data.COMM_STATUS"
                        :noti-addmsg="slotProps.data.NOTI_ADDMSG"
                        :curr-status="slotProps.data.CURR_STATUS"
                        :curr-level="slotProps.data.CURR_LEVEL"
                        @save="onSaveSensor"
                        @copy="onCopySensor"
                        @delete="onDeleteSensor"
                        @change="onChangeSensorCard"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import SensorCard from '../common/sensorCard.vue';
import Component from '@/plugins/nuxt-class-component';

interface Sensor {
    [index: string]: number | string | boolean;
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
    is_editable: boolean;
}

interface ChangedDataInfo {
    ID: number;
    IS_EDIT: boolean;
}

@Component<AssetPanelSensor>({
    props: {
        assetItem: Object,
        hasComm: Boolean
    },
    watch: {
        assetItem() {
            this.isDisabledAllButton = true;
        }
    },
    apollo: {
        dbSensors: {
            query: gql`
                query ($INTF_ID: Int!) {
                    AssetSensors(INTF_ID: $INTF_ID) {
                        ID
                        INTF_ID
                        NAME
                        SENSOR_CD
                        DATA_ADDRESS
                        NODE_ID
                        ADJUST_VALUE
                        MC_ID
                        CURR_VALUE
                        CURR_STATUS
                        CURR_LEVEL
                        COMM_STATUS
                        DISP_POWER
                        NOTI_ADDMSG
                        IS_USE
                        IS_EVENT
                        IS_VIRTUAL
                        IS_MKSTATS
                        IS_LG_1MIN
                    }
                }
            `,
            skip() {
                return Number(this.$props.assetItem.ID) < 0;
            },
            variables() {
                return {
                    INTF_ID: Number(this.$props.assetItem.ID)
                };
            },
            update: ({ AssetSensors }) => AssetSensors,
            result({ loading, data }) {
                if (!loading) {
                    const { AssetSensors } = data;

                    if (AssetSensors) {
                        // by shkoh 20220706: apollo를 통하여 가져온 데이터와 SensorCard 컴포넌트를 통하여 sync가 이루어진 데이터들의 변화가 감지되면 수초 뒤에,
                        //                    변경된 데이터로 새로 해당 루틴이 발생함(단, Database를 통하여 발생되는 것은 아님)
                        this.apolloFetch(AssetSensors);
                    }
                }
            },
            fetchPolicy: 'cache-and-network'
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
        },
        commandList: {
            query: gql`
                query ($INTF_ID: Int!) {
                    ModbusCommands(INTF_ID: $INTF_ID) {
                        ID
                        MC_ID
                        FUNC_NO
                        START_ADDR
                        POINT_CNT
                        DTYPE_NAME
                    }
                }
            `,
            skip() {
                return Number(this.$props.assetItem.ID) < 0;
            },
            variables() {
                return {
                    INTF_ID: Number(this.$props.assetItem.ID)
                };
            },
            update: ({ ModbusCommands }) => ModbusCommands
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
        levelCodes: {
            query: gql`
                query {
                    Codes(TYPE: "LEVEL") {
                        CODE
                        NAME
                        VALUE
                    }
                }
            `,
            update: ({ Codes }) => Codes
        }
    }
})
export default class AssetPanelSensor extends Vue {
    dbSensors: Array<Sensor> = [];
    sensors: Array<Sensor> = [];

    changedSensorList: Array<ChangedDataInfo> = [];

    sensorCodeList: Array<any> = [];
    commandList: Array<any> = [];
    displayPowerList: Array<any> = [];
    levelCodes: Array<any> = [];

    isDisabledAllButton: boolean = true;

    refetchSensors() {
        this.$apollo.queries.dbSensors.refetch();
    }

    refetchThreshold(sensor_id: string) {
        const sensor_card: SensorCard = this.$refs[
            `sensorCard_${sensor_id}`
        ] as SensorCard;

        if (sensor_card) {
            sensor_card.refetchThreshold();
        }
    }

    reset() {
        this.sensors.splice(0, this.sensors.length);
        this.changedSensorList.splice(0, this.changedSensorList.length);
    }

    apolloFetch(sensors: Array<Sensor>) {
        this.reset();

        for (const sensor of sensors) {
            this.sensors.push(sensor);
        }
    }

    onChangeSensorCard({ ID, IS_EDIT }: any) {
        const changed_sensor = this.changedSensorList.find(
            (s: ChangedDataInfo) => s.ID === ID
        );
        if (changed_sensor === undefined) {
            this.changedSensorList.push({ ID, IS_EDIT });
        } else {
            changed_sensor.IS_EDIT = IS_EDIT;
        }

        const is_changed = this.changedSensorList.some(
            (s: ChangedDataInfo) => s.IS_EDIT === true
        );
        this.isDisabledAllButton = !is_changed;
    }

    onSaveSensor(
        is_analog: boolean,
        { NODE_ID, NAME }: any,
        { SENSOR_ID, SENSOR, THRESHOLD_AI, THRESHOLD_DI }: any
    ) {
        if (Object.keys(SENSOR).length > 0) {
            this.saveSensor({ ID: SENSOR_ID, NODE_ID, NAME }, SENSOR);
        }

        if (is_analog && Object.keys(THRESHOLD_AI).length > 0) {
            this.saveThresholdAi(
                { SENSOR_ID: Number(SENSOR_ID), NODE_ID, NAME },
                THRESHOLD_AI
            );
        } else if (Object.keys(THRESHOLD_DI).length > 0) {
            this.saveThresholdDi(
                { SENSOR_ID: Number(SENSOR_ID), NODE_ID, NAME },
                THRESHOLD_DI
            );
        }
    }

    saveSensor({ ID, NODE_ID, NAME }: any, sensor: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: ID!
                        $NAME: String
                        $SENSOR_CD: String
                        $DATA_ADDRESS: String
                        $ADJUST_VALUE: String
                        $MC_ID: Int
                        $DISP_POWER: Int
                        $IS_USE: Int
                        $IS_EVENT: Int
                        $IS_MKSTATS: Int
                    ) {
                        UpdateAssetSensor(
                            ID: $ID
                            NAME: $NAME
                            SENSOR_CD: $SENSOR_CD
                            DATA_ADDRESS: $DATA_ADDRESS
                            ADJUST_VALUE: $ADJUST_VALUE
                            MC_ID: $MC_ID
                            DISP_POWER: $DISP_POWER
                            IS_USE: $IS_USE
                            IS_EVENT: $IS_EVENT
                            IS_MKSTATS: $IS_MKSTATS
                        )
                    }
                `,
                variables: {
                    ID,
                    ...sensor
                }
            })
            .then(() => {
                this.refetchSensors();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 적용',
                    detail: `[NODE ID: ${NODE_ID}] ${NAME} 수집항목 데이터 변경 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `${NAME} 수집항목 적용 실패`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    saveThresholdAi({ SENSOR_ID, NODE_ID, NAME }: any, threshold: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $SENSOR_ID: Int!
                        $HOLD_TIME: Int
                        $VALID_MIN: Float
                        $VALID_MAX: Float
                        $IS_VALID: Int
                        $POINT_N3: Float
                        $POINT_N2: Float
                        $POINT_N1: Float
                        $POINT_P1: Float
                        $POINT_P2: Float
                        $POINT_P3: Float
                    ) {
                        UpdateAssetAiThreshold(
                            SENSOR_ID: $SENSOR_ID
                            HOLD_TIME: $HOLD_TIME
                            VALID_MIN: $VALID_MIN
                            VALID_MAX: $VALID_MAX
                            IS_VALID: $IS_VALID
                            POINT_N3: $POINT_N3
                            POINT_N2: $POINT_N2
                            POINT_N1: $POINT_N1
                            POINT_P1: $POINT_P1
                            POINT_P2: $POINT_P2
                            POINT_P3: $POINT_P3
                        )
                    }
                `,
                variables: {
                    SENSOR_ID,
                    ...threshold
                }
            })
            .then(() => {
                this.refetchThreshold(SENSOR_ID);

                this.$toast.add({
                    severity: 'info',
                    summary: 'AI 임계치 적용',
                    detail: `[NODE ID: ${NODE_ID}] ${NAME} 수집항목 AI 임계치 변경 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `${NAME} 수집항목 AI 임계치 적용 실패`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    saveThresholdDi({ SENSOR_ID, NODE_ID, NAME }: any, threshold: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $SENSOR_ID: Int!
                        $HOLD_TIME: Int
                        $DI: [DigitalValueInput!]
                    ) {
                        UpdateAssetDiThreshold(
                            SENSOR_ID: $SENSOR_ID
                            HOLD_TIME: $HOLD_TIME
                            DI: $DI
                        )
                    }
                `,
                variables: {
                    SENSOR_ID,
                    ...threshold
                }
            })
            .then(() => {
                this.refetchThreshold(SENSOR_ID);

                this.$toast.add({
                    severity: 'info',
                    summary: 'DI 임계치 적용',
                    detail: `[NODE ID: ${NODE_ID}] ${NAME} 수집항목 DI 임계치 변경 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `${NAME} 수집항목 DI 임계치 적용 실패`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onCopySensor({ SENSOR, THRESHOLD_AI, THRESHOLD_DI }: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $SENSOR: cn_sensor_input!
                        $THRESHOLD_AI: cn_sensor_threshold_ai_input
                        $THRESHOLD_DI: cn_sensor_threshold_di_input
                    ) {
                        CopySensor(
                            SENSOR: $SENSOR
                            THRESHOLD_AI: $THRESHOLD_AI
                            THRESHOLD_DI: $THRESHOLD_DI
                        )
                    }
                `,
                variables: {
                    SENSOR,
                    THRESHOLD_AI,
                    THRESHOLD_DI
                }
            })
            .then(() => {
                this.refetchSensors();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 복사 완료',
                    detail: `수집항목: ${SENSOR.NAME} 복사`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '수집항목 복사 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onDeleteSensor({ NODE_ID, SENSOR_ID, NAME }: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeleteSensor(SENSOR_ID: ${SENSOR_ID})
                    }
                `
            })
            .then(() => {
                this.refetchSensors();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 삭제 완료',
                    detail: `[INDEX: ${NODE_ID}] ${NAME} 수집항목을 삭제했습니다`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.info(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `[INDEX: ${NODE_ID}] ${NAME} 수집항목 삭제 실패`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    saveAll() {
        const changeSensorList = this.changedSensorList
            .filter((s: ChangedDataInfo) => s.IS_EDIT === true)
            .map((s: ChangedDataInfo) => {
                const sensor_card: SensorCard = this.$refs[
                    `sensorCard_${s.ID}`
                ] as SensorCard;

                if (sensor_card) {
                    return {
                        ID: Number(sensor_card.sensor.ID),
                        SENSOR: sensor_card.changedSensorData,
                        THRESHOLD_AI:
                            sensor_card.isAnalog &&
                            sensor_card.isDiffAiThreshold
                                ? sensor_card.changedAiThresholdData
                                : {},
                        THRESHOLD_DI:
                            !sensor_card.isAnalog &&
                            sensor_card.isDiffDiThreshold
                                ? sensor_card.changedDiThresholdData
                                : {}
                    };
                } else {
                    return {};
                }
            });

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($SENSORS: [sensorInput!]!) {
                        UpdateAssetSensors(SENSORS: $SENSORS)
                    }
                `,
                variables: {
                    SENSORS: changeSensorList
                }
            })
            .then(({ data: { UpdateAssetSensors } }) => {
                if (UpdateAssetSensors) {
                    this.refetchSensors();

                    // by shkoh 20220714: 복수의 센서정보가 업데이트 될 때, 센서정보와 함께, 그와 상응하는 임계치 정보도 함께 새로 읽어야함
                    for (const change_s of changeSensorList) {
                        const { ID, THRESHOLD_AI, THRESHOLD_DI } = change_s;
                        if (Object.keys(THRESHOLD_AI).length > 0 && ID) {
                            this.refetchThreshold(ID.toString());
                        }

                        if (Object.keys(THRESHOLD_DI).length > 0 && ID) {
                            this.refetchThreshold(ID.toString());
                        }
                    }

                    this.$toast.add({
                        severity: 'info',
                        summary: '수집항목 적용 완료',
                        detail: `${changeSensorList.length}개의 수집항목이 갱신되었습니다`,
                        life: 2000
                    });
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '수집항목 적용 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    addSensor() {
        this.$toast.add({
            severity: 'error',
            summary: '수집항목 추가',
            detail: `아직 미구현 항목입니다`,
            life: 2000
        });
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-sensor::v-deep {
    .i-table-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .i-table-empty {
        height: 10vh;
        line-height: 10vh;
        text-align: center;
        font-size: 1.2rem;
    }

    .p-datatable .p-datatable-thead > tr > th {
        padding: 0px;
        border: none;
    }

    .p-datatable .p-datatable-tbody > tr > td {
        border: none;
    }
}
</style>
