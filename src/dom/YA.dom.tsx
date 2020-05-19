import * as YA from "../YA.core";
let Observable = YA.Observable;
let isObservable = YA.Observable.isObservable;
let ObservableModes = YA.ObservableModes;
let observableMode = YA.observableMode;
let in_parameter = YA.in_parameter;
let out_parameter = YA.out_parameter;
let parameter = YA.parameter;

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
export interface IElement extends YA.IElement,HTMLElement{
    
}

export interface IElementUtility extends YA.IElementUtility{
    getStyle(node:IElement,name:string):string;
    setStyle(node:IElement,name:string|{[name:string]:any},value?:string|boolean):IElementUtility;
    hasClass(node:IElement,cls:string):boolean;
    addClass(node:IElement,cls:string):boolean;
    removeClass(node:IElement,cls:string):boolean;
    toggleClass(node:IElement,cls:string):boolean;
    replaceClass(node:IElement,oldCls:string,newCls:string,alwaysAdd?:boolean):boolean;
    getAbs(elem:IElement):Pointer;
    setAbs(elem:IElement,pos:Pointer):IElementUtility;
    htmlEncode(text:string):string;
    
}
export let ElementUtility:IElementUtility = YA.ElementUtility as any;
ElementUtility.htmlEncode = (text:string):string=>{
    if(text===undefined || text===null)return "";
    text = text.toString();
    return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\n/g,"<br />").replace(/ /g,"&nbsp;").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");
}

let getStyle:(elem:IElement,name:string)=>any;
let setStyle:(elem:IElement,name:string|{[name:string]:any},value:string|boolean)=>any;
try{
    let element_wrapper:HTMLElement =  ElementUtility.createElement("div") as any;

    if((element_wrapper as any).currentStyle){
        getStyle = ElementUtility.getStyle = (node,name)=> (node as any).currentStyle[name];
    }else {
        getStyle = ElementUtility.getStyle = (node,name)=>getComputedStyle(node as any,false as any)[name];
    }
    setStyle = ElementUtility.setStyle = (node:IElement,name:string|{[name:string]:any},value?:any):IElementUtility=>{
        if(value===undefined||value===true){
            for(let n in name as any){
                let convertor = styleConvertors[name as string];
                node.style[name as string] = convertor?convertor(value):value;
            }
        }else if(value===false){
            for(let n in name as any){
                node.style[n] = name[n];
            }
        }else {
            let convertor = styleConvertors[name as string];
            node.style[name as string] = convertor?convertor(value):value;
        }
        
        return ElementUtility;
    }
    ElementUtility.parse = (domString:string):YA.IElement[]=>{
        element_wrapper.innerHTML = domString;
        return element_wrapper.childNodes as any;
    }
}catch(ex){}



let emptyStringRegx = /\s+/;
function findClassAt(clsnames:string,cls:string):number{
    let at = clsnames.indexOf(cls);
    let len = cls.length;
    while(at>=0){
        if(at>0){
            let prev = clsnames[at-1];
            if(!emptyStringRegx.test(prev)){at = clsnames.indexOf(cls,at+len);continue;}
        }
        if((at+len)!==clsnames.length){
            let next = clsnames[at+len];
            if(!emptyStringRegx.test(next)){at = clsnames.indexOf(cls,at+len);continue;}
        }
        return at;
    }
    return at;
}

let hasClass= ElementUtility.hasClass=(node:IElement,cls:string):boolean=>{
    return findClassAt(node.className,cls)>=0;
}
let addClass= ElementUtility.addClass=(node:IElement,cls:string):boolean =>{ //IDom{
    if(cls===undefined || cls===null || cls==="" || !(cls = YA.trim(cls)))return false;
    if(findClassAt(node.className,cls)>=0) return false;
    node.className+= " " + cls;
    return true;
}
let removeClass= ElementUtility.removeClass = (node:IElement,cls:string):boolean => { //IDom{
    if(cls===undefined || cls===null || cls==="" || !(cls = YA.trim(cls)))return false;
    let clsnames = node.className;
    let at = findClassAt(clsnames,cls);
    if(at<=0) return false;
    let prev = clsnames.substring(0,at);
    let next =clsnames.substr(at+cls.length);
    node.className= prev.replace(/(\s+$)/g,"") +" "+ next.replace(/(^\s+)/g,"");
    return true;
}
let replaceClass=ElementUtility.replaceClass = (node:IElement,old_cls:string,new_cls:string,alwaysAdd?:boolean):boolean => { //IDom{
    if((old_cls==="" || old_cls===undefined || old_cls===null) && alwaysAdd) return addClass(node,new_cls);
    let clsnames = node.className;
    let at = findClassAt(clsnames,old_cls);
    if(at<=0) {
        if(alwaysAdd) node.className = clsnames + " " + new_cls;
        return true;
    }
    let prev = clsnames.substring(0,at);
    let next =clsnames.substr(at+old_cls.length);
    node.className= prev +new_cls+ next;
    
    return true;
}  
let toggleClass = ElementUtility.toggleClass = function(elem:IElement,cls:string):boolean{
    let at = findClassAt(elem.className,cls);
    if(at>=0){
        let prev = cls.substring(0,at);
        let next =cls.substr(at+cls.length);
        elem.className= prev.replace(/(\s+$)/g,"") +" "+ next.replace(/(^\s+)/g,"");
        return false;
    }else{
        elem.className += " " + cls;
        return true;
    }
}


