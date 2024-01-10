<template>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 1000 1000"
        enable-background="new 0 0 1000 1000"
        xml:space="preserve"
        :fill="fill"
    >
        <g>
            <path
                d="M189.4,533.3c86.2-84.8,190.1-127.2,311.7-127.2c121.6,0,224.9,42.4,309.6,127.2L723.1,623C662,561.8,587.6,531.3,500,531.3c-87.6,0-161.9,30.6-223.1,91.8L189.4,533.3z M366.6,712.7c36.1-36.1,80.6-54.2,133.4-54.2c52.8,0,97.3,18.1,133.4,54.2L500,846.1L366.6,712.7z M10,356.1c136.2-134.8,299.9-202.3,491-202.3c191.1,0,354.1,67.4,489,202.3l-89.7,89.7C789.1,336,655.7,281.1,500,281.1c-155.7,0-289.1,54.9-400.3,164.7L10,356.1z"
            />
        </g>
    </svg>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<SvgSensorOn>({})
export default class SvgSensorOn extends Vue {
    get fill(): string {
        const theme = this.$store.state.localStorage.theme;
        return theme === 'i-black' ? '#64b5f6 ' : '#4caf05'; // by Mj 2022.12.20 : primeVue 기본 색상으로 임시 변경
    }
}
</script>
