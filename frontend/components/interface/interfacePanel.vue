<template>
    <div v-if="interfaceId > 0" id="interfacePanel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">
                {{ interfaceData.NAME }}
            </div>
            <div class="p-ml-auto">
                <Button
                    v-show="showApplyButton"
                    icon="pi pi-check"
                    label="적용"
                    class="p-mr-2"
                    :disabled="applyButtonDisabled"
                    @click="updateInterface"
                ></Button>
                <Button
                    icon="pi pi-trash"
                    label="인터페이스 삭제"
                    class="p-button-danger"
                    @click="deleteInterface"
                ></Button>
            </div>
        </div>

        <TabView :active-index.sync="interfaceTabIndex">
            <TabPanel>
                <template #header>
                    <i class="pi pi-home p-mr-2"></i>
                    <span>기본정보</span>
                </template>
                <ScrollPanel class="i-interface-scrollpanel">
                    <interface-panel-info
                        v-if="interfaceTabIndex === 0"
                        :id="interfaceId"
                        ref="interfacePanelInfo"
                        :apply-button-disabled.sync="applyButtonDisabled"
                        @completeInterfaceUpdate="completeInterfaceUpdate"
                    ></interface-panel-info>
                </ScrollPanel>
            </TabPanel>
            <TabPanel :disabled="isDisabledComm || isVirtualInterface">
                <template #header>
                    <i class="pi pi-wifi p-mr-2"></i>
                    <span>통신방법</span>
                </template>
                <div class="i-interface-scrollpanel">
                    <interface-panel-comm
                        v-if="interfaceTabIndex === 1"
                        :id="interfaceId"
                        ref="interfacePanelComm"
                        :apply-button-disabled.sync="applyButtonDisabled"
                    >
                    </interface-panel-comm>
                </div>
            </TabPanel>
            <TabPanel :disabled="isVirtualInterface">
                <template #header>
                    <i class="pi pi-list p-mr-2"></i>
                    <span>수집항목</span>
                </template>
                <div class="i-interface-scrollpanel">
                    <interface-panel-sensor
                        v-if="interfaceTabIndex === 2"
                        :id="interfaceId"
                        ref="interfacePanelSensor"
                        :has-comm="!isDisabledComm"
                    >
                    </interface-panel-sensor>
                </div>
            </TabPanel>
            <!-- <TabPanel :disabled="isVirtualInterface">
                <template #header>
                    <i class="pi pi-sliders-v p-mr-2"></i>
                    <span>제어항목</span>
                </template>
                <ScrollPanel class="i-interface-scrollpanel">
                    <div v-if="interfaceTabIndex === 3">미구현 - 3</div>
                </ScrollPanel>
            </TabPanel> -->
        </TabView>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

type Interface = {
    [index: string]: string;
    NAME: string;
    INTF_CD: string;
};

@Component<InterfacePanel>({
    props: {
        interfaceId: Number,
        interfaceName: String
    },
    apollo: {
        interfaceData: {
            query: gql`
                query PredefineInterface($ID: ID!) {
                    PredefineInterface(ID: $ID) {
                        NAME
                        INTF_CD
                    }
                }
            `,
            prefetch: false,
            variables(): any {
                return {
                    ID: this.interfaceId ? this.interfaceId : -1
                };
            },
            update: ({ PredefineInterface }) => PredefineInterface
        }
    }
})
export default class InterfacePanel extends Vue {
    $refs!: {
        interfacePanelInfo: any;
        interfacePanelComm: any;
        interfacePanelSensor: any;
    };

    // by shkoh 20211007: 인터페이스 기본 정보
    interfaceData: Interface = {
        NAME: '',
        INTF_CD: ''
    };

    interfaceTabIndex = 0;

    applyButtonDisabled = true;

    get isDisabledComm(): boolean {
        const hasComm = ['INTF02', 'INTF06', 'INTF07'].includes(
            this.interfaceData.INTF_CD
        );

        // by shkoh 20211026: Interface 통신방법 탭이 비활성되고, [통신방법] Tab을 보고 있다면 이 때 [기본정보] 탭으로 이동한다.
        if (!hasComm && this.interfaceTabIndex === 1)
            this.interfaceTabIndex = 0;

        return !hasComm;
    }

    get isVirtualInterface(): boolean {
        // by shkoh 20220609: 가상 인터페이스인지 확인
        const is_virtual = this.interfaceData.INTF_CD === 'INTF04';

        // by shkoh 20220609: 가상 인터페이스일 때, 비활성화되는 탭(통신방법, 수집항목, 제어항목)인 경우에는 [기본정보] 탱으로 이동한다
        if (is_virtual && this.interfaceTabIndex !== 0) {
            this.interfaceTabIndex = 0;
        }
        return is_virtual;
    }

    get showApplyButton(): boolean {
        // by shkoh 20211026: 인터페이스 창에서 [기본설정] 탭을 제외하고는 저장 버튼을 보여줄 일은 없다
        return this.interfaceTabIndex === 0;
    }

    updateInterface() {
        switch (this.interfaceTabIndex) {
            case 0:
                this.$refs.interfacePanelInfo.updateInterface();
                break;
        }
    }

    deleteInterface() {
        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            message: `[${this.interfaceData.NAME}] 인터페이스를 삭제하시겠습니까?\n관련된 모든 항목들이 삭제됩니다.\n사이트에서 해당 제품이 등록되어 있다면 삭제가 불가합니다.(일부 미구현)`,
            header: `인터페이스 ${this.interfaceData.NAME} 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.delete();
            }
        });
    }

    completeInterfaceUpdate() {
        this.$apollo.queries.interfaceData.refresh();
    }

    delete() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        DeleteInterface(ID: ${this.$props.interfaceId})
                    }
                `
            })
            .then(({ data: { DeleteInterface } }) => {
                if (DeleteInterface) {
                    this.$toast.add({
                        severity: 'success',
                        summary: '인터페이스 삭제',
                        detail: `[${this.interfaceData.NAME}] 통신 인터페이스가 정상적으로 삭제되었습니다`,
                        life: 2000
                    });

                    eventBus.$emit('refreshInterfaceTree');
                    this.$emit('reset');
                }
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '인터페이스 삭제 실패',
                    detail: error.graphQLErrors[0].message,
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
#interfacePanel::v-deep {
    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 10vw;
    }

    .p-tabview-panels {
        padding: 1rem 0.5rem;
    }

    .p-tabview-nav-content {
        padding: 0.25rem 0.25rem 0 0.25rem;
    }

    .i-interface-scrollpanel {
        height: calc(
            100vh - 20px - var(--header-height) - 10px - 30px - 40px - 1rem
        );
        padding: 0.4rem;
    }
}
</style>