let show = ElementUtility.show = (elem:IElement,immeditately?:boolean):IElementUtility=>{
    let value = (elem as any).$__displayValue__;
    if(!value||value=="none") value = "";
    (elem as any).style.display=value;
    return ElementUtility;
}
let hide = ElementUtility.hide = (elem:IElement,immeditately?:boolean):IElementUtility=>{
    let old = getStyle(elem,"display");
    if(old && old!=="none")(elem as any).$__displayValue__ = old;
    (elem as any).style.display="none";
    return ElementUtility;
};

let restoredDisplay=(elem:IElement,visible:boolean)=>{
    let curr = getStyle(elem,"display");
    let store = (elem as any).$__storedDisplay__;
    if(visible===false){
        if(store!==undefined) {
            elem.style.display =store;
            (elem as any).$__storedDisplay__=undefined;
        }else{
            elem.style.display = "none";
            (elem as any).$__storedDisplay__=curr;
        }
    }else{
        if(store!==undefined) {
            elem.style.display =store;
            (elem as any).$__storedDisplay__=undefined;
        }else{
            elem.style.display = "";
            (elem as any).$__storedDisplay__=curr;
        }
    }
}


let getAbs = ElementUtility.getAbs = function getAbs(elem:IElement){
    let p = elem as any as HTMLElement;
    if(!p) new Pointer(undefined,undefined);
    let x=0,y=0;
    while(p){
        x += p.offsetLeft;
        y+= p.offsetTop;
        p=p.offsetParent as any;
    }
    return new Pointer(x,y);
}

function setAbs(elem:IElement,new_pos:Pointer,old_pos?:Pointer){
    (elem as any as HTMLElement).style.position="absolute";
    if(!old_pos) old_pos = getAbs(elem);
    if(new_pos.x!==undefined){
        let x = new_pos.x - old_pos.x + (elem as any as HTMLElement).clientLeft;
        (elem as any as HTMLElement).style.left = x + "px";
    }
    if(new_pos.y!==undefined){
        let y = new_pos.y - old_pos.y + (elem as any as HTMLElement).clientTop;
        (elem as any as HTMLElement).style.top = y + "px";  
    }
    return ElementUtility;
}
ElementUtility.setAbs = setAbs;



export let styleConvertors :any= {};

let unitRegx = /(\d+(?:.\d+))(px|em|pt|in|cm|mm|pc|ch|vw|vh|\%)/g;
styleConvertors.left = styleConvertors.right = styleConvertors.top = styleConvertors.bottom = styleConvertors.width = styleConvertors.height = styleConvertors.minWidth = styleConvertors.maxWidth=styleConvertors.maxWidth= styleConvertors.maxHeight = function (value:any) {
    if(!value) return "0";
    if(typeof value==="number"){
        return value + "px";
    }else return value;
}



