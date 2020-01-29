export declare function intimate(strong?: boolean | any, members?: any): (target: any, propName?: string) => void;
/**
 * 可监听对象接口
 *
 * @export
 * @interface IObservable
 * @template TEvtArgs 事件参数的类型
 */
export interface ISubject<TEvtArgs> {
    /**
     * 内部的主题列表，可以访问它，但不推荐直接使用，主要是debug时使用
     * 如果不指明主题topic，默认topic=""
     * @type {[topic:string]:Function[]}
     * @memberof ISubject
     */
    $_topics: {
        [topic: string]: Function[];
    };
    /**
     * 注册监听函数
     * $notify的时候，注册了相关主题的监听函数会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $subscribe(topicOrListener: string | {
        (evt: TEvtArgs): any;
    }, listener?: {
        (evt: TEvtArgs): any;
    }): ISubject<TEvtArgs>;
    /**
     * 取消主题订阅
     * $notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $unsubscribe(topicOrListener: string | {
        (evt: TEvtArgs): any;
    }, listener?: {
        (evt: TEvtArgs): any;
    }): ISubject<TEvtArgs>;
    /**
     * 发送通知
     * 如果相关主题上有监听器，会逐个调用监听器
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|TEvtArgs)} topicOrEvtArgs 通知的主题或事件参数
     * @param {TEvtArgs} [evt] 事件参数，只有topicOrEvtArgs是topic才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $notify(topicOrEvtArgs: string | TEvtArgs, evt?: TEvtArgs): ISubject<TEvtArgs>;
}
/**
 * 可监听对象类
 * 实现订阅/发布模式
 * 它支持订阅/发布某个主题;如果未指定主题，默认主题为""
 * 它的所有关于订阅发布的成员字段/函数都是enumerable=false的
 * 一般用作其他类型的基类
 *
 * @export
 * @class Observable
 * @implements {IObservable<TEvtArgs>}
 * @template TEvtArgs 事件参数的类型
 */
export declare class Subject<TEvtArgs> implements ISubject<TEvtArgs> {
    /**
     * 内部的主题列表，可以访问它，但不推荐直接使用，主要是debug时使用
     * 如果不指明主题topic，默认topic=""
     *
     * @type {[topic:string]:Function[]}
     * @memberof Observable
     */
    $_topics: {
        [topic: string]: {
            (evt: TEvtArgs): any;
        }[];
    };
    constructor();
    /**
     * 注册监听函数
     * $notify的时候，注册了相关主题的监听函数会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $subscribe(topicOrListener: string | {
        (evt: TEvtArgs): any;
    }, listener?: {
        (evt: TEvtArgs): any;
    }): ISubject<TEvtArgs>;
    /**
     * 取消主题订阅
     * $notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $unsubscribe(topicOrListener: string | {
        (evt: TEvtArgs): any;
    }, listener?: {
        (evt: TEvtArgs): any;
    }): ISubject<TEvtArgs>;
    /**
     * 发送通知
     * 如果相关主题上有监听器，会逐个调用监听器
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|TEvtArgs)} topicOrEvtArgs 通知的主题或事件参数
     * @param {TEvtArgs} [evt] 事件参数，只有topicOrEvtArgs是topic才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $notify(topicOrEvtArgs: string | TEvtArgs, evtArgs?: TEvtArgs): ISubject<TEvtArgs>;
}
export declare enum DataTypes {
    Value = 0,
    Object = 1,
    Array = 2,
}
export interface IObservable<TData> extends ISubject<IChangeEventArgs<TData>> {
    $type: DataTypes;
    $extras?: any;
    $target?: TData;
    $get(): TData | IObservable<TData>;
    $set(newValue: TData): IObservable<TData>;
    $update(): boolean;
}
export declare enum ObservableModes {
    Default = 0,
    Raw = 1,
    Proxy = 2,
}
export declare function usingMode(mode: ObservableModes, statement: () => any): void;
export interface IChangeEventArgs<TData> {
    type: ChangeTypes;
    index?: string | number;
    target?: any;
    value?: any;
    old?: any;
    item?: IObservable<TData>;
    sender?: any;
    cancel?: boolean;
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
export declare class Observable<TData> extends Subject<IChangeEventArgs<TData>> implements IObservable<TData> {
    $type: DataTypes;
    $target: TData;
    $extras?: any;
    $schema?: ObservableSchema<TData>;
    $_index?: number | string;
    $_modifiedValue: TData;
    $_owner?: ObservableObject<any>;
    $_raw: (value?: TData) => any;
    constructor(initValue: TData | ObservableSchema<TData> | {
        (val?: TData): any;
    }, index: {
        (val?: TData): any;
    } | string | number, $_owner?: any, $extras?: any);
    $get(): TData | IObservable<TData>;
    $set(newValue: TData): IObservable<TData>;
    $update(): boolean;
    toString(): any;
    static mode: ObservableModes;
}
export interface IObservableObject<TData extends {
    [index: string]: any;
}> extends IObservable<TData> {
    [index: string]: any;
}
export declare class ObservableObject<TData> extends Observable<TData> implements IObservableObject<TData> {
    [index: string]: any;
    constructor(initValue: TData | ObservableSchema<TData> | {
        (val?: TData): any;
    }, index: {
        (val?: TData): any;
    } | string | number, owner?: any, extras?: any);
    $get(): any;
    $set(newValue: TData): IObservableObject<TData>;
    $update(): boolean;
}
export interface IObservableArray extends IObservable {
    length: number;
    [index: number]: any;
    item(index: number, item_value?: any): any;
    pop(): any;
    push(item_value: any): IObservableArray;
    shift(): any;
    unshift(item_value: any): IObservableArray;
    $item_convertor?: IObservable;
}
export declare class ObservableArray extends Observable {
    $itemConvertor: (index: number, item_value: any, proxy: ObservableArray) => Observable;
    $changes: IChangeEventArgs[];
    [index: number]: any;
    $length: number;
    length: number;
    constructor(raw: (val?: any) => any, item_convertor?: (index: number, item_value: any, proxy: ObservableArray) => IObservable, initValue?: any[], extras?: any);
    clear(): IObservableArray;
    resize(newLength: number): IObservableArray;
    $set(newValue: any): IObservable;
    item(index: number, item_value?: any): any;
    push(item_value: any): ObservableArray;
    pop(): any;
    unshift(item_value: any): ObservableArray;
    shift(): any;
    $update(): boolean;
    static structToken: string;
}
export declare function clone(src: any, deep?: boolean): any;
export declare class ObservableSchema<TData> {
    [index: string]: any;
    $type: DataTypes;
    $index: string | number;
    $path: string;
    $ctor: {
        new (initValue: TData | {
            (val?: TData): any;
        }, owner?: ObservableObject<any> | any, extras?: any): Observable<any>;
    };
    $item_ctor: {
        new (raw?: Function, initData?: any, extras?: any, owner?: Observable<any>): Observable<any>;
    };
    $owner?: ObservableSchema<TData>;
    $item_schema?: ObservableSchema<TData>;
    $initData?: any;
    constructor(initData: TData, index?: string | number, owner?: ObservableSchema<any>);
    $asObject(): ObservableSchema<TData>;
    $defineProp<TProp>(propname: string, initValue?: TProp): ObservableSchema<TProp>;
    $initObservable(ob: Observable<TData>): void;
    $create(initValue: TData | {
        (val?: TData): any;
    }, owner?: ObservableObject<any> | any, extras?: any): Observable<any>;
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
        [attr: string]: string | Function;
    };
    $actions?: {
        [attr: string]: string;
    };
    $wrapType?: Function;
    $rawType?: Function;
    $tag?: string;
    $render?: (component: IComponent, partial: string, container: any) => any;
    $readyState?: ComponentReadyStates;
}
export declare type TComponentType = {
    new (): any;
} & IComponentMeta;
export interface IComponent {
    [attr: string]: any;
}
export declare enum ReactiveTypes {
    Local = 0,
    In = 1,
    Out = 2,
    Ref = 3,
    Each = 4,
}
export declare const componentTypes: {
    [tag: string]: {
        new (): {};
    };
};
export declare function reactive(type?: ReactiveTypes | string): any;
export declare function action(async?: boolean): (target: any, propertyName: string) => void;
export declare function template(partial?: string): (target: any, propertyName: string) => void;
export declare function component(tag: string | TComponentType): any;
export declare class VirtualNode {
    tag?: string;
    attrs?: {
        [name: string]: any;
    };
    content?: any;
    children?: VirtualNode[];
    constructor();
    genCodes(variables: any[], codes?: string[], tabs?: string): string[];
    genChildrenCodes(variables: any[], codes?: string[], tabs?: string): string[];
    render(component: IComponent, container?: any): any;
    renderChildren(component: IComponent, container?: any): any;
}
export declare class VirtualTextNode extends VirtualNode {
    content: any;
    constructor(content: any);
    genCodes(variables: any[], codes?: string[], tabs?: string): string[];
}
export declare class VirtualElementNode extends VirtualNode {
    tag: string;
    attrs: {
        [name: string]: any;
    };
    children?: VirtualNode[];
    constructor(tag: string, attrs: {
        [name: string]: any;
    });
    genCodes(variables: any[], codes?: string[], tabs?: string): string[];
    genChildrenCodes(variables: any[], codes?: string[], tabs?: string): string[];
}
export declare class VirtualComponentNode extends VirtualNode {
    tag: string;
    attrs: {
        [name: string]: any;
    };
    content: any;
    children?: VirtualNode[];
    constructor(tag: string, attrs: {
        [name: string]: any;
    }, content: any);
    genCodes(variables: any[], codes?: string[], tabs?: string): string[];
}
export declare let ELEMENT: any;
declare let YA: {
    Subject: typeof Subject;
    ObservableModes: typeof ObservableModes;
    Observable: typeof Observable;
    ObservableObject: typeof ObservableObject;
    ObservableArray: typeof ObservableArray;
    Schema: typeof ObservableSchema;
    component: (tag: string | TComponentType) => any;
    reactive: (type?: string | ReactiveTypes) => any;
    action: (async?: boolean) => (target: any, propertyName: string) => void;
    ELEMENT: any;
};
export default YA;
