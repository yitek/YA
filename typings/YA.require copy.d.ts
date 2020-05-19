interface IRequireReady {
    value: any;
    isCompleted: boolean;
    isReady: boolean;
    isFailed: boolean;
    ready(callback: (value: any) => any): IRequireReady;
    fail(callback: (value: any) => any): IRequireReady;
}
interface IRequireUri {
    paths: string[];
    orignal: string;
    resolved: string;
    url: string;
    filename: string;
}
interface IRequireDefine {
    (name: string | any[] | Function, deps?: any, statement?: any): void;
    /**
     * 用指定的window创建一个新的define
     * 主要用于iframe中
     *
     * @param {{[name:string]:any}} initModules
     * @param {*} window
     * @param {HTMLDocument} [document]
     * @memberof IDefine
     */
    create(initModules: {
        [name: string]: any;
    }, window: any, document?: HTMLDocument): IRequireDefine;
    config(cfgs: IRequireConfigs): IRequireDefine;
    require(name: string): IRequireDefine;
    context: IRequireContext;
    modules: {
        [alias: string]: IRequireModule;
    };
    disabled: boolean;
}
interface IRequireModuleOpts {
    name?: string;
    url?: string;
    value?: any;
    deps?: string[];
}
interface IRequireModule extends IRequireReady {
    uri: IRequireUri;
    url: string;
    name: string;
    resource: IRequireResource;
    deps: {
        [name: string]: any;
    };
    value: any;
    result: any;
    exports: any;
    default: any;
}
interface IRequireContext {
    name?: string;
    url?: string;
    deps?: string[];
}
interface IRequireResourceOpts {
    url: string;
    type: string;
}
interface IRequireResource extends IRequireReady {
    url: string;
    type: string;
    element: HTMLElement;
}
declare type TModuleConfigItem = IRequireModuleOpts | string;
interface IRequireConfigs {
    reset?: boolean;
    /**
     * url的解析规则
     *
     * @type {*}
     * @memberof IRequireConfigs
     */
    resolve_rules?: any;
    /**
     * 预先加载的模块
     *
     * @type {*}
     * @memberof IRequireConfigs
     */
    modules?: TModuleConfigItem[];
}
interface IRequireProgressEventArgs {
    name?: string;
    url?: string;
    ready?: boolean;
    loadingCount: number;
    readyCount: number;
    totalCount: number;
}
