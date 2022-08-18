<template>
    <div id="i-operator-alert-asset" class="p-d-flex">
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
                :selection.sync="assetSelection"
                selection-mode="multiple"
                :meta-key-selection="false"
                :row-hover="true"
                :select-all="isCheckSelectAll"
                @filter="onFiltering"
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
import { FilterService, FilterMatchMode } from 'primevue/api';
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
        alertAssetList: {
            query: gql`
                query ($OP_ID: Int!) {
                    OperatorNotificationAsset(OP_ID: $OP_ID) {
                        OP_ID
                        ASSET_ID
                        IS_NOTI_COMM
                    }
                }
            `,
            skip() {
                return this.$props.operatorId === -1;
            },
            variables() {
                return {
                    OP_ID: this.$props.operatorId
                };
            },
            update: ({ OperatorNotificationAsset }) =>
                OperatorNotificationAsset,
            result({ loading, data }) {
                if (!loading) {
                    const { OperatorNotificationAsset } = data;

                    if (OperatorNotificationAsset) {
                        this.initAssetSelection(OperatorNotificationAsset);
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
    treeType: string = '';
    treeKeys: Array<any> = [];

    assetList: Array<any> = [];
    pdAssetCode: Array<PredefinedAssetCode> = [];
    accountCustomHierByPosition: Array<AccountCustomHier> = [];

    alertAssetList: Array<OpNotiAsset> = [];

    assetSelection: Array<any> | null = null;
    isCheckSelectAll: boolean | null = null;

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

    updateOperatorAlertAsset() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql``
            })
            .then(() => {
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

    compareAlertSelection(data: Array<any> | null) {
        this.$emit('update:applyButtonDisabled', true);

        if (data === null && this.alertAssetList.length > 0) {
            this.$emit('update:applyButtonDisabled', false);
        } else if (Array.isArray(data)) {
            if (data.length !== this.alertAssetList.length) {
                this.$emit('update:applyButtonDisabled', false);
            } else {
                for (const datum of data) {
                    const is = this.alertAssetList.some(
                        (a) => a.ASSET_ID === datum.ID
                    );
                    if (!is) {
                        this.$emit('update:applyButtonDisabled', false);
                        return;
                    }
                }
            }
        }
    }

    initAssetSelection(list: Array<OpNotiAsset>) {
        const selected_asset = this.assetList.filter((item: any) => {
            return list.some((l) => l.OP_ID === Number(item.ID));
        });

        if (selected_asset.length === 0) this.assetSelection = null;
        else this.assetSelection = selected_asset;
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
    }
}
</style>
