<template>
    <i-dialog
        id="asset-add-dialog"
        :visible.sync="showDialog"
        :content-style="{
            width: '50vw',
            height: '60vh',
            'padding-bottom': '1rem'
        }"
        @hide="onHide"
    >
        <template #header>{{ dialogHeader }}</template>
        <i-steps
            class="p-mb-3"
            :model="stepItemsOnRender"
            :active-index.sync="activeStep"
            :readonly="true"
        />
        <asset-add-dialog-product
            v-show="activeStep === 0"
            :product.sync="product"
            :style="{ height: 'calc(60vh - 2rem - 46px - 30px)' }"
        />
        <asset-add-dialog-asset-info
            v-show="activeStep === 1"
            :product="product"
            :asset.sync="asset"
            :style="{ height: 'calc(60vh - 2rem - 46px - 30px)' }"
            @validate="onValidateAssetInfo"
        />
        <asset-add-dialog-interface
            v-show="activeStep === 2"
            :product-interfaces="productInterfaces"
            :asset.sync="asset"
            :asset-interface.sync="assetInterface"
            :style="{ height: 'calc(60vh - 2rem - 46px - 30px)' }"
            @validate="onValidateInterface"
        />
        <template #footer>
            <div class="p-d-flex">
                <Button
                    v-if="showPreviousButton"
                    class="p-button-text"
                    icon="pi pi-angle-double-left"
                    label="이전"
                    @click="onPrevPos"
                />
                <Button
                    v-if="!isLast"
                    class="p-ml-auto p-mr-0 p-button-text"
                    icon="pi pi-angle-double-right"
                    label="다음"
                    icon-pos="right"
                    :disabled="disabledNextButton"
                    @click="onNextPos"
                />
                <Button
                    v-else
                    class="p-ml-auto p-mr-0 p-button-raised"
                    label="등록"
                    icon="pi pi-check"
                    :disabled="disabledCompleteButton"
                    @click="onComplete"
                />
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';

@Component<AssetAddDialog>({
    props: {
        visible: Boolean
    },
    apollo: {
        productInterfaces: {
            query: gql`
                query ($PRODUCT_ID: Int!) {
                    ProductInterfaces(PRODUCT_ID: $PRODUCT_ID) {
                        ID
                        PD_INTF_ID
                        INTERFACE {
                            ASSET_CD
                            INTF_CD
                            NAME
                        }
                    }
                }
            `,
            skip() {
                return this.product === null || this.product.ID < 1;
            },
            variables() {
                return {
                    PRODUCT_ID: this.product.ID
                };
            },
            update: ({ ProductInterfaces }) => ProductInterfaces
        }
    },
    watch: {
        product(_product: any) {
            this.asset.PRODUCT_ID = _product === null ? -1 : _product.ID;
        }
    }
})
export default class AssetAddDialog extends Vue {
    stepItems = [
        {
            label: '제품선택'
        },
        {
            label: '자산정보 등록'
        },
        {
            label: '인터페이스 설정',
            type: 'interface'
        }
    ];

    activeStep: number = 0;

    asset: any = {
        PRODUCT_ID: -1,
        NAME: '',
        SERIAL: '',
        CUST_HIER_ID_C: -1,
        CUST_HIER_ID_P: -1,
        OP_ID_M: -1,
        OP_ID_S: -1,
        MA_USER_ID: -1,
        INSTALL_DATE: null,
        MA_START_DATE: null,
        MA_END_DATE: null,
        INSPECT_INFO: '',
        IS_USE_INTF: 0
    };

    assetInterface: any = {
        PROD_INTF_ID: -1,
        IP_ADDR: null,
        PORT: null,
        DEVICE_ID: null,
        POLL_INTERVAL: 5,
        TIMEOUT: 3,
        RETRY: 3,
        ACCESS_INFO: null,
        IS_USE: 0
    };

    product: any = null;
    productInterfaces: any = null;

    isValidStep1: boolean = true;
    isValidStep2: boolean = true;

