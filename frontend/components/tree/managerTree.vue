<template>
    <div id="manager-tree">
        <div class="i-tree-content">
            <i-moveable-tree
                :value="companies"
                :moveable="true"
                :filter="true"
                selectionMode="single"
                :addable-type="addableType"
                :moveable-type="moveableType"
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
                <template #addCompany>
                    <Button
                        class="p-button-secondary p-button-sm"
                        :label="addCompanyLabel"
                        icon="pi pi-plus"
                    ></Button>
                </template>
                <template #addOperator>
                    <Button
                        class="p-button-info p-button-sm p-py-1"
                        label="[담당자] 추가"
                        icon="pi pi-plus"
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
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import gql from 'graphql-tag';

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

    treeRefresh() {
        this.$apollo.queries.companies.refresh();
    }

    onChangeTabHeader() {
        this.treeRefresh();
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
                manipulable: false,
                selecatable: false,
            });
        }
    }

    get addCompanyLabel(): string {
        return `[${this.tabList[this.selectedTabIndex].header}] 추가`;
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