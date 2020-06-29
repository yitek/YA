

if(typeof Object.defineProperty==="undefined"){
    Object.defineProperty = (obj:any,name:string,descriptor:any)=>{
        obj[name] = descriptor.value;
    }
}
let _toString = Object.prototype.toString;
function is_array(obj){
    return _toString.call(obj)==="[object Array]"; 
}
function in_array(arr:any[],item:any,compare?:(item1,item2)=>boolean):boolean{
    if(!compare){
        for(const aItem of arr) {
            if(aItem===item) return true;
        }
        return false;
    }else{
        for(const aItem of arr) {
            if(compare(aItem,item)) return true;
        }
        return false;
    }
    
}
function extend(){
    let target = arguments[0];
    for(let i=1,j=arguments.length;i<j;i++){
        let src = arguments[i];
        for(let n in src) target[n] = src[n];
    }
    return target;
}

export function merge(dest:any,src:any){
    if(!src) return dest;
    let destType = typeof dest;
    let srcType = typeof src;
    if(destType==="object"){
        if(srcType==="object"){
            return _merge(dest,src);
        }else {
            if(dest===null) return src;
            return dest;
        }
    }else {
        if(srcType==="object"){
            if(src===null)return dest;
            else clone(src);
        }
        return src;
    }
}

function _merge(dest:any,src:any,propname?:string){
    if(propname===undefined){
        for(let n in src) _merge(dest,src,propname);
        return dest;
    }
    let srcPropValue = src[propname];
    let srcPropValueType = typeof srcPropValue;
    let destPropValue= dest[propname];
    let destPropValueType=  typeof destPropValue;

    if(destPropValueType==="object"){
        if(destPropValue===null){
            if(srcPropValueType==="object"){
                if(srcPropValue===null) return null;
                else  dest[propname] = clone(srcPropValue);
            }else if(srcPropValue==="undefined") return null;
            else return dest[propname] = srcPropValue;
        }else {
            if(srcPropValueType==="object"){
                if(srcPropValue===null) return srcPropValue;
                else  return dest[propname] = _merge(destPropValue,destPropValue);
            }else return destPropValue;
        }
    }else{
        if(srcPropValueType==="object"){
            if(srcPropValue===null) return srcPropValue;
            return dest[propname] = clone(srcPropValue);
        }else if(srcPropValue!==undefined) return dest[propname] = srcPropValue;
        return destPropValue;
    }

}
function clone(src:any){
    if(typeof src==="object"){
        let dest = is_array(src)?[]:{};
        for(let n in src) dest[n] = clone(src[n]);
    }else {return src;}
}

class Exception extends Error{
    constructor(message:string,innerEx?:any,attr?){
        super(message);
        if(attr) for(let n in attr) (this as any)[n]=attr[n];
        this.innerException = innerEx;
    }
    innerException:Exception;
}

class Fulfilled{
    constructor(public value:any){}
}

function fulfillable(target:any,name:string|string[]){
    if(is_array(name)){
        for(const n of name) fulfillable(target,n);
        return;
    }
    let private_name = `$__${name}__`;
    let isError = name==="error";
    Object.defineProperty(target,name as string,{enumerable:false,
        value:function(handler:(value)=>any){
            //自己不是错误事件，但有错误，什么都不做
            if(!isError && this.$__error__ instanceof Fulfilled) return this;
            let evt:{(value:any):any}[]|Fulfilled = target[private_name];
            if(!evt) {
                this[private_name]=evt=[handler];
            }else if(evt instanceof Fulfilled) {
                handler.call(this,evt.value,this);
                return this;
            }else {
                (evt as {(value:any):any}[]).push(handler);
            }
            return this;
        }
    });
}
function fulfill(target,name:string,value:any){
    let private_name = `$__${name}__`;
    let evt = target[private_name];
    if(evt instanceof Fulfilled) throw new Exception(`${name}事件已经设置了终值`,null,{target:target});
    let isError = name==="error";
    let fulfilled = new Fulfilled(value);
    target[private_name] = fulfilled;
    Object.defineProperty(target,name,{configurable:false,value:function(handler:(value:any)=>any){
            if(!isError && this.$__error__ instanceof Fulfilled) return this;
            handler.call(this,this[private_name].value,this);
            return this;
        }
    });
}
/////////////////////////////////////////////////
// 字段
//
export enum ReferenceTypes{
    byval,
    oneOne,
    manyOne,
    oneMany,
    manyMany
}

