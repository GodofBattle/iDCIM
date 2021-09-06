<template>
    <div>
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-product-content">
            <div class="p-col-2">
                <product-tree @select="onSelectTreeNode" />
            </div>
            <div class="p-col-10">
                <div v-show="viewType === 'Manufacturer'">
                    <manufacturer-panel :manufacturer-id="id" @reset="reset" />
                </div>
                <div v-show="viewType === 'Product'">
                    <h2 style="color: #eee">Content -- Product</h2>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '제품'
        }
    },
    data: () => ({
        id: -1,
        viewType: ''
    }),
    head() {
        return { title: `[iDCIM] 구축계정 - ${this.title}` };
    },
    methods: {
        onSelectTreeNode({ type = '', id = -1 }) {
            this.viewType = type;
            this.id = id;
        },
        reset() {
            this.id = -1;
            this.viewType = '';
        }
    }
});
</script>

<style lang="scss">
.i-product-content {
    height: calc(100vh - 71px);
    padding-top: 20px;
}
</style>