YA.attrBinders.style = function(elem:IElement,bindValue:any,vnode:YA.INodeDescriptor,compInstance:YA.IComponent){
    let t = typeof bindValue;
    if(t==="string") {elem.style.cssText = bindValue;}
    if(t!=="object"){
        console.warn("给style不正确的style值，忽略",bindValue,elem,vnode,compInstance);
        return;
    }
    
    if(isObservable(bindValue)){
        let value = bindValue.get(YA.ObservableModes.Value);
        if(typeof value==="string"){
            elem.style.cssText = bindValue;
        }else {
            for(var n in value) setStyle(elem,n,value[n]);
        }
        bindValue.subscribe((e)=>{
            let value = e.value;
            if(typeof value==="string"){
                elem.style.cssText = bindValue;
            }else {
                for(var n in value) setStyle(elem,n,value[n]);
            }
        },compInstance);
    }else {
        for(var n in bindValue)((value,name)=>{
            if(isObservable(value)){
                value.subscribe((e:YA.IChangeEventArgs<any>)=>{
                    setStyle(elem,name,e.value);
                },compInstance);
                setStyle(elem,name,value.get(YA.ObservableModes.Value));
            }else{
                setStyle(elem,name,value);
            }
            
        })(bindValue[n],n);
    }
}
YA.attrBinders.css = function(elem:IElement,bindValue:any,vnode:YA.INodeDescriptor,compInstance:YA.IComponent){
    let addCss =(elem,value)=>{
        if(typeof value==="string"){
            if(elem.className) elem.className += " " ;
            elem.className += YA.trim(value);
        }else {
            if(!value.join){
                console.warn("给class绑定的对象必须是string或array",value,compInstance);
                return;
            } 
            
            for(const cssValue of value){
                if(YA.is_array(cssValue))addCss(elem,cssValue);
                else {
                    if(elem.className) elem.className += " ";
                    elem.className += YA.trim(cssValue);
                }
            }
        }
    };
    let removeCss = (elem,value)=>{
        if(typeof value==="string"){
            removeClass(elem,value);
        }else {
            if(!value.join){
                console.warn("给class绑定的对象必须是string或array",value,compInstance);
                return;
            } 
            
            for(const cssValue of value){
                if(YA.is_array(cssValue))removeCss(elem,cssValue);
                else {
                    removeClass(elem,cssValue);
                }
            }
        }
    };
    let t = typeof bindValue;
    if(t==="string") {elem.className = bindValue;}
    
    if(YA.is_array(bindValue)){
        for(const css of bindValue)((value)=>{
            let cssText=bindValue;
            if(isObservable(value)){
                value.subscribe((e)=>{
                    if(e.old)removeCss(elem,e.old);
                    addCss(elem,e.value);
                },compInstance);
                cssText = value.get(ObservableModes.Value);
            }
            addCss(elem,cssText);
        })(css);
        return;
    }
    
    
    if(isObservable(bindValue)){
        let value = bindValue.get(YA.ObservableModes.Value);
        addCss(elem,value);
        bindValue.subscribe((e)=>{
            removeCss(elem,e.old);
            addCss(elem,e.value);
        },compInstance);
    }
    console.warn("css属性不支持的数据类型",bindValue);
}

//////////////////////////////////////////////////////////////////////////////
// Html控件
//////////////////////////////////////////////////////////////////////////////
function setElementInstance(elem:IElement,inst:any,token:string):boolean{
    if((elem as any)[token]) return false;
    Object.defineProperty(elem,Mask.InstanceToken,{enumerable:false,writable:false,configurable:false,value:inst});
    return true;
}
export interface IMaskOpts{
    content?:any;
    top?:number;
    autoCenter?:boolean;
    css?:string;
}
export class Mask implements IMaskOpts{
    static InstanceToken:string = "YA_MASK_INST";
    static Message:string = "请等待...";
    element:IElement;
    content?:string;
    autoCenter?:boolean;
    top?:number;
    css?:string;
    private __maskElement;
    private __backendElement;
    private __frontElement;
    private __centerTimer;
    private __liveCheckCount;

    constructor(elem:IElement){
        if(setElementInstance(elem,this,Mask.InstanceToken)){
            this.element = elem;
        }else throw new Error("已经有了控件实例");
        
    }
    mask(opts:IMaskOpts|string|boolean){
        if(opts===false) return this.unmask();
        else if(opts===true){
            opts = this;
        }else if(typeof opts==="string"){
            opts = {content:opts as string};
        }
        return this._init(opts);

    }
    private _init(opts:IMaskOpts):Mask{
        let elem = this._sureElements();
        this.__liveCheckCount = 0;
        if(opts.css){
            elem.className = "ya-mask " + opts.css;
            this.css = opts.css;
        } else elem.className = "ya-mask";
        let z = (parseInt(getStyle(elem,"zIndex"))||0)+1;
        setStyle(elem,"zIndex",z as any as string);
        ElementUtility.insertBefore(elem,this.element);
        if(opts.autoCenter!==undefined)this.autoCenter = opts.autoCenter;
        else this.autoCenter = true;
        let content = opts.content;
        if(content===undefined) content = Mask.Message;
        this.content = content;
        this.__frontElement.innerHTML = "";
        if(ElementUtility.isElement(content,true)){
            this.__frontElement.appendChild(content);
        }else this.__frontElement.innerHTML = content;

        if(this.top)this.top = opts.top;
        this._keepBackend();
        this._keepFront();
        if(this.__centerTimer) clearInterval(this.__centerTimer);
        if(this.autoCenter)this.__centerTimer = setInterval(()=>{
            if(this.__liveCheckCount===1000){
                if(!ElementUtility.is_inDocument(this.element)){
                    clearInterval(this.__centerTimer);this.__centerTimer=0;
                    return;
                }else this.__liveCheckCount=0;
            }
            this._keepBackend();
            if(this.autoCenter) this._keepFront();
            this.__liveCheckCount++;
        },50);

        return this;
    }
    private _sureElements():IElement{
        if(this.__maskElement)return this.__maskElement;
        let elem = ElementUtility.createElement("div") as IElement;
        //elem.className = "ya-mask";
        elem.style.cssText = "box-sizing:border-box;position:absolute;padding:0;margin:0;left:0;top:0;";
        elem.innerHTML = "<div class='ya-mask-backend' style='box-sizing:border-box;position:absolute;padding:0;margin:0;'></div><div class='ya-mask-front' style='position:absolute;margin:0;box-sizing:border-box;overflow:hidden;word-break:break-all;'></div>";
        this.__backendElement = elem.firstChild;
        this.__frontElement = elem.lastChild;
        return this.__maskElement = elem;

    }
    private _keepBackend(){
        let w = this.element.offsetWidth;
        let h = this.element.offsetHeight;
        let x = this.element.offsetLeft;
        let y = this.element.offsetTop;
        setStyle(this.__maskElement,{width:w+"px",height:h+"px",left:x+"px",top:y+"px"},false);
        setStyle(this.__backendElement,{width:w+"px",height:h+"px"},false);
    }
    private _keepFront(){
        let fe = this.__frontElement as HTMLElement;
        let w = this.element.offsetWidth;
        let h = this.element.offsetHeight;
        let fw = fe.offsetWidth;//;+(parseInt(getStyle(fe,"borderLeftWidth"))|0) + ;
        let fh = fe.offsetHeight;
        fw = Math.min(fw,w);
        fh = Math.min(fh,h);
        let x = (w-fw)/2;
        let y = (this.top!==undefined?this.top:((h-fh)/2));
        setStyle(this.__frontElement,{
            left:x + "px",top:y+"px",width :fw +"px",height:fh+"px"
        },false);
        
    }
    unmask():Mask{
        if(this.__centerTimer) clearInterval(this.__centerTimer);
        this.__centerTimer = 0;
        if(this.__maskElement)this.__maskElement.parentNode.removeChild(this.__maskElement);
        return this;
    }
    dispose(){
        if(this.__centerTimer) clearInterval(this.__centerTimer);
        this.__centerTimer = 0;
        if(this.__maskElement)this.__maskElement.parentNode.removeChild(this.__maskElement);
        this.__maskElement = this.__backendElement = this.__frontElement = undefined;
    }
}

