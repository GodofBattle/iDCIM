<template>
    <div id="operator-group-tree">
        <Tree
            :value="trees"
            selection-mode="single"
            :filter="true"
            :expanded-keys.sync="expandedKeys"
            :selection-keys.sync="selectionKey"
        >
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
            <template #OPERATOR="slotProps">
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
            <template #ADDOP="slotProps">
                <Button
                    class="p-button-info p-button-sm p-py-1"
                    :label="slotProps.node.label"
                    icon="pi pi-plus"
                    @click="addOperator(slotProps.node.parent_key)"
                />
            </template>
        </Tree>
        <add-account-user-panel
            :visible.sync="isVisibleAddUser"
            :user-group-id="groupId"
            code="PERM03"
            @add="refreshTree"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface Tree {
    [index: string]: number | string | boolean | null | Array<Tree>;
    key: string;
    name: string;
    label: string;
    order: number;
    parent_key: string;
    type: string;
    manipulable: boolean;
    selectable: boolean;
    children: null | Array<Tree>;
}

@Component<OperatorGroupTree>({
    apollo: {
        trees: {
            query: gql`
                fragment treeGroupFields on AssetTree {
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
                    OperatorGroupTree {
                        ...treeGroupFields
                        children {
                            ...treeGroupFields
                        }
                    }
                }
            `,
            prefetch: false,
            update({ OperatorGroupTree }) {
                return this.insertAddButtons(OperatorGroupTree);
            }
        }
    }
})
export default class OperatorGroupTree extends Vue {
    trees: Array<Tree> = [];

    expandedKeys: object = {};
    selectionKey: object = {};

    isVisibleAddUser: boolean = false;

    groupId: null | number = null;

    refreshTree() {
        this.$apollo.queries.trees.refresh();
    }

    insertAddButtons(nodes: Array<Tree>) {
        nodes.forEach((node: Tree) => {
            this.$set(this.expandedKeys, node.key, true);

            if (
                node.type === 'GROUP' &&
                !node.children?.some((n: Tree) => n.type === 'ADDOP')
            ) {
                node.children?.push({
                    key: `add_${node.key}`,
                    name: `[${node.label}] 계정 추가`,
                    label: `[${node.label}] 계정 추가`,
                    order: node.children ? node.children.length : 1,
                    parent_key: node.key,
                    type: 'ADDOP',
                    manipulable: false,
                    selectable: false,
                    children: null
                });
            }
        });

        return nodes;
    }

    addOperator(key: string) {
        const [type, id] = key.split('_');
        this.groupId = Number(id);

        this.isVisibleAddUser = true;
    }
}
</script>

<style lang="scss" scoped>
#operator-group-tree::v-deep {
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
