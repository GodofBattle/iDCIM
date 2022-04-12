<template>
    <div id="i-operator-panel-notify" class="p-grid">
        <div class="p-col p-fluid p-input-filled">
            <div class="p-field" v-if="is_enable_sms || is_enable_email">
                <label for="deliver">알림 허용 채널</label>
                <div class="p-d-flex">
                    <div class="p-field-checkbox p-mr-6" v-if="is_enable_sms">
                        <Checkbox
                            id="be-checked-sms"
                            v-model="checked_sms"
                            :binary="true"
                        ></Checkbox>
                        <label for="be-checked-sms">SMS</label>
                    </div>
                    <div class="p-field-checkbox" v-if="is_enable_email">
                        <Checkbox
                            id="be-checked-email"
                            v-model="checked_email"
                            :binary="true"
                        ></Checkbox>
                        <label for="be-checked-email">Email</label>
                    </div>
                </div>
            </div>

            <div class="p-field">
                <label for="allowedTime">알림 허용 시간</label>
                <div>
                    <div class="p-d-flex">
                        <ToggleButton
                            class="p-mr-2 i-noti-totally"
                            v-model="totally_monday"
                            on-label="월"
                            on-icon="pi pi-bell"
                            off-label="월"
                            off-icon="pi pi-clock"
                        ></ToggleButton>
                        <SelectButton
                            v-model="notification_monday"
                            :options="hourList"
                            :multiple="true"
                            option-label="name"
                            option-value="value"
                            data-key="value"
                        ></SelectButton>
                    </div>
                    <div class="p-d-flex p-mt-1">
                        <ToggleButton
                            class="p-mr-2 i-noti-totally"
                            v-model="totally_tuesday"
                            on-label="화"
                            on-icon="pi pi-bell"
                            off-label="화"
                            off-icon="pi pi-clock"
                        ></ToggleButton>
                        <SelectButton
                            v-model="notification_tuesday"
                            :options="hourList"
                            :multiple="true"
                            option-label="name"
                            option-value="value"
                            data-key="value"
                        ></SelectButton>
                    </div>
                    <div class="p-d-flex p-mt-1">
                        <ToggleButton
                            class="p-mr-2 i-noti-totally"
                            v-model="totally_wednesday"
                            on-label="수"
                            on-icon="pi pi-bell"
                            off-label="수"
                            off-icon="pi pi-clock"
                        ></ToggleButton>
                        <SelectButton
                            v-model="notification_wednesday"
                            :options="hourList"
                            :multiple="true"
                            option-label="name"
                            option-value="value"
                            data-key="value"
                        ></SelectButton>
                    </div>
                    <div class="p-d-flex p-mt-1">
                        <ToggleButton
                            class="p-mr-2 i-noti-totally"
                            v-model="totally_thursday"
                            on-label="목"
                            on-icon="pi pi-bell"
                            off-label="목"
                            off-icon="pi pi-clock"
                        ></ToggleButton>
                        <SelectButton
                            v-model="notification_thursday"
                            :options="hourList"
                            :multiple="true"
                            option-label="name"
                            option-value="value"
                            data-key="value"
                        ></SelectButton>
                    </div>
                    <div class="p-d-flex p-mt-1">
                        <ToggleButton
                            class="p-mr-2 i-noti-totally"
                            v-model="totally_friday"
                            on-label="금"
                            on-icon="pi pi-bell"
                            off-label="금"
                            off-icon="pi pi-clock"
                        ></ToggleButton>
                        <SelectButton
                            v-model="notification_friday"
                            :options="hourList"
                            :multiple="true"
                            option-label="name"
                            option-value="value"
                            data-key="value"
                        ></SelectButton>
                    </div>
                    <div class="p-d-flex p-mt-1">
                        <ToggleButton
                            class="p-mr-2 i-noti-totally"
                            v-model="totally_saturday"
                            on-label="토"
                            on-icon="pi pi-bell"
                            off-label="토"
                            off-icon="pi pi-clock"
                        ></ToggleButton>
                        <SelectButton
                            v-model="notification_saturday"
                            :options="hourList"
                            :multiple="true"
                            option-label="name"
                            option-value="value"
                            data-key="value"
                        ></SelectButton>
                    </div>
                    <div class="p-d-flex p-mt-1">
                        <ToggleButton
                            class="p-mr-2 i-noti-totally"
                            v-model="totally_sunday"
                            on-label="일"
                            on-icon="pi pi-bell"
                            off-label="일"
                            off-icon="pi pi-clock"
                        ></ToggleButton>
                        <SelectButton
                            v-model="notification_sunday"
                            :options="hourList"
                            :multiple="true"
                            option-label="name"
                            option-value="value"
                            data-key="value"
                        ></SelectButton>
                    </div>
                </div>
            </div>

            <div class="p-field">
                <label for="allowedLevel">알림 허용 단계</label>
                <div class="p-d-flex" style="width: 25rem">
                    <ToggleButton
                        class="i-allowed-level lvl0"
                        onLabel="정상"
                        offLabel="정상"
                        v-model="checked_level0"
                    ></ToggleButton>
                    <ToggleButton
                        class="i-allowed-level lvl1"
                        onLabel="주의"
                        offLabel="주의"
                        v-model="checked_level1"
                    ></ToggleButton>
                    <ToggleButton
                        class="i-allowed-level lvl2"
                        onLabel="경고"
                        offLabel="경고"
                        v-model="checked_level2"
                    ></ToggleButton>
                    <ToggleButton
                        class="i-allowed-level lvl3"
                        onLabel="위험"
                        offLabel="위험"
                        v-model="checked_level3"
                        disabled
                    ></ToggleButton>
                </div>
                <div class="p-field-checkbox p-mt-3">
                    <Checkbox
                        id="be-checked-down-level"
                        v-model="checked_downLevel"
                        :binary="true"
                    ></Checkbox>
                    <label for="be-checked-down-level">통신장애</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type OperatorNotifyType = {
    [index: string]: string;
    NOTI_CHANNEL: string;
    NOTI_SENSOR_ALARM_LEVEL: string;
    NOTI_ASSET_ALARM_ENABLE: string;
    NOTI_HOUR_MON: string;
    NOTI_HOUR_TUE: string;
    NOTI_HOUR_WED: string;
    NOTI_HOUR_THU: string;
    NOTI_HOUR_FRI: string;
    NOTI_HOUR_SAT: string;
    NOTI_HOUR_SUN: string;
};

