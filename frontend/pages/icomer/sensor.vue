<template>
    <div>
        <icomer-toolbar class="p-pl-2 p-pr-2" :title="title"></icomer-toolbar>
        <ScrollPanel class="i-sensor-code-content">
            <DataTable :value="sensorCodes">
                <Column field="CODE" header="코드"></Column>
                <Column field="NAME" header="센서명"></Column>
                <Column field="TYPE" header="분류"></Column>
                <Column field="UNIT" header="단위"></Column>
                <Column field="IS_DISP_CONV" header="환산지수 사용"></Column>
            </DataTable>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';

export default Vue.extend({
    apollo: {
        sensorCodes: {
            query: gql`
                query {
                    SensorCodes {
                        CODE
                        NAME
                        TYPE
                        UNIT
                        IS_DISP_CONV
                    }
                }
            `,
            update: ({ SensorCodes }) => {
                return SensorCodes;
            }
        }
    },
    layout: 'icomer',
    props: {
        title: {
            type: String,
            default: '센서코드'
        }
    },
    data: () => {
        return {
            sensorCodes: []
        };
    },
    head() {
        return {
            title: `[iDCIM] 구축계정 - ${this.title}`
        };
    }
});
</script>

<style lang="scss" scoped>
.i-sensor-code-content {
    height: calc(100vh - 71px);
    padding-top: 20px;
}
</style>
