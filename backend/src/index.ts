import "reflect-metadata";

import { createServer, Server } from 'http';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import { createConnection } from "typeorm";
import { buildSchemaSync } from 'type-graphql';

import { UserResolver } from './resolver/user';
import Auth from './utils/auth'

const graphql_path = '/api';

const schemas = buildSchemaSync({
    resolvers: [ UserResolver ],
});

createConnection().then(async connection => {
    console.info(`api db connection: ${connection.isConnected}`);
}).catch(error => console.log(error));

const app: express.Application = express();
const server: ApolloServer = new ApolloServer({
    schema: schemas,
    context: Auth,
    subscriptions: {
        onConnect: (connectionParams, webSocket, context) => {
            if(connectionParams['Authorization']) {
                return { authorization: connectionParams['Authorization'] };
            }
        },
        path: '/wsapi'
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(server.getMiddleware({ path: graphql_path, cors: { credentials: false } }));


const ip = 'localhost';
const api_server_port = 4000;

const httpServer: Server = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: api_server_port }, () => {
    console.info(`Apollo API Server Start::${ip}:${api_server_port}`);
});
