import * as YA from "../YA.core";
import * as Dom from "YA.dom";

interface IListNode<T>{
    prev:T;
    next:T;
}
interface IListNodeFactory<T>{
    createNode(index:number):IListNode<T>;
}
class ObservableList<T> extends YA.Subject<any>{
    first:T;
    last:T;
    length:number;
    constructor(public nodeFactory:IListNodeFactory<T>){
        super();
        this.length=0;
    }

    get(index:number):T{
        let i=0;let elem:any = this.first as any as IListNode<T>;
        while(elem){
            if(i==index)return elem as any;
            elem = (elem as any as IListNode<T>).next;
            i++;
        }
        return null;
    }
    set(index:number,item:T,force?:boolean):ObservableList<T>{
        if(index===0){
            (this.first as any).prev = item;
            (item as any).next = this.first;
            this.first = item;
            return this;
        }
        let exist = this.first;
        index=index-1;
        for(let i =0;i<index;i++){
            if(exist) {exist = (exist as any).next;continue;}
            if(force) {
                let inserted = this.nodeFactory.createNode(i);
                (this.last as any).next = inserted;
                inserted.next = this.last;
                exist = this.last = inserted as any;
            }
        }
        let next = (exist as any).next;
        (exist as any).next = item;
        if(next) {next.prev = item;(item as any).next = next;}
        else this.last = item;
        return this;
    }
    append(item:T):ObservableList<T>{
        if(!this.first) this.first = this.last = item;
        else {
            (this.last as any).next = item ;
            (item as any).prev =this.last;
            this.last = item;
        }
        this.length++;
        return this;
    }
    insert(newCell:T,isBefore:(existItem,newItem)=>boolean):ObservableList<T>{
       
        let cell = this.first as any as IListNode<T>;
        if(!cell){
            this.first = this.last = newCell;
            return this;
        }
        while(cell){
            if(isBefore(cell,newCell)){
                if(!cell.prev){
                    this.first = newCell;    
                }else{
                    (cell.prev as any).next = newCell;
                }              
                
                cell.prev = newCell;
                (newCell as any).next = cell; 
                return this;
            }
        }
        (this.last as any).next =newCell;
        (newCell as any).prev = this.last;
        this.last= newCell;
        this.length++;
        return this;
    }
}

class Column extends ObservableList<Cell> implements IListNode<Column>{
    next:Column;
    prev:Column;
    text:string;
    name:string;
    width:number;
    
    element:Dom.IElement;

    $__frozen__:boolean;
    constructor(public grid:Grid){
        super(grid as any);
    }
    get frozen(){
        return this.$__frozen__;
    }
    set frozen(value:any){
        let old = this.$__frozen__;
        this.$__frozen__ = value;
        if(old && !value){

        }
    }

    _froze(){
        let cell = this.first;
        while(cell){
            let cellRow = cell.row;
            let cols = this.grid.columns;
            let forzenRowElement = cellRow.elements[1];
            if(!forzenRowElement){
                forzenRowElement = forzenRowElement = document.createElement("div");
                forzenRowElement.className = "row frozen";
            }
            let col = cols.first;
            while(col){
                if(!col.$__frozen__){
                    col.$__frozen__ = true;

                }
            }
        }
    }
    renderContent:(rowData:any[],cell:Cell)=>Dom.IElement;
    renderCaption(){
        let elem=this.element= document.createElement("div");
        elem.innerHTML = "<label></label><ins></ins>";
        let textOb =this.text as any as YA.IObservable<string>;
        textOb.subscribe((e)=>{
            (this.element.firstChild as any).innerHTML = e.value;
        },this.grid);
        (this.element.firstChild as any).innerHTML = textOb.get(YA.ObservableModes.Value);
        (this.element.firstChild as any).onclick =()=>{};
        return elem;
    }
    remove(){
        this.element.parentElement.removeChild(this.element);
        let cell = this.first;
        while(cell){
            cell.element.parentNode.removeChild(cell.element);
            cell = cell.next;
        }
    }
}

class ColumnCollection extends ObservableList<Column>{
    constructor(grid:any){
        super(grid);
    }
}

