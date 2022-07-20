<template>
    <Panel
        v-if="!$apollo.loading"
        id="i-product-info-panel"
        :header="productHeader"
    >
        <i-scroll-panel :style="{ width: '100%', height: '100%' }">
            <div class="p-d-flex">
                <div class="p-col-fixed" :style="{ width: '60%' }">
                    <div class="p-field p-grid p-mb-1">
                        <label class="p-col-fixed p-mb-0 p-mr-3 p-py-2">
                            자산분류
                        </label>
                        <label class="p-col-fixed p-mb-0 p-py-2">
                            {{ hierarchyLabel }}
                        </label>
                    </div>
                    <Divider
                        v-if="productInfo.length > 0"
                        :style="{ 'margin-left': '-0.5rem' }"
                    />
                    <div
                        v-for="(data, index) of productInfo"
                        :key="index"
                        class="p-field p-grid p-mb-1"
                    >
                        <Tag
                            class="p-col-fixed p-mb-0 p-mr-3 p-py-1 i-model-key"
                            severity="info"
                        >
                            {{ data.key }}
                        </Tag>
                        <label class="p-col-fixed p-py-1 i-model-value">
                            {{ data.value }}
                        </label>
                    </div>
                </div>
                <div
                    v-if="predefineProduct.IMAGE_FILE_ID && !$apollo.loading"
                    class="p-col-fixed"
                    :style="{ width: '40%' }"
                >
                    <Panel header="제품 이미지">
                        <div class="i-image-content">
                            <img class="i-product-image" :src="image_file" />
                        </div>
                    </Panel>
                </div>
            </div>
        </i-scroll-panel>
    </Panel>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface Manufacturer {
    NAME: string;
}

interface Product {
    ASSET_CD: string;
    NAME: string;
    MODEL_NAME: string;
    INFO: string;
    MANUAL_FILE_ID: number;
    IMAGE_FILE_ID: number;
    MANUFACTURER: Manufacturer;
}

@Component<ProductInfoPanel>({
    props: {
        productId: Number,
        hierarchyLabel: String
    },
    apollo: {
        predefineProduct: {
            query: gql`
                query ($ID: ID!) {
                    Product(ID: $ID) {
                        ID
                        MANUFACTURER_ID
                        ASSET_CD
                        NAME
                        MODEL_NAME
                        INFO
                        MANUAL_FILE_ID
                        IMAGE_FILE_ID
                        MANUFACTURER {
                            NAME
                        }
                    }
                }
            `,
            skip() {
                return this.$props.productId === null;
            },
            variables() {
                return {
                    ID: this.$props.productId
                };
            },
            update: ({ Product }) => Product
        },
        imageFile: {
            query: gql`
                query ($ID: Int!) {
                    PdFile(ID: $ID) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `,
            prefetch: false,
            skip() {
                return (
                    this.predefineProduct === undefined ||
                    !this.predefineProduct.IMAGE_FILE_ID
                );
            },
            variables() {
                return { ID: this.predefineProduct.IMAGE_FILE_ID };
            },
            update({ PdFile }) {
                const _file = PdFile;

                this.$nextTick(() => {
                    this.image_file = `data:${_file.MIMETYPE};base64,${_file.DATA}`;
                });
            }
        }
    }
})
export default class ProductInfoPanel extends Vue {
    predefineProduct: Product;
    image_file: string = '';

    get productHeader(): string {
        const manufacturerName = this.predefineProduct.MANUFACTURER
            ? this.predefineProduct.MANUFACTURER.NAME
            : '가상자산';
        return `${manufacturerName} | ${this.predefineProduct.NAME}`;
    }

    get productInfo(): Array<any> {
        let info: Array<any> = [];

        try {
            if (
                this.predefineProduct.INFO !== null &&
                this.predefineProduct.INFO.length > 0
            ) {
                info = JSON.parse(this.predefineProduct.INFO);
            }
        } catch {
            info = [];
        }

        return info;
    }
}
</script>

<style lang="scss" scoped>
#i-product-info-panel::v-deep {
    .p-toggleable-content {
        height: calc(100% - 34px);

        .p-panel-content {
            height: 100%;
        }
    }

    .i-model-key {
        flex-basis: 80px;
        min-width: 60px;
        max-width: 80px;
        justify-content: left;
    }

    .i-model-value {
        flex-basis: 50%;
        max-width: 60%;
    }

    .i-image-content {
        width: 100%;
        text-align: center;

        .i-product-image {
            max-width: 100%;
            max-height: 25vh;
            border-radius: 3px;
        }
    }
}
</style>
