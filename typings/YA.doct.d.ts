export declare enum Doctypes {
    Root = 0,
    Namespace = 1,
    Class = 2,
    Member = 3,
    Usage = 4,
}
export declare class Doct {
    type: Doctypes;
    parent: NamespaceDoct;
    name: string;
    descriptions: string[];
    start: Date;
    end: Date;
    ellapse: number;
    usageCount: number;
    errorCount: number;
    constructor(type: Doctypes, parent: NamespaceDoct);
    execute(params?: any): Doct;
    reset(): Doct;
    description: string;
}
export declare class NamespaceDoct extends Doct {
    subs: {
        [name: string]: NamespaceDoct;
    };
    _fullName: string;
    _name: string;
    constructor(name: string, type: Doctypes, parent?: NamespaceDoct);
    _mergeTo(target: NamespaceDoct): void;
    name: string;
    fullName: string;
    execute(params?: any): NamespaceDoct;
    reset(): NamespaceDoct;
    toString(): string;
}
export declare type TAssert = (expected: any, actual: any, message?: string) => any;
export declare type TAssertStatement = (assert: TAssert) => any;
export declare type TUsageStatement = (assert_statement: TAssertStatement) => any;
export interface IUsageCode {
    code: string;
    asserts?: string[];
}
export declare class UsageDoct extends Doct {
    name: string;
    exception: Error;
    codes: IUsageCode[];
    statement: TUsageStatement;
    constructor(statement: TUsageStatement, parent?: StatementDoct, name?: string);
    execute(params?: any): UsageDoct;
    reset(): UsageDoct;
    setEllapse(value: number): UsageDoct;
}
export declare class StatementDoct extends NamespaceDoct {
    usages: {
        [name: string]: UsageDoct;
    };
    constructor(type: Doctypes, parent?: NamespaceDoct, name?: string);
    usage(name: string | TUsageStatement, description?: string | TUsageStatement, statement?: TUsageStatement): void;
    execute(params?: any): StatementDoct;
    reset(): StatementDoct;
    _mergeTo(target: StatementDoct): void;
}
export declare class ClassDoct extends StatementDoct {
    ctor: {
        new (doc: ClassDoct): {};
    };
    isInited: boolean;
    constructor(ctor: {
        new (doc: ClassDoct): {};
    }, parent?: NamespaceDoct);
    execute(params?: any): ClassDoct;
}
export declare class MemberDoct extends StatementDoct {
    method: Function;
    constructor(method: Function, parent: NamespaceDoct);
    execute(self?: any): this;
}
export declare function date_format(date: any): string;
export declare class AssertException extends Error {
    outerMessage: string;
    constructor(msg: string, outerMessage?: string);
    toString(): string;
}
export declare type TDoct = {
    (nameOrType?: string | Doctypes): any;
    debugging?: boolean | string;
    reset?: () => TDoct;
    output?: (params?: any, doc?: Doct) => TDoct;
};
export declare let doct: TDoct;
export default doct;
