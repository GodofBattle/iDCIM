<template>
    <div id="i-operator-alert-asset-table">
        <DataTable
            :loading="$apollo.loading"
            :value="assetListToRender"
            :lazy="true"
            class="p-datatable-sm"
            :table-style="{
                width: 'calc(100% -2rem)',
                height: '100%'
            }"
            :scrollable="true"
            scroll-height="flex"
            :striped-rows="true"
            :row-hover="true"
            filter-display="row"
            :filters.sync="filters"
            :paginator="true"
            :always-show-paginator="true"
            :page-link-size="pageLinkSize"
            selection-mode="multiple"
            :meta-key-selection="false"
            data-key="ID"
            :first.sync="first"
            :rows="rows"
            :total-records="totalRecords"
            :row-class="rowClass"
            @page="onPage"
            @row-click="onRowClick"
        >
            <template #empty>
                <div class="i-table-empty">조건에 맞는 자산이 없습니다</div>
            </template>

            <Column key="LEVEL" class-name="i-column-lvl">
                <template #body="slotProps">
                    <div :class="lvlStatus(slotProps.data.INTERFACE)" />
                </template>
            </Column>
            <Column
                key="SELECTION"
                class-name="i-column-selector"
                :show-filter-menu="false"
            >
                <template #filter>
                    <Checkbox
                        id="operatorAlertAssetAllSelect"
                        v-model="isSelectAll"
                        :binary="true"
                    />
                </template>
                <template #body="slotProps">
                    <Checkbox
                        id="operatorAlertAssetSelect"
                        v-model="slotProps.data.SELECTION"
                        :binary="true"
                        @click="onClickAlertAssetSelection"
                        @input="
                            onInputAlertAssetSelection(
                                $event,
                                slotProps.data.ID
                            )
                        "
                    />
                </template>
            </Column>
            <Column class-name="i-column-index">
                <template #body="slotProps">
                    <div>
                        {{ first + slotProps.index + 1 }}
                    </div>
                </template>
            </Column>
            <Column
                class-name="i-column-name"
                field="NAME"
                header="자산명"
                :show-filter-menu="false"
            >
                <template #filter="{ filterModel, filterCallback }">
                    <InputText
                        v-model="filterModel.value"
                        type="text"
                        class="p-colum-filter"
                        @input="filterCallback"
                    />
                </template>
                <template #body="slotProps">
                    <div class="i-text-ellipsis">
                        {{ slotProps.data.NAME }}
                    </div>
                </template>
            </Column>
            <Column
                class-name="i-column-position"
                field="CUST_HIER_ID_P"
                filter-field="CUST_HIER_ID_P"
                header="위치"
                :show-filter-menu="false"
            >
                <template #filter="{ filterModel, filterCallback }">
                    <InputText
                        v-model="filterModel.value"
                        type="text"
                        class="p-column-filter"
                        @input="filterCallback()"
                    />
                </template>
                <template #body="slotProps">
                    {{ accountCustomHierLabel(slotProps.data.CUST_HIER_ID_P) }}
                </template>
            </Column>
            <Column
                class-name="i-column-asset-code"
                field="PRODUCT.ASSET_CD"
                header="자산분류"
                :show-filter-menu="false"
            >
                <template #filter="{ filterModel, filterCallback }">
                    <InputText
                        v-model="filterModel.value"
                        type="text"
                        class="p-column-filter"
                        @input="filterCallback()"
                    />
                </template>
                <template #body="slotProps">
                    {{ assetCodeLabel(slotProps.data.PRODUCT.ASSET_CD) }}
                </template>
            </Column>
            <Column
                class-name="i-column-manufacturer-name"
                field="PRODUCT.MANUFACTURER.NAME"
                header="제조사"
                :show-filter-menu="false"
            >
                <template #filter="{ filterModel, filterCallback }">
                    <InputText
                        v-model="filterModel.value"
                        type="text"
                        class="p-column-filter"
                        @input="filterCallback()"
                    />
                </template>
            </Column>
            <Column
                class-name="i-column-product-name"
                field="PRODUCT.MODEL_NAME"
                header="제품명"
                :show-filter-menu="false"
            >
                <template #filter="{ filterModel, filterCallback }">
                    <InputText
                        v-model="filterModel.value"
                        type="text"
                        class="p-column-filter"
                        @input="filterCallback()"
                    />
                </template>
            </Column>
            <Column key="STATUS" class-name="i-column-status">
                <template #body="slotProps">
                    <svg-sensor-on
                        v-if="
                            hasInterface(slotProps.data) &&
                            isUseInterface(slotProps.data.INTERFACE) &&
                            commStatus(slotProps.data.INTERFACE)
                        "
                        class="i-comm-icon"
                    />
                    <svg-sensor-off
                        v-else-if="
                            hasInterface(slotProps.data) &&
                            isUseInterface(slotProps.data.INTERFACE) &&
                            !commStatus(slotProps.data.INTERFACE)
                        "
                        class="i-comm-icon"
                    />
                    <svg-sensor-pause
                        v-else-if="
                            hasInterface(slotProps.data) &&
                            !isUseInterface(slotProps.data.INTERFACE)
                        "
                        class="i-comm-icon"
                    />
                </template>
            </Column>
            <Column class-name="i-column-detail">
                <template #body="slotProps">
                    <Button
                        v-show="slotProps.data.SELECTION"
                        class="p-button-sm"
                        icon="pi pi-search"
                        title="상세설정"
                        :style="{
                            width: '0.8rem',
                            padding: '0.1rem 0.8rem'
                        }"
                        :disabled="
                            isDisabledDetailButton(slotProps.data.SELECTION)
                        "
                        @click="onShowDetailPanel(slotProps.data)"
                    />
                </template>
            </Column>
            <template #paginatorstart>
                {{ selectedAssetSummary }}
            </template>
            <template #paginatorend>
                <label>
                    {{ assetListSummary }}
                </label>
            </template>
        </DataTable>
        <operator-alert-sensor-list
            ref="operatorAlertSensorList"
            :visible.sync="showDialog"
            :operator-id="operatorId"
            :asset-id="detailAssetId"
            :asset-name="detailAssetName"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import { FilterService, FilterMatchMode } from 'primevue/api';
