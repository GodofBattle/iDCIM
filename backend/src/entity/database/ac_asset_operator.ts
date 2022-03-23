import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_asset_operator {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '업체아이디(AC_COMPANY.id)' })
    COMPANY_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 16, nullable: false, comment: '이름' })
    NAME: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 16, nullable: true, default: null, comment: '부서' })
    DEPT: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 8, nullable: true, default: null, comment: '내선번호' })
    EXP_NO: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 16, nullable: true, default: null, comment: '휴대폰번호(SMS발송)' })
    MOBILE: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true, default: null, comment: '이메일' })
    EMAIL: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 3, nullable: false, default: 'YY', comment: '알림허용채널(MOBILE|EMAIL)' })
    NOTI_CHANNEL: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 1, nullable: false, default: '1', comment: '센서상태변경_알람허용레벨(1,2,3)' })
    NOTI_SENSOR_ALARM_LEVEL: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 1, nullable: false, default: '1', comment: '통신상태변경_알람허용여부(0,1)' })
    NOTI_ASSET_ALARM_ENABLE: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 24, nullable: false, default: 'YYYYYYYYYYYYYYYYYYYYYYYY', comment: '알람허용시간(월)' })
    NOTI_HOUR_MON: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 24, nullable: false, default: 'YYYYYYYYYYYYYYYYYYYYYYYY', comment: '알람허용시간(화)' })
    NOTI_HOUR_TUE: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 24, nullable: false, default: 'YYYYYYYYYYYYYYYYYYYYYYYY', comment: '알람허용시간(수)' })
    NOTI_HOUR_WED: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 24, nullable: false, default: 'YYYYYYYYYYYYYYYYYYYYYYYY', comment: '알람허용시간(목)' })
    NOTI_HOUR_THU: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 24, nullable: false, default: 'YYYYYYYYYYYYYYYYYYYYYYYY', comment: '알람허용시간(금)' })
    NOTI_HOUR_FRI: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 24, nullable: false, default: 'YYYYYYYYYYYYYYYYYYYYYYYY', comment: '알람허용시간(토)' })
    NOTI_HOUR_SAT: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 24, nullable: false, default: 'YYYYYYYYYYYYYYYYYYYYYYYY', comment: '알람허용시간(일)' })
    NOTI_HOUR_SUN: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '변경사용자아이디' })
    UPDATE_USER_ID?: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, default: null, comment: '변경일시' })
    UPDATE_USER_DT?: Date;

    @Field(() => String, { nullable: true })
    @Column({ length: 256, type: 'varchar', nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}