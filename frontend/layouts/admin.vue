<template>
    <div v-show="$sessionStorageLoaded" id="admin" class="i-layout">
        <aside v-show="isSidebar" class="i-head-left">
            <head-left :items="menuItems"></head-left>
        </aside>
        <article class="i-content">
            <Nuxt />
        </article>
        <Toast position="top-center" />
        <i-confirm-dialog group="deleteConfirmDialog" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<Admin>({})
export default class Admin extends Vue {
    menuItems = [{ label: 'HOME' }];

    head() {
        const theme = this.$store.state.localStorage.theme;
        return {
            link: [
                { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
                { rel: 'stylesheet', href: `themes/${theme}/theme.css` },
            ],
        };
    }

    get isSidebar(): boolean {
        return this.$store.state.sessionStorage.ui.is_sidebar;
    }
}
</script>

<style lang="scss">
#admin.i-layout {
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