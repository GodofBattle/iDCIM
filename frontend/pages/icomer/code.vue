<template>
    <div>
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <ScrollPanel class="i-code-content">
            <DataView :value="codeType" layout="grid">
                <template #grid="slotProps">
                    <div class="p-col-12 p-md-3 p-p-2 i-panel-style">
                        <Panel :header="slotProps.data[0]" :toggleable="true">
                            <DataTable
                                class="p-datatable-sm"
                                :value="slotProps.data[1]"
                                data-key="CODE"
                                selection-mode="single"
                                :expanded-rows.sync="expandedRows"
                            >
                                <Column
                                    v-if="isExpander(slotProps.data[1])"
                                    field="REMARK"
                                    :expander="true"
                                    header-style="width: 2em;"
                                >
                                </Column>
                                <Column
                                    field="CODE"
                                    header="코드"
                                    header-style="width: 6em;"
                                >
                                </Column>
                                <Column
                                    field="NAME"
                                    header="명칭"
                                    header-style="width: 12em;"
                                ></Column>
                                <Column
                                    field="VALUE"
                                    header="값"
                                    header-style="width: 3em;"
                                ></Column>
                                <template #expansion="slotProps">
                                    <div
                                        class="p-text-italic p-text-right"
                                        style="font-size: 0.8rem"
                                    >
                                        {{ slotProps.data.REMARK }}
                                    </div>
                                </template>
                            </DataTable>
                        </Panel>
                    </div>
                </template>
            </DataView>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerCode>({
    apollo: {
        codes: {
            query: gql`
                query {
                    Codes {
                        TYPE
                        CODE
                        NAME
                        VALUE
                        REMARK
                    }
                }
            `,
            update: ({ Codes }) => {
                // by shkoh 20210730: API 서버로부터 전달받은 데이터를 Map 형태로 변환
                const code_group_by_type = Codes.reduce(
                    (entry: any, code: any) =>
                        entry.set(code.TYPE, [
                            ...(entry.get(code.TYPE) || []),
                            code
                        ]),
                    new Map()
                );

                return code_group_by_type;
            }
        }
    },
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '코드'
        }
    }
})
export default class IcomerCode extends Vue {
    codes = [];
    expandedRows = [];

    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.$props.title}`
        };
    }

    get codeType() {
        return Array.from(this.codes);
    }

    // by shkoh 20220117: code 데이터 중에서 REMARK에 CODE 설명이 존재하는 경우에는 리스트 안에 expansion 옵션을 추가함
    isExpander(data: any) {
        return data.some((datum: any) => !!datum.REMARK);
    }
}
</script>

<style lang="scss" scoped>
.i-code-content {
    height: calc(100vh - 71px);
    padding-top: 20px;
}

.p-datatable-row-expansion > td {
    border: none;
}
</style>
