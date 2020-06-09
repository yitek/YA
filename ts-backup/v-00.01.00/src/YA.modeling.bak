import * as YA from 'YA.core';
declare let require;



/**
 * 枚举类型的枚举项
 *
 * @export
 * @interface IFieldEnumItem
 */
export interface IEnumItem{
    label?:string;
    name?:string;
    value?:string;
}

export interface IBasField{
    /**
     * 字段名称
     * 
     * @type {string}
     * @memberof IBasField
     */
    name?:string;
    /**
     * 对该字段的说明
     *
     * @type {string}
     * @memberof IBasField
     */
    description?:string;
    
    /**
     * 原始定义
     *
     * @type {*}
     * @memberof IBasField
     */
    defination?:any;

    
}
export class BasField implements IBasField {
    /**
     * 字段名称
     * 
     * @type {string}
     * @memberof IBasField
     */
    name:string;

    /**
     * 带类全名的字段全名
     *
     * @type {string}
     * @memberof BasField
     */
    fullname:string;
    /**
     * 对该字段的说明
     *
     * @type {string}
     * @memberof IBasField
     */
    description?:string;
    
    /**
     * 原始定义
     * @type {*}
     * @memberof BasField
     */
    defination:any;

    /**
     * 该字段属于哪个个模型
     *
     * @type {IModel}
     * @memberof BasField
     */
    model:IModel;
    constructor(model:IModel,opts:IBasField){
        this.model = model;
        if(!opts) return;
        this.defination = opts;
        this.name = YA.trim(opts.name);
        if(!this.name) throw new Error(`字段名称不能为空@{model?.fullname}`);
        this.description = opts.description;
        if(this.model) this.fullname = this.model.fullname + "." + this.name;
        
    }
    
}

export enum FieldValueKinds{
    embeded,
    customized,
    enumeration
}

export interface ITypedField extends IBasField{
    /**
     * 字段类型的全名
     *
     * @type {string}
     * @memberof ITypedField
     */
    type?:string;

    /**
     * 是否是集合
     *
     * @type {boolean}
     * @memberof ITypedField
     */
    collection?:boolean;

    valueKind?:FieldValueKinds;

    /**
     * 引用类型
     * 
     * @type {IModel}
     * @memberof ITypedField
     */
    fieldType?:IModel;

    
    
    /**
     * 冗余某些字段
     *
     * @type {boolean}
     * @memberof ITypedField
     */
    expandable?:string[];

    enums?:{[name:string]:any} | IEnumItem[]|string;
}



export class TypedField extends BasField implements ITypedField{
    /**
     * 字段类型的全名
     *
     * @type {string}
     * @memberof ITypedField
     */
    type:string;
    collection?:boolean;
    itemType:string;

    valueKind:FieldValueKinds;
    /**
     * 引用类型
     * 
     * @type {IModel}
     * @memberof ITypedField
     */
    fieldType?:IModel;

    expandable?:string[];
    enums:{[name:string]:IEnumItem};

    constructor(model:Model,opts:ITypedField){
        super(model,opts);
        //clone的时候，没有第二个参数，直接返回
        if(!opts)return;
        //获取类型的fullname
        this.type= YA.trim(opts.type);
        //默认为string
        if(!this.type) this.type = "string";
    
        //内置类型检查
        if(YA.array_index(TypedField.EmbededTypes,this.type)>=0) this.valueKind = FieldValueKinds.embeded;
        else {
            //处理枚举类型
            if(opts.enums){
                this.valueKind = FieldValueKinds.enumeration;
                if(typeof opts.enums==="string"){
                   throw "Not implement";
                }else{
                    this.enums = reformEnum(opts.enums,this.fullname);
                }
            }else{
                //处理自定义类型
                this.fieldType = Model.fetch(this.type);
                this.valueKind = FieldValueKinds.customized;
                this.expandable = opts.expandable;
                this.collection = opts.collection;
            }
        }
        
    }
    static StringTypes:string[] = ["string","text","email","password","mobile","telephone"];
    static NumberTypes:string[] = ["int","uint","long","ulong","float","double","decimal","number"];
    static EmbededTypes:string[]=["string","text","email","password","mobile","telephone","bool","boolean","int","uint","long","ulong","float","double","decimal","number","date","datetime","guid"];
}

function reformEnum(opts:any,context:any){
    let enums={};
    if(!opts) return enums;
    if(typeof opts==="string") {
        enums[opts] = {label:opts,value:opts,name:opts};
        return enums;
    }
    let empty= "";
    let isArr =YA.is_array(opts);
    for(let n in opts){
        let item = opts[n];
        let itemName;
        if(!isArr) itemName = n;
        let t = typeof item;
        let enumItem;
        if(t==="string") enumItem = {label:item,value:item,name:itemName};
        else if(t==="object") enumItem = {label:item.label||item.name||empty,value:item.value,name:itemName||item.name||item.label||empty};
        else enumItem = {label:item.toString(),name:itemName||item.toString(),value:item};
        enumItem.name = YA.trim(enumItem.name);
        for(let n in enums) {
            if(enums[n].value===enumItem.value) throw new Error("枚举中出现重复的值:" + enumItem.value+",@" + context);
        }
        let existed = enums[enumItem.name];
        if(existed) console.warn(`枚举中出现重复的name,新的枚举项将会替换掉原先的枚举项,@${context}`,existed,enumItem);
        enums[enumItem.name] = enumItem;
    }
    return enums;
}


export interface IValidatableField extends ITypedField  {
    required?:boolean|string;
    
    /**
     * 字段长度
     *
     * @type {(number|number[])}
     * @memberof IValidatableField
     */
    length?:number|number[]|string|{min?:number,max?:number};

    /**
     * 数据精度
     *
     * @type {number}
     * @memberof IDataField
     */
    precision?:number;

