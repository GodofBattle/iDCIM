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
                        type="text"
                        v-model="asset.NAME"
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
            <div class="p-field p-grid" v-if="is_cus_tree">
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
            <div class="p-field p-grid"  v-if="is_pos_tree">
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
            <div class="p-d-flex">
                <div
                    class="p-col-fixed"
                    :style="{ width: '70%' }"
                >
                    <div class="p-field p-grid" v-if="productInterfaces.length > 0">
                        <div class="p-field-checkbox p-mb-0 p-mr-4 i-model-key">
                            <Checkbox
                                id="is_intf"
                                :binary="true"
                                v-model="is_interface"
                            />
                            <label for="is_intf">인터페이스</label>
                        </div>
                        <div class="p-col-fixed i-model-value">
                            <Dropdown
                                id="mc-id"
                                v-model="productInterfaceID"
                                :options="productInterfaces"
                                placeholder="사용 가능 인터페이스"
                                empty-filter-message="사용 가능한 인터페이스가 존재하지 않습니다"
                                append-to="body"
                                data-key="ID"
                                option-label="INTERFACE.NAME"
                                option-value="PD_INTF_ID"
                                :style="{ width: '70%' }"
                            >
                            </Dropdown>
                            <Button label="적용" icon="pi pi-check" class="p-button" :style="{ 'max-width': '80px', 'min-width': '68px' }"></Button>
                        </div>
                    </div>
                    <div class="p-field p-grid" v-if="hasManual">
                        <label for="manual" class="p-col-fixed p-mb-0 p-mr-4 i-model-key">
                            메뉴얼
                        </label>
                        <div class="p-col-fixed i-model-value">
                            <Button
                                class="p-text-nowrap p-text-truncate p-text-left p-button-sm p-button-outlined p-button-secondary"
                                :label="manual_file_name"
                                icon="pi pi-download"
                                :style="{ 'max-width': '100%', 'display': 'block' }"
                                @click="downloadManualFile"
                            ></Button>
                        </div>
                    </div>
                    <div class="p-field p-grid">
                        <label class="p-col-fixed p-mb-0 p-mr-4 p-py-2 i-model-key">
                            자산분류
                        </label>
                        <div class="p-col-fixed p-py-2 i-model-value">
                            <label>{{ assetCodeTreeLabel }}</label>
                        </div>
                    </div>
                    <Divider v-if="productInfo.length > 0" :style="{ 'margin-left': '-0.5rem' }"/>
                    <div class="p-field p-grid p-mb-1" v-for="(data, index) of productInfo" :key="index">
                        <Tag class="p-col-fixed p-mb-0 p-mr-4 p-py-1 i-model-key" severity="info">
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
                            <button class="p-panel-header-icon p-link">
                                <span class="pi pi-images"></span>
                            </button>
                        </template>
                        <div class="i-image-content">
                            <img class="i-product-image" :src="image_file" v-if="image_file.length > 0"/>
                        </div>
                    </Panel>
                </div>
            </div>
        </Panel>
        <OverlayPanel
            ref="treePanel"
            :showCloseIcon="true"
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

