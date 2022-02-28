import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ synchronize: false })
export class pd_prod_intf {
    @Field(() => ID!)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, comment: '제품아이디(PD_PRODUCT.ID)' })
    PRODUCT_ID: number;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, comment: '사전정의_인터페이스아이디(PD_INTERFACE.ID)' })
    PD_INTF_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK: string;
}