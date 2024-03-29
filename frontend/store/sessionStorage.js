import gql from 'graphql-tag';
import { $apolloClient } from '../plugins/apolloClient';
import { $apolloHelper } from '../plugins/apolloHelper';

export const state = () => ({
    ui: {
        is_sidebar: true,
        is_pos_tree: false,
        is_cus_tree: false,
        is_enable_sms: false,
        is_enable_email: false
    },
    auth: {
        authenticated: false,
        role: '',
        access_token: '',
        refresh_token: '',
        user: {
            user_id: '',
            user_group_id: '',
            name: ''
        }
    },
    version: 3
});

export const mutations = {
    SIDEBARTOGGLE: (state) => {
        state.ui.is_sidebar = !state.ui.is_sidebar;
    },
    AUTHENTICATION: (state, flag) => {
        state.auth.authenticated = flag;
    },
    SETAUTH: (
        state,
        { role, access_token, refresh_token, user_id, user_group_id, user_name }
    ) => {
        state.auth.role = role;
        state.auth.access_token = access_token;
        state.auth.refresh_token = refresh_token;
        state.auth.user.user_id = user_id;
        state.auth.user.user_group_id = user_group_id;
        state.auth.user.name = user_name;
    },
    CLEARAUTH: (state) => {
        state.auth.role = '';
        state.auth.access_token = '';
        state.auth.refresh_token = '';
        state.auth.user.user_id = '';
        state.auth.user.user_group_id = '';
        state.auth.user.name = '';
    },
    SETUSER: (state, { user_id, user_group_id, user_name, role }) => {
        state.auth.user.user_id = user_id;
        state.auth.user.user_group_id = user_group_id;
        state.auth.user.name = user_name;
        state.auth.role = role;
    },
    CHANGEUSERNAME: (state, newName) => {
        state.auth.user.name = newName;
    },
    REFRESHTOKEN: (state, { access_token, refresh_token }) => {
        state.auth.access_token = access_token;
        state.auth.refresh_token = refresh_token;
    },
    ISPOSTREE: (state, is_enable) => {
        state.ui.is_pos_tree = is_enable === 1;
    },
    ISCUSTREE: (state, is_enable) => {
        state.ui.is_cus_tree = is_enable === 1;
    },
    ISENABLESMS: (state, is_enable) => {
        state.ui.is_enable_sms = is_enable === 1;
    },
    ISENABLEEMAIL: (state, is_enable) => {
        state.ui.is_enable_email = is_enable === 1;
    }
};

export const actions = {
    SIGNIN: (
        { commit },
        { role, access_token, refresh_token, user_id, user_name, user_group_id }
    ) => {
        $apolloHelper.onLogin(`${access_token} ${refresh_token}`);

        commit('AUTHENTICATION', true);
        commit('SETAUTH', {
            role,
            access_token,
            refresh_token,
            user_id,
            user_group_id,
            user_name
        });
    },
    SIGNOUT: ({ commit }) => {
        // by shkoh 20210817: 토큰이 존재하는 경우에 logout을 수행함
        if ($apolloHelper.getToken()) $apolloHelper.onLogout();

        commit('AUTHENTICATION', false);
        commit('CLEARAUTH');
    },
    USER: ({ commit }) => {
        return new Promise((resolve, reject) => {
            const userQuery = gql`
                query User {
                    User {
                        USER_ID
                        USER_GROUP_ID
                        PERM_CD
                        NAME
                    }
                }
            `;

            $apolloClient
                .query({ query: userQuery, fetchResults: true })
                .then(({ data: { User } }) => {
                    commit('SETUSER', {
                        user_id: User.USER_ID,
                        user_group_id: User.USER_GROUP_ID,
                        user_name: User.NAME,
                        role: User.PERM_CD
                    });
                    resolve(User);
                })
                .catch(async () => {
                    await $apolloHelper.onLogout().then(() => {
                        commit('AUTHENTICATION', false);
                        commit('CLEARAUTH');

                        reject({ isError: true });
                    });
                });
        });
    },
    CHANGEUSERNAME: ({ commit, state }, new_user_name) => {
        const mutateQuery = gql`
            mutation UserName($userId: String!, $newName: String!) {
                UserName(userId: $userId, newName: $newName)
            }
        `;

        $apolloClient
            .mutate({
                mutation: mutateQuery,
                variables: {
                    userId: state.auth.user.user_id,
                    newName: new_user_name
                }
            })
            .then(({ data: { UserName } }) => {
                commit('CHANGEUSERNAME', UserName);
            })
            .catch((error) => {
                console.error(error.message);
            });
    },
    SITE: ({ commit }) => {
        return new Promise((resolve, reject) => {
            const treeQuery = gql`
                query {
                    Site {
                        IS_ENABLE_CUST_HIER_P
                        IS_ENABLE_CUST_HIER_C
                        IS_ENABLE_SMS
                        IS_ENABLE_EMAIL
                    }
                }
            `
            $apolloClient
                .query({ query: treeQuery })
                .then(({ data: { Site } }) => {
                    if (Site) {
                        commit('ISPOSTREE', Site.IS_ENABLE_CUST_HIER_P);
                        commit('ISCUSTREE', Site.IS_ENABLE_CUST_HIER_C);
                        commit('ISENABLESMS', Site.IS_ENABLE_SMS);
                        commit('ISENABLEEMAIL', Site.IS_ENABLE_EMAIL);
                    }
                }).catch(async (error) => {
                    console.error(error);
                });
        });
    },
    SETPOSITIONTREE: ({ commit }, is_enable) => {
        const setMuate = gql`
            mutation {
                SetTreeConfig(IS_ENABLE_P: ${is_enable ? 1 : 0})
            }
        `

        $apolloClient
            .mutate({ mutation: setMuate })
            .then(({ data: { SetTreeConfig } }) => {
                if (SetTreeConfig) {
                    commit('ISPOSTREE', is_enable ? 1 : 0)
                }
            }).catch(async (error) => {
                console.info(error);
            });
    },
    SETCUSTOMTREE: ({ commit }, is_enable) => {
        const setMuate = gql`
            mutation {
                SetTreeConfig(IS_ENABLE_C: ${is_enable ? 1 : 0})
            }
        `

        $apolloClient
            .mutate({ mutation: setMuate })
            .then(({ data: { SetTreeConfig } }) => {
                if (SetTreeConfig) {
                    commit('ISCUSTREE', is_enable ? 1 : 0)
                }
            }).catch(async (error) => {
                console.info(error);
            });
    }
};
