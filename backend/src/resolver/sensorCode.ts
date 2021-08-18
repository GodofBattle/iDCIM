import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Ctx, Mutation, Query, Resolver, Args, Publisher, PubSub, Arg } from "type-graphql";
import { getRepository, UpdateResult } from "typeorm";

import { pd_sensor_code } from '../entity/database/pd_sensor_code'


@Resolver()
export class SensorCodeResolver {
    @Query(() => [pd_sensor_code])
    async SensorCodes(@Ctx() ctx: any) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_sensor_code).find());
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddSensorCode(
        @Args() { CODE, NAME, TYPE, UNIT, IS_DISP_CONV, REMARK }: pd_sensor_code,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!CODE) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_sensor_code).insert({ CODE, NAME, TYPE, UNIT, IS_DISP_CONV, REMARK });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateSensorCode(
        @Arg('ID') ID: string,
        @Args() { CODE, NAME, TYPE, UNIT, IS_DISP_CONV, REMARK }: pd_sensor_code,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            // by shkoh 20210818: 전달받은 인자들 중에서 반드시 필요한 인자들만 적용함
            const update_data = {};
            for (const [key, value] of Object.entries({ CODE, NAME, TYPE, UNIT, IS_DISP_CONV, REMARK })) {
                if (value) update_data[key] = value;
            }

            const result = await getRepository(pd_sensor_code).update({ CODE: ID }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}