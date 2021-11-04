<template>
    <Card id="predefineSensorCard">
        <template #header>
            <div class="p-d-flex">
                <div class="p-as-center p-pl-2 i-header-title">
                    NODE ID: {{ nodeId }}
                </div>
                <div class="p-ml-auto">
                    <Button
                        class="p-button-rounded p-button-text p-button-help"
                        icon="pi pi-copy"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text p-buttom-success"
                        icon="pi pi-save"
                    ></Button>
                    <Button
                        class="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-minus"
                    ></Button>
                </div>
            </div>
            <Divider class="p-my-1" />
        </template>
        <template #content>
            <div class="p-fluid p-formgrid p-grid p-input-filled">
                <div class="p-field p-col-1 p-mb-0">
                    <label for="p-sensor-name">NAME</label>
                    <InputText
                        id="p-sensor-name"
                        v-model="sensorData.NAME"
                        type="text"
                        aria-describedby="p-sensor-name-help"
                        autocomplete="off"
                    >
                    </InputText>
                </div>
                <div class="p-field p-col-1 p-mb-0">
                    <label for="adjust-value">표현식</label>
                    <InputText
                        id="adjust-value"
                        v-model="sensorData.ADJUST_VALUE"
                        type="text"
                        aria-describedby="adjust-value-help"
                        autocomplete="off"
                    >
                    </InputText>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="data-address">ADDRESS</label>
                    <InputText
                        id="data-address"
                        v-model="sensorData.DATA_ADDRESS"
                        type="text"
                        aria-describedby="data-address-help"
                        autocomplete="off"
                    >
                    </InputText>
                </div>
                <div v-if="hasComm" class="p-field p-col-2 p-mb-0">
                    <label for="mc-id">MODBUS ID</label>
                    <Dropdown
                        id="mc-id"
                        v-model="sensorData.MC_ID"
                        :options="modbusCommandList"
                        :option-label="modbusCommandLabel"
                        option-value="MC_ID"
                        data-key="MC_ID"
                        placeholder="MODBUS CMD"
                        empty-filter-message="MODBUS 명령어가 존재하지 않습니다"
                        append-to="body"
                    >
                    </Dropdown>
                </div>
                <div class="p-field p-col-1 p-mb-0">
                    <label for="sensor-cd">TYPE</label>
                    <Dropdown
                        id="sensor-cd"
                        v-model="sensorData.SENSOR_CD"
                        :options="sensorCodeList"
                        option-label="NAME"
                        option-value="CODE"
                        data-key="CODE"
                        placeholder="Sensor Type"
                        empty-filter-message="센서 타입이 존재하지 않습니다"
                        append-to="body"
                        @input="inputSensorType"
                    >
                    </Dropdown>
                </div>
                <div v-if="isDispConv" class="p-field p-col-1 p-mb-0">
                    <label for="disp-power">단위</label>
                    <Dropdown
                        id="disp-power"
                        v-model="sensorData.DISP_POWER"
                        :options="displayPowerList"
                        option-label="NAME"
                        option-value="VALUE"
                        data-key="CODE"
                        placeholder="단위"
                        empty-filter-message="선택 가능한 단위가 존재하지 않습니다"
                        append-to="body"
                    >
                    </Dropdown>
                </div>
                <div class="p-field p-col-2 p-mb-0">
                    <label for="threshold">임계치 지정</label>
                    <Dropdown
                        v-if="isAnalogValue"
                        id="threshold"
                        v-model="sensorData.PD_THRESHOLD_ID"
                        :options="pdThresholdAIList"
                        option-label="NAME"
                        option-value="ID"
                        data-key="ID"
                        placeholder="임계치"
                        empty-filter-message="선택 가능한 임계치가 존재하지 않습니다"
                        append-to="body"
                    >
                    </Dropdown>
                    <Dropdown
                        v-if="!isAnalogValue"
                        id="threshold"
                        v-model="sensorData.PD_THRESHOLD_ID"
                        :options="pdThresholdDIList"
                        option-label="NAME"
                        option-value="ID"
                        data-key="ID"
                        placeholder="임계치"
                        empty-filter-message="선택 가능한 임계치가 존재하지 않습니다"
                        append-to="body"
                    >
                    </Dropdown>
                </div>
            </div>
            <Panel
                :header="thresholdLabel"
                :toggleable="true"
                class="p-mt-2"
                :collapsed="true"
            >
                <div v-if="sliderValue">
                    <h4>{{ sliderValue }}</h4>
                    <Slider
                        v-model="sliderValue"
                        :range="true"
                        :min="-100"
                        :max="200"
                    />
                </div>
            </Panel>
        </template>
    </Card>
