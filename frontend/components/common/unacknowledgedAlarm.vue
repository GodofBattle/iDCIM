<template>
    <div id="i-unacknowledged-alarm">
        <audio
            preload="auto"
            id="i-alert-sound"
            type="audio/mp3"
            crossorigin="anonymous"
            :src="require('@/assets/sounds/ting.mp3').default"
            @canplay="onCanPlayAlert"
            @ended="onEndedAlert"
        />
        <Button
            class="p-button-secondary p-button-outlined"
            icon="pi pi-bell"
            :label="countOfAlert"
            @animationend="buttonAnimationEnd"
            @click="onClick"
            :class="{ 'i-occur-alert': isAlerting }"
        />
        <alert-dialog :visible.sync="showAlertList" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

interface Notification {
    [index: string]: string | number;
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
}

@Component<UnacknowledgedAlarm>({
    watch: {
        //by MJ 2023.04.11 - 고차장님 코드 해석: countOfAlart 변경 값 감지하며 값이 0이 아닌 경우(=미확인알람 有) occurAlert메소드를 호출하여 버튼 스타일 및 알람음이 울리도록 구현
        countOfAlert(count: string) {
            if (Number(count) !== 0) {
                this.occurAlert();
            }
        }
    }
})
export default class UnacknowledgedAlarm extends Vue {
    isBeeping = false;
    audioContext: AudioContext | undefined = undefined;
    showAlertList: boolean = false;
    isAlerting = false;

    mounted() {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => {
                this.audioContext = new AudioContext();
            })
            .catch((error) => {
                console.error(`Audio Permissions denied: ${error}`);
            });
    }

    get notifications(): Array<Notification> {
        return this.$store.getters['sessionStorage/NOTIFICATIONS'];
    }

    get countOfAlert(): string {
        const count =
            this.notifications.length > 999
                ? '999+'
                : this.notifications.length.toLocaleString();
        return count;
    }

    occurAlert() {
        const button = this.$el.querySelector('button');
        if (button) {
            button.classList.add('i-occur-alert');
            this.isAlerting = true;
        }

        const beep = this.$el.querySelector('audio');
        if (beep) {
            setTimeout(this.occurBeep, 0, beep);
        }
    }

    async occurBeep(sound_element: HTMLAudioElement) {
        try {
            if (!this.isBeeping) {
                this.isBeeping = true;
                // by shkoh 20230404: audio 태그는 Chrome의 보안정책(Autoplay 불가)으로 인하여 muted를 play 전에 설정을 해주어야 정상동작한다
                sound_element.muted = true;
                await sound_element.play();
                sound_element.muted = false;
            }
        } catch {
            this.isBeeping = false;
        }
    }

    onCanPlayAlert() {
        this.isBeeping = false;
    }

    onEndedAlert() {
        this.isBeeping = false;
    }

    //by MJ 2023.04.11 - 고차장님 코드 해석: 버튼 애니메이션이 끝났을때 호출되는 함수이며, ev 인자는 AnimationEvent 객체
    buttonAnimationEnd(ev: AnimationEvent) {
        (ev.target as HTMLButtonElement).classList.remove('i-occur-alert');

        //by MJ 2023.04.11 : false 처리 안하면 watch로 인해 복구알람삭제시에도 css가 작동하여 데이터도 속성도 false로 제거
        this.isAlerting = false;
    }

    onClick() {
        this.showAlertList = true;
    }
}
</script>

<style lang="scss" scoped>
#i-unacknowledged-alarm::v-deep {
    .i-occur-alert {
        animation-name: alert;
        animation-duration: 2s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
        font-weight: 800;
    }

    @keyframes alert {
        25% {
            background: var(--critical);
            text-shadow: 1px 1px 1px #333333;
        }

        50% {
            color: var(--text-alert-color);
            border-color: transparent;
        }

        75% {
            background: var(--critical);
            text-shadow: 1px 1px 1px #333333;
        }
    }
}
</style>
