import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, ID, Int, Mutation, Publisher, PubSub, Query, Resolver } from "type-graphql";
import { getManager, getRepository, In } from "typeorm";

import { ac_asset_operator, ac_asset_operator_args } from "../entity/database/ac_asset_operator";
import { ac_company, ac_company_args } from "../entity/database/ac_company";
import { ac_op_noti_asset } from "../entity/database/ac_op_noti_asset";
import { ac_op_noti_except_sensor } from "../entity/database/ac_op_noti_except_sensor";
import { ac_user } from "../entity/database/ac_user";
import { AssetTree } from "../entity/web/assetTree";
import arrayToTree from "../utils/arrayToTree";

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

    @Query(() => [ac_asset_operator], { nullable: true })
    async Operators(
        @Ctx() ctx: any
    ): Promise<Array<ac_asset_operator>> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_asset_operator).find({ join: { alias: 'o', leftJoinAndSelect: { COMPANY: 'o.COMPANY' } }, order: { NAME: 'ASC' } });
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

    @Query(() => [AssetTree])
    async OperatorsWithNotification(
        @Arg(`ASSET_ID`, () => Int, { nullable: true }) asset_id: number,
        @Ctx() ctx: any
    ): Promise<Array<AssetTree>> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            let where = ``;
            if(asset_id > 0) {
                where = `WHERE aona.ASSET_ID = ${asset_id}`;
            }

            const operators: Array<any> = await getManager().query(`
                SELECT
                    DISTINCT aona.OP_ID, ac.TYPE AS COMPANY_TYPE, ac.NAME AS COMPANY_NAME, aao.NAME OP_NAME
                FROM ac_op_noti_asset aona
                JOIN ac_asset_operator aao ON aona.OP_ID = aao.ID
                JOIN ac_company ac ON aao.COMPANY_ID = ac.ID
                ${where}
                ORDER BY ac.NAME, aao.NAME;
            `);

            const tree_data = new Array();

            operators.forEach((o: any, index: number) => {
                let p_key = ``;
                switch(o.COMPANY_TYPE) {
                    case 'C': p_key = 'hier_customer'; break;
                    case 'P': p_key = 'hier_partner'; break;
                    case 'M': p_key = 'hier_operator'; break;
                }

                tree_data.push({
                    key: `op_${o.OP_ID}`,
                    label: `${o.COMPANY_NAME}: ${o.OP_NAME}`,
                    order: index + 1,
                    parent_key: p_key,
                    type: 'OPERATOR',
                    manipulable: false
                });
            });

            if(tree_data.some((item: any) => item.parent_key === 'hier_operator')) {
                tree_data.splice(0, 0, {
                    key: `hier_operator`,
                    label: `유지보수사`,
                    order: 3,
                    parent_key: null,
                    type: 'ROOT',
                    manipulable: false
                });
            }

            if(tree_data.some((item: any) => item.parent_key === 'hier_partner')) {
                tree_data.splice(0, 0, {
                    key: `hier_partner`,
                    label: `협력사`,
                    order: 2,
                    parent_key: null,
                    type: 'ROOT',
                    manipulable: false
                });
            }

            if(tree_data.some((item: any) => item.parent_key === 'hier_customer')) {
                tree_data.splice(0, 0, {
                    key: `hier_customer`,
                    label: `고객사`,
                    order: 1,
                    parent_key: null,
                    type: 'ROOT',
                    manipulable: false
                });
            }

            const tree = arrayToTree(tree_data, { id: 'key', p_id: 'parent_key' }) as Array<AssetTree>;
            return tree;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [AssetTree])
    async OperatorsWithoutNotification(
        @Arg(`ASSET_ID`, () => Int, { nullable: true }) asset_id: number,
        @Ctx() ctx: any
    ): Promise<Array<AssetTree>> {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            let _asset_id = asset_id ? asset_id : -1;

            const operators: Array<any> = await getManager().query(`
                SELECT
                    aao.ID AS OP_ID,
                    ac.TYPE AS COMPANY_TYPE,
                    ac.NAME AS COMPANY_NAME,
                    aao.NAME AS OP_NAME
                FROM ac_asset_operator aao
                JOIN ac_company ac ON aao.COMPANY_ID = ac.ID
                WHERE
                    aao.ID NOT IN (SELECT aona.OP_ID FROM ac_op_noti_asset aona WHERE aona.ASSET_ID = ${_asset_id});
            `);

            const tree_data = new Array();

            operators.forEach((o: any, index: number) => {
                let p_key = ``;
                switch(o.COMPANY_TYPE) {
                    case 'C': p_key = 'hier_customer'; break;
                    case 'P': p_key = 'hier_partner'; break;
                    case 'M': p_key = 'hier_operator'; break;
                }

                tree_data.push({
                    key: `op_${o.OP_ID}`,
                    label: `${o.COMPANY_NAME}: ${o.OP_NAME}`,
                    order: index + 1,
                    parent_key: p_key,
                    type: 'OPERATOR',
                    manipulable: false
                });
            });

            if(tree_data.some((item: any) => item.parent_key === 'hier_operator')) {
                tree_data.splice(0, 0, {
                    key: `hier_operator`,
                    label: `유지보수사`,
                    order: 3,
                    parent_key: null,
                    type: 'ROOT',
                    manipulable: false
                });
            }

            if(tree_data.some((item: any) => item.parent_key === 'hier_partner')) {
                tree_data.splice(0, 0, {
                    key: `hier_partner`,
                    label: `협력사`,
                    order: 2,
                    parent_key: null,
                    type: 'ROOT',
                    manipulable: false
                });
            }

            if(tree_data.some((item: any) => item.parent_key === 'hier_customer')) {
                tree_data.splice(0, 0, {
                    key: `hier_customer`,
                    label: `고객사`,
                    order: 1,
                    parent_key: null,
                    type: 'ROOT',
                    manipulable: false
                });
            }

            const tree = arrayToTree(tree_data, { id: 'key', p_id: 'parent_key' }) as Array<AssetTree>;
            return tree;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}