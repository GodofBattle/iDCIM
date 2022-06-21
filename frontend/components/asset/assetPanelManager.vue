<template>
    <div id="i-asset-panel-manager">
        <div class="p-col p-fluid p-input-filled">
            <div class="p-field p-grid">
                <label for="name" class="p-col-fixed p-my-2 i-form-label">
                    자산담당자(정)
                </label>
                <div class="p-col-5 i-form-value">
                    <Button
                        class="p-button-text p-button-info"
                        label="부동산113 > 조세호"
                        :style="{ 'text-align': 'left' }"
                    ></Button>
                    <Divider class="p-ml-3 p-my-0" />
                    <div class="p-px-3 p-py-2">010-2234-3333</div>
                </div>
            </div>
            <div class="p-field p-grid">
                <label for="name" class="p-col-fixed p-my-2 i-form-label">
                    자산담당자(부)
                </label>
                <div class="p-col-5 i-form-value">
                    <Button
                        class="p-button-text p-button-info"
                        label="부동산113 > 유재석"
                        :style="{ 'text-align': 'left' }"
                    ></Button>
                    <Divider class="p-ml-3 p-my-0" />
                    <div class="p-px-3 p-py-2">010-2234-3333</div>
                </div>
            </div>
            <div class="p-field p-grid">
                <label for="name" class="p-col-fixed p-my-2 i-form-label">
                    자산도입일
                </label>
                <div class="p-col-4 i-form-value">
                    <i-calendar
                        v-model="calendar_date"
                        class="p-ml-2"
                        :show-icon="true"
                    />
                </div>
            </div>
        </div>
        <Panel header="유지보수" :toggleable="false"></Panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<AssetPanelManager>({
    props: {
        assetItem: Object,
        applyButtonDisabled: Boolean
    }
})
export default class AssetPanelManager extends Vue {
    calendar_date: Date = new Date();
}
</script>

<style lang="scss" scoped>
#i-asset-panel-manager::v-deep {
    .i-form-label {
        flex-basis: 100px;
        border-radius: 3px;
        background-color: var(--primary-color);
        color: var(--primary-color-text);
        padding: 0.5rem;
    }

    .i-form-value {
        align-self: center;
    }
}
</style>
