<template>
    <div id="interface-tree">
        <Tree
            :value="interfacesToRender"
            :filter="true"
            selection-mode="single"
            :selection-keys.sync="selectionKeys"
            :expanded-keys.sync="expandedKeys"
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
    props: {
        isEditing: {
            type: Boolean,
            default: true
        },
        showOnlyParents: {
            type: Boolean,
            default: false
        },
        initSelectKeys: {
            type: Number,
            default: -1
        },
        filterCode: {
            type: String,
            default: ''
        }
    },
    watch: {
        initSelectKeys(_new_value) {
            if (_new_value === -1) {
                this.selectionKeys = {};
            } else {
                this.selectionKeys = { key: _new_value.toString() };
            }
        }
    },
    apollo: {
        interfaces: {
            query: gql`
                query PredefinedInterfaces($CODE: String) {
                    PredefinedInterfaces(CODE: $CODE) {
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
            variables() {
                return {
                    CODE:
                        this.$props.filterCode.length > 0
                            ? this.$props.filterCode
                            : null
                };
            },
            fetchResults: true,
            fetchPolicy: 'no-cache',
            manual: false,
            prefetch: false,
            update({ PredefinedInterfaces }) {
                if (this.isEditing) this.insertAddButtons(PredefinedInterfaces);
                return PredefinedInterfaces;
            },
            result({ loading, data }) {
                if (!loading) {
                    // by shoh 20220609: 필터기능이 활성화 됐을 경우에
                    if (this.$props.filterCode.length > 0) {
                        Object.defineProperty(
                            this.expandedKeys,
                            this.$props.filterCode,
                            {
                                value: true,
                                configurable: true,
                                enumerable: true,
                                writable: true
                            }
                        );
                    }
                }
            }
        }
    }
})
export default class InterfaceTree extends Vue {
    interfaces: Array<any> = [];

    showAddInterfaceDialog = false;
    assetCodeToAdding = '';
    assetCodeNameToAdding = '';

    selectionKeys: object = {};
    expandedKeys: object = {};

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
                name: node.label,
                asset_cd: node.ASSET_CD
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

    hasInterfaceWithChildren(node: any) {
        if (node) {
            let has = false;

            if (node.children && node.children.length > 0) {
                const childNodes: Array<any> = [...node.children];

                node.children = [];
                for (const childNode of childNodes) {
                    const copyChildNode: any = { ...childNode };

                    if (
                        this.hasInterfaceWithChildren(copyChildNode) ||
                        copyChildNode.type === 'PredefineInterface'
                    ) {
                        node.children.push(copyChildNode);
                        has = true;
                    }
                }
            }

            if (has) {
                return true;
            }
        }
    }

    get interfacesToRender(): Array<any> | null {
        if (this.$props.showOnlyParents) {
            return this.onlyInterfacesWithChildren;
        } else {
            return this.interfaces;
        }
    }

    get onlyInterfacesWithChildren(): Array<any> {
        const nodes: Array<any> = [];

        for (const node of this.interfaces) {
            const _node = { ...node };

            if (this.hasInterfaceWithChildren(_node)) {
                nodes.push(_node);
            }
        }

        return nodes;
    }
}
</script>

<style lang="scss" scoped>
#interface-tree::v-deep {
    .p-tree {
        height: 100%;
    }

    .p-tree-container {
        height: calc(100% - 2rem);
    }
}
</style>
