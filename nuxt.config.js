export default {
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: 'iDCIM',
        htmlAttrs: {
            lang: 'kr',
        },
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            { hid: 'description', name: 'description', content: '' },
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ['primeflex/primeflex.css', '@assets/css/main.css'],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://go.nuxtjs.dev/typescript
        '@nuxt/typescript-build',
    ],

    primevue: {
        // theme: 'saga-blue',
        theme: 'vela-blue',
        // theme: 'arya-orange',
        // theme: 'nova-vue',
        // theme: 'luna-blue',
        // theme: 'mdc-dark-indigo',
        // theme: 'bootstrap4-light-blue',
        // theme: 'bootstrap4-dark-blue',
        ripple: true,
        components: [
            'ScrollPanel',
            'Panel',
            'Button',
            'TieredMenu',
            'Divider',
            'Tag',
            'Toolbar',
            'OverlayPanel',
        ],
    },

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://go.nuxtjs.dev/axios
        '@nuxtjs/axios',
        'primevue/nuxt',
    ],

    // by shkoh 2021.05.31: Sever Host 설정
    server: {
        host: '0',
    },

    router: {
        base: '/dcim/',
        routes: [
            {
                path: '/icomer',
                children: [
                    {
                        path: '/',
                        name: 'icomer',
                        component: 'pages/icomer/index.vue',
                        meta: {
                            title: '센서코드',
                        },
                    },
                    {
                        path: '/code',
                        name: 'code',
                        component: 'pages/icomer/code.vue',
                        meta: {
                            title: '코드',
                            requireAuth: false,
                        },
                    },
                ],
            },
        ],
    },

    // by shkoh: 2021.05.31: Server Middleware 추가
    serverMiddleware: [{ path: '/api', handler: '~/api/app.ts' }],

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {},

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        transpile: ['primevue', 'vuex-module-decorators'],
    },
};
