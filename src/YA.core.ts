

export function intimate(strong?:boolean|any,members?:any){
    if(members){
        for(const n in members){
            Object.defineProperty(strong,n,{enumerable:false,writable:true,configurable:true,value:members[n]});
        }
        return;
    }
    return function(target:any,propName?:string){
        if(propName!==undefined) {
            Object.defineProperty(target,propName,{enumerable:false,writable:!strong,configurable:strong!==true,value:target[propName]});
        }else{
            target = typeof target ==="function"?target.prototype:target;
            for(let n in target) Object.defineProperty(target,n,{enumerable:false,writable:!strong,configurable:strong!==true,value:target[n]});
        }
    }
}

//===============================================================================


/**
 * 可监听对象接口
 *
 * @export
 * @interface IObservable
 * @template TEvtArgs 事件参数的类型
 */
export interface ISubject<TEvtArgs>{
     
    /**
     * 内部的主题列表，可以访问它，但不推荐直接使用，主要是debug时使用
     * 如果不指明主题topic，默认topic=""
     * @type {[topic:string]:Function[]}
     * @memberof ISubject
     */
    

    $_topics:{[topic:string]:Function[]};
    
    /**
     * 注册监听函数
     * $notify的时候，注册了相关主题的监听函数会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $subscribe(topicOrListener:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):ISubject<TEvtArgs>;
    
    /**
     * 取消主题订阅
     * $notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $unsubscribe(topicOrListener:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):ISubject<TEvtArgs>;

    /**
     * 发送通知
     * 如果相关主题上有监听器，会逐个调用监听器
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|TEvtArgs)} topicOrEvtArgs 通知的主题或事件参数
     * @param {TEvtArgs} [evt] 事件参数，只有topicOrEvtArgs是topic才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $notify(topicOrEvtArgs:string|TEvtArgs,evt?:TEvtArgs):ISubject<TEvtArgs>;
}



/**
 * 可监听对象类
 * 实现订阅/发布模式
 * 它支持订阅/发布某个主题;如果未指定主题，默认主题为""
 * 它的所有关于订阅发布的成员字段/函数都是enumerable=false的
 * 一般用作其他类型的基类
 * 
 * @export
 * @class Observable
 * @implements {IObservable<TEvtArgs>}
 * @template TEvtArgs 事件参数的类型
 */
@intimate()
export class Subject<TEvtArgs> implements ISubject<TEvtArgs>{
    /**
     * 内部的主题列表，可以访问它，但不推荐直接使用，主要是debug时使用
     * 如果不指明主题topic，默认topic=""
     * 
     * @type {[topic:string]:Function[]}
     * @memberof Observable
     */
    $_topics:{[topic:string]:{(evt:TEvtArgs):any}[]};
    
