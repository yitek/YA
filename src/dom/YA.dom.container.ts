
import * as YA from "../YA.core";
import {Dom,dom,Size,Pointer} from "YA.dom";

let Host = YA.DomUtility;

export enum Directions{
    Vertical,
    Horizontal
}
export enum ResizerLocations{
    left,
    leftTop,
    top,
    topRight,
    right,
    rightBottom,
    bottom,
    bottomLeft
}
let ResizerLocationInfos = {
    "left":{zIndex:9999990,cursor:"w-resize"}
    ,"leftTop":{zIndex:9999991,cursor:"nw-resize"}
    ,"top":{zIndex:9999990,cursor:"n-resize"}
    ,"topRight":{zIndex:9999991,cursor:"ne-resize"}
    ,"right":{zIndex:9999990,cursor:"e-resize"}
    ,"rightBottom":{zIndex:9999991,cursor:"se-resize"}
    ,"bottom":{zIndex:9999990,cursor:"s-resize"}
    ,"bottomLeft":{zIndex:9999991,cursor:"sw-resize"}
};
export interface IResizeOpts{
    location:ResizerLocations|ResizerLocations[];
    resizer_size?:number;
    min_width?:number;
    max_width?:number;
    min_height?:number;
    max_height?:number;
}
export class Resizeable{
    opts:IResizeOpts;
    target:Dom;

    left_resizer?:Dom;
    leftTop_resizer?:Dom;
    top_resizer?:Dom;
    topRight_resizer:Dom;
    right_resizer:Dom;
    rightBottom_resizer:Dom;
    bottom_resizer:Dom;
    bottomLeft_resizer:Dom;

    resizer_size:number;
    min_width:number;
    max_width:number;
    min_height:number;
    max_height:number;

    _msPos:Pointer;
    _msSize:Size;
    _rszrPos:Pointer;

    constructor(target:any){
        this.target = dom(target);
        let dock = this._dock;
        this._dock = ()=>dock.call(this);
    }
    enable(opts:IResizeOpts|boolean):Resizeable{
        this.left_resizer?.remove();
        this.leftTop_resizer?.remove();
        this.top_resizer?.remove();
        this.topRight_resizer?.remove();
        this.right_resizer?.remove();
        this.rightBottom_resizer?.remove();
        this.bottom_resizer?.remove();
        this.bottomLeft_resizer?.remove();
        if(opts===false){
            dom(window).off("resize",this._dock);
            return this;
        }

        let locations:ResizerLocations[] = (YA.is_array((opts as IResizeOpts).location)?(opts as IResizeOpts).location:[(opts as IResizeOpts).location]) as ResizerLocations[];
        for(const loc of locations){
            let elem :Dom;
            let name =typeof loc ==="string"?loc: ResizerLocations[loc];
            let info = ResizerLocationInfos[name];
            if(!info) throw new Error("错误的位置:"+name);
            
            this[name+"_resizer"] =dom(`<div style='position:absolute;cursor:${info.cursor};z-index:${info.zIndex};' class="${name}-resizer"></div>`)
                .width(this.resizer_size).height(this.resizer_size)
                .parent(this.target.parent())
                .prop("_YA_RSZ_LOCATION_NAME",name)
                .on("mousedown",(evt)=>this._resizeStart(evt));
        }
        this._dock();
        dom(window).on("resize",this._dock);
        return this;
    }
    _dock(){
        let pos = this.target.pos() as Pointer;
        let sz = this.target.size();
        let rw = this.resizer_size/2 ||1;
        this.left_resizer?.left(pos.x-rw).top(pos.x).height(sz.height);
        this.leftTop_resizer?.top(pos.y-rw).left(pos.x-rw);
        this.top_resizer?.top(-rw).left(pos.x).width(sz.width);
        this.topRight_resizer?.top(-rw).left(sz.width-rw);
        this.right_resizer?.top(pos.y).left(sz.width-rw).height(sz.height);
        this.rightBottom_resizer?.top(sz.height-rw).left(sz.width-rw);
        this.bottom_resizer?.top(sz.height-rw).left(-rw).width(sz.width);
        this.bottomLeft_resizer?.top(sz.height-rw).left(-rw);
    }
    _resizeStart(evt:MouseEvent){
        let locname = evt.target["_YA_RSZ_LOCATION_NAME"];
        let move_handler = this["_"+locname+"Resize"];
        let x = evt.clientX;
        let y = evt.clientY;
        let apos = dom(evt.target).abs() as Pointer;
        apos.x +=evt.clientX;apos.y +=evt.clientY;
        this._msPos = apos;
        this._msSize = this.target.size() as Size;
        let doc:HTMLDocument = Host.document as any;
        let msk = dom(`<div style='position:absolute;top:0;height:0;background-color:#fff;z-index:999999999;'></div>`)
            .width(Math.max((doc as any).body.offsetWidth,(doc as any).documentElement.offsetWidth))
            .height(Math.max(doc.body.offsetHeight,(doc as any).documentElement.offsetHeight))
            .parent(doc.body)
            .on("mousemove",(evt:MouseEvent)=>move_handler.call(this,evt))
            .on("mouseup",(evt)=>{
                move_handler.call(this,evt);
                msk.remove();msk=undefined;
            }).on("mouseout",(evt)=>{
                move_handler.call(this,evt);
                msk.remove();msk=undefined;
            });
    }
    _leftResize(evt:MouseEvent){
        let x = evt.offsetX;
        let dw = x- this._msPos.x;
        let w = this._msSize.w + dw;
        if(w>this.max_width || w< this.min_width) return;
        this.target.width(this._msSize.w = w).left(this._msPos.x+=dw);
        this.left_resizer.left(this._rszrPos.x+= dw);
    }
    _leftTopResize(evt:MouseEvent){
        let x = evt.offsetX;let y = evt.offsetY;
        let dw = x- this._msPos.x;
        let dh = y - this._msPos.y;
        let w = this._msSize.w + dw;
        let h = this._msSize.h + dh;
        if(w<=this.max_width && w>=this.min_width){
            this.target.width(this._msSize.w = w).left(this._msPos.x+=dw);
        }
        if(h<=this.max_height && w>=this.min_height){
            this.target.height(this._msSize.h = h).top(this._msPos.y+=dh);
        }
        this.leftTop_resizer.left(this._rszrPos.x+= dw).top(this._rszrPos.y+= dh);
    }
    _topResize(evt:MouseEvent){
        let y = evt.offsetY;
        let dh = y - this._msPos.y;
        let h = this._msSize.h + dh;
        if(h<=this.max_height){
            this.target.height(this._msSize.h = h).top(this._msPos.y+=dh);
        }
        this.top_resizer.top(this._rszrPos.y+=dh);
    }