@Component<OperatorNotify>({
    props: {
        operatorId: Number,
        applyButtonDisabled: Boolean,
    },
    watch: {
        operatorNotifyData: {
            deep: true,
            handler(_val: OperatorNotifyType) {
                this.compareOperatorNotify(_val);
            },
        },
    },
    apollo: {
        dbOperatorNotifyData: {
            query: gql`
                query Operator($ID: ID!) {
                    Operator(ID: $ID) {
                        NOTI_CHANNEL
                        NOTI_SENSOR_ALARM_LEVEL
                        NOTI_ASSET_ALARM_ENABLE
                        NOTI_HOUR_MON
                        NOTI_HOUR_TUE
                        NOTI_HOUR_WED
                        NOTI_HOUR_THU
                        NOTI_HOUR_FRI
                        NOTI_HOUR_SAT
                        NOTI_HOUR_SUN
                    }
                }
            `,
            prefetch: false,
            variables(): any {
                return {
                    ID: this.operatorId < 0 ? -1 : this.operatorId,
                };
            },
            update: ({ Operator }) => Operator,
            result({ loading, data }) {
                if (!loading) {
                    const { Operator } = data;

                    if (Operator) {
                        this.apolloFetch(Operator);
                    }
                }
            },
        },
    },
})
export default class OperatorNotify extends Vue {
    async mounted() {
        await this.$store.dispatch('sessionStorage/SITE');
    }

