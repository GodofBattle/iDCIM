<template>
    <div class="i-layout">
        <aside class="i-head-left">
            <head-left :items="menuItems"></head-left>
        </aside>
        <article class="i-content">
            <Nuxt />
        </article>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import headLeft from '~/components/headLeft.vue';

export default Vue.extend({
    components: { headLeft },
    data: () => {
        return {
            menuItems: [
                { label: 'HOME' },
                { separator: true },
                { label: '코드' },
                { label: '센서코드' },
                { separator: true },
                { label: '제품' },
                { label: '인터페이스' },
                { label: '임계치' },
                { separator: true },
                { label: '사이트' },
                { label: '트리' },
                { label: '운영페이지' },
                { label: '계정' },
                { separator: true },
                { label: '에디터' },
            ],
            nowTime: '',
        };
    },
});
</script>

<style lang="scss">
.i-layout {
    display: flex;
}

.i-head-left {
    flex: 1;
    height: 100vh;
    background-color: var(--surface-b);
}

.i-content {
    flex: 11;
}
</style>
