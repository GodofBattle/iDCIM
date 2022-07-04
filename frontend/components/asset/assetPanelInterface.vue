<template>
    <div id="i-asset-panel-interface">
        <div class="p-col p-fluid p-input-filled">
            <div class="p-field-checkbox">
                <InputSwitch id="is_communication" v-model="is_com" />
                <label for="is_communication">통신사용 여부</label>
            </div>
        </div>
        <div
            class="p-col p-fluid p-input-filled"
            :class="{ 'i-disabled': !is_com }"
        >
            <div class="p-field p-grid">
                <label for="ip-addr" class="p-col-fixed p-my-2 i-form-label">
                    통신 IP
                </label>
                <div class="p-col-3 i-form-value">
                    <i-input-ipv-4
                        id="ip-addr"
                        v-model="asset.INTERFACE.IP_ADDR"
                        type="text"
                        class="p-ml-2"
                        aria-describedby="ip-addr-help"
                        autocomplete="off"
                        :class="{
                            'p-invalid': invalidMessage.IP_ADDR
                        }"
                        :disabled="!is_com"
                        @input="validateIpAddr"
                    />
                </div>
                <div class="p-col p-my-2 i-form-error">
                    <small id="ip-addr-help" class="p-error">
                        {{ invalidMessage.IP_ADDR }}
                    </small>
                </div>
            </div>
        </div>
        <Panel
            :header="interfaceHeader"
            :toggleable="false"
            :class="{ 'i-disabled': !is_com }"
        >
            <div class="p-col p-fluid p-input-filled">
                <div class="p-field p-grid">
                    <label
                        for="port"
                        class="p-col-fixed p-my-2 i-form-panel-label"
                    >
                        통신 Port
                    </label>
                    <div class="p-col-2 i-form-value">
                        <InputNumber
                            id="port"
                            v-model="asset.INTERFACE.PORT"
                            class="p-ml-2"
                            mode="decimal"
                            :min="0"
                            :max="65535"
                            show-buttons
                            button-layout="horizontal"
                            :step="1"
                            decrement-button-class="p-button-secondary"
                            decrement-button-icon="pi pi-minus"
                            increment-button-class="p-button-secondary"
                            increment-button-icon="pi pi-plus"
                            aria-describedby="port-help"
                            autocomplete="off"
                            :disabled="!is_com"
                        ></InputNumber>
                    </div>
                    <label
                        for="device-id"
                        class="p-col-fixed p-my-2 p-ml-4 i-form-panel-label"
                    >
                        장치 ID
                    </label>
                    <div class="p-col-2 i-form-value">
                        <InputNumber
                            id="device-id"
                            v-model="asset.INTERFACE.DEVICE_ID"
                            class="p-ml-2"
                            mode="decimal"
                            :min="0"
                            :max="255"
                            show-buttons
                            button-layout="horizontal"
                            :step="1"
                            decrement-button-class="p-button-secondary"
                            decrement-button-icon="pi pi-minus"
                            increment-button-class="p-button-secondary"
                            increment-button-icon="pi pi-plus"
                            aria-describedby="device-id-help"
                            autocomplete="off"
                            :disabled="!is_com"
                        ></InputNumber>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="com-interval"
                        class="p-col-fixed p-my-2 i-form-panel-label"
                    >
                        통신주기(초)
                    </label>
                    <div class="p-col-2 i-form-value">
                        <InputNumber
                            id="com-interval"
                            v-model="asset.INTERFACE.POLL_INTERVAL"
                            class="p-ml-2"
                            mode="decimal"
                            :min="1"
                            :max="86400"
                            show-buttons
                            button-layout="horizontal"
                            :step="1"
                            decrement-button-class="p-button-secondary"
                            decrement-button-icon="pi pi-minus"
                            increment-button-class="p-button-secondary"
                            increment-button-icon="pi pi-plus"
                            aria-describedby="com-interval-help"
                            autocomplete="off"
                            :disabled="!is_com"
                        ></InputNumber>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="com-timeout"
                        class="p-col-fixed p-my-2 i-form-panel-label"
                    >
                        응답대기시간(초)
                    </label>
                    <div class="p-col-2 i-form-value">
                        <InputNumber
                            id="com-timeout"
                            v-model="asset.INTERFACE.TIMEOUT"
                            class="p-ml-2"
                            mode="decimal"
                            :min="1"
                            :max="86400"
                            show-buttons
                            button-layout="horizontal"
                            :step="1"
                            decrement-button-class="p-button-secondary"
                            decrement-button-icon="pi pi-minus"
                            increment-button-class="p-button-secondary"
                            increment-button-icon="pi pi-plus"
                            aria-describedby="com-timeout-help"
                            autocomplete="off"
                            :disabled="!is_com"
                        ></InputNumber>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="com-timeout"
                        class="p-col-fixed p-my-2 i-form-panel-label"
                    >
                        통신재시도 횟수
                    </label>
                    <div class="p-col-2 i-form-value">
                        <InputNumber
                            id="com-timeout"
                            v-model="asset.INTERFACE.RETRY"
                            class="p-ml-2"
                            mode="decimal"
                            :min="0"
                            :max="100"
                            show-buttons
                            button-layout="horizontal"
                            :step="1"
                            decrement-button-class="p-button-secondary"
                            decrement-button-icon="pi pi-minus"
                            increment-button-class="p-button-secondary"
                            increment-button-icon="pi pi-plus"
                            aria-describedby="com-timeout-help"
                            autocomplete="off"
                            :disabled="!is_com"
                        ></InputNumber>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="access-info"
                        class="p-col-fixed p-my-2 i-form-panel-label"
                    >
                        연결정보
                    </label>
                    <div class="p-col-5 i-form-value">
                        <InputText
                            id="access-info"
                            v-model="asset.INTERFACE.ACCESS_INFO"
                            class="p-ml-2"
                            type="text"
                            aria-describedby="access-info-help"
                            autocomplete="off"
                            :disabled="!is_com"
                            :class="{
                                'p-invalid': invalidMessage.ACCESS_INFO
                            }"
                            @input="validateAccessInfo"
                        />
                    </div>
                    <div class="p-col p-my-2 i-form-error">
                        <small id="access-info-help" class="p-error">
                            {{ invalidMessage.ACCESS_INFO }}
                        </small>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="odbc-query"
                        class="p-col-fixed p-my-2 i-form-panel-label"
                    >
                        ODBC 쿼리
                    </label>
                    <div class="p-col-8 i-form-value">
                        <Textarea
                            id="odbc-query"
                            v-model="asset.INTERFACE.ODBC_QUERY"
                            class="p-ml-2"
                            :auto-resize="false"
                            rows="8"
                            :style="{ resize: 'none' }"
                            :disabled="!is_com"
                            :class="{
                                'p-invalid': invalidMessage.ODBC_QUERY
                            }"
                            @input="validateOdbcQuery"
                        />
                    </div>
                    <div class="p-col p-my-2 i-form-error">
                        <small id="access-info-help" class="p-error">
                            {{ invalidMessage.ODBC_QUERY }}
                        </small>
                    </div>
                </div>
                <div v-if="hasManual" class="p-field p-grid">
                    <label
                        for="odbc-query"
                        class="p-col-fixed p-my-2 i-form-panel-label"
                    >
                        통신 매뉴얼
                    </label>
                    <div class="p-col-fixed i-form-value">
                        <Button
                            class="p-ml-2 p-text-nowrap p-text-truncate p-text-left p-button-sm p-button-outlined p-button-secondary"
                            :label="protocol_file_name"
                            :icon="protocolFileIcon"
                            :style="{
                                'min-width': '40px',
                                'max-width': '100%',
                                display: 'block'
                            }"
                            @click="downloadProtocolFile"
                        />
                    </div>
                </div>
            </div>
        </Panel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '~/plugins/vueEventBus';

