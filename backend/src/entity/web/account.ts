import { Field, ObjectType } from "type-graphql";

import { PERM_CD } from '../../enum/PERM';
import { Token } from './token';
import { ac_user } from '../database/ac_user';

@ObjectType()
export class Account {
    @Field(type => PERM_CD)
    ROLE: PERM_CD;

    @Field(() => Token)
    TOKEN: Token;

    @Field(() => ac_user!)
    USER: ac_user | undefined;

    constructor({ role, access_token = undefined, user = undefined }) {
        this.ROLE = role ? role : 'GUEST';
        this.TOKEN = new Token({ access_token });
        this.USER = user;
    }
}