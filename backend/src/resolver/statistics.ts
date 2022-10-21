import { SchemaError } from "apollo-server-express";
import { Arg, Int, Query, Resolver } from "type-graphql";
import { getManager } from "typeorm";
import { statisticsAnalogData } from "../entity/web/statisticsAnalogData";

@Resolver()
export class StatisticsResolver {
    @Query(() => [statisticsAnalogData])
    async StatisticsAnalogSensor(
        @Arg('OFFSET', () => Int, { nullable: true }) offset: number = 0,
        @Arg('SIZE', () => Int, { nullable: true }) size: number = 1000
    ) {
        try {
            const result: Array<statisticsAnalogData> = await getManager().query(`
                SELECT
                    sasd.asset_id AS ASSET_ID,
                    aa.NAME AS ASSET_NAME,
                    sasd.sensor_id AS SENSOR_ID,
                    cs.NAME AS SENSOR_NAME,
                    TRUNCATE(sasd.min_value, 2) AS MIN_VALUE,
                    TRUNCATE(sasd.avr_value, 2) AS AVR_VALUE,
                    TRUNCATE(sasd.max_value, 2) AS MAX_VALUE,
                    sasd.start_dt AS START_DATE,
                    sasd.end_dt AS END_DATE
                FROM st_ai_sensor_day sasd
                JOIN cn_sensor cs ON sasd.sensor_id = cs.ID
                JOIN ac_asset aa ON aa.ID = cs.INTF_ID
                ORDER BY sasd.stat_dt DESC
                LIMIT ${size} OFFSET ${offset};
            `);

            return result;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}