    constructor(){
        Object.defineProperty(this,"$_topics",{enumerable:false,writable:true,configurable:false});
    }
    /**
     * 注册监听函数
     * $notify的时候，注册了相关主题的监听函数会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $subscribe(topicOrListener:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):ISubject<TEvtArgs>{
        if(listener===undefined) {
            listener = topicOrListener as {(evt:TEvtArgs):any};
            topicOrListener="";
        }
        let topics = this.$_topics ||(this.$_topics={});
        let handlers = topics[topicOrListener as string] ||(topics[topicOrListener as string] =[]);
        handlers.push(listener);
        return this;
    }
    /**
     * 取消主题订阅
     * $notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $unsubscribe(topicOrListener:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):ISubject<TEvtArgs>{
        if(listener===undefined) {
            listener = topicOrListener as {(evt:TEvtArgs):any};
            topicOrListener="";
        }
        let topics,handlers;
        if(!(topics = this.$_topics)) return this;
        if(!(handlers=topics[topicOrListener as string])) return this;
        for(let i =0,j=handlers.length;i<j;i++){
            let existed = handlers.shift();
            if(existed!==listener) handlers.push(existed);
        }
        return this;
    }
    /**
     * 发送通知
     * 如果相关主题上有监听器，会逐个调用监听器
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|TEvtArgs)} topicOrEvtArgs 通知的主题或事件参数
     * @param {TEvtArgs} [evt] 事件参数，只有topicOrEvtArgs是topic才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $notify(topicOrEvtArgs:string|TEvtArgs,evtArgs?:TEvtArgs):ISubject<TEvtArgs>{
        if(evtArgs===undefined){
            evtArgs = topicOrEvtArgs as TEvtArgs;
            topicOrEvtArgs="";
        }
        let topics,handlers;
        if(!(topics = this.$_topics)) return this;
        if(!(handlers=topics[topicOrEvtArgs as string])) return this;
        for(const i in handlers){
            handlers[i].call(this,evtArgs);
        }
        return this;
    }
}

//defineMembers(Observable.prototype);

//================================================================

export enum DataTypes{
    Value,
    Object,
    Array
}

export enum ObservableModes{
    Default,
    Raw,
    Proxy
}


export interface IObservable<TData> extends ISubject<IChangeEventArgs<TData>>{
    $type:DataTypes;
    $extras?:any;
    $target?:TData;
    $get(accessMode?:ObservableModes):TData|IObservable<TData>;
    $set(newValue:TData):IObservable<TData>;
    $update():boolean;
}



export function observableMode(mode:ObservableModes,statement:()=>any) {
    let accessMode = Observable.accessMode;
    try{
        Observable.accessMode=mode;
        statement();
    }finally{
        Observable.accessMode = accessMode;
    }
}

export function  proxyMode(statement:()=>any) {
    let accessMode = Observable.accessMode;
    try{
        Observable.accessMode=ObservableModes.Proxy;
        statement();
    }finally{
        Observable.accessMode = accessMode;
    }
}



export interface IChangeEventArgs<TData>{
    type:ChangeTypes,
    index?:string|number;
    target?:any;
    value?:any,
    old?:any,
    item?:IObservable<TData>,
    sender?:any,
    cancel?:boolean
}

export enum ChangeTypes{
    Value,
    Replace,
    Append,
    Push,
    Pop,
    Shift,
    Unshift,
    Remove
}



let Undefined:any = {};

export interface IObservableIndexable<TData extends {[index in keyof object]:any}> extends IObservable<TData>{
    $target:any;
    $_modifiedValue:any;
}
@intimate()
export class Observable<TData> extends Subject<IChangeEventArgs<TData>> implements IObservable<TData>{
    $type:DataTypes;

    $target:TData;

    $extras?:any;

    $schema?:ObservableSchema<TData>;

    $_index?:number|string;

    $_modifiedValue:TData;
    
    $_owner?:IObservableIndexable<TData>;

    $_raw:(value?:TData)=>any;

    constructor(init:IObservableIndexable<TData>|{(val?:TData):any}|TData,index?:any,extras?:any){
        super();
        
        if(init instanceof ObservableObject){
            //ctor(owner,index,extras)
            this.$_owner= init as IObservableIndexable<TData>;
            this.$_index = index;
            this.$_raw = (val:TData):any=>val===undefined
                ?(this.$_owner.$_modifiedValue===undefined
                    ?this.$_owner.$target
                    :(this.$_owner.$_modifiedValue===Undefined?null:this.$_owner.$_modifiedValue)
                )[this.$_index]
                :((this.$_owner.$_modifiedValue===undefined
                    ?this.$_owner.$target
                    :(this.$_owner.$_modifiedValue===Undefined?null:this.$_owner.$_modifiedValue)
                )as any)[this.$_index]=val as any;   
            this.$target = this.$_raw();
            this.$extras = extras;
        }else if(typeof init==="function"){
            //ctor(TRaw,extras)
            this.$extras = index;
            this.$_raw = init as {(val?:TData):any};
            this.$target = this.$_raw();
        }else {
            if(typeof index==="function"){
                this.$extras = extras;
                this.$_raw = index;
                this.$target = init as TData;
                index.call(this,init);
            }else {
                this.$target=init as TData;
                this.$extras = index;
                this.$_raw =(val:TData)=>val===undefined?init:init=val;
            }
        }
    
        
        intimate(this, {
            $target:this.$target,$extras:this.$extras,$type:DataTypes.Value,$schema:this.$schema
            ,$_raw:this.$_raw,$_index:this.$_index,$_modifiedValue:undefined,$_owner:this.$_owner
        });
    }
    

    $get(accessMode?:ObservableModes):TData|IObservable<TData>{
        if(accessMode == ObservableModes.Raw || Observable.accessMode===ObservableModes.Raw) return this.$_raw();
        if( accessMode == ObservableModes.Proxy || Observable.accessMode===ObservableModes.Proxy) return this;
        return (this.$_modifiedValue===undefined)?this.$target:(this.$_modifiedValue===Undefined?undefined:this.$_modifiedValue);
    }

    $set(newValue:TData):IObservable<TData>{
        if(Observable.accessMode===ObservableModes.Raw) {this.$_raw.call(this,newValue);return this;}
        this.$_modifiedValue=newValue===undefined?Undefined:newValue;
        return this;
    }
    $update():boolean{
        let newValue :any= this.$_modifiedValue;
        if(newValue===undefined) return true;
        this.$_modifiedValue=undefined;
        newValue =newValue===Undefined?undefined:newValue;
        let oldValue = this.$target;
        if(newValue!==oldValue) {
            this.$_raw(this.$target = newValue);
            let evtArgs:IChangeEventArgs<TData> = {type:ChangeTypes.Value,value:newValue,old:oldValue,sender:this};
            this.$notify(evtArgs);
            return evtArgs.cancel!==true;
        }
        return true;
        
    }

    toString(){
        let  currentValue = this.$get();
        return currentValue===undefined || currentValue===null?"":currentValue.toString();
    }
    static accessMode:ObservableModes = ObservableModes.Default; 
}



export interface IObservableObject<TData extends {[index:string]:any}> extends IObservable<TData>{
    //$prop(name:string,prop:IObservable<TData>|boolean|{(proxy:ObservableObject<TData>,name:string):any}|PropertyDecorator):IObservableObject<TData>;
    [index:string]:any;   
}



@intimate()
export class ObservableObject<TData> extends Observable<TData> implements IObservableObject<TData>,IObservableIndexable<TData>{
    [index:string]:any;
    constructor(init:IObservableIndexable<any>|{(val?:TData):any}|TData,index?:any,extras?:any){
        super(init,index,extras);
        this.$type = DataTypes.Object;
        if(!this.$target) this.$_raw(this.$target={} as any);
        if(!this.$schema){
            this.$schema = new ObservableSchema<TData>(this.$target);
            this.$schema.$initObject(this);
        }
        
        
    }

    $get(accessMode?:ObservableModes):any{
        if(accessMode=== ObservableModes.Raw || Observable.accessMode===ObservableModes.Raw) return this.$_raw();
        return this;
    }

    $set(newValue:TData):IObservableObject<TData>{
        super.$set(newValue||null);
        if(!newValue || Observable.accessMode===ObservableModes.Raw) return this;
        proxyMode(()=>{
            for(const n in this){
                let proxy :any= this[n];
                if(proxy instanceof Observable) proxy.$set((newValue as any)[n] as any);
            }
        });
        return this;
    }

    $update():boolean{
        let result = super.$update();
        if(result===false) return false;
        proxyMode(()=>{
            for(const n in this){
                let proxy :any= this[n];
                if(proxy instanceof Observable) proxy.$update();
            }
        });
        return true;
    }
}
export interface IObservableArray<TItem> extends IObservable<TItem[]>{
    [index:number]:any;  
    length:number; 
}
@intimate()
export class ObservableArray<TItem> extends Observable<TItem[]> implements IObservableArray<TItem>,IObservableIndexable<TItem[]>{
    [index:number]:any;
    length:number;
    $_changes:IChangeEventArgs<TItem[]>[];
    $_length:number;
    $_itemSchema:ObservableSchema<TItem>;
    
    constructor(init:IObservableIndexable<TItem[]>|{(val?:TItem[]):any}|TItem[],index?:any,itemSchemaOrExtras?:any,extras?:any){
        let target:any;
        super(init,index,extras);
        this.$type = DataTypes.Array;
        target = this.$target;
        if(Object.prototype.toString.call(target)!=="[object Array]") this.$_raw.call(this,target=this.$target=[]);

        if(!this.$schema){
            this.$schema = new ObservableSchema<TItem[]>(this.$target);
        }
        let itemSchema :ObservableSchema<TItem>;
        if(index instanceof ObservableSchema){
            extras = itemSchemaOrExtras;
            itemSchema = index;
        } 
        else if(itemSchemaOrExtras instanceof ObservableSchema) itemSchema= itemSchemaOrExtras;
        else if(extras instanceof ObservableSchema){
            itemSchema = extras;
            extras = itemSchemaOrExtras;
        }
        this.$_itemSchema = itemSchema || this.$schema.$itemSchema as ObservableSchema<any>;
        let item_index:number=0;
        for(let i =0,j=target.length;i<j;i++) makeArrayItem(this,item_index++);
        
        intimate(this,{
            $_changes:undefined,$_length:target.length,$_itemSchema:undefined
        });
        Object.defineProperty(this,"length",{
            enumerable:false,configurable:false,get:()=>this.$_length,set:(val)=>{}
        });
    }

    toString(){
        let ret = "";
        proxyMode(()=>{
            for(let i =0,j=this.$_length;i<j;i++){
                let item = this[i];
                if(i!==0) ret +=",";
                ret += `${item.$get()}`;
            }
        });
        return ret;
    }
    

    clear():ObservableArray<TItem>{
        let old = this.$get() as TItem[];
        let changes = this.$_changes|| (this.$_changes=[]);
        let len = old.length;
        if(changes)for(const i in changes){
            let change = changes[i];
            if(change.type ===ChangeTypes.Push || change.type===ChangeTypes.Unshift){
                len++;
            }
        }
        proxyMode(()=>{
            for(let i = 0;i<len;i++){
                let removeItem = this[i];
                if(removeItem){
                    delete this[i];
                    changes.push({
                        type:ChangeTypes.Remove,
                        index:i,
                        target:old,
                        item:removeItem,
                        sender:removeItem
                    });
                }
            }
        });
              

        return this;
    }

    $update():boolean{
        if(!super.$update()) return true;
        let changes = this.$_changes;
        if(!changes || this.$_changes.length===0) return true;
        this.$_changes = undefined;

        let arr = this.$target;
        for(const i in changes){
            let change = changes[i];
            switch(change.type){
                case ChangeTypes.Push:
                    arr.push(change.value);
                    this.$notify(change);
                    //if(change.cancel!==true && change.item) change.item.$notify(change);
                    break;
                case ChangeTypes.Pop:
                    arr.pop();
                    this.$notify(change);
                    if(change.cancel!==true && change.item) {
                        change.sender = change.item;
                        change.item.$notify(change);
                    }
                    break;
                case ChangeTypes.Unshift:
                    arr.unshift(change.value);
                    this.$notify(change);
                    break;
                case ChangeTypes.Shift:
                    arr.shift();
                    this.$notify(change);
                    if(change.cancel!==true && change.item) {
                        change.sender = change.item;
                        change.item.$notify(change);
                    }
                    break;
                case ChangeTypes.Replace:
                    arr[change.index] = change.value;
                    this.$notify(change);
                    if(change.cancel!==true){
                        change.sender =change.item;
                        change.type = ChangeTypes.Value;
                        change.sender.$notify(change);
                    } 
                    break;
            }
        }
        return true;
    }
    
}

function makeArrayItem<TItem>(obArray:ObservableArray<TItem>,index:number){
    let item = new obArray.$_itemSchema.$ctor(obArray.$target[index],obArray);
    item.$_index = index;
    Object.defineProperty(obArray,index as any as string,{enumerable:true,configurable:true
        ,get:(mode?:ObservableModes) => item.$get(mode)
        ,set:(item_value:TItem)=>{
            (obArray.$_changes || (obArray.$_changes=[])).push({
                sender:obArray,
                type:ChangeTypes.Replace,
                index:index,
                item:item,
                value:item_value
            });
            item.$set(item_value);
        }
    });
}

function defineProp<TObject>(target:any,name:string,accessorFactory:{(proxy:ObservableObject<TObject>,name:string):any}|PropertyDecorator){
    let prop_value:any =Undefined;
    Object.defineProperty(target,name,{
        enumerable:true,
        configurable:false,
        get:function(param?:any){
            if(prop_value===Undefined) prop_value=accessorFactory.call(this,target,name);
            return prop_value.get?prop_value.get(param):prop_value.$get(param);
        },
        set:(val)=>{
            if(prop_value===Undefined) prop_value=accessorFactory.call(this,target,name);
            return prop_value.set?prop_value.set(val):prop_value.$set(val);
        }
    });  
    return this;
}


 
//=======================================================================
@intimate()
export class ObservableSchema<TData>{
    [index:string]:any;
    $type:DataTypes;
    $index:string|number;
    $path:string;
    $ctor:{new (initValue:TData|{(val?:TData):any},owner?:ObservableObject<any>|any,extras?:any):Observable<any>};
    //$prop_models:{[index:string]:Model};
    $owner?:ObservableSchema<TData>;
    $itemSchema?:ObservableSchema<TData>;
    $initData?:any;
    constructor(initData:TData,index?:string|number,owner?:ObservableSchema<any>){
        let path;
        index = index===undefined|| index===null?"":index;
        if(owner){
            let ppath = owner.$path;
            path = ppath?ppath + "." + index:index;
        }else path = index;

        intimate(this,{
            "$type":DataTypes.Value
            ,"$index":index
            ,"$path":path
            ,"$owner":owner
            ,"$ctor":Observable
            ,"$itemSchema":null
            ,"$initData":initData
        });
        if(initData){
            let t = Object.prototype.toString.call(initData);
            if(t==="[object Object]") {
                this.$asObject();           
                for(const n in initData){
                    this.$defineProp(n,initData[n]);
                }
            }
            else if(t==="[object Array]"){
                this.$asArray();
            }else {
                this.$type = DataTypes.Value;
                this.$ctor = Observable;
            }
        }
    }

    $asObject():ObservableSchema<TData>{
        if(this.$type===DataTypes.Object) return this;
        if(this.$type === DataTypes.Array) throw new Error("无法将ObservableSchema从Array转化成Object.");
        this.$type = DataTypes.Object;
        
        class _ObservableObject extends ObservableObject<TData>{
            constructor(init:ObservableObject<any>|{(val?:TData):any}|TData,index?:any,extras?:any){
                super(init,index,extras);
            }
        };
        _ObservableObject.prototype.$schema= this;
        this.$ctor= _ObservableObject;
        return this;
    }

    $asArray():ObservableSchema<TData>{
        if(this.$type===DataTypes.Array) return this;
        if(this.$type === DataTypes.Object) throw new Error("无法将ObservableSchema从Object转化成Array.");
        this.$type = DataTypes.Array;
        class _ObservableArray extends ObservableArray<any>{
            constructor(init:ObservableObject<any>|{(val?:TData):any}|TData,index?:any,extras?:any){
                super(init as any,index,extras);
            }
        };
        if(this.$initData){
            let item = this.$initData.shift();
            if(item) {
                this.$itemSchema = new ObservableSchema(item,-1,this);
                if(!item[ObservableSchema.schemaToken])this.$initData.unshift(item);
            }
        }
        if(!this.$itemSchema) this.$itemSchema = new ObservableSchema(undefined,-1,this);
        _ObservableArray.prototype.$schema= this as any;
        this.$ctor= _ObservableArray;

    }

    $defineProp<TProp>(propname:string,initValue?:TProp):ObservableSchema<TProp>{
        if(this.$type!==DataTypes.Object) throw new Error("调用$defineProp之前，要首先调用$asObject");
        let propSchema :ObservableSchema<TProp> = new ObservableSchema<TProp>(initValue,propname,this);
        Object.defineProperty(this,propname,{enumerable:true,writable:false,configurable:false,value:propSchema});
        defineProp<TData>(this.$ctor.prototype,propname,function(owner,name){return new propSchema.$ctor(this,name);});        
        return propSchema;
    }

    $initObject(ob:Observable<TData>){
        for(const n in this){
            let propSchema = this[n] as any as ObservableSchema<any>;
            defineProp<TData>(ob,n,function(owner,name){return new propSchema.$ctor(this,name);});
        }
    }
    
    $create(init:(val?:TData)=>any,extras?:any){
        return new this.$ctor(clone(this.$initData,true),init,extras);
    }

    static schemaToken:string = "$__ONLY_USED_BY_SCHEMA__";
}


//=======================================================================

export enum StateTypes{
    Internal,
    Iterator,
    In,
    Out,
    Ref
}
export interface IStateInfo{
    name?:string;
    type?:StateTypes;
    schema?:ObservableSchema<any>;
    initData?:any;
}

/**
 * 两种用法:
 * 1 作为class member的装饰器 @reactive()
 * 2 对某个component类手动构建reactive信息，reactive(MyComponent,{name:'model',type:0,schema:null})
 * @param {(StateTypes|Function)} [type]
 * @param {{[prop:string]:IStateInfo}} [defs]
 * @returns
 */
function state(type?:StateTypes|Function,defs?:{[prop:string]:IStateInfo}) {
    function markStateInfo(target:IComponentInfo,info:string|IStateInfo) {
        let infos = sureMetaInfo(target,"states");
        
        if((info as IStateInfo).name){
            if(!(info as IStateInfo).schema) (info as IStateInfo).schema = target[(info as IStateInfo).name];
            infos[(info as IStateInfo).name]= info as IStateInfo;
        }else {
            infos[info as string] = {type :type as StateTypes|| StateTypes.Internal,name:info as string,schema:target[info as string]};
        }
    }
    if(defs){
        let target = (type as Function).prototype;
        for(const n in defs){
            let def = defs[n];def.name = n;
            markStateInfo(target,def);
        } 
    }
    return markStateInfo;
}

//==========================================================

export interface ITemplateInfo{
    name?:string;
    vnode?:any;
    partial?:string;
    render?:Function;
}

function template(partial?:string|Function,defs?:{[prop:string]:ITemplateInfo}){
    function markTemplateInfo(target:IComponentInfo,info:string|ITemplateInfo) {
        let infos = sureMetaInfo(target,"templates");
        if(defs){
            infos[(info as ITemplateInfo).partial]= info as IStateInfo;
        }else {
            partial ||(partial=info as string);
            infos[partial as string] = { name: info as string, partial:partial as string };
        }
    }
    if(defs){
        let target = (partial as Function).prototype;
        for(const n in defs){
            let def = defs[n];def.name = n;def.partial ||(def.partial=n);
            markTemplateInfo(target,def);
        } 
    }
    return markTemplateInfo;
}

//===============================================================================================

export interface IActionInfo{
    name?:string;
    async?:boolean;
    method?:Function;
}

function action(async?:boolean|Function,defs?:{[prop:string]:ITemplateInfo}){
    function markActionInfo(target:IComponentInfo,info:string|ITemplateInfo) {
        let infos = sureMetaInfo(target,"actions");

        if(defs){
            infos[(info as IActionInfo).name]= info as IActionInfo;
        }else {
            
            infos[info as string] = { name: info as string, async:async as boolean };
        }
    }
    if(defs){
        let target = (async as Function).prototype;
        for(const n in defs){
            let def = defs[n];def.name = n;
            markActionInfo(target,def);
        } 
    }
    return markActionInfo;
}

export interface IComponentInfo {
    states?:{[prop:string]:IStateInfo};
    templates?:{[partial:string]:ITemplateInfo};
    actions?:{[methodname:string]:IActionInfo};
    ctor?:Function;
    statesCtor?:any;
    tag?:string;
    render?:Function;
    inited?:boolean;
}
function sureMetaInfo(target?:any,name?:string){
    let meta = target.$meta;
    if(!meta) Object.defineProperty(target,"$meta",{enumerable:false,configurable:false,writable:true,value:meta={}});
    if(!name) return meta;
    let info = meta[name];
    if(!info) Object.defineProperty(meta,info,{enumerable:false,configurable:false,writable:true,value:meta={}});
    return info;
}

export interface IComponent{
    [membername:string]:any;
    
}
export interface IInternalComponent extends IComponent{
    $meta:IComponentInfo;
    $states:{[name:string]:Observable<any>};
}

let registeredComponentInfos : {[tag:string]:IComponentInfo}={};

export function component(tag:string,ComponentType?:Function){
    let registerComponent = function (compoentType:Function) {
        let meta = sureMetaInfo(compoentType.prototype) as IComponentInfo;
        meta.tag = tag;
        meta.ctor = ComponentType;
        registeredComponentInfos[tag]= meta;
    }
    if(ComponentType) {
        return registerComponent(ComponentType);
    }else return registerComponent;
}

function initComponent(firstComponent:IInternalComponent){
    let meta:IComponentInfo = firstComponent.$meta;
    if(!meta || meta.inited) return firstComponent;
    for(const name in meta.states){
        let stateInfo = meta.states[name];
        let initData = firstComponent[stateInfo.name];
        let schema = stateInfo.schema; 
        if(!schema){
            schema =stateInfo.schema = new ObservableSchema<any>(stateInfo.initData||initData,name);
        }
        stateInfo.initData = initData;
        (schema as ObservableSchema<any>).$index= name;
        initState(firstComponent,stateInfo);
    }
    meta.inited=true;
}

function initState(firstComponent:IInternalComponent,stateInfo:IStateInfo){
    let descriptor = {
        enumerable:true
        ,configurable:false
        ,get:function() {
            let states = firstComponent.$states ||(firstComponent.$states={});
            let ob = states[stateInfo.name]|| (states[stateInfo.name] = new stateInfo.schema.$ctor(stateInfo.initData,stateInfo));  
            return ob.$get();
        }
        ,set:function(val:any){
            let states = firstComponent.$states ||(firstComponent.$states={});
            if(val instanceof Observable) {states[stateInfo.name] = val;return;}
            let ob = states[stateInfo.name]|| (states[stateInfo.name] = new stateInfo.schema.$ctor(stateInfo.initData,stateInfo));  
            ob.$set(val);
        }
    };
    Object.defineProperty(firstComponent,stateInfo.name,descriptor);
    Object.defineProperty(firstComponent.$meta.ctor.prototype,stateInfo.name,descriptor);
}





//=========================================================================


let evtnameRegx = /(?:on)?([a-zA-Z_][a-zA-Z0-9_]*)/;
export class VirtualNode{
    tag?:string;
    attrs?:{[name:string]:any};
    content?:any;
    children?:VirtualNode[];
    constructor(){}

