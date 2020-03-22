import * as YA from 'YA.core';
/**
 * 枚举类型的枚举项
 *
 * @export
 * @interface IFieldEnumItem
 */
export interface IEnumItem {
    label?: string;
    name?: string;
    value?: string;
}
export interface IBasField {
    /**
     * 字段名称
     *
     * @type {string}
     * @memberof IBasField
     */
    name?: string;
    /**
     * 对该字段的说明
     *
     * @type {string}
     * @memberof IBasField
     */
    description?: string;
    /**
     * 原始定义
     *
     * @type {*}
     * @memberof IBasField
     */
    defination?: any;
}
export declare class BasField implements IBasField {
    /**
     * 字段名称
     *
     * @type {string}
     * @memberof IBasField
     */
    name: string;
    /**
     * 带类全名的字段全名
     *
     * @type {string}
     * @memberof BasField
     */
    fullname: string;
    /**
     * 对该字段的说明
     *
     * @type {string}
     * @memberof IBasField
     */
    description?: string;
    /**
     * 原始定义
     * @type {*}
     * @memberof BasField
     */
    defination: any;
    /**
     * 该字段属于哪个个模型
     *
     * @type {IModel}
     * @memberof BasField
     */
    model: IModel;
    constructor(model: IModel, opts: IBasField);
}
export declare enum FieldValueKinds {
    embeded = 0,
    customized = 1,
    enumeration = 2
}
export interface ITypedField extends IBasField {
    /**
     * 字段类型的全名
     *
     * @type {string}
     * @memberof ITypedField
     */
    type?: string;
    /**
     * 是否是集合
     *
     * @type {boolean}
     * @memberof ITypedField
     */
    collection?: boolean;
    valueKind?: FieldValueKinds;
    /**
     * 引用类型
     *
     * @type {IModel}
     * @memberof ITypedField
     */
    fieldType?: IModel;
    /**
     * 冗余某些字段
     *
     * @type {boolean}
     * @memberof ITypedField
     */
    expandable?: string[];
    enums?: {
        [name: string]: any;
    } | IEnumItem[] | string;
}
export declare class TypedField extends BasField implements ITypedField {
    /**
     * 字段类型的全名
     *
     * @type {string}
     * @memberof ITypedField
     */
    type: string;
    collection?: boolean;
    itemType: string;
    valueKind: FieldValueKinds;
    /**
     * 引用类型
     *
     * @type {IModel}
     * @memberof ITypedField
     */
    fieldType?: IModel;
    expandable?: string[];
    enums: {
        [name: string]: IEnumItem;
    };
    constructor(model: Model, opts: ITypedField);
    static StringTypes: string[];
    static NumberTypes: string[];
    static EmbededTypes: string[];
}
export interface IValidatableField extends ITypedField {
    required?: boolean | string;
    /**
     * 字段长度
     *
     * @type {(number|number[])}
     * @memberof IValidatableField
     */
    length?: number | number[] | string | {
        min?: number;
        max?: number;
    };
    /**
     * 数据精度
     *
     * @type {number}
     * @memberof IDataField
     */
    precision?: number;
    /**
     * 验证规则
     *
     * @type {{[ruleName:string]:any}}
     * @memberof IValidatableField
     */
    rules?: {
        [ruleName: string]: any;
    };
}
export declare class ValidatableField extends TypedField implements IValidatableField {
    required: boolean;
    /**
     * 字段长度
     *
     * @type {(number|number[])}
     * @memberof IValidatableField
     */
    length?: number;
    /**
     * 验证规则
     *
     * @type {{[ruleName:string]:any}}
     * @memberof IValidatableField
     */
    rules?: {
        [ruleName: string]: any;
    };
    /**
     * 数据精度
     *
     * @type {number}
     * @memberof IDataField
     */
    precision?: number;
    constructor(model: Model, opts: IValidatableField);
}
export declare enum DbIndexTypes {
    none = 0,
    primary = 1,
    unique = 2,
    normal = 3
}
export interface IDbReference {
    hasMany: boolean;
    primaryKey?: string;
    foreignTypeName?: string;
    foreignType?: IModel;
    foreignKey?: string;
    linkName?: string;
    leftKey?: string;
    rightKey?: string;
}
export interface IDataField extends IValidatableField {
    /**
     * 数据库值的类型
     *
     * @type {string}
     * @memberof IDataField
     */
    dataType?: string;
    /**
     * 是否是主键
     *
     * @type {boolean}
     * @memberof IDataField
     */
    primary?: boolean;
    /**
     * 索引类型
     *
     * @type {(string|DbIndexTypes)}
     * @memberof IDataField
     */
    index?: string | DbIndexTypes;
    /**
     * 是否可以为空
     *
     * @type {boolean}
     * @memberof IDataField
     */
    nullable?: boolean;
    reference?: IDbReference;
    hasOne?: string | boolean;
    ownOne?: string;
    hasMany?: string | boolean;
    ownMany?: string | boolean;
    manyMany?: string[];
}
export declare class DataField extends ValidatableField implements IDataField {
    /**
     * 数据库值的类型
     *
     * @type {string}
     * @memberof IDataField
     */
    dataType?: string;
    /**
     * 是否是主键
     *
     * @type {boolean}
     * @memberof IDataField
     */
    primary: boolean;
    /**
     * 索引类型
     *
     * @type {(string|DbIndexTypes)}
     * @memberof IDataField
     */
    index?: string | DbIndexTypes;
    /**
     * 是否可以为空
     *
     * @type {boolean}
     * @memberof IDataField
     */
    nullable?: boolean;
    reference?: IDbReference;
    constructor(model: Model, opts: IDataField);
}
/**
 * 字段查询方式
 *
 * @export
 * @enum {number}
 */
