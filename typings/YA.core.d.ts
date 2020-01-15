export interface IObservable<TEvtArgs> {
    $_listeners: Function[];
    $subscribe: (listener: (evt: TEvtArgs) => any) => IObservable<TEvtArgs>;
    $unsubscribe: (listener: (evt: TEvtArgs) => any) => IObservable<TEvtArgs>;
    $notify: (evt: TEvtArgs) => IObservable<TEvtArgs>;
}
export declare function valueObservable<TEvtArgs>(target: any): IObservable<TEvtArgs>;
export declare class Observable<TEvtArgs> implements IObservable<TEvtArgs> {
    $_listeners: Function[];
    $subscribe: (listener: (evt: TEvtArgs) => any) => IObservable<TEvtArgs>;
    $unsubscribe: (listener: (evt: TEvtArgs) => any) => IObservable<TEvtArgs>;
    $notify: (evt: TEvtArgs) => IObservable<TEvtArgs>;
    constructor();
}
export declare enum MemberTypes {
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
export interface IObservableProxy extends IObservable<IChangeEventArgs> {
    $type: MemberTypes;
    $extras?: any;
    $target?: any;
    $index?: string | number;
    $modifiedValue?: any;
    $owner?: IObservableProxy;
    $raw: (value?: any) => any;
    $get(): any;
    $set(newValue: any): IObservableProxy;
    $update(): boolean;
}
export declare enum ProxyAccessModes {
    Raw = 0,
    Proxy = 1,
}
export declare class ObservableProxy extends Observable<IChangeEventArgs> implements IObservableProxy {
    $type: MemberTypes;
    $target: any;
    $index: number | string;
    $modifiedValue: any;
    $extras?: any;
    $owner?: IObservableProxy;
    $raw: (value?: any) => any;
    constructor(raw: (val?: any) => any);
    $get(): any;
    $set(newValue: any): IObservableProxy;
    $update(): boolean;
    toString(): any;
    static accessMode: ProxyAccessModes;
}
export interface IObjectMeta {
    propBuilder?: (define: (name: string, prop?: IObservableProxy) => any) => any;
    fieldnames?: string[];
    methodnames?: string[];
}
export interface IObservableObject extends IObservableProxy {
    [index: string]: any;
}
export declare class ObservableObject extends ObservableProxy implements IObservableObject {
    $target: any;
    [index: string]: any;
    constructor(raw: (val?: any) => any, meta: IObjectMeta);
    $get(): any;
    $set(newValue: any): IObservableProxy;
    $update(): boolean;
}
export interface IObservableArray extends IObservableProxy {
    length: number;
    [index: number]: any;
    item(index: number, item_value?: any): any;
    pop(): any;
    push(item_value: any): IObservableArray;
    shift(): any;
    unshift(item_value: any): IObservableArray;
    $item_convertor?: IObservableProxy;
}
export interface IArrayChangeEventArgs extends IChangeEventArgs {
    item?: IObservableProxy;
}
export declare class ObservableArray extends ObservableProxy {
    $itemConvertor: (index: number, item_value: any, proxy: IObservableArray) => IObservableProxy;
    $changes: IArrayChangeEventArgs[];
    [index: number]: any;
    $length: number;
    length: number;
    constructor(raw: (val?: any) => any, item_convertor?: (index: number, item_value: any, proxy: IObservableArray) => IObservableProxy);
    clear(): IObservableArray;
    resize(newLength: number): IObservableArray;
    $set(newValue: any): IObservableProxy;
    item(index: number, item_value?: any): any;
    push(item_value: any): ObservableArray;
    pop(): any;
    unshift(item_value: any): ObservableArray;
    shift(): any;
    $update(): boolean;
    static structToken: string;
}
export declare function observable(target?: any): IObservable<any>;
export declare class Model {
    type: MemberTypes;
    index: string | number;
    item_model: Model;
    prop_models: {
        [index: string]: Model;
    };
    owner_model: Model;
    constructor(data: any, index: string | number, owner: Model);
    createProxy(data: any): IObservableProxy;
}
