<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
    >
        <template #header> {{ title }} </template>

        <div class="p-fluid p-input-filled">
            <div v-show="isEdit" class="p-field">
                <small>{{ subTitle }}</small>
            </div>
            <div class="p-field">
                <label for="code">코드명</label>
                <InputText
                    id="code"
                    v-model="code"
                    type="text"
                    aria-describedby="code-help"
                    autocomplete="off"
                ></InputText>
                <small id="code-help" class="p-error">
                    {{ invalidMessageCode }}
                </small>
            </div>
            <div class="p-field">
                <label for="name">센서명</label>
                <InputText
                    id="name"
                    v-model="name"
                    type="text"
                    aria-describedby="name-help"
                    autocomplete="off"
                ></InputText>
                <small id="name-help" class="p-error">
                    {{ invalidMessageName }}
                </small>
            </div>
            <div class="p-field">
                <label for="type">타입</label>
                <SelectButton
                    v-model="type"
                    :options="types"
                    option-label="name"
                    option-value="value"
                />
            </div>
            <div class="p-field">
                <label for="unit">단위</label>
                <InputText
                    id="unit"
                    v-model="unit"
                    type="text"
                    aria-describedby="unit-help"
                    autocomplete="off"
                ></InputText>
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
                    v-model="remark"
                    :auto-resize="false"
                    rows="6"
                    style="resize: none"
                />
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="적용"
                    icon="pi pi-check"
                    style="width: 100%"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        isEdit: Boolean,
        visibleSensorCodeDialog: Boolean,
        sensorCodeData: Object
    },
    data() {
        return {
            invalidMessageCode: undefined as String | undefined,
            invalidMessageName: undefined as String | undefined,
            types: [
                { name: 'Analog', value: 'A' },
                { name: 'Digital', value: 'D' }
            ],
            subTitle: ''
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
        code: {
            get(): string {
                return this.sensorCodeData.hasOwnProperty('CODE')
                    ? this.sensorCodeData.CODE
                    : '';
            },
            set(new_code: string) {
                this.$emit(
                    'update:sensorCodeData',
                    Object.assign(this.sensorCodeData, { CODE: new_code })
                );
            }
        },
        name: {
            get(): string {
                return this.sensorCodeData.hasOwnProperty('NAME')
                    ? this.sensorCodeData.NAME
                    : '';
            },
            set(new_name: string) {
                this.$emit(
                    'update:sensorCodeData',
                    Object.assign(this.sensorCodeData, { NAME: new_name })
                );
            }
        },
        type: {
            get(): string {
                console.info(this.sensorCodeData.TYPE);
                return this.sensorCodeData.hasOwnProperty('TYPE')
                    ? this.sensorCodeData.TYPE
                    : '';
            },
            set(new_type: any) {
                console.info(new_type);
                this.$emit(
                    'update:sensorCodeData',
                    Object.assign(this.sensorCodeData, { TYPE: new_type })
                );
            }
        },
        unit: {
            get(): string {
                return this.sensorCodeData.hasOwnProperty('UNIT')
                    ? this.sensorCodeData.UNIT
                    : '';
            },
            set(new_unit: string) {
                this.$emit(
                    'update:sensorCodeData',
                    Object.assign(this.sensorCodeData, { UNIT: new_unit })
                );
            }
        },
        is_disp_conv: {
            get(): boolean {
                return this.sensorCodeData.hasOwnProperty('IS_DISP_CONV')
                    ? this.sensorCodeData.IS_DISP_CONV === 1
                    : false;
            },
            set(new_is_disp_conv: boolean) {
                console.info(new_is_disp_conv);
                this.$emit(
                    'update:sensorCodeData',
                    Object.assign(this.sensorCodeData, {
                        IS_DISP_CONV: new_is_disp_conv ? 1 : 0
                    })
                );
            }
        },
        remark: {
            get(): boolean {
                return this.sensorCodeData.hasOwnProperty('REMARK')
                    ? this.sensorCodeData.REMARK
                    : ``;
            },
            set(new_remark: string) {
                this.$emit(
                    'update:sensorCodeData',
                    Object.assign(this.sensorCodeData, { REMARK: new_remark })
                );
            }
        }
    },
    watch: {
        sensorCodeData() {
            this.subTitle = this.setSubTitle();
        }
    },
    methods: {
        setSubTitle() {
            if (
                this.sensorCodeData.hasOwnProperty('CODE') &&
                this.sensorCodeData.hasOwnProperty('NAME')
            ) {
                return `${this.sensorCodeData.CODE.toString()} | ${this.sensorCodeData.NAME.toString()} 정보를 수정합니다`;
            } else {
                return ``;
            }
        }
    }
});
</script>
