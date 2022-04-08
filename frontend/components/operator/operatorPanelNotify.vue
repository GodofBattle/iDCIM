<template>
    <div id="i-operator-panel-notify" class="p-grid">
        <div class="p-col p-fluid p-input-filled">
            <div class="p-field">
                <label for="deliver">알림 허용 채널</label>
                <div class="p-d-flex">
                    <div class="p-field-checkbox p-mr-6">
                        <Checkbox
                            id="be-checked-sms"
                            v-model="checked_sms"
                            :binary="true"
                        ></Checkbox>
                        <label for="be-checked-sms">SMS</label>
                    </div>
                    <div class="p-field-checkbox">
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
            </div>

            <div class="p-field">
                <label for="allowedLevel">알림 허용 단계</label>
                <div class="p-d-flex" style="width: 25rem">
                    <!-- <SelectButton
                        class="i-allowedLevelButton"
                        v-model="notificationLevel"
                        :multiple="true"
                        :options="levelList"
                        data-key="value"
                        option-label="name"
                    >
                    </SelectButton> -->
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
    levelList = [
        { name: '정상', value: 0 },
        { name: '주의', value: 1 },
        { name: '경고', value: 2 },
        { name: '위험', value: 3 },
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
        console.info(data);

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
}
</script>

<style lang="scss" scoped>
#i-operator-panel-notify::v-deep {
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