import jwt from 'jsonwebtoken';
import { privateKey } from './privatekey';
import { ExpressContext, PubSub } from 'apollo-server-express';

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
    if (!request_token) return { isAuth: false, isRefresh: false };

    // by shkoh 20210727: Verify Token
    const token: any = request_token.split(' ');

    // by shkoh 20210727: Token Not Found
    if (!token) return { isAuth: false, isRefresh: false };

    let decode_token: any;
    try {
        decode_token = jwt.verify(token[1], privateKey, { algorithms: ['HS256'] });
    } catch (err) {
        const errored_access_token: any = jwt.decode(token[1]);

        // by shkoh 20221014: 권한이 PERM03(운영자 계정)인 경우에는 access_token의 기한이 만료되더라도 refresh token이 정상인 경우에는 재발급하여 연결상태를 지속시켜 준다
        if(err.name === 'TokenExpiredError' && errored_access_token.iDCIM.roles === 'PERM03') {
            try {
                const refresh_token: any = jwt.verify(token[2], privateKey, { algorithms: ['HS256'] });
                const parsed_token = jwt.decode(refresh_token.token);

                return {
                    isAuth: true,
                    isRefresh: token[1] === refresh_token.token,
                    user: parsed_token,
                    remote: {
                        address: address,
                        port: port,
                        webSocketKey: webSocketKey
                    }
                };
            } catch (err) {
                console.info(`refresh token error: ${err.name}`);
            }
        } else {
            // by shkoh 20220126: token을 파싱할 경우에 jwt가 완성되지 않은 경우에는 인증절차 없이 데이터를 넘김
            console.info(`token error: ${err.name}`);
        }
    }

    // by shkoh 20210727: In case any error found
    if (!!!decode_token) return { isAuth: false, isRefresh: false };

    // by shkoh 20210727: Token deced successfully, and extracted data
    return {
        isAuth: true,
        isRefresh: false,
        user: decode_token,
        remote: {
            address: address,
            port: port,
            webSocketKey: webSocketKey
        }
    };
};