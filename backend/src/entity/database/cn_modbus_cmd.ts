import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { nullableDate } from "../../scalar/nullableDate";

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
}