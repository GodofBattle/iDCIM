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
                ></Button>
                <Button
                    class="p-ml-auto p-mr-auto"
                    label="적용"
                    icon="pi pi-check"
                    style="width: 100%"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<SettingAssetTreeEditPanel>({
    props: {
        visible: Boolean,
        nodeKey: [Number, String],
        nodeName: String,
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
    },
})
export default class SettingAssetTreeEditPanel extends Vue {
    assetCodeList = [];

    predefineTreeHier = {
        NAME: '',
    };

    predefineAssetCode = {
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
            this.assetCodeList.some((data: any) => data.CODE === _input)
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

    onDialogHide() {
        this.predefineTreeHier.NAME = '';

        this.predefineAssetCode.CODE = '';
        this.predefineAssetCode.NAME = '';
        this.predefineAssetCode.ALIAS = '';

        this.invalidMessageOnTree.NAME = undefined;

        this.invalidMessageOnCode.CODE = undefined;
        this.invalidMessageOnCode.NAME = undefined;
        this.invalidMessageOnCode.ALIAS = undefined;
    }

    get title(): string {
        return `자산트리 수정`;
    }

    get subTitle(): string {
        return `[${this.$props.isAssetCode ? '자산분류코드' : '자산트리'}] "${
            this.$props.nodeName
        }" 항목을 수정합니다`;
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }
}
</script>