<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header> {{ title }} </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small> {{ subTitle }} </small>
            </div>
            <div class="p-field">
                <label for="type">추가 자산타입</label>
                <SelectButton
                    v-model="selectedType"
                    :options="assetTreeTypes"
                    optionLabel="name"
                    optionValue="code"
                >
                </SelectButton>
            </div>
            <div v-if="isTreeType">
                <div class="p-field">
                    <label for="assetTreeName">자산트리명</label>
                    <InputText
                        v-model="treeName"
                        id="assetTreeName"
                        type="text"
                        autocomplete="off"
                        aria-describedby="assetTreeName-help"
                        :class="{
                            'p-invalid': invalidMessageOnTree.AssetTreeName,
                        }"
                        @input="validateAssetTreeName"
                    ></InputText>
                    <small id="assetTreeName-help" class="p-error">
                        {{ invalidMessageOnTree.AssetTreeName }}
                    </small>
                </div>
            </div>
            <div v-else>
                <div class="p-field">
                    <label for="assetCode">자산분류 코드(예시: A003)</label>
                    <InputText
                        v-model="assetCode"
                        id="assetCode"
                        type="text"
                        autocomplete="off"
                        aria-describedby="assetCode-help"
                        :class="{
                            'p-invalid': invalidMessageOnCode.AssetCode,
                        }"
                        @input="validateAssetCode"
                    ></InputText>
                    <small id="assetCode-help" class="p-error">
                        {{ invalidMessageOnCode.AssetCode }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="assetCodeName">자산분류 코드명</label>
                    <InputText
                        v-model="codeName"
                        id="assetCodeName"
                        type="text"
                        autocomplete="off"
                        aria-describedby="assetCodeName-help"
                        :class="{
                            'p-invalid': invalidMessageOnCode.AssetCodeName,
                        }"
                        @input="validateAssetCodeName"
                    ></InputText>
                    <small id="assetCodeName-help" class="p-error">
                        {{ invalidMessageOnCode.AssetCodeName }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="assetCodeAlias">자산분류 별칭</label>
                    <InputText
                        v-model="codeAlias"
                        id="assetCodeAlias"
                        type="text"
                        autocomplete="off"
                        aria-describedby="assetCodeAlias-help"
                        :class="{
                            'p-invalid': invalidMessageOnCode.AssetCodeAlias,
                        }"
                        @input="validateAssetCodeAlias"
                    ></InputText>
                    <small id="assetCodeAlias-help" class="p-error">
                        {{ invalidMessageOnCode.AssetCodeAlias }}
                    </small>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    style="width: 100%"
                    :disabled="isDisabledAddButton"
                    @click="onClickAddButton"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<SettingAssetTreeAddPanel>({
    props: {
        visible: Boolean,
        parentKey: [Number, String],
        parentName: String,
        newOrder: Number,
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
    },
})
export default class SettingAssetTreeAddPanel extends Vue {
    assetTreeTypes = [
        { code: 'tree', name: '자산트리' },
        { code: 'code', name: '자산분류코드' },
    ];

    assetCodeList = [];

    selectedType = 'tree';

    treeName: string = '';
    assetCode: string = '';
    codeName: string = '';
    codeAlias: string = '';

    invalidMessageOnTree = {
        AssetTreeName: undefined as String | undefined,
    };

    invalidMessageOnCode = {
        AssetCode: undefined as String | undefined,
        AssetCodeName: undefined as String | undefined,
        AssetCodeAlias: undefined as String | undefined,
    };

    onDialogHide() {
        // by shkoh 20220225: dialog 패널이 닫힐 때, 관련된 모든 값들을 초기화함
        this.selectedType = 'tree';

        this.treeName = '';
        this.assetCode = '';
        this.codeName = '';
        this.codeAlias = '';

        this.invalidMessageOnTree.AssetTreeName = undefined;
        this.invalidMessageOnCode.AssetCode = undefined;
        this.invalidMessageOnCode.AssetCodeName = undefined;
        this.invalidMessageOnCode.AssetCodeAlias = undefined;
    }

    validateAssetTreeName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessageOnTree.AssetTreeName =
                '자산트리명은 32자 이하입니다';
        } else {
            this.invalidMessageOnTree.AssetTreeName = undefined;
        }
    }

    validateAssetCode(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 8) {
            this.invalidMessageOnCode.AssetCode =
                '자산분류 코드는 8자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessageOnCode.AssetCode =
                '자산분류 코드는 2자 이하일 수 없습니다';
        } else if (
            this.assetCodeList.some((data: any) => data.CODE === _input)
        ) {
            this.invalidMessageOnCode.AssetCode = '동일한 코드가 존재합니다';
        } else {
            this.invalidMessageOnCode.AssetCode = undefined;
        }
    }

    validateAssetCodeName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessageOnCode.AssetCodeName =
                '자산분류 코드명은 32자 이하입니다';
        } else {
            this.invalidMessageOnCode.AssetCodeName = undefined;
        }
    }

    validateAssetCodeAlias(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessageOnCode.AssetCodeAlias =
                '자산분류 코드 별칭은 32자 이하입니다';
        } else {
            this.invalidMessageOnCode.AssetCodeAlias = undefined;
        }
    }

    onClickAddButton() {
        if (!this.validationCheck) {
            this.$toast.add({
                severity: 'warn',
                summary: '자산트리 항목 유효성 실패',
                detail: '자산트리 입력항목들을 확인하세요',
                life: 2000,
            });
            return;
        }

        if (this.isTreeType) {
            this.addTreeNode();
        } else {
            this.addAssetCodeNode();
        }
    }

    addTreeNode() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddPredefineAssetCodeHier (
                            NAME: "${this.treeName}"
                            P_ID: ${this.$props.parentKey}
                            ORDER: ${this.$props.newOrder}
                        )
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '자산트리 추가',
                    detail: `${this.treeName} 추가 완료`,
                    life: 1500,
                });

                // by shkoh 20220225: 새로 추가된 경우에는 해당 노드를 펼침
                this.$emit('asset-add', `pah_${this.$props.parentKey}`);

                this.showDialog = false;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산트리 추가 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    addAssetCodeNode() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddPredefineAssetCode (
                            CODE: "${this.assetCode}"
                            NAME: "${this.codeName}"
                            ALIAS: "${this.codeAlias}"
                            PD_ASSET_HIER_ID: ${this.$props.parentKey}
                            ORDER: ${this.$props.newOrder}
                        )
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '자산분류코드 추가',
                    detail: `${this.codeName} | ${this.assetCode} 추가 완료`,
                    life: 1800,
                });

                // by shkoh 20220225: 새로 추가된 경우에는 해당 노드를 펼침
                this.$emit('asset-add', `pah_${this.$props.parentKey}`);

                this.showDialog = false;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산분류코드 추가 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    get title(): string {
        return `자산트리 추가`;
    }

    get subTitle(): string {
        return `${this.$props.parentName}의 하위 ${
            this.isTreeType ? '자산트리' : '자산분류코드'
        } 항목을 추가합니다`;
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get isTreeType(): boolean {
        return this.selectedType === 'tree';
    }

    get isDisabledAddButton(): boolean {
        let is_disabled = false;

        if (this.isTreeType) {
            if (this.treeName.length < 1) is_disabled = true;
        } else {
            if (this.codeName.length < 1) is_disabled = true;
        }

        return is_disabled;
    }

    get validationCheck(): boolean {
        let is_valid = true;

        const values = this.isTreeType
            ? Object.values(this.invalidMessageOnTree)
            : Object.values(this.invalidMessageOnCode);
        for (const valid of values) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
    }
}
</script>