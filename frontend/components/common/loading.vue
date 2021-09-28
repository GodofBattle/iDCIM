<template>
    <div v-if="loading" class="loading-page p-d-flex p-ai-center p-jc-center">
        <p>
            <i class="pi pi-spin pi-spinner" style="font-size: 4rem"></i>
        </p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component
export default class LoadingPage extends Vue {
    loading = false;

    start(): void {
        this.loading = true;
    }

    finish(): void {
        this.loading = false;
    }
}
</script>

<style lang="scss" scoped>
.loading-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(30, 30, 30, 0.8);
    z-index: 10000;
    color: var(--text-color);
}
</style>
