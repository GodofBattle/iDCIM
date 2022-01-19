<template>
    <div id="i-site-name" class="p-px-2">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">사이트명 설정</div>
            <div class="p-ml-auto">
                <Button
                    class="p-button-rounded p-button-text"
                    icon="pi pi-save"
                    :disabled="applyButtonDisabled"
                    @click="applySiteName"
                />
            </div>
        </div>
        <Divider class="p-mt-1 p-mb-3" />
        <div class="p-grid p-px-2">
            <div class="p-col-3 p-fluid p-input-filled">
                <div class="p-field">
                    <InputText
                        id="site-name"
                        v-model="siteName"
                        type="text"
                        aria-describedby="site-name-help"
                        autocomplete="off"
                        :class="{ 'p-invalid': invalidMessage.length > 0 }"
                        @input="validateName"
                    ></InputText>
                    <small
                        v-if="!!invalidMessage"
                        id="site-name-help"
                        class="p-error"
                    >
                        {{ invalidMessage }}
                    </small>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

@Component<IcomerSiteName>({
    apollo: {
        dbSiteName: {
            query: gql`
                query {
                    Site {
                        SITE_NAME
                    }
                }
            `,
            prefetch: false,
            update: ({ Site }) => Site.SITE_NAME,
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
export default class IcomerSiteName extends Vue {
    dbSiteName: string = '';

    siteName: string = '';
    invalidMessage: string = '';

    apolloFetch(site: any) {
        this.siteName = site.SITE_NAME;
    }

    validateName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessage = '사이트명은 32자 이하입니다';
        } else {
            this.invalidMessage = '';
        }
    }

    get applyButtonDisabled(): boolean {
        return this.dbSiteName === this.siteName;
    }

    applySiteName() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    SetSiteName(NAME: "${this.siteName}")
                }
            `
            })
            .then(() => {
                this.dbSiteName = this.siteName;

                this.$toast.add({
                    severity: 'info',
                    summary: '사이트명 설정 완료',
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '사이트명 설정 실패',
                    detail: error.message,
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
#i-site-name::v-deep {
    .i-title {
        font-size: 1.3rem;
        color: var(--text-color);
        width: 10vw;
    }
}
</style>