type CODE = {
    [index: string]: string;
    NAME: string;
    CODE: string;
};

type PD_INTERFACE = {
    [index: string]: string | number | null;
    NAME: string;
    INTF_CD: string;
    PROTOCOL_FILE_ID: number | null;
};

type INTERFACE = {
    [index: string]: number | string | PD_INTERFACE;
    ID: number;
    PROD_INTF_ID: number;
    IP_ADDR: string;
    PORT: number;
    DEVICE_ID: number;
    POLL_INTERVAL: number;
    TIMEOUT: number;
    RETRY: number;
    ACCESS_INFO: string;
    ODBC_QUERY: string;
    IS_USE: number;
    PD_INTERFACE: PD_INTERFACE;
};

type ASSET = {
    [index: string]: number | string | INTERFACE;
    ID: number;
    NAME: string;
    INTERFACE: INTERFACE;
};

@Component<AssetPanelInterface>({
    props: {
        assetItem: Object,
        applyButtonDisabled: Boolean
    },
    apollo: {
        dbAssetInterface: {
            query: gql`
                query AssetInterface($ID: ID!) {
                    Asset(ID: $ID) {
                        ID
                        NAME
                        INTERFACE {
                            ID
                            PROD_INTF_ID
                            IP_ADDR
                            PORT
                            DEVICE_ID
                            POLL_INTERVAL
                            TIMEOUT
                            RETRY
                            ACCESS_INFO
                            ODBC_QUERY
                            IS_USE
                            PD_INTERFACE {
                                NAME
                                INTF_CD
                                PROTOCOL_FILE_ID
                            }
                        }
                    }
                }
            `,
            skip() {
                return this.$props.assetItem?.ID < 0;
            },
            variables(): any {
                return {
                    ID: this.$props.assetItem.ID
                };
            },
            update: ({ Asset }) => Asset,
            result({ loading, data }) {
                if (!loading) {
                    const { Asset } = data;

                    if (Asset) {
                        this.apolloFetch(Asset);
                    }
                }
            }
        },
        interfaceList: {
            query: gql`
                query {
                    Codes(TYPE: "INTF") {
                        CODE
                        NAME
                    }
                }
            `,
            update: ({ Codes }) => Codes
        }
    },
    watch: {
        assetItem: {
            deep: true,
            handler() {
                this.resetAsset();
            }
        },
        asset: {
            deep: true,
            handler(_asset: ASSET) {
                if (this.dbAssetInterface) {
                    const diff = this.isDiffAssetData(
                        this.dbAssetInterface,
                        _asset
                    );
                    this.$emit(
                        'update:applyButtonDisabled',
                        !this.is_valid || !diff
                    );
                }
            }
        }
    }
})
export default class AssetPanelInterface extends Vue {
    interfaceList: Array<CODE> = [];
    dbAssetInterface: ASSET = {
        ID: -1,
        NAME: '',
        INTERFACE: {
            ID: -1,
            PROD_INTF_ID: -1,
            IP_ADDR: '',
            PORT: 0,
            DEVICE_ID: 0,
            POLL_INTERVAL: 0,
            TIMEOUT: 0,
            RETRY: 0,
            ACCESS_INFO: '',
            ODBC_QUERY: '',
            IS_USE: 0,
            PD_INTERFACE: {
                NAME: '',
                INTF_CD: '',
                PROTOCOL_FILE_ID: null
            }
        }
    };

