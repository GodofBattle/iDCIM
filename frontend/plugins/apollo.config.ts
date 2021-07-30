import { Context } from '@nuxt/types';
import { from } from 'apollo-link';
import { onError } from 'apollo-link-error';

const configuer = ({}: Context) => {
    const apolloError = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            for (const err of graphQLErrors) {
                console.log(
                    `[graphQLErrors] ${err.extensions?.code}: ${err.message}`
                );
            }
        } else if (networkError) {
            console.error(networkError);
        }
    });

    return {
        link: from([apolloError]),
        ssr: true,
        httpEndpoint: 'http://10.10.20.29:4000/api',
        wsEndpoint: 'ws://10.10.20.29:4000/wsapi',
        httpLinkOptions: {
            credentials: 'same-origin'
        }
    };
};

export default configuer;
