import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_asset_image {
    @Field(() => Int, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '자산아이디(ac_asset.ID)' })
    ASSET_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true, default: null, comment: '이미지이름' })
    NAME?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '이미지파일 아이디(ac_file.ID)' })
    IMAGE_FILE_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경사용자 아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}