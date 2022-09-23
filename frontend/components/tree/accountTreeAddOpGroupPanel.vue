<template>
    <i-dialog
        :content-style="{ width: '16vw' }"
        :modal="true"
        :draggable="true"
        :visible.sync="showDialog"
        @hide="onHide"
    >
        <template #header> 운영그룹 추가 </template>

        <div class="p-fluid p-input-filled">
            <div class="p-field">
                <small> 운영그룹을 추가합니다 </small>
            </div>
            <div class="p-field">
                <label for="add-op-name">운영그룹명</label>
                <InputText
                    id="add-op-name"
                    v-model="operatorGroup.NAME"
                    type="text"
                    autocomplete="off"
                    aria-describedby="add-op-name-help"
                    :class="{
                        'p-invalid': invalidMessage.NAME
                    }"
                    @input="onInputName"
                />
                <small id="add-op-name-help" class="p-error">
                    {{ invalidMessage.NAME }}
                </small>
            </div>
            <div class="p-field">
                <label for="add-op-remark">설명</label>
                <Textarea
                    id="add-op-remark"
                    v-model="operatorGroup.REMARK"
                    :auto-resize="false"
                    rows="6"
                    :style="{ resize: 'none' }"
                    :class="{
                        'p-invalid': invalidMessage.REMARK
                    }"
                    @input="onInputRemark"
                />
                <small id="add-op-remark-help" class="p-error">
                    {{ invalidMessage.REMARK }}
                </small>
            </div>
        </div>

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="추가"
                    icon="pi pi-plus"
                    :style="{ width: '100%' }"
                    :disabled="isDisabled"
                    @click="addOpGroup"
                />
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

@Component<AccountTreeAddOpGroupPanel>({
    props: {
        visible: Boolean
    }
})
export default class AccountTreeAddOpGroupPanel extends Vue {
    operatorGroup = {
        NAME: '',
        REMARK: ''
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        REMARK: undefined as string | undefined
    };

    onHide() {
        this.operatorGroup.NAME = '';
        this.operatorGroup.REMARK = '';

        this.invalidMessage.NAME = undefined;
        this.invalidMessage.REMARK = undefined;
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get isDisabled(): boolean {
        let is_disabled = false;

        if (this.operatorGroup.NAME.length < 1) {
            is_disabled = true;
        }

        if (
            Object.values(this.invalidMessage).some(
                (msg: any) => msg !== undefined
            )
        ) {
            is_disabled = true;
        }

        return is_disabled;
    }

    addOpGroup() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    AddOperatorGroup(
                        NAME: "${this.operatorGroup.NAME}"
                        REMARK: "${this.operatorGroup.REMARK}"
                    )
                }
            `
            })
            .then(() => {
                this.$toast.add({
                    severity: 'success',
                    summary: '운영그룹 등록',
                    detail: `${this.operatorGroup.NAME} 운영그룹을 등록하였습니다`,
                    life: 1500
                });

                this.showDialog = false;

                eventBus.$emit('refreshAccountTree');
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '운영그룹 등록 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onInputName(input: string) {
        if (input.length < 1) {
            this.invalidMessage.NAME = '운영그룹명은 필수항목입니다';
        } else if (input.length > 64) {
            this.invalidMessage.NAME =
                '운영그룹명은 최대 64자까지 작성 가능합니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    onInputRemark(input: string) {
        if (input.length > 256) {
            this.invalidMessage.REMARK =
                '운영그룹의 설명은 최대 256자까지 작성 가능합니다';
        } else {
            this.invalidMessage.REMARK = undefined;
        }
    }
}
</script>