import OperatorAlertSensorList from './operatorAlertSensorList.vue';
import Component from '@/plugins/nuxt-class-component';

interface OpNotiAsset {
    [index: string]: number;
    OP_ID: number;
    ASSET_ID: number;
    IS_NOTI_COMM: number;
}

interface PredefinedAssetCode {
    [index: string]: string;
    CODE: string;
    NAME: string;
    ALIAS: string;
}

interface AccountCustomHier {
    [index: string]: string | number;
    TID: number;
    NAME: string;
}

interface INTERFACE {
    [index: string]: number;
    ID: number;
    PROD_INTF_ID: number;
    CURR_STATUS: number;
    CURR_LEVEL: number;
    IS_USE: number;
}

interface PRODUCT {
    [index: string]: number | string | MANUFACTURER;
    MANUFACTURER_ID: number;
    ASSET_CD: string;
    NAME: string;
    MODEL_NAME: string;
    MANUFACTURER: MANUFACTURER;
}

interface MANUFACTURER {
    [index: string]: string;
    NAME: string;
}

interface ASSET {
    [index: string]: number | string | INTERFACE | PRODUCT | boolean;
    ID: string;
    PRODUCT_ID: number;
    NAME: string;
    CUST_HIER_ID_P: number;
    CUST_HIER_ID_C: number;
    IS_USE_INTF: number;
    INTERFACE: INTERFACE;
    PRODUCT: PRODUCT;
}

interface ASSET_VIEW extends ASSET {
    SELECTION: boolean;
}

