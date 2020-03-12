import * as YA from "YA.core";

let Host = YA.DomUtility;
export interface IDom{
    [index:number]:HTMLElement;
    length:number;
    item(index:number):IDom;
    html(val?:string):IDom|string;
    text(val?:string):IDom|string;
    val(val?:any):any;
    width(value?:number):any;
    height(value?:number):any;
    size(size?:Size):IDom|Size;
    left(value?:number):IDom|number;
    top(value?:number):IDom|number;
    pos(pos?:Pointer):Pointer|IDom;
    abs(new_pos?:Pointer):Pointer|IDom;
    x(value?:number):IDom|number;
    y(value?:number):IDom|number;
    prop(name:string|{[name:string]:any},value?:any,replace?:(newValue,oldValue)=>any):any;
    attr(name:string|{[name:string]:string},value?:string):IDom|string;
    style(name:string|{[name:string]:string},value?:string):string|IDom;
    hasClass(cls:string):boolean;
    addClass(cls:string):IDom;
    removeClass(cls:string):IDom;
    replaceClass(old_cls:string,new_cls:string,alwaysAdd?:boolean):IDom;
    on(eventId:string,listener:any):IDom;
    off(eventId:string,listener:any):IDom;
    ydata(name?:any,value?:any):any;
    prev(inserted?:any):IDom;
    next(inserted?:any):IDom;
    first(inserted?:any):IDom;
    last(inserted?:any):IDom;
    parent(inserted?:any):IDom;
    append(inserted?:any):IDom;
    remove():IDom;
    children():IDom;
    each(callback:(item:Dom,index:number)=>any):IDom;
}

