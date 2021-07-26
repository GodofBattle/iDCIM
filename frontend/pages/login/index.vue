<template>
    <div id="i-login-layout" class="p-p-6">
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

export default Vue.extend({
    data() {
        return {
            username: '',
            password: ''
        };
    },
    methods: {
        async singIn() {
            const { username, password } = this.$data;
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
