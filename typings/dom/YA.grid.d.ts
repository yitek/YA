import * as YA from "../YA.core";
import * as Dom from "YA.dom";
interface IListNode<T> {
    prev: T;
    next: T;
}
interface IListNodeFactory<T> {
    createNode(index: number): IListNode<T>;
}
declare class ObservableList<T> extends YA.Subject<any> {
    nodeFactory: IListNodeFactory<T>;
    first: T;
    last: T;
    length: number;
    constructor(nodeFactory: IListNodeFactory<T>);
    get(index: number): T;
    set(index: number, item: T, force?: boolean): ObservableList<T>;
    append(item: T): ObservableList<T>;
    insert(newCell: T, isBefore: (existItem: any, newItem: any) => boolean): ObservableList<T>;
}
declare class Column extends ObservableList<Cell> implements IListNode<Column> {
    grid: Grid;
    next: Column;
    prev: Column;
    text: string;
    name: string;
    width: number;
    element: Dom.IElement;
    $__frozen__: boolean;
    constructor(grid: Grid);
    get frozen(): any;
    set frozen(value: any);
    _froze(): void;
    renderContent: (rowData: any[], cell: Cell) => Dom.IElement;
    renderCaption(): HTMLDivElement;
    remove(): void;
}
declare class ColumnCollection extends ObservableList<Column> {
    constructor(grid: any);
}
declare class Row extends ObservableList<Cell> {
    height: number;
    data: any;
    element: Dom.IElement;
    elements: Dom.IElement[];
    grid: Grid;
    remove(): this;
    render(): any[];
}
declare class Cell implements IListNode<Cell> {
    column: Column;
    row: Row;
    next: Cell;
    prev: Cell;
    constructor(column: Column, row: Row);
    element: any;
    render(): HTMLDivElement;
}
export declare class Grid extends Dom.Component {
    columns: ColumnCollection;
    rows: any;
    constructor();
    $__element__: Dom.IElement;
    $__frozenElement__: Dom.IElement;
    $__normalElement__: Dom.IElement;
    $__frozenFrozenElement__: Dom.IElement;
    $__frozenNormalElement__: Dom.IElement;
    normalForzenElement: any;
    normalNormalElement: any;
    _sureElement(): Dom.IElement;
    _sureFrozen(): Dom.IElement;
    _sureNormal(): Dom.IElement;
    _sureForzenFrozen(): Dom.IElement;
    _sureForzenNormal(): Dom.IElement;
    _columnInserted(col: Column): this;
}
export {};
