import * as YA from "../YA.core";
import * as Dom from "../YA.dom";
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
    constructor(grid: Grid);
    renderContent: (rowData: any[], cell: Cell) => Dom.IElement;
    renderCaption(): void;
    remove(): void;
}
declare class ColumnCollection extends ObservableList<Column> {
    constructor(grid: any);
}
declare class Row extends ObservableList<Cell> {
    height: number;
    data: any;
    element: Dom.IElement;
    remove(): this;
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
export declare class Grid extends Dom.Panel {
    columns: ColumnCollection;
    rows: any;
    constructor();
    _columnInserted(col: Column): this;
}
export {};
