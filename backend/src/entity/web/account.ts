import { Field, ObjectType } from "type-graphql";

import { PERM_CD } from '../../enum/PERM';
import { ac_user } from '../database/ac_user'

@ObjectType()
export class Account {
    @Field(type => PERM_CD)
    ROLE: PERM_CD;

    @Field(() => String!)
    ACCESS_TOKEN: String | undefined;

    @Field(() => String!)
    REFRESH_TOKEN: String | undefined;

    @Field(() => ac_user!)
    USER: ac_user | undefined;

    constructor({ role, access_token = undefined, refresh_token = undefined, user = undefined }) {
        this.ROLE = role ? role : 'GUEST';
        this.ACCESS_TOKEN = access_token;
        this.REFRESH_TOKEN = refresh_token;
        this.USER = user;
    }
}