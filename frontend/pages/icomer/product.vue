<template>
    <div id="icomer-product">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-product-content">
            <div class="p-col-fixed" style="width: var(--tree-width)">
                <product-tree
                    :style="{ height: '100%' }"
                    @select="onSelectTreeNode"
                />
            </div>
            <div class="p-col p-pr-2">
                <div v-if="viewType === 'Manufacturer'">
                    <manufacturer-panel :manufacturer-id="id" @reset="reset" />
                </div>
                <div v-else-if="viewType === 'Product'">
                    <product-panel :product-id="id" @reset="reset" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerProduct>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '제품'
        }
    }
})
export default class IcomerProduct extends Vue {
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
#icomer-product::v-deep {
    .i-product-content {
        height: calc(100vh - var(--header-height));
        padding-top: 20px;
    }
}
</style>
