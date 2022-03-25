<template>
    <div id="i-company-panel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center p-text-bold i-title">
                {{ companyName }}
            </div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-check"
                    label="적용"
                    class="p-mr-2"
                    :disabled="applyButtonDisabled"
                    @click="updateCompany"
                ></Button>
                <Button
                    icon="pi pi-trash"
                    label="삭제"
                    class="p-button-danger"
                    @click="deleteCompany"
                ></Button>
            </div>
        </div>
        <Divider />
        <ScrollPanel class="i-company-panel">
            <div class="p-grid p-px-2">
                <div class="p-col-3 p-fluid p-input-filled">
                    <div class="p-field">
                        <label for="name">업체명</label>
                        <InputText
                            id="name"
                            v-model="company.NAME"
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
                            v-model="company.ADDR"
                            type="text"
                            aria-describedby="addr-help"
                            autocomplete="off"
                            :class="{ 'p-invalid': invalidMessage.ADDR }"
                            @input="validateAddr"
                        ></InputText>
                        <small id="addr-help" class="p-error">
                            {{ invalidMessage.ADDR }}
                        </small>
                    </div>
                    <div class="p-field">
                        <label for="phone">대표번호</label>
                        <i-input-text-phone
                            id="phone"
                            v-model="company.PHONE"
                            type="text"
                            aria-describedby="phone-help"
                            autocomplete="off"
                            placeholder="공백없이 숫자만 입력"
                            :class="{ 'p-invalid': invalidMessage.PHONE }"
                        ></i-input-text-phone>
                        <small id="phone-help" class="p-error">
                            {{ invalidMessage.PHONE }}
                        </small>
                    </div>
                    <div class="p-field">
                        <label for="fax">팩스번호</label>
                        <i-input-text-phone
                            id="fax"
                            v-model="company.FAX"
                            type="text"
                            aria-describedby="fax-help"
                            autocomplete="off"
                            placeholder="공백없이 숫자만 입력"
                            :class="{ 'p-invalid': invalidMessage.FAX }"
                        ></i-input-text-phone>
                        <small id="fax-help" class="p-error">
                            {{ invalidMessage.FAX }}
                        </small>
                    </div>
                    <div class="p-field">
                        <label for="email">이메일</label>
                        <InputText
                            id="email"
                            v-model="company.EMAIL"
                            type="text"
                            aria-describedby="email-help"
                            autocomplete="off"
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
                            v-model="company.URL"
                            type="text"
                            aria-describedby="url-help"
                            autocomplete="off"
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
                            v-model="company.REMARK"
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
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

type Company = {
    [index: string]: string | null;
    ADDR: string;
    EMAIL: string;
    FAX: string;
    NAME: string;
    PHONE: string;
    REMARK: string;
};

@Component<CompanyPanel>({
    props: {
        companyId: Number,
    },
    apollo: {
        dbCompany: {
            query: gql`
                query Company($ID: ID!) {
                    Company(ID: $ID) {
                        NAME
                        ADDR
                        PHONE
                        FAX
                        EMAIL
                        URL
                        REMARK
                        OPERATORS {
                            ID
                        }
                    }
                }
            `,
            variables() {
                return {
                    ID: this.companyId < 0 ? -1 : this.companyId,
                };
            },
            prefetch: false,
            update: ({ Company }) => Company,
            result({ loading, data }: any) {
                if (!loading) {
                    const { Company } = data;

                    if (Company) {
                        this.apolloFetch(Company);
                    }

                    this.hasChild = Company.OPERATORS.length > 0 ? true : false;
                }
            },
        },
    },
})
export default class CompanyPanel extends Vue {
    dbCompany: Company = {
        NAME: '',
        ADDR: '',
        PHONE: '',
        FAX: '',
        EMAIL: '',
        URL: '',
        REMARK: '',
    };

    company: Company = {
        NAME: '',
        ADDR: '',
        PHONE: '',
        FAX: '',
        EMAIL: '',
        URL: '',
        REMARK: '',
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        ADDR: undefined as string | undefined,
        PHONE: undefined as string | undefined,
        FAX: undefined as string | undefined,
        EMAIL: undefined as string | undefined,
        URL: undefined as string | undefined,
        REMARK: undefined as string | undefined,
    };

