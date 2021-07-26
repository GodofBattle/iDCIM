import Vuex from 'vuex';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';

import gql from 'graphql-tag';
import { $apolloClient } from '../plugins/apolloClient';
import { $apolloHelper } from '../plugins/apolloHelper';

const store = new Vuex.Store<any>({});

@Module({
    name: 'user',
    namespaced: true,
    stateFactory: true,
    store,
    dynamic: true
})
export default class userStore extends VuexModule {
    private user_name: String = '';

    public get userName() {
        return this.user_name;
    }

    @Mutation
    setUserName(_user_name: String) {
        this.user_name = _user_name;
    }

    @Action({ commit: 'setUserName', rawError: true })
    async changeUserName(_user_name: String) {
        let user_name;

        try {
            const {
                data: { UserName }
            } = await $apolloClient.mutate({
                mutation: gql`
                    mutation UserName($userId: String!, $newName: String!) {
                        UserName(userId: $userId, newName: $newName)
                    }
                `,
                variables: {
                    userId: 'icomer',
                    newName: _user_name
                }
            });

            user_name = UserName;
        } catch (error) {
            user_name = ' - ';
        }

        return user_name;
    }

    @Action({ rawError: true })
    async login(info: any) {
        try {
            const { userId, password } = info;

            const {
                data: { Login }
            } = await $apolloClient.mutate({
                mutation: gql`
                    mutation Login($userId: String!, $password: String!) {
                        Login(userId: $userId, password: $password)
                    }
                `,
                variables: {
                    userId,
                    password
                }
            });

            // by shkoh 20210719: Login이 완료가 됐다면, 사용자의 주요 정보들을 받아옴
            $apolloHelper.onLogin(Login, $apolloClient).then(async () => {
                const {
                    data: {
                        User: { NAME }
                    }
                } = await $apolloClient.query({
                    query: gql`
                        query User($userId: String!) {
                            User(userId: $userId) {
                                NAME
                            }
                        }
                    `,
                    variables: {
                        userId
                    }
                });

                this.context.commit('setUserName', NAME);
            });
        } catch {}
    }

    @Action({ rawError: true })
    logout() {
        $apolloHelper.onLogout();
    }
}
