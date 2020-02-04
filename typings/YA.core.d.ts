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
export declare enum ObservableModes {
    Default = 0,
    Raw = 1,
    Observable = 2,
    Schema = 3,
}
export interface IObservable<TData> extends ISubject<IChangeEventArgs<TData>> {
    $type: DataTypes;
    $extras?: any;
    $target?: TData;
    $get(accessMode?: ObservableModes): TData | IObservable<TData> | ObservableSchema<TData>;
    $set(newValue: TData): IObservable<TData>;
    $update(): boolean;
}
export declare function observableMode(mode: ObservableModes, statement: () => any): void;
export declare function proxyMode(statement: () => any): void;
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
    } | TData, index?: any, extras?: any);
    $get(accessMode?: ObservableModes): TData | IObservable<TData> | ObservableSchema<TData>;
    $set(newValue: TData): IObservable<TData>;
    $update(): boolean;
    toString(): string;
    static accessMode: ObservableModes;
}
export interface IObservableObject<TData extends {
    [index: string]: any;
}> extends IObservable<TData> {
    [index: string]: any;
}
export declare class ObservableObject<TData> extends Observable<TData> implements IObservableObject<TData>, IObservableIndexable<TData> {
    [index: string]: any;
    constructor(init: IObservableIndexable<any> | {
        (val?: TData): any;
    } | TData, index?: any, extras?: any);
    $get(accessMode?: ObservableModes): any;
    $set(newValue: TData): IObservableObject<TData>;
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
    $update(): boolean;
}
export declare class ObservableSchema<TData> {
    [index: string]: any;
    $type: DataTypes;
    $index: string | number;
    $paths: string[];
    $ctor: {
        new (initValue: TData | {
            (val?: TData): any;
        }, owner?: ObservableObject<any> | any, extras?: any): Observable<any>;
    };
    $owner?: ObservableSchema<TData>;
    $itemSchema?: ObservableSchema<TData>;
    $initData?: any;
    constructor(initData: TData, index?: string | number, owner?: ObservableSchema<any>);
    $getFromRoot(root: any): any;
    $asObject(): ObservableSchema<TData>;
    $asArray(): ObservableSchema<TData>;
    $defineProp<TProp>(propname: string, initValue?: TProp): ObservableSchema<TProp>;
    $initObject(ob: Observable<TData>): void;
    $create(init: (val?: TData) => any, extras?: any): Observable<any>;
    static schemaToken: string;
}
export declare enum ReactiveTypes {
    Internal = 0,
    Iterator = 1,
    In = 2,
    Out = 3,
    Ref = 4,
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
    ctor?: {
        new (...args: any[]): IComponent;
    };
    wrapper?: Function;
    tag?: string;
    render?: Function;
    inited?: boolean;
}
export interface IComponent {
    [membername: string]: any;
}
export interface IInternalComponent extends IComponent {
    $meta: IComponentInfo;
    $childNodes: VirtualNode[];
    $reactives: {
        [name: string]: Observable<any>;
    };
}
export declare function component(tag: string, ComponentType?: {
    new (...args: any[]): IComponent;
}): any;
export declare class VirtualNode {
    tag?: string;
    attrs?: {
        [name: string]: any;
    };
    content?: any;
    children?: VirtualNode[];
    constructor();
    render(component: IComponent, container?: any): any;
    static create(tag: string, attrs: {
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
export declare function NOT(params: any): void;
export declare function EXP(...args: any[]): void;
export interface IHost {
    isElement(elem: any): boolean;
    createElement(tag: string): any;
    createText(text: string): any;
    setAttribute(elem: any, name: string, value: any): any;
    getAttribute(elem: any, name: string): any;
    appendChild(parent: any, child: any): any;
    removeAllChildrens(parent: any): any;
    attach(elem: any, evtname: string, handler: Function): any;
}
export declare function clone(src: any, deep?: boolean): any;
declare let YA: {
    Subject: typeof Subject;
    ObservableModes: typeof ObservableModes;
    observableMode: (mode: ObservableModes, statement: () => any) => void;
    proxyMode: (statement: () => any) => void;
    Observable: typeof Observable;
    ObservableObject: typeof ObservableObject;
    ObservableArray: typeof ObservableArray;
    ObservableSchema: typeof ObservableSchema;
    component: (tag: string, ComponentType?: new (...args: any[]) => IComponent) => any;
    state: (type?: Function | ReactiveTypes, defs?: {
        [prop: string]: IReactiveInfo;
    }) => any;
    template: (partial?: string | Function, defs?: {
        [prop: string]: ITemplateInfo;
    }) => (target: IComponentInfo, info: string | ITemplateInfo) => void;
    VirtualNode: typeof VirtualNode;
    VirtualTextNode: typeof VirtualTextNode;
    VirtualElementNode: typeof VirtualElementNode;
    VirtualComponentNode: typeof VirtualComponentNode;
    virtualNode: (tag: string, attrs: {
        [attrName: string]: any;
    }) => VirtualNode;
    HOST: IHost;
    NOT: (params: any) => void;
    EXP: (...args: any[]) => void;
    intimate: (strong?: any, members?: any) => (target: any, propName?: string) => void;
    clone: (src: any, deep?: boolean) => any;
};
export default YA;
