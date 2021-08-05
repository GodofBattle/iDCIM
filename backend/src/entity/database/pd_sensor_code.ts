import { ObjectType, Field, Int } from "type-graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";

@ObjectType()
@Entity({ synchronize: false })
export class pd_sensor_code {
    @Field(() => String)
    @PrimaryColumn({ type: 'varchar', length: 8, nullable: false, comment: '코드' })
    CODE: string;

    @Field(() => String)
    @Column({ type: 'varchar', length: 32, nullable: false, default: '', comment: '이름' })
    NAME: string;

    @Field(() => String)
    @Column({ type: 'char', length: 1, nullable: false, default: '', comment: '분류(A:Analog, D:Digital)' })
    TYPE: string;

    @Field(() => String!, { nullable: true })
    @Column({ type: 'varchar', length: 4, nullable: true, default: null, comment: '저장단위' })
    UNIT: string | null;

    @Field(() => Int!, { nullable: true })
    @Column({ type: 'tinyint', nullable: true, default: null, comment: '표기단위변환여부(저장단위를 커스텀단위로 변환기능 제공여부' })
    IS_DISP_CONV: number | null;
    
    @Field(() => String!, { nullable: true })
    @Column({ type: 'varchar', length: 256, nullable: true, default: '', comment: '설명' })
    REMARK: string | null;
}