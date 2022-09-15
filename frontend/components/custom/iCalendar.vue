<template>
    <span :class="containerClass" :style="styles">
        <InputText
            v-if="!inline"
            ref="input"
            type="text"
            v-bind="$attrs"
            :value="inputFieldValue"
            :readonly="!manualInput"
            :aria-labelledby="ariaLabelledBy"
            inputmode="none"
            :class="inputClass"
            :style="inputStyle"
            v-on="listeners"
        />
        <Button
            v-if="showIcon"
            :icon="icon"
            tabindex="-1"
            class="p-datepicker-trigger"
            :disabled="$attrs.disabled"
            type="button"
            :aria-label="inputFieldValue"
            @click="onButtonClick"
        />
        <transition
            name="p-connected-overlay"
            @enter="onOverlayEnter"
            @after-enter="onOverlayEnterComplete"
            @leave="onOverlayLeave"
        >
            <div
                v-if="inline ? true : overlayVisible"
                ref="overlay"
                :class="panelStyleClass"
                :role="inline ? null : 'dialog'"
                :aria-labelledby="ariaLabelledBy"
                :style="panelStyle"
            >
                <template v-if="!timeOnly">
                    <div class="p-datepicker-group-container">
                        <div
                            v-for="(month, groupIndex) of months"
                            :key="month.year + month.month"
                            class="p-datepicker-group"
                        >
                            <div class="p-datepicker-header">
                                <slot name="header"></slot>
                                <button
                                    v-show="groupIndex === 0"
                                    class="p-datepicker-prev p-link"
                                    type="button"
                                    :disabled="$attrs.disabled"
                                    @click="onPrevButtonClick"
                                    @keydown="onContainerButtonKeydown"
                                >
                                    <span
                                        class="p-datepicker-prev-icon pi pi-chevron-left"
                                    ></span>
                                </button>
                                <div class="p-datepicker-title">
                                    <button
                                        v-if="currentView !== 'year'"
                                        type="button"
                                        class="p-datepicker-year p-link"
                                        :disabled="switchViewButtonDisabled"
                                        @click="switchToYearView"
                                        @keydown="onContainerButtonKeydown"
                                    >
                                        {{ getYear(month) }}
                                    </button>
                                    <button
                                        v-if="currentView === 'date'"
                                        type="button"
                                        class="p-datepicker-month p-link"
                                        :disabled="switchViewButtonDisabled"
                                        @click="switchToMonthView"
                                        @keydown="onContainerButtonKeydown"
                                    >
                                        {{ getMonthName(month.month) }}
                                    </button>
                                    <span
                                        v-if="currentView === 'year'"
                                        class="p-datepicker-decade"
                                    >
                                        <slot
                                            name="decade"
                                            :years="yearPickerValues"
                                        >
                                            {{
                                                getYearName(yearPickerValues[0])
                                            }}
                                            -
                                            {{
                                                getYearName(
                                                    yearPickerValues[
                                                        yearPickerValues.length -
                                                            1
                                                    ]
                                                )
                                            }}
                                        </slot>
                                    </span>
                                </div>
                                <button
                                    v-show="
                                        numberOfMonths === 1
                                            ? true
                                            : groupIndex === numberOfMonths - 1
                                    "
                                    class="p-datepicker-next p-link"
                                    type="button"
                                    :disabled="$attrs.disabled"
                                    @click="onNextButtonClick"
                                    @keydown="onContainerButtonKeydown"
                                >
                                    <span
                                        class="p-datepicker-next-icon pi pi-chevron-right"
                                    ></span>
                                </button>
                            </div>
                            <div
                                v-if="currentView === 'date'"
                                class="p-datepicker-calendar-container"
                            >
                                <table class="p-datepicker-calendar">
                                    <thead>
                                        <tr>
                                            <th
                                                v-if="showWeek"
                                                scope="col"
                                                class="p-datepicker-weekheader p-disabled"
                                            >
                                                <span>
                                                    {{ weekHeaderLabel }}
                                                </span>
                                            </th>
                                            <th
                                                v-for="weekDay of weekDays"
                                                :key="weekDay"
                                                scope="col"
                                            >
                                                <span>{{ weekDay }}</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="(week, i) of month.dates"
                                            :key="
                                                week[0].day + '' + week[0].month
                                            "
                                        >
                                            <td
                                                v-if="showWeek"
                                                class="p-datepicker-weeknumber"
                                            >
                                                <span class="p-disabled">
                                                    <span
                                                        v-if="
                                                            month.weekNumbers[
                                                                i
                                                            ] < 10
                                                        "
                                                        :style="{
                                                            visibility: hidden
                                                        }"
                                                    >
                                                        0
                                                    </span>
                                                    {{ month.weekNumbers[i] }}
                                                </span>
                                            </td>
                                            <td
                                                v-for="date of week"
                                                :key="
                                                    date.day + '' + date.month
                                                "
                                                :class="{
                                                    'p-datepicker-other-month':
                                                        date.otherMonth,
                                                    'p-datepicker-today':
                                                        date.today
                                                }"
                                            >
                                                <span
                                                    :class="{
                                                        'p-highlight':
                                                            isSelected(date),
                                                        'p-disabled':
                                                            !date.selectable
                                                    }"
                                                    draggable="false"
                                                    @click="
                                                        onDateSelect(
                                                            $event,
                                                            date
                                                        )
                                                    "
                                                    @keydown="
                                                        onDateCellKeydown(
                                                            $event,
                                                            date,
                                                            groupIndex
                                                        )
                                                    "
                                                >
                                                    <slot
                                                        name="date"
                                                        :date="date"
                                                    >
                                                        {{ date.day }}
                                                    </slot>
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div v-if="currentView === 'month'" class="p-monthpicker">
                        <span
                            v-for="(m, i) of monthPickerValues"
                            :key="m"
                            class="p-monthpicker-month"
                            :class="{ 'p-highlight': isMonthSelected(i) }"
                            @click="onMonthSelect($event, i)"
                            @keydown="onMonthCellKeydown($event, i)"
                        >
                            {{ m }}
                        </span>
                    </div>
                    <div v-if="currentView === 'year'" class="p-yearpicker">
                        <span
                            v-for="y of yearPickerValues"
                            :key="y"
                            class="p-yearpicker-year"
                            :class="{ 'p-highlight': isYearSelected(y) }"
                            @click="onYearSelect($event, y)"
                            @keydown="onYearCellKeydown($event, y)"
                        >
                            {{ y }}
                        </span>
                    </div>
                </template>
                <div v-if="showTime || timeOnly" class="p-timepicker">
                    <div class="p-hour-picker">
                        <button
                            class="p-link"
                            type="button"
                            @mousedown="
                                onTimePickerElementMouseDown($event, 0, 1)
                            "
                            @mouseup="onTimePickerElementMouseUp($event)"
                            @mouseleave="onTimePickerElementMouseLeave"
                            @keydown="onContainerButtonKeydown"
                            @keydown.enter="
                                onTimePickerElementMouseDown($event, 0, 1)
                            "
                            @keyup.enter="onTimePickerElementMouseUp($event)"
                        >
                            <span class="pi pi-chevron-up"></span>
                        </button>
                        <span>{{ formattedCurrentHour }}</span>
                        <button
                            class="p-link"
                            type="button"
                            @mousedown="
                                onTimePickerElementMouseDown($event, 0, -1)
                            "
                            @mouseup="onTimePickerElementMouseUp($event)"
                            @mouseleave="onTimePickerElementMouseLeave"
                            @keydown="onContainerButtonKeydown"
                            @keydown.enter="
                                onTimePickerElementMouseDown($event, 0, -1)
                            "
                            @keyup.enter="onTimePickerElementMouseUp($event)"
                        >
                            <span class="pi pi-chevron-down"></span>
                        </button>
                    </div>
                    <div class="p-separator">
                        <span>{{ timeSeparator }}</span>
                    </div>
                    <div class="p-minute-picker">
                        <button
                            class="p-link"
                            type="button"
                            :disabled="$attrs.disabled"
                            @mousedown="
                                onTimePickerElementMouseDown($event, 1, 1)
                            "
                            @mouseup="onTimePickerElementMouseUp($event)"
                            @mouseleave="onTimePickerElementMouseLeave"
                            @keydown="onContainerButtonKeydown"
                            @keydown.enter="
                                onTimePickerElementMouseDown($event, 1, 1)
                            "
                            @keyup.enter="onTimePickerElementMouseUp($event)"
                        >
                            <span class="pi pi-chevron-up"></span>
                        </button>
                        <span>{{ formattedCurrentMinute }}</span>
                        <button
                            class="p-link"
                            type="button"
                            :disabled="$attrs.disabled"
                            @mousedown="
                                onTimePickerElementMouseDown($event, 1, -1)
                            "
                            @mouseup="onTimePickerElementMouseUp($event)"
                            @mouseleave="onTimePickerElementMouseLeave"
                            @keydown="onContainerButtonKeydown"
                            @keydown.enter="
                                onTimePickerElementMouseDown($event, 1, -1)
                            "
                            @keyup.enter="onTimePickerElementMouseUp($event)"
                        >
                            <span class="pi pi-chevron-down"></span>
                        </button>
                    </div>
                    <div v-if="showSeconds" class="p-separator">
                        <span>{{ timeSeparator }}</span>
                    </div>
                    <div v-if="showSeconds" class="p-second-picker">
                        <button
                            class="p-link"
                            type="button"
                            :disabled="$attrs.disabled"
                            @mousedown="
                                onTimePickerElementMouseDown($event, 2, 1)
                            "
                            @mouseup="onTimePickerElementMouseUp($event)"
                            @mouseleave="onTimePickerElementMouseLeave"
                            @keydown="onContainerButtonKeydown"
                            @keydown.enter="
                                onTimePickerElementMouseDown($event, 2, 1)
                            "
                            @keyup.enter="onTimePickerElementMouseUp($event)"
                        >
                            <span class="pi pi-chevron-up"></span>
                        </button>
                        <span>{{ formattedCurrentSecond }}</span>
                        <button
                            class="p-link"
                            type="button"
                            :disabled="$attrs.disabled"
                            @mousedown="
                                onTimePickerElementMouseDown($event, 2, -1)
                            "
                            @mouseup="onTimePickerElementMouseUp($event)"
                            @mouseleave="onTimePickerElementMouseLeave"
                            @keydown="onContainerButtonKeydown"
                            @keydown.enter="
                                onTimePickerElementMouseDown($event, 2, -1)
                            "
                            @keyup.enter="onTimePickerElementMouseUp($event)"
                        >
                            <span class="pi pi-chevron-down"></span>
                        </button>
                    </div>
                    <div v-if="hourFormat === '12'" class="p-separator">
                        <span>{{ timeSeparator }}</span>
                    </div>
                    <div v-if="hourFormat === '12'" class="p-ampm-picker">
                        <button
                            class="p-link"
                            type="button"
                            :disabled="$attrs.disabled"
                            @click="toggleAMPM($event)"
                        >
                            <span class="pi pi-chevron-up"></span>
                        </button>
                        <span>{{ pm ? 'PM' : 'AM' }}</span>
                        <button
                            class="p-link"
                            type="button"
                            :disabled="$attrs.disabled"
                            @click="toggleAMPM($event)"
                        >
                            <span class="pi pi-chevron-down"></span>
                        </button>
                    </div>
                </div>
                <div v-if="showButtonBar" class="p-datepicker-buttonbar">
                    <Button
                        type="button"
                        :label="todayLabel"
                        class="p-button-text"
                        @click="onTodayButtonClick"
                        @keydown="onContainerButtonKeydown"
                    />
                    <Button
                        type="button"
                        :label="clearLabel"
                        class="p-button-text"
                        @click="onClearButtonClick"
                        @keydown="onContainerButtonKeydown"
                    />
                </div>
                <slot name="footer"></slot>
            </div>
        </transition>
    </span>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import DomHandler from '@/plugins/primevue.DomHandler';
