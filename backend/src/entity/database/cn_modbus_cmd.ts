import { ArgsType, Field, ID, InputType, Int, ObjectType } from "type-graphql";
import { AfterLoad, Column, Entity, getRepository, PrimaryGeneratedColumn } from "typeorm";

import { nullableDate } from "../../scalar/nullableDate";
import { pd_code } from "./pd_code";

@ObjectType()
@Entity({ synchronize: false })
export class cn_modbus_cmd {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ unique: true, type: 'int', nullable: false, comment: '자산 인터페이스 아이디(cn_interface.ID)' })
    INTF_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ unique: true, type: 'int', nullable: false, default: 0, comment: '모드버스 커멘드 아이디' })
    MC_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '요청 FUNC 번호' })
    FUNC_NO: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '요청 시작주소' })
    START_ADDR: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '요청 정보수' })
    POINT_CNT: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 8, nullable: false, comment: '데이터 타입(pd_code.CODE (TYPE="DTYPE"))' })
    DTYPE_CD: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, default: null, comment: '변경 사용자 아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;

    @AfterLoad()
    @Field(() => String, { nullable: true })
    async DTYPE_NAME?() {
        const code: pd_code = await getRepository(pd_code).findOne({ CODE: this.DTYPE_CD });
        return code.NAME;
    }
}

@ArgsType()
export class cn_modbus_cmd_args {
    @Field(() => Int, { nullable: true })
    FUNC_NO: number;

    @Field(() => Int, { nullable: true })
    START_ADDR: number;

    @Field(() => Int, { nullable: true })
    POINT_CNT: number;

    @Field(() => String, { nullable: true })
    DTYPE_CD: string;
}

@InputType('ModbusCommandInput')
export class cn_modbus_cmd_input {
    @Field(() => Int, { nullable: true })
    INTF_ID: number;

    @Field(() => Int, { nullable: true })
    MC_ID: number;

    @Field(() => Int, { nullable: true })
    FUNC_NO: number;

    @Field(() => Int, { nullable: true })
    START_ADDR: number;

    @Field(() => Int, { nullable: true })
    POINT_CNT: number;

    @Field(() => String, { nullable: true })
    DTYPE_CD: string;
}