    genCodes(variables:any[],codes?:string[],tabs?:string):string[]{
        return null;
    }

    genChildrenCodes(variables:any[],codes?:string[],tabs?:string):string[]{
        return null;
    }

    render(component:IComponent,container?:any):any{
        let variables :any[]=[];
        let codeText = this.genCodes(variables).join("");
        console.log(codeText);
        let actualRenderFn = new Function("variables","HOST","component","container",codeText) as {(variables,HOST:any,component:IComponent,container?:any):any};
        this.render =(component,container)=> actualRenderFn(variables,HOST,component,container);
        return this.render(component,container);
    }

    renderChildren(component:IComponent,container?:any):any{
        let variables :any[]=[];
        let actualRenderFn = new Function("HOST","component","elem",this.genChildrenCodes(variables).join("")+"return children;\n") as {(HOST:any,component:IComponent,container?:any):any};
        this.renderChildren =(component,container)=> actualRenderFn(HOST,component,container);
        return this.renderChildren(component,container);
    }

    static create(tag:string,attrs:{[attrName:string]:any}){
        let vnode :VirtualNode;
        let componentInfo = registeredComponentInfos[tag];
        if(componentInfo)vnode = new VirtualComponentNode(tag,attrs,componentInfo);
        else vnode = new VirtualElementNode(tag,attrs);
        for(let i=2,j=arguments.length;i<j;i++){
            let childNode = arguments[i];
            if(!(childNode instanceof VirtualNode)) childNode = new VirtualTextNode(childNode);
            (vnode.children || (vnode.children=[])).push(childNode);
        }       
        return vnode;
    }
}
let virtualNode = VirtualNode.create;

export class VirtualTextNode extends VirtualNode{
    
