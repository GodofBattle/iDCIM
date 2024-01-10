<template>
    <div id="i-operator-asset-info">
        <client-only>
            <icomer-toolbar class="p-px-2" :title="title" />
        </client-only>
        <div class="p-d-flex i-content">
            <div class="p-col-fixed" :style="{ width: 'var(--tree-width)' }">
                <asset-tree
                    :style="{ height: '100%' }"
                    @select="onSelectTree"
                />
            </div>
            <div class="p-col-fixed" :style="{ width: 'var(--tree-width)' }">
                <asset-table
                    :style="{ height: '100%' }"
                    :tree-type="treeType"
                    :tree-keys="treeKeys"
                    :selected-asset.sync="selectedAsset"
                    :show-add-button="false"
                    @select="onSelectAsset"
                />
            </div>
            <div class="p-col" :style="{ width: '30vw' }">
                <asset-panel-for-operator
                    :style="{ height: '100%' }"
                    :asset="selectedAssetForPanel"
                    @reset="onReset"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<OperatorAssetInfo>({
    layout: 'operator',
    props: {
        title: {
            type: String,
            default: '자산 정보'
        }
    }
})
export default class OperatorAssetInfo extends Vue {
    treeType: string | null = null;
    treeKeys: Array<number | string> = [];

    selectedAsset: any = null;
    selectedAssetForPanel: any = null;

    head() {
        return { title: `UBIGUARD+ - ${this.$props.title}` };
    }

    onSelectTree({ type, treeKeys }: any) {
        this.treeType = type;
        this.treeKeys = treeKeys;
    }

    onSelectAsset(asset: any) {
        if (
            !this.selectedAssetForPanel ||
            this.selectedAssetForPanel.ID !== asset.ID
        ) {
            this.selectedAssetForPanel = { ...asset };
        }
    }

    onReset() {
        this.selectedAssetForPanel = null;
    }
}
</script>

<style lang="scss" scoped>
#i-operator-asset-info::v-deep {
    height: 100vh;

    .i-content {
        width: 100%;
        height: calc(100vh - var(--header-height));
        margin-top: 16px;
    }
}
</style>