export interface IReference{
    type:ReferenceTypes;
    primary:Field;
    foreign:Field;
}

export interface IFieldOptions{
    name?:string;
    text?:string;
    type?:string;
    referenceType?:string;
    dataType?:string;
    required?:boolean|string;
    length?:{min?:number,max?:number,trim?:boolean};
    precisions?:{ipart?:number,fpart?:number};

    viewType?:string;
    permission?:string;
    important?:boolean;
    rules?:{[name:string]:any};
}





class Field{
    type:Model;
    text:string;
    declareType:Model;
    dataType:string;
    required:string|boolean;
    length:{min?:number,max?:number,trim?:boolean};
    precisions:{ipart?:number,fpart?:number};
    viewType:ViewFieldTypes;
    important:boolean;
    permission:Permissions;
    reference?:IReference;
    rules?:{[name:string]:any};
    constructor(public ownModel:Model, public opts?:IFieldOptions,public name?:string){
        if(!opts)return;
        //name
        this.name = name || opts.name;
        //text
        this.text = opts.text || this.name;
        //declareType
        this.declareType = ownModel;
        
        //dataType
        this.dataType = opts.dataType;
        if(opts.viewType)this.viewType = ViewFieldTypes[opts.viewType];
        if(this.viewType===undefined) this.viewType = ViewFieldTypes.default;
        this.important = opts.important;
        if(!this.important) this.important = false;
        if(opts.permission!==undefined) this.permission = ViewFieldTypes[opts.permission];
        this.type = ModelUtility.model(opts.type||"string");
        
        let lenRule = this.rules["length"];
        if(lenRule){
            if(typeof lenRule==="number") this.rules["length"] = {max:lenRule};
            if(is_array(lenRule)) this.rules["length"] = {min:lenRule[0],max:lenRule[1]};
            if(this.length===undefined) this.length = this.rules["length"].max;
        }

        this.type.error((ex)=>{
            let exc = new Exception(`模型${ownModel.name}加载${this.name}字段失败`,ex);
            fulfill(this,"error",exc);
        }).defined((fields,sender)=>{
            fulfill(this,"ready",this);
        });
        buildRules(this,opts);

    }
    clone(model:Model):Field{
        let cloneField = new Field(model);
        for(let n in this){
            if(n==="model")continue;
            (cloneField as any)[n] = this[n];
        }
        return cloneField;
    }
    validate(value:any,noRequired?:boolean):IValidateResult{
        let typename = this.ownModel.name;
        
        if(!this.rules)return null;
        
        for(let n in this.rules){
            if(n==="required"){
                if(noRequired)continue;
                if(value===undefined||value===null || value==="")continue;
            }
            let rule = this.rules[n];
            if(!rule["rule-name"]) rule['rule-name']=n;
            let validator = validators[n];
            if(!validator){
                console.warn(`${this.ownModel.name}.${this.name}的验证规则${n}未注册，请检查validators.`);
                continue;
            }
            let msgName = validator(value,this.rules[n],this);
            if(!msgName){
                let msg = rule[msgName] || validateMessages[msgName] ||"输入验证未通过";
                return {
                    field:this,
                    rule:rule,
                    message :msg
                };
            }else return null;
        }
    }
    setValue(data:any,value:any):Field{
        return this;
    };
    ready(handler:(value:any,sender:Field)=>any):Field{return this;}
    error(handler:(value:any,sender:Field)=>any):Field{return this;}
}
fulfillable(Field.prototype,["ready","error"]);

interface IModelOptions{
    extends?:string[];
    fields:{[name:string]:IFieldOptions}|IFieldOptions[];
}

interface IModelUtility{
    loadDefination?:(name:string,callback:(data:any)=>any)=>any;
    model?:(name:string)=>Model;
    createElement?:(tag:string,attr?:any,parent?:HTMLElement)=>HTMLElement;
}

export interface IValidateResult{
    field:Field;
    rule:any;
    message:string;
}

