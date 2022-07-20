<template>
    <i-scroll-panel
        id="i-asset-add-dialog-asset-info"
        :style="{ 'padding-left': '1rem', 'padding-right': '1rem' }"
    >
        <div class="p-fluid p-input-filled p-col">
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-label"> 자산명 </label>
                <div class="p-col-3 i-form-value">
                    <InputText
                        v-model="asset.NAME"
                        type="text"
                        aria-describedby="name-help"
                        autocomplete="off"
                        :class="[
                            'p-ml-2',
                            { 'p-invalid': invalidMessage.NAME }
                        ]"
                        @input="validateAssetName"
                    />
                </div>
                <div class="p-col p-my-2" :style="{ 'align-self': 'center' }">
                    <small class="p-error"> {{ invalidMessage.NAME }} </small>
                </div>
            </div>
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-label">
                    시리얼정보
                </label>
                <div class="p-col-3 i-form-value">
                    <InputText
                        v-model="asset.SERIAL"
                        type="text"
                        aria-describedby="name-help"
                        autocomplete="off"
                        :class="[
                            'p-ml-2',
                            { 'p-invalid': invalidMessage.SERIAL }
                        ]"
                        @input="validateAssetSerial"
                    />
                </div>
                <div class="p-col p-my-2" :style="{ 'align-self': 'center' }">
                    <small class="p-error"> {{ invalidMessage.SERIAL }} </small>
                </div>
            </div>
            <div v-if="is_cus_tree" class="p-field p-grid p-mb-1">
                <label
                    for="custom-tree"
                    class="p-col-fixed p-my-2 i-form-label"
                >
                    기본트리 설정
                </label>
                <div class="p-col i-form-value">
                    <Button
                        class="p-button-text p-button-info"
                        :label="customTreeLabel"
                        :style="{ 'text-align': 'left' }"
                        @click="showTreePanel($event, 'custom')"
                    />
                </div>
            </div>
            <div v-if="is_pos_tree" class="p-field p-grid p-mb-1">
                <label
                    for="position-tree"
                    class="p-col-fixed p-my-2 i-form-label"
                >
                    위치설정
                </label>
                <div class="p-col i-form-value">
                    <Button
                        class="p-button-text p-button-info"
                        :label="positionTreeLabel"
                        :style="{ 'text-align': 'left' }"
                        @click="showTreePanel($event, 'position')"
                    ></Button>
                </div>
            </div>
        </div>
        <Divider class="p-my-2" />
        <div class="p-col p-fluid p-input-filled">
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-label">
                    관리책임자(정)
                </label>
                <div class="p-col-5 i-form-value">
                    <Button
                        class="p-button-text p-button-info"
                        :label="opManagerLabel"
                        :style="{ 'text-align': 'left' }"
                        @click="showManagerTreePanel($event, 'CP')"
                    ></Button>
                    <Divider
                        v-if="opManagerContactLabel.length > 0"
                        class="p-ml-3 p-my-0"
                    />
                    <div
                        v-if="opManagerContactLabel.length > 0"
                        class="p-px-3 p-py-2"
                    >
                        {{ opManagerContactLabel }}
                    </div>
                </div>
            </div>
            <div class="p-field p-grid p-mb-1">
                <label class="p-col-fixed p-my-2 i-form-label">
                    관리책임자(부)
                </label>
                <div class="p-col-5 i-form-value">
                    <Button
                        class="p-button-text p-button-info"
                        :label="opSubManagerLabel"
                        :style="{ 'text-align': 'left' }"
                        @click="showManagerTreePanel($event, 'PC')"
                    ></Button>
                    <Divider
                        v-if="opSubManagerContactLabel.length > 0"
                        class="p-ml-3 p-my-0"
                    />
                    <div
                        v-if="opSubManagerContactLabel.length > 0"
                        class="p-px-3 p-py-2"
                    >
                        {{ opSubManagerContactLabel }}
                    </div>
                </div>
            </div>
            <div class="p-field p-grid p-mb-1">
                <label
                    for="install-date"
                    class="p-col-fixed p-my-2 i-form-label"
                >
                    자산도입일
                </label>
                <div class="p-col-3 i-form-value">
                    <i-calendar
                        v-model="asset.INSTALL_DATE"
                        class="p-ml-2"
                        :panel-style="{ width: '16vw' }"
                        append-to="body"
                        :show-icon="true"
                        :select-other-months="true"
                        :show-button-bar="true"
                        :manual-input="false"
                        :locale="{ clear: '설정안함' }"
                    />
                </div>
            </div>
        </div>
        <Panel header="유지보수" :toggleable="false">
            <div class="p-col p-fluid p-input-filled">
                <div class="p-field p-grid">
                    <label
                        for="maintenance-user"
                        class="p-col-fixed p-my-2 i-form-maintenance-label"
                    >
                        유지보수 담당자
                    </label>
                    <div class="p-col-5 i-form-value">
                        <Button
                            class="p-button-text p-button-info"
                            :label="opMAUserLabel"
                            :style="{ 'text-align': 'left' }"
                            @click="showManagerTreePanel($event, 'M')"
                        ></Button>
                        <Divider
                            v-if="
                                opMAUserContactLabel.length > 0 ||
                                opMAUserEmailLabel.length > 0
                            "
                            class="p-ml-3 p-my-0"
                        />
                        <div
                            v-if="opMAUserContactLabel.length > 0"
                            class="p-px-3 p-pt-2 p-pb-1"
                        >
                            {{ opMAUserContactLabel }}
                        </div>
                        <div
                            v-if="opMAUserEmailLabel.length > 0"
                            class="p-px-3 p-pt-1 p-pb-2"
                        >
                            {{ opMAUserEmailLabel }}
                        </div>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="maintenance-start-date"
                        class="p-col-fixed p-my-2 i-form-maintenance-label"
                    >
                        유지보수 시작일
                    </label>
                    <div class="p-col-3 i-form-value">
                        <i-calendar
                            v-model="asset.MA_START_DATE"
                            :class="[
                                'p-ml-2',
                                { 'p-invalid': invalidMessage.MA_START_DATE }
                            ]"
                            :panel-style="{ width: '16vw' }"
                            class-name="i-maintenance"
                            append-to="body"
                            :show-icon="true"
                            :select-other-months="true"
                            :show-button-bar="true"
                            :locale="{ clear: '설정안함' }"
                            :manual-input="false"
                            @date-select="onDateSelectMAStart"
                            @clear-click="onDateClearMAStart"
                        />
                    </div>
                    <div
                        class="p-col p-my-2"
                        :style="{ 'align-self': 'center' }"
                    >
                        <small id="ma-start-dt-help" class="p-error">{{
                            invalidMessage.MA_START_DATE
                        }}</small>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="maintenance-end-date"
                        class="p-col-fixed p-my-2 i-form-maintenance-label"
                    >
                        유지보수 종료일
                    </label>
                    <div class="p-col-3 i-form-value">
                        <i-calendar
                            v-model="asset.MA_END_DATE"
                            :class="[
                                'p-ml-2',
                                { 'p-invalid': invalidMessage.MA_END_DATE }
                            ]"
                            :panel-style="{ width: '16vw' }"
                            class-name="i-maintenance"
                            append-to="body"
                            :show-icon="true"
                            :select-other-months="true"
                            :show-button-bar="true"
                            :locale="{ clear: '설정안함' }"
                            :manual-input="false"
                            @date-select="onDateSelectMAEnd"
                            @clear-click="onDateClearMAEnd"
                        />
                    </div>
                    <div
                        class="p-col p-my-2"
                        :style="{ 'align-self': 'center' }"
                    >
                        <small id="ma-end-dt-help" class="p-error">{{
                            invalidMessage.MA_END_DATE
                        }}</small>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label class="p-col-fixed p-my-2 i-form-maintenance-label">
                        유지보수 점검
                    </label>
                    <div class="p-col-4 i-form-value">
                        <InputText
                            v-model="asset.INSPECT_INFO"
                            type="text"
                            aria-describedby="inspectInfo-help"
                            autocomplete="off"
                            :class="[
                                'p-ml-2',
                                { 'p-invalid': invalidMessage.INSPECT_INFO }
                            ]"
                            @input="validateInspectInfo"
                        />
                    </div>
                    <div
                        class="p-col p-my-2"
                        :style="{ 'align-self': 'center' }"
                    >
                        <small id="inspectInfo-help" class="p-error">
                            {{ invalidMessage.INSPECT_INFO }}
                        </small>
                    </div>
                </div>
            </div>
        </Panel>
        <i-overlay-panel
            ref="treePanel"
            :show-close-icon="true"
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
            />
        </i-overlay-panel>
        <i-overlay-panel
            ref="managerTreePanel"
            :show-close-icon="true"
            append-to="body"
            :style="{ width: '16vw', height: '42vh' }"
        >
            <i-moveable-tree
                :value="overlayManagerTreeToRender"
                :moveable="false"
                :filter="true"
                :expanded-keys.sync="managerTreeExpandedKey"
                selection-mode="single"
                :style="{ height: 'calc(42vh - 2rem)' }"
                @node-select="onSelectOverlayManagerTreePanel"
            >
                <template #default="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-building p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        />
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
                <template #M="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-shield p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        />
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
                <template #Operator="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-user p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        />
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
            </i-moveable-tree>
        </i-overlay-panel>
    </i-scroll-panel>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import IOverlayPanel from '../custom/iOverlayPanel.vue';
