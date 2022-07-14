import { Field, ObjectType, Int, ArgsType, InputType } from "type-graphql";

@ObjectType()
export class DigitalValue {
    @Field(() => Int!)
    INDEX: number;

    @Field(() => Int!)
    LEVEL: number;

    @Field(() => String!)
    LABEL: string;

    constructor({ INDEX, LEVEL, LABEL }) {
        this.INDEX = INDEX;
        this.LEVEL = LEVEL;
        this.LABEL = LABEL;
    }
}

@ObjectType()
export class DIThreshold {
    @Field(() => Int)
    ID: number;

    @Field(() => Int)
    SENSOR_ID: number;

    @Field(() => Int)
    HOLD_TIME: number;

    @Field(() => [DigitalValue], { nullable: true })
    DI: DigitalValue[];
}

@InputType('DigitalValueInput')
export class DigitalValueInput {
    @Field(() => Int!)
    INDEX: number;

    @Field(() => Int!)
    LEVEL: number;

    @Field(() => String!)
    LABEL: string;
}

@InputType('PredefineThresholdDIInput')
export class PredefineThresholdDIInput {
    @Field(() => Int)
    ID: number;

    @Field(() => String, { nullable: true })
    NAME: string;

    @Field(() => Int, { nullable: true })
    HOLD_TIME: number;

    @Field(() => [DigitalValueInput], { nullable: true })
    DI: DigitalValueInput[];
}

@InputType()
export class cn_sensor_threshold_di_input {
    @Field(() => Int, { nullable: true })
    HOLD_TIME: number;

    @Field(() => [DigitalValueInput], { nullable: true })
    DI: DigitalValueInput[];
}