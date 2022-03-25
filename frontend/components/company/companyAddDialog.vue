<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '18vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header> {{ title }} </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small>{{ subTitle }}</small>
            </div>
            <ScrollPanel class="i-company-add-panel-content p-px-2">
                <div class="p-field">
                    <label for="name">업체명</label>
                    <InputText
                        id="name"
                        v-model="company.NAME"
                        type="text"
                        aria-describedby="name-help"
                        aria-autocomplete="off"
                        :class="{ 'p-invlid': invalidMessage.NAME }"
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
                        aria-autocomplete="off"
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
            </ScrollPanel>
        </div>

        <template #footer>
            <div class="p-fluid p-d-flex p-mx-2">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    style="width: 100%"
                    :disabled="isDisabledAddButton"
                    @click="onClickAddButton"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type Company = {
    [index: string]: string | null;
    ADDR: string;
    EMAIL: string;
    FAX: string;
    NAME: string;
    PHONE: string;
    REMARK: string;
};

@Component<CompanyAddDialog>({
    props: {
        visible: Boolean,
        tabType: {
            type: Object,
            default: null,
        },
    },
})
export default class CompanyAddDialog extends Vue {
    company: Company = {
        ADDR: '',
        EMAIL: '',
        FAX: '',
        NAME: '',
        PHONE: '',
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

    onDialogHide() {
        this.company.ADDR = '';
        this.company.EMAIL = '';
        this.company.FAX = '';
        this.company.NAME = '';
        this.company.PHONE = '';
        this.company.REMARK = '';

        this.invalidMessage.NAME = undefined;
        this.invalidMessage.ADDR = undefined;
        this.invalidMessage.PHONE = undefined;
        this.invalidMessage.FAX = undefined;
        this.invalidMessage.EMAIL = undefined;
        this.invalidMessage.URL = undefined;
        this.invalidMessage.REMARK = undefined;
    }

    onClickAddButton() {
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
            TYPE: this.$props.tabType.type,
            NAME: this.company.NAME,
            ADDR: this.company.ADDR,
            PHONE: this.company.PHONE,
            FAX: this.company.FAX,
            EMAIL: this.company.EMAIL,
            URL: this.company.URL,
            REMARK: this.company.REMARK,
        };

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation AddCompany(
                        $TYPE: String
                        $NAME: String
                        $ADDR: String
                        $PHONE: String
                        $FAX: String
                        $EMAIL: String
                        $URL: String
                        $REMARK: String
                    ) {
                        AddCompany(
                            TYPE: $TYPE
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
            .then(({ data: { AddCompany } }: any) => {
                if (AddCompany) {
                    this.$toast.add({
                        severity: 'info',
                        summary: '업체 정보 추가 완료',
                        detail: `${this.$props.tabType.header} - ${this.company.NAME} 추가`,
                        life: 1500,
                    });

                    this.$emit('refresh');

                    this.showDialog = false;
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '업체 정보 추가 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
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

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get title(): string {
        return `${this.$props.tabType.header} 등록`;
    }

    get subTitle(): string {
        return `DCIM 관리를 위한 ${this.$props.tabType.header} 정보를 등록합니다`;
    }

    get isDisabledAddButton(): boolean {
        let is_disabled = true;

        if (this.company.NAME.length > 1) is_disabled = false;

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
.i-company-add-panel-content {
    height: 50vh;
}
</style>