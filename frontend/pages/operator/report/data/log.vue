<template>
    <div id="i-operator-report-data-log">
        <client-only>
            <icomer-toolbar class="p-px-2" :title="title" />
        </client-only>
        <div class="p-d-flex p-px-3 i-content">
            <asset-tree
                v-show="isShowSidebar"
                class="p-col-fiexed"
                :style="{ width: 'var(--tree-width)' }"
                @select="onSelectAssetTree"
            />
            <asset-interface-table
                v-show="isShowSidebar"
                :tree-type="treeType"
                :tree-keys="treeKeys"
                class="p-col-fixed"
                :style="{
                    width: 'var(--tree-width)',
                    height: '100%'
                }"
                :selected-assets.sync="assets"
                @unselect="onUnselectAssetInAssetInterfaceTable"
            />
            <asset-interface-sensor-table
                v-show="isShowSidebar"
                ref="assetInterfaceSensorTableRef"
                class="p-col-fixed"
                :style="{
                    width: 'var(--tree-width)',
                    height: '100%'
                }"
                :selected-assets.sync="assets"
                :selected-sensors.sync="sensors"
            />
            <report-data-log-panel
                class="p-col"
                :style="{ height: 'calc(100% - 4rem)' }"
                :show-sidebar.sync="isShowSidebar"
                :selected-sensors.sync="sensors"
                @toggleSidebar="onToggleSidebar"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import AssetInterfaceSensorTable from '~/components/asset/assetInterfaceSensorTable.vue';

@Component<OperatorReportDataLog>({
    layout: 'operator',
    props: {
        title: {
            type: String,
            default: '데이터 통계'
        }
    }
})
export default class OperatorReportDataLog extends Vue {
    $refs!: {
        assetInterfaceSensorTableRef: AssetInterfaceSensorTable;
    };

    treeType: string | null = null;
    treeKeys: Array<number | string> = [];

    assets: any = null;
    sensors: Array<any> | null = null;

    isShowSidebar: boolean = true;

    head() {
        return {
            title: `[UBIGUARD+] 운영자 - ${this.$props.title}`
        };
    }

    onToggleSidebar() {
        this.isShowSidebar = !this.isShowSidebar;
    }

    onSelectAssetTree({ type, treeKeys }: any) {
        this.treeType = type;
        this.treeKeys = treeKeys;
    }

    onUnselectAssetInAssetInterfaceTable({ ID }: { ID: string }) {
        if (this.sensors) {
            const select_sensors = this.sensors.filter(
                (s: any) => s.INTF_ID === Number(ID)
            );

            if (select_sensors && select_sensors.length > 0) {
                for (let idx = 0; idx < select_sensors.length; idx++) {
                    const sensor_idx = this.sensors.findIndex(
                        (s: any) => s.INTF_ID === Number(ID)
                    );
                    this.sensors.splice(sensor_idx, 1);
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#i-operator-report-data-log::v-deep {
    height: 100vh;

    .i-content {
        width: 100%;
        height: calc(100vh - var(--header-height));
        margin-top: 16px;
    }
}
</style>
