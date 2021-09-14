import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { GraphQLUpload, FileUpload, Upload } from "graphql-upload";
import { Args, Ctx, Mutation, Query, Resolver, PubSub, Publisher, Arg, Int, ID } from "type-graphql";
import { getRepository } from "typeorm";

import { pd_manufacturer, pd_manufacturer_args } from '../entity/database/pd_manufacturer';
import { pd_product, pd_product_args } from '../entity/database/pd_product';
import { pd_file } from '../entity/database/pd_file';

import streamToBuffer from '../utils/streamToBuffer';

@Resolver()
export class PredefinedProductResolver {
    @Mutation(() => Boolean)
    async AddManufacturer(
        @Args() { NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK }: pd_manufacturer_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!NAME) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_manufacturer).insert({ NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateManufacturer(
        @Arg('ID', () => ID) ID: number,
        @Args() { NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK }: pd_manufacturer_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            // by shkoh 20210902: 전달받은 인자들 중에서 데이터가 존재하는 인자들만 적용
            const update_data = {};
            for (const [key, value] of Object.entries({ NAME, ADDR, PHONE, FAX, EMAIL, URL, REMARK })) {
                if (value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(pd_manufacturer).update({ ID: ID }, update_data);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteManufacturer(
        @Arg('ID', () => ID) ID: number,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            const hasChild = await getRepository(pd_product).count({ where: { MANUFACTURER_ID: ID } });

            if (hasChild > 0) {
                throw new SchemaError('제품이 존재합니다');
            }

            const result = await getRepository(pd_manufacturer).delete(ID);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [pd_manufacturer])
    async Manufacturers(@Ctx() ctx: any) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_manufacturer).find({ order: { NAME: 'ASC' } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => pd_manufacturer, { nullable: true })
    async Manufacturer(@Arg('ID', () => ID) manufacturer_id: number, @Ctx() ctx: any): Promise<pd_manufacturer> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_manufacturer).findOne({ where: { ID: manufacturer_id } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async AddProduct(
        @Args() { MANUFACTURER_ID, ASSET_CD, NAME, MODEL_NAME, REMARK }: pd_product_args,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!MANUFACTURER_ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
            if (!ASSET_CD) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            const result = await getRepository(pd_product).insert({ MANUFACTURER_ID, ASSET_CD, NAME, MODEL_NAME, REMARK });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => pd_product, { nullable: true })
    async Product(@Arg('ID', () => ID) product_id: number, @Ctx() ctx: any): Promise<pd_product> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_product).findOne({ where: { ID: product_id } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateProduct(
        @Arg('ID', () => ID) ID: number,
        @Args() { MANUFACTURER_ID, ASSET_CD, NAME, MODEL_NAME, INFO, IMAGE_FILE_ID, REMARK }: pd_product_args,
        @Arg('IMAGE_FILE', () => GraphQLUpload, { nullable: true }) fileUpload: FileUpload,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if(!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let image_file_id = undefined;
            // by shkoh 20210914: fileUpload가 존재하는 경우는 제품의 이미지가 변경된다는 의미
            if(fileUpload) {
                // by shkoh 20210914: image 변경 전에 기존에 저장된 이미지가 존재한다면 해당 이미지는 삭제하고 진행함
                if(IMAGE_FILE_ID) {
                    await getRepository(pd_file).delete({ ID: IMAGE_FILE_ID })
                }
                
                // by shkoh 20210914: 전달받은 데이터를 Buffer로 변환하여 Database에 저장
                const image_buffer: Buffer = await streamToBuffer(fileUpload.createReadStream());
                const result = await getRepository(pd_file).insert({ NAME: fileUpload.filename, DATA: image_buffer });
                
                // by shkoh 20210914: 저장한 데이터는 Product를 갱신하는데 사용함
                image_file_id = result.identifiers.pop().ID;
            } else if(IMAGE_FILE_ID) {
                // by shkoh 20210914: Upload가 존재하지 않으나, 기존에 이미지가 존재했을 경우에는 기존 이미지는 삭제함
                await getRepository(pd_file).delete({ ID: IMAGE_FILE_ID });
                image_file_id = null;
            }

            const update_data = {};
            for(const [key, value] of Object.entries({ ASSET_CD, NAME, MODEL_NAME, INFO, REMARK, IMAGE_FILE_ID: image_file_id })) {
                if(value !== undefined) update_data[key] = value;
            }

            const result = await getRepository(pd_product).update({ ID: ID }, update_data);
            return result.affected > 0 ? true : false;
        } catch(err) {
            throw new SchemaError(err.message);
        }
    }
}