class Row extends ObservableList<Cell>{
    height:number;
    data:any; 
    element:Dom.IElement;
    elements:Dom.IElement[];
    grid:Grid;
    remove(){
        this.element.parentNode.removeChild(this.element);
        return this;
    }
    render(){
        let normalRow ;
        let frozenRow;
        let cols = this.grid.columns;
        this.first = this.last = null;
        for(let i=0,j=cols.length;i<j;i++ ){
            let col = cols.get(i);
            let cell = new Cell(col,this);
            if(!this.first) this.first = this.last = cell;
            else {
                this.last.next = cell;
                cell.prev = this.last;
                this.last = cell;
            }
            let cellElem = cell.render();
            if(col.frozen){
                if(!frozenRow) {
                    normalRow == document.createElement("div");
                    normalRow.className = "row normal";
                }else {
                    frozenRow == document.createElement("div");
                    frozenRow.className = "row frozen";
                }
                frozenRow.appendChild(cellElem);
            }else {
                normalRow.appendChild(cellElem);
            }
            col = col.next;
        }
        return this.elements = [normalRow,frozenRow];
    }
}
class Cell implements IListNode<Cell>{
    next:Cell;
    prev:Cell;
    constructor(public column:Column,public row:Row){
        
    }
    element:any;
    render(){
        let cellElem = this.element = document.createElement("div");
        cellElem.className="cell";
        let innerElement = this.column.renderContent(this.row.data,this);
        cellElem.appendChild(innerElement);
        return cellElem;
    }
}


export class Grid extends Dom.Component{
    columns:ColumnCollection;
    rows:any;
    

    constructor(){
        super();
    }
    $__element__:Dom.IElement;
    $__frozenElement__ :Dom.IElement;
    $__normalElement__:Dom.IElement;
    $__frozenFrozenElement__:Dom.IElement;
    $__frozenNormalElement__:Dom.IElement;
    normalForzenElement;
    normalNormalElement;

    _sureElement(){
        if(!this.$__element__) {
            this.$__element__ = document.createElement("div");
            this.$__element__.className = "grid";
            this.$__element__.style.display="table";
        }
        return this.$__element__;
    }
    _sureFrozen(){
        if(!this.$__frozenElement__){
            this.$__frozenElement__ = document.createElement("div");
            this.$__frozenElement__.style.display="table-row";
            this.$__frozenElement__.className="frozen";
            if(this.$__normalElement__){
                this.$__element__.insertBefore(this.$__frozenElement__,this.$__normalElement__);
            }else this.$__element__.appendChild(this.$__frozenElement__);
        }
        return this.$__frozenElement__;
    }
    _sureNormal(){
        if(!this.$__normalElement__){
            this.$__normalElement__ = document.createElement("div");
            this.$__normalElement__.style.display = "table-row";
            this.$__normalElement__.className="normal";
            this.$__element__.appendChild(this.$__normalElement__);
        }
        return this.$__normalElement__;
    }

    _sureForzenFrozen(){
        if(!this.$__frozenFrozenElement__){
            let frozenElement = this._sureFrozen();
            let tb = this.$__frozenFrozenElement__ = document.createElement("table");
            tb.style.display = "table-cell";
            tb.className = "frozen-frozen";
            if(this.$__frozenNormalElement__){
                frozenElement.insertBefore(tb,this.$__frozenNormalElement__);
            }else frozenElement.appendChild(tb);
        }
        return this.$__frozenFrozenElement__;
    }
    _sureForzenNormal(){ 
        if(!this.$__frozenNormalElement__){
            let frozenElement = this._sureFrozen();
            let tb = this.$__frozenFrozenElement__ = document.createElement("table");
            tb.style.display = "table-cell";
            tb.className = "frozen-normal";
            frozenElement.appendChild(tb);
        }
        return this.$__frozenNormalElement__;
    }

    _columnInserted(col:Column){
        let row = this.rows.first;
        while(row){
            let insertedCell = new Cell(col,row);
            row.insert(insertedCell,(exist,inserted)=>exist.column.prev===inserted.column.prev);
            row = row.next;
        }
        return this;
    }
}