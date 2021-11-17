import { Field, ObjectType, Int } from "type-graphql";

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
    HOLD_TIME: number;

    @Field(() => [DigitalValue], { nullable: true })
    DI: DigitalValue[];
}