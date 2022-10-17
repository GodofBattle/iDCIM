<template>
    <div v-show="$sessionStorageLoaded" id="operator" class="p-d-flex">
        <aside v-show="isSidebar" class="i-head-left">
            <head-left :items="menuItems" />
        </aside>
        <article class="i-content">
            <icomer-toolbar class="p-mx-3 p-mt-3" :is-operator="true" />
            <h2>{{ url }}</h2>
            <Nuxt />
        </article>
        <!-- <div v-else-if="!isSidebar" class="i-full-screen">
            <Nuxt />
            <Button
                label="Full Screen"
                class="p-mt-6 float-button"
                style="width: 10vw"
                @click="onClick"
            />
        </div> -->
        <Toast position="top-center" />
        <i-confirm-dialog group="confirmDialog" />
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
                    console.info(ACCESS_TOKEN);

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
            pollInterval: 10000,
            result({ loading, data }) {
                if (!loading) {
                    const { Assets } = data;
                    if (Assets) {
                        console.info('refrhes');
                        // this.$apollo.subscriptions.refreshToken.skip = false;
                    }
                }
            }
        }
    }
})
export default class Operator extends Vue {
    menuItems = [{ label: 'HOME', to: '/operator/home' }];

    assets: Array<any> = [];

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
    }

    .i-full-screen {
        position: fixed;
        background-color: darkolivegreen;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        top: 0;
        left: 0;
        transition: none;
        z-index: 3000;
    }

    .float-button {
        position: fixed;
        right: 10px;
        bottom: 10px;
        z-index: 3001;
    }
}
</style>
