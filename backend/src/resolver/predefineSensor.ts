import { Arg, Ctx, Query, Resolver, Int } from "type-graphql";
import { getRepository } from "typeorm";
import { AuthenticationError, SchemaError } from 'apollo-server-express';

import { pd_sensor } from "../entity/database/pd_sensor";

@Resolver()
export class PredefineSensorResolver {
    @Query(() => [pd_sensor])
    async PredefineSensors(
        @Arg('PD_INTF_ID', () => Int) pd_interface_id: number,
        @Ctx() ctx: any
    ): Promise<Array<pd_sensor>> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const result = await getRepository(pd_sensor).find({ where: { PD_INTF_ID: pd_interface_id }, order: { NODE_ID: 'ASC' } });
            return result;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => pd_sensor)
    async PredefineSensor(
        @Arg('ID', () => Int) id: number,
        @Ctx() ctx: any
    ): Promise<pd_sensor> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const result = await getRepository(pd_sensor).findOne({ where: { ID: id } });
            return result;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}