import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_user_group_asset {
    @Field(() => Int, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', unique: true, nullable: false, comment: '운영그룹아이디(ac_user_group.ID)' })
    USER_GROUP_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '자산 아이디(ac_asset.ID)' })
    ASSET_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경 사용자 아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', nullable: true, default: null, comment: '설명' })
    REMARK: string;
}

@InputType()
export class ac_user_group_asset_input {
    @Field(() => Int, { nullable: false })
    USER_GROUP_ID: number;

    @Field(() => Int, { nullable: false })
    ASSET_ID: number;
}