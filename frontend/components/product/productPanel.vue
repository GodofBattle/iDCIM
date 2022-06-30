<template>
    <div id="productPanel">
        <div class="p-d-flex p-mx-2">
            <div class="p-as-center p-text-bold i-title">
                {{ productName }}
            </div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-check"
                    label="적용"
                    class="p-mr-2"
                    :disabled="applyButtonDisabled"
                    @click="updateProduct"
                />
                <Button
                    icon="pi pi-trash"
                    label="삭제"
                    class="p-button-danger"
                    @class="deleteProduct"
                />
            </div>
        </div>
        <Divider />
        <i-scroll-panel class="i-product-scrollpanel">
            <div class="p-grid">
                <div class="p-fluid p-col-3 p-input-filled p-mr-6">
                    <div class="p-field p-px-1">
                        <label for="asset-cd">자산분류</label>
                        <Dropdown
                            id="asset-cd"
                            v-model="productData.ASSET_CD"
                            :options="assetCodeList"
                            option-label="NAME"
                            option-value="CODE"
                            placeholder="자산유형을 선택하세요"
                            :filter="true"
                            filter-placeholder="검색"
                            empty-filter-message="해당 유형의 자산은 존재하지 않습니다"
                            append-to="body"
                        />
                    </div>
                    <div class="p-field p-px-1">
                        <label for="name">제품명</label>
                        <InputText
                            id="name"
                            v-model="productData.NAME"
                            type="text"
                            aria-describedby="name-help"
                            autocomplete="off"
                            :class="{ 'p-invalid': invalidMessage.NAME }"
                            @input="validateName"
                        />
                        <small id="name-help" class="p-error">
                            {{ invalidMessage.NAME }}
                        </small>
                    </div>
                    <div class="p-field p-px-1">
                        <label for="model-name">모델명</label>
                        <InputText
                            id="model-name"
                            v-model="productData.MODEL_NAME"
                            type="text"
                            aria-describedby="model-name-help"
                            autocomplete="off"
                            :class="{ 'p-invalid': invalidMessage.MODEL_NAME }"
                            @input="validateModelName"
                        />
                        <small id="model-name-help" class="p-error">
                            {{ invalidMessage.MODEL_NAME }}
                        </small>
                    </div>
                    <Divider />
                    <div class="p-field p-px-1 i-loading-panel">
                        <div class="p-field-check">
                            <Checkbox
                                id="manual-file"
                                v-model="hasManual"
                                class="p-mr-1"
                                :binary="true"
                                @input="onInputManual"
                            />
                            <label for="manual-file">제품 매뉴얼</label>
                            <div v-if="hasManual" class="p-mt-2">
                                <div class="p-d-flex">
                                    <div
                                        class="p-mr-1"
                                        :style="{ width: '100%' }"
                                    >
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
                                            :disabled="
                                                isShowManualButton &&
                                                (src_manual_file_blob ===
                                                    null ||
                                                    manual_file_blob === null)
                                            "
                                            @clear="manualFileClear"
                                            @uploader="manualFileUpload"
                                        />
                                    </div>
                                </div>
                                <Button
                                    ref="manualFileDownButton"
                                    class="p-mt-2 p-text-left p-button-sm p-button-outlined p-button-secondary"
                                    :icon="manualIcon"
                                    :label="manualFileName"
                                    :style="{
                                        width: '100%',
                                        display: isShowManualButton
                                            ? 'block'
                                            : 'none'
                                    }"
                                    :disabled="manual_file_blob === null"
                                    @click="onDownloadManualFile"
                                ></Button>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div class="p-field p-px-1">
                        <div class="p-field-check">
                            <Checkbox
                                id="image-file"
                                v-model="hasImage"
                                class="p-mr-1"
                                :binary="true"
                                @input="onInputImage"
                            />
                            <label for="image-file">제품 이미지</label>
                            <div v-if="hasImage" class="p-mt-2">
                                <div class="p-mr-1" :style="{ width: '100%' }">
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
                                <img
                                    class="p-mt-2 product-image"
                                    :src="image_file"
                                    :style="{
                                        display:
                                            image_file === null
                                                ? 'none'
                                                : 'block'
                                    }"
                                />
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div class="p-field p-px-1">
                        <label for="remark">설명</label>
                        <Textarea
                            id="remark"
                            v-model="productData.REMARK"
                            :auto-resize="false"
                            aria-describedby="remark-help"
                            rows="6"
                            :style="{ resize: 'none' }"
                            :class="{ 'p-invalid': invalidMessage.REMARK }"
                            @input="validateRemark"
                        />
                        <small id="remark-help" class="p-error">
                            {{ invalidMessage.REMARK }}
                        </small>
                    </div>
                </div>
                <div class="p-fluid p-col-3 p-input-filled p-mr-6">
                    <div class="p-field">
                        <label for="info">부가정보(스펙)</label>
                        <DataTable
                            id="i-product-info"
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
                                            deleteProductInfo(
                                                $event,
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
                                padding: '0px'
                            }"
                            @click="addProductInfo"
                        ></Button>
                    </div>
                </div>
                <div class="p-fluid p-col-3 p-input-filled">
                    <div class="p-field">
                        <label for="intf">사용 가능 인터페이스</label>
                        <DataTable
                            id="i-product-interface"
                            class="p-datatable-sm"
                            :value="productInterfaces"
                        >
                            <Column field="ID">
                                <template #body="slotProps">
                                    <Button
                                        :class="
                                            productInterfaceClass(
                                                slotProps.data
                                            )
                                        "
                                        :label="
                                            productInterfaceLabel(
                                                slotProps.data
                                            )
                                        "
                                        :style="{ 'text-align': 'left' }"
                                        @click="
                                            showInterfaceTreePanel(
                                                $event,
                                                slotProps.index
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
                                                slotProps.index,
                                                slotProps.data
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
                                padding: '0px'
                            }"
                            @click="addProductInterface"
                        ></Button>
                    </div>
                </div>
            </div>
        </i-scroll-panel>
        <i-overlay-panel
            ref="interfaceTreePanel"
            :show-close-icon="true"
            append-to="body"
            :style="{ width: '16vw', height: '42vh' }"
        >
            <interface-tree
                :is-editing="false"
                :show-only-parents="true"
                :filter-code="productData.ASSET_CD"
                :style="{ height: 'calc(42vh - 2rem)' }"
                @select="onSelectInterfaceTree"
            ></interface-tree>
        </i-overlay-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

