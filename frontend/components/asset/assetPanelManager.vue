<template>
    <div id="i-asset-panel-manager">
        <div class="p-col p-fluid p-input-filled">
            <div class="p-field p-grid">
                <label for="manager" class="p-col-fixed p-my-2 i-form-label">
                    관리책임자(정)
                </label>
                <div class="p-col-5 i-form-value">
                    <Button
                        class="p-button-text p-button-info"
                        :label="opManagerLabel"
                        :style="{ 'text-align': 'left' }"
                        @click="showTreePanel($event, 'CP')"
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
            <div class="p-field p-grid">
                <label
                    for="sub-manager"
                    class="p-col-fixed p-my-2 i-form-label"
                >
                    관리책임자(부)
                </label>
                <div class="p-col-5 i-form-value">
                    <Button
                        class="p-button-text p-button-info"
                        :label="opManagerSecondLabel"
                        :style="{ 'text-align': 'left' }"
                        @click="showTreePanel($event, 'PC')"
                    ></Button>
                    <Divider
                        v-if="opManagerSecondContactLabel.length > 0"
                        class="p-ml-3 p-my-0"
                    />
                    <div
                        v-if="opManagerSecondContactLabel.length > 0"
                        class="p-px-3 p-py-2"
                    >
                        {{ opManagerSecondContactLabel }}
                    </div>
                </div>
            </div>
            <div class="p-field p-grid">
                <label
                    for="install-date"
                    class="p-col-fixed p-my-2 i-form-label"
                >
                    자산도입일
                </label>
                <div class="p-col-2 i-form-value">
                    <i-calendar
                        v-model="asset.INSTALL_DATE"
                        class="p-ml-2"
                        :panel-style="{ width: '16vw' }"
                        append-to="body"
                        :show-icon="true"
                        :select-other-months="true"
                        :show-button-bar="true"
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
                            @click="showTreePanel($event, 'M')"
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
                    <div class="p-col-2 i-form-value">
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
                            @date-select="onDateSelectMAStart"
                            @clear-click="onDateClearMAStart"
                        />
                    </div>
                    <div
                        class="p-col p-my-2"
                        :style="{ 'align-self': 'center' }"
                    >
                        <small id="ma-start-dt-help" class="p-error">
                            {{ invalidMessage.MA_START_DATE }}
                        </small>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="maintenance-end-date"
                        class="p-col-fixed p-my-2 i-form-maintenance-label"
                    >
                        유지보수 종료일
                    </label>
                    <div class="p-col-2 i-form-value">
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
                            @date-select="onDateSelectMAEnd"
                            @clear-click="onDateClearMAEnd"
                        />
                    </div>
                    <div
                        class="p-col p-my-2"
                        :style="{ 'align-self': 'center' }"
                    >
                        <small id="ma-end-dt-help" class="p-error">
                            {{ invalidMessage.MA_END_DATE }}
                        </small>
                    </div>
                </div>
                <div class="p-field p-grid">
                    <label
                        for="inspectInfo"
                        class="p-col-fixed p-my-2 i-form-maintenance-label"
                    >
                        유지보수 점검
                    </label>
                    <div class="p-col-4 i-form-value">
                        <InputText
                            id="inspectInfo"
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
        <OverlayPanel
            ref="treeOperator"
            :show-close-icon="true"
            append-to="body"
            :style="{ width: '16vw', height: '42vh' }"
        >
            <i-moveable-tree
                :value="overlayTreeToRender"
                :moveable="false"
                :filter="true"
                :expanded-keys="treeExpandedKey"
                selection-mode="single"
                :style="{ height: 'calc(42vh - 2rem)' }"
                @node-select="onSelectOverlayTreePanel"
            >
                <template #default="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-building p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        ></i>
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
                <template #M="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-shield p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        ></i>
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
                <template #Operator="slotProps">
                    <div class="p-d-flex">
                        <i
                            class="pi pi-user p-p-1 p-mr-1"
                            style="font-size: 1.2rem"
                        ></i>
                        <div class="p-p-1">{{ slotProps.node.label }}</div>
                    </div>
                </template>
            </i-moveable-tree>
        </OverlayPanel>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

type Asset = {
    [index: string]: number | Date | null | string;
    ID: number;
    NAME: string;
    OP_ID_M: number;
    OP_ID_S: number;
    INSTALL_DATE: Date | null;
    MA_USER_ID: number;
    MA_START_DATE: Date | null;
    MA_END_DATE: Date | null;
    INSPECT_INFO: string;
};

type Operator = {
    [index: string]: number | string;
    ID: number;
    NAME: string;
    PHONE: string;
    EXT_NO: string;
    MOBILE: string;
    EMAIL: string;
    key: string;
    label: string;
    type: string;
};

