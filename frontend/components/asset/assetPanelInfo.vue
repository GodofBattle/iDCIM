<template>
    <div id="i-asset-panel-info">
        <div class="p-col p-fluid p-input-filled">
            <div class="p-field p-grid">
                <label
                    for="name"
                    class="p-col-fixed p-my-2"
                    :style="{ 'flex-basis': '80px' }"
                >
                    자산명
                </label>
                <div class="p-col-fixed" :style="{ 'flex-basis': '30%' }">
                    <InputText
                        id="name"
                        v-model="asset.NAME"
                        type="text"
                        aria-describedby="name-help"
                        autocomplete="off"
                        :class="{ 'p-invalid': invalidMessage.NAME }"
                        @input="validateAssetName"
                    >
                    </InputText>
                </div>
                <div class="p-col p-my-2">
                    <small id="name-help" class="p-error">
                        {{ invalidMessage.NAME }}
                    </small>
                </div>
            </div>
            <div class="p-field p-grid">
                <label
                    for="serial"
                    class="p-col-fixed p-my-2"
                    :style="{ 'flex-basis': '80px' }"
                >
                    시리얼정보
                </label>
                <div class="p-col-fixed" :style="{ 'flex-basis': '30%' }">
                    <InputText
                        id="serial"
                        v-model="asset.SERIAL"
                        type="text"
                        aria-describedby="serial-help"
                        autocomplete="off"
                        :class="{ 'p-invalid': invalidMessage.SERIAL }"
                        @input="validateAssetSerial"
                    >
                    </InputText>
                </div>
                <div class="p-col p-my-2">
                    <small id="serial-help" class="p-error">
                        {{ invalidMessage.SERIAL }}
                    </small>
                </div>
            </div>
            <div v-if="is_cus_tree" class="p-field p-grid">
                <label
                    for="custom-tree"
                    class="p-col-fixed p-my-2"
                    :style="{ 'flex-basis': '80px' }"
                >
                    기본트리 설정
                </label>
                <div class="p-col">
                    <Button
                        class="p-button-text p-button-info"
                        :label="customTreeLabel"
                        :style="{ 'text-align': 'left' }"
                        @click="showTreePanel($event, 'custom')"
                    ></Button>
                </div>
            </div>
            <div v-if="is_pos_tree" class="p-field p-grid">
                <label
                    for="position-tree"
                    class="p-col-fixed p-my-2"
                    :style="{ 'flex-basis': '80px' }"
                >
                    위치설정
                </label>
                <div class="p-col">
                    <Button
                        class="p-button-text p-button-info"
                        :label="positionTreeLabel"
                        :style="{ 'text-align': 'left' }"
                        @click="showTreePanel($event, 'position')"
                    ></Button>
                </div>
            </div>
        </div>
        <Panel :header="productName" :toggleable="true">
            <template #icons>
                <button
                    class="p-panel-header-icon p-link"
                    @click="showInterfaceSettingPanel"
                >
                    <span class="pi pi-cog"></span>
                </button>
                <OverlayPanel
                    ref="intfPanel"
                    :show-close-icon="false"
                    append-to="body"
                    :style="{
                        width: '12vw'
                    }"
                >
                    <Card id="i-setting-intf-panel">
                        <template #content>
                            <div class="p-fluid">
                                <div
                                    class="p-field"
                                    :style="{ 'font-weight': 'bold' }"
                                >
                                    자산 인터페이스 설정
                                </div>
                                <Divider />
                                <div class="p-field-checkbox p-mb-5">
                                    <InputSwitch
                                        id="is_interface"
                                        v-model="is_interface"
                                    >
                                    </InputSwitch>
                                    <label for="is_interface">
                                        {{ is_interface_label }}
                                    </label>
                                </div>
                                <div
                                    v-for="intf of productInterfaces"
                                    :key="intf.ID"
                                    class="p-field-radiobutton"
                                >
                                    <RadioButton
                                        :id="intf.ID"
                                        v-model="productInterfaceID"
                                        name="intf"
                                        :value="intf.PD_INTF_ID"
                                        :disabled="!is_interface"
                                    ></RadioButton>
                                    <label
                                        :for="intf.ID"
                                        :style="{
                                            opacity: is_interface ? 1 : 0.6
                                        }"
                                    >
                                        {{ intf.INTERFACE.NAME }}
                                    </label>
                                </div>
                                <div class="p-field p-mt-6 p-mb-0">
                                    <Button
                                        label="적용"
                                        icon="pi pi-check"
                                        :style="{ width: '100%' }"
                                        :disabled="status_asset_interface === 0"
                                        @click="applyAssetInterface"
                                    ></Button>
                                </div>
                            </div>
                        </template>
                    </Card>
                </OverlayPanel>
            </template>
            <div class="p-d-flex">
                <div class="p-col-fixed" :style="{ width: '70%' }">
                    <div class="p-field p-grid">
                        <label
                            class="p-col-fixed p-mb-0 p-mr-4 p-py-2 i-model-key"
                        >
                            자산분류
                        </label>
                        <div class="p-col-fixed p-py-2 i-model-value">
                            <label>{{ assetCodeTreeLabel }}</label>
                        </div>
                    </div>
                    <div v-if="hasManual" class="p-field p-grid">
                        <label
                            for="manual"
                            class="p-col-fixed p-mb-0 p-mr-4 i-model-key"
                        >
                            메뉴얼
                        </label>
                        <div class="p-col-fixed i-model-value">
                            <Button
                                class="p-text-nowrap p-text-truncate p-text-left p-button-sm p-button-outlined p-button-secondary"
                                :label="manual_file_name"
                                icon="pi pi-download"
                                :style="{
                                    'max-width': '100%',
                                    display: 'block'
                                }"
                                @click="downloadManualFile"
                            ></Button>
                        </div>
                    </div>
                    <Divider
                        v-if="productInfo.length > 0"
                        :style="{ 'margin-left': '-0.5rem' }"
                    />
                    <div
                        v-for="(data, index) of productInfo"
                        :key="index"
                        class="p-field p-grid p-mb-1"
                    >
                        <Tag
                            class="p-col-fixed p-mb-0 p-mr-4 p-py-1 i-model-key"
                            severity="info"
                        >
                            {{ data.key }}
                        </Tag>
                        <div class="p-col-fixed p-py-1 i-model-value">
                            <label>{{ data.value }}</label>
                        </div>
                    </div>
                </div>
                <div class="p-col-fixed" :style="{ width: '30%' }">
                    <Panel header="이미지">
                        <template #icons>
                            <button
                                class="p-panel-header-icon p-link"
                                @click="changeProductImage"
                            >
                                <span class="pi pi-images"></span>
                            </button>
                        </template>
                        <div class="i-image-content">
                            <img
                                v-if="image_file.length > 0"
                                class="i-product-image"
                                :src="image_file"
                            />
                        </div>
                    </Panel>
                </div>
            </div>
        </Panel>
        <OverlayPanel
            ref="treePanel"
            :show-close-icon="true"
            append-to="body"
            :style="{ width: '16vw', height: '42vh' }"
        >
            <i-moveable-tree
                :value="overlayTreeToRender"
                :moveable="false"
                :filter="true"
                :expanded-keys="{ root_0: true }"
                selection-mode="single"
                :style="{ height: 'calc(42vh - 2rem)' }"
                @node-select="onSelectOverlayTreePanel"
            >
            </i-moveable-tree>
        </OverlayPanel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type ASSET_INTERFACE = {
    [index: string]: string | number;
    ID: number;
    PROD_INTF_ID: number;
};

