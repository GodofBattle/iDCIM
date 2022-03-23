import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_company {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'char', length: 1, nullable: false, comment: '분류(C:고객사, O:유지보수사)' })
    TYPE: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: false, comment: '회사명' })
    NAME: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 100, nullable: true, default: null, comment: '주소' })
    ADDR: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 16, nullable: true, default: null, comment: '전화번호' })
    PHONE: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 16, nullable: true, default: null, comment: '팩스번호' })
    FAX: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true, default: null, comment: '이메일' })
    EMAIL: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 80, nullable: true, default: null, comment: '홈페이지주소' })
    URL: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '변경 사용자아이디' })
    UPDATE_USER_ID?: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, default: null, comment: '변경일시' })
    UPDATE_USER_DT?: Date;

    @Field(() => String, { nullable: true })
    @Column({ length: 256, type: 'varchar', nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}