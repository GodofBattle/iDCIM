import jwt from 'jsonwebtoken';
import { privateKey } from '../utils/privatekey';

import { AuthenticationError } from 'apollo-server-express';
import { Resolver, Arg, Query, Mutation, Ctx, Authorized } from 'type-graphql';
import { getRepository } from 'typeorm';

import { ac_user } from '../entity/database/ac_user';
import { Account } from '../entity/web/account';
import { PERM_CD } from '../enum/PERM';

const PERM = PERM_CD;

@Resolver()
export class UserResolver {
    @Query(() => ac_user!)
    async User(@Ctx() ctx: any) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user_id } }));
        } catch(err) {
            return err;
        }
    }

    @Mutation(() => String)
    async UserName(@Arg('userId') user_id: string, @Arg('newName') new_name: string) {
        try {
            const response = await getRepository(ac_user).update( { USER_ID: user_id }, { NAME: new_name, UPDATE_USER_ID: 0, UPDATE_USER_DT: new Date() } );
            console.info(response);
            return new_name;
        } catch (err) {
            return err;
        }
    }

    @Mutation(() => Account!)
    async Login(@Arg('userId') user_id: string, @Arg('password') password: string, @Ctx() ctx: any) {
        if(ctx.isAuth) {
            throw new AuthenticationError('이미 인증되었습니다');
        }
        
        try {
            const user = await getRepository(ac_user).findOne({ where: { USER_ID: user_id, PASSWD: password } });
            if(!!user) {
                const access_token = jwt.sign(
                    { iDCIM: { roles: [ user.PERM_CD ], permission: PERM[user.PERM_CD].toString() } },
                    privateKey,
                    { algorithm: 'HS256', subject: user.USER_ID, expiresIn: '1m' }
                );
                const refresh_token = jwt.sign({ access: access_token }, privateKey, { algorithm: 'HS256', subject: user.USER_ID, expiresIn: '30d' });

                const account = new Account({ role: PERM[user.PERM_CD], access_token, refresh_token, user });

                return account;
            } else {
                throw new AuthenticationError('ID 혹은 패스워드를 확인하세요');
            }
        } catch(err) {
            throw new AuthenticationError('로그인 실패');
        }
    }
}