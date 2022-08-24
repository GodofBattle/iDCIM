import { Field, ID, InputType, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class ac_op_noti_except_sensor {
    @Field(() => ID)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID?: number;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, unique: true, comment: '담당자아이디(ac_asset_operator.ID)' })
    OP_ID: number;

    @Field(() => Int)
    @Column({ type: 'int', nullable: false, comment: '센서아이디(cn_sensor.ID)' })
    SENSOR_ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경사용자아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}

@InputType()
export class ac_op_noti_except_sensor_input {
    @Field(() => Int)
    OP_ID: number;

    @Field(() => Int)
    SENSOR_ID: number;
}