</template>

<script lang="ts">
import Vue from 'vue';
import gql from 'graphql-tag';
import Component from '@/plugins/nuxt-class-component';

interface SensorCode {
    CODE: string;
    NAME: string;
    TYPE: string;
    UNIT: string;
    IS_DISP_CONV: number;
}

type Sensor = {
    [index: string]: undefined | string | number | SensorCode;
    NAME: string;
    ADJUST_VALUE: string;
    DATA_ADDRESS: string;
    MC_ID: number;
    SENSOR_CD: string;
    DISP_POWER: number;
    PD_THRESHOLD_ID: number;
    IS_NOTI: number;
    IS_MKSTATS: number;
    SENSOR_CODE: SensorCode | undefined;
};

@Component<PredefineSensorCard>({
    props: {
        interfaceId: Number,
        sensorId: Number,
        nodeId: Number,
        hasComm: Boolean
    },
    apollo: {
        initSensorData: {
            query: gql`
                query PredefineSensor($ID: Int!) {
                    PredefineSensor(ID: $ID) {
                        NAME
                        ADJUST_VALUE
                        DATA_ADDRESS
                        MC_ID
                        SENSOR_CD
                        DISP_POWER
                        PD_THRESHOLD_ID
                        IS_NOTI
                        IS_MKSTATS
                        SENSOR_CODE {
                            CODE
                            NAME
                            TYPE
                            UNIT
                            IS_DISP_CONV
                        }
                    }
                }
            `,
            variables() {
                return {
                    ID: this.sensorId ? this.sensorId : -1
                };
            },
            prefetch: false,
            fetchPolicy: 'cache-and-network',
            update: ({ PredefineSensor }) => PredefineSensor,
            result({ loading, data }) {
                if (!loading) {
                    const { PredefineSensor } = data;

                    if (PredefineSensor) {
                        this.apolloFetch(PredefineSensor);
                    }
                }
            }
        },
        sensorCodeList: {
            query: gql`
                query {
                    SensorCodes {
                        CODE
                        NAME
                        TYPE
                        UNIT
                        IS_DISP_CONV
                        REMARK
                    }
                }
            `,
            update: ({ SensorCodes }) => SensorCodes
        },
        displayPowerList: {
            query: gql`
                query {
                    Codes(TYPE: "POWER") {
                        CODE
                        NAME
                        VALUE
                    }
                }
            `,
            update: ({ Codes }) => Codes
        },
        modbusCommandList: {
            query: gql`
                query PredefineModbusCommands($PD_INTF_ID: Int!) {
                    PredefineModbusCommands(PD_INTF_ID: $PD_INTF_ID) {
                        PD_INTF_ID
                        MC_ID
                        FUNC_NO
                        START_ADDR
                        POINT_CNT
                        DTYPE_CD
                        DTYPE_NAME
                    }
                }
            `,
            variables(): any {
                return {
                    PD_INTF_ID: this.interfaceId ? this.interfaceId : -1
                };
            },
            update: ({ PredefineModbusCommands }) => PredefineModbusCommands
        },
        pdThresholdAIList: {
            query: gql`
                query PredefineThresholdsByAI($SENSOR_CD: String!) {
                    PredefineThresholdsByAI(SENSOR_CD: $SENSOR_CD) {
                        ID
                        NAME
                        SENSOR_CD
                        HOLD_TIME
                    }
                }
            `,
            prefetch: false,
            variables(): any {
                return {
                    SENSOR_CD: this.sensorData.SENSOR_CD
                        ? this.sensorData.SENSOR_CD
                        : ''
                };
            },
            update: ({ PredefineThresholdsByAI }) => PredefineThresholdsByAI
        },
        pdThresholdDIList: {
            query: gql`
                query PredefineThresholdsByDI($SENSOR_CD: String!) {
                    PredefineThresholdsByDI(SENSOR_CD: $SENSOR_CD) {
                        ID
                        NAME
                        SENSOR_CD
                        HOLD_TIME
                    }
                }
            `,
            prefetch: false,
            variables(): any {
                return {
                    SENSOR_CD: this.sensorData.SENSOR_CD
                        ? this.sensorData.SENSOR_CD
                        : ''
                };
            },
            update: ({ PredefineThresholdsByDI }) => PredefineThresholdsByDI
        }
    }
})
export default class PredefineSensorCard extends Vue {
    sliderValue = [20, 80, 100];

