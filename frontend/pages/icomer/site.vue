<template>
    <div id="icomer-site">
        <icomer-toolbar class="p-px-2" :title="title"></icomer-toolbar>
        <ScrollPanel class="p-px-2 i-site-content">
            <site-name></site-name>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

type SiteInfo = {
    [index: string]: string;
    SITE_NAME: string;
};

@Component<IcomerSite>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '사이트 설정'
        }
    }
})
export default class IcomerSite extends Vue {
    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.$props.title}`
        };
    }
}
</script>

<style lang="scss" scoped>
#icomer-site::v-deep {
    .i-site-content {
        height: calc(100vh - var(--header-height));
        padding-top: 20px;
    }
}
</style>
