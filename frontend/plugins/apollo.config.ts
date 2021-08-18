import { Context } from '@nuxt/types';
import { from } from 'apollo-link';
import { onError } from 'apollo-link-error';

const configuer = ({ env }: Context) => {
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
        httpEndpoint: `http://${env.API_HOST}:${env.API_PORT}/api`,
        wsEndpoint: `ws://${env.API_HOST}:${env.API_PORT}/wsapi`,
        httpLinkOptions: {
            credentials: 'same-origin'
        }
    };
};

export default configuer;
