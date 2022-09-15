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
                <AutoComplete
                    v-model="workerName"
                    :suggestions="filteredOperators"
                    :class="{ 'p-invalid': invalidMessage.WORK_OP_NAME }"
                    @complete="searchOperator($event)"
                    @input="onInputWorkerName"
                >
                    <template #item="slotProps">
                        {{ operatorName(slotProps.item) }}
                    </template>
                </AutoComplete>
            </div>
        </div>
        <div v-if="invalidMessage.WORK_OP_NAME" class="p-field p-grid p-mb-0">
            <small class="p-offset-2 p-col-10 p-error p-pl-3 p-mt-0">
                {{ invalidMessage.WORK_OP_NAME }}
            </small>
        </div>
        <div class="p-field p-grid p-mb-0">
            <label class="p-col-2 p-my-2 i-form-label"> 작업시작일 </label>
            <div class="p-col-4 i-form-value">
                <i-calendar
                    v-model="workStart"
                    :panel-style="{ width: '16vw' }"
                    :show-icon="true"
                    :show-time="true"
                    :select-other-months="true"
                    :show-button-bar="true"
                    append-to="body"
                    :base-z-index="1310"
                    :locale="{ clear: '설정안함' }"
                    :step-minute="5"
                    @show="onShowWorkDate('WORK_START_DT')"
                    @today-click="
                        onClickTodayWorkDate('WORK_START_DT', new Date())
                    "
                    @clear-click="onClickClearWorkDate('WORK_START_DT')"
                    @input="onInputWorkStartDate"
                />
            </div>
            <label class="p-col-2 p-my-2 i-form-label"> 작업종료일 </label>
            <div class="p-col-4 i-form-value">
                <i-calendar
                    v-model="workEnd"
                    :panel-style="{ width: '16vw' }"
                    :show-icon="true"
                    :show-time="true"
                    :select-other-months="true"
                    :show-button-bar="true"
                    append-to="body"
                    :base-z-index="1320"
                    :locale="{ clear: '설정안함' }"
                    :step-minute="5"
                    @show="onShowWorkDate('WORK_END_DT')"
                    @today-click="
                        onClickTodayWorkDate('WORK_END_DT', new Date())
                    "
                    @clear-click="onClickClearWorkDate('WORK_END_DT')"
                    @input="onInputWorkEndDate"
                />
            </div>
        </div>
        <div v-if="invalidMessage.WORK_START_DT" class="p-field p-grid p-mb-0">
            <small class="p-offset-2 p-col-10 p-error p-pl-3 p-mt-0">
                {{ invalidMessage.WORK_START_DT }}
            </small>
        </div>
        <div v-if="invalidMessage.WORK_END_DT" class="p-field p-grid p-mb-0">
            <small class="p-offset-2 p-col-10 p-error p-pl-3 p-mt-0">
                {{ invalidMessage.WORK_END_DT }}
            </small>
        </div>
        <div class="p-field p-grid p-mb-0">
            <label class="p-col-2 p-my-2 i-form-label"> 작업명 </label>
            <div class="p-col-10 i-form-value">
                <InputText
                    v-model="work.TITLE"
                    :class="{ 'p-invalid': invalidMessage.TITLE }"
                    @input="onInputTitle"
                />
            </div>
        </div>
        <div v-if="invalidMessage.TITLE" class="p-field p-grid p-mb-0">
            <small class="p-offset-2 p-col-10 p-error p-pl-3 p-mt-0">
                {{ invalidMessage.TITLE }}
            </small>
        </div>
        <div class="p-field p-grid p-mb-0">
            <label class="p-col-2 p-my-2 i-form-label"> 작업내용 </label>
            <div class="p-col-10 i-form-value">
                <Textarea
                    v-model="work.TEXT"
                    class="p-mt-2 p-mb-1"
                    rows="13"
                    :auto-resize="false"
                    :class="{ 'p-invalid': invalidMessage.TEXT }"
                    :style="{ resize: 'none' }"
                    @input="onInputText"
                />
            </div>
        </div>
        <div v-if="invalidMessage.TEXT" class="p-field p-grid p-mb-0">
            <small class="p-offset-2 p-col-10 p-error p-pl-3 p-mt-0">
                {{ invalidMessage.TEXT }}
            </small>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface Work {
    [index: string]: string | number | Date | null;
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

@Component<AssetWorkEditor>({
    props: {
        workInfo: {
            type: Object,
            default: null
        },
        isValid: {
            type: Boolean,
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
        }
    },
    watch: {
        invalidMessage: {
            deep: true,
            handler(messages: object) {
                let is_valid = false;
                for (const m of Object.values(messages)) {
                    if (m) {
                        is_valid = true;
                        break;
                    }
                }

                this.$emit('update:isValid', !is_valid);
            }
        },
        work: {
            deep: true,
            handler(_work: Work) {
                this.$emit('onChange', _work);
            }
        }
    }
})
export default class AssetWorkEditor extends Vue {
    work: Work = this.$props.workInfo;

    workKind: Array<WorkKind> = [];
    operators: Array<Operator> = [];

    filteredOperators: null | Array<Operator> = null;

    tempWorkerName: string = '';

    invalidMessage = {
        WORK_OP_NAME: undefined as undefined | string,
        TITLE: undefined as undefined | string,
        TEXT: undefined as undefined | string,
        WORK_START_DT: undefined as undefined | string,
        WORK_END_DT: undefined as undefined | string
    };

    get workerName(): string | Operator {
        let worker = '';

        if (this.work.WORK_OP_ID) {
            const op = this.operators.find(
                (o: Operator) => Number(o.ID) === this.work.WORK_OP_ID
            );
            if (op) {
                worker = op.NAME;
            }
        } else if (this.work.WORK_OP_NAME) {
            worker = this.work.WORK_OP_NAME;
        }

        return worker;
    }

    set workerName(op: string | Operator) {
        if (typeof op === 'string') {
            const operator = this.operators.find(
                (o: Operator) => o.NAME === op
            );

            if (operator) {
                this.work.WORK_OP_ID = Number(operator.ID);
                this.work.WORK_OP_NAME = null;
            } else {
                this.work.WORK_OP_NAME = op;
                this.work.WORK_OP_ID = null;
            }
        } else if (typeof op === 'object') {
            this.work.WORK_OP_ID = Number(op.ID);
            this.work.WORK_OP_NAME = null;
        }
    }

    searchOperator({ query }: { query: 'string' }) {
        setTimeout(() => {
            if (!query.trim().length) {
                this.filteredOperators = [...this.operators];
            } else {
                this.filteredOperators = this.operators.filter(
                    (o: Operator) => {
                        return o.NAME.toLowerCase().includes(
                            query.toLowerCase()
                        );
                    }
                );
            }
        }, 250);
    }

    operatorName(op: Operator): string {
        return `[${op.COMPANY.NAME}] ${op.NAME}`;
    }

    onInputWorkerName(worker_name: any) {
        if (typeof worker_name === 'string') {
            if (worker_name.length < 1) {
                this.invalidMessage.WORK_OP_NAME = '작업자명은 필수항목입니다';
            } else if (worker_name.length > 32) {
                this.invalidMessage.WORK_OP_NAME = '작업자명은 32자 이하입니다';
            } else {
                this.invalidMessage.WORK_OP_NAME = undefined;
            }
        }
    }

    onInputTitle(title: string) {
        if (title.length < 1) {
            this.invalidMessage.TITLE = '작업명은 필수항목입니다';
        } else if (title.length > 64) {
            this.invalidMessage.TITLE = '작업명은 64자 이하입니다';
        } else {
            this.invalidMessage.TITLE = undefined;
        }
    }

    onInputText(text: string) {
        if (text.length > 2048) {
            this.invalidMessage.TEXT =
                '작업내용은 최대 2048자까지 작성 가능합니다';
        } else {
            this.invalidMessage.TEXT = undefined;
        }
    }

    normalizeWorkDate(date: any) {
        const d = new Date(date);
        if (d.toString() === 'Invalid Date') {
            return date;
        }

        const s = d.getSeconds();
        const ms = d.getMilliseconds();

        if (s !== 0) d.setSeconds(0, 0);
        if (ms !== 0) d.setMilliseconds(0);

        return d;
    }

    onShowWorkDate(key: string) {
        if (this.work[key] === null) {
            const today = new Date();

            this.work[key] = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                today.getHours(),
                0,
                0,
                0
            );
        }
    }

    onClickTodayWorkDate(key: string, today: Date) {
        this.work[key] = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            today.getHours(),
            0,
            0,
            0
        );
    }

    onClickClearWorkDate(key: string) {
        this.work[key] = null;
    }

    onInputWorkStartDate(input: Date | string) {
        if (input instanceof Date) {
            const end_dt = this.work.WORK_END_DT;
            if (end_dt instanceof Date && input.getTime() > end_dt.getTime()) {
                this.invalidMessage.WORK_START_DT =
                    '작업종료일이 시작일 이전으로 설정되었습니다';
            } else {
                this.invalidMessage.WORK_START_DT = undefined;

                if (this.invalidMessage.WORK_END_DT !== undefined) {
                    this.invalidMessage.WORK_END_DT = undefined;
                }
            }
        } else if (input === null) {
            this.invalidMessage.WORK_START_DT = '작업시작일은 필수항목입니다';
        } else {
            this.invalidMessage.WORK_START_DT =
                '작업시작일에 대한 형식(yyyy년 MM월 dd일 HH:mm)이 알맞지 않거나 시간으로 표기할 수 없습니다';
        }
    }

    onInputWorkEndDate(input: Date | string) {
        if (input instanceof Date) {
            const start_dt = this.work.WORK_START_DT;
            if (
                start_dt instanceof Date &&
                input.getTime() < start_dt.getTime()
            ) {
                this.invalidMessage.WORK_END_DT =
                    '작업시작일이 종료일 이후로 설정되었습니다';
            } else {
                this.invalidMessage.WORK_END_DT = undefined;

                if (this.invalidMessage.WORK_START_DT !== undefined) {
                    this.invalidMessage.WORK_START_DT = undefined;
                }
            }
        } else if (input === null) {
            this.invalidMessage.WORK_END_DT = '작업종료일은 필수항목입니다';
        } else {
            this.invalidMessage.WORK_END_DT =
                '작업종료일에 대한 형식(yyyy년 MM월 dd일 HH:mm)이 알맞지 않거나 시간으로 표기할 수 없습니다';
        }
    }

    get workStart(): any {
        return this.work.WORK_START_DT;
    }

    set workStart(start: any) {
        this.work.WORK_START_DT = this.normalizeWorkDate(start);
    }

    get workEnd(): any {
        return this.work.WORK_END_DT;
    }

    set workEnd(end: any) {
        this.work.WORK_END_DT = this.normalizeWorkDate(end);
    }
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
