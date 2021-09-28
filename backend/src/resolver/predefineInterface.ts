import { AuthenticationError, SchemaError } from 'apollo-server-express';
import { Ctx, Query, Resolver } from "type-graphql";
import { getRepository } from 'typeorm';

import { pd_asset_code } from '../entity/database/pd_asset_code';

@Resolver()
export class PredefinedInterfaceResolver {
    @Query(() => [pd_asset_code])
    async PredefinedInterfaces(@Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_asset_code).find({ order: { CODE: 'ASC' } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}