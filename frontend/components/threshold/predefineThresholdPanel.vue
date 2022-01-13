<template>
    <div v-if="sensorCode" id="predefineThresholdPanel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-cneter i-title p-text-bold">
                {{ sensorCodeName }}: {{ type }}
            </div>
        </div>
        <Divider />
        <ScrollPanel class="i-threshold-scrollpanel">
            <div class="p-grid p-px-2">
                <DataTable
                    :value="thresholdList"
                    :scrollable="true"
                    scroll-height="calc(100vh - 20px - var(--header-height) - 30px - 12px - 55px - 12px"
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
                                        p-field
                                        p-button-outlined
                                        p-button-secondary
                                    "
                                ></Button>
                                <Button
                                    icon="pi pi-plus"
                                    label="ADD"
                                    class="
                                        p-field
                                        p-button-outlined
                                        p-button-secondary
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
                                :level-codes="dbLevelCodes"
                                @copy="copyPredefineThreshold"
                                @save="savePredefineThreshold"
                                @delete="deletePredefineThreshold"
                            ></predefine-threshold-card>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </ScrollPanel>
    </div>
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
        },
        dbLevelCodes: {
            query: gql`
                query {
                    Codes(TYPE: "LEVEL") {
                        CODE
                        NAME
                        VALUE
                    }
                }
            `,
            update: ({ Codes }) => Codes
        }
    }
})
export default class PredefineThresholdPanel extends Vue {
    dbThresholdList: Array<ThresholdInfo> = [];
    thresholdList: Array<ThresholdInfo> = [];

    dbLevelCodes: Array<any> = [];

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

    copyPredefineThreshold(
        is_analog: boolean,
        id: number,
        threshold_copy_info: any
    ) {
        if (is_analog) {
            this.copyAiPredefineThreshold(id, threshold_copy_info);
        } else {
            this.copyDiPredeineThreshold(id, threshold_copy_info);
        }
    }

    copyAiPredefineThreshold(id: number, ai_threshold: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation (
                    $NAME: String
                    $HOLD_TIME: Int
                    $VALID_MIN: Float
                    $VALID_MAX: Float
                    $IS_VALID: Float
                    $POINT_N3: Float
                    $POINT_N2: Float
                    $POINT_N1: Float
                    $POINT_P1: Float
                    $POINT_P2: Float
                    $POINT_P3: Float
                ) {
                    CopyPredefineThresholdByAI(
                        SENSOR_CD: "${this.$props.sensorCode}"
                        NAME: $NAME
                        HOLD_TIME: $HOLD_TIME
                        VALID_MIN: $VALID_MIN
                        VALID_MAX: $VALID_MAX
                        IS_VALID: $IS_VALID
                        POINT_N3: $POINT_N3
                        POINT_N2: $POINT_N2
                        POINT_N1: $POINT_N1
                        POINT_P1: $POINT_P1
                        POINT_P2: $POINT_P2
                        POINT_P3: $POINT_P3
                    )
                }
            `,
                variables: ai_threshold
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: 'AI 임계치 복사 완료',
                    detail: `Analog ID: ${id} - ${ai_threshold.NAME} 복사 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: 'AI 임계치 복사 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    copyDiPredeineThreshold(id: number, di_threshold: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation (
                    $NAME: String
                    $HOLD_TIME: Int
                    $DI: [DigitalValueInput!]
                ) {
                    CopyPredefineThresholdByDI(
                        SENSOR_CD: "${this.$props.sensorCode}"
                        NAME: $NAME
                        HOLD_TIME: $HOLD_TIME
                        DI: $DI
                    )
                }
            `,
                variables: di_threshold
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: 'DI 임계치 복사 완료',
                    detail: `Digital ID: ${id} - ${di_threshold.NAME} 복사 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: 'DI 임계치 복사 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    savePredefineThreshold(
        is_analog: boolean,
        name: string,
        threshold_info: any
    ) {
        if (is_analog) {
            this.saveAiPredefineThreshold(name, threshold_info);
        } else {
            this.saveDiPredefineThreshold(name, threshold_info);
        }
    }

    saveAiPredefineThreshold(name: string, ai_threshold: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: ID!
                        $NAME: String
                        $HOLD_TIME: Int
                        $VALID_MIN: Float
                        $VALID_MAX: Float
                        $IS_VALID: Float
                        $POINT_N3: Float
                        $POINT_N2: Float
                        $POINT_N1: Float
                        $POINT_P1: Float
                        $POINT_P2: Float
                        $POINT_P3: Float
                    ) {
                        UpdatePredefineThresholdByAI(
                            ID: $ID
                            NAME: $NAME
                            HOLD_TIME: $HOLD_TIME
                            VALID_MIN: $VALID_MIN
                            VALID_MAX: $VALID_MAX
                            IS_VALID: $IS_VALID
                            POINT_N3: $POINT_N3
                            POINT_N2: $POINT_N2
                            POINT_N1: $POINT_N1
                            POINT_P1: $POINT_P1
                            POINT_P2: $POINT_P2
                            POINT_P3: $POINT_P3
                        )
                    }
                `,
                variables: ai_threshold
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: 'AI 임계치 적용 완료',
                    detail: `Analog ID: ${ai_threshold.ID} - ${name} 적용 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: 'AI 임계치 적용 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    saveDiPredefineThreshold(name: string, di_threshold: any) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: ID!
                        $NAME: String
                        $HOLD_TIME: Int
                        $DI: [DigitalValueInput!]
                    ) {
                        UpdatePredefineThresholdByDI(
                            ID: $ID
                            NAME: $NAME
                            HOLD_TIME: $HOLD_TIME
                            DI: $DI
                        )
                    }
                `,
                variables: di_threshold
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: 'DI 임계치 적용 완료',
                    detail: `Digital ID: ${di_threshold.ID} - ${name} 적용 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: 'DI 임계치 적용 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    deletePredefineThreshold(is_analog: boolean, id: number, name: string) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: is_analog
                    ? gql`mutation { DeletePredefineThresholdByAI(ID: ${id}) }`
                    : gql`mutation { DeletePredefineThresholdByDI(ID: ${id}) }`
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: 'AI 임계치 삭제 완료',
                    detail: `Analog ID: ${id} - ${name} 삭제 완료`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: 'AI 임계치 삭제 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    refreshPredefineThreshold() {
        this.$apollo.queries.dbThresholdList.refresh();
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
    .i-title {
        font-size: 1.6rem;
        color: --var(--text-color);
        width: 20vw;
    }

    .i-threshold-scrollpanel {
        height: calc(100vh - 20px - var(--header-height) - 40px - 1rem);
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
