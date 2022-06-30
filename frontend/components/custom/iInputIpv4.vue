<template>
    <input
        :class="['p-inputtext p-component', { 'p-filled': filled }]"
        :value="value"
        v-on="listeners"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<IInputIpv4>({
    props: {
        value: {
            type: String,
            default: null
        }
    }
})
export default class IInputIpv4 extends Vue {
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
                const input_ele = event.target as HTMLInputElement;

                const ipv4 = this.convertIpv4(input_ele.value);
                if (ipv4.is_convert) {
                    input_ele.value = ipv4.input;
                }

                this.$emit('input', ipv4.input);
            },
            beforeinput: (event: InputEvent) => {
                if (event.data) {
                    const reg = /[0-9|.]/;

                    // by shkoh 20220627: 숫자와 마침표(.)인 택스트만 허용
                    const flag = reg.test(event.data);
                    if (!flag) {
                        event.preventDefault();
                    }
                }
            }
        };
    }

    convertIpv4(_input: string) {
        const reg =
            /[a-z|A-Z|ㄱ-ㅎ|ㅏ-ㅣ|가-힣|₩\{\}\[\]\/?,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/g;

        let is_convert = false;
        if (reg.test(_input)) {
            is_convert = true;
        }

        let replace_input = _input;
        if (is_convert) {
            replace_input = _input.replace(reg, '');
        }

        return {
            input: replace_input,
            is_convert
        };
    }
}
</script>
