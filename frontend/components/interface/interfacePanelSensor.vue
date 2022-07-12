<template>
    <div v-if="showPanel" id="interfacePanelSensor" class="p-grid">
        <DataTable
            :value="sensorList"
            :scrollable="true"
            scroll-height="flex"
            :row-hover="true"
            :table-style="{ width: '100%', height: '100%' }"
            data-key="ID"
            @row-reorder="onRowReorder"
        >
            <template #header>
                <div class="i-table-header p-d-flex">
                    <div class="p-ml-auto">
                        <Button
                            icon="pi pi-save"
                            label="SAVE ALL"
                            class="p-field p-button-outlined p-button-secondary"
                            :disabled="applyAllButtonDisabled"
                            @click="saveAll"
                        ></Button>
                        <Button
                            icon="pi pi-plus"
                            label="ADD"
                            class="p-field p-button-outlined p-button-secondary"
                            @click="addPredefineSensorCard"
                        ></Button>
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="i-table-empty">수집항목을 추가하세요</div>
            </template>
            <Column
                :row-reorder="true"
                :styles="{ 'flex-grow': 1, 'flex-basis': 0 }"
            ></Column>
            <Column key="ID" :styles="{ 'flex-grow': 1, 'flex-basis': '100%' }">
                <template #body="slotProps">
                    <predefine-sensor-card
                        :interface-id="id"
                        :sensor-id="slotProps.data.ID"
                        :node-id="slotProps.index + 1"
                        :has-comm="hasComm"
                        :init-sensor-data="initSensorInfo(slotProps.index)"
                        :modbus-command-list="modbusCommandList"
                        :sensor-code-list="sensorCodeList"
                        :display-power-list="displayPowerList"
                        :name.sync="slotProps.data.NAME"
                        :adjust-value.sync="slotProps.data.ADJUST_VALUE"
                        :data-address.sync="slotProps.data.DATA_ADDRESS"
                        :mc-id.sync="slotProps.data.MC_ID"
                        :sensor-cd.sync="slotProps.data.SENSOR_CD"
                        :disp-power.sync="slotProps.data.DISP_POWER"
                        :pd-threshold-id.sync="slotProps.data.PD_THRESHOLD_ID"
                        :is-event.sync="slotProps.data.IS_EVENT"
                        :is-mk-stats.sync="slotProps.data.IS_MKSTATS"
                        @change="changePredefineSensorCard"
                        @copy="copyPredefineSensorCard"
                        @save="savePredefineSensorCard"
                        @delete="
                            deletePredefineSensorCard(
                                slotProps.data.ID,
                                slotProps.data.NAME
                            )
                        "
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
    [index: string]: string | number | boolean;
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
    IS_EVENT: number;
    IS_MKSTATS: number;
};

