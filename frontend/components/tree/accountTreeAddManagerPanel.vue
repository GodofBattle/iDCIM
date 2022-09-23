<template>
    <i-dialog
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        :visible.sync="showDialog"
        @hide="onHide"
    >
        <template #header> 관리자 추가 </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small> 관리자를 추가합니다 </small>
            </div>
            <div class="p-field">
                <label for="add-user-id">관리자 ID</label>
                <InputText
                    id="add-user-id"
                    v-model="manager.USER_ID"
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
                <label for="add-user-name">관리자명</label>
                <InputText
                    id="add-user-name"
                    v-model="manager.NAME"
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
import { eventBus } from '@/plugins/vueEventBus';

@Component<AccoutTreeAddManagerPanel>({
    props: {
        visible: Boolean
    },
    apollo: {
        hasUserId: {
            query: gql`
                query ($USER_ID: String) {
                    hasUserId(USER_ID: $USER_ID)
                }
            `,
            skip() {
                return (
                    this.manager.USER_ID.length < 2 ||
                    this.manager.USER_ID.length > 32 ||
                    this.timer_user_id !== null
                );
            },
            variables() {
                return {
                    USER_ID: this.manager.USER_ID
                };
            },
            update: ({ hasUserId }) => hasUserId
        }
    },
    watch: {
        hasUserId(_has: boolean) {
            if (_has) {
                this.invalidMessage.USER_ID =
                    '이미 사용 중인 ID입니다. 다른 ID를 지정해 주세요';
            } else {
                this.invalidMessage.USER_ID = undefined;
            }
        }
    }
})
export default class AccoutTreeAddManagerPanel extends Vue {
    manager = {
        USER_ID: '',
        NAME: ''
    };

    invalidMessage = {
        USER_ID: undefined as string | undefined,
        NAME: undefined as string | undefined
    };

    hasUserId: boolean = false;
    timer_user_id: any = null;

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    onHide() {
        this.manager.USER_ID = '';
        this.manager.NAME = '';

        this.invalidMessage.USER_ID = undefined;
        this.invalidMessage.NAME = undefined;

        this.hasUserId = false;
        this.timer_user_id = null;
    }

    onInputUserId(input: string) {
        if (this.timer_user_id) {
            return;
        }

        this.timer_user_id = setTimeout(() => {
            if (input.length < 2) {
                this.invalidMessage.USER_ID = '관리자 ID는 2자 이상입니다';
            } else if (input.length > 32) {
                this.invalidMessage.USER_ID =
                    '관리자 ID는 최대 32자까지 작성 가능합니다';
            } else {
                this.invalidMessage.USER_ID = undefined;
            }

            this.timer_user_id = null;
        }, 200);
    }

    onInputName(input: string) {
        if (input.length < 1) {
            this.invalidMessage.NAME = '관리자명은 1자 이상입니다';
        } else if (input.length > 64) {
            this.invalidMessage.NAME =
                '관리자명은 최대 64자까지 작성 가능합니다';
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
                        AddManager(
                            USER_ID: "${this.manager.USER_ID}"
                            NAME: "${this.manager.NAME}"
                        )
                    }
                `
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '관리자 계정 등록',
                    detail: `[ID: ${this.manager.USER_ID}] 관리자 ${this.manager.NAME}가 등록되었습니다`,
                    life: 1500
                });

                this.showDialog = false;

                eventBus.$emit('refreshAccountTree');
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '관리자 계정 등록 실패',
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

        if (this.manager.USER_ID.length < 2 || this.manager.NAME.length < 1) {
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
