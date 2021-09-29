<template>
    <i-dialog
        id="interface-add-dialog"
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header> 인터페이스 추가 </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small>{{ this.assetCodeName }} 인터페이스를 추가합니다</small>
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
                    :disabled="addDisabled"
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

@Component<InterfaceAddDialog>({
    props: {
        visibleAddInterfaceDialog: Boolean,
        assetCode: String,
        assetCodeName: String,
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
            update: ({ Codes }) => Codes,
        },
    },
})
export default class InterfaceAddDialog extends Vue {
    interfaceTypeList: Array<any> = [];

    addInterfaceData = {
        NAME: '',
        ASSET_CD: '',
        INTF_CD: '',
        REMARK: '',
    };

    invalidMessage = {
        NAME: undefined as String | undefined,
        REMARK: undefined as String | undefined,
    };

    get showDialog(): Boolean {
        return this.$props.visibleAddInterfaceDialog;
    }
    set showDialog(is_show: Boolean) {
        this.$emit('update:visibleAddInterfaceDialog', is_show);
    }

    get addDisabled(): Boolean {
        return true;
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
        console.info('add_interface');
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
}
</script>

<style lang="scss" scoped>
</style>