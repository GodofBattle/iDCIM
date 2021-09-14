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

                <Divider />

                <div class="p-field">
                    <div class="p-field-check">
                        <Checkbox
                            id="image-file"
                            v-model="chkImageFileField"
                            class="p-mr-1"
                            :binary="true"
                        ></Checkbox>
                        <label for="image-file">제품 이미지</label>
                    </div>

                    <div v-if="chkImageFileField" class="p-mt-2">
                        <div class="p-d-flex">
                            <div class="p-mr-1" style="width: 100%">
                                <i-file-upload
                                    ref="imageFileUploader"
                                    name="IMAGE_FILE"
                                    mode="basic"
                                    :custom-upload="true"
                                    accept="image/*"
                                    :max-file-size="10 * 1024 * 1024"
                                    choose-label="이미지 추가"
                                    :disabled="!chkImageFileField"
                                    :auto="true"
                                    :show-cancel-button="true"
                                    @uploader="imageFileUpload"
                                    @clear="imageFileClear"
                                />
                            </div>
                        </div>
                        <img class="p-mt-2 product-image" :src="image_file" />
                    </div>
                </div>
                <Divider />
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
                        edit-mode="cell"
                        @row-reorder="onRowReorder"
                    >
                        <Column
                            :row-reorder="true"
                            header-style="width: 2rem;"
                        ></Column>
                        <Column
                            field="key"
                            header-style="width: 30%;"
                            body-style="overflow-wrap: break-word"
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
                            body-style="overflow-wrap: break-word"
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
                            :row-reorder="false"
                            header-style="width: 3rem;"
                        >
                            <template #body="slotProps">
                                <Button
                                    icon="pi pi-times"
                                    class="
                                        p-button-rounded
                                        p-button-danger
                                        p-button-text
                                    "
                                    @click="deleteProductInfo(slotProps.index)"
                                ></Button>
                            </template>
                        </Column>
                    </DataTable>
                    <Button
                        class="p-mt-2"
                        icon="pi pi-plus"
                        :style="{
                            width: '20px',
                            height: '20px',
                            padding: '0px'
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
import gql from 'graphql-tag';
import iFileUpload from '../custom/iFileUpload.vue';
import Component from '@/plugins/nuxt-class-component';

type Product = {
    [index: string]: string | number | undefined;
    MANUFACTURER_ID: number;
    ASSET_CD: string;
    NAME: string;
    MODEL_NAME: string;
    IMAGE_FILE_ID: number | undefined;
    INFO: string;
    REMARK: string;
    IMAGE_FILE: any;
};

@Component<ProductPanel>({
    components: { iFileUpload },
    props: {
        productId: Number
    },
    watch: {
        productInfo(_info: any[]) {
            this.parseProductInfo(_info);
        }
    },
    apollo: {
        productData: {
            query: gql`
                query Product($ID: ID!) {
                    Product(ID: $ID) {
                        ID
                        MANUFACTURER_ID
                        ASSET_CD
                        NAME
                        MODEL_NAME
                        INFO
                        IMAGE_FILE_ID
                        REMARK
                    }
                }
            `,
            prefetch: false,
            update: ({ Product }: any) => {
                if (Product.INFO === null) Product.INFO = '';

                return Product;
            },
            variables(): any {
                return {
                    ID: this.productId < 0 ? -1 : this.productId
                };
            },
            result({ data, loading }: any) {
                if (!loading) {
                    const { Product } = data;

                    if (Product) {
                        this.apolloFetch(Product);
                    }
                }
            }
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
            update: ({ PredefinedAssetCodes }: any) => PredefinedAssetCodes
        }
    }
})
export default class ProductPanel extends Vue {
    $refs!: {
        imageFileUploader: any;
    };

    productData: Product = {
        MANUFACTURER_ID: -1,
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        INFO: '',
        IMAGE_FILE_ID: undefined,
        REMARK: '',
        IMAGE_FILE: undefined
    };

    newProductData: Product = {
        MANUFACTURER_ID: -1,
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        INFO: '',
        IMAGE_FILE_ID: undefined,
        REMARK: '',
        IMAGE_FILE: undefined
    };

    invalidMessage = {
        NAME: undefined as String | undefined,
        MODEL_NAME: undefined as String | undefined,
        REMARK: undefined as String | undefined
    };

    assetCodeList: Array<any> = [];

    productInfo: Array<any> = [];

    image_file = '';
    image_file_blob: any = undefined;
    chkImageFileField = false;
    imageFileUploader = null;

    apolloFetch(product: any): void {
        for (const key of Object.keys(this.newProductData)) {
            this.newProductData[key] = product[key];
        }

        // by shkoh 20210910: Apollo Server로부터 값을 받아올 때 이미지 파일 소스도 초기화함
        if (product.IMAGE_FILE_ID) {
            this.loadImageFile(product.IMAGE_FILE_ID);
        } else {
            this.chkImageFileField = false;
            this.image_file = '';
            this.image_file_blob = undefined;
        }
    }

    parseProductInfo(info: any[]): void {
        this.newProductData.INFO = info.length > 0 ? JSON.stringify(info) : '';
    }

    get productName(): string {
        return this.productData ? this.productData.NAME : '';
    }

    get applyButtonDisabled(): Boolean {
        let is_disabled = true;

        // by shkoh 20210910: API로부터 받은 제품정보와 작성자가 수정했을 경우의 데이터를 비교
        for (const key of Object.keys(this.newProductData)) {
            if (this.productData[key] !== this.newProductData[key]) {
                is_disabled = false;
                break;
            }
        }

        return is_disabled;
    }

