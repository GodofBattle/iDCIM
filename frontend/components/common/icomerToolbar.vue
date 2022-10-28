<template>
    <div id="i-toolbar">
        <Toolbar>
            <template #start>
                <Button
                    icon="pi pi-bars"
                    class="p-mr-3 p-button-text p-button-secondary"
                    @click="toggleSidebar"
                ></Button>
                <div class="i-title p-text-bold">{{ title }}</div>
            </template>
            <template #end>
                <AutoComplete
                    v-if="isOperator"
                    v-model="assetItem"
                    :suggestions="filteredAssetList"
                    field="NAME"
                    class="i-toolbar-search-input"
                    append-to="body"
                    placeholder="자산명으로 검색"
                    @complete="searchAsset($event)"
                >
                    <template #item="slotProps">
                        {{ slotProps.item.NAME }}
                    </template>
                </AutoComplete>
                <Button
                    v-if="isOperator"
                    icon="pi pi-search"
                    class="p-mx-2 p-button-sm p-button-secondary p-button-outlined"
                    @click="onClickSearchingAssetButton"
                />
                <Button
                    :label="userName"
                    class="p-button-link"
                    icon="pi pi-user"
                    @click="toggleUserSetting"
                />
            </template>
        </Toolbar>
        <i-overlay-panel
            ref="userSettingPanel"
            style="width: 200px"
            append-to="body"
        >
            <div class="p-fluid">
                <Button
                    label="사용자명 변경"
                    class="p-field p-button-outlined p-button-info p-mb-3"
                    icon="pi pi-user-edit"
                    @click="openInfoSettingDialog"
                />
                <Button
                    label="패스워드 변경"
                    class="p-field p-button-outlined p-button-info"
                    icon="pi pi-key"
                    @click="openPasswordSettingDialog"
                />
                <Divider />
                <Button
                    label="로그아웃"
                    class="p-field"
                    icon="pi pi-sign-out"
                    @click="logout"
                ></Button>
            </div>
        </i-overlay-panel>
        <user-setting-panel :visible-user-dialog.sync="showUserDialog" />
        <user-password-setting-panel :visible.sync="showUserPasswordDialog" />
        <i-overlay-panel
            ref="assetSearchingPanel"
            append-to="body"
            :style="{ width: '24vw', height: '40vh' }"
            @hide="onHideAssetSearchingPanel"
        >
            <div class="p-d-flex">
                <asset-tree
                    :style="{ width: '11vw', height: 'calc(40vh - 1.5rem)' }"
                    :has-tree-border="false"
                    @select="onSelectAssetTreeNode"
                />
                <asset-table
                    class="p-ml-2"
                    :show-add-button="false"
                    :style="{
                        width: '11vw',
                        height: 'calc(40vh - 2rem)',
                        'margin-top': '-2px'
                    }"
                    :tree-type="treeType"
                    :tree-keys="treeKeys"
                    @select="onSelectAsset"
                />
            </div>
        </i-overlay-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import IOverlayPanel from '../custom/iOverlayPanel.vue';
import Component from '@/plugins/nuxt-class-component';

interface Asset {
    [index: string]: number | string;
    ID: number;
    NAME: string;
}

@Component<IcomerToolBar>({
    props: {
        title: String,
        isOperator: {
            type: Boolean,
            default: false
        },
        assetList: {
            type: Array,
            default: () => {
                return [];
            }
        }
    }
})
export default class IcomerToolBar extends Vue {
    $refs!: {
        userSettingPanel: any;
        assetSearchingPanel: IOverlayPanel;
    };

    showUserDialog: boolean = false;
    showUserPasswordDialog: boolean = false;

    assetItem: string | Asset = '';
    filteredAssetList: null | Array<any> = null;

    treeType: string | null = null;
    treeKeys: Array<number | string> = [];

    get userName(): string {
        const _user_name = this.$store.state.sessionStorage.auth.user.name;
        return `${_user_name} 님`;
    }

    toggleSidebar() {
        this.$store.commit('sessionStorage/SIDEBARTOGGLE');
    }

    toggleUserSetting(event: PointerEvent) {
        this.$refs.userSettingPanel.toggle(event);
    }

    openInfoSettingDialog() {
        this.showUserDialog = true;
    }

    openPasswordSettingDialog() {
        this.showUserPasswordDialog = true;
    }

    logout() {
        this.$store.dispatch('sessionStorage/SIGNOUT').then(() => {
            this.$router.push({ name: 'login' });
        });
    }

    searchAsset({ query }: { query: 'string' }) {
        setTimeout(() => {
            if (!query.trim().length) {
                this.filteredAssetList = [...this.$props.assetList];
            } else {
                this.filteredAssetList = this.$props.assetList.filter(
                    (a: any) => {
                        return a.NAME.toLowerCase().includes(
                            query.toLowerCase()
                        );
                    }
                );
            }
        }, 250);
    }

    onClickSearchingAssetButton(event: PointerEvent) {
        if (typeof this.assetItem === 'string' && this.assetItem.length === 0) {
            // by shkoh 20221020: 자산명 검색 시, 어떠한 텍스트도 입력이 되지 않는 경우에는 트리에서 자산을 검색할 수 있도록 함
            this.$refs.assetSearchingPanel.toggle(event);
        } else if (
            typeof this.assetItem === 'string' &&
            this.assetItem.length > 0
        ) {
            // by shkoh 20221020: 자산명 검색 시, 자산의 텍스트가 입력이 된 경우에는 2가지 경우로 구분지어서 동작한다
            // by shkoh 20221020: 입력한 텍스트가 자산리스트에 있는 경우와 없는 경우로 구분짓느다
            // by shkoh 20221020: 자산리스트에 있는 경우에는 곧바로 해당 자산의 정보를 팝업하고, 없는 경우에는 "검색불가"로 알려준다
            const found_asset = this.$props.assetList.find(
                (a: Asset) => a.NAME === this.assetItem
            );

            if (found_asset && found_asset.ID) {
                this.$emit('showAsset', found_asset);
            } else {
                this.$toast.add({
                    severity: 'warn',
                    summary: '자산검색 불가',
                    detail: `"${this.assetItem}" 자산이 존재하지 않습니다`,
                    life: 2000
                });
            }
        } else if (typeof this.assetItem === 'object' && this.assetItem.ID) {
            // by shkoh 20221020: 검색한 자산이 존재하는 경우에는 해당 자산의 정보를 팝업한다
            this.$emit('showAsset', this.assetItem);
        }
    }

    onSelectAssetTreeNode({ type, treeKeys, selectedKey }: any) {
        this.treeType = type;
        this.treeKeys = treeKeys;
    }

    onSelectAsset(data: any) {
        this.$emit('showAsset', data);
        this.$refs.assetSearchingPanel.hide();
    }

    onHideAssetSearchingPanel() {
        this.treeType = null;
        this.treeKeys = [];
    }
}
</script>

<style lang="scss" scoped>
#i-toolbar::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 20vw;
    }

    .i-toolbar-search-input > .p-inputtext {
        width: 10vw;
    }
}
</style>
