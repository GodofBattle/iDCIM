<template>
    <div id="i-asset-panel-work" class="p-px-2 p-pb-4">
        <DataTable
            :scrollable="true"
            scroll-height="flex"
            :row-hover="true"
            class="p-datatable-sm"
        >
            <template #header>
                <div class="p-d-flex">
                    <div class="p-as-center">
                        <Button
                            icon="pi pi-plus"
                            class="p-button-text p-button-rounded"
                            @click="addWork"
                        />
                    </div>
                    <div class="p-as-center p-ml-auto">
                        <span class="p-input-icon-right">
                            <i class="pi pi-search"></i>
                            <InputText />
                        </span>
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="i-table-empty">
                    상단의 [+] 버튼을 클릭하여 작업이력을 등록할 수 있습니다
                </div>
            </template>
        </DataTable>
        <asset-add-work
            :visible.sync="isVisibleAddWork"
            :asset-name="assetItem.NAME"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AssetPanelWork>({
    props: {
        assetItem: {
            type: Object,
            default: null
        }
    }
})
export default class AssetPanelWork extends Vue {
    isVisibleAddWork: boolean = false;

    addWork() {
        this.isVisibleAddWork = true;
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-work::v-deep {
    height: 100%;

    .p-datatable-emptymessage {
        td {
            justify-content: center;
        }
    }

    .i-table-empty {
        height: 10vh;
        line-height: 10vh;
        font-size: 1.2rem;
    }
}
</style>
