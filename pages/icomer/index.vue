<template>
    <div>
        <icomer-toolbar :title="title"></icomer-toolbar>
        <h1 class="custom-text">ICOMER LOGIN VIEWER</h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    layout: 'icomer',
    data() {
        return {
            title: '센서코드 테스트',
        };
    },
});
</script>

<style scoped lang="scss">
.custom-text {
    color: #ffffff;
}
</style>
