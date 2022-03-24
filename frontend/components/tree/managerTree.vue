<template>
    <div id="manager-tree">
        <div class="i-tree-content">
            <i-moveable-tree
                :value="managers"
                :moveable="true"
                :filter="true"
                selectionMode="single"
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
        managers: {
            query: gql`
                query Managers($TYPE: String!) {
                    Managers(TYPE: $TYPE) {
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
            update: ({ Managers }) => Managers,
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

    managers: Array<any> = [];

    onChangeTabHeader() {
        console.info(this.selectedTabIndex);
        this.$apollo.queries.managers.refresh();
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