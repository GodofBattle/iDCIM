<template>
    <div id="i-asset-dialog">
        <i-dialog
            v-if="item"
            :visible.sync="showDialog"
            :content-style="{
                width: '50vw',
                height: '60vh',
                'padding-bottom': '1rem',
                'padding-left': '1rem',
                'padding-right': '1rem'
            }"
            append-to="body"
        >
            <template #header>
                <div class="i-title">
                    {{ item.NAME }}
                </div>
            </template>

            <div class="i-navigation">
                <tab-header-list
                    alignment="top"
                    :tabs="assetTabList"
                    :active-index.sync="tabIndex"
                />
            </div>
            <i-scroll-panel
                class="i-asset-content-panel"
                :style="{ height: 'calc(60vh - 61px)' }"
            >
                <asset-panel-info
                    v-if="tabIndex === 0"
                    :asset-item.sync="item"
                    :is-edit="false"
                />
                <asset-panel-manager
                    v-else-if="tabIndex === 1"
                    :asset-item.sync="item"
                    :is-edit="false"
                />
            </i-scroll-panel>
        </i-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

type TabItem = {
    [index: string]: string | boolean;
    header: string;
    disabled: boolean;
    unvisible: boolean;
    is_interface: boolean;
    is_virtual: boolean;
    show_save_button: boolean;
    type: string;
};

@Component<AssetDialog>({
    props: {
        item: {
            type: Object,
            default: null
        },
        visible: {
            type: Boolean,
            default: false
        }
    }
})
export default class AssetDialog extends Vue {
    assetTabList: Array<TabItem> = [
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
            is_interface: false,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT03'
        },
        {
            header: '통신정보',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT04'
        },
        {
            header: '수집항목',
            disabled: false,
            unvisible: false,
            is_interface: false,
            is_virtual: false,
            show_save_button: false,
            type: 'ASSETCONTENT11'
        },
        {
            header: '알람이력',
            disabled: false,
            unvisible: false,
            is_interface: false,
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

    tabIndex: number = 0;

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }
}
</script>

<style lang="scss" scoped>
#i-asset-dialog::v-deep {
    .i-title {
        font-size: 1.6rem;
        font-weight: bold;
        color: var(--text-color);
    }
}
</style>
