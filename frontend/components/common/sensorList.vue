<template>
    <DataTable
        v-if="!$apollo.$loading"
        id="i-sensor-list"
        class="p-datatable-sm"
        :value="sensors"
        data-key="ID"
        :scrollable="true"
        scroll-height="flex"
        :striped-rows="true"
        filter-display="row"
        :filters.sync="filters"
        :table-style="{ widht: '100%', height: '100%' }"
        :selection-mode="selectionMode"
        :row-hover="true"
        :meta-key-selection="false"
        :selection="selectedItems"
        @filter="onFiltering"
        @row-select="onRowSelect"
        @row-unselect="onRowUnselect"
        @row-select-all="onRowSelectAll"
        @row-unselect-all="onRowUnselectAll"
    >
        <template #empty>
            <span>수집항목이 없습니다</span>
        </template>

        <Column
            v-if="isMultipleSelection"
            selection-mode="multiple"
            :header-style="{ width: '3em' }"
            :styles="{
                'flex-grow': 1,
                'flex-basis': '3em',
                'justify-content': 'center'
            }"
        >
        </Column>

        <Column
            key="NODE_ID"
            header=""
            field="NODE_ID"
            :header-style="{ width: '50px' }"
            :styles="{
                'flex-grow': 1,
                'flex-basis': '50px',
                'justify-content': 'center'
            }"
        >
            <template #body="slotProps">
                <Avatar :class="nodeStatus(slotProps.data)">
                    <span>{{ slotProps.data.NODE_ID }}</span>
                </Avatar>
            </template>
        </Column>
        <Column
            key="NAME"
            header="수집항목"
            field="NAME"
            filter-field="NAME"
            :styles="{ 'flex-grow': 1, 'flex-basis': '35%' }"
            :show-filter-menu="false"
        >
            <template #body="slotProps">
                <span :class="nameStatus(slotProps.data)">
                    {{ slotProps.data.NAME }}
                </span>
            </template>
            <template #filter="{ filterModel, filterCallback }">
                <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    @input="filterCallback()"
                />
            </template>
        </Column>
        <Column
            key="TYPE"
            header="종류"
            field="SENSOR_CD"
            :styles="{ 'flex-grow': 1, 'flex-basis': '25%' }"
            :show-filter-menu="false"
        >
            <template #body="slotProps">
                <span :class="typeStatus(slotProps.data)">
                    {{ sensorCodeName(slotProps.data.SENSOR_CD) }}
                </span>
            </template>
            <template #filter="{ filterModel, filterCallback }">
                <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    @input="filterCallback()"
                />
            </template>
        </Column>
        <Column
            key="VALUE"
            header="값"
            field="CURR_VALUE"
            :styles="{ 'flex-grow': 1, 'flex-basis': '30%' }"
        >
            <template #body="slotProps">
                <span :class="valueStatus(slotProps.data)">
                    {{ valueText(slotProps.data) }}
                </span>
            </template>
        </Column>
    </DataTable>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import { FilterService, FilterMatchMode } from 'primevue/api';
import { load } from 'dotenv';
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
    ID: number;
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

interface SensorCode {
    [index: string]: number | string;
    CODE: string;
    NAME: string;
    TYPE: string;
    UNIT: string;
    IS_DISP_CONV: number;
}

interface DisplayPowerCode {
    [index: string]: number | string;
    CODE: string;
    NAME: string;
    VALUE: number;
    REMARK: string;
}

@Component<SensorList>({
    props: {
        interfaceId: {
            type: Number,
            default: null
        },
        selectionMode: {
            type: String,
            default: 'none'
        },
        selectedItems: {
            type: Array,
            default: null
        }
    },
    apollo: {
        sensors: {
            query: gql`
                query ($INTF_ID: Int!) {
                    AssetSensors(INTF_ID: $INTF_ID) {
                        ID
                        INTF_ID
                        NAME
                        SENSOR_CD
                        NODE_ID
                        CURR_VALUE
                        CURR_STATUS
                        CURR_LEVEL
                        DISP_POWER
                        IS_USE
                        IS_EVENT
                        THRESHOLD_DI {
                            VALUE_0_LABEL
                            VALUE_1_LABEL
                            VALUE_2_LABEL
                            VALUE_3_LABEL
                            VALUE_4_LABEL
                            VALUE_5_LABEL
                            VALUE_6_LABEL
                            VALUE_7_LABEL
                            VALUE_8_LABEL
                            VALUE_9_LABEL
                            VALUE_10_LABEL
                            VALUE_11_LABEL
                            VALUE_12_LABEL
                            VALUE_13_LABEL
                            VALUE_14_LABEL
                            VALUE_15_LABEL
                            VALUE_16_LABEL
                            VALUE_17_LABEL
                            VALUE_18_LABEL
                            VALUE_19_LABEL
                            VALUE_20_LABEL
                            VALUE_21_LABEL
                            VALUE_22_LABEL
                            VALUE_23_LABEL
                            VALUE_24_LABEL
                            VALUE_25_LABEL
                            VALUE_26_LABEL
                            VALUE_27_LABEL
                            VALUE_28_LABEL
                            VALUE_29_LABEL
                        }
                    }
                }
            `,
            skip() {
                return (
                    this.$props.interfaceId === null ||
                    this.$props.interfaceId < 0
                );
            },
            variables() {
                return {
                    INTF_ID: this.$props.interfaceId
                };
            },
            update: ({ AssetSensors }) => AssetSensors,
            result({ loading, data }) {
                if (!loading) {
                    const { AssetSensors } = data;

                    if (AssetSensors) {
                        this.$emit('loaded', { data: AssetSensors });
                    }
                }
            }
        },
        displayPowerList: {
            query: gql`
                query {
                    Codes(TYPE: "POWER") {
                        CODE
                        NAME
                        VALUE
                        REMARK
                    }
                }
            `,
            update: ({ Codes }) => Codes
        },
        sensorCodeList: {
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
            update: ({ SensorCodes }) => SensorCodes
        }
    }
})
export default class SensorList extends Vue {
    sensors: Array<Sensor> = [];
    sensorCodeList: Array<SensorCode> = [];
    displayPowerList: Array<DisplayPowerCode> = [];

