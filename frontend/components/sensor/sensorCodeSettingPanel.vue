<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @show="onDialogShow"
        @hide="onDialogHide"
    >
        <template #header> {{ title }} </template>

        <ScrollPanel style="width: 100%; height: 50vh; padding: 0.4rem">
            <div class="p-fluid p-input-filled">
                <div class="p-field">
                    <small>{{ subTitle }}</small>
                </div>
                <div class="p-field">
                    <label for="code">코드명</label>
                    <InputText
                        id="code"
                        v-model="CODE"
                        type="text"
                        aria-describedby="code-help"
                        autocomplete="off"
                        :class="{ 'p-invalid': invalidMessageCode }"
                    ></InputText>
                    <small id="code-help" class="p-error">
                        {{ invalidMessageCode }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="name">센서명</label>
                    <InputText
                        id="name"
                        v-model="NAME"
                        type="text"
                        aria-describedby="name-help"
                        autocomplete="off"
                        :class="{ 'p-invalid': invalidMessageName }"
                    ></InputText>
                    <small id="name-help" class="p-error">
                        {{ invalidMessageName }}
                    </small>
                </div>
                <div class="p-field">
                    <label for="type">타입</label>
                    <SelectButton
                        v-model="TYPE"
                        :options="types"
                        option-label="name"
                        option-value="value"
                    />
                </div>
                <div class="p-field">
                    <label for="unit">단위</label>
                    <InputText
                        id="unit"
                        v-model="UNIT"
                        type="text"
                        aria-describedby="unit-help"
                        autocomplete="off"
                        :class="{ 'p-invalid': invalidMessageUnit }"
                    ></InputText>
                    <small id="unit-help" class="p-error">
                        {{ invalidMessageUnit }}
                    </small>
                </div>
                <div class="p-field-checkbox">
                    <InputSwitch id="is_disp_conv" v-model="is_disp_conv">
                    </InputSwitch>
                    <label for="is_disp_conv">환산지수 사용여부</label>
                </div>
                <Divider />
                <div class="p-field">
                    <label for="remark">설명</label>
                    <Textarea
                        id="remark"
                        v-model="REMARK"
                        :auto-resize="false"
                        rows="6"
                        style="resize: none"
                        :class="{ 'p-invalid': invalidMessageRemark }"
                    />
                    <small id="remark-help" class="p-error">
                        {{ invalidMessageRemark }}
                    </small>
                </div>
            </div>
        </ScrollPanel>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="적용"
                    icon="pi pi-check"
                    style="width: 100%"
                    :disabled="applyDisabled"
                    @click="setSensorCode"
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
        isEdit: Boolean,
        visibleSensorCodeDialog: Boolean,
        sensorCodeData: Object,
        sensorCodes: Array
    },
    data() {
        return {
            invalidMessageCode: undefined as String | undefined,
            invalidMessageName: undefined as String | undefined,
            invalidMessageUnit: undefined as String | undefined,
            invalidMessageRemark: undefined as String | undefined,
            types: [
                { name: 'Analog', value: 'A' },
                { name: 'Digital', value: 'D' }
            ],
            subTitle: '',
            CODE: '',
            NAME: '',
            TYPE: 'A',
            UNIT: '',
            IS_DISP_CONV: 0,
            REMARK: ''
        };
    },
    computed: {
        showDialog: {
            get(): Boolean {
                return this.visibleSensorCodeDialog;
            },
            set(is_show: Boolean) {
                this.$emit('update:visibleSensorCodeDialog', is_show);
            }
        },
        title: {
            get(): string {
                return `센서코드 ${this.isEdit ? '수정' : '추가'}`;
            }
        },
        is_disp_conv: {
            get(): boolean {
                return this.IS_DISP_CONV === 1;
            },
            set(value: boolean) {
                this.IS_DISP_CONV = value ? 1 : 0;
            }
        },
        applyDisabled() {
            let is_disabled = true;

            // by shkoh 20210818: 변경할 내용 중에 다른 것이 하나라도 있는 경우에 Edit 진행
            ['CODE', 'NAME', 'TYPE', 'UNIT', 'IS_DISP_CONV', 'REMARK'].forEach(
                (key) => {
                    if (this.$data[key] !== this.sensorCodeData[key]) {
                        is_disabled = false;
                    }
                }
            );

            return is_disabled === true;
        }
    },
    watch: {
        CODE(_code: string) {
            if (_code.length > 8) {
                this.invalidMessageCode = '코드는 8자 이하입니다';
            } else if (_code.length < 2) {
                this.invalidMessageCode = '코드는 2자 이하일 수 없습니다';
            } else if (
                this.sensorCodes.some(
                    (data: any) =>
                        _code.toLowerCase() !==
                            this.sensorCodeData.CODE.toLowerCase() &&
                        data.CODE.toLowerCase() === _code.toLowerCase()
                )
            ) {
                this.invalidMessageCode =
                    '동일한 코드가 존재합니다(대소문자 구분없음)';
            } else {
                this.invalidMessageCode = undefined;
            }
        },
        NAME(_name) {
            if (_name.length > 32) {
                this.invalidMessageName = '센서명은 32자 이하입니다';
            } else {
                this.invalidMessageName = undefined;
            }
        },
        UNIT(_unit) {
            if (_unit.length > 4) {
                this.invalidMessageUnit = '단위는 4자 이하입니다';
            } else {
                this.invalidMessageUnit = undefined;
            }
        },
        REMARK(_remark) {
            if (_remark.length > 256) {
                this.invalidMessageRemark = '설명은 256자 이하입니다';
            } else {
                this.invalidMessageRemark = undefined;
            }
        }
    },
    methods: {
        setSubTitle(): string {
            if (
                this.isEdit &&
                this.sensorCodeData.hasOwnProperty('CODE') &&
                this.sensorCodeData.hasOwnProperty('NAME')
            ) {
                return `${this.sensorCodeData.CODE.toString()} | ${this.sensorCodeData.NAME.toString()} 정보를 수정합니다`;
            } else if (!this.isEdit) {
                return `센서코드를 추가합니다`;
            } else {
                return ``;
            }
        },
        onDialogShow() {
            this.subTitle = this.setSubTitle();
            Object.assign(this.$data, this.sensorCodeData);
        },
        onDialogHide() {
            this.invalidMessageCode = undefined;
            this.invalidMessageName = undefined;
            this.invalidMessageUnit = undefined;
            this.invalidMessageRemark = undefined;
        },
        validationCheck() {
            if (
                this.invalidMessageCode ||
                this.invalidMessageName ||
                this.invalidMessageUnit ||
                this.invalidMessageRemark
            )
                return false;
            return true;
        },
        setSensorCode() {
            if (!this.validationCheck()) {
                this.$toast.add({
                    severity: 'warn',
                    summary: '센서코드 유효성 실패',
                    detail: '센서코드 내용을 확인하세요',
                    life: 2000
                });
                return;
            }

            if (this.isEdit) {
                this.updateSensorCode();
            } else {
                this.addSensorCode();
            }
        },
        addSensorCode() {
            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation AddSensorCode(
                            $CODE: String!
                            $NAME: String!
                            $TYPE: String!
                            $UNIT: String
                            $IS_DISP_CONV: Int
                            $REMARK: String
                        ) {
                            AddSensorCode(
                                CODE: $CODE
                                NAME: $NAME
                                TYPE: $TYPE
                                UNIT: $UNIT
                                IS_DISP_CONV: $IS_DISP_CONV
                                REMARK: $REMARK
                            )
                        }
                    `,
                    variables: {
                        CODE: this.CODE,
                        NAME: this.NAME,
                        TYPE: this.TYPE,
                        UNIT: this.UNIT,
                        IS_DISP_CONV: this.IS_DISP_CONV,
                        REMARK: this.REMARK
                    }
                })
                .then(() => {
                    this.$toast.add({
                        severity: 'success',
                        summary: '센서코드 등록',
                        detail: `${this.CODE} | ${this.NAME} 등록완료`,
                        life: 1500
                    });

                    this.$emit('refresh');
                    this.showDialog = false;
                })
                .catch((error) => {
                    console.error(error);

                    this.$toast.add({
                        severity: 'error',
                        summary: '센서코드 적용 실패',
                        detail: error.message,
                        life: 2000
                    });
                });
        },
        updateSensorCode() {
            const variables = {
                ID: this.sensorCodeData.ID,
                CODE: this.CODE,
                NAME: this.NAME,
                TYPE: this.TYPE
            };

            ['UNIT', 'IS_DISP_CONV', 'REMARK'].forEach((key: string) => {
                if (this.$data[key] !== this.sensorCodeData[key]) {
                    Object.defineProperty(variables, key, {
                        value: this.$data[key],
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });
                }
            });

            this.$apollo
                .mutate({
                    mutation: gql`
                        mutation UpdateSensorCode(
                            $ID: ID!
                            $CODE: String!
                            $NAME: String!
                            $TYPE: String!
                            $UNIT: String
                            $IS_DISP_CONV: Int
                            $REMARK: String
                        ) {
                            UpdateSensorCode(
                                ID: $ID
                                CODE: $CODE
                                NAME: $NAME
                                TYPE: $TYPE
                                UNIT: $UNIT
                                IS_DISP_CONV: $IS_DISP_CONV
                                REMARK: $REMARK
                            )
                        }
                    `,
                    variables
                })
                .then(() => {
                    this.$emit('refresh');
                    this.showDialog = false;
                })
                .catch((error) => {
                    console.error(error);

                    this.$toast.add({
                        severity: 'error',
                        summary: '센서코드 적용 실패',
                        detail: error.message,
                        life: 2000
                    });
                });
        }
    }
});
</script>
