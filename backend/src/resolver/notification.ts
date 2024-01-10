import { AuthenticationError } from "apollo-server-express";
import { Ctx, Resolver, Root, Subscription } from "type-graphql";
import { getRepository } from "typeorm";
import { ac_user } from "../entity/database/ac_user";
import { ac_user_group_asset } from "../entity/database/ac_user_group_asset";

import { Notification } from '../entity/web/notification';

@Resolver()
export class NotificationResolver {
    @Subscription(() => Notification, {
        nullable: true,
        topics: 'NOTIFICATION',
        filter: async ({ payload, context }) => {
            try {
                const asset_id = payload.asset_id;
                const user_id = context.user.sub;
                const user = await getRepository(ac_user).findOne({ USER_ID: user_id });
                const is_group_asset = await getRepository(ac_user_group_asset).count({ USER_GROUP_ID: user.USER_GROUP_ID, ASSET_ID: asset_id });
                
                return context.user.iDCIM.roles === 'PERM03' && is_group_asset === 1;
            } catch {
                return false;
            }
        }
    })
    Notification(
        @Root() data: Notification,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }        
        
        return data;
    }

    @Subscription(() => Notification, { nullable: true, topics: 'CHANGESTATUS' })
    ChangeStatus(
        @Root() data: Notification,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        return data;
    }
}