<template>
    <div id="asset-add-dialog-product">
        <div class="p-d-flex" :style="{ height: '100%' }">
            <Card class="p-col-fixed i-col-width">
                <template #header> 자산종류 선택 </template>
                <template #content>
                    <asset-type-tree
                        :style="{ height: '100%' }"
                        @select="onSelectAssetTypeTreeNode"
                    />
                </template>
            </Card>
            <Card
                v-if="assetType !== null"
                class="p-col-fixed i-col-width p-mx-1"
            >
                <template #header> 제품모델 선택 </template>
                <template #content>
                    <DataTable
                        class="p-datatable-sm p-py-3"
                        :value="products"
                        :scrollable="true"
                        scroll-height="flex"
                        data-key="ID"
                        responsive-layout="scroll"
                        :striped-rows="true"
                        selection-mode="single"
                        :table-style="{ width: '100%', height: '100%' }"
                        :selection.sync="selectedProduct"
                    >
                        <template #empty>
                            <span class="p-my-6">
                                {{ assetName }}(으)로 등록된 제품모델은 존재하지
                                않습니다
                            </span>
                        </template>

                        <Column key="ID">
                            <template #body="slotProps">
                                <div class="p-d-flex p-flex-column">
                                    <small :style="{ 'font-size': '0.8rem' }">
                                        {{ manufacturerName(slotProps.data) }}
                                    </small>
                                    <div class="i-model-name">
                                        {{ slotProps.data.NAME }}
                                    </div>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
            <div v-if="selectedProduct" class="p-col p-mt-5">
                <product-info-panel
                    :style="{ height: '100%' }"
                    :product-id="selectedProduct.ID"
                    :hierarchy-label="assetTypeHierarchyLabel"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<AssetAddDialogProduct>({
    props: {
        product: {
            type: Object,
            default: null
        }
    },
    apollo: {
        products: {
            query: gql`
                query ($ASSET_CD: String) {
                    ProductsByAssetCode(ASSET_CD: $ASSET_CD) {
                        ID
                        NAME
                        MODEL_NAME
                        INFO
                        TYPE
                        MANUFACTURER {
                            NAME
                        }
                    }
                }
            `,
            skip() {
                return this.assetType === null;
            },
            variables() {
                return {
                    ASSET_CD: this.assetType
                };
            },
            update: ({ ProductsByAssetCode }) => ProductsByAssetCode
        }
    },
    watch: {
        selectedProduct(product: any) {
            this.$emit('update:product', product);
        }
    }
})
export default class AssetAddDialogProduct extends Vue {
    assetName: string = '';
    assetType: string | null = null;
    assetTypeHierarchyLabel: string = '';

    products: Array<any> = [];
    selectedProduct: any = null;

    onSelectAssetTypeTreeNode(node: any, hierarchy_label: string) {
        this.selectedProduct = null;

        if (node.type === 'AssetCode') {
            this.assetType = node.key.split('_')[1];
            this.assetName = node.name;
            this.assetTypeHierarchyLabel = hierarchy_label;
        } else if (node.type === 'SITE') {
            this.assetType = 'ALL_PRODUCT';
            this.assetName = node.name;
            this.assetTypeHierarchyLabel = '';
        } else {
            this.assetType = null;
            this.assetName = '';
            this.assetTypeHierarchyLabel = '';
        }
    }

    manufacturerName(product: any) {
        if (product.MANUFACTURER === null) {
            return '가상자산';
        } else {
            return product.MANUFACTURER.NAME;
        }
    }
}
</script>

<style lang="scss" scoped>
#asset-add-dialog-product::v-deep {
    height: 100%;

    .i-col-width {
        width: 25%;
    }

    .p-card {
        height: 100%;
        box-shadow: none;

        .p-card-body {
            padding: 0;
            height: 100%;

            .p-card-content {
                padding: 0;
                height: 100%;
            }
        }
    }

    .i-model-name {
        color: var(--primary-color);
    }

    .p-datatable-emptymessage {
        td {
            border: none;
        }
    }
}
</style>