type Comany = {
    [index: string]: number | string | Operator[];
    ID: number;
    NAME: string;
    key: string;
    label: string;
    type: string;
    children: Operator[];
};

@Component<AssetPanelManager>({
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
                        NAME
                        OP_ID_M
                        OP_ID_S
                        INSTALL_DATE
                        MA_USER_ID
                        MA_START_DATE
                        MA_END_DATE
                        INSPECT_INFO
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
    },
    watch: {
        asset: {
            deep: true,
            handler(_asset: Asset) {
                const is_changed = this.changeAssetData(_asset);
                this.$emit(
                    'update:applyButtonDisabled',
                    !is_changed || !this.is_valid
                );
            }
        }
    }
})
export default class AssetPanelManager extends Vue {
    $refs!: {
        treeOperator: any;
    };

    dbAsset: Asset = {
        ID: -1,
        NAME: '',
        OP_ID_M: -1,
        OP_ID_S: -1,
        INSTALL_DATE: null,
        MA_USER_ID: -1,
        MA_START_DATE: null,
        MA_END_DATE: null,
        INSPECT_INFO: ''
    };

    asset: Asset = {
        ID: -1,
        NAME: '',
        OP_ID_M: -1,
        OP_ID_S: -1,
        INSTALL_DATE: null,
        MA_USER_ID: -1,
        MA_START_DATE: null,
        MA_END_DATE: null,
        INSPECT_INFO: ''
    };

    invalidMessage = {
        MA_START_DATE: undefined as string | undefined,
        MA_END_DATE: undefined as string | undefined,
        INSPECT_INFO: undefined as string | undefined
    };

    customerCompanies: Array<Comany> | null = null;
    treeExpandedKey: object = {};
    overlayPanelMode: string = '';

    refreshAsset() {
        this.$apollo.queries.dbAsset.refresh();
    }

    resetAsset() {
        this.asset.ID = -1;
        this.asset.NAME = '';
        this.asset.OP_ID_M = -1;
        this.asset.OP_ID_S = -1;
        this.asset.INSTALL_DATE = null;
        this.asset.MA_USER_ID = -1;
        this.asset.MA_START_DATE = null;
        this.asset.MA_END_DATE = null;
        this.asset.INSPECT_INFO = '';

        this.invalidMessage.INSPECT_INFO = undefined;
    }

    resetInvalidMessageMADate() {
        this.invalidMessage.MA_START_DATE = undefined;
        this.invalidMessage.MA_END_DATE = undefined;
    }

    apolloFetch(data: Asset) {
        this.resetAsset();
        this.resetInvalidMessageMADate();

        for (const [key, value] of Object.entries(data)) {
            if (
                value !== null &&
                ['INSTALL_DATE', 'MA_START_DATE', 'MA_END_DATE'].includes(key)
            ) {
                this.asset[key] = new Date(value);
            } else {
                this.asset[key] = value;
            }
        }
    }

    updateAsset() {
        const variables = {
            ID: this.asset.ID
        };

        for (const [key, value] of Object.entries(this.asset)) {
            if (
                ['INSTALL_DATE', 'MA_START_DATE', 'MA_END_DATE'].includes(key)
            ) {
                const src = this.dbAsset[key];
                const dst = this.asset[key];

                if (src === null && dst !== null) {
                    this.$set(variables, key, new Date(dst).toDateString());
                } else if (src !== null && dst === null) {
                    this.$set(variables, key, null);
                } else if (src !== null && dst !== null) {
                    const src_dt = new Date(src).toDateString();
                    const dst_dt = new Date(dst).toDateString();

                    if (src_dt !== dst_dt) {
                        this.$set(variables, key, dst_dt);
                    }
                }
            } else if (this.dbAsset[key] !== this.asset[key]) {
                this.$set(variables, key, value);
            }
        }

        this.$nuxt.$loading.start();

        this.$apollo
            .mutate({
                mutation: gql`
                    mutation UpdateAsset(
                        $ID: ID!
                        $OP_ID_M: Int
                        $OP_ID_S: Int
                        $INSTALL_DATE: Date
                        $MA_USER_ID: Int
                        $MA_START_DATE: Date
                        $MA_END_DATE: Date
                        $INSPECT_INFO: String
                    ) {
                        UpdateAsset(
                            ID: $ID
                            OP_ID_M: $OP_ID_M
                            OP_ID_S: $OP_ID_S
                            INSTALL_DATE: $INSTALL_DATE
                            MA_USER_ID: $MA_USER_ID
                            MA_START_DATE: $MA_START_DATE
                            MA_END_DATE: $MA_END_DATE
                            INSPECT_INFO: $INSPECT_INFO
                        )
                    }
                `,
                variables
            })
            .then(() => {
                this.refreshAsset();

                this.$toast.add({
                    severity: 'info',
                    summary: '자산 변경 완료',
                    detail: `${
                        this.dbAsset ? this.dbAsset.NAME : ''
                    } 자산 관리정보 변경`,
                    life: 2000
                });
            })
            .catch((error) => {
                console.error(error);

                this.$toast.add({
                    severity: 'error',
                    summary: '자산 관리정보 적용 실패',
                    detail: error.message,
                    life: 2000
                });
            })
            .finally(() => {
                this.$nuxt.$loading.finish();
            });
    }

