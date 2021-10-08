<template>
    <div v-if="showInfoPanel" class="p-grid">
        <div class="p-col-3 p-fluid p-input-filled p-mr-6">
            <div class="p-field">
                <label for="interface-name">인터페이스명</label>
                <InputText
                    id="interface-name"
                    v-model="newInterfaceData.NAME"
                    type="text"
                    aria-describedby="interface-name-help"
                    autocomplete="off"
                    :class="{ 'p-invalid': invalidMessage.NAME }"
                    @input="validateName"
                ></InputText>
                <small id="remark-help" class="p-error">
                    {{ invalidMessage.NAME }}
                </small>
            </div>
            <div class="p-field">
                <label for="type">자산분류</label>
                <Dropdown
                    id="type"
                    v-model="newInterfaceData.ASSET_CD"
                    :options="assetCodeList"
                    option-label="NAME"
                    option-value="CODE"
                    data-key="CODE"
                    placeholder="자산분류를 선택하세요"
                    :filter="true"
                    filter-placeholder="검색"
                    empty-filter-message="해당 유형의 자산은 존재하지 않습니다"
                    append-to="body"
                ></Dropdown>
            </div>
            <div class="p-field">
                <label for="type">통신타입</label>
                <Dropdown
                    id="type"
                    v-model="newInterfaceData.INTF_CD"
                    :options="interfaceTypeList"
                    option-label="NAME"
                    option-value="CODE"
                    data-key="CODE"
                    placeholder="통신타입을 선택하세요"
                    :filter="true"
                    filter-placeholder="검색"
                    empty-filter-message="해당 유형의 통신타입은 존재하지 않습니다"
                    append-to="body"
                ></Dropdown>
            </div>
            <div class="p-field">
                <div class="p-field-check">
                    <Checkbox
                        id="protocol-file"
                        v-model="chkProtocolFileField"
                        class="p-mr-1"
                        :binary="true"
                    >
                    </Checkbox>
                    <label for="protocol-file">프로토콜 문서</label>

                    <div v-if="chkProtocolFileField" class="p-mt-2">
                        <div class="p-d-flex">
                            <div class="p-mr-1" style="width: 100%">
                                <i-file-upload
                                    ref="protocolFileUploader"
                                    name="PROTOCOL_FILE"
                                    mode="basic"
                                    accept=""
                                    choose-label="프로토콜 문서 추가"
                                    :custom-upload="true"
                                    :max-file-size="100 * 1024 * 1024"
                                    :auto="true"
                                    :show-cancel-button="true"
                                    @uploader="protocolFileUpload"
                                    @clear="protocolFileClear"
                                />
                            </div>
                        </div>
                        <Button
                            v-if="protocol_file_name.length > 0"
                            class="
                                p-mt-2
                                p-text-left
                                p-button-sm
                                p-button-outlined
                                p-button-secondary
                            "
                            :label="protocol_file_name"
                            icon="pi pi-download"
                            @click="protocolFileDownload"
                        ></Button>
                    </div>
                </div>
            </div>
            <div class="p-field">
                <label for="remark">설명</label>
                <Textarea
                    id="remark"
                    v-model="newInterfaceData.REMARK"
                    :auto-resize="false"
                    rows="6"
                    style="resize: none"
                    :class="{ 'p-invalid': invalidMessage.REMARK }"
                    @input="validateRemark"
                />
                <small id="remark-help" class="p-error">
                    {{ invalidMessage.REMARK }}
                </small>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';
import { eventBus } from '@/plugins/vueEventBus';

type Interface = {
    [index: string]: string | number | undefined | null;
    ASSET_CD: string;
    INTF_CD: string;
    NAME: string;
    PROTOCOL_FILE_ID: number | undefined | null;
    REMARK: string;
    PROTOCOL_FILE: any;
};

