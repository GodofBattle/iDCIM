<template>
    <div id="account-tree">
        <Tree
            :value="accountTrees"
            :expanded-keys.sync="expandedKeys"
            :selection-keys.sync="selectionKeys"
            selection-mode="single"
        >
            <template #ROOT_MANAGER="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-users p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{ slotProps.node.label }}
                    </div>
                </div>
            </template>
            <template #ROOT_GROUP="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-globe p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{ slotProps.node.label }}
                    </div>
                </div>
            </template>
            <template #MANAGER="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-user p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{ slotProps.node.name }} | {{ slotProps.node.label }}
                    </div>
                </div>
            </template>
            <template #GROUP="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-desktop p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{ slotProps.node.label }}
                    </div>
                </div>
            </template>
            <template #addManager="slotProps">
                <Button
                    class="p-button-info p-button-sm p-py-1"
                    :label="slotProps.node.label"
                    icon="pi pi-plus"
                    @click="addManager(slotProps.node)"
                />
            </template>
            <template #addGroup="slotProps">
                <Button
                    class="p-button-success p-button-sm p-py-1"
                    :label="slotProps.node.label"
                    icon="pi pi-plus"
                    @click="addGroup(slotProps.node)"
                />
            </template>
        </Tree>
        <account-tree-add-manager-panel :visible.sync="isVisibleAddManager" />
        <account-tree-add-op-group-panel :visible.sync="isVisibleAddOpGroup" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';

interface AssetTree {
    [index: string]: number | string | boolean | null | Array<AssetTree>;
    key: string;
    label: string;
    order: number;
    parent_key: string;
    type: string;
    manipulable: boolean;
    selectable: boolean;
    children: null | Array<AssetTree>;
}

@Component<AccountTree>({
    apollo: {
        accountTrees: {
            query: gql`
                fragment treeAccountFields on AssetTree {
                    key
                    name
                    label
                    order
                    parent_key
                    type
                    manipulable
                    selectable
                }

                query {
                    AccountTreeToSet {
                        ...treeAccountFields
                        children {
                            ...treeAccountFields
                        }
                    }
                }
            `,
            prefetch: false,
            update({ AccountTreeToSet }) {
                return this.insertAddButtons(AccountTreeToSet);
            }
        }
    }
})
export default class AccountTree extends Vue {
    accountTrees: Array<AssetTree> = [];

    selectionKeys: object = {};
    expandedKeys: object = {
        manager: true,
        group: true
    };

    isVisibleAddManager: boolean = false;
    isVisibleAddOpGroup: boolean = false;

    mounted() {
        eventBus.$on('refreshAccountTree', () => {
            this.treeRefresh();
        });
    }

    beforeDestroy() {
        eventBus.$off('refreshAccountTree');
    }

    treeRefresh() {
        this.$apollo.queries.accountTrees.refresh();
    }

    insertAddButtons(nodes: Array<AssetTree>) {
        nodes.forEach((node: AssetTree) => {
            if (
                node.key === 'manager' &&
                !node.children?.some((n: AssetTree) => n.key === 'addManager')
            ) {
                node.children?.push({
                    key: 'addManager',
                    label: '[관리자] 추가',
                    order: node.children ? node.children.length : 1,
                    parent_key: 'manager',
                    type: 'addManager',
                    manipulable: false,
                    selectable: false,
                    children: null
                });
            }

            if (
                node.key === 'group' &&
                !node.children?.some((n: AssetTree) => n.key === 'addGroup')
            ) {
                node.children?.push({
                    key: 'addGroup',
                    label: '[운영그룹] 추가',
                    order: node.children ? node.children.length : 1,
                    parent_key: 'group',
                    type: 'addGroup',
                    manipulable: false,
                    selectable: false,
                    children: null
                });
            }
        });

        return nodes;
    }

    addManager(node: AssetTree) {
        this.isVisibleAddManager = true;
    }

    addGroup(node: AssetTree) {
        this.isVisibleAddOpGroup = true;
    }
}
</script>

<style lang="scss" scoped>
#account-tree::v-deep {
    .p-tree {
        height: 100%;
        .p-tree-container {
            height: calc(100% - 2rem);

            .p-treenode-content:focus {
                outline: none;
                box-shadow: none;
            }

            .p-treenode-content.p-treenode-selectable:focus {
                outline: 0 none;
                outline-offset: 0;
                box-shadow: inset 0 0 0 0.15rem var(--focus-ring);
            }
        }
    }
}
</style>