    getOperator(op_id: number) {
        let operator;
        let company;

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

    showTreePanel(event: Event, mode: string) {
        this.treeExpandedKey = {};
        this.overlayPanelMode = mode;

        this.$refs.treeOperator.toggle(event);
    }

    onDateSelectMAStart(date: Date) {
        if (this.asset.MA_END_DATE) {
            const start_dt = date.getTime();
            const end_dt = this.asset.MA_END_DATE.getTime();

            if (start_dt >= end_dt) {
                this.invalidMessage.MA_START_DATE =
                    '유지보수 시작일이 종료일 이후로 설정되었습니다.';
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
        if (this.asset.MA_START_DATE) {
            const start_dt = this.asset.MA_START_DATE.getTime();
            const end_dt = date.getTime();

            if (start_dt >= end_dt) {
                this.invalidMessage.MA_END_DATE =
                    '유지보수 종료일이 시작일 이전으로 설정되었습니다.';
            } else {
                this.resetInvalidMessageMADate();
            }
        } else {
            this.resetInvalidMessageMADate();
        }
    }

    onDateClearMAEnd() {
        this.resetInvalidMessageMADate();
    }

    onSelectOverlayTreePanel(select_node: any) {
        switch (this.overlayPanelMode) {
            case 'CP': {
                this.asset.OP_ID_M = Number(select_node.ID);
                break;
            }
            case 'PC': {
                this.asset.OP_ID_S = Number(select_node.ID);
                break;
            }
            case 'M': {
                this.asset.MA_USER_ID = Number(select_node.ID);
                break;
            }
        }

        this.$refs.treeOperator.hide();
        this.overlayPanelMode = '';
    }

    changeAssetData(_asset: Asset): boolean {
        let is_changed = false;

        for (const [key, value] of Object.entries(_asset)) {
            if (
                ['INSTALL_DATE', 'MA_START_DATE', 'MA_END_DATE'].includes(
                    key
                ) &&
                this.dbAsset[key] !== null
            ) {
                const db_val = new Date(
                    this.dbAsset[key] as string
                ).toDateString();
                const val = new Date(value as string).toDateString();

                if (db_val !== val) is_changed = true;
            } else if (this.dbAsset[key] !== value) {
                is_changed = true;
            }

            if (is_changed) {
                break;
            }
        }

        return is_changed;
    }

    validateInspectInfo(input: InputEvent) {
        const _input = input.toString();
        if (_input.length > 32) {
            this.invalidMessage.INSPECT_INFO =
                '유지보수 점검 내용은 32자 이하로 입력 가능합니다';
        } else {
            this.invalidMessage.INSPECT_INFO = undefined;
        }
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

    get opManagerLabel(): string {
        return this.operatorLabel(this.asset.OP_ID_M);
    }

    get opManagerSecondLabel(): string {
        return this.operatorLabel(this.asset.OP_ID_S);
    }

    get opMAUserLabel(): string {
        return this.operatorLabel(this.asset.MA_USER_ID);
    }

    get opManagerContactLabel(): string {
        return this.operatorContactLabel(this.asset.OP_ID_M);
    }

    get opManagerSecondContactLabel(): string {
        return this.operatorContactLabel(this.asset.OP_ID_S);
    }

    get opMAUserContactLabel(): string {
        return this.operatorContactLabel(this.asset.MA_USER_ID);
    }

    get opMAUserEmailLabel(): string {
        return this.operatorEmailLabel(this.asset.MA_USER_ID);
    }

    get overlayTreeToRender(): Array<any> {
        const data: Array<any> = [];

        if (this.customerCompanies) {
            this.customerCompanies.forEach((company: Comany) => {
                if (
                    company.children.length > 0 &&
                    this.overlayPanelMode.includes(company.type)
                ) {
                    this.$set(company, 'selectable', false);

                    data.push(company);

                    this.$set(this.treeExpandedKey, company.key, true);
                }
            });
        }

        return data;
    }
}
</script>

<style lang="scss" scoped>
#i-asset-panel-manager::v-deep {
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
