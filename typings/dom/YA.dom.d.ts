import * as YA from "YA.core";
export interface IDom {
    [index: number]: HTMLElement;
    length: number;
    item(index: number): IDom;
    html(val?: string): IDom | string;
    text(val?: string): IDom | string;
    val(val?: any): any;
    width(value?: number): any;
    height(value?: number): any;
    size(size?: Size): IDom | Size;
    left(value?: number): IDom | number;
    top(value?: number): IDom | number;
    pos(pos?: Pointer): Pointer | IDom;
    abs(new_pos?: Pointer): Pointer | IDom;
    x(value?: number): IDom | number;
    y(value?: number): IDom | number;
    prop(name: string | {
        [name: string]: any;
    }, value?: any, replace?: (newValue: any, oldValue: any) => any): any;
    attr(name: string | {
        [name: string]: string;
    }, value?: string): IDom | string;
    style(name: string | {
        [name: string]: string;
    }, value?: string): string | IDom;
    hasClass(cls: string): boolean;
    addClass(cls: string): IDom;
    removeClass(cls: string): IDom;
    replaceClass(old_cls: string, new_cls: string, alwaysAdd?: boolean): IDom;
    on(eventId: string, listener: any): IDom;
    off(eventId: string, listener: any): IDom;
    ydata(name?: any, value?: any): any;
    prev(inserted?: any): IDom;
    next(inserted?: any): IDom;
    first(inserted?: any): IDom;
    last(inserted?: any): IDom;
    parent(inserted?: any): IDom;
    append(inserted?: any): IDom;
    remove(): IDom;
    children(): IDom;
    each(callback: (item: Dom, index: number) => any): IDom;
}
export declare class Dom {
    length: number;
    [index: number]: HTMLElement;
    constructor(element?: any);
    item(index: number): Dom;
    html(val?: string): any;
    text(val?: string): any;
    val(val?: any): any;
    width(value?: number): any;
    height(value?: number): any;
    size(size?: Size): any;
    left(value?: number): any;
    top(value?: number): any;
    pos(pos?: Pointer): any;
    abs(new_pos?: Pointer): any;
    x(value?: number): any;
    y(value?: number): any;
    prop(name: string | {
        [name: string]: any;
    }, value?: any, replace?: (newValue: any, oldValue: any) => any): any;
    attr(name: string | {
        [name: string]: string;
    }, value?: string): any;
    style(name: string | {
        [name: string]: string;
    }, value?: string | number): any;
    hasClass(cls: string): boolean;
    addClass(cls: string): Dom;
    removeClass(cls: string): Dom;
    replaceClass(old_cls: string, new_cls: string, alwaysAdd?: boolean): Dom;
    on(eventId: string, listener: any): Dom;
    off(eventId: string, listener: any): Dom;
    ydata(name?: any, value?: any): any;
    prev(inserted?: any): IDom;
    next(inserted?: any): Dom;
    first(inserted?: any): Dom;
    last(inserted?: any): Dom;
    parent(inserted?: any): Dom;
    append(inserted: any): Dom;
    remove(): Dom;
    children(): Dom;
    each(callback: (item: Dom, index: number) => any): Dom;
    static dom_inst_token: string;
    static dom_data_token: string;
    static prop<T>(prop_name: string, getter: (elem: HTMLElement) => T, setter: (elem: HTMLElement, value: T) => any): IDomBuilder;
    static object<T>(object_name: string, getter: (elem: HTMLElement, name: string) => T, setter: (elem: HTMLElement, name: string, value: T) => Dom): IDomBuilder;
    static op(op_name: string, method: Function): IDomBuilder;
    static element(name: string, getter: (targetElement: HTMLElement, onlyElement?: boolean) => HTMLElement, setter: (targetElement: HTMLElement, opElement: HTMLElement) => any): typeof Dom;
    static define(name: string, fn: Function): IDomBuilder;
}
export interface IDomBuilder {
    define(name: string, fn: Function): IDomBuilder;
    prop<T>(prop_name: string, getter: (elem: HTMLElement) => T, setter: (elem: HTMLElement, value: T) => any): IDomBuilder;
    object<T>(object_name: string, getter: (elem: HTMLElement, name: string) => T, setter: (elem: HTMLElement, name: string, value: T) => Dom): IDomBuilder;
    op(op_name: string, method: Function): IDomBuilder;
}
export declare let style: (obj: HTMLElement, attr: string, value?: any) => any;
export declare function dom(element: any): Dom;
export interface IMaskOpts {
    off?: boolean;
    content?: any;
    keep?: number | string;
    css?: string;
}
export declare class Maskable {
    opts: IMaskOpts;
    dom: Dom;
    frontDom: Dom;
    bgDom: Dom;
    target: Dom;
    tick: any;
    adjust: Function;
    _userSelectValue: any;
    _onselectHandler: any;
    constructor(target: HTMLElement);
    mask(opts?: IMaskOpts | string | boolean): Maskable;
    unmask(): Maskable;
    adjustFront(size: Size, keep: any): void;
    adjustBackend(): Size;
    static dom_inst_token: string;
}
export declare function mask(target: HTMLElement, opts: IMaskOpts | boolean | string): void;
export declare class Dragable {
    target: Dom;
    handle: Dom;
    cid: number;
    handle_tid: string;
    private _msPos;
    private _targetPos;
    private _positionValue;
    static dom_inst_token: string;
    constructor(target: any);
    enable(handle?: any): Dragable;
    _moveStart(evt: MouseEvent): boolean;
    _moving(evt: MouseEvent): boolean;
}
export interface IMessageBoxOpts {
    title?: string;
    content: string;
    css?: string;
    btns: any[];
    dragable?: boolean;
}
export declare class MessageBox extends YA.Promise {
    opts: IMessageBoxOpts;
    box: Dom;
    front: Dom;
    backend: Dom;
    head: Dom;
    body: Dom;
    foot: Dom;
    caption: Dom;
    closer: Dom;
    private _resolve;
    constructor(opts: IMessageBoxOpts);
    open(): this;
    close(reason?: any): MessageBox;
    private _center;
    private _adjacentBackend;
}
export declare function cancelEvent(evt: Event): boolean;
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
