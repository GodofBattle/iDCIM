<template>
    <ScrollPanel v-if="interfaceId > 0" id="interfacePanel">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">
                {{ interfaceName }}
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
                    @updateInterfaceName="updateInterfaceName"
                ></interface-panel-info>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <i class="pi pi-wifi p-mr-2"></i>
                    <span>통신방법</span>
                </template>
                미구현 - 1
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
import Component from '@/plugins/nuxt-class-component';

@Component<InterfacePanel>({
    props: {
        interfaceId: Number,
        interfaceName: String
    }
})
export default class InterfacePanel extends Vue {
    $refs!: {
        interfacePanelInfo: any;
    };

    // by shkoh 20211006: TabView Component Ref
    interfacePanelInfo = null;

    interfaceTabIndex = 0;

    applyButtonDisabled = true;

    updateInterface() {
        switch (this.interfaceTabIndex) {
            case 0:
                this.$refs.interfacePanelInfo.updateInterface();
                break;
        }
    }

    deleteInterface() {
        console.info('deleteInterface');
    }

    updateInterfaceName(new_interface_name: string) {
        console.info(new_interface_name);
        this.$emit('update:interfaceName', new_interface_name);
    }
}
</script>

<style lang="scss" scoped>
#interfacePanel::v-deep .i-title {
    font-size: 1.6rem;
    color: var(--text-color);
    width: 10vw;
}
</style>