export class Dom  {
    length:number;
    [index:number]:HTMLElement;
    constructor(element?:any){
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
                let elem = (Host.document as any).getElementById(str.substr(1));
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
                handleItem(item);
            }
        }

        let count = 0;
        if(Host.isElement(element,true)){
            Object.defineProperty(this,0 as any,{enumerable:true,writable:false,configurable:false,value:element});
            count++;
        }else {
            handleItem(element);
        }
        Object.defineProperty(this,"length",{enumerable:true,writable:false,configurable:false,value:count});
    }

    item(index:number):Dom{
        let elem = this[index];
        let inst = (elem as any)[Dom.dom_inst_token];
        if(!inst){
            return new Dom(elem);
        }
        return inst;
    }
    
    html(val?:string):any { //Dom|string{
        if(!this.length) return val===undefined?undefined:this;
        if(val===undefined) return this[0].innerHTML;
        for(let i=0,j=this.length;i<j;i++)this[i].innerHTML = val;
        return this;
    }
    
    text(val?:string):any{ //Dom|string{
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

    size(size?:Size):any { //IDom|Size{
        if(!this.length) return size===undefined?undefined:this;
        if(size===undefined) return new Size(this[0].offsetWidth,this[0].offsetHeight);
        let h = size.h===undefined?undefined:(parseFloat(size.h as any)|0) + "px";
        let w =  size.w===undefined?undefined:parseFloat(size.w as any) + "px";
        for(let i=0,j=this.length;i<j;i++) {
            let elem = this[i];
            if(h!==undefined) elem.style.height = h;
            if(w!==undefined) elem.style.width = w;
        }
        return this;
    }


    left(value?:number):any { //IDom|number{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return this[0].offsetLeft;
        let left = (parseFloat(value as any)|0) + "px";
        for(let i=0,j=this.length;i<j;i++) this[i].style.left = left;
        return this;
    }

    top(value?:number):any { //IDom|number{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return this[0].offsetTop;
        let top = (parseFloat(value as any)|0) + "px";
        for(let i=0,j=this.length;i<j;i++) this[i].style.top = top;
        return this;
    }
    pos(pos?:Pointer):any { //Pointer|IDom{
        if(!this.length) return pos===undefined?undefined:this;
        if(pos===undefined) return new Pointer(this[0].offsetLeft,this[0].offsetTop);
        let x = pos.x===undefined?undefined:(parseFloat(pos.x as any)|0) + "px";
        let y = pos.y===undefined?undefined:(parseFloat(pos.y as any)|0) + "px";
        for(let i=0,j=this.length;i<j;i++){
            if(x!==undefined){
                this[i].style.left = x ;
            }
            if(y!==undefined){
                this[i].style.top = y ;   
            }
        }
        return this;
    }

    abs(new_pos?:Pointer):any { //Pointer|IDom{
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
    x(value?:number):any {//IDom|number{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return (this.abs() as Pointer).x;
        let x = parseFloat(value as any) ;
        let pos = new Pointer(x,undefined);
        for(let i=0,j=this.length;i<j;i++) this.abs(pos);
        return this;
    }

    y(value?:number):any { //IDom|number{
        if(!this.length) return value===undefined?undefined:this;
        if(value===undefined) return (this.abs() as Pointer).x;
        let y = parseFloat(value as any) ;
        let pos = new Pointer(undefined,y);
        for(let i=0,j=this.length;i<j;i++) this.abs(pos);
        return this;
    }

    
    
    

    prop(name:string|{[name:string]:any},value?:any,replace?:(newValue,oldValue)=>any):any{
        if(value===undefined){
            if(typeof name==="string"){
                return this.length?this[0][name as string]:undefined;
            }else {
                for(let i=0,j=this.length;i<j;i++){
                    let elem = this[i];
                    for(const n in name) elem[n] = name[n];
                }   
                return this;
            }
        }else {
            if(this.length)
                for(let i=0,j=this.length;i<j;i++){
                    let elem = this[i];
                    elem[name as string] = replace?replace.call(elem,value,elem[name as string],elem):value;
                }
            return this;
        }
    }
    
    attr(name:string|{[name:string]:string},value?:string):any { //IDom|string{
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

    style(name:string|{[name:string]:string},value?:string|number):any { //string|IDom{
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
    hasClass(cls:string):boolean{
        return this.length?findClassAt(this[0].className,cls)>=0:false;
    }
    addClass(cls:string):Dom { //IDom{
        for(let i=0,j=this.length;i<j;i++){
            if(findClassAt(this[i].className,cls)>=0) return this;
            this[i].className+= " " + cls;
        }
        return this;
    }
    removeClass(cls:string):Dom { //IDom{
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
    replaceClass(old_cls:string,new_cls:string,alwaysAdd?:boolean):Dom { //IDom{
        if((old_cls==="" || old_cls===undefined || old_cls===null) && alwaysAdd) return this.addClass(new_cls);
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
    

    on(eventId:string,listener:any):Dom { //IDom{
        for(let i=0,j=this.length;i<j;i++) attach(this[i],eventId,listener);
        return this;
    }
    off(eventId:string,listener:any):Dom { //IDom{
        for(let i=0,j=this.length;i<j;i++) detech(this[i],eventId,listener);
        return this;
    }

    ydata(name?:any,value?:any):any{
        throw new Error("Called on placehold method");
    }
    
    prev(inserted?:any):IDom{
        throw new Error("Called on placehold method");
    }
    next(inserted?:any):Dom { //IDom{
        throw new Error("Called on placehold method");
    }
    first(inserted?:any):Dom { //IDom{
        throw new Error("Called on placehold method");
    }
    last(inserted?:any):Dom { //IDom{
        throw new Error("Called on placehold method");
    }
    parent(inserted?:any):Dom { //IDom{
        throw new Error("Called on placehold method");
    }
    append(inserted:any):Dom { //IDom{
        throw new Error("Called on placehold method");
    }
    remove():Dom { //IDom{
        for(let i=0,j=this.length;i<j;i++) {
            let elem = this[i];
            if(elem.parentNode) elem.parentNode.removeChild(elem);
        }
        return this;
    }
    children():Dom { //IDom{
        let elem = this[0];
        if(elem.hasChildNodes)return new Dom(elem.childNodes);
        else return new Dom();
    }

    each(callback:(item:Dom,index:number)=>any):Dom { //IDom{
        for(let i =0,j=this.length;i<j;i++){
            if(callback(dom(this[i]),i)===false) return this;
        }
        return this;
    }

    static dom_inst_token :string = "_YADOM_INSTANCE";
    static dom_data_token:string = "_YADATA";

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

    static element(name:string,getter:(targetElement:HTMLElement,onlyElement?:boolean)=>HTMLElement,setter:(targetElement:HTMLElement,opElement:HTMLElement)=>any){
        Dom.prototype[name] =function (inserted?:any) {
            
            if(inserted===undefined) return getter?new Dom(getter.call(this,this[0])):this;
            if(inserted===true||inserted===false) return getter?new Dom(getter.call(this,this[0],inserted)):this;
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
    return fn.call(this,elem,value);
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



Dom.element("prev"
    ,(target,onlyElement)=>(onlyElement?target.previousElementSibling:target.previousSibling) as HTMLElement
    ,(target,opEl)=>target.parentNode?target.parentNode.insertBefore(opEl,target):undefined
);
Dom.element("next"
    ,(target,onlyElement)=>(onlyElement?target.nextElementSibling:target.nextSibling) as HTMLElement
    ,(target,opEl)=>{
    if(target.parentNode) target.nextSibling?target.parentNode.insertBefore(opEl,target.nextSibling):target.parentNode.appendChild(opEl);}
);
Dom.element("first"
    ,(target,onlyElement:boolean)=>(onlyElement?target.firstElementChild:target.firstChild) as HTMLElement
    ,(target,opEl)=>target.firstChild?target.insertBefore(opEl,target.firstChild):target.appendChild(opEl)
);
Dom.element("last"
    ,(target,onlyElement)=>(onlyElement?target.lastElementChild:target.lastChild) as HTMLElement
    ,(target,opEl)=>target.appendChild(opEl)
);
Dom.element("parent"
    ,(target,onlyElement)=>(target.parentNode) as HTMLElement
    ,(target,opEl)=>opEl.appendChild(target)
);
Dom.object("ydata",(elem:any,name:string)=>{
    let data= elem[Dom.dom_data_token];
    if(!data) return undefined;
    return data[name];
},function(elem,name,value):Dom{
    let data= elem[Dom.dom_data_token];
    if(!data) Object.defineProperty(elem,Dom.dom_data_token,{enumerable:false,writable:false,configurable:false,value:data={}});
    data[name] = value;
    return this;
});

Dom.element("append",null,(target,opEl)=>target.appendChild(opEl));

let element_wrapper:HTMLElement = YA.DomUtility.document.createElement("div") as any;

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
    return new Dom(element);
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

YA.attrBinders["b-value"] = function (elem:any,bindValue:any,component:YA.IComponent,vnode:YA.VirtualNode) {
    let dm = dom(elem);
    if(bindValue instanceof YA.ObservableSchema){
        let ob = bindValue.getFromRoot(component) as YA.IObservable<any>;
        
        dm.val(ob.get(YA.ObservableModes.Value));
        ob.subscribe("",(e)=>dm.val(e.value),component);
    }else {
        dm.val(bindValue);
    }
}
YA.attrBinders["value"] = function (elem:any,bindValue:any,component:YA.IComponent,vnode:YA.VirtualNode) {
    let dm = dom(elem);
    if(bindValue instanceof YA.ObservableSchema){
        let ob = bindValue.getFromRoot(component) as YA.IObservable<any>;
        dm.val(ob.get());
    }else {
        dm.val(bindValue);
    }
}





export interface IMaskOpts{
    off?:boolean;
    content?:any;
    keep?:number|string;
    css?:string;
}



export class Maskable{
    opts:IMaskOpts;
    dom:Dom;
    frontDom:Dom;
    bgDom:Dom;
    target:Dom;
    tick:any;
    adjust:Function;
    _userSelectValue:any;
    _onselectHandler:any;
    constructor(target:HTMLElement){
        this.target = dom(target);
        let inst = this.target.ydata(Maskable.dom_inst_token) as Maskable;
        if(inst) inst.unmask();
        this.target.ydata(Maskable.dom_inst_token,this);
        let dm = this.dom = dom(`<div style="position:absolute;margin:0;padding:0;" class="ya-mask">
    <div class="ya-mask-backend" style="position:absolute;margin:0;padding:0;left:0,top:0,width:100%;overflow:hidden"></div>
    <div class="ya-mask-front" style="position:absolute;margin:0;overflow:auto;"></div>
</div>`);
        this.frontDom= dm.last(true);
        this.bgDom = dm.first(true);
        
    }
    mask(opts?:IMaskOpts|string|boolean):Maskable{
        if(opts===undefined||opts===null)(opts=this.opts);
        if(opts===false || (opts && (opts as IMaskOpts).off)) return this.unmask();
        if(typeof opts==="string"){
           opts = {content :opts};
        }
        opts = YA.extend({},this.opts,opts); 

        if(this.adjust){ dom(Host.window).off("resize",this.adjust);}
        if(this.tick) {clearInterval(this.tick);this.tick=0;}
        this.frontDom.html("");

        if((opts as IMaskOpts).css)this.dom.replaceClass(this.opts?this.opts.css:undefined,(opts as IMaskOpts).css,true);
        this.frontDom.append(dom((opts as IMaskOpts).content||""));
        
        this.target.prev(this.dom);
        this.adjust = ()=>{
            let size = this.adjustBackend();
            this.adjustFront(size,(opts as IMaskOpts).keep);
        };
        this.adjust();
        this._userSelectValue = this.target.style("userSelect");
        this.target.style("userSelect","none");
        this._onselectHandler =this.target.prop("onselectstart");

        let zIndex = parseInt(this.target.style("zIndex")) || 0;
        this.dom.style("zIndex",zIndex);
        this.bgDom.style("zIndex",++zIndex);
        this.frontDom.style("zIndex",++zIndex);
        
        this.tick = setInterval(this.adjust,80);
        dom(Host.window).on("resize",this.adjust);
        return this;
    }
    unmask():Maskable{
        if(this.adjust){ dom(Host.window).off("resize",this.adjust);}
        if(this.tick) {clearInterval(this.tick);this.tick=0;}
        this.target.style("userSelect",this._userSelectValue);
        this.target.prop("onselectstart",this._onselectHandler);
        this.dom.remove();
        return this;
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
                    let pct = YA.is_percent(keep);
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
    static dom_inst_token:string = "_YA_MASKABLE_INSTANCE";
}
export function mask(target:HTMLElement,opts:IMaskOpts|boolean|string) {
    let inst = target[Maskable.dom_inst_token];
    if(!inst){
        if(opts===false) return;
        inst = target[Maskable.dom_inst_token] = new Maskable(target);
    }
    inst.mask(opts);
}

Dom.define("mask",function(opts:IMaskOpts|boolean|string) {
    for(let i=0,j=this.length;i<j;i++){
        mask(this[i],opts);
    }
});

YA.attrBinders.mask = function (elem:any,bindValue:any,component:YA.IComponent,vnode:YA.VirtualNode) {
    if(bindValue instanceof YA.ObservableSchema){
        let ob = bindValue.getFromRoot(component);
        let val = ob.$get(YA.ObservableModes.Value);
        mask(elem,val);
        ob.$subscribe("",(e)=>{
            mask(elem,e.value);
        },component);
    }else {
        mask(elem,bindValue);
    }
}

export class Dragable{
    target:Dom;
    handle:Dom;
    cid:number;
    handle_tid:string;
    private _msPos:Pointer;
    private _targetPos:Pointer;
    private _positionValue:string;

    static dom_inst_token = "YA_MOVEABLE_INSTANCE";
    
    constructor(target:any){
        this.target = dom(target);
        if(this.target.ydata(Dragable.dom_inst_token)) throw new Error("已经在上面创建了Dragable实例");
        this.cid = YA.new_cid();
        this.target.ydata(Dragable.dom_inst_token,this);
        let mvStart= this._moveStart;
        this._moveStart = (evt)=>mvStart.call(this,evt);
    }
    enable(handle?:any):Dragable{
        if(handle===false){
            this.handle?.off("mousedown",this._moveStart);
            if(this._positionValue!==undefined)this.target.style("position",this._positionValue);
            return this;
        }
        if(!this.handle){
            this.handle = (handle instanceof Dom)?handle:Host.isElement(handle)?dom(handle):this.target; 
        }
        this.handle.on("mousedown",(evt)=>this._moveStart(evt));
        return this;
    }
    _moveStart(evt:MouseEvent){
        let x = evt.clientX;
        let y = evt.clientY;
        this._targetPos =  this.target.pos() as Pointer;
        this._msPos = new Pointer(x,y);
        this._positionValue = this.target.style("position") as string;
        
        let doc:HTMLDocument = Host.document as any;
        let msk = dom(`<div style='position:absolute;top:0;height:0;background-color:#fff;z-index:999999999;opacity:0.1;user-select:none;margin:0;padding:0;' onselectstart="return false;"></div>`)
            .width(Math.max(doc.body.offsetWidth,doc.documentElement.offsetWidth))
            .height(Math.max(doc.body.offsetHeight,doc.documentElement.offsetHeight))
            .parent(doc.body)
            .on("mousemove",(evt:MouseEvent)=>this._moving(evt))
            .on("mouseup",(evt)=>{
                this._moving(evt);
                msk.remove();msk=undefined;
                return cancelEvent(evt);
            }).on("mouseout",(evt)=>{
                this._moving(evt);
                msk.remove();msk=undefined;
            });
        return cancelEvent(evt);
    }
    _moving(evt:MouseEvent){
        let x = evt.clientX;
        let y = evt.clientY;
        let dx = x-this._msPos.x;
        let dy = y-this._msPos.y;
        this.target.left(this._targetPos.x+= dx);
        this.target.top(this._targetPos.y += dy);
        this._msPos.x = x;
        this._msPos.y = y;
        return cancelEvent(evt);
    }
}

Dom.define("dragable",function(handle?:boolean|HTMLElement|Dom|{(elem:any):any}) {
    this.each((item)=>{
        let inst = item.ydata(Dragable.dom_inst_token)?.enable(false);
    });
    if(handle!==false){
        if(typeof handle==="function"){
            this.each((item)=>{
                let inst = item.ydata(Dragable.dom_inst_token);
                if(!inst) inst =new Dragable(item);
                inst.enable(handle.call(item,item[0]));
            });
        }else {
            this.each((item)=>{
                let inst = item.ydata(Dragable.dom_inst_token);
                if(!inst) inst =new Dragable(item);
                inst.enable(handle);
            });
        }
    }
    return this;
});


export interface IMessageBoxOpts{
    title?:string;
    content:string;
    css?:string;
    btns:any[];

    dragable?:boolean;
}
export class MessageBox extends YA.Promise{
    box:Dom;
    front:Dom;
    backend:Dom;
    head:Dom;
    body:Dom;
    foot:Dom;
    caption:Dom;
    closer:Dom;
    private _resolve;
    constructor(public opts:IMessageBoxOpts){
        super((resolve)=>{
            this._resolve = resolve;
        });
        let adjBk = this._adjacentBackend;
        this._adjacentBackend = ()=>adjBk.call(this);
    }
    open(){
        let view = document.compatMode ==="CSS1Compat"?(Host.document as any).documentElement:(Host.document as any).body;
        this.box = dom(`<div class="ya-messageBox ${this.opts.css?this.opts.css:""}" style="position:fixed;top:0;left:0;widht:${view.clientWidth}px;height:${view.clientHeight}px;overflow:hidden;z-index:99999990;">
<div class="ya-messageBox-backend" style="position:fixed;top:0;left:0;width:${view.clientWidth}px;height:${view.clientHeight}px;overflow:hidden;z-index:99999991;"></div>
<div class="ya-messageBox-front" style="position:fixed;overflow:hidden;z-index:99999992;margin:0;padding:0;">
    <div class='ya-messageBox-head' style='position:relative;user-select:none;' onselectstart="return false;"><a class="ya-messageBox-closer" style="position:absolute;right:0;top:0;z-index:99999993;">X</a><div class='ya-messageBox-title'>&nbsp;${this.opts.title||"消息"}</div></div>
    <div class="ya-messageBox-body">${this.opts.content}</div>
    <div class="ya-messageBox-foot"></div>
</div>
</div>`);
        this.box.parent((Host.document as any).body);
        this.backend = this.box.first(true);
        this.front = this.box.last(true);
        this.head = this.front.first(true);
        this.body = this.head.next(true);
        this.foot = this.front.last(true);
        this.caption = this.head.last(true);
        this.closer = this.head.first(true)
        .on("mousedown",(e:MouseEvent)=>cancelEvent(e))
        .on("click",()=>this.close("close"));
        let btns = this.opts.btns || [{text:"确定",value:"comfirm"},{text:"取消",value:"cancel"}];
        for(const btnInfo of btns)((btnInfo)=>{
            if(!btnInfo) return;
            let btn = dom(`<a href="#">${btnInfo.text || btnInfo}</a>`)
                .on("click",(evt)=>{
                    this.close(btnInfo.value || btnInfo);
                    return cancelEvent(evt);})
                .parent(this.foot);
        })(btnInfo);
        this._center();
        if(this.opts.dragable){
            (this.front as any).dragable(this.caption);
            this.caption.style("cursor","move");
        }
        dom(window).on("resize",this._adjacentBackend);
        return this;
    }
    close(reason?:any):MessageBox{
        this.box.remove();
        dom(window).off("resize",this._adjacentBackend);
        this._resolve(reason);
        return this;
    }
    private _center(){
        let view = document.compatMode ==="CSS1Compat"?(Host.document as any).documentElement:(Host.document as any).body;
        this.front.left((view.clientWidth-this.front.width())/2).top((view.clientHeight-this.front.height())/2);
    }
    private _adjacentBackend(){
        let view = document.compatMode ==="CSS1Compat"?(Host.document as any).documentElement:(Host.document as any).body;
        let sz = dom(view).size();
        this.backend.size(sz);
    }
    
}

export function messageBox(msg:string|IMessageBoxOpts){
    return new MessageBox((typeof msg==="string"?{content:msg,dragable:true}:msg )as IMessageBoxOpts).open();
}
@YA.component("Button",false)
export class Button{
   
    onclick=null;
    @YA.reactive(YA.ReactiveTypes.In)
    text="";
    @YA.reactive(YA.ReactiveTypes.In)
    confirm=undefined;

    @YA.reactive(YA.ReactiveTypes.In)
    className=undefined;

    private _comfirmed:boolean;
    private _comfirmElem:Dom;


    render(p){
        return <button class="" onclick={this._onclick}>{this.text}</button>;
    }
    private _onclick(evt){
        if(this._comfirmed || !this.confirm){
            this._comfirmed=false;
            if(this.onclick){
                this.onclick(evt);
            } 
        }else {

        }
        return cancelEvent(evt);
    }
}

export function cancelEvent(evt:Event):boolean{
    evt||(evt===event);
    if(evt.preventDefault) evt.preventDefault();
    if(evt.stopPropagation) evt.stopPropagation();
    evt.cancelBubble = true;
    evt.returnValue = false;
    return false;
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