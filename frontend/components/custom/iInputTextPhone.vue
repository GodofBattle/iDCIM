<template>
    <input
        :class="['p-inputtext p-component', { 'p-filled': filled }]"
        v-on="listeners"
        :value="value"
    />
</template>

<script>
export default {
    props: {
        value: null,
    },
    computed: {
        listeners() {
            return {
                ...this.$listeners,
                input: (event) => {
                    const new_input = this.convertPhoneNumber(
                        event.target.value
                    );

                    event.target.value = new_input;
                    this.$emit('input', new_input);
                },
            };
        },
        filled() {
            return this.value != null && this.value.toString().length > 0;
        },
    },
    methods: {
        convertPhoneNumber(input_value) {
            // by shkoh 20210824: 숫자 외에 모든 문자는 제거
            let _input = input_value
                .replace(
                    /[a-z|A-Z|ㄱ-ㅎ|ㅏ-ㅣ|가-힣|₩\{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/g,
                    ``
                )
                .substr(0, 11);

            let result = [];
            let restNumber = '';

            // by shkoh 20210824: 지역번호와 나머지 번호로 나누기
            if (_input.startsWith('02')) {
                // by shkoh 20210824: 서울 02 지역번호
                result.push(_input.substr(0, 2));
                restNumber = _input.substring(2);
            } else if (_input.startsWith('1')) {
                // by shkoh 20210824: 지역 번호가 없는 경우
                restNumber = _input;
            } else if (_input.startsWith('0')) {
                // by shkoh 20210824: 나머지 3자리 지역번호((0XX) XXXX-XXXX)
                result.push(_input.substr(0, 3));
                restNumber = _input.substring(3);
            } else {
                // by shkoh 20210824: 그 외
                restNumber = _input;
            }

            if (restNumber.length === 7) {
                // by shkoh 20210824: 7자리만 남았을 경우 XXX-XXXX
                result.push(restNumber.substring(0, 3));
                result.push(restNumber.substring(3));
            } else {
                result.push(restNumber.substring(0, 4));
                result.push(restNumber.substring(4));
            }

            return result.filter((val) => val).join('-');
        },
    },
};
</script>