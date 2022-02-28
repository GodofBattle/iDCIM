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
            <div v-if="!isAssetCode">
                <div class="p-field">
                    <label for="assetTreeName">자산트리명</label>
                    <InputText
                        v-model="predefineTreeHier.NAME"
                        id="assetTreeName"
                        type="text"
                        autocomplete="off"
                        aria-describedby="assetTreeName-help"
                        :class="{
                            'p-invalid': invalidMessageOnTree.NAME,
                        }"
                        @input="validateAssetTreeName"
                    ></InputText>
                    <small id="assetTreeName-help" class="p-error">
                        {{ invalidMessageOnTree.NAME }}
                    </small>
                </div>
            </div>
            <div v-else>
                <div class="p-field">
                    <label for="assetCode">자산분류 코드(예시: A003)</label>
                    <InputText
                        v-model="predefineAssetCode.CODE"
                        id="assetCode"
                        type="text"
                        autocomplete="off"
                        aria-describedby="assetCode-help"
                        :class="{
                            'p-invalid': invalidMessageOnCode.CODE,
                        }"
                        @input="validateAssetCode"
                    ></InputText>
                    <small id="assetCode-help" class="p-error">
                        {{ invalidMessageOnCode.CODE }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="assetCodeName">자산분류 코드명</label>
                    <InputText
                        v-model="predefineAssetCode.NAME"
                        id="assetCodeName"
                        type="text"
                        autocomplete="off"
                        aria-describedby="assetCodeName-help"
                        :class="{
                            'p-invalid': invalidMessageOnCode.NAME,
                        }"
                        @input="validateAssetCodeName"
                    ></InputText>
                    <small id="assetCodeName-help" class="p-error">
                        {{ invalidMessageOnCode.NAME }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="assetCodeAlias">자산분류 별칭</label>
                    <InputText
                        v-model="predefineAssetCode.ALIAS"
                        id="assetCodeAlias"
                        type="text"
                        autocomplete="off"
                        aria-describedby="assetCodeAlias-help"
                        :class="{
                            'p-invalid': invalidMessageOnCode.ALIAS,
                        }"
                        @input="validateAssetCodeAlias"
                    ></InputText>
                    <small id="assetCodeAlias-help" class="p-error">
                        {{ invalidMessageOnCode.ALIAS }}
                    </small>
                </div>
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
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type AssetTreeHier = {
    NAME: string;
};

type AssetTreeCode = {
    [index: string]: string;
    CODE: string;
    NAME: string;
    ALIAS: string;
};

@Component<SettingAssetTreeEditPanel>({
    props: {
        visible: Boolean,
        nodeKey: [Number, String],
        isAssetCode: Boolean,
    },
    apollo: {
        assetCodeList: {
            query: gql`
                query {
                    PredefinedAssetCodes {
                        CODE
                        NAME
                    }
                }
            `,
            update: ({ PredefinedAssetCodes }) => {
                return PredefinedAssetCodes;
            },
        },
        dbPredefineTreeHier: {
            query: gql`
                query PredefinedAssetHier($ID: ID!) {
                    PredefinedAssetHier(ID: $ID) {
                        NAME
                    }
                }
            `,
            variables(): any {
                return {
                    ID: this.nodeKey ? this.nodeKey : -1,
                };
            },
            prefetch: false,
            update: ({ PredefinedAssetHier }) => PredefinedAssetHier,
            skip: true,
            result({ data, loading }: any) {
                if (!loading) {
                    const { PredefinedAssetHier } = data;
                    if (PredefinedAssetHier) {
                        this.apolloFetchToHier(PredefinedAssetHier);
                    }
                }
            },
        },
        dbPredefineAssetCode: {
            query: gql`
                query PredefinedAssetCode($CODE: String!) {
                    PredefinedAssetCode(CODE: $CODE) {
                        CODE
                        NAME
                        ALIAS
                    }
                }
            `,
            variables(): any {
                return {
                    CODE: this.nodeKey ? this.nodeKey : '',
                };
            },
            prefetch: false,
            update: ({ PredefinedAssetCode }) => PredefinedAssetCode,
            skip: true,
            result({ data, loading }: any) {
                if (!loading) {
                    const { PredefinedAssetCode } = data;
                    if (PredefinedAssetCode) {
                        this.apolloFetchToCode(PredefinedAssetCode);
                    }
                }
            },
        },
    },
})
export default class SettingAssetTreeEditPanel extends Vue {
    assetCodeList = [];

