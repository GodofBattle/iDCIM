<template>
    <div id="icomer-sensor-code">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="i-sensor-code-content p-px-2">
            <DataTable
                :value="sensorCodes"
                :scrollable="true"
                scroll-height="flex"
                class="p-datatable-striped p-py-1"
                data-key="ID"
            >
                <template #header>
                    <div>
                        <Button
                            icon="pi pi-plus"
                            label="ADD"
                            class="p-field p-button-outlined p-button-secondary"
                            @click="addSensorCode"
                        />
                    </div>
                </template>

                <Column
                    field="CODE"
                    header="코드"
                    header-style="width: 3em;"
                ></Column>
                <Column
                    field="NAME"
                    header="센서명"
                    header-style="width: 5em;"
                ></Column>
                <Column
                    field="TYPE"
                    header="분류"
                    header-style="width: 2em;"
                ></Column>
                <Column
                    field="UNIT"
                    header="단위"
                    header-style="width: 2em;"
                ></Column>
                <Column
                    field="IS_DISP_CONV"
                    header="환산지수 사용"
                    header-style="width: 2em;"
                >
                    <template #body="slotProps">
                        <InputSwitch
                            :value="
                                isSwitchConvert(slotProps.data.IS_DISP_CONV)
                            "
                            :disabled="true"
                        />
                    </template>
                </Column>
                <Column v-if="false" field="REMARK"></Column>
                <Column
                    header-style="width: 2em;"
                    body-style="text-align: center;"
                >
                    <template #body="slotProps">
                        <Button
                            icon="pi pi-pencil"
                            class="p-field p-button-outlined p-button-secondary"
                            label="EDIT"
                            @click="updateSensorCode(slotProps.data)"
                        />
                    </template>
                </Column>
            </DataTable>
        </div>
        <sensor-code-setting-panel
            :is-edit="isEdit"
            :visible-sensor-code-dialog.sync="showSensorCodeDialog"
            :sensor-code-data.sync="sensorCodeData"
            :sensor-codes="sensorCodes"
            @refresh="refresh"
        >
        </sensor-code-setting-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerSensorCode>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '센서코드',
        },
    },
    apollo: {
        sensorCodes: {
            query: gql`
                query {
                    SensorCodes {
                        ID
                        CODE
                        NAME
                        TYPE
                        UNIT
                        IS_DISP_CONV
                        REMARK
                    }
                }
            `,
            update: ({ SensorCodes }) => SensorCodes,
        },
    },
})
export default class IcomerSensorCode extends Vue {
    sensorCodes: Array<any> = [];
    sensorCodeData: object = {};

    showSensorCodeDialog: boolean = false;
    isEdit: boolean = false;

    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.$props.title}`,
        };
    }

    isSwitchConvert(IS_DISP_CONV: number) {
        return IS_DISP_CONV === 1;
    }

    addSensorCode() {
        this.isEdit = false;
        this.sensorCodeData = {
            CODE: '',
            NAME: '',
            TYPE: 'A',
            UNIT: '',
            IS_DISP_CONV: 0,
            REMARK: '',
        };
        this.showSensorCodeDialog = true;
    }

    updateSensorCode(sensorCode: object) {
        this.isEdit = true;
        this.sensorCodeData = sensorCode;
        this.showSensorCodeDialog = true;
    }

    refresh() {
        this.$apollo.queries.sensorCodes.refresh();
    }
}
</script>

<style lang="scss" scoped>
#icomer-sensor-code::v-deep {
    .i-sensor-code-content {
        width: 50vw;
        height: calc(100vh - 71px - 1rem);
        padding-top: 20px;
    }

    .p-datatable-scrollable .p-datatable-wrapper {
        overflow: overlay;
    }
}
</style>
