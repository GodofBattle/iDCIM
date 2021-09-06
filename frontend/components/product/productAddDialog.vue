<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header> 제품 추가 </template>

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

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    style="width: 100%"
                    @click="addProduct"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

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
        },
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
        addProduct() {
            this.$toast.add({
                severity: 'info',
                summary: 'addProduct',
                life: 1000
            });
        },
        validateRemark(input: InputEvent) {}
    }
});
</script>
