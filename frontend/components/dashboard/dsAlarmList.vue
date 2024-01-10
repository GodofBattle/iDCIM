<template>
    <div id="i-ds-alarm-list" class="p-p-3" :style="styles">
        <DataTable
            :value="alarmListToRender"
            class="p-datatable-sm"
            :scrollable="true"
            scroll-height="flex"
            :table-style="{ width: '100%', height: '100%' }"
            response-layout="scroll"
            :striped-rows="true"
            data-key="ID"
            :lazy="true"
            :paginator="true"
            :first.sync="first"
            :rows="rows"
            :total-records="totolRecords"
            :page-link-size="10"
        >
            <template #empty>
                <span v-if="alarmList && alarmList.length === 0">
                    정상상황입니다
                </span>
            </template>

            <template #header> 자산 알람현황 </template>
            <Column
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '140px'
                }"
                field="ALARM_LEVEL"
            >
                <template #body="slotProps">
                    <Tag
                        :class="lvlStatus(slotProps.data.ALARM_LEVEL)"
                        :value="lvlName(slotProps.data.ALARM_LEVEL)"
                        :style="{ width: '5rem' }"
                    />
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
                header="자산명"
                field="ASSET_NAME"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '10%'
                }"
            >
            </Column>
            <Column
                header="수집항목"
                field="SENSOR_NAME"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '10%'
                }"
            >
            </Column>
            <Column
                header="알람내역"
                field="OCCUR_MSG"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '40%'
                }"
            >
            </Column>
            <Column>
                <template #body="slotProps">
                    <Button
                        class="p-button-outlined p-button-secondary"
                        icon="pi pi-search"
                        title="상세설정"
                        @click="onClickAsset(slotProps.data)"
                    />
                </template>
            </Column>
            <template #paginatorstart></template>
            <template #paginatorend>
                <label>
                    {{ summary }}
                </label>
            </template>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';

@Component<DsAlarmList>({
    props: {
        width: {
            type: String,
            default: '50vw'
        },
        height: {
            type: String,
            default: '20vh'
        }
    },
    apollo: {
        alarmList: {
            query: gql`
                query {
                    CurrentLogAlarmList {
                        ID
                        ASSET_ID
                        SENSOR_ID
                        FLAG
                        OCCUR_DT
                        OCCUR_CD
                        OCCUR_LEVEL
                        OCCUR_STATUS
                        OCCUR_MSG
                        ASSET_NAME
                        SENSOR_NAME
                        ALARM_LEVEL
                        IS_USE_INTF
                    }
                }
            `,
            update: ({ CurrentLogAlarmList }) => CurrentLogAlarmList
        }
    },
    watch: {
        isStatusIndex() {
            this.$apollo.queries.alarmList.refetch();
        }
    }
})
export default class DsAlarmList extends Vue {
    alarmList: Array<any> = [];

    alertLevel: Array<any> = [
        { name: '주의', lvl: 1 },
        { name: '경고', lvl: 2 },
        { name: '위험', lvl: 3 },
        { name: '통신이상', lvl: 5 }
    ];

    first: number = 0;
    rows: number = 50;

    get isStatusIndex(): number {
        // by shkoh 20230404: 자산의 상태가 변경됐음을 알려줄 때, 상태 Index가 1이 추가되면서 이를 알려줌
        const status_index = this.$store.getters['sessionStorage/STATUS'];
        return status_index;
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
        const d = this.formatDateTime(item.OCCUR_DT);
        return d;
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

    onClickAsset(assetItem: any) {
        eventBus.$emit('showAssetDialog', {
            ID: assetItem.ASSET_ID.toString(),
            NAME: assetItem.ASSET_NAME,
            IS_USE_INTF: assetItem.IS_USE_INTF
        });
    }

    get styles(): Object {
        return {
            width: this.$props.width,
            height: this.$props.height
        };
    }

    get totolRecords(): number {
        return this.alarmList.length;
    }

    get summary(): string {
        const first = this.first + 1;
        const last =
            this.first + this.rows > this.totolRecords
                ? this.totolRecords
                : this.first + this.rows;
        return `${first} - ${last} / ${this.totolRecords}`;
    }

    get alarmListToRender(): Array<any> {
        const start = this.first;
        const last = this.first + this.rows;

        return this.alarmList.slice(start, last);
    }
}
</script>

<style lang="scss" scoped>
#i-ds-alarm-list::v-deep {
    .p-datatable-emptymessage {
        td {
            justify-content: center;
            align-items: center;
            border: none;
            height: calc(100% - 28px);
        }
    }
}
</style>
