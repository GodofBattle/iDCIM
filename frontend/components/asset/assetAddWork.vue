<template>
    <i-dialog
        id="i-asset-add-work"
        :visible.sync="showDialog"
        :content-style="{
            width: '32vw',
            'overflow-y': 'hidden'
        }"
        :modal="true"
        :draggable="true"
        @show="onShow"
        @hide="onHide"
    >
        <template #header>
            {{ title }}
        </template>

        <div class="p-fluid">
            <small class="p-feild">
                {{ summary }}
            </small>
        </div>

        <i-scroll-panel :style="{ height: '42vh' }">
            <asset-work-editor
                :work-info.sync="work_info"
                :is-valid.sync="is_valid"
            />
        </i-scroll-panel>

        <template #footer>
            <div class="p-fluid p-d-flex">
                <Button
                    label="등록"
                    icon="pi pi-plus"
                    :style="{ width: '100%' }"
                    :disabled="applyButtonDisabled"
                    @click="addWork"
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

interface Work {
    [index: string]: string | number | Date | null;
    ASSET_ID: number;
    WORK_CD: string;
    WORK_OP_ID: number | null;
    WORK_OP_NAME: string | null;
    WORK_START_DT: Date | null;
    WORK_END_DT: Date | null;
    TITLE: string;
    TEXT: string;
}

@Component<AssetAddWork>({
    props: {
        visible: Boolean,
        assetName: String,
        assetId: {
            type: String,
            default: '-1'
        }
    }
})
export default class AssetAddWork extends Vue {
    work_info: Work = {
        ASSET_ID: Number(this.$props.assetId),
        WORK_CD: 'WK01',
        WORK_OP_ID: null,
        WORK_OP_NAME: null,
        WORK_START_DT: null,
        WORK_END_DT: null,
        TITLE: '',
        TEXT: ''
    };

    is_valid: boolean = true;

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get title(): string {
        return `자산 작업 등록`;
    }

    get summary(): string {
        return `[${this.$props.assetName}] 자산에 대한 작업을 등록합니다`;
    }

    onShow() {
        this.work_info.ASSET_ID = Number(this.$props.assetId);
    }

    onHide() {
        // by shkoh 20220901: Dialog가 닫힐 때 데이터 초기화
        this.work_info = {
            ASSET_ID: -1,
            WORK_CD: 'WK01',
            WORK_OP_ID: null,
            WORK_OP_NAME: null,
            WORK_START_DT: null,
            WORK_END_DT: null,
            TITLE: '',
            TEXT: ''
        };

        this.is_valid = true;
    }

    get applyButtonDisabled(): boolean {
        const { WORK_OP_ID, WORK_OP_NAME, TITLE, WORK_START_DT, WORK_END_DT } =
            this.work_info;

        let is_disabled = true;

        if (
            TITLE.length > 0 &&
            ((WORK_OP_ID !== null && WORK_OP_NAME === null) ||
                (WORK_OP_ID === null &&
                    WORK_OP_NAME &&
                    WORK_OP_NAME.length > 0)) &&
            WORK_START_DT !== null &&
            WORK_END_DT !== null &&
            this.is_valid
        ) {
            is_disabled = false;
        }

        return is_disabled;
    }

    addWork() {
        if (this.work_info.ASSET_ID < 0) {
            this.$toast.add({
                severity: 'warn',
                summary: '자산 재선택 필요',
                detail: `자산 선택이 명확하지 않습니다`,
                life: 2000
            });

            return;
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($ADD: ac_asset_work_rec_input!) {
                        AddWork(ADD: $ADD)
                    }
                `,
                variables: {
                    ADD: this.work_info
                }
            })
            .then(({ data: { AddWork } }: any) => {
                if (AddWork) {
                    this.$toast.add({
                        severity: 'info',
                        summary: '작업등록 완료',
                        detail: `${this.$props.assetName}에 대한 작업이 등록되었습니다`,
                        life: 2000
                    });

                    this.showDialog = false;

                    eventBus.$emit('refetchAssetWorks');
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '작업등록 실패',
                    detail: `${this.$props.assetName}에 대한 작업등록 중에 에러가 발생하였습니다`,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }
}
</script>
