import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";

import { ac_asset_operator } from "../entity/database/ac_asset_operator";
import { ac_company } from "../entity/database/ac_company";

@Resolver()
export class ManagerResolver {
    @Query(() => [ac_company])
    async Managers(
        @Arg('TYPE', () => String!) type: string,
        @Ctx() ctx: any
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const result = await getRepository(ac_company).find({ where: { TYPE: type }, order: { NAME: 'ASC' } });
            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}