type INTERFACE = {
    [index: string]: string | null;
    ASSET_CD: string | null;
    NAME: string | null;
};

type PRODUCTINTERFACE = {
    [index: string]: number | INTERFACE | null;
    ID: number | null;
    PRODUCT_ID: number | null;
    PD_INTF_ID: number | null;
    INTERFACE: INTERFACE;
};

type Product = {
    [index: string]: string | number | null;
    MANUFACTURER_ID: number;
    ASSET_CD: string;
    NAME: string;
    MODEL_NAME: string;
    MANUAL_FILE_ID: number | null;
    IMAGE_FILE_ID: number | null;
    INFO: string;
    REMARK: string;
    IMAGE_FILE_NAME: string;
    MANUAL_FILE_NAME: string;
};

@Component<ProductPanel>({
    props: {
        productId: Number
    },
    apollo: {
        dbProductData: {
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
            update: ({ Product }) => {
                if (Product.INFO === null) Product.INFO = '[]';
                return Product;
            },
            skip() {
                return this.$props.productId < 0;
            },
            variables(): any {
                return {
                    ID: this.$props.productId
                };
            },
            result({ loading, data }) {
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
        },
        dbProductInterfaces: {
            query: gql`
                query ProducInterfaces($PRODUCT_ID: Int!) {
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
            fetchPolicy: 'cache-and-network',
            manual: true,
            update: ({ ProductInterfaces }) => ProductInterfaces,
            variables(): any {
                return {
                    PRODUCT_ID:
                        this.$props.productId < 0 ? -1 : this.$props.productId
                };
            },
            result({ loading, data }) {
                if (!loading) {
                    const { ProductInterfaces } = data;
                    if (ProductInterfaces) {
                        this.apolloFetchProductInterfaces(ProductInterfaces);
                    }
                }
            }
        },
        manualFile: {
            query: gql`
                query PdFile($ID: Int) {
                    PdFile(ID: $ID) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `,
            update: ({ PdFile }) => PdFile,
            prefetch: false,
            manual: true,
            skip() {
                return (
                    this.productData.MANUAL_FILE_ID === null ||
                    this.productData.MANUAL_FILE_ID === -1
                );
            },
            variables(): any {
                return {
                    ID: this.productData.MANUAL_FILE_ID
                };
            },
            result({ loading, data }) {
                if (!loading) {
                    const { PdFile } = data;

                    if (PdFile) {
                        this.setManualFile(PdFile);
                    }
                }
            }
        },
        imageFile: {
            query: gql`
                query PdFile($ID: Int) {
                    PdFile(ID: $ID) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `,
            update: ({ PdFile }) => PdFile,
            prefetch: false,
            manual: true,
            skip() {
                return (
                    this.productData.IMAGE_FILE_ID === null ||
                    this.productData.IMAGE_FILE_ID === -1
                );
            },
            variables() {
                return {
                    ID: this.productData.IMAGE_FILE_ID
                };
            },
            result({ loading, data }) {
                if (!loading) {
                    const { PdFile } = data;
                    if (PdFile) {
                        this.setImageFile(PdFile);
                    }
                }
            }
        }
    },
    watch: {
        productId() {
            // by shkoh 20220630: 제품 ID가 변경될 때 해당 값들을 초기화함
            this.resetData();
        }
    }
})
export default class ProductPanel extends Vue {
    $refs!: {
        manualFileUploader: any;
        imageFileUploader: any;
        interfaceTreePanel: any;
        manualFileDownButton: Vue;
    };

    dbProductData: Product = {
        MANUFACTURER_ID: -1,
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        MANUAL_FILE_ID: null,
        IMAGE_FILE_ID: null,
        INFO: '',
        REMARK: '',
        IMAGE_FILE_NAME: '',
        MANUAL_FILE_NAME: ''
    };

    productData: Product = {
        MANUFACTURER_ID: -1,
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        MANUAL_FILE_ID: null,
        IMAGE_FILE_ID: null,
        INFO: '',
        REMARK: '',
        IMAGE_FILE_NAME: '',
        MANUAL_FILE_NAME: ''
    };

    invalidMessage = {
        NAME: undefined as String | undefined,
        MODEL_NAME: undefined as String | undefined,
        REMARK: undefined as String | undefined
    };

    dbProductInterfaces: Array<PRODUCTINTERFACE> = [];
    productInterfaces: Array<PRODUCTINTERFACE> = [];

    assetCodeList: Array<any> = [];

    src_manual_file_blob: File | null = null;
    manual_file_blob: File | null = null;
    src_image_file_blob: File | null = null;
    image_file_blob: File | null = null;
    image_file: any = null;

    selectedProductInterfaceIndex: number = -1;

    hasManual: boolean = false;
    hasImage: boolean = false;
    isShowManualButton: boolean = true;

    resetData() {
        this.productData.MANUFACTURER_ID = -1;
        this.productData.ASSET_CD = '';
        this.productData.NAME = '';
        this.productData.MODEL_NAME = '';
        this.productData.MANUAL_FILE_ID = null;
        this.productData.IMAGE_FILE_ID = null;
        this.productData.INFO = '[]';
        this.productData.REMARK = '';
        this.productData.MANUAL_FILE_NAME = '';
        this.productData.IMAGE_FILE_NAME = '';

        this.invalidMessage.NAME = undefined;
        this.invalidMessage.MODEL_NAME = undefined;
        this.invalidMessage.REMARK = undefined;

        this.manual_file_blob = null;
        this.image_file_blob = null;
        this.image_file = null;

        this.hasManual = false;
        this.hasImage = false;
        this.isShowManualButton = true;
        this.src_manual_file_blob = null;
        this.src_image_file_blob = null;
        this.manual_file_blob = null;
        this.image_file_blob = null;
    }

    resetProductInterface() {
        this.dbProductInterfaces.splice(0, this.dbProductInterfaces.length);
        this.productInterfaces.splice(0, this.productInterfaces.length);
    }

    apolloFetch(data: Product) {
        for (const [key, value] of Object.entries(data)) {
            this.productData[key] = value;

            if (key === 'MANUAL_FILE_ID') {
                this.hasManual = value !== null;

                if (value === null) {
                    this.src_manual_file_blob = null;
                    this.manual_file_blob = null;
                }
            }

            if (key === 'IMAGE_FILE_ID') {
                this.hasImage = value !== null;
            }
        }
    }

    apolloFetchProductInterfaces(data: Array<PRODUCTINTERFACE>) {
        this.resetProductInterface();

        data.forEach((d: PRODUCTINTERFACE) => {
            this.productInterfaces.push({
                ID: d.ID,
                PRODUCT_ID: d.PRODUCT_ID,
                PD_INTF_ID: d.PD_INTF_ID,
                INTERFACE: {
                    ASSET_CD: d.INTERFACE.ASSET_CD,
                    NAME: d.INTERFACE.NAME
                }
            });
        });
    }

    updateProduct() {}

    deleteProduct() {}

    validateName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 64) {
            this.invalidMessage.NAME = '제품명은 64자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessage.NAME = '제품명을 한글자 이상 입력하세요';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    validateModelName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessage.MODEL_NAME = '모델명은 32자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessage.MODEL_NAME = '모델명을 한글자 이상 입력하세요';
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

    setManualFile(file: any) {
        const buf = Buffer.from(file.DATA, 'base64');
        this.src_manual_file_blob = new File(
            [buf.buffer],
            file.FILE_NAME.normalize('NFC'),
            { type: file.MIMETYPE }
        );

        this.$refs.manualFileUploader.forceInsertFile(
            this.src_manual_file_blob
        );
    }

    manualFileUpload(event: any) {
        this.manual_file_blob = event.files[0];
        this.isShowManualButton = true;

        if (
            this.src_manual_file_blob?.size !== this.manual_file_blob?.size &&
            this.src_manual_file_blob?.name !== this.manual_file_blob?.name
        ) {
            this.productData.MANUAL_FILE_ID = -1;
        } else {
            this.productData.MANUAL_FILE_ID = this.dbProductData.MANUAL_FILE_ID;
        }
    }

    manualFileClear() {
        this.isShowManualButton = false;
        this.manual_file_blob = null;
    }

    onInputManual(is_checked: boolean) {
        if (is_checked) {
            const file_id = this.dbProductData.MANUAL_FILE_ID;

            if (file_id === null) {
                this.isShowManualButton = false;
                this.manual_file_blob = null;
            } else {
                this.isShowManualButton = true;
            }

            this.productData.MANUAL_FILE_ID = file_id !== null ? file_id : -1;
        } else {
            this.manual_file_blob = null;
            this.productData.MANUAL_FILE_ID = -1;
        }
    }

    onDownloadManualFile(event: MouseEvent) {
        event.preventDefault();

        if (this.manual_file_blob) {
            const reader = new FileReader();
            reader.readAsDataURL(this.manual_file_blob);
            reader.onloadend = (event: any) => {
                if (this.manual_file_blob) {
                    const link = document.createElement('a');
                    link.download = this.manual_file_blob.name.normalize('NFC');
                    link.href = event.target.result;

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };
        } else {
            this.$toast.add({
                severity: 'warn',
                summary: '매뉴얼 파일 다운로드 실패',
                detail: `매뉴얼 파일을 불러오지 못했습니다. 다시 시도해주세요`,
                life: 2000
            });
        }
    }

    get manualFileName(): string {
        return this.manual_file_blob ? this.manual_file_blob.name : '';
    }

    get manualIcon(): string {
        return this.manual_file_blob
            ? 'pi pi-download'
            : 'pi pi-spin pi-spinner';
    }

    setImageFile(file: any) {
        const buf = Buffer.from(file.DATA, 'base64');
        this.src_image_file_blob = new File(
            [buf.buffer],
            file.FILE_NAME.normalize('NFC'),
            { type: file.MIMETYPE }
        );
        this.$refs.imageFileUploader.forceInsertFile(this.src_image_file_blob);
    }

    imageFileUpload(event: any) {
        this.image_file = event.files[0].objectURL;
        this.image_file_blob = event.files[0];

        if (
            this.src_image_file_blob?.size !== this.image_file_blob?.size &&
            this.src_image_file_blob?.name !== this.image_file_blob?.name
        ) {
            this.productData.IMAGE_FILE_ID = -1;
        } else {
            this.productData.IMAGE_FILE_ID = this.dbProductData.IMAGE_FILE_ID;
        }
    }

    imageFileClear() {
        this.image_file = null;
        this.image_file_blob = null;
    }

    onInputImage(is_checked: boolean) {
        if (is_checked) {
            const file_id = this.dbProductData.IMAGE_FILE_ID;

            if (file_id === null) {
                this.image_file = null;
                this.image_file_blob = null;
            } else {
                this.image_file = null;
            }

            this.productData.IMAGE_FILE_ID = file_id !== null ? file_id : -1;
        } else {
            this.image_file = null;
            this.image_file_blob = null;
            this.productData.IMAGE_FILE_ID = -1;
        }
    }

    addProductInfo(event: MouseEvent) {
        event.preventDefault();

        try {
            const info = JSON.parse(this.productData.INFO);
            if (info.length === 50) {
                this.$toast.add({
                    severity: 'warn',
                    summary: '부가정보(스펙) 추가 불가',
                    detail: '부가정보(스펙)는 최대 50개까지 작성 가능합니다',
                    life: 2000
                });

                return;
            }

            info.push({
                key: 'key',
                value: 'value'
            });
            this.productData.INFO = JSON.stringify(info);
        } catch {
            this.$toast.add({
                severity: 'error',
                summary: '부가정보(스펙) 데이터 추가 실패',
                detail: '추가하는 과정에서 기존 데이터를 읽는데 문제가 발생했습니다. 다시 시도해보세요',
                life: 2000
            });
        }
    }

    deleteProductInfo(event: MouseEvent, idx: number) {
        event.preventDefault();

        try {
            const info = JSON.parse(this.productData.INFO);
            info.splice(idx, 1);
            this.productData.INFO = JSON.stringify(info);
        } catch {
            this.$toast.add({
                severity: 'error',
                summary: '부가정보(스펙) 데이터 삭제 실패',
                detail: '삭제하는 과정에서 기존 데이터를 읽는데 문제가 발생했습니다. 다시 시도해보세요',
                life: 2000
            });
        }
    }

    onRowReorder(event: any) {
        const { value } = event;
        this.productData.INFO = JSON.stringify(value);
    }

    onCellEditComplete(event: any) {
        const { newValue, field, index } = event;

        const info = JSON.parse(this.productData.INFO);
        info[index][field] = newValue;
        this.productData.INFO = JSON.stringify(info);
    }

    productInterfaceClass(data: PRODUCTINTERFACE) {
        const { INTERFACE } = data;

        if (this.productData.ASSET_CD === INTERFACE.ASSET_CD) {
            return ['p-button-text', 'p-button-info'];
        } else {
            return ['p-button-text', 'p-button-warn'];
        }
    }

    productInterfaceLabel(data: PRODUCTINTERFACE) {
        const { ID, INTERFACE } = data;
        if (ID === null) {
            return '클릭하여 인터페이스 지정';
        }

        if (INTERFACE === null) {
            return '';
        }

        const { ASSET_CD, NAME } = INTERFACE;
        return `${this.assetName(ASSET_CD)}${NAME}`;
    }

    assetName(asset_code: string | null) {
        if (asset_code === null) {
            return '';
        }

        const code = this.assetCodeList.find(
            (code: any) => code.CODE === asset_code
        );
        return code ? `${code.NAME} | ` : '';
    }

    showInterfaceTreePanel(event: PointerEvent, index: number) {
        this.selectedProductInterfaceIndex = index;

        setTimeout(
            () => {
                this.$refs.interfaceTreePanel.toggle(event);
            },
            10,
            event as Event
        );
    }

    deleteProductInterface(idx: number, intf: PRODUCTINTERFACE) {
        const { ID, PD_INTF_ID } = intf;
        if (ID === null && PD_INTF_ID === null) {
            this.productInterfaces.splice(idx, 1);
        }
    }

    addProductInterface() {
        if (this.productInterfaces.length === 20) {
            this.$toast.add({
                severity: 'warn',
                summary: '사용 가능 인터페이스 등록 불가',
                detail: '사용 가능 인터페이스는 최대 20개까지 등록 가능합니다',
                life: 2000
            });

            return;
        }

        const add_data: PRODUCTINTERFACE = {
            ID: null,
            PRODUCT_ID: null,
            PD_INTF_ID: null,
            INTERFACE: {
                ASSET_CD: null,
                NAME: null
            }
        };

        this.productInterfaces.push(add_data);
    }

    onSelectInterfaceTree(node: any) {
        console.info(node);
        const { id, name, asset_cd } = node;

        const has_prod_intf = this.productInterfaces.some(
            (intf: PRODUCTINTERFACE) => intf.PD_INTF_ID === id
        );

        if (has_prod_intf) {
            this.$toast.add({
                severity: 'warn',
                summary: '인터페이스 중복 선택',
                detail: `${name} 인터페이스는 이미 설정이 되었습니다`,
                life: 2000
            });
        } else {
            const intf = this.productInterfaces.at(
                this.selectedProductInterfaceIndex
            );

            if (intf) {
                // by shkoh 20220628: prod_intf의 ID가 null인 경우(신규)와 null이 아닌 경우(기존에 등록)로 구분지어서 구현
                if (intf.ID === null) {
                    intf.ID = -1;
                    intf.PD_INTF_ID = id;
                    intf.INTERFACE.ASSET_CD = asset_cd;
                    intf.INTERFACE.NAME = name;
                } else if (intf.ID !== null) {
                    console.info(intf.ID);
                }
            }

            this.$refs.interfaceTreePanel.hide();
        }
    }

    get productName(): string {
        return this.dbProductData.NAME;
    }

    get applyButtonDisabled(): boolean {
        let is_disabled = true;

        [
            'MANUFACTURER_ID',
            'ASSET_CD',
            'NAME',
            'MODEL_NAME',
            'INFO',
            'REMARK'
        ].forEach((key) => {
            if (this.dbProductData[key] !== this.productData[key]) {
                is_disabled = false;
            }
        });

        if (is_disabled && this.isChangeManualFile) {
            is_disabled = false;
        }

        if (is_disabled && this.isChangeImageFile) {
            is_disabled = false;
        }

        console.info(is_disabled);

        return is_disabled;
    }

    get productInfo(): Array<object> {
        try {
            return JSON.parse(this.productData.INFO);
        } catch {
            return [];
        }
    }

    get isChangeManualFile(): boolean {
        let is_change = false;

        const src_size = this.src_manual_file_blob?.size;
        const src_name = this.src_manual_file_blob?.name.normalize('NFC');
        const dst_size = this.manual_file_blob?.size;
        const dst_name = this.manual_file_blob?.name.normalize('NFC');

        if (src_size !== dst_size || src_name !== dst_name) {
            is_change = true;
        }

        return is_change;
    }

    get isChangeImageFile(): boolean {
        let is_change = false;

        const src_size = this.src_image_file_blob?.size;
        const src_name = this.src_image_file_blob?.name.normalize('NFC');
        const dst_size = this.image_file_blob?.size;
        const dst_name = this.image_file_blob?.name.normalize('NFC');

        if (src_size !== dst_size || src_name !== dst_name) {
            is_change = true;
        }

        return is_change;
    }
}
</script>

<style lang="scss" scoped>
#productPanel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 20vw;
    }

    .i-product-scrollpanel {
        padding: 0.4rem;
        height: calc(100vh - 20px - var(--header-height) - 10px - 30px - 16px);
    }

    .i-loading-panel {
        position: relative;

        .i-loading-overlay {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
        }

        .i-loading-icon {
            font-size: 2rem;
        }
    }

    .p-datatable.p-datatable-sm .p-datatable-thead > tr > th {
        padding: 0px;
    }

    .product-image {
        max-width: 100%;
        max-height: 30vh;
        border-radius: 3px;
    }

    .i-not-used-interface {
        text-decoration: line-through;
    }

    .i-hidden {
        display: none;
    }
}
</style>
