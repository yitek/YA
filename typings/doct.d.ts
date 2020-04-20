export interface IInfo {
    /**
     * 方法名，在ClassInfo.method参数中使用
     *
     * @type {string}
     * @memberof IInfo
     */
    name?: string;
    title?: string;
    descriptions?: string | any[];
    notices?: string | string[];
    debugging?: string;
}
export declare type TAssert = (expected: any, actual: any, message?: string) => any;
export declare type TAssertStatement = (assert: TAssert, container?: any) => any;
export declare type TUsageStatement = (assert_statement: TAssertStatement) => any;
export interface IDoct {
    (info: IInfo, target?: any): any;
    createDemoElement?: (immediate: boolean) => any;
    disposeDemoElement?: (elem: any) => any;
    hasDemo?: (demoElement: any) => boolean;
    logger?: ILogger;
    debugging?: boolean;
    autoRun?: boolean;
    /**
     * true/false/immediate,如果是immediate字符串，就会在logger输出的时候直接插入到dom中
     *
     * @type {(boolean|string)}
     * @memberof IDoct
     */
    useDemo?: boolean | string;
}
/**
 * unittest类或unittest方法的装饰器
 *
 * @param {string} name
 */
export declare function doct(info: IInfo, target?: any): any;
export declare let Doct: IDoct;
export declare class BasInfo {
    /**
     * 用于文档生成的标题,由装饰器给出
     *
     * @type {string}
     * @memberof MethodInfo
     */
    title: string;
    /**
     * 用于文档生成的描述信息，由装饰器给出
     *
     * @type {string}
     * @memberof BasInfo
     */
    descriptions: string[];
    /**
     * 描述中的注意事项,由装饰器给出
     *
     * @type {string[]}
     * @memberof BasInfo
     */
    notices: string[];
    constructor(info: IInfo);
}
export declare class ClassInfo extends BasInfo {
    ctor: {
        new (...args: any[]): any;
    };
    methods: {
        [name: string]: MethodInfo;
    };
    constructor(ctor: Function, info: IInfo);
    /**
     * 手动添加某些方法为测试方法
     *
     * @param {(string|string[])} methodname
     * @memberof BasInfo
     */
    method(info: IInfo): ClassInfo;
}
export declare class MethodInfo extends BasInfo {
    method: TUsageStatement;
    name: string;
    codes: string[];
    classInfo: ClassInfo;
    constructor(name: string, clsInfo: ClassInfo, info: IInfo);
    private _makeCodes;
}
export interface ILogger {
    beginClass(clsInfo: ClassInfo): ILogger;
    beginMethod(record: IExecuteRecord): ILogger;
    endMethod(record: IExecuteRecord): ILogger;
    endClass(clsInfo: ClassInfo): ILogger;
}
export declare class AssertException extends Error {
    outerMessage: string;
    constructor(msg: string, outerMessage?: string);
    toString(): string;
}
/**
 * 执行记录
 *
 * @export
 * @interface IExecuteRecord
 */
export interface IExecuteRecord {
    methodInfo: MethodInfo;
    /**
     * 测试开始时间
     *
     * @type {Date}
     * @memberof IExecuteResult
     */
    beginTime: Date;
    /**
     * 测试结束时间
     *
     * @type {Date}
     * @memberof IExecuteResult
     */
    endTime?: Date;
    /**
     * 测试耗时
     *
     * @type {number}
     * @memberof IExecuteResult
     */
    ellapse?: number;
    errorDetail?: any;
    /**
     *
     *
     * @type {IUsageAssertInfo[]}
     * @memberof IExecuteRecord
     */
    executeInfos?: IExecuteInfo[];
    demoElement?: any;
}
export interface IExecuteInfo {
    code: string;
    asserts?: string[];
}
export declare class HtmlLogger implements ILogger {
    container: any;
    private _usagesElement;
    private _usageElement;
    constructor(container?: any);
    beginClass(clsInfo: ClassInfo): ILogger;
    beginMethod(record: IExecuteRecord): ILogger;
    endMethod(record: IExecuteRecord): ILogger;
    endClass(clsInfo: ClassInfo): ILogger;
}
