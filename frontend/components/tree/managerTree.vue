<template>
    <div id="manager-tree">
        <div class="i-tree-content">
            <i-moveable-tree
                :value="companies"
                :moveable="true"
                :filter="true"
                selection-mode="single"
                :addable-type="addableType"
                :moveable-type="moveableType"
                @insert-tree="onInsertNode"
                @node-select="onNodeSelect"
            >
                <template #C="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-building p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        ></i>
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
                <template #O="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-shield p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        ></i>
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
                <template #Operator="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-user p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        ></i>
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
                <template #addCompany>
                    <Button
                        class="p-button-secondary p-button-sm"
                        :label="addCompanyLabel"
                        icon="pi pi-plus"
                        @click="addCompany"
                    ></Button>
                </template>
                <template #addOperator="slotProps">
                    <Button
                        class="p-button-info p-button-sm p-py-1"
                        label="[담당자] 등록"
                        icon="pi pi-plus"
                        @click="addOperator(slotProps.node)"
                    ></Button>
                </template>
            </i-moveable-tree>
        </div>
        <div class="i-tree-navigation">
            <tab-header-list
                :tabs="tabList"
                alignment="bottom"
                :active-index.sync="selectedTabIndex"
                @tab-change="onChangeTabHeader"
            ></tab-header-list>
        </div>
        <company-add-dialog
            :visible.sync="showCompanyAddDialog"
            :tab-type="selectionInfo"
            @refresh="treeRefresh"
        ></company-add-dialog>
        <operator-add-dialog
            :visible.sync="showOperatorAddDialog"
            :tab-type="selectionInfo"
            :company-id="selected_company_id"
            :company-name="selected_company_name"
            @refresh="treeRefresh"
        >
        </operator-add-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import gql from 'graphql-tag';

import { eventBus } from '@/plugins/vueEventBus';

type TabItem = {
    [index: string]: string | boolean;
    header: string;
    disabled: boolean;
    type: string;
};

@Component<ManagerTree>({
    apollo: {
        companies: {
            query: gql`
                query Companies($TYPE: String!) {
                    Companies(TYPE: $TYPE) {
                        key: KEY
                        label: NAME
                        type: TYPE
                        children: OPERATORS {
                            key: KEY
                            label: NAME
                            type: TYPE
                        }
                    }
                }
            `,
            variables() {
                return {
                    TYPE: this.tabList[this.selectedTabIndex].type,
                };
            },
            manual: false,
            prefetch: false,
            fetchPolicy: 'no-cache',
            update({ Companies }) {
                this.apolloFetch(Companies);
                return Companies;
            },
        },
    },
})
export default class ManagerTree extends Vue {
    tabList: Array<TabItem> = [
        { header: '고객사', disabled: false, type: 'C' },
        { header: '협력사', disabled: false, type: 'P' },
        { header: '유지보수사', disabled: false, type: 'O' },
    ];

    selectedTabIndex: number = 0;
    addableType: any = { C: true, P: true, O: true, Operator: false };
    moveableType: any = { C: false, P: false, O: false, Operator: false };

    companies: Array<any> = [];

    showCompanyAddDialog: boolean = false;
    showOperatorAddDialog: boolean = false;

    selected_company_id: number | null = null;
    selected_company_name: string | null = null;

    mounted() {
        eventBus.$on('refreshManagerTree', () => {
            this.treeRefresh();
        });
    }

    beforeDestroy() {
        eventBus.$off('refreshManagerTree');
    }

    treeRefresh() {
        this.$apollo.queries.companies.refresh();
    }

    unselectNode() {
        this.$emit('select', { type: '', id: -1, name: '' });
    }

    onChangeTabHeader() {
        this.treeRefresh();
        this.$emit('select', { type: '', id: -1, name: '' });
    }

    onNodeSelect({ key = '' as string, label = '' }: any) {
        const [type, id] = key.split('_');

        this.$emit('select', {
            type: type === 'ac' ? 'Company' : type === 'aao' ? 'Operator' : '',
            id: Number(id),
            name: label,
        });
    }

    onInsertNode(target: any, dest: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        MoveOperatorTreeNode(
                            key: "${target.key}"
                            parent_key: "${target.parent_key}"
                        )
                    }
                `,
            })
            .then(({ MoveOperatorTreeNode }: any) => {
                if (MoveOperatorTreeNode) {
                    this.$toast.add({
                        severity: 'info',
                        summary: '담당자 위치 변경 완료',
                        detail: `[${target.label}] 담당자는 ${dest.label} 소속으로 변경되었습니다`,
                        life: 1800,
                    });
                }

                this.treeRefresh();
            })
            .then(() => {
                this.$emit('move', target);
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '담당자 위치 변경 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    apolloFetch(companies: Array<any>) {
        companies.forEach((company) => {
            switch (company.type) {
                case 'C':
                case 'P':
                case 'O': {
                    Object.defineProperty(company, 'manipulable', {
                        value: false,
                        configurable: true,
                        enumerable: true,
                        writable: true,
                    });

                    if (
                        !company.children.some(
                            (c: any) => c.type === 'addOperator'
                        )
                    ) {
                        company.children.push({
                            type: 'addOperator',
                            selectable: false,
                            manipulable: false,
                            pId: company.key,
                            pName: company.label,
                        });
                    }
                    break;
                }
            }
        });

        if (!companies.some((company: any) => company.type === 'addCompany')) {
            companies.push({
                type: 'addCompany',
                selectable: false,
                manipulable: false,
            });
        }
    }

    addCompany() {
        this.showCompanyAddDialog = true;
    }

    addOperator(node: any) {
        this.selected_company_id = node.pId.split('_')[1];
        this.selected_company_name = node.pName;
        this.showOperatorAddDialog = true;
    }

    get addCompanyLabel(): string {
        return `[${this.tabList[this.selectedTabIndex].header}] 등록`;
    }

    get selectionInfo(): TabItem {
        return this.tabList[this.selectedTabIndex];
    }
}
</script>

<style lang="scss" scoped>
#manager-tree::v-deep {
    height: 100%;

    .i-tree-content {
        .p-tree {
            border-bottom: none;
            margin-bottom: -2px;
        }

        .p-tree-container {
            height: calc(
                100vh - 8px - var(--header-height) - 12px - 23px - 8px - 29px -
                    38px - 8px
            );
            margin: 0 0.3rem;
        }
    }
}
</style>