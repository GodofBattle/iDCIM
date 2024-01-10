<template>
    <div id="i-asset-interface-sensor-table">
        <DataTable
            :value="interfaceSensorList"
            class="p-datatable-sm"
            :table-style="{ width: '100%', height: '100%' }"
            :scrollable="true"
            scroll-height="flex"
            data-key="ID"
            :striped-rows="true"
            :meta-key-selection="false"
            :loading="$apollo.$loading"
            row-group-mode="subheader"
            group-rows-by="ASSET_NAME"
            :expandable-row-groups="true"
            :expanded-row-groups.sync="expandedRowGroups"
            :filters.sync="sensorFilterData"
            :paginator="true"
            :lazy="true"
            :first="first"
            :rows="rows"
            :total-records="totalRecords"
            :always-show-paginator="true"
            :page-link-size="1"
            @page="onPage"
            @row-click="onRowClick"
        >
            <template #header>
                <div class="p-d-flex">
                    <div class="p-as-center p-ml-auto">
                        <span class="p-input-icon-right">
                            <i class="pi pi-search" />
                            <InputText
                                v-model="sensorFilterData['NAME'].value"
                            />
                        </span>
                    </div>
                </div>
            </template>

            <template #empty>
                <span>선택한 자산의 수집항목을 선택합니다</span>
            </template>

            <Column key="LEVEL" class-name="i-column-sensor-lvl">
                <template #body="slotProps">
                    <div :class="lvlStatus(slotProps.data)" />
                </template>
            </Column>
            <Column
                key="SELECTION"
                class-name="i-column-sensor-selector"
                :show-filter-menu="false"
            >
                <template #body="slotProps">
                    <Checkbox
                        id="assetSensorSelect"
                        v-model="slotProps.data.SELECTION"
                        :binary="true"
                        @click="onClickSensorSelection"
                        @input="
                            onInputSensorSelection($event, slotProps.data.ID)
                        "
                    />
                </template>
            </Column>
            <Column key="ID" field="NODE_ID" class-name="i-column-sensor-index">
                <template #body="slotProps">
                    <div :class="nodeStatus(slotProps.data)">
                        {{ slotProps.data.NODE_ID }}
                    </div>
                </template>
            </Column>
            <Column
                header="수집항목명"
                field="NAME"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': 'calc(100% - 3em - 50px)',
                    overflow: 'hidden'
                }"
            >
                <template #body="slotProps">
                    <div :class="nameStatus(slotProps.data)">
                        {{ slotProps.data.NAME }}
                    </div>
                </template>
            </Column>
            <Column class-name="i-column-sensor-update">
                <template #body="slotProps">
                    <div>
                        {{ convertUpdateDateTime(slotProps.data.UPDATE_DT) }}
                    </div>
                </template>
            </Column>

            <template #groupheader="slotProps">
                <div class="i-text-ellipsis">
                    {{ slotProps.data.ASSET_NAME }}
                </div>
            </template>

            <template #paginatorstart> </template>
            <template #paginatorend>
                <label v-if="totalRecords !== 0">
                    {{ sensorListSummary }}
                </label>
            </template>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import { FilterMatchMode } from 'primevue/api';
import Component from '@/plugins/nuxt-class-component';

interface ANALOG_SENSOR {
    [index: string]: string | number | boolean;
    ID: string;
    NAME: string;
    NODE_ID: number;
    INTF_ID: number;
    ASSET_NAME: string;
    IS_USE: number;
    IS_EVENT: number;
    IS_MKSTATS: number;
    CURR_LEVEL: number;
    UPDATE_DT: string;
}

interface ANALOG_SENSOR_VIEW extends ANALOG_SENSOR {
    SELECTION: boolean;
}

