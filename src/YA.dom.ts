import * as YA from "YA.core";




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
    
    if(YA.Observable.isObservable(bindValue)){
        let value = bindValue.get(YA.ObservableModes.Value);
        if(typeof value==="string"){
            elem.style.cssText = bindValue;
        }else {
            for(var n in value) ElementUtility.setStyle(elem,n,value[n]);
        }
        bindValue.subscribe((e)=>{
            let value = e.value;
            if(typeof value==="string"){
                elem.style.cssText = bindValue;
            }else {
                for(var n in value) ElementUtility.setStyle(elem,n,value[n]);
            }
        },compInstance);
    }else {
        for(var n in bindValue)((value,name)=>{
            if(YA.Observable.isObservable(value)){
                value.subscribe((e:YA.IChangeEventArgs<any>)=>{
                    ElementUtility.setStyle(elem,name,e.value);
                },compInstance);
                ElementUtility.setStyle(elem,name,value.get(YA.ObservableModes.Value));
            }else{
                ElementUtility.setStyle(elem,name,value);
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
    if(YA.Observable.isObservable(bindValue)){
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



class Panel extends Component{   
    _labelElement:IElement;
    _contentElement:IElement;
    name:string;
    @YA.in_parameter()
    css:string;
    @YA.parameter()
    label:string;
    @YA.parameter()
    selected:boolean;

    select(selected?:boolean,onlyHideSelf?:boolean):Panel{
        let container = (this.$parent as PanelContainer);
        if(container._selectPanelChanging(this,container.lastSelectedPanel,selected===undefined?true:selected,onlyHideSelf)===false)return this;
        
        return this;
    }
    
    render(descriptor:YA.INodeDescriptor,elementContainer?:IElement){
        let selected:boolean;
        let panelContainer:PanelContainer= this.$parent as PanelContainer;
        let className = (panelContainer.className || "panelContainer");
        YA.observableMode(YA.ObservableModes.Value,()=>{
            selected = this.selected;
        });
        let titleElem = this._labelElement = ElementUtility.createElement("li",{"class":className + "-label"}) as any;
        let txtElem = ElementUtility.createElement("label",null,titleElem);
        let contentElement = this._contentElement =ElementUtility.createElement("div",{"class":className + "-content"}) as any;
        

        YA.bindDomAttr(txtElem,"text",this.label,descriptor,this as any,(elem:IElement,name,value,old)=>{
            elem.innerHTML = value;
        });
        
        YA.bindDomAttr(titleElem,"className",this.css,descriptor,this as any,(elem:IElement,name,value,old)=>{
            replaceClass(elem,old, value,true);
            //replaceClass(this.__contentElement,old,value,true);
        });
        let selectedAttr = descriptor.selected;
        if(selectedAttr) selectedAttr.subscribe((e)=>{
            this.select(e.value);
        },this);
        ElementUtility.attach(titleElem,"click",()=>this.select());
        YA.bindDomAttr(contentElement,"className",this.css,descriptor,this as any,(elem:IElement,name,value,old)=>{
            replaceClass(elem,old,value,true);
        });
        YA.createElements(descriptor.children,contentElement,this as any);
        

        (this.selected as any as YA.Observable<any>).subscribe((e)=>{
            this.select(e.value);
        },this);
        let rs = panelContainer._panelCreated(this,titleElem,contentElement);
        if(selected) this.select(true);
        return rs;
    }
}
export class PanelContainer extends Component{
    static Panel:{new(...args:any[]):Panel}=Panel;
    lastSelectedPanel:Panel;
    defaultPanel:Panel;
    className:string;
    
    _panelType:Function;
    panels:Panel[];
    @YA.out_parameter()
    selectedPanels:string[]=[];
    @YA.in_parameter()
    css:string="";

    
    

    constructor(){
        super();
    }

    @YA.parameter()
    selected:string;
    @YA.in_parameter()
    defaultPanelName:string;

    render(descriptor:YA.INodeDescriptor,container:IElement):any{
        let elem :IElement;
        let className = this.className = this.className || "panelContainer";
        elem = document.createElement("div");
        elem.className=className;
        YA.bindDomAttr(elem,"className",this.css,descriptor,this as any,(elem:IElement,name,value,old)=>{
            replaceClass(elem,old, value,true);
        });
        this._elementCreated(elem);

        
        let children = descriptor.children;
        let selectedPanels :Panel[]=[];
        for(let child of children){
            if(this._panelType && (child as any).Component!==this._panelType) continue;
            let panel = YA.createComponent((child as any).Component,child as any,null,this,{returnInstance:true}) as Panel;
            if(!panel.name) panel.name=className +"-"+YA.cid();
            if(!this.panels)this.panels = [];
            this.panels.push(panel);
            YA.observableMode(YA.ObservableModes.Value,()=>{
                if(panel.selected) selectedPanels.push(panel);
            });
        }
        
        this._rendered(selectedPanels);
        return elem;
    }

    /**
     * 容器div已经创建，主要负责构建容器内部结构
     *
     * @param {IElement} elem
     * @memberof PanelContainer
     */
    _elementCreated(elem:IElement){}

    /**
     * 主要负责把Panel装到正确的容器element中
     * 
     * @param {Panel} panel
     * @memberof PanelContainer
     */
    _panelCreated(panel:Panel,titleElem,cotnentElem):any{

    }

    _rendered(selectedPanels:Panel[]){

    }


    _selectPanelChanging(panel:Panel,lastSelectedPanel:Panel,selected:boolean,onlyUnselect:boolean):boolean{
        return true;
    }
}

export class Tab extends PanelContainer{
    static Panel:{new(...args:any[]):Panel}=Panel;
   
    __captionsElement:IElement;
    __contentsElement:IElement;

    constructor(){
        super();
    }

    /**
     * 容器div已经创建，主要负责构建容器内部结构
     *
     * @param {IElement} elem
     * @memberof PanelContainer
     */
    _elementCreated(elem:IElement){
        this.__captionsElement = ElementUtility.createElement("ul",{"class":"ya-tab-labels"},elem) as any;
        this.__contentsElement = ElementUtility.createElement("div",{"class":"ya-tab-contents"},elem) as any;
    }

    /**
     * 主要负责把Panel装到正确的容器element中
     * 
     * @param {Panel} panel
     * @memberof PanelContainer
     */
    _panelCreated(panel:Panel,labelElem,contentElem){
        this.__captionsElement.appendChild(labelElem);
        this.__contentsElement.appendChild(contentElem);
        contentElem.style.display="none";
        let rs = [labelElem,contentElem] as any;
        rs.$__alreadyAppendToContainer = true;
        return rs;
    }

    _rendered(selectedPanels){
        debugger;
        if(selectedPanels.length){
            selectedPanels[selectedPanels.length-1].select(true);
        }else{
            if(this.panels.length){
                this.panels[0].select(true);
            }
            
        }
    }

    /**
     * 主要负责panel的elemeent的操作，panel自身的状态已经处于selected
     *
     * @param {Panel} panel
     * @param {Panel} lastSelectedPanel
     * @memberof PanelContainer
     */
    _selectPanelChanging(panel:Panel,lastSelectedPanel:Panel,selected:boolean,onlyUselect:boolean):boolean{
        if(selected===undefined) selected =true;
        if(selected){
            if(panel===lastSelectedPanel)return false;
            //隐藏原先选中的tab，但不做其他工作
            
            if(lastSelectedPanel){
                lastSelectedPanel.select(false,true);
            }
            
            addClass(panel._labelElement,"selected");
            addClass(panel._contentElement,"selected");
            this.lastSelectedPanel = panel;
            if(!this.defaultPanel)this.defaultPanel=panel;
            panel._contentElement.style.display="block";
            panel.selected=true;
            this.selectedPanels=[panel.name];
        }else{
            if(this.lastSelectedPanel!==panel) return false;
            removeClass(panel._labelElement,"selected");
            removeClass(panel._contentElement,"selected");
            panel.selected = false;
            panel._contentElement.style.display="none";
            if(!onlyUselect) (this.$parent as PanelContainer).defaultPanel.select();
        }
        return true;
    }

}
Tab.prototype.className = "ya-tab";

export class Groups extends PanelContainer{
    static Panel:{new(...args:any[]):Panel}=Panel;
    @YA.parameter()
    multiple:boolean=true;

    @YA.in_parameter()
    expanded:boolean=true;

    @YA.in_parameter()
    collapsed:boolean=false;
   
    constructor(){
        super();
    }

    /**
     * 主要负责把Panel装到正确的容器element中
     * 
     * @param {Panel} panel
     * @memberof PanelContainer
     */
    _panelCreated(panel:Panel,labelElem,contentElem){
        let panelElem = ElementUtility.createElement("div",{"class":this.className+"-" + "panel"}) as IElement;
        panelElem.appendChild(labelElem);
        panelElem.appendChild(contentElem);
        return panelElem;
    }

    _rendered(selectedPanels:Panel[]){
        YA.observableMode(YA.ObservableModes.Value,()=>{
            if(this.expanded){
                for(let pn of this.panels) pn.select(true);
            }else if(this.collapsed){
                for(let pn of this.panels) pn.select(false);
            }else{
                for(let pn of selectedPanels) pn.select(true);
            }
        });
    }

    _selectedPanelChanging(panel:Panel,oldPanel:Panel,selected:boolean):boolean{
        let elem = panel.$element as any;
        if(selected===false){
            if(removeClass(elem,"selected")){
                let panels = this.selectedPanels;
                if(panels){
                    for(let i =0,j=panels.length;i<j;i++) {
                        let p = panels.shift();
                        if(p!==panel.name) panels.push(p);
                    }
                }
                this.selectedPanels = panels;
            }
            return true;
        }
        YA.observableMode(YA.ObservableModes.Value,()=>{
            if(toggleClass(elem,"selected")){
                let panels = this.selectedPanels;
                if(panels) panels.push(panel.name);
                else panels = [panel.name];
                this.selectedPanels = panels;
                if(!this.multiple){
                    oldPanel.select(false);
                }
            }else{
                let panels = this.selectedPanels;
                if(panels){
                    for(let i =0,j=panels.length;i<j;i++) {
                        let p = panels.shift();
                        if(p!==panel.name) panels.push(p);
                    }
                }
                this.selectedPanels = panels;
            }
        });
        
        return true;
    }
}
