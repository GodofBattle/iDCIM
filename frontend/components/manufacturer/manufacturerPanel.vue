<template>
    <ScrollPanel v-if="manufacturerId > 0">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">
                {{ manufacturerName }}
            </div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-check"
                    label="적용"
                    class="p-mr-2"
                    :disabled="applyButtonDisabled"
                    @click="updateManufacturer"
                ></Button>
                <Button
                    icon="pi pi-trash"
                    label="삭제"
                    class="p-button-danger"
                    @click="deleteManufacturer"
                ></Button>
            </div>
        </div>
        <Divider />
        <div class="p-grid p-px-2">
            <div class="p-col-3 p-fluid p-input-filled">
                <div class="p-field">
                    <label for="name">제조사명</label>
                    <InputText
                        id="name"
                        v-model="newData.NAME"
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
                        v-model="newData.ADDR"
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
                        v-model="newData.PHONE"
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
                        v-model="newData.FAX"
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
                        v-model="newData.EMAIL"
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
                        v-model="newData.URL"
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
                        v-model="newData.REMARK"
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
        </div>
    </ScrollPanel>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import { eventBus } from '@/plugins/vueEventBus';

type Manufacturer = {
    [index: string]: string;
    NAME: string;
    ADDR: string;
    PHONE: string;
    FAX: string;
    EMAIL: string;
    URL: string;
    REMARK: string;
};

export default Vue.extend({
    apollo: {
        manufacturerData: {
            query: gql`
                query Manufacturer($ID: ID!) {
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
                    ID: this.manufacturerId < 0 ? -1 : this.manufacturerId,
                };
            },
            result({ data, loading }) {
                if (!loading) {
                    const { Manufacturer } = data;

                    // by shkoh 20210831: Tree에서 제품을 선택하지 않은 경우에 API 서버로부터 NULL을 받기 때문에 예외처리를 해줘야 한다
                    if (Manufacturer) {
                        // by shkoh 20210831: API 서버로부터 받은 값을 토대로 사전에 수정이 필요한 값으로 복사함
                        for (const key of Object.keys(this.newData)) {
                            this.newData[key] = Manufacturer[key];
                        }

                        // by shkoh 20210906: 제품존재 여부 판단
                        if (Manufacturer.PRODUCTS.length > 0)
                            this.hasChild = true;
                        else if (Manufacturer.PRODUCTS.length === 0)
                            this.hasChild = false;
                    }
                }
            },
        },
    },
    props: {
        manufacturerId: {
            type: Number,
        },
    },
    data: () => ({
        manufacturerData: {
            NAME: '',
            ADDR: '',
            PHONE: '',
            FAX: '',
            EMAIL: '',
            URL: '',
            REMARK: '',
        } as Manufacturer,
        newData: {
            NAME: '',
            ADDR: '',
            PHONE: '',
            FAX: '',
            EMAIL: '',
            URL: '',
            REMARK: '',
        } as Manufacturer,
        invalidMessage: {
            NAME: undefined as String | undefined,
            ADDR: undefined as String | undefined,
            PHONE: undefined as String | undefined,
            EMAIL: undefined as String | undefined,
            URL: undefined as String | undefined,
            REMARK: undefined as String | undefined,
        },
        emailReg:
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
        hasChild: false,
    }),
    computed: {
        manufacturerName() {
            return this.manufacturerData ? this.manufacturerData.NAME : '';
        },
        applyButtonDisabled() {
            let is_disabled = true;

            // by shkoh 20210831: 제조사 데이터를 로드하지 않은 상태에서는 [적용] 버튼 비활성화
            if (this.manufacturerData === null) return true;

            // by shkoh 20210831: API로부터 받은 데이터와 작성자가 수정하기 위한 데이터를 비교
            for (const key of Object.keys(this.newData)) {
                // by shkoh 20210831: 새롭게 변경된 값들 중에서 동일한 key의 값을 비교하여 해당 값이 다른 경우에 저장 가능 상태로 변경함
                const is_modified = Object.entries(this.manufacturerData).some(
                    ([k, v]) => k === key && v !== this.newData[key]
                );

                if (is_modified) {
                    is_disabled = false;
                    break;
                }
            }

            return is_disabled;
        },
    },
    methods: {
        validateName(input: InputEvent) {
            const _input = input.toString();
            if (_input.length > 32) {
                this.invalidMessage.NAME = '제조사명은 32자 이하입니다';
            } else if (_input.length < 2) {
                this.invalidMessage.NAME = '제조사명은 2자 이하일 수 없습니다';
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
        manufacturerDataRefresh() {
            this.$apollo.queries.manufacturerData.refresh();
        },
        updateManufacturer() {
            if (!this.validationCheck()) {
                this.$toast.add({
                    severity: 'warn',
                    summary: '제조사 유효성 실패',
                    detail: '제조사 내용을 확인하세요',
                    life: 2000,
                });
                return;
            }

            const variables = {
                ID: this.manufacturerId,
                NAME: this.newData.NAME,
            };

            ['ADDR', 'PHONE', 'FAX', 'EMAIL', 'URL', 'REMARK'].forEach(
                (key: string) => {
                    if (this.newData[key] !== this.manufacturerData[key]) {
                        Object.defineProperty(variables, key, {
                            value: this.newData[key],
                            configurable: true,
                            enumerable: true,
                            writable: true,
                        });
                    }
                }
            );

            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation UpdateManufacturer(
                            $ID: ID!
                            $NAME: String!
                            $ADDR: String
                            $PHONE: String
                            $FAX: String
                            $EMAIL: String
                            $URL: String
                            $REMARK: String
                        ) {
                            UpdateManufacturer(
                                ID: $ID
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
                    variables,
                })
                .then(() => {
                    eventBus.$emit('refreshProductTree');
                    this.manufacturerDataRefresh();
                })
                .catch((error) => {
                    console.error(error);

                    this.$toast.add({
                        severity: 'error',
                        summary: '제조사 변경 실패',
                        detail: error.message,
                        life: 2000,
                    });
                });
        },
        deleteManufacturer() {
            console.info(this.hasChild);
            // by shkoh 20210906: 삭제하기 전에 데이터 갱신
            this.$apollo.queries.manufacturerData.refresh();

            this.$confirmDialog.require({
                group: 'deleteConfirmDialog',
                message: `[${this.manufacturerName}] 제조사를 삭제하시겠습니까?\n제품이 등록되지 않은 제조사만 삭제가 가능합니다.`,
                header: `제조사 ${this.manufacturerName} 삭제`,
                position: 'top',
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                blockScroll: false,
                accept: () => {
                    console.info(this.hasChild);
                    if (this.hasChild) {
                        this.$toast.add({
                            severity: 'warn',
                            summary: '제조사 삭제 불가',
                            detail: `${this.manufacturerName} 제조사 제품이 존재합니다`,
                            life: 1000,
                        });
                    } else {
                        this.delete();
                    }
                },
            });
        },
        delete() {
            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation {
                            DeleteManufacturer(ID: ${this.manufacturerId})
                        }
                    `,
                })
                .then(() => {
                    eventBus.$emit('refreshProductTree');
                    this.$emit('reset');
                })
                .catch((error) => {
                    console.error(error);

                    this.$toast.add({
                        severity: 'error',
                        summary: '제조사 삭제 실패',
                        detail: error.message,
                        life: 2000,
                    });
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
