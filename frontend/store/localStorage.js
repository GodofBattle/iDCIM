export const state = () => ({
    theme: '',
    version: 3
});

export const mutations = {
    SETTHEME: (state, new_theme) => {
        state.theme = new_theme;
    }
};

export const actions = {
    CHANGETHEME: ({ commit, state }, new_theme) => {
        return new Promise((resolve, reject) => {
            let theme_name = state.theme;
            switch (new_theme) {
                case 'B':
                    theme_name = 'vela-blue';
                    break;
                case 'W':
                    theme_name = 'saga-green';
                    break;
                default:
                    theme_name = 'vela-blue';
                    break;
            }

            commit('SETTHEME', theme_name);

            resolve();
        });
    }
};
