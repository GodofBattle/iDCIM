import { Middleware, Context } from "@nuxt/types";
import { decode } from 'jsonwebtoken';

const authenticated_icomer: Middleware = async ({ $apolloHelpers, redirect, error, store }: Context) => {
    const token = $apolloHelpers.getToken();
    if (token) {
        const { iDCIM: { roles } }: any = decode(token);

        if (roles !== 'PERM01') {
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

export default authenticated_icomer;