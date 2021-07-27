import jwt from 'jsonwebtoken';
import { privateKey } from './privatekey';
import { AuthenticationError } from 'apollo-server-express';

export default (request: any) => {
    const header = request.req.headers.authorization;

    // by shkoh 20210727: Header Not Found
    if(!header) return { isAuth: false };

    // by shkoh 20210727: Verify Token
    const token: any = header.split(' ');

    // by shkoh 20210727: Token Not Found
    if(!token) return { isAuth: false };

    let decode_token: any;
    try {
        decode_token = jwt.verify(token[1], privateKey);
        console.info(decode_token);
    } catch(err) {
        console.info(err.name);
        throw new AuthenticationError(err.name);
    }

    // by shkoh 20210727: In case any error found
    if(!!!decode_token) return { isAuth: false };

    // by shkoh 20210727: Token deced successfully, and extracted data
    return { isAuth: true, user_id: decode_token.sub };
};