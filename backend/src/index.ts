import "reflect-metadata";

import { createServer, Server } from 'http';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import { ApolloServerLoaderPlugin } from 'type-graphql-dataloader';
import { createConnection, getConnection } from "typeorm";
import { buildSchemaSync } from 'type-graphql';
import { graphqlUploadExpress } from 'graphql-upload';

import { SiteResolver } from './resolver/site';
import { UserResolver } from './resolver/user';
import { CodeResolver } from './resolver/code';
import { SensorCodeResolver } from './resolver/sensorCode';
import { PredefinedProductResolver } from './resolver/predefineProduct';
import { PredefinedAssetResolver } from './resolver/predefineAsset';
import { PredefinedInterfaceResolver } from './resolver/predefineInterface';
import { PredefineSensorResolver } from "./resolver/predefineSensor";
import { PredefineThresholdResolver } from "./resolver/predefineThreshold";
import { FileResolver } from './resolver/file';
import { TreeResolver } from './resolver/tree';
import { AccountCustomResolver } from './resolver/accountCustom';
import { ManagerResolver } from "./resolver/manager";
import { AssetResolver } from './resolver/asset';
import { InterfaceResolver } from './resolver/interface';
import { SensorResolver } from "./resolver/sensor";

import Auth from './utils/auth';

const graphql_path = '/api';

const schemas = buildSchemaSync({
    resolvers: [
        SiteResolver,
        UserResolver,
        CodeResolver,
        SensorCodeResolver,
        PredefinedProductResolver,
        PredefinedAssetResolver,
        PredefinedInterfaceResolver,
        PredefineSensorResolver,
        PredefineThresholdResolver,
        FileResolver,
        TreeResolver,
        AccountCustomResolver,
        ManagerResolver,
        AssetResolver,
        InterfaceResolver,
        SensorResolver
    ],
});

createConnection({
    type: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [
        'src/entity/**/*.ts'
    ],
    migrations: [
        'src/migration/**/*.ts'
    ],
    subscribers: [
        'src/subscriber/**/*.ts'
    ],
    cli: {
        entitiesDir: 'src/entity',
        migrationsDir: 'src/migration',
        subscribersDir: 'src/subscriber'
    }
}).then(async connection => {
    console.info(`api db connection: ${connection.isConnected}`);

    const app: express.Application = express();
    const server: ApolloServer = new ApolloServer({
        uploads: false,
        schema: schemas,
        context: Auth,
        subscriptions: {
            onConnect: (connectionParams, webSocket, context) => {
                if (connectionParams['Authorization']) {
                    return {
                        authorization: connectionParams['Authorization'],
                        remote: {
                            // by shkoh 20220425: 웹소켓 정보를 체크하기 위해서 임시로 추가함. 필요 여부에 따라서 향후 삭제 가능
                            webSocketKey: context.request.headers['sec-websocket-key'],
                            address: context.request.connection.remoteAddress,
                            port: context.request.connection.remotePort
                        }
                    };
                }
            },
            path: '/wsapi'
        },
        plugins: [
            ApolloServerLoaderPlugin({
                typeormGetConnection: () => connection
            })
        ]
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(graphqlUploadExpress({ maxFieldSize: 100 * 1024 * 1024, maxFileSize: 100 * 1024 * 1024, maxFiles: 5 }));
    app.use(server.getMiddleware({ path: graphql_path, cors: { credentials: false } }));

    const ip = process.env.API_HOST || 'localhost';
    const api_server_port = process.env.API_PORT || 4000;

    const httpServer: Server = createServer(app);
    server.installSubscriptionHandlers(httpServer);

    httpServer.listen({ port: api_server_port }, () => {
        console.info(`Apollo API Server Start::${ip}:${api_server_port}`);
    });
}).catch(error => console.log(error));
