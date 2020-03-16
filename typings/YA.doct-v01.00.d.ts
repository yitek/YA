declare enum InfoTypes {
    NS = 0,
    Class = 1,
    Method = 2
}
export declare class AssertException extends Error {
    outerMessage: string;
    constructor(msg: string, outerMessage?: string);
    toString(): string;
}
/**
 * 可以直接对应testclass
 *
 * @class NameInfo
 */
export declare class NameInfo {
    name: string;
    type: InfoTypes;
    private _fullname;
    get fullname(): string;
    descriptions: string[];
    set description(content: string);
    notices: string[];
    set notice(content: string);
    container: NameInfo;
    subs: {
        [name: string]: NameInfo;
    };
    /**
     *Creates an instance of Namespace.
     * @param {string} name
     * @param {NameInfo} parent
     * @memberof Namespace
     */
    constructor(name: string, container: NameInfo);
    execute(output: any): IExecuteRecord;
}
export declare type TAssert = (expected: any, actual: any, message?: string) => any;
export declare type TAssertStatement = (assert: TAssert) => any;
export declare type TUsageStatement = (assert_statement: TAssertStatement, container?: any) => any;
export interface IUsageAssertInfo {
    code: string;
    asserts?: string[];
}
export declare class ClassInfo extends NameInfo {
    ctor: {
        new (info?: ClassInfo): any;
    };
    constructor(ctor: {
        new (info?: ClassInfo): any;
    }, name: string, container: NameInfo);
}
export declare class UsageInfo extends NameInfo {
    exception: Error;
    codes: string[];
    /**
     *
     *
     * @type {TUsageStatement}
     * @memberof UsageInfo
     */
    statement: TUsageStatement;
    domContainer: any;
    constructor(statement: TUsageStatement, name: string, container: NameInfo);
    execute(param?: any): IExecuteRecord;
}
export interface IExecuteRecord {
    name: string;
    type: string;
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
    errorCount: number;
    usageCount: number;
    /**
     *
     *
     * @type {IUsageAssertInfo[]}
     * @memberof IExecuteRecord
     */
    codeInfos?: IUsageAssertInfo[];
    subs?: {
        [name: string]: IExecuteRecord;
    };
}
export interface IDoct {
    (name: string, description: string): any;
    rootName: string;
    rootNS: NameInfo;
    /**
     * 是否处于调试模式，如果是，就不会捕捉错误
     *
     * @type {boolean}
     * @memberof IDoct
     */
    debugging: boolean;
    beginLog: (rs: IExecuteRecord, info: NameInfo, extra?: any) => void;
    endLog: (rs: IExecuteRecord, info: NameInfo, extra?: any) => void;
    createElement: (tag: string, cls?: string, parent?: any) => any;
    appendChild: (p: any, c: any) => void;
    setContent: (node: any, content: string) => void;
}
export interface ILogger {
    section(info: NameInfo, param: any, record: IExecuteRecord, statement: (subLogger: ILogger) => any): ILogger;
    info(message: string): ILogger;
}
export declare class ConsoleLogger {
    section(info: NameInfo, param: any, record: IExecuteRecord, statement: (logger: ILogger) => any): this;
    info(message: string): this;
}
export declare class HtmlLogger {
    container: HTMLElement;
    constructor(container: HTMLElement);
    section(info: NameInfo, param: any, record: IExecuteRecord, statement: (logger: ILogger) => any): this;
    _renderNS(info: NameInfo, container: any, record: IExecuteRecord): void;
    /**
     * 展示Usage信息的代码
     *
     * @param {UsageInfo} info 信息
     * @param {*} container
     * @param {*} demo
     * @param {IExecuteRecord} record
     * @memberof HtmlLogger
     */
    _renderUsage(info: UsageInfo, container: any, demo: any, record: IExecuteRecord): void;
}
export {};
