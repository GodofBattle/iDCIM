import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Arg, Args, Ctx, ID, Int, Mutation, Publisher, PubSub, Query, Resolver, Subscription } from "type-graphql";
import { getRepository, In, Raw } from "typeorm";

import { ac_asset, ac_asset_args } from "../entity/database/ac_asset";
import { ac_user } from "../entity/database/ac_user";
import { cn_ctrl_cmd } from "../entity/database/cn_ctrl_cmd";
import { cn_interface } from "../entity/database/cn_interface";
import { cn_modbus_cmd } from "../entity/database/cn_modbus_cmd";
import { cn_sensor } from "../entity/database/cn_sensor";
import { cn_sensor_threshold_ai } from "../entity/database/cn_sensor_threshold_ai";
import { cn_sensor_threshold_di } from "../entity/database/cn_sensor_threshold_di";
import { cn_tcpetc_cmd } from "../entity/database/cn_tcpetc_cmd";
import { pd_asset_code } from "../entity/database/pd_asset_code";
import { pd_ctrl_cmd } from "../entity/database/pd_ctrl_cmd";
import { pd_modbus_cmd } from "../entity/database/pd_modbus_cmd";
import { pd_prod_intf } from "../entity/database/pd_prod_intf";
import { pd_sensor } from "../entity/database/pd_sensor";
import { pd_sensor_threshold_ai } from "../entity/database/pd_sensor_threshold_ai";
import { pd_sensor_threshold_di } from "../entity/database/pd_sensor_threshold_di";
import { pd_tcpetc_cmd } from "../entity/database/pd_tcpetc_cmd";
import { ACTION_CD } from "../enum/ACTION";

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
                result = await getRepository(ac_asset).find({ relations: ['INTERFACE', 'PRODUCT'] });
            } else {
                switch (type) {
                    case 'HIER01': {
                        result = await getRepository(ac_asset).find({ where: { CUST_HIER_ID_C: In(keys) }, relations: ['INTERFACE', 'PRODUCT'] });
                        break;
                    }
                    case 'HIER02': {
                        result = await getRepository(ac_asset).find({ where: { CUST_HIER_ID_P: In(keys) }, relations: ['INTERFACE', 'PRODUCT'] });
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
                            .leftJoinAndSelect('asset.PRODUCT', 'product')
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
                            .leftJoinAndSelect('asset.PRODUCT', 'product')
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
                            .leftJoinAndSelect('asset.PRODUCT', 'product')
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
                            .leftJoinAndSelect('asset.PRODUCT', 'product')
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

    @Mutation(() => Boolean)
    async UpdateAsset(
        @Arg('ID', () => ID) id: number,
        @Args() { NAME, SERIAL, CUST_HIER_ID_C, CUST_HIER_ID_P, OP_ID_M, OP_ID_S, INSTALL_DATE, MA_USER_ID, MA_START_DATE, MA_END_DATE, INSPECT_INFO }: ac_asset_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!id) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const update_data = {};
            for(const [key, value] of Object.entries({ NAME, SERIAL, CUST_HIER_ID_C, CUST_HIER_ID_P, OP_ID_M, OP_ID_S, INSTALL_DATE, MA_USER_ID, MA_START_DATE, MA_END_DATE, INSPECT_INFO })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(ac_asset).update({ ID: id }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async SetAssetInterface(
       @Arg('ACTION', () => ACTION_CD, { nullable: false }) action: ACTION_CD,
       @Arg('ID', () => Int, { nullable: false }) asset_id: number,
       @Arg('PROD_INTF_ID', () => Int, { nullable: true }) prod_intf_id: number,
       @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const user = await getRepository(ac_user).findOne({ USER_ID: ctx.user.sub });
            const prod_intf = await getRepository(pd_prod_intf).findOne({ ID: prod_intf_id });

            let result: boolean = false;
            switch(action) {
                case ACTION_CD.USED: {
                    result = await this.UsedInterface(asset_id, prod_intf, user);
                    // by shkoh 20220531: 사용이 가능한 INTERFACE로 변경
                    const update_result = await getRepository(ac_asset).update({ ID: asset_id }, { IS_USE_INTF: 1, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
                    result = result || (update_result.affected > 0 ? true : false);
                    break;
                }
                case ACTION_CD.NOT_USED: {
                    result = await this.NotUsedInterface(asset_id, user);
                    break;
                }
                case ACTION_CD.UPDATE: {
                    result = await this.UsedInterface(asset_id, prod_intf, user);
                    break;
                }
            }

            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    async UsedInterface(asset_id: number, prod_intf: pd_prod_intf, user: ac_user) {
        const [intf, intf_count] = await getRepository(cn_interface).findAndCount({ where: { ID: asset_id } });

        let result: number = 0;

        if(intf_count === 0) {
            // by shkoh 20220527: 해당 자산과 일치하는 cn_interface가 존재하지 않은 경우에는 insert를 수행
            result += await this.InsertInterface(asset_id, prod_intf, user);
        } else if(intf_count === 1) {
            // by shkoh 20220527: 해당 자산과 일치하는 cn_interface가 존재하는 경우에는 2가지 상황이 발생함
            // by shkoh 20220527: 1. 존재하는 PROD_INTF_ID가 동일한 경우에는 어떤 일도 하지 않지만
            // by shkoh 20220527: 2. 존재하는 PROD_INTF_ID가 다른 경우에는 모두 삭제하여 새로운 PROD_INTF_ID를 가진 데이터들로 부여함
            if(intf[0].PROD_INTF_ID !== prod_intf.ID) {
                result += await this.DeleteInterface(asset_id);
                result += await this.InsertInterface(asset_id, prod_intf, user);
            }
        }

        return result > 0 ? true : false;
    }

    async NotUsedInterface(asset_id: number, user: ac_user) {
        // by shkoh 20220527: 자산의 인터페이스를 사용하지 않은 경우에는 IS_USE_INTF가 0으로만 변경되면 됨
        const result = await getRepository(ac_asset).update({ ID: asset_id }, { IS_USE_INTF: 0, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
        return result.affected > 0 ? true : false;
    }

    async InsertInterface(asset_id: number, prod_intf: pd_prod_intf, user: ac_user) {
        // by shkoh 20220530: interface insert 과정
        try {
            let result: number = 0;
            
            // by shkoh 20220530: Step1. cn_interface 추가
            const c_i_result = await getRepository(cn_interface).insert({ ID: asset_id, PROD_INTF_ID: prod_intf.ID, UPDATE_USER_ID: user.ID, UPDATE_USER_DT: new Date() });
            result += c_i_result.identifiers.length;

            // by shkoh 20220530: Step2. cn_sensor 추가 cn_sensor 추가 후에 cn_sensor_threshold_xx 도 추가함
            const pd_sensor_list = await getRepository(pd_sensor).find({ where: { PD_INTF_ID: prod_intf.PD_INTF_ID }, relations: [ 'SENSOR_CODE' ] });
            pd_sensor_list.forEach(async ( p_s: pd_sensor ) => {
                // by shkoh 20220531: Step2.1 cn_sensor 한개 추가
                const c_s_result = await getRepository(cn_sensor).insert({
                    INTF_ID: asset_id,
                    NAME: p_s.NAME,
                    SENSOR_CD: p_s.SENSOR_CD,
                    DATA_ADDRESS: p_s.DATA_ADDRESS,
                    NODE_ID: p_s.NODE_ID,
                    ADJUST_VALUE: p_s.ADJUST_VALUE,
                    MC_ID: p_s.MC_ID,
                    DISP_POWER: p_s.DISP_POWER,
                    IS_EVENT: p_s.IS_EVENT,
                    IS_MKSTATS: p_s.IS_MKSTATS,
                    UPDATE_USER_ID: user.ID,
                    UPDATE_USER_DT: new Date()
                });

                result += c_s_result.identifiers.length;

                // by shkoh 20220531: Step2.2. 관련된 pd_sensor_threshold의 값을 가져옴
                const sensor_code = await p_s.SENSOR_CODE;
                let threshold: pd_sensor_threshold_ai | pd_sensor_threshold_di;
                if(sensor_code.TYPE === 'A') {
                    threshold = await getRepository(pd_sensor_threshold_ai).findOne({ ID: p_s.PD_THRESHOLD_ID });
                } else if(sensor_code.TYPE === 'D') {
                    threshold = await getRepository(pd_sensor_threshold_di).findOne({ ID: p_s.PD_THRESHOLD_ID });
                }

                // by shkoh 20220531: Step2.3. cn_sensor_threshold_xx에 ai와 di 값을 판별하여 데이터 insert
                if(threshold && sensor_code.TYPE === 'A') {
                    const c_s_t_a_result = await getRepository(cn_sensor_threshold_ai).insert({
                        SENSOR_ID: c_s_result.identifiers[0].ID,
                        HOLD_TIME: threshold.HOLD_TIME,
                        VALID_MIN: (threshold as pd_sensor_threshold_ai).VALID_MIN,
                        VALID_MAX: (threshold as pd_sensor_threshold_ai).VALID_MAX,
                        IS_VALID: (threshold as pd_sensor_threshold_ai).IS_VALID,
                        POINT_N3: (threshold as pd_sensor_threshold_ai).POINT_N3,
                        POINT_N2: (threshold as pd_sensor_threshold_ai).POINT_N2,
                        POINT_N1: (threshold as pd_sensor_threshold_ai).POINT_N1,
                        POINT_P1: (threshold as pd_sensor_threshold_ai).POINT_P1,
                        POINT_P2: (threshold as pd_sensor_threshold_ai).POINT_P2,
                        POINT_P3: (threshold as pd_sensor_threshold_ai).POINT_P3,
                        UPDATE_USER_ID: user.ID,
                        UPDATE_USER_DT: new Date()
                    });

                    result += c_s_t_a_result.identifiers.length;
                } else if(threshold && sensor_code.TYPE === 'D') {
                    const c_s_t_d_result = await getRepository(cn_sensor_threshold_di).insert({
                        SENSOR_ID: c_s_result.identifiers[0].ID,
                        HOLD_TIME: threshold.HOLD_TIME,
                        VALUE_0_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_0_LEVEL,
                        VALUE_0_LABEL: (threshold as pd_sensor_threshold_di).VALUE_0_LABEL,
                        VALUE_1_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_1_LEVEL,
                        VALUE_1_LABEL: (threshold as pd_sensor_threshold_di).VALUE_1_LABEL,
                        VALUE_2_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_2_LEVEL,
                        VALUE_2_LABEL: (threshold as pd_sensor_threshold_di).VALUE_2_LABEL,
                        VALUE_3_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_3_LEVEL,
                        VALUE_3_LABEL: (threshold as pd_sensor_threshold_di).VALUE_3_LABEL,
                        VALUE_4_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_4_LEVEL,
                        VALUE_4_LABEL: (threshold as pd_sensor_threshold_di).VALUE_4_LABEL,
                        VALUE_5_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_5_LEVEL,
                        VALUE_5_LABEL: (threshold as pd_sensor_threshold_di).VALUE_5_LABEL,
                        VALUE_6_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_6_LEVEL,
                        VALUE_6_LABEL: (threshold as pd_sensor_threshold_di).VALUE_6_LABEL,
                        VALUE_7_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_7_LEVEL,
                        VALUE_7_LABEL: (threshold as pd_sensor_threshold_di).VALUE_7_LABEL,
                        VALUE_8_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_8_LEVEL,
                        VALUE_8_LABEL: (threshold as pd_sensor_threshold_di).VALUE_8_LABEL,
                        VALUE_9_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_9_LEVEL,
                        VALUE_9_LABEL: (threshold as pd_sensor_threshold_di).VALUE_9_LABEL,
                        VALUE_10_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_10_LEVEL,
                        VALUE_10_LABEL: (threshold as pd_sensor_threshold_di).VALUE_10_LABEL,
                        VALUE_11_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_11_LEVEL,
                        VALUE_11_LABEL: (threshold as pd_sensor_threshold_di).VALUE_11_LABEL,
                        VALUE_12_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_12_LEVEL,
                        VALUE_12_LABEL: (threshold as pd_sensor_threshold_di).VALUE_12_LABEL,
                        VALUE_13_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_13_LEVEL,
                        VALUE_13_LABEL: (threshold as pd_sensor_threshold_di).VALUE_13_LABEL,
                        VALUE_14_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_14_LEVEL,
                        VALUE_14_LABEL: (threshold as pd_sensor_threshold_di).VALUE_14_LABEL,
                        VALUE_15_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_15_LEVEL,
                        VALUE_15_LABEL: (threshold as pd_sensor_threshold_di).VALUE_15_LABEL,
                        VALUE_16_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_16_LEVEL,
                        VALUE_16_LABEL: (threshold as pd_sensor_threshold_di).VALUE_16_LABEL,
                        VALUE_17_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_17_LEVEL,
                        VALUE_17_LABEL: (threshold as pd_sensor_threshold_di).VALUE_17_LABEL,
                        VALUE_18_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_18_LEVEL,
                        VALUE_18_LABEL: (threshold as pd_sensor_threshold_di).VALUE_18_LABEL,
                        VALUE_19_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_19_LEVEL,
                        VALUE_19_LABEL: (threshold as pd_sensor_threshold_di).VALUE_19_LABEL,
                        VALUE_20_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_20_LEVEL,
                        VALUE_20_LABEL: (threshold as pd_sensor_threshold_di).VALUE_20_LABEL,
                        VALUE_21_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_21_LEVEL,
                        VALUE_21_LABEL: (threshold as pd_sensor_threshold_di).VALUE_21_LABEL,
                        VALUE_22_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_22_LEVEL,
                        VALUE_22_LABEL: (threshold as pd_sensor_threshold_di).VALUE_22_LABEL,
                        VALUE_23_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_23_LEVEL,
                        VALUE_23_LABEL: (threshold as pd_sensor_threshold_di).VALUE_23_LABEL,
                        VALUE_24_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_24_LEVEL,
                        VALUE_24_LABEL: (threshold as pd_sensor_threshold_di).VALUE_24_LABEL,
                        VALUE_25_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_25_LEVEL,
                        VALUE_25_LABEL: (threshold as pd_sensor_threshold_di).VALUE_25_LABEL,
                        VALUE_26_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_26_LEVEL,
                        VALUE_26_LABEL: (threshold as pd_sensor_threshold_di).VALUE_26_LABEL,
                        VALUE_27_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_27_LEVEL,
                        VALUE_27_LABEL: (threshold as pd_sensor_threshold_di).VALUE_27_LABEL,
                        VALUE_28_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_28_LEVEL,
                        VALUE_28_LABEL: (threshold as pd_sensor_threshold_di).VALUE_28_LABEL,
                        VALUE_29_LEVEL: (threshold as pd_sensor_threshold_di).VALUE_29_LEVEL,
                        VALUE_29_LABEL: (threshold as pd_sensor_threshold_di).VALUE_29_LABEL,
                        UPDATE_USER_ID: user.ID,
                        UPDATE_USER_DT: new Date()
                    });

                    result += c_s_t_d_result.identifiers.length;
                }
            });

            // by shkoh 20220530: Step3. cn_ctrl_cmd 추가, 제어항목이 존재할 경우에 제어항목 추가
            const inserted_ctrl_cmd: Array<any> = (await getRepository(pd_ctrl_cmd).find({ where: { PD_INTF_ID: prod_intf.PD_INTF_ID } })).map((ctrl: pd_ctrl_cmd) => {
                return {
                    INTF_ID: asset_id,
                    NAME: ctrl.NAME,
                    CTRL_PKT_INFO: ctrl.CTRL_PKT_INFO,
                    UPDATE_USER_ID: user.ID,
                    UPDATE_USER_DT: new Date()
                };
            });
            
            if(inserted_ctrl_cmd.length > 0) {
                const c_c_c_result = await getRepository(cn_ctrl_cmd).insert(inserted_ctrl_cmd);
                result += c_c_c_result.identifiers.length;
            }

            // by shkoh 20220530: Step4. cn_modbus_cmd 추가
            const inserted_modbus_cmd: Array<any> = (await getRepository(pd_modbus_cmd).find({ where: { PD_INTF_ID: prod_intf.PD_INTF_ID } })).map((cmd: pd_modbus_cmd) => {
                return {
                    INTF_ID: asset_id,
                    MC_ID: cmd.MC_ID,
                    FUNC_NO: cmd.FUNC_NO,
                    START_ADDR: cmd.START_ADDR,
                    POINT_CNT: cmd.POINT_CNT,
                    DTYPE_CD: cmd.DTYPE_CD,
                    UPDATE_USER_ID: user.ID,
                    UPDATE_USER_DT: new Date()
                };
            });

            if(inserted_modbus_cmd.length > 0) {
                const c_m_c_result = await getRepository(cn_modbus_cmd).insert(inserted_modbus_cmd);
                result += c_m_c_result.identifiers.length;
            }

            // by shkoh 20220530: Step5. cn_tcpetc_cmd 추가
            const inserted_tcpetc_cmd: Array<any> = (await getRepository(pd_tcpetc_cmd).find({ where: { PD_INTF_ID: prod_intf.PD_INTF_ID } })).map((cmd: pd_tcpetc_cmd) => {
                return {
                    INTF_ID: asset_id,
                    CMD_ID: cmd.CMD_ID,
                    OPT1: cmd.OPT1,
                    OPT2: cmd.OPT2,
                    OPT3: cmd.OPT3,
                    UPDATE_USER_ID: user.ID,
                    UPDATE_USER_DT: new Date()
                };
            });

            if(inserted_tcpetc_cmd.length > 0) {
                const c_t_c_result = await getRepository(cn_tcpetc_cmd).insert(inserted_tcpetc_cmd);
                result += c_t_c_result.identifiers.length;
            }
            
            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    async DeleteInterface(asset_id: number) {
        // by shkoh 20220531: 자산 인터페이스 삭제 과정(등록과는 역순으로 수행)
        try {
            let result: number = 0;
            
            // by shkoh 20220531: Step1. cn_tcpetc_cmd 삭제
            const d_c_t_c_result = await getRepository(cn_tcpetc_cmd).delete({ INTF_ID: asset_id });
            result += d_c_t_c_result.affected;

            // by shkoh 20220531: Step2. cn_modbus_cmd 삭제
            const d_c_m_c_result = await getRepository(cn_modbus_cmd).delete({ INTF_ID: asset_id });
            result += d_c_m_c_result.affected;

            // by shkoh 20220531: Step3. cn_ctrl_cmd 삭제
            const d_c_c_c_result = await getRepository(cn_ctrl_cmd).delete({ INTF_ID: asset_id });
            result += d_c_c_c_result.affected;

            // by shkoh 20220531: Step4. cn_sensor 삭제
            const d_c_s_result = await getRepository(cn_sensor).delete({ INTF_ID: asset_id });
            result += d_c_s_result.affected;

            const d_i_result = await getRepository(cn_interface).delete({ ID: asset_id });
            result += d_i_result.affected;

            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}