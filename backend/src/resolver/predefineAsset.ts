import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Query, Resolver, Ctx, Mutation, PubSub, Publisher, Arg, Args } from "type-graphql";
import { getRepository } from "typeorm";

import { pd_asset_code, pd_asset_code_args } from '../entity/database/pd_asset_code';
import { pd_asset_hier, pd_asset_hier_args } from "../entity/database/pd_asset_hier";

@Resolver()
export class PredefinedAssetResolver {
    @Query(() => [pd_asset_code])
    async PredefinedAssetCodes(@Ctx() ctx: any) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_asset_code).find({ order: { CODE: 'ASC' } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddPredefineAssetCode(
        @Args() { CODE, NAME, ALIAS, PD_ASSET_HIER_ID, ORDER }: pd_asset_code_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!CODE) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!NAME) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!PD_ASSET_HIER_ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!ORDER) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const insert_data = {};
            for (const [key, value] of Object.entries({ CODE, NAME, ALIAS, PD_ASSET_HIER_ID, ORDER })) {
                if (value !== undefined) insert_data[key] = value;
            }

            const result = await getRepository(pd_asset_code).insert(insert_data);
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddPredefineAssetCodeHier(
        @Args() { NAME, P_ID, ORDER }: pd_asset_hier_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!NAME) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!P_ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!ORDER) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_asset_hier).insert({ NAME, P_ID, ORDER });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}