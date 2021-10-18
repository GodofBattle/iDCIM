<template>
    <ScrollPanel v-if="interfaceId > 0" id="interfacePanel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">
                {{ interfaceData.NAME }}
            </div>
            <div class="p-ml-auto">
                <Button
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

        <TabView class="p-px-2 p-mt-1" :active-index.sync="interfaceTabIndex">
            <TabPanel>
                <template #header>
                    <i class="pi pi-home p-mr-2"></i>
                    <span>기본정보</span>
                </template>
                <interface-panel-info
                    :id="interfaceId"
                    ref="interfacePanelInfo"
                    :apply-button-disabled.sync="applyButtonDisabled"
                    @completeInterfaceUpdate="completeInterfaceUpdate"
                ></interface-panel-info>
            </TabPanel>
            <TabPanel :disabled="isDisabledComm">
                <template #header>
                    <i class="pi pi-wifi p-mr-2"></i>
                    <span>통신방법</span>
                </template>
                <interface-panel-comm
                    :id="interfaceId"
                    ref="interfacePanelComm"
                    :apply-button-disabled.sync="applyButtonDisabled"
                >
                </interface-panel-comm>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <i class="pi pi-list p-mr-2"></i>
                    <span>수집항목</span>
                </template>
                미구현 - 2
            </TabPanel>
            <TabPanel>
                <template #header>
                    <i class="pi pi-sliders-v p-mr-2"></i>
                    <span>제어항목</span>
                </template>
                미구현 - 3
            </TabPanel>
        </TabView>
    </ScrollPanel>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

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
    watch: {
        interfaceId() {
            this.interfaceTabIndex = 0;
        }
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
    };

    // by shkoh 20211007: 인터페이스 기본 정보
    interfaceData: Interface = {
        NAME: '',
        INTF_CD: ''
    };

    // by shkoh 20211006: TabView Component Ref
    interfacePanelInfo = null;
    interfacePanelComm = null;

    interfaceTabIndex = 0;

    applyButtonDisabled = true;

    get isDisabledComm(): boolean {
        const hasComm = ['INTF02', 'INTF06', 'INTF07'].includes(
            this.interfaceData.INTF_CD
        );

        return !hasComm;
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
            message: `[${this.interfaceData.NAME}] 인터페이스를 삭제하시겠습니까?\n관련된 모든 항목들이 삭제됩니다.\n사이트에서 해당 제품이 등록되어 있다면 삭제가 불가합니다.(미구현)`,
            header: `인터페이스 ${this.interfaceData.NAME} 삭제`,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.$toast.add({
                    severity: 'error',
                    summary: '인터페이스 삭제 처리',
                    detail: `미구현되었습니다. 삭제처리를 추후 논의 후 삭제할 것입니다`,
                    life: 2000
                });
            }
        });
    }

    completeInterfaceUpdate() {
        this.$apollo.queries.interfaceData.refresh();
    }
}
</script>

<style lang="scss" scoped>
#interfacePanel::v-deep {
    height: calc(100vh - 20px - var(--header-height));

    .i-title {
        font-size: 1.6rem;
        color: var(--text-color);
        width: 10vw;
    }

    .p-tabview-panels {
        padding: 1rem 0.5rem;
    }
}
</style>
