import { Context } from '@nuxt/types';
import { from } from 'apollo-link';
import { onError } from 'apollo-link-error';

const configuer = ({ env, store, redirect, nuxtState }: Context) => {
    const apolloError = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            let go_to_login = false;

            for (const err of graphQLErrors) {
                console.log(
                    `[graphQLErrors] ${err.extensions?.code}: ${err.message}`
                );

                if (err.extensions?.code === 'UNAUTHENTICATED') {
                    go_to_login = true;
                }
            }

            // by shkoh 20210913: 사용 토큰이 만료되면 자동으로 로그인 페이지로 이동
            if (go_to_login) {
                store.dispatch('sessionStorage/SIGNOUT').then(() => {
                    redirect('/login');
                });
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
