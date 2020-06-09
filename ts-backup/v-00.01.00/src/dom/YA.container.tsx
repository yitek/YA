import * as YA from "../YA.core";
import * as Dom from "YA.dom";
let Observable = YA.Observable;
let isObservable = YA.Observable.isObservable;
let ObservableModes = YA.ObservableModes;
let observableMode = YA.observableMode;
let in_parameter = YA.in_parameter;
let out_parameter = YA.out_parameter;
let parameter = YA.parameter;
let Component = Dom.Component;
let ElementUtility = Dom.ElementUtility;
let hasClass = ElementUtility.hasClass;
let replaceClass = ElementUtility.replaceClass;
let addClass=ElementUtility.addClass;
let removeClass=ElementUtility.removeClass;


export class Panel extends Component{
    _labelElement:Dom.IElement;
    _contentElement:Dom.IElement;

    name:string;
    
    @parameter()
    text:string="";

    @parameter()
    width:number;

    @parameter()
    height:number;

    
    render(descriptor:YA.INodeDescriptor,elementContainer?:Dom.IElement){
        
        let panelContainer:Container= this.$parent as Container;
        
        let titleElem :Dom.IElement;
        let title = (this.text as any as YA.Observable<string>).get(YA.ObservableModes.Value);
        if(title){
            titleElem = this._labelElement = ElementUtility.createElement("li",{"class":"ya-panel-label"}) as any;
            let txtElem = ElementUtility.createElement("label",null,titleElem);
            
            YA.bindDomAttr(txtElem,"text",this.text,descriptor,this as any,(elem:Dom.IElement,name,value,old)=>{
                elem.innerHTML = value;
            });
            
        }
        
        let contentElement = this._contentElement =ElementUtility.createElement("div",{"class":"ya-panel-content"}) as any;
        
        
        YA.bindDomAttr(contentElement,"className",this.css,descriptor,this as any,(elem:Dom.IElement,name,value,old)=>{
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
export class Container extends Panel{
        
    _panelType:Function = Panel;

    

    constructor(){
        super();
        Object.defineProperty(this,"$__panels__",{enumerable:false,writable:false,configurable:false,value:[]});
    }
    get panels(){
        return (this as any).$__panels__;
    }

    

    render(descriptor,container){
        let elem :Dom.IElement;
        
        elem = document.createElement("div");
        elem.className = "ya-container";
        
        YA.bindDomAttr(elem,"className",this.css,descriptor,this as any,(elem:Dom.IElement,name,value,old)=>{
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
    _onRendering(elem:Dom.IElement):Dom.IElement{
        return elem;
    }
    _onRendered(elem:Dom.IElement):Dom.IElement{
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
    
    _onRendering(elem:Dom.IElement):Dom.IElement;
    _onRendered(elem:Dom.IElement):Dom.IElement;
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
export class SelectablePanels extends Container{
    @in_parameter()
    multiple:boolean="" as any;
    
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
                (child as SelectablePanel).update("selected",true);
            }
            this.unselectAll=false;
        }
        if(this.unselectAll===true){
            let children = this.$children;
            if(children) for(let child of children){
                (child as SelectablePanel).update("selected",false);
            }
        }
        observableMode(ObservableModes.Observable,()=>{
            (this.selectAll as any as YA.Observable<string[]>).subscribe(e=>{
                if(!this.allowMultiple || !e.value)return;
                let children = this.$children;
                if(children) for(let child of children){
                    (child as SelectablePanel).update("selected",true);
                }
                let mode = Observable.writeMode;
                Observable.writeMode = ObservableModes.Raw;
                try{
                    this.unselectAll=false;
                }finally{
                    Observable.writeMode=mode;
                }
            },this);
            (this.unselectAll as any as YA.Observable<string[]>).subscribe(e=>{
                if(!this.allowNoselect || !e.value)return;
                let children = this.$children;
                if(children) for(let child of children){
                    (child as SelectablePanel).update("selected",false);
                }
                let mode = Observable.writeMode;
                Observable.writeMode = ObservableModes.Raw;
                try{
                    this.selectAll=false;
                }finally{
                    Observable.writeMode=mode;
                }
                
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
        if(panel._labelElement)addClass(panel._labelElement,"selected");
        addClass(panel._contentElement,"selected");
        if(!isChanging)this.update("selected");
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
    private __captionsElement:Dom.IElement;
    private __contentsElement:Dom.IElement;
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
        this.__captionsElement = ElementUtility.createElement("ul",{"class":"ya-container-labels"},elem) as any;
        this.__contentsElement = ElementUtility.createElement("div",{"class":"ya-container-contents"},elem) as any;
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
        let parent = this.container.$element as Dom.IElement;
        parent.innerHTML="";
        addClass(parent,this.css);
        if(!this.__captionsElement){
            this.__captionsElement = ElementUtility.createElement("ul",{"class":"ya-panel-labels"},parent) as any;
            this.__contentsElement = ElementUtility.createElement("div",{"class":"ya-container-contents"},parent) as any;
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
        let elem = panel.$element = ElementUtility.createElement("div",{"class":"ya-container-panel"}) as Dom.IElement;
        elem.appendChild(panel._labelElement) as Dom.IElement;

        let wrapper = ElementUtility.createElement("div",{"class":"ya-container-contents"},elem);
        
        (wrapper as any).appendChild(panel._contentElement);
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
        addClass(panel.$element as Dom.IElement,"selected");
        //panel._contentElement.style.display="block";
        panel._contentElement.style.display="block";
        return true;
    }

    _onPanelUnselecting(panel:SelectablePanel){
        removeClass(panel.$element as Dom.IElement,"selected");
        panel._contentElement.style.display="none";
    }

    _onExit(newStyle:ISeletablePanelStype){
        let p = this.container.$element as Dom.IElement;
        removeClass(p as any,this.css);
        for(let pn of this.container.panels){
            ElementUtility.detech(pn._labelElement,"click", pn.$element["$__panelLabelClick__"]);
            pn.$element["$__panelLabelClick__"]=null;
        }
    }
    _onApply(oldStyle:ISeletablePanelStype){
        let panels = this.container.panels;
        let parent = this.container.$element as Dom.IElement;
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