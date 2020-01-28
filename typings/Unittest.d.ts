export declare enum TestTargetTypes {
    Root = 0,
    Namespace = 1,
    Class = 2,
    Method = 3,
    Field = 4,
    Function = 5,
    Object = 6,
    Property = 7,
    Variable = 8,
    ObjectLikeFunction = 9,
    Usage = 10,
    Section = 11,
}
/**
 * 测试文档记录器
 *
 * @export
 * @interface ITestDocer
 */
export interface IUDoc {
    type: TestTargetTypes;
    name: string;
    description: string;
    children: {
        [name: string]: IUDoc;
    };
    parent?: IUDoc;
    start: Date;
    end: Date;
    ellapse: number;
    execute(params?: any): any;
}
export declare class UDoc implements IUDoc {
    type: TestTargetTypes;
    name: string;
    description: string;
    parent: UDoc;
    children: {
        [name: string]: IUDoc;
    };
    start: Date;
    end: Date;
    ellapse: number;
    constructor(type: TestTargetTypes, name: string, description: string, parent?: UDoc);
    execute(params?: any): void;
}
export declare let root: UDoc;
export declare class ClassDoc extends UDoc {
    ctor: {
        new (doc: IUDoc): {};
    };
    isInited: boolean;
    constructor(name: string, description: string, parent: UDoc, ctor: {
        new (doc: IUDoc): {};
    });
    execute(params?: any): void;
}
export declare class MethodDoc extends UDoc {
    method: Function;
    statementCount: number;
    constructor(name: string, description: string, parent: UDoc, method: Function);
    statement(nameOrStatement: any, statement?: (assert_statement: {
        (expected, actual, message): any;
    }) => any): void;
    execute(self?: any): void;
}
export declare class StatementDoc extends UDoc {
    exception: Error;
    statement: (assert_statement: {
        (expected, actual, message): any;
    }) => any;
    constructor(name: string, description: string, statement: (assert_statement: {
        (expected, actual, message): any;
    }) => any, parent?: UDoc);
    execute(): void;
}
export declare class UnittestError extends Error {
    outerMessage: string;
    constructor(msg: string, outerMessage?: string);
    toString(): string;
}
export declare function utest(name?: string): (target: any, propName?: string) => void;
