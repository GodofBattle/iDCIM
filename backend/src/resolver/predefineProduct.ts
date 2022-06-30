import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { GraphQLUpload, FileUpload } from "graphql-upload";
import { Args, Ctx, Mutation, Query, Resolver, PubSub, Publisher, Arg, ID, Int } from "type-graphql";
import { getRepository } from "typeorm";

import { pd_manufacturer, pd_manufacturer_args } from '../entity/database/pd_manufacturer';
import { pd_product, pd_product_args } from '../entity/database/pd_product';
import { pd_file } from '../entity/database/pd_file';

import streamToBuffer from '../utils/streamToBuffer';
import { pd_prod_intf } from "../entity/database/pd_prod_intf";

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

            if (MANUFACTURER_ID === undefined || MANUFACTURER_ID === null) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');
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

    @Query(() => [pd_product], { nullable: true })
    async VirtualProducts(@Ctx() ctx: any): Promise<pd_product[]> | null {
        if(!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            return (await getRepository(pd_product).find({ where: { MANUFACTURER_ID: 0 }, order: { NAME: 'ASC' } }));
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async UpdateProduct(
        @Arg('ID', () => ID) ID: number,
        @Args() { MANUFACTURER_ID, ASSET_CD, NAME, MODEL_NAME, INFO, MANUAL_FILE_ID, IMAGE_FILE_ID, REMARK }: pd_product_args,
        @Arg('IMAGE_FILE', () => GraphQLUpload, { nullable: true }) fileUpload: FileUpload,
        @Arg('MANUAL_FILE', () => GraphQLUpload, { nullable: true }) manualFileUpload: FileUpload,
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            if (!ID) throw new UserInputError('전달한 인자의 데이터가 잘못됐거나 형식이 틀렸습니다');

            let image_file_id = undefined;
            // by shkoh 20210914: fileUpload가 존재하는 경우는 제품의 이미지가 변경된다는 의미
            if (fileUpload) {
                // by shkoh 20210914: image 변경 전에 기존에 저장된 이미지가 존재한다면 해당 이미지는 삭제하고 진행함
                if (IMAGE_FILE_ID) {
                    await getRepository(pd_file).delete({ ID: IMAGE_FILE_ID });
                }

                // by shkoh 20210914: 전달받은 데이터를 Buffer로 변환하여 Database에 저장
                const image_buffer: Buffer = await streamToBuffer(fileUpload.createReadStream(), fileUpload.mimetype);
                const result = await getRepository(pd_file).insert({ NAME: fileUpload.filename.normalize('NFC'), MIME_TYPE: fileUpload.mimetype, DATA: image_buffer });

                // by shkoh 20210914: 저장한 데이터는 Product를 갱신하는데 사용함
                image_file_id = result.identifiers.pop().ID;
            } else if (IMAGE_FILE_ID === null) {
                const previous_image_file_id = (await getRepository(pd_product).findOne(ID)).IMAGE_FILE_ID;
                // by shkoh 20210927: IMAGE_FILE_ID가 null인 경우에 pd_file에 동일한 파일을 삭제하고 Clear를 진행함
                await getRepository(pd_file).delete({ ID: previous_image_file_id });
                image_file_id = null;
            }

            let manual_file_id = undefined;
            if (manualFileUpload) {
                if (MANUAL_FILE_ID) {
                    await getRepository(pd_file).delete({ ID: MANUAL_FILE_ID });
                }

                // by shkoh 20210914: 전달받은 데이터를 Buffer로 변환하여 Database에 저장
                const manual_buffer: Buffer = await streamToBuffer(manualFileUpload.createReadStream(), manualFileUpload.mimetype);
                const result = await getRepository(pd_file).insert({ NAME: manualFileUpload.filename.normalize('NFC'), MIME_TYPE: manualFileUpload.mimetype, DATA: manual_buffer });

                // by shkoh 20210914: 저장한 데이터는 Product를 갱신하는데 사용함
                manual_file_id = result.identifiers.pop().ID;
            } else if (MANUAL_FILE_ID === null) {
                const previous_manual_file_id = (await getRepository(pd_product).findOne(ID)).MANUAL_FILE_ID;
                await getRepository(pd_file).delete({ ID: previous_manual_file_id });
                manual_file_id = null;
            }

            const update_data = {};
            for (const [key, value] of Object.entries({ ASSET_CD, NAME, MODEL_NAME, INFO, REMARK, MANUAL_FILE_ID: manual_file_id, IMAGE_FILE_ID: image_file_id })) {
                if (value !== undefined) update_data[key] = value;
            }

            let result = 0;
            if(Object.keys(update_data).length > 0) {
                const update_result = await getRepository(pd_product).update({ ID: ID }, update_data);
                result += update_result.affected;
            }

            return result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean)
    async DeleteProduct(
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

            // by shkoh 20210928: 미구현. 추후에 product의 존재여부를 파악하여 삭제를 막음
            // by shkoh 20210928: 예시
            // const hasChild = await getRepository(pd_product).count({ where: { MANUFACTURER_ID: ID } });

            // if (hasChild > 0) {
            //     throw new SchemaError('제품이 존재합니다');
            // }

            // by shkoh 20210928: Product 삭제 시 관련된 다른 정보(매뉴얼 파일, 제품 파일)들도 함께 삭제
            const product = await getRepository(pd_product).findOne(ID);

            if (product.IMAGE_FILE_ID) await getRepository(pd_file).delete({ ID: product.IMAGE_FILE_ID });
            if (product.MANUAL_FILE_ID) await getRepository(pd_file).delete({ ID: product.MANUAL_FILE_ID });

            const result = await getRepository(pd_product).delete(ID);
            return result.affected > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => [pd_prod_intf], { nullable: true })
    async ProductInterfaces(
        @Arg('PRODUCT_ID', () => Int!) product_id: number,
        @Ctx() ctx: any
    ): Promise<pd_prod_intf[]> | undefined {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            // const prod_intf = await getRepository(pd_prod_intf).find({ where: { PRODUCT_ID: product_id } });
            const prod_intf = await getRepository(pd_prod_intf)
                .createQueryBuilder('prod')
                .innerJoinAndSelect('prod.INTERFACE', 'intf', 'prod.PD_INTF_ID = intf.ID')
                .where(`prod.PRODUCT_ID = ${product_id}`)
                .orderBy('intf.NAME', 'ASC')
                .getMany();
            
            return prod_intf;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Mutation(() => Boolean, { nullable: true })
    async UpdateProductInterfaces(
        @Arg('PRODUCT_ID', () => ID) productId: number,
        @Arg('INPUT', () => [Int], { nullable: true }) input: number[],
        @Ctx() ctx: any,
        @PubSub('REFRESHTOKEN') publish: Publisher<void>
    ): Promise<Boolean> {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다')
        }

        try {
            await publish();

            if (!productId) throw new UserInputError('전달한 인자의 데이터가 존재하지 않습니다');

            let is_result: number = 0;
            
            // const delete_result = await getRepository(pd_prod_intf).delete({ PRODUCT_ID: productId });
            // is_result = delete_result.affected;

            // input.forEach(async (pd_intf_id: number) => {
            //     const result = await getRepository(pd_prod_intf).insert({ PRODUCT_ID: productId, PD_INTF_ID: pd_intf_id });
            //     is_result += result.identifiers.length;
            // });

            return is_result > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}