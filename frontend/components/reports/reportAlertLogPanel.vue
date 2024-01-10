<template>
    <div id="i-report-alert-log-panel">
        <DataTable
            :value="alertList"
            class="p-datatable-sm"
            :scrollable="true"
            scroll-height="flex"
            :table-style="{ width: '100%', height: '100%' }"
            response-layout="scroll"
            :striped-rows="true"
            data-key="ID"
            :paginator="true"
            filter-display="row"
            :first.sync="first"
            :rows.sync="rows"
            :total-records="totalCountAlertList"
            :page-link-size="10"
            :lazy="true"
        >
            <template #header>
                <div class="p-d-flex">
                    <div class="p-as-center p-d-flex p-flex-column">
                        <label class="p-mb-1"> 조회기간 </label>
                        <div>
                            <i-calendar
                                v-model="startDate"
                                :panel-style="{ width: '16vw' }"
                                :input-style="{ 'text-align': 'center' }"
                                append-to="body"
                                :select-other-months="true"
                                :show-button-bar="true"
                                :show-clear-button="false"
                            />
                            <label class="p-mx-1">~</label>
                            <i-calendar
                                v-model="endDate"
                                :panel-style="{ width: '16vw' }"
                                :input-style="{ 'text-align': 'center' }"
                                append-to="body"
                                :select-other-months="true"
                                :show-button-bar="true"
                                :show-clear-button="false"
                            />
                        </div>
                    </div>
                    <div class="p-ml-auto p-as-center">
                        <Button
                            label="조회"
                            icon="pi pi-search"
                            class="p-button-text"
                            :disabled="isDisabedSearchButton"
                            @click="onClickSearch"
                        />
                    </div>
                </div>
            </template>

            <template #empty>
                <span v-if="alertList === null"> 알람이력을 조회하세요 </span>
                <span v-else> 조회기간 내 알람이력이 없습니다 </span>
            </template>

            <Column
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '140px'
                }"
                :show-filter-menu="false"
                field="ALARM_LEVEL"
            >
                <template #body="slotProps">
                    <Tag
                        :class="lvlStatus(slotProps.data.ALARM_LEVEL)"
                        :value="lvlName(slotProps.data.ALARM_LEVEL)"
                        :style="{ width: '5rem' }"
                    />
                </template>
                <template #filter>
                    <MultiSelect
                        v-model="filterOccurLevel"
                        :style="{ width: '80px' }"
                        class="p-column-filter"
                        :options="alertLevel"
                        option-label="name"
                        option-value="lvl"
                    >
                        <template #option="slotProps">
                            <Tag
                                :class="lvlStatus(slotProps.option.lvl)"
                                :value="slotProps.option.name"
                                :style="{ width: '4.5rem' }"
                            />
                        </template>
                    </MultiSelect>
                </template>
            </Column>
            <Column
                header="상태"
                field="FLAG"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '140px'
                }"
                :show-filter-menu="false"
            >
                <template #body="slotProps">
                    {{ slotProps.data.FLAG === 1 ? '알람진행' : '알람해제' }}
                </template>
                <template #filter>
                    <MultiSelect
                        v-model="filterFlag"
                        :style="{ width: '80px' }"
                        class="p-column-filter"
                        :options="alertFlag"
                        option-label="name"
                        option-value="flag"
                    >
                    </MultiSelect>
                </template>
            </Column>
            <Column
                header="발생일시"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '20%'
                }"
            >
                <template #body="slotProps">
                    {{ alertDateFormat(slotProps.data) }}
                </template>
            </Column>
            <Column
                header="발생소요시간"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '10%'
                }"
            >
                <!--//by MJ 2023.04.14 : 소요시간 데이터 값 -->
                <template #body="slotProps">
                    {{ alertPeriod(slotProps.data) }}
                </template>
            </Column>
            <Column
                header="자산명"
                field="ASSET_NAME"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '10%'
                }"
                :show-filter-menu="false"
            >
                <template #filter>
                    <InputText
                        v-model="filterAssetName"
                        class="p-column-filter"
                        maxlength="32"
                    />
                </template>
            </Column>
            <Column
                header="수집항목"
                field="SENSOR_NAME"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '10%'
                }"
                :show-filter-menu="false"
            >
                <template #filter>
                    <InputText
                        v-model="filterSensorName"
                        class="p-column-filter"
                        maxlength="32"
                    />
                </template>
            </Column>
            <Column
                header="알람내역"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': 'calc(50% - 280px)'
                }"
            >
                <template #body="slotProps">
                    <div class="p-d-flex p-flex-column">
                        <div>
                            {{ slotProps.data.OCCUR_MSG }}
                        </div>
                        <div>
                            {{ slotProps.data.RECOVER_MSG }}
                        </div>
                    </div>
                </template>
            </Column>
            <template #paginatorstart></template>
            <template #paginatorend>
                <label
                    v-if="totalCountAlertList ? totalCountAlertList > 0 : false"
                >
                    {{ summary }}
                </label>
                <small v-else>최대 10만건까지 조회됩니다</small>
            </template>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<ReportAlertLogPanel>({
    apollo: {
        alertList: {
            query: gql`
                query (
                    $HAS_TIME: Boolean!
                    $START_DT: String
                    $END_DT: String
                    $OCCUR_LEVEL: [Int!]
                    $FLAG: Int
                    $ASSET_NAME: String
                    $SENSOR_NAME: String
                    $OFFSET: Int
                ) {
                    LogAlarmList(
                        HAS_TIME: $HAS_TIME
                        START_DT: $START_DT
                        END_DT: $END_DT
                        OCCUR_LEVEL: $OCCUR_LEVEL
                        FLAG: $FLAG
                        ASSET_NAME: $ASSET_NAME
                        SENSOR_NAME: $SENSOR_NAME
                        OFFSET: $OFFSET
                    ) {
                        ID
                        ASSET_ID
                        SENSOR_ID
                        FLAG
                        OCCUR_DT
                        OCCUR_CD
                        OCCUR_LEVEL
                        OCCUR_STATUS
                        OCCUR_MSG
                        RECOVER_DT
                        RECOVER_LEVEL
                        RECOVER_STATUS
                        RECOVER_MSG
                        ASSET_NAME
                        SENSOR_NAME
                        ALARM_PERIOD
                        ALARM_LEVEL
                    }
                }
            `,
            skip() {
                return !this.isSendingAlertList;
            },
            variables() {
                return {
                    HAS_TIME: false,
                    START_DT: this.convertDateString(this.startDate),
                    END_DT: this.convertDateString(this.endDate),
                    OCCUR_LEVEL: this.filterOccurLevel,
                    FLAG: this.filteredFlag,
                    ASSET_NAME: this.filterAssetName,
                    SENSOR_NAME: this.filterSensorName,
                    OFFSET: this.first
                };
            },
            debounce: 300,
            update: ({ LogAlarmList }) => LogAlarmList,
            result({ loading }) {
                if (!loading) {
                    this.isSendingAlertList = false;
                }
            }
        },
        totalCountAlertList: {
            query: gql`
                query (
                    $HAS_TIME: Boolean!
                    $START_DT: String
                    $END_DT: String
                    $OCCUR_LEVEL: [Int!]
                    $FLAG: Int
                    $ASSET_NAME: String
                    $SENSOR_NAME: String
                ) {
                    CountLogAlarmList(
                        HAS_TIME: $HAS_TIME
                        START_DT: $START_DT
                        END_DT: $END_DT
                        OCCUR_LEVEL: $OCCUR_LEVEL
                        FLAG: $FLAG
                        ASSET_NAME: $ASSET_NAME
                        SENSOR_NAME: $SENSOR_NAME
                    )
                }
            `,
            skip() {
                return !this.isSendingAlertListTotal;
            },
            variables() {
                return {
                    HAS_TIME: false,
                    START_DT: this.convertDateString(this.startDate),
                    END_DT: this.convertDateString(this.endDate),
                    OCCUR_LEVEL: this.filterOccurLevel,
                    FLAG: this.filteredFlag,
                    ASSET_NAME: this.filterAssetName,
                    SENSOR_NAME: this.filterSensorName
                };
            },
            update: ({ CountLogAlarmList }) => CountLogAlarmList,
            result({ loading }) {
                if (!loading) {
                    this.isSendingAlertListTotal = false;
                }
            }
        }
    },
    watch: {
        first(_idx) {
            this.$nuxt.$loading.start();
            this.isSendingAlertList = true;
            this.isSendingAlertListTotal = true;
        },
        isSendingAlertList(is) {
            if (!is && !this.isSendingAlertListTotal) {
                this.$nuxt.$loading.finish();
            }
        },
        isSendingAlertListTotal(is) {
            if (!is && !this.isSendingAlertList) {
                this.$nuxt.$loading.finish();
            }
        }
    }
})
export default class ReportAlertLogPanel extends Vue {
    startDate: Date = this.initStartDate();
    endDate: Date = new Date();

