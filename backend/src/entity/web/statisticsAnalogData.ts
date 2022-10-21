import { Field, Float, Int, ObjectType } from "type-graphql";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
export class statisticsAnalogData {
    @Field(() => Int, { nullable: true })
    ASSET_ID: number;

    @Field(() => String, { nullable: true })
    ASSET_NAME: string;

    @Field(() => Int, { nullable: true })
    SENSOR_ID: number;

    @Field(() => String, { nullable: true })
    SENSOR_NAME: string;

    @Field(() => Float, { nullable: true })
    MIN_VALUE: number;

    @Field(() => Float, { nullable: true })
    AVR_VALUE: number;

    @Field(() => Float, { nullable: true })
    MAX_VALUE: number;

    @Field(() => nullableDate, { nullable: true })
    START_DATE: Date;

    @Field(() => nullableDate, { nullable: true })
    END_DATE: Date;
}