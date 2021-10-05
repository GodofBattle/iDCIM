<template>
    <div id="icomer-interface">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-interface-content">
            <div class="p-col-2">
                <interface-tree @select="onSelectTreeNode"></interface-tree>
            </div>
            <div class="p-col-10"></div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerInterface>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '인터페이스',
        },
    },
})
export default class IcomerInterface extends Vue {
    // by shkoh 20210928: Head Title 정의
    head() {
        return { title: `[iDCIM] 구축계정 - ${this.$props.title}` };
    }

    onSelectTreeNode({ type = '', id = '' }) {
        console.info(`${id}: ${type}`);
    }
}
</script>

<style lang="scss" scoped>
#icomer-interface::v-deep .i-interface-content {
    height: calc(100vh - var(--header-height));
    padding-top: 20px;
}
</style>