export declare enum FieldQueryMethods {
    none = 0,
    equal = 1,
    range = 2,
    contains = 3
}
/**
 * 字段会被列举出来
 * 字段的一个属性
 *
 * @export
 * @interface IListable
 */
export interface IListable {
    /**
     * 显示为一个链接
     *
     * @type {string}
     * @memberof IListable
     */
    url?: string;
    /**
     * 虽然在列表中，但会隐藏
     * 默认为false
     *
     * @type {boolean}
     * @memberof IListable
     */
    hidden?: boolean;
    /**
     * 是否可排序
     * 默认是true
     *
     * @type {boolean}
     * @memberof IListable
     */
    sortable?: boolean;
    /**
     * 自定义的单元格
     *
     * @type {string}
     * @memberof IListable
     */
    cell?: string | {
        (row: any): any;
    };
}
export interface IAction {
    url?: string;
    type?: string;
    displayName?: string;
}
export declare type TActionOpts = IAction | string;
export interface IViewMember {
    name?: string;
    /**
     *是否只读 viewtype===edit/detail时生效
     *
     * @type {boolean}
     * @memberof IViewField
     */
    readonly?: boolean;
    /**
     * 是否可查询，如果是字符串，就是FieldQueryTypes的枚举
     * 系统加载dmd时，会自动把该字段规整成FieldQueryTypes
     *
     * @type {(boolean|string|FieldQueryMethods)}
     * @memberof IViewField
     */
    queryable?: boolean | string | FieldQueryMethods;
    /**
     * 是否是关键查询
     * 一个query-page里面有关键查询，查询form会分成2段:关键查询/普通查询
     * 默认为null
     * 如果设置了该值，queryable失效
     *
     * @type {(boolean|string)}
     * @memberof IViewField
     */
    keyQueryable?: boolean | string | FieldQueryMethods;
    /**
     * 是否可列表
     * 加载dmd时，会自动规整成IListable
     *
     * @type {(boolean|string|IListable)}
     * @memberof IViewField
     */
    listable?: boolean | string | IListable;
}
export declare class ViewMember implements IViewMember {
    defination: IViewMember;
    field?: Field;
    view?: IView;
    name?: string;
    /**
     *是否只读 viewtype===edit/detail时生效
     *
     * @type {boolean}
     * @memberof IViewField
     */
    readonly?: boolean;
    /**
     * 是否可查询，如果是字符串，就是FieldQueryTypes的枚举
     * 系统加载dmd时，会自动把该字段规整成FieldQueryTypes
     *
     * @type {(boolean|string|FieldQueryMethods)}
     * @memberof IViewField
     */
    queryable?: FieldQueryMethods;
    /**
     * 是否是关键查询
     * 一个query-page里面有关键查询，查询form会分成2段:关键查询/普通查询
     * 默认为null
     * 如果设置了该值，queryable失效
     *
     * @type {(boolean|string)}
     * @memberof IViewField
     */
    keyQueryable?: FieldQueryMethods;
    /**
     * 是否可列表
     * 加载dmd时，会自动规整成IListable
     *
     * @type {(boolean|string|IListable)}
     * @memberof IViewField
     */
    listable?: IListable;
    constructor(defination: IViewMember, field?: Field, view?: IView);
    static init(member: IViewMember, opts: IViewMember, field?: Field): void;
}
export interface IField extends IDataField, IViewMember {
    /**
     * 字段的标签
     *
     * @type {string}
     * @memberof IBasField
     */
    inputType?: string;
    /**
     * 字段的显示名
     *
     * @type {string}
     * @memberof IViewField
     */
    displayName?: string;
}
export declare class Field extends DataField implements IField {
    /**
     * 字段的标签
     *
     * @type {string}
     * @memberof IBasField
     */
    inputType?: string;
    /**
     * 字段的显示名
     *
     * @type {string}
     * @memberof IViewField
     */
    displayName?: string;
    /**
     *是否只读 viewtype===edit/detail时生效
     *
     * @type {boolean}
     * @memberof IViewField
     */
    readonly?: boolean;
    /**
     * 是否可查询，如果是字符串，就是FieldQueryTypes的枚举
     * 系统加载dmd时，会自动把该字段规整成FieldQueryTypes
     *
     * @type {(boolean|string|FieldQueryMethods)}
     * @memberof IViewField
     */
    queryable?: FieldQueryMethods;
    /**
     * 是否是关键查询
     * 一个query-page里面有关键查询，查询form会分成2段:关键查询/普通查询
     * 默认为null
     * 如果设置了该值，queryable失效
     *
     * @type {(boolean|string)}
     * @memberof IViewField
     */
    keyQueryable?: FieldQueryMethods;
    /**
     * 是否可列表
     * 加载dmd时，会自动规整成IListable
     *
     * @type {(boolean|string|IListable)}
     * @memberof IViewField
     */
    listable?: IListable;
    refField?: Field;
    constructor(model: Model, opts: IField);
}
/**
 * 页面类型
 *
 * @export
 * @enum {number}
 */
