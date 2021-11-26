<template>
    <div id="icomer-threshold">
        <icomer-toolbar class="p-px-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-threshold-content">
            <div class="p-col-2">
                <threshold-tree @select="onSelectTreeNode"></threshold-tree>
            </div>
            <div class="p-col-10">
                <div v-if="code">
                    <predefine-threshold-panel
                        :sensor-code="code"
                        :sensor-code-name="name"
                        :sensor-type="type"
                        :sensor-unit="unit"
                    >
                    </predefine-threshold-panel>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerThreshold>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '임계치 사전설정'
        }
    }
})
export default class IcomerThreshold extends Vue {
    code: string | null = null;
    name: string | null = null;
    type: string | null = null;
    unit: string | null = null;

    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.$props.title}`
        };
    }

    onSelectTreeNode({ code = '', name = '', type = 'A', unit = '' }) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.unit = unit;
    }
}
</script>

<style lang="scss" scoped>
#icomer-threshold::v-deep {
    .i-threshold-content {
        height: calc(100vh - var(--header-height));
        padding-top: 20px;
    }
}
</style>
