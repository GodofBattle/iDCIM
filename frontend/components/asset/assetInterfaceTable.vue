<template>
    <div id="i-asset-interface-table">
        <DataTable
            :value="interfaceAssetListToRender"
            class="p-datatable-sm"
            :table-style="{ width: '100%', height: '100%' }"
            :scrollable="true"
            scroll-height="flex"
            data-key="ID"
            :striped-rows="true"
            :meta-key-selection="false"
            :filters.sync="assetFilterData"
            :paginator="true"
            :first="first"
            :rows="rows"
            :always-show-paginator="true"
            :page-link-size="1"
            :lazy="true"
            :total-records="totalRecords"
            :row-class="rowClass"
            @page="onPage"
            @row-click="onRowClick"
        >
            <template #header>
                <div class="p-d-flex">
                    <div class="p-as-center p-ml-auto">
                        <span class="p-input-icon-right">
                            <i class="pi pi-search" />
                            <InputText
                                v-model="assetFilterData['NAME'].value"
                            />
                        </span>
                    </div>
                </div>
            </template>

            <template #empty>
                <span> 선택한 그룹의 자산이 없습니다 </span>
            </template>

            <Column key="LEVEL" class-name="i-column-lvl">
                <template #body="slotProps">
                    <div :class="lvlStatus(slotProps.data)" />
                </template>
            </Column>
            <Column
                key="SELECTION"
                class-name="i-column-selector"
                :show-filter-menu="false"
            >
                <template #body="slotProps">
                    <Checkbox
                        id="assetInterfaceSelect"
                        v-model="slotProps.data.SELECTION"
                        :binary="true"
                        @click="onClickAssetSelection"
                        @input="
                            onInputAssetSelection($event, slotProps.data.ID)
                        "
                    />
                </template>
            </Column>
            <Column key="ID" class-name="i-column-index">
                <template #body="slotProps">
                    <div>
                        {{ first + slotProps.index + 1 }}
                    </div>
                </template>
            </Column>
            <Column header="자산명" field="NAME" class-name="i-column-name">
                <template #body="slotProps">
                    <div class="i-text-ellipsis">
                        {{ slotProps.data.NAME }}
                    </div>
                </template>
            </Column>
            <Column key="STATUS" class-name="i-column-status">
                <template #body="slotProps">
                    <svg-sensor-on
                        v-if="
                            isUsedInterface(slotProps.data) &&
                            commStatus(slotProps.data.INTERFACE)
                        "
                        class="i-comm-icon"
                    />
                    <svg-sensor-off
                        v-else-if="
                            isUsedInterface(slotProps.data) &&
                            !commStatus(slotProps.data.INTERFACE)
                        "
                        class="i-comm-icon"
                    />
                </template>
            </Column>
            <template #paginatorstart> </template>
            <template #paginatorend>
                <label v-if="totalRecords !== 0">
                    {{ assetInterfaceListSummary }}
                </label>
            </template>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import { FilterMatchMode } from 'primevue/api';
import Component from '@/plugins/nuxt-class-component';

interface INTERFACE {
    [index: string]: number;
    PROD_INTF_ID: number;
    CURR_STATUS: number;
    CURR_LEVEL: number;
    IS_USE: number;
}

interface PRODUCT {
    [index: string]: number;
    MANUFACTURER_ID: number;
}

interface ASSET {
    [index: string]: string | number | INTERFACE | PRODUCT | boolean;
    ID: string;
    PRODUCT_ID: number;
    NAME: string;
    IS_USE_INTF: number;
    INTERFACE: INTERFACE;
    PRODUCT: PRODUCT;
}

interface ASSET_VIEW extends ASSET {
    SELECTION: boolean;
}

