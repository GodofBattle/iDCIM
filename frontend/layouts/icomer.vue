<template>
    <div v-show="$sessionStorageLoaded" id="icomer" class="i-layout">
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
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<Icomer>({
    apollo: {
        $subscribe: {
            refreshToken: {
                query: gql`
                    subscription {
                        RefreshToken {
                            ACCESS_TOKEN
                            REFRESH_TOKEN
                        }
                    }
                `,
                result({
                    data: {
                        RefreshToken: { ACCESS_TOKEN = '', REFRESH_TOKEN = '' }
                    }
                }) {
                    // by shkoh 20210729: 토큰이 갱신될 경우에 apollo client와 store에 토큰을 갱신시킴
                    // by shkoh 20210729: 토큰의 갱신방법은 api server에서 갱신 토큰을 구독하는 방법으로 함
                    this.$apolloHelpers
                        .onLogin(ACCESS_TOKEN, undefined, undefined, true)
                        .then(() => {
                            this.$store.commit('sessionStorage/REFRESHTOKEN', {
                                access_token: ACCESS_TOKEN,
                                refresh_token: REFRESH_TOKEN
                            });
                        })
                        .then(() => {
                            this.$apollo.subscriptions.refreshToken.refresh();
                        });
                },
                error(err: any) {
                    console.error(err);
                }
            }
        }
    }
})
export default class Icomer extends Vue {
    is_sidebar = true;

    menuItems = [
        { label: 'HOME' },
        { separator: true },
        { label: '코드', to: '/icomer/code' },
        { label: '센서코드', to: '/icomer/sensor' },
        { separator: true },
        { label: '제품', to: '/icomer/product' },
        { label: '인터페이스', to: '/icomer/interface' },
        { label: '임계치', to: '/icomer/threshold' },
        { separator: true },
        { label: '사이트', to: '/icomer/site' },
        { label: '트리' },
        { label: '운영페이지' },
        { label: '계정' },
        { separator: true },
        { label: '에디터' }
    ];

    get isSidebar(): boolean {
        return this.$store.state.sessionStorage.ui.is_sidebar;
    }
}
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
