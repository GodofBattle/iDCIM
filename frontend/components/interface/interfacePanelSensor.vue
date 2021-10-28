<template>
    <div v-if="showPanel" id="interfacePanelSensor" class="p-grid">
        <DataTable
            :value="dbSensorList"
            :scrollable="true"
            scroll-height="calc(100vh - 20px - var(--header-height) - 30px - 42px - 12px - 55px - 12px"
            :row-hover="true"
        >
            <template #header>
                <div class="i-table-header p-d-flex">
                    <div class="p-ml-auto">
                        <Button
                            icon="pi pi-save"
                            label="SAVE ALL"
                            class="p-field p-button-outlined p-button-secondary"
                        ></Button>
                        <Button
                            icon="pi pi-plus"
                            label="ADD"
                            class="p-field p-button-outlined p-button-secondary"
                        ></Button>
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="i-table-empty">수집항목을 추가하세요</div>
            </template>
            <Column>
                <template #body="slotProps">
                    <predefine-sensor-card
                        :interface-id="id"
                        :sensor-id="slotProps.data.ID"
                        :node-id="slotProps.data.NODE_ID"
                        :name="slotProps.data.NAME"
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

type Sensor = {
    [index: string]: string | number;
    ID: number;
    PD_INTF_ID: number;
    NAME: string;
    SENSOR_CD: string;
    PD_THRESHOLD_ID: number;
    DATA_ADDRESS: string;
    NODE_ID: number;
    ADJUST_VALUE: string;
    MC_ID: number;
    DISP_POWER: number;
    IS_NOTI: number;
    IS_MKSTATS: number;
};

@Component<InterfacePanelSensor>({
    props: {
        id: Number
    },
    apollo: {
        dbSensorList: {
            query: gql`
                query PredefineSensors($PD_INTF_ID: Int!) {
                    PredefineSensors(PD_INTF_ID: $PD_INTF_ID) {
                        ID
                        PD_INTF_ID
                        NAME
                        SENSOR_CD
                        PD_THRESHOLD_ID
                        DATA_ADDRESS
                        NODE_ID
                        ADJUST_VALUE
                        MC_ID
                        DISP_POWER
                        IS_NOTI
                        IS_MKSTATS
                    }
                }
            `,
            variables() {
                return {
                    PD_INTF_ID: this.id ? this.id : -1
                };
            },
            prefetch: false,
            fetchPolicy: 'cache-and-network',
            update: ({ PredefineSensors }) => PredefineSensors
        }
    }
})
export default class InterfacePanelSensor extends Vue {
    dbSensorList: Array<Sensor> = [];

    get showPanel(): boolean {
        return this.$props.id > 0;
    }
}
</script>

<style lang="scss" scoped>
#interfacePanelSensor::v-deep {
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
