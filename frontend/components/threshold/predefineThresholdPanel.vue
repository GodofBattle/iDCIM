<template>
    <div v-if="sensorCode" id="predefineThresholdPanel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-cneter i-title p-text-bold">
                {{ sensorCodeName }}: {{ type }}
            </div>
        </div>
        <Divider />

        <div class="i-threshold-scrollpanel p-grid p-px-2">
            <DataTable
                :value="thresholdList"
                :scrollable="true"
                scroll-height="flex"
                :row-hover="true"
                :table-style="{ width: '100%', height: '100%' }"
                data-key="ID"
            >
                <template #header>
                    <div class="i-table-header p-d-flex">
                        <div class="p-ml-auto">
                            <Button
                                icon="pi pi-save"
                                label="SAVE ALL"
                                class="p-field p-button-outlined p-button-secondary"
                                :disabled="applySaveAllButtonDisabled"
                                @click="saveAll"
                            ></Button>
                            <Button
                                icon="pi pi-plus"
                                label="ADD"
                                class="p-field p-button-outlined p-button-secondary"
                                @click="addThreshold"
                            ></Button>
                        </div>
                    </div>
                </template>
                <template #empty>
                    <div class="i-table-empty">
                        {{ sensorCodeName }}의 임계치를 추가하세요
                    </div>
                </template>
                <Column
                    key="ID"
                    :styles="{ 'flex-grow': 1, 'flex-basis': '100%' }"
                >
                    <template #body="slotProps">
                        <predefine-threshold-card
                            :id="slotProps.data.ID"
                            :ref="'threshold_' + slotProps.data.ID"
                            :type="type"
                            :unit="sensorUnit"
                            :name="slotProps.data.NAME"
                            :hold-time="slotProps.data.HOLD_TIME"
                            :level-codes="dbLevelCodes"
                            @change="changPredefineThreshold"
                            @copy="copyPredefineThreshold"
                            @save="savePredefineThreshold"
                            @delete="deletePredefineThreshold"
                        ></predefine-threshold-card>
                    </template>
                </Column>
            </DataTable>
        </div>
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

interface ChangedDataInfo {
    ID: number;
    IS_EDIT: boolean;
}

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

    changedThresholdList: Array<ChangedDataInfo> = [];

    dbLevelCodes: Array<any> = [];

    applySaveAllButtonDisabled: boolean = true;

    reset() {
        this.thresholdList.splice(0, this.thresholdList.length);
        this.changedThresholdList.splice(0, this.changedThresholdList.length);
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

    saveAll() {
        const editable_list = this.thresholdList
            .map((threshold: ThresholdInfo) => {
                const threshold_card_ref: any =
                    this.$refs[`threshold_${threshold.ID}`];

                if (
                    !threshold_card_ref.saveButtonDisabled &&
                    !threshold_card_ref.checkThresholdDI
                ) {
                    return threshold_card_ref.changedThresholdData;
                }
            })
            .filter((threshold) => threshold !== undefined);

        if (editable_list.length === 0) {
            return;
        }

        this.$props.sensorType === 'A'
            ? this.SaveAllPredefineThresholdByAI(editable_list)
            : this.SaveAllPredefineThresholdByDI(editable_list);
    }

    SaveAllPredefineThresholdByAI(threshold_list: any[]) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($Input: [PredefineThresholdAIInput!]) {
                        UpdatePredefineThresholdsByAI(Input: $Input)
                    }
                `,
                variables: {
                    Input: threshold_list
                }
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: '임계치 적용 완료',
                    detail: `${threshold_list.length}개의 ${this.$props.sensorCodeName} 임계치가 갱신되었습니다`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '임계치 적용 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    SaveAllPredefineThresholdByDI(threshold_list: any[]) {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation ($Input: [PredefineThresholdDIInput!]) {
                        UpdatePredefineThresholdsByDI(Input: $Input)
                    }
                `,
                variables: {
                    Input: threshold_list
                }
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: '임계치 적용 완료',
                    detail: `${threshold_list.length}개의 ${this.$props.sensorCodeName} 임계치가 갱신되었습니다`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '임계치 적용 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    addThreshold() {
        this.$props.sensorType === 'A'
            ? this.AddPredefineThresholdByAI()
            : this.AddPredefineThresholdByDI();
    }

    AddPredefineThresholdByAI() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddPredefineThresholdByAI(
                            SENSOR_CD: "${this.$props.sensorCode}"
                            NAME: "새로운 ${this.$props.sensorCodeName} 임계치"
                            HOLD_TIME: 0
                            VALID_MIN: 0
                            VALID_MAX: 100
                            IS_VALID: 1
                            POINT_N3: 10
                            POINT_N2: 20
                            POINT_N1: 30
                            POINT_P1: 60
                            POINT_P2: 70
                            POINT_P3: 80
                        )
                    }
                    
                `
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: 'AI 임계치 추가 완료',
                    detail: `${this.$props.sensorCodeName} 추가`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: 'AI 임계치 추가 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    AddPredefineThresholdByDI() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        AddPredefineThresholdByDI(
                            SENSOR_CD: "${this.$props.sensorCode}"
                            NAME: "새로운 ${this.$props.sensorCodeName} 임계치"
                            HOLD_TIME: 0
                        )
                    }
                    
                `
            })
            .then(() => {
                this.refreshPredefineThreshold();

                this.$toast.add({
                    severity: 'info',
                    summary: 'DI 임계치 추가 완료',
                    detail: `${this.$props.sensorCodeName} 추가`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: 'DI 임계치 추가 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    changPredefineThreshold({ ID, IS_EDIT }: ChangedDataInfo) {
        const item = this.changedThresholdList.find(
            (t: ChangedDataInfo) => t.ID === ID
        );
        if (item === undefined) {
            this.changedThresholdList.push({ ID, IS_EDIT });
        } else {
            item.IS_EDIT = IS_EDIT;
        }

        const is_changed = this.changedThresholdList.some(
            (t: ChangedDataInfo) => t.IS_EDIT === true
        );
        this.applySaveAllButtonDisabled = !is_changed;
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
        this.applySaveAllButtonDisabled = true;
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
