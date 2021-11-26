<template>
    <ScrollPanel v-if="sensorCode" id="predefineThresholdPanel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-cneter i-title p-text-bold">
                {{ sensorCodeName }}: {{ type }}
            </div>
        </div>
        <Divider />
        <div class="p-grid p-px-2">
            <DataTable
                :value="thresholdList"
                :scrollable="true"
                scroll-height="calc(100vh - 20px - var(--header-height) - 30px - 12px -55px - 12px"
                :row-hover="true"
                data-key="ID"
            >
                <template #header>
                    <div class="i-table-header p-d-flex">
                        <div class="p-ml-auto">
                            <Button
                                icon="pi pi-save"
                                label="SAVE ALL"
                                class="
                                    p-field p-button-outlined p-button-secondary
                                "
                            ></Button>
                            <Button
                                icon="pi pi-plus"
                                label="ADD"
                                class="
                                    p-field p-button-outlined p-button-secondary
                                "
                            ></Button>
                        </div>
                    </div>
                </template>
                <template #empty>
                    <div class="i-table-empty">
                        {{ sensorCodeName }}의 임계치를 추가하세요
                    </div>
                </template>
                <Column key="ID">
                    <template #body="slotProps">
                        <predefine-threshold-card
                            :id="slotProps.data.ID"
                            :type="type"
                            :unit="sensorUnit"
                            :name="slotProps.data.NAME"
                            :hold-time="slotProps.data.HOLD_TIME"
                        ></predefine-threshold-card>
                    </template>
                </Column>
            </DataTable>
        </div>
    </ScrollPanel>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type ThresholdInfo = {
    [index: string]: string | number;
    ID: number;
    SENSOR_CD: string;
    NAME: string;
    HOLD_TIME: string;
};

@Component<PredefineThresholdPanel>({
    props: {
        sensorCode: String,
        sensorCodeName: String,
        sensorType: String,
        sensorUnit: String
    },
    apollo: {
        dbThresholdList: {
            query: gql`
                query PredefineThreshold($SENSOR_CD: String!) {
                    PredefineThresholdsByAI(SENSOR_CD: $SENSOR_CD) {
                        ID
                        SENSOR_CD
                        NAME
                        HOLD_TIME
                    }
                    PredefineThresholdsByDI(SENSOR_CD: $SENSOR_CD) {
                        ID
                        SENSOR_CD
                        NAME
                        HOLD_TIME
                    }
                }
            `,
            variables() {
                return {
                    SENSOR_CD: this.sensorCode ? this.sensorCode : ''
                };
            },
            prefetch: false,
            fetchPolicy: 'cache-and-network',
            deep: true,
            manual: true,
            result({ loading, data }) {
                if (!loading) {
                    const { PredefineThresholdsByAI, PredefineThresholdsByDI } =
                        data;

                    if (PredefineThresholdsByAI && PredefineThresholdsByDI) {
                        this.apolloFetch(
                            this.sensorType === 'A'
                                ? PredefineThresholdsByAI
                                : PredefineThresholdsByDI
                        );
                    }
                }
            }
        }
    }
})
export default class PredefineThresholdPanel extends Vue {
    dbThresholdList: Array<ThresholdInfo> = [];

    thresholdList: Array<ThresholdInfo> = [];

    reset() {
        this.thresholdList.splice(0, this.thresholdList.length);
    }

    apolloFetch(data: Array<ThresholdInfo>) {
        this.reset();

        this.$nextTick(() => {
            data.forEach((datum: ThresholdInfo) => {
                const threshold_info: ThresholdInfo = Object.create({
                    ID: datum.ID,
                    SENSOR_CD: datum.SENSOR_CD,
                    NAME: datum.NAME,
                    HOLD_TIME: datum.HOLD_TIME
                });

                this.thresholdList.push(threshold_info);
            });
        });
    }

    get type(): string {
        return this.$props.sensorType === 'A'
            ? 'Analog'
            : this.$props.sensorType === 'D'
            ? 'Digital'
            : 'Unknown';
    }
}
</script>

<style lang="scss" scoped>
#predefineThresholdPanel::v-deep {
    height: calc(100vh - 20px - var(--header-height));

    .i-title {
        font-size: 1.6rem;
        color: --var(--text-color);
        width: 20vw;
    }

    .i-table-empty {
        height: 10vh;
        line-height: 10vh;
        text-align: center;
        font-size: 1.2rem;
    }

    .p-datatable .p-datatable-thead > tr > th {
        padding: 0px;
        border: none;
    }

    .p-datatable .p-datatable-tbody > tr > td {
        border: none;
    }
}
</style>
