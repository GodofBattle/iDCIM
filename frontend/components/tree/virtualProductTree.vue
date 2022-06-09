<template>
    <div id="i-virtual-product-tree">
        <Tree
            :filter="true"
            :value="virtualProducts"
            selection-mode="single"
            @node-select="onSelectTreeNode"
        >
            <template #Product="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-share-alt p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">{{ slotProps.node.label }}</div>
                </div>
            </template>
            <template #addVirtualProduct="slotProps">
                <Button
                    class="p-button-info p-button-sm p-py-1"
                    label="[가상제품] 추가"
                    icon="pi pi-plus"
                    @click="addVirtualProduct(slotProps.node)"
                ></Button>
            </template>
        </Tree>
        <virtual-product-add-dialog
            :visible.sync="showAddVirtualProductDialog"
            @refresh="treeRefresh"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

@Component<VirtualProductTree>({
    apollo: {
        virtualProducts: {
            query: gql`
                query {
                    VirtualProducts {
                        ID
                        NAME
                        key: ID
                        label: NAME
                        type: TYPE
                    }
                }
            `,
            fetchPolicy: 'cache-and-network',
            prefetch: false,
            update({ VirtualProducts }) {
                this.insertAddButton(VirtualProducts);
                return VirtualProducts;
            }
        }
    }
})
export default class VirtualProductTree extends Vue {
    virtualProducts: Array<any> = [];

    showAddVirtualProductDialog: boolean = false;

    mounted() {
        eventBus.$on('refreshVirtualProductTree', () => {
            this.treeRefresh();
        });
    }

    beforeDestroy() {
        eventBus.$off('refreshVirtualProductTree');
    }

    treeRefresh() {
        this.$apollo.queries.virtualProducts.refresh();
    }

    onSelectTreeNode(node: any) {
        this.$emit('select', { type: node.type, id: Number(node.key) });
    }

    insertAddButton(data: Array<any>) {
        if (!data.some((datum: any) => datum.type === 'addVirtualProduct')) {
            data.push({
                type: 'addVirtualProduct',
                selectable: false
            });
        }
    }

    addVirtualProduct() {
        this.showAddVirtualProductDialog = true;
    }
}
</script>

<style lang="scss" scoped>
#i-virtual-product-tree::v-deep {
    .p-tree {
        height: 100%;
    }

    .p-tree-container {
        height: calc(100% - 2rem);
    }
}
</style>
