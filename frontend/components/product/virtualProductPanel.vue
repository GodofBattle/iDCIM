<template>
    <div v-if="dbVirtualProductData" id="i-virtual-product-panel">
        <div class="p-d-flex p-mx-2">
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
            <div class="p-grid">
                <div class="p-col-3 p-fluid p-input-filled p-mr-6">
                    <div class="p-field">
                        <label for="asset_cd">자산분류</label>
                        <Dropdown
                            id="asset-code"
                            v-model="virtualProductData.ASSET_CD"
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
                            v-model="virtualProductData.NAME"
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
                    <Divider />
                    <div class="p-field">
                        <label for="remark">설명</label>
                        <Textarea
                            id="remark"
                            v-model="virtualProductData.REMARK"
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
                        <label for="intf">사용 가능한 인터페이스</label>
                        <DataTable
                            :value="productInterfaces"
                            class="p-datatable-sm"
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
                                padding: '0px'
                            }"
                            @click="addProductInterface"
                        ></Button>
                    </div>
                </div>
            </div>
        </ScrollPanel>
        <OverlayPanel
            ref="interfaceTreePanel"
            :show-close-icon="true"
            append-to="body"
            :style="{ width: '16vw', height: '42vh' }"
        >
            <interface-tree
                :is-editing="false"
                :show-only-parents="true"
                :init-select-keys="selectedKeyToInterfaceTree"
                :filter-code="virtualProductData.ASSET_CD"
                :style="{ height: 'calc(42vh - 2rem)' }"
                @select="onSelectInterfaceTree"
            ></interface-tree>
        </OverlayPanel>
    </div>
</template>

<script lang="ts">
import { Domain } from 'domain';
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';
import DomHandler from '~/plugins/primevue.DomHandler';

type vProduct = {
    [index: string]: string | number;
    ASSET_CD: string;
    NAME: string;
    REMARK: string;
};

@Component<VirtualProductPanel>({
    props: {
        productId: Number
    },
    apollo: {
        dbVirtualProductData: {
            query: gql`
                query Product($ID: ID!) {
                    Product(ID: $ID) {
                        ID
                        ASSET_CD
                        NAME
                        REMARK
                    }
                }
            `,
            prefetch: false,
            variables() {
                return {
                    ID: this.$props.productId < 0 ? -1 : this.$props.productId
                };
            },
            update: ({ Product }) => Product,
            result({ loading, data }) {
                if (!loading) {
                    const { Product } = data;
                    if (Product) {
                        this.apolloFetch(Product);
                    }
                }
            }
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
                    PRODUCT_ID: this.productId < 0 ? -1 : this.productId
                };
            },
            result({ data, loading }: any) {
                if (!loading) {
                    const { ProductInterfaces } = data;
                    if (ProductInterfaces) {
                        this.apolloFetchProductInterfaces(ProductInterfaces);
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
export default class VirtualProductPanel extends Vue {
    $refs!: {
        interfaceTreePanel: any;
    };

    dbVirtualProductData: vProduct | null = null;

    virtualProductData: vProduct = {
        ASSET_CD: '',
        NAME: '',
        REMARK: ''
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        REMARK: undefined as string | undefined
    };

    assetCodeList: Array<any> = [];

    // by shkoh 20220609: 사용 가능 인터페이스 사용
    dbProductInterfaces: Array<any> = [];
    productInterfaces: Array<any> = [];
    selectedInterface: any = {};
    selectedInterfaceIndex: number = -1;

    apolloFetch(data: vProduct) {
        for (const [key, value] of Object.entries(data)) {
            this.virtualProductData[key] = value;
        }
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
                    NAME: _datum.INTERFACE.NAME
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
            ID: this.$props.productId
        };

        ['ASSET_CD', 'NAME', 'REMARK'].forEach((key: string) => {
            if (
                this.dbVirtualProductData &&
                this.virtualProductData[key] !== this.dbVirtualProductData[key]
            ) {
                Object.defineProperty(variables, key, {
                    value: this.virtualProductData[key],
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            }
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
            writable: true
        });

        // by shkoh 20220609: virtual product panel 데이터 업데이트 시작 시, loading부터 시작
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: ID!
                        $ASSET_CD: String
                        $NAME: String
                        $REMARK: String
                        $INPUT: [Int!]
                    ) {
                        UpdateProduct(
                            ID: $ID
                            ASSET_CD: $ASSET_CD
                            NAME: $NAME
                            REMARK: $REMARK
                        )

                        UpdateProductInterfaces(PRODUCT_ID: $ID, INPUT: $INPUT)
                    }
                `,
                variables
            })
            .then(() => {
                eventBus.$emit('refreshVirtualProductTree');

                this.virtualProductDataRefresh();

                this.$toast.add({
                    severity: 'info',
                    summary: '제품 변경 완료',
                    detail: `${this.virtualProductData.NAME} 제품 변경`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '가상 제품 변경 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    deleteProduct() {
        // by shkoh 20220609: 삭제하기 전에 데이터 갱신
        this.virtualProductDataRefresh();

        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `[${this.productName}] 제품을 삭제하시겠습니까?\n사이트에서 해당 제품이 등록되어 있다면 삭제가 불가합니다.(상세한 삭제 절차는 미구현)`,
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

                eventBus.$emit('refreshVirtualProductTree');
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

    virtualProductDataRefresh() {
        this.$apollo.queries.dbVirtualProductData.refresh();
        this.$apollo.queries.dbProductInterfaces.refresh();
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

    assetName(asset_code: string) {
        const asset_code_item = this.assetCodeList.find(
            (code: any) => code.CODE === asset_code
        );
        return asset_code_item ? asset_code_item.NAME : '';
    }

    productInterfaceClass(data: any) {
        if (
            data.INTERFACE.ASSET_CD === null ||
            data.INTERFACE.ASSET_CD === this.virtualProductData.ASSET_CD
        ) {
            return ['p-button-text', 'p-button-info'];
        } else {
            return [
                'p-button-outlined',
                'p-button-danger',
                'i-not-used-interface'
            ];
        }
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

    addProductInterface() {
        this.productInterfaces.push({
            ID: null,
            PRODUCT_ID: null,
            PD_INTF_ID: null,
            INTERFACE: {
                ASSET_CD: null,
                NAME: null
            }
        });
    }

    deleteProductInterface(idx: number) {
        this.productInterfaces.splice(idx, 1);
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
                life: 2000
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

    get applyButtonDisabled(): boolean {
        let is_disabled = true;

        // by shkoh 20210910: API로부터 받은 제품정보와 작성자가 수정했을 경우의 데이터를 비교
        ['ASSET_CD', 'NAME', 'REMARK'].forEach((key) => {
            if (
                this.dbVirtualProductData &&
                this.virtualProductData[key] !== this.dbVirtualProductData[key]
            ) {
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

    get productName(): string {
        return this.dbVirtualProductData ? this.dbVirtualProductData.NAME : '';
    }

    get validationCheck(): boolean {
        let is_valid = true;
        for (const valid of Object.values(this.invalidMessage)) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        if (is_valid) {
            // by shkoh 20220609: 사용가능 인터페이스와 자산분류 코드와 불일치하는 항목이 단 하나라도 존재하는 경우에는 적용 불가능
            is_valid = !this.productInterfaces.some(
                (intf: any) =>
                    intf.INTERFACE.ASSET_CD !== this.virtualProductData.ASSET_CD
            );
        }

        return is_valid;
    }
}
</script>

<style lang="scss" scoped>
#i-virtual-product-panel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 20vw;
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

    .i-not-used-interface {
        text-decoration: line-through;
    }
}
</style>
