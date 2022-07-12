import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, ID, Int, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { ac_user } from "../entity/database/ac_user";
import { cn_sensor, cn_sensor_args } from "../entity/database/cn_sensor";
import { cn_sensor_threshold_ai, cn_sensor_threshold_ai_args } from "../entity/database/cn_sensor_threshold_ai";
import { cn_sensor_threshold_di } from "../entity/database/cn_sensor_threshold_di";
import { DigitalValue, DigitalValueInput, DIThreshold } from "../entity/web/diThreshold";

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

    @Query(() => DIThreshold, { nullable: true })
    async AssetThresholdByDI(
        @Arg('SENSOR_ID', () => Int) sensor_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!sensor_id) throw new UserInputError('전달된 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const d_t = await getRepository(cn_sensor_threshold_di).findOne({ SENSOR_ID: sensor_id });
            if(d_t) {
                const di_threshold = new DIThreshold();
                di_threshold.ID = d_t.ID;
                di_threshold.SENSOR_ID = d_t.SENSOR_ID;
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
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateAssetSensor(
        @Arg('ID', () => ID!) id: number,
        @Args() { NAME, SENSOR_CD, DATA_ADDRESS, ADJUST_VALUE, MC_ID, DISP_POWER, IS_USE, IS_EVENT, IS_MKSTATS }: cn_sensor_args,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });

            const update_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };
            for(const [key, value] of Object.entries({ NAME, SENSOR_CD, DATA_ADDRESS, ADJUST_VALUE, MC_ID, DISP_POWER, IS_USE, IS_EVENT, IS_MKSTATS })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(cn_sensor).update({ ID: id }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateAssetAiThreshold(
        @Arg('SENSOR_ID', () => Int!) sensor_id: number,
        @Args() { HOLD_TIME, VALID_MAX, VALID_MIN, IS_VALID, POINT_N1, POINT_N2, POINT_N3, POINT_P1, POINT_P2, POINT_P3 }: cn_sensor_threshold_ai_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!sensor_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            await publish();

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });

            const update_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };
            for(const [key, value] of Object.entries({ HOLD_TIME, VALID_MAX, VALID_MIN, IS_VALID, POINT_N1, POINT_N2, POINT_N3, POINT_P1, POINT_P2, POINT_P3 })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(cn_sensor_threshold_ai).update({ SENSOR_ID: sensor_id }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateAssetDiThreshold(
        @Arg('SENSOR_ID', () => Int!) sensor_id: number,
        @Arg('HOLD_TIME', () => Int, { nullable: true }) hold_time: number,
        @Arg('DI', () => [DigitalValueInput!], { nullable: true }) di: DigitalValueInput[],
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!sensor_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            await publish();

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });
            const update_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };

            if(hold_time !== undefined) update_data['HOLD_TIME'] = hold_time;

            for(let idx = 0; idx < 30; idx++) {
                let level = undefined;
                let label = undefined;

                const finder_di = di.find((_d: DigitalValueInput) => _d.INDEX === idx);
                if(finder_di) {
                    level = finder_di.LEVEL;
                    label = finder_di.LABEL;
                }

                update_data[`VALUE_${idx}_LEVEL`] = level;
                update_data[`VALUE_${idx}_LABEL`] = label;
            }

            const result = await getRepository(cn_sensor_threshold_di).update({ SENSOR_ID: sensor_id }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}