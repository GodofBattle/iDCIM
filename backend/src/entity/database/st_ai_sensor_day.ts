import { Field, Float, Int, ObjectType } from "type-graphql";
import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class st_ai_sensor_day {
    @Field(() => Int, { nullable: true })
    @PrimaryColumn({ type: 'int', nullable: false, unique: true, comment: '자산 ID' })
    ASSET_ID: number;
    
    @Field(() => Int, { nullable: true })
    @PrimaryColumn({ type: 'int', nullable: false, unique: true, comment: '센서 ID' })
    SENSOR_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '요청수' })
    REQ: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '성공수' })
    SUCC: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '실패수' })
    FAIL: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: true, default: null, comment: '최소값' })
    MIN_VALUE: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: true, default: null, comment: '평균값' })
    AVR_VALUE: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: true, default: null, comment: '최대값' })
    MAX_VALUE: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '집계대상수' })
    STAT_CNT: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, default: null, comment: '통계범위시작일시' })
    START_DT: Date;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, default: null, comment: '통계범위종료일시' })
    END_DT: Date;

    @Field(() => nullableDate, { nullable: true })
    @PrimaryColumn({ type: 'datetime', nullable: false, unique: true, comment: '통계기준일시(통계범위시작일시-통계범위종료일시)' })
    STAT_DT: Date;
    
    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'char', length: 3, nullable: true, default: null, comment: '통계기준요일' })
    STAT_WEEK: string;
}