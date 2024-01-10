<template>
    <div id="i-report-data-log-panel">
        <DataTable
            class="p-datatable-sm"
            :scrollable="true"
            scroll-height="flex"
            :table-style="{ width: '100%', height: '100%' }"
            response-layout="scroll"
            :striped-rows="true"
            data-key="ID"
            :paginator="!disabledSearchButton"
            :rows="100"
            :total-records="totalCountDataList"
            :first.sync="rowCount"
            :lazy="true"
            :value="dataList"
            :page-link-size="10"
            row-group-mode="subheader"
            group-rows-by="SENSOR_ID"
            :always-show-paginator="true"
            @page="onPage"
        >
            <template #header>
                <div class="p-d-flex">
                    <div class="p-as-center">
                        <Button
                            class="p-button-text p-mr-3"
                            :icon="sidebarButtonIcon"
                            @click="onClickSidebarButton"
                        />
                    </div>
                    <div class="p-as-center">
                        <i-calendar
                            v-model="startDate"
                            :panel-style="{ width: '16vw' }"
                            :input-style="{ 'text-align': 'center' }"
                            append-to="body"
                            :show-time="isShowTime"
                            :select-other-months="true"
                            :show-button-bar="true"
                            :show-clear-button="false"
                            :step-minute="stepMinute"
                            :view="calendarView"
                            :date-format="calendarDateFormat"
                        />
                        <label class="p-mx-1">~</label>
                        <i-calendar
                            v-model="endDate"
                            :panel-style="{ width: '16vw' }"
                            :input-style="{ 'text-align': 'center' }"
                            append-to="body"
                            :show-time="isShowTime"
                            :select-other-months="true"
                            :show-button-bar="true"
                            :show-clear-button="false"
                            :step-minute="stepMinute"
                            :view="calendarView"
                            :date-format="calendarDateFormat"
                        />
                    </div>
                    <Divider layout="vertical" />
                    <div class="p-as-center">
                        <Dropdown
                            v-model="selectedDataType"
                            :options="dataType"
                            option-label="name"
                            option-value="value"
                            @change="onChangeDataType"
                        />
                    </div>
                    <div class="p-ml-auto p-as-center">
                        <Button
                            label="조회"
                            icon="pi pi-search"
                            class="p-button-text"
                            :disabled="disabledSearchButton"
                            @click="onClickSearchButton"
                        />
                    </div>
                </div>
            </template>

            <template #empty>
                <span v-if="dataList.length === 0">
                    데이터 통계를 조회하세요
                </span>
                <span v-else>조회기간 내 데이터 통계가 없습니다</span>
            </template>

            <Column
                header="자산명"
                field="ASSET_NAME"
                :hidden="showSidebar"
                :styles="{
                    'flex-grow': 2
                }"
            />
            <Column
                header="수집항목명"
                field="SENSOR_NAME"
                :hidden="showSidebar"
                :styles="{
                    'flex-grow': 2
                }"
            />

            <Column
                header="수집기간"
                :styles="{
                    'flex-grow': 3
                }"
            >
                <template #body="slotProps">
                    {{ dateFormat(slotProps.data) }}
                </template>
            </Column>
            <Column
                header="최소"
                field="MIN_VALUE"
                :styles="{
                    'flex-grow': 1
                }"
            >
                <template #body="slotProps">
                    {{ valueText(slotProps) }}
                </template>
            </Column>
            <Column
                header="평균"
                field="AVR_VALUE"
                :styles="{
                    'flex-grow': 1
                }"
            >
                <template #body="slotProps">
                    {{ valueText(slotProps) }}
                </template>
            </Column>
            <Column
                header="최대"
                field="MAX_VALUE"
                :styles="{
                    'flex-grow': 1
                }"
            >
                <template #body="slotProps">
                    {{ valueText(slotProps) }}
                </template>
            </Column>
            <template #groupheader="slotProps">
                <span>
                    {{ slotProps.data.ASSET_NAME }} ::
                    {{ slotProps.data.SENSOR_NAME }}
                </span>
            </template>
            <template #paginatorstart> </template>
            <template #paginatorend>
                <small>최대 10만건까지 조회가능</small>
            </template>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface SensorCode {
    [index: string]: number | string;
    CODE: string;
    NAME: string;
    TYPE: string;
    UNIT: string;
    IS_DISP_CONV: number;
}

interface DisplayPowerCode {
    [index: string]: number | string;
    CODE: string;
    NAME: string;
    VALUE: number;
    REMARK: string;
}

