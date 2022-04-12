<template>
    <div v-if="productId > 0" id="productPanel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">
                {{ productName }}
            </div>
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
        <ScrollPanel class="i-product-scrollpanel">
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
                                id="manual-file"
                                v-model="chkManualFileField"
                                class="p-mr-1"
                                :binary="true"
                            >
                            </Checkbox>
                            <label for="manual-file">제품 매뉴얼</label>

                            <div v-if="chkManualFileField" class="p-mt-2">
                                <div class="p-d-flex">
                                    <div class="p-mr-1" style="width: 100%">
                                        <i-file-upload
                                            ref="manualFileUploader"
                                            name="MANUAL_FILE"
                                            mode="basic"
                                            accept=""
                                            choose-label="매뉴얼 추가"
                                            :custom-upload="true"
                                            :max-file-size="100 * 1024 * 1024"
                                            :auto="true"
                                            :show-cancel-button="true"
                                            @uploader="manualFileUpload"
                                            @clear="manualFileClear"
                                        />
                                    </div>
                                </div>
                                <Button
                                    v-if="manual_file_name.length > 0"
                                    class="p-mt-2 p-text-left p-button-sm p-button-outlined p-button-secondary"
                                    :label="manual_file_name"
                                    icon="pi pi-download"
                                    @click="manualFileDownload"
                                ></Button>
                            </div>
                        </div>
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
                                        :auto="true"
                                        :show-cancel-button="true"
                                        @uploader="imageFileUpload"
                                        @clear="imageFileClear"
                                    />
                                </div>
                            </div>
                            <img
                                class="p-mt-2 product-image"
                                :src="image_file"
                            />
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
                <div class="p-col-3 p-fluid p-input-filled p-mr-6">
                    <div class="p-field">
                        <label for="info">부가정보(스펙)</label>
                        <DataTable
                            :value="productInfo"
                            class="p-datatable-sm"
                            edit-mode="cell"
                            @row-reorder="onRowReorder"
                            @cell-edit-complete="onCellEditComplete"
                        >
                            <Column
                                :header-style="{ width: '2rem' }"
                                :row-reorder="true"
                            ></Column>
                            <Column
                                field="key"
                                :header-style="{ width: '30%' }"
                                body-style="overflow-wrap: break-word"
                            >
                                <template #editor="slotProps">
                                    <InputText
                                        v-model="
                                            slotProps.data[
                                                slotProps.column.field
                                            ]
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
                                            slotProps.data[
                                                slotProps.column.field
                                            ]
                                        "
                                        autofocus
                                    ></InputText>
                                </template>
                            </Column>
                            <Column
                                :row-reorder="false"
                                :header-style="{ width: '3rem' }"
                            >
                                <template #body="slotProps">
                                    <Button
                                        icon="pi pi-times"
                                        class="p-button-rounded p-button-danger p-button-text"
                                        @click="
                                            deleteProductInfo(slotProps.index)
                                        "
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
                                padding: '0px',
                            }"
                            @click="addProductInfo"
                        ></Button>
                    </div>
                </div>
                <div class="p-col-3 p-fluid p-input-filled">
                    <div class="p-field">
                        <label for="intf">사용 가능한 인터페이스</label>
                        <DataTable
                            :value="productInterfaces"
                            class="p-datatable-sm"
                        >
                            <Column field="ID">
                                <template #body="slotProps">
                                    <Button
                                        class="p-button-text p-button-info"
                                        :label="
                                            productInterfaceLabel(
                                                slotProps.data
                                            )
                                        "
                                        :style="{ 'text-align': 'left' }"
                                        @click="
                                            showInterfaceTreePanel(
                                                $event,
                                                slotProps.data
                                            )
                                        "
                                    ></Button>
                                </template>
                            </Column>
                            <Column :header-style="{ width: '3rem' }">
                                <template #body="slotProps">
                                    <Button
                                        icon="pi pi-times"
                                        class="p-button-rounded p-button-danger p-button-text"
                                        @click="
                                            deleteProductInterface(
                                                slotProps.index
                                            )
                                        "
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
                                padding: '0px',
                            }"
                            @click="addProductInterface"
                        ></Button>
                    </div>
                </div>
            </div>
        </ScrollPanel>
        <OverlayPanel
            ref="interfaceTreePanel"
            :showCloseIcon="true"
            appendTo="body"
            :style="{ width: '16vw', height: '42vh' }"
        >
            <interface-tree
                :is-editing="false"
                :show-only-parents="true"
                :init-select-keys="selectedKeyToInterfaceTree"
                :style="{ height: 'calc(42vh - 2rem)' }"
                @select="onSelectInterfaceTree"
            ></interface-tree>
        </OverlayPanel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

