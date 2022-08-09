import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class LogAlarmCountType {
    @Field(() => String)
    DT: string;

    @Field(() => Int)
    ALARM_COUNT: number;
}