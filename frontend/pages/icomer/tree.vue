<template>
    <div id="icomer-tree">
        <icomer-toolbar class="p-px-2" :title="title"></icomer-toolbar>
        <div class="p-px-2 i-content">
            <div class="p-grid" style="margin: 0 -0.5rem">
                <div class="p-col-12 p-md-4">
                    <setting-tree-panel
                        tree-title="자산트리"
                        :mode="0"
                    ></setting-tree-panel>
                </div>
                <div class="p-col-12 p-md-4">
                    <setting-tree-panel
                        tree-title="위치트리"
                        :mode="1"
                    ></setting-tree-panel>
                </div>
                <div class="p-col-12 p-md-4">
                    <setting-tree-panel
                        tree-title="사용자트리"
                        :mode="2"
                    ></setting-tree-panel>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerTree>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '트리 설정'
        }
    }
})
export default class IcomerTree extends Vue {
    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.$props.title}`
        };
    }
}
</script>

<style lang="scss" scoped>
#icomer-tree::v-deep {
    .i-content {
        padding-top: 20px;
    }
}
</style>
