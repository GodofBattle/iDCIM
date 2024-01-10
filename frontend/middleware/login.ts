import { Middleware, Context } from "@nuxt/types";
import { decode, JwtPayload } from "jsonwebtoken";

const middleware_login: Middleware = async ({ $apolloHelpers, store, redirect, app }: Context) => {
    const token = $apolloHelpers.getToken();

    if(token) {
        const [access_token, refresh_token] = token.split(' ');
        const iDCIM: JwtPayload | null | string = decode(access_token);
        
        if(iDCIM === null || typeof iDCIM === 'string') {
            return await store.dispatch('sessionStorage/SIGNOUT');
        }

        const { iDCIM: { roles }, exp } = iDCIM;

        // by shkoh 20230327: 로그인 페이지 진입 시에 기한이 만료된 토큰을 가지고 있는 경우에는 강제 종료를 수행함
        const now = (new Date()).getTime() / 1000;
        if(exp && exp < now) {
            return await store.dispatch('sessionStorage/SIGNOUT');
        }

        switch(roles) {
            case 'PERM01': { return redirect('/icomer/sensor'); }
            case 'PERM02': { return redirect('/admin/manager'); }
            case 'PERM03': { return redirect('/operator/home'); }
            default: {
                return await store.dispatch('sessionStorage/SIGNOUT');
            }
        }
    }
};

export default middleware_login;