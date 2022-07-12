import { AuthenticationError, SchemaError, UserInputError } from 'apollo-server-express';
import { Arg, Args, Ctx, Int, Mutation, Query, Resolver, Publisher, PubSub, ID } from "type-graphql";
import { getRepository } from 'typeorm';

import { pd_sensor_threshold_ai, pd_sensor_threshold_ai_args, pd_sensor_threshold_ai_input } from "../entity/database/pd_sensor_threshold_ai";
import { pd_sensor_threshold_di } from "../entity/database/pd_sensor_threshold_di";
import { DIThreshold, DigitalValue, DigitalValueInput, PredefineThresholdDIInput } from '../entity/web/diThreshold';

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
    async AddPredefineThresholdByAI(
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

            const add_data = {
                SENSOR_CD: sensor_cd
            };
            
            for(const [key, value] of Object.entries({ NAME, HOLD_TIME, VALID_MIN, VALID_MAX, IS_VALID, POINT_N3, POINT_N2, POINT_N1, POINT_P1, POINT_P2, POINT_P3 })) {
                if(value !== undefined) add_data[key] = value;
            }

            const result = await getRepository(pd_sensor_threshold_ai).insert(add_data);
            return result.identifiers.length > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddPredefineThresholdByDI(
        @Arg('SENSOR_CD', () => String!) sensor_cd: string,
        @Arg('NAME', () => String, { nullable: true }) name: string,
        @Arg('HOLD_TIME', () => Int, { nullable: true }) hold_time: number,  
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!sensor_cd) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const add_data = {
                SENSOR_CD: sensor_cd,
                NAME: name,
                HOLD_TIME: hold_time
            };
            
            const result = await getRepository(pd_sensor_threshold_di).insert(add_data);
            return result.identifiers.length > 0 ? true : false;
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
    async UpdatePredefineThresholdsByAI(
        @Arg('Input', () => [pd_sensor_threshold_ai_input!], { nullable: true }) input: pd_sensor_threshold_ai_input[],
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(input.length === 0) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');
            let is_result: number = 0;

            input.forEach(async (threshold: pd_sensor_threshold_ai_input) => {
                const update_data = {};
                
                for(const [ key, value ] of Object.entries(threshold)) {
                    if(key !== 'ID' && value !== null) update_data[key] = value;
                }
                
                const result = await getRepository(pd_sensor_threshold_ai).update({ ID: threshold.ID }, update_data);
                is_result += result.affected;
            });

            return is_result > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdatePredefineThresholdByDI(
        @Arg('ID', () => ID!) id: number,
        @Arg('NAME', () => String, { nullable: true }) name: string,
        @Arg('HOLD_TIME', () => Int, { nullable: true }) hold_time: number,
        @Arg('DI', () => [DigitalValueInput!], { nullable: true }) di: DigitalValueInput[],
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
            if(name) update_data['NAME'] = name;
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

            const result = await getRepository(pd_sensor_threshold_di).update({ ID: id }, update_data);
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdatePredefineThresholdsByDI(
        @Arg('Input', () => [PredefineThresholdDIInput!], { nullable: true }) input: PredefineThresholdDIInput[],
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(input.length === 0) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');
            
            let is_result: number = 0;
            input.forEach(async (threshold: PredefineThresholdDIInput) => {
                const update_data = {};
                if(threshold.NAME) update_data['NAME'] = threshold.NAME;
                if(threshold.HOLD_TIME) update_data['HOLD_TIME'] = threshold.HOLD_TIME;

                for(let idx = 0; idx < 30; idx++) {
                    let level = undefined;
                    let label = undefined;

                    const finder_di = threshold.DI.find((_d: DigitalValueInput) => _d.INDEX === idx);
                    if(finder_di) {
                        level = finder_di.LEVEL;
                        label = finder_di.LABEL;
                    }

                    update_data[`VALUE_${idx}_LEVEL`] = level;
                    update_data[`VALUE_${idx}_LABEL`] = label;
                }

                const result = await getRepository(pd_sensor_threshold_di).update({ ID: threshold.ID }, update_data);
                is_result += result.affected;
            });

            return is_result > 0 ? true : false;
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
    async CopyPredefineThresholdByDI(
        @Arg('SENSOR_CD', () => String!) sensor_cd: string,
        @Arg('NAME', () => String, { nullable: true }) name: string,
        @Arg('HOLD_TIME', () => Int, { nullable: true }) hold_time: number,
        @Arg('DI', () => [DigitalValueInput!], { nullable: true }) di: DigitalValueInput[],
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

            if(name) copy_data['NAME'] = name;
            if(hold_time) copy_data['HOLD_TIME'] = hold_time;

            for(let idx = 0; idx < 30; idx++) {
                let level = undefined;
                let label = undefined;

                const finder_di = di.find((_d: DigitalValueInput) => _d.INDEX  === idx);
                if(finder_di) {
                    level = finder_di.LEVEL;
                    label = finder_di.LABEL;
                }

                copy_data[`VALUE_${idx}_LEVEL`] = level;
                copy_data[`VALUE_${idx}_LABEL`] = label;
            }
            
            const result = await getRepository(pd_sensor_threshold_di).insert(copy_data);
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