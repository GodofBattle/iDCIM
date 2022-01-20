import { Plugin } from '@nuxt/types';
import gql from 'graphql-tag';
import { $apolloClient } from './apolloClient';

// by shkoh 20220120: DB에 설정된 Theme를 받아와서 localStorage에 미리 보관
const install: Plugin = ({ app, store }) => {
    $apolloClient
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
