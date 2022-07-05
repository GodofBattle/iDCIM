<template>
    <Card id="modbusCmdCard" :class="modbusCmdClass">
        <template #header>
            <div class="p-d-flex">
                <div class="p-as-center p-pl-2 i-header-title">
                    MC ID: {{ mcId }}
                </div>
                <div class="p-ml-auto">
                    <Button
                        class="p-button-rounded p-button-text p-button-help"
                        icon="pi pi-copy"
                        @click="copyModbusCmdCard"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text"
                        icon="pi pi-save"
                        :disabled="saveButtonDisabled"
                        @click="saveModbusCmdCard"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-minus"
                        @click="deleteModbusCmdCard"
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
                        v-model="data.FUNC_NO"
                        mode="decimal"
                        :min="0"
                        :max="127"
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
                        :max="65535"
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
                        :max="127"
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
                        append-to="body"
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

type ModbusCmd = {
    [index: string]: string | undefined;
    FUNC_NO: string;
    START_ADDR: string;
    POINT_CNT: string;
    DTYPE_CD: string;
};

@Component<ModbusCmdPanel>({
    props: {
        idx: Number,
        intfId: Number,
        mcId: Number,
        funcNo: Number,
        startAddr: Number,
        pointCnt: Number,
        dtypeCd: String,
        initData: Object,
        isEditable: Boolean
    },
    watch: {
        funcNo(new_val) {
            this.data.FUNC_NO = new_val;
        },
        startAddr(new_val) {
            this.data.START_ADDR = new_val;
        },
        pointCnt(new_val) {
            this.data.POINT_CNT = new_val;
        },
        dtypeCd(new_val) {
            this.data.DTYPE_CD = new_val;
        },
        isEditable() {
            this.$emit('change');
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
            fetchPolicy: 'cache-and-network',
            update: ({ Codes }) => Codes
        }
    }
})
export default class ModbusCmdPanel extends Vue {
    data: ModbusCmd = {
        FUNC_NO: this.$props.funcNo,
        START_ADDR: this.$props.startAddr,
        POINT_CNT: this.$props.pointCnt,
        DTYPE_CD: this.$props.dtypeCd
    };

    dtype: Array<any> = [];

    get modbusCmdClass(): Array<any> {
        return [{ 'i-editable': !this.saveButtonDisabled }];
    }

    get saveButtonDisabled(): boolean {
        if (this.$props.initData === undefined) {
            this.$emit('update:isEditable', true);
            this.$emit('change');
            return false;
        }

        let is_disabled = true;
        for (const key of Object.keys(this.data)) {
            if (this.data[key] !== this.$props.initData[key]) {
                is_disabled = false;
                break;
            }
        }

        this.$emit('update:isEditable', !is_disabled);
        this.$emit('change');
        return is_disabled;
    }

    inputFuncNum(input: InputEvent) {
        this.$emit('update:funcNo', input);
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

    deleteModbusCmdCard() {
        this.$emit('delete');
    }

    copyModbusCmdCard() {
        this.$emit('copy', {
            INTF_ID: this.$props.intfId,
            MC_ID: this.$props.mcId,
            FUNC_NO: this.data.FUNC_NO,
            START_ADDR: this.data.START_ADDR,
            POINT_CNT: this.data.POINT_CNT,
            DTYPE_CD: this.data.DTYPE_CD
        });
    }

    saveModbusCmdCard() {
        if (this.data.DTYPE_CD === '') {
            this.$toast.add({
                severity: 'warn',
                summary: '통신방법 유효성 실패',
                detail: 'DTYPE을 확인하세요',
                life: 2000
            });
            return;
        }

        // by shkoh 20211026. 저장버튼을 클릭하는 순간 editable 상태는 종료된다.
        this.$emit('save', this.$props.idx, {
            FUNC_NO: this.data.FUNC_NO,
            START_ADDR: this.data.START_ADDR,
            POINT_CNT: this.data.POINT_CNT,
            DTYPE_CD: this.data.DTYPE_CD
        });
    }
}
</script>

<style lang="scss" scoped>
#modbusCmdCard::v-deep {
    width: 100%;
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

#modbusCmdCard.i-editable {
    border-left: 10px solid;
    border-color: var(--yellow-500);
}
</style>
