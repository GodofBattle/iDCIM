<template>
    <div id="i-operator-panel-info" class="p-grid">
        <div class="p-col-3 p-fluid p-input-filled">
            <div class="p-field">
                <label for="name">담당자명</label>
                <InputText
                    id="name"
                    v-model="operatorInfo.NAME"
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
                <label for="dept">부서</label>
                <InputText
                    id="dept"
                    v-model="operatorInfo.DEPT"
                    type="text"
                    aria-describedby="dept-help"
                    autocomplete="off"
                    :class="{ 'p-invalid': invalidMessage.DEPT }"
                    @input="validateDept"
                ></InputText>
                <small id="name-help" class="p-error">
                    {{ invalidMessage.DEPT }}
                </small>
            </div>
            <div class="p-field">
                <label for="dept">전화번호(내선)</label>
                <div class="p-d-flex p-fluid">
                    <div class="p-mr-1" style="flex-basis: 80%">
                        <i-input-text-phone
                            id="phone"
                            v-model="operatorInfo.PHONE"
                            type="text"
                            aria-describedby="phone-help"
                            autocomplete="off"
                        ></i-input-text-phone>
                    </div>
                    <div style="flex-basis: 20%">
                        <i-input-text-phone
                            id="ext_no"
                            v-model="operatorInfo.EXT_NO"
                            type="text"
                            aria-describedby="ext_no-help"
                            autocomplete="off"
                            maxlength="4"
                        ></i-input-text-phone>
                    </div>
                </div>
            </div>
            <div class="p-field">
                <label for="mobile">휴대폰</label>
                <i-input-text-phone
                    id="mobile"
                    v-model="operatorInfo.MOBILE"
                    type="text"
                    aria-describedby="mobile-help"
                    autocomplete="off"
                ></i-input-text-phone>
            </div>
            <div class="p-field">
                <label for="email">이메일</label>
                <InputText
                    id="email"
                    v-model="operatorInfo.EMAIL"
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
                <label for="remark">설명</label>
                <Textarea
                    id="remark"
                    v-model="operatorInfo.REMARK"
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
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

type OperatorInfo = {
    [index: string]: string;
    NAME: string;
    DEPT: string;
    PHONE: string;
    EXT_NO: string;
    MOBILE: string;
    EMAIL: string;
    REMARK: string;
};

@Component<OperatorPanelInfo>({
    props: {
        operatorId: Number,
        applyButtonDisabled: Boolean,
    },
    watch: {
        operatorInfo: {
            deep: true,
            handler(_new_info: OperatorInfo) {
                this.compareOperatorInfo(_new_info);
                console.info('watch');
            },
        },
    },
    apollo: {
        dbOperatorInfo: {
            query: gql`
                query Operator($ID: ID!) {
                    Operator(ID: $ID) {
                        NAME
                        DEPT
                        PHONE
                        EXT_NO
                        MOBILE
                        EMAIL
                        REMARK
                    }
                }
            `,
            prefetch: false,
            variables(): any {
                return {
                    ID: this.operatorId < 0 ? -1 : this.operatorId,
                };
            },
            update: ({ Operator }) => Operator,
            result({ loading, data }) {
                if (!loading) {
                    const { Operator } = data;

                    if (Operator) {
                        this.apolloFetch(Operator);
                    }
                }
            },
        },
    },
})
export default class OperatorPanelInfo extends Vue {
    dbOperatorInfo: OperatorInfo = {
        NAME: '',
        DEPT: '',
        PHONE: '',
        EXT_NO: '',
        MOBILE: '',
        EMAIL: '',
        REMARK: '',
    };

    operatorInfo: OperatorInfo = {
        NAME: '',
        DEPT: '',
        PHONE: '',
        EXT_NO: '',
        MOBILE: '',
        EMAIL: '',
        REMARK: '',
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        DEPT: undefined as string | undefined,
        EMAIL: undefined as string | undefined,
        REMARK: undefined as string | undefined,
    };

    emailReg =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

    reset() {
        this.operatorInfo.NAME = '';
        this.operatorInfo.DEPT = '';
        this.operatorInfo.PHONE = '';
        this.operatorInfo.EXT_NO = '';
        this.operatorInfo.MOBILE = '';
        this.operatorInfo.EMAIL = '';
        this.operatorInfo.REMARK = '';

        this.invalidMessage.NAME = undefined;
        this.invalidMessage.DEPT = undefined;
        this.invalidMessage.EMAIL = undefined;
        this.invalidMessage.REMARK = undefined;
    }

    apolloFetch(data: OperatorInfo) {
        this.reset();

        for (const key of Object.keys(this.operatorInfo)) {
            this.operatorInfo[key] = data[key];
        }
    }

    validateName(input: InputEvent) {
        const _input = input.toString();

        if (_input.length > 16) {
            this.invalidMessage.NAME = '담당자명은 16자 이하입니다';
        } else if (_input.length < 1) {
            this.invalidMessage.NAME = '담당자명은 1자 이하일 수 없습니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    validateDept(input: InputEvent) {
        const _input = input.toString();

        if (_input.length > 16) {
            this.invalidMessage.NAME = '부서명은 16자 이하입니다';
        } else {
            this.invalidMessage.NAME = undefined;
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

    validateRemark(input: InputEvent) {
        const _input = input.toString();

        if (_input.length > 256) {
            this.invalidMessage.REMARK = '설명은 256자 이하입니다';
        } else {
            this.invalidMessage.REMARK = undefined;
        }
    }

    compareOperatorInfo(new_operator_info: OperatorInfo) {
        this.$emit('update:applyButtonDisabled', true);

        for (const [key, value] of Object.entries(new_operator_info)) {
            if (value !== this.dbOperatorInfo[key]) {
                this.$emit('update:applyButtonDisabled', false);
                break;
            }
        }
    }

    updateOperatorInfo() {
        if (!this.validationCheck) {
            this.$toast.add({
                severity: 'warn',
                summary: '자산 담당자 유효성 실패',
                detail: '담당자 내용을 확인하세요',
                life: 2000,
            });

            return;
        }

        const variables = {
            ID: this.$props.operatorId,
        };

        for (const [key, value] of Object.entries(this.operatorInfo)) {
            if (value !== this.dbOperatorInfo[key]) {
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
                    mutation UpdateOperator(
                        $ID: ID!
                        $NAME: String
                        $DEPT: String
                        $PHONE: String
                        $EXT_NO: String
                        $MOBILE: String
                        $EMAIL: String
                        $REMARK: String
                    ) {
                        UpdateOperator(
                            ID: $ID
                            NAME: $NAME
                            DEPT: $DEPT
                            PHONE: $PHONE
                            EXT_NO: $EXT_NO
                            MOBILE: $MOBILE
                            EMAIL: $EMAIL
                            REMARK: $REMARK
                        )
                    }
                `,
                variables,
            })
            .then(({ data: { UpdateOperator } }: any) => {
                if (UpdateOperator) {
                    eventBus.$emit('refreshManagerTree');

                    this.operatorInfoRefresh();

                    this.$toast.add({
                        severity: 'info',
                        summary: '담당자 변경 완료',
                        detail: `${this.operatorInfo.NAME} 담당자 정보 변경`,
                        life: 2000,
                    });
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '담당자 정보 변경 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    operatorInfoRefresh() {
        this.$apollo.queries.dbOperatorInfo.refresh();
        this.$emit('opertorDataRefresh');
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