@Component<ReportDataLogPanel>({
    props: {
        showSidebar: {
            type: Boolean,
            default: false
        },
        selectedSensors: {
            type: Array,
            default: null
        }
    },
    apollo: {
        dataList: {
            query: gql`
                query (
                    $TYPE: String!
                    $SENSOR_IDS: [Int!]!
                    $START_DT: String
                    $END_DT: String
                    $OFFSET: Int
                    $SIZE: Int
                ) {
                    DataLogAnalogSensor(
                        TYPE: $TYPE
                        SENSOR_IDS: $SENSOR_IDS
                        START_DT: $START_DT
                        END_DT: $END_DT
                        OFFSET: $OFFSET
                        SIZE: $SIZE
                    ) {
                        TYPE
                        ASSET_ID
                        ASSET_NAME
                        SENSOR_ID
                        SENSOR_NAME
                        SENSOR_CD
                        DISP_POWER
                        MIN_VALUE
                        AVR_VALUE
                        MAX_VALUE
                        START_DATE
                        END_DATE
                    }
                }
            `,
            skip() {
                return !this.isSendingDataList;
            },
            variables() {
                return {
                    TYPE: this.selectedDataType,
                    SENSOR_IDS: this.sensorsIds,
                    START_DT: this.convertStartDate,
                    END_DT: this.convertEndDate,
                    OFFSET: this.rowCount,
                    SIZE: 100
                };
            },
            debounce: 300,
            update: ({ DataLogAnalogSensor }) => DataLogAnalogSensor,
            result({ loading }) {
                if (!loading) {
                    this.isSendingDataList = false;
                    this.$nuxt.$loading.finish();
                }
            }
        },
        totalCountDataList: {
            query: gql`
                query (
                    $TYPE: String!
                    $SENSOR_IDS: [Int!]!
                    $START_DT: String
                    $END_DT: String
                ) {
                    CountDataLogAnalogSensor(
                        TYPE: $TYPE
                        SENSOR_IDS: $SENSOR_IDS
                        START_DT: $START_DT
                        END_DT: $END_DT
                    )
                }
            `,
            skip() {
                return !this.isSendingDataList;
            },
            variables() {
                return {
                    TYPE: this.selectedDataType,
                    SENSOR_IDS: this.sensorsIds,
                    START_DT: this.convertStartDate,
                    END_DT: this.convertEndDate
                };
            },
            update: ({ CountDataLogAnalogSensor }) => CountDataLogAnalogSensor
        },
        displayPowerList: {
            query: gql`
                query {
                    Codes(TYPE: "POWER") {
                        CODE
                        NAME
                        VALUE
                        REMARK
                    }
                }
            `,
            update: ({ Codes }) => Codes
        },
        sensorCodeList: {
            query: gql`
                query {
                    SensorCodes {
                        CODE
                        NAME
                        TYPE
                        UNIT
                        IS_DISP_CONV
                    }
                }
            `,
            update: ({ SensorCodes }) => SensorCodes
        }
    },
    watch: {
        rowCount(_idx) {
            this.$nuxt.$loading.start();
            this.isSendingDataList = true;
        }
    }
})
export default class ReportDataLogPanel extends Vue {
    dataList: Array<any> = [];
    sensorCodeList: Array<SensorCode> = [];
    displayPowerList: Array<DisplayPowerCode> = [];

    startDate: Date = this.initStartDate();
    endDate: Date = new Date();

    rowCount: number = 0;
    isSendingDataList: boolean = false;
    totalCountDataList: number | null = null;

    dataType: Array<any> = [
        { name: '5분 데이터', value: '5min' },
        { name: '시간 데이터', value: 'hour' },
        { name: '일 데이터', value: 'day' },
        { name: '월 데이터', value: 'month' }
    ];

    selectedDataType: string = 'day';
    showSidebar: unknown;

    initStartDate(): Date {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        return new Date(today.setMonth(today.getMonth() - 1));
    }

    onClickSidebarButton() {
        this.$emit('toggleSidebar');
    }

    onChangeDataType({ value }: any) {
        if (value === '5min') {
            this.set5minDate();
        } else if (value === 'hour') {
            this.setHourDate();
        }
    }

    set5minDate() {
        const s_date_h = this.startDate.getHours();
        const s_d = this.startDate.setHours(s_date_h, 0, 0);
        this.startDate = new Date(s_d);

        const now = new Date();
        const e_d = this.endDate.setHours(now.getHours() + 1, 0, 0);
        this.endDate = new Date(e_d);
    }

