<template>
    <div id="icomer-account">
        <icomer-toolbar class="p-px-2" :title="title" />
        <div class="i-account-content p-d-flex">
            <div
                class="p-col-fixed"
                :style="{ width: 'var(--tree-width)', height: '100%' }"
            >
                <account-tree
                    :style="{ height: '100%' }"
                    @select="onSelectTreeNode"
                />
            </div>
            <div class="p-col">
                <manager-panel
                    v-if="viewType === 'MANAGER'"
                    :user-id="id"
                    @reset="reset"
                />
                <operator-group-panel
                    v-else-if="viewType === 'GROUP'"
                    :group-id="id"
                    @reset="reset"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerAccount>({
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '계정관리'
        }
    }
})
export default class IcomerAccount extends Vue {
    id: number = -1;
    viewType: string = '';

    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.$props.title}`
        };
    }

    onSelectTreeNode({ type = '', id = -1 }: { type: string; id: number }) {
        this.viewType = type;
        this.id = id;
    }

    reset() {
        this.viewType = '';
        this.id = -1;
    }
}
</script>

<style lang="scss" scoped>
#icomer-account::v-deep {
    .i-account-content {
        padding-top: 20px;
        height: calc(100vh - var(--header-height));
    }
}
</style>