YA.attrBinders.mask = function(elem:IElement,bindValue:any,vnode:YA.INodeDescriptor,compInstance:YA.IComponent){
    if(isObservable(bindValue)){
        bindValue.subscribe((e)=>{
            mask(elem,e.value);
        },compInstance);
        bindValue = bindValue.get();
    }
    mask(elem,bindValue);
}

export function mask(elem:IElement,opts:IMaskOpts|string|boolean):Mask{
    let inst = elem[Mask.InstanceToken];
    if(!inst) inst = new Mask(elem);
    return inst.mask(opts);
}



//////////////////////////////////////////////////////////////////////////////
// Html控件
//////////////////////////////////////////////////////////////////////////////

export interface IComponent extends YA.IComponent{
    mask?:any;
    width?:number|YA.IObservable<number>;
    minWidth?:number|YA.IObservable<number>;
    maxWidth?:number|YA.IObservable<number>;
    height?:number|YA.IObservable<number>;
    minHeight?:number|YA.IObservable<number>;
    maxHeight?:number|YA.IObservable<number>;
}

export class Component extends YA.Component{
    
    mask?:any;
    @in_parameter()
    css:string;
    @in_parameter()
    width?:number|YA.IObservable<number>;
    @in_parameter()
    minWidth?:number|YA.IObservable<number>;
    @in_parameter()
    maxWidth?:number|YA.IObservable<number>;
    @in_parameter()
    height?:number|YA.IObservable<number>;
    @in_parameter()
    minHeight?:number|YA.IObservable<number>;
    @in_parameter()
    maxHeight?:number|YA.IObservable<number>;
    

    render(descriptor?:YA.INodeDescriptor,container?:IElement):IElement|IElement[]|YA.INodeDescriptor|YA.INodeDescriptor[]{
        throw new Error("abstract method.");
    }

    request(opts:string|any,requester?:IComponent):any{

    }
    
    static initElement(elem:IElement,attrs:{[name:string]:any},ownComponent?:IComponent){
        let css = attrs["css"];
        if(css!==undefined){
            YA.bindDomAttr(elem,"className",css,attrs,ownComponent,(elem:IElement,name,value,old)=>{
                replaceClass(elem,old,value,true);
            });
        }
        
        for(const styleName in stylenames){
            let value = attrs[styleName];
            if(value!==undefined){
                initStyleProp(elem,styleName,value,ownComponent);
            }
        }
    }
    
}
Object.defineProperty(Component.prototype,"mask",{enumerable:false,configurable:true,
    get:function(){
        return this.$element?this.$elements["YA_MASK_OPTS"]:undefined;
    },
    set:function(value:any){
        if(!value)value=false;
        this.$element["YA_MASK_OPTS"]=value;
        let inst = this.$element[Mask.InstanceToken];
        if(!inst){
            inst = new Mask(this.$element);
            this.dispose(()=> inst.dispose());
        }
        inst.mask(value);

    }
});
let stylenames = ["width","height","minWidth","maxWidth","minHeight","maxHeight"];
function initStyleProp(elem:IElement,name:string,value:any,ownComponent?:IComponent){
    if(YA.Observable.isObservable(value)){
        value.subscribe((e)=>{
            setStyle(elem,name,e.value);
        },ownComponent);
        value = value.get(ObservableModes.Value);
        if(value!==undefined && value!=="")setStyle(elem,name,value);
    }
}


