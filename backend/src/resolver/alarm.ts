import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";
import { getManager, getRepository, Raw } from "typeorm";
import { lg_alarm } from "../entity/database/lg_alarm";
import { LogAlarmCountType } from "../entity/web/statisticsType";

@Resolver()
export class AlarmResolver {
    @Query(() => [lg_alarm])
    async LogAlarm(
        @Arg('ASSET_ID', () => Int) asset_id: number,
        @Arg('OFFSET', () => Int, { nullable: true }) offset: number = 0,
        @Arg('CONDITION', () => String, { nullable: true }) condition: string = '',
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const where = condition === '' ? '' : ` AND DATE_FORMAT(la.OCCUR_DT, "%Y-%m") = "${condition}"`;

            const result = await getManager().query(`
                SELECT
                    la.ID, la.ASSET_ID, la.SENSOR_ID, la.FLAG, la.OCCUR_DT, la.OCCUR_CD, la.OCCUR_LEVEL, la.OCCUR_STATUS, la.OCCUR_MSG, la.RECOVER_DT, la.RECOVER_LEVEL, la.RECOVER_STATUS, la.RECOVER_MSG,
                    cs.NAME AS SENSOR_NAME,
                    TIMEDIFF(la.RECOVER_DT, la.OCCUR_DT) AS ALARM_PERIOD
                FROM lg_alarm la
                LEFT JOIN cn_sensor cs ON la.SENSOR_ID = cs.ID
                WHERE
                    la.ASSET_ID = ${asset_id}${where}
                ORDER BY la.OCCUR_DT DESC
                LIMIT 100 OFFSET ${offset};
            `);

            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => Int)
    async CountLogAlarm(
        @Arg('ASSET_ID', () => Int) asset_id: number,
        @Arg('CONDITION', () => String, { nullable: true }) condition: string = '',
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            if(condition === '') {
                return await getRepository(lg_alarm).count({ ASSET_ID: asset_id });
            } else {
                return await getRepository(lg_alarm).count({ ASSET_ID: asset_id, OCCUR_DT: Raw((alias) => `DATE_FORMAT(${alias}, "%Y-%m") = "${condition}"`) });
            }
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [LogAlarmCountType], { nullable: true })
    async StatisticsLogAlarm(
        @Arg('ASSET_ID', () => Int) asset_id: number,
        @Ctx() ctx: any
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            const result = await getManager().query(`
                SELECT
                    DATE_FORMAT(la.OCCUR_DT, "%Y-%m") AS DT,
                    COUNT(1) AS ALARM_COUNT
                FROM lg_alarm la
                WHERE
                    la.ASSET_ID = ${asset_id}
                GROUP BY DT
                ORDER BY la.OCCUR_DT;
            `);

            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}