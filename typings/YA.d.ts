export declare enum ChangeTypes {
    Value = 0,
    Item = 1,
    Push = 2,
    Pop = 3,
    Shift = 4,
    Unshift = 5,
    Clear = 6,
}
export interface IChangeEventArgs {
    type: ChangeTypes;
    index?: string | number;
    value: any;
    old?: any;
    sender?: any;
    cancel?: boolean;
}
export interface IValueObservable {
    $subscribe: (listener: (evt: IChangeEventArgs) => any) => IValueObservable;
    $unsubscribe: (listener: (evt: IChangeEventArgs) => any) => IValueObservable;
    $notify: (evt: IChangeEventArgs) => IValueObservable;
}
export declare class ValueObservable implements IValueObservable {
    $subscribe: (listener: (evt: IChangeEventArgs) => any) => IValueObservable;
    $unsubscribe: (listener: (evt: IChangeEventArgs) => any) => IValueObservable;
    $notify: (evt: IChangeEventArgs) => IValueObservable;
    constructor();
}
export declare enum ValueTypes {
    Value = 0,
    Object = 1,
    Array = 2,
}
export interface IValueProxy extends IValueObservable {
    $type: ValueTypes;
    $extras: any;
    $owner?: IValueProxy;
    $raw: (value?: any) => any;
    $get(): any;
    $set(newValue: any): IValueProxy;
    $update(): boolean;
}
export interface IObjectProxy extends IValueProxy {
}
export interface IArrayProxy extends IValueProxy {
    length: number;
    item(index: number, item_value?: any): any;
    pop(): any;
    push(item_value: any): IArrayProxy;
    shift(): any;
    unshift(item_value: any): IArrayProxy;
}
export declare class ValueProxy extends ValueObservable implements IValueProxy {
    $type: ValueTypes;
    $modifiedValue: any;
    $extras: any;
    $owner?: IValueProxy;
    $raw: (value?: any) => any;
    constructor(raw: () => any, owner?: IValueProxy);
    $get(): any;
    $set(newValue: any): IValueProxy;
    $update(): boolean;
    toString(): any;
    static gettingProxy: boolean;
}
export interface IObjectMeta {
    propBuilder?: (proxy: IObjectProxy, props: {
        [name: string]: ValueProxy;
    }) => any;
    fieldnames?: string[];
    methodnames?: string[];
}
export declare class ObjectProxy extends ValueProxy implements IObjectProxy {
    $props: {
        [name: string]: ValueProxy;
    };
    constructor(raw: () => any, meta: IObjectMeta);
    $get(): any;
    $set(newValue: any): IValueProxy;
    $update(): boolean;
}
export interface IArrayChangeEventArgs extends IChangeEventArgs {
    item_value?: any;
}
export declare class ArrayProxy extends ValueProxy {
    $itemConvertor: (item_value: any, proxy: IArrayProxy) => any;
    $changes: IArrayChangeEventArgs[];
    $length: number;
    length: number;
    constructor(raw: () => any, item_convertor?: (item_value: any, proxy: IArrayProxy) => any);
    item(index: number, item_value?: any): any;
    push(item_value: any): ArrayProxy;
    pop(): any;
    unshift(item_value: any): ArrayProxy;
    shift(): any;
    $update(): boolean;
}
export interface IModel {
    parent?: IModel;
    props: {
        [propName: string]: IProperty;
    };
    path: string;
    ref_prop?: IProperty;
    prop: (name: string, sure?: boolean) => IProperty;
    createProxy(raw: (value?: any) => any): IValueProxy;
    asArray: () => IModel;
}
export interface IProperty {
    name: string;
    path: string;
    model: IModel;
    type: ValueTypes;
    value_model?: IModel;
    item_model?: IModel;
    asObject(): IModel;
    asArray(): IModel;
}
