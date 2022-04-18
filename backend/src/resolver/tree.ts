import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, Mutation, PubSub, Publisher, Query, Resolver } from "type-graphql";
import { Between, getRepository, MoreThan, MoreThanOrEqual } from "typeorm";

import { ac_user } from '../entity/database/ac_user';
import { ac_config } from "../entity/database/ac_config";
import { ac_cust_hier } from "../entity/database/ac_cust_hier";
import { pd_asset_code } from "../entity/database/pd_asset_code";
import { pd_asset_hier } from "../entity/database/pd_asset_hier";
import { AssetTree, AssetTreeArgs } from "../entity/web/assetTree";

import arrayToTree from '../utils/arrayToTree';

@Resolver()
export class TreeResolver {
    @Query(() => [AssetTree])
    async AssetTree(@Ctx() ctx: any): Promise<AssetTree[]> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const root = await getRepository(ac_config).findOne({ where: { ID: 1 } });
            const site_name = root.SITE_NAME ? root.SITE_NAME : 'DCIM';

            const trees = new Array({
                key: 'root_0',
                label: site_name,
                name: site_name,
                alias: site_name,
                order: 1,
                parent_key: null,
                type: 'SITE',
                manipulable: false
            });

            // by shkoh 20220311: 최상위 루트 정보
            (await getRepository(pd_asset_hier).find({ order: { ORDER: 'ASC' } })).forEach((asset: pd_asset_hier) => {
                trees.push({
                    key: `pah_${asset.ID}`,
                    label: asset.NAME,
                    name: asset.NAME,
                    alias: asset.NAME,
                    order: asset.ORDER,
                    parent_key: asset.P_ID === 0 ? `root_0` : `pah_${asset.P_ID}`,
                    type: asset.TYPE,
                    manipulable: true
                })
            });

            (await getRepository(pd_asset_code).find({
                select: ['CODE', 'NAME', 'ALIAS', 'PD_ASSET_HIER_ID', 'ORDER'],
                order: { 'PD_ASSET_HIER_ID': 'ASC', 'ORDER': 'ASC' }
            })).forEach((asset: pd_asset_code) => {
                trees.push({
                    key: `pac_${asset.CODE}`,
                    label: `${asset.NAME} | ${asset.CODE}`,
                    name: asset.NAME,
                    alias: asset.ALIAS === null ? '' : asset.ALIAS,
                    order: asset.ORDER,
                    parent_key: `pah_${asset.PD_ASSET_HIER_ID}`,
                    type: asset.TYPE,
                    manipulable: true
                })
            });