@Component<AssetInterfaceTable>({
    props: {
        treeType: String,
        treeKeys: Array,
        selectedAssets: {
            type: Array,
            default: (raw: Array<ASSET_VIEW>) => {
                return [...raw];
            }
        }
    },
    apollo: {
        interfaceAssetList: {
            query: gql`
                query ($TYPE: String!, $KEYS: [String!]!) {
                    Assets(TYPE: $TYPE, KEYS: $KEYS) {
                        ID
                        PRODUCT_ID
                        NAME
                        IS_USE_INTF
                        INTERFACE {
                            PROD_INTF_ID
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
            update({ Assets }) {
                return Assets.filter((a: ASSET) => a.IS_USE_INTF === 1).map(
                    (a: ASSET) => {
                        const is =
                            this.$props.selectedAssets === null
                                ? false
                                : this.$props.selectedAssets.some(
                                      (sa: ASSET_VIEW) => sa.ID === a.ID
                                  );

                        return {
                            SELECTION: is,
                            ...a
                        };
                    }
                );
            }
        }
    },
    watch: {
        isStatusIndex() {
            this.$apollo.queries.interfaceAssetList.refetch();
        }
    }
})
export default class AssetInterfaceTable extends Vue {
    interfaceAssetList: Array<any> = [];

    assetFilterData: any = {
        NAME: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };

    first: number = 0;
    rows: number = 100;
    totalRecords: number = 0;
    max_selection_count: number = 20;

    get isStatusIndex(): number {
        // by shkoh 20230404: 자산의 상태가 변경됐음을 알려줄 때, 상태 Index가 1이 추가되면서 이를 알려줌
        const status_index = this.$store.getters['sessionStorage/STATUS'];
        return status_index;
    }

    lvlStatus({
        IS_USE_INTF,
        INTERFACE
    }: {
        IS_USE_INTF: number;
        INTERFACE: any;
    }): Array<object | string> {
        if (IS_USE_INTF === 0 || INTERFACE === null) {
            return ['i-lvl-step'];
        }

        const { CURR_LEVEL, CURR_STATUS, IS_USE } = INTERFACE;

        return [
            'i-lvl-step',
            {
                'i-lvl-1-step':
                    IS_USE === 1 && CURR_STATUS <= 1 && CURR_LEVEL === 1,
                'i-lvl-2-step':
                    IS_USE === 1 && CURR_STATUS <= 1 && CURR_LEVEL === 2,
                'i-lvl-3-step':
                    IS_USE === 1 && CURR_STATUS <= 1 && CURR_LEVEL === 3
            }
        ];
    }

    isUsedInterface({
        IS_USE_INTF,
        INTERFACE
    }: {
        IS_USE_INTF: number;
        INTERFACE: any;
    }): boolean {
        // by shkoh 20221214: IS_USE_INTF는 인터페이스 사용유무의 의미로 일반자산인 경우에 IS_USE_INTF는 0이다
        if (INTERFACE === null) return false;

        return IS_USE_INTF === 1 && INTERFACE.IS_USE === 1;
    }

    commStatus({ CURR_STATUS }: any): boolean {
        return CURR_STATUS <= 1;
    }

    rowClass(asset: any) {
        return asset.SELECTION ? 'p-highlight' : '';
    }

    onPage(event: any) {
        const { first } = event;
        this.first = first;
    }

    onRowClick({ data }: any) {
        if (this.selectionAssets.length >= this.max_selection_count) {
            if (data.SELECTION) {
                data.SELECTION = false;
            } else {
                this.$toast.add({
                    severity: 'warn',
                    summary: `데이터통계 선택 자산 초과`,
                    detail: `데이터통계 조회 성능 최적화를 위해서 최대 ${this.max_selection_count}개까지만 자산이 선택됩니다`,
                    life: 3000
                });
            }
        } else {
            data.SELECTION = !data.SELECTION;
        }

        this.rowSelection(data.SELECTION, data.ID);
    }

    onClickAssetSelection(event: PointerEvent) {
        event.stopPropagation();
    }

    onInputAssetSelection(is_checked: boolean, asset_id: string) {
        if (
            this.selectionAssets.length > this.max_selection_count &&
            is_checked === true
        ) {
            const check_asset = this.interfaceAssetList.find(
                (a: any) => a.ID === asset_id
            );

            if (check_asset) {
                check_asset.SELECTION = false;

                this.$toast.add({
                    severity: 'warn',
                    summary: `데이터통계 선택 자산 초과`,
                    detail: `데이터통계 조회 성능 최적화를 위해서 최대 ${this.max_selection_count}개까지만 자산이 선택됩니다`,
                    life: 3000
                });
            }
        } else {
            this.rowSelection(is_checked, asset_id);
        }
    }

    rowSelection(is_checked: boolean, asset_id: string) {
        this.$emit('update:selectedAssets', this.selectionAssets);

        // by shkoh 20230227: 자산선택을 해제할 경우에 지정한 자산의 수집항목도 함께 해제할 수 있도록 조치
        if (!is_checked) {
            this.$emit('unselect', { ID: asset_id, SELECTION: is_checked });
        }
    }

    get selectionAssets(): Array<any> {
        return this.interfaceAssetList.filter((a: any) => a.SELECTION);
    }

    get interfaceAssetListToRender() {
        const list = this.interfaceAssetList;

        this.totalRecords = list.length;

        return list.slice(this.first, this.first + this.rows);
    }

    get assetInterfaceListSummary(): string {
        const first = this.first;
        const last =
            first + this.rows > this.totalRecords
                ? this.totalRecords
                : first + this.rows;

        return `${first + 1} - ${last} / ${this.totalRecords}`;
    }
}
</script>

<style lang="scss" scoped>
#i-asset-interface-table::v-deep {
    width: 100%;
    height: 100%;

    .p-datatable-emptymessage {
        td {
            justify-content: center;
            border: none;
            height: 60vh;
        }
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
    }

    .i-column-lvl {
        flex-grow: 1;
        flex-basis: 1rem;
        padding: 0;

        .i-lvl-step {
            width: 0.5rem;
            height: 80%;
        }

        .i-lvl-1-step {
            background-color: var(--warning);
        }

        .i-lvl-2-step {
            background-color: var(--major);
        }

        .i-lvl-3-step {
            background-color: var(--critical);
        }
    }

    .i-column-selector {
        flex-grow: 1;
        flex-basis: 3em;
        justify-content: center;
    }

    .i-column-index {
        flex-grow: 1;
        flex-basis: 30px;
        justify-content: start;
    }

    .i-column-name {
        flex-grow: 1;
        flex-basis: calc(100% - 1rem - 3em - 40px);
        justify-content: start;
        overflow: hidden;
    }

    .i-column-status {
        flex-grow: 1;
        flex-basis: 40px;
        justify-content: center;

        .i-comm-icon {
            width: 1.2rem;
            height: 1.2rem;
        }
    }
}
</style>
