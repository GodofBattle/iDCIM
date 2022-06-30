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
                    @click="deleteProduct"
                />
            </div>
        </div>
        <Divider />
        <i-scroll-panel class="i-product-scrollpanel">
            <div class="p-grid">
                <div class="p-fluid p-col-3 p-input-filled p-mr-6">
                    <div class="p-field p-px-1">
                        <label for="asset-cd">자산분류</label>
                        <InputText
                            v-model="getAssetCodeName"
                            :disabled="true"
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
                                                manual_file_blob === null
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
            prefetch: true,
            manual: false,
            update: ({ ProductInterfaces }) => ProductInterfaces,
            skip() {
                return this.$props.productId < 0;
            },
            variables(): any {
                return {
                    PRODUCT_ID: this.$props.productId
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
        REMARK: ''
    };

    productData: Product = {
        MANUFACTURER_ID: -1,
        ASSET_CD: '',
        NAME: '',
        MODEL_NAME: '',
        MANUAL_FILE_ID: null,
        IMAGE_FILE_ID: null,
        INFO: '',
        REMARK: ''
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

    productDataRefresh() {
        this.resetData();

        this.$apollo.queries.dbProductData.refresh();
        this.$apollo.queries.dbProductInterfaces.refresh();
    }

    resetData() {
        this.productData.MANUFACTURER_ID = -1;
        this.productData.ASSET_CD = '';
        this.productData.NAME = '';
        this.productData.MODEL_NAME = '';
        this.productData.MANUAL_FILE_ID = null;
        this.productData.IMAGE_FILE_ID = null;
        this.productData.INFO = '[]';
        this.productData.REMARK = '';

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

    updateProduct() {
        if (!this.validationCheck) {
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
            MANUFACTURER_ID: this.productData.MANUFACTURER_ID
        };

        ['ASSET_CD', 'NAME', 'MODEL_NAME', 'INFO', 'REMARK'].forEach(
            (key: string) => {
                if (this.dbProductData[key] !== this.productData[key]) {
                    this.$set(variables, key, this.productData[key]);
                }
            }
        );

        if (this.isChangeManualFile) {
            this.$set(variables, 'MANUAL_FILE', this.manual_file_blob);
        }

        if (this.hasManual && this.productData.MANUAL_FILE_ID !== null) {
            this.$set(
                variables,
                'MANUAL_FILE_ID',
                this.productData.MANUAL_FILE_ID
            );
        } else {
            this.$set(variables, 'MANUAL_FILE_ID', null);
        }

        if (this.isChangeImageFile) {
            this.$set(variables, 'IMAGE_FILE', this.image_file_blob);
        }

        if (this.hasImage && this.productData.IMAGE_FILE_ID !== null) {
            this.$set(
                variables,
                'IMAGE_FILE_ID',
                this.productData.IMAGE_FILE_ID
            );
        } else {
            this.$set(variables, 'IMAGE_FILE_ID', null);
        }

        // const insert_product_interfaces = this.productInterfaces
        //     .filter((intf: PRODUCTINTERFACE) => intf.PD_INTF_ID !== null)
        //     .map((intf: PRODUCTINTERFACE) => {
        //         return {
        //             ID: intf.ID,
        //             PD_INTF_ID: intf.PD_INTF_ID
        //         };
        //     });
        const insert_product_interfaces: Array<object> = [];
        for (const src_intf of Object.values(this.dbProductInterfaces)) {
            const is = this.productInterfaces.find(
                (intf) => intf.PD_INTF_ID === src_intf.PD_INTF_ID
            );

            if (is === undefined) {
                insert_product_interfaces.push({
                    ID: src_intf.ID,
                    PD_INTF_ID: null
                });
            }
        }

        for (const intf of Object.values(this.productInterfaces)) {
            const is = this.dbProductInterfaces.find(
                (src_intf) => src_intf.PD_INTF_ID === intf.PD_INTF_ID
            );

            if (is === undefined) {
                insert_product_interfaces.push({
                    ID: -1,
                    PD_INTF_ID: intf.PD_INTF_ID
                });
            }
        }

        this.$set(variables, 'INPUT', insert_product_interfaces);

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: ID!
                        $MANUFACTURER_ID: Int!
                        $ASSET_CD: String
                        $NAME: String
                        $MODEL_NAME: String
                        $INFO: String
                        $IMAGE_FILE_ID: Int
                        $MANUAL_FILE_ID: Int
                        $REMARK: String
                        $IMAGE_FILE: Upload
                        $MANUAL_FILE: Upload
                        $INPUT: [pd_prod_intf_input!]
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
                variables
            })
            .then(() => {
                eventBus.$emit('refreshProductTree');

                this.productDataRefresh();

                this.$toast.add({
                    severity: 'info',
                    summary: '제품 변경 완료',
                    detail: `${this.productData.NAME} 제품 변경`,
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
            })
            .finally(() => {
                // by shkoh 20210927: product panel 데이터 업데이트 loading 페이지 종료
                // by shkoh 20210927: update의 성공여부와 관계없이 무조건 종료함
                this.$nuxt.$loading.finish();
            });
    }

    deleteProduct() {
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
            }
        });
    }

    delete() {
        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeleteProduct(ID: ${Number(this.$props.productId)})
                    }
                `
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: `${this.productName} 삭제 완료`,
                    life: 1500
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
                    life: 2000
                });
            });
    }

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

    async deleteProductInterface(idx: number, intf: PRODUCTINTERFACE) {
        const { ID, PD_INTF_ID } = intf;

        if ((ID === null && PD_INTF_ID === null) || ID === -1) {
            this.productInterfaces.splice(idx, 1);
        } else if (ID !== null) {
            const count = await this.countOfInterfaces(ID);

            if (count === 0) {
                this.productInterfaces.splice(idx, 1);
            } else {
                this.$toast.add({
                    severity: 'warn',
                    summary: '인터페이스 사용 중',
                    detail: `${intf.INTERFACE.NAME} 인터페이스는 등록 자산으로 사용 중입니다. 삭제할 수 없습니다`,
                    life: 2000
                });
            }
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

    async onSelectInterfaceTree(node: any) {
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
                if (intf.ID === null || intf.ID === -1) {
                    intf.ID = -1;
                    intf.PD_INTF_ID = id;
                    intf.INTERFACE.ASSET_CD = asset_cd;
                    intf.INTERFACE.NAME = name;
                } else if (intf.ID !== -1) {
                    const count = await this.countOfInterfaces(intf.ID);

                    if (count === 0) {
                        intf.ID = -1;
                        intf.PD_INTF_ID = id;
                        intf.INTERFACE.ASSET_CD = asset_cd;
                        intf.INTERFACE.NAME = name;
                    } else {
                        this.$toast.add({
                            severity: 'warn',
                            summary: '인터페이스 사용 중',
                            detail: `${intf.INTERFACE.NAME} 인터페이스는 등록 자산으로 사용 중입니다. 변경할 수 없습니다`,
                            life: 2000
                        });
                    }
                }
            }

            this.$refs.interfaceTreePanel.hide();
        }
    }

    countOfInterfaces(prod_intf_id: number) {
        return new Promise((resolve, reject) => {
            this.$nuxt.$loading.start();

            this.$apollo
                .query({
                    query: gql`
                    query {
                        CountOfInterfaces(PROD_INTF_ID: ${prod_intf_id})
                    }
                `
                })
                .then(({ data: { CountOfInterfaces } }) => {
                    resolve(CountOfInterfaces);
                })
                .finally(() => {
                    this.$nuxt.$loading.finish();
                });
        });
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

        if (is_disabled) {
            // by shkoh 20220630: 사용 가능한 인터페이스의 변경 사항을 체크함
            if (
                this.dbProductInterfaces.length !==
                this.productInterfaces.filter(
                    (intf: PRODUCTINTERFACE) => intf.PD_INTF_ID !== null
                ).length
            ) {
                is_disabled = false;
            } else {
                for (const [idx, intf] of Object.entries(
                    this.dbProductInterfaces
                )) {
                    const is = this.productInterfaces.find(
                        (i: PRODUCTINTERFACE) =>
                            i.PD_INTF_ID === intf.PD_INTF_ID
                    );

                    if (is === undefined) {
                        is_disabled = false;
                        break;
                    }
                }
            }
        }

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

    get getAssetCodeName(): string {
        const asset_code = this.assetCodeList.find(
            (code: any) => code.CODE === this.productData.ASSET_CD
        );
        return asset_code ? asset_code.NAME : '';
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
