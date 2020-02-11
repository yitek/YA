import * as YA from "YA.core";

let Host = YA.Host;


export class Dom {
    length:number;
    [index:number]:HTMLElement;
    constructor(public element?:any){
        let handleItem = (item)=>{
            if(!item) return;
            if(typeof item==="string"){
                handleStr(item);
            }else if(item instanceof Dom){
                for(let i =0,j=item.length;i<j;i++){
                    Object.defineProperty(this,count as any,{enumerable:true,writable:false,configurable:false,value:item[i]});
                    count++;
                }
            }else if(Host.isElement(item,true)){
                Object.defineProperty(this,count as any,{enumerable:true,writable:false,configurable:false,value:item});
                count++;
            }else {
                //可能是个数组
                extract(item);
            }
        };
        let handleStr=(str:string)=>{
            if(str[0]==="#"){
                let elem = Host.document.getElementById(str.substr(1));
                if(elem) {
                    Object.defineProperty(this,count as any,{enumerable:true,writable:false,configurable:false,value:elem});
                    //if(!(elem as any)[Dom.token]) 
                    //    Object.defineProperty(elem,Dom.token,{enumerable:true,writable:false,configurable:false,value:this});
                    count++;
                }
                return;
            }
            element_wrapper.innerHTML = str;
            extract(element_wrapper.childNodes);
            element_wrapper.innerHTML="";
        }
        
        let extract=(arr:any)=>{
            for(let i =0,j=arr.length;i<j;i++){
                let item = arr[i];
                handleStr(item);
            }
        }

        let count = 0;
        if(Host.isElement(element,true)){
            Object.defineProperty(this,0 as any,{enumerable:true,writable:false,configurable:false,value:element});
            
        }else {
            handleItem(element);
        }
        Object.defineProperty(this,"length",{enumerable:true,writable:false,configurable:false,value:count});
    }

    item(index:number):Dom{
        let elem = this[index];
        let inst = (elem as any)[Dom.token];
        if(!inst){
            return new Dom(elem);
        }
        return inst;
    }
    
    html(val?:string):Dom|string{
        if(!this.length) return val===undefined?undefined:this;
        if(val===undefined) return this[0].innerHTML;
        for(let i=0,j=this.length;i<j;i++)this[i].innerHTML = val;
        return this;
    }
    
    text(val?:string):Dom|string{
        if(!this.length) return val===undefined?undefined:this;
        if(val===undefined) return this[0].innerText;
        for(let i=0,j=this.length;i<j;i++)this[i].innerText = val;
        return this;
    }

    val(val?:any):any{
        if(!this.length) return value===undefined?undefined:this;
        if(val===undefined) return value.call(this,this[0]);
        for(let i=0,j=this.length;i<j;i++)value.call(this,this[i],val);
        return this;
    }

    width(value?:number):any{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return this[0].clientWidth;
        let w = (parseFloat(value as any) |0)+ "px";
        for(let i=0,j=this.length;i<j;i++) this[i].style.width = w;
        return this;
    }

    height(value?:number):any{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return this[0].clientHeight;
        let h = (parseFloat(value as any)|0) + "px";
        for(let i=0,j=this.length;i<j;i++) this[i].style.height = h;
        return this;
    }

    size(size?:Size){
        if(!this.length) return size===undefined?undefined:this;
        if(size===undefined) return {w:this[0].clientWidth,h:this[0].clientHeight};
        let h = size.h===undefined?undefined:(parseFloat(size.h as any)|0) + "px";
        let w =  size.w===undefined?undefined:parseFloat(size.w as any) + "px";
        for(let i=0,j=this.length;i<j;i++) {
            let elem = this[i];
            if(h!==undefined) elem.style.height = h;
            if(w!==undefined) elem.style.width = w;
        }
        return this;
    }


    left(value?:number):any{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return this[0].offsetLeft;
        let left = (parseFloat(value as any)|0) + "px";
        for(let i=0,j=this.length;i<j;i++) this[i].style.left = left;
        return this;
    }