type Product = {
    [index: string]: string | number | undefined | null;
    MANUFACTURER_ID: number;
    ASSET_CD: string;
    NAME: string;
    MODEL_NAME: string;
    MANUAL_FILE_ID: number | undefined | null;
    IMAGE_FILE_ID: number | undefined | null;
    INFO: string;
    REMARK: string;
    IMAGE_FILE: any;
    MANUAL_FILE: any;
};

@Component<ProductPanel>({
    props: {
        productId: Number,
    },
    watch: {
        productInfo(_info: any[]) {
            this.parseProductInfo(_info);
        },
        chkImageFileField(_is_show) {
            if (_is_show) {
                this.loadImageFile();
            } else {
                this.newProductData.IMAGE_FILE_ID = null;
            }
        },
        chkManualFileField(_is_show) {
            if (_is_show) {
                this.loadManualFile();
            } else {
                this.newProductData.MANUAL_FILE_ID = null;
            }
        },
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
                        MANUAL_FILE_ID
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
                    ID: this.productId < 0 ? -1 : this.productId,
                };
            },
            result({ data, loading }: any) {
                if (!loading) {
                    const { Product } = data;

                    if (Product) {
                        this.apolloFetch(Product);
                    }
                }
            },
        },
        dbProductInterfaces: {
            query: gql`
                query ProductInterfaces($PRODUCT_ID: Int!) {
                    ProductInterfaces(PRODUCT_ID: $PRODUCT_ID) {
                        ID
                        PRODUCT_ID
                        PD_INTF_ID
                        INTERFACE {
                            ASSET_CD
                            NAME
                        }
                    }
                }
            `,
            prefetch: false,
            update: ({ ProductInterfaces }: any) => ProductInterfaces,
            variables(): any {
                return {
                    PRODUCT_ID: this.productId < 0 ? -1 : this.productId,
                };
            },
            result({ data, loading }: any) {
                if (!loading) {
                    const { ProductInterfaces } = data;
                    if (ProductInterfaces) {
                        this.apolloFetchProductInterfaces(ProductInterfaces);
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
            update: ({ PredefinedAssetCodes }: any) => PredefinedAssetCodes,
        },
    },
})
export default class ProductPanel extends Vue {
    $refs!: {
        manualFileUploader: any;
        imageFileUploader: any;
        interfaceTreePanel: any;
    };

    productData: Product = {
        MANUFACTURER_ID: -1,
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        INFO: '',
        IMAGE_FILE_ID: undefined,
        MANUAL_FILE_ID: undefined,
        REMARK: '',
        IMAGE_FILE: undefined,
        MANUAL_FILE: undefined,
    };

    newProductData: Product = {
        MANUFACTURER_ID: -1,
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        INFO: '',
        IMAGE_FILE_ID: undefined,
        MANUAL_FILE_ID: undefined,
        REMARK: '',
        IMAGE_FILE: undefined,
        MANUAL_FILE: undefined,
    };

    invalidMessage = {
        NAME: undefined as String | undefined,
        MODEL_NAME: undefined as String | undefined,
        REMARK: undefined as String | undefined,
    };

    assetCodeList: Array<any> = [];

    productInfo: Array<any> = [];

    dbProductInterfaces: Array<any> = [];
    productInterfaces: Array<any> = [];
    selectedInterface: any = {};
    selectedInterfaceIndex: number = -1;

    image_file = '';
    image_file_blob: any = undefined;
    chkImageFileField = false;
    imageFileUploader = null;

    manual_file_name = '';
    manual_file_blob: any = undefined;
    chkManualFileField = false;
    manualFileUploader = null;

    apolloFetch(product: any): void {
        for (const key of Object.keys(this.newProductData)) {
            this.newProductData[key] = product[key];
        }

        // by shkoh 20210910: Apollo Server로부터 값을 받아올 때 이미지 파일 소스도 초기화함
        if (product.IMAGE_FILE_ID) {
            // by shkoh 20210927: IMAGE_FILE_ID가 존재하는 경우에는 강제로 이미지를 로드한다
            if (this.chkImageFileField) {
                this.loadImageFile();
            } else {
                this.chkImageFileField = true;
            }
        } else {
            this.chkImageFileField = false;
            this.image_file = '';
            this.image_file_blob = undefined;
        }

        if (product.MANUAL_FILE_ID) {
            if (this.chkManualFileField) {
                this.loadManualFile();
            } else {
                this.chkManualFileField = true;
            }
        } else {
            this.chkManualFileField = false;
            this.manual_file_name = '';
            this.manual_file_blob = undefined;
        }

        this.parseInfoString(this.productData.INFO);
    }

