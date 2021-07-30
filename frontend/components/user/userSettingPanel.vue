<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="false"
        :draggable="true"
    >
        <template #header> 계정설정 </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <label for="username">사용자명</label>
                <InputText
                    id="username"
                    v-model="userName"
                    type="text"
                    aria-describedby="username-help"
                    autocomplete="off"
                ></InputText>
                <small id="username-help" class="p-error">
                    {{ invalidMessageUserName }}
                </small>
            </div>
            <!-- <Divider />
            <div class="p-field">
                <InputSwitch v-model="isChangePassword" />
            </div>
            <div v-if="isChangePassword">
                <div class="p-field">
                    <label for="password">사용자 암호</label>
                    <Password :feedback="false"></Password>
                </div>
                <div class="p-field">
                    <label for="password-reconfirm">사용자 암호 재확인</label>
                    <Password :feedback="false"></Password>
                </div>
            </div> -->
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="적용"
                    icon="pi pi-check"
                    style="width: 100%"
                    @click="applyUserInfo"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        visibleUserDialog: Boolean
    },
    data() {
        return {
            userName: '',
            invalidMessageUserName: undefined as String | undefined,
            isChangePassword: false as Boolean
        };
    },
    computed: {
        showDialog: {
            get() {
                this.userName = this.$store.state.sessionStorage.auth.user.name;
                return this.visibleUserDialog;
            },
            set(new_val) {
                this.$emit('update:visibleUserDialog', new_val);
            }
        }
    },
    watch: {
        userName(val: String) {
            if (val.length < 2) {
                this.invalidMessageUserName = '계정명은 2자 이상이어야 합니다';
            } else if (val.length > 16) {
                this.invalidMessageUserName = '계정명은 16자 이하이어야 합니다';
            } else {
                this.invalidMessageUserName = undefined;
            }
        }
    },
    methods: {
        async applyUserInfo(event: Event) {
            this.$store.dispatch(
                'sessionStorage/CHANGEUSERNAME',
                this.userName
            );
        }
    }
});
</script>
