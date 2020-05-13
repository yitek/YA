
import * as YA from "YA.core";
import * as Dom from "YA.dom";
let Observable = YA.Observable;
let ObservableSchema = YA.ObservableSchema;
let ObservableModes = YA.ObservableModes;

export function fulfillable(target,name:string){
    let handler_prop = "$__"+name+"Fulfill__";
    Object.defineProperty(target,handler_prop,{enumerable:false,configurable:false,value:null});
    target[name] = function(value:any){
        let handlers = this[handler_prop];
        if(typeof value==="function"){
            if(!handlers) handlers= this[handler_prop]=[];
            handlers.push(value);
            return this;
        }else {
            target[name]=function(value:any){
                value.call(this,this[handler_prop]);
                return this;
            }
            let handlers = this[handler_prop];
            this[handler_prop] = value;
            if(!handlers)return this;
            for(let handler of handlers){
                handler.call(this,value);
            }
            return this;
        }
    };
}
export enum FieldValueKinds{
    value,
    enum,
    collection
}
export enum Permissions{
    disable,
    hidden,
    readonly,
    writable
}

export interface IField{
    name:string;
    text?:string;
    type?:string;
    description?:string;    
    validations?:{[name:string]:any};
    kind?:string;
    expandable?:string[];
    sortable?:boolean;
    queryable?:string;
    permission?:string;
    usual?:boolean;
}

export interface IModel{
    fullname:string;
    base?:string;
    fields?:IField[];
    views?:IView[]|{[name:string]:IView};
    //field(name:string):;
}


interface ICollapse{
    relField:Field;
    prinField:Field;
}



export class Field{
    description:string;
    type:string;
    kind:FieldValueKinds;
    sortable:boolean;
    queryable:string;
    permission:Permissions;
    usual:boolean;
    valueModel:Model;
    expends:{[name:string]:Field};
    expanded:ICollapse;
    
    constructor(public name:string,public opts:IField,public model:Model){
        if(!name) throw Error("字段定义必须要有name");
        this.description = opts.description;
        this.sortable = opts.sortable===undefined?false:opts.sortable;
        this.queryable = opts.queryable;
        this.permission = opts.permission===undefined?undefined:Permissions[opts.permission];
        this.kind = opts.kind===undefined?FieldValueKinds.value:FieldValueKinds[opts.kind];
        this.usual = opts.usual;
        this.valueModel = Model.model(this.type||"string");
    }
}


export class Model{
    
    
    /**
     * 基类加载完成，字段尚未展开
     *
     * @memberof Model
     */
    load:(value:Field[]|{(fields:Field[]):any})=>Model;

    /**
     * 可展开字段已经展开，但不是所有的依赖类型都载入了
     *
     * @memberof Model
     */
    ready:(value:Model|{(model:Model):any})=>Model;

    base:Model;
    fields:{[name:string]:Field};
    fieldnames:string[];
    views:{[name:string]:View};
    dependences:Model[];
    
    constructor(public fullname:string,public opts?:IModel){
        if(!fullname) throw new Error("未定义模型的fullname");
    }
   

    static $__caches__:{[name:string]:Model}={};
    static model(type:string){
        let existed = this.$__caches__[type];
        if(!existed){
            if(YA.array_index(valueTypenames,type)){
                existed = new ValModel(type);
            }else{
                existed = this.$__caches__[type]= new RefModel(type);
            }
            
        }
        return existed;
    }
    static define(opts:IModel){
        let fullname = opts.fullname;
        let existed = this.$__caches__[fullname];
        if(existed) console.warn("正在重复定义模型",opts);
        this.$__caches__[fullname] = new RefModel(opts);
    }
    static loadModelDefination:(name:string,callback:(opts:IModel)=>any)=>any;
    
}
fulfillable(Model.prototype,"load");
fulfillable(Model.prototype,"ready");
export let valueTypenames:string[]=["boolean","string","text","number","int","float","decimal","date","datetime","guid"];


export class ValModel extends Model{
    constructor(fullname:string){
        super(fullname,{fullname:fullname});
        let fields={};
        this.load([]);
        this.fieldnames=[];
        this.views={};
        this.dependences=[];
        this.ready(this);
    }
}

