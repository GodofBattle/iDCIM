import { AuthenticationError, SchemaError, UserInputError } from "apollo-server-express";
import { Ctx, Mutation, Resolver, PubSub, Publisher, Arg } from "type-graphql";
import { GraphQLUpload, Upload, FileUpload } from 'graphql-upload';
import { getRepository } from "typeorm";
import { createWriteStream } from 'fs';

import { pd_file } from '../entity/database/pd_file';

@Resolver()
export class FileResolver extends Upload {
    @Mutation(() => Boolean)
    async AddFile(@Arg('FILE', () => GraphQLUpload) { createReadStream, filename }: FileUpload, @Ctx() ctx: any, @PubSub('REFRESHTOKEN') publish: Publisher<void>) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const writable_stream = createWriteStream(`${__dirname}/../file/${filename}`, { autoClose: true });
            const read_stream = createReadStream().pipe(writable_stream).on('finish', () => { console.info('success'); return true; }).on('error', () => { console.info('fail'); return false; })

            console.info(read_stream);




            // const result = await getRepository(pd_file).insert({ NAME: FILE.name, DATA: Buffer.from(array_file_buffer, 0, FILE.size) })
            // return result.identifiers.length > 0 ? true : false;
            return false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}