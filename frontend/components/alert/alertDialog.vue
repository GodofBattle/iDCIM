<template>
    <div id="i-alert-dialog">
        <i-dialog
            :visible.sync="showDialog"
            :content-style="{
                width: '60vw',
                height: '50vh',
                'padding-left': '1rem',
                'padding-right': '1rem',
                'padding-bottom': '1rem'
            }"
            append-to="body"
        >
            <template #header>
                <div class="i-title">
                    {{ title }}
                </div>
            </template>

            <DataTable
                :value="notificationsToRender"
                class="p-datatable-sm"
                :scrollable="true"
                scroll-height="flex"
                :table-style="{ width: '100%', height: '100%' }"
                response-layout="scroll"
                :striped-rows="true"
                :lazy="true"
                :paginator="true"
                :first.sync="first"
                :rows="rows"
                :totalRecords="totalRecords"
                :page-link-size="10"
            >
                <template #empty>
                    <span>조건에 맞는 알람은 없습니다</span>
                </template>

                <template #header>
                    <div class="p-d-flex">
                        <div class="p-as-center p-ml-auto">
                            <Button
                                class="p-button-sm p-button-outlined p-mr-3"
                                label="해제 알람확인"
                                @click="onClickRemoveRecoveryAlert"
                            />
                            <Button
                                class="p-button-sm"
                                label="전체 알람확인"
                                @click="onClickAlertClear"
                            />
                        </div>
                    </div>
                </template>

                <Column
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '120px'
                    }"
                >
                    <template #body="slotProps">
                        <Tag
                            :style="{ width: '6rem' }"
                            :class="lvlStatus(slotProps.data)"
                            :value="lvlName(slotProps.data)"
                        />
                    </template>
                </Column>

                <Column
                    header="발생일시"
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '16%'
                    }"
                    field="occur_date"
                >
                    <template #body="slotProps">
                        <div class="p-d-flex p-flex-column">
                            <span>
                                {{ occurDate(slotProps.data) }}
                            </span>
                            <span v-if="slotProps.data.RECOVERY">
                                {{ recoveryDate(slotProps.data) }}
                            </span>
                        </div>
                    </template>
                </Column>

                <Column
                    header="발생소요시간"
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '12%'
                    }"
                >
                    <template #body="slotProps">
                        {{ alertPeriod(slotProps.data) }}
                    </template>
                </Column>

                <Column
                    header="자산명"
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '12%'
                    }"
                    field="asset_name"
                />

                <Column
                    header="수집항목"
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': '12%'
                    }"
                    field="sensor_name"
                />

                <Column
                    header="알람내역"
                    :styles="{
                        'flex-grow': 1,
                        'flex-basis': 'calc(48% - 120px)'
                    }"
                    field="alarm_msg"
                >
                    <template #body="slotProps">
                        <div class="p-d-flex p-flex-column">
                            <span>
                                {{ slotProps.data.alarm_msg }}
                            </span>
                            <span v-if="slotProps.data.RECOVERY">
                                {{ slotProps.data.RECOVERY.alarm_msg }}
                            </span>
                        </div>
                    </template>
                </Column>

                <template #paginatorstart></template>

                <template #paginatorend>
                    <label>
                        {{ summary }}
                    </label>
                </template>
            </DataTable>
        </i-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

interface Notification {
    [index: string]: string | number | Notification | null;
    command: string;
    type: string;
    occur_date: string;
    asset_id: number;
    asset_name: string;
    prev_status: number;
    curr_status: number;
    alarm_id: number;
    alarm_msg: string;
    sensor_id: number;
    sensor_name: string;
    prev_level: number;
    prev_level_s: string;
    curr_level: number;
    curr_level_s: string;
    RECOVERY: Notification | null;
}

@Component<AlertDialog>({
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    }
})
export default class AlertDialog extends Vue {
    first: number = 0;
    rows: number = 100;

