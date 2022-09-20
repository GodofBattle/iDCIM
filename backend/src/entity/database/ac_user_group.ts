import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_user_group {
    @Field(() => Int)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String, { nullable: false })
    @Column({ type: 'varchar', length: 64, nullable: false, comment: '운영그룹명' })
    NAME: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경사용자 아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, default: null, comment: '설명' })
    REMARK: string;
}