    resetAsset() {
        this.asset.PRODUCT_ID = -1;
        this.asset.NAME = '';
        this.asset.SERIAL = '';
        this.asset.CUST_HIER_ID_C = -1;
        this.asset.CUST_HIER_ID_P = -1;
        this.asset.OP_ID_M = -1;
        this.asset.OP_ID_S = -1;
        this.asset.MA_USER_ID = -1;
        this.asset.INSTALL_DATE = null;
        this.asset.MA_START_DATE = null;
        this.asset.MA_END_DATE = null;
        this.asset.INSPECT_INFO = '';

        this.assetInterface.PROD_INTF_ID = -1;
        this.assetInterface.IP_ADDR = null;
        this.assetInterface.PORT = null;
        this.assetInterface.DEVICE_ID = null;
        this.assetInterface.POLL_INTERVAL = 5;
        this.assetInterface.TIMEOUT = 3;
        this.assetInterface.RETRY = 3;
        this.assetInterface.ACCESS_INFO = null;
        this.assetInterface.IS_USE = 0;

        this.product = null;
        this.productInterfaces = null;

        this.isValidStep1 = true;
        this.isValidStep2 = true;
    }

    onHide() {
        this.activeStep = 0;
        this.resetAsset();
    }

    onPrevPos() {
        this.activeStep--;
    }

    onNextPos() {
        this.activeStep++;
    }

    onComplete() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ASSET: ac_asset_input!
                        $INTERFACE: cn_interface_input
                    ) {
                        AddAsset(ASSET: $ASSET, INTERFACE: $INTERFACE)
                    }
                `,
                variables: {
                    ASSET: this.asset,
                    INTERFACE: this.assetInterface
                }
            })
            .then((data) => {
                console.table(data);

                eventBus.$emit('refreshAssetTable');

                this.showDialog = false;

                this.$toast.add({
                    severity: 'info',
                    summary: '자산 등록 완료',
                    detail: `${this.asset.NAME} 자산이 등록되었습니다`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산등록 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onValidateAssetInfo(is_valid: boolean) {
        this.isValidStep1 = is_valid;
    }

    onValidateInterface(is_valid: boolean) {
        this.isValidStep2 = is_valid;
    }

    get isValidAssetInfo(): boolean {
        let is_valid = true;

        if (is_valid && this.is_cus_tree) {
            is_valid = this.asset.CUST_HIER_ID_C !== -1;
        }

        if (is_valid && this.is_pos_tree) {
            is_valid = this.asset.CUST_HIER_ID_P !== -1;
        }

        if (is_valid && this.asset.NAME.length < 2) {
            is_valid = false;
        }

        return is_valid;
    }

    get isValidInterface(): boolean {
        return this.assetInterface.PROD_INTF_ID !== -1;
    }

    get is_cus_tree(): boolean {
        return this.$store.state.sessionStorage.ui.is_cus_tree;
    }

    get is_pos_tree(): boolean {
        return this.$store.state.sessionStorage.ui.is_pos_tree;
    }

    get stepItemsOnRender(): Array<object> {
        let steps: Array<object> = [];
        if (this.productInterfaces && this.productInterfaces.length > 0) {
            steps = this.stepItems;
        } else {
            steps = this.stepItems.filter((s: any) => s.type !== 'interface');
        }
        return steps;
    }

    get dialogHeader(): string {
        return this.activeStep > 0 && this.product
            ? `신규 ${this.product.NAME} 등록`
            : '신규 자산등록';
    }

    get isLast(): boolean {
        const last = this.stepItemsOnRender.at(this.activeStep + 1);
        if (last === undefined) {
            return true;
        } else {
            return false;
        }
    }

    get showPreviousButton(): boolean {
        return this.activeStep !== 0;
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get disabledNextButton(): boolean {
        if (this.activeStep === 0) {
            return this.product === null;
        } else if (this.activeStep === 1) {
            return !this.isValidStep1 || !this.isValidAssetInfo;
        } else {
            return true;
        }
    }

    get disabledCompleteButton(): boolean {
        if (this.activeStep === 1) {
            return !this.isValidStep1 || !this.isValidAssetInfo;
        } else if (this.activeStep === 2) {
            return (
                !this.isValidStep1 ||
                !this.isValidAssetInfo ||
                !this.isValidStep2 ||
                !this.isValidInterface
            );
        } else {
            return true;
        }
    }
}
</script>