    top(value?:number):any{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return this[0].offsetTop;
        let top = (parseFloat(value as any)|0) + "px";
        for(let i=0,j=this.length;i<j;i++) this[i].style.top = top;
        return this;
    }
    pos(pos?:Pointer):Pointer|Dom{
        if(!this.length) return pos===undefined?undefined:this;
        let x = pos.x===undefined?undefined:(parseFloat(pos.x as any)|0) + "px";
        let y = pos.y===undefined?undefined:(parseFloat(pos.y as any)|0) + "px";
        for(let i=0,j=this.length;i<j;i++){
            if(x!==undefined){
                this[i].style.left = x + "px";
            }
            if(y!==undefined){
                this[i].style.top = y + "px";   
            }
        }
        return this;
    }

    abs(new_pos?:Pointer):Pointer|Dom{
        if(!this.length) return new_pos===undefined?{} as Pointer:this;
        if(new_pos===undefined){
            let p = this[0];
            if(!p) new Pointer(undefined,undefined);
            let x=0,y=0;
            while(p){
                x += p.offsetLeft;
                y+= p.offsetTop;
                p=p.offsetParent as any;
            }
            return new Pointer(x,y);
        }
        
        for(let i=0,j=this.length;i<j;i++){
            this[i].style.position="absolute";
            let old_pos = this.item(i).abs() as Pointer;
            if(new_pos.x!==undefined){
                let x = new_pos.x - old_pos.x + this[i].clientLeft;
                this[i].style.left = x + "px";
            }
            if(new_pos.y!==undefined){
                let y = new_pos.y - old_pos.y + this[i].clientTop;
                this[i].style.top = y + "px";   
            }
        }
            
        return this;
    }
    x(value?:number):any{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return this.abs().x;
        let x = parseFloat(value as any) ;
        let pos = new Pointer(x,undefined);
        for(let i=0,j=this.length;i<j;i++) this.abs(pos);
        return this;
    }

    y(value?:number):any{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return this.abs().x;
        let y = parseFloat(value as any) ;
        let pos = new Pointer(undefined,y);
        for(let i=0,j=this.length;i<j;i++) this.abs(pos);
        return this;
    }

    
    
    

    prop(name:string|{[name:string]:any},value?:any):any{
        if(value===undefined){
            if(typeof name==="string"){
                return this.length?this[0][name as string]:undefined;
            }else {
                for(let i=0,j=this.length;i<j;i++)
                    for(const n in name) this[i][n] = name[n];
                return this;
            }
        }else {
            if(this.length)
                for(let i=0,j=this.length;i<j;i++)(this[i] as any)[name as string] = value;
            return this;
        }
    }
    
    attr(name:string|{[name:string]:string},value?:string):Dom|string{
        if(value===undefined){
            if(typeof name==="string"){
                return this.length?this[0].getAttribute(name):undefined;
            }else {
                for(let i=0,j=this.length;i<j;i++)
                    for(const n in name) this[i].setAttribute(n,name[n]);
                return this;
            }
        }else {
            if(this.length){
                if(value===null) for(let i=0,j=this.length;i<j;i++)this[i].removeAttribute(name as string);
                else for(let i=0,j=this.length;i<j;i++)this[i].setAttribute(name as string,value);
            }
            return this;
        }
    }

