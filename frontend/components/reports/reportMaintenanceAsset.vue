<template>
    <div id="i-report-maintenance-asset">
        <DataTable
            :value="filteredMaintenanceAssetList"
            :table-style="{ width: '100%', height: '100%' }"
            class="p-datatable-sm"
            :scrollable="true"
            response-layout="scroll"
            scroll-height="flex"
            filter-display="row"
            :striped-rows="true"
            :filters.sync="filterAsset"
            :paginator="true"
            :rows="rows"
            :page-link-size="10"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="{first} - {last} / {totalRecords}"
        >
            <template #header>
                <div class="p-d-flex p-mb-4">
                    <div
                        v-for="assetStatus of assetStatusFilter"
                        :key="assetStatus.key"
                        class="i-field-checkbox"
                    >
                        <Checkbox
                            :value="assetStatus.key"
                            :id="assetStatus.key"
                            v-model="selectedAssetStatus"
                            @change="isSelectAsset"
                            :disabled="
                                assetStatus.key === 'expireAsset' &&
                                selectedAssetStatus.includes('maAsset')
                            "
                        />
                        <div
                            class="assetStatusListBox"
                            :style="{ padding: '0 2rem 0 0.5rem' }"
                        >
                            <label
                                :for="assetStatus.key"
                                :class="assetStatus.key"
                                class="assetStatusList"
                            >
                                {{ assetStatus.name }}
                            </label>
                        </div>
                    </div>
                    <div class="p-ml-auto p-as-center">
                        <Button
                            label="설정"
                            icon="pi pi-cog"
                            class="p-button-text"
                            @click="showExpireAssetDialog"
                        />
                    </div>
                </div>
            </template>

            <template #empty>
                <span v-if="maintenanceAssetList === null">
                    유지보수 자산을 조회하세요
                </span>
                <span v-else> 유지보수 자산이 없습니다 </span>
            </template>

            <Column
                header="상태"
                field="DAY_DIFF"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '100px'
                }"
                :sortable="true"
            >
                <template #body="slotProps">
                    <div :class="statusStyle(slotProps.data)">
                        {{ dayDiffStatus(slotProps.data) }}
                    </div>
                </template>
            </Column>

            <Column
                header="자산명"
                field="ASSET_NAME"
                filterMatchMode="asset_name_filter"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '8%'
                }"
                :show-filter-menu="false"
            >
                <template #filter="{ filterModel, filterCallback }">
                    <InputText
                        type="text"
                        v-model="filterModel.value"
                        maxlength="32"
                        class="p-column-filter"
                        :style="{ width: '10rem' }"
                        @input="filterCallback()"
                    />
                </template>
                <template #body="slotProps">
                    {{ slotProps.data.ASSET_NAME }}
                </template>
            </Column>

            <Column
                header="수집항목"
                field="SENSOR_NAME"
                filterMatchMode="sensor_name_filter"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '8%'
                }"
                :show-filter-menu="false"
            >
                <template #filter="{ filterModel, filterCallback }">
                    <InputText
                        type="text"
                        v-model="filterModel.value"
                        class="p-column-filter"
                        :style="{ width: '10rem' }"
                        @input="filterCallback()"
                    />
                </template>
                <template #body="slotProps">
                    {{ slotProps.data.MA_NAME }}
                </template>
            </Column>

            <Column
                header="유지보수 기간"
                field="MA_END_DATE"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '8%'
                }"
                :sortable="true"
            >
                <template #body="slotProps">
                    {{ maDate(slotProps.data) }}
                </template>
            </Column>

            <Column
                header="유지보수사"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '8%'
                }"
            >
                <template #body="slotProps">
                    {{ slotProps.data.COMPANY_NAME }}
                </template>
            </Column>

            <Column
                header="담당자"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '8'
                }"
            >
                <template #body="slotProps">
                    {{ slotProps.data.MA_NAME }}
                </template>
            </Column>

            <Column
                header="내선번호"
                :styles="{
                    'flex-grow': 1,
                    'flex-basis': '8%'
                }"
            >
                <template #body="slotProps">
                    {{ slotProps.data.MA_PHONE }}
                </template>
            </Column>

            <Column
                header="전화번호"
                :style="{
                    'flex-grow': 1,
                    'flex-basis': '8%'
                }"
            >
                <template #body="slotProps">
                    {{ slotProps.data.MA_MOBILE }}
                </template>
            </Column>
            <template #paginatorstart />
            <template #paginatorend />
        </DataTable>
        <expire-asset-dialog :visible.sync="showExpireAsset" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { FilterMatchMode } from 'primevue/api';
import expireAssetDialog from '../asset/expireAssetDialog.vue';
import { eventBus } from '~/plugins/vueEventBus';

