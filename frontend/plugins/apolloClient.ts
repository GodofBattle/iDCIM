import { Plugin } from '@nuxt/types';
import { ApolloClient } from 'apollo-client';

export let $apolloClient: ApolloClient<any>;

const accessor: Plugin = ({ app }) => {
    $apolloClient = app?.apolloProvider?.defaultClient;
};

export default accessor;
