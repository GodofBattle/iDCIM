<template>
    <div class="p-chart">
        <canvas
            ref="canvas"
            :width="width"
            :height="height"
            @click="onCanvasClick($event)"
        />
    </div>
</template>

<script>
export default {
    props: {
        type: String,
        data: null,
        options: null,
        plugins: null,
        width: {
            type: [Number, String],
            default: 300
        },
        height: {
            type: [Number, String],
            default: 150
        }
    },
    chart: null,
    watch: {
        data: {
            deep: true,
            handler() {
                this.reinit();
            }
        },
        type() {
            this.reinit();
        },
        options() {
            this.reinit();
        }
    },
    mounted() {
        this.initChart();
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    },
    methods: {
        initChart() {
            import('chart.js/auto').then((module) => {
                if (this.chart) {
                    this.chart.destroy();
                    this.chart = null;
                }

                if (module && module.default) {
                    this.chart = new module.default(this.$refs.canvas, {
                        type: this.type,
                        data: this.data,
                        options: this.options,
                        plugins: this.plugins
                    });
                }

                this.$emit('loaded', this.chart);
            });
        },
        reinit() {
            this.initChart();
            this.resetZoom();
        },
        getCanvas() {
            return this.$canvas;
        },
        getChart() {
            return this.chart;
        },
        getBase64Image() {
            return this.chart.toBase64Image();
        },
        refresh() {
            if (this.chart) {
                this.chart.update();
            }
        },
        resetZoom() {
            if (this.chart && this.chart.isZoomedOrPanned()) {
                this.chart.resetZoom();
            }
        },
        generateLegend() {
            if (this.chart) {
                return this.chart.generateLegend();
            }
        },
        onCanvasClick(event) {
            if (this.chart) {
                const element = this.chart.getElementsAtEventForMode(
                    event,
                    'nearest',
                    { intersect: true },
                    false
                );
                const dataset = this.chart.getElementsAtEventForMode(
                    event,
                    'dataset',
                    { intersect: true },
                    false
                );

                if (element && element[0] && dataset) {
                    this.$emit('select', {
                        originalEvent: event,
                        element: element[0],
                        dataset
                    });
                }
            }
        }
    }
};
</script>
