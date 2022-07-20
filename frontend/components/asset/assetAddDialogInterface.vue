<template>
    <i-scroll-panel
        id="i-asset-add-dialog-interface"
        :style="{ 'padding-left': '1rem', 'padding-right': '1rem' }"
    >
        <Card>
            <template #header>인터페이스 설정</template>
            <template #content>
                <div
                    v-for="intf of productInterfacesToRender"
                    :key="intf.ID"
                    class="p-field-radiobutton"
                >
                    <RadioButton
                        :id="intf.ID"
                        v-model="productInterfaceId"
                        name="intf"
                        :value="Number(intf.ID)"
                    />
                    <label :for="intf.ID" class="p-ml-3">
                        {{ intf.INTERFACE.NAME }}
                    </label>
                </div>
            </template>
        </Card>

        <Divider v-if="showInterface" class="p-mt-1 p-mb-5" />

        <div v-if="showInterface" class="p-fluid p-input-filled">
            <div class="p-field-checkbox p-mb-1">
                <InputSwitch v-model="is_com" />
                <label>데이터통신 사용</label>
            </div>
        </div>
        <div v-if="showInterface" class="p-fluid p-input-filled p-col">
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-label"> 통신 IP </label>
                <div class="p-col-3 i-form-value">
                    <i-input-ipv-4
                        v-model="assetInterface.IP_ADDR"
                        type="text"
                        class="p-ml-2"
                        aria-describedby="ip-addr-help"
                        autocomplete="off"
                        :class="{
                            'p-invalid': invalidMessage.IP_ADDR
                        }"
                        @input="validateIpAddr"
                    />
                </div>
                <div class="p-col p-my-2" :style="{ 'align-self': 'center' }">
                    <small class="p-error">
                        {{ invalidMessage.IP_ADDR }}
                    </small>
                </div>
            </div>
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-label">
                    통신 Port
                </label>
                <div class="p-col-2 i-form-value">
                    <i-input-number
                        v-model="assetInterface.PORT"
                        class="p-ml-2"
                        :min="0"
                        :max="65535"
                        :show-buttons="true"
                        :step="1"
                    />
                </div>
                <label class="p-col-fixed p-my-2 p-ml-4 i-form-label">
                    장치 ID
                </label>
                <div class="p-col-2 i-form-value">
                    <i-input-number
                        v-model="assetInterface.DEVICE_ID"
                        class="p-ml-2"
                        :min="0"
                        :max="255"
                        :show-buttons="true"
                        :step="1"
                    />
                </div>
            </div>
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-second-label">
                    통신주기(초)
                </label>
                <div class="p-col-2 i-form-value">
                    <i-input-number
                        v-model="assetInterface.POLL_INTERVAL"
                        class="p-ml-2"
                        :min="0"
                        :max="86400"
                        :show-buttons="true"
                        :step="1"
                    />
                </div>
            </div>
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-second-label">
                    응답대기시간(초)
                </label>
                <div class="p-col-2 i-form-value">
                    <i-input-number
                        v-model="assetInterface.TIMEOUT"
                        class="p-ml-2"
                        :min="0"
                        :max="86400"
                        :show-buttons="true"
                        :step="1"
                    />
                </div>
            </div>
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-second-label">
                    통신재시도 횟수(초)
                </label>
                <div class="p-col-2 i-form-value">
                    <i-input-number
                        v-model="assetInterface.RETRY"
                        class="p-ml-2"
                        :min="0"
                        :max="86400"
                        :show-buttons="true"
                        :step="1"
                    />
                </div>
            </div>
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-second-label">
                    연결정보
                </label>
                <div class="p-col-5 i-form-value">
                    <InputText
                        v-model="assetInterface.ACCESS_INFO"
                        class="p-ml-2"
                        type="text"
                        aria-describedby="access-info-help"
                        autocomplete="off"
                        :class="{
                            'p-invalid': invalidMessage.ACCESS_INFO
                        }"
                        @input="validateAccessInfo"
                    />
                </div>
                <div class="p-col p-my-2" :style="{ 'align-self': 'center' }">
                    <small class="p-error">
                        {{ invalidMessage.ACCESS_INFO }}
                    </small>
                </div>
            </div>
        </div>
    </i-scroll-panel>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';

