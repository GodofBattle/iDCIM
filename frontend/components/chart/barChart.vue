<template>
    <i-chart
        type="bar"
        :data="data"
        :width="width"
        :height="height"
        :options="options"
        @select="onChartSelect"
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
                suggestedMin: this.suggestMinMax.min,
                suggestedMax: this.suggestMinMax.max,
                time: {
                    unit: 'month',
                    displayFormats: {
                        year: 'yyyy년',
                        quater: 'yyyy년 MM월',
                        month: 'yyyy년 MM월',
                        week: 'yyyy년 MM월'
                    },
                    tooltipFormat: 'yyyy년 MM월',
                    stepSize: 1
                },
                ticks: {
                    color: this.fontColor,
                    autoSkip: true,
                    autoSkipPadding: 50,
                    maxRotation: 0
                },
                grid: {
                    borderColor: this.borderColor,
                    display: false
                }
            },
            yAxis: {
                type: 'linear',
                grace: '10%',
                ticks: {
                    precision: 0
                },
                grid: {
                    display: false,
                    drawBorder: false
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
                    wheel: {
                        enabled: true
                    },
                    mode: 'x'
                },
                limits: {
                    xAxis: {
                        min: this.zoomMinMax.min,
                        max: this.zoomMinMax.max,
                        minRange: 1000 * 60 * 60 * 24 * 182
                    }
                }
            }
        }
    };

    get suggestMinMax(): any {
        const now = new Date();
        const year = now.getFullYear();

        const _min = now.setFullYear(year, 0, 1);
        const _max = now.setFullYear(year + 1, 0, 1);

        return {
            min: _min,
            max: _max
        };
    }

    get zoomMinMax(): any {
        const now = new Date();
        const year = now.getFullYear();

        const _min = new Date('2010-01-01');
        const _max = now.setFullYear(year, 11, 31);

        return {
            min: _min,
            max: _max
        };
    }

    onChartSelect({ element }: any) {
        const xy_data = element.element.$context.parsed;
        this.$emit('select', {
            x: new Date(xy_data.x),
            y: xy_data.y
        });
    }
}
</script>
