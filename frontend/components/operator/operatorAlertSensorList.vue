<template>
    <i-dialog
        :visible.sync="showDialog"
        :content-style="{ width: '25vw' }"
        :modal="true"
        :draggable="true"
        @show="onShow"
        @hide="onHide"
    >
        <template #header> {{ dialogHeader }} </template>

        <div v-if="dbOperatorNotifaction" class="p-fluid p-input-filled p-mt-2">
            <div class="p-field-checkbox">
                <Checkbox id="is_comm" v-model="is_comm" :binary="true" />
                <label for="is_comm">통신장애 알림여부</label>
            </div>
        </div>

        <sensor-list
            :interface-id="assetId"
            selection-mode="multiple"
            :selected-items="selectionItems"
            :style="{ width: 'calc(25vw - 3rem)', height: '50vh' }"
            :is-event-filter="true"
            @loaded="onLoadedSensorList"
            @row-select="onRowSelect"
            @row-unselect="onRowUnselect"
            @row-select-all="onRowSelectAll"
            @row-unselect-all="onRowUnselectAll"
        />

        <template #footer>
            <div class="p-fluid">
                <Button
                    label="적용"
                    icon="pi pi-check"
                    :style="{ width: '100%' }"
                    :disabled="applyButtonDisabled"
                    @click="applyButton"
                />
            </div>
        </template>
    </i-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface OpNotiAsset {
    [index: string]: number;
    OP_ID: number;
    ASSET_ID: number;
    IS_NOTI_COMM: number;
}

interface OpNotiExceptSensor {
    [index: string]: number;
    OP_ID: number;
    SENSOR_ID: number;
}

@Component<OperatorAlertSensorList>({
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        operatorId: {
            type: Number,
            default: null
        },
        assetId: {
            type: Number,
            default: null
        },
        assetName: {
            type: String,
            default: null
        }
    },
    apollo: {
        dbOperatorNotifaction: {
            query: gql`
                query ($OP_ID: Int!, $ASSET_ID: Int!) {
                    OperatorNotificationAsset(
                        OP_ID: $OP_ID
                        ASSET_ID: $ASSET_ID
                    ) {
                        OP_ID
                        ASSET_ID
                        IS_NOTI_COMM
                    }
                }
            `,
            skip() {
                return (
                    this.$props.operatorId === null ||
                    this.$props.operatorId < 0 ||
                    this.$props.assetId === null ||
                    this.$props.assetId < 0
                );
            },
            variables() {
                return {
                    OP_ID: this.$props.operatorId,
                    ASSET_ID: this.$props.assetId
                };
            },
            update: ({ OperatorNotificationAsset }) =>
                OperatorNotificationAsset,
            result({ loading, data }) {
                if (!loading) {
                    const { OperatorNotificationAsset } = data;

                    if (OperatorNotificationAsset) {
                        this.apolloFetchOpNotiAsset(OperatorNotificationAsset);
                    }
                }
            }
        },
        dbOperatorNotificationExceptSensors: {
            query: gql`
                query ($OP_ID: Int!) {
                    OperatorNotificationExceptSensors(OP_ID: $OP_ID) {
                        OP_ID
                        SENSOR_ID
                    }
                }
            `,
            skip() {
                return (
                    this.$props.operatorId === null ||
                    this.$props.operatorId < 0
                );
            },
            variables() {
                return {
                    OP_ID: this.$props.operatorId
                };
            },
            update: ({ OperatorNotificationExceptSensors }) =>
                OperatorNotificationExceptSensors,
            result({ loading, data }) {
                if (!loading) {
                    const { OperatorNotificationExceptSensors } = data;

                    if (OperatorNotificationExceptSensors) {
                        this.apolloFetch(OperatorNotificationExceptSensors);
                    }
                }
            }
        }
    }
})
export default class OperatorAlertSensorList extends Vue {
    dbOperatorNotifaction: OpNotiAsset | null = null;
    operatorNotifaction: OpNotiAsset = {
        OP_ID: -1,
        ASSET_ID: -1,
        IS_NOTI_COMM: -1
    };

