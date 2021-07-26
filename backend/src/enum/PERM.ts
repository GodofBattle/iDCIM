import { registerEnumType } from "type-graphql";

export enum PERM_CD {
    PERM00 = 'GUEST',
    PERM01 = 'ICOMER',
    PERM02 = 'ADMIN',
    PERM03 = 'USER'
}

registerEnumType(PERM_CD, {
    name: 'PERM_CD',
    description: '계정권한',
    valuesConfig: {
        PERM00: {
            description: '권한과 역할이 존재하지 않은 확인 불가 권한'
        }
    }
});