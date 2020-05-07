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
    label: string;
    render(descriptor: YA.INodeDescriptor, elementContainer?: IElement): any;
}
export declare class Panels extends Component {
    _className: string;
    _panelType: Function;
    css: string;
    constructor();
    get panels(): any;
    render(descriptor: any, container: any): IElement;
    _onRendering(elem: IElement): IElement;
    _onRendered(elem: IElement): IElement;
    _onPanelRendered(panel: Panel): any;
}
declare class SelectablePanel extends Panel {
    selected: boolean;
    constructor();
    render(des: any, container: any): any;
}
export declare class SelectablePanels extends Panels {
    multiple: boolean;
    allowNonSelect: boolean;
    selected: string[];
    _defaultPanel: SelectablePanel;
    _lastSelectedPanel: SelectablePanel;
    constructor();
    get selectedPanels(): any;
    _onRendered(elem: any): any;
    _onPanelRendered(panel: SelectablePanel): void;
    protected $__isChanging__: any;
    _onPanelSelecting(panel: SelectablePanel): any;
    _onPanelUnselecting(panel: SelectablePanel): any;
}
export declare class TabPanel extends SelectablePanel {
    constructor();
}
export declare class Tab extends SelectablePanels {
    static Panel: {
        new (...args: any[]): SelectablePanel;
    };
    __captionsElement: IElement;
    __contentsElement: IElement;
    constructor();
    _onRendering(elem: any): any;
    /**
     * 容器div已经创建，主要负责构建容器内部结构
     *
     * @param {IElement} elem
     * @memberof PanelContainer
     */
    _onRendered(elem: IElement): IElement;
    /**
     * 主要负责把Panel装到正确的容器element中
     *
     * @param {SelectablePanel} panel
     * @memberof PanelContainer
     */
    _onPanelRendered(panel: SelectablePanel): any;
    /**
     * 主要负责panel的elemeent的操作，panel自身的状态已经处于selected
     *
     * @param {SelectablePanel} panel
     * @param {SelectablePanel} lastSelectedPanel
     * @memberof PanelContainer
     */
    _onPanelSelecting(panel: SelectablePanel): boolean;
    _onPanelUnselecting(panel: TabPanel): void;
}
export {};
