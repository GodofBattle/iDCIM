<template>
    <Card id="modbusCmdCard" class="p-shadow-12">
        <template #header>
            <div class="p-d-flex">
                <div class="p-as-center p-pl-2 i-header-title">
                    MC ID: {{ mcId }}
                </div>
                <div class="p-ml-auto">
                    <Button
                        class="p-button-rounded p-button-text p-button-help"
                        icon="pi pi-copy"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text p-buttom-success"
                        icon="pi pi-save"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-minus"
                    ></Button>
                </div>
            </div>
            <Divider class="p-my-1" />
        </template>
        <template #content>
            <div class="p-fluid p-formgrid p-grid p-input-filled">
                <div class="p-field p-col-2 p-mb-0">
                    <label for="func-num">FUNC NUM</label>
                    <InputNumber
                        id="func-num"
                        v-model="data.FUNC_CD"
                        mode="decimal"
                        :min="0"
                        :max="255"
                        show-buttons
                        button-layout="horizontal"
                        :step="1"
                        decrement-button-class="p-button-secondary"
                        decrement-button-icon="pi pi-minus"
                        increment-button-class="p-button-secondary"
                        increment-button-icon="pi pi-plus"
                        aria-describedby="func-num-help"
                        autocomplete="off"
                        @input="inputFuncNum"
                    ></InputNumber>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="start-addr">START ADDR</label>
                    <InputNumber
                        id="start-addr"
                        v-model="data.START_ADDR"
                        mode="decimal"
                        :min="0"
                        :max="255"
                        show-buttons
                        button-layout="horizontal"
                        :step="1"
                        decrement-button-class="p-button-secondary"
                        decrement-button-icon="pi pi-minus"
                        increment-button-class="p-button-secondary"
                        increment-button-icon="pi pi-plus"
                        aria-describedby="func-num-help"
                        autocomplete="off"
                        @input="inputStartAddr"
                    ></InputNumber>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="point-cnt">COUNT(WORD)</label>
                    <InputNumber
                        id="point-cnt"
                        v-model="data.POINT_CNT"
                        mode="decimal"
                        :min="0"
                        :max="255"
                        show-buttons
                        button-layout="horizontal"
                        :step="1"
                        decrement-button-class="p-button-secondary"
                        decrement-button-icon="pi pi-minus"
                        increment-button-class="p-button-secondary"
                        increment-button-icon="pi pi-plus"
                        aria-describedby="func-num-help"
                        autocomplete="off"
                        @input="inputPointCnt"
                    ></InputNumber>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="dtype">DTYPE</label>
                    <Dropdown
                        id="dtype"
                        v-model="data.DTYPE_CD"
                        :options="dtype"
                        option-label="NAME"
                        option-value="CODE"
                        data-key="CODE"
                        placeholder="데이터 타입을 선택하세요"
                        empty-filter-message="데이터 타입이 존재하지 않습니디"
                        @input="inputDtype"
                    ></Dropdown>
                </div>
            </div>
        </template>
    </Card>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<ModbusCmdPanel>({
    props: {
        mcId: Number,
        funcCd: Number,
        startAddr: Number,
        pointCnt: Number,
        dtypeCd: String
    },
    watch: {
        funcCd(new_val) {
            this.data.FUNC_CD = new_val;
        },
        startAddr(new_val) {
            this.data.START_ADDR = new_val;
        },
        pointCnt(new_val) {
            this.data.POINT_CNT = new_val;
        },
        dtypeCd(new_val) {
            this.data.DTYPE_CD = new_val;
        }
    },
    apollo: {
        dtype: {
            query: gql`
                query {
                    Codes(TYPE: "DTYPE") {
                        CODE
                        NAME
                    }
                }
            `,
            prefetch: false,
            update: ({ Codes }) => Codes
        }
    }
})
export default class ModbusCmdPanel extends Vue {
    data = {
        FUNC_CD: this.$props.funcCd,
        START_ADDR: this.$props.startAddr,
        POINT_CNT: this.$props.pointCnt,
        DTYPE_CD: this.$props.dtypeCd
    };

    dtype: Array<any> = [];

    inputFuncNum(input: InputEvent) {
        this.$emit('update:funcCd', input);
    }

    inputStartAddr(input: InputEvent) {
        this.$emit('update:startAddr', input);
    }

    inputPointCnt(input: InputEvent) {
        this.$emit('update:pointCnt', input);
    }

    inputDtype(input: InputEvent) {
        this.$emit('update:dtypeCd', input);
    }
}
</script>

<style lang="scss" scoped>
#modbusCmdCard::v-deep {
    border: 1px solid var(--surface-d);

    .i-header-title {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .p-card-header {
        padding: 0.5rem 1rem 0 1rem;
    }

    .p-card-content {
        padding: 0;
    }
}
</style>
