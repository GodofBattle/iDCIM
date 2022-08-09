<template>
    <div class="p-d-flex p-flex-column" :style="{ height: '100%' }">
        <i-chart
            type="bar"
            :data="chartData"
            :options="barChartOptions"
            width="100%"
            height="20%"
        />
        <i-scroll-panel
            id="i-asset-panel-alert"
            class="p-px-2 p-py-4"
            :style="{ height: '80%' }"
        >
            <Timeline :value="alertList">
                <template #marker="slotProps">
                    <div class="p-timeline-event-connector" />
                    <Tag
                        :class="lvlStatus(slotProps.item.OCCUR_LEVEL)"
                        :value="lvlText(slotProps.item.OCCUR_LEVEL)"
                        :style="{ width: '4rem' }"
                    />
                    <div
                        v-if="alertList.length - 1 === slotProps.index"
                        class="p-timeline-event-connector"
                    />
                </template>
                <template #opposite="slotProps">
                    <Card v-if="slotProps.item.FLAG === 1" class="p-mb-3">
                        <template #title>
                            {{ alertTitle(slotProps.item) }}
                        </template>
                        <template #subtitle>
                            <div class="i-alert-date">
                                {{ alertDateFormat(slotProps.item) }}
                            </div>
                        </template>
                        <template #content>
                            <div class="p-d-flex p-flex-column">
                                <div>
                                    {{ slotProps.item.OCCUR_MSG }}
                                </div>
                            </div>
                        </template>
                    </Card>
                </template>
                <template #content="slotProps">
                    <Card v-if="slotProps.item.FLAG === 2" class="p-mb-3">
                        <template #title>
                            {{ alertTitle(slotProps.item) }}
                        </template>
                        <template #subtitle>
                            <div class="i-alert-date">
                                {{ alertDateFormat(slotProps.item) }}
                            </div>
                            <small>
                                {{ alertPeriod(slotProps.item) }}
                            </small>
                        </template>
                        <template #content>
                            <div class="p-d-flex p-flex-column">
                                <div>
                                    {{ slotProps.item.OCCUR_MSG }}
                                </div>
                                <div>
                                    {{ slotProps.item.RECOVER_MSG }}
                                </div>
                            </div>
                        </template>
                    </Card>
                </template>
            </Timeline>
            <Button
                v-if="showMoreData"
                class="p-mt-3"
                label="더보기"
                :style="{ width: '100%' }"
                @click="onClickShowMoreAlert"
            />
            <ScrollTop target="parent" />
        </i-scroll-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import BadgeDirective from 'primevue/badgedirective';
import iChart from '../custom/iChart.vue';
import Component from '@/plugins/nuxt-class-component';

interface CODE {
    NAME: string;
    VALUE: number;
}

interface LogAlarmCountType {
    DT: string;
    ALARM_COUNT: number;
}

@Component<AssetPanelAlert>({
    components: { iChart },
    directives: {
        badge: BadgeDirective
    },
    props: {
        assetItem: Object
    },
    watch: {
        assetItem: {
            deep: true,
            handler() {
                this.initAlertList();
            }
        }
    },
    apollo: {
        alertList: {
            query: gql`
                query ($ASSET_ID: Int!, $OFFSET: Int) {
                    LogAlarm(ASSET_ID: $ASSET_ID, OFFSET: $OFFSET) {
                        ID
                        SENSOR_ID
                        SENSOR_NAME
                        FLAG
                        OCCUR_DT
                        OCCUR_LEVEL
                        OCCUR_STATUS
                        OCCUR_MSG
                        RECOVER_DT
                        RECOVER_LEVEL
                        RECOVER_STATUS
                        RECOVER_MSG
                        ALARM_PERIOD
                    }
                }
            `,
            skip() {
                return this.$props.assetItem?.ID === null;
            },
            variables() {
                return {
                    ASSET_ID: Number(this.$props.assetItem.ID),
                    OFFSET: 0
                };
            },
            update: ({ LogAlarm }) => LogAlarm
        },
        alertListCount: {
            query: gql`
                query ($ASSET_ID: Int!) {
                    CountLogAlarm(ASSET_ID: $ASSET_ID)
                }
            `,
            skip() {
                return this.$props.assetItem?.ID === null;
            },
            variables() {
                return {
                    ASSET_ID: Number(this.$props.assetItem.ID)
                };
            },
            update: ({ CountLogAlarm }) => CountLogAlarm
        },
        alertStat: {
            query: gql`
                query ($ASSET_ID: Int!) {
                    StatisticsLogAlarm(ASSET_ID: $ASSET_ID) {
                        DT
                        ALARM_COUNT
                    }
                }
            `,
            skip() {
                return this.$props.assetItem?.ID === null;
            },
            variables() {
                return {
                    ASSET_ID: Number(this.$props.assetItem.ID)
                };
            },
            update: ({ StatisticsLogAlarm }) => StatisticsLogAlarm,
            result({ loading, data }) {
                if (!loading) {
                    const { StatisticsLogAlarm } = data;
                    if (StatisticsLogAlarm) {
                        this.apolloFetchStaticsLogAlarm(StatisticsLogAlarm);
                    }
                }
            }
        },
        levelCode: {
            query: gql`
                query {
                    Codes(TYPE: "LEVEL") {
                        NAME
                        VALUE
                    }
                }
            `,
            update: ({ Codes }) => Codes
        }
    }
})
export default class AssetPanelAlert extends Vue {
    alertList = [];
    alertListOffset = 0;
    alertStat: Array<LogAlarmCountType> = [];
    levelCode: Array<CODE> = [];
    alertListCount: number = 0;