    style(name:string|{[name:string]:string},value?:string):string|Dom{
        if(value===undefined){
            if(typeof name==="string"){
                return this.length?style(this[0],name):undefined;
            }else {
                for(let i=0,j=this.length;i<j;i++)
                    for(const n in name) style(this[i],n,name[n]);
                return this;
            }
        }else {
            if(this.length){
                for(let i=0,j=this.length;i<j;i++)style(this[i],name as string, value);
            }
            return this;
        }
        
    }
    hasClass(cls:string){
        return this.length?findClassAt(this[0].className,cls)>=0:false;
    }
    addClass(cls:string):Dom{
        for(let i=0,j=this.length;i<j;i++){
            if(findClassAt(this[i].className,cls)>=0) return this;
            this[i].className+= " " + cls;
        }
        return this;
    }
    removeClass(cls:string):Dom{
        for(let i=0,j=this.length;i<j;i++){
            let clsnames = this[i].className;
            let at = findClassAt(clsnames,cls);
            if(at<=0) return this;
            let prev = clsnames.substring(0,at);
            let next =clsnames.substr(at+cls.length);
            this[i].className= prev.replace(/(\s+$)/g,"") +" "+ next.replace(/(^\s+)/g,"");
        }
        
        return this;
    }
    replaceClass(old_cls:string,new_cls:string,alwaysAdd?:boolean):Dom{
        for(let i=0,j=this.length;i<j;i++){
            let clsnames = this[i].className;
            let at = findClassAt(clsnames,old_cls);
            if(at<=0) {
                if(alwaysAdd) this[0].className = clsnames + " " + new_cls;
                return this;
            }
            let prev = clsnames.substring(0,at);
            let next =clsnames.substr(at+old_cls.length);
            this[i].className= prev +new_cls+ next;
        }
        
        return this;
    }   
    

    on(eventId:string,listener:any):Dom{
        for(let i=0,j=this.length;i<j;i++) attach(this[i],eventId,listener);
        return this;
    }
    off(eventId:string,listener:any):Dom{
        for(let i=0,j=this.length;i<j;i++) detech(this[i],eventId,listener);
        return this;
    }
    
    prev(inserted?:any):Dom{
        throw new Error("Called on placehold method");
    }
    next(inserted?:any):Dom{
        throw new Error("Called on placehold method");
    }
    first(inserted?:any):Dom{
        throw new Error("Called on placehold method");
    }
    last(inserted?:any):Dom{
        throw new Error("Called on placehold method");
    }
    
    append(inserted:any):Dom{
        throw new Error("Called on placehold method");
    }
    remove():Dom{
        for(let i=0,j=this.length;i<j;i++) {
            let elem = this[i];
            if(elem.parentNode) elem.parentNode.removeChild(elem);
        }
        return this;
    }

    static token :string = "$_YADOMINST";

    static prop<T>(prop_name:string,getter:(elem:HTMLElement)=>T,setter:(elem:HTMLElement,value:T)=>any):IDomBuilder{
        
        Dom.prototype[prop_name] = function(value?:any) {
            if(!this.length) return value===undefined?undefined:this;
            if(value===undefined) return getter.call(this,this[0]);
            for(let i =0,j=this.length;i<j;i++){
                let elem = this[i];
                setter.call(this,elem,value);
            }
            return this;
        }
        return Dom;
    }
    static object<T>(object_name:string,getter:(elem:HTMLElement,name:string)=>T,setter:(elem:HTMLElement,name:string,value:T)=>Dom):IDomBuilder{
        Dom.prototype[object_name] = function(name:string|{[index:string]:T},value?:any) {
            if(!this.length) return value===undefined?undefined:this;
            if(value===undefined){
                if(typeof name==="string") return getter.call(this,this[0],name);
                for(const n in name){
                    let val = name[n];
                    for(let i =0,j=this.length;i<j;i++){
                        let elem = this[i];
                        setter.call(this,elem,name,val);
                    }
                }
                return this;
            } 
            for(let i =0,j=this.length;i<j;i++){
                let elem = this[i];
                setter.call(this,elem,name,value);
            }
            return this;
        }
        return Dom;
    }
    

    static op(op_name:string,method:Function):IDomBuilder{
        Dom.prototype[op_name] = function(arg1,arg2,arg3,arg4){
            for(let i =0,j=this.length;i<j;i++){
                let dom = this[i];
                dom[op_name].call(dom,arg1,arg2,arg3,arg4);
            }
            return this;
        }
        return Dom;
    }

    static element(name:string,getter:(targetElement:HTMLElement)=>HTMLElement,setter:(targetElement:HTMLElement,opElement:HTMLElement)=>any){
        Dom.prototype[name] =function (inserted?:any) {
            
            if(inserted===undefined) return getter?new Dom(getter.call(this,this[0])):this;

            if(Host.isElement(inserted)) {
                setter.call(this,this[0],inserted);
                return this;
            }
            if(typeof inserted==="string"){
                
                inserted = dom(inserted);
            }
            if(inserted instanceof Dom) {
                for(let i = 0,j=this.length;i<j;i++){
                    let self = this[i];
                    for(let m = 0,n=inserted.length;m<n;m++){
                        setter.call(this,self,inserted[m]);
                    }
                }
                return this;
            }
            console.warn("Dom."+name + "不支持该参数，未做任何操作:",inserted);
            return this;
        }
        return Dom;
    }

