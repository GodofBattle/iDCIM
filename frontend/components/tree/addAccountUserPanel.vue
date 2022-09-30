<template>
    <i-dialog
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        :visible.sync="showDialog"
        @hide="onHide"
    >
        <template #header> {{ title }} </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small> {{ who }}를 추가합니다 </small>
            </div>
            <div class="p-field">
                <label for="add-user-id">{{ who }} ID</label>
                <InputText
                    id="add-user-id"
                    ref="managerUserId"
                    v-model="user.USER_ID"
                    type="text"
                    autocomplete="off"
                    aria-describedby="add-user-id-help"
                    :class="{
                        'p-invalid': invalidMessage.USER_ID
                    }"
                    @input="onInputUserId"
                />
                <small id="add-user-id-help" class="p-error">
                    {{ invalidMessage.USER_ID }}
                </small>
            </div>
            <div class="p-field">
                <label for="add-user-name">{{ who }}명</label>
                <InputText
                    id="add-user-name"
                    v-model="user.NAME"
                    type="text"
                    autocomplete="off"
                    aria-describedby="add-user-name-help"
                    :class="{
                        'p-invalid': invalidMessage.NAME
                    }"
                    @input="onInputName"
                />
                <small id="add-user-name-help" class="p-error">
                    {{ invalidMessage.NAME }}
                </small>
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    :style="{ width: '100%' }"
                    :disabled="isDisabled"
                    @click="addManager"
                />
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<AddAccountUserPanel>({
    props: {
        visible: Boolean,
        code: {
            type: String,
            default: 'PERM02'
        },
        userGroupId: {
            type: Number,
            default: null
        }
    },
    apollo: {
        hasUserId: {
            query: gql`
                query ($USER_ID: String) {
                    hasUserId(USER_ID: $USER_ID)
                }
            `,
            skip() {
                return !this.isCheckingdUserId;
            },
            prefetch: false,
            variables() {
                return {
                    USER_ID: this.user.USER_ID
                };
            },
            update: ({ hasUserId }) => hasUserId,
            debounce: 300,
            result({ loading, data }) {
                if (!loading) {
                    const { hasUserId } = data;
                    if (hasUserId === true) {
                        this.invalidMessage.USER_ID =
                            '이미 사용 중인 계정입니다';
                    } else {
                        this.invalidMessage.USER_ID = undefined;
                    }
                }
            }
        }
    }
})
export default class AddAccountUserPanel extends Vue {
    $refs: {
        managerUserId: any;
    };

    user = {
        USER_ID: '',
        NAME: ''
    };

    invalidMessage = {
        USER_ID: undefined as string | undefined,
        NAME: undefined as string | undefined
    };

    isCheckingdUserId: boolean = false;

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get isManager(): boolean {
        return this.$props.code === 'PERM02';
    }

    get isOperator(): boolean {
        return this.$props.code === 'PERM03';
    }

    get who(): string {
        return this.isManager
            ? '관리자'
            : this.isOperator
            ? '운영자'
            : '사용자';
    }

    get title(): string {
        return `${this.who} 계정 추가`;
    }

    onHide() {
        this.user.USER_ID = '';
        this.user.NAME = '';

        this.invalidMessage.USER_ID = undefined;
        this.invalidMessage.NAME = undefined;

        this.isCheckingdUserId = false;
    }

    onInputUserId(input: string) {
        // by shkoh 20220928: 입력 validation check
        this.isCheckingdUserId = false;

        // by shkoh 20220928: Step0. 길이가 0인 경우에는 체크하지 않는다
        if (input.length === 0) {
            this.invalidMessage.USER_ID = undefined;
            this.isCheckingdUserId = false;
            return;
        }

        let is_valid = true;

        // by shkoh 20220928: Step1. 길이 check
        if (input.length < 2) {
            this.invalidMessage.USER_ID = `${this.who} 계정은 2자 이상입니다`;
            is_valid = false;
        }

        if (input.length > 32) {
            this.invalidMessage.USER_ID = `${this.who} 계정은 최대 32자까지 작성 가능합니다`;
            is_valid = false;
        }

        // by shkoh 20220928: Step2. 영문 및 지정 특수기호 check
        const accept_reg = /^[A-z0-9_\-@.]+$/g;
        if (!accept_reg.test(input)) {
            this.invalidMessage.USER_ID = `${this.who} 계정은 영문, 숫자, 밑줄(_), 대시(-), 엣(@), 마침표(.)만 허용됩니다`;
            is_valid = false;
        }

        // by shkoh 20220928: Step3. 위의 상황이 모두 정상 판정되면 db에서 id 중복 check
        if (is_valid) {
            this.invalidMessage.USER_ID = undefined;
            this.isCheckingdUserId = true;
        }
    }

    onInputName(input: string) {
        if (input.length < 1) {
            this.invalidMessage.NAME = `${this.who}명은 1자 이상입니다`;
        } else if (input.length > 64) {
            this.invalidMessage.NAME = `${this.who}명은 최대 64자까지 작성 가능합니다`;
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    addManager() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddUser(
                            USER_ID: "${this.user.USER_ID}"
                            NAME: "${this.user.NAME}"
                            PERM_CD: "${this.$props.code}"
                            USER_GROUP_ID: ${this.$props.userGroupId}
                        )
                    }
                `
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: `${this.who} 계정 등록`,
                    detail: `[계정: ${this.user.USER_ID}] ${this.who} ${this.user.NAME}가 등록되었습니다`,
                    life: 1500
                });

                this.showDialog = false;

                this.$emit('add', {
                    USER_ID: this.user.USER_ID,
                    NAME: this.user.NAME,
                    PERM_CD: this.$props.code,
                    USER_GROUP_ID: this.$props.userGroupId
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `${this.who} 계정 등록 실패`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    get isDisabled(): boolean {
        let is_disabled = false;

        if (this.user.USER_ID.length < 2 || this.user.NAME.length < 1) {
            is_disabled = true;
        }

        if (
            Object.values(this.invalidMessage).some(
                (msg: any) => msg !== undefined
            )
        ) {
            is_disabled = true;
        }

        return is_disabled;
    }
}
</script>
