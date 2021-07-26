import { Context } from '@nuxt/types';
import { onError } from 'apollo-link-error';

const configuer = (context: Context) => {
    const apolloError = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path }) =>
                console.info(
                    `[GraphQL Error] Message: ${message}, Location: ${JSON.stringify(
                        locations
                    )}, path: ${path}`
                )
            );
        }

        // by shkoh 20210720: apollo client 사용 중 networkError가 발생한 경우, 에러 페애지로 이동
        if (networkError) {
            context.error({ message: networkError.message, statusCode: 404 });
        }
    });

    return {
        link: apolloError,
        httpEndpoint: 'http://10.10.20.29:4000/api',
        httpLinkOptions: {
            credentials: 'same-origin'
        }
    };
};

export default configuer;
