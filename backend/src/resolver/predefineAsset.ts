import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Query, Resolver, Ctx, Mutation, PubSub, Publisher, Arg, Args, Int, ID } from "type-graphql";
import { DeleteResult, getRepository } from "typeorm";

import { pd_asset_code, pd_asset_code_args } from '../entity/database/pd_asset_code';
import { pd_asset_hier, pd_asset_hier_args } from "../entity/database/pd_asset_hier";
import { pd_interface } from "../entity/database/pd_interface";
import { pd_product } from "../entity/database/pd_product";

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

    @Query(() => pd_asset_code, { nullable: true })
    async PredefinedAssetCode(
        @Arg('CODE', () => String) code: string,
        @Ctx() ctx: any
    ): Promise<pd_asset_code> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const result = await getRepository(pd_asset_code).findOne({ where: { CODE: code } });
            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddPredefinedAssetCode(
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
    async UpdatePredefinedAssetCode(
        @Arg('ID', () => String) id: string,
        @Args() { CODE, NAME, ALIAS }: pd_asset_code_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!CODE) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_asset_code).update({ CODE: id }, { CODE, NAME, ALIAS });
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Int)
    async DeletePredefinedAssetCode(
        @Arg('CODE', () => String) code: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!code) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let has_used = await getRepository(pd_interface).count({ ASSET_CD: code });
            if (has_used === 0) {
                has_used = await getRepository(pd_product).count({ ASSET_CD: code });
            }

            let result: DeleteResult;
            if (has_used === 0) {
                result = await getRepository(pd_asset_code).delete({ CODE: code });
            }

            return has_used > 0 ? -1 : result.affected;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => pd_asset_hier)
    async PredefinedAssetHier(
        @Arg('ID', () => ID, { nullable: false }) id: number,
        @Ctx() ctx: any
    ): Promise<pd_asset_hier> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const result = await getRepository(pd_asset_hier).findOne({ ID: id });
            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddPredefinedAssetHier(
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

    @Mutation(() => Boolean)
    async UpdatePredefinedAssetHier(
        @Arg('ID', () => ID) id: number,
        @Arg('NAME', () => String) name: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!name) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_asset_hier).update({ ID: id }, { NAME: name });
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Int)
    async DeletePredefinedAssetHier(
        @Arg('ID', () => ID) id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let has_children_hier = await getRepository(pd_asset_hier).count({ P_ID: id });
            if (has_children_hier === 0) {
                has_children_hier = await getRepository(pd_asset_code).count({ PD_ASSET_HIER_ID: id });
            }

            let result: DeleteResult;
            if (has_children_hier === 0) {
                result = await getRepository(pd_asset_hier).delete({ ID: id });
            }

            return has_children_hier > 0 ? -1 : result.affected;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}