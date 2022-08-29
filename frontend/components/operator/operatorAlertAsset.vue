<template>
    <div v-if="!$apollo.$loading" id="i-operator-alert-asset" class="p-d-flex">
        <div
            class="p-col-fixed"
            :style="{ width: 'var(--tree-width)', height: '100%' }"
        >
            <asset-tree
                :style="{ height: '100%' }"
                @select="onSelectAssetTreeNode"
            />
        </div>
        <div
            class="p-col-fixed p-pt-4"
            :style="{ width: 'calc(100% - var(--tree-width))' }"
        >
            <DataTable
                :value="assetList"
                data-key="ID"
                class="p-datatable-sm"
                :scrollable="true"
                scroll-height="flex"
                :table-style="{ width: 'calc(100% - 2rem)', height: '100%' }"
                responsive-layout="scroll"
                :striped-rows="true"
                filter-display="row"
                :filters.sync="filters"
                :selection="assetSelection"
                selection-mode="multiple"
                :meta-key-selection="false"
                :row-hover="true"
                :select-all="isCheckSelectAll"
                :loading="$apollo.$loading"
                @filter="onFiltering"
                @row-select="onSelectAlertAsset"
                @row-unselect="onUnselectAlertAsset"
                @row-select-all="onSelectAllAlertAsset"
                @row-unselect-all="onUnselectAllAlertAsset"
            >
                <template #empty>
                    <span>선택한 그룹의 자산이 없습니다</span>
                </template>
                <Column
                    selection-mode="multiple"
                    :header-style="{ width: '3em' }"
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '3em',
                        'justify-content': 'center'
                    }"
                >
                </Column>
                <Column
                    :header-style="{ width: '50px' }"
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '50px',
                        'justify-content': 'center'
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
                                    commStatus(
                                        slotProps.data.INTERFACE.CURR_STATUS
                                    )
                                "
                            ></Badge>
                        </Avatar>
                    </template>
                </Column>
                <Column
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '20%',
                        'justify-content': 'start'
                    }"
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
                </Column>
                <Column
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '20%',
                        'justify-content': 'start'
                    }"
                    field="CUST_HIER_ID_P"
                    filter-field="CUST_HIER_ID_P"
                    header="위치"
                    :show-filter-menu="false"
                >
                    <template #body="slotProps">
                        {{
                            accountCustomHierLabel(
                                slotProps.data.CUST_HIER_ID_P
                            )
                        }}
                    </template>
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
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '20%',
                        'justify-content': 'start'
                    }"
                    field="PRODUCT.ASSET_CD"
                    header="자산분류"
                    :show-filter-menu="false"
                >
                    <template #body="slotProps">
                        {{ assetCodeLabel(slotProps.data.PRODUCT.ASSET_CD) }}
                    </template>
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
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '20%',
                        'justify-content': 'start'
                    }"
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
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '20%',
                        'justify-content': 'start'
                    }"
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
                <Column
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '4rem',
                        'justify-content': 'center'
                    }"
                >
                    <template #body="slotProps">
                        <Button
                            icon="pi pi-search"
                            :disabled="
                                isDisabledDetailButton(slotProps.data.ID)
                            "
                            @click="onShowDetailPanel(slotProps.data)"
                        />
                    </template>
                </Column>
            </DataTable>
        </div>
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

interface OpNotiAsset {
    [index: string]: number;
    OP_ID: number;
    ASSET_ID: number;
    IS_NOTI_COMM: number;
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
    [index: string]: number | string | INTERFACE | PRODUCT;
    ID: number;
    PRODUCT_ID: number;
    NAME: string;
    CUST_HIER_ID_P: number;
    CUST_HIER_ID_C: number;
    IS_USE_INTF: number;
    INTERFACE: INTERFACE;
    PRODUCT: PRODUCT;
}

