<template>
    <div
        id="tab-header-list"
        class="p-tabview p-component p-tabview-scrollable"
    >
        <div class="i-tree-navigation p-tabview-nav-container">
            <button
                v-if="!backwardIsDisabled"
                ref="prevBtn"
                v-ripple
                :class="prevButtonClasses"
                :disabled="backwardIsDisabled"
                type="button"
                @click="navBackward"
            >
                <span class="pi pi-chevron-left"></span>
            </button>
            <div ref="content" class="p-tabview-nav-content" @scroll="onScroll">
                <ul
                    ref="nav"
                    :class="['p-tabview-nav', { 'i-border-top': isBottom }]"
                    role="tablist"
                >
                    <li
                        v-for="(tab, i) of tabs"
                        :key="getKey(tab, i)"
                        role="presentation"
                        :class="[
                            {
                                'p-highlight': d_activeIndex === i,
                                'p-disabled': isTabDisabled(tab)
                            }
                        ]"
                    >
                        <a
                            v-ripple
                            role="tab"
                            class="p-tabview-nav-link"
                            :aria-selected="d_activeIndex"
                            :tabindex="isTabDisabled(tab) ? null : '0'"
                            @click="onTabClick($event, i)"
                            @keydown="onTabKeydown($event, i)"
                        >
                            <span v-if="tab.header" class="p-tabview-title">
                                {{ tab.header }}
                            </span>
                        </a>
                    </li>
                    <li ref="inkbar" class="p-tabview-ink-bar"></li>
                </ul>
            </div>
            <button
                v-if="!forwardIsDisabled"
                ref="nextBtn"
                v-ripple
                :class="nextButtonClasses"
                :disabled="forwardIsDisabled"
                type="button"
                @click="navForward"
            >
                <span class="pi pi-chevron-right"></span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Ripple from 'primevue/ripple';
import Component from '@/plugins/nuxt-class-component';
import ObjectUtils from '@/plugins/primevue.ObjectUtils';
import DomHandler from '@/plugins/primevue.DomHandler';

type TabItem = {
    [index: string]: string | boolean;
    header: string;
    disabled: boolean;
};

@Component<TabHeaderList>({
    directives: {
        ripple: Ripple
    },
    props: {
        tabs: {
            type: Array,
            default: null
        },
        activeIndex: {
            type: Number,
            default: 0
        },
        alignment: {
            type: String,
            default: 'top'
        }
    },
    watch: {
        activeIndex(new_index) {
            this.d_activeIndex = new_index;
            this.updateScrollBar(new_index);
        }
    }
})
export default class TabHeaderList extends Vue {
    $refs!: {
        content: any;
        nav: any;
        prevBtn: any;
        nextBtn: any;
        inkbar: any;
    };

    d_activeIndex: number = this.$props.activeIndex;
    backwardIsDisabled: boolean = true;
    forwardIsDisabled: boolean = false;

    mounted() {
        this.updateButtonState();
        this.updateInkBar();
    }

    updated() {
        this.updateInkBar();
    }

    getKey(tab: TabItem, index: number) {
        return tab.type ? ObjectUtils.resolveFieldData(tab, tab.type) : index;
    }

    isTabDisabled(tab: TabItem) {
        return tab.disabled;
    }

    onTabClick(event: MouseEvent | KeyboardEvent, i: number) {
        if (
            !this.isTabDisabled(this.$props.tabs[i]) &&
            i !== this.d_activeIndex
        ) {
            this.d_activeIndex = i;
            this.$emit('update:activeIndex', this.d_activeIndex);

            this.$emit('tab-change', {
                originalEvent: event,
                index: i
            });

            this.updateScrollBar(i);
        }

        this.$emit('tab-click', {
            originalEvent: event,
            index: i
        });
    }

    onTabKeydown(event: KeyboardEvent, i: number) {
        if (event.key === 'Enter') {
            this.onTabClick(event, i);
        }
    }

    onScroll(event: Event) {
        this.updateButtonState();
        event.preventDefault();
    }

    updateInkBar() {
        if (this.$refs.nav.children.length > 1) {
            const tabHeader = this.$refs.nav.children[this.d_activeIndex];

            this.$refs.inkbar.style.width =
                DomHandler.getWidth(tabHeader) + 'px';
            this.$refs.inkbar.style.left =
                DomHandler.getOffset(tabHeader).left -
                DomHandler.getOffset(this.$refs.nav).left +
                'px';
        }
    }

    updateScrollBar(index: number) {
        const tabHeader = this.$refs.nav.children[index];
        tabHeader.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    updateButtonState() {
        const content = this.$refs.content;

        const { scrollLeft, scrollWidth } = content;
        const width = DomHandler.getWidth(content);

        this.backwardIsDisabled = scrollLeft === 0;
        this.forwardIsDisabled = scrollLeft === scrollWidth - width;
    }

    getVisibleButtonWidths() {
        const { prevBtn, nextBtn } = this.$refs;
        return [prevBtn, nextBtn].reduce(
            (acc: number, ele: HTMLElement) =>
                ele ? acc + DomHandler.getWidth(ele) : acc,
            0
        );
    }

    navBackward() {
        const content = this.$refs.content;
        const width =
            DomHandler.getWidth(content) - this.getVisibleButtonWidths();
        const pos = content.scrollLeft - width;

        content.scrollLeft = pos <= 0 ? 0 : pos;
    }

    navForward() {
        const content = this.$refs.content;
        const width =
            DomHandler.getWidth(content) - this.getVisibleButtonWidths();
        const pos = content.scrollLeft + width;
        const lastPos = content.scrollWidth - width;

        content.scrollLeft = pos >= lastPos ? lastPos : pos;
    }

    get prevButtonClasses(): Array<string | object> {
        return [
            'p-tabview-nav-prev p-tabview-nav-btn p-link',
            { 'p-disabled': this.backwardIsDisabled }
        ];
    }

    get nextButtonClasses(): Array<string | object> {
        return [
            'p-tabview-nav-next p-tabview-nav-btn p-link',
            { 'p-disabled': this.forwardIsDisabled }
        ];
    }

    get isBottom(): boolean {
        return this.$props.alignment === 'bottom';
    }
}
</script>

<style lang="scss" scoped>
#tab-header-list::v-deep {
    .p-tabview-nav.i-border-top {
        border-width: 2px 0 0 0;

        .p-tabview-nav-link {
            border-color: var(--surface-border) transparent transparent
                transparent;
            border-width: 2px 0 0 0;
            border-bottom-left-radius: 3px;
            border-bottom-right-radius: 3px;
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
            margin: -2px 0 0 0;
        }

        .p-highlight .p-tabview-nav-link {
            border-color: var(--primary-color);
        }

        li:not(.p-highlight):not(.p-disabled):hover .p-tabview-nav-link {
            border-color: var(--primary-color);
        }
    }
}
</style>