let popContainer:IElement;
let pageElement:IElement;
function initDom(){
    popContainer = document.createElement("div");
    popContainer.className="ya-pop-layer";
    popContainer.style.cssText="position:absolute;left:0;top:0;z-index:999999;background-color:transparent";
    pageElement = document.compatMode=="CSS1Compat"?document.documentElement:document.body;
    ElementUtility.attach(window as any,"resize",()=>{
        if(popContainer && popContainer.parentNode){
            popContainer.style.width=pageElement.offsetWidth + "px";
            popContainer.style.height = pageElement.offsetHeight + "px";
        }
        
    });
}
initDom();

function addPopElement(elem,onRemove?){
    if(!popContainer.parentNode){
        document.body.appendChild(popContainer);
    }
    popContainer.style.width=pageElement.offsetWidth + "px";
    popContainer.style.height = pageElement.offsetHeight + "px";
    popContainer.appendChild(elem);
    
    if(onRemove!==false){
        let handler = elem.$__popElementRemoveHandler__ = function(){
            if(removePopElement(elem)){
                if(typeof onRemove==="function") onRemove(elem);
            }
        };
        ElementUtility.attach(popContainer,"click",handler);
    }
}
function removePopElement(elem):boolean{
    if(elem.parentNode===popContainer){
        popContainer.removeChild(elem);
        if(elem.$__popElementRemoveHandler__)ElementUtility.detech(popContainer,"click",elem.$__popElementRemoveHandler__);
        if(popContainer.childNodes.length===0) document.body.removeChild(popContainer);
        return true;
    }
    return false;
}

export interface IDropdownable{
    location?:string;
    content?:any;
    width?:number|YA.IObservable<number>;
    minWidth?:number|YA.IObservable<number>;
    maxWidth?:number|YA.IObservable<number>;
    height?:number|YA.IObservable<number>;
    minHeight?:number|YA.IObservable<number>;
    maxHeight?:number|YA.IObservable<number>;
}
export class Dropdownable{
    element:IElement;
    ownComponent:YA.IComponent;
    $__isShow__:boolean;
    constructor(public target:IElement,public opts){
        Object.defineProperty(target,Dropdownable.token,{enumerable:false,writable:false,configurable:false,value : this});
        let self = this;
        let show = this.show;
        let hide = this.hide;
        let toggle = this.toggle;
        this.show = ()=>show.call(self);
        this.hide = ()=>hide.call(self);
        this.toggle = ()=>toggle.call(self);
        ElementUtility.attach(target,"focus",this.show);
        ElementUtility.attach(target,"blur",this.hide);
        ElementUtility.attach(target,"click",this.toggle);
    }
    show(){
        if(this.$__isShow__) return this;
        if(!this.target.parentNode)return this;
        if(!this.element) this.element = this._initElement();
        addPopElement(this.element,()=>this.$__isShow__=false);
        this._setPosition();
        this.$__isShow__ = true;
        return this;
    }
    hide(){
        removePopElement(this.element);
        this.$__isShow__ = false;
        return this;
    }
    toggle(){
        if(this.$__isShow__) this.hide();
        else this.show();
        //this.show();
        return this;
    }

    private _initElement(){
        let elem = this.element = document.createElement("div");
        elem.className="dropdown";
        elem.style.cssText="position:absolute;overflow:auto;";

        let content = this.opts.content;
        
        if(!ElementUtility.isElement(content)){
            let ct = typeof content;
            if(ct==="function") content = YA.createComponent(content,null,elem,this.ownComponent);
            else if(YA.is_array(content)){

            }else{
                content = YA.createDescriptor(content,elem,this.ownComponent);
            }
        }else elem.appendChild(content);
        content.style.display="block";
        return elem;
    }
    private _setPosition(){
        let targetAbs = getAbs(this.target);
        let size = new Size(this.target.clientWidth,this.target.clientHeight);
        let loc = this.opts.location ||"vertical";
        let fn = this["_"+loc];
        if(!fn) fn = this._auto;
        fn.call(this,targetAbs,size);

    }
    private _bottom(pos:Pointer,size:Size){
        this.element.style.top = pos.y + size.h + "px";
        if(this.element.clientWidth<size.w){
            this.element.style.left = pos.x+"px";
            return;
        }
        let bodyRight = pageElement.scrollLeft+pageElement.clientWidth;
        
        if(bodyRight<pos.x+this.element.clientWidth){
            //右边空间不够，向左展开
            this.element.style.left = pos.x+size.w-this.element.clientWidth + "px";
        }else {
            this.element.style.left = pos.x + "px";
        }
    }
    private _top(pos:Pointer,size:Size){
        this.element.style.top = pos.y - this.element.clientHeight + "px";
        if(this.element.clientWidth<size.w){
            this.element.style.left = pos.x+"px";
            return;
        }
        let bodyRight = pageElement.scrollLeft+pageElement.clientWidth;
        
        if(bodyRight<pos.x+this.element.clientWidth){
            //右边空间不够，向左展开
            this.element.style.left = pos.x+size.w-this.element.clientWidth + "px";
        }else {
            this.element.style.left = pos.x + "px";
        }

    }