            // by shkoh 20220224: parent id와 order를 기준으로 하여 오름차순으로 정리
            trees.sort((a: AssetTree, b: AssetTree) => {
                if (a.parent_key > b.parent_key) {
                    return 1;
                } else if (a.parent_key < b.parent_key) {
                    return -1;
                } else {
                    if (a.order > b.order) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            });

            const asset_tree: Array<AssetTree> = arrayToTree(trees, { id: 'key', p_id: 'parent_key' }) as Array<AssetTree>;
            return asset_tree;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async MoveAssetTreeNode(
        @Arg('key', () => String) id: string,
        @Args() { parent_key, order }: AssetTreeArgs,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id || id.length === 0) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const [node_type, node_id] = id.split('_');
            const [p_node_type, p_node_id] = parent_key.split('_');

            let is_result: number = 0;
            if (node_type === 'pah') {
                // by shkoh 20220223: pd_asset_hier에서 처리
                const asset_hier = await getRepository(pd_asset_hier).findOne({ ID: Number(node_id) });
                is_result += await this.reorderAssetTreeNode({ p_id: asset_hier.P_ID, order: asset_hier.ORDER }, { p_id: Number(p_node_id), order: order });

                const update_result = await getRepository(pd_asset_hier).update({ ID: Number(node_id) }, { P_ID: Number(p_node_id), ORDER: order });
                is_result += update_result.affected;
            } else if (node_type === 'pac') {
                // by shkoh 20220223: pd_asset_code에서 처리
                const asset_code = await getRepository(pd_asset_code).findOne({ CODE: node_id });
                is_result += await this.reorderAssetTreeNode({ p_id: asset_code.PD_ASSET_HIER_ID, order: asset_code.ORDER }, { p_id: Number(p_node_id), order: order });

                const update_data = await getRepository(pd_asset_code).update({ CODE: node_id }, { PD_ASSET_HIER_ID: Number(p_node_id), ORDER: order });
                is_result += update_data.affected;
            }

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    // by shkoh 20220223: inline function
    async reorderAssetTreeNode(prev_info: any, new_info: any) {
        let is_result: number = 0;

        let order_func: any;
        let calc_func: string;

        if (prev_info.p_id !== new_info.p_id) {
            const prev_hier = await getRepository(pd_asset_hier).update({ P_ID: prev_info.p_id, ORDER: MoreThan(prev_info.order) }, { ORDER: () => '`ORDER` - 1' });
            is_result += prev_hier.affected;
            const prev_code = await getRepository(pd_asset_code).update({ PD_ASSET_HIER_ID: prev_info.p_id, ORDER: MoreThan(prev_info.order) }, { ORDER: () => '`ORDER` - 1' });
            is_result += prev_code.affected;

            order_func = MoreThanOrEqual(new_info.order);
            calc_func = '`ORDER` + 1';
        } else {
            let start_idx: number = new_info.order - prev_info.order > 0 ? prev_info.order + 1 : new_info.order;
            let end_idx: number = new_info.order - prev_info.order > 0 ? new_info.order : prev_info.order;

            order_func = Between(start_idx, end_idx);
            calc_func = new_info.order - prev_info.order > 0 ? '`ORDER` - 1' : '`ORDER` + 1';
        }

        const new_order_hier = await getRepository(pd_asset_hier).update({ P_ID: new_info.p_id, ORDER: order_func }, { ORDER: () => calc_func });
        is_result += new_order_hier.affected;
        const new_order_code = await getRepository(pd_asset_code).update({ PD_ASSET_HIER_ID: new_info.p_id, ORDER: order_func }, { ORDER: () => calc_func });
        is_result += new_order_code.affected;

        return is_result;
    }

    @Query(() => [AssetTree])
    async PositionTree(@Ctx() ctx: any): Promise<AssetTree[]> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const root = await getRepository(ac_config).findOne({ where: { ID: 1 } });
            const site_name = root.SITE_NAME ? root.SITE_NAME : 'DCIM';

            const trees = new Array({
                key: `prh_0`,
                label: site_name,
                order: 1,
                parent_key: null,
                type: 'SITE',
                manipulable: false
            });

            (await getRepository(ac_cust_hier).find({ where: { TYPE: 'P' }, order: { P_TID: 'ASC', ORDER: 'ASC' } })).forEach((node: ac_cust_hier) => {
                trees.push({
                    key: `ach_${node.TID}`,
                    label: node.NAME,
                    order: node.ORDER,
                    parent_key: node.P_TID === 0 ? `prh_0` : `ach_${node.P_TID}`,
                    type: 'POSITION',
                    manipulable: true
                })
            });

            const position_tree: Array<AssetTree> = arrayToTree(trees, { id: 'key', p_id: 'parent_key' }) as Array<AssetTree>;
            return position_tree;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async MovePositionTreeNode(
        @Arg('key', () => String) id: string,
        @Args() { parent_key, order }: AssetTreeArgs,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id || id.length === 0) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const [node_type, node_id] = id.split('_');
            const [p_node_type, p_node_id] = parent_key.split('_');

            let is_result: number = 0;
            if (node_type === 'ach') {
                // by shkoh 20220314: DB에 저장된 정보를 불러옴
                const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });
                const hier = await getRepository(ac_cust_hier).findOne({ where: { TYPE: 'P', TID: Number(node_id) } });
                is_result += await this.reorderTreeNode('P', user.ID, { p_id: hier.P_TID, order: hier.ORDER }, { p_id: Number(p_node_id), order: order });

