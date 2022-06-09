<template>
    <i-dialog
        id="i-virtual-product-add-dialog"
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header>가상 제품 추가</template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small>가상제품을 추가합니다</small>
            </div>
            <div class="p-field">
                <label for="asset-code">자산분류</label>
                <Dropdown
                    id="asset-code"
                    v-model="newVirtualProductData.ASSET_CD"
                    :options="assetCodeList"
                    option-label="NAME"
                    option-value="CODE"
                    placeholder="자산유형을 선택하세요"
                    :filter="true"
                    filter-placeholder="검색"
                    empty-filter-message="해당 유형의 자산은 존재하지 않습니다"
                    append-to="body"
                ></Dropdown>
            </div>
            <div class="p-field">
                <label for="name">제품명</label>
                <InputText
                    id="name"
                    v-model="newVirtualProductData.NAME"
                    type="text"
                    aria-describedby="name-help"
                    autocomplete="off"
                    :class="{ 'p-invalid': invalidMessage.NAME }"
                    @input="validateName"
                ></InputText>
                <small id="name-help" class="p-error">
                    {{ invalidMessage.NAME }}
                </small>
            </div>
            <div class="p-field">
                <label for="remark">설명</label>
                <Textarea
                    id="remark"
                    v-model="newVirtualProductData.REMARK"
                    :auto-resize="false"
                    rows="6"
                    style="resize: none"
                    :class="{ 'p-invalid': invalidMessage.REMARK }"
                    @input="validateRemark"
                />
                <small id="remark-help" class="p-error">
                    {{ invalidMessage.REMARK }}
                </small>
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    :style="{ width: '100%' }"
                    :disabled="addButtonDisabled"
                    @click="addProduct"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type vProduct = {
    [index: string]: string;
    ASSET_CD: string;
    NAME: string;
    REMARK: string;
};

@Component<VirtualProductAddDialog>({
    props: {
        visible: Boolean
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
            }
        }
    }
})
export default class VirtualProductAddDialog extends Vue {
    assetCodeList: Array<any> = [];

    newVirtualProductData: vProduct = {
        ASSET_CD: '',
        NAME: '',
        REMARK: ''
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        REMARK: undefined as string | undefined
    };

    onDialogHide() {
        // by shkoh 20220609: Dialog가 닫힐 때, Object를 초기화
        this.newVirtualProductData.ASSET_CD = '';
        this.newVirtualProductData.NAME = '';
        this.newVirtualProductData.REMARK = '';

        this.invalidMessage.NAME = '';
        this.invalidMessage.REMARK = '';
    }

    validateName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 64) {
            this.invalidMessage.NAME = '제품명은 64자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessage.NAME = '제품명은 1자 이상입니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    validateRemark(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 256) {
            this.invalidMessage.REMARK = '설명은 256자 이하입니다';
        } else {
            this.invalidMessage.REMARK = undefined;
        }
    }

    addProduct() {
        if (!this.validationCheck) {
            this.$toast.add({
                severity: 'warn',
                summary: '제품 유효성 실패',
                detail: '제품 내용을 확인하세요',
                life: 2000
            });

            return;
        }

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation AddProduct(
                        $MANUFACTURER_ID: Int!
                        $ASSET_CD: String
                        $NAME: String
                        $MODEL_NAME: String
                        $REMARK: String
                    ) {
                        AddProduct(
                            MANUFACTURER_ID: $MANUFACTURER_ID
                            ASSET_CD: $ASSET_CD
                            NAME: $NAME
                            MODEL_NAME: $MODEL_NAME
                            REMARK: $REMARK
                        )
                    }
                `,
                variables: {
                    MANUFACTURER_ID: 0,
                    ASSET_CD: this.newVirtualProductData.ASSET_CD,
                    NAME: this.newVirtualProductData.NAME,
                    MODEL_NAME: '',
                    REMARK: this.newVirtualProductData.REMARK
                }
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '제품 추가',
                    detail: `${this.newVirtualProductData.NAME} 추가완료`,
                    life: 1500
                });

                this.$emit('refresh');

                this.showDialog = false;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '제품 추가 실패',
                    detail: error.message,
                    life: 2000
                });
            });
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get addButtonDisabled(): boolean {
        let is_disabled = false;

        ['ASSET_CD', 'NAME'].forEach((key) => {
            if (this.newVirtualProductData[key].length < 2) {
                is_disabled = true;
            }
        });

        return is_disabled;
    }

    get validationCheck(): boolean {
        let is_valid = true;

        for (const valid of Object.values(this.invalidMessage)) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
    }
}
</script>
