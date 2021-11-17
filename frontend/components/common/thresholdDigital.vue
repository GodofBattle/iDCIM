<template>
    <div>
        <Tag
            v-for="dval of di"
            :key="dval.INDEX"
            :class="containerClass(dval.LEVEL)"
        >
            {{ dval.INDEX }}: {{ dval.LABEL }}
        </Tag>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component({
    props: {
        di: {
            type: Array,
            default: []
        }
    }
})
export default class ThresholdDigital extends Vue {
    containerClass(level: number): Array<string | object> {
        return [
            'p-mt-1',
            'p-mr-2',
            'p-mb-1',
            'p-px-3',
            'i-digital-tag',
            {
                'i-normal': level === 0,
                'i-warning': level === 1,
                'i-major': level === 2,
                'i-critical': level === 3
            }
        ];
    }
}
</script>

<style scoped>
.i-digital-tag {
    font-size: 1.25rem;
    line-height: 1.7;
}

.i-normal {
    background: var(--normal);
    color: var(--text-color);
}

.i-warning {
    background: var(--warning);
}

.i-major {
    background: var(--major);
    color: var(--text-color);
}

.i-critical {
    background: var(--critical);
    color: var(--text-color);
}
</style>
