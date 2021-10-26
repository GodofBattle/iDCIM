<template>
    <div v-if="showCommPanel" id="interfacePanelComm" class="p-grid">
        <DataTable
            :value="commList"
            data-key="MC_ID"
            :scrollable="true"
            scroll-height="calc(100vh - 20px - var(--header-height) - 30px - 42px - 12px - 55px - 12px"
            :style="{ height: '100%' }"
            :row-hover="true"
        >
            <template #header>
                <div class="i-table-header p-d-flex">
                    <div class="p-ml-auto">
                        <Button
                            icon="pi pi-save"
                            label="일괄적용"
                            class="p-field p-button-outlined p-button-secondary"
                            :disabled="applyButtonDisabled"
                            @click="saveAll"
                        ></Button>
                        <Button
                            icon="pi pi-plus"
                            label="ADD"
                            class="p-field p-button-outlined p-button-secondary"
                            @click="addModbusCmdCard"
                        ></Button>
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="i-table-empty">통신방법을 추가하세요</div>
            </template>
            <Column>
                <template #body="slotProps">
                    <modbus-cmd-card
                        :idx="slotProps.index"
                        :pd-intf-id="id"
                        :mc-id.sync="slotProps.data.MC_ID"
                        :func-no.sync="slotProps.data.FUNC_NO"
                        :start-addr.sync="slotProps.data.START_ADDR"
                        :point-cnt.sync="slotProps.data.POINT_CNT"
                        :dtype-cd.sync="slotProps.data.DTYPE_CD"
                        :is-editable.sync="slotProps.data.is_editable"
                        :init-data="initModbusCmdInfo(slotProps.index)"
                        @copy="copyModbusCmdInfo"
                        @save="saveModbusCmdCard"
                        @change="chageCardInfo"
                        @delete="deleteModbusCmdCard(slotProps.index)"
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

type ModbusCmd = {
    [index: string]: number | string | boolean;
    MC_ID: number;
    FUNC_NO: number;
    START_ADDR: number;
    POINT_CNT: number;
    DTYPE_CD: string;
    is_editable: boolean;
};

enum MODE {
    'ADD',
    'DELETE',
    'SAVE',
    'COPY'
}

@Component<InterfacePanelComm>({
    props: {
        id: Number,
        applyButtonDisabled: Boolean
    },
    watch: {
        id() {
            this.reset();
        }
    },
    apollo: {
        dbCommList: {
            query: gql`
                query PredefineModbusCommands($ID: Int!) {
                    PredefineModbusCommands(PD_INTF_ID: $ID) {
                        MC_ID
                        FUNC_NO
                        START_ADDR
                        POINT_CNT
                        DTYPE_CD
                    }
                }
            `,
            variables(): any {
                return {
                    ID: this.id ? this.id : -1
                };
            },
            update: ({ PredefineModbusCommands }) => PredefineModbusCommands,
            result({ data, loading }: any) {
                if (!loading) {
                    const { PredefineModbusCommands } = data;

                    if (PredefineModbusCommands) {
                        this.apolloFetch(PredefineModbusCommands);
                    }
                }
            },
            fetchPolicy: 'cache-and-network',
            deep: true
        }
    }
})
export default class InterfacePanelComm extends Vue {
    dbCommList: Array<ModbusCmd> = [];
    commList: Array<ModbusCmd> = [];

    get showCommPanel(): boolean {
        return this.$props.id > 0;
    }

    initModbusCmdInfo(index: number): any {
        return this.dbCommList?.at(index);
    }

    reset() {
        this.commList.splice(0, this.commList.length);
    }

    apolloFetch(data: Array<ModbusCmd>) {
        this.reset();

        data.forEach((datum) => {
            const db_comm_data: ModbusCmd = Object.create({
                MC_ID: datum.MC_ID,
                FUNC_NO: datum.FUNC_NO,
                START_ADDR: datum.START_ADDR,
                POINT_CNT: datum.POINT_CNT,
                DTYPE_CD: datum.DTYPE_CD,
                is_editable: false
            });

            this.commList.push(db_comm_data);
        });
    }

