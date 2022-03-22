/**
 * by shkoh 20220318
 * 
 * 참조: https://nuxtjs.org/docs/configuration-glossary/configuration-hooks#redirect-to-routerbase-when-not-on-root
 * 
 * nuxt.config.js에서 router.base를 '/'가 아닌 '/DCIM'으로 설정하여 domain 없이 서비스를 하기 위해서는 해당 부분이 필요
 */

import parseurl from 'parseurl';

export default routeBase => function hooksRouteRedirectPortal(req, res, next) {
    const desired_context_root_reg_exp = new RegExp(`^${routeBase}`);
    const _parsedUrl = Reflect.has(req, '_parsedUrl') ? req._parsedUrl : null;
    const url = _parsedUrl !== null ? _parsedUrl : parseurl(req);

    const starts_with_desired = desired_context_root_reg_exp.test(url.pathname);
    const is_not_proper_context_root = routeBase !== url.pathname;

    if (is_not_proper_context_root && starts_with_desired === false) {
        const pathname = url.pathname === null ? '' : url.pathname;
        const search = url.search === null ? '' : url.search;
        const location = routeBase + pathname + search;

        res.writeHead(302, { location });
        res.end();
    }

    next();
};