export class RefModel extends Model{
    opts:IModel;

    fullname:string;
    base:Model;
    fields:{[name:string]:Field};
    fieldnames:string[];
    views:{[name:string]:View};

    $__depPaddingCount__:number;
    dependences:Model[];
    
    constructor(opts:IModel|string){
    
        
        if(typeof opts==="string"){
            super(opts as string,null);
            
            Model.loadModelDefination(opts as string,(loadedOpts)=>{
                this.opts = loadedOpts;
                this._init(loadedOpts);
            });
        }else{
            super(opts.fullname,opts);
            this._init(this.opts);
            
        }
    }
   
    private _init(opts:IModel){
        
        this._initFields();
        
    }
    private _initFields(){
        this.base = this.opts.base?Model.model(this.opts.base):null;
        if(this.base){
            this.dependences.push(this.base);
            
            this.base.load((baseFields):any=>{
                this._initThisFields(baseFields);
            });
        }else{
            this._initThisFields(null);
        }
    }
    private _initThisFields(baseFields){
        let fields = [];
        
        if(baseFields)for(let bField of baseFields) {
            this._initField(bField.name,bField.opt,fields);
        }
        
        let fieldDefs = this.opts.fields;
        if(YA.is_array(fieldDefs)){
            for(let def of fieldDefs){
                this._initField(def.name,def,fields);
            }
        }else {
            for(let n in fieldDefs){
                this._initField(n,fieldDefs[n],fields);
            }
        }
        this.load(fields);
        if(this.$__depPaddingCount__===0)  this._completeFields(fields);
    }
    private _initField(name:string,fieldOpt:IField,fields:any[]){
        let field = new Field(name,fieldOpt,this);
        fields.push(field);
        if(field.opts.expandable){
            if(field.valueModel instanceof ValModel){
                console.error("Val类型不可以展开",fieldOpt,this);
                throw new Error("Val类型不可以展开");
            }
            this.$__depPaddingCount__++;
            field.valueModel.load((relFields)=>{
                this._expandField(field,relFields);
                if(--this.$__depPaddingCount__==0) this._completeFields(fields);
            });
            
        }
    }
    
    private _expandField(field:Field,fieldFields:Field[]){
        for(let relName of field.opts.expandable){
            let refField = field.valueModel.fields[relName];
            if(!refField) {console.warn("expands使用了不存在的字段:"+relName,field);continue;}
            let expandedName = field.name + relName;
            let expandedField;
            for(let existed of fieldFields){
                if(existed.name ===name){expandedField=existed;break;}       
            }
            if(!expandedField) expandedField =  new Field(expandedName,refField.opts,this);
            let expands = (field.expends||(field.expends={}));
            expands[relName]= expandedField;
            
            expandedField.collapse={prinField:field,relField:refField};
        }
        
        
    }
    private _completeFields(fields:Field[]){
        let selfFields = this.fields={};
        for(let existed of fields){
            if(existed.expends){
                for(let n in existed.expends){
                    let expandedField = existed.expends[n];
                    selfFields[expandedField.name] = expandedField;
                }
            }
            selfFields[existed.name] = existed;
        }
        this._initViews();
        
    }
    private _initViews(){
        this.views={};
        this.views["detail"] = new View({name:"detail",kind:"detail",fields:this.fieldnames},this);
        this.views["edit"] = new View({name:"edit",kind:"edit",fields:this.fieldnames},this);
        this.views["list"] = new View({name:"list",kind:"list",fields:this.fieldnames},this);
        this.views["query"] = new View({name:"query",kind:"query",fields:this.fieldnames},this);
        if(this.opts.views){
            let views = buildViews.call(this,"views",(n,opt,model)=>new View(opt,model));
            for(let n in views) this.views[n] = views[n];
        }
        this.ready(this);
    }
}




export interface IDataField extends IField{
    dataType?:string;
    length?:number;
    precision?:number;
    key?:string;
}

export enum ViewKinds{
    detail,
    edit,
    list,
    query
}
export interface IFieldView{
    name?:string;
    permission?:string;
    viewType?:string;
    queryable?:string;
    sortable?:boolean;
    usual?:boolean;
}
class FieldView{
    permission?:Permissions;
    viewType?:string;
    queryable:string;
    usual:boolean;
    sortable:boolean;
    field:Field;

