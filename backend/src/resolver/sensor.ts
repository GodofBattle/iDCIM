import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, ID, Int, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getRepository, MoreThan } from "typeorm";
import { ac_user } from "../entity/database/ac_user";
import { cn_sensor, cn_sensor_args, cn_sensor_input } from "../entity/database/cn_sensor";
import { cn_sensor_threshold_ai, cn_sensor_threshold_ai_args, cn_sensor_threshold_ai_input } from "../entity/database/cn_sensor_threshold_ai";
import { cn_sensor_threshold_di } from "../entity/database/cn_sensor_threshold_di";
import { DigitalValue, DigitalValueInput, DIThreshold, cn_sensor_threshold_di_input } from "../entity/web/diThreshold";
import { sensorInput } from "../entity/web/sensor";

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

            return await getRepository(cn_sensor).find({ where: { INTF_ID: intf_id }, relations: ['THRESHOLD_DI'], order: { NODE_ID: 'ASC' } });
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

    @Mutation(() => Boolean)
    async CopySensor(
        @Arg('SENSOR', () => cn_sensor_input!) sensor: cn_sensor_input,
        @Arg('THRESHOLD_AI', () => cn_sensor_threshold_ai_input, { nullable: true }) threshold_ai: cn_sensor_threshold_ai_input,
        @Arg('THRESHOLD_DI', () => cn_sensor_threshold_di_input, { nullable: true }) threshold_di: cn_sensor_threshold_di_input,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!sensor) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });
            const now = new Date();
            
            let is_result = 0;
            // by shkoh 20220713: 센서 복사를 하기 전에, 기존 센서의 NODE_ID를 재정리함
            const node_id: number = sensor.NODE_ID;
            const update_result = await getRepository(cn_sensor).update({ INTF_ID: sensor.INTF_ID, NODE_ID: MoreThan(node_id) }, { NODE_ID: () => 'NODE_ID + 1' });
            is_result += update_result.affected;

            // by shkoh 20220713: 입력된 센서 데이터를 추가
            const insert_result = await getRepository(cn_sensor).insert({
                INTF_ID: sensor.INTF_ID,
                NAME: sensor.NAME,
                SENSOR_CD: sensor.SENSOR_CD,
                DATA_ADDRESS: sensor.DATA_ADDRESS,
                NODE_ID: node_id + 1,
                ADJUST_VALUE: sensor.ADJUST_VALUE,
                MC_ID: sensor.MC_ID,
                DISP_POWER: sensor.DISP_POWER,
                IS_USE: sensor.IS_USE,
                IS_EVENT: sensor.IS_EVENT,
                IS_MKSTATS: sensor.IS_MKSTATS,
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: now
            });
            is_result += insert_result.identifiers.length;

            const insertedId = insert_result.identifiers[0].ID;
            if(threshold_ai !== null) {
                const ai_insert_result = await getRepository(cn_sensor_threshold_ai).insert({
                    SENSOR_ID: insertedId,
                    HOLD_TIME: threshold_ai.HOLD_TIME,
                    VALID_MIN: threshold_ai.VALID_MIN,
                    VALID_MAX: threshold_ai.VALID_MAX,
                    IS_VALID: threshold_ai.IS_VALID,
                    POINT_N3: threshold_ai.POINT_N3,
                    POINT_N2: threshold_ai.POINT_N2,
                    POINT_N1: threshold_ai.POINT_N1,
                    POINT_P1: threshold_ai.POINT_P1,
                    POINT_P2: threshold_ai.POINT_P2,
                    POINT_P3: threshold_ai.POINT_P3,
                    UPDATE_USER_ID: user.ID,
                    UPDATE_USER_DT: now
                });

                is_result += ai_insert_result.identifiers.length;
            } else if(threshold_di !== null) {
                const insert_data = {
                    SENSOR_ID: insertedId,
                    HOLD_TIME: threshold_di.HOLD_TIME,
                    UPDATE_USER_ID: user.ID,
                    UPDATE_USER_DT: now
                };

                for(let idx = 0; idx < 30; idx++) {
                    let level = undefined;
                    let label = undefined;

                    const finder_di = threshold_di.DI.find((_d: DigitalValueInput) => _d.INDEX === idx);
                    if(finder_di) {
                        level = finder_di.LEVEL;
                        label = finder_di.LABEL;
                    }

                    insert_data[`VALUE_${idx}_LEVEL`] = level;
                    insert_data[`VALUE_${idx}_LABEL`] = label;
                }

                const di_insert_result = await getRepository(cn_sensor_threshold_di).insert(insert_data);
                is_result += di_insert_result.identifiers.length;
            }

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteSensor(
        @Arg('SENSOR_ID', () => Int!) sensor_id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!sensor_id) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');

            let is_result: number = 0;
            const ai_delete_result = await getRepository(cn_sensor_threshold_ai).delete({ SENSOR_ID: sensor_id });
            is_result += ai_delete_result.affected;
            
            const di_delete_result = await getRepository(cn_sensor_threshold_di).delete({ SENSOR_ID: sensor_id });
            is_result += di_delete_result.affected;
            
            const delete_result = await getRepository(cn_sensor).delete({ ID: sensor_id });
            is_result += delete_result.affected;

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateAssetSensors(
        @Arg('SENSORS', () => [sensorInput], { nullable: true }) sensors: Array<sensorInput>,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void> 
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!sensors) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');

            let is_result: number = 0;
            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });
            for(const sensor of sensors) {
                const { ID, SENSOR, THRESHOLD_AI, THRESHOLD_DI } = sensor;

                if(Object.keys(SENSOR).length > 0) {
                    is_result += await this.UpdateSensorData(ID, SENSOR, user);
                }

                if(Object.keys(THRESHOLD_AI).length > 0) {
                    is_result += await this.UpdateAnalogThresholdData(ID, THRESHOLD_AI, user);
                }

                if(Object.keys(THRESHOLD_DI).length > 0) {
                    is_result += await this.UpdateDigitalThresholdData(ID, THRESHOLD_DI, user);
                }
            }

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    async UpdateSensorData(ID: number, SENSOR: cn_sensor_input, user: ac_user) {
        const update_data = {
            UPDATE_USER_ID: user.ID,
            UPDATE_USER_DT: new Date(),
            ...SENSOR
        };

        const result = await getRepository(cn_sensor).update({ ID: ID }, update_data);
        return result.affected;
    }

    async UpdateAnalogThresholdData(ID: number, THRESHOLD_AI: cn_sensor_threshold_ai_input, user: ac_user) {
        const update_data = {
            UPDATE_USER_ID: user.ID,
            UPDATE_USER_DT: new Date(),
            ...THRESHOLD_AI
        };

        const result = await getRepository(cn_sensor_threshold_ai).update({ SENSOR_ID: ID }, update_data);
        return result.affected;
    }

    async UpdateDigitalThresholdData(ID: number, THRESHOLD_DI: cn_sensor_threshold_di_input, user: ac_user) {
        const update_data = {
            UPDATE_USER_ID: user.ID,
            UPDATE_USER_DT: new Date()
        };

        if(THRESHOLD_DI.HOLD_TIME) update_data['HOLD_TIME'] = THRESHOLD_DI.HOLD_TIME;

        for(let idx = 0; idx < 30; idx++) {
            let level = undefined;
            let label = undefined;

            const finder_di = THRESHOLD_DI.DI.find((_d: DigitalValueInput) => _d.INDEX === idx);
            if(finder_di) {
                level = finder_di.LEVEL;
                label = finder_di.LABEL;
            }

            update_data[`VALUE_${idx}_LEVEL`] = level;
            update_data[`VALUE_${idx}_LABEL`] = label;
        }

        const result = await getRepository(cn_sensor_threshold_di).update({ SENSOR_ID: ID }, update_data);
        return result.affected;
    }
}