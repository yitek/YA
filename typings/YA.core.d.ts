export interface IValueObservable<TEvtArgs> {
    $subscribe: (listener: (evt: TEvtArgs) => any) => IValueObservable<TEvtArgs>;
    $unsubscribe: (listener: (evt: TEvtArgs) => any) => IValueObservable<TEvtArgs>;
    $notify: (evt: TEvtArgs) => IValueObservable<TEvtArgs>;
}
export declare function valueObservable<TEvtArgs>(target: any): IValueObservable<TEvtArgs>;
export declare class ValueObservable<TEvtArgs> implements IValueObservable<TEvtArgs> {
    $_listeners: Function[];
    $subscribe: (listener: (evt: TEvtArgs) => any) => IValueObservable<TEvtArgs>;
    $unsubscribe: (listener: (evt: TEvtArgs) => any) => IValueObservable<TEvtArgs>;
    $notify: (evt: TEvtArgs) => IValueObservable<TEvtArgs>;
    constructor();
}
export declare enum ValueTypes {
    Value = 0,
    Object = 1,
    Array = 2,
}
export declare enum ChangeTypes {
    Value = 0,
    Replace = 1,
    Append = 2,
    Push = 3,
    Pop = 4,
    Shift = 5,
    Unshift = 6,
    Remove = 7,
}
export interface IChangeEventArgs {
    type: ChangeTypes;
    index?: string | number;
    target?: any;
    value?: any;
    old?: any;
    sender?: any;
    cancel?: boolean;
}
export interface IValueProxy extends IValueObservable<IChangeEventArgs> {
    $type: ValueTypes;
    $extras?: any;
    $target?: any;
    $index?: string | number;
    $modifiedValue?: any;
    $owner?: IValueProxy;
    $raw: (value?: any) => any;
    $get(): any;
    $set(newValue: any): IValueProxy;
    $update(): boolean;
}
export interface IObjectProxy extends IValueProxy {
    $props: {
        [name: string]: IValueProxy;
    };
}
export interface IArrayProxy extends IValueProxy {
    length: number;
    item(index: number, item_value?: any): any;
    pop(): any;
    push(item_value: any): IArrayProxy;
    shift(): any;
    unshift(item_value: any): IArrayProxy;
    $item_convertor?: IValueProxy;
}
export declare class ValueProxy extends ValueObservable<IChangeEventArgs> implements IValueProxy {
    $type: ValueTypes;
    $target: any;
    $index: number | string;
    $modifiedValue: any;
    $extras?: any;
    $owner?: IValueProxy;
    $raw: (value?: any) => any;
    constructor(raw: (val?: any) => any);
    $get(): any;
    $set(newValue: any): IValueProxy;
    $update(): boolean;
    toString(): any;
    static gettingProxy: boolean;
}
export interface IObjectMeta {
    propBuilder?: (define: (name: string, prop?: IValueProxy) => any) => any;
    fieldnames?: string[];
    methodnames?: string[];
}
export declare class ObjectProxy extends ValueProxy implements IObjectProxy {
    $props: {
        [name: string]: IValueProxy;
    };
    $target: any;
    constructor(raw: (val?: any) => any, meta: IObjectMeta);
    $get(): any;
    $set(newValue: any): IValueProxy;
    $update(): boolean;
}
export interface IArrayChangeEventArgs extends IChangeEventArgs {
    item?: IValueProxy;
}
export declare class ArrayProxy extends ValueProxy {
    $itemConvertor: (index: number, item_value: any, proxy: IArrayProxy) => IValueProxy;
    $changes: IArrayChangeEventArgs[];
    $length: number;
    length: number;
    constructor(raw: (val?: any) => any, item_convertor?: (index: number, item_value: any, proxy: IArrayProxy) => IValueProxy);
    clear(): IArrayProxy;
    resize(newLength: number): IArrayProxy;
    $set(newValue: any): IValueProxy;
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
