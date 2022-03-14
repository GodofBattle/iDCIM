<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @show="onDialogShow"
        @hide="onDialogHide"
    >
        <template #header> {{ title }} </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small> {{ subTitle }} </small>
            </div>
            <div class="p-field">
                <label for="assetTreeName">위치트리명</label>
                <InputText
                    v-model="treeHier.NAME"
                    id="positionTreeName"
                    type="text"
                    autocomplete="off"
                    aria-describedby="positionTreeName-help"
                    :class="{
                        'p-invalid': invalidInput.NAME,
                    }"
                    @input="validateTreeName"
                ></InputText>
                <small id="positionTreeName-help" class="p-error">
                    {{ invalidInput.NAME }}
                </small>
            </div>
        </div>

        <template #footer>
            <div class="p-d-flex">
                <Button
                    class="p-mr-1 p-col-fixed p-button-danger"
                    label="삭제"
                    icon="pi pi-times"
                    style="width: 60px"
                    @click="onClickDeleteButton"
                ></Button>
                <Button
                    class="p-ml-auto p-mr-auto"
                    label="적용"
                    icon="pi pi-check"
                    style="width: 100%"
                    :disabled="applyButtonDisabled"
                    @click="onClickApplyButton"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import gql from 'graphql-tag';

type TreeHier = {
    NAME: string;
};

@Component<SettingPositionTreeEditPanel>({
    props: {
        visible: Boolean,
        nodeKey: [Number, String],
    },
    apollo: {
        dbTreeHier: {
            query: gql`
                query AccountCustomHier($TID: Int) {
                    AccountCustomHier(TYPE: "P", TID: $TID) {
                        NAME
                    }
                }
            `,
            variables(): any {
                return {
                    TID: this.nodeKey ? this.nodeKey : -1,
                };
            },
            prefetch: false,
            update: ({ AccountCustomHier }) => AccountCustomHier,
            skip: true,
            result({ data, loading }: any) {
                if (!loading) {
                    const { AccountCustomHier } = data;
                    if (AccountCustomHier) {
                        this.apolloFetch(AccountCustomHier);
                    }
                }
            },
        },
    },
})
export default class SettingPositionTreeEditPanel extends Vue {
    dbTreeHier: TreeHier = {
        NAME: '',
    };

    treeHier: TreeHier = {
        NAME: '',
    };

    invalidInput = {
        NAME: undefined as string | undefined,
    };

    apolloFetch(ac_custom_hier: any) {
        this.treeHier.NAME = ac_custom_hier.NAME;
    }

    onDialogShow() {
        this.$apollo.queries.dbTreeHier.start();
    }

    onDialogHide() {
        this.treeHier.NAME = '';
        this.invalidInput.NAME = undefined;
        this.$apollo.queries.dbTreeHier.stop();
    }

    validateTreeName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidInput.NAME = '위치트리명은 32자 이하입니다';
        } else {
            this.invalidInput.NAME = undefined;
        }
    }

    onClickDeleteButton() {
        const header = `위치트리 항목 [${this.dbTreeHier.NAME}] 삭제`;
        const message = `[${this.dbTreeHier.NAME}] 위치트리 항목을 삭제하시겠습니까?\n하위 항목이 존재하는 경우에는 삭제가 불가합니다`;

        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: message,
            header: header,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.deleteNode();
            },
        });
    }

    onClickApplyButton() {
        if (!this.validationCheck) {
            this.$toast.add({
                severity: 'warn',
                summary: '위치트리 항목 유효성 실패',
                detail: '위치트리 입력항목들을 확인하세요',
                life: 2000,
            });
            return;
        }

        this.editNode();
    }

    editNode() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        UpdateCustomHier (
                            TYPE: "P"
                            TID: ${this.$props.nodeKey}
                            NAME: "${this.treeHier.NAME}"
                        )
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '자산분류코드 변경완료',
                    detail: `${this.dbTreeHier.NAME}의 정보가 변경되었습니다`,
                    life: 1500,
                });

                this.$emit('tree-edit', `ach_${this.$props.nodeKey}`);

                this.showDialog = false;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '위치트리 변경 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    deleteNode() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeleteCustomHier (
                            TYPE: "P"
                            TID: ${this.$props.nodeKey}
                        )
                    }
                `,
            })
            .then(({ data: { DeleteCustomHier } }) => {
                if (DeleteCustomHier === -1) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: '위치트리 삭제 불가',
                        detail: `${this.dbTreeHier.NAME}의 하위 항목이 존재하여 삭제할 수 없습니다`,
                        life: 2500,
                    });
                } else {
                    this.$toast.add({
                        severity: 'success',
                        summary: '위치트리 삭제완료',
                        detail: `${this.dbTreeHier.NAME}가 삭제되었습니다`,
                        life: 2000,
                    });

                    this.$emit('tree-edit', `ach_${this.$props.nodeKey}`);

                    this.showDialog = false;
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '위치트리 삭제 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    get title(): string {
        return '위치트리 수정';
    }

    get subTitle(): string {
        return `하위트리 항목을 수정합니다`;
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get applyButtonDisabled(): boolean {
        return (
            this.dbTreeHier.NAME === this.treeHier.NAME ||
            this.treeHier.NAME.length < 1
        );
    }

    get validationCheck(): boolean {
        let is_valid = true;

        for (const valid of Object.values(this.invalidInput)) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
    }
}
</script>