<template>
    <div v-if="items !== null" id="i-asset-summary-item">
        <Button
            :class="summaryItemClasses"
            @click="onClickAssetSummaryButton($event)"
        >
            <div class="p-d-flex-inline">
                <label class="inside-button p-mr-1">{{ label }}</label>
                <label class="inside-button p-px-3 p-py-1 i-count">
                    {{ itemCount.toLocaleString() }}
                </label>
            </div>
        </Button>
        <i-overlay-panel
            id="i-overlay"
            ref="assetListRef"
            :style="{ width: '12vw', height: '30vh' }"
            :base-z-index="4000"
            append-to="body"
        >
            <DataTable
                class="p-datatable-sm"
                :value="itemsToRender"
                :scrollable="true"
                scroll-height="flex"
                :table-style="{ width: '100%', height: 'calc(30vh - 2rem)' }"
                data-key="ID"
                :striped-rows="true"
                selection-mode="single"
                :filters.sync="assetFilterData"
                :paginator="true"
                :first.sync="first"
                :rows="rows"
                :total-records="itemCount"
                :lazy="true"
                :page-link-size="1"
                @row-select="onRowSelect"
            >
                <template #header>
                    <div class="p-d-flex">
                        <div class="p-as-center p-ml-auto">
                            <span class="p-input-icon-right">
                                <i class="pi pi-search" />
                                <InputText
                                    v-model="assetFilterData['NAME'].value"
                                />
                            </span>
                        </div>
                    </div>
                </template>

                <template #empty>
                    <span v-if="itemsToRender.length === 0">
                        {{ label }} 상태의 자산은 없습니다
                    </span>
                    <span v-else-if="assetFilterData.NAME.value !== null">
                        검색한 자산이 없습니다
                    </span>
                </template>

                <Column key="LEVEL" class-name="i-column-lvl">
                    <template #body="slotProps">
                        <div :class="lvlStatus(slotProps.data)" />
                    </template>
                </Column>
                <Column key="ID" class-name="i-column-index">
                    <template #body="slotProps">
                        <div>
                            {{ first + slotProps.index + 1 }}
                        </div>
                    </template>
                </Column>
                <Column key="NAME" class-name="i-column-name">
                    <template #body="slotProps">
                        <div class="i-text-ellipsis">
                            {{ slotProps.data.NAME }}
                        </div>
                    </template>
                </Column>
                <Column
                    key="STATUS"
                    class-name="i-column-status"
                    :hidden="type === 'general'"
                >
                    <template #body="slotProps">
                        <svg-sensor-on
                            v-if="
                                hasInterface(slotProps.data) &&
                                isUseInterface(slotProps.data.INTERFACE) &&
                                commStatus(slotProps.data.INTERFACE)
                            "
                            class="i-comm-icon"
                        />
                        <svg-sensor-off
                            v-else-if="
                                hasInterface(slotProps.data) &&
                                isUseInterface(slotProps.data.INTERFACE) &&
                                !commStatus(slotProps.data.INTERFACE)
                            "
                            class="i-comm-icon"
                        />
                        <svg-sensor-pause
                            v-else-if="
                                hasInterface(slotProps.data) &&
                                !isUseInterface(slotProps.data.INTERFACE)
                            "
                            class="i-comm-icon"
                        />
                    </template>
                </Column>
            </DataTable>
        </i-overlay-panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { FilterMatchMode } from 'primevue/api';
import IOverlayPanel from '../custom/iOverlayPanel.vue';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';

@Component<AssetSummaryItem>({
    props: {
        items: {
            type: Array,
            default: null
        },
        type: String
    }
})
export default class AssetSummaryItem extends Vue {
    $refs!: {
        assetListRef: IOverlayPanel;
    };

    assetFilterData: any = {
        NAME: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };

    first: number = 0;
    rows: number = 100;
    totalRecords: number = 0;

    get itemsToRender(): Array<any> {
        const first = this.first;
        const last = this.first + this.rows;

        return this.$props.items
            .filter((i: any) => {
                const filter_value: null | string =
                    this.assetFilterData.NAME.value;

                if (filter_value === null || filter_value === '') {
                    return true;
                } else {
                    return (i.NAME as string)
                        .toLocaleLowerCase()
                        .includes(filter_value.toLocaleLowerCase());
                }
            })
            .slice(first, last);
    }

    get label(): string {
        let text = '';
        switch (this.$props.type) {
            case 'general':
                text = '일반';
                break;
            case 'normal':
                text = '정상';
                break;
            case 'warning':
                text = '주의';
                break;
            case 'major':
                text = '경고';
                break;
            case 'critical':
                text = '위험';
                break;
            case 'error':
                text = '통신이상';
                break;
        }

        return text;
    }