    get isChangedImageFile() {
        return (
            this.chkImageFileField &&
            this.newProductData.IMAGE_FILE_ID === -1 &&
            this.productData.IMAGE_FILE?.size !== this.image_file_blob?.size
        );
    }

    updateProduct() {
        if (!this.validationCheck()) {
            this.$toast.add({
                severity: 'warn',
                summary: '제품 유효성 실패',
                detail: '제품 내용을 확인하세요',
                life: 2000
            });
            return;
        }

        const variables = {
            ID: this.$props.productId,
            MANUFACTURER_ID: this.newProductData.MANUFACTURER_ID,
            ASSET_CD: this.newProductData.ASSET_CD,
            NAME: this.newProductData.NAME,
            MODEL_NAME: this.newProductData.MODEL_NAME
        };

        ['INFO', 'REMARK'].forEach((key: string) => {
            if (this.newProductData[key] !== this.productData[key]) {
                Object.defineProperty(variables, key, {
                    value: this.newProductData[key],
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            }
        });

        // by shkoh 20210914: 기존에 이미지파일이 설정되었다면
        if (
            this.productData.IMAGE_FILE_ID &&
            this.productData.IMAGE_FILE_ID > 0
        ) {
            Object.defineProperty(variables, 'IMAGE_FILE_ID', {
                value: this.productData.IMAGE_FILE_ID,
                configurable: true,
                enumerable: true,
                writable: true
            });
        }

        if (this.isChangedImageFile) {
            Object.defineProperty(variables, 'IMAGE_FILE', {
                value: this.image_file_blob,
                configurable: true,
                enumerable: true,
                writable: true
            });
        }

        console.info(variables);

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: ID!
                        $MANUFACTURER_ID: Int!
                        $ASSET_CD: String!
                        $NAME: String!
                        $MODEL_NAME: String!
                        $INFO: String
                        $IMAGE_FILE_ID: Int
                        $REMARK: String
                        $IMAGE_FILE: Upload
                    ) {
                        UpdateProduct(
                            ID: $ID
                            MANUFACTURER_ID: $MANUFACTURER_ID
                            ASSET_CD: $ASSET_CD
                            NAME: $NAME
                            MODEL_NAME: $MODEL_NAME
                            INFO: $INFO
                            IMAGE_FILE_ID: $IMAGE_FILE_ID
                            REMARK: $REMARK
                            IMAGE_FILE: $IMAGE_FILE
                        )
                    }
                `,
                variables
            })
            .then(() => {
                this.productDataRefresh();

                this.$toast.add({
                    severity: 'info',
                    summary: '제품 변경 완료',
                    detail: `${this.newProductData.NAME} 제품 변경`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '제품 변경 실패',
                    detail: error.message,
                    life: 2000
                });
            });
    }

    deleteProduct() {
        this.$toast.add({
            severity: 'info',
            summary: 'deleteProduct',
            life: 1000
        });
    }

    validationCheck() {
        let is_valid = true;
        for (const valid of Object.values(this.invalidMessage)) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
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

    validateModelName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessage.MODEL_NAME = '모델명은 32자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessage.MODEL_NAME = '모델명은 1자 이상입니다';
        } else {
            this.invalidMessage.MODEL_NAME = undefined;
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

    addProductInfo() {
        this.productInfo.push({ key: 'key', value: 'value' });
    }

    deleteProductInfo(idx: number) {
        this.productInfo.splice(idx, 1);
    }

    onRowReorder(event: any) {
        this.productInfo = event.value;
    }

    imageFileUpload(event: any) {
        this.image_file = event.files[0].objectURL;
        this.image_file_blob = event.files[0];

        // by shkoh 20210913: IMAGE가 변경되는 경우는 -1로 지정함
        this.newProductData.IMAGE_FILE_ID = -1;
    }

    imageFileClear() {
        this.image_file = '';
        this.image_file_blob = undefined;
        this.newProductData.IMAGE_FILE_ID = this.productData.IMAGE_FILE_ID;
    }

    loadImageFile(ID: number) {
        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${ID}) {
                        FILE_NAME
                        DATA
                        MIMETYPE
                    }
                }
            `
            })
            .then(({ data }) => {
                const pd_file = data.PdFile;

                this.chkImageFileField = true;

                // by shkoh 20210914: API 서버로부터 이미지가 존재할 경우에는 따로 로드하여 UI에 등록함
                // by shkoh 20210914: iFileUpload Component에서 강제로 파일을 등록하는 절차를 수행함
                // by shkoh 20210914: $refs로 접근하기 위해서는 $nextTick을 한 후에 수행
                this.$nextTick(() => {
                    const buf = Buffer.from(pd_file.DATA, 'base64');
                    const previous_file = new File(
                        [buf.buffer],
                        pd_file.FILE_NAME,
                        {
                            type: pd_file.MIMETYPE
                        }
                    );

                    this.productData.IMAGE_FILE = previous_file;

                    this.$refs.imageFileUploader.forceInsertFile(previous_file);
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '파일 로드 실패',
                    detail: error.message,
                    life: 2000
                });
            });
    }

    productDataRefresh() {
        this.$apollo.queries.productData.refresh();
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

    .product-image {
        max-width: 100%;
        max-height: 30vh;
        border-radius: 3px;
    }
}
</style>
