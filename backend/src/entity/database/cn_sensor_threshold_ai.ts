import { ArgsType, Field, Float, ID, InputType, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { nullableDate } from "../../scalar/nullableDate";

@ObjectType()
@Entity({ synchronize: false })
export class cn_sensor_threshold_ai {
    @Field(() => ID, { nullable: true })
    @PrimaryGeneratedColumn('increment', { type: 'int', comment: '아이디' })
    ID: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, unique: true, comment: '연동센서 아이디(cn_sensor.ID)' })
    SENSOR_ID: number

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, default: 0, comment: '지속시간(초)' })
    HOLD_TIME: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: true, default: null, comment: '유효 최소값' })
    VALID_MIN?: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: true, default: null, comment: '유효 최대값' })
    VALID_MAX?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'tinyint', nullable: false, default: 1, comment: '유효값(최소/최대) 사용여부' })
    IS_VALID: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '하한 임계값 3 (위험)' })
    POINT_N3: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '하한 임계값 2 (경고)' })
    POINT_N2: number;
    
    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '하한 임계값 1 (주의)' })
    POINT_N1: number;
    
    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '상한 임계값 1 (주의)' })
    POINT_P1: number;
    
    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '상한 임계값 2 (주의)' })
    POINT_P2: number;
    
    @Field(() => Float, { nullable: true })
    @Column({ type: 'double', nullable: false, comment: '상한 임계값 3 (주의)' })
    POINT_P3: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: false, comment: '변경 사용자 아이디' })
    UPDATE_USER_ID: number;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: false, comment: '변경일시' })
    UPDATE_USER_DT: Date;

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: null, comment: '설명' })
    REMARK?: string;
}

@ArgsType()
export class cn_sensor_threshold_ai_args {
    @Field(() => Int, { nullable: true })
    HOLD_TIME: number;

    @Field(() => Float, { nullable: true })
    VALID_MIN: number;

    @Field(() => Float, { nullable: true })
    VALID_MAX: number;

    @Field(() => Int, { nullable: true })
    IS_VALID: number;

    @Field(() => Float, { nullable: true })
    POINT_N3: number;
    
    @Field(() => Float, { nullable: true })
    POINT_N2: number;
    
    @Field(() => Float, { nullable: true })
    POINT_N1: number;
    
    @Field(() => Float, { nullable: true })
    POINT_P1: number;
    
    @Field(() => Float, { nullable: true })
    POINT_P2: number;
    
    @Field(() => Float, { nullable: true })
    POINT_P3: number;
}

@InputType()
export class cn_sensor_threshold_ai_input {
    @Field(() => Int, { nullable: true })
    HOLD_TIME: number;

    @Field(() => Float, { nullable: true })
    VALID_MIN: number;

    @Field(() => Float, { nullable: true })
    VALID_MAX: number;

    @Field(() => Int, { nullable: true })
    IS_VALID: number;

    @Field(() => Float, { nullable: true })
    POINT_N3: number;
    
    @Field(() => Float, { nullable: true })
    POINT_N2: number;
    
    @Field(() => Float, { nullable: true })
    POINT_N1: number;
    
    @Field(() => Float, { nullable: true })
    POINT_P1: number;
    
    @Field(() => Float, { nullable: true })
    POINT_P2: number;
    
    @Field(() => Float, { nullable: true })
    POINT_P3: number;
}