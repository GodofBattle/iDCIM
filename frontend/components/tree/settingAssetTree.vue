<template>
    <div id="setting-asset-tree">
        <i-moveable-tree
            :value="assetTree"
            :filter="true"
            :moveable="true"
            :expanded-keys="treeExpandedKey"
            :addable-type="addableType"
            :moveable-type="moveableType"
            :only-moveable-same-type="true"
            @move-tree="moveAssetNode"
            @insert-tree="moveAssetNode"
        >
            <template #default="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-folder-open p-p-1 p-mr-1"
                        style="font-size: 1.2rem"
                    ></i>
                    <div class="p-p-1">
                        {{ slotProps.node.label }}
                    </div>
                </div>
            </template>
            <template #AssetCode="slotProps">
                <div class="p-d-flex">
                    <i
                        class="pi pi-desktop p-p-1 p-mr-1"
                        style="font-size: 1.2rem; color: var(--primary-color)"
                    ></i>
                    <div class="p-p-1" style="color: var(--primary-color)">
                        {{ slotProps.node.label }} |
                        {{ slotProps.node.key.split('_')[1] }}
                    </div>
                </div>
            </template>
        </i-moveable-tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<SettingAssetTree>({
    apollo: {
        assetTree: {
            query: gql`
                fragment assetTreeFields on AssetTree {
                    key
                    label
                    alias
                    order
                    parent_key
                    type
                }

                query {
                    AssetTree {
                        ...assetTreeFields
                        children {
                            ...assetTreeFields
                            children {
                                ...assetTreeFields
                                children {
                                    ...assetTreeFields
                                    children {
                                        ...assetTreeFields
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            fetchResults: true,
            fetchPolicy: 'no-cache',
            manual: false,
            prefetch: false,
            update({ AssetTree }) {
                return AssetTree;
            },
        },
    },
})
export default class SettingAssetTree extends Vue {
    assetTree: Array<any> = [];
    checkedTree: any = null;
    treeExpandedKey = { pah_1: true };
    addableType = { AssetHier: true };
    moveableType = { AssetHier: true, AssetCode: false };

    // moveAssetNode(target: any, dest: any) {
    //     console.info(
    //         `${target.key} :: ${target.parent_key} || ${target.order}`
    //     );

    //     console.info(`${dest.key} :: ${dest.parent_key} || ${dest.order}`);

    //     // this.$nuxt.$loading.start();

    //     // this.$apollo
    //     //     .mutate({
    //     //         mutation: gql`
    //     //             mutation {
    //     //                 InsertAssetTreeNode(
    //     //                     key: "${target.key}"
    //     //                     parent_key: "${target.parent_key}"
    //     //                     order: ${target.order}
    //     //                 )
    //     //             }
    //     //         `,
    //     //     })
    //     //     .then(() => {
    //     //         this.$toast.add({
    //     //             severity: 'info',
    //     //             summary: '자산트리 이동 완료',
    //     //             detail: `${dest.label} >> ${target.label}`,
    //     //             life: 1800,
    //     //         });
    //     //     })
    //     //     .catch((error) => {
    //     //         console.error(error);

    //     //         this.$toast.add({
    //     //             severity: 'error',
    //     //             summary: '자산트리 이동 실패',
    //     //             detail: error.message,
    //     //             life: 2000,
    //     //         });
    //     //     })
    //     //     .finally(() => {
    //     //         this.$nuxt.$loading.finish();
    //     //     });
    // }

    moveAssetNode(target: any, dest: any) {
        console.info(
            `${target.key} :: ${target.parent_key} || ${target.order}`
        );

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        MoveAssetTreeNode(
                            key: "${target.key}"
                            parent_key: "${target.parent_key}"
                            order: ${target.order}
                        )
                    }
                `,
            })
            .then(() => {
                this.$toast.add({
                    severity: 'info',
                    summary: '자산트리 안으로 이동 완료',
                    detail: `${dest.label} >> ${target.label}`,
                    life: 1800,
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산트리 안으롤 이동 실패',
                    detail: error.message,
                    life: 2000,
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
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
