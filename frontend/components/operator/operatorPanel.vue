<template>
    <div id="i-operator-panel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center p-text-bold i-title">
                {{ operatorTitle }}
            </div>
            <div class="p-ml-auto">
                <Button
                    icon="pi pi-check"
                    label="적용"
                    class="p-mr-2"
                    :disabled="applyButtonDisabled"
                    @click="UpdateOperator"
                ></Button>
                <Button
                    icon="pi pi-trash"
                    label="삭제"
                    class="p-button-danger"
                    @click="deleteOperator"
                ></Button>
            </div>
        </div>

        <TabView :active-index.sync="tabIndex">
            <TabPanel>
                <template #header>
                    <i class="pi pi-home p-mr-2"></i>
                    <span>기본정보</span>
                </template>

                <operator-panel-info
                    v-if="tabIndex === 0"
                    ref="operatorPanelInfoRef"
                    :operator-id="operatorId"
                    :apply-button-disabled.sync="applyButtonDisabled"
                    @opertor-data-refresh="operatorRefresh"
                ></operator-panel-info>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <i class="pi pi-bell p-mr-2"></i>
                    <span>알림설정</span>
                </template>

                <operator-panel-notify
                    v-if="tabIndex === 1"
                    ref="operatorPanelNotifyRef"
                    :operator-id="operatorId"
                    :operator-label="operatorTitle"
                    :apply-button-disabled.sync="applyButtonDisabled"
                ></operator-panel-notify>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <i class="pi pi-desktop p-mr-2"></i>
                    <span>알림자산</span>
                </template>

                <operator-alert-asset
                    v-if="tabIndex === 2"
                    ref="operatorAlertAssetRef"
                    :operator-id="operatorId"
                    :apply-button-disabled.sync="applyButtonDisabled"
                />
            </TabPanel>
        </TabView>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import OperatorAlertAsset from './operatorAlertAsset.vue';
import Component from '@/plugins/nuxt-class-component';

type Company = {
    [index: string]: string;
    NAME: string;
};

type Operator = {
    [index: string]: string | Company;
    NAME: string;
    COMPANY: Company;
};

@Component<OperatorPanel>({
    props: {
        operatorId: Number,
        operatorName: String
    },
    apollo: {
        operatorData: {
            query: gql`
                query Operator($ID: ID!) {
                    Operator(ID: $ID) {
                        NAME
                        COMPANY {
                            NAME
                        }
                    }
                }
            `,
            prefetch: false,
            variables(): any {
                return {
                    ID: this.operatorId ? this.operatorId : -1
                };
            },
            update: ({ Operator }) => {
                return Operator;
            }
        }
    }
})
export default class OperatorPanel extends Vue {
    $refs!: {
        operatorPanelInfoRef: any;
        operatorPanelNotifyRef: any;
        operatorAlertAssetRef: OperatorAlertAsset;
    };

    operatorData: Operator = {
        NAME: '',
        COMPANY: {
            NAME: ''
        }
    };

    applyButtonDisabled = true;

    tabIndex: number = 0;

    operatorRefresh() {
        this.$apollo.queries.operatorData.refresh();
    }

    get operatorTitle(): string {
        const parent_name = this.operatorData.COMPANY?.NAME
            ? `${this.operatorData.COMPANY.NAME}: `
            : '';
        return `${parent_name}${this.operatorData.NAME}`;
    }

    UpdateOperator() {
        switch (this.tabIndex) {
            case 0: {
                this.$refs.operatorPanelInfoRef.updateOperatorInfo();
                break;
            }
            case 1: {
                this.$refs.operatorPanelNotifyRef.updateOperatorNotify();
                break;
            }
            case 2: {
                this.$refs.operatorAlertAssetRef.updateOperatorAlertAsset();
                break;
            }
        }
    }

    deleteOperator() {
        // by shkoh 20220419: 삭제하기 전에 데이터 갱신
        this.operatorRefresh();

        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `[${this.operatorData.NAME}] 담당자를 삭제하시겠습니까?\n자산정보 중에서 해당 담당자가 등록된 항목들은 모두 초기화 합니다.`,
            header: `${this.operatorData.NAME} 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.$toast.add({
                    severity: 'error',
                    summary: ' 미구현',
                    detail: `아직 삭제 처리는 구현되지 않았습니다`,
                    life: 2000
                });
            }
        });
    }
}
</script>

<style lang="scss" scoped>
#i-operator-panel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 30vw;
    }
}
</style>
