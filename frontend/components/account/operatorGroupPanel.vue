<template>
    <div v-if="!$apollo.$loading" id="i-operator-group-panel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center p-text-bold i-title">
                {{ dbOpGroup.NAME }}
            </div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-check"
                    label="적용"
                    class="p-button-success p-mr-2"
                    :disabled="isDisabledApplyButton"
                    @click="onClickUpdateOperatorGroup"
                />
                <Button
                    icon="pi pi-trash"
                    label="삭제"
                    class="p-button-danger"
                    @click="onClickDeleteOperatorGroup"
                />
            </div>
        </div>
        <Divider class="p-mb-0" />
        <i-scroll-panel class="i-content-panel">
            <div class="p-d-flex p-p-2 p-input-filled p-flex-column">
                <div class="p-field">
                    <small>{{ dbOpGroup.NAME }} 운영그룹을 관리합니다</small>
                </div>
                <div class="p-col-3 p-fluid p-input-filled">
                    <div class="p-field">
                        <label for="name">운영그룹명</label>
                        <InputText
                            id="name"
                            v-model="opGroup.NAME"
                            type="text"
                            autocomplete="off"
                            aria-describedby="name-help"
                            :class="{ 'p-invalid': invalidMessage.NAME }"
                            @input="onInputName"
                        />
                        <small id="name-help" class="p-error">
                            {{ invalidMessage.NAME }}
                        </small>
                    </div>
                    <div class="p-field">
                        <label for="remark">설명</label>
                        <Textarea
                            id="remark"
                            v-model="opGroup.REMARK"
                            rows="6"
                            autocomplete="off"
                            aria-describedby="remark-help"
                            :auto-resize="false"
                            :style="{ resize: 'none' }"
                            :class="{ 'p-invalid': invalidMessage.REMARK }"
                            @input="onInputRemark"
                        />
                        <small id="remark-help" class="p-error">
                            {{ invalidMessage.REMARK }}
                        </small>
                    </div>
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

interface OperatorGroup {
    [index: string]: number | string;
    NAME: string;
    REMARK: string;
}

@Component<OperatorGroupPanel>({
    props: {
        groupId: Number
    },
    apollo: {
        dbOpGroup: {
            query: gql`
                query ($ID: Int!) {
                    OperatorGroup(ID: $ID) {
                        NAME
                        REMARK
                    }
                }
            `,
            skip() {
                return this.$props.groupId < 0;
            },
            variables() {
                return {
                    ID: this.$props.groupId
                };
            },
            update: ({ OperatorGroup }) => OperatorGroup,
            result({ loading, data }) {
                if (!loading) {
                    const { OperatorGroup } = data;

                    if (OperatorGroup) {
                        this.apolloFetch(OperatorGroup);
                    }
                }
            }
        }
    }
})
export default class OperatorGroupPanel extends Vue {
    dbOpGroup: OperatorGroup = {
        NAME: '',
        REMARK: ''
    };

    opGroup: OperatorGroup = {
        NAME: '',
        REMARK: ''
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        REMARK: undefined as string | undefined
    };

    refresh() {
        this.$apollo.queries.dbOpGroup.refresh();
    }

    apolloFetch(data: OperatorGroup) {
        for (const [key, value] of Object.entries(data)) {
            this.opGroup[key] = value;
        }
    }

    onInputName(input: string) {
        if (input.length < 1) {
            this.invalidMessage.NAME = '운영그룹명은 1자 이상입니다';
        } else if (input.length > 64) {
            this.invalidMessage.NAME = '운영그룹명은 64자를 넘을 수 없습니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    onInputRemark(input: string) {
        if (input.length > 256) {
            this.invalidMessage.REMARK = '설명은 256자를 넘을 수 없습니다';
        } else {
            this.invalidMessage.REMARK = undefined;
        }
    }

    onClickDeleteOperatorGroup() {
        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `운영그룹을 삭제하시겠습니까?\n해당 운영그룹을 사용하고 있는 계정이 존재할 경우에는 삭제가 불가합니다\n삭제된 계정은 다시는 사용하실 수 없습니다`,
            header: `운영그룹 [${this.dbOpGroup.NAME}] 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.deleteOperatorGroup();
            }
        });
    }

    deleteOperatorGroup() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    DeleteOperatorGroup(ID: ${this.$props.groupId})
                }
            `
            })
            .then(({ data: { DeleteOperatorGroup } }) => {
                if (DeleteOperatorGroup) {
                    this.$toast.add({
                        severity: 'info',
                        summary: `운영그룹 삭제`,
                        detail: `운영그룹 [${this.dbOpGroup.NAME}]가 삭제 되었습니다.`,
                        life: 2000
                    });

                    eventBus.$emit('refreshAccountTree');
                    this.$emit('reset');
                } else {
                    this.$toast.add({
                        severity: 'warning',
                        summary: `운영그룹 삭제 실패`,
                        detail: `운영그룹 [${this.dbOpGroup.NAME}] 내 계정이 존재하거나, 삭제가 이루어지지 않았습니다`,
                        life: 3000
                    });
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `운영그룹 [${this.dbOpGroup.NAME}] 삭제에 실패하였습니다`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onClickUpdateOperatorGroup() {
        const update_info = {
            ID: this.$props.groupId
        };

        for (const [key, value] of Object.entries(this.opGroup)) {
            if (value !== this.dbOpGroup[key]) {
                this.$set(update_info, key, value);
            }
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($ID: Int!, $NAME: String, $REMARK: String) {
                        UpdateOperatorGroup(
                            ID: $ID
                            NAME: $NAME
                            REMARK: $REMARK
                        )
                    }
                `,
                variables: update_info
            })
            .then(({ data: { UpdateOperatorGroup } }) => {
                if (UpdateOperatorGroup) {
                    this.$toast.add({
                        severity: 'info',
                        summary: `운영그룹 변경`,
                        detail: `운영그룹 [${this.dbOpGroup.NAME}]가 변경 되었습니다.`,
                        life: 2000
                    });

                    eventBus.$emit('refreshAccountTree');

                    this.refresh();
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: `운영그룹 [${this.dbOpGroup.NAME}] 변경 작업에 실패했습니다`,
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    get isValid(): boolean {
        let is_valid = true;
        for (const value of Object.values(this.invalidMessage)) {
            if (value !== undefined) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
    }

    get isDisabledApplyButton(): boolean {
        let is_disabled = true;
        for (const [key, value] of Object.entries(this.dbOpGroup)) {
            if (value !== this.opGroup[key]) {
                is_disabled = false;
                break;
            }
        }

        return is_disabled || !this.isValid;
    }
}
</script>

<style lang="scss" scoped>
#i-operator-group-panel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 10vw;
    }
}
</style>
