<template>
    <div id="admin-maintenanceEndAsset">
        <icomer-toolbar class="p-px-2" :title="title" />
        <div
            class="p-d-flex p-px-3 i-content"
            :style="{ 'padding-top': '20px' }"
        >
            <report-maintenance-asset
                :style="{ height: 'calc(100% - 40px)' }"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<MaintenanceEndAsset>({
    layout: 'admin',
    props: {
        title: {
            type: String,
            default: '유지보수 관리'
        }
    }
})
export default class MaintenanceEndAsset extends Vue {
    head() {
        return {
            title: `UBIGUARD+ - ${this.$props.title}`
        };
    }
}
</script>