    _topRightResize(evt:MouseEvent){
        let x = evt.offsetX;let y = evt.offsetY;
        let dw = x- this._msPos.x;
        let dh = y - this._msPos.y;
        let w = this._msSize.w + dw;
        let h = this._msSize.h + dh;
        if(w<=this.max_width && w>=this.min_width){
            this.target.width(this._msSize.w = w);
        }
        if(h<=this.max_height && w>=this.min_height){
            this.target.height(this._msSize.h = h).top(this._msPos.y+=dh);
        }
        this.topRight_resizer.left(this._rszrPos.x+= dw).top(this._rszrPos.y+= dh);
    }

    _rightResize(evt:MouseEvent){
        let x = evt.offsetX;
        let dw = x- this._msPos.x;
        let w = this._msSize.w + dw;
        if(w>this.max_width || w< this.min_width) return;
        this.target.width(this._msSize.w = w);
        this.right_resizer.left(this._rszrPos.x+= dw);
    }
    _rightBottomResize(evt:MouseEvent){
        let x = evt.offsetX;let y = evt.offsetY;
        let dw = x- this._msPos.x;
        let dh = y - this._msPos.y;
        let w = this._msSize.w + dw;
        let h = this._msSize.h + dh;
        if(w<=this.max_width && w>=this.min_width){
            this.target.width(this._msSize.w = w);
        }
        if(h<=this.max_height && w>=this.min_height){
            this.target.height(this._msSize.h = h);
        }
        this.topRight_resizer.left(this._rszrPos.x+= dw).top(this._rszrPos.y+= dh);
    }
    _bottomResize(evt:MouseEvent){
        let y = evt.offsetY;
        let dh = y - this._msPos.y;
        let h = this._msSize.h + dh;
        if(h<=this.max_height){
            this.target.height(this._msSize.h = h);
        }
        this.bottom_resizer.top(this._rszrPos.y+=dh);
    }
    _bottomLeftResize(evt:MouseEvent){
        let x = evt.offsetX;let y = evt.offsetY;
        let dw = x- this._msPos.x;
        let dh = y - this._msPos.y;
        let w = this._msSize.w + dw;
        let h = this._msSize.h + dh;
        if(w<=this.max_width && w>=this.min_width){
            this.target.width(this._msSize.w = w).left(this._msPos.x+= dw);
        }
        if(h<=this.max_height && w>=this.min_height){
            this.target.height(this._msSize.h = h);
        }
        this.bottomLeft_resizer.left(this._rszrPos.x+= dw).top(this._rszrPos.y+= dh);
    }
}
export class Spliter{
    dom:Dom;
    constructor(target:any){
        this.dom = dom(target);
    }
}

export interface IAnchorOpts{
    left?:number;
    top?:number;
    right?:number;
    bottom?:number;
}
export class Anchor{
    target:Dom;
    opts:IAnchorOpts;
    adjust:()=>any;
    
    constructor(target:any){
        this.target = dom(target);
        this.target.prop(Anchor.token,this,(newv,oldv)=>{
            return newv;
        });
    }
    capture(opts:IAnchorOpts){
        if(this.adjust){ dom(Host.window).off("resize",this.adjust);}
        this.adjust=()=>{
            let psz = this.target.parent().size();

        };
    }

    static token:string = "$_YA_ANCHOR_INST";
}