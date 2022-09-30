<template>
    <div id="admin-operator-group">
        <icomer-toolbar class="p-px-2" :title="title" />
        <div class="p-d-flex i-operator-group-content">
            <div class="p-col-fixed" :style="{ width: 'var(--tree-width)' }">
                <operator-group-tree :style="{ height: '100%' }" />
            </div>
            <div class="p-col"></div>
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
export default class AdminOperatorGroup extends Vue {}
</script>

<style lang="scss" scoped>
#admin-operator-group::v-deep {
    .i-operator-group-content {
        height: calc(100vh - var(--header-height));
        padding-top: 20px;
    }
}
</style>