    /**
     * 验证规则
     *
     * @type {{[ruleName:string]:any}}
     * @memberof IValidatableField
     */
    rules?:{[ruleName:string]:any};
}
export class ValidatableField extends TypedField implements IValidatableField{
    required:boolean;
    
    /**
     * 字段长度
     *
     * @type {(number|number[])}
     * @memberof IValidatableField
     */
    length?:number;
    /**
     * 验证规则
     *
     * @type {{[ruleName:string]:any}}
     * @memberof IValidatableField
     */
    rules?:{[ruleName:string]:any};

    /**
     * 数据精度
     *
     * @type {number}
     * @memberof IDataField
     */
    precision?:number;

    constructor(model:Model,opts:IValidatableField){
        super(model,opts);
        if(!opts) return;
        this.rules={};
        //处理required
        if(opts.required!==undefined){
            let required = opts.required;
            if(required!==false) this.rules["required"] = require;
        }else this.required = false;

        //处理length
        if(opts.length!==undefined){
            let lengthRule = reformLength(opts.length,this.fullname);
            if(lengthRule.max) this.length = lengthRule.max;
            if(lengthRule.min|| lengthRule.max) this.rules["length"]=lengthRule;
            
        }
        if(this.valueKind === FieldValueKinds.embeded && YA.array_index(TypedField.NumberTypes,this.type)>=0){
            this.precision =opts.precision;
        }
        
        //验证类型
        if(this.valueKind ===FieldValueKinds.embeded)this.rules[this.type] = true;
        //验证枚举
        else if(this.valueKind ===FieldValueKinds.enumeration) this.rules["enum"] = ()=>this.enums;
        
        for(const n in opts.rules){
            let rule = opts.rules[n];
            if(n==="required" && rule!==false) {this.required = true; continue;}
            if(n==="length" && !this.rules["length"]){
                let lengthRule = reformLength(rule,this.fullname);
                if(lengthRule.max) this.length = lengthRule.max;
                if(lengthRule.max || lengthRule.min) {this.rules["length"] = lengthRule; continue;}
                continue;
            }
            this.rules[n]= rule;            
        }
    }
}

function reformLength(length,context){
    let t = typeof length;
    let min,max;
    if(t==="number"){max=length;}
    else if(t==="string") max = parseInt(length as string);
    else if(t==="object"){
        if(YA.is_array(length)){
            min= length[0];
            max = length[1];
        }else{
            min = (length as any).min;
            max = (length as any).max;
        }
    }else throw new Error(`错误的length定义，@${context}}`);
    return {min:min,max:max};
}

export enum DbIndexTypes{
    none,
    primary,
    unique,
    normal
}
export interface IDbReference{
    hasMany:boolean;
    primaryKey?:string;
    foreignTypeName?:string;
    foreignType?:IModel;
    foreignKey?:string;
    linkName?:string;
    leftKey?:string;
    rightKey?:string;
}
export interface IDataField  extends IValidatableField{
    /**
     * 数据库值的类型
     *
     * @type {string}
     * @memberof IDataField
     */
    dataType?:string; 
    
    /**
     * 是否是主键
     *
     * @type {boolean}
     * @memberof IDataField
     */
    primary?:boolean;
    
    /**
     * 索引类型
     *
     * @type {(string|DbIndexTypes)}
     * @memberof IDataField
     */
    index?:string|DbIndexTypes;
    /**
     * 是否可以为空
     *
     * @type {boolean}
     * @memberof IDataField
     */
    nullable?:boolean;

    reference?:IDbReference;
    hasOne?:string|boolean;
    ownOne?:string;
    hasMany?:string|boolean;
    ownMany?:string|boolean;
    manyMany?:string[];
}

export class DataField extends ValidatableField implements IDataField{
    /**
     * 数据库值的类型
     *
     * @type {string}
     * @memberof IDataField
     */
    dataType?:string; 
    
    /**
     * 是否是主键
     *
     * @type {boolean}
     * @memberof IDataField
     */
    primary:boolean;
    
    /**
     * 索引类型
     *
     * @type {(string|DbIndexTypes)}
     * @memberof IDataField
     */
    index?:string|DbIndexTypes;

    

    /**
     * 是否可以为空
     *
     * @type {boolean}
     * @memberof IDataField
     */
    nullable?:boolean;

    reference?:IDbReference;

    constructor(model:Model,opts:IDataField){
        super(model,opts);
        if(!opts) return;
        if(opts.primary){
            this.primary = true;
            this.index = DbIndexTypes.primary;
        }else if(opts.index){
            if(typeof opts.index==="string") this.index = DbIndexTypes[opts.index as string];
            if(DbIndexTypes[this.index]===undefined) throw new Error(`index的定义不正确@${this.fullname}`);
        }else this.index=DbIndexTypes.none;


        if(!opts.dataType) {if (this.valueKind===FieldValueKinds.embeded)this.dataType = this.type;}

        if(this.valueKind === FieldValueKinds.customized){
            if(opts.reference){
                this.reference = opts.reference;
            }else if(opts.hasOne){
                if((opts.hasOne as boolean)===true){
                    this.reference = {hasMany:false,foreignTypeName:this.type};
                }else this.reference ={hasMany:false,foreignTypeName:this.type,foreignKey:opts.hasOne as string};
            }else if(opts.ownOne){
                this.reference = {hasMany:false,foreignTypeName:this.type,primaryKey:opts.ownOne};
            }else if(opts.hasMany){
                if((opts.hasMany as boolean)===true){
                    this.reference = {hasMany:true,foreignTypeName:this.type};
                }else this.reference ={hasMany:true,foreignTypeName:this.type,foreignKey:opts.hasMany as string};
            }else if(opts.ownMany){
                this.reference = {hasMany:true,foreignTypeName:this.type,primaryKey:opts.ownMany as string};
            }else if(opts.manyMany){
                this.reference = {hasMany:true,linkName:opts.manyMany[0]};
            }
        }

    }
}