import Component from '@/plugins/nuxt-class-component';

interface Operator {
    ID: number;
    NAME: string;
    PHONE: string;
    EXT_NO: string;
    MOBILE: string;
    EMAIL: string;
    key: string;
    label: string;
    type: string;
}

interface Company {
    ID: number;
    NAME: string;
    key: string;
    label: string;
    type: string;
    children: Operator[];
}

@Component<AssetAddDialogAssetInfo>({
    props: {
        product: Object,
        asset: {
            type: Object,
            default: null
        }
    },
    watch: {
        invalidMessage: {
            deep: true,
            handler() {
                this.validationCheck();
            }
        }
    },
    apollo: {
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
            skip() {
                return !this.is_cus_tree || this.$props.asset === null;
            },
            update: ({ Tree }) => Tree,
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
            skip() {
                return !this.is_pos_tree || this.$props.asset === null;
            },
            update: ({ Tree }) => Tree,
            result({ loading, data }) {
                if (!loading) {
                    const { Tree } = data;

                    if (Tree) {
                        this.setTreeLabel('position');
                    }
                }
            }
        },
        customerCompanies: {
            query: gql`
                query {
                    Companies {
                        ID
                        NAME
                        key: KEY
                        label: NAME
                        type: TYPE
                        children: OPERATORS {
                            ID
                            NAME
                            PHONE
                            EXT_NO
                            MOBILE
                            EMAIL
                            key: KEY
                            label: NAME
                            type: TYPE
                        }
                    }
                }
            `,
            update: ({ Companies }) => Companies
        }
    }
})
export default class AssetAddDialogAssetInfo extends Vue {
    $refs!: {
        treePanel: IOverlayPanel;
        managerTreePanel: IOverlayPanel;
    };