    private _left(pos:Pointer,size:Size){
        this.element.style.left = pos.x - this.element.clientWidth + "px";
        if(this.element.clientHeight<size.h){
            this.element.style.top = pos.y+"px";
            return;
        }
        let bodyBottom = pageElement.scrollTop+pageElement.clientHeight;
        
        if(bodyBottom<pos.y+this.element.clientHeight){
            //下面空间不够，向上展开
            this.element.style.top = pos.y+size.h-this.element.clientWidth + "px";
        }else {
            this.element.style.top = pos.y + "px";
        }
    }

    private _right(pos:Pointer,size:Size){
        this.element.style.left = pos.x + size.w +"px";
        if(this.element.clientHeight<size.h){
            this.element.style.top = pos.y+"px";
            return;
        }
        let bodyBottom = pageElement.scrollTop+pageElement.clientHeight;
        
        if(bodyBottom<pos.y+this.element.clientHeight){
            //下面空间不够，向上展开
            this.element.style.top = pos.y+size.h-this.element.clientWidth + "px";
        }else {
            this.element.style.top = pos.y + "px";
        }
    }
    private _horizen(pos:Pointer,size:Size){
        let bodyBottom = pageElement.scrollTop+pageElement.clientHeight;
        let bodyRight =  pageElement.scrollLeft+pageElement.clientWidth;
        let x,y;
        if(pos.x + size.w + this.element.clientWidth>bodyRight){
            x = pos.x-this.element.clientWidth;
        }else x = pos.x + size.w;
        if(x<0)x=0;
        if(pos.y +this.element.clientHeight>bodyBottom){
            y = pos.y + size.h - this.element.clientHeight;
        }else y = pos.y;
        if(y<0) y=0;
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
    }
    private _vertical(pos:Pointer,size:Size){
        let bodyBottom = pageElement.scrollTop+pageElement.clientHeight;
        let bodyRight =  pageElement.scrollLeft+pageElement.clientWidth;
        let x,y;
        if(pos.y + size.h + this.element.clientHeight>bodyBottom){
            y = pos.y-this.element.clientHeight;
        }else y = pos.y + size.h;
        if(y<0)y=0;
        if(pos.x+this.element.clientWidth>bodyRight){
            x = pos.x + size.w - this.element.clientWidth;
        }else x = pos.x;
        if(x<0) x=0;
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
    }

    private _auto(pos:Pointer,size:Size){
        let bodyBottom = pageElement.scrollTop+pageElement.clientHeight;
        let bodyRight =  pageElement.scrollLeft+pageElement.clientWidth;
        let x,y,isComplete;//isComplete 上下展开是否是完全的展开
        if(pos.y + size.h + this.element.clientHeight>bodyBottom){
            //完全下展空间不够
            if(pos.y+this.element.clientHeight>bodyBottom){
                //部分下展空间也不够
                y = pos.y-this.element.clientHeight;
                if(y<0){
                    y-=size.h;
                    if(y<0)y=0;
                }else{
                    isComplete=true;
                }
            }else y = pos.y;
            
        }else {y = pos.x + size.h;isComplete=true;}
        if(isComplete){
            if(pos.x + this.element.clientWidth>bodyRight){
                x = pos.x-this.element.clientWidth;
                if(x<0)x=0;
            }else x = pos.x;
        }else {
            if(pos.x + size.w + this.element.clientWidth>bodyRight){
                x = pos.x -this.element.clientWidth;
                if(x<0)x=0;
            }else{
                x = pos.x+size.w;
            }
        }
    }
    
    static token:string ="$__DROPDOWN_INST__";
}

export class Dropdown extends Component{
    @parameter()
    value?:any;
    @out_parameter()
    text:string;
    @in_parameter()
    editable?:boolean=true;
    @YA.internal()
    selectIndex:number;
    
    options?:any;

    legend?:boolean|string;

    fields?:any[];

    selectType?:string;

    compare?:(item:any,value:any)=>string;

    filter?:(keyword:string,options:any[],dropdown:Dropdown)=>any[];

