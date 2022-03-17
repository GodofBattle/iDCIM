import { Middleware, Context } from '@nuxt/types';

const authenticated: Middleware = async ({
    store,
    route,
    redirect,
    $apolloHelpers,
    from,
    error,
}: Context) => {
    console.info(from);
    if (route.name === 'login') {
        console.info('login');
        const apollo_token = $apolloHelpers.getToken();
        console.info(from);
        if (apollo_token && from) {
            redirect({ name: from.name ?? '/' });
        }
        return;
    }

    const apollo_token = $apolloHelpers.getToken();
    // by shkoh 20220317: 서버로부터 받은 토큰이 존재하지 않은 경우에는 login 페이지로 이동
    if (!apollo_token && route.name !== 'login') {
        console.info('session out');
        redirect({ name: 'login' });
        return;
    }

    if (apollo_token) {
        // by shkoh 20210726: 페이지가 이동할 때마다, 토큰이 정상적인지 확인한다. 비정상적인 경우에 강제 로그아웃 한다
        await store
            .dispatch('sessionStorage/USER')
            .catch(async ({ isError }) => {
                if (isError) {
                    redirect({ name: 'login' });
                }
            });
    }
};

export default authenticated;
