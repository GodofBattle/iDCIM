<template>
    <div>
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-product-content">
            <div class="p-col-2">
                <product-tree />
            </div>
            <div class="p-col-10">
                <h1>Content</h1>
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
    data() {
        return {};
    },
    head() {
        return { title: `[iDCIM] 구축계정 - ${this.title}` };
    }
});
</script>

<style lang="scss">
.i-product-content {
    height: calc(100vh - 71px);
    padding-top: 20px;
}
</style>
