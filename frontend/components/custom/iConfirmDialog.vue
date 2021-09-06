<template>
    <ConfirmDialog
        :visible="visible"
        :modal="true"
        :header="header"
        :block-scroll="blockScroll"
        :position="position"
        class="p-confirm-dialog"
        @click="closeDialog($event)"
    >
        <i :class="iconClass" />
        <div class="p-confirm-dialog-message">
            <span v-html="message"></span>
        </div>
        <template #footer>
            <ConfirmButton
                :label="rejectLabel"
                :icon="rejectIcon"
                :class="rejectClass"
                @click="reject()"
            />
            <ConfirmButton
                :label="acceptLabel"
                :icon="acceptIcon"
                :class="acceptClass"
                autofocus
                @click="accept()"
            />
        </template>
    </ConfirmDialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import DomHandler from 'primevue/utils/DomHandler';

import { eventBus } from '@/plugins/vueEventBus';

export default {
    components: {
        ConfirmDialog: Dialog,
        ConfirmButton: Button
    },
    props: {
        group: String
    },
    data: () => ({
        visible: false,
        confirmation: null
    }),
    computed: {
        header() {
            return this.confirmation ? this.confirmation.header : null;
        },
        blockScroll() {
            return this.confirmation ? this.confirmation.blockScroll : true;
        },
        position() {
            return this.confirmation ? this.confirmation.position : null;
        },
        iconClass() {
            return [
                'p-confirm-dialog-icon',
                this.confirmation ? this.confirmation.icon : null
            ];
        },
        message() {
            return this.confirmation
                ? this.confirmation.message.split(/\n/).join('<br/>')
                : null;
        },
        rejectLabel() {
            return this.confirmation
                ? this.confirmation.rejectLabel ||
                      this.$primevue.config.locale.reject
                : null;
        },
        rejectIcon() {
            return this.confirmation ? this.confirmation.rejectIcon : null;
        },
        rejectClass() {
            return [
                'p-confirm-dialog-reject',
                this.confirmation
                    ? this.confirmation.rejectClass || 'p-button-text'
                    : null
            ];
        },
        acceptLabel() {
            return this.confirmation
                ? this.confirmation.acceptLabel ||
                      this.$primevue.config.locale.accept
                : null;
        },
        acceptIcon() {
            return this.confirmation ? this.confirmation.acceptIcon : null;
        },
        acceptClass() {
            return [
                'p-confirm-dialog-accept',
                this.confirmation ? this.confirmation.acceptClass : null
            ];
        }
    },
    mounted() {
        eventBus.$on('confirmDialog', (options) => {
            if (!options) return;

            if (options.group === this.group) {
                this.confirmation = options;
                this.visible = true;
            }
        });

        eventBus.$on('closeConfirmDialog', () => {
            this.visible = false;
            this.confirmation = null;
        });
    },
    beforeDestroy() {
        eventBus.$off('confirmDialog');
        eventBus.$off('closeConfirmDialog');
    },
    methods: {
        closeDialog($event) {
            if (
                DomHandler.hasClass($event.target, 'p-dialog-header-close') ||
                DomHandler.hasClass($event.target, 'p-dialog-header-close-icon')
            ) {
                this.visible = false;
            }
        },
        reject() {
            console.info('reject');
            if (this.confirmation?.reject) {
                this.confirmation.reject();
            }
            this.visible = false;
        },
        accept() {
            if (this.confirmation?.accept) this.confirmation.accept();

            this.visible = false;
        }
    }
};
</script>
