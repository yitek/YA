export declare function intimate(strong?: boolean | any, members?: any): (target: any, propName?: string) => void;
export declare function is_array(obj: any): boolean;
export declare function array_index(obj: any, item: any, start?: number): number;
export declare function trim(text: any): string;
export declare function percent(text: any): number;
export interface IDisposiable {
    dispose(onRelease?: (args: IDisposeArgs) => any): any;
}
export interface IDisposeArgs {
    [name: string]: any;
    sender: any;
}
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
    }, disposible?: IDisposiable): ISubject<TEvtArgs>;
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
    }, disposible?: IDisposiable): ISubject<TEvtArgs>;
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
    Array = 2
}
export declare enum ObservableModes {
    Default = 0,
    Raw = 1,
    Value = 2,
    Observable = 3,
    Schema = 4
}
export interface IObservable<TData> extends ISubject<IChangeEventArgs<TData>> {
    $type: DataTypes;
    $extras?: any;
    $target?: TData;
    $get(accessMode?: ObservableModes): TData | IObservable<TData> | ObservableSchema<TData>;
    $set(newValue: TData, updateImmediately?: boolean): IObservable<TData>;
    $update(): boolean;
}
export declare function observableMode(mode: ObservableModes, statement: () => any): any;
export declare function proxyMode(statement: () => any): any;
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
    Item = 1,
    Append = 2,
    Push = 3,
    Pop = 4,
    Shift = 5,
    Unshift = 6,
    Remove = 7
}
export interface IObservableIndexable<TData extends {
    [index in keyof object]: any;
}> extends IObservable<TData> {
    $target: any;
    $_modifiedValue: any;
}
export declare class Observable<TData> extends Subject<IChangeEventArgs<TData>> implements IObservable<TData> {
    $type: DataTypes;
    $target: TData;
    $extras?: any;
    $schema?: ObservableSchema<TData>;
    $_index?: number | string;
    $_modifiedValue: TData;
    $_owner?: IObservableIndexable<TData>;
    $_raw: (value?: TData) => any;
    constructor(init: IObservableIndexable<TData> | {
        (val?: TData): any;
    } | TData, index?: any, extras?: any, initValue?: any);
    $get(accessMode?: ObservableModes): TData | IObservable<TData> | ObservableSchema<TData>;
    $set(newValue: TData, updateImmediately?: boolean): IObservable<TData>;
    $update(): boolean;
    toString(): string;
    static accessMode: ObservableModes;
}
/**
 * 获取Observable的extras的一个辅助方法
 *
 * @export
 * @param {Observable<any>} ob
 * @param {string} [name]
 * @param {*} [dft]
 */
export declare function extras(ob: Observable<any>, name?: string, dft?: any): any;
export interface IObservableObject<TData extends {
    [index: string]: any;
}> extends IObservable<TData> {
    [index: string]: any;
    $prop(name: string): Observable<any>;
}
export declare class ObservableObject<TData> extends Observable<TData> implements IObservableObject<TData>, IObservableIndexable<TData> {
    [index: string]: any;
    constructor(init: IObservableIndexable<any> | {
        (val?: TData): any;
    } | TData, index?: any, extras?: any, initValue?: any);
    $prop(name: string): any;
    $get(accessMode?: ObservableModes): any;
    $set(newValue: TData, updateImmediately?: boolean): IObservableObject<TData>;
    $update(): boolean;
}
export interface IObservableArray<TItem> extends IObservable<TItem[]> {
    [index: number]: any;
    length: number;
}
export declare class ObservableArray<TItem> extends Observable<TItem[]> implements IObservableArray<TItem>, IObservableIndexable<TItem[]> {
    [index: number]: any;
    length: number;
    $_changes: IChangeEventArgs<TItem[]>[];
    $_length: number;
    $_itemSchema: ObservableSchema<TItem>;
    constructor(init: IObservableIndexable<TItem[]> | {
        (val?: TItem[]): any;
    } | TItem[], index?: any, itemSchemaOrExtras?: any, extras?: any);
    toString(): string;
    clear(): ObservableArray<TItem>;
    $get(accessMode?: ObservableModes): any;
    $set(newValue: any, updateImmediately?: boolean): ObservableArray<TItem>;
    $update(): boolean;
}
export declare class ObservableSchema<TData> {
    [index: string]: any;
    $type: DataTypes;
    $index: string | number;
    $paths: string[];
    $ctor: {
        new (init: TData | {
            (val?: TData): any;
        } | IObservableIndexable<any>, index?: any, extras?: any, initValue?: any): Observable<any>;
    };
    $owner?: ObservableSchema<TData>;
    $itemSchema?: ObservableSchema<TData>;
    $initData?: any;
    constructor(initData: TData, index?: string | number, owner?: ObservableSchema<any>);
    $getFromRoot(root: any, mode?: ObservableModes): any;
    $asObject(): ObservableSchema<TData>;
    $defineProp<TProp>(propname: string, initValue?: TProp): ObservableSchema<TProp>;
    $asArray(): ObservableSchema<TData>;
    $initObject(ob: Observable<TData>): void;
    static schemaToken: string;
}
export declare enum ReactiveTypes {
    NotReactive = 0,
    Internal = -1,
    Iterator = -2,
    In = 1,
    Out = 2,
    Parameter = 3
}
export interface IReactiveInfo {
    name?: string;
    type?: ReactiveTypes;
    schema?: ObservableSchema<any>;
    initData?: any;
}
/**
 * 两种用法:
 * 1 作为class member的装饰器 @reactive()
 * 2 对某个component类手动构建reactive信息，reactive(MyComponent,{name:'model',type:0,schema:null})
 * @param {(ReactiveTypes|Function)} [type]
 * @param {{[prop:string]:IReactiveInfo}} [defs]
 * @returns
 */
