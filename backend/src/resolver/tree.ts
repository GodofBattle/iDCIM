import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Ctx, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";

import { ac_config } from "../entity/database/ac_config";

@Resolver()
export class TreeResolver {
    @Query(() => Boolean)
    async AssetTree(@Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const root = await getRepository(ac_config).findOne({ where: { ID: 1 } });
            console.info(root);
            return false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}