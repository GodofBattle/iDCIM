import { Field, ObjectType, Int } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ synchronize: false })
export class pd_file {
    @Field(() => Int!)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String)
    @Column({ type: 'varchar', length: 128, nullable: false, comment: '파일명' })
    NAME: string;

    @Field(() => String)
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: 'MIME 타입' })
    MIME_TYPE: string;

    @Field(() => String)
    @Column({ type: 'mediumblob', nullable: true, default: null, comment: '데이터(16M 한도)' })
    DATA: Buffer;

    @Field(() => String)
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK: string;
}