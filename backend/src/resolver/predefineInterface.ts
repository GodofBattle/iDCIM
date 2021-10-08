import { AuthenticationError, SchemaError, UserInputError } from 'apollo-server-express';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Ctx, Mutation, Query, Resolver, PubSub, Publisher, Args, ID, Arg } from "type-graphql";
import { getRepository } from 'typeorm';

import { pd_asset_code } from '../entity/database/pd_asset_code';
import { pd_file } from '../entity/database/pd_file';
import { pd_interface, pd_interface_args } from '../entity/database/pd_interface';

import streamToBuffer from '../utils/streamToBuffer';

@Resolver()
export class PredefinedInterfaceResolver {
    @Query(() => [pd_asset_code])
    async PredefinedInterfaces(@Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const result = await getRepository(pd_asset_code).find({ order: { CODE: 'ASC' } });
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
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!ASSET_CD) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if(!INTF_CD) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if(!NAME) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_interface).insert({ ASSET_CD, INTF_CD, NAME, REMARK });
            return result.identifiers.length > 0 ? true : false;
        } catch(err) {
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

            if(!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let protocol_file_id = undefined;
            if(protocolUpload) {
                if(PROTOCOL_FILE_ID) {
                    await getRepository(pd_file).delete({ ID: PROTOCOL_FILE_ID });
                }

                const file_buffer: Buffer = await streamToBuffer(protocolUpload.createReadStream(), protocolUpload.mimetype);
                const result = await getRepository(pd_file).insert({ NAME: protocolUpload.filename.normalize('NFC'), MIME_TYPE: protocolUpload.mimetype, DATA: file_buffer });

                protocol_file_id = result.identifiers.pop().ID;
            } else if(PROTOCOL_FILE_ID === null) {
                const previous_protocol_file_id = (await getRepository(pd_interface).findOne(ID)).PROTOCOL_FILE_ID;
                await getRepository(pd_file).delete({ ID: previous_protocol_file_id });
                protocol_file_id = null;
            }

            const update_data = {};
            for (const [key, value] of Object.entries({ ASSET_CD, INTF_CD, NAME, REMARK, PROTOCOL_FILE_ID: protocol_file_id })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(pd_interface).update({ ID: ID }, update_data);
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteInterface(
        @Arg('ID', () => ID) ID: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            // by shkoh 20211007: 미구현. 추후에 Interface의 존재여부를 파악하여 삭제를 막음
            // by shkoh 20211007: 예시
            // const hasChild = await getRepository(pd_product).count({ where: { MANUFACTURER_ID: ID } });

            // if (hasChild > 0) {
            //     throw new SchemaError('제품이 존재합니다');
            // }

            const predefine_interface_data = await getRepository(pd_interface).findOne(ID);
            if(predefine_interface_data.PROTOCOL_FILE_ID) await getRepository(pd_file).delete({ ID: predefine_interface_data.PROTOCOL_FILE_ID });

            // by shkoh 20211007: 추후에 인터페이스와 연관된 모든 정보(통신방법, 수집항목, 제어항목 등등)를 삭제해야함

            const result = await getRepository(pd_interface).delete(ID);
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => pd_interface, { nullable: true })
    async PredefineInterface(@Arg('ID', () => ID) interface_id: number, @Ctx() ctx: any): Promise<pd_interface> | undefined {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            return (await getRepository(pd_interface).findOne({ where: { ID: interface_id } }));
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}