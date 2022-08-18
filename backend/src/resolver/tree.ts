import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, Mutation, PubSub, Publisher, Query, Resolver } from "type-graphql";
import { Between, getManager, getRepository, MoreThan, MoreThanOrEqual } from "typeorm";

import { ac_user } from '../entity/database/ac_user';
import { ac_config } from "../entity/database/ac_config";
import { ac_cust_hier } from "../entity/database/ac_cust_hier";
import { pd_asset_code } from "../entity/database/pd_asset_code";
import { pd_asset_hier } from "../entity/database/pd_asset_hier";
import { AssetTree, AssetTreeArgs } from "../entity/web/assetTree";

import arrayToTree from '../utils/arrayToTree';
import { pd_product } from "../entity/database/pd_product";
import { ac_asset } from "../entity/database/ac_asset";
import { cn_interface } from "../entity/database/cn_interface";
import { pd_manufacturer } from "../entity/database/pd_manufacturer";

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
            // by shkoh 20220418: pd_asset_hier에서 ROOT 정보를 삭제하여 해당 데이터 처리 방식 변경
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
                    parent_key: asset.PD_ASSET_HIER_ID === 0 ? `root_0` : `pah_${asset.PD_ASSET_HIER_ID}`,
                    type: asset.TYPE,
                    manipulable: true
                })
            });

            // by shkoh 20220224: parent id와 order를 기준으로 하여 오름차순으로 정리
            trees.sort((a: AssetTree, b: AssetTree) => {
                if (a.order > b.order) {
                    return 1;
                } else if (a.order < b.order) {
                    return -1;
                } else {
                    if (a.parent_key > b.parent_key) return 1;
                    else if (a.parent_key < b.parent_key) return -1;
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
                key: `root_0`,
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
                    parent_key: node.P_TID === 0 ? `root_0` : `ach_${node.P_TID}`,
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
                key: `root_0`,
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
                    parent_key: node.P_TID === 0 ? `root_0` : `ach_${node.P_TID}`,
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
                case 'HIER04': { trees = await this.getTreeItemsByHIER04(root_info); break; }
                case 'HIER05': { trees = await this.getTreeItemsByHIER05(root_info); break; }
                case 'HIER06': { trees = await this.getTreeItemsByHIER06(root_info); break; }
                case 'HIER07': { trees = await this.getTreeItemsByHIER07(root_info); break; }
                case 'HIER08': { trees = await this.getTreeItemsByHIER08(root_info); break; }
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
                manipulable: false
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
                manipulable: false
            })
        });

        return trees;
    }

    private async getTreeItemsByHIER03(root: object) {
        // by shkoh 20220415: HIER03 Asset Tree에 ROOT를 추가하면서 시작
        const trees = new Array(root);

        // by shkoh 20220426: 현행 자산의 CODE 리스트를 추출함
        const asset_code_list_query = getRepository(pd_product)
            .createQueryBuilder('product')
            .select('product.ASSET_CD')
            .innerJoin(ac_asset, 'asset', 'product.ID = asset.PRODUCT_ID')
            .groupBy('product.ASSET_CD');

        // by shkoh 20220426: pd_asset_code에서 현재 등록된 자산이 가지고 있는 CODE 리스트만 추출
        const asset_code_tree = await getRepository(pd_asset_code)
            .createQueryBuilder('asset_code')
            .where('asset_code.CODE IN (' + asset_code_list_query.getQuery() + ')')
            .orderBy('asset_code.PD_ASSET_HIER_ID', 'ASC')
            .addOrderBy('asset_code.ORDER', 'ASC')
            .getMany();

        const asset_hier_ids = [];

        asset_code_tree.forEach((asset: pd_asset_code) => {
            trees.push({
                key: `pac_${asset.CODE}`,
                label: `${asset.ALIAS && asset.ALIAS.length > 0 ? asset.ALIAS : asset.NAME}`,
                order: asset.ORDER,
                parent_key: `pah_${asset.PD_ASSET_HIER_ID}`,
                type: asset.TYPE,
                manipulable: false
            });

            asset_hier_ids.push(asset.PD_ASSET_HIER_ID);
        });

        const asset_hiers = await getRepository(pd_asset_hier).find({ order: { ORDER: 'ASC' } });
        for (const id of asset_hier_ids) {
            this.addAssetHierParentTreeNode(trees, asset_hiers, id);
        }

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

        return trees;
    }

    // by shkoh 20220427: HIER03에서 특정 자산 데이터만을 추출하기 위하여 데이터 기록
    private addAssetHierParentTreeNode(tree_data: Array<any>, hier_list: Array<pd_asset_hier>, p_id: number) {
        const asset_hier: pd_asset_hier | undefined = hier_list.find((asset: pd_asset_hier) => asset.ID === p_id);
        // by shkoh 20220427: asset_hier 데이터가 존재하지 않다면, ROOT이거나 데이터베이스에 존재하지 않는 데이터임으로 더 이상 진행하지 않는다
        if (!asset_hier) return;

        if (!tree_data.some((tree_node: any) => tree_node.key === `pah_${p_id}`)) {
            tree_data.push({
                key: `pah_${asset_hier.ID}`,
                label: asset_hier.NAME,
                order: asset_hier.ORDER,
                parent_key: asset_hier.P_ID === 0 ? 'root_0' : `pah_${asset_hier.P_ID}`,
                type: asset_hier.TYPE,
                manipulable: false
            });
        }

        this.addAssetHierParentTreeNode(tree_data, hier_list, asset_hier.P_ID);
    }

    private async getTreeItemsByHIER04(root: object) {
        // by shkoh 20220415: HIER04 Asset Tree
        const trees = new Array(root);

        const interfaces = await getRepository(cn_interface)
            .createQueryBuilder('intf')
            .groupBy('intf.IP_ADDR')
            .getMany();

        let intf_index = 1;
        interfaces.forEach((intf: cn_interface, index: number) => {
            if (intf.IP_ADDR && intf.IP_ADDR.length > 0) {
                trees.push({
                    key: `ip_${intf.IP_ADDR}`,
                    label: intf.IP_ADDR,
                    order: intf_index++,
                    parent_key: 'root_0',
                    type: 'IP_ADDR',
                    manipulable: false
                });
            }
        });

        trees.push({
            key: `ip_null`,
            label: '일반자산',
            order: intf_index,
            parent_key: 'root_0',
            type: 'IP_ADDR',
            manipulable: false
        });

        return trees;
    }

    private async getTreeItemsByHIER05(root: object) {
        // by shkoh 20220415: HIER05 Asset Tree
        const trees = new Array(root);

        const interfaces = await getRepository(cn_interface)
            .createQueryBuilder('intf')
            .groupBy('intf.IP_ADDR')
            .addGroupBy('intf.PORT')
            .getMany();

        let intf_index = 1;
        interfaces.forEach((intf: cn_interface, index: number) => {
            if (intf.IP_ADDR && intf.IP_ADDR.length > 0 && intf.PORT !== null) {
                trees.push({
                    key: `ipp_${intf.IP_ADDR}:${intf.PORT}`,
                    label: `${intf.IP_ADDR}:${intf.PORT}`,
                    order: intf_index++,
                    parent_key: 'root_0',
                    type: 'HIER05',
                    manipulable: false
                });
            }
        });

        trees.push({
            key: `ipp_null`,
            label: '일반자산',
            order: intf_index,
            parent_key: 'root_0',
            type: 'HIER05',
            manipulable: false
        });

        return trees;
    }

    private async getTreeItemsByHIER06(root: object) {
        // by shkoh 20220502: HIER06 Asset Tree: 담당자
        const trees = new Array(root);

        // by shkoh 20220504: 고객사, 협력사, 유지보수 사 추가
        trees.push({
            key: `hier06_customer`,
            label: `고객사`,
            order: 1,
            parent_key: `root_0`,
            type: 'HIER06',
            manipulable: false
        }, {
            key: `hier06_partner`,
            label: `협력사`,
            order: 2,
            parent_key: `root_0`,
            type: 'HIER06',
            manipulable: false
        }, {
            key: `hier06_operator`,
            label: `유지보수사`,
            order: 3,
            parent_key: `root_0`,
            type: 'HIER06',
            manipulable: false
        });

        // by shkoh 20220504: 자산을 기준으로 고객사 담당자 및 업체 정보 로드
        const customers = await getManager().query(`
            SELECT
                ac.NAME AS COMPANY_NAME, ac.TYPE AS COMPANY_TYPE, aao.ID,  aao.NAME AS OP_NAME
            FROM ac_asset_operator aao
            JOIN ac_company ac ON aao.COMPANY_ID = ac.ID
            ORDER BY aao.NAME
        `);

        customers.forEach((c: any, index: number) => {
            let p_key = ``
            switch (c.COMPANY_TYPE) {
                case 'C': p_key = 'hier06_customer'; break;
                case 'P': p_key = 'hier06_partner'; break;
                case 'M': p_key = 'hier06_operator'; break;
            }

            trees.push({
                key: `op${c.COMPANY_TYPE}_${c.ID}`,
                label: `${c.OP_NAME} - ${c.COMPANY_NAME}`,
                order: index + 1,
                parent_key: p_key,
                type: 'OPERATOR',
                manipulable: false
            });
        });

        return trees;
    }

    private async getTreeItemsByHIER07(root: object) {
        // by shkoh 20220502: HIER07 Asset Tree
        const trees = new Array(root);

        // by shkoh 20220502: 현행 자산의 제품 리스트를 추출함
        const asset_list_query = getRepository(pd_product)
            .createQueryBuilder('product')
            .select('product.MANUFACTURER_ID')
            .innerJoin(ac_asset, 'asset', 'product.ID = asset.PRODUCT_ID')
            .groupBy('product.MANUFACTURER_ID');

        // by shkoh 20220502: pd_manufactuere에서 현재 등록된 자산이 가지고 있는 제조사 리스트만 추출
        const manufacturers = await getRepository(pd_manufacturer)
            .createQueryBuilder('manufacturer')
            .where('manufacturer.ID IN (' + asset_list_query.getQuery() + ')')
            .orderBy('manufacturer.NAME', 'ASC')
            .getMany();

        manufacturers.forEach((manu: pd_manufacturer) => {
            trees.push({
                key: `mf_${manu.ID}`,
                label: `${manu.NAME}`,
                parent_key: 'root_0',
                type: 'HIER07',
                manipulable: false
            });
        });

        return trees;
    }

    private async getTreeItemsByHIER08(root: object) {
        // by shkoh 20220415: HIER04 Asset Tree
        const trees = new Array(root);

        // by shkoh 20220502: 현행 자산의 제품 리스트를 추출함
        const asset_product_list_query = await getRepository(pd_product)
            .createQueryBuilder('product')
            .innerJoin(ac_asset, 'asset', 'product.ID = asset.PRODUCT_ID')
            .orderBy('product.NAME', 'ASC')
            .groupBy('product.ID')
            .getMany();

        asset_product_list_query.forEach((p: pd_product) => {
            trees.push({
                key: `product_${p.ID}`,
                label: `${p.NAME}`,
                parent_key: 'root_0',
                type: 'HIER08',
                manipulable: false
            });
        });

        return trees;
    }
}