    constructor(public name:string,public opts:IFieldView,public panel:PanelView){
        let field = this.field = panel.model.fields.fields[name];
        if(!this.field) throw new Error("未能在模型"+this.panel.model.fullname+"中找到字段："+name);
        this.sortable=opts.sortable===undefined?field.sortable:opts.sortable;
        this.queryable = opts.queryable===undefined?field.queryable:opts.queryable;
        if(opts.permission===undefined){
            //其他的Permission如果放在Field上面就具有强制性
            if(this.field.permission===undefined ||this.field.permission===null || this.field.permission===Permissions.writable){
                let panelPermission = panel.permission;
                this.permission = panelPermission===undefined||null?this.field.permission:panelPermission;     
            }else this.permission = this.field.permission;
            
        }else{
            this.permission = Permissions[opts.permission];
        }
        this.viewType = opts.viewType;
        this.usual = opts.usual===undefined?this.field.usual:opts.usual;
        
        if(this.panel instanceof View){
            if(this.usual) {
                let usuals = (this.panel as View).usualFieldViews||((this.panel as View).usualFieldViews={});
                usuals[this.name] = this;
            }
            if(this.queryable!==undefined){
                let queryables = (this.panel as View).queryableFieldViews||((this.panel as View).queryableFieldViews={});
                queryables[this.name] = this;
            }
        }
    }
}

export interface IAction{
    name?:string;
    text?:string;
    url?:string;
    event?:string;
}
export enum PanelTypes{
    normal,
    group,
    tab
}
export interface IPanelView{
    name?:string;
    text?:string;
    permission?:string;
    kind?:string;
    fields?:IFieldView[]|string[]|{[name:string]:IFieldView|string};
    actions?:IAction[];
}
export class PanelView{
    name:string;
    text:string;
    panelType:PanelTypes;
    permission:Permissions;
    kind:ViewKinds;
    views:{[name:string]:FieldView};
    constructor(public opts:IPanelView,public model:Model,public panel:PanelView){
        this.panelType = PanelTypes.normal;
        this.name = opts.name;
        this.text = opts.text;
        this.kind = opts.kind===undefined ?undefined:ViewKinds[opts.kind];
        this.permission = opts.permission===undefined?undefined:Permissions[opts.permission];
        if(this.permission===undefined&& this.kind!==undefined){
            switch(this.kind){
                case ViewKinds.detail:this.permission = Permissions.readonly;
                case ViewKinds.edit:this.permission = Permissions.writable;
                case ViewKinds.list:this.permission = Permissions.readonly;
                case ViewKinds.query:this.permission = Permissions.readonly;
            }
        }
        model.ready(()=>{
            this.views = buildViews.call(this,"fields",(n,opt,panel)=>new FieldView(n,opt,panel));
        });
    }

    each(callback:{(field:FieldView,panel:PanelView):any}):PanelView{
        for(let n in this.views){
            callback(this.views[n],this);
        }
        return this;
    }
}
fulfillable(Model.prototype,"ready");

function buildViews(optName,factory){
    let views = {};
    let viewOpts = this.opts[optName];
    if(!viewOpts) return views;
    if(YA.is_array(viewOpts)){
        for(let opt of viewOpts as any[]){
            if(typeof opt==="string"){
                let view = factory(opt as string,{},this);
                views[view.name] = view;
            }else{
                let name = opt.name;
                let field = factory(name,opt,this);
                views[field.name] = field;
            }
        }
    }else {
        for(let name in viewOpts){
            let view = factory(name,viewOpts[name],this);
            views[view.name] = view;
        }
    }
    return views;
}


