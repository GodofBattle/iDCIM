import { Field, ObjectType, Int, ArgsType, InputType } from "type-graphql";
import { AfterLoad, Column, Entity, getRepository, PrimaryColumn } from "typeorm";

import { pd_code } from "./pd_code";

@ObjectType()
@Entity({ synchronize: false })
export class pd_modbus_cmd {
    @Field(() => Int!)
    @PrimaryColumn({ type: 'int', nullable: false, comment: '사전정의_인터페이스아이디(od_interface.id)' })
    PD_INTF_ID: number;

    @Field(() => Int!)
    @PrimaryColumn({ type: 'tinyint', nullable: false, comment: '모드버스커맨드아이디' })
    MC_ID: number;

    @Field(() => Int!)
    @Column({ type: 'tinyint', nullable: false, comment: '요청FUNC번호' })
    FUNC_NO: number;

    @Field(() => Int!)
    @Column({ type: 'int', nullable: false, comment: '요청시작주소' })
    START_ADDR: number;

    @Field(() => Int!)
    @Column({ type: 'tinyint', nullable: false, comment: '요청정보수' })
    POINT_CNT: number;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 8, nullable: false, comment: '데이터타입(PD_CODE.CODE (TYPE="DTYPE"))' })
    DTYPE_CD: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, comment: '설명' })
    REMARK?: string;

    @AfterLoad()
    @Field(() => String, { nullable: true })
    async DTYPE_NAME?() {
        const code_data: pd_code = await getRepository(pd_code).findOne({ where: { CODE: this.DTYPE_CD } });
        return code_data.NAME;
    }
}

@ArgsType()
export class pd_modbus_cmd_arg {
    @Field(() => Int, { nullable: true })
    FUNC_NO: number;

    @Field(() => Int, { nullable: true })
    START_ADDR: number;

    @Field(() => Int, { nullable: true })
    POINT_CNT: number;

    @Field(() => String, { nullable: true })
    DTYPE_CD: string;
}

@InputType('PdModbusCmdInput')
export class pd_modbus_cmd_input {
    @Field(() => Int!)
    PD_INTF_ID: number;

    @Field(() => Int!)
    MC_ID: number;

    @Field(() => Int!)
    FUNC_NO: number;

    @Field(() => Int!)
    START_ADDR: number;

    @Field(() => Int!)
    POINT_CNT: number;

    @Field(() => String!)
    DTYPE_CD: string;

    @Field(() => String)
    REMARK?: string;
}