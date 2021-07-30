import jwt from 'jsonwebtoken';
import { Field, ObjectType } from "type-graphql";

import { privateKey, refreshTokenExpiresIn } from "../../utils/privatekey";

@ObjectType()
export class Token {
    @Field(() => String)
    ACCESS_TOKEN: String;

    @Field(() => String)
    REFRESH_TOKEN(): String {
        let refresh_token: string;

        try {
            let decode_token: jwt.JwtPayload;
            decode_token = jwt.decode(this.ACCESS_TOKEN.toString()) as jwt.JwtPayload;
            refresh_token = jwt.sign({ token: this.ACCESS_TOKEN }, privateKey, { algorithm: 'HS256', subject: decode_token.sub, expiresIn: refreshTokenExpiresIn });
            return refresh_token;
        } catch {
            refresh_token = '';
        }
        
        return refresh_token;
    };

    constructor({ access_token = '' }) {
        this.ACCESS_TOKEN = access_token;
    }
}