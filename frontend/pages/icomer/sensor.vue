<template>
    <div>
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <ScrollPanel class="i-sensor-code-content">
            <div class="p-col-6 p-pl-2 p-pr-2">
                <DataTable :value="sensorCodes" class="p-datatable-striped">
                    <template #header>
                        <div>
                            <Button
                                icon="pi pi-plus"
                                label="ADD"
                                class="
                                    p-field p-button-outlined p-button-secondary
                                "
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
                        header-style="width: 6em;"
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
                                class="
                                    p-field p-button-outlined p-button-secondary
                                "
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
            >
            </sensor-code-setting-panel>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

export default Vue.extend({
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
                        REMARK
                    }
                }
            `,
            update: ({ SensorCodes }) => {
                return SensorCodes;
            }
        }
    },
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '센서코드'
        }
    },
    data() {
        return {
            sensorCodes: [],
            showSensorCodeDialog: false,
            sensorCodeData: {},
            isEdit: false
        };
    },
    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.title}`
        };
    },
    methods: {
        isSwitchConvert(IS_DISP_CONV: number) {
            return IS_DISP_CONV === 1;
        },
        addSensorCode() {
            this.isEdit = false;
            this.sensorCodeData = {
                CODE: '',
                NAME: '',
                TYPE: 'A',
                UNIT: '',
                IS_DISP_CONV: 0,
                REMARK: ''
            };
            this.showSensorCodeDialog = true;
        },
        updateSensorCode(sensorCode: object) {
            this.isEdit = true;
            this.sensorCodeData = sensorCode;
            this.showSensorCodeDialog = true;
        }
    }
});
</script>

<style lang="scss" scoped>
.i-sensor-code-content {
    height: calc(100vh - 71px);
    padding-top: 20px;
}
</style>
