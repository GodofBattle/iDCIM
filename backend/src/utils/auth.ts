import jwt from 'jsonwebtoken';
import { privateKey } from './privatekey';
import { ExpressContext } from 'apollo-server-express';

export default ({ req, connection }: ExpressContext) => {
    let request_token = connection ? connection.context.authorization : req.headers.authorization;

    let address: string;
    let port: number;
    let webSocketKey: string;
    if (connection) {
        address = connection.context.remote.address;
        port = connection.context.remote.port;
        webSocketKey = connection.context.remote.webSocketKey
    }

    // by shkoh 20210727: Header Not Found
    if (!request_token) return { isAuth: false };

    // by shkoh 20210727: Verify Token
    const token: any = request_token.split(' ');

    // by shkoh 20210727: Token Not Found
    if (!token) return { isAuth: false };

    let decode_token: any;
    try {
        decode_token = jwt.verify(token[1], privateKey, { algorithms: ['HS256'] });
    } catch (err) {
        // by shkoh 20220126: token을 파싱할 경우에 jwt가 완성되지 않은 경우에는 인증절차 없이 데이터를 넘김
        console.info(`token error: ${err.name}`);
    }

    // by shkoh 20210727: In case any error found
    if (!!!decode_token) return { isAuth: false };

    // by shkoh 20210727: Token deced successfully, and extracted data
    return {
        isAuth: true,
        user: decode_token,
        remote: {
            address: address,
            port: port,
            webSocketKey: webSocketKey
        }
    };
};