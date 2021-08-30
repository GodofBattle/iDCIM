<template>
    <!-- <div v-show="showTree"> -->
    <div>
        <Tree
            :value="nodes"
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
import { Map, List, fromJS } from 'immutable';

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
            manual: true,
            update: ({ Manufacturers }) => {
                console.info('update');
                return Manufacturers;
            },

            prefetch: false,
            fetchPolicy: 'network-only',
            result({ data, loading }) {
                if (!loading) {
                    console.info(data);

                    const manufacturer = fromJS(data.Manufacturers);
                    console.info(manufacturer.getIn([]));

                    manufacturer.forEach((node: Map<String, any>) => {
                        console.info(node.get('children'));
                    });

                    const m2 = manufacturer.withMutations((list: any) => {
                        list.push({
                            type: 'addManufacturer',
                            selectable: false
                        });
                    });
                    console.info(manufacturer);

                    this.nodes = m2.toJS();
                    console.info(this.nodes);

                    // const manufacuturers: any[] = List(
                    //     data.Manufacturers
                    // ).toArray();

                    // for (const node of manufacuturers) {
                    //     if (node.hasOwnProperty('children'))
                    //         node.children.push({
                    //             type: 'addProduct',
                    //             selectable: false
                    //         });
                    // }

                    // manufacuturers.push({
                    //     type: 'addManufacturer',
                    //     selectable: false
                    // });

                    // this.nodes = manufacuturers;
                }
            }
        }
    },
    data: () => ({
        nodes: [] as Array<any>,
        showAddManufacturerDialog: false
    }),
    computed: {
        // showTree() {
        //     console.info('showTree');
        //     return this.nodes.length > 0;
        // }
    },
    methods: {
        addManufacturer() {
            this.showAddManufacturerDialog = true;
        },
        manufacturerTreeRefresh() {
            this.$apollo.queries.nodes.refresh();
        },
        onSelect(node: any) {
            this.$emit('select', { type: node.type, id: node.key });
        }
    }
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
