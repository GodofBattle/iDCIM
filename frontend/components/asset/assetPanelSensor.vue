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
                        />
                        <Button
                            icon="pi pi-plus"
                            label="ADD"
                            class="p-button-outlined p-button-secondary"
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
                        :has-comm="hasComm"
                        :sensor-codes="sensorCodeList"
                        :modbus-commands="commandList"
                        :display-power-list="displayPowerList"
                        :level-codes="levelCodes"
                        :init-sensor-data="initSensorData(slotProps.index)"
                        :node-id="slotProps.index + 1"
                        :is-use="slotProps.data.IS_USE"
                        :is-mkstats="slotProps.data.IS_MKSTATS"
                        :is-noti="slotProps.data.IS_NOTI"
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
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

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
    IS_NOTI: number;
    IS_VIRTUAL: number;
    IS_MKSTATS: number;
    IS_LG_1MIN: number;
}

@Component<AssetPanelSensor>({
    props: {
        assetItem: Object,
        hasComm: Boolean
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
                        IS_NOTI
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
                        console.info(AssetSensors);
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

    sensorCodeList: Array<any> = [];
    commandList: Array<any> = [];
    displayPowerList: Array<any> = [];
    levelCodes: Array<any> = [];

    reset() {
        this.sensors.splice(0, this.sensors.length);
    }

    apolloFetch(sensors: Array<Sensor>) {
        this.reset();

        for (const sensor of sensors) {
            this.sensors.push(sensor);
        }
    }

    initSensorData(index: number): Sensor | undefined {
        return this.dbSensors?.at(index);
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