    setHourDate() {
        const s_d = this.startDate.setHours(0, 0);
        this.startDate = new Date(s_d);

        const now = new Date();
        const e_d = this.endDate.setHours(now.getHours() + 1, 0);
        this.endDate = new Date(e_d);
    }

    onClickSearchButton() {
        if (this.$props.showSidebar) {
            this.$emit('update:showSidebar', false);
        }

        this.$nuxt.$loading.start();
        this.isSendingDataList = true;
    }

    formatDateTime(type: string, date: string) {
        const d = new Date(date);

        const yyyy = d.getFullYear();
        const MM = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');

        const hh = d.getHours().toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');

        let format = `${yyyy}.${MM}`;

        switch (type) {
            case '5min':
                format += `.${dd} ${hh}:${mm}`;
                break;
            case 'hour':
                format += `.${dd} ${hh}:00`;
                break;
            case 'day':
                format += `.${dd}`;
                break;
        }

        return format;
    }

    dateFormat(item: any): string {
        let d = this.formatDateTime(item.TYPE, item.START_DATE);
        if (item.END_DATE) {
            const r_d = this.formatDateTime(item.TYPE, item.END_DATE).split(
                ' '
            );

            if (d.includes(r_d[0])) {
                d += ` ~ ${r_d[1]}`;
            } else if (r_d[1]) {
                d += ` ~ ${r_d[0]} ${r_d[1]}`;
            } else {
                d += ` ~ ${r_d[0]}`;
            }
        }
        return d;
    }

    onPage() {
        // by shkoh 20221121: 페이지 이동 시, 테이블 스크롤을 최상단으로 이동
        const scrollElement = this.$el.querySelector('.p-datatable-wrapper');
        if (scrollElement) {
            scrollElement.scroll({
                top: 0,
                behavior: 'auto'
            });
        }
    }

    valueText(item: any): string {
        let num = item.data[item.field];
        let prefix = '';
        let unit = '';

        const dispCode = this.displayPowerList.find(
            (disp: DisplayPowerCode) => disp.VALUE === item.data.DISP_POWER
        );
        if (dispCode) {
            num *= Math.pow(10, -dispCode.VALUE);
            prefix = dispCode.REMARK;
        }

        const sensorCode = this.sensorCodeList.find(
            (sensor: SensorCode) => sensor.CODE === item.data.SENSOR_CD
        );
        if (sensorCode) {
            unit = sensorCode.UNIT;
        }

        return `${Number(num.toFixed(1))} ${prefix}${unit}`;
    }

    get sidebarButtonIcon(): string {
        return this.$props.showSidebar
            ? 'pi pi-angle-double-left'
            : 'pi pi-angle-double-right';
    }

    get isShowTime(): boolean {
        return ['5min', 'hour'].includes(this.selectedDataType);
    }

    get stepMinute(): number {
        return this.selectedDataType === '5min' ? 5 : 60;
    }

    get calendarView(): string {
        return this.selectedDataType === 'month' ? 'month' : 'date';
    }

    get calendarDateFormat(): string {
        return this.selectedDataType === 'month'
            ? 'yy년 mm월'
            : 'yy년 mm월 dd일';
    }

    get disabledSearchButton(): boolean {
        return !this.hasSelectedSensor || this.isWrongDate;
    }

    get hasSelectedSensor(): boolean {
        return (
            this.$props.selectedSensors !== null &&
            this.$props.selectedSensors.length > 0
        );
    }

    get isWrongDate(): boolean {
        return this.startDate.getTime() > this.endDate.getTime();
    }

    get sensorsIds(): Array<number> {
        const sensors = this.$props.selectedSensors.map((s: any) =>
            Number(s.ID)
        );
        return sensors;
    }

    get convertStartDate(): string {
        return this.formatDateTime(
            this.selectedDataType,
            this.startDate.toString()
        ).replaceAll('.', '-');
    }

    get convertEndDate(): string {
        return this.formatDateTime(
            this.selectedDataType,
            this.endDate.toString()
        ).replaceAll('.', '-');
    }
}
</script>

<style lang="scss" scoped>
#i-report-data-log-panel::v-deep {
    .p-datatable-emptymessage {
        td {
            justify-content: center;
            border: none;
            height: 60vh;
        }
    }
}
</style>
