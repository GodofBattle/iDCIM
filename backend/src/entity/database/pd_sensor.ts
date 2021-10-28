import { Field, ObjectType, ID, Int } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ synchronize: false })
export class pd_sensor {
    @Field(() => Int!)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int!)
    @Column({ type: 'int', nullable: false, comment: '사전정의_인터페이스아이디(PD_INTERFACE.ID)' })
    PD_INTF_ID: number;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 64, nullable: false, default: '', comment: '이름' })
    NAME: string;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 8, nullable: false, default: '', comment: '센서코드(PD_SENSOR_CODE.CODE)' })
    SENSOR_CD: string;

    @Field(() => Int!)
    @Column({ type: 'int', nullable: false, default: 0, comment: '사전정의_센서임계치아이디(PD_SENSOR_THRESHOLD_XX.ID)' })
    PD_THRESHOLD_ID: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 128, nullable: true, default: null, comment: '연동부가옵션(SNMP: 요청OID, MODBUS: 파싱정보, TCPID: 파싱정보, ODBC: ODBC Key)' })
    DATA_ADDRESS?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '노드아이디' })
    NODE_ID?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true, default: 'VAL', comment: '값 조정수식' })
    ADJUST_VALUE?: string;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '모드버스커멘드아이디' })
    MC_ID?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '표기환산지수: PD_CODE.VALUE (TYPE="POWER")' })
    DISP_POWER?: number;

    @Field(() => Int!)
    @Column({ type: 'tinyint', nullable: false, default: 1, comment: '알림여부' })
    IS_NOTI: number;

    @Field(() => Int!)
    @Column({ type: 'tinyint', nullable: false, default: 1, comment: '통계생성여부' })
    IS_MKSTATS: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}