<template>
    <div v-if="!$apollo.$loading" id="i-manager-panel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center p-text-bold i-title">
                {{ user.USER_ID }}
            </div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-trash"
                    label="삭제"
                    class="p-button-danger"
                    @click="onClickDeleteManager"
                />
            </div>
        </div>
        <Divider class="p-mb-0" />
        <i-scroll-panel class="i-content-panel">
            <div class="p-d-flex p-p-2 p-input-filled p-flex-column">
                <div class="p-field">
                    <small>{{ description }}</small>
                </div>
                <div class="p-field">
                    <Button
                        label="패스워드 초기화"
                        class="p-button-info"
                        @click="onClickResetPassword"
                    />
                </div>
            </div>
        </i-scroll-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';

interface User {
    [index: string]: string;
    USER_ID: string;
    NAME: string;
}

@Component<ManagerPanel>({
    props: {
        userId: Number
    },
    apollo: {
        user: {
            query: gql`
                query ($ID: Int!) {
                    UserInfo(ID: $ID) {
                        USER_ID
                        NAME
                    }
                }
            `,
            skip() {
                return this.$props.userId < 0;
            },
            variables() {
                return {
                    ID: this.$props.userId
                };
            },
            update: ({ UserInfo }) => UserInfo
        }
    }
})
export default class ManagerPanel extends Vue {
    user: User = {
        USER_ID: '',
        NAME: ''
    };

    get description(): string {
        return `관리자 [${this.user.NAME}]의 계정을 관리합니다`;
    }

    onClickDeleteManager() {
        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `관리자 계정을 삭제하시겠습니까?\n삭제된 계정은 다시는 사용하실 수 없습니다`,
            header: `관리자 계정 [${this.user.USER_ID}] 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.deleteManager();
            }
        });
    }

    deleteManager() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    DeleteUser(USER_ID: "${this.user.USER_ID}")
                }
            `
            })
            .then(({ data: { DeleteUser } }) => {
                if (DeleteUser) {
                    this.$toast.add({
                        severity: 'info',
                        summary: `계정 삭제`,
                        detail: `계정 [${this.user.USER_ID}] 가 삭제 되었습니다.`,
                        life: 2000
                    });

                    eventBus.$emit('refreshAccountTree');
                    this.$emit('reset');
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `계정 [${this.user.USER_ID}] 삭제에 실패하였습니다`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onClickResetPassword() {
        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `패스워드를 초기화하시겠습니까? 계정과 동일하게 변경됩니다`,
            header: `관리자 계정 [${this.user.USER_ID}] 패스워드 초기화`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.resetPassword();
            }
        });
    }

    resetPassword() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    ResetPassword(USER_ID: "${this.user.USER_ID}")
                }
            `
            })
            .then(({ data: { ResetPassword } }) => {
                if (ResetPassword) {
                    this.$toast.add({
                        severity: 'info',
                        summary: `계정 [${this.user.USER_ID}] 패스워드 초기화 완료`,
                        detail: `계정명과 동일하게 패스워드가 초기화 되었습니다.`,
                        life: 2000
                    });
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `계정 [${this.user.USER_ID}] 패스워스 초기화 실패`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }
}
</script>

<style lang="scss" scoped>
#i-manager-panel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 10vw;
    }
}
</style>
