<template>
    <div id="asset-table" class="p-py-1">
        <DataTable
            class="p-datatable-sm"
            :value="assetList"
            :scrollable="true"
            scroll-height="flex"
            :filters.sync="assetFilterData"
            :table-style="{ width: '100%', height: '100%' }"
            data-key="ID"
            responsive-layout="scroll"
            :striped-rows="true"
            selection-mode="single"
        >
            <template #header>
                <div class="p-d-flex p-jc-end">
                    <span class="p-input-icon-right">
                        <i class="pi pi-search"></i>
                        <InputText
                            v-model="assetFilterData['NAME'].value"
                        ></InputText>
                    </span>
                </div>
            </template>
            <template #empty> 해당 그룹의 자산이 없습니다 </template>
            <template #loading>
                자산을 조회하고 있습니다. 잠시만 기다려주세요
            </template>
            <Column
                field="IDX"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '50px',
                    'flex-flow': 'column',
                }"
            >
                <template #body="slotProps">
                    <Avatar class="i-asset-index">
                        <span>{{ slotProps.index + 1 }}</span>
                        <Badge class="i-asset-comm-status"></Badge>
                    </Avatar>
                </template>
            </Column>
            <Column
                field="NAME"
                :styles="{ 'flex-grow': 1, 'flex-basis': 'calc(100% - 50px)' }"
            >
            </Column>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import { FilterMatchMode } from 'primevue/api';

@Component<AssetTable>({})
export default class AssetTable extends Vue {
    assetList: Array<any> = [
        { ID: 1, IDX: 0, NAME: '가' },
        { ID: 2, IDX: 1, NAME: '나' },
        { ID: 3, IDX: 2, NAME: '다' },
        { ID: 4, IDX: 3, NAME: '라' },
        { ID: 5, IDX: 4, NAME: '마' },
        { ID: 6, IDX: 5, NAME: '바' },
        { ID: 7, IDX: 6, NAME: '사' },
        { ID: 8, IDX: 7, NAME: '아' },
        { ID: 9, IDX: 7, NAME: '아' },
        { ID: 10, IDX: 7, NAME: '아' },
        { ID: 11, IDX: 7, NAME: '아' },
        { ID: 12, IDX: 7, NAME: '아' },
        { ID: 13, IDX: 7, NAME: '아' },
        { ID: 14, IDX: 7, NAME: '아' },
        { ID: 15, IDX: 7, NAME: '아' },
        { ID: 16, IDX: 7, NAME: '아' },
        { ID: 17, IDX: 7, NAME: '아' },
        { ID: 18, IDX: 7, NAME: '아' },
        { ID: 19, IDX: 7, NAME: '아' },
        { ID: 20, IDX: 7, NAME: '아' },
        { ID: 21, IDX: 7, NAME: '아' },
        { ID: 22, IDX: 7, NAME: '아' },
        { ID: 23, IDX: 7, NAME: '아' },
        { ID: 24, IDX: 7, NAME: '아' },
    ];

    assetFilterData: any = {
        NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
}
</script>

<style lang="scss" scoped>
#asset-table::v-deep {
    .p-datatable-thead {
        display: none;
    }

    .i-asset-index {
        position: relative;

        .i-asset-comm-status {
            position: absolute;
            top: 0;
            right: 0;
            transform-origin: 100% 0;
            transform: translate(40%, -20%);
        }
    }
}
</style>