@Component<ReportMaintenanceAsset>({
    components: { expireAssetDialog },
    apollo: {
        maintenanceAssetList: {
            query: gql`
                query {
                    MaintenancedAssets {
                        ASSET_NAME
                        MA_START_DATE
                        MA_END_DATE
                        COMPANY_NAME
                        MA_NAME
                        MA_USER_ID
                        MA_PHONE
                        MA_MOBILE
                        DAY_DIFF
                        WEEK_DIFF
                        MONTH_DIFF
                        YEAR_DIFF
                    }
                }
            `,

            update: ({ MaintenancedAssets }) => MaintenancedAssets
        }
    }
})
export default class ReportMaintenanceAsset extends Vue {
    maintenanceAssetList: Array<any> = [];
    selectedAssetStatus: any[] = [];
    filteredMaintenanceAssetList: any[] = [];
    ASSET_NAME: string = '';
    assetStatus: any;
    //by MJ 2023.11.15 : 한 페이지에 표시되는 항목 수(데이터의 양을 조절하는 중요한 요소)
    rows: number = 5;
    showExpireAsset: boolean = false;
    //by MJ 2023.11.13 : 만료 예정자산 설정에 쓰일 변수
    expireDate: number;

    //by MJ 2023.11.13 : Vue.js 컴포넌트에서 이벤트 수신
    mounted() {
        eventBus.$on('refreshExpireAsset', (expiryTimestamp: number) => {
            this.expireDate = expiryTimestamp;
        });
    }

    beforeDestroy() {
        eventBus.$off('refreshExpireAsset');
    }

    filterAsset = {
        ASSET_NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
        SENSOR_NAME: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };

    assetStatusFilter: Array<any> = [
        { name: '계약 중인 자산', key: 'maAsset' },
        { name: '만료 예정 자산', key: 'expireAsset' },
        { name: '계약 종료 자산', key: 'endAsset' }
    ];

    statusStyle(item: any) {
        return {
            expireAsset: item.DAY_DIFF < 0 && Math.abs(item.MONTH_DIFF) < 3,
            maAsset: item.DAY_DIFF < 0,
            endAsset: item.DAY_DIFF >= 0
        };
    }

    dayDiffStatus(item: any) {
        const dayDiff = item.DAY_DIFF;
        const manthDiff = item.MONTH_DIFF;
        const formatManth = Math.abs(manthDiff);

        if (dayDiff < 0) {
            if (formatManth < this.expireDate) {
                return (
                    this.expireDate +
                    '개월 이하 (+' +
                    Math.abs(dayDiff) +
                    '일 남음)'
                );
            } else {
                return '진행 중';
            }
        } else {
            return '종료 (-' + dayDiff + '일 경과)';
        }
    }

    maDate(item: any) {
        const maStartDate = item.MA_START_DATE.slice(0, 10).replace(/-/gi, '.');
        const maEndDate = item.MA_END_DATE.slice(0, 10).replace(/-/gi, '.');
        const maTotalDate = maStartDate + ' ~ ' + maEndDate;
        return maTotalDate;
    }

    isSelectAsset() {
        this.filteredMaintenanceAssetList = this.maintenanceAssetList.filter(
            (item) => {
                let selectedAssetBoolean = false;

                for (let num = 0; num < 3; num++) {
                    let selectedStatus: any = this.selectedAssetStatus[num];

                    //by MJ 2023.11.13 : 모든 체크박스가 선택 해제되었는지 확인
                    if (this.selectedAssetStatus?.length === 0) {
                        selectedAssetBoolean = false;
                        break;
                    } else {
                        //by MJ 2023.11.13 : 체크박스 부분 선택 처리
                        if (selectedStatus === undefined) {
                            selectedStatus = '';
                        }

                        //by MJ 2023.11.13 : 유지보수 자산 체크박스 조건 필터
                        if (
                            (item.DAY_DIFF < 0 &&
                                selectedStatus === 'maAsset') ||
                            (item.DAY_DIFF < 0 &&
                                Math.abs(item.MONTH_DIFF) < this.expireDate &&
                                selectedStatus === 'expireAsset') ||
                            (item.DAY_DIFF >= 0 &&
                                selectedStatus === 'endAsset')
                        ) {
                            selectedAssetBoolean = true;
                            break;
                        }
                    }
                }

                return selectedAssetBoolean;
            }
        );
    }

    showExpireAssetDialog() {
        this.showExpireAsset = true;
    }
}
</script>

<style lang="scss" scoped>
#i-report-maintenance-asset::v-deep {
    width: 100% !important;
    height: 100%;
    background-color: coral !important;

    //by MJ 23.10.25: 상태옵션값
    .p-datatable-emptymessage {
        td {
            justify-content: center;
            border: none;
            height: 60vh;
        }
    }

    .p-tag {
        text-shadow: 0.5px 0.5px #7a7564;
    }

    .p-tag-icon {
        font-size: 2rem;
    }

    .p-tag-value {
        font-size: 1rem;
        margin-left: 0.5rem;
    }

    .maAsset {
        background: transparent;
        color: var(--warning);
        font-weight: bold;
    }

    .expireAsset {
        background: transparent;
        color: var(--major);
        font-weight: bold;
    }

    .endAsset {
        background: transparent;
        color: var(--primary-color);
        font-weight: bold;
    }

    .p-paginator .p-paginator-current {
        position: absolute;
        right: 0;
        pointer-events: none;
    }
    .assetStatusListBox {
        display: inline-flex;
    }
    .assetStatusList {
        cursor: pointer;
    }
}
</style>