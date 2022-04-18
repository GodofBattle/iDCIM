<template>
    <div id="setting-custom-tree" :disabled="disabled">
        <i-moveable-tree
            :value="customTree"
            :filter="true"
            :moveable="true"
            :disabled="disabled"
            selectionMode="single"
            :selection-keys.sync="selectionKeys"
            :expanded-keys.sync="treeExpandedKey"
            :addable-type="addableType"
            :moveable-type="moveableType"
            @move-tree="moveCustomTree"
            @insert-tree="moveCustomTree"
            @node-select="onNodeSelect"
            @node-unselect="onNodeUnselect"
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
        </i-moveable-tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<SettingCustomTree>({
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        selectedNodeKey: {
            type: String,
            default: null,
        },
        selectedNode: {
            type: Object,
            default: null,
        },
    },
    watch: {
        selectionKeys(_new_key) {
            this.$emit('update:selectedNodeKey', null);

            for (const [key, value] of Object.entries(_new_key)) {
                if (value) {
                    this.$emit('update:selectedNodeKey', key);
                }
            }
        },
    },
    apollo: {
        customTree: {
            query: gql`
                fragment customTreeFields on AssetTree {
                    key
                    label
                    order
                    parent_key
                    type
                    manipulable
                }

                query {
                    CustomTree {
                        ...customTreeFields
                        children {
                            ...customTreeFields
                            children {
                                ...customTreeFields
                                children {
                                    ...customTreeFields
                                    children {
                                        ...customTreeFields
                                        children {
                                            ...customTreeFields
                                            children {
                                                ...customTreeFields
                                                children {
                                                    ...customTreeFields
                                                    children {
                                                        ...customTreeFields
                                                        children {
                                                            ...customTreeFields
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
            fetchResults: true,
            fetchPolicy: 'no-cache',
            manual: false,
            prefetch: false,
            update({ CustomTree }) {
                return CustomTree;
            },
        },
    },
})
export default class SettingCustomTree extends Vue {
    customTree: Array<any> = [];

    treeExpandedKey: any = { root_0: true };
    addableType = { SITE: true, CUSTOM: true };
    moveableType = { CUSTOM: true };

    selectionKeys: null | object = null;

    refresh(key: string | undefined) {
        this.$apollo.queries.customTree.refresh();

        if (key) {
            this.treeExpandedKey[key] = true;

            Object.defineProperty(this.selectionKeys, key, {
                value: true,
                configurable: true,
                enumerable: true,
                writable: true,
            });
        } else {
            this.selectionKeys = {};
        }
    }

    changeKey(key: string) {
        if (this.selectionKeys) {
            this.selectionKeys = {};
        }
    }

    onNodeSelect(node: any) {
        this.$emit('update:selectedNode', node);
    }

    onNodeUnselect(node: any) {
        this.$emit('update:selectedNode', null);
    }

    moveCustomTree(target: any, dest: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        MoveCustomTreeNode(
                            key: "${target.key}"
                            parent_key: "${target.parent_key}"
                            order: ${target.order}
                        )
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'info',
                    summary: '사용자트리 위치 변경 완료',
                    detail: `${dest.label} >> ${target.label}`,
                    life: 1800,
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '사용자트리 위치 변경 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }
}
</script>

<style lang="scss" scoped>
#setting-custom-tree::v-deep {
    .p-tree {
        border: none;
    }

    .p-tree-container {
        height: calc(
            100vh - 16px - 28px - var(--header-height) - 30px - 29px - 2rem
        );

        margin: 0 0.3rem;
    }
}
</style>