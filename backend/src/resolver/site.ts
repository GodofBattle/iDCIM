import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Ctx, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";

import { ac_config } from "../entity/database/ac_config";

@Resolver()
export class SiteResolver {
    @Query(() => ac_config)
    async Site(@Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(ac_config).findOne({ where: { ID: 1 } }));
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async SetSite(
        @Arg('NAME', () => String!) name: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!name) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(ac_config).update({ ID: 1 }, { SITE_NAME: name });
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}