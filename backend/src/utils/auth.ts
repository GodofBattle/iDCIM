import jwt from 'jsonwebtoken';
import { privateKey } from './privatekey';
import { AuthenticationError, ExpressContext } from 'apollo-server-express';

export default ({ req, connection }: ExpressContext) => {    
    let request_token = connection ? connection.context.authorization : req.headers.authorization;

    // by shkoh 20210727: Header Not Found
    if(!request_token) return { isAuth: false };

    // by shkoh 20210727: Verify Token
    const token: any = request_token.split(' ');

    // by shkoh 20210727: Token Not Found
    if(!token) return { isAuth: false };

    let decode_token: any;
    try {
        decode_token = jwt.verify(token[1], privateKey, { algorithms: [ 'HS256' ] });
    } catch(err) {
        throw new AuthenticationError(err.name);
    }

    // by shkoh 20210727: In case any error found
    if(!!!decode_token) return { isAuth: false };

    // by shkoh 20210727: Token deced successfully, and extracted data
    return { isAuth: true, user: decode_token };
};