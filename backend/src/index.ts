import "reflect-metadata";

import { createServer, Server } from 'http';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import { createConnection, getConnection } from "typeorm";
import { buildSchemaSync } from 'type-graphql';
import { ApolloServerLoaderPlugin } from 'type-graphql-dataloader';

import { UserResolver } from './resolver/user';
import { CodeResolver } from './resolver/code';
import { SensorCodeResolver } from './resolver/sensorCode';
import { PredefinedProductResolver } from './resolver/predefinedProduct';

import Auth from './utils/auth';

const graphql_path = '/api';

const schemas = buildSchemaSync({
    resolvers: [UserResolver, CodeResolver, SensorCodeResolver, PredefinedProductResolver],
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
}).catch(error => console.log(error));

const app: express.Application = express();
const server: ApolloServer = new ApolloServer({
    schema: schemas,
    context: Auth,
    subscriptions: {
        onConnect: (connectionParams, webSocket, context) => {
            if (connectionParams['Authorization']) {
                return { authorization: connectionParams['Authorization'] };
            }
        },
        path: '/wsapi'
    },
    plugins: [
        ApolloServerLoaderPlugin({ typeormGetConnection: getConnection })
    ]
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(server.getMiddleware({ path: graphql_path, cors: { credentials: false } }));


const ip = process.env.API_HOST || 'localhost';
const api_server_port = process.env.API_PORT || 4000;

const httpServer: Server = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: api_server_port }, () => {
    console.info(`Apollo API Server Start::${ip}:${api_server_port}`);
});
