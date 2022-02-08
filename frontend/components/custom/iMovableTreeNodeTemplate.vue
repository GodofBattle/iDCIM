<template functional>
    <div v-if="props.template">{{ props.template({ node: props.node }) }}</div>
    <div v-else-if="props.node">{{ props.node.label }}</div>
</template>

<script>
export default {
    props: {
        node: {
            type: Object,
            default: null
        },
        template: {
            type: Object,
            default: null
        }
    }
};
</script>