/**
 * 字段查询方式
 *
 * @export
 * @enum {number}
 */
export enum FieldQueryMethods{
    none,
    equal,
    range,
    contains
}

/**
 * 字段会被列举出来
 * 字段的一个属性
 *
 * @export
 * @interface IListable
 */
export interface IListable{
    
    /**
     * 显示为一个链接 
     *
     * @type {string}
     * @memberof IListable
     */
    url?:string;

    /**
     * 虽然在列表中，但会隐藏
     * 默认为false
     *
     * @type {boolean}
     * @memberof IListable
     */
    hidden?:boolean;

    /**
     * 是否可排序
     * 默认是true
     *
     * @type {boolean}
     * @memberof IListable
     */
    sortable?:boolean;

    /**
     * 自定义的单元格
     *
     * @type {string}
     * @memberof IListable
     */
    cell?:string | {(row:any):any};

}


export interface IAction{
    url?:string;
    type?:string;
    displayName?:string;
    
}

export type TActionOpts =IAction | string;


export interface IViewMember {
    
    name?:string;
    /**
     *是否只读 viewtype===edit/detail时生效
     *
     * @type {boolean}
     * @memberof IViewField
     */
    readonly?:boolean;

    /**
     * 是否可查询，如果是字符串，就是FieldQueryTypes的枚举
     * 系统加载dmd时，会自动把该字段规整成FieldQueryTypes
     *
     * @type {(boolean|string|FieldQueryMethods)}
     * @memberof IViewField
     */
    queryable?:boolean|string|FieldQueryMethods;

    /**
     * 是否是关键查询
     * 一个query-page里面有关键查询，查询form会分成2段:关键查询/普通查询
     * 默认为null
     * 如果设置了该值，queryable失效
     *
     * @type {(boolean|string)}
     * @memberof IViewField
     */
    keyQueryable?:boolean|string|FieldQueryMethods;

    /**
     * 是否可列表
     * 加载dmd时，会自动规整成IListable
     *
     * @type {(boolean|string|IListable)}
     * @memberof IViewField
     */
    listable?:boolean|string|IListable;
}

export class ViewMember implements IViewMember{    
    name?:string;
    /**
     *是否只读 viewtype===edit/detail时生效
     *
     * @type {boolean}
     * @memberof IViewField
     */
    readonly?:boolean;

    /**
     * 是否可查询，如果是字符串，就是FieldQueryTypes的枚举
     * 系统加载dmd时，会自动把该字段规整成FieldQueryTypes
     *
     * @type {(boolean|string|FieldQueryMethods)}
     * @memberof IViewField
     */
    queryable?:FieldQueryMethods;

    /**
     * 是否是关键查询
     * 一个query-page里面有关键查询，查询form会分成2段:关键查询/普通查询
     * 默认为null
     * 如果设置了该值，queryable失效
     *
     * @type {(boolean|string)}
     * @memberof IViewField
     */
    keyQueryable?:FieldQueryMethods;

    /**
     * 是否可列表
     * 加载dmd时，会自动规整成IListable
     *
     * @type {(boolean|string|IListable)}
     * @memberof IViewField
     */
    listable?:IListable;

    constructor(public defination:IViewMember,public field?:Field,public view?:IView){
        this.name = defination.name;
       ViewMember.init(this,defination,field);

    }

    static init(member:IViewMember,opts:IViewMember,field?:Field){
        member.readonly = opts.readonly;
        let queryable;
        if(opts.keyQueryable!==undefined){
            queryable = getQueryable(field.keyQueryable,field.type,field.fullname);
            if(queryable) member.keyQueryable = true;
        }else if(field){
            
            member.keyQueryable= field.keyQueryable;
        }
        if(!queryable){
            if(field) queryable = field.queryable;
            else queryable = getQueryable(field.queryable,field.type,field.fullname);
        }
        member.queryable = queryable;

        //listable
        if(opts.listable!==undefined){
            let listable = makeListable(field.listable);
            if(listable===undefined) throw new Error(`字段${field.fullname}的listable设置不正确`);
            field.listable = listable;
        }else {
            if(field)field.listable = field.listable;
        }
    }
}


function getQueryable(optValue,type:string,fieldname:string){
    if(optValue===undefined) return FieldQueryMethods.none;
    let queryable;
    let t = typeof(optValue);
            
    if(t==="boolean"){
        if(optValue) {
            if(type==="string") queryable = FieldQueryMethods.contains;
            if(type==="date"|| type==="datetime") queryable = FieldQueryMethods.range;
            queryable = FieldQueryMethods.equal;
        }
    }else if(t==="string"){
        queryable = FieldQueryMethods[optValue];
        if(queryable===undefined)throw new Error(`字段${fieldname}的queryable/keyQueryable的值不正确`);
    }else if(t==="number"){
        if(FieldQueryMethods[optValue as number]!==undefined){
            queryable = optValue;
        }else throw new Error(`字段${fieldname}的queryable/keyQueryable的值不正确`);
    }else throw new Error(`字段${fieldname}的queryable/keyQueryable的值不正确`);
    return queryable;
}
function makeListable(optValue):IListable{
    if(!optValue) return null;
    let t = typeof(optValue);
    if(t==="boolean"){
        return {sortable:true};
    }else if(t==="string"){
        if(optValue===":hidden") return {hidden:true};
        
        return {sortable:true,url:optValue};
    }else if(t==="object"){
        if(optValue.sortable===undefined) optValue.sortable = true;
        return optValue;
    }
}