function buildRules(field:Field,fieldOpts:IFieldOptions){
    let rules:{[name:string]:any}={};
    //required
    if(fieldOpts.required) rules.required = fieldOpts.required;
    else if(fieldOpts.rules?.required) rules["required"] = fieldOpts.rules.required;
    
    //type
    if(!rules[field.type.name]){
        let typeValidator = validators[field.type.name];
        if(typeValidator){
            rules[field.type.name] = null;
        }
    }
    
    if(field.type instanceof StringModel){
        //length
        if(fieldOpts.length) field.length = rules.length = fieldOpts.length;
        else if(fieldOpts.rules?.length) field.length = rules.length = fieldOpts.rules.length;
    }
    
    if(field.type instanceof NumberModel){
        //precisions
        if(fieldOpts.precisions) field.precisions = rules.precisions = fieldOpts.precisions;
        else if(fieldOpts.rules?.precisions) field.precisions = rules.precisions = fieldOpts.rules.precisions;
    }
    
    if(fieldOpts.rules){
        for(const n in fieldOpts.rules){
            if(n==="required" || n==="length" || n==="percisions" || n === field.type.name) continue;
            rules[n] = fieldOpts.rules[n];
        }
    }
    field.rules = rules;

}

export let validators :{[name:string]:(value:any,rule:any,field:Field)=>string}={};
export let validateMessages:{[name:string]:string}={};

validators.required = (value:any,opts:any,field:Field):string=>{
    if(value===undefined || value===null || value==="") return "required";
    if(opts==="trim"){
        value = value.toString().replace(trimRegx,"");
        return value?null:"required";
    }
    if(opts==="not-empty"){
        for(let n in value) return null;
        return "required";
    }
    return null;
}
validateMessages.required = "必填";

validators.length = (value:any,opts:any,sender:Field):string=>{
    value = value===null||value===undefined?"":value.toString();
    if(opts.trim) value = value.replace(trimRegx,"");
    let length = value.length;
    if(typeof opts==="number"){
        return length<=opts?"":"length-max";
    }else if(is_array(opts)){
        if(opts.length===1)return length>=opts[0]?"":"length-min";
        if(opts.length===2) return length>=opts[0]&& length<=opts[1]?"":"length";
        else console.warn(`${sender.ownModel.name}.${sender.name}的length验证配置不正确,未执行length验证`,opts);
        return "";
    }else {
        if(opts.min!==undefined){
            if(opts.max!==undefined){
                return length>=opts.min && length<=opts.max?"":"length";
            }else return length>=opts.min?"":"length-min";
        }else if(opts.max!==undefined)return length<=opts.max?"":"length-max";
        else {
            console.warn(`${sender.ownModel.name}.${sender.name}的length验证配置不正确,未执行length验证`,opts);
            return "";
        }
    }
}
validateMessages.length = "字符数量要在{min}-{max}之间";
validateMessages["length-min"] = "字符数量至少要{min}个";
validateMessages["length-max"] = "字符数量至多{max}个";

validators.regx = (value:any,opts:any,sender:Field):string=>{
    let regx = new RegExp(opts,"g");
    return regx.test(value)?"":"regx";
};
validateMessages.length = "不符合要求格式";

let intRegx = /\s*[\+\-]?\d+\s*/g;
validators.int = (value:any,opts:any,sender:Field):string=>{
    value = value.toString().replace(trimRegx,"");
    if(value==="") return "";
    return intRegx.test(value.toString())?"":"int";
};
validateMessages.int = "必须是整数";

let uintRegx = /\s*[\+\-]?\d+\s*/g;
validators.int = (value:any,opts:any,sender:Field):string=>{
    value = value.toString().replace(trimRegx,"");
    if(value==="") return "";
    return uintRegx.test(value.toString())?"":"uint";
};
validateMessages.int = "必须是正整数";

validators.number = (value:any,opts:any,sender:Field):string=>{
    if(typeof value==="number") {value=value.toString();}
    else {
        value = value.toString().replace(/,/g,"").replace(trimRegx,"");
        if(value==="") return "";
        if(parseFloat(value)!==NaN) return "";else return "number";
    }
    if(opts){
        value = value.replace(/^[\-\+]/,"");
        let ns = value.split(".");
        if(opts.ipart!==undefined) {
            return ns[0].length<=opts.ipart?"":"number-ipart";
        }if(opts.fpart!==undefined){
            if(ns[1]?.length>opts.fpart) return "number-fpart";
            return "";
        }
    }
};
validateMessages.number = "必须是数字";
validateMessages["number-ipart"] = "整数部分数字个数不能超过{ipart}个";
validateMessages["number-fpart"] = "小数部分数字个数不能超过{fpart}个";

class Model{
    base?:Model;
    extends?:{[name:string]:Model};
    name:string;
    fields:{[name:string]:Field};
    opts:IModelOptions;
    byval:boolean;
    constructor(name:string,opts:IModelOptions){
        this.name = name;
        this.fields = {};
        this.extends ={};
        if(!opts){
            ModelUtility.loadDefination(name,(opts)=>{
                initModel(this,opts);
            });
        }else initModel(this,opts);
    }
    