    isSendingAlertList = false;
    isSendingAlertListTotal = false;
    alertList: Array<any> | null = null;
    totalCountAlertList: number | null = null;

    first: number = 0;
    rows: number = 100;

    filterOccurLevel: Array<number> = [];
    filterFlag: Array<number> = [];
    filterAssetName: string = '';
    filterSensorName: string = '';
    isChangingSensorName: boolean = false;

    alertLevel: Array<any> = [
        { name: '주의', lvl: 1 },
        { name: '경고', lvl: 2 },
        { name: '위험', lvl: 3 },
        { name: '통신이상', lvl: 5 }
    ];

    alertFlag: Array<any> = [
        { name: '알람진행', flag: 1 },
        { name: '알람해제', flag: 2 }
    ];

    initStartDate(): Date {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        return new Date(today.setMonth(today.getMonth() - 1));
    }

    convertDateString(d: Date) {
        const yyyy = d.getFullYear();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    }

    onClickSearch() {
        this.$nuxt.$loading.start();
        this.isSendingAlertList = true;
        this.isSendingAlertListTotal = true;
    }

    lvlStatus(lvl: number) {
        return [
            {
                'i-lvl00': lvl === 0,
                'i-lvl01': lvl === 1,
                'i-lvl02': lvl === 2,
                'i-lvl03': lvl === 3,
                'i-lvl04': lvl === 4,
                'i-lvl05': lvl === 5
            }
        ];
    }