export interface IField extends IDataField,IViewMember{
    /**
     * 字段的标签
     *
     * @type {string}
     * @memberof IBasField
     */
    inputType?:string;
    /**
     * 字段的显示名
     *
     * @type {string}
     * @memberof IViewField
     */
    displayName?:string;
}

export class Field extends DataField implements IField{
    /**
     * 字段的标签
     *
     * @type {string}
     * @memberof IBasField
     */
    inputType?:string;
    /**
     * 字段的显示名
     *
     * @type {string}
     * @memberof IViewField
     */
    displayName?:string;

    /**
     *是否只读 viewtype===edit/detail时生效
     *
     * @type {boolean}
     * @memberof IViewField
     */
    readonly?:boolean;

    /**
     * 是否可查询，如果是字符串，就是FieldQueryTypes的枚举
     * 系统加载dmd时，会自动把该字段规整成FieldQueryTypes
     *
     * @type {(boolean|string|FieldQueryMethods)}
     * @memberof IViewField
     */
    queryable?:FieldQueryMethods;

    /**
     * 是否是关键查询
     * 一个query-page里面有关键查询，查询form会分成2段:关键查询/普通查询
     * 默认为null
     * 如果设置了该值，queryable失效
     *
     * @type {(boolean|string)}
     * @memberof IViewField
     */
    keyQueryable?:FieldQueryMethods;

    /**
     * 是否可列表
     * 加载dmd时，会自动规整成IListable
     *
     * @type {(boolean|string|IListable)}
     * @memberof IViewField
     */
    listable?:IListable;

    refField?:Field;
    constructor(model:Model,opts:IField){
        super(model,opts);
        if(!opts) return;
        this.inputType = opts.inputType|| this.type;
        this.displayName = opts.displayName||this.name;
        ViewMember.init(this,opts);
    }
}


/**
 * 页面类型
 *
 * @export
 * @enum {number}
 */
export enum ViewTypes{
     
    /**
     * 编辑页面，默认的字段显示为可编辑的字段，一般用于add/modify
     */
    edit,

    /**
     * 详情页面，默认的字段显示为只读。
     */
    detail,

    /**
     * 列表
     */
    list,

    /**
     * 查询，带着一个查询form的列表
     */
    query
}

export interface IGroup{
    name?:string;
    caption?:string;
    members:string[] |{[name:string]:ViewMember};
    headActions?:IAction[];
    footActions?:IAction[];
}

export class Group implements IGroup{

    name?:string;
    caption?:string;
    members:{[name:string]:ViewMember};
    headActions?:IAction[];
    footActions?:IAction[];

    constructor(public view:View,public defination:IGroup){
        this.name = defination.name;
        this.caption = defination.caption||this.name;
        this.members = {};
        for(let i in defination.members){
            let membername = defination.members[i];
            let member = view.members[membername];
            if(!member) throw new Error("无法识别的membername");
            this.members[member.name] = member;
        }
        if(defination.headActions) this.headActions = initActions(defination.headActions as any) as IAction[];
        if(defination.footActions) this.footActions = initActions(defination.footActions as any) as IAction[];
    }
}

export type TViewMember = IViewMember|string;


export interface IView {
    name?:string;
    /**
     * 页面标题
     *
     * @type {string}
     * @memberof IView
     */
    caption?:string;


    /**
     * 用于构造页面用的className
     * 
     * @type {string}
     * @memberof IView
     */
    className?:string;

    /**
     *  系统会自动规整成ViewTypes
     *
     * @type {string|ViewTypes}
     * @memberof IView
     */
    viewType?:string|ViewTypes;
    members?:  {[memberName:string]:TViewMember}|TViewMember[];

    headActions?:IAction[];
    bodyActions?:IAction[];
    footActions?:IAction[];

    checkable?:boolean;
    groups?:IGroup[]|{[name:string]:IGroup};

    rowsPath:string|YA.DPath;
    ascPath:string|YA.DPath;
    descPath:string|YA.DPath;
    totalPath:string|YA.DPath;
    filterPath:string|YA.DPath;    

}



export class View implements IView{
    name?:string;
    /**
     * 页面标题
     *
     * @type {string}
     * @memberof IModelPage
     */
    caption?:string;

    className:string;

    /**
     *  系统会自动规整成ViewTypes
     *
     * @type {string|ViewTypes}
     * @memberof IModelViewDefination
     */
    type:string|ViewTypes;
    members:  {[membername:string]:ViewMember};

    queryMembers:{[membername:string]:ViewMember};
    queryKeyMembers:{[membername:string]:ViewMember};

    listMembers:{[membername:string]:ViewMember};

    
    headActions?:IAction[];
    bodyActions?:IAction[];
    footActions?:IAction[];

    checkable?:boolean;
    groups?:{[name:string]:IGroup};

    rowsPath:YA.DPath;
    ascPath:YA.DPath;
    descPath:YA.DPath;
    totalPath:YA.DPath;
    filterPath:YA.DPath;    

    modelSchema:YA.ObservableSchema<any>;
    filterSchema:YA.ObservableSchema<any>;
    listSchema:YA.ObservableSchema<any>;


