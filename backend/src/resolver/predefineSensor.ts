import { Arg, Ctx, Query, Resolver, Int, Mutation, PubSub, Publisher, Args } from "type-graphql";
import { Between, getRepository, MoreThan } from "typeorm";
import { AuthenticationError, SchemaError, UserInputError } from 'apollo-server-express';

import { pd_sensor, pd_sensor_args, pd_sensor_input } from "../entity/database/pd_sensor";

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

    @Mutation(() => Boolean)
    async AddPredefineSensor(
        @Arg('PD_INTF_ID') pd_intf_id: number,
        @Arg('NODE_ID') node_id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!pd_intf_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if(!node_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            // by shkoh 20211118: 데이터의 값을 null로 처리하지 않고 반드시 값을 기입해준다
            const result = await getRepository(pd_sensor).insert({ PD_INTF_ID: pd_intf_id, NODE_ID: node_id, DATA_ADDRESS: '', MC_ID: 0, DISP_POWER: 0 });
            return result.identifiers.length > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdatePredefineSensor(
        @Arg('ID', () => Int) id: number,
        @Args() { NAME, SENSOR_CD, PD_THRESHOLD_ID, DATA_ADDRESS, ADJUST_VALUE, MC_ID, DISP_POWER, IS_NOTI, IS_MKSTATS }: pd_sensor_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const update_data = {};
            for(const [ key, value ] of Object.entries({ NAME, SENSOR_CD, PD_THRESHOLD_ID, DATA_ADDRESS, ADJUST_VALUE, MC_ID, DISP_POWER, IS_NOTI, IS_MKSTATS })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(pd_sensor).update({ ID: id }, update_data);
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeletePredefineSensor(
        @Arg('ID', () => Int) id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            // by shkoh 20211119: 삭제할 데이터를 임시 보관
            const delete_sensor = await getRepository(pd_sensor).findOne({ ID: id });

            let is_result = 0;
            const result = await getRepository(pd_sensor).delete({ ID: id });
            is_result += result.affected;
            if(result.affected > 0) {
                // by shkoh 20211119: 삭제 후 NODE_ID를 재정리함
                const update_result = await getRepository(pd_sensor).update({ PD_INTF_ID: delete_sensor.PD_INTF_ID, NODE_ID: MoreThan(delete_sensor.NODE_ID) }, { NODE_ID: () => 'NODE_ID - 1' });
                is_result += update_result.affected;
            }

            return is_result > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async CopyPredefineSensor(
        @Arg('PD_INTF_ID', () => Int!) pd_interface_id: number,
        @Arg('NODE_ID', () => Int!) node_id: number,
        @Args() { NAME, ADJUST_VALUE, DATA_ADDRESS, MC_ID, SENSOR_CD, DISP_POWER, PD_THRESHOLD_ID, IS_NOTI, IS_MKSTATS }: pd_sensor_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!pd_interface_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if(!node_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let is_result = 0;
            // by shkoh 20211119: 복사를 하여 새로 추가하기 전에 NODE_ID를 재정리함
            const update_result = await getRepository(pd_sensor).update({ PD_INTF_ID: pd_interface_id, NODE_ID: MoreThan(node_id) }, { NODE_ID: () => 'NODE_ID + 1' });
            is_result += update_result.affected;

            const insert_result = await getRepository(pd_sensor).insert({ NAME, ADJUST_VALUE, DATA_ADDRESS, MC_ID, SENSOR_CD, DISP_POWER, PD_THRESHOLD_ID, IS_NOTI, IS_MKSTATS, PD_INTF_ID: pd_interface_id, NODE_ID: node_id + 1 });
            is_result += insert_result.identifiers.length;

            return is_result > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean, { nullable: true })
    async UpdatePredefineSensors(
        @Arg('Input', () => [pd_sensor_input], { nullable: true }) input: pd_sensor_input[],
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
            input.forEach(async (sensor: pd_sensor_input) => {
                const { ID, NAME, ADJUST_VALUE, DATA_ADDRESS, MC_ID, SENSOR_CD, DISP_POWER, PD_THRESHOLD_ID, IS_NOTI, IS_MKSTATS } = sensor;
                const result = await getRepository(pd_sensor).update({ ID: ID }, { NAME, ADJUST_VALUE, DATA_ADDRESS, MC_ID, SENSOR_CD, DISP_POWER, PD_THRESHOLD_ID, IS_NOTI, IS_MKSTATS });
                is_result += result.affected;
            });

            return is_result > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean, { nullable: true })
    async ReorderPredefineSensors(
        @Arg('ID', () => Int, { nullable: true }) id: number,
        @Arg('PD_INTF_ID', () => Int, { nullable: true }) pd_intf_id: number,
        @Arg('START', () => Int, { nullable: true }) start_node: number,
        @Arg('END', () => Int, { nullable: true }) end_node: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');   
        }

        try {
            await publish();

            if(!id) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');
            if(!pd_intf_id) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');
            if(!start_node) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');
            if(!end_node) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');

            let is_result: number = 0;

            const start_idx = end_node - start_node > 0 ? start_node + 1 : end_node;
            const end_idx = end_node - start_node > 0 ? end_node : start_node - 1;
            const calc_node = end_node - start_node > 0 ? 'NODE_ID - 1' : 'NODE_ID + 1';
            
            const arrage_node = await getRepository(pd_sensor).update({ PD_INTF_ID: pd_intf_id, NODE_ID: Between(start_idx, end_idx) }, { NODE_ID: () => calc_node });
            is_result += arrage_node.affected;

            const reorder = await getRepository(pd_sensor).update({ ID: id }, { NODE_ID: end_node });
            is_result += reorder.affected;

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}