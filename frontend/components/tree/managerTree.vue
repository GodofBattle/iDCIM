<template>
    <div id="manager-tree">
        <div class="i-tree-content">
            <i-moveable-tree
                :moveable="true"
                :filter="true"
                selectionMode="single"
            >
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

type TabItem = {
    [index: string]: string | boolean;
    header: string;
    disabled: boolean;
};

@Component<ManagerTree>({})
export default class ManagerTree extends Vue {
    tabList: Array<TabItem> = [
        { header: '고객사', disabled: false },
        { header: '협력사', disabled: false },
        { header: '유지보수사', disabled: false },
    ];

    selectedTabIndex: number = 0;

    onChangeTabHeader() {
        console.info(this.selectedTabIndex);
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