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
export declare enum TargetTypes {
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
    item?: IObservableProxy;
    sender?: any;
    cancel?: boolean;
}
export interface IObservableProxy extends IObservable<IChangeEventArgs> {
    $type: TargetTypes;
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
    Default = 0,
    Raw = 1,
    Proxy = 2,
}
export declare class ObservableProxy extends Observable<IChangeEventArgs> implements IObservableProxy {
    $type: TargetTypes;
    $target: any;
    $index: number | string;
    $modifiedValue: any;
    $extras?: any;
    $owner?: IObservableProxy;
    $raw: (value?: any) => any;
    constructor(raw: (val?: any) => any, initValue?: any);
    $get(): any;
    $set(newValue: any): IObservableProxy;
    $update(): boolean;
    toString(): any;
    static accessMode: ProxyAccessModes;
}
export interface IObjectMeta {
    propBuilder?: (ownerProxy: IObservableObject, define: (name: string, prop?: IObservableProxy) => any) => any;
    fieldnames?: string[];
    methodnames?: string[];
}
export interface IObservableObject extends IObservableProxy {
    [index: string]: any;
}
export declare class ObservableObject extends ObservableProxy implements IObservableObject {
    $target: any;
    [index: string]: any;
    constructor(raw: (val?: any) => any, meta: IObjectMeta, initValue?: object);
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
export declare class ObservableArray extends ObservableProxy {
    $itemConvertor: (index: number, item_value: any, proxy: IObservableArray) => IObservableProxy;
    $changes: IChangeEventArgs[];
    [index: number]: any;
    $length: number;
    length: number;
    constructor(raw: (val?: any) => any, item_convertor?: (index: number, item_value: any, proxy: IObservableArray) => IObservableProxy, initValue?: any[]);
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
    type: TargetTypes;
    index: string | number;
    item_model: Model;
    prop_models: {
        [index: string]: Model;
    };
    owner_model: Model;
    constructor(data: any, index?: string | number, owner?: Model);
    createProxy(data: any, ownerProxy?: IObservableProxy): IObservableProxy;
}
export declare enum ReactiveTypes {
    Local = 0,
    In = 1,
    Out = 2,
    IO = 3,
}
export declare enum ComponentReadyStates {
    Defined = 0,
    Completed = 1,
}
export interface IComponentMeta {
    $reactives?: {
        [attr: string]: ReactiveTypes;
    };
    $templates?: {
        [attr: string]: string;
    };
    $actions?: {
        [attr: string]: string;
    };
    $wrapType?: Function;
    $rawType?: Function;
    $tag?: string;
    $readyState?: ComponentReadyStates;
}
export interface IComponent extends IComponentMeta {
    [attr: string]: any;
}
export declare const componentTypes: {
    [tag: string]: {
        new (): {};
    };
};
export declare function component(tag: string | Function, meta?: IComponentMeta): any;
export declare function reactive(type?: ReactiveTypes | string): any;
export declare function action(async?: boolean): (target: any, propertyName: string) => void;
export declare function template(partial?: string): (target: any, propertyName: string) => void;
export declare let ELEMENT: any;
declare let YA: {
    Observable: typeof Observable;
    ProxyAccessModes: typeof ProxyAccessModes;
    ObservableProxy: typeof ObservableProxy;
    ObservableObject: typeof ObservableObject;
    ObservableArray: typeof ObservableArray;
    Model: typeof Model;
    component: (tag: string | Function, meta?: IComponentMeta) => any;
    reactive: (type?: string | ReactiveTypes) => any;
    action: (async?: boolean) => (target: any, propertyName: string) => void;
    ELEMENT: any;
};
export default YA;
