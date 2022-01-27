<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header> 제조사 추가 </template>

        <ScrollPanel style="height: 50vh; padding: 0.4rem">
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
                        @input="validateName"
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
                        @input="validateAddress"
                    ></InputText>
                    <small id="addr-help" class="p-error">
                        {{ invalidMessage.ADDR }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="phone">대표번호</label>
                    <i-input-text-phone
                        id="phone"
                        v-model="addData.PHONE"
                        type="text"
                        aria-describedby="phone-help"
                        autocomplete="off"
                        placeholder="공백없이 숫자만 입력"
                    ></i-input-text-phone>
                </div>
                <div class="p-field">
                    <label for="fax">팩스번호</label>
                    <i-input-text-phone
                        id="fax"
                        v-model="addData.FAX"
                        type="text"
                        aria-describedby="fax-help"
                        autocomplete="off"
                        placeholder="공백없이 숫자만 입력"
                    ></i-input-text-phone>
                </div>
                <div class="p-field">
                    <label for="email">이메일</label>
                    <InputText
                        id="email"
                        v-model="addData.EMAIL"
                        type="email"
                        aria-describedby="email-help"
                        autocomplete="off"
                        placeholder="Email Address"
                        :class="{ 'p-invalid': invalidMessage.EMAIL }"
                        @input="validateEmail"
                    ></InputText>
                    <small id="email-help" class="p-error">
                        {{ invalidMessage.EMAIL }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="url">홈페이지</label>
                    <InputText
                        id="url"
                        v-model="addData.URL"
                        type="url"
                        aria-describedby="url-help"
                        autocomplete="off"
                        placeholder="제조사 홈페이지 주소"
                        :class="{ 'p-invalid': invalidMessage.URL }"
                        @input="validateUrl"
                    ></InputText>
                    <small id="url-help" class="p-error">
                        {{ invalidMessage.URL }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="remark">설명</label>
                    <Textarea
                        id="remark"
                        v-model="addData.REMARK"
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
        </ScrollPanel>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    style="width: 100%"
                    :disabled="addDisabled"
                    @click="addManufacturer"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

export default Vue.extend({
    props: {
        visibleAddManufacturerDialog: Boolean
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
                REMARK: ''
            },
            invalidMessage: {
                NAME: undefined as String | undefined,
                ADDR: undefined as String | undefined,
                PHONE: undefined as String | undefined,
                EMAIL: undefined as String | undefined,
                URL: undefined as String | undefined,
                REMARK: undefined as String | undefined
            },
            emailReg:
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
        };
    },
    computed: {
        showDialog: {
            get(): Boolean {
                return this.visibleAddManufacturerDialog;
            },
            set(is_show: Boolean) {
                this.$emit('update:visibleAddManufacturerDialog', is_show);
            }
        },
        addDisabled() {
            let is_disabled = true;

            if (this.addData.NAME.length > 0) is_disabled = false;

            return is_disabled === true;
        }
    },
    methods: {
        onDialogHide() {
            // by shkoh 20210820: Dialog가 닫힐 때, addData Object를 초기화한다
            this.addData.NAME = '';
            this.addData.ADDR = '';
            this.addData.PHONE = '';
            this.addData.FAX = '';
            this.addData.EMAIL = '';
            this.addData.URL = '';
            this.addData.REMARK = '';

            this.invalidMessage.NAME = undefined;
            this.invalidMessage.ADDR = undefined;
            this.invalidMessage.PHONE = undefined;
            this.invalidMessage.EMAIL = undefined;
            this.invalidMessage.URL = undefined;
            this.invalidMessage.REMARK = undefined;
        },
        validateName(input: InputEvent) {
            const _input = input.toString();
            if (_input.length > 32) {
                this.invalidMessage.NAME = '제조사명은 32자 이하입니다';
            } else {
                this.invalidMessage.NAME = undefined;
            }
        },
        validateAddress(input: InputEvent) {
            const _input = input.toString();
            if (_input.length > 100) {
                this.invalidMessage.ADDR = '주소는 100자 이하입니다';
            } else {
                this.invalidMessage.ADDR = undefined;
            }
        },
        validateEmail(input: InputEvent) {
            const _input = input.toString();

            if (_input.length > 64) {
                this.invalidMessage.EMAIL = '이메일은 64자 이하입니다';
            } else if (_input.length > 0 && !this.emailReg.test(_input)) {
                this.invalidMessage.EMAIL = '이메일 형식이 아닙니다';
            } else {
                this.invalidMessage.EMAIL = undefined;
            }
        },
        validateUrl(input: InputEvent) {
            const _input = input.toString();
            const regex = RegExp(
                '(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+@]*)*(\\?[;&a-z\\d%_.~+=-@]*)?(\\#[-a-z\\d_@]*)?$',
                'i'
            );
            if (_input.length > 80) {
                this.invalidMessage.URL = 'URL은 80자 이하입니다';
            } else if (_input.length > 0 && !regex.test(_input)) {
                this.invalidMessage.URL = 'URL 형식이 아닙니다';
            } else {
                this.invalidMessage.URL = undefined;
            }
        },
        validateRemark(input: InputEvent) {
            const _input = input.toString();
            if (_input.length > 256) {
                this.invalidMessage.REMARK = '설명은 256자 이하입니다';
            } else {
                this.invalidMessage.REMARK = undefined;
            }
        },
        validationCheck() {
            let is_valid = true;
            for (const valid of Object.values(this.invalidMessage)) {
                if (valid) {
                    is_valid = false;
                    return;
                }
            }

            return is_valid;
        },
        addManufacturer() {
            if (!this.validationCheck()) {
                this.$toast.add({
                    severity: 'warn',
                    summary: '제조사 유효성 실패',
                    detail: '제조사 내용을 확인하세요',
                    life: 2000
                });
                return;
            }

            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation AddManufacturer(
                            $NAME: String!
                            $ADDR: String
                            $PHONE: String
                            $FAX: String
                            $EMAIL: String
                            $URL: String
                            $REMARK: String
                        ) {
                            AddManufacturer(
                                NAME: $NAME
                                ADDR: $ADDR
                                PHONE: $PHONE
                                FAX: $FAX
                                EMAIL: $EMAIL
                                URL: $URL
                                REMARK: $REMARK
                            )
                        }
                    `,
                    variables: this.addData
                })
                .then(() => {
                    this.$toast.add({
                        severity: 'success',
                        summary: '제조사 추가',
                        detail: `${this.addData.NAME} 추가완료`,
                        life: 1500
                    });

                    this.$emit('refresh');

                    this.showDialog = false;
                })
                .catch((error) => {
                    console.error(error);

                    this.$toast.add({
                        severity: 'error',
                        summary: '제조사 추가 실패',
                        detail: error.message,
                        life: 2000
                    });
                });
        }
    }
});
</script>
