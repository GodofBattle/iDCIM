<template>
    <div id="product-tree">
        <Tree
            :value="manufacturers"
            :filter="true"
            selection-mode="single"
            @node-select="onSelect"
        >
            <template #Manufacturer="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-home p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">{{ slotProps.node.label }}</div>
                </div>
            </template>
            <template #Product="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-share-alt p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">{{ slotProps.node.label }}</div>
                </div>
            </template>
            <template #addManufacturer>
                <Button
                    class="p-button-secondary p-button-sm"
                    label="[제조사] 추가"
                    icon="pi pi-plus"
                    @click="addManufacturer"
                ></Button>
            </template>
            <template #addProduct="slotProps">
                <Button
                    class="p-button-info p-button-sm p-py-1"
                    label="[제품] 추가"
                    icon="pi pi-plus"
                    @click="addProduct(slotProps.node)"
                ></Button>
            </template>
        </Tree>
        <manufacturer-add-dialog
            :visible-add-manufacturer-dialog.sync="showAddManufacturerDialog"
            @refresh="treeRefresh"
        ></manufacturer-add-dialog>
        <product-add-dialog
            :visible-add-product-dialog.sync="showAddProductDialog"
            :manufacturer-id="manufacturerId"
            :manufacturer-name="manufacturerName"
            @refresh="treeRefresh"
        >
        </product-add-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import { eventBus } from '@/plugins/vueEventBus';

export default Vue.extend({
    apollo: {
        manufacturers: {
            query: gql`
                query {
                    Manufacturers {
                        ID
                        NAME
                        ADDR
                        PHONE
                        FAX
                        EMAIL
                        URL
                        REMARK
                        key: ID
                        label: NAME
                        type: TYPE
                        children: PRODUCTS {
                            ID
                            NAME
                            MODEL_NAME
                            INFO
                            key: ID
                            label: NAME
                            type: TYPE
                        }
                    }
                }
            `,
            fetchResults: true,
            manual: false,
            prefetch: false,
            fetchPolicy: 'cache-and-network',
            update({ Manufacturers }) {
                // by shkoh 20210902: Tree에 제조사와 제품 [추가] 버튼을 넣음
                this.insertAddButtons(Manufacturers);

                return Manufacturers;
            }
        }
    },
    data: () => ({
        manufacturers: [] as Array<any>,
        showAddManufacturerDialog: false,
        showAddProductDialog: false,
        manufacturerId: -1,
        manufacturerName: ''
    }),
    mounted() {
        eventBus.$on('refreshProductTree', () => {
            this.treeRefresh();
        });
    },
    beforeDestroy() {
        eventBus.$off('refreshProductTree');
    },
    methods: {
        addManufacturer() {
            this.showAddManufacturerDialog = true;
        },
        addProduct(node: any) {
            this.showAddProductDialog = true;
            this.manufacturerId = Number(node.pId);
            this.manufacturerName = node.pName;
        },
        treeRefresh() {
            this.$apollo.queries.manufacturers.refresh();
        },
        onSelect(node: any) {
            this.$emit('select', { type: node.type, id: Number(node.key) });
        },
        insertAddButtons(data: Array<any>) {
            // by shkoh 20210902: API 서버로부터 받은 데이터에서 제조사인 경우에 하위 노드에 [제품 추가] 버튼 생성
            data.forEach((datum) => {
                if (datum.type === 'Manufacturer') {
                    if (
                        !datum.children.some(
                            (p: any) => p.type === 'addProduct'
                        )
                    ) {
                        datum.children.push({
                            type: 'addProduct',
                            selectable: false,
                            pId: datum.key,
                            pName: datum.label
                        });
                    }
                }
            });

            // by shkoh 20210902: API 서버로부터 받은 데이터에서 마지막에 [제조사 추가] 버튼 생성
            if (!data.some((datum: any) => datum.type === 'addManufacturer')) {
                data.push({
                    type: 'addManufacturer',
                    selectable: false
                });
            }
        }
    }
});
</script>

<style lang="scss" scoped>
#product-tree::v-deep .p-tree-container {
    height: calc(
        100vh - 20px - var(--header-height) - var(--tree-searching-height) -
            var(--content-padding) * 3
    );
}
</style>
