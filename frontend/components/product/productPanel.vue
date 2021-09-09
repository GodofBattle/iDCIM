<template>
    <ScrollPanel v-if="productId > 0" id="productPanel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">{{ productName }}</div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-check"
                    label="적용"
                    class="p-mr-2"
                    :disabled="applyButtonDisabled"
                    @click="updateProduct"
                ></Button>
                <Button
                    icon="pi pi-trash"
                    label="삭제"
                    class="p-button-danger"
                    @click="deleteProduct"
                >
                </Button>
            </div>
        </div>
        <Divider />
        <div class="p-grid p-px-2">
            <div class="p-col-3 p-fluid p-input-filled p-mr-6">
                <div class="p-field">
                    <label for="asset_cd">자산분류</label>
                    <Dropdown
                        id="asset-code"
                        v-model="newProductData.ASSET_CD"
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
                        v-model="newProductData.NAME"
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
                        v-model="newProductData.MODEL_NAME"
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
                    <div class="p-field-check p-mb-2">
                        <Checkbox
                            id="image-file"
                            v-model="chkImageFileField"
                            :binary="true"
                        ></Checkbox>
                        <label for="image-file">제품 이미지</label>
                    </div>

                    <div v-if="chkImageFileField">
                        <FileUpload
                            name="IMAGE_FILE"
                            mode="basic"
                            :customUpload="true"
                            @uploader="imageFileUpload"
                            accept="image/*"
                            :maxFileSize="10 * 1024 * 1024"
                            chooseLabel="이미지 추가"
                            :disabled="!chkImageFileField"
                            :auto="true"
                        />
                        <img class="p-mt-2 product-image" :src="image_file" />
                    </div>
                </div>
                <div class="p-field">
                    <label for="remark">설명</label>
                    <Textarea
                        id="remark"
                        v-model="newProductData.REMARK"
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
            <div class="p-col-3 p-fluid p-input-filled">
                <div class="p-field">
                    <label for="info">부가정보(스펙)</label>
                    <DataTable
                        :value="productInfo"
                        class="p-datatable-sm"
                        :reorderableColumns="true"
                        editMode="cell"
                        @row-reorder="onRowReorder"
                    >
                        <Column
                            :rowReorder="true"
                            headerStyle="width: 2rem;"
                        ></Column>
                        <Column
                            field="key"
                            headerStyle="width: 30%;"
                            bodyStyle="overflow-wrap: break-word"
                        >
                            <template #editor="slotProps">
                                <InputText
                                    v-model="
                                        slotProps.data[slotProps.column.field]
                                    "
                                    autofocus
                                ></InputText>
                            </template>
                        </Column>
                        <Column
                            field="value"
                            bodyStyle="overflow-wrap: break-word"
                        >
                            <template #editor="slotProps">
                                <InputText
                                    v-model="
                                        slotProps.data[slotProps.column.field]
                                    "
                                    autofocus
                                ></InputText>
                            </template>
                        </Column>
                    </DataTable>
                    <Button
                        class="p-mt-2"
                        icon="pi pi-plus"
                        :style="{
                            width: '20px',
                            height: '20px',
                            padding: '0px',
                        }"
                        @click="addProductInfo"
                    ></Button>
                </div>
            </div>
        </div>
    </ScrollPanel>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import gql from 'graphql-tag';

type Product = {
    [index: string]: string | number | undefined;
    ASSET_CD: string;
    NAME: string;
    MODEL_NAME: string;
    IMAGE_FILE_ID: number | undefined;
    INFO: string;
    REMARK: string;
};

@Component({
    props: {
        productId: Number,
    },
    apollo: {
        productData: {
            query: gql`
                query Product($ID: ID!) {
                    Product(ID: $ID) {
                        ID
                        ASSET_CD
                        NAME
                        MODEL_NAME
                        INFO
                        REMARK
                    }
                }
            `,
            prefetch: false,
            update: (data) => data.Product,
            variables() {
                return {
                    ID: this.productId < 0 ? -1 : this.productId,
                };
            },
            result({ data, loading }) {
                if (!loading) {
                    const { Product } = data;

                    if (Product) {
                        this.apolloFetch(Product);
                    }
                }
            },
        },
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
export default class ProductPanel extends Vue {
    productData: Product = {
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        INFO: '',
        IMAGE_FILE_ID: undefined,
        REMARK: '',
    };

    newProductData: Product = {
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        INFO: '',
        IMAGE_FILE_ID: undefined,
        REMARK: '',
    };

    invalidMessage = {
        NAME: undefined as String | undefined,
        MODEL_NAME: undefined as String | undefined,
        REMARK: undefined as String | undefined,
    };

    assetCodeList: Array<any> = [];

    productInfo: Array<any> = [];

    image_file = '';

    apolloFetch(product: any): void {
        for (const key of Object.keys(this.newProductData)) {
            this.newProductData[key] = product[key];
        }
    }

    get productName(): string {
        return this.productData ? this.productData.NAME : '';
    }

    get applyButtonDisabled(): Boolean {
        let is_disabled = true;
        return is_disabled;
    }

    // by shkoh 20210909: Image File
    get chkImageFileField(): boolean {
        return this.newProductData?.IMAGE_FILE_ID ? true : false;
    }

    set chkImageFileField(flag: boolean) {
        this.newProductData.IMAGE_FILE_ID = flag ? 1 : undefined;
    }

    updateProduct() {
        this.$toast.add({
            severity: 'info',
            summary: 'updateProduct',
            life: 1000,
        });
    }

    deleteProduct() {
        this.$toast.add({
            severity: 'info',
            summary: 'deleteProduct',
            life: 1000,
        });
    }

    validateName(input: InputEvent) {}
    validateModelName(input: InputEvent) {}
    validateRemark(input: InputEvent) {}

    addProductInfo() {
        this.productInfo.push({ key: '(key)', value: '(value)' });
    }

    onRowReorder(event: any) {
        this.productInfo = event.value;
    }

    imageFileUpload(event: any) {
        console.info(event);

        this.image_file = event.files[0].objectURL;

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation AddFile($FILE: Upload!) {
                        AddFile(FILE: $FILE)
                    }
                `,
                variables: {
                    FILE: event.files[0],
                },
            })
            .then((result) => {
                console.info(result);
            })
            .catch((error) => {
                console.error(error);
            });
    }
}
</script>

<style lang="scss">
.i-title {
    font-size: 1.6rem;
    color: var(--text-color);
    width: 10vw;
}

#productPanel {
    .p-datatable.p-datatable-sm .p-datatable-thead > tr > th {
        padding: 0px;
    }

    .p-fluid .p-fileupload .p-button {
        width: 100%;
    }

    .product-image {
        max-width: 100%;
        max-height: 30vh;
        border-radius: 3px;
    }
}
</style>