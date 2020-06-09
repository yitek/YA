export declare function is_string(obj: any): boolean;
export declare function is_bool(obj: any): boolean;
export declare function is_number(obj: any): boolean;
export declare function is_assoc(obj: any): boolean;
export declare function is_object(obj: any): boolean;
export declare function is_array(obj: any): boolean;
export declare function is_empty(obj: any): boolean;
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
    private $__ob_target__;
    private $__ob_name__;
    $ob_target: any;
    $ob_name: any;
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
