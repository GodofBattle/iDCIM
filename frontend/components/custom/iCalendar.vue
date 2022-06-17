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
        ></transition>
    </span>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import DomHandler from '@/plugins/primevue.DomHandler';
import UniqueComponentId from '@/plugins/primevue.UniqueComponentId';

type LocaleSettings = {
    firstDayOfWeek?: number;
    dayNames: string[];
    dayNamesShort: string[];
    dayNamesMin: string[];
    monthNames: string[];
    monthNamesShort: string[];
    today: string;
    clear: string;
    dateFormat: string;
    weekHeader?: string;
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
        locale: {
            type: Object,
            default: () => {
                return {
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
                    today: '금일',
                    clear: '닫기',
                    dateFormat: 'yyyy/MM/dd',
                    weekHeader: '주'
                } as LocaleSettings;
            }
        },
        manualInput: {
            type: Boolean,
            default: true
        },
        maxDate: {
            type: Date,
            default: null
        },
        minDate: {
            type: Date,
            default: null
        },
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
        showIcon: {
            type: Boolean,
            default: false
        },
        showOnFocus: {
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
        styles: {
            type: Object,
            default: null
        },
        timeOnly: {
            type: Boolean,
            default: false
        },
        touchUI: {
            type: Boolean,
            default: false
        },
        value: {
            type: [String, Array, Object],
            default: null
        },
        view: {
            type: String,
            default: 'date'
        }
    },
    inheritAttrs: false
})
export default class ICalendar extends Vue {
    $refs: {
        input: any;
        overlay: any;
    };

    focus: boolean = false;
    focused: boolean = false;
    isKeydown: boolean = false;
    overlayVisible: boolean = false;

    mask: null | HTMLElement = null;
    maskClickListener: any = null;

    pm: null | boolean = null;

    selectionStart: any = null;
    selectionEnd: any = null;

    currentView: string = this.$props.view;

    alignOverlay(el: HTMLElement) {
        if (this.$props.touchUI) {
            this.enableModality();
        } else if (this.$refs.overlay) {
            if (this.$props.appendTo) {
                DomHandler.absolutePosition(this.$refs.overlay, el);
            } else {
                DomHandler.relativePosition(this.$refs.overlay, el);
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

    daylightSavingAdjust(date: Date): Date | null {
        if (!date) {
            return null;
        }

        date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
        return date;
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
                                this.$props.locale.dayNamesShort,
                                this.$props.locale.dayNames
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
                                this.$props.locale.monthNamesShort,
                                this.$props.locale.monthNames
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

    isMultipleSelection(): boolean {
        return this.$props.selectionMode === 'multiple';
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

    isSingleSelection(): boolean {
        return this.$props.selectionMode === 'single';
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
            if (this.isValidSelection(value)) {
                this.updateModel(value);
            }
        } catch (err) {
            this.updateModel(val);
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
        this.alignOverlay(el);
    }

    parseDateTime(text: string) {
        let date;
        const parts = text.split(' ');

        if (this.$props.timeOnly) {
            date = new Date();
            this.populateTime(date, parts[0], parts[1]);
        } else {
            const dateFormat = this.$props.datePattern;
            if (this.$props.showTime) {
                date = this.parseDate(parts[0], dateFormat);

                if (date) {
                    this.populateTime(date, parts[1], parts[2]);
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
            const minSize = match === 'y' ? size : 1;
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
                            this.$props.locale.dayNamesShort,
                            this.$props.locale.dayNames
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
                            this.$props.locale.monthNamesShort,
                            this.$props.locale.monthNames
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
                date.getMonth() + 1 === month ||
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

    updateModel(value: any) {
        this.$emit('input', value);
    }

    get attributeSelector() {
        return UniqueComponentId();
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
        return this.$props.dateFormat || this.$props.locale.dateFormat;
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

                if (event.key === 'ArrowDown' && $vm.$refs.overlay) {
                    $vm.trapFocus(event);
                } else if (event.key === 'Escape') {
                    if ($vm.overlayVisible) {
                        $vm.overlayVisible = false;
                        event.preventDefault();
                    }
                } else if (event.key === 'Tab') {
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
}
</script>