@Component<AssetAddDialogInterface>({
    props: {
        productInterfaces: {
            type: Array,
            default: null
        },
        asset: {
            type: Object,
            default: null
        },
        assetInterface: {
            type: Object,
            default: null
        }
    },
    watch: {
        productInterfaceId(id: number) {
            const asset = this.$props.asset;
            this.$set(asset, 'IS_USE_INTF', id > 0 ? 1 : 0);

            const intf = this.$props.assetInterface;
            this.$set(intf, 'PROD_INTF_ID', id !== -1 ? id : 0);

            this.$emit('update:asset', asset);
            this.$emit('update:assetInterface', intf);
        },
        invalidMessage: {
            deep: true,
            handler() {
                this.validationCheck();
            }
        }
    }
})
export default class AssetAddDialogInterface extends Vue {
    productInterfaceId: number = -1;

    invalidMessage = {
        IP_ADDR: undefined as string | undefined,
        ACCESS_INFO: undefined as string | undefined
    };

    get productInterfacesToRender(): Array<object> {
        if (this.$props.productInterfaces) {
            const product_interfaces: Array<object> = [
                {
                    ID: 0,
                    INTERFACE: {
                        NAME: '인터페이스 사용안함'
                    }
                },
                ...this.$props.productInterfaces
            ];
            return product_interfaces;
        } else {
            return [];
        }
    }

    get showInterface(): boolean {
        return this.productInterfaceId > 0;
    }

    get is_com(): boolean {
        return this.$props.assetInterface.IS_USE === 1;
    }

    set is_com(is_com: boolean) {
        const intf = this.$props.assetInterface;
        this.$set(intf, 'IS_USE', is_com ? 1 : 0);
        this.$emit('update:assetInterface', intf);
    }

    validateIpAddr(event: InputEvent) {
        const input = event.toString();
        if (input.length > 15) {
            this.invalidMessage.IP_ADDR =
                '통신 IP는 최대 15자까지 입력 가능합니다';
        } else if (input.length === 0) {
            this.invalidMessage.IP_ADDR = undefined;
        } else {
            const is = this.is_ipv4(input);
            if (is) {
                this.invalidMessage.IP_ADDR = undefined;
            } else {
                this.invalidMessage.IP_ADDR =
                    '통신 IP를 Ipv4 형식(xxx.xxx.xxx.xxx)에 맞춰주세요';
            }
        }
    }

    validateAccessInfo(event: InputEvent) {
        const input = event.toString();
        if (input.length > 256) {
            this.invalidMessage.ACCESS_INFO =
                '연결정보는 최대 256자까지 입력 가능합니다';
        } else {
            this.invalidMessage.ACCESS_INFO = undefined;
        }
    }

    is_ipv4(_input: string): boolean {
        const ips = _input.split('.');
        // by shkoh 20220719: ip가 4개로 구분되는지 확인
        if (ips.length !== 4) {
            return false;
        }

        let is_ipv4 = true;
        for (const ip of ips) {
            const ip_num = parseInt(ip);
            if (isNaN(ip_num) || ip_num < 0 || ip_num > 255) {
                is_ipv4 = false;
                break;
            }
        }

        return is_ipv4;
    }

    validationCheck() {
        let is_valid = true;
        if (this.productInterfaceId > 0) {
            for (const valid of Object.values(this.invalidMessage)) {
                if (valid) {
                    is_valid = false;
                    break;
                }
            }
        }

        this.$emit('validate', is_valid);
    }
}
</script>

<style lang="scss" scoped>
#i-asset-add-dialog-interface::v-deep {
    .i-form-label {
        flex-basis: 120px;
        border-radius: 3px;
        background-color: var(--primary-color);
        color: var(--primary-color-text);
        padding: 0.5rem;
    }

    .i-form-value {
        align-self: center;
    }

    .i-form-second-label {
        flex-basis: 120px;
        border-radius: 3px;
        background-color: var(--text-color-secondary);
        color: var(--primary-color-text);
        padding: 0.5rem;
    }

    .p-card {
        box-shadow: none;

        .p-card-body {
            .p-card-content {
                padding: 0;
            }
        }
    }
}
</style>
