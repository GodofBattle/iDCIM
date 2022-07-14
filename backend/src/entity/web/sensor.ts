import { Field, InputType, Int } from "type-graphql";
import { cn_sensor_input } from "../database/cn_sensor";
import { cn_sensor_threshold_ai_input } from "../database/cn_sensor_threshold_ai";
import { cn_sensor_threshold_di_input } from "./diThreshold";

@InputType()
export class sensorInput {
    @Field(() => Int)
    ID: number;
    
    @Field(() => cn_sensor_input, { nullable: true })
    SENSOR: cn_sensor_input;

    @Field(() => cn_sensor_threshold_ai_input, { nullable: true })
    THRESHOLD_AI: cn_sensor_threshold_ai_input;

    @Field(() => cn_sensor_threshold_di_input, { nullable: true })
    THRESHOLD_DI: cn_sensor_threshold_di_input;
}