export declare enum ViewTypes {
    /**
     * 编辑页面，默认的字段显示为可编辑的字段，一般用于add/modify
     */
    edit = 0,
    /**
     * 详情页面，默认的字段显示为只读。
     */
    detail = 1,
    /**
     * 列表
     */
    list = 2,
    /**
     * 查询，带着一个查询form的列表
     */
    query = 3
}
export interface IGroup {
    name?: string;
    caption?: string;
    members: string[] | {
        [name: string]: ViewMember;
    };
    headActions?: IAction[];
    footActions?: IAction[];
}
export declare class Group implements IGroup {
    view: View;
    defination: IGroup;
    name?: string;
    caption?: string;
    members: {
        [name: string]: ViewMember;
    };
    headActions?: IAction[];
    footActions?: IAction[];
    constructor(view: View, defination: IGroup);
}
export declare type TViewMember = IViewMember | string;
export interface IView {
    name?: string;
    /**
     * 页面标题
     *
     * @type {string}
     * @memberof IView
     */
    caption?: string;
    /**
     * 用于构造页面用的className
     *
     * @type {string}
     * @memberof IView
     */
    className?: string;
    /**
     *  系统会自动规整成ViewTypes
     *
     * @type {string|ViewTypes}
     * @memberof IView
     */
    viewType?: string | ViewTypes;
    members?: {
        [memberName: string]: TViewMember;
    } | TViewMember[];
    headActions?: IAction[];
    bodyActions?: IAction[];
    footActions?: IAction[];
    checkable?: boolean;
    groups?: IGroup[] | {
        [name: string]: IGroup;
    };
    rowsPath: string | YA.DPath;
    ascPath: string | YA.DPath;
    descPath: string | YA.DPath;
    totalPath: string | YA.DPath;
    filterPath: string | YA.DPath;
}
export declare class View implements IView {
    model: Model;
    defination: IView;
    name?: string;
    /**
     * 页面标题
     *
     * @type {string}
     * @memberof IModelPage
     */
    caption?: string;
    className: string;
    /**
     *  系统会自动规整成ViewTypes
     *
     * @type {string|ViewTypes}
     * @memberof IModelViewDefination
     */
    type: string | ViewTypes;
    members: {
        [membername: string]: ViewMember;
    };
    queryMembers: {
        [membername: string]: ViewMember;
    };
    queryKeyMembers: {
        [membername: string]: ViewMember;
    };
    listMembers: {
        [membername: string]: ViewMember;
    };
    headActions?: IAction[];
    bodyActions?: IAction[];
    footActions?: IAction[];
    checkable?: boolean;
    groups?: {
        [name: string]: IGroup;
    };
    rowsPath: YA.DPath;
    ascPath: YA.DPath;
    descPath: YA.DPath;
    totalPath: YA.DPath;
    filterPath: YA.DPath;
    modelSchema: YA.ObservableSchema<any>;
    filterSchema: YA.ObservableSchema<any>;
    listSchema: YA.ObservableSchema<any>;
    constructor(model: Model, defination: IView);
    private _initDetailSchema;
    private _initFilterSchema;
    private _initListSchema;
    private _internalInitModelSchema;
}
export interface IModel {
    fullname?: string;
    bases: string[] | Model[];
    fields: IField[] | {
        [name: string]: IField;
    };
    views: IView[] | {
        [name: string]: IView;
    };
    primary: IField | string;
}
export declare class Model extends YA.Promise implements IModel {
    fullname: string;
    fields: {
        [name: string]: Field;
    };
    views: {
        [name: string]: View;
    };
    bases: Model[];
    base: Model;
    defFields: {
        [name: string]: Field;
    };
    expendableFields: {
        [name: string]: Field;
    };
    defination: any;
    primary: IField;
    references: {
        [typename: string]: Model;
    };
    __loadCallbacks: any[];
    __readyCallbacks: any[];
    __errorInfo: any;
    constructor(fullname: string);
    load(callback: string | {
        (model: Model): any;
    }): Model;
    ready(callback: string | {
        (model: Model): any;
    }): Model;
    private __loadDefination;
    private __loadReferences;
    private __initInherit;
    private __initFields;
    private __initBases;
    private __expandBase;
    private __initViews;
    static models: {
        [fullname: string]: Model;
    };
    static basUrl: string;
    static fetch(fullname: string): Model;
}
export interface IFieldElementInfo {
    fieldElement?: any;
    inputElement?: any;
    getElementValue?: () => any;
    setElementValue?: (value: any) => any;
}
export declare enum MemberViewPositions {
    fieldset = 0,
    filter = 1,
    tableHeader = 2,
    cell = 3
}
export declare enum InputViewTypes {
    unknown = 0,
    disable = 1,
    hidden = 2,
    readonly = 3,
    editable = 4
}
export declare class Renderer {
    view: View;
    model: Model;
    data: {
        [name: string]: any;
    };
    defaultInputViewType: InputViewTypes;
    elementInfos: {
        [name: string]: IFieldElementInfo;
    };
    constructor(view: View);
    render(container?: any): any;
}
export declare type TComponentFactory = (member: ViewMember, initValue: any, memberViewType: InputViewTypes, container: any) => any;
export declare class DetailPartial extends Renderer {
    constructor(view: View);
    render(permissions: {
        [name: string]: string;
    }): any;
}
export declare class ListPartial extends Renderer {
    constructor(view: View);
    render(container?: any): any;
}
export declare let validators: {
    [name: string]: (value: any, opt?: string) => boolean;
};
