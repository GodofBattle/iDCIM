<template>
    <div id="i-asset-panel-info">
        <div class="p-col p-fluid p-input-filled">
            <div class="p-field p-grid">
                <label
                    for="name"
                    class="p-col-fixed p-my-2"
                    :style="{ 'flex-basis': '80px' }"
                >
                    자산명
                </label>
                <div class="p-col-fixed" :style="{ 'flex-basis': '30%' }">
                    <InputText
                        id="name"
                        type="text"
                        aria-describedby="name-help"
                        autocomplete="off"
                    >
                    </InputText>
                </div>
                <div class="p-col p-my-2">
                    <small id="name-help" class="p-error">
                        에러를 표시할 예정입니다
                    </small>
                </div>
            </div>
            <div class="p-field p-grid">
                <label
                    for="serial"
                    class="p-col-fixed p-my-2"
                    :style="{ 'flex-basis': '80px' }"
                >
                    시리얼정보
                </label>
                <div class="p-col-fixed" :style="{ 'flex-basis': '30%' }">
                    <InputText
                        id="serial"
                        type="text"
                        aria-describedby="serial-help"
                        autocomplete="off"
                    >
                    </InputText>
                </div>
                <div class="p-col p-my-2">
                    <small id="serial-help" class="p-error"></small>
                </div>
            </div>
            <div class="p-field p-grid">
                <label
                    for="custom-tree"
                    class="p-col-fixed p-my-2"
                    :style="{ 'flex-basis': '80px' }"
                >
                    기본트리 설정
                </label>
                <div class="p-col">
                    <Button
                        class="p-button-text p-button-info"
                        label="한국전력 > 2F"
                        :style="{
                            'text-align': 'left',
                        }"
                    ></Button>
                </div>
            </div>
            <div class="p-field p-grid">
                <label
                    for="position-tree"
                    class="p-col-fixed p-my-2"
                    :style="{ 'flex-basis': '80px' }"
                >
                    위치설정
                </label>
                <div class="p-col">
                    <Button
                        class="p-button-text p-button-info"
                        label="한국전력 > 2F"
                        :style="{
                            'text-align': 'left',
                        }"
                    ></Button>
                </div>
            </div>
        </div>
        <Panel header="항온항습기 | PDIOEM_A350" :toggleable="true">
            <div class="p-d-flex">
                <div
                    class="p-col-fixed"
                    :style="{ width: '70%', background: '#ff00ee' }"
                ></div>
                <div class="p-col-fixed" :style="{ width: '30%' }">
                    <Panel header="이미지">
                        <template #icons>
                            <button class="p-panel-header-icon p-link">
                                <span class="pi pi-images"></span>
                            </button>
                        </template>
                    </Panel>
                </div>
            </div>
        </Panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AssetPanelInfo>({})
export default class AssetPanelInfo extends Vue {}
</script>

<style lang="scss" scoped>
#i-asset-panel-info::v-deep {
    .i-header-title {
        background: var(--primary-color);
        color: var(--primary-color-text);
        border-radius: var(--border-radius);
        width: 5vw;
    }
}
</style>