module.exports = {
    settings: {
        "vetur.useWorkspaceDependencies": true,
    },
    projects: [
        {
            root: './frontend',
            package: './package.json',
            tsconfig: './tsconfig.json'
        }
    ]
}