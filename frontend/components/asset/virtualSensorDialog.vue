<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{
            width: '50vw',
            height: '60vh',
            'padding-bottom': '1rem'
        }"
        :modal="true"
        append-to="body"
    >
        <template #header>
            <div id="i-virtual-sensor-dialog" class="p-d-flex p-ai-center">
                <div class="i-title">
                    {{ title }}
                </div>
                <small class="p-ml-3 i-sub-title"> 계산식 설정 </small>
            </div>
        </template>

        <div>
            <h1>가상센서 설정!!</h1>
        </div>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<VirtualSensorDialog>({
    props: {
        visible: Boolean,
        assetName: String,
        initSensor: {
            type: Object,
            default: null
        }
    }
})
export default class VirtualSensorDialog extends Vue {
    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(is_show: boolean) {
        this.$emit('update:visible', is_show);
    }

    get title(): string {
        return `[${this.$props.assetName}] ${this.$props.initSensor.NAME}`;
    }
}
</script>

<style lang="scss" scoped>
#i-virtual-sensor-dialog {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: auto;
    }

    .i-sub-title {
        font-weight: normal;
    }
}
</style>