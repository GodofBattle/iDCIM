<template>
    <i-scroll-panel class="p-p-1" :style="styles">
        <DataView :value="interfaceList" layout="grid" :lazy="true">
            <template #grid="slotProps">
                <ds-asset-card
                    :asset="slotProps.data"
                    :style="{ width: '20%' }"
                />
            </template>
        </DataView>
    </i-scroll-panel>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<DsInterfacePanel>({
    props: {
        width: {
            type: String,
            default: '50vw'
        },
        height: {
            type: String,
            default: '40vh'
        }
    }
})
export default class DsInterfacePanel extends Vue {
    get interfaceList(): Array<any> {
        const assets = this.$store.getters['sessionStorage/ASSETS'];

        if (Array.isArray(assets)) {
            return assets.filter(
                (a: any) =>
                    a.IS_USE_INTF === 1 &&
                    a.INTERFACE &&
                    a.INTERFACE.IS_USE === 1
            );
        } else {
            return [];
        }
    }

    get styles(): Object {
        return {
            width: this.$props.width,
            height: this.$props.height
        };
    }
}
</script>
