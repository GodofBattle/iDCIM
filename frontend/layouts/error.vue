<template>
    <div class="i-error">
        <div class="i-error-first p-d-flex p-ai-end p-jc-center">
            <div class="i-error-title">:: iDCIM Page Error ::</div>
        </div>
        <div
            class="i-error-middle p-d-flex p-flex-column p-ai-center p-jc-start"
        >
            <div class="i-error-message p-mt-6">
                <div>
                    <div>{{ error.statusCode }}</div>
                    <div>{{ error.message }}</div>
                </div>
            </div>
            <a class="i-error-link p-mt-6" @click="back">go back</a>
        </div>
        <div class="i-error-last p-d-flex p-ai-center p-jc-center">
            <div class="i-error-footer">
                <div>(주) 아이커머</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['error'],
    layout: 'error',
    methods: {
        back() {
            this.$router.back();
        },
    },
};
</script>

<style scoped>
.i-error {
    background-color: #dddddd;
    display: block;
    width: 100vw;
    height: 100vh;
}

.i-error-first {
    height: 30vh;
}

.i-error-middle {
    height: 65vh;
    background-color: #333333;
}

.i-error-last {
    height: 5vh;
    background-color: #333333;
}

.i-error-title {
    font-size: 5rem;
    font-weight: bold;
    color: #333333;
}

.i-error-message {
    font-size: 2.4rem;
    color: #bb3434;
}

.i-error-footer {
    font-size: 1.2rem;
    color: #666666;
}

.i-error-link {
    text-decoration: underline;
    color: #dfcb53;
    font-size: 2rem;
}

.i-error-link:hover {
    color: #b1a044;
    cursor: pointer;
}
</style>