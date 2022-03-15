import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Args, Ctx, Mutation, PubSub, Resolver, Publisher, Query, Int } from "type-graphql";
import { DeleteResult, getRepository, MoreThan } from "typeorm";

import { ac_cust_hier, ac_cust_hier_args } from "../entity/database/ac_cust_hier";
import { ac_user } from "../entity/database/ac_user";

@Resolver()
export class AccountCustomResolver {
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

            const result = await getRepository(ac_cust_hier).insert({ TYPE, TID: last_tree_id.TID + 1, NAME, P_TID, ORDER, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
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
}