    addModbusCmdCard() {
        if (this.commList.length === 127) {
            this.$toast.add({
                severity: 'warn',
                summary: '통신방법 추가 불가',
                detail: `인터페이스당 통신방법은 최대 127개까지 가능합니다`,
                life: 2000
            });

            return;
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddPredefineModbusCommand(
                            PD_INTF_ID: ${this.$props.id}
                            MC_ID: ${this.commList.length + 1}
                            FUNC_NO: 0
                            START_ADDR: 0
                            POINT_CNT: 0
                            DTYPE_CD: "DT_F4"
                        )
                    }
                `
            })
            .then(() => {
                this.refreshCommList();

                this.$toast.add({
                    severity: 'info',
                    summary: '통신방법 추가 완료',
                    detail: `MC ID: ${this.commList.length + 1} 추가`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '통신방법 추가 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    deleteModbusCmdCard(index: number) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeletePredefineModbusCommand(
                            PD_INTF_ID: ${this.$props.id}
                            MC_ID: ${index + 1}
                        )
                    }
                `
            })
            .then(() => {
                this.refreshCommList();

                this.$toast.add({
                    severity: 'info',
                    summary: '통신방법 삭제 완료',
                    detail: `MC ID: ${index + 1} 삭제 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '통신방법 삭제 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    saveModbusCmdCard(index: number, modbusCmd: any) {
        const variables = {
            PD_INTF_ID: this.$props.id,
            MC_ID: index + 1,
            ...modbusCmd
        };

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $PD_INTF_ID: Int!
                        $MC_ID: Int!
                        $FUNC_NO: Int
                        $START_ADDR: Int
                        $POINT_CNT: Int
                        $DTYPE_CD: String
                    ) {
                        UpdatePredefineModbusCommand(
                            PD_INTF_ID: $PD_INTF_ID
                            MC_ID: $MC_ID
                            FUNC_NO: $FUNC_NO
                            START_ADDR: $START_ADDR
                            POINT_CNT: $POINT_CNT
                            DTYPE_CD: $DTYPE_CD
                        ) {
                            PD_INTF_ID
                            MC_ID
                            FUNC_NO
                            START_ADDR
                            POINT_CNT
                            DTYPE_CD
                        }
                    }
                `,
                variables
            })
            .then(() => {
                this.refreshCommList();

                this.$toast.add({
                    severity: 'info',
                    summary: '통신방법 적용 완료',
                    detail: `MC ID: ${index + 1} 적용 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '통신방법 적용 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    copyModbusCmdInfo(modbusCmd: any) {
        if (this.commList.length === 127) {
            this.$toast.add({
                severity: 'warn',
                summary: '통신방법 복사 불가',
                detail: `인터페이스당 통신방법은 최대 127개까지 가능합니다`,
                life: 2000
            });

            return;
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $PD_INTF_ID: Int!
                        $MC_ID: Int!
                        $FUNC_NO: Int
                        $START_ADDR: Int
                        $POINT_CNT: Int
                        $DTYPE_CD: String
                    ) {
                        CopyPredefineModbusCommand(
                            PD_INTF_ID: $PD_INTF_ID
                            MC_ID: $MC_ID
                            FUNC_NO: $FUNC_NO
                            START_ADDR: $START_ADDR
                            POINT_CNT: $POINT_CNT
                            DTYPE_CD: $DTYPE_CD
                        )
                    }
                `,
                variables: modbusCmd
            })
            .then(() => {
                this.refreshCommList();

                this.$toast.add({
                    severity: 'info',
                    summary: '통신방법 복사 완료',
                    detail: `MC ID: ${modbusCmd.MC_ID} 복사`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '통신방법 복사 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    chageCardInfo() {
        const is_edit = this.commList.some((data) => data.is_editable === true);
        this.$emit('update:applyButtonDisabled', !is_edit);
    }

    refreshCommList() {
        this.$apollo.queries.dbCommList.refresh();
    }

    saveAll() {
        const editableCommList = this.commList
            .filter((comm) => comm.is_editable === true)
            .map((comm) => {
                return {
                    PD_INTF_ID: this.$props.id,
                    MC_ID: comm.MC_ID,
                    FUNC_NO: comm.FUNC_NO,
                    START_ADDR: comm.START_ADDR,
                    POINT_CNT: comm.POINT_CNT,
                    DTYPE_CD: comm.DTYPE_CD,
                    REMARK: ''
                };
            });

        if (editableCommList.length === 0) {
            return;
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($Input: [PdModbusCmdInput!]) {
                        UpdatePredefineModbusCommands(Input: $Input)
                    }
                `,
                variables: {
                    Input: editableCommList
                }
            })
            .then(() => {
                this.refreshCommList();

                this.$toast.add({
                    severity: 'info',
                    summary: '통신방법 적용 완료',
                    detail: `${editableCommList.length}개의 통신방법이 갱신되었습니다`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '통신방법 적용 실패',
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

<style lang="scss" scoped>
#interfacePanelComm::v-deep {
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
