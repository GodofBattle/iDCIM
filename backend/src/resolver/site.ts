import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Ctx, Int, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";

import { ac_user } from '../entity/database/ac_user';
import { ac_config } from "../entity/database/ac_config";
import { isNumber } from "util";

@Resolver()
export class SiteResolver {
    @Query(() => ac_config)
    async Site(@Ctx() ctx: any) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(ac_config).findOne({ where: { ID: 1 } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => String)
    async GetSiteTheme() {
        try {
            return (await getRepository(ac_config).findOne({ where: { ID: 1 } })).THEME_TYPE;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async SetSiteName(
        @Arg('NAME', () => String!) name: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!name) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });
            const result = await getRepository(ac_config).update({ ID: 1 }, { SITE_NAME: name, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async SetSiteAlert(
        @Arg('SMS', () => Int!) is_sms: number,
        @Arg('EMAIL', () => Int!) is_email: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (is_sms !== 0 && is_sms !== 1) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (is_email !== 0 && is_email !== 1) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });
            const result = await getRepository(ac_config).update({ ID: 1 }, { IS_ENABLE_SMS: is_sms, IS_ENABLE_EMAIL: is_email, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async SetSiteTheme(
        @Arg('THEME', () => String!) theme: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (theme !== 'B' && theme !== 'W') throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });
            const result = await getRepository(ac_config).update({ ID: 1 }, { THEME_TYPE: theme, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async SetTreeConfig(
        @Arg('IS_ENABLE_P', () => Int, { nullable: true }) is_enable_p: number,
        @Arg('IS_ENABLE_C', () => Int, { nullable: true }) is_enable_c: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            let is_success = 0;

            if (isNumber(is_enable_p)) {
                const result = await getRepository(ac_config).update({ ID: 1 }, { IS_ENABLE_CUST_HIER_P: is_enable_p, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
                is_success += result.affected;
            } else if (is_enable_p !== undefined) {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            if (is_success === 0) {
                if (isNumber(is_enable_c)) {
                    const result = await getRepository(ac_config).update({ ID: 1 }, { IS_ENABLE_CUST_HIER_C: is_enable_c, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
                    is_success += result.affected;
                } else if (is_enable_c !== undefined) {
                    throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
                }
            }

            return is_success > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}