    invalidMessage = {
        NAME: undefined as string | undefined,
        SERIAL: undefined as string | undefined,
        MA_START_DATE: undefined as string | undefined,
        MA_END_DATE: undefined as string | undefined,
        INSPECT_INFO: undefined as string | undefined
    };

    customTreeLabel: string = '';
    positionTreeLabel: string = '';

    treeHier01: Array<any> = [];
    treeHier02: Array<any> = [];

    // by shkoh 20220718: Overlay Panel의 Tree 형식 지정
    overlayTreePanelMode: string = '';

    customerCompanies: Array<Company> | null = null;
    managerTreeExpandedKey = {};
    overlayManagerTreePanelMode: string = '';

    get is_cus_tree(): boolean {
        return this.$store.state.sessionStorage.ui.is_cus_tree;
    }

    get is_pos_tree(): boolean {
        return this.$store.state.sessionStorage.ui.is_pos_tree;
    }

    validateAssetName(event: InputEvent) {
        const input = event.toString();
        if (input.length > 64) {
            this.invalidMessage.NAME = '자산명은 64자 이하입니다';
        } else if (input.length < 2) {
            this.invalidMessage.NAME = '자산명은 2자 이상 작성해야 합니다';
        } else {
            this.invalidMessage.NAME = undefined;
        }
    }

    validateAssetSerial(event: InputEvent) {
        const input = event.toString();
        if (input.length > 64) {
            this.invalidMessage.SERIAL = '시리얼정보는 64자 이하입니다';
        } else {
            this.invalidMessage.SERIAL = undefined;
        }
    }

    validateInspectInfo(event: InputEvent) {
        const input = event.toString();
        if (input.length > 32) {
            this.invalidMessage.INSPECT_INFO =
                '유지보수 점검 내용은 32자 이하로 입력 가능합니다';
        } else {
            this.invalidMessage.INSPECT_INFO = undefined;
        }
    }

