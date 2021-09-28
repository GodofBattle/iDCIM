import { Field, ID, ObjectType, Int } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

import { pd_asset_code } from './pd_asset_code';

@ObjectType()
@Entity({ synchronize: false })
export class pd_interface {
    @Field(() => ID!)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 8, nullable: false, default: '', comment: '자산분류코드(PD_ASSET_CODE.code)' })
    @RelationId((intf: pd_interface) => intf.ASSET_CODE)
    ASSET_CD: string;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 8, nullable: false, default: '', comment: '인터페이스타입(PD_CODE.code (TYPE="INTF"))' })
    INTF_CD: string;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 64, nullable: false, default: '', comment: '인터페이스 명' })
    NAME: string;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, default: null, comment: '프로토콜문서 파일아이디(PD_FILE.ID)' })
    PROTOCOL_FILE_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256 , nullable: true, default: null, comment: '설명'})
    REMARK: string;

    @Field(() => String)
    get TYPE(): string {
        return 'PredefineInterface';
    }

    @ManyToOne(() => pd_asset_code, (asset_code) => asset_code.PREDEFINED_INTERFACES, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'ASSET_CD', referencedColumnName: 'CODE' })
    ASSET_CODE: pd_asset_code;
}