    levelList = [
        { name: '정상', value: 0 },
        { name: '주의', value: 1 },
        { name: '경고', value: 2 },
        { name: '위험', value: 3 },
    ];

    hourList = [
        { name: '00', value: 0 },
        { name: '01', value: 1 },
        { name: '02', value: 2 },
        { name: '03', value: 3 },
        { name: '04', value: 4 },
        { name: '05', value: 5 },
        { name: '06', value: 6 },
        { name: '07', value: 7 },
        { name: '08', value: 8 },
        { name: '09', value: 9 },
        { name: '10', value: 10 },
        { name: '11', value: 11 },
        { name: '12', value: 12 },
        { name: '13', value: 13 },
        { name: '14', value: 14 },
        { name: '15', value: 15 },
        { name: '16', value: 16 },
        { name: '17', value: 17 },
        { name: '18', value: 18 },
        { name: '19', value: 19 },
        { name: '20', value: 20 },
        { name: '21', value: 21 },
        { name: '22', value: 22 },
        { name: '23', value: 23 },
    ];

    notificationLevel = null;

    dbOperatorNotifyData: OperatorNotifyType = {
        NOTI_CHANNEL: '',
        NOTI_SENSOR_ALARM_LEVEL: '',
        NOTI_ASSET_ALARM_ENABLE: '',
        NOTI_HOUR_MON: '',
        NOTI_HOUR_TUE: '',
        NOTI_HOUR_WED: '',
        NOTI_HOUR_THU: '',
        NOTI_HOUR_FRI: '',
        NOTI_HOUR_SAT: '',
        NOTI_HOUR_SUN: '',
    };

    operatorNotifyData: OperatorNotifyType = {
        NOTI_CHANNEL: '',
        NOTI_SENSOR_ALARM_LEVEL: '',
        NOTI_ASSET_ALARM_ENABLE: '',
        NOTI_HOUR_MON: '',
        NOTI_HOUR_TUE: '',
        NOTI_HOUR_WED: '',
        NOTI_HOUR_THU: '',
        NOTI_HOUR_FRI: '',
        NOTI_HOUR_SAT: '',
        NOTI_HOUR_SUN: '',
    };

    apolloFetch(data: OperatorNotifyType) {
        for (const key of Object.keys(this.operatorNotifyData)) {
            this.operatorNotifyData[key] = data[key];
        }
    }

    replaceAt(source: string, index: number, replacer: string) {
        const pre = source.substr(0, index);
        const post = source.substr(index + replacer.length);
        return `${pre}${replacer}${post}`;
    }

    allowedLevelClass(lvl: number) {
        return `i-lvl-${lvl}`;
    }

    compareOperatorNotify(data: OperatorNotifyType) {
        this.$emit('update:applyButtonDisabled', true);

        for (const [key, value] of Object.entries(data)) {
            if (value !== this.dbOperatorNotifyData[key]) {
                this.$emit('update:applyButtonDisabled', false);
                break;
            }
        }
    }

    updateOperatorNotify() {
        console.info('update - notify');
    }

    get is_enable_sms(): boolean {
        return this.$store.state.sessionStorage.ui.is_enable_sms;
    }

    get is_enable_email(): boolean {
        return this.$store.state.sessionStorage.ui.is_enable_email;
    }

    get checked_sms(): boolean {
        return this.operatorNotifyData.NOTI_CHANNEL.charAt(0) === 'Y';
    }

    set checked_sms(checked: boolean) {
        this.operatorNotifyData.NOTI_CHANNEL = this.replaceAt(
            this.operatorNotifyData.NOTI_CHANNEL,
            0,
            checked ? 'Y' : 'N'
        );
    }

