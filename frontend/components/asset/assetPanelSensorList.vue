<template>
    <div
        id="i-asset-panel-sensor-list"
        class="p-px-2 p-py-2"
        :style="{ width: '50%', height: '100%' }"
    >
        <DataTable
            class="p-datatable-sm"
            :value="sensors"
            data-key="SENSOR_ID"
            :scrollable="true"
            scroll-height="flex"
            :striped-rows="true"
        >
            <Column
                key="NODE_ID"
                header="INDEX"
                field="NODE_ID"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '10%',
                    'justify-content': 'center'
                }"
            >
                <template #body="slotProps">
                    <Avatar :class="nodeStatus(slotProps.data)">
                        <span>{{ slotProps.data.NODE_ID }}</span>
                    </Avatar>
                </template>
            </Column>
            <Column
                key="NAME"
                header="수집항목명"
                field="NAME"
                :styles="{ 'flex-grow': 1, 'flex-basis': '40%' }"
            >
                <template #body="slotProps">
                    <span :class="nameStatus(slotProps.data)">
                        {{ slotProps.data.NAME }}
                    </span>
                </template>
            </Column>
            <Column
                key="TYPE"
                header="종류"
                field="SENSOR_CD"
                :styles="{ 'flex-grow': 1, 'flex-basis': '30%' }"
            />
            <Column
                key="VALUE"
                header="값"
                field="CURR_VALUE"
                :styles="{ 'flex-grow': 1, 'flex-basis': '20%' }"
            />
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface Sensor {
    [index: string]: number | string | boolean;
    ID: number;
    INTF_ID: number;
    NAME: string;
    SENSOR_CD: string;
    NODE_ID: number;
    CURR_VALUE: number;
    CURR_STATUS: number;
    CURR_LEVEL: number;
    DISP_POWER: number;
    IS_USE: number;
    IS_EVENT: number;
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

@Component<AssetPanelSensorList>({
    props: {
        assetItem: Object
    },
    apollo: {
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
                        CURR_LEVEL
                        DISP_POWER
                        IS_USE
                        IS_EVENT
                    }
                }
            `,
            skip() {
                return Number(this.$props.assetItem?.ID) < 0;
            },
            variables() {
                return {
                    INTF_ID: Number(this.$props.assetItem.ID)
                };
            },
            update: ({ AssetSensors }) => AssetSensors
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
    }
})
export default class AssetPanelSensorList extends Vue {
    sensors: Array<Sensor> = [];
    sensorCodeList: Array<SensorCode> = [];
    displayPowerList: Array<DisplayPowerCode> = [];

    nodeStatus(item: Sensor): Array<object | string> {
        const is_use = item.IS_USE;
        const is_event = item.IS_EVENT;
        const lvl = item.CURR_LEVEL;

        return [
            'i-asset-sensor-index p-px-1',
            {
                'i-not-used': is_use === 0,
                'i-lvl-null': is_use === 0 || is_event === 0,
                'i-lvl00': is_use === 1 && is_event === 1 && lvl === 0,
                'i-lvl01': is_use === 1 && is_event === 1 && lvl === 1,
                'i-lvl02': is_use === 1 && is_event === 1 && lvl === 2,
                'i-lvl03': is_use === 1 && is_event === 1 && lvl === 3,
                'i-lvl04': is_use === 1 && is_event === 1 && lvl === 4,
                'i-lvl05': is_use === 1 && is_event === 1 && lvl === 5
            }
        ];
    }

    nameStatus(item: Sensor): Array<object | string> {
        const is_use = item.IS_USE;
        return [
            {
                'i-not-used': is_use === 0
            }
        ];
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-sensor-list::v-deep {
    .i-asset-sensor-index {
        position: relative;
        width: auto;
        min-width: 2rem;
    }

    .i-not-used {
        opacity: 0.5;
    }

    .i-lvl-null {
        background: transparent;
        border: 1px solid var(--surface-border);
    }

    .i-lvl00 {
        background: transparent;
        border: 1px solid var(--surface-border);
    }

    .i-lvl01 {
        background-color: var(--warning);
        color: var(--text-alert-warning-color);
    }

    .i-lvl02 {
        background-color: var(--major);
        color: var(--text-alert-color);
    }

    .i-lvl03 {
        background-color: var(--critical);
        color: var(--text-alert-color);
    }
}
</style>
