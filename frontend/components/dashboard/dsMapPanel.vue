<template>
    <div id="ds-map-panel" class="p-p-1" :style="panelStyles">
        <ds-map-config-button class="i-speed-dial-panel" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<DsMapPanel>({
    props: {
        width: {
            type: String,
            default: '50vw'
        },
        height: {
            type: String,
            default: '40vh'
        }
    }
})
export default class DsMapPanel extends Vue {
    backgroundImage: any = null;

    get panelStyles(): Object {
        return {
            width: this.$props.width,
            height: this.$props.height
        };
    }
}
</script>

<style lang="scss" scoped>
#ds-map-panel::v-deep {
    & {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .i-speed-dial-panel {
        width: 100%;
        height: 100%;
    }
}
</style>
