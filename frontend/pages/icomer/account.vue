<template>
    <div id="icomer-account">
        <icomer-toolbar class="p-px-2" :title="title" />
        <div class="i-account-content p-d-flex">
            <div
                class="p-col-fixed"
                :style="{ width: 'var(--tree-width)', height: '100%' }"
            >
                <account-tree :style="{ height: '100%' }" />
            </div>
            <div class="p-col"></div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerAccount>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '계정관리'
        }
    }
})
export default class IcomerAccount extends Vue {
    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.$props.title}`
        };
    }
}
</script>

<style lang="scss" scoped>
#icomer-account::v-deep {
    .i-account-content {
        padding-top: 20px;
        height: calc(100vh - var(--header-height));
    }
}
</style>