    apolloFetchProductInterfaces(data: Array<any>): void {
        this.productInterfaces.splice(0, this.productInterfaces.length);

        data.forEach((_datum: any) => {
            this.productInterfaces.push({
                ID: _datum.ID,
                PRODUCT_ID: _datum.PRODUCT_ID,
                PD_INTF_ID: _datum.PD_INTF_ID,
                INTERFACE: {
                    ASSET_CD: _datum.INTERFACE.ASSET_CD,
                    NAME: _datum.INTERFACE.NAME,
                },
            });
        });
    }

    parseProductInfo(info: any[]): void {
        this.newProductData.INFO = info.length > 0 ? JSON.stringify(info) : '';
    }

    parseInfoString(info: string): void {
        try {
            this.productInfo = JSON.parse(info);
        } catch {
            this.productInfo = [];
        }
    }

    assetName(asset_code: string) {
        const asset_code_item = this.assetCodeList.find(
            (code: any) => code.CODE === asset_code
        );
        return asset_code_item ? asset_code_item.NAME : '';
    }

    productInterfaceLabel(data: any) {
        if (data.ID === null) {
            return '클릭하여 인터페이스 지정';
        }

        if (data.INTERFACE === null) {
            return '';
        }

        const { ASSET_CD, NAME } = data.INTERFACE;
        const label = `${this.assetName(ASSET_CD)}: ${NAME}`;
        return label;
    }

    showInterfaceTreePanel(event: Event, intf_data: any) {
        this.selectedInterface = intf_data;
        this.$refs.interfaceTreePanel.toggle(event);
    }

    get productName(): string {
        return this.productData ? this.productData.NAME : '';
    }

