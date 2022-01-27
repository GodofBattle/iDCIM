<template>
    <Card>
        <template #title> Black Theme </template>
        <template #content>
            <span class="p-input-icon-left p-input-filled">
                <i class="pi pi-search" />
                <InputText type="text" placeholder="Search" />
            </span>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Inventore sed consequuntur error repudiandae numquam deserunt
                quisquam repellat libero asperiores earum nam nobis, culpa
                ratione quam perferendis esse, cupiditate neque quas!
            </p>
            <p>Theme: Vela-blue</p>
        </template>
        <template #footer>
            <Button icon="pi pi-check" label="Save"></Button>
            <Button
                icon="pi pi-times"
                label="Cancel"
                class="p-button-secondary p-ml-2"
            ></Button>
        </template>
    </Card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerSiteThemeWhite>({})
export default class IcomerSiteThemeWhite extends Vue {}
</script>

<style lang="scss" scoped>
@import 'primevue/resources/themes/vela-blue/theme.css';
</style>