export interface IGroupView extends IPanelView{
    name?:string;
    text?:string;
    panels?:IPanelView[]|{[name:string]:IPanelView};
}
export class GroupView extends PanelView{
    panels:{[name:string]:PanelView}
    constructor(opts:IGroupView,model:Model,panel:PanelView){
        super(opts,model,panel);
        let panels = this.panels = {};
        if(opts.panels){
            model.ready((model)=>{
                this.panels = buildViews.call("panels",(n,opt,panel)=>new PanelView(opt,model,this));
            });
        }
    }
    each(callback:{(field:FieldView,panel:PanelView):any}):PanelView{
        super.each(callback);
        for(let n in this.panels) this.panels[n].each(callback);
        return this;
    }
}
export interface ITabView extends IGroupView{
    tabs?:ITabView[];
}
export class TabView extends PanelView{
    tabs:{[name:string]:GroupView}
    constructor(opts:IGroupView,model:Model,panel:PanelView){
        super(opts,model,panel);
        let panels = this.tabs = {};
        if(opts.panels){
            model.ready((model)=>{
                this.tabs = buildViews("tabs",(n,opt,panel)=>new GroupView(opt,model,this));
            });
        }
    }
    each(callback:{(field:FieldView,panel:PanelView):any}):PanelView{
        super.each(callback);
        for(let n in this.tabs) this.tabs[n].each(callback);
        return this;
    }
}


export interface IView extends ITabView{
    rowActions?:IAction[];
    pageable?:boolean;
    sortable?:boolean;
}
export class View extends TabView{
    queryableFieldViews:{[name:string]:FieldView}=null;
    usualFieldViews:{[name:string]:FieldView}=null;
    modelSchema:YA.ObservableSchema<any>;
    listSchema:YA.ObservableSchema<any>;
    querySchema:YA.ObservableSchema<any>;

    constructor(opts:IView,model:Model){
        super(opts,model,null);
    }
    private _initSchema(){
        let schema=this.modelSchema = new ObservableSchema(null);
        schema.asObject();
        let querySchema;
        if(this.kind == ViewKinds.query){
            this.querySchema = new ObservableSchema(null);
            querySchema.asObject();
        }
        
        this.each((fieldView)=>{
            if(fieldView.field.expends){
                this._initExpandableFieldSchema(schema,fieldView);
            }else if(fieldView.field.expanded){
                this._initExpandedFieldSchema(schema,fieldView);
            }else{
                schema.defineProp(fieldView.name);
            }
            if(fieldView.queryable!==undefined && querySchema){
                if(fieldView.queryable==="range"){
                    querySchema.defineProp(fieldView.name + "_min");
                    querySchema.defineProp(fieldView.name + "_max"); 
                }else {
                    querySchema.defineProp(fieldView.name);
                }
            }
        });
        if(this.kind===ViewKinds.query || this.kind ===ViewKinds.list){
            let listSchema = this.listSchema = new ObservableSchema([]);
            listSchema.asArray();
        }
        return schema;
    }

    private _initExpandableFieldSchema(targetSchema:YA.ObservableSchema<any>,fieldView:FieldView){
        let setter=function(value){
            let rmode =Observable.readMode;
            Observable.readMode = ObservableModes.Value;
            try{
                for(let n in fieldView.field.expends){
                    let expandedField = fieldView.field.expends[n];
                    this[expandedField.name] = value?value[n]:undefined;
                }
            }finally{
                Observable.readMode = rmode;
            }
        };
        let fieldSchema = targetSchema.defineProp(fieldView.name,null,setter);
        fieldSchema.asObject();
        for(let n in fieldView.field.expends){
            let expandedField = fieldView.field.expends[n];
            fieldSchema.defineProp(expandedField.name);
        }
        return fieldSchema;
    }

    private _initExpandedFieldSchema(targetSchema:YA.ObservableSchema<any>,fieldView:FieldView){
        let setter = function(value){
            let rmode =Observable.readMode;
            Observable.readMode = ObservableModes.Default;
            try{
                let collapsedValue = this[fieldView.field.expanded.prinField.name];
                if(!collapsedValue) {
                    let newValue = {};
                    newValue[fieldView.field.expanded.relField.name]=value;
                    this[fieldView.field.expanded.prinField.name]=newValue;
                }
                else {
                    collapsedValue[fieldView.field.expanded.relField.name]=value;
                }
            }finally{
                Observable.readMode = rmode;
            }
        };
        let fieldSchema = targetSchema.defineProp(fieldView.name,undefined,setter);
        return fieldSchema;
    }

}

