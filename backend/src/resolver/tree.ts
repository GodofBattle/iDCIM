import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Ctx, Query, Resolver } from "type-graphql";
import { getRepository, getTreeRepository, Not } from "typeorm";

import { ac_config } from "../entity/database/ac_config";
import { pd_asset_code } from "../entity/database/pd_asset_code";
import { pd_asset_hier } from "../entity/database/pd_asset_hier";
import { AssetTree } from "../entity/web/assetTree";

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

            const asset_list = (await getRepository(pd_asset_hier).find()).map((asset: pd_asset_hier) => {
                return {
                    key: `pah_${asset.ID}`,
                    label: asset.P_ID === 0 ? site_name : asset.NAME,
                    alias: asset.P_ID === 0 ? site_name : asset.NAME,
                    order: asset.ORDER,
                    parent_key: asset.P_ID === 0 ? null : `pah_${asset.P_ID}`
                }
            });
            const asset_code_list = (await getRepository(pd_asset_code).find({ select: ['CODE', 'NAME', 'ALIAS', 'PD_ASSET_HIER_ID', 'ORDER'] })).forEach((asset: pd_asset_code) => {
                asset_list.push({
                    key: `pac_${asset.CODE}`,
                    label: asset.NAME,
                    alias: asset.ALIAS === null ? '' : asset.ALIAS,
                    order: asset.ORDER,
                    parent_key: `pah_${asset.PD_ASSET_HIER_ID}`
                })
            });

            const asset_tree: Array<AssetTree> = arrayToTree(asset_list, { id: 'key', p_id: 'parent_key' }) as Array<AssetTree>;
            return asset_tree;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}