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
            :selection.sync="selectedRow"
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

            <template #empty>
                <span v-if="assetList && assetList.length === 0">
                    선택한 그룹의 자산이 없습니다
                </span>
            </template>

            <Column
                key="ID"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '50px',
                    'flex-flow': 'column'
                }"
            >
                <template #body="slotProps">
                    <Avatar
                        :class="
                            lvlStatus(
                                is_used_interface(slotProps.data)
                                    ? slotProps.data.INTERFACE.CURR_LEVEL
                                    : undefined
                            )
                        "
                    >
                        <span>{{ slotProps.index + 1 }}</span>
                        <Badge
                            v-if="is_used_interface(slotProps.data)"
                            :class="
                                commStatus(slotProps.data.INTERFACE.CURR_STATUS)
                            "
                        ></Badge>
                    </Avatar>
                </template>
            </Column>
            <Column
                key="NAME"
                :styles="{ 'flex-grow': 1, 'flex-basis': 'calc(100% - 50px)' }"
            >
                <template #body="slotProps">
                    {{ slotProps.data.NAME }}
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script lang="ts">
import { setInterval, clearInterval } from 'timers';
import Vue from 'vue';
import gql from 'graphql-tag';
import { FilterMatchMode } from 'primevue/api';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

let timerId: NodeJS.Timeout;

@Component<AssetTable>({
    props: {
        treeType: String,
        treeKeys: Array,
        selectedAsset: Object
    },
    apollo: {
        assetList: {
            query: gql`
                query ($TYPE: String!, $KEYS: [String!]!) {
                    Assets(TYPE: $TYPE, KEYS: $KEYS) {
                        ID
                        PRODUCT_ID
                        NAME
                        IS_USE_INTF
                        INTERFACE {
                            CURR_STATUS
                            CURR_LEVEL
                            IS_USE
                        }
                        PRODUCT {
                            MANUFACTURER_ID
                        }
                    }
                }
            `,
            variables() {
                return {
                    TYPE: this.$props.treeType ?? '',
                    KEYS: this.$props.treeKeys ?? []
                };
            },
            update: ({ Assets }) => Assets,
            prefetch: true,
            manual: true,
            fetchPolicy: 'network-only',
            result({ loading, data }) {
                if (!loading) {
                    if (data) {
                        const { Assets } = data;
                        this.apolloFetch(Assets);
                    }
                }
            }
        }
    },
    watch: {
        treeType(_new_tree_type) {
            this.reloadAssetList();
        },
        treeKeys: {
            deep: true,
            handler(_new_tree_keys) {
                this.reloadAssetList();
            }
        }
    }
})
export default class AssetTable extends Vue {
    assetList: Array<any> = [];

    assetFilterData: any = {
        NAME: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };

    mounted() {
        timerId = setInterval(() => {
            this.$apollo.queries.assetList.refetch();
        }, 10000);

        eventBus.$on('refreshAssetTable', (id: number) => {
            this.$apollo.queries.assetList.refetch().then(() => {
                const row_id = id || this.selectedRow.ID;

                this.selectedRow = this.assetList.find(
                    (asset: any) => asset.ID === row_id
                );
            });
        });
    }

    beforeDestory() {
        clearInterval(timerId);

        eventBus.$off('refreshAssetTable');
    }

    reloadAssetList() {
        this.$apollo.queries.assetList.stopPolling();
        this.$apollo.queries.assetList.refresh();
    }

    reset() {
        this.assetList.splice(0, this.assetList.length);
    }

    apolloFetch(data: any) {
        this.reset();

        data.forEach((datum: any) => {
            this.assetList.push({ ...datum });
        });
    }

    is_used_interface({ IS_USE_INTF }: any): boolean {
        return IS_USE_INTF === 1;
    }

    lvlStatus(lvl: undefined | number): Array<object | string> {
        return [
            'i-asset-index p-px-1',
            {
                'i-lvl-null': lvl === undefined,
                'i-lvl00': lvl === 0,
                'i-lvl01': lvl === 1,
                'i-lvl02': lvl === 2,
                'i-lvl03': lvl === 3,
                'i-lvl04': lvl === 4,
                'i-lvl05': lvl === 5
            }
        ];
    }

    commStatus(status: number): Array<object | string> {
        return [
            'i-asset-comm-status',
            {
                'i-comm00': status === 0,
                'i-comm01': status === 1,
                'i-comm04': status === 4,
                'i-comm05': status === 5
            }
        ];
    }

    get selectedRow() {
        return this.$props.selectedAsset;
    }

    set selectedRow(item: any) {
        this.$emit('update:selectedAsset', item);
    }
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
            transform: translate(40%, -40%);
            width: 0.8rem;
            height: 0.8rem;
        }

        .i-comm00 {
            background-color: var(--comm00-color);
        }

        .i-comm01 {
            animation: blink;
            animation-duration: 1.5s;
            animation-iteration-count: infinite;
            background-color: var(--comm01-color);
        }

        .i-comm04 {
            background-color: var(--comm04-color);
        }

        .i-comm05 {
            background-color: var(--comm05-color);
            width: 0.9rem;
            height: 0.9rem;
            border: 1px solid var(--surface-border);
        }
    }

    .i-lvl-null {
        background: transparent;
        border: 1px solid var(--surface-border);
    }

    .i-lvl00 {
        background: transparent;
        border: 1px solid var(--surface-border);
    }

    .i-lvl01 {
        background-color: var(--warning);
        color: var(--text-alert-warning-color);
    }

    .i-lvl02 {
        background-color: var(--major);
        color: var(--text-alert-color);
    }

    .i-lvl03 {
        background-color: var(--critical);
        color: var(--text-alert-color);
    }
}
</style>
