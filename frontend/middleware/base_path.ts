import { Middleware, Context } from "@nuxt/types";

const base_path: Middleware = async ({ $apolloHelpers, route, redirect, store }: Context) => {
    const token = $apolloHelpers.getToken();

    if (!token && route?.path === '/') {
        redirect({ name: 'login' });
    }
};

export default base_path;