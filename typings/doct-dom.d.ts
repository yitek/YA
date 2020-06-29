import * as dt from "doct";
export declare let Doct: dt.IDoct;
export declare let doct: typeof dt.doct;
export declare type IDescritor = dt.IDescriptor;
export interface IDoct extends dt.IDoct {
    rootElement?: HTMLElement;
}
export declare function execute(cls: {
    new (): any;
} | dt.TestClass, parent?: HTMLElement): void;
