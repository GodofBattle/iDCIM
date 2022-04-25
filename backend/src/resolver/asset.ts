import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Arg, Ctx, Query, Resolver, Subscription } from "type-graphql";
import { getRepository } from "typeorm";
import { ac_asset } from "../entity/database/ac_asset";

@Resolver()
export class AssetResolver {
    @Query(() => [ac_asset])
    async Assets(
        @Arg('TYPE', () => String, { nullable: true }) type: string,
        @Arg('KEYS', () => [String], { nullable: true }) keys: Array<string>,
        @Ctx() ctx: any
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            console.info(type, keys);

            const result = await getRepository(ac_asset).find();
            return result;
        } catch (err) {
            throw new SchemaError(err.message)
        }
    }
}