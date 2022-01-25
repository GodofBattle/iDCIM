import { Plugin } from '@nuxt/types';
import gql from 'graphql-tag';
import { $apolloClient } from './apolloClient';

// by shkoh 20220120: DB에 설정된 Theme를 받아와서 localStorage에 미리 보관
// by shkoh 20220125: localStorage는 Server Side에는 존재하지 않으나, SSR로 동작하기 때문에 미리 Server Side에서 미리 지정함
const install: Plugin = async ({ app, store }) => {
    await $apolloClient
        .query({
            query: gql`
                query {
                    GetSiteTheme
                }
            `,
            fetchResults: true
        })
        .then(({ data: { GetSiteTheme } }) => {
            store.dispatch('localStorage/CHANGETHEME', GetSiteTheme);
        })
        .catch((error) => {
            console.error(error);
        });
};

export default install;
