import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Arg, Ctx, ID, Query, Resolver, Subscription } from "type-graphql";
import { getRepository, In, Raw } from "typeorm";

import { ac_asset } from "../entity/database/ac_asset";
import { pd_asset_code } from "../entity/database/pd_asset_code";

@Resolver()
export class AssetResolver {
    @Query(() => [ac_asset], { nullable: true })
    async Assets(
        @Arg('TYPE', () => String, { nullable: true }) type: string,
        @Arg('KEYS', () => [String], { nullable: true }) keys: Array<string>,
        @Ctx() ctx: any
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            let result: any;
            if (keys.length === 0) {
                result = await getRepository(ac_asset).find({ relations: ['INTERFACE'] });
            } else {
                switch (type) {
                    case 'HIER01': {
                        result = await getRepository(ac_asset).find({ where: { CUST_HIER_ID_C: In(keys) }, relations: ['INTERFACE'] });
                        break;
                    }
                    case 'HIER02': {
                        result = await getRepository(ac_asset).find({ where: { CUST_HIER_ID_P: In(keys) }, relations: ['INTERFACE'] });
                        break;
                    }
                    case 'HIER03': {
                        let [key_type, id] = keys[0].split('_');

                        let code_where: string = '';
                        if (key_type === 'pah') {
                            code_where = `pac.PD_ASSET_HIER_ID = ${id}`;
                        } else {
                            code_where = `pac.CODE = "${id}"`;
                        }

                        const code_query = getRepository(pd_asset_code)
                            .createQueryBuilder('pac')
                            .select('pac.CODE')
                            .where(code_where);

                        result = await getRepository(ac_asset)
                            .createQueryBuilder('asset')
                            .leftJoinAndSelect('asset.PRODUCT', 'product')
                            .leftJoinAndSelect('asset.INTERFACE', 'intf')
                            .where('product.ASSET_CD IN (' + code_query.getQuery() + ')')
                            .getMany();

                        break;
                    }
                    case 'HIER04': {
                        const ip = keys[0];

                        let query_where = '';
                        if (ip === 'null') {
                            query_where = `intf.IP_ADDR IS NULL OR intf.IP_ADDR = ''`;
                        } else {
                            query_where = `intf.IP_ADDR = "${ip}"`;
                        }

                        result = await getRepository(ac_asset)
                            .createQueryBuilder('asset')
                            .leftJoinAndSelect('asset.INTERFACE', 'intf')
                            .where(query_where)
                            .getMany();

                        break;
                    }
                    case 'HIER05': {
                        const [ip, port] = keys[0].split(':');

                        let query_where = '';
                        if (ip === 'null') {
                            query_where = `intf.IP_ADDR IS NULL OR intf.IP_ADDR = '' OR intf.PORT IS NULL OR intf.PORT = 0`;
                        } else {
                            query_where = `intf.IP_ADDR = "${ip}" AND intf.PORT = ${port}`;
                        }

                        result = await getRepository(ac_asset)
                            .createQueryBuilder('asset')
                            .leftJoinAndSelect('asset.INTERFACE', 'intf')
                            .where(query_where)
                            .getMany();

                        break;
                    }
                    case 'HIER06': {
                        let condition_type = '';
                        const op_ids: Array<string> = [];
                        for (const id of keys) {
                            const [k, i] = id.split('_');

                            if (k !== 'hier06') {
                                op_ids.push(i);
                                condition_type = k.substring(2, 3);
                            }
                        }

                        let query_where = '';
                        switch (condition_type) {
                            case 'C':
                            case 'P': {
                                query_where = `asset.OP_ID_M IN (${op_ids.toString()}) OR asset.OP_ID_S IN (${op_ids.toString()})`;
                                break;
                            }
                            case 'M': {
                                query_where = `asset.MA_USER_ID IN (${op_ids.toString()})`;
                                break;
                            }
                        }

                        result = await getRepository(ac_asset)
                            .createQueryBuilder('asset')
                            .leftJoinAndSelect('asset.INTERFACE', 'intf')
                            .where(query_where)
                            .getMany();

                        break;
                    }
                    case 'HIER07': {
                        const manufacturer_id = keys[0];
                        result = await getRepository(ac_asset)
                            .createQueryBuilder('asset')
                            .leftJoinAndSelect('asset.PRODUCT', 'product')
                            .leftJoinAndSelect('asset.INTERFACE', 'intf')
                            .where(`product.MANUFACTURER_ID = ${manufacturer_id}`)
                            .getMany();
                        break;
                    }
                    case 'HIER08': {
                        const product_id = keys[0];
                        result = await getRepository(ac_asset)
                            .createQueryBuilder('asset')
                            .leftJoinAndSelect('asset.INTERFACE', 'intf')
                            .where(`asset.PRODUCT_ID = ${product_id}`)
                            .getMany();
                        break;
                    }
                }
            }

            return result;
        } catch (err) {
            throw new SchemaError(err.message)
        }
    }

    @Query(() => ac_asset, { nullable: true })
    async Asset(
        @Arg('ID', () => ID, { nullable: true }) id: number,
        @Ctx() ctx: any
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return await getRepository(ac_asset).findOne({ where: { ID: id }, relations: ['PRODUCT', 'INTERFACE', 'PRODUCT.MANUFACTURER'] });
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}