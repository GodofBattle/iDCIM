import { ArgsType, Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, getRepository, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";
import { ac_asset } from "./ac_asset";
import { pd_interface } from "./pd_interface";
import { pd_prod_intf } from "./pd_prod_intf";

@ObjectType()
@Entity({ synchronize: false })
export class cn_interface {
    @Field(() => ID, { nullable: false })
    @PrimaryColumn({ type: 'int', nullable: false, comment: '아이디(=자산아이디) (ac_asset.ID)' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '사전정의_제품인터페이스아이디(pd_prod_intf.ID)' })
    PROD_INTF_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '현재통신상태(pd_code.VALUE (TYPE="COMM")' })
    CURR_STATUS: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 0, comment: '현재레벨(pd_code.VALUE (TYPE="LEVEL")' })
    CURR_LEVEL: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 15, nullable: true, default: null, comment: '아이피 주소' })
    IP_ADDR?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '포트번호' })
    PORT?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '장치번호' })
    DEVICE_ID?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'smallint', nullable: true, default: 5, comment: '수집주기 (초)' })
    POLL_INTERVAL?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'smallint', nullable: true, default: 3, comment: '수집 타임아웃 (초)' })
    TIMEOUT?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: 3, comment: '재처리 횟수' })
    RETRY?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '연동부가옵션1(SNMP: community, ODBC: DSN DbUser DBPwd, PEER_CHECK_HTTP: CheckURL)' })
    ACCESS_INFO?: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 1024, nullable: true, default: null, comment: '연동부가옵션2(ODBC: Query)' })
    ODBC_QUERY?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 1, comment: '사용여부' })
    IS_USE: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, default: new Date(), onUpdate: 'current_timestamp()', comment: '상태값 변경일시' })
    UPDATE_DT: Date;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경 사용자 아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;

    @OneToOne(() => ac_asset, (asset: ac_asset) => asset.INTERFACE, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'ID', referencedColumnName: 'ID' })
    ASSET: ac_asset;

    @Field(() => pd_interface, { nullable: true })
    async PD_INTERFACE(): Promise<pd_interface> {
        const pd_intf = await getRepository(pd_interface)
            .createQueryBuilder('pd_intf')
            .innerJoinAndSelect('pd_intf.PROD_INTF', 'prod_intf', 'pd_intf.ID = prod_intf.PD_INTF_ID')
            .where(`prod_intf.ID = ${this.PROD_INTF_ID}`)
            .getOne();

        return pd_intf;
    }
}

@ArgsType()
export class cn_interface_args {
    @Field(() => String, { nullable: true })
    IP_ADDR: string;
    
    @Field(() => Int, { nullable: true })
    PORT: number;
    
    @Field(() => Int, { nullable: true })
    DEVICE_ID: number;
    
    @Field(() => Int, { nullable: true })
    POLL_INTERVAL: number;
    
    @Field(() => Int, { nullable: true })
    TIMEOUT: number;
    
    @Field(() => Int, { nullable: true })
    RETRY: number;
    
    @Field(() => String, { nullable: true })
    ACCESS_INFO: string;
    
    @Field(() => String, { nullable: true })
    ODBC_QUERY: string;
    
    @Field(() => Int, { nullable: true })
    IS_USE: number;
}