    static define(name:string,fn:Function):IDomBuilder{
        Dom.prototype[name] =fn;
        return Dom;
    }
}

export interface IDomBuilder{
    define(name:string,fn:Function):IDomBuilder;
    prop<T>(prop_name:string,getter:(elem:HTMLElement)=>T,setter:(elem:HTMLElement,value:T)=>any):IDomBuilder;
    object<T>(object_name:string,getter:(elem:HTMLElement,name:string)=>T,setter:(elem:HTMLElement,name:string,value:T)=>Dom):IDomBuilder;
    op(op_name:string,method:Function):IDomBuilder;
}

function value(elem:HTMLElement,value?:any):any{
    if((elem as any).$_YA_valAccessorFn) return (elem as any).$_YA_valAccessorFn;
    let tag = elem.tagName;
    let fn:Function;
    if(tag==="INPUT"){
        let type = (elem as HTMLInputElement).type;
        if(type==="radio"){
            fn =radioValFn;
        }else if(type==="checkbox"){
            fn = checkboxValFn; 
        }else {
            fn = valFn;
        }
    }else if(tag==="SELECT"){
        fn = selectValFn;
    }else if(tag==="TEXTAREA"){
        fn = valFn;
    }else {
        fn = txtValFn;
    }
    Object.defineProperty(elem,"$_YA_valAccessorFn",{
        enumerable:false,writable:false,configurable:false,value:fn
    });
    return fn.call(this,value);
}

function valFn(elem:HTMLInputElement,value?:any):any{
    if(value===undefined) return elem.value;
    elem.value = value;
    return this;
}

function radioValFn(elem:HTMLInputElement,value?:any) {
    if(value===undefined){
        return elem.checked?elem.value:null;
    }
    if(value===elem.value) {
        elem.checked=true;elem.setAttribute("checked","checked");
    }else {
        elem.checked=false;elem.removeAttribute("checked");
    }
    return this;
}
function checkboxValFn(elem:HTMLInputElement,value?:any) {
    if(value===undefined){
        return elem.checked?elem.value:null;
    }
    if(value===elem.value|| YA.array_index(value,elem.value)) {
        elem.checked=true;elem.setAttribute("checked","checked");
    }else {
        elem.checked=false;elem.removeAttribute("checked");
    }
    return this;
}
function selectValFn (elem:HTMLSelectElement,value?:any) :any{
    let isMulti = elem.multiple;
    let opts :any= elem.options;
    if(value===undefined) {
        if(isMulti){
            let rs = [];
            for(let opt of opts ){
                if(opt.selected) rs.push(opt.value);
            }
            return rs;
        }else {
            let index = this[0].selectedIndex;
            let selectedOpt = this[0].options[index];
            return selectedOpt?selectedOpt.value:undefined;
        }
        
    }
    let selectedIndex = -1;
    for(let idx in opts){
        let opt = opts[idx] as HTMLOptionElement;
        
        if(opt.value==value ||(isMulti && YA.array_index(value,opt.value))){
            opt.selected=true;
            opt.setAttribute("selected","selected");
            selectedIndex=idx as any;
        }else {
            opt.selected =false;
            opt.removeAttribute("selected");
        }
    }
    if(!isMulti) elem.selectedIndex = selectedIndex;
    return this;
}
function txtValFn(value?:any) :any{
    if(value===undefined) return this[0].nodeValue;
    this[0].nodeValue= value;return this;
}



