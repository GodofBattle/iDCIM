import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";

import { pd_code } from '../entity/database/pd_code'

@Resolver()
export class CodeResolver {
    @Query(() => [pd_code], { nullable: true })
    async Codes(
        @Arg('TYPE', () => String, { nullable: true }) type: string,
        @Ctx() ctx: any
    ): Promise<pd_code[]> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            let codes: Array<pd_code> = [];

            if (type) codes = await getRepository(pd_code).find({ TYPE: type });
            else codes = await getRepository(pd_code).find();

            return codes;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}