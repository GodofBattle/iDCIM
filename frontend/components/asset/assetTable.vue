<template>
    <div id="asset-table" class="p-pt-2">
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
                    <Avatar class="i-asset-index p-px-1">
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
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { FilterMatchMode } from 'primevue/api';

@Component<AssetTable>({
    props: {
        treeType: String,
        treeKeys: Array,
    },
    apollo: {
        assetList: {
            query: gql`
                query ($TYPE: String!, $KEYS: [String!]!) {
                    Assets(TYPE: $TYPE, KEYS: $KEYS) {
                        ID
                        PRODUCT_ID
                        NAME
                    }
                }
            `,
            variables() {
                return {
                    TYPE: this.$props.treeType ?? '',
                    KEYS: this.$props.treeKeys ?? [],
                };
            },
            update: ({ Assets }: any) => Assets,
        },
    },
})
export default class AssetTable extends Vue {
    assetList: Array<any> = [];

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
        width: auto;
        min-width: 2rem;

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