@Component<InterfacePanelInfo>({
    props: {
        id: Number,
        applyButtonDisabled: Boolean
    },
    watch: {
        newInterfaceData: {
            deep: true,
            handler(_data: Interface) {
                this.compareInterfaceData(_data);
            }
        },
        chkProtocolFileField(_is_show) {
            if (_is_show) {
                this.loadProtocolFile();
            } else {
                this.newInterfaceData.PROTOCOL_FILE_ID = null;
            }
        }
    },
    apollo: {
        interfaceData: {
            query: gql`
                query PredefineInterface($ID: ID!) {
                    PredefineInterface(ID: $ID) {
                        ID
                        ASSET_CD
                        INTF_CD
                        NAME
                        PROTOCOL_FILE_ID
                        REMARK
                    }
                }
            `,
            prefetch: false,
            update: ({ PredefineInterface }) => {
                return PredefineInterface;
            },
            variables(): any {
                return {
                    ID: this.id ? this.id : -1
                };
            },
            result({ data, loading }: any) {
                if (!loading) {
                    const { PredefineInterface } = data;

                    if (PredefineInterface) {
                        this.apolloFetch(PredefineInterface);
                    }
                }
            }
        },
        assetCodeList: {
            query: gql`
                query {
                    PredefinedAssetCodes {
                        CODE
                        NAME
                        ALIAS
                    }
                }
            `,
            prefetch: false,
            update: ({ PredefinedAssetCodes }) => PredefinedAssetCodes
        },
        interfaceTypeList: {
            query: gql`
                query {
                    Codes(TYPE: "INTF") {
                        CODE
                        NAME
                    }
                }
            `,
            prefetch: false,
            update: ({ Codes }) => Codes
        }
    }
})
export default class InterfacePanelInfo extends Vue {
    $refs!: {
        protocolFileUploader: any;
    };

    interfaceTypeList: Array<any> = [];
    assetCodeList: Array<any> = [];

    invalidMessage = {
        NAME: undefined as string | undefined,
        REMARK: undefined as string | undefined
    };

    interfaceData: Interface = {
        ASSET_CD: '',
        INTF_CD: '',
        NAME: '',
        PROTOCOL_FILE_ID: undefined,
        REMARK: '',
        PROTOCOL_FILE: undefined
    };

    newInterfaceData: Interface = {
        ASSET_CD: '',
        INTF_CD: '',
        NAME: '',
        PROTOCOL_FILE_ID: undefined,
        REMARK: '',
        PROTOCOL_FILE: undefined
    };

    protocolFileUploader = null;
    chkProtocolFileField = false;
    protocol_file_name = '';
    protocol_file_blob: any = undefined;

    get showInfoPanel(): boolean {
        return this.$props.id > 0;
    }

    get isChangeProtocolFile(): boolean {
        return (
            this.chkProtocolFileField &&
            this.newInterfaceData.PROTOCOL_FILE_ID === -1 &&
            this.interfaceData.PROTOCOL_FILE?.size !==
                this.protocol_file_blob?.size
        );
    }

    get isClearProtocolFile(): boolean {
        return (
            !this.chkProtocolFileField ||
            this.newInterfaceData.PROTOCOL_FILE_ID === null
        );
    }

    reset() {
        this.invalidMessage.NAME = undefined;
        this.invalidMessage.REMARK = undefined;
    }

    apolloFetch(predefineInterface: any) {
        this.reset();

        for (const key of Object.keys(this.newInterfaceData)) {
            this.newInterfaceData[key] = predefineInterface[key];
        }

        if (predefineInterface.PROTOCOL_FILE_ID) {
            if (this.chkProtocolFileField) {
                this.loadProtocolFile();
            } else {
                this.chkProtocolFileField = true;
            }
        } else {
            this.chkProtocolFileField = false;
            this.protocol_file_name = '';
            this.protocol_file_blob = undefined;
        }
    }

