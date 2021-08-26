<template>
    <div>
        <Tree
            :value="nodes"
            :filter="true"
            selection-mode="single"
            v-if="showTree"
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
            <template #addProduct>
                <Button
                    class="p-button-info p-button-sm p-py-1"
                    label="[제품] 추가"
                    icon="pi pi-plus"
                ></Button>
            </template>
        </Tree>
        <manufacturer-add-panel
            :visible-add-manufacturer-dialog.sync="showAddManufacturerDialog"
            @refresh="manufacturerTreeRefresh"
        ></manufacturer-add-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

export default Vue.extend({
    apollo: {
        nodes: {
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
            update: ({ Manufacturers }) => {
                return Manufacturers;
            },
            fetchPolicy: 'no-cache',
            result: ({ data, loading }) => {
                if (!loading) {
                    const { Manufacturers } = data;
                    for (const node of Manufacturers) {
                        if (node.hasOwnProperty('children'))
                            node.children.push({
                                type: 'addProduct',
                                selectable: false,
                            });
                    }

                    Manufacturers.push({
                        type: 'addManufacturer',
                        selectable: false,
                    });
                }
            },
        },
    },
    data: () => ({
        nodes: [] as Array<any>,
        showAddManufacturerDialog: false,
    }),
    computed: {
        showTree() {
            return this.nodes.length > 0;
        },
    },
    methods: {
        addManufacturer() {
            this.showAddManufacturerDialog = true;
        },
        manufacturerTreeRefresh() {
            this.$apollo.queries.nodes.refresh();
        },
    },
});
</script>

<style lang="scss">
.p-tree-container {
    height: calc(
        100vh - 20px - var(--header-height) - var(--tree-searching-height) -
            var(--content-padding) * 3
    );
}
</style>
