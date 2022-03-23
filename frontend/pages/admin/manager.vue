<template>
    <div id="admin-manager">
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <div class="p-d-flex i-manager-content">
            <div class="p-col-fixed" style="width: var(--tree-width)">
                <manager-tree></manager-tree>
            </div>
            <div class="p-col"></div>
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
            default: '자산 담당자',
        },
    },
})
export default class AdminManager extends Vue {
    head() {
        return { title: `iDCIM - ${this.$props.title}` };
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