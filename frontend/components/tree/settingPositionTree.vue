<template>
    <div id="setting-position-tree"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<SettingPositionTree>({})
export default class SettingPositionTree extends Vue {}
</script>

<style lang="scss" scoped>
#setting-position-tree::v-deep {
    .p-tree {
        border: node;
    }

    .p-tree-container {
        height: calc(
            100vh - 16px - 28px - var(--header-height) - 30px - 29px - 2rem
        );

        margin: 0 0.3rem;
    }
}
</style>