    dbOperatorNotificationExceptSensors: Array<OpNotiExceptSensor> = [];
    operatorNotificationExceptSensors: Array<OpNotiExceptSensor> = [];

    selectionItems: Array<any> = [];

    onShow() {
        this.$apollo.queries.dbOperatorNotifaction.refresh();
    }

    onHide() {
        // by shkoh 20220824: 팝업창이 닫힐 때, 데이터 초기화
        this.dbOperatorNotifaction = null;

        this.operatorNotifaction.OP_ID = -1;
        this.operatorNotifaction.ASSET_ID = -1;
        this.operatorNotifaction.IS_NOTI_COMM = -1;

        this.operatorNotificationExceptSensors.splice(
            0,
            this.operatorNotificationExceptSensors.length
        );
        this.selectionItems.splice(0, this.selectionItems.length);
    }

    refreshData() {
        this.operatorNotificationExceptSensors.splice(
            0,
            this.operatorNotificationExceptSensors.length
        );

        this.$apollo.queries.dbOperatorNotifaction.refresh();
        this.$apollo.queries.dbOperatorNotificationExceptSensors.refresh();
    }

    get showDialog(): boolean {
        return this.$props.visible;
    }

    set showDialog(_is_show: boolean) {
        this.$emit('update:visible', _is_show);
    }

    get dialogHeader(): string {
        return `[${this.$props.assetName}] 알림자산 상세설정`;
    }

    get is_comm(): boolean {
        return this.operatorNotifaction?.IS_NOTI_COMM === 1;
    }

    set is_comm(_is_noti_comm: boolean) {
        if (this.operatorNotifaction) {
            this.$set(
                this.operatorNotifaction,
                'IS_NOTI_COMM',
                _is_noti_comm ? 1 : 0
            );
        }
    }

    get applyButtonDisabled(): boolean {
        let is_disabled = true;

        if (
            this.dbOperatorNotifaction &&
            this.dbOperatorNotifaction?.IS_NOTI_COMM !==
                this.operatorNotifaction.IS_NOTI_COMM
        ) {
            is_disabled = false;
        } else if (
            this.dbOperatorNotificationExceptSensors.length !==
            this.operatorNotificationExceptSensors.length
        ) {
            is_disabled = false;
        } else {
            for (const e_s of this.dbOperatorNotificationExceptSensors) {
                const has = this.operatorNotificationExceptSensors.some(
                    (s: OpNotiExceptSensor) => s.SENSOR_ID === e_s.SENSOR_ID
                );

                if (!has) {
                    is_disabled = false;
                    break;
                }
            }
        }

        return is_disabled;
    }

    apolloFetchOpNotiAsset(op_noti: OpNotiAsset) {
        for (const [key, value] of Object.entries(op_noti)) {
            this.$set(this.operatorNotifaction, key, value);
        }
    }

    apolloFetch(except_sensors: Array<OpNotiExceptSensor>) {
        for (const e_s of except_sensors) {
            this.operatorNotificationExceptSensors.push(e_s);

            const s_idx = this.selectionItems.findIndex(
                (s: any) => Number(s.ID) === e_s.SENSOR_ID
            );

            if (s_idx !== -1) {
                this.selectionItems.splice(s_idx, 1);
            }
        }
    }

    onLoadedSensorList({ data }: any) {
        this.selectionItems = [...data];

        this.operatorNotificationExceptSensors.splice(
            0,
            this.operatorNotificationExceptSensors.length
        );

        this.$apollo.queries.dbOperatorNotificationExceptSensors.refetch();
    }

    onRowSelect({ selectData }: any) {
        this.addSelectData(selectData);
        this.removeExceptData(selectData);
    }

    onRowUnselect({ unselectData }: any) {
        this.removeSelectData(unselectData);
        this.addExceptData(unselectData);
    }

    onRowSelectAll({ selectData }: any) {
        for (const data of selectData) {
            this.addSelectData(data);
            this.removeExceptData(data);
        }
    }

