import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_config {
    @Field(() => ID, { nullable: true })
    @PrimaryColumn({ type: 'int', primary: true, nullable: false, comment: '의미없음' })
    ID: number;

    @Field(() => String, { nullable: true })
    @Column({ length: 32, type: 'varchar', nullable: false, default: '', comment: '고객사이트명' })
    SITE_NAME: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: 'SMS 허용여부' })
    IS_ENABLE_SMS: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: 'EMAIL 허용여부' })
    IS_ENABLE_EMAIL: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '위치트리 허용여부' })
    IS_ENABLE_CUST_HIER_P: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '고객정의트리 허용여부' })
    IS_ENABLE_CUST_HIER_C: number;

    @Field(() => String, { nullable: true })
    @Column({ length: 1, type: 'char', nullable: false, default: 'B', comment: '테마코드(B: Black, W: White)' })
    THEME_TYPE: string;

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