    get checked_email(): boolean {
        return this.operatorNotifyData.NOTI_CHANNEL.charAt(1) === 'Y';
    }

    set checked_email(checked: boolean) {
        this.operatorNotifyData.NOTI_CHANNEL = this.replaceAt(
            this.operatorNotifyData.NOTI_CHANNEL,
            1,
            checked ? 'Y' : 'N'
        );
    }

    get checked_downLevel(): boolean {
        return this.operatorNotifyData.NOTI_ASSET_ALARM_ENABLE === '1';
    }

    set checked_downLevel(checked: boolean) {
        this.operatorNotifyData.NOTI_ASSET_ALARM_ENABLE = checked ? '1' : '0';
    }

    get checked_level0(): boolean {
        return Number(this.operatorNotifyData.NOTI_SENSOR_ALARM_LEVEL) > 0;
    }

    set checked_level0(checked: boolean) {
        this.operatorNotifyData.NOTI_SENSOR_ALARM_LEVEL = checked ? '1' : '0';
    }

    get checked_level1(): boolean {
        return Number(this.operatorNotifyData.NOTI_SENSOR_ALARM_LEVEL) > 1;
    }

    set checked_level1(checked: boolean) {
        this.operatorNotifyData.NOTI_SENSOR_ALARM_LEVEL = checked ? '2' : '1';
    }

    get checked_level2(): boolean {
        return Number(this.operatorNotifyData.NOTI_SENSOR_ALARM_LEVEL) > 2;
    }

    set checked_level2(checked: boolean) {
        this.operatorNotifyData.NOTI_SENSOR_ALARM_LEVEL = checked ? '3' : '2';
    }

    get checked_level3(): boolean {
        return Number(this.operatorNotifyData.NOTI_SENSOR_ALARM_LEVEL) > 3;
    }

    set checked_level3(checked: boolean) {
        this.operatorNotifyData.NOTI_SENSOR_ALARM_LEVEL = checked ? '4' : '3';
    }

    get totally_monday(): boolean {
        return (
            this.operatorNotifyData.NOTI_HOUR_MON.split('').filter(
                (noti: string) => noti === 'Y'
            ).length === 24
        );
    }

    set totally_monday(flag: boolean) {
        this.operatorNotifyData.NOTI_HOUR_MON = flag
            ? 'YYYYYYYYYYYYYYYYYYYYYYYY'
            : 'NNNNNNNNNNNNNNNNNNNNNNNN';
    }

    get notification_monday(): Array<number> {
        const monday: Array<number> = [];
        for (const [index, value] of Object.entries(
            this.operatorNotifyData.NOTI_HOUR_MON.split('')
        )) {
            if (value === 'Y') monday.push(Number(index));
        }

        return monday;
    }

    set notification_monday(list: Array<number>) {
        let noti_string = 'NNNNNNNNNNNNNNNNNNNNNNNN';

        list.forEach((idx: number) => {
            noti_string = this.replaceAt(noti_string, idx, 'Y');
        });

        this.operatorNotifyData.NOTI_HOUR_MON = noti_string;
    }

    get totally_tuesday(): boolean {
        return (
            this.operatorNotifyData.NOTI_HOUR_TUE.split('').filter(
                (noti: string) => noti === 'Y'
            ).length === 24
        );
    }

    set totally_tuesday(flag: boolean) {
        this.operatorNotifyData.NOTI_HOUR_TUE = flag
            ? 'YYYYYYYYYYYYYYYYYYYYYYYY'
            : 'NNNNNNNNNNNNNNNNNNNNNNNN';
    }

    get notification_tuesday(): Array<number> {
        const monday: Array<number> = [];
        for (const [index, value] of Object.entries(
            this.operatorNotifyData.NOTI_HOUR_TUE.split('')
        )) {
            if (value === 'Y') monday.push(Number(index));
        }

        return monday;
    }

