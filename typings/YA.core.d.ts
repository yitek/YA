export declare function implicit(strong?: boolean | any, members?: any, value?: any): (target: any, propName?: string) => void;
export declare function is_string(obj: any): boolean;
export declare function is_bool(obj: any): boolean;
export declare function is_number(obj: any): boolean;
export declare function is_assoc(obj: any): boolean;
export declare function is_object(obj: any): boolean;
export declare function is_array(obj: any): boolean;
export declare function is_empty(obj: any): boolean;
/**
 *  去掉两边空格
 *
 * @export
 * @param {*} text
 * @returns {string}
 */
export declare function trim(text: any): string;
/**
 * 是否是百分数
 *
 * @export
 * @param {*} text
 * @returns {number}
 */
export declare function is_percent(text: any): number;
export declare function array_index(obj: any, item: any, start?: number): number;
export declare function array_add_unique(arr: any[], item: any): boolean;
export declare let extend: (...args: any[]) => any;
export declare class DPath {
    paths: string[];
    constructor(pathtext: string);
    getValue(data: any): any;
    setValue(data: any, value: any): void;
    static caches: {
        [patht: string]: DPath;
    };
    static fetch(tpath: string): DPath;
    static getValue(data: any, tpath: string): any;
    static setValue(data: any, tpath: string, value: any): void;
    static replace(template: string, data?: any): string;
}
export declare function clone(src: any, deep?: boolean): any;
export declare type TAsyncStatement = (resolve: (result: any) => any, reject: (err: any) => any) => any;
export interface IThenable {
    then(fulfillCallback: (result: any) => any, rejectCallback?: (result: any) => any): IThenable;
}
export declare enum PromiseStates {
    Pending = 0,
    Fulfilled = 1,
    Rejected = -1
}
export declare class Promise implements IThenable {
    $_promise_status: PromiseStates;
    $_promise_fulfillCallbacks: {
        (result: any, isSuccess?: boolean): any;
    }[];
    $_promise_rejectCallbacks: {
        (result: any, isSuccess?: boolean): any;
    }[];
    $_promise_result: any;
    constructor(statement?: TAsyncStatement, sync?: boolean);
    then(fulfillCallback: (result: any) => any, rejectCallback?: (result: any) => any): Promise;
    resolve(result: any): Promise;
    reject(result: any): Promise;
    success(callback: (result: any) => any): Promise;
    error(callback: (result: any) => any): Promise;
    complete(callback: (result: any) => any): Promise;
    catch(callback: (result: any) => any): Promise;
    static resolve(value: any): Promise;
    static reject(value: any): Promise;
    static all(thenables: IThenable[], sync?: boolean): IThenable;
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
    $__topics__: {
        [topic: string]: any;
    };
    /**
     * 注册监听函数
     * notify的时候，注册了相关主题的监听函数会被调用
     * 如果该主题已经fulfill，该监听会立即执行
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topic 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    subscribe(topic: string | {
        (evt: TEvtArgs): any;
    }, listener?: {
        (evt: TEvtArgs): any;
    } | IDisposable, disposible?: IDisposable): ISubject<TEvtArgs>;
    /**
     * 取消主题订阅
     * notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topic 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    unsubscribe(topic: string | {
        (evt: TEvtArgs): any;
    }, listener?: {
        (evt: TEvtArgs): any;
    }): ISubject<TEvtArgs>;
    /**
     * 发送通知
     * 如果相关主题上有监听器，会逐个调用监听器
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|TEvtArgs)} topic 通知的主题或事件参数
     * @param {TEvtArgs} [evt] 事件参数，只有topicOrEvtArgs是topic才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    notify(topic: string | TEvtArgs, evt?: TEvtArgs): ISubject<TEvtArgs>;
    /**
     * 产生一个终值，以后subscribe会立即执行
     *
     * @param {(string|TEvtArgs)} topic
     * @param {TEvtArgs} [evt]
     * @returns {ISubject<TEvtArgs>}
     * @memberof ISubject
     */
    fulfill(topic: string | TEvtArgs, evt?: TEvtArgs): ISubject<TEvtArgs>;
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
    $__topics__: {
        [topic: string]: any;
    };
    constructor();
    /**
     * 注册监听函数
     * notify的时候，注册了相关主题的监听函数会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    subscribe(topic: string | {
        (evt: TEvtArgs): any;
    }, listener?: {
        (evt: TEvtArgs): any;
    } | IDisposable, disposible?: IDisposable): ISubject<TEvtArgs>;
    /**
     * 取消主题订阅
     * notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    unsubscribe(topic: string | {
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
    notify(topic: string | TEvtArgs, evtArgs?: TEvtArgs): ISubject<TEvtArgs>;
    fulfill(topic: string | TEvtArgs, evtArgs?: TEvtArgs): ISubject<TEvtArgs>;
}
export declare function eventable(subject: any, topic: string): any;
export declare function new_cid(): number;
export interface IDisposable {
    dispose(onRelease?: any | {
        (arg: any, sender: IDisposable): any;
    }): any;
    deteching(onDeteching?: {
        (sender: IDisposable): boolean;
    }): IDisposable | boolean;
    $isDisposed: boolean;
}
export declare class Disposable implements IDisposable {
    $isDisposed: boolean;
    private $__disposings__;
    private $__detechings__;
    constructor(target?: any);
    dispose(onRealse: any | {
        (arg: any, sender?: IDisposable): any;
    }): IDisposable;
    deteching(onDeteching?: (sender: IDisposable) => boolean): Disposable | boolean;
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
    get(accessMode?: ObservableModes): TData | IObservable<TData> | ObservableSchema<TData>;
    set(newValue: TData, updateImmediately?: boolean): IObservable<TData>;
    update(): boolean;
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
    get(accessMode?: ObservableModes): TData | IObservable<TData> | ObservableSchema<TData>;
    set(newValue: TData, updateImmediately?: boolean): IObservable<TData>;
    update(): boolean;
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
    get(accessMode?: ObservableModes): any;
    set(newValue: TData, updateImmediately?: boolean): IObservableObject<TData>;
    update(): boolean;
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
    get(accessMode?: ObservableModes): any;
    set(newValue: any, updateImmediately?: boolean): ObservableArray<TItem>;
    update(): boolean;
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
    getFromRoot(root: any, mode?: ObservableModes): any;
    asObject(): ObservableSchema<TData>;
    defineProp<TProp>(propname: string, initValue?: TProp): ObservableSchema<TProp>;
    asArray(): ObservableSchema<TData>;
    initObject(ob: Observable<TData>): void;
    static schemaToken: string;
}
export declare enum ReactiveTypes {
    None = 0,
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
export interface IComponent extends IDisposable {
    $meta: IComponentInfo;
    render(container?: IDomNode): IDomNode | IDomNode[];
    $__elements__: IDomNode | IDomNode[];
    $__placeholder__: IDomNode;
}
export declare type TComponentCtor = {
    new (...args: any[]): IComponent;
};
export declare type TComponentType = TComponentCtor & {
    prototype: {
        $meta: IComponentInfo;
    };
};
export interface IDisposeInfo {
    activeTime?: Date;
    inactiveTime?: Date;
    checkTime?: Date;
}
export interface IInternalComponent extends IComponent {
    $_disposeInfo: IDisposeInfo;
    $childNodes: VirtualNode[];
    $reactives: {
        [name: string]: Observable<any>;
    };
}
export declare function component(tag: string | {
    new (...args: any[]): IComponent;
} | boolean | Function, ComponentType?: {
    new (...args: any[]): IComponent;
} | boolean | Function): any;
export declare class ComponentGarbage {
    static singleon: ComponentGarbage;
    private _toBeChecks;
    private _tick;
    constructor();
    /**
     * 所有render过的组件都应该调用该函数
     *
     * @type {IComponent[]}
     * @memberof ComponentGarbageDisposer
     */
    attech(compoent: IComponent): ComponentGarbage;
    /**
     * 如果写了参数compoent,就是要手动把某个组件从垃圾回收中，要从垃圾释放器中移除掉
     * 如果不写参数，表示执行释放任务
     * @param {IComponent} component
     * @returns {ComponentAutoDisposer}
     * @memberof ComponentGarbageDisposer
     */
    detech(component?: IComponent): ComponentGarbage;
    /**
     * 手动释放垃圾
     *
     * @returns {ComponentAutoDisposer}
     * @memberof ComponentAutoDisposer
     */
    clear(): ComponentGarbage;
    static interval: number;
    static periodicClearCount: number;
}
export interface IVirtualNode {
    tag?: string;
    id?: string;
    className?: string;
    name?: string;
    value?: string;
    type?: string;
    title?: string;
    placeholder?: string;
    attrs?: {
        [name: string]: any;
    };
    content?: any;
    children?: IVirtualNode[];
}
export declare class VirtualNode implements IVirtualNode {
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
    constructor(tag: string | TComponentType | IComponentInfo, attrs: {
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
export interface IDomNode {
    nodeType: number;
    nodeValue: any;
    tagName: string;
    className: string;
}
export interface IDomDocument {
    createElement(tag: string): IDomNode;
    createTextNode(text: string): IDomNode;
}
export interface IDomUtility {
    isElement(obj: any, includeText?: boolean): boolean;
    is_inDocument(obj: any): boolean;
    createElement(tag: IVirtualNode | string, attrs?: {
        [name: string]: string;
    } | IDomNode, ...children: any[]): IDomNode;
    createText(text: string, parent?: IDomNode): IDomNode;
    createPlaceholder(): IDomNode;
    setContent(node: IDomNode, content: string): IDomUtility;
    getContent(node: IDomNode): string;
    setAttribute(node: IDomNode, name: string, value: string): IDomUtility;
    getAttribute(node: IDomNode, name: string): string;
    removeAttribute(node: IDomNode, name: string): IDomUtility;
    setProperty(node: IDomNode, name: string, value: any): IDomUtility;
    getProperty(node: IDomNode, name: string): any;
    appendChild(parent: IDomNode, child: IDomNode): IDomUtility;
    insertBefore(insert: IDomNode, rel: IDomNode): IDomUtility;
    insertAfter(insert: IDomNode, rel: IDomNode): IDomUtility;
    remove(node: IDomNode): IDomUtility;
    getParent(node: IDomNode): IDomNode;
    hide(node: any, immeditately?: boolean): IDomUtility;
    show(node: any, immeditately?: boolean): IDomUtility;
    removeAllChildrens(node: IDomNode): IDomUtility;
    getChildren(node: IDomNode): IDomNode[];
    getStyle(node: IDomNode, name: string): string;
    setStyle(node: IDomNode, name: string, value: string): IDomUtility;
    hasClass(node: IDomNode, cls: string): boolean;
    addClass(node: IDomNode, cls: string): IDomUtility;
    removeClass(node: IDomNode, cls: string): IDomUtility;
    replaceClass(node: IDomNode, oldCls: string, newCls: string, alwaysAdd?: boolean): IDomUtility;
    attach(elem: IDomNode, evtname: string, handler: Function): any;
    detech(elem: IDomNode, evtname: string, handler: Function): any;
    parse(domString: string): IDomNode[];
    document: IDomDocument;
    global: any;
    window: any;
    wrapper: IDomNode;
}
export declare let DomUtility: IDomUtility;
export declare function THIS(obj: any, name: string | Function): () => any;
export declare function queryString(str: string): {};
declare let YA: {
    Subject: typeof Subject;
    Disposable: typeof Disposable;
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
    Host: IDomUtility;
    styleConvertors: any;
    intimate: typeof implicit;
    clone: typeof clone;
    Promise: typeof Promise;
};
export default YA;