    get itemCount(): number {
        return this.$props.items.length;
    }

    get summaryItemClasses(): Array<string | object> {
        return [
            'p-button-sm',
            {
                'i-summary-type-general': this.$props.type === 'general',
                'i-summary-type-normal': this.$props.type === 'normal',
                'i-summary-type-warning': this.$props.type === 'warning',
                'i-summary-type-major': this.$props.type === 'major',
                'i-summary-type-critical': this.$props.type === 'critical',
                'i-summary-type-error': this.$props.type === 'error'
            }
        ];
    }

    onClickAssetSummaryButton(event: PointerEvent) {
        this.$refs.assetListRef.toggle(event);
    }

    lvlStatus({
        IS_USE_INTF,
        INTERFACE
    }: {
        IS_USE_INTF: number;
        INTERFACE: any;
    }): Array<object | string> {
        if (IS_USE_INTF === 0 || INTERFACE === null) {
            return ['i-lvl-step'];
        }

        const { CURR_LEVEL, CURR_STATUS, IS_USE } = INTERFACE;

        return [
            'i-lvl-step',
            {
                'i-lvl-1-step':
                    IS_USE === 1 && CURR_STATUS <= 1 && CURR_LEVEL === 1,
                'i-lvl-2-step':
                    IS_USE === 1 && CURR_STATUS <= 1 && CURR_LEVEL === 2,
                'i-lvl-3-step':
                    IS_USE === 1 && CURR_STATUS <= 1 && CURR_LEVEL === 3
            }
        ];
    }

    hasInterface({
        IS_USE_INTF,
        INTERFACE
    }: {
        IS_USE_INTF: number;
        INTERFACE: any;
    }): boolean {
        return IS_USE_INTF === 1 && INTERFACE !== null;
    }

    isUseInterface({ IS_USE }: { IS_USE: number }) {
        return IS_USE === 1;
    }

    commStatus({ CURR_STATUS }: any): boolean {
        return CURR_STATUS <= 1;
    }

    onRowSelect({ data }: any) {
        eventBus.$emit('showAssetDialog', data);
        this.$refs.assetListRef.hide();
    }
}
</script>

<style lang="scss" scoped>
#i-asset-summary-item::v-deep {
    .inside-button {
        cursor: pointer;
    }

    .i-count {
        background-color: #ffffff;
        color: #333333;
        font-weight: bold;
        border-radius: 0.5rem;
    }

    .i-summary-type-general {
        background-color: #ffffff;
        border-color: var(--surface-border);
        color: var(--text-alert-warning-color);
    }

    .i-summary-type-normal {
        background-color: var(--normal);
        border-color: var(--normal);
        color: var(--text-alert-color);
    }

    .i-summary-type-warning {
        background-color: var(--warning);
        border-color: var(--warning);
        color: var(--text-alert-warning-color);
    }

    .i-summary-type-major {
        background-color: var(--major);
        border-color: var(--major);
        color: var(--text-alert-color);
    }

    .i-summary-type-critical {
        background-color: var(--critical);
        border-color: var(--critical);
        color: var(--text-alert-color);
    }

    .i-summary-type-error {
        background-color: var(--comm05-color);
        border-color: var(--comm05-color);
        color: var(--text-alert-color);
    }
}

#i-overlay::v-deep {
    .p-datatable-thead {
        display: none;
    }

    .p-overlaypanel-content {
        width: 100%;
        height: 100%;
    }

    .i-asset-index {
        position: relative;
        width: auto;
        min-width: 2rem;

        .i-asset-comm-status {
            position: absolute;
            top: 0;
            right: 0;
            transform-origin: 100% 0;
            transform: translate(40%, -40%);
            width: 0.8rem;
            height: 0.8rem;
        }
    }

    .i-column-lvl {
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

    .i-column-index {
        flex-grow: 1;
        justify-content: left;
    }

    .i-column-name {
        flex-grow: 1;
        flex-basis: calc(100% - 40px);
        overflow: hidden;
    }

    .i-column-status {
        flex-grow: 1;
        flex-basis: 40px;
        justify-content: center;

        .i-comm-icon {
            width: 1.2rem;
            height: 1.2rem;
        }
    }

    .p-datatable .p-datatable-tbody > tr.p-datatable-emptymessage > td {
        border: none;
        justify-content: center;
        padding-top: 48%;
        padding-bottom: 48%;
    }
}
</style>
