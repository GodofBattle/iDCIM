<template>
    <div>
        <Tree :value="nodes" :filter="true" selection-mode="single">
            <template #addManufacturer>
                <Button
                    class="p-button-secondary"
                    label="[제조사] 추가"
                    icon="pi pi-plus"
                    @click="addManufacturer"
                ></Button>
            </template>
            <template #addProduct>
                <Button
                    class="p-button-secondary p-button-sm"
                    label="[제품] 추가"
                    icon="pi pi-plus"
                ></Button>
            </template>
        </Tree>
        <manufacturer-add-panel
            :visible-add-manufacturer-dialog.sync="showAddManufacturerDialog"
        ></manufacturer-add-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data() {
        return {
            nodes: [] as Array<Object>,
            addManufacturerNodeType: {
                type: 'addManufacturer',
                selectable: false,
            },
            addProductNodeType: { type: 'addProduct', selectable: false },
            showAddManufacturerDialog: false,
        };
    },
    mounted() {
        this.addManufacturerButton();
    },
    methods: {
        addManufacturerButton() {
            this.nodes.push(this.addManufacturerNodeType);
        },
        addManufacturer() {
            this.showAddManufacturerDialog = true;
        },
    },
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
