<template>
    <div>
        <h1
            class="p-m-0"
            style="font-size: 30rem; height: 100%; background-color: grey"
        >
            OPERATOR
        </h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<Operator>({
    layout: 'operator'
})
export default class Operator extends Vue {}
</script>
