<template>
    <div id="admin-asset">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex p-px-2 p-jc-end" style="padding-top: 20px">
            <Button
                icon="pi pi-plus"
                label="자산추가"
                class="p-field p-button-outlined p-button-secondary"
            ></Button>
        </div>
        <div class="p-d-flex p-pr-2 i-asset-content">
            <div class="p-col-fixed" style="width: var(--tree-width)">
                <asset-tree
                    :style="{ height: '100%' }"
                    @select="onSelectTreeNode"
                ></asset-tree>
            </div>
            <div class="p-col-fixed" style="width: var(--tree-width)">
                <asset-table
                    :style="{ height: '100%' }"
                    :tree-type="treeType"
                    :tree-keys="treeKeys"
                ></asset-table>
            </div>
            <div class="p-col">
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
    treeType: string | null = null;
    treeKeys: Array<number | string> = [];

    head() {
        return { title: `iDCIM - ${this.$props.title}` };
    }

    onSelectTreeNode({ type, treeKeys }: any) {
        console.info(type, treeKeys);
        this.treeType = type;
        this.treeKeys = treeKeys;
    }
}
</script>

<style lang="scss" scoped>
#admin-asset::v-deep {
    .i-asset-content {
        height: calc(100vh - var(--header-height) - 50px);
    }
}
</style>