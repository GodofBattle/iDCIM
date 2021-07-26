import { Plugin } from '@nuxt/types';

import Vue from 'vue';
import ToastService from 'primevue/toastservice';

const useToast: Plugin = ({ app }) => {
    ToastService.install(Vue);
};

export default useToast;
