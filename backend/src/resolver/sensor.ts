import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Ctx, ID, Int, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { cn_sensor } from "../entity/database/cn_sensor";
import { cn_sensor_threshold_ai } from "../entity/database/cn_sensor_threshold_ai";
import { cn_sensor_threshold_di } from "../entity/database/cn_sensor_threshold_di";
import { DigitalValue, DIThreshold } from "../entity/web/diThreshold";

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
}