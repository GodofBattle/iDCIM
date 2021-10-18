<template>
    <div v-if="showCommPanel" id="interfacePanelComm" class="p-grid">
        <div>
            <DataTable :value="newCommList" @row-reorder="onRowReorder">
                <template #header>
                    <div class="i-table-header">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText placeholder="검색" />
                        </span>
                        <Button
                            icon="pi pi-plus"
                            label="ADD"
                            class="p-field p-button-outlined p-button-secondary"
                            @click="addModbusCmdCard"
                        ></Button>
                    </div>
                </template>
                <template #empty>
                    <div class="i-table-empty">통신방법을 추가하세요</div>
                </template>
                <Column
                    header-style="width: 2rem;"
                    :row-reorder="true"
                ></Column>
                <Column>
                    <template #body="slotProps">
                        <modbus-cmd-card
                            :mc-id.sync="slotProps.data.MC_ID"
                            :func-no.sync="slotProps.data.FUNC_NO"
                            :start-addr.sync="slotProps.data.START_ADDR"
                            :point-cnt.sync="slotProps.data.POINT_CNT"
                            :dtype-cd.sync="slotProps.data.DTYPE_CD"
                            @delete="deleteModbusCmdCard(slotProps)"
                            @change="changeModbusCmdInfo(slotProps)"
                            @copy="copyModbusCmdInfo"
                            :init-data="initModbusCmdInfo(slotProps.index)"
                        />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type ModbusCmd = {
    [index: string]: number | string;
    MC_ID: number;
    FUNC_NO: number;
    START_ADDR: number;
    POINT_CNT: number;
    DTYPE_CD: string;
};

@Component<InterfacePanelComm>({
    props: {
        id: Number,
        applyButtonDisabled: Boolean,
    },
    watch: {
        newCommList: {
            deep: true,
            handler(_data: Array<ModbusCmd>) {
                this.changeNewCommList(_data);
            },
        },
    },
    apollo: {
        commList: {
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
                    ID: this.id ? this.id : -1,
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
        },
    },
})
export default class InterfacePanelComm extends Vue {
    commList: Array<ModbusCmd> = [];
    newCommList: Array<ModbusCmd> = [];

    get showCommPanel(): boolean {
        return this.$props.id > 0;
    }

    initModbusCmdInfo(index: number): any {
        return this.commList?.at(index);
    }

    reset() {
        this.newCommList.splice(0, this.newCommList.length);
    }

    onRowReorder(event: any) {
        const new_order_list = event.value.map((data: any, index: any) => {
            data.MC_ID = index + 1;
            return data;
        });

        this.newCommList = new_order_list;
    }

    addModbusCmdCard() {
        this.newCommList.push({
            MC_ID: this.newCommList.length + 1,
            FUNC_NO: 0,
            START_ADDR: 0,
            POINT_CNT: 0,
            DTYPE_CD: '',
            MODE: 'NEW',
        });
    }

    apolloFetch(data: Array<ModbusCmd>) {
        this.reset();

        data.forEach((datum) => {
            const new_cmd_data: ModbusCmd = Object.create({
                MC_ID: datum.MC_ID,
                FUNC_NO: datum.FUNC_NO,
                START_ADDR: datum.START_ADDR,
                POINT_CNT: datum.POINT_CNT,
                DTYPE_CD: datum.DTYPE_CD,
            });

            this.newCommList.push(new_cmd_data);
        });
    }

    changeNewCommList(new_data: Array<ModbusCmd>) {
        this.$emit('update:applyButtonDisabled', true);

        if (new_data.length !== this.commList.length) {
            this.$emit('update:applyButtonDisabled', false);
        } else if (
            new_data.length > 0 &&
            new_data.length === this.commList.length
        ) {
        }
    }

    changeModbusCmdInfo(node: any) {
        this.$emit('update:applyButtonDisabled', true);

        this.newCommList.forEach((comm_info: ModbusCmd) => {
            const proto_info = Object.getPrototypeOf(comm_info);

            console.info(proto_info);

            ['FUNC_NO', 'START_ADDR', 'POINT_CNT', 'DTYPE_CD'].forEach(
                (key: string) => {
                    if (proto_info[key] !== comm_info[key]) {
                        this.$emit('update:applyButtonDisabled', false);
                    }
                }
            );
        });
    }

    deleteModbusCmdCard(node: any) {
        // by shkoh 20211012: 모드버스 커맨드 삭제
        this.newCommList.splice(node.index, 1);

        // by shkoh 20211012: 다수의 카드 삭제 후, MC_ID 번호를 재정리
        this.newCommList.forEach((data: any, index: any) => {
            data.MC_ID = index + 1;
        });
    }

    copyModbusCmdInfo(node: any) {
        this.newCommList.splice(node.MC_ID - 1, 0, node);

        // by shkoh 20211018: 카드 복제 후, MC_ID 번호를 재정리
        this.newCommList.forEach((data: any, index: any) => {
            data.MC_ID = index + 1;
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
