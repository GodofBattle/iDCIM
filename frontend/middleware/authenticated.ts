import { Middleware } from '@nuxt/types';

const authenticated: Middleware = () => {
    console.info('middleware');
};

export default authenticated;
