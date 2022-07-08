import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Ctx, ID, Int, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { cn_sensor } from "../entity/database/cn_sensor";
import { cn_sensor_threshold_ai } from "../entity/database/cn_sensor_threshold_ai";

@Resolver()
export class SensorResolver {
    @Query(() => [cn_sensor])
    async AssetSensors(
        @Arg('INTF_ID', () => Int) intf_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!intf_id) throw new UserInputError('전달된 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            return await getRepository(cn_sensor).find({ where: { INTF_ID: intf_id }, order: { NODE_ID: 'ASC' } });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => cn_sensor_threshold_ai, { nullable: true })
    async AssetThresholdByAI(
        @Arg('SENSOR_ID', () => Int) sensor_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!sensor_id) throw new UserInputError('전달된 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            return await getRepository(cn_sensor_threshold_ai).findOne({ SENSOR_ID: sensor_id });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}