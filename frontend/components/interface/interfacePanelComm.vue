<template>
    <div v-if="showCommPanel" id="interfacePanelComm" class="p-grid">
        <div>
            <DataTable :value="commList" @row-reorder="onRowReorder">
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
                            :func-cd.sync="slotProps.data.FUNC_CD"
                            :start-addr.sync="slotProps.data.START_ADDR"
                            :point-cnt.sync="slotProps.data.POINT_CNT"
                            :dtype-cd.sync="slotProps.data.DTYPE_CD"
                        />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

type ModbusCmd = {
    [index: string]: number | string;
    MC_ID: number;
    FUNC_CD: number;
    START_ADDR: number;
    POINT_CNT: number;
    DTYPE_CD: string;
};

@Component<InterfacePanelComm>({
    props: {
        id: Number
    }
})
export default class InterfacePanelComm extends Vue {
    commList: Array<ModbusCmd> = [];

    get showCommPanel(): boolean {
        return this.$props.id > 0;
    }

    onRowReorder(event: any) {
        const new_order_list = event.value.map((data: any, index: any) => {
            data.MC_ID = index + 1;
            return data;
        });

        this.commList = new_order_list;
    }

    addModbusCmdCard() {
        this.commList.push({
            MC_ID: this.commList.length + 1,
            FUNC_CD: 0,
            START_ADDR: 0,
            POINT_CNT: 0,
            DTYPE_CD: 'DT_F4'
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
