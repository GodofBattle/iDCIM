import { ObjectType, Field, Int } from "type-graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";

@ObjectType()
@Entity({ synchronize: false })
export class pd_code {
    @Field(() => String)
    @PrimaryColumn({ type: 'varchar', length: 8, nullable: false, default: '', comment: '분류' })
    TYPE: string;

    @Field(() => String)
    @PrimaryColumn({ type: 'varchar', length: 8, nullable: false, default: '', comment: '코드' })
    CODE: string;

    @Field(() => String!, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: '', comment: '이름' })
    NAME: string | null;

    @Field(() => Int!, { nullable: true })
    @Column({ type: 'int', nullable: true, default: 0, comment: '값' })
    VALUE: number | null;

    @Field(() => String!, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: '', comment: '설명' })
    REMARK: string | null;
}