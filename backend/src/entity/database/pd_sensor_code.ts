import { ObjectType, Field, Int, ArgsType } from "type-graphql";
import { Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

import { pd_sensor } from "./pd_sensor";

@ObjectType()
@Entity({ synchronize: false })
export class pd_sensor_code {
    @Field(() => Int!, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String!)
    @PrimaryColumn({ type: 'varchar', length: 8, nullable: false, comment: '코드' })
    CODE: string;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 32, nullable: false, default: '', comment: '이름' })
    NAME: string;

    @Field(() => String!)
    @Column({ type: 'char', length: 1, nullable: false, default: '', comment: '분류(A:Analog, D:Digital)' })
    TYPE: string;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 4, nullable: true, default: null, comment: '저장단위' })
    UNIT?: string | null;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '표기단위변환여부(저장단위를 커스텀단위로 변환기능 제공여부' })
    IS_DISP_CONV?: number | null;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: '', comment: '설명' })
    REMARK?: string | null;

    @OneToOne(() => pd_sensor, (sensor: pd_sensor) => sensor.SENSOR_CODE, { lazy: true, primary: false, createForeignKeyConstraints: false })
    PD_SENSOR?: pd_sensor;
}

@ArgsType()
export class pd_sensor_code_args {
    @Field(() => Int!, { nullable: true })
    ID: number;

    @Field(() => String!)
    CODE: string;

    @Field(() => String!)
    NAME: string;

    @Field(() => String!)
    TYPE: string;

    @Field(() => String, { nullable: true })
    UNIT: string | null;

    @Field(() => Int, { nullable: true })
    IS_DISP_CONV?: number | null;

    @Field(() => String, { nullable: true })
    REMARK?: string | null;
}