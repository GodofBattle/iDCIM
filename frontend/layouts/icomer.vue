<template>
    <div id="icomer" class="i-layout">
        <aside v-show="isSidebar" class="i-head-left">
            <head-left :items="menuItems"></head-left>
        </aside>
        <article class="i-content">
            <Nuxt />
        </article>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    asyncData({ store }) {
        const ss = window.sessionStorage.getItem('sessionStorage');
        console.info(ss);

        store.commit('sessionStorage/sidebarToggle');
    },
    data: () => {
        return {
            is_sidebar: true,
            menuItems: [
                { label: 'HOME' },
                { separator: true },
                {
                    label: '코드',
                    to: '/icomer/code'
                },
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
                { label: '에디터' }
            ]
        };
    },
    computed: {
        isSidebar() {
            return this.$store.state.sessionStorage.is_sidebar;
        }
    }
});
</script>

<style lang="scss">
#icomer.i-layout {
    display: flex;

    .i-head-left {
        flex: 1;
        height: 100vh;
        background-color: var(--surface-b);
    }

    .i-content {
        flex: 11;
        padding: 8px;
    }
}
</style>