Dom.element("before",(target)=>target.previousSibling as HTMLElement,(target,opEl)=>target.parentNode?target.parentNode.insertBefore(opEl,target):undefined);
Dom.element("after",(target)=>target.nextSibling as HTMLElement,(target,opEl)=>{
    if(target.parentNode) target.nextSibling?target.parentNode.insertBefore(opEl,target.nextSibling):target.parentNode.appendChild(opEl);
});
Dom.element("first",(target)=>target.firstChild as HTMLElement,(target,opEl)=>target.firstChild?target.insertBefore(opEl,target.firstChild):target.appendChild(opEl));
Dom.element("last",(target)=>target.lastChild as HTMLElement,(target,opEl)=>target.appendChild(opEl));
Dom.element("append",null,(target,opEl)=>target.appendChild(opEl));

let element_wrapper:HTMLElement = YA.Host.document.createElement("div");

let attach:(elem:HTMLElement,eventId:string,listener:any)=>any;
let detech:(elem:HTMLElement,eventId:string,listener:any)=>any;
if(element_wrapper.addEventListener){
    attach = function(elem:HTMLElement,eventId:string,listener:any){ elem.addEventListener(eventId,listener,false);return this;};
    detech =  function(elem:HTMLElement,eventId:string,listener:any){elem.removeEventListener(eventId,listener,false);return this;};
}else if((element_wrapper as any).attachEvent){
    attach = function(elem:HTMLElement,eventId:string,listener:any) { (elem as any).attachEvent('on'+eventId,listener);return this;};
    detech =  function(elem:HTMLElement,eventId:string,listener:any) { (elem as any).detechEvent('on'+eventId,listener);return this;};
}


export let style :(obj:HTMLElement,attr:string,value?:any)=>any;
if((element_wrapper as any).currentStyle){
    style = (obj:HTMLElement,attr:string,value?:any):any=>{
        if(value===undefined) return (obj as any).currentStyle[attr];
        let convertor = styleConvertors[attr];
        obj.style[attr] = convertor?convertor(value):value;
    }
}else {
    style = (obj:HTMLElement,attr:string,value?:any):any=>{
        if(value===undefined) {
            let f:any = false;
            return getComputedStyle(obj,f)[attr];
        }
        let convertor = styleConvertors[attr];
        obj.style[attr] = convertor?convertor(value):value;
        
    };
}

let styleConvertors = YA.styleConvertors;
if(!styleConvertors) styleConvertors= (YA as any).styleConvertors = {};


export function dom(element:any):Dom {
    if(element instanceof Dom) return element;
    return new Dom(dom);
}



let emptyStringRegx = /\s+/g;
function findClassAt(clsnames:string,cls:string):number{
    let at = clsnames.indexOf(cls);
    let len = cls.length;
    while(at>=0){
        if(at>0){
            let prev = clsnames[at-1];
            if(!emptyStringRegx.test(prev)){at = clsnames.indexOf(cls,at+len);continue;}
        }
        if((at+len)!==clsnames.length){
            let next = clsnames[at+length];
            if(!emptyStringRegx.test(next)){at = clsnames.indexOf(cls,at+len);continue;}
        }
        return at;
    }
    return at;
}





styleConvertors.left = styleConvertors.right =styleConvertors.top=styleConvertors.bottom
=styleConvertors.width = styleConvertors.height = (val:any):any=>{
    if(val && val.substr) return val;
    else parseFloat(val) + "px";
}







export interface IMaskOpts{
    off?:boolean;
    content?:any;
    keep?:number|string;
    css?:string;
}