    set notification_tuesday(list: Array<number>) {
        let noti_string = 'NNNNNNNNNNNNNNNNNNNNNNNN';

        list.forEach((idx: number) => {
            noti_string = this.replaceAt(noti_string, idx, 'Y');
        });

        this.operatorNotifyData.NOTI_HOUR_TUE = noti_string;
    }

    get totally_wednesday(): boolean {
        return (
            this.operatorNotifyData.NOTI_HOUR_WED.split('').filter(
                (noti: string) => noti === 'Y'
            ).length === 24
        );
    }

    set totally_wednesday(flag: boolean) {
        this.operatorNotifyData.NOTI_HOUR_WED = flag
            ? 'YYYYYYYYYYYYYYYYYYYYYYYY'
            : 'NNNNNNNNNNNNNNNNNNNNNNNN';
    }

    get notification_wednesday(): Array<number> {
        const monday: Array<number> = [];
        for (const [index, value] of Object.entries(
            this.operatorNotifyData.NOTI_HOUR_WED.split('')
        )) {
            if (value === 'Y') monday.push(Number(index));
        }

        return monday;
    }

    set notification_wednesday(list: Array<number>) {
        let noti_string = 'NNNNNNNNNNNNNNNNNNNNNNNN';

        list.forEach((idx: number) => {
            noti_string = this.replaceAt(noti_string, idx, 'Y');
        });

        this.operatorNotifyData.NOTI_HOUR_WED = noti_string;
    }

    get totally_thursday(): boolean {
        return (
            this.operatorNotifyData.NOTI_HOUR_THU.split('').filter(
                (noti: string) => noti === 'Y'
            ).length === 24
        );
    }

    set totally_thursday(flag: boolean) {
        this.operatorNotifyData.NOTI_HOUR_THU = flag
            ? 'YYYYYYYYYYYYYYYYYYYYYYYY'
            : 'NNNNNNNNNNNNNNNNNNNNNNNN';
    }

    get notification_thursday(): Array<number> {
        const monday: Array<number> = [];
        for (const [index, value] of Object.entries(
            this.operatorNotifyData.NOTI_HOUR_THU.split('')
        )) {
            if (value === 'Y') monday.push(Number(index));
        }

        return monday;
    }

    set notification_thursday(list: Array<number>) {
        let noti_string = 'NNNNNNNNNNNNNNNNNNNNNNNN';

        list.forEach((idx: number) => {
            noti_string = this.replaceAt(noti_string, idx, 'Y');
        });

        this.operatorNotifyData.NOTI_HOUR_THU = noti_string;
    }

    get totally_friday(): boolean {
        return (
            this.operatorNotifyData.NOTI_HOUR_FRI.split('').filter(
                (noti: string) => noti === 'Y'
            ).length === 24
        );
    }

    set totally_friday(flag: boolean) {
        this.operatorNotifyData.NOTI_HOUR_FRI = flag
            ? 'YYYYYYYYYYYYYYYYYYYYYYYY'
            : 'NNNNNNNNNNNNNNNNNNNNNNNN';
    }

    get notification_friday(): Array<number> {
        const monday: Array<number> = [];
        for (const [index, value] of Object.entries(
            this.operatorNotifyData.NOTI_HOUR_FRI.split('')
        )) {
            if (value === 'Y') monday.push(Number(index));
        }

        return monday;
    }

    set notification_friday(list: Array<number>) {
        let noti_string = 'NNNNNNNNNNNNNNNNNNNNNNNN';

        list.forEach((idx: number) => {
            noti_string = this.replaceAt(noti_string, idx, 'Y');
        });

        this.operatorNotifyData.NOTI_HOUR_FRI = noti_string;
    }

    get totally_saturday(): boolean {
        return (
            this.operatorNotifyData.NOTI_HOUR_SAT.split('').filter(
                (noti: string) => noti === 'Y'
            ).length === 24
        );
    }

