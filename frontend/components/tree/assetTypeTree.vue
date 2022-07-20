<template>
    <div id="i-asset-type-tree">
        <i-moveable-tree
            :value="tree"
            :filter="isFilter"
            :moveable="false"
            selection-mode="single"
            :expanded-keys="treeExpandedKeys"
            @node-select="onNodeSelect"
        >
            <template #default="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-folder-open p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{ slotProps.node.label }}
                    </div>
                </div>
            </template>
            <template #AssetCode="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-desktop p-p-1 p-mr-1"
                        style="font-size: 1.2rem; color: var(--primary-color)"
                    ></i>
                    <div class="p-p-1" style="color: var(--primary-color)">
                        {{ assetCodeLabel(slotProps.node) }}
                    </div>
                </div>
            </template>
        </i-moveable-tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<AssetTypeTree>({
    props: {
        isFilter: {
            type: Boolean,
            default: false
        }
    },
    apollo: {
        tree: {
            query: gql`
                fragment assetTreeFields on AssetTree {
                    key
                    label
                    name
                    alias
                    order
                    parent_key
                    type
                    manipulable
                }

                query {
                    AssetTree {
                        ...assetTreeFields
                        children {
                            ...assetTreeFields
                            children {
                                ...assetTreeFields
                                children {
                                    ...assetTreeFields
                                    children {
                                        ...assetTreeFields
                                        children {
                                            ...assetTreeFields
                                            children {
                                                ...assetTreeFields
                                                children {
                                                    ...assetTreeFields
                                                    children {
                                                        ...assetTreeFields
                                                        children {
                                                            ...assetTreeFields
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            update: ({ AssetTree }) => AssetTree,
            fetchPolicy: 'cache-and-network',
            prefetch: true
        }
    }
})
export default class AssetTypeTree extends Vue {
    tree: Array<any> = [];
    treeExpandedKeys: any = { root_0: true };

    hierarchy_label: string = '';

    onNodeSelect(node: any) {
        this.setHierarchy(this.tree[0], node.key);

        this.$emit('select', node, this.hierarchy_label);
    }

    assetCodeLabel(node: any) {
        if (node.alias === '') {
            return node.name;
        } else {
            node.alias;
        }
    }

    setHierarchy(node: any, target_key: string): boolean {
        if (node.children.length === 0) return false;

        const target = node.children.find((c: any) => c.key === target_key);

        if (target === undefined) {
            let has_target = false;

            for (const child of node.children) {
                has_target = this.setHierarchy(child, target_key);

                if (has_target) {
                    this.hierarchy_label = `${child.label} | ${this.hierarchy_label}`;
                    break;
                }
            }

            return has_target;
        } else {
            this.hierarchy_label = this.assetCodeLabel(target);
            return true;
        }
    }
}
</script>

<style lang="scss" scoped>
#i-asset-type-tree::v-deep {
    .p-tree {
        border: none;
        height: 100%;
    }

    .p-tree-container {
        height: calc(100%);
    }
}
</style>
