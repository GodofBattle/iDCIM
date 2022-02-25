import { ArgsType, Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany, Tree, TreeParent, TreeChildren } from "typeorm";

@ObjectType()
@Entity({ synchronize: false })
export class pd_asset_hier {
    @Field(() => ID)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 32, nullable: true, comment: '이름' })
    NAME: string;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, default: 0, comment: '상위아이디' })
    P_ID: number;

    @Field(() => Int)
    @Column({ type: 'int', nullable: true, default: null, comment: '표시순서번호(동일그룹내 표시순서)' })
    ORDER: number;

    @Field(() => String)
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK: string;

    @Field(() => String)
    get TYPE(): string {
        return 'AssetHier';
    };
}

@ArgsType()
export class pd_asset_hier_args {
    @Field(() => String!)
    NAME: string;

    @Field(() => Int)
    P_ID: number;

    @Field(() => Int)
    ORDER: number;
}