<template>
    <div v-if="item" id="i-asset-panel">
        <div class="p-d-flex p-px-2 p-mt-3">
            <div class="p-as-center p-text-bold i-title">
                {{ item.NAME }}
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
                :asset-item="item"
            ></asset-panel-info>
            <div v-else-if="tabIndex === 1">
                <h1>{{ assetTabList[tabIndex].header }}</h1>
            </div>
            <div v-else-if="tabIndex === 2">
                <h1>인터페이스</h1>
            </div>
            <div v-else-if="tabIndex === 3">
                <h1>통신정보</h1>
            </div>
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
import Component from '@/plugins/nuxt-class-component';

type TabItem = {
    [index: string]: string | boolean;
    header: string;
    disabled: boolean;
    type: string;
};

@Component<AssetPanel>({
    props: {
        item: Object
    }
})
export default class AssetPanel extends Vue {
    assetTabList: Array<TabItem> = [
        { header: '기본정보', disabled: false, type: 'ASSETCONTENT01' },
        { header: '관리정보', disabled: false, type: 'ASSETCONTENT02' },
        { header: '인터페이스', disabled: false, type: 'ASSETCONTENT03' },
        { header: '통신정보', disabled: false, type: 'ASSETCONTENT04' },
        { header: '수집항목', disabled: false, type: 'ASSETCONTENT05' },
        { header: '제어항목', disabled: false, type: 'ASSETCONTENT06' },
        { header: '통신로그', disabled: false, type: 'ASSETCONTENT07' },
        { header: '알람정보', disabled: false, type: 'ASSETCONTENT08' },
        { header: '작업이력', disabled: false, type: 'ASSETCONTENT09' },
        { header: '담당자 알림정보', disabled: false, type: 'ASSETCONTENT10' }
    ];

    tabIndex: number = 0;
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