    get title(): string {
        return `미확인 알람: ${this.notifications.length.toLocaleString()}건`;
    }

    get totalRecords(): number {
        return this.notifications.length;
    }

    get summary(): string {
        const first = this.first + 1;
        const last =
            this.first + this.rows > this.totalRecords
                ? this.totalRecords
                : this.first + this.rows;
        return `${first.toLocaleString()} - ${last.toLocaleString()} / ${this.totalRecords.toLocaleString()}`;
    }

    get notifications(): Array<Notification> {
        return this.$store.getters['sessionStorage/NOTIFICATIONS'];
    }

    get notificationsToRender(): Array<Notification> {
        const temp_noti = this.notifications.slice(0, this.totalRecords);

        return temp_noti
            .sort((a: Notification, b: Notification) => {
                if (a.occur_date < b.occur_date) {
                    return 1;
                } else {
                    return -1;
                }
            })
            .slice(this.first, this.first + this.rows);
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    lvlStatus(data: Notification) {
        let lvl = data.type === 'asset' ? data.curr_status : data.curr_level;
        if (data.RECOVERY) {
            lvl = 0;
        }

        return [
            {
                'i-lvl00 i-status-recovery': lvl === 0,
                'i-lvl01': lvl === 1,
                'i-lvl02': lvl === 2,
                'i-lvl03': lvl === 3,
                'i-lvl04': lvl === 4,
                'i-lvl05': lvl === 5
            }
        ];
    }

    lvlName(data: Notification) {
        const name =
            data.type === 'asset'
                ? data.curr_status === 5
                    ? '통신이상'
                    : '해제'
                : data.curr_level_s;
        if (data.RECOVERY) {
            return `${name}`;
        }

        return name;
    }

    occurDate(data: Notification) {
        return `발생: ${data.occur_date.substring(5, 19)}`;
    }

    recoveryDate(data: Notification) {
        return `해제: ${data.RECOVERY?.occur_date.substring(5, 19)}`;
    }

    alertPeriod(data: Notification) {
        const startDate: string = data.occur_date;
        const endDate: any = data.RECOVERY?.occur_date;
        const start_time: number = new Date(startDate).getTime();
        const end_time: number = new Date(endDate).getTime();
        const time_diff: number = end_time - start_time;

        const times: number = Math.floor(time_diff / 1000);
        const seconds: number = times % 60;
        const minutes: number = Math.floor(times / 60) % 60;
        const hours: number = Math.floor(times / 60 / 60);
        const days: number = Math.floor(hours / 24);

        let period_text = '';

        if (hours > 24) {
            //by mj 2023.04.18 : 시 단위가 0 일땐 일 단위만 설정
            period_text = `${days}일 ${hours > 0 ? ` ${hours}시간` : ''}`;
        } else if (hours > 0) {
            period_text = `${hours}시간 ${minutes > 0 ? ` ${minutes}분` : ''}`;
        } else if (minutes > 0) {
            period_text = `${minutes}분${seconds > 0 ? ` ${seconds}초` : ''}`;
        } else if (seconds > 0) {
            period_text = `${seconds}초`;
        }

        return period_text;
    }

    onClickAlertClear() {
        this.$store.dispatch('sessionStorage/CLEARNOTIFICATION');
    }

    onClickRemoveRecoveryAlert() {
        this.$store.dispatch('sessionStorage/REMOVERECOVERYNOTIFICATION');
    }
}
</script>

<style lang="scss" scoped>
#i-alert-dialog::v-deep {
    .i-title {
        font-size: 1.6rem;
        font-weight: bold;
        color: var(--text-color);
    }

    .p-datatable-tbody{
        height:inherit;
    }

    .p-datatable-emptymessage {
        height:inherit;

        td {
            justify-content: center;
            align-items: center;
            border: none;
        }
    }

    .i-status-recovery {
        color: var(--text-color);
        text-decoration: line-through;
    }
}
</style>
