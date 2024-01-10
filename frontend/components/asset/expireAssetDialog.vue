<template>
    <div id="i-expire-asset-dialog">
        <i-dialog
            :visible.sync="showDialog"
            :content-style="{
                width: '18vw',
                height: '12vh'
            }"
            append-to="body"
            @show="onShow"
            @hide="onHide"
        >
            <template #header>
                <div class="i-title i-text-ellipsis">만료 예정 자산 설정</div>
            </template>
            <div class="p-fluid">
                <label class="p-field" style="font-size: 11px">
                    알람을 받을 만료 예정 자산의 개월 수를 설정합니다 <br />
                    ( 최대: 6개월 )
                </label>
            </div>
            <div class="p-d-flex p-pt-6 p-input-filled">
                <InputNumber
                    v-model="countExpireAsset"
                    class="p-mr-2"
                    mode="decimal"
                    :min="1"
                    :max="6"
                    :showButtons="true"
                    buttonLayout="horizontal"
                    :step="1"
                    decrement-button-class="p-button-secondary"
                    decrement-button-icon="pi pi-minus"
                    increment-button-class="p-button-secondary"
                    increment-button-icon="pi pi-plus"
                    aria-describedby="com-timeout-help"
                    autocomplete="off"
                    :inputStyle="{
                        width: '6rem'
                    }"
                />
                <Button
                    label="적용"
                    icon="pi pi-check"
                    class="p-button-sm p-button-outlined p-button-success p-ml-3"
                    @click="ApplyExpiryAssets"
                />
            </div>
        </i-dialog>
    </div>
</template>
<script lang="ts">
import { error } from 'console';
import Vue from 'vue';
import Component from 'vue-class-component';
import { eventBus } from '~/plugins/vueEventBus';

@Component<ExpireAssetDialog>({
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    }
})
export default class ExpireAssetDialog extends Vue {
    asset: any = null;
    countExpireAsset: number = 1;

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(show: boolean) {
        this.$emit('update:visible', show);
    }

    onShow() {
        this.asset = this.$props.visible;
    }

    onHide() {
        this.asset = null;
    }

    ApplyExpiryAssets() {
        eventBus.$emit('refreshExpireAsset', this.countExpireAsset);
        if (typeof this.countExpireAsset === 'number') {
            this.$toast.add({
                severity: 'success',
                summary: `${this.countExpireAsset} 개월 변경 완료`,
                detail: '만료 예정 자산 설정',
                life: 2000
            });
        } else {
            this.$toast.add({
                severity: 'error',
                summary: '만료 예정 자산 변경 실패',
                detail: 'error message',
                life: 2000
            });
        }
    }
}
</script>