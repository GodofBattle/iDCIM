<template>
    <div id="admin-manager">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-manager-content">
            <div class="p-col-fixed" style="width: var(--tree-width)">
                <manager-tree
                    :style="{ height: 'calc(100% - 38px)' }"
                    @select="onSelectTreeNode"
                    @move="onMoveTreeNode"
                />
            </div>
            <div class="p-col">
                <div v-if="viewType === 'Company'">
                    <company-panel
                        :company-id="id"
                        @reset="reset"
                    ></company-panel>
                </div>
                <div v-else-if="viewType === 'Operator'">
                    <operator-panel
                        ref="operatorPanel"
                        :operator-id="id"
                        :operator-name="name"
                    ></operator-panel>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AdminManager>({
    layout: 'admin',
    props: {
        title: {
            type: String,
            default: '자산 관리책임자'
        }
    }
})
export default class AdminManager extends Vue {
    $refs!: {
        operatorPanel: any;
    };

    id: number = -1;
    name: string = '';
    viewType: string = '';

    head() {
        return { title: `iDCIM - ${this.$props.title}` };
    }

    onSelectTreeNode({ type = '', id = -1, name = '' }) {
        this.viewType = type;
        this.id = id;
        this.name = name;
    }

    onMoveTreeNode() {
        this.$refs.operatorPanel.operatorRefresh();
    }

    reset() {
        this.viewType = '';
        this.id = -1;
        this.name = '';
    }
}
</script>

<style lang="scss" scoped>
#admin-manager::v-deep {
    .i-manager-content {
        height: calc(100vh - var(--header-height));
        padding-top: 20px;
    }
}
</style>
