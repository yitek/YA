export declare function is_string(obj: any): boolean;
export declare function is_bool(obj: any): boolean;
export declare function is_number(obj: any): boolean;
export declare function is_assoc(obj: any): boolean;
export declare function is_object(obj: any): boolean;
export declare function is_array(obj: any): boolean;
export declare function is_empty(obj: any): boolean;
export declare class Exception extends Error {
    constructor(opts: any);
}
export declare enum FulfillStates {
    padding = 0,
    fulfilled = 1,
    rejected = 2
}
export declare class Fulfill {
    private $__YA_fulfill_status__;
    private $__YA_fulfill_value__;
}
export interface IDisposable {
    dispose(listenerOrEvent?: any): IDisposable;
}
export interface ISubject {
}
export declare class Subect {
    private $__YA_topics__;
    subscribe(topic: string | {
        (evt: any): any;
    }, listener: {
        (evt: any): any;
    } | IDisposable | string, disposeOwn?: string | IDisposable): this;
    unsubscribe(topic: string | {
        (evt: any): any;
    }, listener: {
        (evt: any): any;
    } | IDisposable): Subect;
}
declare enum ObservableModes {
    Default = 0,
    Value = 1,
    Raw = 2,
    Observable = 3,
    Proxy = 4,
    Agent = 5,
    /**
     * 设置值之后立即触发更新
     */
    Imediately = 6
}
declare enum ObservableTypes {
    Value = 0,
    Object = 1,
    Array = 2
}
export declare class Observable {
    /**
     * 当前的值，外部用$ob_value
     * 在事件对象中的old就是取该值
     * 可能与$__ob_target__[$__ob_name__]的值不一致
     * 因为$__ob_target__会因为父级对象的赋值而变更
     * @private
     * @memberof Observable
     */
    private $__ob_value__;
    /**
     * 修改的值，即set赋予的值
     * update后该字段会被清空，并将其值移到$__ob_value__
     *
     * @private
     * @memberof Observable
     */
    private $__ob_modified__;
    /**
     * 该值存放在哪个对象上
     *
     * @private
     * @memberof Observable
     */
    private $__ob_target__;
    /**
     * 该值存放在对象上的属性名
     *
     * @private
     * @memberof Observable
     */
    private $__ob_name__;
    /**
     * 一个observable代表一个值
     * 该值存放在哪个对象上
     * @memberof Observable
     */
    $ob_target: any;
    /**
     *  该值存放在对象的属性名
     *
     * @memberof Observable
     */
    $ob_name: any;
    /**
     * 当前确定的值
     * 一般是target[name],但当修改target/name时，他们之间会不一致
     *
     * @memberof Observable
     */
    $ob_value: any;
    $ob_proxy: any;
    $ob_own: any;
    $ob_type: ObservableTypes;
    constructor(value: any, name: any, target: any);
    get(mode?: ObservableModes): any;
    set(value: any, mode?: ObservableModes): Observable;
    update(src?: any): Observable;
    asObject(): any;
    defineProperty(name: string, value?: any): void;
    /**
     * ObservableObject.set(value)的时候，会更新所有的成员
     *
     * @param {*} target
     * @memberof Observable
     */
    _resetTarget(target: any, name: string, mode?: ObservableModes): Observable;
    _resetName(name: string, mode?: ObservableModes): this;
    static gettingMode: ObservableModes;
    static settingMode: ObservableModes;
}
export {};
