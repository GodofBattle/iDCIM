<template>
    <div id="asset-tree">
        <div class="i-tree-content">
            <i-moveable-tree
                :value="tree"
                :moveable="false"
                :filter="true"
                :expanded-keys.sync="treeExpandedKey"
                :selection-keys.sync="treeSelectedKey"
                selection-mode="single"
                :class="{ 'i-tree-border-none': !hasTreeBorder }"
                @node-select="onSelectNode"
            >
            </i-moveable-tree>
        </div>
        <div v-if="!isOverlayPanel" class="i-tree-navigation">
            <client-only>
                <tab-header-list
                    :tabs="tabList"
                    alignment="bottom"
                    :active-index.sync="selectedTabIndex"
                >
                </tab-header-list>
            </client-only>
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
    fetchOnServer: false,
    fetchKey: 'AssetTree' + new Date().getUTCMilliseconds(),
    props: {
        isOverlayPanel: {
            type: Boolean,
            default: false
        },
        hasTreeBorder: {
            type: Boolean,
            default: true
        }
    },
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
                    TYPE: this.tabList[this.selectedTabIndex].type
                };
            },
            fetchResults: false,
            fetchPolicy: 'cache-and-network',
            manual: false,
            prefetch: true,
            update: ({ Tree }) => Tree
        }
    }
})
export default class AssetTree extends Vue {
    tabList: Array<TabItem> = [
        { header: '자산분류', disabled: false, type: 'HIER03' },
        { header: 'IP', disabled: false, type: 'HIER04' },
        { header: 'IP/Port', disabled: false, type: 'HIER05' },
        { header: '담당자', disabled: false, type: 'HIER06' },
        { header: '제조사', disabled: false, type: 'HIER07' },
        { header: '제품', disabled: false, type: 'HIER08' }
    ];

    selectedTabIndex: number = 0;

    tree: Array<any> = [];
    treeExpandedKey: any = { root_0: true };
    treeSelectedKey: any = {};

    tree_keys: Array<number | string> = [];

    fetch() {
        // by shkoh 20220517: custom tree와 position tree는 사이트 설정에 의해서 사용 가능 여부를 판단함
        // by shkoh 20220517: 순서는 기본 | 위치 순서로 표시를 하기 위해서 우선 위치를 우선 놓고 진행
        if (this.$store.state.sessionStorage.ui.is_pos_tree) {
            this.tabList.splice(0, 0, {
                header: '위치',
                disabled: false,
                type: 'HIER02'
            });
        }

        if (this.$store.state.sessionStorage.ui.is_cus_tree) {
            this.tabList.splice(0, 0, {
                header: '기본',
                disabled: false,
                type: 'HIER01'
            });
        }
    }

    onSelectNode(node: any) {
        const type = this.tabList[this.selectedTabIndex].type;
        this.tree_keys = [];

        this.findKeys(node, type);
        this.$emit('select', { type, treeKeys: this.tree_keys });
    }

    findKeys(node: any, type: string) {
        const [code, id] = node.key.split('_');

        if (code === 'root') {
            return;
        }

        switch (type) {
            case 'HIER01':
            case 'HIER02':
            case 'HIER04':
            case 'HIER05':
            case 'HIER07':
            case 'HIER08': {
                this.tree_keys.push(id);
                break;
            }
            case 'HIER03': {
                this.tree_keys.push(node.key);
                if (code === 'pah') return;
                break;
            }
            case 'HIER06': {
                this.tree_keys.push(node.key);
                break;
            }
        }

        for (const child of node.children) {
            this.findKeys(child, type);
        }
    }
}
</script>

<style lang="scss" scoped>
#asset-tree::v-deep {
    .i-tree-content {
        height: calc(100% - 38px);

        .p-tree {
            height: 100%;
        }

        .i-tree-border-none {
            .p-tree {
                border: none;
            }
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
