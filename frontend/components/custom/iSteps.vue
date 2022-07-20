<template>
    <div :id="id" :class="containerClass">
        <ul role="tablist">
            <template v-for="(item, index) of model">
                <li
                    v-if="showItem(item)"
                    :key="index"
                    role="tab"
                    :class="getItemClass(item, index)"
                    :style="item.style"
                    :aria-selected="isActive(index)"
                >
                    <a
                        v-if="!isItemDisabled(item, index)"
                        role="presentation"
                        :class="linkClass()"
                        :style="{ 'user-select': 'none' }"
                        @click="onItemClick($event, item, index)"
                    >
                        <span class="p-steps-number">{{ index + 1 }}</span>
                        <span class="p-steps-title">{{ label(item) }}</span>
                    </a>
                    <span
                        v-else
                        role="presentation"
                        class="p-menuitem-link"
                        :style="{ 'user-select': 'none' }"
                    >
                        <span class="p-steps-number">{{ index + 1 }}</span>
                        <span class="p-steps-title">{{ label(item) }}</span>
                    </span>
                </li>
            </template>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import UniqueComponentId from '@/plugins/primevue.UniqueComponentId';

interface StepItem {
    [index: string]: string | boolean | Function;
    label: string | Function;
    disabled: boolean | Function;
    visible: boolean;
    style: any;
}

@Component<IcomerSteps>({
    props: {
        id: {
            type: String,
            default: UniqueComponentId()
        },
        model: {
            type: Array,
            default: null
        },
        readonly: {
            type: Boolean,
            default: true
        },
        activeIndex: {
            type: Number,
            default: 0
        }
    },
    watch: {
        activeIndex(_index: number) {
            this.d_activeIndex = _index;
        }
    }
})
export default class IcomerSteps extends Vue {
    d_activeIndex: number = this.$props.activeIndex;

    getItemClass(item: StepItem, index: number) {
        return [
            'p-steps-item',
            item.class,
            {
                'p-highlight p-steps-current': this.isActive(index),
                'p-disabled': this.isItemDisabled(item, index)
            }
        ];
    }

    linkClass() {
        return ['p-menuitem-link', 'i-steps-link'];
    }

    isActive(index: number) {
        return index === this.d_activeIndex;
    }

    isItemDisabled(item: StepItem, index: number) {
        return (
            this.disabled(item) ||
            (this.$props.readonly && !this.isActive(index))
        );
    }

    label(item: StepItem) {
        return typeof item.label === 'function' ? item.label() : item.label;
    }

    disabled(item: StepItem) {
        return typeof item.disabled === 'function'
            ? item.disabled()
            : item.disabled;
    }

    showItem(item: StepItem) {
        return item.visible !== false;
    }

    onItemClick(event: PointerEvent, item: StepItem, index: number) {
        if (this.disabled(item) || this.$props.readonly) {
            event.preventDefault();
            return;
        }

        this.$emit('update:activeIndex', index);
    }

    get containerClass(): Array<string | object> {
        return [
            'p-steps p-component',
            {
                'p-readonly': this.$props.readonly
            }
        ];
    }
}
</script>

<style lang="scss" scoped>
.i-steps-link {
    cursor: pointer;
}
</style>
