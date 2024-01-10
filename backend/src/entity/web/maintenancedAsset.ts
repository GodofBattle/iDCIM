import { Field, Int, ObjectType } from 'type-graphql';
import { nullableDate } from '../../scalar/nullableDate';

@ObjectType()
export class MaintenancedAsset {
    @Field(() => Int)
    ASSET_ID: number;

    @Field(() => String)
    ASSET_NAME: string;

    @Field(() => String)
    ASSET_TYPE: string;

    @Field(() => Int)
    MA_USER_ID: number;

    @Field(() => nullableDate)
    MA_START_DATE: Date;

    @Field(() => nullableDate)
    MA_END_DATE: Date;

    @Field(() => Int)
    DAY_DIFF: number;

    @Field(() => Int)
    WEEK_DIFF: number;

    @Field(() => Int)
    MONTH_DIFF: number;

    @Field(() => Int)
    YEAR_DIFF: number;

    @Field(() => String, { nullable: true })
    MA_NAME: string;

    @Field(() => String, { nullable: true })
    MA_DEPT: string;

    @Field(() => String, { nullable: true })
    MA_PHONE: string;

    @Field(() => String, { nullable: true })
    MA_MOBILE: string;

    @Field(() => String)
    MA_EMAIL: string;

    @Field(() => String, { nullable: true })
    COMPANY_NAME: string;
}
