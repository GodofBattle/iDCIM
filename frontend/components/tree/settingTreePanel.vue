<template>
    <div id="settingTreeCard">
        <div class="p-d-flex p-px-2 p-mb-2">
            <div class="p-as-center p-pl-2 p-d-flex i-header-title">
                <div v-if="viewCheck.is" class="p-field-checkbox p-mb-0 p-mr-2">
                    <Checkbox id="view-check-is" :binary="true" />
                </div>
                {{ treeTitle }}
            </div>
            <div class="p-ml-auto p-d-flex">
                <div
                    v-if="viewCheck.isAlias"
                    class="p-field-checkbox p-mb-0 p-mr-3"
                >
                    <Checkbox
                        id="view-check-alias"
                        :binary="true"
                        v-model="isAlias"
                    />
                    <label for="view-check-alias">별칭사용</label>
                </div>
                <Button
                    class="p-button-rounded p-button-text p-button-info"
                    icon="pi pi-pencil"
                    :disabled="isDisabledEditButton"
                    @click="editAssetNode"
                ></Button>
                <Button
                    class="p-button-rounded p-button-text p-button-primary"
                    icon="pi pi-plus"
                    :disabled="isDisabledAddButton"
                    @click="addAssetNode"
                ></Button>
            </div>
        </div>
        <div class="i-setting-tree-content p-px-2">
            <div v-if="mode === 0">
                <setting-asset-tree
                    ref="settingAssetTreeRef"
                    :is-alias="isAlias"
                    :selected-node-key.sync="selectionAssetTreeKey"
                    :selected-node.sync="selectionAssetInfo"
                ></setting-asset-tree>
            </div>
            <div v-else-if="mode === 1">
                <setting-position-tree
                    ref="settingPositionTreeRef"
                ></setting-position-tree>
            </div>
            <div v-else-if="mode === 2">
                <h1>CUSTOM</h1>
            </div>
        </div>
        <setting-asset-tree-add-panel
            :visible.sync="showSettingAssetTreeAddPanel"
            :parent-key="selectedKey"
            :parent-name="selectedName"
            :new-order="childrenCountOfSelectedNode + 1"
            @asset-add="addAssetTree"
        ></setting-asset-tree-add-panel>
        <setting-asset-tree-edit-panel
            :visible.sync="showSettingAssetTreeEditPanel"
            :node-key="selectedKey"
            :is-asset-code="isAssetCode"
            @asset-edit="editAssetTree"
        >
        </setting-asset-tree-edit-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

type AssetTree = {
    [index: string]: string | number | Array<AssetTree>;
    key: string;
    label: string;
    alias: string;
    name: string;
    order: number;
    parent_key: string;
    type: string;
    children: Array<AssetTree>;
};

@Component<SettingTreePanel>({
    props: {
        treeTitle: String,
        mode: Number,
    },
})
export default class SettingTreePanel extends Vue {
    $refs!: {
        settingAssetTreeRef: any;
    };
    // by shkoh 20220120: viewCheck는 3종류의 트리를 mode 형식에 따라서 구분짓기 위하여 구현된 기능
    // by shkoh 20220120: 향후에 기능 분리가 필요한 경우에는 사용할 필요가 없다
    viewCheck = {
        is: this.$props.mode !== 0,
        isAlias: this.$props.mode === 0,
    };

    isAlias: boolean = false;
    selectionAssetTreeKey: null | string = null;
    selectionAssetInfo: null | AssetTree = null;

    showSettingAssetTreeAddPanel: boolean = false;
    showSettingAssetTreeEditPanel: boolean = false;

    addAssetNode() {
        switch (this.$props.mode) {
            case 0: {
                if (this.isAssetCode) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: '자산트리 항목 추가 불가',
                        detail: '자산코드 하위단에는 트리항목을 추가할 수 없습니다',
                        life: 2000,
                    });
                    return;
                }

                this.showSettingAssetTreeAddPanel = true;
                break;
            }
        }
    }

    editAssetNode() {
        switch (this.$props.mode) {
            case 0: {
                this.showSettingAssetTreeEditPanel = true;
                break;
            }
        }
    }

    addAssetTree(key: string) {
        this.$refs.settingAssetTreeRef.refresh(key);
    }

    editAssetTree(key: string) {
        this.$refs.settingAssetTreeRef.refresh();

        if (key !== this.selectionAssetTreeKey) {
            this.$refs.settingAssetTreeRef.changeKey(key);
        }
    }

    get isDisabledAddButton(): boolean {
        if (this.$props.mode === 0) {
            return this.selectionAssetTreeKey === null || this.isAssetCode;
        } else {
            return true;
        }
    }

    get isDisabledEditButton(): boolean {
        if (this.$props.mode === 0) {
            return this.selectionAssetTreeKey === null;
        } else {
            return true;
        }
    }

    get selectedName(): string {
        return this.selectionAssetInfo === null
            ? ''
            : this.selectionAssetInfo.name;
    }

    get selectedKey(): number | string {
        if (this.selectionAssetTreeKey === null) return 0;

        const [type, id] = this.selectionAssetTreeKey.split('_');
        return id;
    }

    get childrenCountOfSelectedNode(): number {
        if (this.selectionAssetInfo === null) return -1;
        return this.selectionAssetInfo.children.length;
    }

    get isAssetCode(): boolean {
        if (this.selectionAssetTreeKey === null) return false;

        const [type, id] = this.selectionAssetTreeKey.split('_');
        return type === 'pac';
    }

    get isAssetTree(): boolean {
        if (this.selectionAssetTreeKey === null) return false;

        const [type, id] = this.selectionAssetTreeKey.split('_');
        return type === 'pah';
    }
}
</script>

<style lang="scss" scoped>
#settingTreeCard::v-deep {
    .i-header-title {
        font-size: 1.3rem;
        font-weight: bold;
        line-height: 30px;
    }

    .p-card-header {
        padding: 8px 10px;
    }

    .p-card-content {
        padding: 0;
    }

    .p-panel .p-panel-content {
        padding: 0.8rem;
    }

    .i-setting-tree-content {
        width: 100%;
    }
}
</style>