    OPTIONVALUE:string="Id";
    OPTIONTEXT:string="Text";
    

    private _setText:(text:string)=>string;
    private $__options__:any[];
    private $__tbody__;
    private $__waitingTr__;
    private $__tick__;
    private $__legendUrl__;
    private $__filterSessionId__;
    private $__dropdownable__;
    inputElement:IElement;

    private $__field__;
    private $__fieldname__;
    private $__option__;
    private $__optionIndex__;

    constructor(){
        super();
        
    }


    _render():YA.INodeDescriptor{
        let field = YA.variable(undefined);
        let fieldname = YA.variable("");
        let option = YA.variable(null);
        let optionIndex = YA.variable(0);

        return <span css={["ya-dropdown ya-input",this.css]}>
            <input if={this.editable} type="text" b-value={this.text} />
            <span if={YA.not(this.editable)}>{this.text}</span>
            <a href="#" className="btn ya-dropdown-btn"> </a>
            <table style="display:none;position:absolute;">
                <thead if={this.fields}>
                    <tr  for={[this.fields,field]}>
                        <th>{YA.computed((field,fieldname)=>typeof field==="string"?field:field.text,field)}</th>
                    </tr>
                </thead>
                <tbody if={this.fields} for={[this.$__options__,option,optionIndex]}>
                    <tr className={YA.computed((index,selectIndex)=>index===selectIndex?"selected":"",optionIndex,this.selectIndex)} for={[this.fields,field,fieldname]}>
                        <td>{YA.computed(()=>option[(field as any).name||fieldname])}</td>
                    </tr>
                </tbody>
            </table>
        </span>;
    }
    getFieldText(field){
        if(typeof field==="string") return field;
        return field.text;
    }

    render(descriptor:YA.INodeDescriptor,parentNode:IElement):IElement{
        
        let element = document.createElement("SPAN");
        element.className = "ya-input ya-dropdown";
        Component.initElement(element,this,this);
        let editableOb = (this.editable as any as YA.IObservable<boolean>);
        if(editableOb.get(ObservableModes.Value)){
            this._editInput();
        }else {
            this._readonlyInput();
        }
        editableOb.subscribe((e)=>{
            e.value?this._editInput():this._readonlyInput();
        },this);
        let dropdownBtn = ElementUtility.createElement("a",{"class":"ya-btn ya-dropdown-btn"},element);
        //ElementUtility.attach(dropdownBtn);
        
        let options = this.options; 
        if(typeof this.options==="string"){
            options = this.request(options,this);
        }
        if(options.then){
            addClass(element,"ya-loading");
            (this.inputElement as HTMLInputElement).disabled = true;
            options.then((opts)=>{
                this.setOptions(opts);
                (this.inputElement as HTMLInputElement).disabled = false;
                removeClass(element,"ya-loading");
            });
        }else{
            this.setOptions(options);
        }
        return element;
    }
    private _setValue(value:any):Dropdown{
        for(let item in this.$__options__){
            let text:string;
            if(item===value || (this.compare && (text=this.compare(item,value))!==undefined) || item[this.OPTIONVALUE||"Id"]==value){
                if(text===undefined) text = item[this.OPTIONTEXT||"Text"];
                this._setText(text);
                break;
            }
        }
        return this;
    }

    setOptions(opts:any):Dropdown{
        let value= (this.value as any as YA.IObservable<any>).get(ObservableModes.Value);
        if(YA.is_array(opts)){
            this.$__options__ = [];
            for(let optionItem of opts){
                this.$__options__.push(optionItem);
                if(optionItem===value){
                    this._setText(optionItem[this.OPTIONTEXT||"Text"]);
                    
                }
                else if(this.compare){
                    let text = this.compare(optionItem,value);
                    if(text!==undefined) {this._setText(text);break;}
                }else if(optionItem[this.OPTIONVALUE]===value){
                    this._setText(optionItem[this.OPTIONTEXT||"Text"]);
                    break;
                }
            }
        }else{
            for(let key in opts){
                let text = opts[key];
                let opt = {};
                opt[this.OPTIONVALUE||"Id"]=key;
                opt[this.OPTIONTEXT||"Text"] =text;
                if(key===value) this._setText(text);
            }
        }
        return this;
    }

