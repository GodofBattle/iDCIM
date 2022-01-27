<template>
    <div id="i-site-alert" class="p-px-2">
        <div class="p-d-flex p-px-2">
            <div class="p-as-center i-title p-text-bold">사이트 알람 설정</div>
            <div class="p-ml-auto">
                <Button
                    class="p-button-rounded p-button-text"
                    icon="pi pi-save"
                    :disabled="applyButtonDisabled"
                    @click="applySiteAlert"
                ></Button>
            </div>
        </div>
        <Divider class="p-mt-1 p-mb-3" />
        <div class="p-px-2">
            <div class="p-field-checkbox">
                <Checkbox
                    id="i-sms-check"
                    v-model="smsCheck"
                    class="p-mr-1"
                    :binary="true"
                />
                <label for="i-sms-check">{{ smsCheckText }}</label>
            </div>
            <div class="p-field-checkbox">
                <Checkbox
                    id="i-email-check"
                    v-model="emailCheck"
                    class="p-mr-1"
                    :binary="true"
                />
                <label for="i-sms-check">{{ emailCheckText }}</label>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type SiteAlert = {
    [index: string]: number;
    IS_ENABLE_SMS: number;
    IS_ENABLE_EMAIL: number;
};

@Component<IcomerSiteAlert>({
    apollo: {
        dbSiteAlert: {
            query: gql`
                query {
                    Site {
                        IS_ENABLE_SMS
                        IS_ENABLE_EMAIL
                    }
                }
            `,
            prefetch: false,
            update: ({ Site }) => Site,
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
export default class IcomerSiteAlert extends Vue {
    dbSiteAlert: SiteAlert = {
        IS_ENABLE_SMS: 0,
        IS_ENABLE_EMAIL: 0
    };

    siteAlert: SiteAlert = {
        IS_ENABLE_SMS: 0,
        IS_ENABLE_EMAIL: 0
    };

    apolloFetch(site_alarm: SiteAlert) {
        for (const key of Object.keys(this.dbSiteAlert)) {
            this.siteAlert[key] = site_alarm[key];
        }
    }

    applySiteAlert() {
        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                mutation {
                    SetSiteAlert(
                        SMS: ${this.siteAlert.IS_ENABLE_SMS}
                        EMAIL: ${this.siteAlert.IS_ENABLE_EMAIL}
                    )
                }
            `
            })
            .then(() => {
                this.refreshSiteAlert();

                this.$toast.add({
                    severity: 'info',
                    summary: '사이트 알람 설정 완료',
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '사이트 알람 설정 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    refreshSiteAlert() {
        this.$apollo.queries.dbSiteAlert.refresh();
    }

    get smsCheck(): boolean {
        return this.siteAlert.IS_ENABLE_SMS === 1;
    }

    set smsCheck(_val: boolean) {
        this.siteAlert.IS_ENABLE_SMS = _val ? 1 : 0;
    }

    get emailCheck(): boolean {
        return this.siteAlert.IS_ENABLE_EMAIL === 1;
    }

    set emailCheck(_val: boolean) {
        this.siteAlert.IS_ENABLE_EMAIL = _val ? 1 : 0;
    }

    get applyButtonDisabled(): boolean {
        let is_disabled = true;

        for (const key of Object.keys(this.siteAlert)) {
            if (this.siteAlert[key] !== this.dbSiteAlert[key]) {
                is_disabled = false;
                break;
            }
        }

        return is_disabled;
    }

    get smsCheckText(): string {
        return this.siteAlert.IS_ENABLE_SMS === 1
            ? 'SMS 알람 ON'
            : 'SMS 알람 OFF';
    }

    get emailCheckText(): string {
        return this.siteAlert.IS_ENABLE_EMAIL === 1
            ? 'EMAIL 알람 ON'
            : 'EMAIL 알람 OFF';
    }
}
</script>

<style lang="scss" scoped>
#i-site-alert::v-deep {
    .i-title {
        font-size: 1.3rem;
        color: var(--text-color);
        width: 10vw;
    }
}
</style>
