import jwt from 'jsonwebtoken';
import { privateKey, accessTokenExpiresIn } from '../utils/privatekey';

import { AuthenticationError, SchemaError, UserInputError } from 'apollo-server-express';
import { Resolver, Arg, Query, Mutation, Ctx, Subscription, Publisher, PubSub, Int } from 'type-graphql';
import { getRepository, In, Like } from 'typeorm';

import { ac_user } from '../entity/database/ac_user';
import { Account } from '../entity/web/account';
import { PERM_CD } from '../enum/PERM';
import { Token } from '../entity/web/token';
import { ac_user_group } from '../entity/database/ac_user_group';
import { ac_user_group_asset, ac_user_group_asset_input } from '../entity/database/ac_user_group_asset';

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
            // await publish(); 
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
    async AddUser(
        @Arg('USER_ID', () => String) user_id: string,
        @Arg('NAME', () => String) name: string,
        @Arg('PERM_CD', () => String) perm_cd: string,
        @Arg('USER_GROUP_ID', () => Int, { nullable: true }) user_group_id: number | undefined,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(user_id.length < 2) {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            if(name.length < 1) {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            if(perm_cd !== 'PERM02' && perm_cd !== 'PERM03') {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const insert_data = {
                PERM_CD: perm_cd,
                USER_ID: user_id,
                NAME: name,
                PASSWD: user_id,
                USER_GROUP_ID: user_group_id,
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

    @Query(() => ac_user_group)
    async OperatorGroup(
        @Arg('ID', () => Int) id: number,
        @Ctx() ctx: any
    ): Promise<ac_user_group> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_user_group).findOne({ ID: id });
        } catch (err) {
            throw new SchemaError(err.message);
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

            const insert_result = await getRepository(ac_user_group).insert(insert_data);
            return insert_result.identifiers.length === 1;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateOperatorGroup(
        @Arg('ID', () => Int) id: number,
        @Arg('NAME', () => String, { nullable: true }) name: string,
        @Arg('REMARK', () => String, { nullable: true }) remark: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!id || (!name && !remark)) {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const update_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };

            if(name !== undefined) {
                update_data['NAME'] = name;
            }

            if(remark !== undefined) {
                update_data['REMARK'] = remark;
            }
            
            const update_result = await getRepository(ac_user_group).update({ ID: id }, update_data);
            return update_result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteOperatorGroup(
        @Arg('ID', () => Int) id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const has_operator = await getRepository(ac_user).count({ USER_GROUP_ID: id });
            if(has_operator > 0) {
                return false;
            }

            const delete_result = await getRepository(ac_user_group).delete({ ID: id });
            return delete_result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [ac_user_group_asset])
    async UserGroupAssets(
        @Arg('USER_GROUP_ID', () => Int) user_group_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_user_group_asset).find({ USER_GROUP_ID: user_group_id });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddUserGroupAssets(
        @Arg('ADD', () => [ac_user_group_asset_input], { nullable: true }) assets: Array<ac_user_group_asset_input>,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });
            const insert_data: Array<any> = [];
            assets.forEach((asset: ac_user_group_asset_input) => {
                insert_data.push({
                    ASSET_ID: asset.ASSET_ID,
                    USER_GROUP_ID: asset.USER_GROUP_ID,
                    UPDATE_USER_ID: user.ID,
                    UPDATE_USER_DT: new Date()
                });
            });

            let is_result = 0;
            if(insert_data.length > 0) {
                const insert_result = await getRepository(ac_user_group_asset).insert(insert_data);
                is_result += insert_result.identifiers.length;
            }

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteUserGroupAssets(
        @Arg('REMOVE', () => [ac_user_group_asset_input], { nullable: true }) assets: Array<ac_user_group_asset_input>,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않는 접근입니다');
        }

        try {
            await publish();

            const delete_asset_id: Array<number> = [];
            assets.forEach((asset: ac_user_group_asset_input) => {
                delete_asset_id.push(asset.ASSET_ID);
            });

            if(delete_asset_id.length > 0) {
                const { USER_GROUP_ID } = assets[0];
                const delete_result = await getRepository(ac_user_group_asset).delete({ USER_GROUP_ID, ASSET_ID: In(delete_asset_id) });
                return delete_result.affected > 0 ? true : false;
            } else {
                return false;
            }
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

        console.info(ctx);

        const access_token = jwt.sign({ iDCIM: ctx.user.iDCIM }, privateKey, { algorithm: 'HS256', subject: ctx.user.sub, expiresIn: accessTokenExpiresIn });
        const token: Token = new Token({ access_token: access_token });

        return token;
    }
}