    validateName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 64) {
            this.invalidMessage.NAME = '인터페이스명은 64자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessage.NAME = '인터페이스명은 1자 이상입니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    validateRemark(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 256) {
            this.invalidMessage.REMARK = '설명은 256자 이하입니다';
        } else {
            this.invalidMessage.REMARK = undefined;
        }
    }

    validationCheck(): boolean | undefined {
        let is_valid = true;

        for (const valid of Object.values(this.invalidMessage)) {
            if (valid) {
                is_valid = false;
            }
        }

        return is_valid;
    }

    protocolFileUpload(event: any) {
        this.protocol_file_name = event.files[0].name;
        this.protocol_file_blob = event.files[0];

        this.newInterfaceData.PROTOCOL_FILE_ID =
            this.interfaceData.PROTOCOL_FILE?.size !==
            this.protocol_file_blob?.size
                ? -1
                : this.interfaceData.PROTOCOL_FILE_ID;
    }

    protocolFileClear() {
        this.protocol_file_name = '';
        this.protocol_file_blob = undefined;
        this.newInterfaceData.PROTOCOL_FILE_ID = null;
    }

    protocolFileDownload() {
        const reader = new FileReader();
        reader.readAsDataURL(this.protocol_file_blob);

        reader.onloadend = (event: any) => {
            const link = document.createElement('a');
            link.download = this.protocol_file_name;
            link.href = event.target.result;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }

    loadProtocolFile() {
        if (this.interfaceData.PROTOCOL_FILE_ID === null) return;

        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${this.interfaceData.PROTOCOL_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `
            })
            .then(({ data }) => {
                const pd_file = data.PdFile;

                this.$nextTick(() => {
                    const buf = Buffer.from(pd_file.DATA, 'base64');
                    const previous_file = new File(
                        [buf.buffer],
                        pd_file.FILE_NAME,
                        { type: pd_file.MIMETYPE }
                    );

                    this.interfaceData.PROTOCOL_FILE = previous_file;
                    this.$refs.protocolFileUploader.forceInsertFile(
                        previous_file
                    );
                });
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

    compareInterfaceData(new_interface_data: Interface) {
        this.$emit('update:applyButtonDisabled', true);

        ['NAME', 'ASSET_CD', 'INTF_CD', 'PROTOCOL_FILE_ID', 'REMARK'].forEach(
            (key) => {
                if (this.interfaceData[key] !== new_interface_data[key]) {
                    this.$emit('update:applyButtonDisabled', false);
                }
            }
        );
    }

    updateInterface() {
        if (!this.validationCheck()) {
            this.$toast.add({
                severity: 'warn',
                summary: '제품 유효성 실패',
                detail: '제품 내용을 확인하세요',
                life: 2000
            });
            return;
        }

        const variables = {
            ID: this.$props.id,
            ASSET_CD: this.newInterfaceData.ASSET_CD,
            INTF_CD: this.newInterfaceData.INTF_CD,
            NAME: this.newInterfaceData.NAME
        };

        if (this.isChangeProtocolFile) {
            Object.defineProperty(variables, 'PROTOCOL_FILE', {
                value: this.protocol_file_blob,
                configurable: true,
                enumerable: true,
                writable: true
            });
        }

        Object.defineProperty(variables, 'PROTOCOL_FILE_ID', {
            value: this.isClearProtocolFile
                ? null
                : this.interfaceData.PROTOCOL_FILE_ID,
            configurable: true,
            enumerable: true,
            writable: true
        });

        ['REMARK'].forEach((key: string) => {
            if (this.newInterfaceData[key] !== this.interfaceData[key]) {
                Object.defineProperty(variables, key, {
                    value: this.newInterfaceData[key],
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            }
        });

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation (
                        $ID: ID!
                        $ASSET_CD: String!
                        $INTF_CD: String!
                        $NAME: String!
                        $PROTOCOL_FILE_ID: Int
                        $REMARK: String
                        $PROTOCOL_FILE: Upload
                    ) {
                        UpdateInterface(
                            ID: $ID
                            ASSET_CD: $ASSET_CD
                            INTF_CD: $INTF_CD
                            NAME: $NAME
                            PROTOCOL_FILE_ID: $PROTOCOL_FILE_ID
                            REMARK: $REMARK
                            PROTOCOL_FILE: $PROTOCOL_FILE
                        )
                    }
                `,
                variables
            })
            .then(() => {
                eventBus.$emit('refreshInterfaceTree');

                this.interfaceDataRefresh();

                this.$toast.add({
                    severity: 'info',
                    summary: '인터페이스 변경 완료',
                    detail: `${this.newInterfaceData.NAME} 인터페이스 변경`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '인터페이스 변경 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    interfaceDataRefresh() {
        this.$apollo.queries.interfaceData.refresh();
        this.$emit('completeInterfaceUpdate');
    }
}
</script>