    constructor(public model:Model,public defination:IView){
        this.name = YA.trim(defination.name);
        this.className = this.model.fullname.replace(/./g,"-")+ " " + this.name;
        this.caption = defination.caption || this.name;
        if(typeof this.type==="string") this.type= ViewTypes[defination.viewType];
        if(ViewTypes[this.type]===undefined) throw new Error("无法识别的ViewType,它必须是ViewTypes");
        this.rowsPath = YA.DPath.fetch(defination.rowsPath as string||"rows");
        this.ascPath = YA.DPath.fetch(defination.ascPath as string||"asc");
        this.descPath = YA.DPath.fetch(defination.descPath as string||"desc");
        this.totalPath = YA.DPath.fetch(defination.totalPath as string||"total");
        this.filterPath = YA.DPath.fetch(defination.filterPath as string||"filter");

        let members = this.members;
        this.members = {};
        let isArr = YA.is_array(members);
        for(let i in members){
            let memberOpt:IViewMember = members[i];
            let member:ViewMember;
            let membername:string;
            if(typeof memberOpt ==="string"){
                membername = YA.trim(memberOpt);
                let field = model.fields[membername];
                if(!field) continue;
                member =new ViewMember({readonly :field.readonly},field,this);
               
            }else {
                membername = YA.trim(isArr?memberOpt.name : i);
                if(!membername) throw new Error("未能定义membername");
                let field:Field = model.fields[membername];
                if(!field) continue;
                memberOpt.name = membername;
                member = new ViewMember(memberOpt,field,this);
                
            }
            this.members[member.name] =member;
            if(member.queryable) {
                (this.queryMembers ||(this.queryMembers={}))[member.name] = member;
                if(member.keyQueryable) (this.queryKeyMembers ||(this.queryKeyMembers={}))[member.name] = member;
            }
            if(member.listable) {
                (this.listMembers ||(this.listMembers={}))[member.name] = member;
            }
        }
        if(defination.headActions) this.headActions = initActions(defination.headActions as any) as IAction[];
        if(defination.bodyActions) this.bodyActions = initActions(defination.bodyActions as any) as IAction[];
        if(defination.footActions) this.footActions = initActions(defination.footActions as any) as IAction[];
        if(this.type===ViewTypes.detail || this.type===ViewTypes.edit){
            if(defination.groups ){
                this.groups = {"":null};
                let isArr = YA.is_array(defination.groups);
                for(let n in this.groups){
                    let groupname = "";
                    let groupOpt = this.groups[n];
                    if(isArr) {
                        groupname = n;
                        
                    }else groupname = groupOpt.name;
                    groupname = YA.trim(groupname);
                    groupOpt.name = groupname;
                    this.groups[groupOpt.name] =new Group(this,groupOpt);
                }
            }
            this.modelSchema = this._initDetailSchema();
        }else {
            this.listSchema = this._initListSchema();
            if(this.type ==ViewTypes.query) this.filterSchema = this._initFilterSchema();
        }
        
    }
    

    private _initDetailSchema():YA.ObservableSchema<any>{
        let schema = new YA.ObservableSchema({},"detail");
        let stack = [this.model];
        for(let n in this.members){
            this._internalInitModelSchema(n,this.members[n].field,schema,stack);
        }
        return schema;
    }

    private _initFilterSchema():YA.ObservableSchema<any>{
        let schema = new YA.ObservableSchema({},"filter");
        let stack = [this.model];
        for(let n in this.queryMembers){
            let member = this.queryMembers[n];
            if(member.queryable === FieldQueryMethods.range){
                this._internalInitModelSchema(n+"_min",member.field,schema,stack);
                this._internalInitModelSchema(n+"_max",member.field,schema,stack);
            }
            else this._internalInitModelSchema(n,member.field,schema,stack);
        }
        return schema;
    }

    private _initListSchema():YA.ObservableSchema<any>{
        let schema = new YA.ObservableSchema([],"rows");
        let itemSchema = schema.asArray();
        let stack = [this.model];
        for(let n in this.listMembers){
            this._internalInitModelSchema(n,this.members[n].field,itemSchema,stack);
        }
        return schema;
    }

    private _internalInitModelSchema(name:string,field:Field,parentSchema:YA.ObservableSchema<any>,stack?:IModel[]){
        //不是引用类型，就直接在parentSchema上添加一个成员就可以了。
        if(!field.model){
            parentSchema.defineProp(name);
            return;
        }
        //成员是引用类型，就要看
        //看是否已经在前面的类型使用过，要避免循环引用引起的无穷循环
        //
        let usedCount = 0;
        for(const used of stack){
            if(used===field.model) usedCount++;
        }
        //前面还没用过0,或者只用过一次 node.parent.parent
        if(usedCount==0){
            //把自己的类型加到堆栈中，以便在构造它的属性的schema时做检查
            stack.push(field.model);
            //得到当前这个属性的schema;
            let subSchema = parentSchema.defineProp(name);
            //变成对象
            subSchema.asObject();
            //循环下级字段/属性
            let subFields = field.model.fields;
            for(let n in subFields){
                this._internalInitModelSchema(n,subFields[n],subSchema,stack);
            }
            stack.pop();
        }else {
            parentSchema.defineProp(field.name);
        }
    }
}


export interface IModel{
    fullname?:string;
    bases:string[]|Model[];
    fields:IField[]|{[name:string]:IField};
    views:IView[] | {[name:string]:IView};
    primary:IField|string;
}



export class Model extends YA.Promise implements IModel{
    fullname:string;
    fields:{[name:string]:Field};
    views:{[name:string]:View};
    bases:Model[];
    base:Model;
    defFields:{[name:string]:Field};
    expendableFields:{[name:string]:Field};
    defination:any;
    primary:IField;
    references:{[typename:string]:Model};

    __loadCallbacks:any[];
    __readyCallbacks:any[];
    __errorInfo;
    
    constructor(fullname:string){
        let done,error;
        super((resolve,reject)=>{
            done =resolve;
            error = reject;
        });
        this.fullname = YA.trim(fullname);
        this.fields = {};
        this.defFields = {};
        this.expendableFields = {};
        this.__loadCallbacks=[];
        this.__readyCallbacks=[];
        this.__loadDefination(this.fullname);
    }

    load(callback:string|{(model:Model):any}):Model{
        if(callback==="complete"){
            for(let i in this.__loadCallbacks){
                this.__loadCallbacks[i](this);
            }
            return this;
        }
        if(this.__loadCallbacks) this.__loadCallbacks=[];
        (callback as any)(this);
        return this;
    }

