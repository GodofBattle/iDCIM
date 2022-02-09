<template>
    <div id="setting-asset-tree">
        <i-movable-tree
            :value="assets"
            :filter="true"
            selection-mode="multiple"
            :selection-keys.sync="checkedTree"
            :movable="true"
        >
            <template #default="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-inbox p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{ slotProps.node.label }}
                    </div>
                </div>
            </template>
        </i-movable-tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<SettingAssetTree>({
    apollo: {
        assets: {
            query: gql`
                query {
                    PredefinedInterfaces {
                        CODE
                        NAME
                        ALIAS
                        PD_ASSET_HIER_ID
                        ORDER
                        key: CODE
                        label: NAME
                        type: TYPE
                        children: PREDEFINED_INTERFACES {
                            ID
                            ASSET_CD
                            NAME
                            key: ID
                            label: NAME
                            type: TYPE
                        }
                    }
                }
            `,
            variables: {
                AssetSelectable: false
            },
            fetchResults: true,
            fetchPolicy: 'no-cache',
            manual: false,
            prefetch: false,
            update({ PredefinedInterfaces }) {
                return PredefinedInterfaces;
            }
        }
    }
})
export default class SettingAssetTree extends Vue {
    assets: Array<any> = [];
    checkedTree: any = null;

    label(_val: any): string {
        console.info(_val);
        return 'test';
    }
}
</script>

<style lang="scss" scoped>
#setting-asset-tree::v-deep {
    .p-tree {
        border: none;
    }

    .p-tree-container {
        height: calc(
            100vh - 16px - 28px - var(--header-height) - 30px - 29px - 2rem
        );

        margin: 0 0.3rem;
    }
}
</style>
