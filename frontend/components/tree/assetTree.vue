<template>
    <div id="asset-tree">
        <div class="i-tree-content">
            <i-moveable-tree
                :value="tree"
                :moveable="false"
                :filter="true"
                selection-mode="single"
            >
            </i-moveable-tree>
        </div>
        <div class="i-tree-navigation">
            <tab-header-list
                :tabs="tabList"
                alignment="bottom"
                :active-index.sync="selectedTabIndex"
            >
            </tab-header-list>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type TabItem = {
    [index: string]: string | boolean;
    header: string;
    disabled: boolean;
    type: string;
};

@Component<AssetTree>({
    apollo: {
        tree: {
            query: gql`
                fragment treeFields on AssetTree {
                    key
                    label
                    order
                    parent_key
                    type
                    manipulable
                }

                query Tree($TYPE: String!) {
                    Tree(TYPE: $TYPE) {
                        ...treeFields
                        children {
                            ...treeFields
                            children {
                                ...treeFields
                                children {
                                    ...treeFields
                                    children {
                                        ...treeFields
                                        children {
                                            ...treeFields
                                            children {
                                                ...treeFields
                                                children {
                                                    ...treeFields
                                                    children {
                                                        ...treeFields
                                                        children {
                                                            ...treeFields
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
            variables() {
                return {
                    TYPE: this.tabList[this.selectedTabIndex].type,
                };
            },
            fetchResults: true,
            fetchPolicy: 'no-cache',
            manual: false,
            prefetch: false,
            update: ({ Tree }) => Tree,
        },
    },
})
export default class AssetTree extends Vue {
    tabList: Array<TabItem> = [
        { header: '기본', disabled: false, type: 'BASIC' },
        { header: '위치', disabled: false, type: 'POS' },
        { header: '자산분류', disabled: false, type: 'KIND' },
        { header: 'IP', disabled: false, type: 'IP' },
        { header: 'IP/Port', disabled: false, type: 'PORT' },
        { header: '담당자', disabled: false, type: 'WORKER' },
        { header: '제조사', disabled: false, type: 'COMPANY' },
        { header: '제품별', disabled: false, type: 'MODEL' },
    ];

    selectedTabIndex: number = 0;

    tree: Array<any> = [];
}
</script>

<style lang="scss" scoped>
#asset-tree::v-deep {
    .i-tree-content {
        height: calc(100% - 38px);

        .p-tree {
            border-bottom: none;
            height: 100%;
        }

        .p-tree-container {
            height: calc(100% - 2rem);
        }
    }

    .i-tree-navigation {
        margin-top: -1px;
    }
}
</style>