@Component<OperatorAlertAssetTable>({
    props: {
        treeType: {
            type: String,
            default: ''
        },
        treeKeys: {
            type: Array,
            default: (raw: Array<string>) => {
                return [...raw];
            }
        },
        operatorId: {
            type: Number,
            default: null
        },
        alertAssetList: {
            type: Array,
            default: (raw: Array<OpNotiAsset>) => {
                return [...raw];
            }
        }
    },
    apollo: {
        accountCustomHierByPosition: {
            query: gql`
                query {
                    AccountCustomHiers(TYPE: "P") {
                        TID
                        NAME
                    }
                }
            `,
            update: ({ AccountCustomHiers }) => AccountCustomHiers
        },
        pdAssetCode: {
            query: gql`
                query {
                    PredefinedAssetCodes {
                        CODE
                        NAME
                        ALIAS
                    }
                }
            `,
            update: ({ PredefinedAssetCodes }) => PredefinedAssetCodes
        },
        assetList: {
            query: gql`
                query ($TYPE: String!, $KEYS: [String!]!) {
                    Assets(TYPE: $TYPE, KEYS: $KEYS) {
                        ID
                        PRODUCT_ID
                        NAME
                        CUST_HIER_ID_P
                        CUST_HIER_ID_C
                        IS_USE_INTF
                        INTERFACE {
                            ID
                            PROD_INTF_ID
                            CURR_STATUS
                            CURR_LEVEL
                            IS_USE
                        }
                        PRODUCT {
                            MANUFACTURER_ID
                            ASSET_CD
                            NAME
                            MODEL_NAME
                            MANUFACTURER {
                                NAME
                            }
                        }
                    }
                }
            `,
            variables() {
                return {
                    TYPE: this.treeType,
                    KEYS: this.treeKeys
                };
            },
            update: ({ Assets }) => Assets,
            result({ loading, data }) {
                if (!loading) {
                    const { Assets } = data;

                    if (Assets) {                        
                        this.initAssetList(Assets);
                    }
                }
            },
            fetchPolicy: 'cache-and-network'
        }
    },
    watch: {
        alertAssetList(assets: Array<OpNotiAsset>) {
            this.refreshAssetSelect(assets);
        }
    }
})
export default class OperatorAlertAssetTable extends Vue {
    $refs!: {
        operatorAlertSensorList: OperatorAlertSensorList;
    };

    accountCustomHierByPosition: Array<AccountCustomHier> = [];
    pdAssetCode: Array<PredefinedAssetCode> = [];

    assetList: Array<ASSET_VIEW> = [];
    filterAssetList: Array<ASSET_VIEW> = [];

    first: number = 0;
    rows: number = 100;
    totalRecords: number = 0;
    pageLinkSize: number = 10;

    showDialog: boolean = false;
    detailAssetId: number = -1;
    detailAssetName: string = '';

    filters = {
        NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
        CUST_HIER_ID_P: { value: null, matchMode: 'POSITION' },
        'PRODUCT.ASSET_CD': {
            value: null,
            matchMode: 'ASSET_TYPE'
        },
        'PRODUCT.MANUFACTURER.NAME': {
            value: null,
            matchMode: FilterMatchMode.CONTAINS
        },
        'PRODUCT.MODEL_NAME': {
            value: null,
            matchMode: FilterMatchMode.CONTAINS
        }
    };

    mounted() {
        this.addFilterService();
    }