import UniqueComponentId from '@/plugins/primevue.UniqueComponentId';
import ConnectedOverlayScrollHandler from '@/plugins/primevue.ConnectedOverlayScrollHandler';

type LocaleSettings = {
    [index: string]: number | string | Array<string>;
    firstDayOfWeek: number;
    dayNames: Array<string>;
    dayNamesShort: Array<string>;
    dayNamesMin: Array<string>;
    monthNames: Array<string>;
    monthNamesShort: Array<string>;
    today: string;
    clear: string;
    dateFormat: string;
    weekHeader: string;
    yearName: string;
};

@Component<ICalendar>({
    props: {
        appendTo: {
            type: String,
            default: null
        },
        ariaLabelledBy: {
            type: String,
            default: null
        },
        autoZIndex: {
            type: Boolean,
            default: true
        },
        baseZIndex: {
            type: Number,
            default: 0
        },
        className: {
            type: String,
            default: null
        },
        dateFormat: String,
        defaultMinute: {
            type: Number,
            default: null
        },
        disabledDates: {
            type: Array,
            default: null
        },
        disabledDays: {
            type: Array,
            default: null
        },
        hourFormat: {
            type: String,
            default: '24'
        },
        icon: {
            type: String,
            default: 'pi pi-calendar'
        },
        inline: {
            type: Boolean,
            default: false
        },
        inputClass: {
            type: Object,
            default: null
        },
        inputStyle: {
            type: Object,
            default: null
        },
        hideOnDateTimeSelect: {
            type: Boolean,
            default: false
        },
        locale: {
            type: Object,
            default: null
        },
        manualInput: {
            type: Boolean,
            default: true
        },
        maxDate: {
            type: Date,
            default: null
        },
        maxDateCount: {
            type: Number,
            default: null
        },
        minDate: {
            type: Date,
            default: null
        },
        numberOfMonths: {
            type: Number,
            default: 1
        },
        panelClass: {
            type: String,
            default: null
        },
        panelStyle: {
            type: Object,
            default: null
        },
        responsiveOptions: Array,
        selectionMode: {
            type: String,
            default: 'single'
        },
        selectOtherMonths: {
            type: Boolean,
            default: false
        },
        shortYearCutoff: {
            type: String,
            default: '+10'
        },
        showButtonBar: {
            type: Boolean,
            default: false
        },
        showIcon: {
            type: Boolean,
            default: false
        },
        showOnFocus: {
            type: Boolean,
            default: true
        },
        showOtherMonths: {
            type: Boolean,
            default: true
        },
        showSeconds: {
            type: Boolean,
            default: false
        },
        showTime: {
            type: Boolean,
            default: false
        },
        showWeek: {
            type: Boolean,
            default: false
        },
        stepHour: {
            type: Number,
            default: 1
        },
        stepMinute: {
            type: Number,
            default: 1
        },
        stepSecond: {
            type: Number,
            default: 1
        },
        styles: {
            type: Object,
            default: null
        },
        timeOnly: {
            type: Boolean,
            default: false
        },
        timeSeparator: {
            type: String,
            default: ':'
        },
        touchUI: {
            type: Boolean,
            default: false
        },
        value: {
            type: [String, Array, Object, Date],
            default: null
        },
        view: {
            type: String,
            default: 'date'
        }
    },
    inheritAttrs: false,
    watch: {
        value() {
            this.updateCurrentMetaDate();
        },
        months() {
            if (this.$refs.overlay) {
                if (!this.focused) {
                    setTimeout(this.updateFocus, 0);
                }
            }
        },
        locale(_locale) {
            for (const [key, value] of Object.entries(_locale)) {
                if (Object.keys(this.d_locale).includes(key)) {
                    if (Array.isArray(value)) {
                        this.d_locale[key] = value;
                    } else if (typeof value === 'string') {
                        this.d_locale[key] = value;
                    }
                }
            }
        }
    }
})
export default class ICalendar extends Vue {
    $refs: {
        input: any;
        overlay: any;
    };

    d_locale: LocaleSettings = {
        firstDayOfWeek: 0,
        dayNames: [
            '일요일',
            '월요일',
            '화요일',
            '수요일',
            '목요일',
            '금요일',
            '토요일'
        ],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        monthNames: [
            '1월',
            '2월',
            '3월',
            '4월',
            '5월',
            '6월',
            '7월',
            '8월',
            '9월',
            '10월',
            '11월',
            '12월'
        ],
        monthNamesShort: [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12'
        ],
        today: '오늘',
        clear: '지우기',
        dateFormat: 'yy년 mm월 dd일',
        weekHeader: '주',
        yearName: '년'
    };

    focus: boolean = false;
    focused: boolean = false;
    preventFocus: boolean = false;
    isKeydown: boolean = false;
    overlayVisible: boolean = false;
    timePickerChange: boolean = false;

    responsiveStyleElement: HTMLStyleElement | null = null;
    mask: null | HTMLElement = null;
    maskClickListener: any = null;

    outsideClickListener: any = null;
    scrollHandler: ConnectedOverlayScrollHandler | null = null;
    resizeListener: any = null;

    selectionStart: any = null;
    selectionEnd: any = null;

    currentView: string = this.$props.view;
    currentYear: number | null = null;
    currentMonth: number | null = null;
    currentHour: number | null = null;
    currentMinute: number | null = null;
    currentSecond: number | null = null;
    pm: null | boolean = null;

    navigationState: any = null;

    timePickerTimer: NodeJS.Timeout | null = null;

    // by shkoh 20220621: vue lifecycle hooks
    created() {
        this.updateCurrentMetaDate();
    }

    mounted() {
        this.createResponsiveStyle();
        if (this.$props.inline) {
            this.$refs.overlay &&
                this.$refs.overlay.setAttribute(this.attributeSelector, '');

            if (!this.$attrs.disabled) {
                this.initFocusableCell();
                this.$refs.overlay.style.width =
                    DomHandler.getOuterWidth(this.$el as HTMLElement) + 'px';
            }
        }
    }

    update() {
        if (this.$refs.overlay) {
            this.preventFocus = true;
            this.updateFocus();
        }

        if (
            this.$refs.input &&
            this.selectionStart !== null &&
            this.selectionEnd !== null
        ) {
            this.$refs.input.$el.selectionStart = this.selectionStart;
            this.$refs.input.$el.senectionEnd = this.selectionEnd;
            this.selectionStart = null;
            this.selectionEnd = null;
        }
    }

    beforeDestroy() {
        if (this.timePickerTimer) {
            clearTimeout(this.timePickerTimer);
        }

        if (this.mask) {
            this.destroyMask();
        }

        this.destroyResponsiveStyleElement();
        this.restoreAppend();
        this.unbindOutsideClickListener();
        this.unbindResizeListener();

        if (this.scrollHandler) {
            this.scrollHandler.destory();
            this.scrollHandler = null;
        }
    }

    alignOverlay() {
        if (this.$props.touchUI) {
            this.enableModality();
        } else if (this.$refs.overlay) {
            if (this.$props.appendTo) {
                DomHandler.absolutePosition(
                    this.$refs.overlay,
                    this.$el as HTMLElement
                );
            } else {
                DomHandler.relativePosition(
                    this.$refs.overlay,
                    this.$el as HTMLElement
                );
            }
        }
    }

    appendContainer() {
        if (this.$props.appendTo) {
            if (this.$props.appendTo === 'body') {
                document.body.appendChild(this.$refs.overlay);
            } else {
                document
                    .getElementById(this.$props.appendTo)
                    ?.appendChild(this.$refs.overlay);
            }
        }
    }

    bindOutsideClickListener() {
        if (!this.outsideClickListener) {
            this.outsideClickListener = (event: MouseEvent) => {
                if (this.overlayVisible && this.isOutsideClicked(event)) {
                    this.overlayVisible = false;
                }
            };

            document.addEventListener('mousedown', this.outsideClickListener);
        }
    }

