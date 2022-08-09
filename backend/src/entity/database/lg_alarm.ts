import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class lg_alarm {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디(일련번호)' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, unique: true, comment: '자산아이디' })
    ASSET_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '센서아이디' })
    SENSOR_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, comment: '구분(발생/복구)' })
    FLAG: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, default: 'current_timestamp()', comment: '발생일시' })
    OCCUR_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 8, nullable: false, comment: '발생알람코드' })
    OCCUR_CD: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '발생알람레벨' })
    OCCUR_LEVEL: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, comment: '발생알람상태' })
    OCCUR_STATUS: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '발생알람메시지' })
    OCCUR_MSG: string;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, default: null, comment: '복구일시' })
    RECOVER_DT: Date;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '복구알람레벨' })
    RECOVER_LEVEL: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '복구알람상태' })
    RECOVER_STATUS: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '복구알람메시지' })
    RECOVER_MSG: string;

    @Field(() => String, { nullable: true })
    SENSOR_NAME: string;

    @Field(() => String, { nullable: true })
    ALARM_PERIOD: string;
}