    filterdSensors: Array<Sensor> = [];

    filters = {
        NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
        SENSOR_CD: { value: null, matchMode: 'SENSOR_TYPE' }
    };

    mounted() {
        this.addFilterService();
    }

    addFilterService() {
        if (FilterService.register) {
            FilterService.register(
                'SENSOR_TYPE',
                (value: any, filter: any): boolean => {
                    if (
                        filter === undefined ||
                        filter === null ||
                        filter.trim() === ''
                    ) {
                        return true;
                    }

                    if (value === undefined || value === null) {
                        return false;
                    }

                    if (this.sensorCodeList) {
                        const sensor = this.sensorCodeList.find(
                            (s: SensorCode) => s.CODE === value
                        );
                        if (sensor) {
                            return sensor.NAME.includes(filter);
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            );
        }
    }

    sensorCodeName(code: string): string {
        const sensor = this.sensorCodeList.find(
            (sensor: SensorCode) => sensor.CODE === code
        );
        return sensor ? sensor.NAME : '설정안됨';
    }

    valueText(item: Sensor): string {
        let text = '';
        if (item.THRESHOLD_DI === null) {
            let num = item.CURR_VALUE;
            let prefix = '';
            let unit = '';

            const dispCode = this.displayPowerList.find(
                (disp: DisplayPowerCode) => disp.VALUE === item.DISP_POWER
            );
            if (dispCode) {
                num *= Math.pow(10, -dispCode.VALUE);
                prefix = dispCode.REMARK;
            }

            const sensorCode = this.sensorCodeList.find(
                (sensor: SensorCode) => sensor.CODE === item.SENSOR_CD
            );
            if (sensorCode) {
                unit = sensorCode.UNIT;
            }

            text = `${num.toFixed(1)} ${prefix}${unit}`;
        } else {
            text =
                item.THRESHOLD_DI[`VALUE_${item.CURR_VALUE}_LABEL`] ??
                '미설정 값';
        }

        return text;
    }

    nodeStatus(item: Sensor): Array<object | string> {
        const is_use = item.IS_USE;
        const is_event = item.IS_EVENT;
        const lvl = item.CURR_LEVEL;

        return [
            'i-asset-sensor-index p-px-1',
            {
                'i-not-used': is_use === 0,
                'i-lvl-null': is_event === 0,
                'i-lvl00': is_use === 1 && is_event === 1 && lvl === 0,
                'i-lvl01': is_use === 1 && is_event === 1 && lvl === 1,
                'i-lvl02': is_use === 1 && is_event === 1 && lvl === 2,
                'i-lvl03': is_use === 1 && is_event === 1 && lvl === 3,
                'i-lvl04': is_use === 1 && is_event === 1 && lvl === 4,
                'i-lvl05': is_use === 1 && is_event === 1 && lvl === 5
            }
        ];
    }

    nameStatus(item: Sensor): Array<object | string> {
        const is_use = item.IS_USE;
        return [
            {
                'i-not-used': is_use === 0
            }
        ];
    }

    typeStatus(item: Sensor): Array<object | string> {
        const is_use = item.IS_USE;
        return [
            {
                'i-not-used': is_use === 0
            }
        ];
    }

    valueStatus(item: Sensor): Array<object | string> {
        const is_use = item.IS_USE;
        return [
            {
                'i-not-used': is_use === 0
            }
        ];
    }

    get isMultipleSelection(): boolean {
        return this.$props.selectionMode === 'multiple';
    }

    onRowSelect({ originalEvent: { originalEvent }, data, type }: any) {
        if (type === 'checkbox') {
            (originalEvent as PointerEvent).stopPropagation();
        }

        this.$emit('row-select', { selectData: data });
    }

    onRowUnselect({ originalEvent: { originalEvent }, data, type }: any) {
        if (type === 'checkbox') {
            (originalEvent as PointerEvent).stopPropagation();
        }

        this.$emit('row-unselect', { unselectData: data });
    }

    onRowSelectAll({ data }: any) {
        this.$emit('row-select-all', { selectData: data });
    }

    onRowUnselectAll() {
        this.$emit('row-unselect-all', { unselectData: this.filterdSensors });
    }

    onFiltering({ filteredValue }: any) {
        this.filterdSensors = filteredValue;
    }
}
</script>

<style lang="scss" scoped>
#i-sensor-list::v-deep {
    .i-asset-sensor-index {
        position: relative;
        width: auto;
        min-width: 2rem;
    }

    .i-not-used {
        opacity: 0.4;
    }
}
</style>
