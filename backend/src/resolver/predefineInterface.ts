import { AuthenticationError, SchemaError, UserInputError } from 'apollo-server-express';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Ctx, Mutation, Query, Resolver, PubSub, Publisher, Args, ID, Arg, Int } from "type-graphql";
import { DeleteResult, getRepository, getTreeRepository, MoreThan } from 'typeorm';

import { pd_asset_code } from '../entity/database/pd_asset_code';
import { pd_file } from '../entity/database/pd_file';
import { pd_interface, pd_interface_args } from '../entity/database/pd_interface';
import { pd_modbus_cmd, pd_modbus_cmd_arg, pd_modbus_cmd_input } from '../entity/database/pd_modbus_cmd';
import { pd_prod_intf } from '../entity/database/pd_prod_intf';
import { pd_sensor } from '../entity/database/pd_sensor';

import streamToBuffer from '../utils/streamToBuffer';

@Resolver()
export class PredefinedInterfaceResolver {
    @Query(() => [pd_asset_code])
    async PredefinedInterfaces(
        @Arg('CODE', () => String, { nullable: true }) code: string,
        @Ctx() ctx: any
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            let result = [];
            if(code) {
                result = await getRepository(pd_asset_code).find({ where: { CODE: code },  order: { CODE: 'ASC' } });
            } else {
                result = await getRepository(pd_asset_code).find({ order: { CODE: 'ASC' } });
            }
            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddInterface(
        @Args() { ASSET_CD, INTF_CD, NAME, REMARK }: pd_interface_args,
        @Ctx() ctx: any,
        @PubSub('REFRRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ASSET_CD) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!INTF_CD) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!NAME) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_interface).insert({ ASSET_CD, INTF_CD, NAME, REMARK });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateInterface(
        @Arg('ID', () => ID) ID: number,
        @Args() { ASSET_CD, INTF_CD, NAME, PROTOCOL_FILE_ID, REMARK }: pd_interface_args,
        @Arg('PROTOCOL_FILE', () => GraphQLUpload, { nullable: true }) protocolUpload: FileUpload,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let protocol_file_id = undefined;
            if (protocolUpload) {
                if (PROTOCOL_FILE_ID) {
                    await getRepository(pd_file).delete({ ID: PROTOCOL_FILE_ID });
                }

                const file_buffer: Buffer = await streamToBuffer(protocolUpload.createReadStream(), protocolUpload.mimetype);
                const result = await getRepository(pd_file).insert({ NAME: protocolUpload.filename.normalize('NFC'), MIME_TYPE: protocolUpload.mimetype, DATA: file_buffer });

                protocol_file_id = result.identifiers.pop().ID;
            } else if (PROTOCOL_FILE_ID === null) {
                const previous_protocol_file_id = (await getRepository(pd_interface).findOne(ID)).PROTOCOL_FILE_ID;
                await getRepository(pd_file).delete({ ID: previous_protocol_file_id });
                protocol_file_id = null;
            }

            const update_data = {};
            for (const [key, value] of Object.entries({ ASSET_CD, INTF_CD, NAME, REMARK, PROTOCOL_FILE_ID: protocol_file_id })) {
                if (value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(pd_interface).update({ ID: ID }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteInterface(
        @Arg('ID', () => ID) ID: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let has_child = await getRepository(pd_prod_intf).count({ PD_INTF_ID: ID });
            if (has_child > 0) {
                throw new SchemaError('제품과 연계된 인터페이스가 존재합니다');
            }

            has_child = await getRepository(pd_modbus_cmd).count({ PD_INTF_ID: ID });
            if (has_child > 0) {
                throw new SchemaError('지정 인터페이스 안에 등록된 통신방법이 존재합니다');
            }

            has_child = await getRepository(pd_sensor).count({ PD_INTF_ID: ID });
            if (has_child > 0) {
                throw new SchemaError('지정 인터페이스 안에 등록된 임계치 정보가 존재합니다');
            }

            // by shkoh 20220225: 미구현. 추후에 Interface와 연계된 제어 컨트롤도 체크함
            let result: DeleteResult;
            if (has_child === 0) {
                const predefine_interface_data = await getRepository(pd_interface).findOne(ID);
                if (predefine_interface_data.PROTOCOL_FILE_ID) await getRepository(pd_file).delete({ ID: predefine_interface_data.PROTOCOL_FILE_ID });

                // by shkoh 20211007: 추후에 인터페이스와 연관된 모든 정보(통신방법, 수집항목, 제어항목 등등)를 삭제해야함
                await getRepository(pd_modbus_cmd).delete({ PD_INTF_ID: ID });

                result = await getRepository(pd_interface).delete(ID);
            }

            return has_child > 0 ? false : result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => pd_interface, { nullable: true })
    async PredefineInterface(@Arg('ID', () => ID) interface_id: number, @Ctx() ctx: any): Promise<pd_interface> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if (!interface_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            return (await getRepository(pd_interface).findOne({ where: { ID: interface_id } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [pd_modbus_cmd], { nullable: true })
    async PredefineModbusCommands(@Arg('PD_INTF_ID', () => Int) pd_interface_id: number, @Ctx() ctx: any): Promise<pd_modbus_cmd[]> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if (!pd_interface_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            return (await getRepository(pd_modbus_cmd).find({ where: { PD_INTF_ID: pd_interface_id } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddPredefineModbusCommand(
        @Arg('PD_INTF_ID', () => Int) pd_interface_id: number,
        @Arg('MC_ID', () => Int) mc_id: number,
        @Args() { FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD }: pd_modbus_cmd_arg,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!pd_interface_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!mc_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_modbus_cmd).insert({ PD_INTF_ID: pd_interface_id, MC_ID: mc_id, FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => pd_modbus_cmd, { nullable: true })
    async UpdatePredefineModbusCommand(
        @Arg('PD_INTF_ID', () => Int) pd_interface_id: number,
        @Arg('MC_ID', () => Int) mc_id: number,
        @Args() { FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD }: pd_modbus_cmd_arg,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!pd_interface_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!mc_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const update_data = {};
            for (const [key, value] of Object.entries({ FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD })) {
                if (value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(pd_modbus_cmd).update({ PD_INTF_ID: pd_interface_id, MC_ID: mc_id }, update_data);

            let updated_data: pd_modbus_cmd | undefined;
            if (result.affected > 0) {
                updated_data = await getRepository(pd_modbus_cmd).findOne({ PD_INTF_ID: pd_interface_id, MC_ID: mc_id });
            }

            return updated_data;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeletePredefineModbusCommand(
        @Arg('PD_INTF_ID', () => Int) pd_interface_id: number,
        @Arg('MC_ID', () => Int) mc_id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!pd_interface_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!mc_id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let is_result = 0;
            const result = await getRepository(pd_modbus_cmd).delete({ PD_INTF_ID: pd_interface_id, MC_ID: mc_id });
            is_result += result.affected;
            if (result.affected > 0) {
                // by shkoh 20211019: 삭제 후 ID를 맞추는 동작 구현 필요
                const update_result = await getRepository(pd_modbus_cmd).update({ PD_INTF_ID: pd_interface_id, MC_ID: MoreThan(mc_id) }, { MC_ID: () => 'MC_ID - 1' });
                is_result += update_result.affected;
            }

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean, { nullable: true })
    async UpdatePredefineModbusCommands(
        @Arg('Input', () => [pd_modbus_cmd_input], { nullable: true }) input: pd_modbus_cmd_input[],
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (input.length === 0) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');

            let is_result: number = 0;
            input.forEach(async (comm: pd_modbus_cmd_input) => {
                const { PD_INTF_ID, MC_ID, FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD } = comm;
                const result = await getRepository(pd_modbus_cmd).update({ PD_INTF_ID, MC_ID }, { FUNC_NO, START_ADDR, POINT_CNT, DTYPE_CD });
                is_result += result.affected;
            });

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}