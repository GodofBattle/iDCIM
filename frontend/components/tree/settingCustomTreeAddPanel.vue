<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        @hide="onDialogHide"
    >
        <template #header> {{ title }} </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small> {{ subTitle }} </small>
            </div>
            <div class="p-field">
                <label for="customTreeName">사용자트리명</label>
                <InputText
                    v-model="treeName"
                    id="customTreeName"
                    type="text"
                    autocomplete="off"
                    aria-describedby="customTreeName-help"
                    :class="{
                        'p-invalid': invalidInput.treeName,
                    }"
                    @input="validateTreeName"
                ></InputText>
                <small id="customTreeName-help" class="p-error">
                    {{ invalidInput.treeName }}
                </small>
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
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
import Component from '@/plugins/nuxt-class-component';
import gql from 'graphql-tag';

@Component<SettingCustomTreeAddPanel>({
    props: {
        visible: Boolean,
        parentKey: [Number, String],
        parentName: String,
        newOrder: Number,
    },
})
export default class SettingCustomTreeAddPanel extends Vue {
    treeName: string = '';
    invalidInput = {
        treeName: undefined as String | undefined,
    };

    onDialogHide() {
        this.treeName = '';
        this.invalidInput.treeName = undefined;
    }

    validateTreeName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidInput.treeName = '사용자트리명은 32자 이하입니다';
        } else {
            this.invalidInput.treeName = undefined;
        }
    }

    onClickAddButton() {
        if (!this.validationCheck) {
            this.$toast.add({
                severity: 'warn',
                summary: '사용자트리 항목 유효성 실패',
                detail: '사용자트리 입력항목들을 확인하세요',
                life: 2000,
            });
            return;
        }

        this.addNode();
    }

    addNode() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddCustomHier (
                            TYPE: "C"
                            NAME: "${this.treeName}"
                            P_TID: ${this.$props.parentKey}
                            ORDER: ${this.$props.newOrder}
                        )
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '사용자트리 추가',
                    detail: `${this.treeName} 추가 완료`,
                    life: 1500,
                });

                this.$emit('tree-add', `ach_${this.$props.parentKey}`);

                this.showDialog = false;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '사용자트리 추가 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    get title(): string {
        return '사용자트리 추가';
    }

    get subTitle(): string {
        return `${this.$props.parentName} 하위트리 항목을 추가합니다`;
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get isDisabledAddButton(): boolean {
        return this.treeName.length < 1;
    }

    get validationCheck(): boolean {
        let is_valid = true;

        for (const valid of Object.values(this.invalidInput)) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
    }
}
</script>