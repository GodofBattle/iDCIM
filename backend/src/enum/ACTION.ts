import { registerEnumType } from 'type-graphql';

export enum ACTION_CD {
    USED = 1,
    NOT_USED = 2,
    UPDATE = 3
};

registerEnumType(ACTION_CD, {
    name: 'ACTION_CD',
    description: '데이터처리 방법'
});