export class Mask{
    opts:IMaskOpts;
    dom:Dom;
    frontDom:Dom;
    bgDom:Dom;
    target:Dom;
    tick:any;
    adjust:Function;
    constructor(target:HTMLElement){
        this.target = dom(target);
        this.target.prop(Mask.token,this);
        let dm = this.dom = dom(`<div style="position:absolute;margin:0;padding:0;" class="mask">
    <div class="mask-backend" style="position:absolute;margin:0;padding:0;left:0,top:0,width:100%;overflow:hidden"></div>
    <div class="mask-front" style="position:absolute;margin:0;padding:0;overflow:auto;"></div>
</div>`);
        this.frontDom= dm.last();
        this.bgDom = dm.first();
        
    }
    mask(opts?:IMaskOpts){
        if(opts===undefined||opts===null)(opts=this.opts);
        if(opts===false || (opts && opts.off)) this.unmask();
        if(!opts){
            opts = this.opts;
            if(!opts) opts = this.opts={
                content:""
            };
        }
        
        if(this.adjust){ dom(Host.window).off("resize",this.adjust);}
        if(this.tick) {clearInterval(this.tick);this.tick=0;}
        this.frontDom.html("");

        this.target.prev(this.dom);

        if(opts.css)this.dom.addClass(opts.css);
        this.frontDom.append(dom(opts.content||""));
        
        this.adjust = ()=>{
            let size = this.adjustBackend();
            this.adjustFront(size,opts.keep);
        };
        this.adjust();
        
        this.tick = setInterval(this.adjust,80);
        dom(Host.window).on("resize",this.adjust);
        //Host.insertBefore(this.target.parentNode,this.maskElement,this.target);
    }
    unmask(){
        if(this.adjust){ dom(Host.window).off("resize",this.adjust);}
        if(this.tick) {clearInterval(this.tick);this.tick=0;}
        this.dom.remove();
    }
    adjustFront(size:Size,keep){
        let fSize = this.frontDom.size() as Size;
        if(fSize.equal(size)) return;
        if(fSize.w>size.w) fSize.w = size.w;
        if(fSize.h>size.h) fSize.h = size.h;
        let x=(size.w-fSize.w)/2;
        let fpos:Pointer;
        if(!keep || keep ==="center"){
            fpos = new Pointer(x, (size.h - fSize.h)/2);
        }else {
            let y;
            if(fSize.h!=size.h){
                let t = typeof keep;
                if(t==="string"){
                    let pct = YA.percent(keep);
                    if(pct!==undefined){
                        y= size.h * pct;
                    }else y = parseFloat(keep);
                }else if(t==="number"){
                    y= keep as number;
                }else y=0;
                if(y+fSize.h>size.h) y=0;
            }else{
                y=0;
            }
            fpos = new Pointer(x,y);
        }
        
        this.frontDom.size(fSize);
        this.frontDom.pos(fpos);
    }
    adjustBackend(){
        let size = this.target.size() as Size;
        this.dom.size(size);
        this.bgDom.size(size);
        let tpos = this.target.pos() as Pointer;
        this.dom.pos(tpos);
        return size;
    }
    static token:string = "$_YA_Mask";
}
export function mask(target:HTMLElement,opts:IMaskOpts|boolean) {
    let inst = target[Mask.token];
    if(!inst){
        if(opts===false) return;
        inst = target[Mask.token] = new Mask(target);
    }
    inst.mask(opts);
}
Dom.define("mask",function(opts:IMaskOpts|boolean) {
    for(let i=0,j=this.length;i<j;i++){
        mask(this[i],opts);
    }
});
YA.attrBinders.mask = function (elem:any,bindValue:any,component:YA.IComponent,vnode:YA.VirtualNode) {
    if(bindValue instanceof YA.ObservableSchema){
        let ob = bindValue.$getFromRoot(component);
        let val = ob.$get();
        mask(elem,val);
        ob.$subscribe((e)=>{
            mask(elem,e.value);
        });
    }else {
        mask(elem,bindValue);
    }
}




export class Size{
    w:number;
    h:number;
    constructor(w:any,h:any){
        this.w = w===undefined?undefined:parseFloat(w) ;
        this.h =h===undefined?undefined: parseFloat(h) ;
    }
    get width(){return this.w;}
    set width(w:any){
        this.w =parseFloat(w);
    }
    get height(){return this.h;}
    set height(h:any){
        this.h =parseFloat(h) ;
    }
    equal(size:Size):boolean{
        return size?this.w==size.w && this.h== size.h:false;
    }
}
export class Pointer{
    x:number;
    y:number;
    constructor(x:any,y:any){
        this.x =x===undefined?undefined: parseFloat(x) ;
        this.y =y===undefined?undefined: parseFloat(y) ;
    }
    
    equal(p:Pointer):boolean{
        return p?this.x==p.x && this.y== p.y:false;
    }
}