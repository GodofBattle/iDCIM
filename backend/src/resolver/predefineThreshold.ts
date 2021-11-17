import { AuthenticationError, SchemaError } from 'apollo-server-express';
import { Arg, Ctx, ObjectType, Query, Resolver } from "type-graphql";
import { getRepository } from 'typeorm';

import { pd_sensor_threshold_ai } from "../entity/database/pd_sensor_threshold_ai";
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
    async PredefineThresholdByAI(@Arg('ID') id: number, @Ctx() ctx: any) {
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
    async PredefineThresholdByDI(@Arg('ID') id: number, @Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const d_t = await getRepository(pd_sensor_threshold_di).findOne({ ID: id });
            
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
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}