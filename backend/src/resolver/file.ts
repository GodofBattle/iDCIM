import { AuthenticationError, SchemaError } from "apollo-server-express";
import { Ctx, Mutation, Resolver, PubSub, Publisher, Arg, Query } from "type-graphql";
import { GraphQLUpload, Upload, FileUpload } from 'graphql-upload';
import { getRepository } from "typeorm";

import { pd_file } from '../entity/database/pd_file';
import { DataBaseFile } from '../entity/web/databaseFile';

import streamToBuffer from '../utils/streamToBuffer';


@Resolver()
export class FileResolver extends Upload {
    @Mutation(() => Boolean)
    async AddPdFile(@Arg('FILE', () => GraphQLUpload) { createReadStream, filename, mimetype }: FileUpload, @Ctx() ctx: any, @PubSub('REFRESHTOKEN') publish: Publisher<void>) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            await publish();

            const buffer: Buffer = await streamToBuffer(createReadStream(), mimetype);
            const result = await getRepository(pd_file).insert({ NAME: filename.normalize('NFC'), MIME_TYPE: mimetype, DATA: buffer });
            return result.identifiers.length > 0 ? true : false;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }

    @Query(() => DataBaseFile)
    async PdFile(@Arg('ID', { nullable: true }) ID: number, @Ctx() ctx: any) {
        if (!ctx.isAuth) {
            throw new AuthenticationError('인증되지 않은 접근입니다');
        }

        try {
            // by shkoh 20210914: Database에 저장된 blob 형식의 파일을 base64의 형태로 변경하여 클라이언트로 전달
            const result = await getRepository(pd_file).findOne(ID);

            const file = new DataBaseFile();
            file.FILE_NAME = result.NAME.normalize('NFC');

            file.MIMETYPE = result.MIME_TYPE ? result.MIME_TYPE : 'application/octet-stream';
            file.DATA = result.DATA.toString('base64');

            return file;
        } catch (err) {
            throw new SchemaError(err.message);
        }
    }
}