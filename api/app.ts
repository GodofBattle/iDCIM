import express from 'express';
import { graphqlHTTP } from 'express-graphql';

import User from './schema/user';

const root = { hello: () => 'Hey! My me!' };

const app: express.Application = express();

app.use(express.json());
app.use(
    '/',
    graphqlHTTP({
        schema: User,
        graphiql: process.env.NODE_ENV === 'development',
    })
);

export default app;
