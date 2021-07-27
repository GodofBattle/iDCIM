<template>
    <div>
        <Toolbar>
            <template #left>
                <Button
                    icon="pi pi-bars"
                    class="
                        p-mr-2 p-button-raised p-button-text p-button-secondary
                    "
                    @click="toggleSidebar"
                ></Button>
                <div class="i-title p-text-bold">{{ title }}</div>
            </template>
            <template #right>
                <Button
                    :label="userName"
                    class="p-button-link"
                    icon="pi pi-user"
                    @click="toggleUserSetting"
                ></Button>
            </template>
        </Toolbar>
        <OverlayPanel ref="userSettingPanel" style="width: 200px">
            <div class="p-fluid">
                <Button
                    label="사용자명 변경"
                    class="p-field p-button-outlined p-button-info p-mb-1"
                    @click="openInfoSettingDialog"
                ></Button>
                <Divider />
                <Button
                    label="로그아웃"
                    class="p-field"
                    @click="logout"
                ></Button>
            </div>
        </OverlayPanel>
        <user-setting-panel
            :visible-user-dialog.sync="showUserDialog"
        ></user-setting-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        title: String
    },
    data() {
        return {
            showUserDialog: false
        };
    },
    computed: {
        userName() {
            const _user_name = this.$store.state.sessionStorage.auth.user.name;
            return `${_user_name} 님`;
        }
    },
    methods: {
        toggleSidebar() {
            this.$store.commit('sessionStorage/SIDEBARTOGGLE');
        },
        toggleUserSetting(event: Event) {
            const ele: any = this.$refs.userSettingPanel;
            ele.toggle(event);
        },
        openInfoSettingDialog(event: Event) {
            this.showUserDialog = true;
        },
        logout() {
            this.$store.dispatch('sessionStorage/SIGNOUT').then(() => {
                this.$router.push({ name: 'login' });
            });
        }
    }
});
</script>

<style lang="scss" scoped>
.i-title {
    font-size: 1.6rem;
    color: var(--text-color);
    width: 10vw;
}
</style>
