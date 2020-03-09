export declare class Dom {
    length: number;
    [index: number]: HTMLElement;
    constructor(element?: any);
    item(index: number): Dom;
    html(val?: string): Dom | string;
    text(val?: string): Dom | string;
    val(val?: any): any;
    width(value?: number): any;
    height(value?: number): any;
    size(size?: Size): this | Size;
    left(value?: number): any;
    top(value?: number): any;
    pos(pos?: Pointer): Pointer | Dom;
    abs(new_pos?: Pointer): Pointer | Dom;
    x(value?: number): any;
    y(value?: number): any;
    prop(name: string | {
        [name: string]: any;
    }, value?: any, replace?: (newValue: any, oldValue: any) => any): any;
    attr(name: string | {
        [name: string]: string;
    }, value?: string): Dom | string;
    style(name: string | {
        [name: string]: string;
    }, value?: string): string | Dom;
    hasClass(cls: string): boolean;
    addClass(cls: string): Dom;
    removeClass(cls: string): Dom;
    replaceClass(old_cls: string, new_cls: string, alwaysAdd?: boolean): Dom;
    on(eventId: string, listener: any): Dom;
    off(eventId: string, listener: any): Dom;
    prev(inserted?: any): Dom;
    next(inserted?: any): Dom;
    first(inserted?: any): Dom;
    last(inserted?: any): Dom;
    parent(inserted?: any): Dom;
    append(inserted: any): Dom;
    remove(): Dom;
    static token: string;
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
export declare class Mask {
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
    mask(opts?: IMaskOpts | string | boolean): Mask;
    unmask(): Mask;
    adjustFront(size: Size, keep: any): void;
    adjustBackend(): Size;
    static token: string;
}
export declare function mask(target: HTMLElement, opts: IMaskOpts | boolean | string): void;
export declare enum Directions {
    Vertical = 0,
    Horizontal = 1
}
export declare enum ResizerLocations {
    left = 0,
    leftTop = 1,
    top = 2,
    topRight = 3,
    right = 4,
    rightBottom = 5,
    bottom = 6,
    bottomLeft = 7
}
export interface IResizeOpts {
    location: ResizerLocations | ResizerLocations[];
    resizer_size?: number;
    min_width?: number;
    max_width?: number;
    min_height?: number;
    max_height?: number;
}
export declare class Resizeable {
    opts: IResizeOpts;
    target: Dom;
    left_resizer?: Dom;
    leftTop_resizer?: Dom;
    top_resizer?: Dom;
    topRight_resizer: Dom;
    right_resizer: Dom;
    rightBottom_resizer: Dom;
    bottom_resizer: Dom;
    bottomLeft_resizer: Dom;
    resizer_size: number;
    min_width: number;
    max_width: number;
    min_height: number;
    max_height: number;
    _msPos: Pointer;
    _msSize: Size;
    _rszrPos: Pointer;
    constructor(target: any);
    enable(opts: IResizeOpts | boolean): Resizeable;
    _dock(): void;
    _resizeStart(evt: MouseEvent): void;
    _leftResize(evt: MouseEvent): void;
    _leftTopResize(evt: MouseEvent): void;
    _topResize(evt: MouseEvent): void;
    _topRightResize(evt: MouseEvent): void;
    _rightResize(evt: MouseEvent): void;
    _rightBottomResize(evt: MouseEvent): void;
    _bottomResize(evt: MouseEvent): void;
    _bottomLeftResize(evt: MouseEvent): void;
}
export declare class Spliter {
    dom: Dom;
    constructor(target: any);
}
export interface IAnchorOpts {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
}
export declare class Anchor {
    target: Dom;
    opts: IAnchorOpts;
    adjust: () => any;
    constructor(target: any);
    capture(opts: IAnchorOpts): void;
    static token: string;
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
