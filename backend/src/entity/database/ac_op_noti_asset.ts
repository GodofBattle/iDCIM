import { Field, ID, InputType, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_op_noti_asset {
    @Field(() => ID)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID?: number;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, unique: true, comment: '담당자 아이디 (ac_asset_operator.ID)' })
    OP_ID: number;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, comment: '자산아이디 (ac_asset.ID)' })
    ASSET_ID: number;

    @Field(() => Int)
    @Column({ type: 'tinyint', nullable: false, default: 1, comment: '통신오류알림여부' })
    IS_NOTI_COMM: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경사용자아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}

@InputType()
export class ac_op_noti_asset_input {
    @Field(() => Int, { nullable: false })
    OP_ID: number;

    @Field(() => Int, { nullable: false })
    ASSET_ID: number;

    @Field(() => Int, { nullable: true })
    IS_NOTI_COMM: number;
}