<template>
    <div v-if="assetList !== null" id="i-asset-summmary" class="p-d-flex">
        <asset-summary-item :items="generalAssets" type="general" />
        <asset-summary-item
            class="p-ml-3"
            :items="normalAssets"
            type="normal"
        />
        <asset-summary-item
            class="p-ml-3"
            :items="warningAssets"
            type="warning"
        />
        <asset-summary-item class="p-ml-3" :items="majorAssets" type="major" />
        <asset-summary-item
            class="p-ml-3"
            :items="criticalAssets"
            type="critical"
        />
        <asset-summary-item class="p-ml-3" :items="errorAssets" type="error" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AssetSummary>({})
export default class AssetSummary extends Vue {
    get assetList(): Array<any> {
        return this.$store.state.sessionStorage.ui.assets;
    }

    get generalAssets(): Array<any> {
        return this.assetList.filter((a: any) => a.IS_USE_INTF === 0);
    }

    get normalAssets(): Array<any> {
        return this.assetList.filter(
            (a: any) =>
                a.IS_USE_INTF === 1 &&
                (a.INTERFACE.IS_USE === 0 ||
                    (a.INTERFACE.IS_USE === 1 &&
                        a.INTERFACE.CURR_STATUS <= 1 &&
                        a.INTERFACE.CURR_LEVEL === 0))
        );
    }

    get warningAssets(): Array<any> {
        return this.assetList.filter(
            (a: any) =>
                a.IS_USE_INTF === 1 &&
                a.INTERFACE.IS_USE === 1 &&
                a.INTERFACE.CURR_STATUS <= 1 &&
                a.INTERFACE.CURR_LEVEL === 1
        );
    }

    get majorAssets(): Array<any> {
        return this.assetList.filter(
            (a: any) =>
                a.IS_USE_INTF === 1 &&
                a.INTERFACE.IS_USE === 1 &&
                a.INTERFACE.CURR_STATUS <= 1 &&
                a.INTERFACE.CURR_LEVEL === 2
        );
    }

    get criticalAssets(): Array<any> {
        return this.assetList.filter(
            (a: any) =>
                a.IS_USE_INTF === 1 &&
                a.INTERFACE.IS_USE === 1 &&
                a.INTERFACE.CURR_STATUS <= 1 &&
                a.INTERFACE.CURR_LEVEL === 3
        );
    }

    get errorAssets(): Array<any> {
        return this.assetList.filter(
            (a: any) =>
                a.IS_USE_INTF === 1 &&
                a.INTERFACE.IS_USE === 1 &&
                a.INTERFACE.CURR_STATUS !== 1
        );
    }
}
</script>
