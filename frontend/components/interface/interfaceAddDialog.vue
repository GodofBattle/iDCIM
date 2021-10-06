<template>
    <i-dialog
        id="interface-add-dialog"
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @show="onDialogShow"
        @hide="onDialogHide"
    >
        <template #header> 인터페이스 추가 </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small>{{ assetCodeName }} 인터페이스를 추가합니다</small>
            </div>
            <div class="p-field">
                <label for="name">인터페이스명</label>
                <InputText
                    id="name"
                    v-model="addInterfaceData.NAME"
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
                <label for="type">통신타입</label>
                <Dropdown
                    id="type"
                    v-model="addInterfaceData.INTF_CD"
                    :options="interfaceTypeList"
                    option-label="NAME"
                    option-value="CODE"
                    data-key="CODE"
                    placeholder="통신타입을 선택하세요"
                    :filter="true"
                    filter-placeholder="검색"
                    empty-filter-message="해당 유형의 통신타입은 존재하지 않습니다"
                    append-to="body"
                ></Dropdown>
            </div>
            <div class="p-field">
                <label for="remark">설명</label>
                <Textarea
                    id="remark"
                    v-model="addInterfaceData.REMARK"
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

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    style="width: 100%"
                    :disabled="addButtonDisabled"
                    @click="addInterface"
                ></Button>
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type Interface = {
    [index: string]: string;
    NAME: string;
    ASSET_CD: string;
    INTF_CD: string;
    REMARK: string;
};

@Component<InterfaceAddDialog>({
    props: {
        visibleAddInterfaceDialog: Boolean,
        assetCode: String,
        assetCodeName: String
    },
    apollo: {
        interfaceTypeList: {
            query: gql`
                query {
                    Codes(TYPE: "INTF") {
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
export default class InterfaceAddDialog extends Vue {
    interfaceTypeList: Array<any> = [];

    addInterfaceData = {
        NAME: '',
        ASSET_CD: '',
        INTF_CD: '',
        REMARK: ''
    } as Interface;

    invalidMessage = {
        NAME: undefined as String | undefined,
        REMARK: undefined as String | undefined
    };

    get showDialog(): Boolean {
        return this.$props.visibleAddInterfaceDialog;
    }

    set showDialog(is_show: Boolean) {
        this.$emit('update:visibleAddInterfaceDialog', is_show);
    }

    get addButtonDisabled(): Boolean {
        let is_disabled = false;

        ['NAME', 'ASSET_CD', 'INTF_CD'].forEach((key: string) => {
            if (this.addInterfaceData[key].length < 2) is_disabled = true;
        });

        return is_disabled;
    }

    onDialogShow() {
        // by shkoh 20211005: 인터페이스 추가 다이얼로그가 보여질 때, 선택된 자산코드를 addInterfaceData에 적용
        this.addInterfaceData.ASSET_CD = this.$props.assetCode;
    }

    onDialogHide() {
        // by shkoh 20210929: 인터페이스 추가 Dialog가 닫힐 때 값들으 초기화
        this.addInterfaceData.NAME = '';
        this.addInterfaceData.ASSET_CD = '';
        this.addInterfaceData.INTF_CD = '';
        this.addInterfaceData.REMARK = '';

        this.invalidMessage.NAME = undefined;
        this.invalidMessage.REMARK = undefined;
    }

    addInterface() {
        if (!this.validationCheck()) {
            this.$toast.add({
                severity: 'warn',
                summary: '인터페이스 유효성 실패',
                detail: '추가할 인터페이스 내용을 확인하세요',
                life: 2000
            });
            return;
        }

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    AddInterface(
                        ASSET_CD: "${this.addInterfaceData.ASSET_CD}"
                        NAME: "${this.addInterfaceData.NAME}"
                        INTF_CD: "${this.addInterfaceData.INTF_CD}"
                        REMARK: "${this.addInterfaceData.REMARK}"
                    )
                }
            `
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '인터페이스 추가',
                    detail: `${this.addInterfaceData.NAME} 추가완료`,
                    life: 1500
                });

                this.$emit('refresh');

                this.showDialog = false;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '인터페이스 추가 실패',
                    detail: error.message,
                    life: 2000
                });
            });
    }

    validateName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 64) {
            this.invalidMessage.NAME = '인터페이스명은 64자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessage.NAME = '인터페이스명은 1자 이상입니다';
        } else {
            this.invalidMessage.NAME = undefined;
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

    validationCheck() {
        let is_valid = true;

        for (const valid of Object.values(this.invalidMessage)) {
            if (valid) {
                is_valid = false;
                return;
            }
        }

        return is_valid;
    }
}
</script>

<style lang="scss" scoped></style>
