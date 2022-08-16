<template>
    <div id="i-operator-alert-asset" class="p-d-flex">
        <div
            class="p-col-fixed"
            :style="{ width: 'var(--tree-width)', height: '100%' }"
        >
            <asset-tree :style="{ height: '100%' }" />
        </div>
        <div class="p-col">
            <DataTable
                class="p-datatable-sm"
                :scrollable="true"
                scroll-height="flex"
                :table-style="{ width: '100%', height: '100%' }"
                responsive-layout="scroll"
                :striped-rows="true"
                filter-display="row"
            >
                <template #empty>
                    <span>선택한 그룹의 자산이 없습니다</span>
                </template>
                <Column
                    key="ID"
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '50px',
                        'justify-content': 'center'
                    }"
                >
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<OperatorAlertAsset>({})
export default class OperatorAlertAsset extends Vue {}
</script>

<style lang="scss" scoped>
#i-operator-alert-asset {
    margin: -1rem;
    height: calc(100vh - var(--header-height) - 72px - 20px - 2px);
}
</style>
