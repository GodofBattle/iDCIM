import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ synchronize: false })
export class pd_tcpetc_cmd {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, unique: true, comment: '사전정의 인터페이스아이디(pd_interface.ID)' })
    PD_INTF_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '기타 TCP 커맨드 아이디' })
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

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}