    /**
     * 已加载配置
     *
     * @param {(value:IModelOptions,sender:Model)=>any} handler
     * @returns {Model}
     * @memberof Model
     */
    load(handler:(value:IModelOptions,sender:Model)=>any):Model{return this;}

    /**
     * 所有字段名已经完成，但字段的类型还未加载完成
     *
     * @param {(value:{[name:string]:Field},sender:Model)=>any} handler
     * @returns {Model}
     * @memberof Model
     */
    defined(handler:(value:{[name:string]:Field},sender:Model)=>any):Model{return this;}

    /**
     * 字段与字段类型都已加载完成
     *
     * @param {(value:Model,sender:Model)=>any} handler
     * @returns {Model}
     * @memberof Model
     */
    ready(handler:(value:Model,sender:Model)=>any):Model{return this;}
    error(handler:(value:any,sender:Model)=>any):Model{return this;}
}
fulfillable(Model.prototype,["error","load","defined","ready"]);

class ValueModel extends Model{
    constructor(name:string,opts:any){
        super(name,opts);
        this.byval=true;
    }
}
class StringModel extends ValueModel{
    constructor(name?:string){
        super(name||"string",null);
    }
}

class NumberModel extends ValueModel{
    constructor(name?:string){
        super(name||"number",null);
    }
}

function initModel(model:Model,opts:IModelOptions){
    model.opts = opts; 
    fulfill(model,"load",opts);
    initBase(model,(m)=>{
        initFields(m,(m)=>{
            initExtends(m,(m)=>{
                fulfill(m,"defined",m.fields);
                let taskcount = 1;
                let err=false;
                for(let n in m.fields){
                    m.fields[n].error((e)=>{
                        err = true;
                        let ex = new Exception(`模型${model.name}加载字段失败`,e);
                        fulfill(this,"error",ex);
                    }).ready((e)=>{
                        if(err) return;
                        if(--taskcount===0) fulfill(this,"ready",this);
                    });
                }
                if(--taskcount===0) fulfill(this,"ready",this);
            });
        });
    });
}
function initBase(model:Model,callback:(model:Model)=>any):void{
    let baseName:string;
    if(model.opts.extends && model.opts.extends.length && (baseName= model.opts.extends[0])){
        baseName = baseName.replace(trimRegx,"");
    }
    if(!baseName) {callback(model);return;}
    model.base = ModelUtility.model(baseName).error((ex)=>{
        let exc= new Exception(`模型[${model.name}]的基类有错误`,ex);
        fulfill(model,"error",exc);
        
    }).ready((base)=>{
        model.base = base;
        for(let n in base.fields){
            model.fields[n] = base.fields[n].clone(model);
        }
        model.extends[base.name] = base;
        callback(model);
    });
}

function initFields(model:Model,callback:(model:Model)=>any):Model{
    let fieldOpts = model.opts.fields;
    if(!fieldOpts||fieldOpts.length===0){
        callback(model);return model;
    }
    let isArr = Object.prototype.toString.call(fieldOpts)==="[object Array]";
    for(let n in fieldOpts){
        let fieldOpt = fieldOpts[n];
        let field = new Field(this,fieldOpt,isArr?undefined:n);
        model.fields[field.name] = field;
    }
    callback(model);
    return model;
}

function initExtends(model:Model,callback:(model:Model)=>any):void{
    if(!model.opts.extends || model.opts.extends.length<=1){
        callback(model);
    }
    let taskcount = 1;
    let hasError = false;
    let extend:Model[] = [];
    let resolve =()=>{
        if(hasError)return;
        for(const ext of extend){
            for(let n in ext.fields){
                model.fields[n]= ext.fields[n].clone(model);
            }
        }
        callback(model);
    };
    for(let i=1,j=model.opts.extends.length;i<j;i++)(function(name,i){
        extend[i] = ModelUtility.model(name).error(ex=>{
            let exc = new Exception(`[${model.name}]加载扩展模型${name}时发生错误`,ex);
            fulfill(model,"error",exc);
            hasError=true;
        }).ready((m)=>{
            if(--taskcount==0) resolve();
        });
    })(model.opts.extends[i],i);
    if(--taskcount==0) resolve();
}




///////////////////////////////////////////////////////////////////////////////////////
export enum ViewTypes{

    /**
     * 数据字段
     */
    field,

    /**
     * 下拉选项
     */
    dropdown,

