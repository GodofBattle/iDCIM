<template>
    <div id="i-asset-work-editor" class="p-fluid p-input-filled p-mx-2">
        <div class="p-field p-grid p-mb-0">
            <label class="p-col-2 p-my-2 i-form-label"> 작업 </label>
            <div class="p-col-10 i-form-value p-d-inline-flex">
                <div
                    v-for="w of workKind"
                    :key="w.CODE"
                    class="p-field-radiobutton p-mb-0 p-mr-3"
                >
                    <RadioButton
                        :id="w.CODE"
                        v-model="work.WORK_CD"
                        name="workKind"
                        :value="w.CODE"
                    />
                    <label :for="w.CODE" class="p-ml-1">
                        {{ w.NAME }}
                    </label>
                </div>
            </div>
        </div>
        <div class="p-field p-grid p-mb-0">
            <label class="p-col-2 p-my-2 i-form-label"> 작업자 </label>
            <div class="p-col-4 i-form-value">
                <InputText />
            </div>
        </div>
        <div class="p-field p-grid p-mb-0">
            <label class="p-col-2 p-my-2 i-form-label"> 작업시작일 </label>
            <div class="p-col-4 i-form-value">
                <i-calendar
                    :panel-style="{ width: '16vw' }"
                    :show-icon="true"
                    :show-time="true"
                    :select-other-months="true"
                    :show-button-bar="false"
                    append-to="body"
                />
            </div>
            <label class="p-col-2 p-my-2 i-form-label"> 작업종료일 </label>
            <div class="p-col-4 i-form-value">
                <i-calendar
                    :panel-style="{ width: '16vw' }"
                    :show-icon="true"
                    :show-time="true"
                    :select-other-months="true"
                    :show-button-bar="false"
                    append-to="body"
                />
            </div>
        </div>
        <div class="p-field p-grid p-mb-0">
            <label class="p-col-2 p-my-2 i-form-label"> 작업명 </label>
            <div class="p-col-10 i-form-value">
                <InputText v-model="work.TITLE" />
            </div>
        </div>
        <div class="p-field p-grid p-mb-0">
            <label class="p-col-2 p-my-2 i-form-label"> 작업내용 </label>
            <div class="p-col-10 i-form-value">
                <Textarea
                    v-model="work.TEXT"
                    class="p-mt-2 p-mb-1"
                    rows="13"
                    :auto-resize="false"
                    :style="{ resize: 'none' }"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
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

interface WorkKind {
    [index: string]: string;
    CODE: string;
    NAME: string;
}

@Component<AssetWorkEditor>({
    props: {
        workInfo: {
            type: Object,
            default: null
        }
    },
    apollo: {
        workKind: {
            query: gql`
                query {
                    Codes(TYPE: "WORK") {
                        CODE
                        NAME
                    }
                }
            `,
            update: ({ Codes }) => Codes
        }
    }
})
export default class AssetWorkEditor extends Vue {
    work: Work = this.$props.workInfo;

    workKind: Array<WorkKind> = [];
}
</script>

<style lang="scss" scoped>
#i-asset-work-editor::v-deep {
    .i-form-label {
        border-radius: 3px;
        background-color: var(--text-color-secondary);
        color: var(--primary-color-text);
        padding: 0.5rem;
    }

    .i-form-value {
        align-self: center;
    }
}
</style>
