import gql from 'graphql-tag';
import { $apolloClient } from '../plugins/apolloClient';
import { $apolloHelper } from '../plugins/apolloHelper';

export const state = () => ({
    ui: {
        is_sidebar: true
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
    }
};

export const actions = {
    SIGNIN: (
        { commit },
        { role, access_token, refresh_token, user_id, user_name, user_group_id }
    ) => {
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
        $apolloHelper.onLogout();

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
                .catch(async (err) => {
                    console.error(`-- ${err}`);
                    await $apolloHelper.onLogout().then(() => {
                        commit('AUTHENTICATION', false);
                        commit('CLEARAUTH');

                        reject({ isError: true });
                    });
                });
        });
    }
};
