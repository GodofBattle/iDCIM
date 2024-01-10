import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Notification {
    @Field(() => String, { nullable: true })
    command: string;
    
    @Field(() => String, { nullable: true })
    type: string;
    
    @Field(() => String, { nullable: true })
    occur_date: string;
    
    @Field(() => Int, { nullable: true })
    asset_id: number;
    
    @Field(() => String, { nullable: true })
    asset_name: string;
    
    @Field(() => Int, { nullable: true })
    prev_status: number;
    
    @Field(() => Int, { nullable: true })
    curr_status: number;
    
    @Field(() => Int, { nullable: true })
    alarm_id: number;
    
    @Field(() => String, { nullable: true })
    alarm_msg: string;

    @Field(() => Int, { nullable: true })
    sensor_id?: number;
    
    @Field(() => String, { nullable: true })
    sensor_name?: string;

    @Field(() => Int, { nullable: true })
    prev_level?: number;

    @Field(() => String, { nullable: true })
    prev_level_s?: string;

    @Field(() => Int, { nullable: true })
    curr_level?: number;

    @Field(() => String, { nullable: true })
    curr_level_s?: string;
}