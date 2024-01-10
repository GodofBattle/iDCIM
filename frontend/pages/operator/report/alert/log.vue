<template>
    <div id="i-operator-report-alert-log">
        <client-only>
            <icomer-toolbar class="p-px-2" :title="title" />
        </client-only>
        <div class="p-d-flex p-px-3 i-content">
            <report-alert-log-panel :style="{ height: 'calc(100% - 40px)' }" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<OperatorReportAlertLog>({
    layout: 'operator',
    props: {
        title: {
            type: String,
            default: '알람 이력'
        }
    }
})
export default class OperatorReportAlertLog extends Vue {
    head() {
        return {
            title: `[UBIGUARD+] 운영자 - ${this.$props.title}`
        };
    }
}
</script>

<style lang="scss" scoped>
#i-operator-report-alert-log::v-deep {
    height: 100vh;

    .i-content {
        width: 100%;
        height: calc(100vh - var(--header-height));
        margin-top: 16px;
    }
}
</style>
