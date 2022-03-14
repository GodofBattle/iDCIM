<template>
    <div id="settingTreeCard" v-show="loaded">
        <div class="p-d-flex p-px-2 p-mb-2">
            <div class="p-as-center p-pl-2 p-d-flex i-header-title">
                <div
                    v-if="is_viewing_checkbox"
                    class="p-field-checkbox p-mb-0 p-mr-2"
                >
                    <Checkbox
                        id="view-check-is"
                        :binary="true"
                        v-model="is_enable_tree"
                    />
                </div>
                <span>{{ treeTitle }}</span>
            </div>
            <div class="p-ml-auto p-d-flex">
                <div
                    v-if="is_viewing_alias"
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
                    @click="addNode"
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
                    :disabled="!is_enable_tree"
                    :selected-node-key.sync="selectionPositionTreeKey"
                    :selected-node.sync="selectionPositionInfo"
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
        <setting-position-tree-add-panel
            :visible.sync="showSettingPositionTreeAddPanel"
            :parent-key="selectedKey"
            :parent-name="selectedName"
            :new-order="childrenCountOfSelectedNode + 1"
            @tree-add="addPositionTree"
        >
        </setting-position-tree-add-panel>
        <setting-position-tree-edit-panel
            :visible.sync="showSettingPositionTreeEditPanel"
            :node-key="selectedKey"
            @tree-edit="editPositionTree"
        >
        </setting-position-tree-edit-panel>
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
    watch: {
        is_enable_tree(val) {
            switch (this.$props.mode) {
                case 1: {
                    this.$store.dispatch('sessionStorage/SETPOSITIONTREE', val);
                    if (val === false) {
                        this.$refs.settingPositionTreeRef.changeKey();
                    }
                    break;
                }
                case 2: {
                    this.$store.dispatch('sessionStorage/SETCUSTOMTREE', val);
                    break;
                }
                default: {
                    break;
                }
            }
        },
    },
})
export default class SettingTreePanel extends Vue {
    $refs!: {
        settingAssetTreeRef: any;
        settingPositionTreeRef: any;
    };

    isAlias: boolean = false;
    selectionAssetTreeKey: null | string = null;
    selectionAssetInfo: null | AssetTree = null;

    selectionPositionTreeKey: null | string = null;
    selectionPositionInfo: null | AssetTree = null;

    showSettingAssetTreeAddPanel: boolean = false;
    showSettingAssetTreeEditPanel: boolean = false;
    showSettingPositionTreeAddPanel: boolean = false;
    showSettingPositionTreeEditPanel: boolean = false;

    is_enable_tree: boolean = false;

    mounted() {
        this.is_enable_tree = this.getCustomTreeState();
    }

    addNode() {
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
            case 1: {
                this.showSettingPositionTreeAddPanel = true;
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
            case 1: {
                this.showSettingPositionTreeEditPanel = true;
                break;
            }
        }
    }

    addAssetTree(key: string) {
        this.$refs.settingAssetTreeRef.refresh(key);
    }

    addPositionTree(key: string) {
        this.$refs.settingPositionTreeRef.refresh(key);
    }

    editAssetTree(key: string) {
        this.$refs.settingAssetTreeRef.refresh();

        if (key !== this.selectionAssetTreeKey) {
            this.$refs.settingAssetTreeRef.changeKey(key);
        }
    }

    editPositionTree(key: string) {
        this.$refs.settingPositionTreeRef.refresh(key);
    }

    getCustomTreeState() {
        let is = false;

        if (this.loaded) {
            switch (this.$props.mode) {
                case 1: {
                    is = this.$store.state.sessionStorage.ui.is_pos_tree;
                    break;
                }
                case 2: {
                    is = this.$store.state.sessionStorage.ui.is_cus_tree;
                    break;
                }
            }
        }

        return is;
    }

    get loaded() {
        return this.$store.state.sessionStorage.status;
    }

    get is_viewing_checkbox() {
        return this.$props.mode === 1 || this.$props.mode === 2;
    }

    get is_viewing_alias() {
        return this.$props.mode === 0;
    }

    get isDisabledAddButton(): boolean {
        if (this.$props.mode === 0) {
            return this.selectionAssetTreeKey === null || this.isAssetCode;
        } else if (this.$props.mode === 1) {
            return this.selectionPositionTreeKey === null;
        } else {
            return true;
        }
    }

    get isDisabledEditButton(): boolean {
        if (this.$props.mode === 0) {
            return (
                this.selectionAssetInfo?.parent_key === null ||
                this.selectionAssetTreeKey === null
            );
        } else if (this.$props.mode === 1) {
            return (
                this.selectionPositionInfo?.type === 'SITE' ||
                this.selectionPositionTreeKey === null
            );
        } else {
            return true;
        }
    }

    get selectedName(): string {
        let _selected_name = '';

        switch (this.$props.mode) {
            case 0: {
                _selected_name =
                    this.selectionAssetInfo === null
                        ? ''
                        : this.selectionAssetInfo.name;
                break;
            }
            case 1: {
                _selected_name =
                    this.selectionPositionInfo === null
                        ? ''
                        : this.selectionPositionInfo.label;
                break;
            }
        }

        return _selected_name;
    }

    get selectedKey(): number | string {
        let _selected_key: number | string = 0;

        switch (this.$props.mode) {
            case 0: {
                if (this.selectionAssetTreeKey) {
                    const [type, id] = this.selectionAssetTreeKey.split('_');
                    _selected_key = id;
                }
                break;
            }
            case 1: {
                if (this.selectionPositionTreeKey) {
                    const [type, id] = this.selectionPositionTreeKey.split('_');
                    _selected_key = Number(id);
                }
                break;
            }
        }

        return _selected_key;
    }

    get childrenCountOfSelectedNode(): number {
        let _count_childerens = -1;

        switch (this.$props.mode) {
            case 0: {
                if (this.selectionAssetInfo) {
                    _count_childerens =
                        this.selectionAssetInfo.children?.length;
                }
                break;
            }
            case 1: {
                if (this.selectionPositionInfo) {
                    _count_childerens =
                        this.selectionPositionInfo.children?.length;
                }
                break;
            }
        }

        return _count_childerens;
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