                const reorder = await getRepository(ac_cust_hier).update({ TYPE: 'P', TID: Number(node_id) }, { P_TID: Number(p_node_id), ORDER: order, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
                is_result += reorder.affected;
            }

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    // by shkoh 20220314: inline function
    async reorderTreeNode(type: string, user_id: number, prev_info: any, new_info: any) {
        let is_result: number = 0;

        let order_func: any;
        let calc_func: string;

        if (prev_info.p_id !== new_info.p_id) {
            const prev_hier = await getRepository(ac_cust_hier).update({ TYPE: type, P_TID: prev_info.p_id, ORDER: MoreThan(prev_info.order) }, { ORDER: () => '`ORDER` - 1', UPDATE_USER_ID: user_id, UPDATE_USER_DT: new Date() });
            is_result += prev_hier.affected;

            order_func = MoreThanOrEqual(new_info.order);
            calc_func = '`ORDER` + 1';
        } else {
            let start_idx: number = new_info.order - prev_info.order > 0 ? prev_info.order + 1 : new_info.order;
            let end_idx: number = new_info.order - prev_info.order > 0 ? new_info.order : prev_info.order;

            order_func = Between(start_idx, end_idx);
            calc_func = new_info.order - prev_info.order > 0 ? '`ORDER` - 1' : '`ORDER` + 1';
        }

        const new_order_hier = await getRepository(ac_cust_hier).update({ TYPE: type, P_TID: new_info.p_id, ORDER: order_func }, { ORDER: () => calc_func, UPDATE_USER_ID: user_id, UPDATE_USER_DT: new Date() });
        is_result += new_order_hier.affected;

        return is_result;
    }

    @Query(() => [AssetTree])
    async CustomTree(@Ctx() ctx: any): Promise<AssetTree[]> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const root = await getRepository(ac_config).findOne({ where: { ID: 1 } });
            const site_name = root.SITE_NAME ? root.SITE_NAME : 'DCIM';

            const trees = new Array({
                key: `prh_0`,
                label: site_name,
                order: 1,
                parent_key: null,
                type: 'SITE',
                manipulable: false
            });

            (await getRepository(ac_cust_hier).find({ where: { TYPE: 'C' }, order: { P_TID: 'ASC', ORDER: 'ASC' } })).forEach((node: ac_cust_hier) => {
                trees.push({
                    key: `ach_${node.TID}`,
                    label: node.NAME,
                    order: node.ORDER,
                    parent_key: node.P_TID === 0 ? `prh_0` : `ach_${node.P_TID}`,
                    type: 'CUSTOM',
                    manipulable: true
                })
            });

            const position_tree: Array<AssetTree> = arrayToTree(trees, { id: 'key', p_id: 'parent_key' }) as Array<AssetTree>;
            return position_tree;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async MoveCustomTreeNode(
        @Arg('key', () => String) id: string,
        @Args() { parent_key, order }: AssetTreeArgs,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!id || id.length === 0) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const [node_type, node_id] = id.split('_');
            const [p_node_type, p_node_id] = parent_key.split('_');

            let is_result: number = 0;
            if (node_type === 'ach') {
                // by shkoh 20220314: DB에 저장된 정보를 불러옴
                const user = await getRepository(ac_user).findOne({ where: { USER_ID: ctx.user.sub } });
                const hier = await getRepository(ac_cust_hier).findOne({ where: { TYPE: 'C', TID: Number(node_id) } });
                is_result += await this.reorderTreeNode('C', user.ID, { p_id: hier.P_TID, order: hier.ORDER }, { p_id: Number(p_node_id), order: order });

                const reorder = await getRepository(ac_cust_hier).update({ TYPE: 'C', TID: Number(node_id) }, { P_TID: Number(p_node_id), ORDER: order, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
                is_result += reorder.affected;
            }

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [AssetTree])
    async Tree(
        @Arg('TYPE', () => String) type: string,
        @Ctx() ctx: any
    ): Promise<AssetTree[]> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const root = await getRepository(ac_config).findOne({ where: { ID: 1 } });
            const site_name = root.SITE_NAME ? root.SITE_NAME : 'DCIM';

            const root_info = {
                key: `root_0`,
                label: site_name,
                order: 1,
                parent_key: null,
                type: 'SITE',
                manipulable: false
            };

            let trees: Array<any> = [];

            switch (type) {
                case 'HIER01': { trees = await this.getTreeItemsByHIER01(root_info); break; }
                case 'HIER02': { trees = await this.getTreeItemsByHIER02(root_info); break; }
                case 'HIER03': { trees = await this.getTreeItemsByHIER03(root_info); break; }
                case 'HIER04': { break; }
                case 'HIER05': { break; }
                case 'HIER06': { break; }
                case 'HIER07': { break; }
                case 'HIER08': { break; }
            }

            const asset_tres: Array<AssetTree> = arrayToTree(trees, { id: 'key', p_id: 'parent_key' }) as Array<AssetTree>;
            return asset_tres;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    private async getTreeItemsByHIER01(root: object) {
        // by shkoh 20220415: HIER01 Custom Tree
        const trees = new Array(root);

        (await getRepository(ac_cust_hier).find({ where: { TYPE: 'C' }, order: { P_TID: 'ASC', ORDER: 'ASC' } })).forEach((node: ac_cust_hier) => {
            trees.push({
                key: `ach_${node.TID}`,
                label: node.NAME,
                order: node.ORDER,
                parent_key: node.P_TID === 0 ? `root_0` : `ach_${node.P_TID}`,
                type: 'CUSTOM',
                manipulable: true
            })
        });

        return trees;
    }

    private async getTreeItemsByHIER02(root: object) {
        // by shkoh 20220415: HIER02 Position Tree
        const trees = new Array(root);

        (await getRepository(ac_cust_hier).find({ where: { TYPE: 'P' }, order: { P_TID: 'ASC', ORDER: 'ASC' } })).forEach((node: ac_cust_hier) => {
            trees.push({
                key: `ach_${node.TID}`,
                label: node.NAME,
                order: node.ORDER,
                parent_key: node.P_TID === 0 ? `root_0` : `ach_${node.P_TID}`,
                type: 'POSITION',
                manipulable: true
            })
        });

        return trees;
    }

    private async getTreeItemsByHIER03(root: object) {
        // by shkoh 20220415: HIER02 Asset Tree
        const trees = new Array(root);

        (await getRepository(ac_cust_hier).find({ where: { TYPE: 'P' }, order: { P_TID: 'ASC', ORDER: 'ASC' } })).forEach((node: ac_cust_hier) => {
            trees.push({
                key: `ach_${node.TID}`,
                label: node.NAME,
                order: node.ORDER,
                parent_key: node.P_TID === 0 ? `root_0` : `ach_${node.P_TID}`,
                type: 'POSITION',
                manipulable: true
            })
        });

        return trees;
    }
}