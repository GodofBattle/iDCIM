<template>
    <div v-show="$sessionStorageLoaded" id="operator" class="p-d-flex">
        <aside v-show="isSidebar" class="i-head-left">
            <head-left :items="menuItems" />
        </aside>
        <article :class="contentClass">
            <Nuxt />
        </article>
        <Toast position="top-center" />
        <i-confirm-dialog group="confirmDialog" />
        <div :class="toolbarClass">
            <icomer-toolbar
                class="p-mx-3 p-mt-3"
                :is-operator="true"
                :asset-list.sync="assets"
                @showAsset="onShowAsset"
            />
        </div>
        <asset-dialog
            :item="assetItem"
            :visible.sync="is_visible_asset_dialog"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<Operator>({
    middleware: 'authenticated_operator',
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
                        .onLogin(
                            `${ACCESS_TOKEN} ${REFRESH_TOKEN}`,
                            undefined,
                            undefined,
                            true
                        )
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
        },
        assets: {
            query: gql`
                query {
                    Assets {
                        ID
                        NAME
                    }
                }
            `,
            fetchPolicy: 'no-cache',
            update: ({ Assets }) => Assets,
            prefetch: true,
            pollInterval: 10000
        }
    }
})
export default class Operator extends Vue {
    menuItems = [{ label: 'HOME', to: '/operator/home' }];

    assets: Array<any> = [];

    showing_asset_id: number = 0;
    is_visible_asset_dialog: boolean = false;
    assetItem: any = null;

    head() {
        const theme = this.$store.state.localStorage.theme;
        return {
            link: [
                { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
                { rel: 'stylesheet', href: `themes/${theme}/theme.css` }
            ]
        };
    }

    get isSidebar(): boolean {
        return this.$store.state.sessionStorage.ui.is_sidebar;
    }

    get url(): string {
        return this.$route.path;
    }

    get toolbarClass(): Array<string | object> {
        return [
            'i-toolbar',
            {
                'i-toolbar-no-sidebar': !this.isSidebar
            }
        ];
    }

    get contentClass(): Array<string | object> {
        return ['i-content'];
    }

    onShowAsset(assetItem: any) {
        this.assetItem = assetItem;
        this.is_visible_asset_dialog = true;
    }
}
</script>

<style lang="scss" scoped>
#operator::v-deep {
    .i-head-left {
        flex: 0 0 auto;
        width: 10vw;
        height: 100vh;
        background-color: var(--surface-b);
    }

    .i-content {
        flex: 1 0 auto;
        width: 90vw;
        height: calc(100 - var(--header_height));
        margin-top: var(--header_height);
        overflow: hidden;
    }

    .i-toolbar {
        position: fixed;
        width: 90vw;
        left: 10vw;
    }

    .i-toolbar-no-sidebar {
        left: 0vw;
        width: 100vw;
    }
}
</style>
