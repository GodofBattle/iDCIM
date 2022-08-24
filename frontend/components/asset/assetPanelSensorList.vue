<template>
    <div
        id="i-asset-panel-sensor-list"
        class="p-px-2 p-py-2"
        :style="{ width: '50%', height: '100%' }"
    >
        <sensor-list :interface-id="Number(assetItem.ID)" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AssetPanelSensorList>({
    props: {
        assetItem: Object
    }
})
export default class AssetPanelSensorList extends Vue {}
</script>
