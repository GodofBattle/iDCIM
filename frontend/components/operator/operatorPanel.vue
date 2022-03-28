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
                    ref="operatorPanelInfoRef"
                    :operator-id="operatorId"
                    :apply-button-disabled.sync="applyButtonDisabled"
                    @opertor-data-refresh="operratorRefresh"
                ></operator-panel-info>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <i class="pi pi-bell p-mr-2"></i>
                    <span>알림설정</span>
                </template>

                <h3>알림을 설정하는 곳입니다!</h3>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <i class="pi pi-desktop p-mr-2"></i>
                    <span>알림자산</span>
                </template>

                <h1>자산에 대한 알람을 설정할 것입니다</h1>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <i class="pi pi-database p-mr-2"></i>
                    <span>알림항목</span>
                </template>

                <h4>어떤 자산이 문제일지를 확인합니다</h4>
            </TabPanel>
        </TabView>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
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
        operatorName: String,
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
                    ID: this.operatorId ? this.operatorId : -1,
                };
            },
            update: ({ Operator }) => {
                return Operator;
            },
        },
    },
})
export default class OperatorPanel extends Vue {
    $refs!: {
        operatorPanelInfoRef: any;
    };

    operatorData: Operator = {
        NAME: '',
        COMPANY: {
            NAME: '',
        },
    };

    applyButtonDisabled = true;

    tabIndex: number = 0;

    operratorRefresh() {
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
        }
    }
}
</script>

<style lang="scss" scoped>
#i-operator-panel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 10vw;
    }
}
</style>