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
        </Tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

@Component({
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
                console.info(PredefinedInterfaces);
                return PredefinedInterfaces;
            }
        }
    }
})
export default class InterfaceTree extends Vue {
    interfaces: Array<any> = [];

    mounted() {
        eventBus.$on('refreshInterfaceTree', () => {
            this.treeRefresh();
        });
    }

    beforeDestroy() {
        eventBus.$off('refreshInterfaceTree');
    }

    onSelect(node: any): void {
        if (node.type === 'PredefineInterface') {
            console.info({ type: node.type, id: Number(node.key) });
        }
    }

    treeRefresh() {
        console.info('treeRefresh');
    }
}
</script>

<style lang="scss" scoped>
#interface-tree {
    .p-tree-container {
        height: calc(
            100vh - 20px - var(--header-height) - var(--tree-searching-height) -
                var(--content-padding) * 3
        );
    }
}
</style>
