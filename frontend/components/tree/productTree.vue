<template>
    <Tree :value="nodes" :filter="true" selection-mode="single">
        <template #treeContainer>
            <div style="height: 70vh">h23h23jk4lh2l34</div>
        </template>
    </Tree>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data() {
        return {
            nodes: [] as Array<Object>
        };
    },
    mounted() {
        this.nodes = [
            { key: 'C0', label: '[제조사] 추가', data: 'add' },
            { key: 'C1', label: '[제조사] 추가', data: 'add' },
            { key: 'C2', label: '[제조사] 추가', data: 'add' },
            { key: 'C3', label: '[제조사] 추가', data: 'add' },
            { key: 'C4', label: '[제조사] 추가', data: 'add' },
            { key: 'C5', label: '[제조사] 추가', data: 'add' },
            { key: 'C6', label: '[제조사] 추가', data: 'add' },
            { key: 'C7', label: '[제조사] 추가', data: 'add' },
            { key: 'C8', label: '[제조사] 추가', data: 'add' },
            { key: 'C9', label: '[제조사] 추가', data: 'add' },
            { key: 'C10', label: '[제조사] 추가', data: 'add' },
            { key: 'C11', label: '[제조사] 추가', data: 'add' },
            { key: 'C12', label: '[제조사] 추가', data: 'add' },
            { key: 'C13', label: '[제조사] 추가', data: 'add' },
            { key: 'C14', label: '[제조사] 추가', data: 'add' },
            { key: 'C15', label: '[제조사] 추가', data: 'add' },
            { key: 'C16', label: '[제조사] 추가', data: 'add' },
            { key: 'C17', label: '[제조사] 추가', data: 'add' },
            { key: 'C18', label: '[제조사] 추가', data: 'add' },
            { key: 'C19', label: '[제조사] 추가', data: 'add' },
            { key: 'C20', label: '[제조사] 조사', data: 'add' },
            { key: 'C21', label: '[제조사] 추가', data: 'add' },
            { key: 'C22', label: '[제조사] 추가', data: 'add' },
            { key: 'C23', label: '[제조사] 추가', data: 'add' },
            { key: 'C24', label: '[제조사] 추가', data: 'add' },
            { key: 'C25', label: '[제조사] 추가', data: 'add' },
            { key: 'C26', label: '[제조사] 추가', data: 'add' },
            { key: 'C27', label: '[제조사] 추가', data: 'add' },
            { key: 'C28', label: '[제조사] 추가', data: 'add' },
            { key: 'C29', label: '[제조사] 추가', data: 'add' },
            { key: 'C30', label: '[제조사] 추가', data: 'add' },
            { key: 'C31', label: '[제조사] 추가', data: 'add' },
            { key: 'C32', label: '[제조사] 추가', data: 'add' },
            { key: 'C33', label: '[제조사] 추가', data: 'add' },
            { key: 'C34', label: '[제조사] 추가', data: 'add' },
            { key: 'C35', label: '[제조사] 추가', data: 'add' },
            { key: 'C36', label: '[제조사] 추가', data: 'add' },
            { key: 'C37', label: '[제조사] 추가', data: 'add' },
            { key: 'C38', label: '[제조사] 추가', data: 'add' },
            { key: 'C39', label: '[제조사] 추가', data: 'add' },
            { key: 'C40', label: '[제조사] 추가', data: 'add' },
            { key: 'C41', label: '[제조사] 추가', data: 'add' },
            { key: 'C42', label: '[제조사] 추가', data: 'add' },
            { key: 'C43', label: '[제조사] 추가', data: 'add' },
            { key: 'C44', label: '[제조사] 추가', data: 'add' },
            { key: 'C45', label: '[제조사] 추가', data: 'add' }
        ];
    }
});
</script>

<style lang="scss">
.p-tree-container {
    height: calc(
        100vh - 20px - var(--header-height) - var(--tree-searching-height) -
            var(--content-padding) * 3
    );
}
</style>
