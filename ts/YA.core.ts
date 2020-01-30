
function defineMembers(target:any,props?:any,des?:boolean|PropertyDecorator){
    props ||(props=target);
    let descriptor = {enumerable:false,writable:true,configurable:false,value:undefined};
    if(des===true) descriptor.writable=true;
    else if(des===false) descriptor.writable = false;
    else if(des) for(const n in descriptor) descriptor[n] = des[n];
    for(const n in props){
        descriptor.value = props[n];
        Object.defineProperty(target,n,descriptor);
    } 
    return target;
}
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

    static schemaToken:string = "__ONLY_USED_BY_SCHEMA__";
}


//=======================================================================


let YA={
    Subject, ObservableModes,Observable,ObservableObject, ObservableSchema
    
};
if(typeof window!=='undefined') (window as any).YA = YA;
export default YA;





