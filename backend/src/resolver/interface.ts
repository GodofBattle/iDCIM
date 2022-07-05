import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, ID, Int, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getRepository, MoreThan } from "typeorm";
import { ac_user } from "../entity/database/ac_user";
import { cn_interface, cn_interface_args } from "../entity/database/cn_interface";
import { cn_modbus_cmd, cn_modbus_cmd_args, cn_modbus_cmd_input } from "../entity/database/cn_modbus_cmd";

@Resolver()
export class InterfaceResolver {
    @Query(() => Int)
    async CountOfInterfaces(
        @Arg('PROD_INTF_ID', () => Int, { nullable: true }) prod_intf_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(prod_intf_id === undefined) {
                return 0;
            }

            return (await getRepository(cn_interface).count({ PROD_INTF_ID: prod_intf_id }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateAssetInterface(
        @Arg('ID', () => ID) id: number,
        @Args() { IP_ADDR, PORT, DEVICE_ID, POLL_INTERVAL, TIMEOUT, RETRY, ACCESS_INFO, ODBC_QUERY, IS_USE }: cn_interface_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다')
        }

        try {
            await publish();

            if(!id) throw new UserInputError('전달된 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });

            const update_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };
            for(const [key, value] of Object.entries({ IP_ADDR, PORT, DEVICE_ID, POLL_INTERVAL, TIMEOUT, RETRY, ACCESS_INFO, ODBC_QUERY, IS_USE })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(cn_interface).update({ ID: id }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [cn_modbus_cmd])
    async ModbusCommands(
        @Arg('INTF_ID', () => Int) intf_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!intf_id) throw new UserInputError('전달된 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            return await getRepository(cn_modbus_cmd).find({ INTF_ID: intf_id });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddModbusCommand(
        @Arg('INTF_ID', () => Int) intf_id: number,
        @Arg('MC_ID', () => Int) mc_id: number,
        @Args() { FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD }: cn_modbus_cmd_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!intf_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if(!mc_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });
            const result = await getRepository(cn_modbus_cmd).insert({ INTF_ID: intf_id, MC_ID: mc_id, FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => cn_modbus_cmd, { nullable: true })
    async UpdateModbusCommand(
        @Arg('INTF_ID', () => Int) intf_id: number,
        @Arg('MC_ID', () => Int) mc_id: number,
        @Args() { FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD }: cn_modbus_cmd_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!intf_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if(!mc_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            await publish();

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });
            const update_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };
            for(const [key, value] of Object.entries({ FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(cn_modbus_cmd).update({ INTF_ID: intf_id, MC_ID: mc_id }, update_data);
            let updated_data: cn_modbus_cmd | null;
            if(result.affected > 0) {
                updated_data = await getRepository(cn_modbus_cmd).findOne({ INTF_ID: intf_id, MC_ID: mc_id });
            }

            return updated_data;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean, { nullable: true })
    async UpdateModbusCommands(
        @Arg('Input', () => [cn_modbus_cmd_input], { nullable: true }) input: Array<cn_modbus_cmd_input>,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(input.length === 0) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');

            await publish();

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });
            const now = new Date();
            
            let is_result: number = 0;
            input.forEach(async (comm: cn_modbus_cmd_input) => {
                const { INTF_ID, MC_ID, FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD } = comm;
                const result = await getRepository(cn_modbus_cmd).update({ INTF_ID, MC_ID }, { FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: now });
                is_result += result.affected;
            });

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteModbusCommand(
        @Arg('INTF_ID', () => Int) intf_id: number,
        @Arg('MC_ID', () => Int) mc_id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!intf_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if(!mc_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            
            await publish();

            let is_result: number = 0;
            const delete_result = await getRepository(cn_modbus_cmd).delete({ INTF_ID: intf_id, MC_ID: mc_id });
            is_result += delete_result.affected;
            if(delete_result.affected > 0) {
                const update_result = await getRepository(cn_modbus_cmd).update({ INTF_ID: intf_id, MC_ID: MoreThan(mc_id) }, { MC_ID: () => 'MC_ID - 1' });
                is_result += update_result.affected;
            }

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}