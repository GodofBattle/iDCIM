<template>
    <div
        v-if="!$apollo.$loading"
        id="i-asset-panel-operator-with-alert"
        class="p-px-2 p-py-3"
    >
        <div class="p-d-flex">
            <div class="p-as-center">
                <Button
                    icon="pi pi-plus"
                    label="담당자 추가"
                    class="p-button-rounded p-button-info p-button-text p-mr-1"
                />
            </div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-save"
                    class="p-button-rounded p-button-text p-mr-1"
                    :disabled="applyButtonDisabled"
                    @click="applyButton"
                />
            </div>
        </div>
        <div class="p-d-flex" :style="{ height: 'calc(100% - 30px)' }">
            <div class="p-col-fixed" :style="{ width: '40%', height: '100%' }">
                <i-moveable-tree
                    :value="operatorsWithNotificationToRender"
                    :moveable="false"
                    :filter="true"
                    selection-mode="single"
                    :expanded-keys="treeExpandedKey"
                    :selection-keys.sync="selectionKeyOfOperatorTree"
                    @node-select="onSelectOperator"
                >
                    <template #ROOT="slotProps">
                        <div class="p-d-flex">
                            <i
                                class="pi pi-building p-p-1 p-mr-1"
                                style="font-size: 1.2rem"
                            />
                            <div class="p-p-1">
                                {{ slotProps.node.label }}
                            </div>
                        </div>
                    </template>
                    <template #OPERATOR="slotProps">
                        <div class="p-d-flex" :style="{ width: '100%' }">
                            <div class="p-d-flex p-ai-center">
                                <i
                                    class="pi pi-user p-p-1"
                                    style="font-size: 1.2rem"
                                />
                                <div class="p-p-1">
                                    {{ slotProps.node.label }}
                                </div>
                            </div>
                            <div class="p-ml-auto">
                                <Button
                                    icon="pi pi-minus"
                                    class="p-button-rounded p-button-text p-button-danger"
                                />
                            </div>
                        </div>
                    </template>
                </i-moveable-tree>
            </div>
            <div
                v-if="isSelectedOperator"
                class="p-col-fixed p-my-1"
                :style="{ width: '60%' }"
            >
                <div class="p-fluid p-input-filled">
                    <div class="p-field-checkbox">
                        <Checkbox
                            id="is_comm"
                            v-model="is_comm"
                            :binary="true"
                        />
                        <label for="is_comm">통신장애 알림여부</label>
                    </div>
                </div>
                <sensor-list
                    :interface-id="Number(assetItem.ID)"
                    :is-event-filter="true"
                    selection-mode="multiple"
                    :selected-items="selectionItems"
                    :style="{ height: 'calc(100% - 20px - 1rem)' }"
                    @loaded="onLoadedSensorList"
                    @row-select="onRowSelect"
                    @row-unselect="onRowUnselect"
                    @row-select-all="onRowSelectAll"
                    @row-unselect-all="onRowUnselectAll"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface Threshold_DI {
    [index: string]: string | null;
    VALUE_0_LABEL: string | null;
    VALUE_1_LABEL: string | null;
    VALUE_2_LABEL: string | null;
    VALUE_3_LABEL: string | null;
    VALUE_4_LABEL: string | null;
    VALUE_5_LABEL: string | null;
    VALUE_6_LABEL: string | null;
    VALUE_7_LABEL: string | null;
    VALUE_8_LABEL: string | null;
    VALUE_9_LABEL: string | null;
    VALUE_10_LABEL: string | null;
    VALUE_11_LABEL: string | null;
    VALUE_12_LABEL: string | null;
    VALUE_13_LABEL: string | null;
    VALUE_14_LABEL: string | null;
    VALUE_15_LABEL: string | null;
    VALUE_16_LABEL: string | null;
    VALUE_17_LABEL: string | null;
    VALUE_18_LABEL: string | null;
    VALUE_19_LABEL: string | null;
    VALUE_20_LABEL: string | null;
    VALUE_21_LABEL: string | null;
    VALUE_22_LABEL: string | null;
    VALUE_23_LABEL: string | null;
    VALUE_24_LABEL: string | null;
    VALUE_25_LABEL: string | null;
    VALUE_26_LABEL: string | null;
    VALUE_27_LABEL: string | null;
    VALUE_28_LABEL: string | null;
    VALUE_29_LABEL: string | null;
}

