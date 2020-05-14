import * as YA from "YA.core";
export declare function fulfillable(target: any, name: string): void;
export declare enum FieldValueKinds {
    value = 0,
    enum = 1,
    collection = 2
}
export declare enum Permissions {
    disable = 0,
    hidden = 1,
    readonly = 2,
    writable = 3
}
export interface IField {
    name: string;
    text?: string;
    type?: string;
    description?: string;
    validations?: {
        [name: string]: any;
    };
    kind?: string;
    expandable?: string[];
    sortable?: boolean;
    queryable?: string;
    permission?: string;
    usual?: boolean;
}
export interface IModel {
    fullname: string;
    base?: string;
    fields?: IField[];
    views?: IView[] | {
        [name: string]: IView;
    };
}
interface ICollapse {
    relField: Field;
    prinField: Field;
}
export declare class Field {
    name: string;
    opts: IField;
    model: Model;
    description: string;
    type: string;
    kind: FieldValueKinds;
    sortable: boolean;
    queryable: string;
    permission: Permissions;
    usual: boolean;
    valueModel: Model;
    expends: {
        [name: string]: Field;
    };
    expanded: ICollapse;
    constructor(name: string, opts: IField, model: Model);
}
export declare class Model {
    fullname: string;
    opts?: IModel;
    /**
     * 基类加载完成，字段尚未展开
     *
     * @memberof Model
     */
    load: (value: Field[] | {
        (fields: Field[]): any;
    }) => Model;
    /**
     * 可展开字段已经展开，但不是所有的依赖类型都载入了
     *
     * @memberof Model
     */
    ready: (value: Model | {
        (model: Model): any;
    }) => Model;
    base: Model;
    fields: {
        [name: string]: Field;
    };
    fieldnames: string[];
    views: {
        [name: string]: View;
    };
    dependences: Model[];
    constructor(fullname: string, opts?: IModel);
    each(callback: (field: Field) => void): this;
    buildSchema(filter?: (field: Field) => boolean, schema?: YA.ObservableSchema<any>): YA.ObservableSchema<any>;
    static defineProp(schema: YA.ObservableSchema<any>, field: Field): void;
    private static _initExpandableFieldSchema;
    private static _initExpandedFieldSchema;
    static $__caches__: {
        [name: string]: Model;
    };
    static model(type: string): Model;
    static define(opts: IModel): void;
    static loadModelDefination: (name: string, callback: (opts: IModel) => any) => any;
}
export declare let valueTypenames: string[];
export declare class ValModel extends Model {
    constructor(fullname: string);
}
export declare class RefModel extends Model {
    opts: IModel;
    fullname: string;
    base: Model;
    fields: {
        [name: string]: Field;
    };
    fieldnames: string[];
    views: {
        [name: string]: View;
    };
    $__depPaddingCount__: number;
    dependences: Model[];
    constructor(opts: IModel | string);
    private _init;
    private _initFields;
    private _initThisFields;
    private _initField;
    private _expandField;
    private _completeFields;
    private _initViews;
}
export interface IDataField extends IField {
    dataType?: string;
    length?: number;
    precision?: number;
    key?: string;
}
export declare enum ViewKinds {
    detail = 0,
    edit = 1,
    list = 2,
    query = 3
}
export interface IFieldView {
    name?: string;
    permission?: string;
    viewType?: string;
    queryable?: string;
    sortable?: boolean;
    usual?: boolean;
}
declare class FieldView {
    name: string;
    opts: IFieldView;
    panel: PanelView;
    permission?: Permissions;
    viewType?: string;
    queryable: string;
    usual: boolean;
    sortable: boolean;
    field: Field;
    constructor(name: string, opts: IFieldView, panel: PanelView);
}
export interface IAction {
    name?: string;
    text?: string;
    url?: string;
    event?: string;
}
export declare enum PanelTypes {
    normal = 0,
    group = 1,
    tab = 2
}
export interface IPanelView {
    name?: string;
    text?: string;
    permission?: string;
    kind?: string;
    fields?: IFieldView[] | string[] | {
        [name: string]: IFieldView | string;
    };
    actions?: IAction[];
}
export declare class PanelView {
    opts: IPanelView;
    model: Model;
    panel: PanelView;
    name: string;
    text: string;
    panelType: PanelTypes;
    permission: Permissions;
    kind: ViewKinds;
    views: {
        [name: string]: FieldView;
    };
    constructor(opts: IPanelView, model: Model, panel: PanelView);
    each(callback: {
        (field: FieldView, panel: PanelView): any;
    }): PanelView;
}
export interface IGroupView extends IPanelView {
    name?: string;
    text?: string;
    panels?: IPanelView[] | {
        [name: string]: IPanelView;
    };
}
export declare class GroupView extends PanelView {
    panels: {
        [name: string]: PanelView;
    };
    constructor(opts: IGroupView, model: Model, panel: PanelView);
    each(callback: {
        (field: FieldView, panel: PanelView): any;
    }): PanelView;
}
export interface ITabView extends IGroupView {
    tabs?: ITabView[];
}
export declare class TabView extends PanelView {
    tabs: {
        [name: string]: GroupView;
    };
    constructor(opts: IGroupView, model: Model, panel: PanelView);
    each(callback: {
        (field: FieldView, panel: PanelView): any;
    }): PanelView;
}
export interface IView extends ITabView {
    rowActions?: IAction[];
    pageable?: boolean;
    sortable?: boolean;
}
export declare class View extends TabView {
    queryableFieldViews: {
        [name: string]: FieldView;
    };
    usualFieldViews: {
        [name: string]: FieldView;
    };
    modelSchema: YA.ObservableSchema<any>;
    listSchema: YA.ObservableSchema<any>;
    querySchema: YA.ObservableSchema<any>;
    constructor(opts: IView, model: Model);
    private _initSchema;
}
export {};
