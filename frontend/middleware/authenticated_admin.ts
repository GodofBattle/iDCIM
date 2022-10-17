import { Middleware, Context } from "@nuxt/types";
import { decode } from 'jsonwebtoken';

const authenticated_admin: Middleware = async ({ $apolloHelpers, redirect, error, store }: Context) => {
    const token = $apolloHelpers.getToken();

    if (token) {
        const [access_token, refresh_token] = token.split(' ');
        const { iDCIM: { roles } }: any = decode(access_token);

        if (roles !== 'PERM02') {
            error({ statusCode: 404, message: 'This page could not be found' });
        } else {
            await store
                .dispatch('sessionStorage/USER')
                .catch(async ({ isError }) => {
                    if (isError) {
                        redirect({ name: 'login' });
                    }
                });
        }
    } else {
        redirect({ name: 'login' });
    }
};

export default authenticated_admin;