@Component<OperatorAlertAsset>({
    props: {
        operatorId: {
            type: Number,
            default: null
        },
        applyButtonDisabled: Boolean
    },
    apollo: {
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
            prefetch: false,
            result({ loading, data }) {
                if (!loading) {
                    const { Assets } = data;

                    if (Assets) {
                        this.refreshData();
                    }
                }
            }
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
        alertAssetList: {
            query: gql`
                query ($OP_ID: Int!) {
                    OperatorNotificationAssets(OP_ID: $OP_ID) {
                        OP_ID
                        ASSET_ID
                        IS_NOTI_COMM
                    }
                }
            `,
            skip() {
                return (
                    this.$props.operatorId === -1 || this.assetList.length === 0
                );
            },
            variables() {
                return {
                    OP_ID: this.$props.operatorId
                };
            },
            update: ({ OperatorNotificationAssets }) =>
                OperatorNotificationAssets,
            result({ loading, data }) {
                if (!loading) {
                    const { OperatorNotificationAssets } = data;

                    if (OperatorNotificationAssets) {
                        this.initAssetSelection(OperatorNotificationAssets);
                    }
                }
            }
        }
    },
    watch: {
        assetSelection: {
            deep: true,
            handler(selected: any) {
                this.compareAlertSelection(selected);
            }
        }
    }
})
export default class OperatorAlertAsset extends Vue {
    $refs!: {
        operatorAlertSensorList: OperatorAlertSensorList;
    };

    treeType: string = '';
    treeKeys: Array<any> = [];

    assetList: Array<ASSET> = [];
    pdAssetCode: Array<PredefinedAssetCode> = [];
    accountCustomHierByPosition: Array<AccountCustomHier> = [];

    alertAssetList: Array<OpNotiAsset> = [];
    insertAssets: Array<OpNotiAsset> = [];
    deleteAssets: Array<OpNotiAsset> = [];

    assetSelection: Array<any> | null = null;
    isCheckSelectAll: boolean | null = null;
    filterdAssets: Array<any> = [];

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

    get alertAssetListToRender(): Array<OpNotiAsset> {
        return this.alertAssetList.filter((l: OpNotiAsset) =>
            this.assetList.some((a: ASSET) => Number(a.ID) === l.ASSET_ID)
        );
    }

    mounted() {
        this.addFilterService();
    }

    refreshData() {
        // by shkoh 20220823: 알람자산에서 데이터를 새로 그릴 때마다 초기화해야할 데이터 정보는 많다
        this.$emit('update:applyButtonDisabled', true);

        this.assetSelection = null;
        this.filterdAssets = [];

        this.insertAssets.splice(0, this.insertAssets.length);
        this.deleteAssets.splice(0, this.deleteAssets.length);

        this.$apollo.queries.alertAssetList.refresh();

        this.$refs.operatorAlertSensorList.refreshData();
    }

