import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class cn_ctrl_cmd {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '자산 인터페이스 아이디(cn_interface.ID)' })
    INTF_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: false, comment: '제어명' })
    NAME: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 200, nullable: true, default: null, comment: '제어패킷정보' })
    CTRL_PKT_INFO?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: 0, comment: '사용여부' })
    IS_USE?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '변경 사용자 아이디' })
    UPDATE_USER_ID?: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, comment: '변경일시' })
    UPDATE_USER_DT?: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}