    modbusCommandList = [];
    sensorCodeList = [];
    displayPowerList: Array<any> = [];
    pdThresholdAIList = [];
    pdThresholdDIList = [];

    initSensorData: Sensor = {
        NAME: '',
        ADJUST_VALUE: '',
        DATA_ADDRESS: '',
        MC_ID: 0,
        SENSOR_CD: '',
        DISP_POWER: 0,
        PD_THRESHOLD_ID: 0,
        IS_NOTI: 0,
        IS_MKSTATS: 0,
        SENSOR_CODE: undefined
    };

    sensorData: Sensor = {
        NAME: '',
        ADJUST_VALUE: '',
        DATA_ADDRESS: '',
        MC_ID: 0,
        SENSOR_CD: '',
        DISP_POWER: 0,
        PD_THRESHOLD_ID: 0,
        IS_NOTI: 0,
        IS_MKSTATS: 0,
        SENSOR_CODE: undefined
    };

    apolloFetch(data: Sensor) {
        Object.assign(this.sensorData, data);
    }

    modbusCommandLabel(item: any) {
        return `[ID: ${item.MC_ID}] ${item.FUNC_NO.toString().padStart(
            2,
            '0'
        )} | ${item.START_ADDR.toString().padStart(
            2,
            '0'
        )} | ${item.POINT_CNT.toString().padStart(2, '0')} | ${
            item.DTYPE_NAME
        }`;
    }

    get isDispConv(): boolean {
        // by shkoh 20211102: 선택한 임계치 설정에서 센서타입이 단위표기가 가능한지 여부를 판가름
        return !!this.sensorData.SENSOR_CODE?.IS_DISP_CONV;
    }

    get isAnalogValue(): boolean {
        // by shkoh 20211102: 선택한 임계치 설정에서 센서타입이 아날로그 값인지, 디지털 값인지 구분
        return this.sensorData.SENSOR_CODE?.TYPE === 'A';
    }

    get thresholdLabel(): string {
        let label = '임계치 보기';

        if (this.isAnalogValue && this.sensorData.SENSOR_CODE?.UNIT) {
            const power: any = this.isDispConv
                ? this.displayPowerList
                      .filter(
                          (l: any) => l.VALUE === this.sensorData.DISP_POWER
                      )
                      .pop().NAME
                : ``;

            label += `(${power}${this.sensorData.SENSOR_CODE.UNIT})`;
        }

        return label;
    }

    inputSensorType(value: string) {
        this.$apollo
            .query({
                query: gql`
                query {
                    SensorCode(CODE: "${value}") {
                        CODE
                        NAME
                        TYPE
                        UNIT
                        IS_DISP_CONV
                    }
                }
            `
            })
            .then(({ data: { SensorCode } }: any) => {
                if (SensorCode) {
                    this.$set(this.sensorData, 'SENSOR_CODE', SensorCode);
                    this.$set(this.sensorData, 'PD_THRESHOLD_ID', 0);
                }
            })
            .catch((error) => {
                console.info(error);
            });
    }
}
</script>

<style lang="scss" scoped>
#predefineSensorCard::v-deep {
    border: 1px solid var(--surface-d);

    .i-header-title {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .p-card-header {
        padding: 0.5rem 1rem 0 1rem;
    }

    .p-card-content {
        padding: 0;
    }
}

#predefineSensorCard.i-editable {
    border-left: 10px solid;
    border-color: var(--yellow-500);
}
</style>
