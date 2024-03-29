import { eventBus } from '@/plugins/vueEventBus';
import { Plugin } from '@nuxt/types';

interface ConfirmDialogMethods {
    require(options: any): any;
    close(): void;
}

declare module 'vue/types/vue' {
    interface Vue {
        $confirmDialog: ConfirmDialogMethods;
    }
}

const install: Plugin = ({}, inject) => {
    const confirmDialogMethods: ConfirmDialogMethods = {
        require: (options: JSON) => {
            eventBus.$emit('confirmDialog', options);
        },
        close: () => {
            eventBus.$emit('closeConfirmDialog');
        }
    };

    inject('confirmDialog', confirmDialogMethods);
};

export default install;
