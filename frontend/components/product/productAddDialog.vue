<template>
    <i-dialog
        id="i-product-add-dialog"
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header> 제품 추가 </template>

        <ScrollPanel :style="{ height: '50vh', 'padding-right': '0.4rem' }">
            <div class="p-fluid p-input-filled">
                <div class="p-field">
                    <small>{{ subTitle }}</small>
                </div>
                <div class="p-field">
                    <label for="asset-code">자산분류</label>
                    <Dropdown
                        id="asset-code"
                        v-model="newData.ASSET_CD"
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
                        v-model="newData.NAME"
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
                    <label for="model-name">모델명</label>
                    <InputText
                        id="model-name"
                        v-model="newData.MODEL_NAME"
                        type="text"
                        aria-describedby="model-name-help"
                        autocomplete="off"
                        :class="{ 'p-invalid': invalidMessage.MODEL_NAME }"
                        @input="validateModelName"
                    ></InputText>
                    <small id="model-name-help" class="p-error">
                        {{ invalidMessage.MODEL_NAME }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="remark">설명</label>
                    <Textarea
                        id="remark"
                        v-model="newData.REMARK"
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
        </ScrollPanel>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    style="width: 100%"
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

type Product = {
    [index: string]: string;
    ASSET_CD: string;
    NAME: string;
    MODEL_NAME: string;
    REMARK: string;
};

export default Vue.extend({
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
    },
    props: {
        manufacturerId: Number,
        manufacturerName: String,
        visibleAddProductDialog: Boolean
    },
    data: () => ({
        newData: {
            ASSET_CD: '',
            NAME: '',
            MODEL_NAME: '',
            REMARK: ''
        } as Product,
        invalidMessage: {
            NAME: undefined as string | undefined,
            MODEL_NAME: undefined as string | undefined,
            REMARK: undefined as string | undefined
        },
        assetCodeList: [] as Array<any>
    }),
    computed: {
        showDialog: {
            get(): Boolean {
                return this.visibleAddProductDialog;
            },
            set(is_show: Boolean) {
                this.$emit('update:visibleAddProductDialog', is_show);
            }
        },
        subTitle: {
            get(): string {
                return `${this.manufacturerName} 제품을 추가합니다`;
            }
        },
        addButtonDisabled: {
            get(): boolean {
                let is_disabled = false;

                ['ASSET_CD', 'NAME', 'MODEL_NAME'].forEach((key) => {
                    if (this.newData[key].length < 2) is_disabled = true;
                });

                return is_disabled;
            }
        }
    },
    methods: {
        onDialogHide() {
            // by shkoh 20210903: Dialog가 닫힐 때, Object를 초기화
            this.newData.ASSET_CD = '';
            this.newData.NAME = '';
            this.newData.MODEL_NAME = '';
            this.newData.REMARK = '';

            this.invalidMessage.NAME = '';
            this.invalidMessage.MODEL_NAME = '';
            this.invalidMessage.REMARK = '';
        },
        validationCheck() {
            let is_valid = true;

            for (const valid of Object.values(this.invalidMessage)) {
                if (valid) {
                    is_valid = false;
                    break;
                }
            }

            return is_valid;
        },
        addProduct() {
            if (!this.validationCheck()) {
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
                            $NAME: String
                            $ASSET_CD: String
                            $MODEL_NAME: String
                            $REMARK: String
                        ) {
                            AddProduct(
                                MANUFACTURER_ID: $MANUFACTURER_ID
                                NAME: $NAME
                                ASSET_CD: $ASSET_CD
                                MODEL_NAME: $MODEL_NAME
                                REMARK: $REMARK
                            )
                        }
                    `,
                    variables: {
                        MANUFACTURER_ID: this.manufacturerId,
                        NAME: this.newData.NAME,
                        ASSET_CD: this.newData.ASSET_CD,
                        MODEL_NAME: this.newData.MODEL_NAME,
                        REMARK: this.newData.REMARK
                    }
                })
                .then(() => {
                    this.$toast.add({
                        severity: 'success',
                        summary: '제품 추가',
                        detail: `${this.newData.NAME} 추가완료`,
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
        },
        validateName(input: InputEvent) {
            const _input = input.toString();
            if (_input.length > 64) {
                this.invalidMessage.NAME = '제품명은 64자 이하입니다';
            } else if (_input.length < 2) {
                this.invalidMessage.NAME = '제품명은 1자 이상입니다';
            } else {
                this.invalidMessage.NAME = undefined;
            }
        },
        validateModelName(input: InputEvent) {
            const _input = input.toString();
            if (_input.length > 32) {
                this.invalidMessage.MODEL_NAME = '모델명은 32자 이하입니다';
            } else if (_input.length < 2) {
                this.invalidMessage.MODEL_NAME = '모델명은 1자 이상입니다';
            } else {
                this.invalidMessage.MODEL_NAME = undefined;
            }
        },
        validateRemark(input: InputEvent) {
            const _input = input.toString();
            if (_input.length > 256) {
                this.invalidMessage.REMARK = '설명은 256자 이하입니다';
            } else {
                this.invalidMessage.REMARK = undefined;
            }
        }
    }
});
</script>
