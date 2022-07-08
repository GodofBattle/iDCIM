<template>
    <input
        ref="input"
        :class="['p-component p-inputtext', { 'p-filled': filled }]"
        :value="formattedValue"
        v-bind="$attrs"
        :aria-valuemin="min"
        :aria-valuemax="max"
        v-on="listeners"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IInputNumber>({
    inheritAttrs: false,
    props: {
        value: {
            type: Number,
            default: null
        },
        minFractionDigits: {
            type: Number,
            default: null
        },
        maxFractionDigits: {
            type: Number,
            default: 2
        },
        min: {
            type: Number,
            default: null
        },
        max: {
            type: Number,
            default: null
        },
        step: {
            type: Number,
            default: 1
        },
        autoFocus: {
            type: Boolean,
            default: false
        }
    }
})
export default class IInputNumber extends Vue {
    $refs!: {
        input: HTMLInputElement;
    };

    lastValue = '';

    mounted() {
        if (this.$props.autoFocus) {
            this.$refs.input.focus();
        }
    }

    get formattedValue(): string {
        const _val = this.convertFractionDigit(this.$props.value.toString());
        return _val;
    }

    get filled(): boolean {
        return (
            this.$props.value !== null &&
            this.$props.value.toString().length > 0
        );
    }

    get listeners(): any {
        return {
            ...this.$listeners,
            input: (event: InputEvent) => {
                const input = event.target as HTMLInputElement;

                this.updateInput(event, input);
            },
            beforeinput: (event: InputEvent) => {
                const input = event.target as HTMLInputElement;

                let flag = false;
                if (event.data) {
                    const reg = /[0-9|.|-]/;
                    // by shkoh 20220707: 숫자와 마침표(.) -만 허용
                    flag = reg.test(event.data);

                    if (flag) {
                        this.lastValue = input.value;
                    } else if (!flag) {
                        event.preventDefault();
                    }
                }
            },
            keydown: (event: KeyboardEvent) => {
                this.lastValue = (event.target as HTMLInputElement).value;

                switch (event.key) {
                    case 'ArrowUp': {
                        this.spin(event, 1);
                        event.preventDefault();
                        break;
                    }
                    case 'ArrowDown': {
                        this.spin(event, -1);
                        event.preventDefault();
                        break;
                    }
                    case 'Enter': {
                        this.setValue(event);
                        this.$emit('keydownEnter', event);
                        event.preventDefault();
                        break;
                    }
                    case 'Escape': {
                        this.setValue(event);
                        this.$emit('keydownEscape', event);
                        event.preventDefault();
                        break;
                    }
                }
            },
            blur: (event: FocusEvent) => {
                const input = event.target as HTMLInputElement;
                this.updateInput(event, input);
            }
        };
    }

    updateInput(
        event: KeyboardEvent | InputEvent | FocusEvent,
        input: HTMLInputElement
    ) {
        // by shkoh 20220708: 입력된 텍스트에서 '-' 표시만 존재할 경우에는 표시는 하지만 값으로 지정하진 않는다
        if (this.isMinusSign(input.value)) {
            input.value = input.value === '-0' ? '-0' : '-';
            return;
        }

        // by shkoh 20220708: 소수점 자리는 지정된 수(maxFractionDigits) 이상 표시할 수 없다
        if (this.isFullMaxFractionDigit(input.value)) {
            input.value = this.lastValue;
            return;
        }

        // by shkoh 20220708: 소수점 자리를 표현하기 위해서 마지막 텍스트에 '.' 표시만 존재하는 경우에 입력은 받되, 숫자로 인지하지는 않는다
        if (this.hasDotSignAtLast(input.value)) {
            // by shkoh 20220708: 다만 '.'를 여러번 입력한 경우에는 마지막 유효한 값을 표시한다.
            if (this.hasManyDotSigns(input.value)) {
                input.value = this.lastValue;
            }
            return;
        }

        const output = this.convertNumber(input.value);

        if (Number.isNaN(output)) {
            input.value = this.lastValue;
        } else {
            if (this.isMax(output)) {
                return;
            }

            if (this.isMin(output)) {
                return;
            }

            input.value = this.convertFractionDigit(output.toString());
            input.setAttribute('aria-valuenow', output.toString());

            this.$emit('input', output);
        }
    }

    isMinusSign(_value: string) {
        if (_value === '-' || _value === '0-' || _value === '-0') {
            return true;
        }

        return false;
    }

    hasDotSignAtLast(_value: string) {
        const char = _value.charAt(_value.length - 1);
        return char === '.';
    }

    hasManyDotSigns(_value: string) {
        const dots = _value.split('.');
        return dots.length > 2;
    }

    isMin(_value: number) {
        const min = this.$props.min;
        return min !== null && min > _value;
    }

    isMax(_value: number) {
        const max = this.$props.max;
        return max !== null && max < _value;
    }

    convertNumber(_value: string) {
        const val = Number(_value);

        return val;
    }

    isFullMaxFractionDigit(_value: string) {
        const fraction = _value.split('.')[1];
        const max_digit = this.$props.maxFractionDigits;

        if (max_digit && fraction) {
            if (fraction.length > max_digit) {
                return true;
            }
        }

        return false;
    }

    convertFractionDigit(_value: string) {
        const fraction = _value.split('.')[1];
        const min_digit = this.$props.minFractionDigits;

        if (min_digit) {
            if (fraction === undefined || fraction.length < min_digit) {
                const num_val = this.convertNumber(_value);
                return num_val.toFixed(min_digit);
            }
        }

        return _value;
    }

    spin(event: KeyboardEvent, dir: number) {
        const step = this.$props.step * dir;

        const input = event.target as HTMLInputElement;
        const current_value = this.convertNumber(input.value);
        const new_value = current_value + step;

        if (this.isMin(new_value)) {
            return;
        }

        if (this.isMax(new_value)) {
            return;
        }

        input.value = new_value.toFixed(this.$props.maxFractionDigits);
        this.updateInput(event, input);
    }

    setValue(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;

        let current_value = this.convertNumber(input.value);

        if (this.isMin(current_value)) {
            current_value = this.$props.min;
        }

        if (this.isMax(current_value)) {
            current_value = this.$props.max;
        }

        input.value = current_value.toString();
    }
}
</script>
