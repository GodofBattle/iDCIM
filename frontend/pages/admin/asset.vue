<template>
    <div id="admin-asset">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div
            class="p-d-flex p-pr-2 i-asset-content"
            :style="{ 'padding-top': '20px' }"
        >
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
                    :selected-asset.sync="selectedAsset"
                ></asset-table>
            </div>
            <div class="p-col" :style="{ width: '30vw' }">
                <div v-if="isVirtualAsset">Virtual</div>
                <asset-panel
                    v-else
                    :item.sync="selectedAsset"
                    :style="{ height: '100%' }"
                    @reset="onReset"
                ></asset-panel>
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
            default: '자산'
        }
    }
})
export default class AdminAsset extends Vue {
    treeType: string | null = null;
    treeKeys: Array<number | string> = [];
    selectedAsset: any = null;

    head() {
        return { title: `iDCIM - ${this.$props.title}` };
    }

    onSelectTreeNode({ type, treeKeys }: any) {
        this.treeType = type;
        this.treeKeys = treeKeys;
    }

    get isVirtualAsset(): boolean {
        if (this.selectedAsset) {
            const { PRODUCT } = this.selectedAsset;
            return PRODUCT && PRODUCT.MANUFACTURER_ID === 0;
        } else {
            return false;
        }
    }

    onReset() {
        this.selectedAsset = null;
    }
}
</script>

<style lang="scss" scoped>
#admin-asset::v-deep {
    .i-asset-content {
        height: calc(100vh - var(--header-height));
    }
}
</style>