    addFilterService() {
        if (FilterService.register) {
            FilterService.register(
                'ASSET_TYPE',
                (value: any, filter: any): boolean => {
                    if (
                        filter === undefined ||
                        filter === null ||
                        filter.trim() === ''
                    ) {
                        return true;
                    }

                    if (value === undefined || value === null) {
                        return false;
                    }

                    if (this.pdAssetCode) {
                        const ac = this.pdAssetCode.find(
                            (code: PredefinedAssetCode) => code.CODE === value
                        );
                        if (ac) {
                            const asset_type_name =
                                ac.ALIAS.length > 0 ? ac.ALIAS : ac.NAME;
                            return asset_type_name.includes(filter);
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            );

            FilterService.register(
                'POSITION',
                (value: any, filter: any): boolean => {
                    if (
                        filter === undefined ||
                        filter === null ||
                        filter.trim() === ''
                    ) {
                        return true;
                    }

                    if (value === undefined || value === null) {
                        return false;
                    }

                    if (this.accountCustomHierByPosition) {
                        const cust = this.accountCustomHierByPosition.find(
                            (c: AccountCustomHier) => c.TID === value
                        );
                        if (cust) {
                            return cust.NAME.includes(filter);
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            );
        }
    }
    
    initAssetList(assets: Array<ASSET>) {
        this.assetList = assets.map<ASSET_VIEW>((a: ASSET): ASSET_VIEW => {
            return {
                SELECTION: this.$props.alertAssetList.some(
                    (aal: OpNotiAsset) => aal.ASSET_ID === Number(a.ID)
                ),
                ...a
            };
        });
    }

    refreshAssetSelect(assets: Array<OpNotiAsset>) {
        this.assetList.forEach((a: ASSET_VIEW) => {
            a.SELECTION = assets.some(
                (on: OpNotiAsset) => on.ASSET_ID === Number(a.ID)
            );
        });
    }

    rowClass(asset: ASSET_VIEW) {
        return asset.SELECTION ? 'p-highlight' : '';
    }

    lvlStatus(intf: any): Array<object | string> {
        if (intf === null) {
            return ['i-lvl-step'];
        }

        const { CURR_LEVEL, CURR_STATUS, IS_USE } = intf;

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

    accountCustomHierLabel(tid: number) {
        const hier = this.accountCustomHierByPosition.find(
            (p: AccountCustomHier) => p.TID === tid
        );
        return hier ? hier.NAME : '설정안됨';
    }

    assetCodeLabel(code: string) {
        const ac = this.pdAssetCode.find(
            (c: PredefinedAssetCode) => c.CODE === code
        );
        return ac ? (ac.ALIAS.length > 0 ? ac.ALIAS : ac.NAME) : '설정안됨';
    }

    hasInterface({
        IS_USE_INTF,
        INTERFACE
    }: {
        IS_USE_INTF: number;
        INTERFACE: any;
    }): boolean {
        // by shkoh 20221214: IS_USE_INTF는 인터페이스 사용유무의 의미로 일반자산인 경우에 IS_USE_INTF는 0이다
        return IS_USE_INTF === 1 && INTERFACE !== null;
    }

    isUseInterface({ IS_USE }: { IS_USE: number }) {
        return IS_USE === 1;
    }

    commStatus({ CURR_STATUS }: any): boolean {
        return CURR_STATUS <= 1;
    }

    isDisabledDetailButton(is_select: boolean) {
        return !is_select;
    }

    rowSelection({ checked, id }: { checked: boolean; id: string }) {
        if (checked) {
            this.$emit('select-asset', { ASSET_ID: id });
        } else {
            this.$emit('unselect-asset', { ASSET_ID: id });
        }
    }

    onShowDetailPanel(data: ASSET) {
        this.detailAssetId = Number(data.ID);
        this.detailAssetName = data.NAME;
        this.showDialog = true;
    }

    onPage({ first }: { first: number }) {
        // by shkoh 20230214: lazy를 true로 설정했기 때문에 필요한 사항들을 하나 하나 지정함
        this.first = first;
    }

    onClickAlertAssetSelection(event: PointerEvent) {
        // by shkoh 20230216: DataTable의 Selection 기능을 checkbox를 강제로 추가하여 진행할 때, checkbox 클릭과 함께 부모인 row-click 이벤트도 발생하는 bubble up을 멈추도록 함
        event.stopPropagation();
    }

    onInputAlertAssetSelection(checked: boolean, id: string) {
        this.rowSelection({ checked, id });
    }

    onRowClick({ data }: { data: ASSET_VIEW }) {
        data.SELECTION = !data.SELECTION;

        this.rowSelection({
            checked: data.SELECTION,
            id: data.ID
        });
    }

    get isSelectAll(): boolean {
        if (this.totalRecords === 0) return false;

        if (this.isFiltering) {
            return this.countSelectionFilteredAssetList === this.totalRecords;
        } else {
            return this.countSelectionAssetList === this.totalRecords;
        }
    }

    set isSelectAll(is_select_all: boolean) {
        // by shkoh 20230215: 데이터의 Filtering 여부에 따라서 제공하는 데이터를 달리한다. paging의 뒤에 존재하는 데이터도 함께 처리를 수행함
        const view_table = this.isFiltering
            ? this.filterAssetList
            : this.assetList;

        const view_table_ids = view_table.map((a: ASSET_VIEW) => {
            return { ID: a.ID };
        });

        if (is_select_all) {
            view_table.forEach((a: ASSET_VIEW) => {
                a.SELECTION = true;
            });

            // by shkoh 20230216: 전체선택할 자산의 수가 많은 경우를 대비하여 rows의 수만큼씩 끊어서 자산을 추가함
            for (let idx = 0; idx < view_table_ids.length; idx += this.rows) {
                const start = idx;
                const last =
                    idx + this.rows > view_table_ids.length
                        ? view_table_ids.length
                        : idx + this.rows;

                this.$emit(
                    'select-all-asset',
                    view_table_ids.slice(start, last)
                );
            }
        } else {
            view_table.forEach((a: ASSET_VIEW) => {
                a.SELECTION = false;
            });

            for (let idx = 0; idx < view_table_ids.length; idx += this.rows) {
                const start = idx;
                const last =
                    idx + this.rows > view_table_ids.length
                        ? view_table_ids.length
                        : idx + this.rows;

                this.$emit(
                    'unselect-all-asset',
                    view_table_ids.slice(start, last)
                );
            }
        }
    }

    get assetListToRender(): Array<ASSET_VIEW> {
        const list = this.assetList.filter((a: ASSET_VIEW) => {
            let is_filtering = true;

            for (const [key, filter] of Object.entries(this.filters)) {
                const filtered_value: null | string = filter.value;

                if (
                    filtered_value !== null &&
                    (filtered_value as string).length > 1
                ) {
                    let source_value = '';
                    switch (key) {
                        case 'NAME': {
                            source_value = a.NAME;
                            break;
                        }
                        case 'CUST_HIER_ID_P': {
                            source_value = this.accountCustomHierLabel(
                                a.CUST_HIER_ID_P
                            );
                            break;
                        }
                        case 'PRODUCT.ASSET_CD': {
                            source_value = this.assetCodeLabel(
                                a.PRODUCT.ASSET_CD
                            );
                            break;
                        }
                        case 'PRODUCT.MANUFACTURER.NAME': {
                            source_value = a.PRODUCT.MANUFACTURER.NAME;
                            break;
                        }
                        case 'PRODUCT.MODEL_NAME': {
                            source_value = a.PRODUCT.MODEL_NAME;
                            break;
                        }
                    }

                    is_filtering = source_value
                        .toLowerCase()
                        .includes(
                            (filtered_value as string).trim().toLowerCase()
                        );
                }

                if (!is_filtering) {
                    break;
                }
            }

            return is_filtering;
        });

        this.totalRecords = list.length;
        this.filterAssetList = [...list];

        return list.slice(this.first, this.first + this.rows);
    }

    get countSelectionAssetList(): number {
        return this.assetList.filter((a: ASSET_VIEW) => a.SELECTION).length;
    }

    get countSelectionFilteredAssetList(): number {
        return this.filterAssetList.filter((a: ASSET_VIEW) => a.SELECTION)
            .length;
    }

    get isFiltering(): boolean {
        return Object.values(this.filters).some((f: any) => f.value !== null);
    }

    get selectedAssetSummary(): string {
        return `${this.countSelectionAssetList.toLocaleString()}개 선택됨`;
    }

    get assetListSummary(): string {
        const total = this.totalRecords;

        const first = this.first;
        const last = first + this.rows > total ? total : first + this.rows;
        return total === 0 ? `` : `${(first + 1).toLocaleString()} - ${last.toLocaleString()} / ${total.toLocaleString()}`;
    }
}
</script>

<style lang="scss" scoped>
#i-operator-alert-asset-table::v-deep {
    & {
        width: 100%;
        height: 100%;
    }

    .p-datatable-emptymessage {
        td {
            justify-content: center;
            border: none;
            height: 60vh;

            .i-table-empty {
                text-align: center;
            }
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
        flex-basis: 50px;
        justify-content: center;
    }

    .i-column-name {
        flex-grow: 1;
        flex-basis: 20%;
        justify-content: start;
        overflow: hidden;
    }

    .i-column-position {
        flex-grow: 1;
        flex-basis: 20%;
        justify-content: start;
        overflow: hidden;
    }

    .i-column-asset-code {
        flex-grow: 1;
        flex-basis: 20%;
        justify-content: start;
        overflow: hidden;
    }

    .i-column-manufacturer-name {
        flex-grow: 1;
        flex-basis: 20%;
        justify-content: start;
        overflow: hidden;
    }

    .i-column-product-name {
        flex-grow: 1;
        flex-basis: 20%;
        justify-content: start;
        overflow: hidden;
    }

    .i-column-status {
        flex-grow: 1;
        flex-basis: 40px;
        justify-content: center;

        .i-comm-icon {
            width: 1.3rem;
            height: 1.3rem;
        }
    }

    .i-column-detail {
        flex-grow: 1;
        flex-basis: 3rem;
        justify-content: center;
    }
}
</style>