    private _editInput(){
        if(this.inputElement&&this.inputElement.tagName==="INPUT") return this.inputElement;
        
        let inputElement:any = document.createElement("INPUT");
        inputElement.type = "text";
        inputElement.className = "ya-input";
        inputElement.style.cssText = "display:inline-block;width:100%;";
        inputElement.onkeyup = (e)=>{
            if(this.$__tick__) clearTimeout(this.$__tick__);
            this.$__tick__ = setTimeout(() => {
                if(this.$__tick__) clearTimeout(this.$__tick__);this.$__tick__=undefined;
                let keyword = YA.trim(inputElement.value);
                this._filter(keyword);
            }, 150);
        };
        inputElement.onblur = ()=>{
            if(this.$__tick__) clearTimeout(this.$__tick__);this.$__tick__=undefined;
            let keyword = YA.trim(inputElement.value);
            this._filter(keyword);
        };
        if(this.inputElement) {
            (this.$element as HTMLElement).replaceChild(inputElement,this.inputElement);
        }else (this.$element as any).appendChild(inputElement);
        this._setText = (text)=>inputElement.value = text===undefined || text===null?"":text;
        return this.inputElement = inputElement;
    }
    private _readonlyInput(){
        if(this.inputElement&&this.inputElement.tagName==="SPAN") return this.inputElement;
        let inputElement:any = document.createElement("SPAN");
        inputElement.className = "ya-input";
        inputElement.style.cssText = "display:inline-block;width:100%;";
        if(this.inputElement) {
            (this.$element as HTMLElement).replaceChild(inputElement,this.inputElement);
        }else (this.$element as any).appendChild(inputElement);
        this._setText = (text)=>inputElement.innerHTML = ElementUtility.htmlEncode(text);
        return this.inputElement = inputElement;
    }
    
    private _filter(keyword:string){
        if(!this.$__tbody__)return;
        let filter = this.filter || this._defaultFilter;
        let opts = filter.call(this,keyword,this.$__options__,this);
        
        if(typeof opts.then==="function"){
            let sessionId = this.$__filterSessionId__ = new Date();
            opts.then((asyncOpts)=>{
                if(sessionId!==this.$__filterSessionId__) return;
                this._makeDropdownRow(opts);
            });
        }else {
            this._makeDropdownRow(opts);
        }
        
    }

    private _defaultFilter(keyword:string,options:any[],dropdown:Dropdown):any[]{
        let filteredOpts=[];
        for(const item of this.$__options__){
            if(item[this.OPTIONVALUE||"Id"]===keyword ) filteredOpts.push(item);
            else {
                let text =item[this.OPTIONTEXT||"Text"];
                if(text===keyword ||(text && text.indexOf(keyword)>=0)) filteredOpts.push(item);
            }
        }
        return filteredOpts;
    }
    
    
    expand() :Dropdown{
        if(this.$__dropdownable__) {
             this.$__dropdownable__.show();
             addClass(this.$element as any,"ya-expand");
             return this;
        }
        let tb = document.createElement("table");tb.className = "ya-dropdown";
        if(this.fields){
            let thead = document.createElement("thead");tb.appendChild(thead);
            let hrow = document.createElement("tr");thead.appendChild(hrow);
            for(let field of this.fields){
                if(typeof field==="string"){
                    ElementUtility.createElement("th",{innerHTML:ElementUtility.htmlEncode(field)},hrow);
                }
            }
        }
        let tbody= this.$__tbody__ = document.createElement("tbody");tb.appendChild(tbody);
        let waitingTr = this.$__waitingTr__ = ElementUtility.createElement("tr",{"class":"waiting-options"},tbody);
        let td = ElementUtility.createElement("td",null,waitingTr);
        ElementUtility.createElement("div",{"class":"ya-waiting-text"},td);
        this._makeDropdownRow(this.$__options__);
        this.$__dropdownable__ = new Dropdownable(this.$element as any,{});
        this.$__dropdownable__.show();
        addClass(this.$element as any,"ya-expand");
        return this;
    }
    collapse(){
        if(this.$__dropdownable__){
            this.$__dropdownable__.hide();
            removeClass(this.$element as any,"ya-expand");
        }
        return this;
    }
    private _makeDropdownRow(options){
        let self = this;
        this.$__tbody__.innerHTML = "";
        for(let optItem of options){
            if(this.fields){
                let row = document.createElement("tr");this.$__tbody__.appendChild(row);
                for(let field of this.fields){
                    if(typeof field==="string"){
                        ElementUtility.createElement("td",{innerHTML:ElementUtility.htmlEncode(field)},row);
                    }
                }
                (row as any).$__DROPDOWN_OPTIONITEM__ = optItem;
                row.onclick =function(){
                    let item = (this as any).$__DROPDOWN_OPTIONITEM__;
                    let readMode = Observable.readMode;
                    Observable.readMode = ObservableModes.Proxy;
                    let ob:YA.IObservable<any>;
                    try{
                        ob = self.value;
                    }finally{
                        Observable.readMode = readMode;
                    }
                    if(self.selectType==="item") ob.set(item);
                    else ob.set(item[self.OPTIONVALUE||"Id"]);
                    ob.update(self);
                    
                };
            }
        }
    }
}



export class Field extends Component{
    type:any;
    name:string;
    validations:{[name:string]:any};
    @in_parameter()
    css:string;
    @in_parameter()
    permission:string;
    constructor(){
        super();
    }
}

