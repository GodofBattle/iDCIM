import path from 'path';

require('dotenv').config({ path: __dirname + '/../.env' });

export default {
    // by shkoh 20210709: Server Side Rendering
    target: 'server',
    // by shkoh 20210709: Server-side rendering enabled
    ssr: true,

    // by shkoh 20210817: Nuxt 환경변수
    env: {
        API_HOST: process.env.API_HOST,
        API_PORT: process.env.API_PORT
    },

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
    plugins: [
        '@/plugins/nuxt-class-component.js',
        '@/plugins/apolloClient.ts',
        '@/plugins/apolloHelper.ts',
        '@/plugins/primevue.toastService.ts',
        '@/plugins/vueEventBus.ts',
        { src: '@/plugins/primevue.confirmEventBus.ts', mode: 'client' },
        { src: '@/plugins/primevue.theme.ts', mode: 'server' }
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: {
        dirs: [
            '@/components',
            '@/components/common',
            '@/components/custom',
            '@/components/user',
            '@/components/sensor',
            '@/components/tree',
            '@/components/manufacturer',
            '@/components/product',
            '@/components/interface',
            '@/components/threshold',
            '@/components/site'
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
        '@nuxtjs/apollo',
        ['nuxt-vuex-localstorage', { mode: 'debug' }],
        '@nuxtjs/style-resources',

        // by shkoh 20220120: primevue/nuxt를 생성하는 모듈에서 theme에 따라 css style을 변경하기 위해서는 기본적으로 제공하는 모듈을 사용할 수 없어서 따로 모듈 만들어서 필요한 부분만 수행함
        // 'primevue/nuxt'
        '@/modules/primevue.custom.module.js'
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

    loading: '@/components/common/loading.vue',

    loadingIndicator: {
        name: 'circle',
        color: '#3B8070',
        background: 'white'
    },

    // by shkoh 20210709: primevue2
    primevue: {
        // theme: 'vela-blue',
        // theme: 'saga-blue',
        // theme: 'arya-orange',
        // theme: 'nova-vue',
        // theme: 'luna-blue',
        // theme: 'mdc-dark-indigo',
        // theme: 'bootstrap4-light-blue',
        // theme: 'bootstrap4-dark-blue',
        ripple: true,
        components: [
            'AutoComplete',
            'Avatar',
            'Button',
            'Card',
            'Checkbox',
            'Column',
            'ColumnGroup',
            'DataTable',
            'DataView',
            'Divider',
            'DropDown',
            'FileUpload',
            'Inplace',
            'InputMask',
            'InputNumber',
            'InputSwitch',
            'InputText',
            'OverlayPanel',
            'Panel',
            'Password',
            'PickList',
            'ScrollPanel',
            'SelectButton',
            'Slider',
            'Tag',
            'TabMenu',
            'TabPanel',
            'TabView',
            'Textarea',
            'TieredMenu',
            'Toolbar',
            'Toast',
            'Tree'
        ],
        directives: ['Tooltip']
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
                    },
                    {
                        path: '/sensor',
                        name: 'sensor',
                        component: 'pages/icomer/sensor.vue',
                        meta: {
                            title: '센서코드'
                        }
                    },
                    {
                        path: '/product',
                        name: 'product',
                        component: 'pages/icomer/product.vue',
                        meta: {
                            title: '제품'
                        }
                    },
                    {
                        path: '/interface',
                        name: 'interface',
                        component: 'pages/icomer/interface.vue',
                        meta: {
                            title: '인터페이스'
                        }
                    },
                    {
                        path: '/threshold',
                        name: 'threshold',
                        component: 'pages/icomer/threshold.vue',
                        meta: {
                            title: '인터페이스'
                        }
                    },
                    {
                        path: '/site',
                        name: 'site',
                        component: 'pages/icomer/site.vue',
                        meta: {
                            title: '사이트'
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
