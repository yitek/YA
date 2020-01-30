
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


@intimate()
export class Observable<TData> extends Subject<IChangeEventArgs<TData>> implements IObservable<TData>{
    $type:DataTypes;

    $target:TData;

    $extras?:any;

    $schema?:ObservableSchema<TData>;

    $_index?:number|string;

    $_modifiedValue:TData;
    
    $_owner?:ObservableObject<any>;

    $_raw:(value?:TData)=>any;

    constructor(init:ObservableObject<any>|{(val?:TData):any}|TData,index?:any,extras?:any){
        super();
        
        if(init instanceof ObservableObject){
            //ctor(owner,index,extras)
            this.$_owner= init as ObservableObject<any>;
            this.$_index = index;
            this.$_raw = prop_raw(index);
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
                this.$target = init;
                index.call(this,init);
            }else {
                this.$target=init;
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

    toString(){let rawValue= this.$_raw();return rawValue?rawValue.toString():rawValue;}
    static accessMode:ObservableModes = ObservableModes.Default; 
}
//let ValueProxyProps = ["$modifiedValue","$type","$raw","$extras","$owner"];
//defineMembers(ObservableProxy.prototype,ObservableProxy.prototype);

export interface IObservableObject<TData extends {[index:string]:any}> extends IObservable<TData>{
    //$prop(name:string,prop:IObservable<TData>|boolean|{(proxy:ObservableObject<TData>,name:string):any}|PropertyDecorator):IObservableObject<TData>;
    [index:string]:any;   
}



@intimate()
export class ObservableObject<TData> extends Observable<TData> implements IObservableObject<TData>{
    [index:string]:any;
    constructor(init:ObservableObject<any>|{(val?:TData):any}|TData,index?:any,extras?:any){
        super(init,index,extras);
        if(!this.$target) this.$_raw(this.$target={} as any);
        if(!this.$schema){
            this.$schema = new ObservableSchema<TData>(this.$target);
            this.$schema.$initObservable(this);
        }
        
        this.$type = DataTypes.Object;
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



function prop_raw<TProp,TObj>(name:string|number):{(val?:any):any}{
    
    return function(val?:TProp){
        let objProxy:ObservableObject<TObj> = (this as ObservableObject<TObj>).$_owner;

        return val===undefined
            ?(objProxy.$_modifiedValue===undefined
                ?objProxy.$target
                :(objProxy.$_modifiedValue===Undefined?null:objProxy.$_modifiedValue)
            )[name]
            :(objProxy.$_modifiedValue===undefined
                ?objProxy.$target
                :(objProxy.$_modifiedValue===Undefined?null:objProxy.$_modifiedValue)
            )[name]=val;   
    }      
}

function defineMember<TObject>(target:any,name:string,accessorFactory:{(proxy:ObservableObject<TObject>,name:string):any}|PropertyDecorator){
    let prop_value:any;
    Object.defineProperty(target,name,{
        enumerable:true,
        configurable:false,
        get:()=>{
            if(prop_value===undefined) prop_value=accessorFactory.call(target,target,name);
            return prop_value.get?prop_value.get():prop_value.$get();
        },
        set:(val)=>{
            if(prop_value===undefined) prop_value=accessorFactory.call(target,target,name);
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
    $item_ctor:{new (raw?:Function,initData?:any,extras?:any,owner?:Observable<any>):Observable<any>};
    //$prop_models:{[index:string]:Model};
    $owner?:ObservableSchema<TData>;
    $item_schema?:ObservableSchema<TData>;
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
            ,"$item_schema":null
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
                throw new Error("not implement.");
            }
        }
    }
    

    

    $asObject():ObservableSchema<TData>{
        if(this.$type===DataTypes.Object) return this;
        if(this.$type === DataTypes.Array) throw new Error("无法将ObservableSchema从Array转化成Object.");
        this.$type = DataTypes.Object;
        let objSchema = this;
        class _ObservableObject extends ObservableObject<TData>{
            constructor(init:ObservableObject<any>|{(val?:TData):any}|TData,index?:any,extras?:any){
                super(init,index,extras);
            }
        };
        _ObservableObject.prototype.$schema= this;
        this.$ctor= _ObservableObject;
        return this;
    }

    $defineProp<TProp>(propname:string,initValue?:TProp):ObservableSchema<TProp>{
        if(this.$type!==DataTypes.Object) throw new Error("调用$defineProp之前，要首先调用$asObject");
        let propSchema :ObservableSchema<TProp> = new ObservableSchema<TProp>(initValue,propname,this);
        Object.defineProperty(this,propname,{enumerable:true,writable:false,configurable:false,value:propSchema});
        defineMember<TData>(this.$ctor,propname,(owner,name)=>new propSchema.$ctor(owner,name));        
        return propSchema;
    }

    $initObservable(ob:Observable<TData>){
        for(const n in this){
            let propSchema = this[n] as any as ObservableSchema<any>;
            defineMember<TData>(ob,n,(owner,name)=>new propSchema.$ctor(owner,name));
        }
    }
    
    $create(init:(val?:TData)=>any,extras?:any){
        return new this.$ctor(clone(this.$initData,true),init,extras);
    }
}


//=======================================================================


let YA={
    Subject, ObservableModes,Observable,ObservableObject, ObservableSchema
    
};
if(typeof window!=='undefined') (window as any).YA = YA;
export default YA;