@Component<InterfacePanelSensor>({
    props: {
        id: Number,
        hasComm: Boolean
    },
    watch: {
        id() {
            this.applyAllButtonDisabled = true;
            this.reset();
        }
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
                        ADJUST_VALUE
                        MC_ID
                        DISP_POWER
                        IS_EVENT
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
            update: ({ PredefineSensors }) => PredefineSensors,
            result({ data, loading }: any) {
                if (!loading) {
                    const { PredefineSensors } = data;

                    if (PredefineSensors) {
                        this.apolloFetch(PredefineSensors);
                    }
                }
            }
        },
        modbusCommandList: {
            query: gql`
                query PredefineModbusCommands($PD_INTF_ID: Int!) {
                    PredefineModbusCommands(PD_INTF_ID: $PD_INTF_ID) {
                        PD_INTF_ID
                        MC_ID
                        FUNC_NO
                        START_ADDR
                        POINT_CNT
                        DTYPE_CD
                        DTYPE_NAME
                    }
                }
            `,
            variables(): any {
                return {
                    PD_INTF_ID: this.id ? this.id : -1
                };
            },
            update: ({ PredefineModbusCommands }) => PredefineModbusCommands
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
                        REMARK
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
                    }
                }
            `,
            update: ({ Codes }) => Codes
        }
    }
})
export default class InterfacePanelSensor extends Vue {
    editedSensorList: Array<any> = [];

    dbSensorList: Array<Sensor> = [];
    sensorList: Array<Sensor> = [];

    modbusCommandList: Array<any> = [];
    sensorCodeList: Array<any> = [];
    displayPowerList: Array<any> = [];

    applyAllButtonDisabled = true;

    get showPanel(): boolean {
        return this.$props.id > 0;
    }

    initSensorInfo(index: number): any {
        return this.dbSensorList?.at(index);
    }

    reset() {
        this.sensorList.splice(0, this.sensorList.length);
    }

    apolloFetch(data: Array<Sensor>) {
        this.reset();

        data.forEach((datum) => {
            const db_sensor_data: Sensor = Object.create({
                ID: datum.ID,
                PD_INTF_ID: datum.PD_INTF_ID,
                NAME: datum.NAME,
                SENSOR_CD: datum.SENSOR_CD,
                PD_THRESHOLD_ID: datum.PD_THRESHOLD_ID,
                DATA_ADDRESS: datum.DATA_ADDRESS,
                ADJUST_VALUE: datum.ADJUST_VALUE,
                MC_ID: datum.MC_ID,
                DISP_POWER: datum.DISP_POWER,
                IS_EVENT: datum.IS_EVENT,
                IS_MKSTATS: datum.IS_MKSTATS
            });

            this.sensorList.push(db_sensor_data);
        });
    }

    changePredefineSensorCard({ id, isEdit }: any) {
        const chk_item = this.editedSensorList.filter((s) => s.id === id).pop();
        if (chk_item === undefined) {
            this.editedSensorList.push({ id, isEdit });
        } else {
            chk_item.isEdit = isEdit;
        }

        const is_b = this.editedSensorList.some((s) => s.isEdit === true);
        this.applyAllButtonDisabled = !is_b;
    }

    onRowReorder(event: any) {
        // by shkoh 20211118: reorder가 발생하면 곧바로 DB에 저장을 해주어야겠다
        const drop_sensor = event.value.at(event.dropIndex);

        this.reorderPredefineSensorCard({
            id: drop_sensor.ID,
            pd_intf_id: drop_sensor.PD_INTF_ID,
            name: drop_sensor.NAME,
            start_idx: event.dragIndex + 1,
            end_idx: event.dropIndex + 1
        });
    }

    addPredefineSensorCard() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddPredefineSensor(
                            PD_INTF_ID: ${this.$props.id}
                            NODE_ID: ${this.sensorList.length + 1}
                        )
                    }
                `
            })
            .then(() => {
                this.refreshPredefineSensorList();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 추가 완료',
                    detail: `수집항목: ${this.sensorList.length + 1}개 추가`,
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

    saveAll() {
        const editableSensorList = this.editedSensorList
            .filter((sensor) => sensor.isEdit === true)
            .map((sensor) => {
                const s_data = this.sensorList
                    .filter((s) => s.ID === sensor.id)
                    .pop();

                return {
                    ID: s_data?.ID,
                    NAME: s_data?.NAME,
                    ADJUST_VALUE: s_data?.ADJUST_VALUE,
                    DATA_ADDRESS: s_data?.DATA_ADDRESS,
                    MC_ID: s_data?.MC_ID,
                    SENSOR_CD: s_data?.SENSOR_CD,
                    DISP_POWER: s_data?.DISP_POWER,
                    PD_THRESHOLD_ID: s_data?.PD_THRESHOLD_ID,
                    IS_EVENT: s_data?.IS_EVENT,
                    IS_MKSTATS: s_data?.IS_MKSTATS
                };
            });

        if (editableSensorList.length === 0) {
            return;
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($Input: [PdSensorInput!]) {
                        UpdatePredefineSensors(Input: $Input)
                    }
                `,
                variables: {
                    Input: editableSensorList
                }
            })
            .then(() => {
                this.refreshPredefineSensorList();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 적용 완료',
                    detail: `${editableSensorList.length}개의 수집항목이 갱신되었습니다`,
                    life: 2000
                });
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

    copyPredefineSensorCard(copy_data: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $PD_INTF_ID: Int!
                        $NODE_ID: Int!
                        $NAME: String
                        $ADJUST_VALUE: String
                        $DATA_ADDRESS: String
                        $MC_ID: Int
                        $SENSOR_CD: String
                        $DISP_POWER: Int
                        $PD_THRESHOLD_ID: Int
                        $IS_EVENT: Int
                        $IS_MKSTATS: Int
                    ) {
                        CopyPredefineSensor(
                            PD_INTF_ID: $PD_INTF_ID
                            NODE_ID: $NODE_ID
                            NAME: $NAME
                            ADJUST_VALUE: $ADJUST_VALUE
                            DATA_ADDRESS: $DATA_ADDRESS
                            MC_ID: $MC_ID
                            SENSOR_CD: $SENSOR_CD
                            DISP_POWER: $DISP_POWER
                            PD_THRESHOLD_ID: $PD_THRESHOLD_ID
                            IS_EVENT: $IS_EVENT
                            IS_MKSTATS: $IS_MKSTATS
                        )
                    }
                `,
                variables: copy_data
            })
            .then(() => {
                this.refreshPredefineSensorList();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 복사 완료',
                    detail: `수집항목: ${copy_data.NAME} 복사`,
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

    savePredefineSensorCard(sensor_name: string, save_data: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: Int!
                        $NAME: String
                        $ADJUST_VALUE: String
                        $DATA_ADDRESS: String
                        $MC_ID: Int
                        $SENSOR_CD: String
                        $DISP_POWER: Int
                        $PD_THRESHOLD_ID: Int
                        $IS_EVENT: Int
                        $IS_MKSTATS: Int
                    ) {
                        UpdatePredefineSensor(
                            ID: $ID
                            NAME: $NAME
                            ADJUST_VALUE: $ADJUST_VALUE
                            DATA_ADDRESS: $DATA_ADDRESS
                            MC_ID: $MC_ID
                            SENSOR_CD: $SENSOR_CD
                            DISP_POWER: $DISP_POWER
                            PD_THRESHOLD_ID: $PD_THRESHOLD_ID
                            IS_EVENT: $IS_EVENT
                            IS_MKSTATS: $IS_MKSTATS
                        )
                    }
                `,
                variables: save_data
            })
            .then(() => {
                this.refreshPredefineSensorList();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 변경 완료',
                    detail: `${sensor_name} 수집항목의 내용이 변경되었습니다`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '수집항목 변경 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    deletePredefineSensorCard(id: number, name: string) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    DeletePredefineSensor(ID: ${id})
                }
            `
            })
            .then(() => {
                this.refreshPredefineSensorList();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 삭제 완료',
                    detail: `수집항목 - ${name} 삭제 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '수집항목 삭제 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    reorderPredefineSensorCard({
        id,
        pd_intf_id,
        name,
        start_idx,
        end_idx
    }: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: Int
                        $PD_INTF_ID: Int
                        $START: Int
                        $END: Int
                    ) {
                        ReorderPredefineSensors(
                            ID: $ID
                            PD_INTF_ID: $PD_INTF_ID
                            START: $START
                            END: $END
                        )
                    }
                `,
                variables: {
                    ID: id,
                    PD_INTF_ID: pd_intf_id,
                    START: start_idx,
                    END: end_idx
                }
            })
            .then(() => {
                this.refreshPredefineSensorList();

                this.$toast.add({
                    severity: 'info',
                    summary: '수집항목 이동 완료',
                    detail: `수집항목 ${name}가 NODE ID: ${end_idx}로 이동했습니다`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    refreshPredefineSensorList() {
        this.$apollo.queries.dbSensorList.refresh();
    }
}
</script>

<style lang="scss" scoped>
#interfacePanelSensor::v-deep {
    height: 100%;

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