    lvlName(lvl: number) {
        const alert = this.alertLevel.find((a: any) => a.lvl === lvl);
        return alert ? alert.name : '';
    }

    formatDateTime(date: string) {
        const d = new Date(date);
        return `${d.getFullYear()}.${('0' + (d.getMonth() + 1)).slice(-2)}.${(
            '0' + d.getDate()
        ).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${(
            '0' + d.getMinutes()
        ).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;
    }

    alertDateFormat(item: any): string {
        let d = this.formatDateTime(item.OCCUR_DT);
        if (item.RECOVER_DT) {
            const r_d = this.formatDateTime(item.RECOVER_DT).split(' ');

            if (d.includes(r_d[0])) {
                d += ` ~ ${r_d[1]}`;
            } else {
                d += ` ~ ${r_d[0]} ${r_d[1]}`;
            }
        }
        return d;
    }

    alertPeriod(item: any) {
        if (item.ALARM_PERIOD === null) {
            return '';
        }

        const period = item.ALARM_PERIOD.split(':');

        const h = Number(period[0]);
        const m = Number(period[1]);
        const s = Number(period[2]);
        const d = Math.floor(h / 24);

        let period_text = '';
        if (h > 24) {
            period_text += `${d}일 ${h % 24 > 0 ? ` ${h % 24}시간` : ''}`;
        } else if (h > 0) {
            period_text += `${h}시간 ${m > 0 ? ` ${m}분` : ''}`;
        } else if (m > 0) {
            period_text += `${m}분 ${s > 0 ? ` ${s}초` : ''}`;
        } else if (s > 0) {
            period_text += `${s}초`;
        }

        // if (period_text.length > 0) {
        //     period_text += ' 소요';
        // }

        return period_text;
    }

    get isDisabedSearchButton(): boolean {
        return this.startDate.getTime() > this.endDate.getTime();
    }

    get filteredFlag(): number {
        if (this.filterFlag.length === 1) {
            return this.filterFlag.at(0) ?? 0;
        } else {
            return 0;
        }
    }

    get summary(): string {
        const total = this.totalCountAlertList ? this.totalCountAlertList : 0;

        const first = this.first + 1;
        const last =
            this.first + this.rows > total ? total : this.first + this.rows;

        return `${first} - ${last} / ${total}`;
    }
}
</script>

<style lang="scss" scoped>
#i-report-alert-log-panel::v-deep {
    width: 100%;
    height: 100%;

    .p-datatable-emptymessage {
        td {
            justify-content: center;
            border: none;
            height: 60vh;
        }
    }

    .i-lvl00 {
        background: transparent;
        border: 1px solid var(--surface-border);
    }

    .i-lvl01 {
        background-color: var(--warning);
        color: var(--text-alert-warning-color);
    }

    .i-lvl02 {
        background-color: var(--major);
        color: var(--text-alert-color);
    }

    .i-lvl03 {
        background-color: var(--critical);
        color: var(--text-alert-color);
    }

    .i-lvl04 {
        background-color: var(--comm04-color);
        color: var(--text-alert-color);
    }

    .i-lvl05 {
        background-color: var(--comm05-color);
        color: var(--text-alert-color);
    }
}
</style>
