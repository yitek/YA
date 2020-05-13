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
    addClass(node: IElement, cls: string): boolean;
    removeClass(node: IElement, cls: string): boolean;
    toggleClass(node: IElement, cls: string): boolean;
    replaceClass(node: IElement, oldCls: string, newCls: string, alwaysAdd?: boolean): boolean;
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
export declare class Panel extends Component {
    _labelElement: IElement;
    _contentElement: IElement;
    name: string;
    css: string;
    text: string;
    width: number;
    height: number;
    render(descriptor: YA.INodeDescriptor, elementContainer?: IElement): any;
}
export declare class Panels extends Panel {
    _panelType: Function;
    constructor();
    get panels(): any;
    render(descriptor: any, container: any): IElement;
    _onRendering(elem: IElement): IElement;
    _onRendered(elem: IElement): IElement;
    _onPanelRendered(panel: Panel): any;
}
export interface ISeletablePanelStype {
    name: string;
    multiple: boolean;
    noselect: boolean;
    css: string;
    container: SelectablePanels;
    _onRendering(elem: IElement): IElement;
    _onRendered(elem: IElement): IElement;
    _onPanelRendered(panel: Panel): any;
    _onPanelSelecting(panel: SelectablePanel): any;
    _onPanelUnselecting(panel: SelectablePanel): any;
    _onApply(lastStyle: ISeletablePanelStype): any;
    _onExit(newStype: ISeletablePanelStype): any;
}
export declare class SelectablePanel extends Panel {
    selected: boolean;
    constructor();
    render(des: any, container: any): any;
}
export declare class SelectablePanels extends Panels {
    multiple: boolean;
    noselect: boolean;
    selectAll: boolean;
    unselectAll: boolean;
    panelStyle: string;
    selected: string[];
    get allowMultiple(): any;
    get allowNoselect(): any;
    _defaultPanel: SelectablePanel;
    _lastSelectedPanel: SelectablePanel;
    private __currentStyle__;
    static styles: {
        [name: string]: {
            new (container: SelectablePanels): ISeletablePanelStype;
        };
    };
    get currentStyle(): ISeletablePanelStype;
    constructor();
    get selectedPanels(): any;
    _onRendering(elem: any): any;
    _onRendered(elem: any): any;
    _onPanelRendered(panel: SelectablePanel): any;
    protected $__isChanging__: any;
    _onPanelSelecting(panel: SelectablePanel): any;
    _onPanelUnselecting(panel: SelectablePanel): any;
}
export declare class TabStyle implements ISeletablePanelStype {
    private __captionsElement;
    private __contentsElement;
    name: string;
    multiple: boolean;
    noselect: boolean;
    container: SelectablePanels;
    css: string;
    constructor(container: SelectablePanels);
    _onRendering(elem: any): any;
    _onRendered(elem: any): any;
    _onPanelRendered(panel: SelectablePanel): any;
    _onPanelSelecting(panel: SelectablePanel): boolean;
    _onPanelUnselecting(panel: SelectablePanel): void;
    _onExit(newStyle: ISeletablePanelStype): void;
    _onApply(oldStyle: ISeletablePanelStype): void;
}
export declare class Tab extends SelectablePanels {
    static Panel: {
        new (...args: any[]): SelectablePanel;
    };
    constructor();
}
export declare class GroupStyle implements ISeletablePanelStype {
    name: string;
    multiple: boolean;
    noselect: boolean;
    container: SelectablePanels;
    css: string;
    constructor(container: SelectablePanels);
    _onRendering(elem: any): any;
    _onRendered(elem: any): any;
    _onPanelRendered(panel: SelectablePanel): IElement;
    _onPanelSelecting(panel: SelectablePanel): boolean;
    _onPanelUnselecting(panel: SelectablePanel): void;
    _onExit(newStyle: ISeletablePanelStype): void;
    _onApply(oldStyle: ISeletablePanelStype): void;
}
export declare class Group extends SelectablePanels {
    static Panel: {
        new (...args: any[]): SelectablePanel;
    };
    constructor();
}
