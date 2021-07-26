export const state = () => ({
    // icomer: {
    username: '고성혁',
    is_sidebar: true,
    version: 2.6
});

export const mutations = {
    sidebarToggle: (state) => {
        // state.icomer.is_sidebar = !state.icomer.is_sidebar;
        state.is_sidebar = !state.is_sidebar;
    }
};