    setTreeLabel(mode: string) {
        const root_node =
            mode === 'custom' ? this.treeHier01[0] : this.treeHier02[0];

        if (root_node) {
            const target_key =
                mode === 'custom'
                    ? this.$props.asset.CUST_HIER_ID_C
                    : this.$props.asset.CUST_HIER_ID_P;

            switch (mode) {
                case 'custom': {
                    let label = '';
                    if (target_key < 0) {
                        label = '(필수) 신규 자산의 기본트리를 선택합니다';
                    } else if (target_key === 0) {
                        label = `${root_node.label}`;
                    } else {
                        this.findTreeNode(mode, root_node, `ach_${target_key}`);
                        label = `${root_node.label} >> ${this.customTreeLabel}`;
                    }

                    this.customTreeLabel = label;
                    break;
                }
                case 'position': {
                    let label = '';
                    if (target_key < 0) {
                        label = '(필수) 신규 자산의 위치를 선택합니다';
                    } else if (target_key === 0) {
                        label = `${root_node.label}`;
                    } else {
                        this.findTreeNode(mode, root_node, `ach_${target_key}`);
                        label = `${root_node.label} >> ${this.positionTreeLabel}`;
                    }

                    this.positionTreeLabel = label;
                    break;
                }
            }
        }
    }

    findTreeNode(mode: string, node: any, target_key: string): boolean {
        if (node.children.length === 0) return false;

        const target_node = node.children.find(
            (c: any) => c.key === target_key
        );
        if (!target_node) {
            let has_target = false;

            for (const child of node.children) {
                has_target = this.findTreeNode(mode, child, target_key);

                if (has_target) {
                    switch (mode) {
                        case 'custom':
                            this.customTreeLabel = `${child.label} >> ${this.customTreeLabel}`;
                            break;
                        case 'position':
                            this.positionTreeLabel = `${child.label} >> ${this.positionTreeLabel}`;
                            break;
                    }

                    break;
                }
            }

            return has_target;
        } else {
            switch (mode) {
                case 'custom':
                    this.customTreeLabel = target_node.label;
                    break;
                case 'position':
                    this.positionTreeLabel = target_node.label;
                    break;
            }
            return true;
        }
    }

    showTreePanel(event: PointerEvent, mode: string) {
        this.$refs.treePanel.toggle(event);
        this.overlayTreePanelMode = mode;
    }

    onSelectOverlayTreePanel(node: any) {
        const [code, id] = node.key.split('_');

        const asset = this.$props.asset;
        switch (this.overlayTreePanelMode) {
            case 'custom':
                this.$set(asset, 'CUST_HIER_ID_C', Number(id));
                this.$emit('update:asset', asset);
                break;
            case 'position':
                this.$set(asset, 'CUST_HIER_ID_P', Number(id));
                this.$emit('update:asset', asset);
                break;
        }

        this.setTreeLabel(this.overlayTreePanelMode);

        this.$refs.treePanel.hide();
        this.overlayTreePanelMode = '';
    }

    get overlayTreeToRender(): Array<any> {
        return this.overlayTreePanelMode === 'custom'
            ? this.treeHier01
            : this.treeHier02;
    }

    getOperator(op_id: number) {
        let operator, company;

        if (this.customerCompanies && this.customerCompanies.length > 0) {
            for (const cp of this.customerCompanies) {
                if (cp.children.length > 0) {
                    operator = cp.children.find(
                        (op: Operator) => Number(op.ID) === op_id
                    );

                    if (operator !== undefined) {
                        company = cp;
                        break;
                    }
                }
            }
        }

        return { operator, company };
    }

    operatorLabel(op_id: number): string {
        const { operator, company } = this.getOperator(op_id);

        if (operator === undefined || company === undefined) return '';
        return `${company?.NAME} | ${operator?.NAME}`;
    }

    operatorContactLabel(op_id: number): string {
        const { operator, company } = this.getOperator(op_id);
        if (operator === undefined || company === undefined) return '';

        const { PHONE, EXT_NO, MOBILE } = operator;
        let contact: string = `${PHONE}`;
        if (EXT_NO.length > 0) contact += `(${EXT_NO})`;

        if (contact.length > 0 && MOBILE.length > 0) contact += ' | ';
        contact += MOBILE;

        return contact;
    }

    operatorEmailLabel(op_id: number): string {
        const { operator } = this.getOperator(op_id);
        return operator && operator.EMAIL.length > 0 ? operator.EMAIL : '';
    }

    get opManagerLabel(): string {
        const person = this.operatorLabel(this.$props.asset.OP_ID_M);
        return person.length > 0 ? person : '관리책임자(정)를 지정합니다';
    }

    get opSubManagerLabel(): string {
        const person = this.operatorLabel(this.$props.asset.OP_ID_S);
        return person.length > 0 ? person : '관리책임자(부)를 지정합니다';
    }

