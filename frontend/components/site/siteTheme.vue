<template>
    <div id="i-site-theme" class="p-px-2">
        <div class="p-d-flex px-px-2">
            <div class="p-as-center i-title p-text-bold">사이트 테마 설정</div>
            <div class="p-ml-auto">
                <Button
                    class="p-button-rounded p-button-text"
                    icon="pi pi-save"
                    :disabled="applyButtonDisabled"
                    @click="applySiteTheme"
                ></Button>
            </div>
        </div>
        <Divider class="p-mt-1 p-mb-3" />
        <div class="p-px-2">
            <SelectButton
                v-model="siteTheme"
                class="p-mb-4"
                data-key="value"
                :options="themeList"
                option-value="value"
            >
                <template #option="slotProps">
                    <div>
                        <label>{{ slotProps.option.label }}</label>
                    </div>
                </template>
            </SelectButton>
            <div class="p-shadow-20" style="width: 20vw">
                <div v-if="siteTheme === 'B'">
                    <site-theme-black></site-theme-black>
                </div>
                <div v-else-if="siteTheme === 'W'">
                    <site-theme-white></site-theme-white>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerSiteTheme>({
    apollo: {
        dbSiteTheme: {
            query: gql`
                query {
                    Site {
                        THEME_TYPE
                    }
                }
            `,
            prefetch: false,
            update: ({ Site }) => Site.THEME_TYPE,
            result({ data, loading }: any) {
                if (!loading) {
                    const { Site } = data;
                    if (Site) {
                        this.apolloFetch(Site);
                    }
                }
            }
        }
    }
})
export default class IcomerSiteTheme extends Vue {
    dbSiteTheme: string = '';
    siteTheme: string = '';

    themeList = [
        { value: 'B', label: 'Black' },
        { value: 'W', label: 'White' }
    ];

    apolloFetch(siteInfo: any) {
        this.siteTheme = siteInfo.THEME_TYPE;
    }

    applySiteTheme() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    SetSiteTheme(THEME: "${this.siteTheme}")
                }
            `
            })
            .then(() => {
                this.dbSiteTheme = this.siteTheme;

                this.$store.dispatch(
                    'localStorage/CHANGETHEME',
                    this.siteTheme
                );

                this.$toast.add({
                    severity: 'info',
                    summary: '사이트 테마 설정 완료',
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '사이트 테마 설정 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    get applyButtonDisabled(): boolean {
        return this.siteTheme === this.dbSiteTheme;
    }

    get themeName(): string {
        return this.siteTheme === 'B' ? 'Black Theme' : 'White Theme';
    }
}
</script>

<style lang="scss" scoped>
#i-site-theme::v-deep {
    .i-title {
        font-size: 1.3rem;
        color: var(--text-color);
        width: 10vw;
    }

    .saga-green {
        background-color: tomato;
    }
}
</style>
