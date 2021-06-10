<template>
    <div>
        <icomer-toolbar :title="title"></icomer-toolbar>
        <h1>iDCIM = {{ title }}</h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import icomerToolbar from '~/components/icomerToolbar.vue';

export default Vue.extend({
    components: { icomerToolbar },
    layout: 'icomer',
    data() {
        return {
            title: '코드',
        };
    },
    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.title}`,
        };
    },
});
</script>
