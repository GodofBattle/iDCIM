import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, ID, Int, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getRepository, In } from "typeorm";

import { ac_asset_operator, ac_asset_operator_args } from "../entity/database/ac_asset_operator";
import { ac_company, ac_company_args } from "../entity/database/ac_company";
import { ac_op_noti_asset } from "../entity/database/ac_op_noti_asset";
import { ac_op_noti_except_sensor } from "../entity/database/ac_op_noti_except_sensor";
import { ac_user } from "../entity/database/ac_user";

@Resolver()
export class ManagerResolver {
    @Query(() => [ac_company])
    async Companies(
        @Arg('TYPE', () => String, { nullable: true }) type: string,
        @Ctx() ctx: any
    ): Promise<ac_company[]> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            let result: Array<ac_company>;
            if(type && type.length > 0) {
                result = await getRepository(ac_company).find({ where: { TYPE: type }, order: { NAME: 'ASC' } });
            } else {
                result = await getRepository(ac_company).find({ order: { NAME: 'ASC' } });
            }
            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => ac_company, { nullable: true })
    async Company(
        @Arg('ID', () => ID) id: number,
        @Ctx() ctx: any
    ): Promise<ac_company> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const result = await getRepository(ac_company).findOne({ where: { ID: id } });
            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddCompany(
        @Args() { TYPE, NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK }: ac_company_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!TYPE) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!NAME) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const insert_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };

            for (const [key, value] of Object.entries({ TYPE, NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK })) {
                if (value !== undefined) insert_data[key] = value;
            }

            const result = await getRepository(ac_company).insert(insert_data);
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateCompany(
        @Arg('ID', () => ID) id: number,
        @Args() { NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK }: ac_company_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const update_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };

            for (const [key, value] of Object.entries({ NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK })) {
                if (value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(ac_company).update({ ID: id }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteCompany(
        @Arg('ID', () => ID) id: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const hasChild = await getRepository(ac_asset_operator).count({ where: { COMPANY_ID: id } });

            if (hasChild > 0) {
                throw new SchemaError('담당자가 등록되어 있어서 삭제가 불가능합니다');
            }

            const result = await getRepository(ac_company).delete(id);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [ac_company], { nullable: true })
    async CustomerCompanies(
        @Ctx() ctx: any
    ): Promise<Array<ac_company>> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const results = await getRepository(ac_company).find({ where: { TYPE: In(['C', 'P']) }, join: { alias: 'c', leftJoinAndSelect: { OPERATORS: 'c.OPERATORS' } } });
            return results;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => ac_asset_operator, { nullable: true })
    async Operator(
        @Arg('ID', () => ID) id: number,
        @Ctx() ctx: any
    ): Promise<ac_asset_operator> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if (!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(ac_asset_operator).findOne({ where: { ID: id }, join: { alias: 'o', leftJoinAndSelect: { COMPANY: 'o.COMPANY' } } });
            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddOperator(
        @Args() { COMPANY_ID, NAME, DEPT, PHONE, EXT_NO, MOBILE, EMAIL, REMARK }: ac_asset_operator_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!COMPANY_ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!NAME) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const insert_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };

            for (const [key, value] of Object.entries({ COMPANY_ID, NAME, DEPT, PHONE, EXT_NO, MOBILE, EMAIL, REMARK })) {
                if (value !== undefined) insert_data[key] = value;
            }

            const result = await getRepository(ac_asset_operator).insert(insert_data);
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateOperator(
        @Arg('ID', () => ID) id: number,
        @Args() { NAME, DEPT, PHONE, EXT_NO, MOBILE, EMAIL, REMARK, NOTI_CHANNEL, NOTI_SENSOR_ALARM_LEVEL, NOTI_ASSET_ALARM_ENABLE, NOTI_HOUR_MON, NOTI_HOUR_TUE, NOTI_HOUR_WED, NOTI_HOUR_THU, NOTI_HOUR_FRI, NOTI_HOUR_SAT, NOTI_HOUR_SUN }: ac_asset_operator_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });

            const update_data = {
                UPDATE_USER_ID: user.ID,
                UPDATE_USER_DT: new Date()
            };

            for (const [key, value] of Object.entries({ NAME, DEPT, PHONE, EXT_NO, MOBILE, EMAIL, REMARK, NOTI_CHANNEL, NOTI_SENSOR_ALARM_LEVEL, NOTI_ASSET_ALARM_ENABLE, NOTI_HOUR_MON, NOTI_HOUR_TUE, NOTI_HOUR_WED, NOTI_HOUR_THU, NOTI_HOUR_FRI, NOTI_HOUR_SAT, NOTI_HOUR_SUN })) {
                if (value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(ac_asset_operator).update({ ID: id }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async MoveOperatorTreeNode(
        @Arg('key', () => String) key: string,
        @Arg('parent_key', () => String) parent_key: string,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!key || key.length === 0) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!parent_key || parent_key.length === 0) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const [node_type, node_id] = key.split('_');
            const [p_node_type, p_node_id] = parent_key.split('_');

            const result = await getRepository(ac_asset_operator).update({ ID: Number(node_id) }, { COMPANY_ID: Number(p_node_id) });
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [ac_op_noti_asset])
    async OperatorNotificationAssets(
        @Arg('OP_ID', () => Int) op_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_op_noti_asset).find({ OP_ID: op_id });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => ac_op_noti_asset, { nullable: true })
    async OperatorNotificationAsset(
        @Arg('OP_ID', () => Int) op_id: number,
        @Arg('ASSET_ID', () => Int) asset_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_op_noti_asset).findOne({ OP_ID: op_id, ASSET_ID: asset_id });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [ac_op_noti_except_sensor])
    async OperatorNotificationExceptSensors(
        @Arg('OP_ID', () => Int) op_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_op_noti_except_sensor).find({ OP_ID: op_id });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}