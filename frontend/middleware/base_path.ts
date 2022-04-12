import { Middleware, Context } from "@nuxt/types";
import { decode } from 'jsonwebtoken';

const base_path: Middleware = async ({ $apolloHelpers, route, redirect, store }: Context) => {
    const token = $apolloHelpers.getToken();

    if (!token && route?.path === '/') {
        redirect({ name: 'login' });
    } else if (token && route?.path === '/') {
        try {
            const { iDCIM: { roles } }: any = decode(token);

            if (roles === 'PERM01') {
                redirect({ path: '/icomer/code' });
            } else if (roles === 'PERM02') {
                redirect({ path: '/admin/home' });
            }
        } catch (error) {
            console.error(error);
        }
    }
};

export default base_path;