    get opMAUserLabel(): string {
        const person = this.operatorLabel(this.$props.asset.MA_USER_ID);
        return person.length > 0 ? person : '유지보수 담당자를 지정합니다';
    }

    get opManagerContactLabel(): string {
        return this.operatorContactLabel(this.$props.asset.OP_ID_M);
    }

    get opSubManagerContactLabel(): string {
        return this.operatorContactLabel(this.$props.asset.OP_ID_S);
    }

    get opMAUserContactLabel(): string {
        return this.operatorContactLabel(this.$props.asset.MA_USER_ID);
    }

    get opMAUserEmailLabel(): string {
        return this.operatorEmailLabel(this.$props.asset.MA_USER_ID);
    }

    showManagerTreePanel(event: PointerEvent, mode: string) {
        this.managerTreeExpandedKey = {};
        this.overlayManagerTreePanelMode = mode;
        this.$refs.managerTreePanel.toggle(event);
    }

    get overlayManagerTreeToRender(): Array<any> {
        const nodes: Array<any> = [];

        if (this.customerCompanies) {
            this.customerCompanies.forEach((company: Company) => {
                if (
                    company.children.length > 0 &&
                    this.overlayManagerTreePanelMode.includes(company.type)
                ) {
                    this.$set(company, 'selectable', false);
                    nodes.push(company);
                    this.$set(this.managerTreeExpandedKey, company.key, true);
                }
            });
        }

        return nodes;
    }

    onSelectOverlayManagerTreePanel(node: any) {
        const asset = this.$props.asset;

        switch (this.overlayManagerTreePanelMode) {
            case 'CP':
                this.$set(asset, 'OP_ID_M', Number(node.ID));
                break;
            case 'PC':
                this.$set(asset, 'OP_ID_S', Number(node.ID));
                break;
            case 'M':
                this.$set(asset, 'MA_USER_ID', Number(node.ID));
                break;
        }

        this.$emit('update:asset', asset);

        this.overlayManagerTreePanelMode = '';
        this.$refs.managerTreePanel.hide();
    }

    onDateSelectMAStart(date: Date) {
        if (this.$props.asset.MA_END_DATE) {
            const start_dt = date.getTime();
            const end_dt = this.$props.asset.MA_END_DATE.getTime();

            if (start_dt >= end_dt) {
                this.invalidMessage.MA_START_DATE =
                    '유지보수 시작일이 종료일 이후로 설정되었습니다';
            } else {
                this.resetInvalidMessageMADate();
            }
        } else {
            this.resetInvalidMessageMADate();
        }
    }

    onDateClearMAStart() {
        this.resetInvalidMessageMADate();
    }

    onDateSelectMAEnd(date: Date) {
        try {
            if (this.$props.asset.MA_START_DATE) {
                const start_dt = this.$props.asset.MA_START_DATE.getTime();
                const end_dt = date.getTime();

                if (start_dt >= end_dt) {
                    this.invalidMessage.MA_END_DATE =
                        '유지보수 종료일이 시작일 이전으로 설정되었습니다';
                } else {
                    this.resetInvalidMessageMADate();
                }
            } else {
                this.resetInvalidMessageMADate();
            }
        } catch {
            this.resetInvalidMessageMADate();
        }
    }

    onDateClearMAEnd() {
        this.resetInvalidMessageMADate();
    }

    resetInvalidMessageMADate() {
        this.invalidMessage.MA_START_DATE = undefined;
        this.invalidMessage.MA_END_DATE = undefined;
    }

    validationCheck() {
        let is_valid = true;
        for (const valid of Object.values(this.invalidMessage)) {
            if (valid) {
                is_valid = false;
                break;
            }
        }

        this.$emit('validate', is_valid);
    }
}
</script>

<style lang="scss" scoped>
#i-asset-add-dialog-asset-info::v-deep {
    .i-form-label {
        flex-basis: 100px;
        border-radius: 3px;
        background-color: var(--primary-color);
        color: var(--primary-color-text);
        padding: 0.5rem;
    }

    .i-form-value {
        align-self: center;
    }

    .i-form-maintenance-label {
        flex-basis: 100px;
        border-radius: 3px;
        background-color: var(--text-color-secondary);
        color: var(--primary-color-text);
        padding: 0.5rem;
    }

    .i-maintenance {
        .p-button.p-button-icon-only {
            background-color: var(--text-color-secondary);
            border-color: var(--text-color-secondary);
        }
    }
}
</style>
