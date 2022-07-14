import { Field, ID, InputType, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class cn_sensor_threshold_di {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, unique: true, comment: '연동센서 아이디(cn_sensor.ID)' })
    SENSOR_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, default: 0, comment: '지속시간(초)' })
    HOLD_TIME: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '0 값 Level' })
    VALUE_0_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '0 값 Label' })
    VALUE_0_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '1 값 Level' })
    VALUE_1_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '1 값 Label' })
    VALUE_1_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '2 값 Level' })
    VALUE_2_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '2 값 Label' })
    VALUE_2_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '3 값 Level' })
    VALUE_3_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '3 값 Label' })
    VALUE_3_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '4 값 Level' })
    VALUE_4_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '4 값 Label' })
    VALUE_4_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '5 값 Level' })
    VALUE_5_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '5 값 Label' })
    VALUE_5_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '6 값 Level' })
    VALUE_6_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '6 값 Label' })
    VALUE_6_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '7 값 Level' })
    VALUE_7_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '7 값 Label' })
    VALUE_7_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '8 값 Level' })
    VALUE_8_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '8 값 Label' })
    VALUE_8_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '9 값 Level' })
    VALUE_9_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '9 값 Label' })
    VALUE_9_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '10 값 Level' })
    VALUE_10_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '10 값 Label' })
    VALUE_10_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '11 값 Level' })
    VALUE_11_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '11 값 Label' })
    VALUE_11_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '12 값 Level' })
    VALUE_12_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '12 값 Label' })
    VALUE_12_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '13 값 Level' })
    VALUE_13_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '13 값 Label' })
    VALUE_13_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '14 값 Level' })
    VALUE_14_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '14 값 Label' })
    VALUE_14_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '15 값 Level' })
    VALUE_15_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '15 값 Label' })
    VALUE_15_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '16 값 Level' })
    VALUE_16_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '16 값 Label' })
    VALUE_16_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '17 값 Level' })
    VALUE_17_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '17 값 Label' })
    VALUE_17_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '18 값 Level' })
    VALUE_18_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '18 값 Label' })
    VALUE_18_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '19 값 Level' })
    VALUE_19_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '19 값 Label' })
    VALUE_19_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '20 값 Level' })
    VALUE_20_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '20 값 Label' })
    VALUE_20_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '21 값 Level' })
    VALUE_21_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '21 값 Label' })
    VALUE_21_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '22 값 Level' })
    VALUE_22_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '22 값 Label' })
    VALUE_22_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '23 값 Level' })
    VALUE_23_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '23 값 Label' })
    VALUE_23_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '24 값 Level' })
    VALUE_24_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '24 값 Label' })
    VALUE_24_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '25 값 Level' })
    VALUE_25_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '25 값 Label' })
    VALUE_25_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '26 값 Level' })
    VALUE_26_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '26 값 Label' })
    VALUE_26_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '27 값 Level' })
    VALUE_27_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '27 값 Label' })
    VALUE_27_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '28 값 Level' })
    VALUE_28_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '28 값 Label' })
    VALUE_28_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '29 값 Level' })
    VALUE_29_LEVEL?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '29 값 Label' })
    VALUE_29_LABEL?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경 사용자 아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}