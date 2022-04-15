<template>
    <div id="admin-asset">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex p-pr-2 i-asset-content">
            <div class="p-col-fixed" style="width: var(--tree-width)">
                <asset-tree :style="{ height: '100%' }"></asset-tree>
            </div>
            <div
                class="p-col-fixed"
                style="width: var(--tree-width); background-color: #ededec"
            ></div>
            <div class="p-col" style="background-color: #cafafa">
                <h2>Asset Content</h2>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AdminAsset>({
    layout: 'admin',
    props: {
        title: {
            type: String,
            default: '자산',
        },
    },
})
export default class AdminAsset extends Vue {
    head() {
        return { title: `iDCIM - ${this.$props.title}` };
    }
}
</script>

<style lang="scss" scoped>
#admin-asset::v-deep {
    .i-asset-content {
        height: calc(100vh - var(--header-height));
        padding-top: 20px;
    }
}
</style>