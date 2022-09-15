import { ArgsType, Field, ID, InputType, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_asset_work_rec {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '자산아이디' })
    ASSET_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 8, nullable: false, comment: '작업이력코드' })
    WORK_CD: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '작업자아이디' })
    WORK_OP_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: false, default: null, comment: '작업자명(등록되지않은작업자)' })
    WORK_OP_NAME: string;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, default: null, comment: '작업시작일시' })
    WORK_START_DT: Date;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, default: null, comment: '작업종료일시' })
    WORK_END_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true, comment: '제목' })
    TITLE: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 2048, nullable: false, default: null, comment: '내용' })
    TEXT: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경사용자아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: false, default: null, comment: '설명' })
    REMARK: string;
}

@InputType()
export class ac_asset_work_rec_input {
    @Field(() => Int, { nullable: false })
    ASSET_ID: number;

    @Field(() => String, { nullable: false })
    WORK_CD: string;

    @Field(() => Int, { nullable: true })
    WORK_OP_ID: number;

    @Field(() => String, { nullable: true })
    WORK_OP_NAME: string;

    @Field(() => nullableDate, { nullable: true })
    WORK_START_DT: Date;

    @Field(() => nullableDate, { nullable: true })
    WORK_END_DT: Date;

    @Field(() => String, { nullable: false })
    TITLE: string;

    @Field(() => String, { nullable: true })
    TEXT: string;
}

@ArgsType()
export class ac_asset_work_rec_arg {
    @Field(() => String, { nullable: true })
    WORK_CD: string;

    @Field(() => Int, { nullable: true })
    WORK_OP_ID: number;

    @Field(() => String, { nullable: true })
    WORK_OP_NAME: string;

    @Field(() => nullableDate, { nullable: true })
    WORK_START_DT: Date;

    @Field(() => nullableDate, { nullable: true })
    WORK_END_DT: Date;

    @Field(() => String, { nullable: true })
    TITLE: string;

    @Field(() => String, { nullable: true })
    TEXT: string;
}