    emailReg =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

    hasChild: boolean = false;

    companyDataRefresh() {
        this.$apollo.queries.dbCompany.refresh();
    }

    apolloFetch(company: Company) {
        for (const [key, value] of Object.entries(company)) {
            this.company[key] = value;
        }
    }

    validateName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessage.NAME = '업체명은 32자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessage.NAME = '업체명은 2자 이하일 수 없습니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    validateAddr(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 100) {
            this.invalidMessage.ADDR = '주소는 100자 이하입니다';
        } else {
            this.invalidMessage.ADDR = undefined;
        }
    }

    validateEmail(input: InputEvent) {
        const _input = input.toString();

        if (_input.length > 64) {
            this.invalidMessage.EMAIL = '이메일은 64자 이하입니다';
        } else if (_input.length > 0 && !this.emailReg.test(_input)) {
            this.invalidMessage.EMAIL = '이메일 형식이 아닙니다';
        } else {
            this.invalidMessage.EMAIL = undefined;
        }
    }

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
    }

    validateRemark(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 256) {
            this.invalidMessage.REMARK = '설명은 256자 이하입니다';
        } else {
            this.invalidMessage.REMARK = undefined;
        }
    }

    updateCompany() {
        if (!this.validationCheck) {
            this.$toast.add({
                severity: 'warn',
                summary: '업체 정보 유효성 실패',
                detail: '업체 정보 내용을 확인하세요',
                life: 2000,
            });
            return;
        }

        const variables = {
            ID: this.$props.companyId,
        };

        for (const [key, value] of Object.entries(this.company)) {
            if (this.dbCompany[key] !== value) {
                Object.defineProperty(variables, key, {
                    value: value,
                    configurable: true,
                    enumerable: true,
                    writable: true,
                });
            }
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation UpdateCompany(
                        $ID: ID!
                        $NAME: String
                        $ADDR: String
                        $PHONE: String
                        $FAX: String
                        $EMAIL: String
                        $URL: String
                        $REMARK: String
                    ) {
                        UpdateCompany(
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
            .then(({ data: { UpdateCompany } }: any) => {
                if (UpdateCompany) {
                    eventBus.$emit('refreshManagerTree');

                    this.companyDataRefresh();

                    this.$toast.add({
                        severity: 'info',
                        summary: '업체 정보 변경 완료',
                        detail: `${this.company.NAME} 변경`,
                        life: 1500,
                    });
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '업체 정보 변경 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    deleteCompany() {
        // by shkoh 20220325: 삭제하기 전에 데이터 갱신
        this.companyDataRefresh();

        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `[${this.companyName}] 업체를 삭제하시겠습니까?\n담당자가 등록되지 않은 업체만 삭제가 가능합니다.`,
            header: `${this.companyName} 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                if (this.hasChild) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: '업체 삭제 불가',
                        detail: `${this.companyName}에 담당자가 등록되어 있습니다`,
                        life: 2000,
                    });
                } else {
                    this.delete();
                }
            },
        });
    }

    delete() {
        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeleteCompany(ID: ${this.$props.companyId})
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: `${this.companyName} 삭제 완료`,
                    life: 1500,
                });

                eventBus.$emit('refreshManagerTree');
                this.$emit('reset');
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '업체 삭제 실패',
                    detail: error.message,
                    life: 2000,
                });
            });
    }

    get companyName(): string {
        return `${this.dbCompany.NAME}`;
    }

    get applyButtonDisabled(): boolean {
        let is_disabled = true;

        for (const [key, value] of Object.entries(this.company)) {
            if (value !== this.dbCompany[key]) {
                is_disabled = false;
                break;
            }
        }

        return is_disabled;
    }

    get validationCheck(): boolean {
        let is_valid = true;
        for (const valid of Object.values(this.invalidMessage)) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
    }
}
</script>

<style lang="scss" scoped>
#i-company-panel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 10vw;
    }
}
</style>