    constructor(public content:any){
        super();
    }
    genCodes(variables:any[],codes?:string[],tabs?:string):string[]{
        codes || (codes=[]);tabs || (tabs="");
        if(this.content instanceof Observable){
            if(this.content.$schema.path==="name") debugger;
            codes.push(`${tabs}var proxy=component.${this.content.$schema.path};\n`);
            codes.push(`${tabs}var elem=HOST.createText(proxy.$get());\n`);
            codes.push(`${tabs}proxy.$subscribe(function(e){elem.nodeValue = HOST.changeEventToText(e);})\n`);
        }else{
            codes.push(`${tabs}var elem = HOST.createText('${this.content.replace(/'/,"\\'")}');\n`);
        }
        codes.push(`${tabs}if(container) HOST.appendChild(container,elem);\n`);
        codes.push(`${tabs}return elem;\n`);
        return codes;
    }
}
export class VirtualElementNode extends VirtualNode{
    
    children?:VirtualNode[];

    constructor(public tag:string,public attrs:{[name:string]:any}){
        super();
    }
    genCodes(variables:any[],codes?:string[],tabs?:string):string[]{
        codes || (codes=[]);tabs || (tabs="");
        codes.push(`${tabs}var elem=HOST.createElement("${this.tag}");\n`);
        
        let repeatPars :any[];
        for(const attrname in this.attrs){
            let attrValue= this.attrs[attrname];
            if(attrname==="repeat") {
                repeatPars = [];
                for(let i in attrValue) repeatPars.push(`component.${attrValue[i].$schema.path}`);
                continue;
            }
            
            if(attrValue&& attrValue.$actionName){
                let match = attrname.match(evtnameRegx);
                let evtName = match?match[1]:attrname;
                codes.push(`${tabs}HOST.attach(elem,"${evtName}",component.${attrValue.$actionName});\n`);
            }else if(attrValue instanceof Observable){
                let binder = attrBinders[name];
                if(binder)
                    codes.push(`${tabs}HOST.$attrBinders["${attrname}"].call(component,elem,compnent.${attrValue.$schema.path});\n`);
                else 
                    codes.push(`${tabs}HOST.setAttribute(elem,"${attrname}","${attrValue}");\n`);
            }else {
                codes.push(`${tabs}HOST.setAttribute(elem,"${attrname}","${attrValue}");\n`);
            }
        }
        codes.push(`${tabs}if(container) HOST.appendChild(container,elem);\n`);

        if(repeatPars){
            codes.push(`${tabs}VirtualNode.repeat(component,elem,vars[${variables.length}],${repeatPars.join(",")});\n`);
            variables.push(this);
        }else{
            this.genChildrenCodes(variables,codes,tabs);
        }
        
        codes.push(`${tabs}return elem;\n`);
        return codes;
    }
    genChildrenCodes(variables:any[],codes?:string[],tabs?:string):string[]{
        codes || (codes=[]);tabs || (tabs="");
        if(this.children && this.children.length){
            codes.push(tabs + "var child;var children=[];\n");
            let subTabs = tabs+"\t";
            for(let i in this.children){
                let child = this.children[i];
                codes.push(`${tabs}children.push(child=(function(HOST,component,container){\n`);
                child.genCodes(variables,codes,subTabs);
                codes.push(`${tabs}})(HOST,component,elem));\n`);
            }
        }
        return codes;
    }
}

export class VirtualComponentNode extends VirtualNode{
    children?:VirtualNode[];
    constructor(public tag:string,public attrs:{[name:string]:any},public content:any){
        super();
    }
    genCodes(variables:any[],codes?:string[],tabs?:string):string[]{
        codes || (codes=[]);tabs || (tabs="");
        let typeAt = variables.length;
        codes.push(`${tabs}var subComponent = variables[${typeAt}].$create();\n`);
        variables.push(this.content);
        let componentInfo = this.content as IComponentInfo;
        for(const attrName in this.attrs){
            let attrValue = this.attrs[attrName];
            let stateType = componentInfo.states[attrName];
            if(stateType===StateTypes.Internal || stateType===StateTypes.Iterator) throw new Error(`${this.tag}.${attrName}是内部变量，不可以在外部赋值`);
            
            if(stateType === StateTypes.Out){
                if(attrValue instanceof Observable){
                    codes.push(`${tabs}subComponent.${attrName}.$subscribe(function(e){component.${attrValue.$schema.path}.$set(e.item?e.item.$get():e.value);});\n`);
                    
                }else {
                    codes.push(`${tabs}subComponent.${attrName}.$subscribe(function(e){component.${attrName}=e.item?e.item.$get():e.value;});\n`);
                }
            }else if(stateType===StateTypes.In){
                if(attrValue instanceof Observable){
                    codes.push(`${tabs}subComponent.${attrName}.$set(component.${attrValue.$schema.path}.$get());\n`);
                }else{
                    codes.push(`${tabs}subComponent.${attrName}.$set(component.${attrName});\n`);
                }
                
            }else if(stateType===StateTypes.Ref){
                if(attrValue instanceof Observable){
                    codes.push(`${tabs}subComponent.${attrName}.$subscribe(function(e){component.${attrValue.$schema.path}.$set(e.item?e.item.$get():e.value);});\n`);
                    codes.push(`${tabs}component.${attrValue.$schema.path}.$subscribe(function(e){subComponent.${attrName}.$set(e.item?e.item.$get():e.value);});\n`);
                }else {
                    codes.push(`${tabs}subComponent.${attrName}.$subscribe(function(e){component.${attrValue.$schema.path}.$set(e.item?e.item.$get():e.value);});\n`);
                    console.warn(`父组件的属性未设置未可观测对象，父组件的值发生变化后，无法传入${this.tag}.${attrName}`);
                }

            }else{
                codes.push(`${tabs}if(subComponent.${attrName}.$set) subComponent.${attrName}.$set(variables[${variables.length}]);else subComponent.${attrName}=variables[${variables.length}];\n`);
                variables.push(attrValue);
            }
        };
        codes.push(`${tabs}if(subComponent.initialize) setTimeout(function(){subComponent.initialize(elem);},0);\n`);
        codes.push(`${tabs}var elem = variables[${typeAt}].$render.call(subComponent,variables[${variables.length}]);\n`);
        variables.push(this);
        codes.push(`${tabs}if(container) HOST.appendChild(container,elem);\n`);
        return codes;
    }
}
(VirtualNode as any).repeat = 
function repeat(component:IComponent,container:any,vnode:VirtualNode,each:IObservable<any>,value:IObservable<any>,key:IObservable<any>){
    HOST.removeAllChildrens(container);
    
    for(let k in each){
        if(key)(key as any).$new(k);
        if(value) (value as any).$replace(each[k]);
        vnode.renderChildren(component,container);
    }
}

let attrBinders={};

//===========================================================================
let HOST:any={};
HOST.isElement=(elem):any=>{
    return (elem as HTMLElement).nodeType === 1;
};

HOST.createElement=(tag:string):any=>{
    return document.createElement(tag);
};

HOST.createText=(txt:string):any=>{
    return document.createTextNode(txt);
};


HOST.setAttribute=(elem:any,name:string,value:any)=>{
    elem.setAttribute(name,value);
};

HOST.appendChild=(elem:any,child:any)=>{
    elem.appendChild(child);
};

HOST.removeAllChildrens=(elem:any)=>{
    elem.innerHTML = elem.nodeValue="";
};

HOST.attach = (elem:any,evtname:string,handler:Function)=>{
    if(elem.addEventListener) elem.addEventListener(evtname,handler,false);
    else if(elem.attachEvent) elem.attachEvent('on' + evtname,handler);
    else elem['on'+evtname] = handler;
}
//======================================================================


 
export function  clone(src:any,deep?:boolean) {
    if(!src) return src;
    let srcT = Object.prototype.toString.call(src);
    if(srcT==="boolean" || srcT==="number" || srcT==="string") return src;
    let rs;
    if(srcT==="function"){
        let raw = src;
        if(src.$clone_raw) raw = src.$clone_raw;
        let rs = function () {return raw.apply(arguments);};
        Object.defineProperty(rs,"$clone_raw",{enumerable:false,writable:false,configurable:false,value:raw});
    }else if(srcT==="[object Object]") rs = {};
    else if(srcT==="[object Array]") rs = [];

    if(deep) for(const n in src)rs[n] = clone(src[n],true);
    else for(const n in src)rs[n] = src[n];

    return rs;
}

//=======================================================================

let YA={
    Subject, ObservableModes,observableMode,proxyMode,Observable,ObservableObject,ObservableArray, ObservableSchema
    ,VirtualNode,VirtualTextNode,VirtualElementNode,VirtualComponentNode,virtualNode,HOST
    ,intimate,clone
    
};
if(typeof window!=='undefined') (window as any).YA = YA;
export default YA;





