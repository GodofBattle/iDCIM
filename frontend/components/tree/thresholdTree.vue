<template>
    <div id="threshold-tree">
        <Tree
            :value="predefineSensors"
            :filter="true"
            selection-mode="single"
            @node-select="onSelect"
        >
            <template #default="slotProps">
                <div class="p-d-flex">
                    <i
                        v-if="slotProps.node.TYPE === 'A'"
                        class="pi pi-chart-line p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <i
                        v-else-if="slotProps.node.TYPE === 'D'"
                        class="pi pi-chart-bar p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{ slotProps.node.label }}
                    </div>
                </div>
            </template>
        </Tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<ThresholdTree>({
    apollo: {
        predefineSensors: {
            query: gql`
                query {
                    SensorCodes {
                        ID
                        CODE
                        NAME
                        TYPE
                        UNIT
                        key: CODE
                        label: NAME
                    }
                }
            `,
            fetchPolicy: 'cache-and-network',
            prefetch: false,
            update: ({ SensorCodes }) => SensorCodes
        }
    }
})
export default class ThresholdTree extends Vue {
    predefineSensors: Array<any> = [];

    onSelect(node: any): void {
        this.$emit('select', {
            code: node.CODE,
            name: node.NAME,
            type: node.TYPE,
            unit: node.UNIT
        });
    }
}
</script>

<style lang="scss" scoped>
#threshold-tree::v-deep {
    .p-tree-container {
        height: calc(
            100vh - 20px - var(--header-height) - var(--tree-searching-height) -
                var(--content-padding) * 3
        );
    }
}
</style>
