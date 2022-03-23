<template>
    <div id="manager-tree">
        <div class="i-tree-content"></div>
        <div class="i-tree-navigation">
            <tab-header-list :tabs="scrollableTabs"></tab-header-list>
        </div>

        <!-- <TabView :activeIndex.sync="active2" :scrollable="true">
            <TabPanel
                v-for="tab in scrollableTabs"
                :key="tab.title"
                :header="tab.title"
            >
                <p>{{ tab.content }}</p>
            </TabPanel>
        </TabView> -->
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
    active2 = 0;
    scrollableTabs = Array.from({ length: 50 }, (_, i) => ({
        header: `Tab ${i + 1}`,
        content: `Tab ${i + 1} Content`,
    }));
}
</script>

<style lang="scss" scoped>
#manager-tree::v-deep {
    height: 100%;
}
</style>