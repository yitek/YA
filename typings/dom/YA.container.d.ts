import * as YA from "../YA.core";
import * as Dom from "YA.dom";
declare let Component: typeof Dom.Component;
export declare class Panel extends Component {
    _labelElement: Dom.IElement;
    _contentElement: Dom.IElement;
    name: string;
    text: string;
    width: number;
    height: number;
    render(descriptor: YA.INodeDescriptor, elementContainer?: Dom.IElement): any;
}
export declare class Container extends Panel {
    _panelType: Function;
    constructor();
    get panels(): any;
    render(descriptor: any, container: any): Dom.IElement;
    _onRendering(elem: Dom.IElement): Dom.IElement;
    _onRendered(elem: Dom.IElement): Dom.IElement;
    _onPanelRendered(panel: Panel): any;
}
export interface ISeletablePanelStype {
    name: string;
    multiple: boolean;
    noselect: boolean;
    css: string;
    container: SelectablePanels;
    _onRendering(elem: Dom.IElement): Dom.IElement;
    _onRendered(elem: Dom.IElement): Dom.IElement;
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
export declare class SelectablePanels extends Container {
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
    _onPanelRendered(panel: SelectablePanel): Dom.IElement;
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
export {};