    updateOperatorAlertAsset() {
        this.searchingAlertSelection();

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ADD: [ac_op_noti_asset_input!]
                        $REMOVE: [ac_op_noti_asset_input!]
                    ) {
                        AddOperatorNotiAssets(ADD: $ADD)
                        DeleteOperatorNotiAssets(REMOVE: $REMOVE)
                    }
                `,
                variables: {
                    ADD: this.insertAssets,
                    REMOVE: this.deleteAssets
                }
            })
            .then(() => {
                this.refreshData();

                this.$toast.add({
                    severity: 'info',
                    summary: '담당자 알림자산 설정 완료',
                    detail: `알림설정 정보 변경`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '담당자 알림자산 설정 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onSelectAlertAsset({ originalEvent: { originalEvent }, data, type }: any) {
        if (type === 'checkbox') {
            // by shkoh 20220819: row 클릭 시, select 기능을 활성화했기 때문에, checkbox를 클릭하면 동시에 row까지 선택이 되어 버리는 문제가 발생하여 해당 기능을 막는다
            (originalEvent as PointerEvent).stopPropagation();
        }

        if (this.assetSelection) {
            this.assetSelection.push(data);
        } else {
            this.assetSelection = [data];
        }
    }

    onUnselectAlertAsset({
        originalEvent: { originalEvent },
        data,
        type
    }: any) {
        if (type === 'checkbox') {
            // by shkoh 20220819: row 클릭 시, select 기능을 활성화했기 때문에, checkbox를 클릭하면 동시에 row까지 선택이 되어 버리는 문제가 발생하여 해당 기능을 막는다
            (originalEvent as PointerEvent).stopPropagation();
        }

        if (this.assetSelection) {
            const idx = this.assetSelection.findIndex(
                (s: any) => s.ID === data.ID
            );
            this.assetSelection.splice(idx, 1);

            if (this.assetSelection.length === 0) {
                this.assetSelection = null;
            }
        }
    }

    onSelectAllAlertAsset({ data }: any) {
        if (this.assetSelection) {
            for (const d of data) {
                const has = this.assetSelection.includes(d);

                if (!has) {
                    this.assetSelection.push(d);
                }
            }
        } else {
            this.assetSelection = [...data];
        }
    }

    onUnselectAllAlertAsset() {
        if (this.assetSelection) {
            if (this.filterdAssets.length === 0) {
                this.assetSelection = null;
            } else {
                for (const f of this.filterdAssets) {
                    const idx = this.assetSelection.findIndex(
                        (s: any) => s.ID === f.ID
                    );

                    this.assetSelection.splice(idx, 1);
                }
            }
        }
    }

    compareAlertSelection(data: Array<any> | null) {
        this.$emit('update:applyButtonDisabled', true);

        if (data === null && this.alertAssetListToRender.length > 0) {
            this.$emit('update:applyButtonDisabled', false);
        } else if (Array.isArray(data)) {
            if (data.length !== this.alertAssetListToRender.length) {
                this.$emit('update:applyButtonDisabled', false);
            } else {
                for (const datum of data) {
                    const is = this.alertAssetListToRender.some(
                        (a) => a.ASSET_ID === Number(datum.ID)
                    );
                    if (!is) {
                        this.$emit('update:applyButtonDisabled', false);
                        return;
                    }
                }
            }
        }
    }

    searchingAlertSelection() {
        // by shkoh 20220822: 선택한 Asset 데이터의 추가
        if (this.assetSelection) {
            for (const s of this.assetSelection) {
                const is = this.alertAssetListToRender.find(
                    (l: OpNotiAsset) => l.ASSET_ID === Number(s.ID)
                );

                if (!is) {
                    this.insertAssets.push({
                        OP_ID: this.$props.operatorId,
                        ASSET_ID: Number(s.ID),
                        IS_NOTI_COMM: 1
                    });
                }
            }
        }

        // by shkoh 20220822: 기존 선택한 Asset 데이터의 삭제
        for (const l of this.alertAssetListToRender) {
            const is = this.assetSelection?.find(
                (s: any) => Number(s.ID) === l.ASSET_ID
            );

            if (!is) {
                this.deleteAssets.push({
                    OP_ID: this.$props.operatorId,
                    ASSET_ID: Number(l.ASSET_ID),
                    IS_NOTI_COMM: 1
                });
            }
        }
    }

    initAssetSelection(list: Array<OpNotiAsset>) {
        const selected_asset = this.assetList.filter((item: ASSET) => {
            return list.some((l) => l.ASSET_ID === Number(item.ID));
        });

        if (selected_asset.length === 0) {
            this.assetSelection = null;
        } else {
            this.assetSelection = selected_asset;
        }
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

    onSelectAssetTreeNode({
        type,
        treeKeys
    }: {
        type: string;
        treeKeys: Array<any>;
    }) {
        this.treeType = type;
        this.treeKeys = treeKeys;
    }

    assetCodeLabel(code: string) {
        const ac = this.pdAssetCode.find(
            (c: PredefinedAssetCode) => c.CODE === code
        );
        return ac ? (ac.ALIAS.length > 0 ? ac.ALIAS : ac.NAME) : '설정안됨';
    }

    accountCustomHierLabel(tid: number) {
        const hier = this.accountCustomHierByPosition.find(
            (p: AccountCustomHier) => p.TID === tid
        );
        return hier ? hier.NAME : '설정안됨';
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

    isDisabledDetailButton(id: number) {
        if (this.assetSelection === null || this.assetSelection.length === 0)
            return true;

        return !this.assetSelection.some((a) => a.ID === id);
    }

    onFiltering({ filteredValue }: any) {
        if (filteredValue.length === 0) {
            this.isCheckSelectAll = false;
        } else {
            this.isCheckSelectAll = null;
        }

        this.filterdAssets = filteredValue;
    }

    onShowDetailPanel(data: ASSET) {
        this.detailAssetId = Number(data.ID);
        this.detailAssetName = data.NAME;
        this.showDialog = true;
    }
}
</script>

<style lang="scss" scoped>
#i-operator-alert-asset {
    margin: -1rem;
    height: calc(100vh - var(--header-height) - 72px - 20px - 2px);

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

        .i-lvl-null {
            opacity: 0.3;
        }
    }
}
</style>
