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
                        <form>
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
                            </div>
                        </form>
                    </template>
                    <template #footer>
                        <div class="p-fluid">
                            <Button
                                label="Sign In"
                                icon="pi pi-sign-in"
                                @click="singIn"
                            >
                            </Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <Toast position="bottom-right" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

export default Vue.extend({
    data() {
        return {
            username: '',
            password: ''
        };
    },
    mounted() {
        this.$store.dispatch('sessionStorage/SIGNOUT');
    },
    methods: {
        async singIn() {
            const { username, password } = this.$data;

            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation Login($userId: String!, $password: String!) {
                            Login(userId: $userId, password: $password) {
                                ROLE
                                ACCESS_TOKEN
                                REFRESH_TOKEN
                                USER {
                                    USER_ID
                                    USER_GROUP_ID
                                    NAME
                                }
                            }
                        }
                    `,
                    variables: {
                        userId: username,
                        password
                    }
                })
                .then(async ({ data: { Login } }) => {
                    await this.$apolloHelpers.onLogin(Login.ACCESS_TOKEN);
                    return Login;
                })
                .then(async ({ ROLE, ACCESS_TOKEN, REFRESH_TOKEN, USER }) => {
                    await this.$store.dispatch('sessionStorage/SIGNIN', {
                        role: ROLE,
                        access_token: ACCESS_TOKEN,
                        refresh_token: REFRESH_TOKEN,
                        user_id: USER.USER_ID,
                        user_group_id: USER.USER_GROUP_ID,
                        user_name: USER.NAME
                    });
                })
                .then(() => {
                    this.$router.push('/icomer/code');
                })
                .catch((err) => {
                    console.error(err);
                    this.$toast.add('로그인에 실패했습니다');
                });
        }
    }
});
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