type MANUFACTURER = {
    [index: string]: string;
    NAME: string;
};

type PRODUCT = {
    [index: string]: string | number | MANUFACTURER | null;
    ASSET_CD: string;
    NAME: string;
    MANUAL_FILE_ID: number | null;
    IMAGE_FILE_ID: number | null;
    INFO: string;
    MANUFACTURER: MANUFACTURER;
};

type ASSET = {
    [index: string]: string | number | PRODUCT | ASSET_INTERFACE | null;
    ID: number;
    PRODUCT_ID: number;
    NAME: string;
    SERIAL: string;
    CUST_HIER_ID_P: number | null;
    CUST_HIER_ID_C: number | null;
    IS_USE_INTF: number;
    PRODUCT: PRODUCT;
    INTERFACE: ASSET_INTERFACE;
};

@Component<AssetPanelInfo>({
    props: {
        assetItem: Object,
        applyButtonDisabled: Boolean
    },
    apollo: {
        dbAsset: {
            query: gql`
                query Asset($ID: ID!) {
                    Asset(ID: $ID) {
                        ID
                        PRODUCT_ID
                        NAME
                        SERIAL
                        CUST_HIER_ID_P
                        CUST_HIER_ID_C
                        IS_USE_INTF
                        PRODUCT {
                            ASSET_CD
                            NAME
                            MANUAL_FILE_ID
                            IMAGE_FILE_ID
                            INFO
                            MANUFACTURER {
                                NAME
                            }
                        }
                        INTERFACE {
                            ID
                            PROD_INTF_ID
                        }
                    }
                }
            `,
            variables(): any {
                return {
                    ID: this.$props.assetItem
                        ? Number(this.$props.assetItem.ID)
                        : -1
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
        treeHier01: {
            query: gql`
                fragment treeFields on AssetTree {
                    key
                    label
                    order
                    parent_key
                    type
                    manipulable
                }

                query {
                    Tree(TYPE: "HIER01") {
                        ...treeFields
                        children {
                            ...treeFields
                            children {
                                ...treeFields
                                children {
                                    ...treeFields
                                    children {
                                        ...treeFields
                                        children {
                                            ...treeFields
                                            children {
                                                ...treeFields
                                                children {
                                                    ...treeFields
                                                    children {
                                                        ...treeFields
                                                        children {
                                                            ...treeFields
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            update: ({ Tree }) => Tree,
            skip() {
                return !this.is_cus_tree;
            },
            result({ loading, data }) {
                if (!loading) {
                    const { Tree } = data;

                    if (Tree) {
                        this.setTreeLabel('custom');
                    }
                }
            }
        },
        treeHier02: {
            query: gql`
                fragment treeFields on AssetTree {
                    key
                    label
                    order
                    parent_key
                    type
                    manipulable
                }

                query {
                    Tree(TYPE: "HIER02") {
                        ...treeFields
                        children {
                            ...treeFields
                            children {
                                ...treeFields
                                children {
                                    ...treeFields
                                    children {
                                        ...treeFields
                                        children {
                                            ...treeFields
                                            children {
                                                ...treeFields
                                                children {
                                                    ...treeFields
                                                    children {
                                                        ...treeFields
                                                        children {
                                                            ...treeFields
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            update: ({ Tree }) => Tree,
            skip() {
                return !this.is_pos_tree;
            },
            result({ loading, data }) {
                if (!loading) {
                    const { Tree } = data;

                    if (Tree) {
                        this.setTreeLabel('position');
                    }
                }
            }
        },
        treeHier03: {
            query: gql`
                fragment treeFields on AssetTree {
                    key
                    label
                    order
                    parent_key
                    type
                    manipulable
                }

                query {
                    Tree(TYPE: "HIER03") {
                        ...treeFields
                        children {
                            ...treeFields
                            children {
                                ...treeFields
                                children {
                                    ...treeFields
                                    children {
                                        ...treeFields
                                        children {
                                            ...treeFields
                                            children {
                                                ...treeFields
                                                children {
                                                    ...treeFields
                                                    children {
                                                        ...treeFields
                                                        children {
                                                            ...treeFields
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            update: ({ Tree }) => Tree,
            result({ loading, data }) {
                if (!loading) {
                    const { Tree } = data;

                    if (Tree) {
                        this.setAssetCode();
                    }
                }
            }
        },
        productInterfaces: {
            query: gql`
                query ProductInterfaces($PRODUCT_ID: Int!) {
                    ProductInterfaces(PRODUCT_ID: $PRODUCT_ID) {
                        ID
                        PRODUCT_ID
                        PD_INTF_ID
                        INTERFACE {
                            NAME
                        }
                    }
                }
            `,
            variables() {
                return {
                    PRODUCT_ID: -1
                };
            },
            update: ({ ProductInterfaces }) => ProductInterfaces
        }
    },
    watch: {
        asset: {
            deep: true,
            handler(_asset: ASSET) {
                if (this.dbAsset) {
                    const diff =
                        this.dbAsset === null
                            ? false
                            : this.isDiffAssetData(this.dbAsset, _asset);

                    console.info(
                        !this.is_valid,
                        !diff,
                        !this.is_valid || !diff
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
export default class AssetPanelInfo extends Vue {
    $refs!: {
        treePanel: any;
        intfPanel: any;
    };

    dbAsset: ASSET | null = null;
    asset: ASSET = {
        ID: -1,
        PRODUCT_ID: -1,
        NAME: '',
        SERIAL: '',
        CUST_HIER_ID_P: null as number | null,
        CUST_HIER_ID_C: null as number | null,
        IS_USE_INTF: 0,
        PRODUCT: {
            ASSET_CD: '',
            NAME: '',
            MANUAL_FILE_ID: null as number | null,
            IMAGE_FILE_ID: null as number | null,
            INFO: '',
            MANUFACTURER: {
                NAME: ''
            }
        },
        INTERFACE: {
            ID: -1,
            PROD_INTF_ID: -1
        }
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        SERIAL: undefined as string | undefined
    };

    // by shkoh 20220525: Tree 선택 팝업
    overlayTreePanelMode: string = '';

    // by shkoh 20220525: 설정 Tree의 구조를 breadcrumb 방식 텍스트로 표현하기 위해 사용
    customTreeLabel: string = '';
    positionTreeLabel: string = '';
    assetCodeTreeLabel: string = '';

    treeHier01: Array<any> = [];
    treeHier02: Array<any> = [];
    treeHier03: Array<any> = [];
    productInterfaces: Array<any> = [];

    // by shkoh 20220525: manual file 및 image file 데이터 처리
    manual_file_name: string = '';
    image_file: any = '';

    updateAsset() {
        if (this.is_interface && this.productInterfaceID === -1) {
            this.$toast.add({
                severity: 'warn',
                summary: '인터페이스 설정 안내',
                detail: `사용 가능한 인터페이스를 지정해주세요. 미지정 시 인터페이스 부분은 삭제됩니다`,
                life: 2000
            });

            return;
        }

        const variables = {
            ID: this.asset.ID
        };

        // by shkoh 20220525: ASSET 정보 업데이트
        ['NAME', 'SERIAL', 'CUST_HIER_ID_P', 'CUST_HIER_ID_C'].forEach(
            (key: string) => {
                if (
                    this.dbAsset !== null &&
                    this.asset[key] !== this.dbAsset[key]
                ) {
                    this.$set(variables, key, this.asset[key]);
                }
            }
        );
    }

    apolloFetch(data: ASSET) {
        for (const [key, value] of Object.entries(data)) {
            if (key === 'PRODUCT') {
                this.$apollo.queries.treeHier03.refresh();

                for (const [p_key, p_value] of Object.entries(data[key])) {
                    if (p_key === 'MANUFACTURER') {
                        for (const [m_key, m_value] of Object.entries(
                            data[key][p_key]
                        )) {
                            this.asset[key][p_key][m_key] = m_value;
                        }
                    } else {
                        this.asset[key][p_key] = p_value;

                        if (p_key === 'MANUAL_FILE_ID') {
                            this.manual_file_name = '';
                            this.loadManualFile();
                        } else if (p_key === 'IMAGE_FILE_ID') {
                            if (p_value) {
                                this.loadImageFile();
                            } else {
                                this.image_file = '';
                            }
                        }
                    }
                }
            } else if (key === 'INTERFACE') {
                if (data[key] === null) {
                    // by shkoh 20220525: 자산의 인터페이스가 없는 경우
                    this.asset[key].ID = -1;
                    this.asset[key].PROD_INTF_ID = -1;
                } else {
                    // by shkoh 20220525: 자산의 인터페이스가 존재하는 경우
                    for (const [i_key, i_value] of Object.entries(data[key])) {
                        this.asset[key][i_key] = i_value;
                    }
                }
            } else {
                if (key === 'CUST_HIER_ID_C' && value !== null) {
                    this.$apollo.queries.treeHier01.refresh();
                } else if (key === 'CUST_HIER_ID_P' && value !== null) {
                    this.$apollo.queries.treeHier02.refresh();
                } else if (key === 'PRODUCT_ID' && value !== null) {
                    this.$apollo.queries.productInterfaces.refetch({
                        PRODUCT_ID: value
                    });
                }

                this.asset[key] = value;
            }
        }
    }

    setAssetCode() {
        if (this.asset.PRODUCT.ASSET_CD !== '') {
            const root_node = this.treeHier03[0];
            this.findTreeNode(
                'assetCode',
                root_node,
                `pac_${this.asset.PRODUCT.ASSET_CD}`
            );
        }
    }

    isDiffAssetData(source: any, target: any): boolean {
        let is_diff = false;

        for (const key of Object.keys(target)) {
            // by shkoh 20220525: typename은 작업과정에서 변경이 발생함으로 해당 부분에 대한 구분은 제외함
            if (key === '__typename') {
                continue;
            }

            if (target[key] instanceof Object) {
                // by shkoh 20220525: DB에서 INTERFACE는 null이 가능하나, frontend 부분에서는 INTERFACE.PROD_INTF_ID가 -1의 여부로 판단
                if (key === 'INTERFACE' && source[key] === null) {
                    is_diff = target[key].PROD_INTF_ID !== -1;
                } else {
                    is_diff = this.isDiffAssetData(source[key], target[key]);
                }

                if (is_diff) break;
            } else if (source[key] !== target[key]) {
                is_diff = true;
                break;
            }
        }

        return is_diff;
    }

    validateAssetName(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 64) {
            this.invalidMessage.NAME = '자산명은 64자 이하입니다';
        } else if (_input.length < 2) {
            this.invalidMessage.NAME = '자산명은 2자 이상 작성해야 합니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    validateAssetSerial(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 64) {
            this.invalidMessage.SERIAL = '시리얼은 64자 이하입니다';
        } else {
            this.invalidMessage.SERIAL = undefined;
        }
    }

    showTreePanel(event: Event, mode: string) {
        this.$refs.treePanel.toggle(event);
        this.overlayTreePanelMode = mode;
    }

    showInterfaceSettingPanel(event: Event) {
        this.$refs.intfPanel.toggle(event);
    }

    onSelectOverlayTreePanel(select_node: any) {
        const [code, id] = select_node.key.split('_');

        if (this.overlayTreePanelMode === 'custom') {
            this.asset.CUST_HIER_ID_C = Number(id);
        } else if (this.overlayTreePanelMode === 'position') {
            this.asset.CUST_HIER_ID_P = Number(id);
        }

        this.setTreeLabel(this.overlayTreePanelMode);

        this.$refs.treePanel.hide();
        this.overlayTreePanelMode = '';
    }

    setTreeLabel(type: string) {
        const root_node =
            type === 'custom' ? this.treeHier01[0] : this.treeHier02[0];

        if (root_node) {
            this.findTreeNode(
                type,
                root_node,
                `ach_${
                    type === 'custom'
                        ? this.asset.CUST_HIER_ID_C
                        : this.asset.CUST_HIER_ID_P
                }`
            );

            if (type === 'custom') {
                this.customTreeLabel = `${root_node.label} >> ${this.customTreeLabel}`;
            } else if (type === 'position') {
                this.positionTreeLabel = `${root_node.label} >> ${this.positionTreeLabel}`;
            }
        }
    }

    findTreeNode(type: string, node: any, target_key: string): boolean {
        if (node.children.length === 0) return false;

        const target_node = node.children.filter(
            (c: any) => c.key === target_key
        )[0];

        if (!target_node) {
            let has_target = false;

            for (const child of node.children) {
                has_target = this.findTreeNode(type, child, target_key);

                if (has_target) {
                    if (type === 'custom') {
                        this.customTreeLabel = `${child.label} >> ${this.customTreeLabel}`;
                    } else if (type === 'position') {
                        this.positionTreeLabel = `${child.label} >> ${this.positionTreeLabel}`;
                    } else if (type === 'assetCode') {
                        this.assetCodeTreeLabel = `${child.label} | ${this.assetCodeTreeLabel}`;
                    }
                    break;
                }
            }

            return has_target;
        } else {
            if (type === 'custom') {
                this.customTreeLabel = target_node.label;
            } else if (type === 'position') {
                this.positionTreeLabel = target_node.label;
            } else if (type === 'assetCode') {
                this.assetCodeTreeLabel = target_node.label;
            }
            return true;
        }
    }

    loadManualFile() {
        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${this.asset.PRODUCT.MANUAL_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                    }
                }
            `
            })
            .then(({ data }) => {
                const manual_file = data.PdFile;
                this.manual_file_name = manual_file.FILE_NAME;
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

    loadImageFile() {
        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${this.asset.PRODUCT.IMAGE_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `
            })
            .then(({ data }) => {
                const _image_file = data.PdFile;

                this.$nextTick(() => {
                    this.image_file = `data:${_image_file.MIMETYPE};base64,${_image_file.DATA}`;
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

                this.$nuxt.$loading.finish();
            });
    }

    downloadManualFile() {
        this.$nuxt.$loading.start();

        this.$apollo
            .query({
                query: gql`
                query {
                    PdFile(ID: ${this.asset.PRODUCT.MANUAL_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `
            })
            .then(({ data }) => {
                const manual_file = data.PdFile;

                this.$nextTick(() => {
                    const buf = Buffer.from(manual_file.DATA, 'base64');
                    const manual = new File(
                        [buf.buffer],
                        manual_file.FILE_NAME,
                        { type: manual_file.MIMETYPE }
                    );

                    const reader = new FileReader();
                    reader.readAsDataURL(manual);

                    reader.onloadend = (event: any) => {
                        const link = document.createElement('a');
                        link.download = manual_file.FILE_NAME;
                        link.href = event.target.result;

                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        this.$nuxt.$loading.finish();
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

                this.$nuxt.$loading.finish();
            });
    }

    changeInterface() {
        this.$nuxt.$loading.start();

        let action: string = '';
        switch (this.status_asset_interface) {
            case 1:
                action = 'USED';
                break;
            case 2:
                action = 'NOT_USED';
                break;
            case 3:
                action = 'UPDATE';
                break;
        }

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation {
                        SetAssetInterface(
                            ACTION: ${action}
                            ID: ${this.asset.ID}
                            PROD_INTF_ID: ${this.asset.INTERFACE.PROD_INTF_ID}
                        )
                    }
                `
            })
            .then(({ data: { SetAssetInterface } }) => {
                console.info(SetAssetInterface);
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산 인터페이스 설정 실패',
                    detail: error.graphQLErrors[0].message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    changeProductImage() {
        this.$toast.add({
            severity: 'warn',
            summary: '제품 이미지 변경',
            detail: '미구현 중입니다. 자산 내역 정리 후 구현 예정입니다',
            life: 2000
        });
    }

    applyAssetInterface() {
        let _header = ``;
        let _message = ``;

        const dst_intf_name = this.productInterfaces.find(
            (pi: any) => pi.PD_INTF_ID === this.asset.INTERFACE.PROD_INTF_ID
        ).INTERFACE.NAME;

        switch (this.status_asset_interface) {
            case 1: {
                _header = `[${this.asset.NAME}] 인터페이스 설정`;
                _message = `${dst_intf_name} 인터페이스를 사용 가능하도록 설정합니다\n진행하시겠습니까?`;
                break;
            }
            case 2: {
                _header = `[${this.asset.NAME}] 인터페이스 제거`;
                _message = `자산의 인터페이스를 사용하지 않도록 설정합니다\n자산의 통신, 수집항목, 제어 등의 기능을 사용하지 않습니다`;
                break;
            }
            case 3: {
                const src_intf_name = this.productInterfaces.find(
                    (pi: any) =>
                        pi.PD_INTF_ID === this.dbAsset?.INTERFACE.PROD_INTF_ID
                ).INTERFACE.NAME;

                _header = `[${this.asset.NAME}] 인터페이스 변경`;
                _message = `[${src_intf_name}] --> [${dst_intf_name}] 인터페이스 변경\n\n자산의 인터페이스 변경은 자산과의 원할한 정보수집을 위하여\n관련 수집항목, 제어, 통신정보 등 모든 정보가 삭제 후 새로 설정됩니다\n그래도 진행하시겠습니까?`;
                break;
            }
        }

        this.$confirmDialog.require({
            group: 'deleteConfirmDialog',
            header: _header,
            message: _message,
            position: 'top',
            icon: 'pi pi-exclamation-triangle',
            acceptClass: 'p-button-danger',
            blockScroll: false,
            accept: () => {
                this.changeInterface();
            }
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

    get is_cus_tree(): boolean {
        return this.$store.state.sessionStorage.ui.is_cus_tree;
    }

    get is_pos_tree(): boolean {
        return this.$store.state.sessionStorage.ui.is_pos_tree;
    }

    get overlayTreeToRender(): Array<any> {
        return this.overlayTreePanelMode === 'custom'
            ? this.treeHier01
            : this.treeHier02;
    }

    get productName(): string {
        return this.asset?.PRODUCT?.NAME === ''
            ? ' - '
            : `${this.asset.PRODUCT.MANUFACTURER.NAME} | ${this.asset.PRODUCT.NAME}`;
    }

    get is_interface(): boolean {
        return this.asset.IS_USE_INTF === 1;
    }

    set is_interface(is: boolean) {
        this.asset.IS_USE_INTF = is ? 1 : 0;
    }

    get is_interface_label(): string {
        return `인터페이스 ${this.is_interface ? '사용' : '사용안함'}`;
    }

    get productInterfaceID(): number {
        return this.asset.INTERFACE?.PROD_INTF_ID ?? -1;
    }

    set productInterfaceID(value: number) {
        this.asset.INTERFACE.PROD_INTF_ID = value;
    }

    get productInfo(): Array<any> {
        let info: Array<any> = [];

        if (
            this.asset.PRODUCT.INFO !== null &&
            this.asset.PRODUCT.INFO.length > 0
        ) {
            info = JSON.parse(this.asset.PRODUCT.INFO);
        }

        return info;
    }

    get hasManual(): boolean {
        return !!this.asset.PRODUCT?.MANUAL_FILE_ID ?? false;
    }

    // by shkoh 20220526: 자산의 인터페이스의 상태, 0: 변화없음, 1: 사용, 2: 사용안함, 3: 변경
    get status_asset_interface(): number {
        let status = 0;

        if (this.dbAsset?.IS_USE_INTF === 0 && this.asset.IS_USE_INTF) {
            status = this.productInterfaceID === -1 ? 0 : 1;
        } else if (this.dbAsset?.IS_USE_INTF && this.asset.IS_USE_INTF === 0) {
            status = 2;
        } else if (
            this.asset.IS_USE_INTF &&
            this.productInterfaceID !== this.dbAsset?.INTERFACE.PROD_INTF_ID
        ) {
            status = 3;
        }

        return status;
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-info::v-deep {
    .i-header-title {
        background: var(--primary-color);
        color: var(--primary-color-text);
        border-radius: var(--border-radius);
        width: 5vw;
    }

    .i-model-key {
        flex-basis: 120px;
        min-width: 60px;
        justify-content: left;
    }

    .i-model-value {
        flex-basis: 50%;
        max-width: 70%;
    }

    .i-image-content {
        width: 100%;
        text-align: center;

        .i-product-image {
            max-width: 100%;
            max-height: 25vh;
            border-radius: 3px;
        }
    }
}

#i-setting-intf-panel::v-deep {
    box-shadow: none;
    border: 1px solid var(--surface-border);

    .p-card-body {
        .p-card-content {
            padding: 0;
        }
    }
}
</style>
