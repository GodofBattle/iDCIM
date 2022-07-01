<template>
    <div id="icomer-virtual-product">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-virtual-product-content">
            <div class="p-col-fixed" :style="{ width: 'var(--tree-width)' }">
                <virtual-product-tree
                    :style="{ height: '100%' }"
                    @select="onSelectTreeNode"
                />
            </div>
            <div class="p-col p-pr-2">
                <virtual-product-panel
                    v-if="id > 0"
                    :product-id="id"
                    @reset="reset"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerVirtualProduct>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '가상제품'
        }
    }
})
export default class IcomerVirtualProduct extends Vue {
    id: number = -1;
    viewType: string = '';

    head() {
        return { title: `[iDCIM] 구축계정 - ${this.$props.title}` };
    }

    onSelectTreeNode({ type = '', id = -1 }) {
        this.viewType = type;
        this.id = id;
    }

    reset() {
        this.id = -1;
        this.viewType = '';
    }
}
</script>

<style lang="scss" scoped>
#icomer-virtual-product::v-deep {
    .i-virtual-product-content {
        padding-top: 20px;
        height: calc(100vh - var(--header-height));
    }
}
</style>
