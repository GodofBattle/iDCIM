<template>
    <div id="interface-tree">
        <Tree
            :value="interfaces"
            :filter="true"
            selection-mode="single"
            @node-select="onSelect"
        >
            <template #AssetCode="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-inbox p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{
                            slotProps.node.ALIAS
                                ? slotProps.node.ALIAS
                                : slotProps.node.label
                        }}
                    </div>
                </div>
            </template>
            <template #PredefineInterface="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-share-alt p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">{{ slotProps.node.label }}</div>
                </div>
            </template>
            <template #addInterface="slotProps">
                <Button
                    class="p-button-info p-button-sm p-py-1"
                    label="[인터페이스] 추가"
                    icon="pi pi-plus"
                    @click="addInterface(slotProps.node)"
                ></Button>
            </template>
        </Tree>
        <interface-add-dialog
            :visible-add-interface-dialog.sync="showAddInterfaceDialog"
            :asset-code="assetCodeToAdding"
            :asset-code-name="assetCodeNameToAdding"
            @refresh="treeRefresh"
        ></interface-add-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

@Component<InterfaceTree>({
    apollo: {
        interfaces: {
            query: gql`
                query {
                    PredefinedInterfaces {
                        CODE
                        NAME
                        ALIAS
                        PD_ASSET_HIER_ID
                        ORDER
                        key: CODE
                        label: NAME
                        type: TYPE
                        children: PREDEFINED_INTERFACES {
                            ID
                            ASSET_CD
                            NAME
                            key: ID
                            label: NAME
                            type: TYPE
                        }
                    }
                }
            `,
            variables: {
                AssetSelectable: false
            },
            fetchResults: true,
            fetchPolicy: 'cache-and-network',
            manual: false,
            prefetch: false,
            update({ PredefinedInterfaces }) {
                this.insertAddButtons(PredefinedInterfaces);
                return PredefinedInterfaces;
            }
        }
    }
})
export default class InterfaceTree extends Vue {
    interfaces: Array<any> = [];

    showAddInterfaceDialog = false;
    assetCodeToAdding = '';
    assetCodeNameToAdding = '';

    mounted() {
        this.assetCodeToAdding = '';
        this.assetCodeNameToAdding = '';

        eventBus.$on('refreshInterfaceTree', () => {
            this.treeRefresh();
        });
    }

    beforeDestroy() {
        // by shkoh 20211005: component가 제거될 때, 기존 사용값을 초기화함
        this.assetCodeToAdding = '';
        this.assetCodeNameToAdding = '';

        eventBus.$off('refreshInterfaceTree');
    }

    onSelect(node: any): void {
        if (node.type === 'PredefineInterface') {
            this.$emit('select', {
                type: node.type,
                id: Number(node.key),
                name: node.label
            });
        }
    }

    treeRefresh() {
        this.$apollo.queries.interfaces.refresh();
    }

    insertAddButtons(data: Array<any>) {
        data.forEach((datum) => {
            if (datum.type === 'AssetCode') {
                if (
                    !datum.children.some((i: any) => i.type === 'addInterface')
                ) {
                    datum.children.push({
                        type: 'addInterface',
                        selectable: false,
                        pId: datum.key,
                        pName: datum.label
                    });
                }
            }
        });
    }

    addInterface(node: any) {
        this.assetCodeToAdding = node.pId;
        this.assetCodeNameToAdding = node.pName;
        this.showAddInterfaceDialog = true;
    }
}
</script>

<style lang="scss" scoped>
#interface-tree::v-deep .p-tree-container {
    height: calc(
        100vh - 20px - var(--header-height) - var(--tree-searching-height) -
            var(--content-padding) * 3
    );
}
</style>
