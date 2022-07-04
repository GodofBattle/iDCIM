import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, ID, Int, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { ac_user } from "../entity/database/ac_user";
import { cn_interface, cn_interface_args } from "../entity/database/cn_interface";

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
}