    bindResizeListener() {
        if (!this.resizeListener) {
            this.resizeListener = () => {
                if (this.overlayVisible) {
                    this.overlayVisible = false;
                }
            };
            window.addEventListener('resize', this.resizeListener);
        }
    }

    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(
                this.$el as HTMLElement,
                () => {
                    if (this.overlayVisible) {
                        this.overlayVisible = false;
                    }
                }
            );
        }

        this.scrollHandler.bindScrollListener();
    }

    convertTo24Hour(hours: number, pm: boolean) {
        if (this.$props.hourFormat === '12') {
            if (hours === 12) {
                return pm ? 12 : 0;
            } else {
                return pm ? hours + 12 : hours;
            }
        }

        return hours;
    }

    createResponsiveStyle() {
        if (this.$props.numberOfMonths > 1 && this.$props.responsiveOptions) {
            if (!this.responsiveStyleElement) {
                this.responsiveStyleElement = document.createElement('style');
                document.body.appendChild(this.responsiveStyleElement);
            }

            let innerHTML = '';
            if (this.$props.responsiveOptions) {
                const responsiveOptions = [...this.$props.responsiveOptions]
                    .filter((o: any) => !!(o.breakpoint && o.numMonths))
                    .sort(
                        (o1: any, o2: any) =>
                            -1 *
                            o1.breakpoint.localeCompare(
                                o2.breakpoint,
                                undefined,
                                { numeric: true }
                            )
                    );

                for (let i = 0; i < responsiveOptions.length; i++) {
                    const { breakpoint, numMonths } = responsiveOptions[i];
                    let styles = `.p-datepicker[${this.attributeSelector}] .p-datepicker-group:nth-child(${numMonths}) .p-datepicker-next { display: inline-flex !important; }`;

                    for (
                        let j = numMonths;
                        j < this.$props.numberOfMonths;
                        j++
                    ) {
                        styles += `.p-datepicker[${
                            this.attributeSelector
                        }] .p-datepicker-group:nth-child(${
                            j + 1
                        }) { display: none !important; }`;
                    }

                    innerHTML += `@media screen and (max-width: ${breakpoint}) {
                        ${styles}
                    }`;
                }
            }

            this.responsiveStyleElement.innerText = innerHTML;
        }
    }

    clearTimePickerTimer() {
        if (this.timePickerTimer) {
            clearInterval(this.timePickerTimer);
        }
    }

    daylightSavingAdjust(date: Date): Date | null {
        if (!date) {
            return null;
        }

        date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
        return date;
    }

    decrementDecade() {
        if (this.currentYear !== null && this.currentYear > 10) {
            this.currentYear = this.currentYear - 10;
        }
    }

    decrementHour(event: MouseEvent) {
        if (this.currentHour !== null) {
            let newHour = this.currentHour - this.$props.stepHour;
            let newPM = this.pm;

            if (this.$props.hourFormat === '24') {
                newHour = newHour < 0 ? 24 + newHour : newHour;
                if (newPM === null) {
                    newPM = false;
                }
            } else if (this.$props.hourFormat === '12') {
                // by shkoh 20220621: If we were at noon / midnight, then switch
                if (this.currentHour === 12) {
                    newPM = !this.pm;
                }

                newHour = newHour <= 0 ? 12 + newHour : newHour;
            }

            if (
                this.currentMinute !== null &&
                this.currentSecond !== null &&
                newPM !== null &&
                this.validateTime(
                    newHour,
                    this.currentMinute,
                    this.currentSecond,
                    newPM
                )
            ) {
                this.currentHour = newHour;
                this.pm = newPM;
            }
        }

        event.preventDefault();
    }

    decrementMinute(event: MouseEvent) {
        if (this.currentMinute !== null) {
            let newMinute = this.currentMinute - this.$props.stepMinute;
            newMinute = newMinute < 0 ? 60 + newMinute : newMinute;

            if (
                this.currentHour !== null &&
                this.currentSecond !== null &&
                this.validateTime(
                    this.currentHour,
                    newMinute,
                    this.currentSecond,
                    true
                )
            ) {
                this.currentMinute = newMinute;
            }
        }

        event.preventDefault();
    }

    decrementSecond(event: MouseEvent) {
        if (this.currentSecond !== null) {
            let newSecond = this.currentSecond - this.$props.stepSecond;
            newSecond = newSecond < 0 ? 60 + newSecond : newSecond;

            if (
                this.currentHour !== null &&
                this.currentMinute !== null &&
                this.validateTime(
                    this.currentHour,
                    this.currentMinute,
                    newSecond,
                    true
                )
            ) {
                this.currentSecond = newSecond;
            }
        }

        event.preventDefault();
    }

    decrementYear() {
        if (this.currentYear !== null && this.currentYear > 0) {
            this.currentYear--;
        }
    }

    destroyMask() {
        this.mask?.removeEventListener('click', this.maskClickListener);
        this.maskClickListener = null;
        document.body.removeChild(this.mask as Node);
        this.mask = null;

        const bodyChildren = document.body.children;

        let hasBlockerMasks;
        for (let i = 0; i < bodyChildren.length; i++) {
            const bodyChild = bodyChildren[i];

            if (
                DomHandler.hasClass(
                    bodyChild,
                    'p-datepicker-mask-scrollblocker'
                )
            ) {
                hasBlockerMasks = true;
                break;
            }
        }

        if (!hasBlockerMasks) {
            DomHandler.removeClass(document.body, 'p-overflow-hidden');
        }
    }

    destroyResponsiveStyleElement() {
        if (this.responsiveStyleElement) {
            this.responsiveStyleElement.remove();
            this.responsiveStyleElement = null;
        }
    }

    disableModality() {
        if (this.mask) {
            this.overlayVisible = false;

            DomHandler.addClass(this.mask, 'p-component-overlay-leave');
            this.mask.addEventListener('animationend', () => {
                this.destroyMask();
            });
        }
    }

    enableModality() {
        if (!this.mask) {
            this.mask = document.createElement('div');
            this.mask.style.zIndex = String(
                parseInt(this.$refs.overlay.style.zIndex, 10) - 1
            );

            DomHandler.addMultipleClasses(
                this.mask,
                'p-datepicker-mask p-datepicker-mask-scrollblocker p-componenet-overlay p-component-overlay-enter'
            );

            this.maskClickListener = () => {
                this.overlayVisible = false;
            };
            this.mask.addEventListener('click', this.maskClickListener);

            document.body.appendChild(this.mask);
            DomHandler.addClass(document.body, 'p-overflow-hidden');
        }
    }

    formatDateTime(date: Date): string {
        let formattedValue = '';
        if (date) {
            if (this.$props.timeOnly) {
                formattedValue = this.formatTime(date);
            } else {
                formattedValue = this.formatDate(date, this.datePattern);
                if (this.$props.showTime) {
                    formattedValue += ' ' + this.formatTime(date);
                }
            }
        }

        return formattedValue;
    }

    formatDate(date: Date, format: string): string {
        if (!date) {
            return '';
        }

        let iFormat: number = 0;
        const lookAhead = (match: string) => {
            const matches =
                iFormat + 1 < format.length &&
                format.charAt(iFormat + 1) === match;

            if (matches) iFormat++;

            return matches;
        };

        const formatNumber = (match: string, value: number, len: number) => {
            let num = '' + value;
            if (lookAhead(match)) {
                while (num.length < len) {
                    num = '0' + num;
                }
            }

            return num;
        };

        const formatName = (
            match: string,
            value: number,
            shortNames: Array<string>,
            longNames: Array<string>
        ) => {
            return lookAhead(match) ? longNames[value] : shortNames[value];
        };

        let output = '';
        let literal = false;

        if (date) {
            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                        literal = false;
                    } else {
                        output += format.charAt(iFormat);
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case 'd':
                            output += formatNumber('d', date.getDate(), 2);
                            break;
                        case 'D':
                            output += formatName(
                                'D',
                                date.getDay(),
                                this.d_locale.dayNamesShort,
                                this.d_locale.dayNames
                            );
                            break;
                        case 'o':
                            output += formatNumber(
                                'o',
                                Math.round(
                                    (new Date(
                                        date.getFullYear(),
                                        date.getMonth(),
                                        date.getDate()
                                    ).getTime() -
                                        new Date(
                                            date.getFullYear(),
                                            0,
                                            0
                                        ).getTime()) /
                                        86400000
                                ),
                                3
                            );
                            break;
                        case 'm':
                            output += formatNumber('m', date.getMonth() + 1, 2);
                            break;
                        case 'M':
                            output += formatName(
                                'M',
                                date.getMonth(),
                                this.d_locale.monthNamesShort,
                                this.d_locale.monthNames
                            );
                            break;
                        case 'y':
                            output += lookAhead('y')
                                ? date.getFullYear()
                                : (date.getFullYear() % 100 < 10 ? '0' : '') +
                                  (date.getFullYear() % 100);
                            break;
                        case '@':
                            output += date.getTime();
                            break;
                        case '!':
                            output += date.getTime() * 10000 + this.ticksTo1970;
                            break;
                        case "'":
                            if (lookAhead("'")) {
                                output += "'";
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            output += format.charAt(iFormat);
                    }
                }
            }
        }

        return output;
    }

    formatTime(date: Date): string {
        if (!date) {
            return '';
        }

        let output = '';
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        if (this.$props.hourFormat === '12' && hours > 11 && hours !== 12) {
            hours -= 12;
        }

        if (this.$props.hourFormat === '12') {
            output += hours === 0 ? 12 : hours < 10 ? '0' + hours : hours;
        } else {
            output += hours < 10 ? '0' + hours : hours;
        }

        output += ':';
        output += minutes < 10 ? '0' + minutes : minutes;

        if (this.$props.showSeconds) {
            output += ':';
            output += seconds < 10 ? '0' + seconds : seconds;
        }

        if (this.$props.hourFormat === '12') {
            output += date.getHours() > 11 ? ' PM' : ' AM';
        }

        return output;
    }

    formatValue(value: any): string {
        if (typeof value === 'string') {
            return value;
        }

        let formattedValue: string = '';
        if (value) {
            try {
                if (this.isSingleSelection()) {
                    formattedValue = this.formatDateTime(value);
                } else if (this.isMultipleSelection()) {
                    for (let i = 0; i < value.length; i++) {
                        const dateAsString = this.formatDateTime(value[i]);
                        formattedValue += dateAsString;
                        if (i !== value.length - 1) {
                            formattedValue += ', ';
                        }
                    }
                } else if (this.isRangeSelection()) {
                    if (value && value.length) {
                        const startDate = value[0];
                        const endDate = value[1];

                        formattedValue = this.formatDateTime(startDate);
                        if (endDate) {
                            formattedValue +=
                                ' - ' + this.formatDateTime(endDate);
                        }
                    }
                }
            } catch (err) {
                formattedValue = value;
            }
        }

        return formattedValue;
    }

    getDaysCountInMonth(month: number, year: number) {
        const day = this.daylightSavingAdjust(
            new Date(year, month, 32)
        )?.getDate();
        return 32 - (day || 1);
    }

    getDaysCountInPrevMonth(month: number, year: number) {
        const prev = this.getPreviousMonthAndYear(month, year);
        return this.getDaysCountInMonth(prev.month, prev.year);
    }

    getFirstDayOfMonthIndex(month: number, year: number) {
        const day = new Date();
        day.setDate(1);
        day.setMonth(month);
        day.setFullYear(year);

        const dayIndex = day.getDay() + this.sundayIndex;
        return dayIndex >= 7 ? dayIndex - 7 : dayIndex;
    }

    getMonthName(index: number): string {
        return this.d_locale.monthNames[index];
    }

    getNextMonthAndYear(month: number, year: number) {
        let m: number, y: number;

        if (month === 11) {
            m = 0;
            y = year + 1;
        } else {
            m = month + 1;
            y = year;
        }

        return { month: m, year: y };
    }

    getPreviousMonthAndYear(month: number, year: number) {
        let m: number, y: number;

        if (month === 0) {
            m = 11;
            y = year - 1;
        } else {
            m = month - 1;
            y = year;
        }

        return { month: m, year: y };
    }

    getWeekNumber(date: Date) {
        const checkDate = new Date(date.getTime());
        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));

        const time = checkDate.getTime();
        checkDate.setMonth(0);
        checkDate.setDate(1);

        return (
            Math.floor(
                Math.round((time - checkDate.getTime()) / 86400000) / 7
            ) + 1
        );
    }

    getYear({ year }: any): string {
        let y = year;
        if (this.currentView === 'month') {
            y = this.currentYear;
        }

        return this.getYearName(y);
    }

    getYearName(year: number): string {
        const year_name = this.d_locale.yearName;
        return year_name.length > 0 ? `${year}${year_name}` : year.toString();
    }

    incrementHour(event: MouseEvent) {
        const prevHour = this.currentHour;

        if (prevHour !== null) {
            let newHour = this.currentHour + this.$props.stepHour;
            let newPM = this.pm;

            if (this.$props.hourFormat === '24') {
                newHour = newHour >= 24 ? newHour - 24 : newHour;
                if (newPM === null) {
                    newPM = false;
                }
            } else if (this.$props.hourFormat === '12') {
                // by shkoh 20220621: Before the AM/PM break, now after
                if (prevHour < 12 && newHour > 11) {
                    newPM = !this.pm;
                }

                newHour = newHour >= 13 ? newHour - 12 : newHour;
            }

            if (
                this.currentMinute !== null &&
                this.currentSecond !== null &&
                newPM !== null &&
                this.validateTime(
                    newHour,
                    this.currentMinute,
                    this.currentSecond,
                    newPM
                )
            ) {
                this.currentHour = newHour;
                this.pm = newPM;
            }
        }

        event.preventDefault();
    }

    incrementMinute(event: MouseEvent) {
        const newMinute = this.currentMinute + this.$props.stepMinute;
        if (
            this.currentHour !== null &&
            this.currentSecond !== null &&
            this.validateTime(
                this.currentHour,
                newMinute,
                this.currentSecond,
                true
            )
        ) {
            this.currentMinute = newMinute > 59 ? newMinute - 60 : newMinute;
        }

        event.preventDefault();
    }

    incrementSecond(event: MouseEvent) {
        const newSecond = this.currentSecond + this.$props.stepSecond;
        if (
            this.currentHour !== null &&
            this.currentMinute !== null &&
            this.validateTime(
                this.currentHour,
                this.currentMinute,
                newSecond,
                true
            )
        ) {
            this.currentSecond = newSecond > 59 ? newSecond - 60 : newSecond;
        }

        event.preventDefault();
    }

    incrementYear() {
        if (this.currentYear !== null) {
            this.currentYear++;
        }
    }

    incrementDecade() {
        if (this.currentYear !== null) {
            this.currentYear = this.currentYear + 10;
        }
    }

    initFocusableCell() {
        let cell: HTMLElement;

        if (this.currentView === 'month') {
            const cells: NodeListOf<HTMLElement> = DomHandler.find(
                this.$refs.overlay,
                '.p-monthpicker .p-monthpicker-month'
            );
            const selectedCell = DomHandler.findSingle(
                this.$refs.overlay,
                '.p-monthpicker .p-monthpicker-month.p-highlight'
            );

            cells.forEach((cell: HTMLElement) => (cell.tabIndex = -1));
            cell = selectedCell || cells[0];
        } else if (this.currentView === 'year') {
            const cells = DomHandler.find(
                this.$refs.overlay,
                '.p-yearpicker .p-yearpicker-year'
            );
            const selectedCell = DomHandler.findSingle(
                this.$refs.overlay,
                '.p-yearpicker .p-yearpicker-year.p-highlight'
            );

            cells.forEach((cell) => (cell.tabIndex = -1));
            cell = selectedCell || cells[0];
        } else {
            cell = DomHandler.findSingle(
                this.$refs.overlay,
                'span.p-highlight'
            );

            if (!cell) {
                const todayCell = DomHandler.findSingle(
                    this.$refs.overlay,
                    'td.p-datepicker-today span:not(.p-disabled):not(.p-ink)'
                );

                if (todayCell) {
                    cell = todayCell;
                } else {
                    cell = DomHandler.findSingle(
                        this.$refs.overlay,
                        '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)'
                    );
                }
            }
        }

        if (cell) {
            cell.tabIndex = 0;

            if (
                !this.preventFocus &&
                (!this.navigationState || !this.navigationState.button) &&
                !this.timePickerChange
            ) {
                cell.focus();
            }

            this.preventFocus = false;
        }
    }

    isComparable() {
        return (
            this.$props.value !== null && typeof this.$props.value !== 'string'
        );
    }

    isDateBetween(start: Date, end: Date, dateMeta: any) {
        const between = false;
        if (start && end) {
            const date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
            return (
                start.getTime() <= date.getTime() &&
                end.getTime() >= date.getTime()
            );
        }

        return between;
    }

    isDateDisabled(day: number, month: number, year: number) {
        if (this.$props.disabledDates) {
            for (const disabledDate of this.$props.disabledDates) {
                if (
                    disabledDate.getFullYear() === year &&
                    disabledDate.getMonth() === month &&
                    disabledDate.getDate() === day
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    isDateEquals(value: Date, dateMeta: any) {
        if (value) {
            return (
                value.getDate() === dateMeta.day &&
                value.getMonth() === dateMeta.month &&
                value.getFullYear() === dateMeta.year
            );
        } else {
            return false;
        }
    }

    isDayDisabled(day: number, month: number, year: number) {
        if (this.$props.disabledDays) {
            const weekday = new Date(year, month, day);
            const weekdayNumber = weekday.getDay();
            return this.$props.disabledDays.includes(weekdayNumber);
        }

        return false;
    }

    isEnabled() {
        return !this.$attrs.disabled && !this.$attrs.readonly;
    }

    isMonthSelected(month: number) {
        if (this.isComparable()) {
            const value: Date = this.isRangeSelection()
                ? this.$props.value[0]
                : this.$props.value;

            return !this.isMultipleSelection()
                ? value.getMonth() === month &&
                      value.getFullYear() === this.currentYear
                : false;
        }

        return false;
    }

    isMultipleSelection(): boolean {
        return this.$props.selectionMode === 'multiple';
    }

    isNavIconClicked(event: MouseEvent): boolean {
        return (
            DomHandler.hasClass(event.target, 'p-datepicker-prev') ||
            DomHandler.hasClass(event.target, 'p-datepicker-prev-icon') ||
            DomHandler.hasClass(event.target, 'p-datepicker-next') ||
            DomHandler.hasClass(event.target, 'p-datepicker-next-icon')
        );
    }

    isOutsideClicked(event: MouseEvent) {
        return !(
            this.$el.isSameNode(event.target as Node) ||
            this.isNavIconClicked(event) ||
            this.$el.contains(event.target as Node) ||
            (this.$refs.overlay && this.$refs.overlay.contains(event.target))
        );
    }

    isRangeSelection(): boolean {
        return this.$props.selectionMode === 'range';
    }

    isSelectable(
        day: number,
        month: number,
        year: number,
        otherMonth: boolean
    ) {
        let validMin = true;
        let validMax = true;
        let validDate = true;
        let validDay = true;

        if (otherMonth && !this.$props.selectOtherMonths) {
            return false;
        }

        if (this.$props.minDate) {
            if (this.$props.minDate.getFullYear() > year) {
                validMin = false;
            } else if (this.$props.minDate.getFullYear() === year) {
                if (this.$props.minDate.getMonth() > month) {
                    validMin = false;
                } else if (this.$props.minDate.getMonth() === month) {
                    if (this.$props.minDate.getDate() > day) {
                        validMin = false;
                    }
                }
            }
        }

        if (this.$props.maxDate) {
            if (this.$props.maxDate.getFullYear() < year) {
                validMax = false;
            } else if (this.$props.maxDate.getFullYear() === year) {
                if (this.$props.maxDate.getMonth() < month) {
                    validMax = false;
                } else if (this.$props.maxDate.getMonth() === month) {
                    if (this.$props.maxDate.getDate() < day) {
                        validMax = false;
                    }
                }
            }
        }

        if (this.$props.disabledDates) {
            validDate = !this.isDateDisabled(day, month, year);
        }

        if (this.$props.disabledDays) {
            validDay = !this.isDayDisabled(day, month, year);
        }

        return validMin && validMax && validDate && validDay;
    }

    isSelected(dateMeta: any) {
        if (!this.isComparable()) {
            return false;
        }

        if (this.$props.value) {
            if (this.isSingleSelection()) {
                return this.isDateEquals(this.$props.value, dateMeta);
            } else if (this.isMultipleSelection()) {
                let selected = false;
                for (const date of this.$props.value) {
                    selected = this.isDateEquals(date, dateMeta);
                    if (selected) {
                        break;
                    }
                }

                return selected;
            } else if (this.isRangeSelection()) {
                if (this.$props.value[1]) {
                    return (
                        this.isDateEquals(this.$props.value[0], dateMeta) ||
                        this.isDateEquals(this.$props.value[1], dateMeta) ||
                        this.isDateBetween(
                            this.$props.value[0],
                            this.$props.value[1],
                            dateMeta
                        )
                    );
                } else {
                    return this.isDateEquals(this.$props.value[0], dateMeta);
                }
            }
        }

        return false;
    }

    isSingleSelection(): boolean {
        return this.$props.selectionMode === 'single';
    }

    isToday(today: Date, day: number, month: number, year: number) {
        return (
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
        );
    }

    isValidSelection(value: any) {
        let isValid = true;
        if (this.isSingleSelection()) {
            if (
                !this.isSelectable(
                    value.getDate(),
                    value.getMonth(),
                    value.getFullYear(),
                    false
                )
            ) {
                isValid = false;
            }
        } else if (
            value.every((v: Date) =>
                this.isSelectable(
                    v.getDate(),
                    v.getMonth(),
                    v.getFullYear(),
                    false
                )
            )
        ) {
            if (this.isRangeSelection()) {
                isValid = !!(value.length > 1 && value[1] > value[0]);
            }
        }

        return isValid;
    }

    isYearSelected(year: number) {
        if (this.isComparable()) {
            const value: Date = this.isRangeSelection()
                ? this.$props.value[0]
                : this.$props.value;

            return !this.isMultipleSelection() && this.isComparable()
                ? value.getFullYear() === year
                : false;
        }

        return false;
    }

    navBackward(event: Event) {
        event.preventDefault();

        if (!this.isEnabled()) {
            return;
        }

        if (this.currentView === 'month') {
            this.decrementYear();
        } else if (this.currentView === 'year') {
            this.decrementDecade();
        } else {
            if (this.currentMonth === 0) {
                this.currentMonth = 11;
                this.decrementYear();
            } else if (this.currentMonth !== null) {
                this.currentMonth--;
            }

            this.$emit('month-change', {
                year: this.currentYear,
                month: this.currentMonth
            });
        }
    }

    navForward(event: Event) {
        event.preventDefault();

        if (!this.isEnabled()) {
            return;
        }

        if (this.currentView === 'month') {
            this.incrementYear();
        } else if (this.currentView === 'year') {
            this.incrementDecade();
        } else {
            if (this.currentMonth === 11) {
                this.currentMonth = 0;
                this.incrementYear();
            } else if (this.currentMonth !== null) {
                this.currentMonth++;
            }

            this.$emit('month-change', {
                month: this.currentMonth,
                year: this.currentYear
            });
        }
    }

    navigateToMonth(event: KeyboardEvent, prev: boolean, groupIndex: number) {
        if (prev) {
            if (this.$props.numberOfMonths === 1 || groupIndex === 0) {
                this.navigationState = { backward: true };
                this.navBackward(event);
            } else {
                const prevMonthContainer =
                    this.$refs.overlay.children[groupIndex - 1];
                const cells = DomHandler.find(
                    prevMonthContainer,
                    '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)'
                );
                const focusCell = cells[cells.length - 1];
                focusCell.tabIndex = 0;
                focusCell.focus();
            }
        } else if (
            this.$props.numberOfMonths === 1 ||
            groupIndex === this.$props.numberOfMonths - 1
        ) {
            this.navigationState = { backward: false };
            this.navForward(event);
        } else {
            const nextMonthContainer =
                this.$refs.overlay.children[groupIndex + 1];
            const focusCell = DomHandler.findSingle(
                nextMonthContainer,
                '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)'
            );
            focusCell.tabIndex = 0;
            focusCell.focus();
        }
    }

    onButtonClick() {
        if (this.isEnabled()) {
            if (!this.overlayVisible) {
                this.$refs.input.$el.focus();
                this.overlayVisible = true;
            } else {
                this.overlayVisible = false;
            }
        }
    }

    onClearButtonClick(event: MouseEvent) {
        this.updateModel(null);
        this.overlayVisible = false;
        this.$emit('clear-click', event);
        event.preventDefault();
    }

    onContainerButtonKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'Tab': {
                if (!this.$props.inline) {
                    this.trapFocus(event);
                }
                break;
            }
            case 'Escape': {
                this.overlayVisible = false;
                event.preventDefault();
                break;
            }
            default:
                break;
        }
    }

    onDateCellKeydown(event: KeyboardEvent, dateMeta: any, groupIndex: number) {
        const cellContent = event.currentTarget as HTMLElement;
        const cell = cellContent.parentElement;

        switch (event.key) {
            case 'ArrowDown': {
                cellContent.tabIndex = -1;

                if (cell) {
                    const cellIndex = DomHandler.index(cell);
                    const nextRow = cell.parentElement?.nextElementSibling;
                    if (nextRow) {
                        const focusCell = nextRow.children[cellIndex]
                            .children[0] as HTMLElement;

                        if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                            this.navigationState = { backward: false };
                            this.navForward(event);
                        } else {
                            focusCell.tabIndex = 0;
                            focusCell.focus();
                        }
                    } else {
                        this.navigationState = { backward: false };
                        this.navForward(event);
                    }
                }

                event.preventDefault();
                break;
            }
            case 'ArrowUp': {
                cellContent.tabIndex = -1;

                if (cell) {
                    const cellIndex = DomHandler.index(cell);
                    const prevRow = cell.parentElement?.previousElementSibling;
                    if (prevRow) {
                        const focusCell = prevRow.children[cellIndex]
                            .children[0] as HTMLElement;
                        if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                            this.navigationState = { backward: true };
                            this.navBackward(event);
                        } else {
                            focusCell.tabIndex = 0;
                            focusCell.focus();
                        }
                    } else {
                        this.navigationState = { backward: true };
                        this.navBackward(event);
                    }
                }

                event.preventDefault();
                break;
            }
            case 'ArrowLeft': {
                cellContent.tabIndex = -1;

                const prevCell = cell?.previousElementSibling;
                if (prevCell) {
                    const focusCell = prevCell.children[0] as HTMLElement;
                    if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                        this.navigateToMonth(event, true, groupIndex);
                    } else {
                        focusCell.tabIndex = 0;
                        focusCell.focus();
                    }
                } else {
                    this.navigateToMonth(event, true, groupIndex);
                }
                event.preventDefault();
                break;
            }
            case 'ArrowRight': {
                cellContent.tabIndex = -1;
                const nextCell = cell?.nextElementSibling;
                if (nextCell) {
                    const focusCell = nextCell.children[0] as HTMLElement;
                    if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                        this.navigateToMonth(event, false, groupIndex);
                    } else {
                        focusCell.tabIndex = 0;
                        focusCell.focus();
                    }
                } else {
                    this.navigateToMonth(event, false, groupIndex);
                }
                event.preventDefault();
                break;
            }
            case ' ':
            case 'Enter': {
                this.onDateSelect(event, dateMeta);
                event.preventDefault();
                break;
            }
            case 'Escape': {
                this.overlayVisible = false;
                event.preventDefault();
                break;
            }
            case 'Tab': {
                if (!this.$props.inline) {
                    this.trapFocus(event);
                }
                break;
            }
            default:
                break;
        }
    }

    onDateSelect(event: MouseEvent | KeyboardEvent | null, dateMeta: any) {
        if (this.$attrs.disabled || !dateMeta.selectable) {
            return;
        }

        DomHandler.find(
            this.$refs.overlay,
            '.p-datepicker-calendar td span:not(.p-disabled)'
        ).forEach((cell) => (cell.tabIndex = -1));

        if (event) {
            (event.currentTarget as HTMLElement).focus();
        }

        if (this.isMultipleSelection() && this.isSelected(dateMeta)) {
            const newValue = this.$props.value.filter(
                (date: any) => !this.isDateEquals(date, dateMeta)
            );
            this.updateModel(newValue);
        } else if (this.shouldSelectDate()) {
            if (dateMeta.otherMonth) {
                this.currentMonth = dateMeta.month;
                this.currentYear = dateMeta.year;
                this.selectDate(dateMeta);
            } else {
                this.selectDate(dateMeta);
            }
        }

        if (
            this.isSingleSelection() &&
            (!this.$props.showTime || this.$props.hideOnDateTimeSelect)
        ) {
            setTimeout(() => {
                this.overlayVisible = false;
            }, 150);
        }
    }

    onInput(val: string) {
        // by shkoh 20220614: IE 11 Workaround for input placeholder: https://github.com/primefaces/primeeng/issues/2026
        if (!this.isKeydown) {
            return;
        }

        this.isKeydown = false;

        try {
            this.selectionStart = this.$refs.input.$el.selectionStart;
            this.selectionEnd = this.$refs.input.$el.selectionEnd;

            const value = this.parseValue(val);
            if (typeof value !== 'string' && this.isValidSelection(value)) {
                this.updateModel(value);

                // by shkoh 20220906: 키보드 input이 발생한 후에 커서를 원래대로 돌려놓는다
                setTimeout(() => {
                    (
                        this.$refs.input.$el as HTMLInputElement
                    ).setSelectionRange(this.selectionStart, this.selectionEnd);
                }, 0);
            }
        } catch (err) {
            this.updateModel(val);
        }
    }

    onMonthCellKeydown(event: KeyboardEvent, index: number) {
        const cell = event.currentTarget as HTMLElement;

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown': {
                cell.tabIndex = -1;
                const cellIndex = DomHandler.index(cell);

                const cells = cell.parentElement?.children;
                if (cells) {
                    const step = event.key === 'ArrowDown' ? 3 : -3;
                    const nextCell = cells[cellIndex + step] as HTMLElement;

                    if (nextCell) {
                        nextCell.tabIndex = 0;
                        nextCell.focus();
                    }
                }

                event.preventDefault();
                break;
            }
            case 'ArrowLeft': {
                cell.tabIndex = -1;
                const prevCell = cell.previousElementSibling as HTMLElement;
                if (prevCell) {
                    prevCell.tabIndex = 0;
                    prevCell.focus();
                } else {
                    this.navigationState = { backward: true };
                    this.navBackward(event);
                }

                event.preventDefault();
                break;
            }
            case 'ArrowRight': {
                cell.tabIndex = -1;
                const nextCell = cell.nextElementSibling as HTMLElement;
                if (nextCell) {
                    nextCell.tabIndex = 0;
                    nextCell.focus();
                } else {
                    this.navigationState = { backward: false };
                    this.navForward(event);
                }

                event.preventDefault();
                break;
            }
            case ' ':
            case 'Enter': {
                this.onMonthSelect(event, index);
                event.preventDefault();
                break;
            }
            case 'Escapse': {
                this.overlayVisible = false;
                event.preventDefault();
                break;
            }
            case 'Tab': {
                if (!this.$props.inline) {
                    this.trapFocus(event);
                }
                break;
            }
            default:
                break;
        }
    }

    onMonthSelect(event: MouseEvent | KeyboardEvent, month: number) {
        if (this.$props.view === 'month') {
            this.onDateSelect(event, {
                year: this.currentYear,
                month,
                day: 1,
                selectable: true
            });
        } else {
            this.currentMonth = month;
            this.currentView = 'date';
            this.$emit('month-change', {
                month: this.currentMonth + 1,
                year: this.currentYear
            });
        }

        setTimeout(this.updateFocus, 0);
    }

    onNextButtonClick(event: MouseEvent) {
        if (this.$props.showOtherMonths) {
            this.navigationState = { backward: false, button: true };
            this.navForward(event);
        }
    }

    onOverlayEnter(el: HTMLElement) {
        el.setAttribute(this.attributeSelector, '');

        if (this.$props.autoZIndex) {
            this.$refs.overlay.style.zIndex = String(
                this.$props.baseZIndex + DomHandler.generateZIndex()
            );
        }

        this.appendContainer();
        this.alignOverlay();
        this.$emit('show');
    }

    onOverlayEnterComplete() {
        this.bindOutsideClickListener();
        this.bindScrollListener();
        this.bindResizeListener();
    }

    onOverlayLeave() {
        this.currentView = this.$props.view;
        this.unbindOutsideClickListener();
        this.unbindScrollListener();
        this.unbindResizeListener();
        this.$emit('hide');

        if (this.mask) {
            this.disableModality();
        }
    }

    onPrevButtonClick(event: MouseEvent) {
        if (this.$props.showOtherMonths) {
            this.navigationState = { backward: true, button: true };
            this.navBackward(event);
        }
    }

    onTimePickerElementMouseDown(
        event: MouseEvent,
        type: number,
        direction: number
    ) {
        if (this.isEnabled()) {
            this.repeat(event, null, type, direction);
            event.preventDefault();
        }
    }

    onTimePickerElementMouseLeave() {
        this.clearTimePickerTimer();
    }

    onTimePickerElementMouseUp(event: MouseEvent) {
        if (this.isEnabled()) {
            this.clearTimePickerTimer();
            this.updateModelTime();
            event.preventDefault();
        }
    }

    onTodayButtonClick(event: MouseEvent) {
        const date = new Date();
        const dateMeta = {
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            otherMonth:
                date.getMonth() !== this.currentMonth ||
                date.getFullYear() !== this.currentYear,
            today: true,
            selectable: true
        };

        this.onDateSelect(null, dateMeta);
        this.$emit('today-click', date);

        event.preventDefault();
    }

    onYearCellKeydown(event: KeyboardEvent, index: number) {
        const cell = event.currentTarget as HTMLElement;

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown': {
                cell.tabIndex = -1;
                const cellIndex = DomHandler.index(cell);

                const cells = cell.parentElement?.children;
                if (cells) {
                    const step = event.key === 'ArrowDown' ? 2 : -2;
                    const nextCell = cells[cellIndex + step] as HTMLElement;

                    if (nextCell) {
                        nextCell.tabIndex = 0;
                        nextCell.focus();
                    }
                }

                event.preventDefault();
                break;
            }
            case 'ArrowLeft': {
                cell.tabIndex = -1;
                const prevCell = cell.previousElementSibling as HTMLElement;
                if (prevCell) {
                    prevCell.tabIndex = 0;
                    prevCell.focus();
                } else {
                    this.navigationState = { backward: true };
                    this.navBackward(event);
                }
                event.preventDefault();
                break;
            }
            case 'ArrowRight': {
                cell.tabIndex = -1;
                const nextCell = cell.nextElementSibling as HTMLElement;
                if (nextCell) {
                    nextCell.tabIndex = 0;
                    nextCell.focus();
                } else {
                    this.navigationState = { backward: false };
                    this.navForward(event);
                }
                event.preventDefault();
                break;
            }
            case ' ':
            case 'Enter': {
                this.onMonthSelect(event, index);
                event.preventDefault();
                break;
            }
            case 'Escape': {
                this.overlayVisible = false;
                event.preventDefault();
                break;
            }
            case 'Tab': {
                this.trapFocus(event);
                break;
            }
            default:
                break;
        }
    }

    onYearSelect(event: MouseEvent, year: number) {
        if (this.$props.view === 'year') {
            this.onDateSelect(event, {
                year,
                month: 0,
                day: 1,
                selectable: true
            });
        } else {
            this.currentYear = year;
            this.currentView = 'month';

            if (this.currentMonth) {
                this.$emit('year-change', {
                    month: this.currentMonth + 1,
                    year: this.currentYear
                });
            }
        }
    }

    parseDateTime(text: string) {
        let date;
        const parts = text.split(' ');

        if (this.$props.timeOnly) {
            date = new Date();
            this.populateTime(date, parts[0], parts[1]);
        } else {
            const dateFormat = this.datePattern;
            if (this.$props.showTime) {
                // by shkoh 20220902: date format의 형식에서 띄어쓰기가 존재할 경우에는 dateFormat도 함께 확인하여 일치시킴
                const dateFormatParts = dateFormat.split(' ');
                if (dateFormatParts.length > 0) {
                    const pp = parts.reduce(
                        (previous: string, current: string, idx: number) => {
                            if (idx < dateFormatParts.length) {
                                return `${previous} ${current}`;
                            } else {
                                return previous;
                            }
                        }
                    );

                    date = this.parseDate(pp, dateFormat);
                    if (date) {
                        this.populateTime(
                            date,
                            parts[dateFormatParts.length],
                            parts[dateFormatParts.length + 1]
                        );
                    }
                } else {
                    date = this.parseDate(parts[0], dateFormat);
                    if (date) {
                        this.populateTime(date, parts[1], parts[2]);
                    }
                }
            } else {
                date = this.parseDate(text, dateFormat);
            }
        }

        return date;
    }

    parseDate(value: any, format: null | string): Date | null {
        if (format === null || value === null) {
            throw 'Invalid arguments';
        }

        value = typeof value === 'object' ? value.toString() : value + '';
        if (value === '') {
            return null;
        }

        let iFormat: number;
        let dim;
        let extra;
        let iValue = 0;
        const shortYearCutoff =
            typeof this.$props.shortYearCutoff !== 'string'
                ? this.$props.shortYearCutoff
                : (new Date().getFullYear() % 100) +
                  parseInt(this.$props.shortYearCutoff, 10);
        let year = -1;
        let month = -1;
        let day = -1;
        const doy = -1;
        let literal = false;
        let date;

        const lookAhead = (match: string) => {
            const matches: boolean =
                iFormat + 1 < format.length &&
                format.charAt(iFormat + 1) === match;
            if (matches) {
                iFormat++;
            }

            return matches;
        };

        const getNumber = (match: string) => {
            const isDoubled = lookAhead(match);
            const size =
                match === '@'
                    ? 14
                    : match === '!'
                    ? 20
                    : match === 'y' && isDoubled
                    ? 4
                    : match === 'o'
                    ? 3
                    : 2;
            const minSize =
                match === 'y' ||
                (match === 'm' && isDoubled) ||
                (match === 'd' && isDoubled)
                    ? size
                    : 1;
            const digits = new RegExp('^\\d{' + minSize + ',' + size + '}');
            const num = value.substring(iValue).match(digits);
            if (!num) {
                throw 'Missing number at position ' + iValue;
            }
            iValue += num[0].length;
            return parseInt(num[0], 10);
        };

        const getName = (
            match: string,
            shortNames: Array<string>,
            longNames: Array<string>
        ) => {
            let index = -1;
            const arr = lookAhead(match) ? longNames : shortNames;
            const names = [];

            for (let i = 0; i < arr.length; i++) {
                names.push([i, arr[i]]);
            }

            names.sort((a: any, b: any) => {
                return -(a[1].length - b[1].length);
            });

            for (let i = 0; i < names.length; i++) {
                const name: any = names[i][1];
                if (
                    value.substring(iValue, name.length).toLowerCase() ===
                    name.toLowerCase()
                ) {
                    index = names[i][0] as number;
                    iValue += name.length;
                    break;
                }
            }

            if (index !== -1) {
                return index + 1;
            } else {
                throw 'Unknown name at position ' + iValue;
            }
        };

        const checkLiteral = () => {
            if (value.charAt(iValue) !== format.charAt(iFormat)) {
                throw 'Unexpected literal at position ' + iValue;
            }
            iValue++;
        };

        if (this.currentView === 'month') {
            day = 1;
        }

        for (iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal) {
                if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                    literal = false;
                } else {
                    checkLiteral();
                }
            } else {
                switch (format.charAt(iFormat)) {
                    case 'd':
                        day = getNumber('d');
                        break;
                    case 'D':
                        getName(
                            'D',
                            this.d_locale.dayNamesShort,
                            this.d_locale.dayNames
                        );
                        break;
                    case 'o':
                        day = getNumber('o');
                        break;
                    case 'm':
                        month = getNumber('m');
                        break;
                    case 'M':
                        month = getName(
                            'M',
                            this.d_locale.monthNamesShort,
                            this.d_locale.monthNames
                        );
                        break;
                    case 'y':
                        year = getNumber('y');
                        break;
                    case '@':
                        date = new Date(getNumber('@'));
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case '!':
                        date = new Date(
                            (getNumber('!') - this.ticksTo1970) / 10000
                        );
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case "'":
                        if (lookAhead("'")) {
                            checkLiteral();
                        } else {
                            literal = true;
                        }

                        break;
                    default:
                        checkLiteral();
                }
            }
        }

        if (iValue < value.length) {
            extra = value.substr(iValue);
            if (!/^\s+/.test(extra)) {
                throw 'Extra/unparsed characters found in date: ' + extra;
            }
        }

        if (year === -1) {
            year = new Date().getFullYear();
        } else if (year < 100) {
            year +=
                new Date().getFullYear() -
                (new Date().getFullYear() % 100) +
                (year <= shortYearCutoff ? 0 : -100);
        }

        if (doy > -1) {
            month = 1;
            day = doy;

            do {
                dim = this.getDaysCountInMonth(month - 1, year);
                if (day < dim) {
                    break;
                }

                month++;

                day -= dim;
            } while (true);
        }

        date = this.daylightSavingAdjust(new Date(year, month - 1, day));
        if (
            date &&
            (date.getFullYear() !== year ||
                date.getMonth() + 1 !== month ||
                date.getDate() !== day)
        ) {
            throw 'Invalid date';
        }

        return date;
    }

    parseTime(value: string) {
        const tokens = value.split(':');
        const validTokenLength = this.$props.showSeconds ? 3 : 2;
        const regex = /^[0-9][0-9]$/;

        if (
            tokens.length !== validTokenLength ||
            !tokens[0].match(regex) ||
            !tokens[1].match(regex) ||
            (this.$props.showSeconds && !tokens[2].match(regex))
        ) {
            throw 'Invalid time';
        }

        let h: null | number = parseInt(tokens[0]);
        const m: null | number = parseInt(tokens[1]);
        const s: any = this.$props.showSeconds ? parseInt(tokens[2]) : null;

        if (
            isNaN(h) ||
            isNaN(m) ||
            h > 23 ||
            m > 59 ||
            (this.$props.hourFormat === '12' && h > 12) ||
            (this.$props.showSeconds && (isNaN(s) || s > 59))
        ) {
            throw 'Invalid time';
        } else {
            if (this.$props.hourFormat === '12' && h !== 12 && this.pm) {
                h += 12;
            }

            return { hour: h, minute: m, second: s };
        }
    }

    parseValue(text: string): any {
        if (!text || text.trim().length === 0) {
            return null;
        }

        let value;

        if (this.isSingleSelection()) {
            value = this.parseDateTime(text);
        } else if (this.isMultipleSelection()) {
            const tokens = text.split(',');
            value = [];
            for (const token of tokens) {
                value.push(this.parseDateTime(token.trim()));
            }
        } else if (this.isRangeSelection()) {
            const tokens = text.split(' - ');
            value = [];
            for (let i = 0; i < tokens.length; i++) {
                value[i] = this.parseDateTime(tokens[i].trim());
            }
        }

        return value;
    }

    populateTime(value: Date, timeString: string, ampm: string) {
        if (this.$props.hourFormat === '12' && !ampm) {
            throw 'Invalid Time';
        }

        this.pm = ampm === 'PM' || ampm === 'pm';
        const time = this.parseTime(timeString);
        value.setHours(time.hour);
        value.setMinutes(time.minute);
        value.setSeconds(time.second);
    }

    repeat(
        event: MouseEvent,
        interval: null | number,
        type: number,
        direction: number
    ) {
        const i: number = interval || 500;

        this.clearTimePickerTimer();
        this.timePickerTimer = setTimeout(() => {
            this.repeat(event, 100, type, direction);
        }, i);

        switch (type) {
            case 0: {
                if (direction === 1) {
                    this.incrementHour(event);
                } else {
                    this.decrementHour(event);
                }
                break;
            }
            case 1: {
                if (direction === 1) {
                    this.incrementMinute(event);
                } else {
                    this.decrementMinute(event);
                }
                break;
            }
            case 2: {
                if (direction === 1) {
                    this.incrementSecond(event);
                } else {
                    this.decrementSecond(event);
                }
                break;
            }
        }
    }

    restoreAppend() {
        if (this.$refs.overlay && this.$props.appendTo) {
            if (this.$props.appendTo === 'body') {
                document.body.removeChild(this.$refs.overlay);
            } else {
                const append_el = document.getElementById(this.$props.appendTo);
                if (append_el) {
                    append_el.removeChild(this.$refs.overlay);
                }
            }
        }
    }

    selectDate(dateMeta: any) {
        let date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);

        if (this.$props.showTime) {
            if (
                this.$props.hourFormat === '12' &&
                this.pm !== null &&
                this.currentHour !== null &&
                this.currentHour !== 12
            ) {
                date.setHours(this.currentHour + 12);
            } else if (this.currentHour !== null) {
                date.setHours(this.currentHour);
            }

            if (this.currentMinute !== null)
                date.setMinutes(this.currentMinute);
            if (this.currentSecond !== null)
                date.setSeconds(this.currentSecond);
        }

        if (this.$props.minDate && this.$props.minDate > date) {
            date = this.$props.minDate;
            this.currentHour = date.getHours();
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
        }

        if (this.$props.maxDate && this.$props.maxDate < date) {
            date = this.$props.maxDate;
            this.currentHour = date.getHours();
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
        }

        let modelVal: any = null;

        if (this.isSingleSelection()) {
            modelVal = date;
        } else if (this.isMultipleSelection()) {
            modelVal = this.$props.value
                ? [...this.$props.value, date]
                : [date];
        } else if (this.isRangeSelection()) {
            if (this.$props.value && this.$props.value.length) {
                let startDate = this.$props.value[0];
                let endDate = this.$props.value[1];

                if (!endDate && date.getTime() >= startDate.getTime()) {
                    endDate = date;
                } else {
                    startDate = date;
                    endDate = null;
                }

                modelVal = [startDate, endDate];
            } else {
                modelVal = [date, null];
            }
        }

        if (modelVal !== null) {
            this.updateModel(modelVal);
        }

        this.$emit('date-select', date);
    }

    shouldSelectDate() {
        if (this.isMultipleSelection()) {
            return this.$props.maxDateCount !== null
                ? this.$props.maxDateCount >
                      (this.$props.value ? this.$props.length : 0)
                : true;
        } else {
            return true;
        }
    }

    switchToMonthView(event: MouseEvent) {
        this.currentView = 'month';
        setTimeout(this.updateFocus, 0);
        event.preventDefault();
    }

    switchToYearView(event: MouseEvent) {
        this.currentView = 'year';
        setTimeout(this.updateFocus, 0);
        event.preventDefault();
    }

    trapFocus(event: KeyboardEvent) {
        event.preventDefault();

        const focusableElements = DomHandler.getFocusableElements(
            this.$refs.overlay
        );

        if (focusableElements && focusableElements.length > 0) {
            if (!document.activeElement) {
                focusableElements[0].focus();
            } else {
                const focusedIndex = focusableElements.indexOf(
                    document.activeElement
                );

                if (event.shiftKey) {
                    if (focusedIndex === -1 || focusedIndex === 0) {
                        focusableElements[focusableElements.length - 1].focus();
                    } else {
                        focusableElements[focusedIndex - 1].focus();
                    }
                } else if (
                    focusedIndex === -1 ||
                    focusedIndex === focusableElements.length - 1
                ) {
                    focusableElements[0].focus();
                } else {
                    focusableElements[focusedIndex + 1].focus();
                }
            }
        }
    }

    toggleAMPM(event: MouseEvent) {
        this.pm = !this.pm;
        this.updateModelTime();
        event.preventDefault();
    }

    unbindOutsideClickListener() {
        if (this.outsideClickListener) {
            document.removeEventListener(
                'mousedown',
                this.outsideClickListener
            );
            this.outsideClickListener = null;
        }
    }

    unbindResizeListener() {
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }
    }

    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }

    updateCurrentMetaDate() {
        const viewDate: Date = this.viewDate;
        this.currentMonth = viewDate.getMonth();
        this.currentYear = viewDate.getFullYear();

        if (this.$props.showTime || this.$props.timeOnly) {
            this.updateCurrentMetaTime(viewDate);
        }
    }

    updateCurrentMetaTime(date: Date) {
        const hours = date.getHours();

        if (this.$props.hourFormat === '12') {
            this.pm = hours > 11;

            if (hours >= 12) {
                this.currentHour = hours === 12 ? 12 : hours - 12;
            } else {
                this.currentHour = hours === 0 ? 12 : hours;
            }
        } else {
            this.currentHour = date.getHours();
        }

        this.currentMinute = date.getMinutes();
        this.currentSecond = date.getSeconds();
    }

    updateFocus() {
        let cell: HTMLElement | null = null;

        if (this.navigationState) {
            if (this.navigationState.button) {
                this.initFocusableCell();

                if (this.navigationState.backward) {
                    DomHandler.findSingle(
                        this.$refs.overlay,
                        '.p-datepicker-prev'
                    ).focus();
                } else {
                    DomHandler.findSingle(
                        this.$refs.overlay,
                        '.p-datepicker-next'
                    ).focus();
                }
            } else {
                if (this.navigationState.backward) {
                    let cells: NodeListOf<HTMLElement>;

                    if (this.currentView === 'month') {
                        cells = DomHandler.find(
                            this.$refs.overlay,
                            '.p-monthpicker .p-monthpicker-month:not(.p-disabled)'
                        );
                    } else if (this.currentView === 'year') {
                        cells = DomHandler.find(
                            this.$refs.overlay,
                            '.p-yearpicker .p-yearpicker-year:not(.p-disabled)'
                        );
                    } else {
                        cells = DomHandler.find(
                            this.$refs.overlay,
                            '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)'
                        );
                    }

                    if (cells && cells.length > 0) {
                        cell = cells[cells.length - 1];
                    }
                } else if (this.currentView === 'month') {
                    cell = DomHandler.findSingle(
                        this.$refs.overlay,
                        '.p-monthpicker .p-monthpicker-month:not(.p-disabled)'
                    );
                } else if (this.currentView === 'year') {
                    cell = DomHandler.findSingle(
                        this.$refs.overlay,
                        '.p-yearpicker .p-yearpicker-year:not(.p-disabled)'
                    );
                } else {
                    cell = DomHandler.findSingle(
                        this.$refs.overlay,
                        '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)'
                    );
                }

                if (cell) {
                    cell.tabIndex = 0;
                    cell.focus();
                }
            }

            this.navigationState = null;
        } else {
            this.initFocusableCell();
        }
    }

    updateModel(value: any) {
        this.$emit('input', value);
    }

    updateModelTime() {
        this.timePickerChange = true;

        let value: Date | Array<Date | null> = this.isComparable()
            ? this.$props.value
            : new Date();

        if (this.isRangeSelection()) {
            value = this.$props.value[1] || this.$props.value[0];
        } else if (this.isMultipleSelection()) {
            value = this.$props.value[this.$props.value.length - 1];
        }

        value = value ? new Date((value as Date).getTime()) : new Date();

        if (this.$props.hourFormat === '12') {
            if (this.currentHour === 12) {
                value.setHours(this.pm ? 12 : 0);
            } else if (this.currentHour !== null) {
                value.setHours(
                    this.pm ? this.currentHour + 12 : this.currentHour
                );
            }
        } else if (this.currentHour !== null) {
            value.setHours(this.currentHour);
        }

        if (this.currentMinute !== null) {
            value.setMinutes(this.currentMinute);
        }

        if (this.currentSecond !== null) {
            value.setSeconds(this.currentSecond);
        }

        if (this.isRangeSelection()) {
            if (this.$props.value[1]) {
                value = [this.$props.value[0], value];
            } else {
                value = [value, null];
            }
        }

        if (this.isMultipleSelection()) {
            value = [...this.$props.value.slice(0, -1), value];
        }

        this.updateModel(value);
        this.$emit('date-select', value);
        setTimeout(() => (this.timePickerChange = false), 0);
    }

    validateTime(hour: number, minute: number, second: number, pm: boolean) {
        let value = this.isComparable() ? this.$props.value : this.viewDate;
        const convertedHour = this.convertTo24Hour(hour, pm);

        if (this.isRangeSelection()) {
            value = this.$props.value[1] || this.$props.value[0];
        } else if (this.isMultipleSelection()) {
            value = this.$props.value[this.$props.value.length - 1];
        }

        const valueDateString = value ? value.toDateString() : null;

        if (
            this.$props.minDate &&
            valueDateString &&
            this.$props.minDate.toDateString() === valueDateString
        ) {
            if (this.$props.minDate.getHours() > convertedHour) {
                return false;
            } else if (this.$props.minDate.getHours() === convertedHour) {
                if (this.$props.minDate.getMinutes() > minute) {
                    return false;
                } else if (this.$props.minDate.getMinutes() === minute) {
                    if (this.$props.minDate.getSeconds() > second) {
                        return false;
                    }
                }
            }
        }

        if (
            this.$props.maxDate &&
            valueDateString &&
            this.$props.maxDate.toDateString() === valueDateString
        ) {
            if (this.$props.maxDate.getHours() < convertedHour) {
                return false;
            } else if (this.$props.maxDate.getHours() === convertedHour) {
                if (this.$props.maxDate.getMinutes() < minute) {
                    return false;
                } else if (this.$props.maxDate.getMinutes() === minute) {
                    if (this.$props.maxDate.getSeconds() < second) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    get attributeSelector() {
        return UniqueComponentId();
    }

    get clearLabel(): string {
        return this.d_locale.clear;
    }

    get containerClass(): Array<string | object> {
        return [
            'p-calendar p-component p-inputwrapper',
            this.$props.className,
            {
                'p-calendar-w-btn': this.$props.showIcon,
                'p-calendar-timeonly': this.$props.timeOnly,
                'p-inputwrapper-filled': this.$props.value,
                'p-inputwrapper-focus': this.focused
            }
        ];
    }

    get datePattern(): string {
        return this.$props.dateFormat || this.d_locale.dateFormat;
    }

    get formattedCurrentHour(): string {
        if (this.currentHour !== null) {
            return this.currentHour < 10
                ? `0${this.currentHour}`
                : `${this.currentHour}`;
        }
        return '00';
    }

    get formattedCurrentMinute(): string {
        if (this.currentMinute !== null) {
            return this.currentMinute < 10
                ? `0${this.currentMinute}`
                : `${this.currentMinute}`;
        }
        return '00';
    }

    get formattedCurrentSecond(): string {
        if (this.currentSecond !== null) {
            return this.currentSecond < 10
                ? `0${this.currentSecond}`
                : `${this.currentSecond}`;
        }
        return '00';
    }

    get inputFieldValue(): string {
        return this.formatValue(this.$props.value);
    }

    get listeners(): object {
        const $vm = this;

        return {
            ...$vm.$listeners,
            input: (val: string) => {
                this.onInput(val);
            },
            focus: (event: FocusEvent) => {
                $vm.focus = true;
                if ($vm.$props.showOnFocus && $vm.isEnabled()) {
                    $vm.overlayVisible = true;
                }
                $vm.focused = true;
                $vm.$emit('focus', event);
            },
            blur: (event: FocusEvent) => {
                $vm.focused = false;
                $vm.$emit('blur', event);
            },
            keydown: (event: KeyboardEvent) => {
                $vm.isKeydown = true;

                if (event.key === 'Escape') {
                    if ($vm.overlayVisible) {
                        $vm.overlayVisible = false;
                        event.preventDefault();
                    }
                } else if (event.key === 'Tab' && $vm.$refs.overlay) {
                    DomHandler.getFocusableElements($vm.$refs.overlay).forEach(
                        (el: HTMLElement) => (el.tabIndex = -1)
                    );

                    if ($vm.overlayVisible) {
                        $vm.overlayVisible = false;
                    }
                }

                $vm.$emit('keydown', event);
            }
        };
    }

    get monthPickerValues(): Array<string> {
        const monthPickerValues: Array<string> = [];
        for (let i = 0; i <= 11; i++) {
            monthPickerValues.push(this.d_locale.monthNames[i]);
        }

        return monthPickerValues;
    }

    get months(): Array<object> {
        const months: Array<object> = [];
        for (let i = 0; i < this.$props.numberOfMonths; i++) {
            let year = this.currentYear ?? new Date().getFullYear();
            let month = (this.currentMonth ?? 1) + i;
            if (month > 11) {
                month = (month % 11) - 1;
                year = year + 1;
            }

            const dates = [];
            const firstDay = this.getFirstDayOfMonthIndex(month, year);
            const daysLength = this.getDaysCountInMonth(month, year);
            const prevMonthDaysLength = this.getDaysCountInPrevMonth(
                month,
                year
            );

            let dayNo = 1;
            const today = new Date();
            const weekNumbers = [];
            const monthRows = Math.ceil((daysLength + firstDay) / 7);

            for (let i = 0; i < monthRows; i++) {
                const week = [];

                if (i === 0) {
                    for (
                        let j = prevMonthDaysLength - firstDay + 1;
                        j <= prevMonthDaysLength;
                        j++
                    ) {
                        const prev = this.getPreviousMonthAndYear(month, year);
                        week.push({
                            day: j,
                            month: prev.month,
                            year: prev.year,
                            otherMonth: true,
                            today: this.isToday(
                                today,
                                j,
                                prev.month,
                                prev.year
                            ),
                            selectable: this.isSelectable(
                                j,
                                prev.month,
                                prev.year,
                                true
                            )
                        });
                    }

                    const remainingDaysLength = 7 - week.length;
                    for (let j = 0; j < remainingDaysLength; j++) {
                        week.push({
                            day: dayNo,
                            month,
                            year,
                            today: this.isToday(today, dayNo, month, year),
                            selectable: this.isSelectable(
                                dayNo,
                                month,
                                year,
                                false
                            )
                        });
                        dayNo++;
                    }
                } else {
                    for (let j = 0; j < 7; j++) {
                        if (dayNo > daysLength) {
                            const next = this.getNextMonthAndYear(month, year);

                            week.push({
                                day: dayNo - daysLength,
                                month: next.month,
                                year: next.year,
                                otherMonth: true,
                                today: this.isToday(
                                    today,
                                    dayNo - daysLength,
                                    next.month,
                                    next.year
                                ),
                                selectable: this.isSelectable(
                                    dayNo - daysLength,
                                    next.month,
                                    next.year,
                                    true
                                )
                            });
                        } else {
                            week.push({
                                day: dayNo,
                                month,
                                year,
                                today: this.isToday(today, dayNo, month, year),
                                selectable: this.isSelectable(
                                    dayNo,
                                    month,
                                    year,
                                    false
                                )
                            });
                        }

                        dayNo++;
                    }
                }

                if (this.$props.showWeek) {
                    weekNumbers.push(
                        this.getWeekNumber(
                            new Date(week[0].year, week[0].month, week[0].day)
                        )
                    );
                }

                dates.push(week);
            }

            months.push({
                month,
                year,
                dates,
                weekNumbers
            });
        }

        return months;
    }

    get panelStyleClass(): Array<string | object> {
        return [
            'p-datepicker p-component',
            this.$props.panelClass,
            {
                'p-datepicker-inline': this.$props.inline,
                'p-disabled': this.$attrs.disabled,
                'p-datepicker-timeonly': this.$props.timeOnly,
                'p-datepicker-multiple-month': this.$props.numberOfMonths > 1,
                'p-datepicker-monthpicker': this.currentView === 'month',
                'p-datepicker-yearpicker': this.currentView === 'year',
                'p-datepicker-touch-ui': this.$props.touchUI
            }
        ];
    }

    get sundayIndex(): number {
        return this.d_locale.firstDayOfWeek > 0
            ? 7 - this.d_locale.firstDayOfWeek
            : 0;
    }

    get switchViewButtonDisabled() {
        return this.$props.numberOfMonths > 1 || this.$attrs.disabled;
    }

    get ticksTo1970(): number {
        return (
            ((1970 - 1) * 365 +
                Math.floor(1970 / 4) -
                Math.floor(1970 / 100) +
                Math.floor(1970 / 400)) *
            24 *
            60 *
            60 *
            10000000
        );
    }

    get todayLabel(): string {
        return this.d_locale.today;
    }

    get viewDate(): Date {
        let propValue = this.$props.value;
        if (typeof propValue === 'string') {
            return new Date();
        }

        if (propValue && Array.isArray(propValue)) {
            propValue = propValue[0];
        }

        return propValue || new Date();
    }

    get weekDays(): Array<string> {
        const weekDays: Array<string> = [];
        let dayIndex = this.d_locale.firstDayOfWeek;
        for (let i = 0; i < 7; i++) {
            weekDays.push(this.d_locale.dayNamesMin[dayIndex]);
            dayIndex = dayIndex === 6 ? 0 : ++dayIndex;
        }

        return weekDays;
    }

    get weekHeaderLabel(): string {
        return this.d_locale.weekHeader;
    }

    get yearPickerValues(): Array<number> {
        const yearPickerValues: Array<number> = [];
        if (this.currentYear !== null) {
            const base = this.currentYear - (this.currentYear % 10);
            for (let i = 0; i < 10; i++) {
                yearPickerValues.push(base + i);
            }
        }

        return yearPickerValues;
    }
}
</script>

<style lang="scss" scoped>
.p-datepicker table td.p-datepicker-other-month {
    color: var(--gray-400);
}
</style>