@Component<AssetPanelInfo>({
    props: {
        assetItem: Object
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
                    ID: this.$props.assetItem ? Number(this.$props.assetItem.ID) : -1
                }
            },
            update: ({ Asset }) => Asset,
            result({ loading, data }) {
                if(!loading) {
                    const { Asset } = data;

                    if(Asset) {
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
            skip() { return !this.is_cus_tree },
            result({ loading, data }) {
                if(!loading) {
                    const { Tree } = data;

                    if(Tree) {
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
            skip() { return !this.is_pos_tree },
            result({ loading, data }) {
                if(!loading) {
                    const { Tree } = data;

                    if(Tree) {
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
                if(!loading) {
                    const { Tree } = data;

                    if(Tree) {
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
                }
            },
            update: ({ ProductInterfaces }) => ProductInterfaces
        }
    }
})
export default class AssetPanelInfo extends Vue {
    $refs!: {
        treePanel: any
    };

    temps = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value11' },
        { key: 'key3', value: 'value12' },
        { key: 'key4', value: 'value13' },
    ];

    treeHier01: Array<any> = [];
    treeHier02: Array<any> = [];
    treeHier03: Array<any> = [];

    productInterfaces: Array<any> = [];

    customTreeLabel: string = '';
    positionTreeLabel: string = '';
    assetCodeTreeLabel: string = '';

    manual_file_name: string = '';
    image_file: any = '';

    dbAsset = null;
    asset: any = {
        ID: -1,
        NAME: '',
        SERIAL: '',
        CUST_HIER_ID_P: null as number | null,
        CUST_HIER_ID_C: null as number | null,
        PRODUCT: {
            ASSET_CD: '',
            NAME: '',
            MANUAL_FILE_ID: null as number | null,
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

    overlayTreePanelMode: string = '';

    apolloFetch(data: any) {
        console.info(data);

        for(const [key, value] of Object.entries(data)) {
            this.asset[key] = value;

            if(key === 'CUST_HIER_ID_C' && value !== null) {
                this.$apollo.queries.treeHier01.refresh();
            }

            if(key === 'CUST_HIER_ID_P' && value !== null) {
                this.$apollo.queries.treeHier02.refresh();
            }

            if(key === 'PRODUCT_ID' && value !== null) {
                this.$apollo.queries.productInterfaces.refetch({ PRODUCT_ID: value });
            }

            if(key === 'PRODUCT') {                
                this.$apollo.queries.treeHier03.refresh();
            }
        }

        if(this.asset.PRODUCT.MANUAL_FILE_ID) {
            // by shkoh 20220520: 파일을 입력하기 전에 데이터 초기화 작업을 한 번 수행
            this.manual_file_name = '';
            this.loadManualFile();
        }

        //console.info(this.image_file);
        if(this.asset.PRODUCT.IMAGE_FILE_ID) {
            this.loadImageFile();
        } else {
            this.image_file = '';
        }
    }

    validateAssetName(input: InputEvent) {
        const _input = input.toString();
        if(_input.length > 64) {
            this.invalidMessage.NAME = '자산명은 64자 이하입니다';
        } else if(_input.length < 2) {
            this.invalidMessage.NAME = '자산명은 2자 이상 작성해야 합니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    validateAssetSerial(input: InputEvent) {
        const _input = input.toString();
        if(_input.length > 64) {
            this.invalidMessage.SERIAL = '시리얼은 64자 이하입니다';
        } else {
            this.invalidMessage.SERIAL = undefined;
        }
    }

    setTreeLabel(type: string) {
        const root_node = type === 'custom' ? this.treeHier01[0] : this.treeHier02[0];

        if(root_node) {
            this.findTreeNode(type, root_node, `ach_${type === 'custom' ? this.asset.CUST_HIER_ID_C : this.asset.CUST_HIER_ID_P}`);

            if(type === 'custom') {
                this.customTreeLabel = `${root_node.label} >> ${this.customTreeLabel}`;
            } else if(type === 'position') {
                this.positionTreeLabel = `${root_node.label} >> ${this.positionTreeLabel}`;
            }
        }
    }

    findTreeNode(type: string, node: any, target_key: string): boolean {
        if(node.children.length === 0) return false;
        
        const target_node = node.children.filter((c: any) => c.key === target_key)[0];

        if(!target_node) {
            let has_target = false;

            for(const child of node.children) {
                has_target = this.findTreeNode(type, child, target_key);

                if(has_target) {
                    if(type === 'custom') {
                        this.customTreeLabel = `${child.label} >> ${this.customTreeLabel}`;
                    } else if(type === 'position') {
                        this.positionTreeLabel = `${child.label} >> ${this.positionTreeLabel}`;
                    } else if(type === 'assetCode') {
                        this.assetCodeTreeLabel = `${child.label} | ${this.assetCodeTreeLabel}`;
                    }
                    break;
                }
            }          
            
            return has_target;
        } else {
            if(type === 'custom') {
                this.customTreeLabel = target_node.label;
            } else if(type === 'position')  {
                this.positionTreeLabel = target_node.label;
            } else if(type === 'assetCode') {
                this.assetCodeTreeLabel = target_node.label;
            }
            return true;
        }
    }

    setAssetCode() {
        if(this.asset.PRODUCT.ASSET_CD !== '') {
            const root_node = this.treeHier03[0];
            this.findTreeNode('assetCode', root_node, `pac_${this.asset.PRODUCT.ASSET_CD}`);
        }
    }

    showTreePanel(event: Event, mode: string) {
        this.$refs.treePanel.toggle(event);
        this.overlayTreePanelMode = mode;
    }

    onSelectOverlayTreePanel(select_node: any) {
        const [code, id] = select_node.key.split('_');

        if(this.overlayTreePanelMode === 'custom') {
            this.asset.CUST_HIER_ID_C = Number(id);
        } else if(this.overlayTreePanelMode === 'position') {
            this.asset.CUST_HIER_ID_P = Number(id);
        }
        
        this.setTreeLabel(this.overlayTreePanelMode);

        this.$refs.treePanel.hide();
        this.overlayTreePanelMode = '';
    }

    loadManualFile() {
        this.$apollo.query({
            query: gql`
                query {
                    PdFile(ID: ${this.asset.PRODUCT.MANUAL_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                    }
                }
            `
        }).then(({ data }) => {
            const manual_file = data.PdFile;
            this.manual_file_name = manual_file.FILE_NAME;
        }).catch((error) => {
            console.error(error);

            this.$toast.add({
                severity: 'error',
                summary: '파일 로드 실패',
                detail: error.message,
                life: 2000
            });
        });
    }

    downloadManualFile() {
        this.$nuxt.$loading.start();

        this.$apollo.query({
            query: gql`
                query {
                    PdFile(ID: ${this.asset.PRODUCT.MANUAL_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `
        }).then(({ data }) => {
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
                }
            });
        }).catch((error) => {
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

    loadImageFile() {
        this.$apollo.query({
            query: gql`
                query {
                    PdFile(ID: ${this.asset.PRODUCT.IMAGE_FILE_ID}) {
                        FILE_NAME
                        MIMETYPE
                        DATA
                    }
                }
            `
        }).then(({ data }) => {
            const _image_file = data.PdFile;

            this.$nextTick(() => {
                this.image_file = `data:${_image_file.MIMETYPE};base64,${_image_file.DATA}`;
            });
        }).catch((error) => {
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

    get overlayTreeToRender(): Array<any> {
        return this.overlayTreePanelMode === 'custom' ? this.treeHier01 : this.treeHier02;
    }

    get is_cus_tree(): boolean {
        return this.$store.state.sessionStorage.ui.is_cus_tree;
    }

    get is_pos_tree(): boolean {
        return this.$store.state.sessionStorage.ui.is_pos_tree;
    }

    get productName(): string {
        return this.asset?.PRODUCT?.NAME === '' ? '' : `${this.asset.PRODUCT.MANUFACTURER.NAME} | ${this.asset.PRODUCT.NAME}`;
    }

    get is_interface(): boolean {
        return this.asset.INTERFACE === null ? false : true;
    }

    set is_interface(_val: boolean) {
        this.asset.INTERFACE = _val ? { ID: this.asset.ID } : null;
    }

    get productInterfaceID(): number {
        return this.asset?.INTERFACE?.PROD_INTF_ID ?? -1;
    }

    set productInterfaceID(_new_prod_intf_id) {
        Object.defineProperty(this.asset, 'INTERFACE', {
            value: { PROD_INTF_ID: _new_prod_intf_id },
            configurable: true,
            enumerable: true,
            writable: true
        });
    }

    get productInfo(): Array<any> {
        let infos: Array<any> = [];

        if(this.asset.PRODUCT.INFO !== null && this.asset.PRODUCT.INFO.length > 0) {
            infos = JSON.parse(this.asset.PRODUCT.INFO);
        }

        return infos;
    }

    get hasManual(): boolean {
        return !!this.asset.PRODUCT?.MANUAL_FILE_ID ?? false;
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
            max-height: 30vh;
            border-radius: 3px;
        }
    }
}
</style>