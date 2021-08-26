import { Field, ObjectType, Int, ArgsType } from "type-graphql";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TypeormLoader } from 'type-graphql-dataloader';

import { pd_product } from './pd_product'

@ObjectType()
@Entity({ synchronize: false })
export class pd_manufacturer {
    @Field(() => Int!)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '회사명' })
    NAME: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 100, nullable: true, default: null, comment: '주소' })
    ADDR?: string | undefined;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 16, nullable: true, default: null, comment: '전화번호' })
    PHONE?: string | undefined;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 16, nullable: true, default: null, comment: '팩스번호' })
    FAX?: string | undefined;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true, default: null, comment: '이메일' })
    EMAIL?: string | undefined;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 80, nullable: true, default: null, comment: '홈페이지 주소' })
    URL?: string | undefined;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string | undefined;

    @Field(() => [pd_product], { nullable: true })
    @OneToMany(() => pd_product, (product: pd_product) => product.MANUFACTURER, { primary: false, cascade: true, createForeignKeyConstraints: false })
    @TypeormLoader((product: pd_product) => product.MANUFACTURER_ID, { selfKey: true })
    PRODUCTS?: pd_product[];

    @Field(() => String)
    get TYPE(): string {
        return 'Manufacturer';
    };
}

@ArgsType()
export class pd_manufacturer_args {
    @Field(() => String!)
    NAME: string;

    @Field(() => String!, { nullable: true })
    ADDR?: string | undefined;

    @Field(() => String!, { nullable: true })
    PHONE?: string | undefined;

    @Field(() => String!, { nullable: true })
    FAX?: string | undefined;

    @Field(() => String!, { nullable: true })
    EMAIL?: string | undefined;

    @Field(() => String!, { nullable: true })
    URL?: string | undefined;

    @Field(() => String!, { nullable: true })
    REMARK?: string | undefined;
}