    set totally_saturday(flag: boolean) {
        this.operatorNotifyData.NOTI_HOUR_SAT = flag
            ? 'YYYYYYYYYYYYYYYYYYYYYYYY'
            : 'NNNNNNNNNNNNNNNNNNNNNNNN';
    }

    get notification_saturday(): Array<number> {
        const monday: Array<number> = [];
        for (const [index, value] of Object.entries(
            this.operatorNotifyData.NOTI_HOUR_SAT.split('')
        )) {
            if (value === 'Y') monday.push(Number(index));
        }

        return monday;
    }

    set notification_saturday(list: Array<number>) {
        let noti_string = 'NNNNNNNNNNNNNNNNNNNNNNNN';

        list.forEach((idx: number) => {
            noti_string = this.replaceAt(noti_string, idx, 'Y');
        });

        this.operatorNotifyData.NOTI_HOUR_SAT = noti_string;
    }

    get totally_sunday(): boolean {
        return (
            this.operatorNotifyData.NOTI_HOUR_SUN.split('').filter(
                (noti: string) => noti === 'Y'
            ).length === 24
        );
    }

    set totally_sunday(flag: boolean) {
        this.operatorNotifyData.NOTI_HOUR_SUN = flag
            ? 'YYYYYYYYYYYYYYYYYYYYYYYY'
            : 'NNNNNNNNNNNNNNNNNNNNNNNN';
    }

    get notification_sunday(): Array<number> {
        const monday: Array<number> = [];
        for (const [index, value] of Object.entries(
            this.operatorNotifyData.NOTI_HOUR_SUN.split('')
        )) {
            if (value === 'Y') monday.push(Number(index));
        }

        return monday;
    }

    set notification_sunday(list: Array<number>) {
        let noti_string = 'NNNNNNNNNNNNNNNNNNNNNNNN';

        list.forEach((idx: number) => {
            noti_string = this.replaceAt(noti_string, idx, 'Y');
        });

        this.operatorNotifyData.NOTI_HOUR_SUN = noti_string;
    }
}
</script>

<style lang="scss" scoped>
#i-operator-panel-notify::v-deep {
    .i-noti-totally {
        width: 5rem;
    }

    .p-selectbutton .p-button {
        font-size: 0.7rem;
    }

    .p-buttonset .p-button.p-highlight {
        border-left: 1px solid;
    }

    .i-allowed-level {
        width: max-content;
        opacity: 0.2;
    }

    .i-allowed-level:hover {
        opacity: 0.5;
    }

    .i-allowed-level.p-highlight {
        opacity: 1;
    }

    .i-allowed-level.p-highlight:hover {
        background: linear-gradient(
            rgba(196, 196, 196, 0.25),
            rgba(196, 196, 196, 0.25)
        );
    }

    .i-allowed-level.lvl0 {
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        margin-right: 2px;
    }

    .i-allowed-level.lvl0.p-highlight {
        color: var(--text-alert-color);
        background-color: var(--normal);
        border-color: var(--normal);
        text-shadow: 1px 1px 1px #333333;
    }

    .i-allowed-level.lvl1 {
        border-radius: 0px;
        margin-right: 2px;
    }

    .i-allowed-level.lvl1.p-highlight {
        color: var(--text-alert-warning-color);
        background-color: var(--warning);
        border-color: var(--warning);
        font-weight: bold;
    }

    .i-allowed-level.lvl2 {
        border-radius: 0px;
        margin-right: 2px;
    }

    .i-allowed-level.lvl2.p-highlight {
        color: var(--text-alert-color);
        background-color: var(--major);
        border-color: var(--major);
        text-shadow: 1px 1px 1px #333333;
    }

    .i-allowed-level.lvl3 {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
    }

    .i-allowed-level.lvl3.p-highlight {
        color: var(--text-alert-color);
        background-color: var(--critical);
        border-color: var(--critical);
        text-shadow: 1px 1px 1px #333333;
    }
}
</style>