    ready(callback:string |{(model:Model):any}):Model{
        if(callback==="complete"){
            for(let i in this.__loadCallbacks){
                this.__loadCallbacks[i](this);
            }
            return this;
        }
        if(this.__readyCallbacks) this.__readyCallbacks=[];
        (callback as any)(this);
        return this;
    }

    private __loadDefination(fullname:string){
        Model.basUrl + "/" + fullname.replace(/./g,"/") +"model.json";
        load(fullname,(opts,err)=>{
            if(err) this.__errorInfo = err;
            else this.__loadReferences(opts);
        });
    }

    private __loadReferences(opts){
        this.references = {};
        let bases = opts.bases;
        this.bases=[];
        let waitingCount = 1;
        if(bases){
            for(let i in bases){
                waitingCount++;
                let basename = bases[i];
                let base = Model.fetch(basename).load((base:Model)=>{
                    if(this.__errorInfo) return;
                    if(--waitingCount===0 && !this.__errorInfo) {
                        this.load("complete");
                        this.__initInherit();
                    }
                });
                if(base===this) {this.__errorInfo = new Error("循环继承"); throw this.__errorInfo;}
                this.references[base.fullname] = base;
                this.bases[base.fullname] = base;
                if(!this.base) this.base = base;
            }
        }
        let fields = opts.fields;
        this.defFields={};
        if(typeof fields !=="object") {this.__errorInfo = new Error("fields必须定义成{}或[]");throw this.__errorInfo;}
        let isArray = YA.is_array(fields);
        
        for(const i in fields){
            let fieldOpt = fields[i];
            if(isArray && !fieldOpt.name) {this.__errorInfo = new Error("字段必须要有名称");throw this.__errorInfo;}
            let name = YA.trim(isArray?fieldOpt.name:i);
            if(name) throw new Error("字段必须要有名称");
            if(this.defFields[name]) console.warn("已经有定义过"+name+",原先的定义");
            fieldOpt.name = name;
            let field = this.defFields[name] =  new Field(this,fieldOpt);
            
            if(field.fieldType){
                waitingCount++;
                (field.fieldType as Model).load((fieldModel:Model)=>{
                    if(--waitingCount===0 && !this.__errorInfo){
                        this.load("complete");
                        this.__initInherit();
                    } 
                });
                if(field.expandable) this.expendableFields[field.name] = field;
            }
        }
        if(--waitingCount===0 && !this.__errorInfo) {
            this.load("complete");
            this.__initInherit();
        }
        return this;
    }

    private __initInherit(){
        if(this.base){
            this.base.ready((baseModel:Model)=>{
                this.__expandBase(baseModel);
                this.__initFields();
            });
        }else {
            this.__initFields();
        }
    }

    private __initFields(){
        let waitCount=1;
        for(let n in this.defFields)((field:Field,n:string)=>{
            
            if(field.expandable){
                let expandFieldnames = field.expandable;
                if(!YA.is_array(expandFieldnames)){this.__errorInfo = new Error(`expandable配置不正确@${this.fullname}`);throw new this.__errorInfo;}
                waitCount++;
                (field.fieldType as Model).ready((fieldModel:Model)=>{
                    for(let i in expandFieldnames){
                        let expandFieldname = expandFieldnames[i];
                        let expandField = fieldModel.fields[expandFieldname];
                        if(!expandField) {this.__errorInfo = new EvalError(`无法找到expandable中定义的字段@${this.fullname}`);throw this.__errorInfo;return;}
                        let pname = field.name +expandField.name;
                        if(this.fields[pname]) continue;
                        let meField = new Field(this,null);
                        for(let pn in expandField) meField[pn]=expandField[pn];
                        meField.model = this;meField.refField = expandField;
                        this.fields[pname] = meField;
                        if(meField.expandable) this.expendableFields[pname] = meField;
                    }
                    if(--waitCount==0){
                        if(!this.__errorInfo) this.__initBases();
                    }
                });
                
            }
        })(this.defFields[n],n);
        if(--waitCount==0){
            if(!this.__errorInfo) this.__initBases();
        }
    }

    
    private __initBases(){
        //首先把Id找到
        for(let n in this.fields) {
            let field:Field = this.fields[n];
            if(field.primary)this.primary = field;
        }
        let waitingCount=1;
        if(this.bases){
            let index = 0;
            for(let n in this.bases)((base,name)=>{
                //第一个已经处理过了
                if(index===0) {index++;return;}
                waitingCount++;
                base.ready((base:Model)=>{
                    this.__expandBase(base);
                    if(--waitingCount===0 && !this.__errorInfo) this.__initViews();
                });
            })(this.bases[n],n);
        }
        if(--waitingCount===0 && !this.__errorInfo) this.__initViews();
    }
    private __expandBase(baseModel:Model){
        for(let n in baseModel.fields){
            let baseField = baseModel.fields[n];
            //因为后面的是混入类，其成员优先级较低，已经存在的就不会覆盖了
            if(this.fields[n]) continue;
            let meField = new Field(this,null);
            for(let pn in baseField) meField[pn]=baseField[pn];
            meField.model = this;
            meField.refField = baseField;
            this.fields[n] = meField;
        }
    }
    
    private __initViews(){
        if(!this.primary){
            let primaryKey = this.defination.primary;
            if(primaryKey) this.primary = this.fields[primaryKey];
        }

        let views = this.views as any;
        let isArray = YA.is_array(views);

        for(const i in views){
            let viewOpt = views[i];
            if(isArray && !viewOpt.name) throw new Error("字段必须要有名称");
            let name = YA.trim(isArray?viewOpt.name:i);
            if(name) throw new Error("字段必须要有名称");
            if(this.views[name]) console.warn("已经有定义过"+name+",原先的定义");
            viewOpt.name = name;
            this.views[name] =  new View(this,viewOpt);
        }
        
        this.ready("complete");
    }
    

