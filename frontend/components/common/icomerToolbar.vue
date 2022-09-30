<template>
    <div id="i-toolbar">
        <Toolbar>
            <template #start>
                <Button
                    icon="pi pi-bars"
                    class="p-mr-2 p-button-raised p-button-text p-button-secondary"
                    @click="toggleSidebar"
                ></Button>
                <div class="i-title p-text-bold">{{ title }}</div>
            </template>
            <template #end>
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
                    class="p-field p-button-outlined p-button-info p-mb-3"
                    icon="pi pi-user-edit"
                    @click="openInfoSettingDialog"
                />
                <Button
                    label="패스워드 변경"
                    class="p-field p-button-outlined p-button-info"
                    icon="pi pi-key"
                    @click="openPasswordSettingDialog"
                />
                <Divider />
                <Button
                    label="로그아웃"
                    class="p-field"
                    icon="pi pi-sign-out"
                    @click="logout"
                ></Button>
            </div>
        </OverlayPanel>
        <user-setting-panel :visible-user-dialog.sync="showUserDialog" />
        <user-password-setting-panel :visible.sync="showUserPasswordDialog" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerToolBar>({
    props: {
        title: String
    }
})
export default class IcomerToolBar extends Vue {
    $refs!: {
        userSettingPanel: any;
    };

    showUserDialog: boolean = false;
    showUserPasswordDialog: boolean = false;

    get userName(): string {
        const _user_name = this.$store.state.sessionStorage.auth.user.name;
        return `${_user_name} 님`;
    }

    toggleSidebar() {
        this.$store.commit('sessionStorage/SIDEBARTOGGLE');
    }

    toggleUserSetting(event: PointerEvent) {
        this.$refs.userSettingPanel.toggle(event);
    }

    openInfoSettingDialog() {
        this.showUserDialog = true;
    }

    openPasswordSettingDialog() {
        this.showUserPasswordDialog = true;
    }

    logout() {
        this.$store.dispatch('sessionStorage/SIGNOUT').then(() => {
            this.$router.push({ name: 'login' });
        });
    }
}
</script>

<style lang="scss" scoped>
.i-title {
    font-size: 1.6rem;
    color: var(--text-color);
    width: 20vw;
}
</style>
