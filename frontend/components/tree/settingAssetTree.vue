<template>
    <div id="setting-asset-tree">
        <TreeTable :value="assets">
            <Column field="label" header="Name" :expander="true">
                <template #body="slotProps">
                    {{ slotProps.node.label }}
                </template>
            </Column>
            <Column field="type" header="TYPE"></Column>
        </TreeTable>
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

    lable(_val: any): string {
        console.info(_val);
        return 'test';
    }
}
</script>

<style lang="scss" scoped>
#setting-asset-tree::v-deep {
    .p-tree-container {
        height: calc(100vh - 20px - var(--header-height) - 30px - 26px - 16px);
    }
}
</style>
