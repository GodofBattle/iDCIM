<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="false"
        :draggable="true"
    >
        <template #header> 계정 패스워드 변경 </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <label for="password">새로운 패스워드</label>
                <Password :feedback="false" />
            </div>
            <div class="p-field">
                <label for="password-reconfirm">패스워드 확인</label>
                <Password :feedback="false" />
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="적용"
                    icon="pi pi-check"
                    :style="{ width: '100%' }"
                />
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<UserPasswordSettingPanel>({
    props: {
        visible: Boolean
    }
})
export default class UserPasswordSettingPanel extends Vue {
    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }
}
</script>
