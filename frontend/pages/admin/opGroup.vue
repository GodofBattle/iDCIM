<template>
    <div id="admin-operator-group">
        <icomer-toolbar class="p-px-2" :title="title" />
        <div class="p-d-flex i-operator-group-content">
            <div class="p-col-fixed" :style="{ width: 'var(--tree-width)' }">
                <operator-group-tree
                    :style="{ height: '100%' }"
                    @select="onSelectTreeNode"
                />
            </div>
            <div class="p-col">
                <operator-group-asset-panel
                    v-if="viewType === 'GROUP'"
                    :group-id="id"
                    @reset="reset"
                />
                <operator-account-panel
                    v-else-if="viewType === 'OPERATOR'"
                    :user-id="id"
                    :operator-group-name="opGroupName"
                    @reset="reset"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AdminOperatorGroup>({
    layout: 'admin',
    props: {
        title: {
            type: String,
            default: '운영그룹 / 운영자 계정관리'
        }
    }
})
export default class AdminOperatorGroup extends Vue {
    id: number = -1;
    viewType: string = '';
    opGroupName: string = '';

    head() {
        return {
            title: `[iDCIM] 관리자 - ${this.$props.title}`
        };
    }

    onSelectTreeNode({
        type,
        id,
        groupName
    }: {
        type: string;
        id: number;
        groupName: string;
    }) {
        this.viewType = type;
        this.id = id;
        this.opGroupName = groupName;
    }

    reset() {
        this.viewType = '';
        this.id = -1;
        this.opGroupName = '';
    }
}
</script>

<style lang="scss" scoped>
#admin-operator-group::v-deep {
    .i-operator-group-content {
        height: calc(100vh - var(--header-height));
        padding-top: 20px;
    }
}
</style>
