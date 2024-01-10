import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class cn_tcpetc_cmd {
    @Field(() => Int, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '자산인터페이스 아이디(cn_interface.ID)' })
    INTF_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '기타 TCP 커맨드아이디' })
    CMD_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 8, nullable: true, default: null, comment: '커맨드 옵션1' })
    OPT1?: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 8, nullable: true, default: null, comment: '커맨드 옵션2' })
    OPT2?: string;
    
    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 8, nullable: true, default: null, comment: '커맨드 옵션3' })
    OPT3?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경 사용자 아이디' })
    UPDATE_USER_ID?: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT?: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}