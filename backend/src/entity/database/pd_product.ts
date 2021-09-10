import { Field, ObjectType, Int, Args, ArgsType } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

import { pd_manufacturer } from './pd_manufacturer'

@ObjectType()
@Entity({ synchronize: false, orderBy: { NAME: 'ASC' } })
export class pd_product {
    @Field(() => Int!)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, default: 0, comment: '제조사아이디(PD_MANUFACTURER.ID)' })
    @RelationId((product: pd_product) => product.MANUFACTURER)
    MANUFACTURER_ID: number;

    @Field(() => String)
    @Column({ type: 'varchar', length: 8, nullable: false, comment: '자산분류코드(PD_ASSET_CODE.CODE)' })
    ASSET_CD: string;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 64, nullable: false, default: '', comment: '제품명' })
    NAME: string;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 32, nullable: false, default: '', comment: '모델명' })
    MODEL_NAME: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'longtext', nullable: true, default: null, comment: '부가정보(스펙)' })
    INFO: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '이미지파일아이디(PD_FILE.ID)' })
    IMAGE_FILE_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, default: null, comment: '설명' })
    REMARK: string;

    @ManyToOne(() => pd_manufacturer, (manufacturer) => manufacturer.PRODUCTS, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'MANUFACTURER_ID', referencedColumnName: 'ID' })
    MANUFACTURER: pd_manufacturer;

    @Field(() => String)
    get TYPE(): string {
        return 'Product';
    };
}

@ArgsType()
export class pd_product_args {
    @Field(() => Int!)
    MANUFACTURER_ID: number;

    @Field(() => String!, { nullable: true })
    ASSET_CD: string;

    @Field(() => String, { nullable: true })
    NAME: string | undefined;

    @Field(() => String, { nullable: true })
    MODEL_NAME: string | undefined;

    @Field(() => String, { nullable: true })
    REMARK: string | undefined;
}