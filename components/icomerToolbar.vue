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
                    label="계정설정"
                    class="p-field p-button-outlined p-button-info"
                ></Button>
                <Divider />
                <Button label="로그아웃" class="p-field"></Button>
            </div>
        </OverlayPanel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        title: String,
    },
    computed: {
        userName() {
            const user_name = '아이커머 관리자';
            return `${user_name}님`;
        },
    },
    methods: {
        toggleSidebar() {
            this.$store.commit('site/toggle');
        },
        toggleUserSetting(event: Event) {
            const ele: any = this.$refs.userSettingPanel;
            ele.toggle(event);
        },
    },
});
</script>

<style lang="scss" scoped>
.i-title {
    font-size: 1.6rem;
    color: var(--text-color);
    width: 10vw;
}
</style>
