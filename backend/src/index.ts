import "reflect-metadata";

import { createServer, Server } from 'http';

import express from 'express';
import expressJwt from 'express-jwt'
import { ApolloServer } from 'apollo-server-express';

import { createConnection } from "typeorm";
import { buildSchemaSync } from 'type-graphql';

import { UserResolver } from './resolver/user';

const graphql_path = '/api';

const schemas = buildSchemaSync({
    resolvers: [ UserResolver ],
});

createConnection().then(async connection => {
    console.info(`api db connection: ${connection.isConnected}`);
}).catch(error => console.log(error));

const app: express.Application = express();
const server: ApolloServer = new ApolloServer({
    debug: false,
    schema: schemas,
    context: ({ req }) => {
        const user = req.user;
        return { user };
    }
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// by shkoh 20210719: header의 Authorization: Bearer <Token>으로 들어오는 jwt를 분석
app.use(graphql_path, expressJwt({
    algorithms: [ 'HS256' ],
    secret: 'icomer-iDCIM-connectors',
    credentialsRequired: false              // by shkoh 20210719: 인증 <Token>이 없는 경우에도, Request를 전달함(최초 로그인 처리를 위해 필요)
}));

app.use(server.getMiddleware({ path: graphql_path, cors: { credentials: false } }));

const ip = 'localhost';
const api_server_port = 4000;

const httpServer: Server = createServer(app);
httpServer.listen({ port: api_server_port }, () => {
    console.info(`Apollo API Server Start::${ip}:${api_server_port}`);
});
