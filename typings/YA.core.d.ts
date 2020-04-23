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
    constructor();
    dispose(onRealse: any | {
        (arg: any, sender?: IDisposable): any;
    }): IDisposable;
    deteching(onDeteching?: (sender: IDisposable) => boolean): Disposable | boolean;
}
export declare function disposable(target: any): IDisposable;
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
    /**
     * 行为基本等同Observable,但如果该变量是Proxy,则会返回Proxy
     */
    Proxy = 4,
    Schema = 5
}
export interface IObservable<TData> extends ISubject<IChangeEventArgs<TData>> {
    $type: DataTypes;
    $extras?: any;
    $target?: TData;
    $isset?: boolean;
    $root?: IObservable<any>;
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
    changes?: IChangeEventArgs<any>[];
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
    $__obModifiedValue__: any;
}
export declare class Observable<TData> extends Subject<IChangeEventArgs<TData>> implements IObservable<TData> {
    $type: DataTypes;
    $target: TData;
    $extras?: any;
    $isset?: boolean;
    $schema?: ObservableSchema<TData>;
    $root: Observable<any>;
    $__obExtras__?: any;
    $__obIndex__?: number | string;
    $__obModifiedValue__: TData;
    $__obOwner__?: IObservableIndexable<TData>;
    $__obRaw__: (value?: TData) => any;
    constructor(init: IObservableIndexable<TData> | {
        (val?: TData): any;
    } | TData, index?: any, extras?: any, initValue?: any);
    get(accessMode?: ObservableModes): TData | IObservable<TData> | ObservableSchema<TData>;
    set(newValue: TData, updateImmediately?: boolean): IObservable<TData>;
    /**
     * 更新数据，引发事件，事件会刷新页面
     *
     * @returns {boolean} false=不做后继的操作。event.cancel=true会导致该函数返回false.
     * @memberof Observable
     */
    update(): boolean;
    toString(): string;
    static accessMode: ObservableModes;
    static isObservable(ob: any): boolean;
}
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
    set(newValue: TData | IObservable<TData>, updateImmediately?: boolean): IObservableObject<TData>;
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
    $__length__: Observable<number>;
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
    $obCtor: {
        new (init: TData | {
            (val?: TData): any;
        } | IObservableIndexable<any>, index?: any, extras?: any, initValue?: any): Observable<any>;
    };
    $proxyCtor: {
        new (schema: ObservableSchema<any>, parent: ObservableProxy): any;
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
    createObservable(val?: any): Observable<TData>;
    createProxy(): ObservableProxy;
    static schemaToken: string;
}
export interface IObservableProxy<TData> extends ISubject<IChangeEventArgs<TData>> {
    get(accessMode?: ObservableModes): TData | IObservable<TData> | ObservableSchema<TData>;
    set(newValue: TData, updateImmediately?: boolean): IObservable<TData>;
    update(): boolean;
}
export declare class ObservableProxy implements IObservable<any> {
    $parent: ObservableProxy;
    $schema: ObservableSchema<any>;
    $type: DataTypes;
    $extras?: any;
    $target?: any;
    $isset?: boolean;
    $root?: Observable<any>;
    $__topics__: any;
    $__rootOb__: IObservable<any>;
    $rootOb: IObservable<any>;
    constructor(param: ObservableSchema<any> | Observable<any> | any, parent?: ObservableProxy);
    get(accessMode?: ObservableModes): any;
    set(newValue: any, updateImmediately?: boolean): any;
    subscribe(): any;
    unsubscribe(): any;
    notify(): any;
    fulfill(): any;
    update(): any;
    pop(): any;
    push(): any;
    shift(): any;
    unshift(): any;
}
export declare function observable(initData: any, index?: string, subject?: any): Observable<any>;
export declare function enumerator(initData: any, index?: string, subject?: any): ObservableProxy;
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
    createElement(tag: string, attrs?: {
        [name: string]: string;
    }, parent?: IDomNode, content?: string): IDomNode;
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
    removeAllChildren(node: IDomNode): IDomUtility;
    getChildren(node: IDomNode): IDomNode[];
    getStyle(node: IDomNode, name: string): string;
    setStyle(node: IDomNode, name: string, value: string): IDomUtility;
    hasClass(node: IDomNode, cls: string): boolean;
    addClass(node: IDomNode, cls: string): IDomUtility;
    removeClass(node: IDomNode, cls: string): IDomUtility;
    replaceClass(node: IDomNode, oldCls: string, newCls: string, alwaysAdd?: boolean): IDomUtility;
    getValue(node: IDomNode): any;
    setValue(node: IDomNode, value: any): any;
    change(elem: IDomNode, handler: (value: any) => void): boolean;
    attach(elem: IDomNode, evtname: string, handler: Function): any;
    detech(elem: IDomNode, evtname: string, handler: Function): any;
    parse(domString: string): IDomNode[];
}
export declare let DomUtility: IDomUtility;
export declare enum ReactiveTypes {
    None = 0,
    Internal = -1,
    Iterator = -2,
    In = 1,
    Out = 2,
    Parameter = 3
}
export declare type TChildDescriptor = string | IDomNode | INodeDescriptor;
export interface INodeDescriptor {
    tag?: string | Function;
    content?: any;
    children?: TChildDescriptor[];
    [attr: string]: any;
}
export interface IViewModel {
    [name: string]: Observable<any> | ObservableSchema<any>;
}
/**
 * TRender render函数
 * functional jsx 跟object jsx的render函数参数顺序正好相反
 * functional 是descriptor,container
 * comp.render 的是container,descriptor
 *
 * @param {IViewModel}} [viewModel] 视图模型实例，数据来源
 * @param {IDomNode} [container] 父级对象，如果设置了值，会把产生的dom-node加入到该node的子节点中
 * @param {INodeDescriptor} vnode 描述了属性与那些observable关联；当然也可以直接与值关联.这个参数主要是组件用于获取它的children信息
 * @returns {(IDomNode|IDomNode[]|INodeDescriptor|INodeDescriptor[])} 可以返回dom-node或v-node(descriptor),如果返回的是v-node，框架会调用YA.createElement将其转换成dom-node
 */
