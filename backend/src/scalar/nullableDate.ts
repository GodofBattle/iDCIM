import { GraphQLScalarType, Kind } from 'graphql';

export const nullableDate = new GraphQLScalarType({
    name: 'Date',
    description: 'nullable date type',
    serialize(value: unknown): Date | null {
        // by shkoh 20210714: 클라이언트로 보낼 값
        if(value === undefined || value === null || (typeof value === 'string' && value === '')) {
            return null;
        } else {
            return new Date(value as string | number | Date);
        }
    },
    // by shkoh 20210714: 클라이언트로부터 입력 받는 값
    parseValue(value: unknown): Date | null {
        if(value === undefined || value === null || (typeof value === 'string' && value === '')) {
            return null;
        } else {
            return new Date(value as string | number | Date);
        }
    },
    // by shkoh 20210714: 클라이언트 쿼리로부터 받는 값
    parseLiteral(ast): Date | null {
        if(ast.kind === Kind.INT) {
            return new Date(ast.value);
        } else {
            return null;
        }
    }
});