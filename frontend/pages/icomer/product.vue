<template>
    <div>
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '제품',
        },
    },
    data() {
        return {};
    },
    head() {
        return { title: `[iDCIM] 구축계정 - ${this.title}` };
    },
});
</script>