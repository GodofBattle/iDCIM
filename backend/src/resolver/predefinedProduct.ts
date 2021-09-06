import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Args, Ctx, Mutation, Query, Resolver, PubSub, Publisher, Arg, Int, ID } from "type-graphql";
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

    @Mutation(() => Boolean)
    async UpdateManufacturer(
        @Arg('ID', () => ID) ID: number,
        @Args() { NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK }: pd_manufacturer_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            // by shkoh 20210902: 전달받은 인자들 중에서 데이터가 존재하는 인자들만 적용
            const update_data = {};
            for (const [key, value] of Object.entries({ NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK })) {
                if (value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(pd_manufacturer).update({ ID: ID }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteManufacturer(
        @Arg('ID', () => ID) ID: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_manufacturer).delete(ID);
            return result.affected > 0 ? true : false;
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

    @Query(() => pd_manufacturer, { nullable: true })
    async Manufacturer(@Arg('ID', () => ID) manufacturer_id: number, @Ctx() ctx: any): Promise<pd_manufacturer> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_manufacturer).findOne({ where: { ID: manufacturer_id } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}