    static models:{[fullname:string]:Model}

    static basUrl:string;
    static fetch(fullname:string):Model{
        let existed = Model.models[fullname];
        if(existed) return existed;
        return Model.models[fullname] = new Model(fullname);
    }
}



function load(url:string,callback){
    let xhr = new XMLHttpRequest();
    //使用变量赋值new个XHR请求
    xhr.open("GET",url,true)
    xhr.responseType = "text";
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            let json = JSON.parse(xhr.responseText);
            callback(json,xhr.status == 200?true:false);
        }   
    }
    xhr.onerror = function(){
        callback(xhr,false);
    }

}

export interface IFieldElementInfo{
    fieldElement?:any;
    inputElement?:any;
    getElementValue?:()=>any;
    setElementValue?:(value:any)=>any;
}

export enum MemberViewPositions{
    fieldset,
    filter,
    tableHeader,
    cell
}

export enum InputViewTypes{
    unknown,
    disable,
    hidden,
    readonly,
    editable
    
}
export class Renderer{
    model:Model;
    data:{[name:string]:any};
   
    defaultInputViewType:InputViewTypes;
    elementInfos:{[name:string]:IFieldElementInfo};
    constructor(public view:View){
        this.model = view.model;
        this.elementInfos ={};
    }

    render(container?:any):any{

    }
    /*
    protected _renderForm(permissions:{[name:string]:string},container?:any){
        let form:YA.IVirtualNode;
        form =YA.virtualNode(
            this.view.type == ViewTypes.edit?"form":"div"
            ,{method:"post",className:"edit-form "+this.view.className}
        );    

        if(this.view.groups){
            for(let n in this.view.groups){
                let group = this.view.groups[n];
                let fieldsetElem;
                if(n){
                    let groupContents :YA.IVirtualNode;
                    form.children.push(fieldsetElem = YA.virtualNode(
                        "fieldset"
                        ,{className:`group ${n}`}
                        ,YA.virtualNode(
                            "legend",{}
                            ,YA.virtualNode("span",{className:"Group-caption"},group.caption))
                            ,groupContents=YA.virtualNode(
                                "div"
                                ,{className:"group-content"}
                            )
                        )
                    );   
                }
                
                this._renderMembers(MemberViewPositions.fieldset,group.members as any,permissions,groupContents);
            }
        }else {
            this._renderMembers(MemberViewPositions.fieldset,this.view.members,initData,permissions,form);
        }
    }

    protected _renderTable(initData:any,permissions:{[name:string]:string},container?:any){
        let tb = DomUtility.createElement({
            tag:"table",
            className:``
        },container);
        let thead = DomUtility.createElement("thead",tb);
        let thRow = DomUtility.createElement("tr",thead);
        let colCount =0;
        
        if(this.view.checkable){
            let chkTh = DomUtility.createElement("th",thRow);colCount++;
            let ckBox = DomUtility.createElement({
                tag:"input",
                type:"checkbox"
            },chkTh);
        }
        let memberCount = 0;
        let members = {};
        for(let n in this.view.listMembers){
            if(permissions && permissions[n]==="disable") continue;
            let member = members[n] = this.view.listMembers[n];
            this._createMemberElement(MemberViewPositions.tableHeader,member,this.defaultInputViewType,null,thRow);
            colCount++;memberCount++;
        }
        if(this.view.bodyActions){
            DomUtility.createElement({
                tag:"th"
                ,content:"操作"
            },thRow);
        }
        let rows = this.view.rowsPath.getValue(initData);
        let tbody = DomUtility.createElement("tbody",tb);
        if(!rows || !rows.length){
            let row = DomUtility.createElement("tr",tbody);
            let td = DomUtility.createElement({tag:"td","className":"nodata"},row);
            DomUtility.setAttribute(td,"colspan",colCount as any as string);
            DomUtility.setContent(td,"没有数据");
        }else {
            for(const i in rows){
                let row = DomUtility.createElement("tr",tbody);
                if(this.view.checkable){
                    let chkTd = DomUtility.createElement("td",row);
                    DomUtility.createElement({
                        tag:"input",
                        value:row[this.model.primary.name],
                        type:"checkbox"
                    },chkTd);
                }
                let rowData = rows[i];
                for(const n in members){
                    let td = DomUtility.createElement("td",row);
                    let member:ViewMember = members[n];
                    if(member.readonly===false){``
                        this._createMemberElement(MemberViewPositions.cell
                            ,member
                            ,InputViewTypes.editable
                            ,rowData
                            ,thRow
                        );
                    }
                    
                }
            }
        }
    }

    protected _renderMembers( pos:MemberViewPositions,members:{[name:string]:ViewMember},permissions:{[name:string]:string},container?:YA.IVirtualNode){
        for(let n in members){
            let inputViewType :InputViewTypes;
            let perm = permissions?permissions[n]:"unknown";
            inputViewType = InputViewTypes[perm];
            if(!inputViewType) inputViewType = this.defaultInputViewType;
            let member = members[n];
            let elementInfo = this._createMemberElement(pos,member,inputViewType,initData?initData[member.field.name]:undefined,container);
            this.elementInfos[n] = elementInfo;
        }
    }
    protected _renderMember(pos:MemberViewPositions,member:ViewMember,memberViewType:InputViewTypes){
        let field = member.field;
        if(pos===MemberViewPositions.tableHeader){
            return {
                tag:"th",children:[
                    {tag:"label",calssName:`field-label text ${field.name}`,children:[{content:field.displayName}]}
                ]
            };
        }
        let inputComponentType:YA.TComponentType;
        let inputTag = member.field.inputType;
        if(inputTag) {
            inputComponentType = YA.componentTypes[inputTag];
        }
        if(!inputComponentType) inputComponentType = YA.componentTypes[inputTag];
        if(pos===MemberViewPositions.cell){
            let div = {
                tag:"div",
                children:[
                    {
                        meta:inputComponentType.$meta
                    }
                ]
            };
            let elemInfo = createFieldInput(member,memberViewType,initValue,div);
            elemInfo.fieldElement = div;
            return elemInfo;
        }
        let div = DomUtility.createElement({
            tag:"div"
            ,className : `field ${field.type} ${field.name}`
        },container);
        
            
        let label = DomUtility.createElement("label",div);
        DomUtility.setAttribute(label,"className",`field-label`);
        if(pos===MemberViewPositions.fieldset && field.required){
            let required = DomUtility.createElement({tag:"ins",className:"field-label-required",content:"*"},label);
        }
        
        let caption = DomUtility.createElement({
            tag:"span",
            className:"field-label-text",
            content:field.displayName
        },label);
        if(pos===MemberViewPositions.fieldset && field.description){
            DomUtility.setAttribute(caption,"title",field.description);
        }

        let elemInfo = createFieldInput(member,memberViewType,initValue,div);
        elemInfo.fieldElement = div;
        if(field.rules){

        }
        return elemInfo;
    }

    

    protected _createMemberElement( pos:MemberViewPositions,member:ViewMember,memberViewType:InputViewTypes,initValue:any,container:any):IFieldElementInfo{
        let field = member.field;
        if(pos===MemberViewPositions.tableHeader){
            let th = DomUtility.createElement("th",container);
            let label = DomUtility.createElement({
                tag:"label",
                className:`field-label text ${field.name}`,
                content:field.displayName
            },th);
            return {fieldElement:th};
        }
        if(pos===MemberViewPositions.cell){
            let div = DomUtility.createElement({
                tag:"div",
                className:`field-data ${field.type} ${field.name}`
            },container);
            let elemInfo = createFieldInput(member,memberViewType,initValue,div);
            elemInfo.fieldElement = div;
            return elemInfo;
        }
        let div = DomUtility.createElement({
            tag:"div"
            ,className : `field ${field.type} ${field.name}`
        },container);
        
            
        let label = DomUtility.createElement("label",div);
        DomUtility.setAttribute(label,"className",`field-label`);
        if(pos===MemberViewPositions.fieldset && field.required){
            let required = DomUtility.createElement({tag:"ins",className:"field-label-required",content:"*"},label);
        }
        
        let caption = DomUtility.createElement({
            tag:"span",
            className:"field-label-text",
            content:field.displayName
        },label);
        if(pos===MemberViewPositions.fieldset && field.description){
            DomUtility.setAttribute(caption,"title",field.description);
        }

        let elemInfo = createFieldInput(member,memberViewType,initValue,div);
        elemInfo.fieldElement = div;
        if(field.rules){

        }
        return elemInfo;
        
    }*/
}
let DomUtility = YA.ElementUtility;
export type TComponentFactory = (member:ViewMember,initValue:any,memberViewType:InputViewTypes,container:any)=>any;
let componentFactories :{[typename:string]:TComponentFactory}= {};
function textFactory(member:ViewMember,initValue:any,memberViewType:InputViewTypes,container:any){
    
    
}
function createFieldInput(member:ViewMember,inputViewType:InputViewTypes,initValue:any,container:any):IFieldElementInfo{
    let info;
    let factory = componentFactories[member.field.type];
    if(factory) info = factory(member,initValue,inputViewType,container);
    else{
        if(member.field.enums) {
            initValue = getEnumText(member.field.enums,initValue);
        }
    }
    if(info===undefined){
        let content = initValue;
        if(content===undefined ||content ===null) content = "";
        let inputElem = DomUtility.createText(content);
        if(container) container.appendChild(inputElem);
        info = {
            inputElement:inputElem,
            getElementValue:()=>inputElem.nodeValue,
            setElementValue:(val:any)=>inputElem.nodeValue = val===null||val===undefined?"":val.toString()
        };
    }
    return info;
}
function getEnumText(enumItems:{[name:string]:IEnumItem},value:any){
    for(let n in enumItems){
        let item = enumItems[n];
        if(item.value===value)return item.label;
    }
    return "";
}
function getEnumValue(enumItems:{[name:string]:IEnumItem},name:string){
    let item = enumItems[name];
    if(item) return item.value;
    return undefined;
}
function getEnumItem(enumItems:{[name:string]:IEnumItem},value:any){
    for(let n in enumItems){
        let item = enumItems[n];
        if(item.value===value || item.name === value)return item;
    }
    return undefined;
}

export class DetailPartial extends Renderer{

    constructor(view:View){
        super(view);
    }
    
    render(permissions:{[name:string]:string}):any{
        
    }

    
}

export class ListPartial extends Renderer{
    constructor(view:View){
        super(view);
    }
    
    render(container?:any):any{

    }
}



function initActions(actionsOpts:IAction){
    let actions = [];
    for(let i in actionsOpts){
        let actionOpt = actionsOpts[i];
        let action;
        if(typeof actionOpt==="string") action ={type:actionOpt};
        else if(YA.is_object(actionOpt))action = actionOpt;
        else {
            console.warn("action必须是string/object，该配置不是合适的类型，被忽略");
            continue;
        }
        if(!action.type){
            if(action.url) action.type = "link";
            else action.type = "button";
        }
        if(!action.displayName) action.displayName = action.type;
        actions.push(action);
    }
    return actions;
}


export let validators :{[name:string]:(value:any,opt?:string)=>boolean} = {
    "required":(value:any,opts:string|boolean):boolean=>{  
        if(opts===false) return true;
        if(opts==="strict"){
            if(typeof value==="string") return YA.trim(value as string)!=="";
            for(let n in value) return true;
            return false;
        }
        return value!=0;
    }
};
