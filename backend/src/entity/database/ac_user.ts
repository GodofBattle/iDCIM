import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';

import { nullableDate } from '../../scalar/nullableDate';

@ObjectType()
@Entity({ synchronize: false })
export class ac_user {
    @Field(() => Int)
    @PrimaryGeneratedColumn('increment', { type: 'int' })
    ID: number;

    @Field(() => String)
    @Column({ length: 8, type: 'varchar', nullable: false, comment: '권한코드(PD_CODE.code (TYPE="PERM"))' })
    PERM_CD: string;

    @Field(() => Int!, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '운영그룹아이디(AC_USER_GROUP.id)' })
    USER_GROUP_ID: number | null;

    @Field(() => String)
    @Column({ type: 'varchar', length: 32, nullable: false, default: '', comment: '사용자아이디' })
    USER_ID: string;

    @Field(() => String)
    @Column({ type: 'varchar', length: 32, nullable: false, default: '', comment: '비밀번호' })
    PASSWD: string;

    @Field(() => String)
    @Column({ type: 'varchar', length: 64, nullable: false, comment: '사용자 이름' })
    NAME: string;

    @Field(() => Int!, { nullable: true })
    @Column({ type: 'int', nullable: true, default: null, comment: '변경사용자 아이디' })
    UPDATE_USER_ID: number | null;

    @Field(() => nullableDate, { nullable: true })
    @Column({ type: 'datetime', nullable: true, default: null, comment: '변경일시' })
    UPDATE_USER_DT: Date | null;
}