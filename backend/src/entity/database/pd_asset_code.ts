import { ArgsType, Field, Int, ObjectType } from "type-graphql";
import { TypeormLoader } from "type-graphql-dataloader";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { pd_interface } from './pd_interface';

@ObjectType()
@Entity({ synchronize: false })
export class pd_asset_code {
    @Field(() => String!)
    @PrimaryColumn({ type: 'varchar', length: 8, nullable: false, default: '', comment: '코드' })
    CODE: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '이름' })
    NAME: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '별칭(다른이름으로 사용시)' })
    ALIAS: string;

    @Field(() => Int!, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '자산분류트리아이디(PD_ASSET_HIER.ID)' })
    PD_ASSET_HIER_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '표시순서번호(동일그룹내 표시순서)' })
    ORDER: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK: string;

    @Field(() => String)
    get TYPE(): string {
        return 'AssetCode';
    };

    @Field(() => [pd_interface], { nullable: true })
    @OneToMany(() => pd_interface, (intf: pd_interface) => intf.ASSET_CODE, { primary: false, cascade: true, createForeignKeyConstraints: false })
    @TypeormLoader(() => pd_interface, (intf: pd_interface) => intf.ASSET_CD, { selfKey: true })
    PREDEFINED_INTERFACES?: pd_interface[];
}

@ArgsType()
export class pd_asset_code_args {
    @Field(() => String, { nullable: true })
    CODE: string;

    @Field(() => String, { nullable: true })
    NAME: string;

    @Field(() => String, { nullable: true })
    ALIAS: string;

    @Field(() => Int!, { nullable: true })
    PD_ASSET_HIER_ID: number;

    @Field(() => Int, { nullable: true })
    ORDER: number;
}