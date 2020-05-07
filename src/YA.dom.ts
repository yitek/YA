import * as YA from "YA.core";
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
    
}
export let ElementUtility:IElementUtility = YA.ElementUtility as any;

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
            let next = clsnames[at+length];
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
    if(!cls)return false;
    if(findClassAt(node.className,cls)>=0) return false;
    node.className+= " " + cls;
    return true;
}
let removeClass= ElementUtility.removeClass = (node:IElement,cls:string):boolean => { //IDom{
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
styleConvertors.left = styleConvertors.right = styleConvertors.top = styleConvertors.bottom = styleConvertors.width = styleConvertors.height = function (value:any) {
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
    mask:any;
}

export class Component extends YA.Component{
    
    mask:any;
    

    render(descriptor?:YA.INodeDescriptor,container?:IElement):IElement|IElement[]|YA.INodeDescriptor|YA.INodeDescriptor[]{
        throw new Error("abstract method.");
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
export class Panel extends Component{
    _labelElement:IElement;
    _contentElement:IElement;

    name:string;
    @in_parameter()
    css:string;
    @parameter()
    label:string="";
    
    render(descriptor:YA.INodeDescriptor,elementContainer?:IElement){
        
        let panelContainer:Panels= this.$parent as Panels;
        
        let titleElem :IElement;
        let title = (this.label as any as YA.Observable<string>).get(YA.ObservableModes.Value);
        if(title){
            titleElem = this._labelElement = ElementUtility.createElement("li",{"class":"ya-panel-label"}) as any;
            let txtElem = ElementUtility.createElement("label",null,titleElem);
            
            YA.bindDomAttr(txtElem,"text",this.label,descriptor,this as any,(elem:IElement,name,value,old)=>{
                elem.innerHTML = value;
            });
            
            YA.bindDomAttr(titleElem,"className",this.css,descriptor,this as any,(elem:IElement,name,value,old)=>{
                replaceClass(elem,old, value,true);
                //replaceClass(this.__contentElement,old,value,true);
            });
        }
        
        let contentElement = this._contentElement =ElementUtility.createElement("div",{"class":"ya-panel-content"}) as any;
        
        
        YA.bindDomAttr(contentElement,"className",this.css,descriptor,this as any,(elem:IElement,name,value,old)=>{
            replaceClass(elem,old,value,true);
        });
        YA.createElements(descriptor.children,contentElement,this as any);
        let mode = Observable.readMode;
        Observable.readMode = ObservableModes.Value;
        try{
            let rs = panelContainer._onPanelRendered(this);
            return rs;
        }finally{
            Observable.readMode= mode;
        }
        
    }
}
export class Panels extends Component{
        
    _panelType:Function = Panel;

    
    @in_parameter()
    css:string="";

    constructor(){
        super();
        Object.defineProperty(this,"$__panels__",{enumerable:false,writable:false,configurable:false,value:[]});
    }
    get panels(){
        return (this as any).$__panels__;
    }

    

    render(descriptor,container){
        let elem :IElement;
        
        elem = document.createElement("div");
        
        YA.bindDomAttr(elem,"className",this.css,descriptor,this as any,(elem:IElement,name,value,old)=>{
            replaceClass(elem,old, value,true);
        });
        let mode = Observable.readMode;
        Observable.readMode = ObservableModes.Value;
        try{
            elem = this._onRendering(elem);
        }finally{
            Observable.readMode= mode;
        }
        
        let children = descriptor.children;
        for(let child of children){
            if(this._panelType && (child as any).Component!==this._panelType) continue;
            YA.createComponent((child as any).Component,child as any,elem,this,{returnInstance:true});
        }
        mode = Observable.readMode;
        Observable.readMode = ObservableModes.Value;
        try{
            elem = this._onRendered(elem);
        }finally{
            Observable.readMode= mode;
        }
        
        return elem;
    }
    _onRendering(elem:IElement):IElement{
        return elem;
    }
    _onRendered(elem:IElement):IElement{
        return elem;
    }
    _onPanelRendered(panel:Panel):any{
        if(!panel.name) panel.name ="panel-"+ YA.cid();
        this[panel.name] = panel;
        this.panels.push(panel);
        return this.panels.$elements;
    }

    
}

export interface ISeletablePanelStype{
    name:string;
    multiple:boolean;
    noselect:boolean;
    css:string;
    container:SelectablePanels;
    
    _onRendering(elem:IElement):IElement;
    _onRendered(elem:IElement):IElement;
    _onPanelRendered(panel:Panel):any;
    _onPanelSelecting(panel:SelectablePanel):any;
    _onPanelUnselecting(panel:SelectablePanel):any;
    _onApply(lastStyle:ISeletablePanelStype);
    _onExit(newStype:ISeletablePanelStype);
}

export class SelectablePanel extends Panel{   
    @parameter()
    selected:boolean=("" as any);

    constructor(){
        super();
    }

    render(des,container){
        let ret = super.render(des,container);
        
        let selectedAttr = this.selected as any as YA.Observable<boolean>;
        if(selectedAttr) selectedAttr.subscribe((e)=>{
            let panels = this.$parent as SelectablePanels;
            e.value?panels._onPanelSelecting(this):panels._onPanelUnselecting(this);
        },this);     
        return ret;   
    }

    
}
export class SelectablePanels extends Panels{
    @in_parameter()
    multiple:boolean;
    
    @in_parameter()
    noselect:boolean="" as any;
    
    @in_parameter()
    selectAll:boolean="" as any;

    @in_parameter()
    unselectAll:boolean="" as any;
    @in_parameter()
    panelStyle:string="tab";

    @parameter()
    selected:string[]=("" as any);

    get allowMultiple(){
        let multiple;
        let currentStyle = this.currentStyle;
        if(currentStyle) {
            if(currentStyle.multiple!==undefined) multiple=currentStyle.multiple;
            if(multiple===true){
                let v = this.multiple;
                multiple = v===("" as any)?true:v;
            }else multiple=false;
        }else{
            multiple = this.multiple;
            if(multiple===undefined)multiple=false;
        }
        return multiple;
    }
    get allowNoselect(){
        let allowNoselect;
        let currentStyle = this.currentStyle;
        if(currentStyle) {
            if(currentStyle.noselect!==undefined) allowNoselect=currentStyle.noselect;
            if(allowNoselect===true){
                allowNoselect = this.noselect;
                if(allowNoselect===("" as any)) allowNoselect = true;
            }else allowNoselect=false;
        }else allowNoselect=false;
        return allowNoselect;
    }

    _defaultPanel:SelectablePanel;
    _lastSelectedPanel:SelectablePanel;
    private __currentStyle__:ISeletablePanelStype;
    
    static styles:{[name:string]:{new(container:SelectablePanels):ISeletablePanelStype}}={};

    get currentStyle(){
        let name = this.panelStyle;
        if((name as any).get) name = (name as any).get(ObservableModes.Value);
        if(this.__currentStyle__ && this.__currentStyle__.name==name)return this.__currentStyle__;
        
        let ctor = SelectablePanels.styles[name];
        if(!ctor)return;
        this.__currentStyle__ = new ctor(this);
        this.__currentStyle__.name = name;
        return this.__currentStyle__;
    }

    constructor(){
        super();
        this._panelType = SelectablePanel;
        
        Object.defineProperty(this,"$__selectedPanels__",{enumerable:false,writable:false,configurable:false,value:[]});
        Object.defineProperty(this,"$__styleName__",{enumerable:false,writable:false,configurable:false,value:[]});
    }
    get selectedPanels(){
        return this["$__selectedPanels__"];
    }
    
    _onRendering(elem){
        elem = super._onRendering(elem);
        let currentStyle = this.currentStyle;
        if(currentStyle) elem = currentStyle._onRendering(elem);
        addClass(elem,"ya-selectable-panels");
        let mode = Observable.readMode;
        Observable.readMode = ObservableModes.Observable;
       
        return elem;
    }
    _onRendered(elem){
        super._onRendered(elem);
        observableMode(ObservableModes.Observable,()=>{
            (this.selected as any as YA.Observable<string[]>).subscribe(e=>{
                if(e.value && e.value.length){
                    let selectedName = e.value[e.value.length-1];
                    let panel = this[selectedName] as SelectablePanel;
                    if(panel)panel.update("selected",true);
                }
                if(e.old && e.old.length){
                    for(let old of e.old){
                        if(e.value && YA.array_index(e.value,old)>=0){
                            continue;
                        }
                        let panel = this[old] as SelectablePanel;
                        if(panel)panel.update("selected",false);
                    }                   
                }
            },this);
            (this.panelStyle as any as YA.IObservable<string>).subscribe((e)=>{
                let ctor = SelectablePanels.styles[e.value];
                if(!ctor)return;
                let curr = this.__currentStyle__;
                if(curr){
                    if(curr.name===e.value)return;
                    curr._onExit(null);
                }
                let newStyle = new ctor(this);
                newStyle.name = e.value;
                this.__currentStyle__ = newStyle;
                newStyle._onApply(curr);
                
                
            },this);
        });
        let selected = this.selected;
        if(selected){
            for(let name of selected){
                (this[name] as SelectablePanel).update("selected",true);
            }
        }        

        if(!this._lastSelectedPanel && !this.allowNoselect){
            if(!this._defaultPanel){
                this._defaultPanel = this.panels[0];
            }
            if(this._defaultPanel)this._defaultPanel.update("selected",true);
        }

        if(this.selectAll===true){
            let children = this.$children;
            if(children) for(let child of children){
                (child as GroupPanel).update("selected",true);
            }
            this.unselectAll=false;
        }
        if(this.unselectAll===true){
            let children = this.$children;
            if(children) for(let child of children){
                (child as GroupPanel).update("selected",false);
            }
        }
        observableMode(ObservableModes.Observable,()=>{
            (this.selectAll as any as YA.Observable<string[]>).subscribe(e=>{
                if(!this.allowMultiple || !e.value)return;
                let children = this.$children;
                if(children) for(let child of children){
                    (child as GroupPanel).update("selected",true);
                }
                this.unselectAll=false;
            },this);
            (this.unselectAll as any as YA.Observable<string[]>).subscribe(e=>{
                if(!this.allowNoselect || !e.value)return;
                let children = this.$children;
                if(children) for(let child of children){
                    (child as GroupPanel).update("selected",false);
                }
                this.selectAll=false;
            },this);
        });

        if(this.currentStyle) elem = this.currentStyle._onRendered(elem);
        return elem;
    }

    _onPanelRendered(panel:SelectablePanel){
        let rs = super._onPanelRendered(panel);
        
        if(this.currentStyle) rs = this.currentStyle._onPanelRendered(panel);
        let isSelected = panel.selected;
        if(isSelected===("" as any)){
            if(this.allowMultiple) isSelected=true;
            else isSelected=false;
        }
        if(isSelected){
            this._onPanelSelecting(panel);
        }
        return rs;
    }

    protected $__isChanging__;
    _onPanelSelecting(panel:SelectablePanel):any{
        let selectedPanels = this.selectedPanels;
        if(!YA.array_add_unique(selectedPanels,panel)) return;
        let isChanging = this.$__isChanging__;
        this.$__isChanging__ = true;
        let newSelects = [];
        let selects = this.selected;
        if(selects){
            for(let name of selects){
                newSelects.push(name);
            }
            newSelects.push(panel.name);
        }else{
            newSelects.push(panel.name);
        }
        this.selected = newSelects;
        
        if(!this.allowMultiple){
            if(this._lastSelectedPanel && this._lastSelectedPanel.selected){
                this._lastSelectedPanel.update("selected",false);
            }
        } 
        this._lastSelectedPanel = panel;
        if(!isChanging)this.update("selected");
        if(panel._labelElement)addClass(panel._labelElement,"selected");
        addClass(panel._contentElement,"selected");
        this.$__isChanging__ = isChanging;
        if(this.currentStyle) this.currentStyle._onPanelSelecting(panel);
    }
    _onPanelUnselecting(panel:SelectablePanel):any{
        if(!YA.array_remove(this.selectedPanels,panel)) return;
        let isChanging = this.$__isChanging__;
        this.$__isChanging__ = true;
        let newSelects=[];
        let selects = this.selected;
        if(selects) for(let name of selects){
            if(name!==panel.name)newSelects.push(name);
        }
        this.selected = newSelects;
        if(newSelects.length===0){
            
            if(!this.allowNoselect){
                if(!this._defaultPanel){
                    this._defaultPanel = this.panels[0];
                }
                if(this._defaultPanel)this._defaultPanel.update("selected",true);
            }
            
        }  
        if(!isChanging)this.update("selected");
        this.$__isChanging__ = isChanging;

        if(panel._labelElement)removeClass(panel._labelElement,"selected");
        removeClass(panel._contentElement,"selected");
        if(this.currentStyle) this.currentStyle._onPanelUnselecting(panel);
    }
}

export class TabStyle implements ISeletablePanelStype{
    private __captionsElement:IElement;
    private __contentsElement:IElement;
    name:string;
    multiple:boolean;
    noselect:boolean;
    container:SelectablePanels;
    css:string;

    constructor(container:SelectablePanels){
        this.container = container;
        this.multiple=false;
        this.noselect = false;
        this.css="ya-tab";
        
    }

    _onRendering(elem){
        addClass(elem,this.css);
        this.__captionsElement = ElementUtility.createElement("ul",{"class":"ya-panel-labels"},elem) as any;
        this.__contentsElement = ElementUtility.createElement("div",{"class":"ya-panel-contents"},elem) as any;
        return elem;
    }
    _onRendered(elem){
        
        return elem;
    }

    _onPanelRendered(panel:SelectablePanel){
        
        this.__captionsElement.appendChild(panel._labelElement);
        this.__contentsElement.appendChild(panel._contentElement);
        let labelClicked = ()=>{
            panel.update("selected",true);
        };
        ElementUtility.attach(panel._labelElement,"click",labelClicked);
        panel._labelElement["$__yaLabelClick__"] = labelClicked;
        panel._contentElement.style.display="none";
        let rs = [panel._labelElement,panel._contentElement] as any;
        rs.$__alreadyAppendToContainer = true;
        return rs;
    }

    _onPanelSelecting(panel:SelectablePanel):boolean{
        panel._contentElement.style.display="block";
        return true;
    }

    _onPanelUnselecting(panel:SelectablePanel){
        panel._contentElement.style.display="none";
    }

    _onExit(newStyle:ISeletablePanelStype){
        let p = this.__captionsElement.parentNode;
        p.removeChild(this.__captionsElement);
        p.removeChild(this.__contentsElement);
        removeClass(this.container.$element as any,this.css);
        for(let li of this.__captionsElement.childNodes as any){
            let labelClicked = li["$__yaLabelClick__"];
            ElementUtility.detech(li,"click",labelClicked);
            li["$__yaLabelClick__"]=null;
        }
    }
    _onApply(oldStyle:ISeletablePanelStype){
        let panels = this.container.panels;
        let parent = this.container.$element as IElement;
        parent.innerHTML="";
        addClass(parent,this.css);
        if(!this.__captionsElement){
            this.__captionsElement = ElementUtility.createElement("ul",{"class":"ya-panel-labels"},parent) as any;
            this.__contentsElement = ElementUtility.createElement("div",{"class":"ya-panel-contents"},parent) as any;
        }else {
            parent.appendChild(this.__captionsElement);
            parent.appendChild(this.__contentsElement);
        }
        for(let panel of panels){
            let elem =this._onPanelRendered(panel);
            if(!elem.$__alreadyAppendToContainer){
                if(YA.is_array(elem)){
                    for(let i=0,j=elem.length;i<j;i++) parent.appendChild(elem[i]);
                }else{
                    parent.appendChild(elem);
                }
                
            }
            
        }
        let selectedNames = this.container.selected;
        let selectedName;
        if(!selectedNames || !selectedNames.length){
            if(this.container._defaultPanel) selectedName=this.container._defaultPanel.name;
            else{
                this.container._defaultPanel = this.container.panels[0];
                if(this.container._defaultPanel) selectedName=this.container._defaultPanel.name;
            }
        }else {
            selectedName = selectedNames[selectedNames.length-1];
        }
        if(selectedName){
            let selects = [selectedName];
            let panel = this.container[selectedName];
            if(panel) panel._contentElement.style.display="block";
            this.container.update("selected",selects);
        }else {
            throw new Error("没有定义panel，无法转换");
        }
    }
}
SelectablePanels.styles["tab"] = TabStyle;

export class Tab extends SelectablePanels{
    static Panel:{new (...args:any[]):SelectablePanel} = SelectablePanel;
    constructor(){
        super();
        this.panelStyle ="tab";
    }
}


export class GroupStyle implements ISeletablePanelStype{
    name:string;
    multiple:boolean;
    noselect:boolean;
    container:SelectablePanels;
    css:string;

    constructor(container:SelectablePanels){
        this.container = container;
        this.multiple=true;
        this.noselect = true;
       
        this.css="ya-group";
        
    }

    _onRendering(elem){
        addClass(elem,this.css);
        return elem;
    }
    _onRendered(elem){
        
        return elem;
    }

    _onPanelRendered(panel:SelectablePanel){
        let elem = panel.$element = ElementUtility.createElement("div",{"class":"ya-panel-item"}) as IElement;
        elem.appendChild(panel._labelElement);
        elem.appendChild(panel._contentElement);
        if(panel.selected===false){
            panel._contentElement.style.display="none";
        }else {
            addClass(elem,"selected");
        }
        let onclick = elem["$__panelLabelClick__"] = ()=>{
            panel.update("selected",!hasClass(elem,"selected"));
        };
        ElementUtility.attach(panel._labelElement,"click",onclick);
        
        return elem;
    }

    _onPanelSelecting(panel:SelectablePanel):boolean{
        addClass(panel.$element as IElement,"selected");
        panel._contentElement.style.display="block";
        return true;
    }

    _onPanelUnselecting(panel:SelectablePanel){
        removeClass(panel.$element as IElement,"selected");
        panel._contentElement.style.display="none";
    }

    _onExit(newStyle:ISeletablePanelStype){
        let p = this.container.$element as IElement;
        removeClass(p as any,this.css);
        for(let pn of this.container.panels){
            ElementUtility.detech(pn._labelElement,"click", pn.$element["$__panelLabelClick__"]);
            pn.$element["$__panelLabelClick__"]=null;
        }
    }
    _onApply(oldStyle:ISeletablePanelStype){
        let panels = this.container.panels;
        let parent = this.container.$element as IElement;
        parent.innerHTML="";
        addClass(parent,this.css);
        for(let panel of panels){
            let elem =this._onPanelRendered(panel);
            parent.appendChild(elem);
        }
    }
}
SelectablePanels.styles["group"] = GroupStyle;
export class Group extends SelectablePanels{
    static Panel:{new (...args:any[]):SelectablePanel} = SelectablePanel;
    constructor(){
        super();
        this.panelStyle ="group";
    }
}


export class GroupPanel extends SelectablePanel{
    constructor(){
        super();
    }
}
export class Group1 extends SelectablePanels{
    //static Panel:{new(...args:any[]):SelectablePanel}=TabPanel;
    @in_parameter()
    selectAll:boolean=true;

    @in_parameter()
    unselectAll:boolean=false;

    constructor(){
        super();
        this._panelType = SelectablePanel;
        this.noselect=true;
        this.multiple=true;
    }

    _onRendered(elem:IElement):IElement{
        if(this.selectAll===true){
            let children = this.$children;
            if(children) for(let child of children){
                (child as GroupPanel).update("selected",true);
            }
        }
        if(this.unselectAll===true){
            let children = this.$children;
            if(children) for(let child of children){
                (child as GroupPanel).update("selected",false);
            }
        }
        observableMode(ObservableModes.Observable,()=>{
            (this.selectAll as any as YA.Observable<string[]>).subscribe(e=>{
                let children = this.$children;
                if(children) for(let child of children){
                    (child as GroupPanel).update("selected",true);
                }
            },this);
            (this.unselectAll as any as YA.Observable<string[]>).subscribe(e=>{
                let children = this.$children;
                if(children) for(let child of children){
                    (child as GroupPanel).update("selected",false);
                }
            },this);
        });
        return elem;
    }

    _onPanelRendered(panel:SelectablePanel){
        super._onPanelRendered(panel);
        let elem = ElementUtility.createElement("div",{"class":"group"}) as IElement;
        elem.appendChild(panel._labelElement);
        elem.appendChild(panel._contentElement);
        panel._contentElement.style.display="none";
        ElementUtility.attach(panel._labelElement,"click",()=>{
            panel.update("selected",!hasClass(elem,"selected"));
        });
        
        return elem;
    }

    _onPanelSelecting(panel:SelectablePanel):boolean{
        
        super._onPanelSelecting(panel);
        addClass(panel.$element as any,"selected");
        panel._contentElement.style.display="block";
        return true;
    }

    _onPanelUnselecting(panel:SelectablePanel){
        super._onPanelUnselecting(panel);
        removeClass(panel.$element as any,"selected");
        panel._contentElement.style.display="none";
    }
}