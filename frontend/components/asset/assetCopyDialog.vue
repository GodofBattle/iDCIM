<template>
    <div id="i-asset-copy-dialog">
        <i-dialog
            :visible.sync="showDialog"
            :content-style="{
                width: '20vw',
                height: '10vh'
            }"
            append-to="body"
            @show="onShow"
            @hide="onHide"
        >
            <template #header>
                <div class="i-title i-text-ellipsis">
                    {{ title }}
                </div>
            </template>

            <div class="p-fluid">
                <small class="p-field">
                    자산을 복사합니다. 최대 10개의 자산을 동시에 복사할 수
                    있습니다.
                </small>
            </div>
            <div class="p-d-flex p-pt-6 p-input-filled">
                <InputNumber
                    v-model="countCopiedAsset"
                    class="p-mr-2"
                    mode="decimal"
                    :min="1"
                    :max="10"
                    :show-buttons="true"
                    button-layout="horizontal"
                    :step="1"
                    decrement-button-class="p-button-secondary"
                    decrement-button-icon="pi pi-minus"
                    increment-button-class="p-button-secondary"
                    increment-button-icon="pi pi-plus"
                    aria-describedby="com-timeout-help"
                    autocomplete="off"
                    :input-style="{
                        width: '6rem'
                    }"
                />
                <Button
                    label="복사하기"
                    icon="pi pi-copy"
                    class="p-button-sm p-button-outlined p-button-success p-ml-2"
                    @click="onClickCopy"
                />
            </div>
        </i-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';

@Component<AssetCopyDialog>({
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        item: {
            type: Object,
            default: null
        }
    }
})
export default class AssetCopyDialog extends Vue {
    asset: any = null;
    countCopiedAsset: number = 1;

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(show: boolean) {
        this.$emit('update:visible', show);
    }

    get title(): string {
        if (this.asset === null) {
            return ``;
        }

        return `${this.asset.NAME} - 자산복사`;
    }

    onShow() {
        this.asset = this.$props.item;
    }

    onHide() {
        this.countCopiedAsset = 1;
        this.asset = null;
    }

    onClickCopy() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    CopyAsset (
                        ASSET_ID: ${this.asset.ID}
                        COUNT: ${this.countCopiedAsset}
                    )
                }
            `
            })
            .then(({ data: { CopyAsset } }) => {
                if (CopyAsset) {
                    eventBus.$emit('refreshAssetTable');

                    this.$toast.add({
                        severity: 'success',
                        summary: `자산복사 완료`,
                        detail: `${this.asset.NAME} 자산이 ${this.countCopiedAsset}개 복사되었습니다`,
                        life: 2000
                    });
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산복사 실패',
                    detail: error.message,
                    life: 3000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }
}
</script>

<style lang="scss" scoped>
#i-asset-copy-dialog::v-deep {
    .i-title {
        font-size: 1.6rem;
        font-weight: bold;
        max-width: 16vw;
    }
}
</style>
