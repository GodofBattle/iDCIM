import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Ctx, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";

import { pd_sensor_code } from '../entity/database/pd_sensor_code'


@Resolver()
export class SensorCodeResolver {
    @Query(() => [pd_sensor_code])
    async SensorCodes(@Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_sensor_code).find());
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}