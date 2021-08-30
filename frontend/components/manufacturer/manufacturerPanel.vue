<template>
    <ScrollPanel v-if="manufacturerId > 0">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">
                {{ manufacturerData.NAME }}
            </div>
            <div class="p-ml-auto">
                <Button icon="pi pi-check" class="p-mr-2"></Button>
                <Button icon="pi pi-trash" class="p-button-danger"></Button>
            </div>
        </div>
        <Divider />
        <div>
            <h1>Contents</h1>
        </div>
    </ScrollPanel>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

export default Vue.extend({
    apollo: {
        manufacturerData: {
            query: gql`
                query Manufacturer($ID: Float!) {
                    Manufacturer(ID: $ID) {
                        ID
                        NAME
                        ADDR
                        PHONE
                        FAX
                        EMAIL
                        URL
                        REMARK
                        PRODUCTS {
                            ID
                        }
                    }
                }
            `,
            prefetch: false,
            update: (data) => data.Manufacturer,
            variables() {
                return {
                    ID: this.manufacturerId < 0 ? 1 : this.manufacturerId
                };
            }
        }
    },
    props: {
        manufacturerId: Number
    },
    data: () => ({
        manufacturerData: {
            NAME: '',
            ADDR: '',
            PHONE: '',
            FAX: '',
            EMAIL: '',
            URL: '',
            REMARK: ''
        }
    })
});
</script>

<style lang="scss" scoped>
.i-title {
    font-size: 1.6rem;
    color: var(--text-color);
    width: 10vw;
}
</style>
