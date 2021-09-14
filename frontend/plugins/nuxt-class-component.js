import Component from 'vue-class-component';

Component.registerHooks([
    // vue-apollo
    'apollo',
    // nuxt
    'asyncData',
    'beforeRouteEnter',
    'beforeRouteLeave',
    'fetch',
    'head',
    'layout',
    'middleware',
    'scrollToTop',
    'transition',
    'validate',
    'refs'
]);

export default Component;