    chartData = {
        labels: [] as Array<string>,
        datasets: [] as any
    };

    barChartOptions = {
        responsive: true,
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        }
    };

    get chartHeight(): number {
        console.info(this.$el.clientHeight * 0.2);
        return this.$el.clientHeight * 0.2;
    }

    get showMoreData(): boolean {
        return this.alertList.length < this.alertListCount;
    }

    apolloFetchStaticsLogAlarm(data: Array<LogAlarmCountType>) {
        const datasets = {
            label: '월별 알람건수',
            data: [] as Array<number>
        };

        data.forEach((d: LogAlarmCountType) => {
            this.chartData.labels.push(d.DT);
            datasets.data.push(d.ALARM_COUNT);
        });

        this.chartData.datasets.push(datasets);
    }

    initAlertList() {
        this.alertListOffset = 0;

        const scroll_element = this.$el.querySelector('.p-scrollpanel-content');
        scroll_element?.scroll({
            top: 0,
            behavior: 'auto'
        });
    }

    formatDateTime(date: string) {
        const d = new Date(date);
        return `${d.getFullYear()}.${('0' + (d.getMonth() + 1)).slice(-2)}.${(
            '0' + d.getDay()
        ).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${(
            '0' + d.getMinutes()
        ).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`;
    }

    alertTitle(item: any): string {
        return item.SENSOR_ID === -1 ? '통신장애' : item.SENSOR_NAME;
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
        const period = item.ALARM_PERIOD.split(':');

        const h = Number(period[0]);
        const m = Number(period[1]);
        const s = Number(period[2]);

        let period_text = '';
        if (h > 24) {
            period_text += `${Math.floor(h / 24)}일 ${h % 24}시간`;
        } else if (h > 0) {
            period_text += `${h}시간`;
        }

        if (m > 0) {
            period_text += `${period_text.length > 0 ? ' ' : ''}${m}분`;
        }

        if (s > 0) {
            period_text += `${period_text.length > 0 ? ' ' : ''}${s}초`;
        }

        if (period_text.length > 0) {
            period_text += ' 소요';
        }

        return period_text;
    }

    lvlText(lvl: number) {
        if (lvl === null) {
            return '통신불량';
        }

        return this.levelCode.find((code: CODE) => code.VALUE === lvl)?.NAME;
    }

    lvlStatus(lvl: number) {
        return [
            {
                'i-lvl00': lvl === 0,
                'i-lvl01': lvl === 1,
                'i-lvl02': lvl === 2,
                'i-lvl03': lvl === 3,
                'i-lvl04': lvl === 4,
                'i-lvl05': lvl === null
            }
        ];
    }

    onClickShowMoreAlert() {
        this.alertListOffset += 100;

        this.$apollo.queries.alertList.fetchMore({
            variables: {
                OFFSET: this.alertListOffset
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                const new_alert = fetchMoreResult.LogAlarm;

                return {
                    LogAlarm: [...previousResult.LogAlarm, ...new_alert]
                };
            }
        });
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-alert::v-deep {
    .i-table-empty {
        height: 10vh;
        line-height: 10vh;
        text-align: center;
        font-size: 1.2rem;
    }

    .i-alert-date {
        font-weight: bold;
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
