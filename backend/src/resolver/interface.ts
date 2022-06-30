import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { cn_interface } from "../entity/database/cn_interface";
import { pd_prod_intf } from "../entity/database/pd_prod_intf";

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
}