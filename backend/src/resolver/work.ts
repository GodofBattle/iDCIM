import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, ID, Int, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { ac_asset_work_rec, ac_asset_work_rec_arg, ac_asset_work_rec_input } from "../entity/database/ac_asset_work_rec";
import { ac_user } from "../entity/database/ac_user";

@Resolver()
export class WorkResolver {
    @Mutation(() => Boolean)
    async AddWork(
        @Arg('ADD', () => ac_asset_work_rec_input, { nullable: false }) add_work: ac_asset_work_rec_input,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!add_work) {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });

            const insert_info = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date(),
                ...add_work
            }

            const insert_result = await getRepository(ac_asset_work_rec).insert(insert_info);
            return insert_result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateWork(
        @Arg('ID', () => ID) id: number,
        @Args() { WORK_CD, WORK_OP_ID, WORK_OP_NAME, WORK_START_DT, WORK_END_DT, TITLE, TEXT }: ac_asset_work_rec_arg,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!id) {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });

            const update_info = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };
            for(const [key, value] of Object.entries({ WORK_CD, WORK_OP_ID, WORK_OP_NAME, WORK_START_DT, WORK_END_DT, TITLE, TEXT })) {
                if(value !== undefined) update_info[key] = value;
            }

            const update_result = await getRepository(ac_asset_work_rec).update({ ID: id }, update_info);
            return update_result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteWork(
        @Arg('ID', () => Int) id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니디');
        }

        try {
            await publish();

            if(!id) {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            const delete_result = await getRepository(ac_asset_work_rec).delete(id);
            return delete_result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [ac_asset_work_rec])
    async WorksToAsset(
        @Arg('ASSET_ID', () => Int, { nullable: false }) asset_id: number,
        @Ctx() ctx: any
    ): Promise<Array<ac_asset_work_rec>> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(asset_id === undefined || asset_id < 0) {
                throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            }

            return await getRepository(ac_asset_work_rec).find({ where: { ASSET_ID: asset_id }, order: { WORK_START_DT: 'DESC' } });
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}