import { Plugin } from '@nuxt/types';
import { ApolloHelpers } from '@nuxtjs/apollo';

export let $apolloHelper: ApolloHelpers;

const accessor: Plugin = ({ app }) => {
    $apolloHelper = app?.$apolloHelpers;
};

export default accessor;
