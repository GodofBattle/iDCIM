import { Plugin } from '@nuxt/types';

export let $apolloClient: any;

const accessor: Plugin = ({ app }) => {
    $apolloClient = app?.apolloProvider?.defaultClient;
};

export default accessor;
