import { Field, ObjectType, Int } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

import { pd_manufacturer } from './pd_manufacturer'

@ObjectType()
@Entity({ synchronize: false, orderBy: { NAME: 'ASC' } })
export class pd_product {
    @Field(() => Int!)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int)
    @RelationId((product: pd_product) => product.MANUFACTURER)
    MANUFACTURER_ID: number;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 64, nullable: false, default: '', comment: '제품명' })
    NAME: string;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 32, nullable: false, default: '', comment: '모델명' })
    MODEL_NAME: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'longtext', nullable: true, default: null, comment: '부가정보(스펙)' })
    INFO: string;

    @ManyToOne(() => pd_manufacturer, (manufacturer) => manufacturer.PRODUCTS, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'MANUFACTURER_ID', referencedColumnName: 'ID' })
    MANUFACTURER: pd_manufacturer;

    @Field(() => String)
    get TYPE(): string {
        return 'Product';
    };
}