<template>
    <i-chart
        type="bar"
        :data="data"
        :width="width"
        :height="height"
        :options="options"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<BarChart>({
    props: {
        data: {
            type: Object,
            default: null
        },
        width: {
            type: [Number, String],
            default: 300
        },
        height: {
            type: [Number, String],
            default: 150
        }
    }
})
export default class BarChart extends Vue {
    fontColor: string = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color');

    borderColor: string = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--surface-border');

    options = {
        barPercentage: 0.5,
        color: this.fontColor,
        scales: {
            xAxis: {
                type: 'time',
                ticks: {
                    color: this.fontColor
                },
                grid: {
                    borderColor: this.borderColor
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end'
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x'
                },
                zoom: {
                    enabled: true,
                    mode: 'x'
                }
            }
        }
    };
}
</script>
