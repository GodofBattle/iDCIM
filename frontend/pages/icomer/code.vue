<template>
    <div>
        <icomer-toolbar :title="title"></icomer-toolbar>
        <h1>iDCIM = {{ title }}</h1>
        <h2
            style="color: white; white-space: pre-wrap; overflow-wrap: anywhere"
        >
            {{ $store.state.sessionStorage }}
        </h2>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '코드'
        }
    },
    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.title}`
        };
    }
});
</script>
