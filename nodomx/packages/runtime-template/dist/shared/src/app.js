export function createAppContext(seed) {
    return {
        app: undefined,
        components: new Map((seed === null || seed === void 0 ? void 0 : seed.components) || []),
        config: {
            globalProperties: {
                ...((seed === null || seed === void 0 ? void 0 : seed.config.globalProperties) || {})
            }
        },
        directives: new Map((seed === null || seed === void 0 ? void 0 : seed.directives) || []),
        installedPlugins: new Set((seed === null || seed === void 0 ? void 0 : seed.installedPlugins) || []),
        provides: new Map((seed === null || seed === void 0 ? void 0 : seed.provides) || [])
    };
}
//# sourceMappingURL=app.js.map