    asset: ASSET = {
        ID: -1,
        NAME: '',
        INTERFACE: {
            ID: -1,
            NAME: '',
            PROD_INTF_ID: -1,
            IP_ADDR: '',
            PORT: 0,
            DEVICE_ID: 0,
            POLL_INTERVAL: 0,
            TIMEOUT: 0,
            RETRY: 0,
            ACCESS_INFO: '',
            ODBC_QUERY: '',
            IS_USE: 0,
            PD_INTERFACE: {
                NAME: '',
                INTF_CD: '',
                PROTOCOL_FILE_ID: null
            }
        }
    };

    invalidMessage = {
        IP_ADDR: undefined as string | undefined,
        ACCESS_INFO: undefined as string | undefined,
        ODBC_QUERY: undefined as string | undefined
    };

    protocol_file_name: string = '';

    refreshAsset() {
        this.resetAsset();
        this.$apollo.queries.dbAssetInterface.refresh();
    }

    resetAsset() {
        this.protocol_file_name = '';

        this.asset.ID = -1;
        this.asset.INTERFACE.ID = -1;
        this.asset.INTERFACE.PROD_INTF_ID = -1;
        this.asset.INTERFACE.IP_ADDR = '';
        this.asset.INTERFACE.PORT = 0;
        this.asset.INTERFACE.DEVICE_ID = 0;
        this.asset.INTERFACE.POLL_INTERVAL = 0;
        this.asset.INTERFACE.TIMEOUT = 0;
        this.asset.INTERFACE.RETRY = 0;
        this.asset.INTERFACE.ACCESS_INFO = '';
        this.asset.INTERFACE.ODBC_QUERY = '';
        this.asset.INTERFACE.IS_USE = -1;

        if (this.asset.INTERFACE.PD_INTERFACE) {
            this.asset.INTERFACE.PD_INTERFACE.NAME = '';
            this.asset.INTERFACE.PD_INTERFACE.INTF_CD = '';
            this.asset.INTERFACE.PD_INTERFACE.PROTOCOL_FILE_ID = null;
        }

        this.invalidMessage.IP_ADDR = undefined;
        this.invalidMessage.ACCESS_INFO = undefined;
        this.invalidMessage.ODBC_QUERY = undefined;
    }