@Component<AssetInterfaceSensorTable>({
    props: {
        selectedAssets: {
            type: Array,
            default: null
        },
        selectedSensors: {
            type: Array,
            default: (raw: Array<ANALOG_SENSOR>) => {
                return [...raw];
            }
        }
    },
    apollo: {
        sensorList: {
            query: gql`
                query ($INTF_IDS: [Int!]!) {
                    AnalogSensorsInAssets(INTF_IDS: $INTF_IDS) {
                        ID
                        NAME
                        NODE_ID
                        INTF_ID
                        ASSET_NAME
                        IS_USE
                        IS_EVENT
                        IS_MKSTATS
                        CURR_LEVEL
                        UPDATE_DT
                    }
                }
            `,
            skip() {
                return (
                    this.$props.selectedAssets === null ||
                    this.$props.selectedAssets.length === 0
                );
            },
            variables() {
                return {
                    INTF_IDS: this.interfaceIds
                };
            },
            update({ AnalogSensorsInAssets }) {
                return AnalogSensorsInAssets.map(
                    (a: ANALOG_SENSOR): ANALOG_SENSOR_VIEW => {
                        const is =
                            this.$props.selectedSensors === null
                                ? false
                                : this.$props.selectedSensors.some(
                                      (s: any) => a.ID === s.ID
                                  );

                        return {
                            SELECTION: is,
                            ...a
                        };
                    }
                );
            },
            result({ loading, data }) {
                if (!loading) {
                    const { AnalogSensorsInAssets } = data;

                    if (AnalogSensorsInAssets) {
                        this.expandRowGroups(AnalogSensorsInAssets);
                    }
                }
            }
        }
    },
    watch: {
        isStatusIndex() {
            this.$apollo.queries.sensorList.refetch();
        }
    }
})
export default class AssetInterfaceSensorTable extends Vue {
    sensorList: Array<any> = [];
    expandedRowGroups: Array<any> = [];

    sensorFilterData: any = {
        NAME: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };

    first: number = 0;
    rows: number = 100;
    totalRecords: number = 0;
    max_selection_count: number = 20;

    get isStatusIndex(): number {
        // by shkoh 20230404: 자산의 상태가 변경됐음을 알려줄 때, 상태 Index가 1이 추가되면서 이를 알려줌
        const status_index = this.$store.getters['sessionStorage/STATUS'];
        return status_index;
    }

    onPage(event: any) {
        const { first } = event;
        this.first = first;
    }

    onRowClick({ data }: { data: ANALOG_SENSOR_VIEW }) {
        if (this.selectionSensors.length >= this.max_selection_count) {
            if (data.SELECTION) {
                data.SELECTION = false;
                this.rowSelection();
            } else {
                this.$toast.add({
                    severity: 'warn',
                    summary: `데이터통계 선택 센서 초과`,
                    detail: `데이터통계 조회 성능 최적화를 위해서 최대 ${this.max_selection_count}개까지만 센서가 선택됩니다`,
                    life: 3000
                });
            }
        } else {
            data.SELECTION = !data.SELECTION;
            this.rowSelection();
        }
    }

    onClickSensorSelection(event: PointerEvent) {
        event.stopPropagation();
    }

    onInputSensorSelection(is_checked: boolean, sensor_id: string) {
        if (
            this.selectionSensors.length > this.max_selection_count &&
            is_checked
        ) {
            const check_sensor = this.sensorList.find(
                (s: ANALOG_SENSOR_VIEW) => s.ID === sensor_id
            );

            if (check_sensor) {
                check_sensor.SELECTION = false;

                this.$toast.add({
                    severity: 'warn',
                    summary: `데이터통계 선택 센서 초과`,
                    detail: `데이터통계 조회 성능 최적화를 위해서 최대 ${this.max_selection_count}개까지만 센서가 선택됩니다`,
                    life: 3000
                });
            }
        } else {
            this.rowSelection();
        }
    }

    rowSelection() {
        this.$emit('update:selectedSensors', this.selectionSensors);
    }

    expandRowGroups(sensors: Array<ANALOG_SENSOR_VIEW>) {
        this.expandedRowGroups.splice(0, this.expandedRowGroups.length);

        for (const s of sensors) {
            this.expandedRowGroups.push(s.ASSET_NAME);
        }
    }

    lvlStatus(item: any): Array<object | string> {
        const { IS_USE, CURR_LEVEL } = item;

        return [
            'i-lvl-step',
            {
                'i-lvl-1-step': IS_USE === 1 && CURR_LEVEL === 1,
                'i-lvl-2-step': IS_USE === 1 && CURR_LEVEL === 2,
                'i-lvl-3-step': IS_USE === 1 && CURR_LEVEL === 3
            }
        ];
    }

    nodeStatus(item: any): Array<object | string> {
        const { IS_USE, IS_MKSTATS } = item;

        return [
            {
                'i-not-used': IS_USE === 0 || IS_MKSTATS === 0
            }
        ];
    }

