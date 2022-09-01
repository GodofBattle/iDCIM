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

        <i-scroll-panel :style="{ height: '40vh' }">
            <asset-work-editor :work-info.sync="work_info" />
        </i-scroll-panel>

        <template #footer>
            <div class="p-fluid p-d-flex">
                <Button
                    label="등록"
                    icon="pi pi-plus"
                    :style="{ width: '100%' }"
                />
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

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
            type: Number,
            default: -1
        }
    },
    watch: {
        work_info: {
            deep: true,
            handler(_value) {
                console.info(_value);
            }
        }
    }
})
export default class AssetAddWork extends Vue {
    work_info: Work = {
        ASSET_ID: this.$props.assetId,
        WORK_CD: 'WK01',
        WORK_OP_ID: null,
        WORK_OP_NAME: null,
        WORK_START_DT: null,
        WORK_END_DT: null,
        TITLE: '',
        TEXT: ''
    };

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

    onHide() {
        // by shkoh 20220901: Dialog가 닫힐 때 데이터 초기화
        this.work_info = {
            ASSET_ID: this.$props.assetId,
            WORK_CD: 'WK01',
            WORK_OP_ID: null,
            WORK_OP_NAME: null,
            WORK_START_DT: null,
            WORK_END_DT: null,
            TITLE: '',
            TEXT: ''
        };
    }
}
</script>
