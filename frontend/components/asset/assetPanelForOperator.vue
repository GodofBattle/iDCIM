<template>
    <div v-if="asset" id="i-asset-panel-for-operator">
        <div class="p-d-flex p-px-2 p-py-1 p-mt-3">
            <div class="p-component p-as-center p-text-bold i-title">
                {{ asset.NAME }}
            </div>
        </div>
        <div class="i-navigation">
            <tab-header-list
                alignment="top"
                :tabs="tabList"
                :active-index.sync="tabIndex"
            />
        </div>
        <i-scroll-panel
            class="i-asset-content-panel"
            :style="{ height: 'calc(100% - 30px - 38px - 25px - 1rem)' }"
        >
            <asset-panel-info
                v-if="tabIndex === 0"
                :asset-item.sync="asset"
                :is-edit="false"
            />
            <asset-panel-manager
                v-else-if="tabIndex === 1"
                :asset-item.sync="asset"
                :is-edit="false"
            />
            <asset-panel-interface
                v-else-if="tabIndex === 2"
                :asset-item.sync="asset"
                :is-edit="false"
            />
            <asset-panel-sensor-list
                v-else-if="tabIndex === 3"
                :asset-item.sync="asset"
            />
            <asset-panel-alert
                v-else-if="tabIndex === 4"
                :asset-item.sync="asset"
            />
            <asset-panel-work
                v-else-if="tabIndex === 5"
                :asset-item.sync="asset"
                :is-add="true"
                :is-editor="true"
            />
        </i-scroll-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

interface TabItem {
    [index: string]: string | boolean;
    header: string;
    disabled: boolean;
    unvisible: boolean;
    is_interface: boolean;
    is_virtual: boolean;
    show_save_button: boolean;
    type: string;
}

@Component<AssetPanelForOperator>({
    props: {
        asset: {
            type: Object,
            default: null
        }
    },
    watch: {
        asset: {
            deep: true,
            handler(asset: any) {
                if (asset === null) return;

                const { IS_USE_INTF } = asset;
                const is_used = IS_USE_INTF === 1;

                this.tabList.forEach((item: TabItem) => {
                    if (item.is_interface) {
                        this.$set(item, 'unvisible', !is_used);
                    }
                });

                if (this.tabList[this.tabIndex].is_interface) {
                    if (!is_used) {
                        this.tabIndex = 0;
                    }
                }
            }
        }
    }
})
export default class AssetPanelForOperator extends Vue {
    tabIndex: number = 0;

    tabList: Array<TabItem> = [
        {
            header: '기본정보',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT01'
        },
        {
            header: '관리정보',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT02'
        },
        {
            header: '인터페이스',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT03'
        },
        {
            header: '수집항목',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT11'
        },
        {
            header: '알람이력',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT08'
        },
        {
            header: '작업이력',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT09'
        }
    ];
}
</script>

<style lang="scss" scoped>
#i-asset-panel-for-operator::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 40vw;
    }
}
</style>