    nameStatus(item: any): Array<object | string> {
        const { IS_USE, IS_MKSTATS } = item;

        return [
            'i-text-ellisis',
            {
                'i-not-used': IS_USE === 0 || IS_MKSTATS === 0
            }
        ];
    }

    convertUpdateDateTime(dt: string | null) {
        if (dt === null) {
            return;
        }

        const update_dt = new Date(dt);
        const now = new Date();

        const diff = Math.round(
            now.getTime() / 1000 - update_dt.getTime() / 1000
        );

        let update_text = '';

        if (diff < 30) {
            // by shkoh 20221214: 30초 이하인 경우에는 방금
            update_text = '방금 전';
        } else if (diff < 60) {
            // by shkoh 20221214: 30초에서 1분 이하인 경우에는 1분 전
            update_text = '1분 전';
        } else if (diff < 3600) {
            // by shkoh 20221214: 1분에서 60분 사이인 경우에는 ?? 분전
            const min = Math.floor(diff / 60);
            update_text = `${min}분 전`;
        } else if (diff < 86400) {
            // by shkoh 20221214: 1시간에서 1일 사이인 경우에는 ?? 시간 전
            const hour = Math.floor(diff / 3600);
            update_text = `${hour}시간 전`;
        } else if (diff < 2592000) {
            // by shkoh 20221214: 1일에서부터 30일 사이인 경우에는 ??일 전
            const day = Math.floor(diff / 86400);
            update_text = `${day}일 전`;
        } else {
            // by shkoh 20221214: 1개월이 넘은 경우에는 무조건 1개월 이상
            update_text = `1개월 이상`;
        }

        return update_text;
    }

    get interfaceIds(): Array<number> {
        return this.$props.selectedAssets.map((a: any) => Number(a.ID));
    }

    get interfaceSensorList(): Array<ANALOG_SENSOR_VIEW> {
        if (
            this.$props.selectedAssets === null ||
            this.$props.selectedAssets.length === 0
        ) {
            this.totalRecords = 0;
            return [];
        }

        const list = this.sensorList.filter((s: ANALOG_SENSOR_VIEW) => {
            const filter_value: null | string =
                this.sensorFilterData.NAME.value;

            if (filter_value === null || filter_value === '') {
                return true;
            } else {
                return s.NAME.toLocaleLowerCase().includes(
                    filter_value.toLocaleLowerCase()
                );
            }
        });

        this.totalRecords = list.length;
        return list.slice(this.first, this.first + this.rows);
    }

    get selectionSensors(): Array<ANALOG_SENSOR_VIEW> {
        return this.sensorList.filter((a: ANALOG_SENSOR_VIEW) => a.SELECTION);
    }

    get sensorListSummary(): string {
        const first = this.first;
        const last =
            first + this.rows > this.totalRecords
                ? this.totalRecords
                : first + this.rows;

        return `${first + 1} - ${last} / ${this.totalRecords}`;
    }
}
</script>

<style lang="scss" scoped>
#i-asset-interface-sensor-table::v-deep {
    width: 100%;

    .p-datatable-emptymessage {
        td {
            justify-content: center;
            border: none;
            height: 60vh;
        }
    }

    .i-column-sensor-lvl {
        flex-grow: 1;
        padding: 0;

        .i-lvl-step {
            width: 0.5rem;
            height: 80%;
        }

        .i-lvl-1-step {
            background-color: var(--warning);
        }

        .i-lvl-2-step {
            background-color: var(--major);
        }

        .i-lvl-3-step {
            background-color: var(--critical);
        }
    }

    .i-column-sensor-selector {
        flex-grow: 1;
        flex-basis: 3em;
        justify-content: center;
    }

    .i-column-sensor-index {
        flex-grow: 1;
        flex-basis: 40px;
    }

    .i-column-sensor-name {
        flex-grow: 1;
        flex-basis: calc(70% - 3em - 40px);
        overflow: hidden;
    }

    .i-column-sensor-update {
        flex-grow: 1;
        flex-basis: 30%;
        overflow: hidden;
    }

    .i-not-used {
        opacity: 0.4;
    }

    .i-lvl-null {
        opacity: 0.4;
    }
}
</style>
