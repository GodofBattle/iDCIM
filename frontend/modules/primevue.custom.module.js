import path from 'path';

export default function (moduleOptions) {
    const config = Object.assign({}, this.options.primevue, moduleOptions);

    this.options.css.push('primevue/resources/primevue.min.css');
    this.options.css.push('primeicons/primeicons.css');

    if (config.ripple) {
        this.addPlugin(
            path.resolve(
                __dirname,
                '../node_modules/primevue/config/plugin-ripple.js'
            )
        );
    } else {
        this.addPlugin(
            path.resolve(__dirname, '../node_modules/primevue/config/plugin.js')
        );
    }

    if (config.components) {
        config.components.forEach((component) =>
            this.addPlugin(
                path.resolve(
                    __dirname,
                    '../node_modules/primevue/' +
                        component.toLowerCase() +
                        '/plugin.js'
                )
            )
        );
    }

    if (config.directives) {
        config.directives.forEach((component) =>
            this.addPlugin(
                path.resolve(
                    __dirname,
                    '../node_modules/primevue/' +
                        component.toLowerCase() +
                        '/plugin.js'
                )
            )
        );
    }
}
