import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Args, Ctx, Mutation, PubSub, Resolver, Publisher, Query, Int, Arg } from "type-graphql";
import { DeleteResult, getRepository, In, MoreThan } from "typeorm";

import { ac_cust_hier, ac_cust_hier_args } from "../entity/database/ac_cust_hier";
import { ac_op_noti_asset, ac_op_noti_asset_input } from "../entity/database/ac_op_noti_asset";
import { ac_user } from "../entity/database/ac_user";

@Resolver()
export class AccountCustomResolver {
    @Query(() => [ac_cust_hier])
    async AccountCustomHiers(
        @Args() { TYPE }: ac_cust_hier_args,
        @Ctx() ctx: any
    ): Promise<Array<ac_cust_hier>> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_cust_hier).find({ where: { TYPE } });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => ac_cust_hier)
    async AccountCustomHier(
        @Args() { TYPE, TID }: ac_cust_hier_args,
        @Ctx() ctx: any
    ): Promise<ac_cust_hier> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_cust_hier).findOne({ where: { TYPE, TID } });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddCustomHier(
        @Args() { TYPE, NAME, P_TID, ORDER }: ac_cust_hier_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!TYPE) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });
            const last_tree_id = await getRepository(ac_cust_hier).findOne({ where: { TYPE: TYPE }, order: { TID: 'DESC' } });

            let tid: number = last_tree_id ? last_tree_id.TID + 1 : 1;
            const result = await getRepository(ac_cust_hier).insert({ TYPE, TID: tid, NAME, P_TID, ORDER, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateCustomHier(
        @Args() { TYPE, TID, NAME }: ac_cust_hier_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!TYPE) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });
            const result = await getRepository(ac_cust_hier).update({ TYPE, TID }, { NAME, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Int)
    async DeleteCustomHier(
        @Args() { TYPE, TID }: ac_cust_hier_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!TYPE) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let has_children_hier = await getRepository(ac_cust_hier).count({ TYPE, P_TID: TID });

            let result: DeleteResult;
            if (has_children_hier === 0) {
                const deleted_item = await getRepository(ac_cust_hier).findOne({ TYPE, TID });
                if (deleted_item) {
                    await getRepository(ac_cust_hier).update({ TYPE, P_TID: deleted_item.P_TID, ORDER: MoreThan(deleted_item.ORDER) }, { ORDER: () => '`ORDER` - 1' });
                }

                result = await getRepository(ac_cust_hier).delete({ TYPE, TID });
            }

            return has_children_hier > 0 ? -1 : result.affected;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddOperatorNotiAssets(
        @Arg('ADD', () => [ac_op_noti_asset_input], { nullable: true }) assets: Array<ac_op_noti_asset_input>,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });

            const insert_data: Array<ac_op_noti_asset> = [];
            assets.forEach((asset: ac_op_noti_asset_input) => {
                insert_data.push({
                    OP_ID: asset.OP_ID,
                    ASSET_ID: asset.ASSET_ID,
                    IS_NOTI_COMM: asset.IS_NOTI_COMM,
                    UPDATE_USER_ID: user.ID,
                    UPDATE_USER_DT: new Date()
                });
            });

            let is_result = 0;
            if(insert_data.length > 0) {
                const insert_result = await getRepository(ac_op_noti_asset).insert(insert_data);
                is_result += insert_result.identifiers.length;
            }
            
            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteOperatorNotiAssets(
        @Arg('REMOVE', () => [ac_op_noti_asset_input], { nullable: true }) assets: Array<ac_op_noti_asset_input>,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const delete_asset_id: Array<number> = [];
            assets.forEach((asset: ac_op_noti_asset_input) => {
                delete_asset_id.push(asset.ASSET_ID);
            });
            
            if(delete_asset_id.length > 0) {
                const op_id = assets[0].OP_ID;
                const delete_result = await getRepository(ac_op_noti_asset).delete({ OP_ID: op_id, ASSET_ID: In(delete_asset_id) });
                return delete_result.affected > 0 ? true : false;
            } else {
                return false;
            }
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}