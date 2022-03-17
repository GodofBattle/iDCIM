<template>
    <div>
        <h1>ADMIN INDEX PAGE</h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AdminHome>({
    layout: 'admin',
})
export default class AdminHome extends Vue {}
</script>