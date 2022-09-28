import jwt from 'jsonwebtoken';
import { privateKey, accessTokenExpiresIn } from '../utils/privatekey';

import { AuthenticationError, SchemaError } from 'apollo-server-express';
import { Resolver, Arg, Query, Mutation, Ctx, Subscription, Publisher, PubSub, Int } from 'type-graphql';
import { getRepository, Like } from 'typeorm';

import { ac_user } from '../entity/database/ac_user';
import { Account } from '../entity/web/account';
import { PERM_CD } from '../enum/PERM';
import { Token } from '../entity/web/token';
import { ac_user_group } from '../entity/database/ac_user_group';

const PERM = PERM_CD;

@Resolver()
export class UserResolver {
    @Query(() => ac_user!)
    async User(
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();
            return (await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [ac_user])
    async Users(
        @Ctx() ctx: any
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_user).find({ select: [ 'ID', 'NAME', 'PERM_CD', 'USER_ID', 'USER_GROUP_ID' ] });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => ac_user)
    async UserInfo(
        @Arg('ID', () => Int, { nullable: false }) id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_user).findOne({ ID: id });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => Boolean)
    async hasUserId(
        @Arg('USER_ID', () => String, { nullable: true }) user_id: string,
        @Ctx() ctx: any
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const has_user = await getRepository(ac_user).count({ USER_ID: user_id });
            return has_user === 1;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddManager(
        @Arg('USER_ID', () => String) user_id: string,
        @Arg('NAME', () => String) name: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const insert_data = {
                PERM_CD: 'PERM02',
                USER_ID: user_id,
                NAME: name,
                PASSWD: user_id,
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            }
            const insert_result = await getRepository(ac_user).insert(insert_data);
            return insert_result.identifiers.length === 1;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteUser(
        @Arg('USER_ID', () => String) user_id: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();
            
            const delete_result = await getRepository(ac_user).delete({ USER_ID: user_id });
            return delete_result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async ResetPassword(
        @Arg('USER_ID', () => String) user_id: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();
            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const update_result = await getRepository(ac_user).update({ USER_ID: user_id }, { PASSWD: user_id, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            return update_result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => String)
    async UserName(
        @Arg('userId') user_id: string,
        @Arg('newName') new_name: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            await getRepository(ac_user).update({ USER_ID: user_id }, { NAME: new_name, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            return new_name;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Account!)
    async Login(@Arg('userId') user_id: string, @Arg('password') password: string, @Ctx() ctx: any) {
        if (ctx.isAuth) {
            throw new AuthenticationError('이미 인증되었습니다');
        }

        try {
            const user = await getRepository(ac_user).findOne({ where: { USER_ID: Like(user_id), PASSWD: Like(password) } });
            if (!!user) {
                const access_token = jwt.sign(
                    { iDCIM: { roles: user.PERM_CD, permission: PERM[user.PERM_CD].toString() } },
                    privateKey,
                    { algorithm: 'HS256', subject: user.USER_ID, expiresIn: accessTokenExpiresIn }
                );

                const account = new Account({ role: PERM[user.PERM_CD], access_token, user });
                return account;
            } else {
                throw new AuthenticationError('ID 혹은 패스워드를 확인하세요');
            }
        } catch (err) {
            throw new AuthenticationError('로그인 실패');
        }
    }

    @Mutation(() => Boolean)
    async AddOperatorGroup(
        @Arg('NAME', () => String) name: string,
        @Arg('REMARK', () => String, { nullable: true }) remark: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const insert_data = {
                NAME: name,
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date(),
                REMARK: remark
            };

            const inserst_result = await getRepository(ac_user_group).insert(insert_data);
            return inserst_result.identifiers.length === 1;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    // by shkoh 20210728: TOKEN Subscription
    @Subscription(() => Token, { topics: 'REFRESHTOKEN' })
    RefreshToken(@Ctx() ctx: any): Token {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않았습니다');
        }

        const access_token = jwt.sign({ iDCIM: ctx.user.iDCIM }, privateKey, { algorithm: 'HS256', subject: ctx.user.sub, expiresIn: accessTokenExpiresIn });
        const token: Token = new Token({ access_token: access_token });
        return token;
    }
}