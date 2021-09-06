<template>
    <ScrollPanel v-if="productId > 0">
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
            <div class="p-col-3 p-fluid p-input-filled">
                <div class="p-field">
                    <label for="asset_cd">자산분류</label>
                </div>
            </div>
        </div>
    </ScrollPanel>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

export default Vue.extend({
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
                        console.info(Product);
                    }
                }
            },
        },
    },
    props: {
        productId: {
            type: Number,
        },
    },
    data: () => ({
        productData: {
            ASSET_CD: '',
            NAME: '',
            MODEL_NAME: '',
            INFO: {},
        },
    }),
    computed: {
        productName() {
            return this.productData ? this.productData.NAME : '';
        },
        applyButtonDisabled() {
            return false;
        },
    },
    methods: {
        updateProduct() {
            this.$toast.add({
                severity: 'info',
                summary: 'updateProduct',
                life: 1000,
            });
        },
        deleteProduct() {
            this.$toast.add({
                severity: 'info',
                summary: 'deleteProduct',
                life: 1000,
            });
        },
    },
});
</script>

<style lang="scss" scoped>
.i-title {
    font-size: 1.6rem;
    color: var(--text-color);
    width: 10vw;
}
</style>