import { Field, ObjectType, ID, Int } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_cust_hier {
    @Field(() => ID)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String)
    @Column({ type: 'char', length: 1, nullable: false, comment: '분류(P: 장소, C: 고객정의)' })
    TYPE: string;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, comment: '트리아이디' })
    TID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '이름' })
    NAME: string | null;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, comment: '상위 트리아이디' })
    P_TID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '표시순서번호(동일그룹내 표시순서)' })
    ORDER: number | null;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '변경사용자 아이디' })
    UPDATE_USER_ID: number | null;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, default: null, comment: '변경일시' })
    UPDATE_USER_DT: Date | null;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK: string | null;
}