    /**
     * 联想
     */
    legend,

    /**
     * 弹出框
     */
    pop,

    /**
     * 按键
     */
    action,

    /**
     * 容器
     */
    container,
    /**
     * 详情
     */
    detail,

    /**
     * 编辑
     */
    edit,

    /**
     * 列表
     */
    list,

    /**
     * 过滤面板
     */
    filter,

    /**
     * 查询
     */
    query
}

export enum Permissions{
    hidden,
    readonly,
    writable
}

export enum  ViewFieldTypes{
    default,
    button,
   
    list,
    detail
}
enum FieldQueryTypes{
    none,
    eq,
    range
}
export interface IViewOptions{
    name?:string;
    viewType?:string;
    control?:string;
    text?:string;
    css?:string;
    permission?:string;
    [attr:string]:any;
}

export interface IFieldViewOptions extends IViewOptions,IFieldOptions{
    queryable?:string;
    important?:boolean;
}
export interface IDropdownViewOptions extends IViewOptions,IFieldOptions{
    items?:any[]|{[key:string]:any};
    key?:string;
    value?:string;
    url?:string;
    cache?:boolean;
}
export interface ILegendViewOptions extends IViewOptions,IFieldOptions{
}

export interface IPopViewOptions extends IViewOptions,IFieldOptions{}

export interface IActionViewOptions extends IViewOptions{
    target?:string;
    url?:string;
    handler?:string;
}
export interface IContainerViewOptions extends IViewOptions{
    components:{[name:string]:IViewOptions};
    includes?:string[];
    excludes?:string[];
}

export interface IModelViewOptions extends IContainerViewOptions{
    model?:string;
}



export class View{
    viewType:ViewTypes;
    css:string;
    text:string;
    control:IControl;
    permission:Permissions;
    model:Model;

    constructor(public parentView:ContainerView,public opts:IViewOptions,public name?:string){
        if(!name) this.name = opts.name;
        if(opts.viewType)this.viewType = ViewTypes[opts.viewType];
        if(!this.viewType) this.viewType = ViewTypes.detail;
        this.css= ViewTypes[this.viewType];
        if(this.name) this.css +=" " + this.name;
        if(opts.css) this.css += " " + opts.css;
        this.text = opts.text;
        if(opts.control) this.control = controls[opts.control];
        else {
            this.control = controls[ViewTypes[this.viewType]];
        }
        if(opts.permission!==undefined){
            this.permission = Permissions[opts.permission];
            if(this.permission===undefined){
                this.permission = getDefaultPermission(this);
                if(this.permission===undefined){
                    console.warn('未找到权限',this);
                }else {
                    console.warn(`指定的权限值${opts.permission}不正确,设置为默认的${Permissions[this.permission]}`);
                }
            }
        }else {
            this.permission = getDefaultPermission(this);
            if(this.permission===undefined){
                console.warn('未找到权限',this);
            }
        }
        let p = parentView;
        while(p){
            if(p.model){
                this.model = p.model;
                break;
            }
        }

    }
    ready(handler:(view:View)=>any):View{
        handler.call(this,this,this);
        return this;
    }
    render(container?:HTMLElement):HTMLElement{
        if(this.control) return this.control.createElement({
            container:container,
            view:this
        });
    }
}
function getDefaultPermission(view:View):Permissions{
    let p = view.parentView;
    while(p){
        if(p.permission!==undefined)return p.permission;
        p = p.parentView;
    }
    
}


export class FieldView extends View{
    queryable:FieldQueryTypes;
    important:boolean;
    field:Field;
    constructor(parentView:ContainerView,opts:IFieldViewOptions,name?:string){
        super(parentView,opts,name);
        if(opts.queryable!==undefined) this.queryable = FieldQueryTypes[opts.queryable];
        if(this.queryable===undefined) this.queryable = FieldQueryTypes.none;
        this.important = opts.important;
        if(this.model){
            this.model.error((e)=>{
                let ex = new Exception(`模型[${this.model.name}]错误导致FieldView创建失败`,e);
                fulfill(this,"error",ex);
            }).defined((fields:{[name:string]:Field})=>{
                this.field= fields[this.name];
                if(!this.field) {
                    throw new Exception(`未能在模型[${this.model.name}]中找到字段${this.name}`);
                    //this.field = new Field(null,this.opts ,this.name);
                }else{
                    if(this.important===undefined) this.important = this.field.important;
                }
                fulfill(this,"ready",this.field);
            });
        }else{
            throw new Exception(`没能找到model,构造FieldView失败`);
        }
    }
    
}
fulfillable(FieldView.prototype,["ready","error"]);

