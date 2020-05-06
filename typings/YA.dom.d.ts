import * as YA from "YA.core";
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
    addClass(node: IElement, cls: string): IElementUtility;
    removeClass(node: IElement, cls: string): IElementUtility;
    replaceClass(node: IElement, oldCls: string, newCls: string, alwaysAdd?: boolean): IElementUtility;
    getAbs(elem: IElement): Pointer;
    setAbs(elem: IElement, pos: Pointer): IElementUtility;
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
    mask: any;
}
export declare class Component extends YA.Component {
    mask: any;
    render(descriptor?: YA.INodeDescriptor, container?: IElement): IElement | IElement[] | YA.INodeDescriptor | YA.INodeDescriptor[];
}
declare class TabPanel extends Component {
    __captionElement: IElement;
    __contentElement: IElement;
    name: string;
    css: string;
    label: string;
    selected: boolean;
    select(selected?: boolean, onlyHideSelf?: boolean): TabPanel;
    render(descriptor: YA.INodeDescriptor, container?: IElement): any;
}
export declare class Tab extends Component {
    static Panel: {
        new (...args: any[]): TabPanel;
    };
    selectedPanel: TabPanel;
    defaultPanel: TabPanel;
    css: string;
    panels: TabPanel[];
    __captionsElement: IElement;
    __contentsElement: IElement;
    constructor();
    selected: string;
    defaultPanelName: string;
    render(descriptor: YA.INodeDescriptor, container: IElement): any;
}
export {};
