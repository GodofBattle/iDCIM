<template>
    <div id="i-asset-panel-work" class="p-px-2 p-pb-4">
        <DataTable
            :value="works"
            :scrollable="true"
            scroll-height="flex"
            :row-hover="true"
            class="p-datatable-sm"
            data-key="ID"
            :expanded-rows.sync="expandedRows"
        >
            <template #header>
                <div class="p-d-flex">
                    <div class="p-as-center">
                        <Button
                            v-if="isAdd"
                            icon="pi pi-plus"
                            class="p-button-text p-button-rounded"
                            @click="addWork"
                        />
                    </div>
                    <div class="p-as-center p-ml-auto">
                        <span class="p-input-icon-right">
                            <i class="pi pi-search"></i>
                            <InputText />
                        </span>
                    </div>
                </div>
            </template>
            <template #empty>
                <div class="i-table-empty">
                    {{
                        isAdd
                            ? '상단의 [+] 버튼을 클릭하여 작업이력을 등록할 수 있습니다'
                            : '등록된 작업이 존재하지 않습니다'
                    }}
                </div>
            </template>

            <Column :expander="true" :header-style="{ width: '3rem' }" />
            <Column
                key="WORK_CD"
                header=""
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '5%'
                }"
            >
                <template #body="slotProps">
                    <Avatar class="i-work-name p-px-2">
                        <span>{{ workName(slotProps.data.WORK_CD) }}</span>
                    </Avatar>
                </template>
            </Column>
            <Column
                key="WORK_START_DT"
                header="작업일시"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '12%'
                }"
            >
                <template #body="slotProps">
                    {{ convertDateFormat(slotProps.data.WORK_START_DT) }}
                </template>
            </Column>
            <Column
                key="WORK_END_DT"
                header="종료일시"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '12%'
                }"
            >
                <template #body="slotProps">
                    {{ convertDateFormat(slotProps.data.WORK_END_DT) }}
                </template>
            </Column>
            <Column
                key="TITLE"
                field="TITLE"
                header="작업명"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '30%'
                }"
            >
            </Column>
            <Column
                key="WORK_OP"
                header="작업자"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '8%'
                }"
            >
                <template #body="slotProps">
                    {{ operatorName(slotProps.data) }}
                </template>
            </Column>
            <Column
                key="UPDATE_USER_ID"
                header="작성자"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '8%'
                }"
            >
                <template #body="slotProps">
                    {{ userName(slotProps.data.UPDATE_USER_ID) }}
                </template>
            </Column>
            <template #expansion="slotProps">
                <div class="p-px-3 p-py-1 p-ml-6" :style="{ width: '100%' }">
                    <Panel v-if="isEditor" header="작업상세">
                        <template #icons>
                            <Button
                                class="i-panel-header-icon p-button-success p-button-text"
                                icon="pi pi-save"
                                :disabled="slotProps.data.IS_CHANGED !== true"
                                @click="updateWork(slotProps.data.ID)"
                            />
                            <Button
                                class="i-panel-header-icon p-button-danger p-button-text"
                                icon="pi pi-trash"
                                @click="
                                    deleteWork(
                                        slotProps.data.TITLE,
                                        slotProps.data.ID
                                    )
                                "
                            />
                        </template>
                        <asset-work-editor
                            :work-info.sync="slotProps.data.WORK_EDIT"
                            :is-valid.sync="slotProps.data.IS_VALID"
                            @onChange="onChangeWorkInfo"
                        />
                    </Panel>
                    <div v-else class="p-d-flex">
                        <label class="p-col-1 p-my-1 i-work-name i-text-label">
                            작업내용
                        </label>
                        <div class="p-col-11 p-my-1 p-pl-3 i-text-value">
                            <span>{{ slotProps.data.TEXT }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </DataTable>
        <asset-add-work
            :visible.sync="isVisibleAddWork"
            :asset-name.sync="assetItem.NAME"
            :asset-id.sync="assetItem.ID"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

interface WorkEdit {
    [index: string]: string | number | null | boolean | Date;
    ID: number;
    WORK_CD: string;
    WORK_OP_ID: number | null;
    WORK_OP_NAME: string | null;
    WORK_START_DT: number | Date;
    WORK_END_DT: number | Date;
    TITLE: string;
    TEXT: string;
}

interface Work {
    [index: string]: string | number | null | boolean | Date | WorkEdit;
    ID: number;
    WORK_CD: string;
    WORK_OP_ID: number | null;
    WORK_OP_NAME: string | null;
    WORK_START_DT: number | string | Date | null;
    WORK_END_DT: number | string | Date | null;
    TITLE: string;
    TEXT: string;
    UPDATE_USER_ID: number;
    IS_CHANGED: boolean;
    IS_VALID: boolean;
    WORK_EDIT: WorkEdit;
}

interface DatabaseWork {
    [index: string]: string | number | null | boolean | Date;
    ID: number;
    WORK_CD: string;
    WORK_OP_ID: number | null;
    WORK_OP_NAME: string | null;
    WORK_START_DT: string | Date | null;
    WORK_END_DT: string | Date | null;
    TITLE: string;
    TEXT: string;
    UPDATE_USER_ID: number;
}

interface WorkKind {
    [index: string]: string;
    CODE: string;
    NAME: string;
}

interface Company {
    [index: string]: string;
    NAME: string;
}

interface Operator {
    [index: string]: number | string | Company;
    ID: number;
    NAME: string;
    COMPANY: Company;
}

interface User {
    [index: string]: number | string;
    ID: number;
    NAME: string;
    PERM_CD: string;
    USER_ID: number;
    USER_GROUP_ID: number;
}

@Component<AssetPanelWork>({
    props: {
        assetItem: {
            type: Object,
            default: null
        },
        isAdd: {
            type: Boolean,
            default: false
        },
        isEditor: {
            type: Boolean,
            default: false
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
        },
        operators: {
            query: gql`
                query {
                    Operators {
                        ID
                        NAME
                        COMPANY {
                            NAME
                        }
                    }
                }
            `,
            update: ({ Operators }) => Operators
        },
        users: {
            query: gql`
                query {
                    Users {
                        ID
                        NAME
                        PERM_CD
                        USER_ID
                        USER_GROUP_ID
                    }
                }
            `,
            update: ({ Users }) => Users
        },
        dbWorks: {
            query: gql`
                query ($ASSET_ID: Int!) {
                    WorksToAsset(ASSET_ID: $ASSET_ID) {
                        ID
                        WORK_CD
                        WORK_OP_ID
                        WORK_OP_NAME
                        WORK_START_DT
                        WORK_END_DT
                        TITLE
                        TEXT
                        UPDATE_USER_ID
                    }
                }
            `,
            skip() {
                return (
                    !this.$props.assetItem ||
                    Number(this.$props.assetItem.ID) < 0
                );
            },
            variables() {
                return {
                    ASSET_ID: Number(this.$props.assetItem.ID)
                };
            },
            update: ({ WorksToAsset }) => WorksToAsset,
            result({ loading, data }) {
                if (!loading) {
                    const { WorksToAsset } = data;
                    if (WorksToAsset) {
                        this.apolloFetch(WorksToAsset);
                    }
                }
            }
        }
    }
})
export default class AssetPanelWork extends Vue {
    isVisibleAddWork: boolean = false;

    dbWorks: Array<Work> = [];
    works: Array<Work> = [];

    workKind: Array<WorkKind> = [];
    operators: Array<Operator> = [];
    users: Array<User> = [];

    expandedRows = [];

    mounted() {
        eventBus.$on('refetchAssetWorks', () => {
            this.refetchWorks();
        });
    }

    beforeDestory() {
        eventBus.$off('refetchAssetWorks');
    }

    refetchWorks() {
        this.$apollo.queries.dbWorks.refetch();
    }

    apolloFetch(dbWorks: Array<DatabaseWork>) {
        const today = new Date();

        this.works.splice(0, this.works.length);

        dbWorks.forEach((w: DatabaseWork) => {
            const s_date = w.WORK_START_DT
                ? new Date(w.WORK_START_DT)
                : today.setSeconds(0, 0);
            const e_date = w.WORK_END_DT
                ? new Date(w.WORK_END_DT)
                : today.setSeconds(0, 0);

            this.works.push({
                ID: w.ID,
                WORK_CD: w.WORK_CD,
                WORK_OP_ID: w.WORK_OP_ID,
                WORK_OP_NAME: w.WORK_OP_NAME,
                WORK_START_DT: w.WORK_START_DT,
                WORK_END_DT: w.WORK_END_DT,
                TITLE: w.TITLE,
                TEXT: w.TEXT,
                IS_CHANGED: false,
                IS_VALID: true,
                UPDATE_USER_ID: w.UPDATE_USER_ID,
                WORK_EDIT: {
                    ID: w.ID,
                    WORK_CD: w.WORK_CD,
                    WORK_OP_ID: w.WORK_OP_ID,
                    WORK_OP_NAME: w.WORK_OP_NAME,
                    WORK_START_DT: s_date,
                    WORK_END_DT: e_date,
                    TITLE: w.TITLE,
                    TEXT: w.TEXT
                }
            });
        });
    }

    addWork() {
        this.isVisibleAddWork = true;
    }

    workName(code: string) {
        return this.workKind.find((w: WorkKind) => w.CODE === code)?.NAME;
    }

    convertDateFormat(date: string | null) {
        if (date === null) {
            return '';
        }

        const d = new Date(date);
        return `${d.getFullYear()}.${('0' + (d.getMonth() + 1)).slice(-2)}.${(
            '0' + d.getDate()
        ).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${(
            '0' + d.getMinutes()
        ).slice(-2)}`;
    }

    operatorName(work: Work) {
        if (work.WORK_OP_ID === null) {
            return work.WORK_OP_NAME;
        } else {
            return this.operators.find(
                (o: Operator) => Number(o.ID) === work.WORK_OP_ID
            )?.NAME;
        }
    }

    userName(user_id: number) {
        return this.users.find((u: User) => u.ID === user_id)?.NAME;
    }

    getWorkInfo(work: Work) {
        const start_dt = work.WORK_START_DT
            ? new Date(work.WORK_START_DT)
            : new Date();

        const end_dt = work.WORK_END_DT
            ? new Date(work.WORK_END_DT)
            : new Date();

        const edit_work = {
            ...work,
            WORK_START_DT: start_dt,
            WORK_END_DT: end_dt
        };

        return edit_work;
    }

    deleteWork(title: string, work_id: number) {
        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `삭제할 작업명: ${title}\n\n해당 작업을 삭제하시겠습니까?\n삭제된 작업은 복구가 불가능합니다.`,
            header: `${this.$props.assetItem.NAME} 작업 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.delete(title, work_id);
            }
        });
    }

    delete(title: string, work_id: number) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeleteWork(ID: ${work_id})
                    }
                `
            })
            .then(({ data: { DeleteWork } }) => {
                if (DeleteWork) {
                    this.$toast.add({
                        severity: 'success',
                        summary: '작업 삭제완료',
                        detail: `작업명: ${title} 작업이 정상적으로 삭제되었습니다`,
                        life: 2000
                    });

                    this.refetchWorks();
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '작업 삭제 실패',
                    detail: error.graphQLErrors[0].message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    onChangeWorkInfo(work: Work) {
        // by shkoh 20220914: 변경된 작업내용이 발생하여 해당 데이터가 들어올 경우에 해당 데이터를 비교하여 넣음
        const source_work = this.works.find((w: Work) => w.ID === work.ID);

        if (source_work) {
            const keys = [
                'WORK_CD',
                'WORK_OP_ID',
                'WORK_OP_NAME',
                'WORK_START_DT',
                'WORK_END_DT',
                'TITLE',
                'TEXT'
            ];

            this.$set(source_work, 'IS_CHANGED', false);

            for (const key of keys) {
                const s_val = source_work[key];
                const t_val = work[key];

                if (key === 'WORK_START_DT' || key === 'WORK_END_DT') {
                    if (s_val !== null && t_val !== null) {
                        const s_date = new Date(s_val.toString());
                        if (s_date.getTime() !== (t_val as Date).getTime()) {
                            this.$set(
                                source_work,
                                'IS_CHANGED',
                                true && source_work.IS_VALID
                            );
                            break;
                        }
                    }
                } else if (s_val !== t_val) {
                    this.$set(
                        source_work,
                        'IS_CHANGED',
                        true && source_work.IS_VALID
                    );
                    break;
                }
            }
        }
    }

    updateWork(id: number) {
        const update_info = {
            ID: id
        };
        const source_work = this.works.find((w: Work) => w.ID === id);

        if (!source_work) {
            this.$toast.add({
                severity: 'warn',
                summary: '작업항목 읽기 실패',
                detail: `변경 전 작업항목을 읽어오는데 실패했습니다`,
                life: 2000
            });
            return;
        }

        for (const [key, value] of Object.entries(source_work.WORK_EDIT)) {
            const src_value = source_work[key];
            if (
                (key === 'WORK_START_DT' || key === 'WORK_END_DT') &&
                src_value !== null
            ) {
                const s_date = new Date(src_value.toString());

                if (s_date.getTime() !== (value as Date).getTime()) {
                    this.$set(update_info, key, value);
                }
            } else if (value !== src_value) {
                this.$set(update_info, key, value);
            }
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: ID!
                        $WORK_CD: String
                        $WORK_OP_ID: Int
                        $WORK_OP_NAME: String
                        $WORK_START_DT: Date
                        $WORK_END_DT: Date
                        $TITLE: String
                        $TEXT: String
                    ) {
                        UpdateWork(
                            ID: $ID
                            WORK_CD: $WORK_CD
                            WORK_OP_ID: $WORK_OP_ID
                            WORK_OP_NAME: $WORK_OP_NAME
                            WORK_START_DT: $WORK_START_DT
                            WORK_END_DT: $WORK_END_DT
                            TITLE: $TITLE
                            TEXT: $TEXT
                        )
                    }
                `,
                variables: update_info
            })
            .then(({ data: { UpdateWork } }) => {
                if (UpdateWork) {
                    this.$toast.add({
                        severity: 'info',
                        summary: '작업변경 완료',
                        detail: `작업 [${source_work.TITLE}] 대한 내용이 변경 되었습니다`,
                        life: 2000
                    });

                    this.refetchWorks();
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '작업변경 실패',
                    detail: `작업 [${source_work.TITLE}] 대한 내용 변경 중에 에러가 발생하였습니다`,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-work::v-deep {
    height: 100%;

    .p-datatable-emptymessage {
        td {
            justify-content: center;
        }
    }

    .i-table-empty {
        height: 10vh;
        line-height: 10vh;
        font-size: 1.2rem;
    }

    .i-work-name {
        width: 6rem;
        min-width: 2rem;
    }

    .i-text-label {
        border-radius: 3px;
        background-color: var(--text-color-secondary);
        color: var(--primary-color-text);
        padding: 1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .i-text-value {
        white-space: pre-line;
        align-self: center;
    }

    .i-panel-header-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
    }
}
</style>
