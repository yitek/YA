/**
 * 文档片段
 * 可能就是一个文本，也可能是别的什么
 * @export
 * @interface IFragment
 */
export interface IFragment {
    /**
     * 内容类型
     * 程序用该字段确定如何呈现内容
     * @type {string}
     * @memberof IDocFragment
     */
    contentType?: string | string[];
    /**
     * 片段内容
     * 如果是数组,其contentType自动是 section
     * @type {string}
     * @memberof IDocFragment
     */
    content?: string | ISectionContent[];
}
export declare type ISectionContent = string | IFragment;
/**
 * 特征化的文档片段
 *
 * @export
 * @interface ISpecifiedDocFragment
 * @extends {IFragment}
 */
export interface ISpecifiedFragment extends IFragment {
    /**
     * 标题
     *
     * @type {string}
     * @memberof ISpecifiedDocFragment
     */
    title: string;
    /**
     * 关键字
     *
     * @type {string[]}
     * @memberof ISpecifiedDocFragment
     */
    keywords: string[];
}
/**
 * 组织为一颗树的文档片段
 *
 * @export
 * @interface ITreeNodeFragment
 */
export interface ITreeNodeFragment extends IFragment {
    nodeType: string;
    parent?: ITreeNodeFragment;
    children?: ITreeNodeFragment[];
}
export interface ICodeFragment extends IFragment {
    language: string;
    /**
     * 代码类型，是函数？类还是别的
     * execution，表示可执行片段，根据language调用该片段
     * @type {string}
     * @memberof ICodeFragment
     */
    codeKind: string;
    /**
     * 执行该代码所需的上下文信息，作为参数传递给编译器/执行器
     *
     * @type {*}
     * @memberof ICodeFragment
     */
    executeContext: any;
}
export interface IAssert {
    eq(actual: any, expected: any, message?: string): IAssert;
    neq(actual: any, expected: any, message?: string): IAssert;
    hasKey(actual: any, expected: any, message?: string): IAssert;
    hasValue(actual: any, expected: any, message?: string): IAssert;
    contains(actual: any, expected: any, message?: string): IAssert;
    True(value: any, message?: string): IAssert;
    False(value: any, message?: string): IAssert;
    Null(value: any, message?: string): IAssert;
    Undefined(value: any, message?: string): IAssert;
    isset(value: any, message?: string): IAssert;
    unset(value: any, message?: string): IAssert;
    empty(value: any, message?: string): IAssert;
    notEmpty(value: any, message?: string): IAssert;
}
/**
 * 断言结果
 *
 * @export
 * @interface IAssertResult
 */
export interface IAssertResult {
    /**
     * 断言类型
     *
     * @type {string}
     * @memberof IAssertResult
     */
    type: string;
    /**
     * 结果
     *
     * @type {boolean}
     * @memberof IAssertResult
     */
    result: boolean;
    /**
     * 消息
     *
     * @type {string}
     * @memberof IAssertResult
     */
    message: string;
    /**
     * 断言参数
     *
     * @type {*}
     * @memberof IAssertResult
     */
    params?: any;
}
export declare class AssertException extends Error implements IAssertResult {
    type: string;
    params?: any;
    result: boolean;
    constructor(type: string, message: string, params?: any);
}
export declare type TTestStatement = (statement: (assert: IAssert) => void) => void;
export declare type TTestMethod = (test: TTestStatement, context?: any) => any;
export declare class TestMethod {
    raw: TestMethod;
    name?: string;
    private _codes;
    private _wrappedMethod;
    descriptor: IDescriptor;
    constructor(raw: TestMethod, name?: string);
    private _initCodes;
    build(): TTestMethod;
    call(context: any, self?: any): any;
}
export interface IDescriptor {
    title?: string;
    description?: any;
    notice?: any;
}
export interface IExecuteContext {
    testMethod: TestMethod;
    testClass: TestClass;
    instance: any;
    context?: any;
}
export declare class TestClass {
    ctor: {
        new (): any;
    };
    methods: {
        [name: string]: TestMethod;
    };
    descriptor: IDescriptor;
    constructor(ctor: {
        new (): any;
    });
    run(): IFragment;
    buildDescriptor(descriptor: IDescriptor): IFragment;
    buildSectionContents(section: IFragment, desContent: any): void;
}
export interface IDoct {
    (descriptor: IDescriptor): any;
    /**
     * 是否处于调试状态，调试什么
     *
     * @type {string}
     * @memberof IDoct
     */
    debugging?: string | boolean;
    /**
     * 源数据的属性
     *
     * @type {string}
     * @memberof IDoct
     */
    descriptorToken?: string;
    contextFactory?: (opts: IExecuteContext) => any;
    autoRun?: boolean;
    methodExecuting?: (opts: IExecuteContext) => any;
    methodExecuted?: (section: IFragment, opts: IExecuteContext) => any;
    classExecuting?: (cls: TestClass) => any;
    classExecuted?: (section: IFragment, cls: TestClass) => any;
    testClasses?: TestClass[];
}
export declare function doct(descriptor?: IDescriptor): (subject: any, propname?: string) => void;
export declare let Doct: IDoct;
