<template>
    <ul
        ref="element"
        :class="containerClass"
        role="'menubar' : 'menu'"
        aria-orientation="horizontal"
    >
        <template v-for="(item, i) of model">
            <li
                v-if="visible(item) && !item.separator"
                :key="label(item) + i.toString()"
                :class="getItemClass(item)"
                :style="item.style"
                role="none"
                @mouseenter="onItemMouseEnter($event, item)"
            >
                <nuxt-link
                    v-if="item.to && !disabled(item)"
                    v-slot="{ href, isActive, isExactActive, navigate }"
                    :to="item.to"
                    custom
                >
                    <a
                        v-ripple
                        :href="href"
                        :class="linkClass(item, { isActive, isExactActive })"
                        role="menuitem"
                        @click="onItemClick($event, item, navigate)"
                        @keydown="onItemKeyDown($event, item)"
                    >
                        <span :class="['p-menuitem-icon', item.icon]"></span>
                        <span class="p-menuitem-text">{{ label(item) }}</span>
                        <span
                            v-if="item.items"
                            class="p-submenu-icon pi pi-angle-right"
                        ></span>
                    </a>
                </nuxt-link>
                <a
                    v-else
                    v-ripple
                    :href="item.url"
                    :class="linkClass(item)"
                    :target="item.target"
                    :aria-haspopup="item.items != null"
                    :aria-expanded="item === activeItem"
                    role="menuitem"
                    :tabindex="disabled(item) ? null : '0'"
                    @click="onItemClick($event, item)"
                    @keydown="onItemKeyDown($event, item)"
                >
                    <span :class="['p-menuitem-icon', item.icon]"></span>
                    <span class="p-menuitem-text">{{ label(item) }}</span>
                    <span
                        v-if="item.items"
                        class="p-submenu-icon pi pi-angle-right"
                    ></span>
                </a>
                <i-menu-sub
                    v-if="visible(item) && item.items"
                    :key="label(item) + '_sub_'"
                    :model="item.items"
                    :parent-active="item === activeItem"
                    :exact="exact"
                    @leaf-click="onLeafClick"
                    @keydown-item="onChildItemKeyDown"
                />
            </li>
            <li
                v-if="visible(item) && item.separator"
                :key="'separator' + i.toString()"
                :class="['p-menu-separator', item.class]"
                :style="item.style"
                role="separator"
            ></li>
        </template>
    </ul>
</template>

<script>
import Ripple from 'primevue/ripple/Ripple';
import DomHandler from '@/plugins/primevue.DomHandler';

export default {
    name: 'IMenuSub',
    directives: {
        ripple: Ripple
    },
    props: {
        root: {
            type: Boolean,
            default: false
        },
        model: {
            type: Array,
            default: null
        },
        template: {
            type: Function,
            default: null
        },
        exact: {
            type: Boolean,
            default: true
        },
        parentActive: {
            type: Boolean,
            default: false
        },
        popup: {
            type: Boolean,
            default: false
        }
    },
    documentClickListener: null,
    data() {
        return {
            activeItem: null
        };
    },
    computed: {
        containerClass() {
            return { 'p-submenu-list': !this.root };
        }
    },
    watch: {
        parentActive(newValue) {
            if (!newValue) {
                this.activeItem = null;
            }
        }
    },
    updated() {
        if (this.root && this.activeItem) {
            this.bindDocumentClickListener();
        }
    },
    beforeDestroy() {
        this.unbindDocumentClickListener();
    },
    methods: {
        label(item) {
            return typeof item.label === 'function' ? item.label() : item.label;
        },
        getItemClass(item) {
            return [
                'p-menuitem',
                item.class,
                {
                    'p-menuitem-active': this.activeItem === item
                }
            ];
        },
        visible(item) {
            return typeof item.visible === 'function'
                ? item.visible()
                : item.visible !== false;
        },
        disabled(item) {
            return typeof item.disabled === 'function'
                ? item.disabled()
                : this.disabled === true;
        },
        linkClass(item, routerProps) {
            return [
                'p-menuitem-link',
                {
                    'p-disabled': this.disabled(item),
                    'router-link-active': routerProps && routerProps.isActive,
                    'router-link-active-exact':
                        this.exact && routerProps && routerProps.isExactActive
                }
            ];
        },
        onItemMouseEnter(event, item) {
            if (this.disabled(item)) {
                event.preventDefault();
                return;
            }

            if (this.root) {
                if (this.activeItem || this.popup) {
                    this.activeItem = item;
                } else if (item.items) {
                    this.activeItem = item;
                }
            } else {
                this.activeItem = item;
            }
        },
        onItemClick(event, item) {
            if (this.disabled(item)) {
                event.preventDefault();
                return;
            }

            if (!item.url && !item.to) {
                event.preventDefault();
            }

            if (item.command) {
                item.command({
                    originalEvent: event,
                    item
                });
            }

            if (item.items) {
                if (this.activeItem && item === this.activeItem)
                    this.activeItem = null;
                else this.activeItem = item;
            }

            if (!item.items) {
                this.onLeafClick();
            }
        },
        onLeafClick() {
            this.activeItem = null;
            this.$emit('leaf-click');
        },
        onItemKeyDown(event, item) {
            const listItem = event.currentTarget.parentElement;

            switch (event.which) {
                case 40: {
                    // by shkoh 20220304: down
                    const nextItem = this.findNextItem(listItem);
                    if (nextItem) {
                        nextItem.children[0].focus();
                    }

                    event.preventDefault();
                    break;
                }
                case 38: {
                    // by shkoh 20220304: up
                    const prevItem = this.findPrevItem(listItem);
                    if (prevItem) {
                        prevItem.children[0].focus();
                    }
                    event.preventDefault();
                    break;
                }
                case 39: {
                    // by shkoh 20220304: right
                    if (item.items) {
                        this.activeItem = item;
                        setTimeout(() => {
                            listItem.children[1].children[0].children[0].focus();
                        }, 50);
                    }

                    event.preventDefault();
                    break;
                }
                default: {
                    break;
                }
            }
        },
        onChildItemKeyDown(event) {
            // by shkoh 20220304: left
            if (event.originalEvent.which === 37) {
                this.activeItem = null;
                event.element.parentElement.previousElementSibling.focus();
            }
        },
        findNextItem(item) {
            const nextItem = item.nextElementSibling;
            if (nextItem) {
                return DomHandler.hasClass(nextItem, 'p-disabled') ||
                    !DomHandler.hasClass(nextItem, 'p-menuitem')
                    ? this.findNextItem(nextItem)
                    : nextItem;
            } else {
                return null;
            }
        },
        findPrevItem(item) {
            const prevItem = item.previousElementSibling;
            if (prevItem) {
                return DomHandler.hasClass(prevItem, 'p-disabled') ||
                    !DomHandler.hasClass(prevItem, 'p-menuitem')
                    ? this.findPrevItem(prevItem)
                    : prevItem;
            } else {
                return null;
            }
        },
        bindDocumentClickListener() {
            if (!this.documentClickListener) {
                this.documentClickListener = (event) => {
                    if (this.$el && !this.$el.contains(event.target)) {
                        this.activeItem = null;
                        this.unbindDocumentClickListener();
                    }
                };

                document.addEventListener('click', this.documentClickListener);
            }
        },
        unbindDocumentClickListener() {
            if (this.documentClickListener) {
                document.removeEventListener(
                    'click',
                    this.documentClickListener
                );
                this.documentClickListener = null;
            }
        }
    }
};
</script>

<style scoped>
.p-tieredmenu .p-submenu-list {
    z-index: 9999;
}
</style>
