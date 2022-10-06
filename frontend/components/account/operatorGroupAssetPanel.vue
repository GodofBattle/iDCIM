<template>
    <div v-if="!$apollo.$loading" id="i-operator-group-asset-panel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center p-text-bold i-title">
                {{ title }}
            </div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-check"
                    label="적용"
                    :disabled="isDisabledApplyButton"
                />
            </div>
        </div>
        <Divider />
        <div class="p-d-flex i-operator-group-asset-content">
            <div
                class="p-col-fiexed"
                :style="{ width: 'var(--tree-width)', height: '100%' }"
            >
                <asset-tree
                    :style="{ height: '100%' }"
                    :has-tree-border="false"
                    @select="onSelectAssetTreeNode"
                />
            </div>
            <div
                class="p-col-fiexed p-pt-4"
                :style="{ width: 'calc(100% - var(--tree-width))' }"
            >
                <DataTable
                    :value="assetList"
                    data-key="ID"
                    class="p-datatable-sm"
                    :scrollable="true"
                    scroll-height="flex"
                    :table-style="{
                        width: 'calc(100% - 2rem)',
                        height: '100%'
                    }"
                    responsive-layout="scroll"
                    :striped-rows="true"
                    selection-mode="multiple"
                    :meta-key-selection="false"
                    :row-hover="true"
                    :loading="$apollo.$loading"
                    :selection="assetSelection"
                    :select-all="isCheckSelectAll"
                    filter-display="row"
                    :filters.sync="filters"
                    @filter="onFiltering"
                    @row-select="onSelectAsset"
                    @row-unselect="onUnselectAsset"
                    @row-select-all="onSelectAllAsset"
                    @row-unselect-all="onUnselectAllAsset"
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
                    />
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
                                            ? slotProps.data.INTERFACE
                                                  .CURR_LEVEL
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
                            {{
                                assetCodeLabel(slotProps.data.PRODUCT.ASSET_CD)
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
                        field="PRODUCT.MANUFACTURER.NAME"
                        header="제조사"
                        :show-filter-menu="false"
                    >
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
                    </Column>
                    <Column
                        :styles="{
                            'flex-grow': 1,
                            'flex-basis': '20%',
                            'justify-content': 'start'
                        }"
                        header="자산담당자(정/부)"
                        :show-filter-menu="false"
                    >
                        <template #body="slotProps">
                            {{
                                managerLabel(
                                    slotProps.data.OP_ID_M,
                                    slotProps.data.OP_ID_M
                                )
                            }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import { FilterMatchMode, FilterService } from 'primevue/api';
import Component from '@/plugins/nuxt-class-component';

interface OperatorGroup {
    [index: string]: string;
    NAME: string;
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

interface Operator {
    [index: string]: string | number;
    ID: number;
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
    [index: string]: number | string | INTERFACE | PRODUCT;
    ID: number;
    PRODUCT_ID: number;
    NAME: string;
    CUST_HIER_ID_P: number;
    CUST_HIER_ID_C: number;
    OP_ID_M: number;
    OP_ID_S: number;
    IS_USE_INTF: number;
    INTERFACE: INTERFACE;
    PRODUCT: PRODUCT;
}

interface UserGroupAssetIds {
    [index: string]: number;
    ID: number;
    USER_GROUP_ID: number;
    ASSET_ID: number;
}

@Component<OperatorGroupAssetPanel>({
    props: {
        groupId: Number
    },
    apollo: {
        operatorGroup: {
            query: gql`
                query ($ID: Int!) {
                    OperatorGroup(ID: $ID) {
                        NAME
                    }
                }
            `,
            skip() {
                return this.$props.groupId < 0;
            },
            variables() {
                return {
                    ID: this.$props.groupId
                };
            },
            update: ({ OperatorGroup }) => OperatorGroup
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
                        OP_ID_M
                        OP_ID_S
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
            prefetch: false
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
        operators: {
            query: gql`
                query {
                    Operators {
                        ID
                        NAME
                    }
                }
            `,
            update: ({ Operators }) => Operators
        },
        userGroupAssets: {
            query: gql`
                query ($USER_GROUP_ID: Int!) {
                    UserGroupAssets(USER_GROUP_ID: $USER_GROUP_ID) {
                        ID
                        USER_GROUP_ID
                        ASSET_ID
                    }
                }
            `,
            skip() {
                return this.$props.groupId < 0 || this.assetList.length === 0;
            },
            variables() {
                return {
                    USER_GROUP_ID: this.$props.groupId
                };
            },
            update: ({ UserGroupAssets }) => UserGroupAssets,
            result({ loading, data }) {
                if (!loading) {
                    const { UserGroupAssets } = data;
                    if (UserGroupAssets) {
                        this.initAssetSelection(UserGroupAssets);
                    }
                }
            }
        }
    }
})
export default class OperatorGroupAssetPanel extends Vue {
    operatorGroup: OperatorGroup = {
        NAME: ''
    };

    treeType: string = '';
    treeKeys: Array<any> = [];

    assetList: Array<ASSET> = [];

    pdAssetCode: Array<PredefinedAssetCode> = [];
    accountCustomHierByPosition: Array<AccountCustomHier> = [];
    operators: Array<Operator> = [];

    assetSelection: Array<ASSET> | null = null;
    filteredAssets: Array<ASSET> = [];
    isCheckSelectAll: boolean | null = null;

    userGroupAssets: Array<UserGroupAssetIds> = [];

    filters = {
        NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
        CUST_HIER_ID_P: { value: null, matchMode: 'POSITION' },
        'PRODUCT.ASSET_CD': {
            value: null,
            matchMode: 'ASSET_TYPE'
        }
    };

    mounted() {
        this.addFilterService();
    }

    addFilterService() {
        if (FilterService.register) {
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

    managerLabel(id_m: number, id_s: number) {
        const m = this.operators.find((o: Operator) => Number(o.ID) === id_m);
        const s = this.operators.find((o: Operator) => Number(o.ID) === id_s);

        return `${m ? m.NAME : ''} / ${s ? s.NAME : ''}`;
    }

    onSelectAsset({ originalEvent: { originalEvent }, data, type }: any) {
        if (type === 'checkbox') {
            (originalEvent as PointerEvent).stopPropagation();
        }

        if (this.assetSelection) {
            this.assetSelection.push(data);
        } else {
            this.assetSelection = [data];
        }
    }

    onUnselectAsset({ originalEvent: { originalEvent }, data, type }: any) {
        if (type === 'checkbox') {
            (originalEvent as PointerEvent).stopPropagation();
        }

        if (this.assetSelection) {
            const idx = this.assetSelection.findIndex(
                (s: ASSET) => s.ID === data.ID
            );
            this.assetSelection.splice(idx, 1);

            if (this.assetSelection.length === 0) {
                this.assetSelection = null;
            }
        }
    }

    onSelectAllAsset({ data }: { data: Array<ASSET> }) {
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

    onUnselectAllAsset() {
        if (this.assetSelection) {
            if (this.filteredAssets.length === 0) {
                this.assetSelection = null;
            } else {
                for (const fa of this.filteredAssets) {
                    const idx = this.assetSelection.findIndex(
                        (s: ASSET) => s.ID === fa.ID
                    );
                    this.assetSelection.splice(idx, 1);
                }
            }
        }
    }

    onFiltering({ filteredValue }: { filteredValue: Array<ASSET> }) {
        if (filteredValue.length === 0) {
            this.isCheckSelectAll = false;
        } else {
            this.isCheckSelectAll = null;
        }

        this.filteredAssets = filteredValue;
    }

    initAssetSelection(list: Array<UserGroupAssetIds>) {
        const selected_assets = this.assetList.filter((a: ASSET) => {
            return list.some(
                (l: UserGroupAssetIds) => l.ASSET_ID === Number(a.ID)
            );
        });

        if (selected_assets.length === 0) {
            this.assetSelection = null;
        } else {
            this.assetSelection = selected_assets;
        }
    }

    get title(): string {
        return `${this.operatorGroup.NAME}: 운영자산 설정`;
    }

    get isDisabledApplyButton(): boolean {
        const is_disabled = true;

        return is_disabled;
    }
}
</script>

<style lang="scss" scoped>
#i-operator-group-asset-panel::v-deep {
    .i-title {
        font-size: 1.6rem;
        width: 20vw;
    }

    .i-operator-group-asset-content {
        height: calc(100vh - var(--header-height) - 72px - 2px);
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

        .i-lvl-null {
            opacity: 0.3;
        }
    }
}
</style>