export class ContainerView extends View{
    components:{[name:string]:View};
    includes?:string[];
    excludes?:string[];
    constructor(public model:Model,parentView:ContainerView,opts:IContainerViewOptions,name?:string){
        super(parentView,opts,name);
        this.includes = initIncludes(opts.includes,parentView.includes);
        this.excludes = initExcludes(opts.excludes,parentView.excludes);
        if(this.model){
            this.model.error((e)=>{
                let ex = new Exception(`模型[${this.model.name}]错误导致ContainerView创建失败`,e);
                fulfill(this,"error",ex);
            }).defined((fields)=>{
                initComponents(this,opts.components);
            });
        }else{
            initComponents(this,opts.components);
        }
    }
    checkAllow(childname:string):boolean{
        if(this.excludes && this.excludes.length && in_array(this.excludes,childname)) return false; 
        if(this.includes && in_array(this.includes,childname)) return true;
        return true;
    }
}

function initIncludes(selfIncludes:string[],parentIncludes:string[]):string[]{
    
    if(!selfIncludes|| selfIncludes.length===0) return parentIncludes;
    let ret = [];
    if(!parentIncludes||parentIncludes.length) {
        for(let n of selfIncludes) ret.push(n);
        return ret;
    }else{
        for(let n of selfIncludes){
            if(in_array(selfIncludes,n)) ret.push(n);
        }
        return ret;
    }
}

function initExcludes(selfExcludes:string[],parentExcludes:string[]):string[]{
    if(!selfExcludes || selfExcludes.length===0)return parentExcludes;
    let ret = [];
    for(let n of selfExcludes) ret.push(n);
    if(parentExcludes && parentExcludes.length) {
        for(let n of parentExcludes){
            if(!in_array(ret,n)) ret.push(n);
        }
        return ret;
    }
    return ret;
}
function initComponents(containerView:ContainerView,componentsOpts:{[name:string]:IViewOptions}){
    containerView.components = {};
    if(componentsOpts){
        for(let n in componentsOpts){
            if(!containerView.checkAllow(n)) continue;
            let compOpts = componentsOpts[n];
            if(containerView.model.fields[n]){
                containerView.components[n] = new FieldView(containerView,compOpts,n);
            }else {
                containerView.components[n] = new View(containerView,compOpts,n);
            }
        }
    }else if(containerView.model){
        for(let n in containerView.model.fields){
            if(!containerView.checkAllow(n)) continue;
            containerView.components[n] = new FieldView(containerView,{},n);
        }
    }
    fulfill(containerView,"ready",containerView);
}


export class ViewModel{
    constructor(dataOrUrl:any,public view:View){}
}

export class DetailViewModel extends ViewModel{
    public fields:{[name:string]:ViewModelField};
    constructor(dataOrUrl:any,view:DetailView){
        super(dataOrUrl,view);
        this.fields={};
    }
    createView(controller):HTMLElement{
        let fieldset = ModelUtility.createElement("section",{css:this.view.css});
        let header = ModelUtility.createElement("header");
        if(this.view.text) {
            ModelUtility.createElement("h3",this.view.text,header);
        }

        
        return fieldset;
    }
    setValue(data:any){

    }
}
class ViewModelField{
    name:string;
    control:IControl;
    data:any;
    element:HTMLElement;
}

export interface IControl{
    createElement(opts:any):HTMLElement;
    setValue(value:any);
    getValue():any;
}
export const controls:{[name:string]:IControl}={};

let trimRegx = /(^\s+)|(\s+$)/g;
let ModelUtility:IModelUtility = Model as any;
ModelUtility.createElement = (tag:string,attr:any,parent?:HTMLElement):HTMLElement=>{
    let elem:any;
    if(!tag) {
        elem = document.createTextNode(attr);
    }else{
        elem = document.createElement(tag);
        if(typeof attr ==="string") elem.innerHTML = attr;
        else {
            for(let n in attr){
                if(n==="html") elem.innerHTML = attr[n];
                else if(n==="css") elem.className = attr[n];
                else if(n==="style"){
                    let style = attr[n];
                    if(typeof style==="string") elem.style.cssText = style;
                    else {
                        for(let s in style) elem.style[s] = style[s];
                    }
                }else elem[n] = attr[n];
            }
        }
    }
    if(parent) parent.appendChild(elem);
    return elem;
};
