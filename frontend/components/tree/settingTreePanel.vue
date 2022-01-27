<template>
    <div id="settingTreeCard">
        <div class="p-d-flex p-px-2 p-mb-2">
            <div class="p-as-center p-pl-2 p-d-flex i-header-title">
                <div v-if="viewCheck.is" class="p-field-checkbox p-mb-0 p-mr-2">
                    <Checkbox id="view-check-is" :binary="true" />
                </div>
                {{ treeTitle }}
            </div>
            <div class="p-ml-auto p-d-flex">
                <div
                    v-if="viewCheck.isAlias"
                    class="p-field-checkbox p-mb-0 p-mr-2"
                >
                    <Checkbox id="view-check-alias" :binary="true" />
                    <label for="view-check-alias">별칭사용</label>
                </div>
                <Button
                    class="p-button-rounded p-button-text p-button-primary"
                    icon="pi pi-plus"
                ></Button>
            </div>
        </div>
        <div class="i-setting-tree-content p-px-2">
            <div v-if="mode === 0">
                <setting-asset-tree></setting-asset-tree>
            </div>
            <div v-else-if="mode === 1">
                <h1>POSITION</h1>
            </div>
            <div v-else-if="mode === 2">
                <h1>CUSTOM</h1>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<SettingTreePanel>({
    props: {
        treeTitle: String,
        mode: Number
    }
})
export default class SettingTreePanel extends Vue {
    // by shkoh 20220120: viewCheck는 3종류의 트리를 mode 형식에 따라서 구분짓기 위하여 구현된 기능
    // by shkoh 20220120: 향후에 기능 분리가 필요한 경우에는 사용할 필요가 업다
    viewCheck = {
        is: this.$props.mode !== 0,
        isAlias: this.$props.mode === 0
    };
}
</script>

<style lang="scss" scoped>
#settingTreeCard::v-deep {
    .i-header-title {
        font-size: 1.3rem;
        font-weight: bold;
        line-height: 30px;
    }

    .p-card-header {
        padding: 8px 10px;
    }

    .p-card-content {
        padding: 0;
    }

    .p-panel .p-panel-content {
        padding: 0.8rem;
    }

    .i-setting-tree-content {
        width: 100%;
    }
}
</style>
