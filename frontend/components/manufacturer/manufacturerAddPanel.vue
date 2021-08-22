<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header> 제조사 추가 </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small>제품 제조사를 등록합니다</small>
            </div>
            <div class="p-field">
                <label for="name">제조사명</label>
                <InputText
                    id="name"
                    v-model="addData.NAME"
                    type="text"
                    aria-describedby="name-help"
                    autocomplete="off"
                    :class="{ 'p-invalid': invalidMessage.NAME }"
                ></InputText>
                <small id="name-help" class="p-error">
                    {{ invalidMessage.NAME }}
                </small>
            </div>
            <div class="p-field">
                <label for="addr">주소</label>
                <InputText
                    id="addr"
                    v-model="addData.ADDR"
                    type="text"
                    aria-describedby="addr-help"
                    autocomplete="off"
                    :class="{ 'p-invalid': invalidMessage.ADDR }"
                ></InputText>
                <small id="addr-help" class="p-error">
                    {{ invalidMessage.ADDR }}
                </small>
            </div>
            <div class="p-field">
                <label for="phone">대표번호</label>
                <InputText
                    id="phone"
                    v-model="phoneNumber"
                    type="text"
                    aria-describedby="phone-help"
                    autocomplete="off"
                    placeholder="공백없이 숫자만 입력"
                    @keydown="convertPhoneNumber"
                ></InputText>
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    style="width: 100%"
                    :disabled="addDisabled"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        visibleAddManufacturerDialog: Boolean,
    },
    data() {
        return {
            addData: {
                NAME: '',
                ADDR: '',
                PHONE: '',
                FAX: '',
                EMAIL: '',
                URL: '',
                REMARK: '',
            },
            invalidMessage: {
                NAME: undefined as String | undefined,
                ADDR: undefined as String | undefined,
                PHONE: undefined as String | undefined,
            },
        };
    },
    computed: {
        showDialog: {
            get(): Boolean {
                return this.visibleAddManufacturerDialog;
            },
            set(is_show: Boolean) {
                this.$emit('update:visibleAddManufacturerDialog', is_show);
            },
        },
        phoneNumber: {
            get(): string {
                console.info(3);
                return this.addData.PHONE;
            },
            set(new_val: string) {
                console.info(2);
                this.addData.PHONE = new_val;
            },
        },
        addDisabled() {
            let is_disabled = true;

            if (this.addData.NAME.length > 0) is_disabled = false;

            return is_disabled === true;
        },
    },
    methods: {
        onDialogHide() {
            // by shkoh 20210820: Dialog가 닫힐 때, addData Object를 초기화한다
            Object.keys(this.addData).forEach((key) => {
                Object.defineProperty(this.addData, key, {
                    value: '',
                    configurable: true,
                    enumerable: true,
                    writable: true,
                });
            });
        },
        convertPhoneNumber(event: KeyboardEvent) {
            console.info(1);
            console.info(event);

            // event.preventDefault();
            // const insert_key = event.code.includes('Digit') ? event.key : '';
            // if (insert_key !== '') {
            //     this.addData.PHONE += insert_key;
            // }
        },
    },
    watch: {
        addData: {
            deep: true,
            handler(new_data) {
                if (new_data.NAME.length > 32) {
                    this.invalidMessage.NAME = '제조사명은 32자 이하입니다';
                } else {
                    this.invalidMessage.NAME = undefined;
                }

                if (new_data.ADDR.length > 100) {
                    this.invalidMessage.ADDR = '주소는 100자 이하입니다';
                } else {
                    this.invalidMessage.ADDR = undefined;
                }
            },
        },
    },
});
</script>