interface Sensor {
    [index: string]: number | string | boolean | null | Threshold_DI;
    ID: string;
    INTF_ID: number;
    NAME: string;
    SENSOR_CD: string;
    NODE_ID: number;
    CURR_VALUE: number;
    CURR_STATUS: number;
    CURR_LEVEL: number;
    DISP_POWER: number;
    IS_USE: number;
    IS_EVENT: number;
    THRESHOLD_DI: Threshold_DI | null;
}

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

@Component<AssetPanelOperatorWithAlert>({
    props: {
        assetItem: {
            type: Object,
            default: null
        }
    },
    apollo: {
        operatorsWithNotification: {
            query: gql`
                fragment treeFields on AssetTree {
                    key
                    label
                    order
                    parent_key
                    type
                    manipulable
                }

                query ($ASSET_ID: Int) {
                    OperatorsWithNotification(ASSET_ID: $ASSET_ID) {
                        ...treeFields
                        children {
                            ...treeFields
                            children {
                                ...treeFields
                            }
                        }
                    }
                }
            `,
            skip() {
                return this.$props.assetItem === null;
            },
            variables() {
                return {
                    ASSET_ID: Number(this.$props.assetItem.ID)
                };
            },
            prefetch: true,
            update: ({ OperatorsWithNotification }) => OperatorsWithNotification
        },
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
                    this.operator_id < 0 ||
                    this.$props.assetItem === null ||
                    Number(this.$props.assetItem.ID) < 0
                );
            },
            variables() {
                return {
                    OP_ID: this.operator_id,
                    ASSET_ID: Number(this.$props.assetItem.ID)
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
                return this.operator_id < 0;
            },
            variables() {
                return {
                    OP_ID: this.operator_id
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
    },
    watch: {
        assetItem: {
            deep: true,
            handler() {
                this.initData();
                this.operator_id = -1;
                this.operator_label = '';
            }
        }
    }
})
export default class AssetPanelOperatorWithAlert extends Vue {
    operator_id: number = -1;
    operator_label: string = '';

    sensorList: Array<Sensor> = [];
    selectionItems: Array<Sensor> = [];

    operatorsWithNotification: Array<any> = [];
    treeExpandedKey = {
        hier_customer: true,
        hier_partner: true,
        hier_operator: true
    };

    selectionKeyOfOperatorTree = {};

    dbOperatorNotifaction: OpNotiAsset | null = null;
    operatorNotifaction: OpNotiAsset = {
        OP_ID: -1,
        ASSET_ID: -1,
        IS_NOTI_COMM: -1
    };

    dbOperatorNotificationExceptSensors: Array<OpNotiExceptSensor> = [];
    operatorNotificationExceptSensors: Array<OpNotiExceptSensor> = [];

    get operatorsWithNotificationToRender(): Array<any> {
        const tree: Array<any> = [];

        this.operatorsWithNotification.forEach((node: any) => {
            if (node.children.length > 0 && node.type === 'ROOT') {
                this.$set(node, 'selectable', false);
                tree.push(node);
            }
        });

        return tree;
    }

    get isSelectedOperator(): boolean {
        return this.operator_id !== -1;
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

    initData() {
        this.dbOperatorNotifaction = {
            OP_ID: -1,
            ASSET_ID: -1,
            IS_NOTI_COMM: 1
        };

        this.operatorNotifaction = {
            OP_ID: -1,
            ASSET_ID: -1,
            IS_NOTI_COMM: 1
        };

        this.dbOperatorNotificationExceptSensors = [];
        this.operatorNotificationExceptSensors = [];
    }

    refreshData() {
        this.$apollo.queries.dbOperatorNotifaction.refresh();
        this.$apollo.queries.dbOperatorNotificationExceptSensors.refresh();
    }

    apolloFetchOpNotiAsset(op_noti: OpNotiAsset) {
        for (const [key, value] of Object.entries(op_noti)) {
            this.$set(this.operatorNotifaction, key, value);
        }
    }

    apolloFetch(except_sensors: Array<OpNotiExceptSensor>) {
        this.selectionItems = [...this.sensorList];
        this.operatorNotificationExceptSensors.splice(
            0,
            this.operatorNotificationExceptSensors.length
        );

        for (const e_s of except_sensors) {
            this.operatorNotificationExceptSensors.push(e_s);

            const idx = this.selectionItems.findIndex(
                (i: Sensor) => Number(i.ID) === e_s.SENSOR_ID
            );

            if (idx !== -1) {
                this.selectionItems.splice(idx, 1);
            }
        }
    }

    onLoadedSensorList({ data }: any) {
        this.sensorList = [...data];
        this.selectionItems = [...data];

        this.operatorNotificationExceptSensors.splice(
            0,
            this.operatorNotificationExceptSensors.length
        );

        this.$apollo.queries.dbOperatorNotificationExceptSensors.refetch();
    }

    onSelectOperator(select_node: any) {
        const [type, id] = select_node.key.split('_');
        this.operator_id = Number(id);
        this.operator_label = select_node.label;
    }

    onRowSelect({ selectData }: { selectData: Sensor }) {
        this.addSelectData(selectData);
        this.removeExceptData(selectData);
    }

    onRowUnselect({ unselectData }: { unselectData: Sensor }) {
        this.removeSelectData(unselectData);
        this.addExceptData(unselectData);
    }

    onRowSelectAll({ selectData }: { selectData: Array<Sensor> }) {
        for (const data of selectData) {
            this.addSelectData(data);
            this.removeExceptData(data);
        }
    }

    onRowUnselectAll({
        unselectData
    }: {
        unselectData: Array<Sensor> | undefined;
    }) {
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

    addSelectData(data: Sensor) {
        const idx = this.selectionItems.findIndex(
            (i: Sensor) => i.ID === data.ID
        );

        if (idx === -1) {
            this.selectionItems.push(data);
        }
    }

    removeSelectData(data: Sensor) {
        const idx = this.selectionItems.findIndex(
            (i: Sensor) => i.ID === data.ID
        );

        if (idx !== -1) {
            this.selectionItems.splice(idx, 1);
        }
    }

    addExceptData(data: Sensor) {
        const idx = this.operatorNotificationExceptSensors.findIndex(
            (s: OpNotiExceptSensor) => s.SENSOR_ID === Number(data.ID)
        );

        if (idx === -1) {
            this.operatorNotificationExceptSensors.push({
                OP_ID: this.operator_id,
                SENSOR_ID: Number(data.ID)
            });
        }
    }

    removeExceptData(data: Sensor) {
        const idx = this.operatorNotificationExceptSensors.findIndex(
            (s: OpNotiExceptSensor) => s.SENSOR_ID === Number(data.ID)
        );

        if (idx !== -1) {
            this.operatorNotificationExceptSensors.splice(idx, 1);
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

        // by shkoh 20220830: 알림을 제외할 센서리스트 추가
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

        // by shkoh 20220830: 알림을 받을 센서리스트 제거
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
                    summary: `[${this.operator_label}] - ${this.$props.assetItem.NAME} 알림자산 상세설정 변경`,
                    detail: `자산의 알림항목 상세설정이 변경되었습니다`,
                    life: 2000
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

<style lang="scss" scoped>
#i-asset-panel-operator-with-alert::v-deep {
    height: 100%;

    .p-tree {
        .p-treenode-label {
            width: 100%;
        }
    }
}
</style>