    onRowUnselectAll({ unselectData }: any) {
        if (unselectData === undefined) {
            for (const item of this.selectionItems) {
                this.addExceptData(item);
            }

            this.selectionItems.splice(0, this.selectionItems.length);
        } else {
            for (const data of unselectData) {
                this.removeSelectData(data);
                this.addExceptData(data);
            }
        }
    }

    addSelectData(data: any) {
        const data_idx = this.selectionItems.findIndex(
            (i: any) => i.ID === data.ID
        );
        if (data_idx === -1) {
            this.selectionItems.push(data);
        }
    }

    removeSelectData(data: any) {
        const data_idx = this.selectionItems.findIndex(
            (i: any) => i.ID === data.ID
        );
        if (data_idx !== -1) {
            this.selectionItems.splice(data_idx, 1);
        }
    }

    addExceptData(data: any) {
        const data_idx = this.operatorNotificationExceptSensors.findIndex(
            (s: OpNotiExceptSensor) => s.SENSOR_ID === Number(data.ID)
        );

        if (data_idx === -1) {
            this.operatorNotificationExceptSensors.push({
                OP_ID: this.$props.operatorId,
                SENSOR_ID: Number(data.ID)
            });
        }
    }

    removeExceptData(data: any) {
        const data_idx = this.operatorNotificationExceptSensors.findIndex(
            (s: OpNotiExceptSensor) => s.SENSOR_ID === Number(data.ID)
        );

        if (data_idx !== -1) {
            this.operatorNotificationExceptSensors.splice(data_idx, 1);
        }
    }

    applyButton() {
        let noti_asset: null | OpNotiAsset = null;

        if (
            this.dbOperatorNotifaction &&
            this.dbOperatorNotifaction?.IS_NOTI_COMM !==
                this.operatorNotifaction.IS_NOTI_COMM
        ) {
            noti_asset = {
                OP_ID: this.operatorNotifaction.OP_ID,
                ASSET_ID: this.operatorNotifaction.ASSET_ID,
                IS_NOTI_COMM: this.operatorNotifaction.IS_NOTI_COMM
            };
        }

        const add_noti_except_sensors: Array<OpNotiExceptSensor> = [];
        const remove_noti_except_sensors: Array<OpNotiExceptSensor> = [];

        // by shkoh 20220824: 알림을 제외할 센서리스트 추가
        for (const e_s of this.operatorNotificationExceptSensors) {
            const has = this.dbOperatorNotificationExceptSensors.some(
                (s: OpNotiExceptSensor) => s.SENSOR_ID === e_s.SENSOR_ID
            );
            if (!has) {
                add_noti_except_sensors.push({
                    OP_ID: e_s.OP_ID,
                    SENSOR_ID: e_s.SENSOR_ID
                });
            }
        }

        // by shkoh 20220824: 알림을 받을 센서리스트 제거
        for (const e_s of this.dbOperatorNotificationExceptSensors) {
            const has = this.operatorNotificationExceptSensors.some(
                (s: OpNotiExceptSensor) => s.SENSOR_ID === e_s.SENSOR_ID
            );

            if (!has) {
                remove_noti_except_sensors.push({
                    OP_ID: e_s.OP_ID,
                    SENSOR_ID: e_s.SENSOR_ID
                });
            }
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ASSET: ac_op_noti_asset_input
                        $ADD: [ac_op_noti_except_sensor_input!]
                        $REMOVE: [ac_op_noti_except_sensor_input!]
                    ) {
                        UpdateOperatorNotiAsset(ASSET: $ASSET)
                        AddOperatorNotiExceptSensors(ADD: $ADD)
                        DeleteOperatorNotiExceptSensors(REMOVE: $REMOVE)
                    }
                `,
                variables: {
                    ASSET: noti_asset,
                    ADD: add_noti_except_sensors,
                    REMOVE: remove_noti_except_sensors
                }
            })
            .then(() => {
                this.refreshData();

                this.$toast.add({
                    severity: 'success',
                    summary: `[${this.$props.assetName}] 알림자산 상세설정 변경`,
                    detail: `자산의 알림항목 상세설정이 변경되었습니다`,
                    life: 1500
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '알림자산 상세설정 변경 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }
}
</script>
