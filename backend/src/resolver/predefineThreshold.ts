import { AuthenticationError, SchemaError } from 'apollo-server-express';
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { getRepository } from 'typeorm';

import { pd_sensor_threshold_ai } from "../entity/database/pd_sensor_threshold_ai";
import { pd_sensor_threshold_di } from "../entity/database/pd_sensor_threshold_di";

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
}