    apolloFetch(asset: ASSET) {
        for (const [key, value] of Object.entries(asset)) {
            if (key === 'INTERFACE') {
                for (const [i_key, i_value] of Object.entries(asset[key])) {
                    if (i_key === 'PD_INTERFACE') {
                        for (const [pd_key, pd_value] of Object.entries(
                            asset[key][i_key]
                        )) {
                            this.asset[key][i_key][pd_key] = pd_value;

                            if (
                                pd_key === 'PROTOCOL_FILE_ID' &&
                                pd_value !== null
                            ) {
                                this.protocol_file_name = '';
                                this.loadProtocolFile();
                            }
                        }
                    } else {
                        this.asset[key][i_key] = i_value;
                    }
                }
            } else {
                this.asset[key] = value;
            }
        }
    }

    validateIpAddr(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 15) {
            this.invalidMessage.IP_ADDR =
                '통신 IP는 최대 15자까지 입력 가능합니다';
        } else if (_input.length === 0) {
            this.invalidMessage.IP_ADDR = undefined;
        } else {
            const is = this.is_ipv4(_input);
            if (is) {
                this.invalidMessage.IP_ADDR = undefined;
            } else {
                this.invalidMessage.IP_ADDR =
                    '통신 IP를 Ipv4 형식(xxx.xxx.xxx.xxx)에 맞춰주세요';
            }
        }
    }

    validateAccessInfo(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 256) {
            this.invalidMessage.ACCESS_INFO =
                '연결정보는 최대 256자까지 입력 가능합니다';
        } else {
            this.invalidMessage.ACCESS_INFO = undefined;
        }
    }

    validateOdbcQuery(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 1024) {
            this.invalidMessage.ODBC_QUERY =
                'ODBC 쿼리는 최대 1024자까지 입력 가능합니다';
        } else {
            this.invalidMessage.ODBC_QUERY = undefined;
        }
    }

    is_ipv4(_input: string): boolean {
        const ips = _input.split('.');
        // by shkoh 20220627: ip가 4개로 구분되는지 확인
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

    loadProtocolFile() {
        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${this.asset.INTERFACE.PD_INTERFACE.PROTOCOL_FILE_ID}) {
                        FILE_NAME
                    }
                }
            `
            })
            .then(({ data: { PdFile } }) => {
                this.protocol_file_name = PdFile.FILE_NAME;
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '파일 로드 실패',
                    detail: error.message,
                    life: 2000
                });
            });
    }

    downloadProtocolFile() {
        this.$nuxt.$loading.start();

        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${this.asset.INTERFACE.PD_INTERFACE.PROTOCOL_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `
            })
            .then(({ data: { PdFile } }) => {
                this.$nextTick(() => {
                    const buf = Buffer.from(PdFile.DATA, 'base64');
                    const manual = new File(
                        [buf.buffer],
                        PdFile.FILE_NAME.normalize('NFC'),
                        { type: PdFile.MIMETYPE }
                    );

                    const reader = new FileReader();
                    reader.readAsDataURL(manual);

                    reader.onloadend = (event: any) => {
                        const link = document.createElement('a');
                        link.download = PdFile.FILE_NAME.normalize('NFC');
                        link.href = event.target.result;

                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '파일 불러오기 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    isDiffAssetData(source: ASSET, target: ASSET) {
        let is_diff = false;

        for (const key of Object.keys(target)) {
            if (key === 'INTERFACE') {
                [
                    'IP_ADDR',
                    'PORT',
                    'DEVICE_ID',
                    'POLL_INTERVAL',
                    'TIMEOUT',
                    'RETRY',
                    'ACCESS_INFO',
                    'ODBC_QUERY',
                    'IS_USE'
                ].forEach((i_key: string) => {
                    if (source[key][i_key] !== target[key][i_key]) {
                        is_diff = true;
                    }
                });
            }
        }

        return is_diff;
    }

    updateAsset() {
        const variables = {
            ID: this.asset.INTERFACE.ID
        };

        [
            'IP_ADDR',
            'PORT',
            'DEVICE_ID',
            'POLL_INTERVAL',
            'TIMEOUT',
            'RETRY',
            'ACCESS_INFO',
            'ODBC_QUERY',
            'IS_USE'
        ].forEach((i_key: string) => {
            if (
                this.dbAssetInterface.INTERFACE[i_key] !==
                this.asset.INTERFACE[i_key]
            ) {
                this.$set(variables, i_key, this.asset.INTERFACE[i_key]);
            }
        });

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation UpdateAssetInterface(
                        $ID: ID!
                        $IP_ADDR: String
                        $PORT: Int
                        $DEVICE_ID: Int
                        $POLL_INTERVAL: Int
                        $TIMEOUT: Int
                        $RETRY: Int
                        $ACCESS_INFO: String
                        $ODBC_QUERY: String
                        $IS_USE: Int
                    ) {
                        UpdateAssetInterface(
                            ID: $ID
                            IP_ADDR: $IP_ADDR
                            PORT: $PORT
                            DEVICE_ID: $DEVICE_ID
                            POLL_INTERVAL: $POLL_INTERVAL
                            TIMEOUT: $TIMEOUT
                            RETRY: $RETRY
                            ACCESS_INFO: $ACCESS_INFO
                            ODBC_QUERY: $ODBC_QUERY
                            IS_USE: $IS_USE
                        )
                    }
                `,
                variables
            })
            .then(() => {
                eventBus.$emit('refreshAssetTable');

                this.refreshAsset();

                this.$toast.add({
                    severity: 'info',
                    summary: '자산 인터페이스 변경 완료',
                    detail: `${this.dbAssetInterface.NAME} 자산 인터페이스 변경`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산 인터페이스 정보 적용 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    get is_valid(): boolean {
        let is_valid = true;

        for (const value of Object.values(this.invalidMessage)) {
            if (value) {
                is_valid = false;
                break;
            }
        }

        return is_valid;
    }

    get is_com(): boolean {
        return this.asset.INTERFACE.IS_USE === 1;
    }

    set is_com(_is_com: boolean) {
        this.asset.INTERFACE.IS_USE = _is_com ? 1 : 0;
    }

    get interfaceHeader(): string {
        if (this.asset.INTERFACE.PD_INTERFACE) {
            const pd_intf_name = this.asset.INTERFACE.PD_INTERFACE.NAME;
            const pd_intf_code = this.interfaceList.find(
                (l: any) =>
                    l.CODE === this.asset.INTERFACE?.PD_INTERFACE.INTF_CD
            );

            return `
                ${pd_intf_name}
                ${pd_intf_name.length > 0 ? ' | ' : ''}
                ${pd_intf_code ? pd_intf_code.NAME : ''}
            `;
        } else {
            return '';
        }
    }

    get hasManual(): boolean {
        return this.asset.INTERFACE.PD_INTERFACE?.PROTOCOL_FILE_ID !== null;
    }

    get protocolFileIcon(): string {
        return this.protocol_file_name.length > 0
            ? 'pi pi-download'
            : 'pi pi-spin pi-spinner';
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-interface::v-deep {
    .i-disabled {
        opacity: 0.7;
    }

    .i-form-label {
        flex-basis: 100px;
        border-radius: 3px;
        background-color: var(--primary-color);
        color: var(--primary-color-text);
        padding: 0.5rem;
    }

    .i-form-panel-label {
        flex-basis: 100px;
        border-radius: 3px;
        background-color: var(--text-color-secondary);
        color: var(--primary-color-text);
        padding: 0.5rem;
    }

    .i-form-value {
        align-self: center;
    }

    .i-form-error {
        align-self: center;
    }
}
</style>
