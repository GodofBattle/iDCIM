import { ArgsType, Field, ID, InputType, Int, ObjectType } from "type-graphql";
import { TypeormLoader } from "type-graphql-dataloader";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

import { pd_interface } from "./pd_interface";

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
    @RelationId((prod_intf: pd_prod_intf) => prod_intf.INTERFACE, 'intf')
    PD_INTF_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK: string;

    @Field(() => pd_interface, { nullable: true })
    @OneToOne(() => pd_interface, { createForeignKeyConstraints: false, cascade: true })
    @JoinColumn({ name: 'PD_INTF_ID', referencedColumnName: 'ID' })
    @TypeormLoader(() => pd_interface, (prod_intf: pd_prod_intf) => prod_intf.PD_INTF_ID, { selfKey: false })
    INTERFACE?: pd_interface;
}

@InputType()
export class pd_prod_intf_input {
    @Field(() => ID, { nullable: true })
    ID: number;

    @Field(() => Int, { nullable: true })
    PD_INTF_ID: number;
}