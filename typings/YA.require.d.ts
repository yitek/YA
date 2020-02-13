interface IModuleOpts {
    name?: string;
    url?: string;
    value?: any;
}
interface IResourceOpts {
    url: string;
    success?: (elem) => any;
    error?: (err) => any;
}
interface IRequireConfigs {
    /**
     * url的解析规则
     *
     * @type {*}
     * @memberof IRequireConfigs
     */
    resolve_rules: any;
    /**
     * 预先加载的模块
     *
     * @type {*}
     * @memberof IRequireConfigs
     */
    modules: any;
}
