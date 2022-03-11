<template>
    <div id="setting-position-tree" :disabled="disabled">
        <i-moveable-tree
            :value="positionTree"
            :filter="true"
            :moveable="true"
            :disabled="disabled"
            selectionMode="single"
            :expanded-keys.sync="treeExpandedKey"
            :addable-type="addableType"
            :moveable-type="moveableType"
        ></i-moveable-tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<SettingPositionTree>({
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    apollo: {
        positionTree: {
            query: gql`
                fragment positionTreeFields on AssetTree {
                    key
                    label
                    order
                    parent_key
                    type
                }

                query {
                    PositionTree {
                        ...positionTreeFields
                        children {
                            ...positionTreeFields
                            children {
                                ...positionTreeFields
                                children {
                                    ...positionTreeFields
                                    children {
                                        ...positionTreeFields
                                        children {
                                            ...positionTreeFields
                                            children {
                                                ...positionTreeFields
                                                children {
                                                    ...positionTreeFields
                                                    children {
                                                        ...positionTreeFields
                                                        children {
                                                            ...positionTreeFields
                                                        }
                                                    }
                                                }
                                            }
                                        }
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
            update({ PositionTree }) {
                return PositionTree;
            },
        },
    },
})
export default class SettingPositionTree extends Vue {
    positionTree: Array<any> = [];

    treeExpandedKey: any = { prh_0: true };
    addableType = { SITE: true, POSITION: true };
    moveableType = { POSITION: true };
}
</script>

<style lang="scss" scoped>
#setting-position-tree::v-deep {
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