    get applyButtonDisabled(): Boolean {
        let is_disabled = true;

        // by shkoh 20210910: API로부터 받은 제품정보와 작성자가 수정했을 경우의 데이터를 비교
        [
            'MANUFACTURER_ID',
            'ASSET_CD',
            'NAME',
            'MODEL_NAME',
            'INFO',
            'IMAGE_FILE_ID',
            'MANUAL_FILE_ID',
            'REMARK',
        ].forEach((key) => {
            if (this.productData[key] !== this.newProductData[key]) {
                is_disabled = false;
            }
        });

        if (
            this.dbProductInterfaces.length !==
            this.productInterfaces.filter((intf: any) => intf.ID !== null)
                .length
        ) {
            // by shkoh 20220411: 사용 가능한 인터페이스의 전체 숫자가 변경된 경우
            is_disabled = false;
        } else {
            for (const [idx, intf] of Object.entries(
                this.dbProductInterfaces
            )) {
                if (
                    intf.PD_INTF_ID !==
                    this.productInterfaces[parseInt(idx)].PD_INTF_ID
                ) {
                    is_disabled = false;
                    break;
                }
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

    // by shkoh 20210927: 기존에 등록된 제품이 클리어 되었는지 여부
    get isClearImageFile() {
        return (
            !this.chkImageFileField ||
            this.newProductData.IMAGE_FILE_ID === null
        );
    }

    get isChangedManualFile() {
        return (
            this.chkManualFileField &&
            this.newProductData.MANUAL_FILE_ID === -1 &&
            this.productData.MANUAL_FILE?.size !== this.manual_file_blob?.size
        );
    }

    get isClearManualFile() {
        return (
            !this.chkManualFileField ||
            this.newProductData.MANUAL_FILE_ID === null
        );
    }

    updateProduct() {
        if (!this.validationCheck()) {
            this.$toast.add({
                severity: 'warn',
                summary: '제품 유효성 실패',
                detail: '제품 내용을 확인하세요',
                life: 2000,
            });
            return;
        }

        const variables = {
            ID: this.$props.productId,
            MANUFACTURER_ID: this.newProductData.MANUFACTURER_ID,
            ASSET_CD: this.newProductData.ASSET_CD,
            NAME: this.newProductData.NAME,
            MODEL_NAME: this.newProductData.MODEL_NAME,
        };

        ['INFO', 'REMARK'].forEach((key: string) => {
            if (this.newProductData[key] !== this.productData[key]) {
                Object.defineProperty(variables, key, {
                    value: this.newProductData[key],
                    configurable: true,
                    enumerable: true,
                    writable: true,
                });
            }
        });

        if (this.isChangedImageFile) {
            // by shkoh 20210927: 이미지 파일을 추가했거나 변경한 경우
            Object.defineProperty(variables, 'IMAGE_FILE', {
                value: this.image_file_blob,
                configurable: true,
                enumerable: true,
                writable: true,
            });
        }

        // by shkoh 20210927: 이미지 파일을 삭제한 경우
        Object.defineProperty(variables, 'IMAGE_FILE_ID', {
            value: this.isClearImageFile
                ? null
                : this.productData.IMAGE_FILE_ID,
            configurable: true,
            enumerable: true,
            writable: true,
        });

        if (this.isChangedManualFile) {
            Object.defineProperty(variables, 'MANUAL_FILE', {
                value: this.manual_file_blob,
                configurable: true,
                enumerable: true,
                writable: true,
            });
        }

        Object.defineProperty(variables, 'MANUAL_FILE_ID', {
            value: this.isClearManualFile
                ? null
                : this.productData.MANUAL_FILE_ID,
            configurable: true,
            enumerable: true,
            writable: true,
        });

        const insert_product_interfaces = this.productInterfaces
            .filter((intf: any) => intf.ID !== null)
            .map((intf: any) => {
                return intf.PD_INTF_ID;
            });

        Object.defineProperty(variables, 'INPUT', {
            value: insert_product_interfaces,
            configurable: true,
            enumerable: true,
            writable: true,
        });

        // by shkoh 20210927: product panel 데이터 업데이트 loading 페이지 시작
        this.$nuxt.$loading.start();

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
                        $MANUAL_FILE_ID: Int
                        $REMARK: String
                        $IMAGE_FILE: Upload
                        $MANUAL_FILE: Upload
                        $INPUT: [Int!]
                    ) {
                        UpdateProduct(
                            ID: $ID
                            MANUFACTURER_ID: $MANUFACTURER_ID
                            ASSET_CD: $ASSET_CD
                            NAME: $NAME
                            MODEL_NAME: $MODEL_NAME
                            INFO: $INFO
                            IMAGE_FILE_ID: $IMAGE_FILE_ID
                            MANUAL_FILE_ID: $MANUAL_FILE_ID
                            REMARK: $REMARK
                            IMAGE_FILE: $IMAGE_FILE
                            MANUAL_FILE: $MANUAL_FILE
                        )

                        UpdateProductInterfaces(PRODUCT_ID: $ID, INPUT: $INPUT)
                    }
                `,
                variables,
            })
            .then(() => {
                eventBus.$emit('refreshProductTree');
                this.productDataRefresh();

                this.$toast.add({
                    severity: 'info',
                    summary: '제품 변경 완료',
                    detail: `${this.newProductData.NAME} 제품 변경`,
                    life: 2000,
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '제품 변경 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                // by shkoh 20210927: product panel 데이터 업데이트 loading 페이지 종료
                // by shkoh 20210927: update의 성공여부와 관계없이 무조건 종료함
                this.$nuxt.$loading.finish();
            });
    }

    deleteProduct() {
        // by shkoh 20210928: 삭제하기 전에 데이터 갱신
        this.productDataRefresh();

        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `[${this.productName}] 제품을 삭제하시겠습니까?\n사이트에서 해당 제품이 등록되어 있다면 삭제가 불가합니다.(미구현)`,
            header: `제품 ${this.productName} 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.delete();
            },
        });
    }

    delete() {
        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeleteProduct(ID: ${Number(this.$props.productId)})
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: `${this.productName} 삭제 완료`,
                    life: 1500,
                });

                eventBus.$emit('refreshProductTree');
                this.$emit('reset');
            })
            .catch((error) => {
                console.error(error);
                this.$toast.add({
                    severity: 'error',
                    summary: '제품 삭제 실패',
                    detail: error.message,
                    life: 2000,
                });
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

    addProductInterface() {
        this.productInterfaces.push({
            ID: null,
            PRODUCT_ID: null,
            PD_INTF_ID: null,
            INTERFACE: {
                ASSET_CD: null,
                NAME: null,
            },
        });
    }

    deleteProductInterface(idx: number) {
        this.productInterfaces.splice(idx, 1);
    }

    onRowReorder(event: any) {
        this.productInfo = event.value;
    }

    onCellEditComplete() {
        this.parseProductInfo(this.productInfo);
    }

    imageFileUpload(event: any) {
        this.image_file = event.files[0].objectURL;
        this.image_file_blob = event.files[0];

        // by shkoh 20210913: IMAGE가 변경되는 경우는 -1로 지정함
        this.newProductData.IMAGE_FILE_ID =
            this.productData.IMAGE_FILE?.size !== this.image_file_blob?.size
                ? -1
                : this.productData.IMAGE_FILE_ID;
    }

    imageFileClear() {
        this.image_file = '';
        this.image_file_blob = undefined;
        this.newProductData.IMAGE_FILE_ID = null;
    }

    loadImageFile() {
        if (this.productData.IMAGE_FILE_ID === null) return;

        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${this.productData.IMAGE_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `,
            })
            .then(({ data }) => {
                const pd_file = data.PdFile;

                // by shkoh 20210914: API 서버로부터 이미지가 존재할 경우에는 따로 로드하여 UI에 등록함
                // by shkoh 20210914: iFileUpload Component에서 강제로 파일을 등록하는 절차를 수행함
                // by shkoh 20210914: $refs로 접근하기 위해서는 $nextTick을 한 후에 수행
                this.$nextTick(() => {
                    const buf = Buffer.from(pd_file.DATA, 'base64');
                    const previous_file = new File(
                        [buf.buffer],
                        pd_file.FILE_NAME,
                        {
                            type: pd_file.MIMETYPE,
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
                    life: 2000,
                });
            });
    }

    manualFileUpload(event: any) {
        this.manual_file_name = event.files[0].name;
        this.manual_file_blob = event.files[0];

        this.newProductData.MANUAL_FILE_ID =
            this.productData.MANUAL_FILE?.size !== this.manual_file_blob?.size
                ? -1
                : this.productData.MANUAL_FILE_ID;
    }

    manualFileClear() {
        this.manual_file_name = '';
        this.manual_file_blob = undefined;
        this.newProductData.MANUAL_FILE_ID = null;
    }

    loadManualFile() {
        if (this.productData.MANUAL_FILE_ID === null) return;

        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${this.productData.MANUAL_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `,
            })
            .then(({ data }) => {
                const pd_file = data.PdFile;

                // by shkoh 20210914: API 서버로부터 이미지가 존재할 경우에는 따로 로드하여 UI에 등록함
                // by shkoh 20210914: iFileUpload Component에서 강제로 파일을 등록하는 절차를 수행함
                // by shkoh 20210914: $refs로 접근하기 위해서는 $nextTick을 한 후에 수행
                this.$nextTick(() => {
                    const buf = Buffer.from(pd_file.DATA, 'base64');
                    const previous_file = new File(
                        [buf.buffer],
                        pd_file.FILE_NAME,
                        {
                            type: pd_file.MIMETYPE,
                        }
                    );

                    this.productData.MANUAL_FILE = previous_file;

                    this.$refs.manualFileUploader.forceInsertFile(
                        previous_file
                    );
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '파일 로드 실패',
                    detail: error.message,
                    life: 2000,
                });
            });
    }

    manualFileDownload() {
        const reader = new FileReader();
        reader.readAsDataURL(this.manual_file_blob);

        reader.onloadend = (event: any) => {
            const link = document.createElement('a');
            link.download = this.manual_file_name;
            link.href = event.target.result;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }

    productDataRefresh() {
        this.$apollo.queries.productData.refresh();
        this.$apollo.queries.dbProductInterfaces.refresh();
    }

    onSelectInterfaceTree(selected_node: any) {
        const { id, name, asset_cd } = selected_node;

        if (
            this.productInterfaces.some((intf: any) => intf.PD_INTF_ID === id)
        ) {
            this.$toast.add({
                severity: 'warn',
                summary: '인터페이스 중복 선택',
                detail: `${name} 인터페이스는 이미 설정이 되었습니다`,
                life: 2000,
            });
        } else {
            if (this.selectedInterface.ID === null) {
                this.selectedInterface.ID = -1;
            }
            this.selectedInterface.PD_INTF_ID = id;
            this.selectedInterface.INTERFACE.ASSET_CD = asset_cd;
            this.selectedInterface.INTERFACE.NAME = name;

            this.$refs.interfaceTreePanel.hide();
        }
    }

    get selectedKeyToInterfaceTree(): number {
        return -1;
    }
}
</script>

<style lang="scss" scoped>
#productPanel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 10vw;
    }

    .i-product-scrollpanel {
        height: calc(100vh - 20px - var(--header-height) - 10px - 30px - 16px);
        padding: 0.4rem;
    }

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
