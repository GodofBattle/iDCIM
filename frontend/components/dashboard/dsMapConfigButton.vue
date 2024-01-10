<template>
    <div id="i-ds-map-config-button">
        <SpeedDial
            class="i-speed-dial-panel"
            class-name="i-speed-dial"
            button-class="i-speed-dial-main-btn p-button-text p-button-secondary"
            show-icon="pi pi-cog"
            direction="down"
            :model="menuItems"
            :tooltip-options="{
                position: 'left'
            }"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<DsMapConfigButton>({})
export default class DsMapConfigButton extends Vue {
    menuItems: Array<any> = [
        { label: '추가', icon: 'pi pi-plus', command: () => {} },
        { label: '배경추가', icon: 'pi pi-image', command: () => {} },
        { label: '배경제거', icon: 'pi pi-times', command: () => {} }
    ];
}
</script>

<style lang="scss" scoped>
#i-ds-map-config-button::v-deep {
    .i-speed-dial {
        right: 1rem;
        top: 0;

        .i-speed-dial-main-btn {
            width: 3rem;
            height: 3rem;
        }

        .p-speeddial-action {
            background: transparent;
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
        }
    }
}
</style>
