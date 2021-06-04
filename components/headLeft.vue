<template>
    <div class="p-d-flex p-flex-column i-head-left-main">
        <div class="p-mb-2"></div>
        <div class="p-mt-1 p-mb-1">
            <Divider></Divider>
        </div>
        <div class="p-mt-2 p-mb-2">
            <TieredMenu :model="items" style="width: 100%"></TieredMenu>
        </div>
        <div class="p-mt-auto">
            <Tag :value="nowTime" style="width: 100%"></Tag>
        </div>
    </div>
</template>

<script lang="ts">
import { setInterval, clearInterval } from 'timers';
import Vue from 'vue';

let timerId: NodeJS.Timeout;

export default Vue.extend({
    props: {
        items: Array,
    },
    data: () => {
        return {
            nowTime: new String('0000/00/00 00:00:00'),
        };
    },
    mounted() {
        timerId = setInterval(() => {
            this.updateTime();
        }, 1000);
    },
    beforeDestroy() {
        clearInterval(timerId);
    },
    methods: {
        updateTime() {
            const dt = new Date();

            this.nowTime = `${dt.getFullYear()}/${(
                '0' + (dt.getMonth() + 1).toString()
            ).slice(-2)}/${('0' + dt.getDate()).slice(-2)} ${(
                '0' + dt.getHours()
            ).slice(-2)}:${('0' + dt.getMinutes()).slice(-2)}:${(
                '0' + dt.getSeconds()
            ).slice(-2)}`;
        },
    },
});
</script>

<style lang="scss" scoped>
.i-head-left-main {
    height: 100%;
    padding: 1rem;
}
</style>
