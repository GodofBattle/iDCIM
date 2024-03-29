import { ArgsType, Field, ID, InputType, Int, ObjectType } from "type-graphql";
import { TypeormLoader } from "type-graphql-dataloader";
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";
import { cn_interface } from "./cn_interface";
import { pd_product } from "./pd_product";

@ObjectType()
@Entity({ synchronize: false })
export class ac_asset {
    @Field(() => ID, { nullable: false })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    @RelationId((asset: ac_asset) => asset.INTERFACE)
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '제품아이디(pd_product.ID)' })
    @RelationId((asset: ac_asset) => asset.PRODUCT)
    PRODUCT_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: false, comment: '자산이름' })
    NAME: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '장소트리정보(ac_cust_hier.ID(TYPE=`P`)' })
    CUST_HIER_ID_P?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '고객사트리정보(ac_cust_hier.ID(TYPE=`C`)' })
    CUST_HIER_ID_C?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true, default: null, comment: '자산 시리얼번호' })
    SERIAL?: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '자산 기타정보' })
    ETC_INFO?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '관리책임자(정): 담당자 아이디(ac_asset_operator.TYPE : C,P' })
    OP_ID_M?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '관리책임자(부): 담당자 아이디(ac_asset_operator.TYPE : C,P' })
    OP_ID_S?: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'date', nullable: true, default: null, comment: '설치일' })
    INSTALL_DATE?: Date;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '유지보수 담당자 아이디(ac_asset_operator.TYPE : O' })
    MA_USER_ID?: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'date', nullable: true, default: null, comment: '유지보수_시작일시' })
    MA_START_DATE?: Date;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'date', nullable: true, default: null, comment: '유지보수_종료일시' })
    MA_END_DATE?: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true, default: null, comment: '정기점검정보(ex:매달 25일)' })
    INSPECT_INFO?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '이미지 파일아이디(ac_file.ID. 0이면 제품이미지)' })
    IMAGE_FILE_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, default: 0, comment: '인터페이스 사용여부(재사용시 인터페이스 정보 재활용)' })
    IS_USE_INTF: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '변경사용자 아이디' })
    UPDATE_USER_ID?: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, default: null, comment: '변경일시' })
    UPDATE_USER_DT?: Date;

    @Field(() => String, { nullable: true })
    @Column({ length: 256, type: 'varchar', nullable: true, default: null, comment: '설명' })
    REMARK?: string;

    @Field(() => pd_product, { nullable: true })
    @ManyToOne(() => pd_product, (product: pd_product) => product.ASSETS, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'PRODUCT_ID', referencedColumnName: 'ID' })
    PRODUCT: pd_product;

    @Field(() => cn_interface, { nullable: true })
    @OneToOne(() => cn_interface, (intf: cn_interface) => intf.ASSET, { primary: true, cascade: false, createForeignKeyConstraints: false })
    @JoinColumn({ name: 'ID', referencedColumnName: 'ID' })
    INTERFACE?: cn_interface;
}

@ArgsType()
export class ac_asset_args {
    @Field(() => String, { nullable: true })
    NAME: string;

    @Field(() => Int, { nullable: true })
    CUST_HIER_ID_P: number;

    @Field(() => Int, { nullable: true })
    CUST_HIER_ID_C: number;

    @Field(() => String, { nullable: true })
    SERIAL: string;

    @Field(() => String, { nullable: true })
    ETC_INFO: string;

    @Field(() => Int, { nullable: true })
    OP_ID_M: number;

    @Field(() => Int, { nullable: true })
    OP_ID_S: number;

    @Field(() => nullableDate, { nullable: true })
    INSTALL_DATE: Date;

    @Field(() => Int, { nullable: true })
    MA_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    MA_START_DATE: Date;

    @Field(() => nullableDate, { nullable: true })
    MA_END_DATE: Date;

    @Field(() => String, { nullable: true })
    INSPECT_INFO: string;

    @Field(() => Int, { nullable: true })
    IMAGE_FILE_ID: number;
}

@InputType()
export class ac_asset_input {
    @Field(() => Int)
    PRODUCT_ID: number;

    @Field(() => String)
    NAME: string;

    @Field(() => String, { nullable: true })
    SERIAL: string;

    @Field(() => Int)
    CUST_HIER_ID_C: number;

    @Field(() => Int)
    CUST_HIER_ID_P: number;

    @Field(() => Int, { nullable: true })
    OP_ID_M: number;

    @Field(() => Int, { nullable: true })
    OP_ID_S: number;

    @Field(() => Int, { nullable: true })
    MA_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    INSTALL_DATE: Date;

    @Field(() => nullableDate, { nullable: true })
    MA_START_DATE: Date;

    @Field(() => nullableDate, { nullable: true })
    MA_END_DATE: Date;

    @Field(() => String, { nullable: true })
    INSPECT_INFO: string;

    @Field(() => Int)
    IS_USE_INTF: number;
}