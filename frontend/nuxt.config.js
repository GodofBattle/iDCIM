export default {
    // by shkoh 20210709: Server Side Rendering
    target: 'server',
    // by shkoh 20210709: Server-side rendering enabled
    ssr: true,

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: 'iDCIM',
        htmlAttrs: {
            lang: 'kr'
        },
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            { hid: 'description', name: 'description', content: '' },
            { name: 'format-detection', content: 'telephone=no' }
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }]
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
        'primeflex/primeflex.scss',
        '@/assets/css/main.css',
        '@/assets/css/custom.primevue.css'
    ],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: ['@/plugins/apolloClient.ts', '@/plugins/apolloHelper.ts'],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: {
        dirs: [
            '@/components',
            '@/components/common',
            '@/components/custom',
            '@/components/user'
        ]
    },

    // by shkoh 20210716: static은 단순 절대 경로로 사용
    static: {
        prefix: false
    },

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://go.nuxtjs.dev/typescript
        '@nuxt/typescript-build'
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://go.nuxtjs.dev/axios
        '@nuxtjs/axios',
        'primevue/nuxt',
        '@nuxtjs/apollo',
        ['nuxt-vuex-localstorage', { mode: 'debug' }]
    ],

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {},

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        transpile: ['primevue']
    },

    server: {
        host: '0'
    },

    vue: {
        config: {
            devtools: false
        }
    },

    loading: true,

    // by shkoh 20210709: primevue2
    primevue: {
        theme: 'vela-blue',
        // theme: 'saga-blue',
        // theme: 'arya-orange',
        // theme: 'nova-vue',
        // theme: 'luna-blue',
        // theme: 'mdc-dark-indigo',
        // theme: 'bootstrap4-light-blue',
        // theme: 'bootstrap4-dark-blue',
        ripple: true,
        components: [
            'Button',
            'Divider',
            'InputSwitch',
            'InputText',
            'OverlayPanel',
            'Panel',
            'Password',
            'PickList',
            'ScrollPanel',
            'Tag',
            'TieredMenu',
            'Toolbar',
            'Card',
            'Toast'
        ]
    },

    // by shkoh 20210709: DCIM route
    router: {
        base: '/dcim',
        middleware: ['authenticated'],
        routes: [
            {
                name: 'login',
                path: '/login'
            },
            {
                name: 'icomer',
                path: '/icomer',
                children: [
                    {
                        path: '/code',
                        name: 'code',
                        component: 'pages/icomer/code.vue',
                        meta: {
                            title: '코드'
                        }
                    }
                ]
            }
        ]
    },

    // by shkoh 20210712: apollo client settings
    apollo: {
        tokenName: 'idcim.token',
        defaultOptions: {
            $query: {
                fetchPolicy: 'cache-and-network'
            }
        },
        clientConfigs: {
            default: '@/plugins/apollo.config.ts'
        }
    }
};