    dbPredefineTreeHier: AssetTreeHier = {
        NAME: '',
    };
    dbPredefineAssetCode: AssetTreeCode = {
        CODE: '',
        NAME: '',
        ALIAS: '',
    };

    predefineTreeHier: AssetTreeHier = {
        NAME: '',
    };

    predefineAssetCode: AssetTreeCode = {
        CODE: '',
        NAME: '',
        ALIAS: '',
    };

    invalidMessageOnTree = {
        NAME: undefined as string | undefined,
    };

    invalidMessageOnCode = {
        CODE: undefined as string | undefined,
        NAME: undefined as string | undefined,
        ALIAS: undefined as string | undefined,
    };

    apolloFetchToHier(pd_asset_hier: any) {
        this.predefineTreeHier.NAME = pd_asset_hier.NAME;
    }

    apolloFetchToCode(pd_asset_code: any) {
        this.predefineAssetCode.CODE = pd_asset_code.CODE;
        this.predefineAssetCode.NAME = pd_asset_code.NAME;
        this.predefineAssetCode.ALIAS = pd_asset_code.ALIAS;
    }

    validateAssetTreeName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessageOnTree.NAME = '자산트리명은 32자 이하입니다';
        } else {
            this.invalidMessageOnTree.NAME = undefined;
        }
    }

    validateAssetCode(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 8) {
            this.invalidMessageOnCode.CODE = '자산분류 코드는 8자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessageOnCode.CODE =
                '자산분류 코드는 2자 이하일 수 없습니다';
        } else if (
            this.assetCodeList.some(
                (data: any) =>
                    data.CODE === _input && this.$props.nodeKey !== _input
            )
        ) {
            this.invalidMessageOnCode.CODE = '동일한 코드가 존재합니다';
        } else {
            this.invalidMessageOnCode.CODE = undefined;
        }
    }

    validateAssetCodeName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessageOnCode.NAME =
                '자산분류 코드명은 32자 이하입니다';
        } else {
            this.invalidMessageOnCode.NAME = undefined;
        }
    }

    validateAssetCodeAlias(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessageOnCode.ALIAS =
                '자산분류 코드 별칭은 32자 이하입니다';
        } else {
            this.invalidMessageOnCode.ALIAS = undefined;
        }
    }

    validationCheck() {
        let is_valid = true;

        const values = this.$props.isAssetCode
            ? Object.values(this.invalidMessageOnCode)
            : Object.values(this.invalidMessageOnTree);
        for (const valid of values) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
    }

    onDialogShow() {
        if (this.$props.isAssetCode) {
            // by shkoh 20220225: 자산분류코드 다이얼로그가 팝업될 경우
            this.$apollo.queries.dbPredefineAssetCode.start();
        } else {
            // by shkoh 20220225: 자산트리 다이얼로그가 팝업될 경우
            this.$apollo.queries.dbPredefineTreeHier.start();
        }
    }

    onDialogHide() {
        this.predefineTreeHier.NAME = '';

        this.predefineAssetCode.CODE = '';
        this.predefineAssetCode.NAME = '';
        this.predefineAssetCode.ALIAS = '';

        this.invalidMessageOnTree.NAME = undefined;

        this.invalidMessageOnCode.CODE = undefined;
        this.invalidMessageOnCode.NAME = undefined;
        this.invalidMessageOnCode.ALIAS = undefined;

        if (this.$props.isAssetCode) {
            // by shkoh 20220225: 자산분류코드 다이얼로그가 팝업될 경우
            this.$apollo.queries.dbPredefineAssetCode.stop();
        } else {
            // by shkoh 20220225: 자산트리 다이얼로그가 팝업될 경우
            this.$apollo.queries.dbPredefineTreeHier.stop();
        }
    }

    onClickApplyButton() {
        if (!this.validationCheck()) {
            this.$toast.add({
                severity: 'warn',
                summary: '자산트리 항목 유효성 실패',
                detail: '자산트리 입력항목들을 확인하세요',
                life: 2000,
            });
            return;
        }

        if (this.$props.isAssetCode) {
            this.editAssetCode();
        } else {
            this.editAssetTreeHier();
        }
    }

    editAssetTreeHier() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        UpdatePredefinedAssetHier (
                            ID: ${Number(this.$props.nodeKey)}
                            NAME: "${this.predefineTreeHier.NAME}"
                        )
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '자산트리 변경완료',
                    detail: `${this.predefineTreeHier.NAME} 변경 완료`,
                    life: 1500,
                });

                this.$emit('asset-edit', `pah_${this.$props.nodeKey}`);

                this.showDialog = false;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산트리 변경 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    editAssetCode() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        UpdatePredefinedAssetCode (
                            ID: "${this.$props.nodeKey}"
                            CODE: "${this.predefineAssetCode.CODE}"
                            NAME: "${this.predefineAssetCode.NAME}"
                            ALIAS: "${this.predefineAssetCode.ALIAS}"
                        )
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '자산분류코드 변경완료',
                    detail: `${this.predefineAssetCode.NAME}의 정보가 변경되었습니다`,
                    life: 1500,
                });

                this.$emit('asset-edit', `pac_${this.predefineAssetCode.CODE}`);

                this.showDialog = false;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산분류코드 변경 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onClickDeleteButton() {
        const message = this.$props.isAssetCode
            ? `[${this.dbPredefineAssetCode.NAME}] 자산분류코드를 삭제하시겠습니까?\n해당 자산분류코드를 사용 중에 있다면 삭제가 불가합니다`
            : `[${this.dbPredefineTreeHier.NAME}] 자산트리를 삭제하시겠습니까?\n하위 트리노드가 존재하는 경우에는 삭제가 불가합니다`;
        const header = this.$props.isAssetCode
            ? `자산분류코드 [${this.dbPredefineAssetCode.NAME}] 삭제`
            : `자산트리 ${this.dbPredefineTreeHier.NAME} 삭제`;

        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: message,
            header: header,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                if (this.$props.isAssetCode) {
                    this.deleteAssetCode();
                } else {
                    this.deleteAssetHier();
                }
            },
        });
    }

    deleteAssetHier() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeletePredefinedAssetHier(
                            ID: ${Number(this.$props.nodeKey)}
                        )
                    }
                `,
            })
            .then(({ data: { DeletePredefinedAssetHier } }) => {
                if (DeletePredefinedAssetHier === -1) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: '자산트리 삭제 불가',
                        detail: `${this.predefineTreeHier.NAME}의 하위노드가 존재하여 삭제할 수 없습니다`,
                        life: 2500,
                    });
                } else {
                    this.$toast.add({
                        severity: 'success',
                        summary: '자산트리 삭제완료',
                        detail: `${this.predefineTreeHier.NAME}가 삭제되었습니다`,
                        life: 2000,
                    });

                    this.$emit('asset-edit', `pah_${this.$props.nodeKey}`);

                    this.showDialog = false;
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산트리 삭제 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    deleteAssetCode() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeletePredefinedAssetCode(
                            CODE: "${this.$props.nodeKey}"
                        )
                    }
                `,
            })
            .then(({ data: { DeletePredefinedAssetCode } }) => {
                if (DeletePredefinedAssetCode === -1) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: '자산분류코드 삭제 불가',
                        detail: `자산분류코드 ${this.predefineAssetCode.NAME}를 사용하는 항목이 존재하여 삭제할 수 없습니다`,
                        life: 2500,
                    });
                } else {
                    this.$toast.add({
                        severity: 'success',
                        summary: '자산분류코드 삭제완료',
                        detail: `${this.predefineAssetCode.NAME}가 삭제되었습니다`,
                        life: 2000,
                    });

                    this.$emit(
                        'asset-edit',
                        `pah_${this.predefineAssetCode.CODE}`
                    );

                    this.showDialog = false;
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산분류코드 삭제 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    get title(): string {
        return `자산트리 수정`;
    }

    get subTitle(): string {
        return `[${this.$props.isAssetCode ? '자산분류코드' : '자산트리'}] "${
            this.$props.isAssetCode
                ? this.dbPredefineAssetCode?.NAME
                : this.dbPredefineTreeHier?.NAME
        }" 항목을 수정합니다`;
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get deleteButtonDisabled(): boolean {
        return true;
    }

    get applyButtonDisabled(): boolean {
        return this.$props.isAssetCode
            ? this.disabledAssetCode
            : this.disabledAssetTree;
    }

    get disabledAssetTree(): boolean {
        return this.dbPredefineTreeHier.NAME === this.predefineTreeHier.NAME;
    }

    get disabledAssetCode(): boolean {
        let is_disabled = true;

        for (const key of Object.keys(this.predefineAssetCode)) {
            if (
                this.predefineAssetCode[key] !== this.dbPredefineAssetCode[key]
            ) {
                is_disabled = false;
                break;
            }
        }

        return is_disabled;
    }
}
</script>