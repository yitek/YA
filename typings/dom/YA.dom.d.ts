import * as YA from "../YA.core";
declare let Promise: any;
export interface IHttpRequestOpts {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEADER";
    url?: string;
    headers?: {
        [name: string]: string | [];
    };
    async?: boolean;
    nocache?: boolean;
    data?: any;
    type?: "" | "json" | "url-encoding" | "blob";
    responseType?: "" | "arraybuffer" | "blob" | "document" | "json" | "text" | "response";
}
declare class HttpRequest extends Promise<any> {
    opts: IHttpRequestOpts;
    xhr: XMLHttpRequest;
    method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEADER";
    url: string;
    headers: {
        [name: string]: string | [];
    };
    async: boolean;
    data: any;
    type: "" | "json" | "url-encoding" | "blob";
    responseType?: "" | "arraybuffer" | "blob" | "document" | "json" | "text" | "xml" | "response";
    constructor(opts: IHttpRequestOpts);
    static optsToken: string;
}
export declare class HttpResponse {
    xhr: XMLHttpRequest;
    request: HttpRequest;
    data: any;
    status: number;
    constructor(xhr: XMLHttpRequest, request: HttpRequest);
    header(name: string): string | null;
}
export declare class Size {
    w: number;
    h: number;
    constructor(w: any, h: any);
    get width(): any;
    set width(w: any);
    get height(): any;
    set height(h: any);
    equal(size: Size): boolean;
}
export declare class Pointer {
    x: number;
    y: number;
    constructor(x: any, y: any);
    equal(p: Pointer): boolean;
}
export interface IElement extends YA.IElement, HTMLElement {
}
export interface IElementUtility extends YA.IElementUtility {
    getStyle(node: IElement, name: string): string;
    setStyle(node: IElement, name: string | {
        [name: string]: any;
    }, value?: string | boolean): IElementUtility;
    hasClass(node: IElement, cls: string): boolean;
    addClass(node: IElement, cls: string): boolean;
    removeClass(node: IElement, cls: string): boolean;
    toggleClass(node: IElement, cls: string): boolean;
    replaceClass(node: IElement, oldCls: string, newCls: string, alwaysAdd?: boolean): boolean;
    getAbs(elem: IElement): Pointer;
    setAbs(elem: IElement, pos: Pointer): IElementUtility;
    htmlEncode(text: string): string;
}
export declare let ElementUtility: IElementUtility;
export declare let styleConvertors: any;
export interface IMaskOpts {
    content?: any;
    top?: number;
    autoCenter?: boolean;
    css?: string;
}
export declare class Mask implements IMaskOpts {
    static InstanceToken: string;
    static Message: string;
    element: IElement;
    content?: string;
    autoCenter?: boolean;
    top?: number;
    css?: string;
    private __maskElement;
    private __backendElement;
    private __frontElement;
    private __centerTimer;
    private __liveCheckCount;
    constructor(elem: IElement);
    mask(opts: IMaskOpts | string | boolean): Mask;
    private _init;
    private _sureElements;
    private _keepBackend;
    private _keepFront;
    unmask(): Mask;
    dispose(): void;
}
export declare function mask(elem: IElement, opts: IMaskOpts | string | boolean): Mask;
export interface IComponent extends YA.IComponent {
    mask?: any;
    width?: number | YA.IObservable<number>;
    minWidth?: number | YA.IObservable<number>;
    maxWidth?: number | YA.IObservable<number>;
    height?: number | YA.IObservable<number>;
    minHeight?: number | YA.IObservable<number>;
    maxHeight?: number | YA.IObservable<number>;
    request(opts: string | IHttpRequestOpts, url?: any, data?: any): HttpRequest;
}
export declare class Component extends YA.Component {
    mask?: any;
    css: string;
    width?: number | YA.IObservable<number>;
    minWidth?: number | YA.IObservable<number>;
    maxWidth?: number | YA.IObservable<number>;
    height?: number | YA.IObservable<number>;
    minHeight?: number | YA.IObservable<number>;
    maxHeight?: number | YA.IObservable<number>;
    render(descriptor?: YA.INodeDescriptor, container?: IElement): IElement | IElement[] | YA.INodeDescriptor | YA.INodeDescriptor[];
    request(opts: string | IHttpRequestOpts, url?: any, data?: any): HttpRequest;
    static initElement(elem: IElement, attrs: {
        [name: string]: any;
    }, ownComponent?: IComponent): void;
}
export interface IDropdownable {
    location?: string;
    content?: any;
    width?: number | YA.IObservable<number>;
    minWidth?: number | YA.IObservable<number>;
    maxWidth?: number | YA.IObservable<number>;
    height?: number | YA.IObservable<number>;
    minHeight?: number | YA.IObservable<number>;
    maxHeight?: number | YA.IObservable<number>;
}
export declare class Dropdownable {
    target: IElement;
    opts: any;
    element: IElement;
    ownComponent: YA.IComponent;
    $__isShow__: boolean;
    constructor(target: IElement, opts: any);
    show(): this;
    hide(): this;
    toggle(): this;
    private _initElement;
    private _setPosition;
    private _bottom;
    private _top;
    private _left;
    private _right;
    private _horizen;
    private _vertical;
    private _auto;
    static token: string;
}
export declare class Dropdown extends Component {
    /**
     * 选中的值
     *
     * @type {*}
     * @memberof Dropdown
     */
    value?: any;
    /**
     * 显示的文本
     *
     * @type {string}
     * @memberof Dropdown
     */
    text: string;
    /**
     * 是否可编辑
     *
     * @type {boolean}
     * @memberof Dropdown
     */
    editable?: boolean;
    selectIndex: number;
    /**
     * 选项 下列格式之一
     * {value:text}
     * [{value:text}]
     * //http://
     *
     * @type {*}
     * @memberof Dropdown
     */
    options?: any;
    legend?: boolean | string;
    fields?: {
        [name: string]: string;
    } | string[];
    private _items;
    private _textEditor;
    private _textText;
    private _dropdown_list;
    private _options;
    private _fieldOptSchema;
    VALUE_FIELD: string;
    TEXT_FIELD: string;
    init(descriptor: any): void;
    private _initItems;
    private _initValueText;
    private _setDropdownValue;
    private selectOpt;
    render(): any;
}
export declare class Dropdown1 extends Component {
    value?: any;
    text: string;
    editable?: boolean;
    selectIndex: number;
    options?: any;
    legend?: boolean | string;
    fields?: any[];
    selectType?: string;
    compare?: (item: any, value: any) => string;
    filter?: (keyword: string, options: any[], dropdown: Dropdown) => any[];
    OPTIONVALUE: string;
    OPTIONTEXT: string;
    private _setText;
    private $__options__;
    private $__tbody__;
    private $__waitingTr__;
    private $__tick__;
    private $__legendUrl__;
    private $__filterSessionId__;
    private $__dropdownable__;
    inputElement: IElement;
    private $__field__;
    private $__fieldname__;
    private $__option__;
    private $__optionIndex__;
    constructor();
    _render(): YA.INodeDescriptor;
    getFieldText(field: any): any;
    render(descriptor: YA.INodeDescriptor, parentNode: IElement): IElement;
    private _setValue;
    setOptions(opts: any): Dropdown1;
    private _editInput;
    private _readonlyInput;
    private _filter;
    private _defaultFilter;
    expand(): Dropdown1;
    collapse(): this;
    private _makeDropdownRow;
}
export declare class Field extends Component {
    type: any;
    name: string;
    validations: {
        [name: string]: any;
    };
    css: string;
    permission: string;
    constructor();
}
export {};
