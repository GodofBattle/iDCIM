import { ArgsType, Field, Float, ID, InputType, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class cn_sensor {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '자산 인터페이스 아이디(cn_interface.ID)' })
    INTF_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: false, comment: '센서명' })
    NAME: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 8, nullable: false, comment: '센서코드(pd_sensor_code.CODE)' })
    SENSOR_CD: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 128, nullable: true, default: null, comment: '연동부가옵션(SNMP: 요청OID, MODBUS: 파싱정보, TCPID: 파싱정보, ODBC: ODBC Key)' })
    DATA_ADDRESS: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '노드 아이디' })
    NODE_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true, default: 'VAL', comment: '값 조정수식' })
    ADJUST_VALUE: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '모드버스 커멘드아이디(cn_modbus_cmd.MC_ID)' })
    MC_ID: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: false, default: 0.0, comment: '현재 값' })
    CURR_VALUE: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '현재 상태(pd_code.VALUE (TYPE="SECTION")' })
    CURR_STATUS: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', unsigned: true, nullable: false, default: 0, comment: '현재 레벨(pd_code.VALUE (TYPE="LEVEL")' })
    CURR_LEVEL: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '센서통신상태(SNMP)' })
    COMM_STATUS: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '표기환산지수' })
    DISP_POWER: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 128, nullable: true, default: null, comment: '장애발생시 추가 표출 정보 기입' })
    NOTI_ADDMSG: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 1, comment: '사용여부' })
    IS_USE: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '임계치사용여부(1=사용, 0=미사용)' })
    IS_EVENT: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '가상센서여부' })
    IS_VIRTUAL: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '통계생성여부' })
    IS_MKSTATS: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: 'AI센서 1분로그여부' })
    IS_LG_1MIN: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, default: 'current_timestamp()', onUpdate: 'current_timestamp()', comment: '상태값 변경시간' })
    UPDATE_DT: Date;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경 사용자 아이디' })
    UPDATE_USER_ID?: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT?: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}

@ArgsType()
export class cn_sensor_args {
    @Field(() => String, { nullable: true })
    NAME: string;

    @Field(() => String, { nullable: true })
    SENSOR_CD: string;

    @Field(() => String, { nullable: true })
    DATA_ADDRESS: string;

    @Field(() => String, { nullable: true })
    ADJUST_VALUE: string;

    @Field(() => Int, { nullable: true })
    MC_ID: number;

    @Field(() => Int, { nullable: true })
    DISP_POWER: number;

    @Field(() => Int, { nullable: true })
    IS_USE: number;

    @Field(() => Int, { nullable: true })
    IS_EVENT: number;

    @Field(() => Int, { nullable: true })
    IS_MKSTATS: number;
}

@InputType()
export class cn_sensor_input {
    @Field(() => Int, { nullable: true })
    INTF_ID: number;

    @Field(() => String, { nullable: true })
    NAME: string;

    @Field(() => String, { nullable: true })
    SENSOR_CD: string;

    @Field(() => String, { nullable: true })
    DATA_ADDRESS: string;

    @Field(() => Int, { nullable: true })
    NODE_ID: number;

    @Field(() => String, { nullable: true })
    ADJUST_VALUE: string;

    @Field(() => Int, { nullable: true })
    MC_ID: number;

    @Field(() => Int, { nullable: true })
    DISP_POWER: number;

    @Field(() => Int, { nullable: true })
    IS_USE: number;

    @Field(() => Int, { nullable: true })
    IS_EVENT: number;

    @Field(() => Int, { nullable: true })
    IS_MKSTATS: number;
}