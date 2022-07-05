<template>
    <div v-if="item" id="i-asset-panel">
        <div class="p-d-flex p-px-2 p-py-1 p-mt-3">
            <div class="p-as-center p-text-bold i-title">
                {{ item.NAME }}
            </div>
            <div class="p-ml-auto">
                <Button
                    v-show="showSaveButton"
                    class="p-button-rounded p-button-text p-mr-1"
                    icon="pi pi-save"
                    :disabled="applyButtonDisabled"
                    @click="updateAsset"
                ></Button>
                <Button
                    class="p-button-rounded p-button-text p-button-danger"
                    icon="pi pi-trash"
                ></Button>
            </div>
        </div>
        <div class="i-navigation">
            <tab-header-list
                alignment="top"
                :tabs="assetTabList"
                :active-index.sync="tabIndex"
            >
            </tab-header-list>
        </div>
        <div class="i-asset-content">
            <asset-panel-info
                v-if="tabIndex === 0"
                ref="assetPanelInfo"
                :asset-item.sync="item"
                :apply-button-disabled.sync="applyButtonDisabled"
            />
            <asset-panel-manager
                v-else-if="tabIndex === 1"
                ref="assetPanelManager"
                :asset-item.sync="item"
                :apply-button-disabled.sync="applyButtonDisabled"
            />
            <asset-panel-interface
                v-else-if="tabIndex === 2"
                ref="assetPanelInterface"
                :asset-item.sync="item"
                :apply-button-disabled.sync="applyButtonDisabled"
            />
            <asset-panel-commander
                v-else-if="tabIndex === 3"
                ref="assetPanelCommander"
                :asset-item.sync="item"
                :apply-button-disabled.sync="applyButtonDisabled"
            />
            <div v-else-if="tabIndex === 4">
                <h1>수집항목</h1>
            </div>
            <div v-else-if="tabIndex === 5">
                <h1>제어항목</h1>
            </div>
            <div v-else-if="tabIndex === 6">
                <h1>통신로그</h1>
            </div>
            <div v-else-if="tabIndex === 7">
                <h1>알람정보</h1>
            </div>
            <div v-else-if="tabIndex === 8">
                <h1>{{ assetTabList[tabIndex].header }}</h1>
            </div>
            <div v-else-if="tabIndex === 9">
                <h1>{{ assetTabList[tabIndex].header }}</h1>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import AssetPanelInterface from './assetPanelInterface.vue';
import AssetPanelManager from './assetPanelManager.vue';
import AssetPanelInfo from './assetPanelInfo.vue';
import AssetPanelCommander from './assetPanelCommander.vue';
import Component from '@/plugins/nuxt-class-component';

type TabItem = {
    [index: string]: string | boolean;
    header: string;
    disabled: boolean;
    unvisible: boolean;
    is_interface: boolean;
    show_save_button: boolean;
    type: string;
};

@Component<AssetPanel>({
    props: {
        item: Object
    },
    watch: {
        item: {
            deep: true,
            handler(_item) {
                if (_item === undefined || _item === null) return;

                const { IS_USE_INTF } = _item;
                const is_used = IS_USE_INTF === 1;

                this.assetTabList.forEach((item: TabItem) => {
                    if (item.is_interface) {
                        this.$set(item, 'unvisible', !is_used);
                    }
                });

                if (this.assetTabList[this.tabIndex].is_interface !== is_used) {
                    this.tabIndex = 0;
                }
            }
        }
    },
    apollo: {
        productInterface: {
            query: gql`
                query ProductInterface($ID: ID!) {
                    ProductInterface(ID: $ID) {
                        PD_INTF_ID
                        INTERFACE {
                            INTF_CD
                        }
                    }
                }
            `,
            manual: true,
            skip() {
                return this.$props.item?.INTERFACE?.PROD_INTF_ID == undefined;
            },
            variables() {
                return {
                    ID: this.$props.item.INTERFACE.PROD_INTF_ID
                };
            },
            result({ loading, data }) {
                if (!loading) {
                    const { ProductInterface } = data;

                    let is_command_list = false;

                    if (ProductInterface) {
                        is_command_list = [
                            'INTF02',
                            'INTF06',
                            'INTF07'
                        ].includes(ProductInterface.INTERFACE.INTF_CD);
                    }

                    const asset_content_04 = this.assetTabList.find(
                        (tab: TabItem) => tab.type === 'ASSETCONTENT04'
                    );
                    if (asset_content_04) {
                        console.info(`158: ${is_command_list}`);

                        this.$set(
                            asset_content_04,
                            'unvisible',
                            !is_command_list
                        );
                    }

                    if (
                        !is_command_list &&
                        this.assetTabList[this.tabIndex].type ===
                            'ASSETCONTENT04'
                    ) {
                        this.tabIndex = 0;
                    }
                }
            }
        }
    }
})
export default class AssetPanel extends Vue {
    $refs!: {
        assetPanelInfo: AssetPanelInfo;
        assetPanelManager: AssetPanelManager;
        assetPanelInterface: AssetPanelInterface;
        assetPanelCommander: AssetPanelCommander;
    };

    assetTabList: Array<TabItem> = [
        {
            header: '기본정보',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_virtual: false,
            show_save_button: true,
            type: 'ASSETCONTENT01'
        },
        {
            header: '관리정보',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_virtual: false,
            show_save_button: true,
            type: 'ASSETCONTENT02'
        },
        {
            header: '인터페이스',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: true,
            type: 'ASSETCONTENT03'
        },
        {
            header: '통신정보',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT04'
        },
        {
            header: '수집항목',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT05'
        },
        {
            header: '제어항목',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT06'
        },
        {
            header: '통신로그',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: true,
            type: 'ASSETCONTENT07'
        },
        {
            header: '알람정보',
            disabled: false,
            unvisible: false,
            is_interface: true,
            is_virtual: false,
            show_save_button: true,
            type: 'ASSETCONTENT08'
        },
        {
            header: '작업이력',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_virtual: false,
            show_save_button: true,
            type: 'ASSETCONTENT09'
        },
        {
            header: '담당자 알림정보',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_vitual: false,
            show_save_button: true,
            type: 'ASSETCONTENT10'
        }
    ];

    tabIndex: number = 0;

    applyButtonDisabled: boolean = true;

    updateAsset() {
        switch (this.tabIndex) {
            case 0: {
                this.$refs.assetPanelInfo.updateAsset();
                break;
            }
            case 1: {
                this.$refs.assetPanelManager.updateAsset();
                break;
            }
            case 2: {
                this.$refs.assetPanelInterface.updateAsset();
            }
        }
    }

    get showSaveButton(): boolean {
        return this.assetTabList[this.tabIndex].show_save_button;
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 30vw;
    }

    .i-asset-content {
        padding: 1rem;
    }
}
</style>
