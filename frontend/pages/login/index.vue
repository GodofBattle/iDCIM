<template>
    <div v-show="$sessionStorageLoaded" id="i-login-layout" class="p-p-6">
        <div class="p-grid p-jc-center vertical-container" style="height: 100%">
            <div class="p-col-2 p-as-center">
                <Card class="i-login-card">
                    <template #header> </template>
                    <template #title>
                        <div class="p-text-center">iDCIM</div>
                    </template>
                    <template #subtitle>
                        <div class="p-text-center">login</div>
                    </template>
                    <template #content>
                        <form @submit.stop.prevent="signIn">
                            <div class="p-fluid p-input-filled">
                                <div class="p-field">
                                    <label for="userid">User ID</label>
                                    <span class="p-input-icon-left">
                                        <i class="pi pi-user" />
                                        <InputText
                                            id="userid"
                                            v-model="username"
                                            type="text"
                                            aria-describedby="userid-help"
                                            autocomplete="on"
                                        ></InputText>
                                    </span>
                                    <small
                                        id="userid-help"
                                        class="p-error"
                                    ></small>
                                </div>
                                <div class="p-field">
                                    <label for="password">Password</label>
                                    <span class="p-input-icon-left">
                                        <i class="pi pi-lock" />
                                        <InputText
                                            id="password"
                                            v-model="password"
                                            type="password"
                                            aria-describedby="password-help"
                                            autocomplete="on"
                                        ></InputText>
                                    </span>
                                    <small
                                        id="password-help"
                                        class="p-error"
                                    ></small>
                                </div>
                                <div class="p-field p-pt-3">
                                    <Button
                                        type="submit"
                                        label="Sign In"
                                        icon="pi pi-sign-in"
                                    >
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </template>
                    <template #footer></template>
                </Card>
            </div>
        </div>
        <Toast position="bottom-center" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<Login>({})
export default class Login extends Vue {
    username = '';
    password = '';

    head() {
        const theme = this.$store.state.localStorage.theme;

        return {
            link: [
                { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
                { rel: 'stylesheet', href: `themes/${theme}/theme.css` }
            ]
        };
    }

    mounted() {
        this.$store.dispatch('sessionStorage/SIGNOUT');

        if (this.$route.query.session === 'expire') {
            this.$toast.add({
                severity: 'error',
                summary: '세션만료',
                detail: '세션이 만료되어 로그인 페이지로 이동합니다',
                life: 3000
            });
        }
    }

    async signIn() {
        const { username, password } = this.$data;

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    Login(userId: "${username}", password: "${password}") {
                        ROLE
                        TOKEN {
                            ACCESS_TOKEN
                            REFRESH_TOKEN
                        }
                        USER {
                            USER_ID
                            USER_GROUP_ID
                            NAME
                        }
                    }
                }
            `,
                errorPolicy: 'ignore'
            })
            .then(
                async ({
                    data: {
                        Login: {
                            ROLE,
                            TOKEN: { ACCESS_TOKEN, REFRESH_TOKEN },
                            USER: { USER_ID, USER_GROUP_ID, NAME }
                        }
                    }
                }) => {
                    await this.$store.dispatch('sessionStorage/SIGNIN', {
                        role: ROLE,
                        access_token: ACCESS_TOKEN,
                        refresh_token: REFRESH_TOKEN,
                        user_id: USER_ID,
                        user_group_id: USER_GROUP_ID,
                        user_name: NAME
                    });
                }
            )
            .then(() => {
                this.$router.push('/icomer/code');
            })
            .catch(() => {
                this.$toast.add({
                    severity: 'info',
                    summary: '로그인 실패',
                    detail: 'ID 혹은 패스워드를 확인하세요',
                    life: 1500
                });
            });
    }
}
</script>

<style lang="scss">
#i-login-layout {
    background-color: var(--blue-900);
    background-image: url('~assets/images/bk.login.jpg');
    background-blend-mode: soft-light;
    width: 100vw;
    height: 100vh;

    .i-login-card {
        background: rgba(10, 10, 10, 0.1);
        box-shadow: 0px 2px 10px 3px rgba(10, 10, 10, 0.6);
    }
}
</style>
