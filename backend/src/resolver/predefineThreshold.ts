import { AuthenticationError, SchemaError, UserInputError } from 'apollo-server-express';
import { Arg, Args, Ctx, Int, Mutation, Query, Resolver, Publisher, PubSub, ID } from "type-graphql";
import { getRepository } from 'typeorm';

import { pd_sensor_threshold_ai, pd_sensor_threshold_ai_args } from "../entity/database/pd_sensor_threshold_ai";
import { pd_sensor_threshold_di } from "../entity/database/pd_sensor_threshold_di";
import { DIThreshold, DigitalValue } from '../entity/web/diThreshold';

@Resolver()
export class PredefineThresholdResolver {
    @Query(() => [pd_sensor_threshold_ai], { nullable: true })
    async PredefineThresholdsByAI(
        @Arg('SENSOR_CD') sensor_cd: string,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(pd_sensor_threshold_ai).find({ SENSOR_CD: sensor_cd });
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [pd_sensor_threshold_di], { nullable: true })
    async PredefineThresholdsByDI(
        @Arg('SENSOR_CD') sensor_cd: string,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(pd_sensor_threshold_di).find({ SENSOR_CD: sensor_cd });
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => pd_sensor_threshold_ai, { nullable: true })
    async PredefineThresholdByAI(@Arg('ID', () => Int!) id: number, @Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(pd_sensor_threshold_ai).findOne({ ID: id });
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => DIThreshold, { nullable: true })
    async PredefineThresholdByDI(@Arg('ID', () => Int!) id: number, @Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const d_t = await getRepository(pd_sensor_threshold_di).findOne({ ID: id });

            if(d_t) {
                const di_threshold = new DIThreshold();
                di_threshold.ID = d_t.ID;
                di_threshold.HOLD_TIME = d_t.HOLD_TIME;

                const di_values = new Array<DigitalValue>();
                for(let idx = 0; idx < 30; idx++) {
                    const str_lvl = `VALUE_${idx}_LEVEL`;
                    const str_lbl = `VALUE_${idx}_LABEL`;

                    if(d_t[str_lvl] !== null && d_t[str_lbl] !== null) {
                        di_values.push({
                            INDEX: idx,
                            LEVEL: d_t[str_lvl],
                            LABEL: d_t[str_lbl]
                        });
                    }
                }

                di_threshold.DI = di_values;
                return di_threshold;
            } else {
                return null;
            }
            

        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdatePredefineThresholdByAI(
        @Arg('ID', () => ID!) id: number,
        @Args() { NAME, HOLD_TIME, VALID_MIN, VALID_MAX, IS_VALID, POINT_N3, POINT_N2, POINT_N1, POINT_P1, POINT_P2, POINT_P3 }: pd_sensor_threshold_ai_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const update_data = {};
            for(const [key, value] of Object.entries({ NAME, HOLD_TIME, VALID_MIN, VALID_MAX, IS_VALID, POINT_N3, POINT_N2, POINT_N1, POINT_P1, POINT_P2, POINT_P3 })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(pd_sensor_threshold_ai).update({ ID: id }, update_data);
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async CopyPredefineThresholdByAI(
        @Arg('SENSOR_CD', () => String!) sensor_cd: string,
        @Args() { NAME, HOLD_TIME, VALID_MIN, VALID_MAX, IS_VALID, POINT_N3, POINT_N2, POINT_N1, POINT_P1, POINT_P2, POINT_P3 }: pd_sensor_threshold_ai_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!sensor_cd) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const copy_data = {
                SENSOR_CD: sensor_cd
            };
            
            for(const [key, value] of Object.entries({ NAME, HOLD_TIME, VALID_MIN, VALID_MAX, IS_VALID, POINT_N3, POINT_N2, POINT_N1, POINT_P1, POINT_P2, POINT_P3 })) {
                if(value !== undefined) copy_data[key] = value;
            }

            const result = await getRepository(pd_sensor_threshold_ai).insert(copy_data);
            return result.identifiers.length > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeletePredefineThresholdByAI(
        @Arg('ID', () => ID!) id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_sensor_threshold_ai).delete({ ID: id });
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeletePredefineThresholdByDI(
        @Arg('ID', () => ID!) id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_sensor_threshold_di).delete({ ID: id });
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}