<template>
    <div id="i-asset-panel-commander" class="p-grid">
        <DataTable
            :value="commList"
            data-key="MC_ID"
            :scrollable="true"
            scroll-height="flex"
            :style="{ width: '100%', height: '100%' }"
            :row-hover="true"
        >
            <template #empty>
                <div class="i-table-empty">
                    정의된 통신방법이 존재하지 않습니다
                </div>
            </template>
            <template #header>
                <div class="i-table-header p-d-flex">
                    <div class="p-ml-auto">
                        <Button
                            icon="pi pi-save"
                            label="SAVE ALL"
                            class="p-field p-button-outlined p-button-secondary"
                            :disabled="isDisabledSaveAllButton"
                            @click="saveAllModbusCmd"
                        ></Button>
                        <Button
                            icon="pi pi-plus"
                            label="ADD"
                            class="p-field p-button-outlined p-button-secondary"
                            @click="addModbusCmd"
                        />
                    </div>
                </div>
            </template>
            <Column>
                <template #body="slotProps">
                    <modbus-cmd-card
                        :idx="slotProps.index"
                        :intf-id="Number(assetItem.ID)"
                        :mc-id.sync="slotProps.data.MC_ID"
                        :func-no.sync="slotProps.data.FUNC_NO"
                        :start-addr.sync="slotProps.data.START_ADDR"
                        :point-cnt.sync="slotProps.data.POINT_CNT"
                        :dtype-cd.sync="slotProps.data.DTYPE_CD"
                        :is-editable.sync="slotProps.data.is_editable"
                        :init-data="initModbusCmdInfo(slotProps.index)"
                        @copy="copyModbusCmd"
                        @save="saveModbusCmd"
                        @delete="deleteModbusCmd(slotProps.index)"
                        @change="changeModbusCmd"
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
    [index: string]: string | number | boolean;
    ID: number;
    MC_ID: number;
    FUNC_NO: number;
    START_ADDR: number;
    POINT_CNT: number;
    DTYPE_CD: string;
    is_editable: boolean;
};

@Component<AssetPanelCommander>({
    props: {
        assetItem: Object,
        applyButtonDisabled: Boolean
    },
    apollo: {
        dbCommList: {
            query: gql`
                query ModbusCommands($INTF_ID: Int!) {
                    ModbusCommands(INTF_ID: $INTF_ID) {
                        ID
                        MC_ID
                        FUNC_NO
                        START_ADDR
                        POINT_CNT
                        DTYPE_CD
                    }
                }
            `,
            skip() {
                return Number(this.assetItem.ID) < 0;
            },
            variables() {
                return {
                    INTF_ID: Number(this.assetItem.ID)
                };
            },
            update: ({ ModbusCommands }) => ModbusCommands,
            result({ loading, data }) {
                if (!loading) {
                    const { ModbusCommands } = data;
                    if (ModbusCommands) {
                        this.apolloFetch(ModbusCommands);
                    }
                }
            },
            fetchPolicy: 'cache-and-network',
            deep: true
        }
    },
    watch: {
        assetItem: {
            deep: true,
            handler(_item) {
                this.reset();
            }
        }
    }
})
export default class AssetPanelCommander extends Vue {
    dbCommList: Array<ModbusCmd> = [];
    commList: Array<ModbusCmd> = [];

    isDisabledSaveAllButton = true;

    reset() {
        this.commList.splice(0, this.commList.length);
    }

    refreshCommList() {
        this.$apollo.queries.dbCommList.refresh();
    }

    apolloFetch(list: Array<ModbusCmd>) {
        const editable_list = this.editableCommList;
        // by shkoh 20220705: reset은 DB가 변경된 후에 새로 읽어들일 때, commList를 초기화함
        this.reset();

        for (const l of list) {
            const edit_data = editable_list.find(
                (e: ModbusCmd) => e.ID === l.ID
            );

            const comm_data: ModbusCmd = Object.create({});
            [
                'ID',
                'MC_ID',
                'FUNC_NO',
                'START_ADDR',
                'POINT_CNT',
                'DTYPE_CD',
                'is_editable'
            ].forEach((key: string) => {
                if (key === 'MC_ID') {
                    comm_data[key] = l.MC_ID;
                } else {
                    comm_data[key] = edit_data ? edit_data[key] : l[key];
                }
            });

            this.commList.push(comm_data);
        }
    }

    initModbusCmdInfo(index: number) {
        return this.dbCommList?.at(index);
    }

    addModbusCmd() {
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
                    mutation {
                        AddModbusCommand(
                            INTF_ID: ${Number(this.$props.assetItem.ID)}
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

    saveAllModbusCmd() {
        const editable_list = this.editableCommList.map((comm: ModbusCmd) => {
            return {
                INTF_ID: Number(this.$props.assetItem.ID),
                MC_ID: comm.MC_ID,
                FUNC_NO: comm.FUNC_NO,
                START_ADDR: comm.START_ADDR,
                POINT_CNT: comm.POINT_CNT,
                DTYPE_CD: comm.DTYPE_CD
            };
        });

        if (editable_list.length === 0) {
            return;
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($Input: [ModbusCommandInput!]) {
                        UpdateModbusCommands(Input: $Input)
                    }
                `,
                variables: {
                    Input: editable_list
                }
            })
            .then(() => {
                this.refreshCommList();

                this.$toast.add({
                    severity: 'info',
                    summary: '통신방법 적용 완료',
                    detail: `${editable_list.length}개의 통신방법이 갱신되었습니다`,
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

    copyModbusCmd(modbusCmd: any) {
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

        console.info(modbusCmd);

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddModbusCommand(
                            INTF_ID: ${Number(this.$props.assetItem.ID)}
                            MC_ID: ${this.commList.length + 1}
                            FUNC_NO: ${modbusCmd.FUNC_NO}
                            START_ADDR: ${modbusCmd.START_ADDR}
                            POINT_CNT: ${modbusCmd.POINT_CNT}
                            DTYPE_CD: "${modbusCmd.DTYPE_CD}"
                        )
                    }
                `
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

    saveModbusCmd(index: number, modbusCmd: any) {
        const variables = {
            INTF_ID: Number(this.$props.assetItem.ID),
            MC_ID: index + 1,
            ...modbusCmd
        };

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $INTF_ID: Int!
                        $MC_ID: Int!
                        $FUNC_NO: Int
                        $START_ADDR: Int
                        $POINT_CNT: Int
                        $DTYPE_CD: String
                    ) {
                        UpdateModbusCommand(
                            INTF_ID: $INTF_ID
                            MC_ID: $MC_ID
                            FUNC_NO: $FUNC_NO
                            START_ADDR: $START_ADDR
                            POINT_CNT: $POINT_CNT
                            DTYPE_CD: $DTYPE_CD
                        ) {
                            INTF_ID
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

    deleteModbusCmd(index: number) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeleteModbusCommand(
                            INTF_ID: ${Number(this.$props.assetItem.ID)}
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

    changeModbusCmd() {
        // by shkoh 20220705: Modbus Command Card의 데이터 변경이 일어날 때, 발생하는 트리거 이벤트
        const is_edit = this.commList.some(
            (data: ModbusCmd) => data.is_editable === true
        );
        this.isDisabledSaveAllButton = !is_edit;
    }

    get editableCommList(): Array<ModbusCmd> {
        return this.commList.filter(
            (comm: ModbusCmd) => comm.is_editable === true
        );
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-commander::v-deep {
    height: 100%;

    .i-table-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .i-table-empty {
        height: 10vh;
        line-height: 10vh;
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
