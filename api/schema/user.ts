import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLSchema,
} from 'graphql';

const UserType: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
    }),
});

const UserQuery: GraphQLObjectType = new GraphQLObjectType({
    name: 'UserQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLString,
                },
            },
            resolve: async (parentValue, args) => {
                return { id: '1', name: 'one', age: 1 };
            },
        },
        users: {
            type: new GraphQLList(UserType),
            resolve: async (parentValue, args) => {
                return [
                    { id: '1', name: 'one', age: 1 },
                    { id: '3', name: 'three', age: 3 },
                    { id: '2', name: 'two', age: 2 },
                ];
            },
        },
    },
});

const schema: GraphQLSchema = new GraphQLSchema({
    query: UserQuery,
});

export default schema;