export declare function reactive(type?: ReactiveTypes | Function, defs?: {
    [prop: string]: IReactiveInfo;
}): any;
export declare function IN(target: any, name: string): any;
export declare function OUT(target: any, name: string): any;
export declare function PARAM(target: any, name: string): any;
export interface ITemplateInfo {
    name?: string;
    vnode?: any;
    partial?: string;
    render?: Function;
}
export declare function template(partial?: string | Function, defs?: {
    [prop: string]: ITemplateInfo;
}): (target: IComponentInfo, info: string | ITemplateInfo) => void;
export interface IActionInfo {
    name?: string;
    async?: boolean;
    method?: Function;
}
export interface IComponentInfo {
    reactives?: {
        [prop: string]: IReactiveInfo;
    };
    templates?: {
        [partial: string]: ITemplateInfo;
    };
    actions?: {
        [methodname: string]: IActionInfo;
    };
    ctor?: TComponentType;
    wrapper?: TComponentType;
    tag?: string;
    render?: Function;
    inited?: boolean;
    explicitMode?: boolean;
}
export interface IComponent extends IDisposiable {
    $meta: IComponentInfo;
    [propname: string]: any;
}
export declare type TComponentCtor = {
    new (...args: any[]): IComponent;
};
export declare type TComponentType = TComponentCtor & {
    $meta: IComponentInfo;
};
export interface IInternalComponent extends IComponent {
    $childNodes: VirtualNode[];
    $reactives: {
        [name: string]: Observable<any>;
    };
}
export declare function component(tag: string, ComponentType?: {
    new (...args: any[]): IComponent;
} | boolean): any;
export declare class VirtualNode {
    tag?: string;
    attrs?: {
        [name: string]: any;
    };
    content?: any;
    children?: VirtualNode[];
    constructor();
    render(component: IComponent, container?: any): any;
    static create(tag: string | TComponentType, attrs: {
        [attrName: string]: any;
    }): VirtualNode;
}
export declare let virtualNode: typeof VirtualNode.create;
export declare class VirtualTextNode extends VirtualNode {
    content: any;
    constructor(content: any);
    render(component: IComponent, container?: any): any;
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
    render(component: IComponent, container?: any): any;
}
export declare class VirtualComponentNode extends VirtualNode {
    attrs: {
        [name: string]: any;
    };
    children?: VirtualNode[];
    meta: IComponentInfo;
    constructor(tag: string | TComponentType, attrs: {
        [name: string]: any;
    });
    render(component: IComponent, container?: any): any;
}
export declare function NOT(params: any): void;
export declare function EXP(...args: any[]): void;
export declare enum RenderDirectives {
    Default = 0,
    IgnoreChildren = 1,
    Replaced = 2
}
export declare class Placeholder {
    replace: any;
    before?: any;
    after?: any;
    constructor(replace: any, before?: any, after?: any);
}
export declare let attrBinders: {
    [name: string]: (elem: any, bindValue: any, component: IComponent, vnode: VirtualNode) => any;
};
export declare let styleConvertors: any;
export interface IHost {
    isElement(elem: any, includeText?: boolean): boolean;
    createElement(tag: string): any;
    createText(text: string): any;
    createPlaceholder(): any;
    setAttribute(elem: any, name: string, value: any): any;
    getAttribute(elem: any, name: string): any;
    appendChild(parent: any, child: any): any;
    insertBefore(inserted: any, before: any): any;
    insertAfter(inserted: any, after: any): any;
    removeChild(container: any, child: any): any;
    getParent(elem: any): any;
    hide(elem: any, immeditately?: boolean): any;
    show(elem: any, immeditately?: boolean): any;
    removeAllChildrens(parent: any): any;
    attach(elem: any, evtname: string, handler: Function): any;
    document: any;
    window: any;
}
export declare let Host: IHost;
export declare function clone(src: any, deep?: boolean): any;
export declare function THIS(obj: any, name: string | Function): () => any;
declare let YA: {
    Subject: typeof Subject;
    ObservableModes: typeof ObservableModes;
    observableMode: typeof observableMode;
    proxyMode: typeof proxyMode;
    Observable: typeof Observable;
    ObservableObject: typeof ObservableObject;
    ObservableArray: typeof ObservableArray;
    ObservableSchema: typeof ObservableSchema;
    component: typeof component;
    state: typeof reactive;
    IN: typeof IN;
    OUT: typeof OUT;
    PARAM: typeof PARAM;
    template: typeof template;
    attrBinders: {
        [name: string]: (elem: any, bindValue: any, component: IComponent, vnode: VirtualNode) => any;
    };
    VirtualNode: typeof VirtualNode;
    VirtualTextNode: typeof VirtualTextNode;
    VirtualElementNode: typeof VirtualElementNode;
    VirtualComponentNode: typeof VirtualComponentNode;
    virtualNode: typeof VirtualNode.create;
    NOT: typeof NOT;
    EXP: typeof EXP;
    Host: IHost;
    styleConvertors: any;
    intimate: typeof intimate;
    clone: typeof clone;
};
export default YA;
