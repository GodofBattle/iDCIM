import { Field, ObjectType, Int, Float, ArgsType, InputType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@ObjectType()
@Entity({ synchronize: false })
export class pd_sensor_threshold_ai {
    @Field(() => Int!)
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 8, nullable: false, default: '', comment: '센서코드(PD_SENSOR_CODE.code)' })
    SENSOR_CD: string;

    @Field(() => String!)
    @Column({ type: 'varchar', length: 64, nullable: false, default: '', comment: '임계치 이름' })
    NAME: string;

    @Field(() => Int!, { nullable: true })
    @Column({ type: 'int', nullable: false, default: 0, comment: '지속시간(초)' })
    HOLD_TIME: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: true, default: null, comment: '유효 최소값' })
    VALID_MIN: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: true, default: null, comment: '유효 최대값' })
    VALID_MAX: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '유효값 사용여부' })
    IS_VALID: number;

    @Field(() => Float!, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '하한 임계값3' })
    POINT_N3: number;

    @Field(() => Float!, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '하한 임계값2' })
    POINT_N2: number;

    @Field(() => Float!, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '하한 임계값1' })
    POINT_N1: number;

    @Field(() => Float!, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '상한 임계값1' })
    POINT_P1: number;

    @Field(() => Float!, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '상한 임계값2' })
    POINT_P2: number;

    @Field(() => Float!, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '상한 임계값3' })
    POINT_P3: number;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256 , nullable: true, default: null, comment: '설명'})
    REMARK: string;
}

@ArgsType()
export class pd_sensor_threshold_ai_args {
    @Field(() => String, { nullable: true })
    NAME?: string;

    @Field(() => Int, { nullable: true })
    HOLD_TIME?: number;

    @Field(() => Float, { nullable: true })
    VALID_MIN?: number;

    @Field(() => Float, { nullable: true })
    VALID_MAX?: number;

    @Field(() => Float, { nullable: true })
    IS_VALID?: number;

    @Field(() => Float, { nullable: true })
    POINT_N3?: number;

    @Field(() => Float, { nullable: true })
    POINT_N2?: number;

    @Field(() => Float, { nullable: true })
    POINT_N1?: number;

    @Field(() => Float, { nullable: true })
    POINT_P1?: number;

    @Field(() => Float, { nullable: true })
    POINT_P2?: number;

    @Field(() => Float, { nullable: true })
    POINT_P3?: number;
}

@InputType('PredefineThresholdAIInput')
export class pd_sensor_threshold_ai_input {
    @Field(() => Int, { nullable: false })
    ID: number;

    @Field(() => String, { nullable: true })
    NAME?: string;

    @Field(() => Int, { nullable: true })
    HOLD_TIME?: number;

    @Field(() => Float, { nullable: true })
    VALID_MIN?: number;

    @Field(() => Float, { nullable: true })
    VALID_MAX?: number;

    @Field(() => Float, { nullable: true })
    IS_VALID?: number;

    @Field(() => Float, { nullable: true })
    POINT_N3?: number;

    @Field(() => Float, { nullable: true })
    POINT_N2?: number;

    @Field(() => Float, { nullable: true })
    POINT_N1?: number;

    @Field(() => Float, { nullable: true })
    POINT_P1?: number;

    @Field(() => Float, { nullable: true })
    POINT_P2?: number;

    @Field(() => Float, { nullable: true })
    POINT_P3?: number;
}