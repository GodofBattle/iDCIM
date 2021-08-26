import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Args, Ctx, Mutation, Query, Resolver, PubSub, Publisher } from "type-graphql";
import { getRepository } from "typeorm";

import { pd_manufacturer, pd_manufacturer_args } from '../entity/database/pd_manufacturer';
import { pd_product } from '../entity/database/pd_product';

@Resolver()
export class PredefinedProductResolver {
    @Mutation(() => Boolean)
    async AddManufacturer(
        @Args() { NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK }: pd_manufacturer_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!NAME) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_manufacturer).insert({ NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [pd_manufacturer])
    async Manufacturers(@Ctx() ctx: any) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_manufacturer).find({ order: { NAME: 'ASC' } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}