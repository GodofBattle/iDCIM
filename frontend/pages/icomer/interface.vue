<template>
    <div id="icomer-interface">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-interface-content">
            <div class="p-col-fixed" style="width: var(--tree-width)">
                <interface-tree
                    :style="{ height: '100%' }"
                    @select="onSelectTreeNode"
                ></interface-tree>
            </div>
            <div class="p-col">
                <div v-if="viewType === 'PredefineInterface'">
                    <interface-panel
                        :interface-id="id"
                        :interface-name.sync="name"
                        @reset="reset"
                    ></interface-panel>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerInterface>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '인터페이스'
        }
    }
})
export default class IcomerInterface extends Vue {
    id = -1;
    name = '';
    viewType = '';

    // by shkoh 20210928: Head Title 정의
    head() {
        return { title: `[iDCIM] 구축계정 - ${this.$props.title}` };
    }

    onSelectTreeNode({ type = '', id = -1, name = '' }) {
        this.id = id;
        this.name = name;
        this.viewType = type;
    }

    reset() {
        this.id = -1;
        this.name = '';
        this.viewType = '';
    }
}
</script>

<style lang="scss" scoped>
#icomer-interface::v-deep .i-interface-content {
    height: calc(100vh - var(--header-height));
    padding-top: 20px;
}
</style>