export declare type TRender = (descriptor: INodeDescriptor, container?: IDomNode) => IDomNode | IDomNode[] | INodeDescriptor | INodeDescriptor[];
export declare enum JSXModes {
    vnode = 0,
    dnode = 1
}
export declare function jsxMode(mode: JSXModes, statement: () => any): any;
declare function createDescriptor(descriptor: INodeDescriptor, container: IDomNode, comp: IComponent): IDomNode | IDomNode[];
export declare let createElement: (tag: string | Function | INodeDescriptor | any[], attrs?: {
    [name: string]: any;
} | IViewModel | IDomNode, vmOrCtnrOrFirstChild?: IViewModel | IDomNode | any, ...otherChildren: any[]) => IDomNode | IDomNode[];
export declare function createElements(arr: any[], container: IDomNode, compInstance: IComponent): IDomNode[];
export declare function bindDomAttr(element: IDomNode, attrName: string, attrValue: any, vnode: INodeDescriptor, compInstance: IComponent): any;
export declare let EVENT: any;
export declare function createComponent(componentType: any, descriptor: INodeDescriptor, container?: IDomNode): IDomNode[] | IDomNode;
export interface IComputedExpression {
    lamda: Function;
    parameters: any[];
}
export declare let EXPR: (...args: any[]) => IComputedExpression;
export declare function NOT(param: any): IComputedExpression;
export interface IReactiveInfo {
    type: ReactiveTypes;
    schema: ObservableSchema<any>;
}
export interface IComponentInfo {
    reactives?: {
        [prop: string]: IReactiveInfo;
    };
    ctor?: TComponentType;
    wrapper?: TComponentType;
    tag?: string;
    render?: Function;
    inited?: boolean;
    explicit?: boolean;
}
export interface IComponent extends IDisposable {
    $_meta: IComponentInfo;
    render(container?: IDomNode, descriptor?: INodeDescriptor): IDomNode | IDomNode[] | INodeDescriptor | INodeDescriptor[];
    $__elements__: IDomNode | IDomNode[];
    $__placeholder__: IDomNode;
}
export declare type TComponentCtor = {
    new (...args: any[]): IComponent;
};
export declare type TComponentType = TComponentCtor & {
    $meta: IComponentInfo;
    prototype: {
        $meta: IComponentInfo;
    };
};
export interface IDisposeInfo {
    activeTime?: Date;
    inactiveTime?: Date;
    checkTime?: Date;
}
export declare let componentTypes: {
    [tag: string]: TComponentType;
};
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
    [name: string]: (elem: IDomNode, bindValue: any, vnode: INodeDescriptor, compInstance: IComponent) => any;
};
export declare let styleConvertors: any;
export declare function THIS(obj: any, name: string | Function): () => any;
export declare function queryString(str: string): {};
export declare function toJson(obj: any): string;
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
    observable: typeof observable;
    enumerator: typeof enumerator;
    createElement: (tag: string | Function | any[] | INodeDescriptor, attrs?: IDomNode | IViewModel | {
        [name: string]: any;
    }, vmOrCtnrOrFirstChild?: any, ...otherChildren: any[]) => IDomNode | IDomNode[];
    createDescriptor: typeof createDescriptor;
    createElements: typeof createElements;
    createComponent: typeof createComponent;
    EVENT: any;
    attrBinders: {
        [name: string]: (elem: IDomNode, bindValue: any, vnode: INodeDescriptor, compInstance: IComponent) => any;
    };
    componentInfos: {
        [tag: string]: TComponentType;
    };
    NOT: typeof NOT;
    EXPR: (...args: any[]) => IComputedExpression;
    DomUtility: IDomUtility;
    styleConvertors: any;
    intimate: typeof implicit;
    clone: typeof clone;
    Promise: typeof Promise;
    trim: typeof trim;
    is_array: typeof is_array;
    is_assoc: typeof is_assoc;
    is_empty: typeof is_empty;
    toJson: typeof toJson;
    queryString: typeof queryString;
};
export default YA;
