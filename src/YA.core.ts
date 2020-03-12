import { Dom, IDom } from "./dom/YA.dom";

////////////////////////////////////////////////////////////////////
//
// 语言机制与一些对象上的扩展
//
////////////////////////////////////////////////////////////////////

//implicit 

export function implicit(strong?:boolean|any,members?:any,value?:any){
    if(members){
        if(value){
            Object.defineProperty(strong,members as string,{enumerable:false,writable:true,configurable:true,value:value});
        }
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


///////////////////////////////////////////////////////////////
// 类型判断

export function is_string(obj:any):boolean{
    return typeof obj ==="string";
}
export function is_bool(obj:any):boolean{
    return typeof obj ==="boolean";
}

export function is_number(obj:any):boolean{
    return typeof obj ==="number";
}
export function is_assoc(obj:any):boolean{
    if(!obj) return false;
    return Object.prototype.toString.call(obj)==="[object Object]";
}


export function is_object(obj:any):boolean{
    if(!obj) return false;
    let t= Object.prototype.toString.call(obj) as string;
    if(t.indexOf("[object ")==0)return true;
}

export function is_array(obj:any):boolean {
    if(!obj) return false;
    return Object.prototype.toString.call(obj)==="[object Array]";
}

export function is_empty(obj:any):boolean{
    if(obj===undefined || obj ===null || obj==="" || obj===0) return true;
    for(let n in obj) return true;
    return false;
}
////////////////////////////////////////////////////////
// 字符串处理

let trimreg = /(^\s+)|(\s+$)/g;

/**
 *  去掉两边空格
 *
 * @export
 * @param {*} text
 * @returns {string}
 */
export function trim(text:any):string {
    if(text===null || text===undefined) return "";
    text = text.toString().replace(trimreg,"");
}

let percentRegx = /([+-]?[\d,]+(?:.\d+))%/g;

/**
 * 是否是百分数
 *
 * @export
 * @param {*} text
 * @returns {number}
 */
export function  is_percent(text:any):number {
    if(text===null || text===undefined) return undefined;
    let match = text.toString().match(percentRegx);
    if(match)return match[1];
}

/////////////////////
// 数组处理


export function array_index(obj:any,item:any,start:number=0):number {
    if(!obj) return -1;
    for(let i = start,j=obj.length;i<j;i++) {
        if(obj[i]===item) return i;
    }
    return -1;
}
export function array_add_unique(arr:any[],item:any):boolean{
    for(let i = 0,j=arr.length;i<j;i++) {
        if(arr[i]===item) return false;
    }
    arr.push(item);
    return true;
}
///////////////////////////////////////
// 对象处理


export let extend :(...args)=>any= function (){
    let target = arguments[0] ||{};
    for(let i =1,j=arguments.length;i<j;i++){
        let o = arguments[i];
        if(o) for(let n in o) target[n] = o[n];
    }
    return target;
}


export class DPath{
    paths:string[];
    constructor(pathtext:string){
        this.paths = pathtext.split(".");
    }
    getValue(data:any){
        for(const i in this.paths){
            if(!data) return undefined;
            data = data[this.paths[i]];
        }
        return data;
    }
    setValue(data:any,value:any){
        for(let i = 0,j=this.paths.length-1;i<j;i++){
            let path = this.paths[i];
            let sub = data[path];
            if(typeof sub!=="object"){
                sub = {};
                data[path] = sub;
            }
            data = sub;
        }
        data[this.paths[this.paths.length-1]] = value;
    }
    static caches :{[patht:string]:DPath}={};
    static fetch(tpath:string){
        return DPath.caches[tpath] ||(DPath.caches[tpath]=new DPath(tpath));
    }
    static getValue(data:any,tpath:string){
        let dpath = DPath.caches[tpath] ||(DPath.caches[tpath]=new DPath(tpath));
        return dpath.getValue(data);
    }
    static setValue(data:any,tpath:string,value:any){
        let dpath = DPath.caches[tpath] ||(DPath.caches[tpath]=new DPath(tpath));
        return dpath.setValue(data,value);
    }
    static replace(template:string,data?:any):string{
        return data?template.replace(replaceByDataRegx,((match:any)=>{
            return DPath.getValue(data,match);
        }) as any):template;
    }
}
let replaceByDataRegx = /\$\{[a-zA-Z_0-9]+(?:.[a-zA-Z0-9_])\}/g;

export function  clone(src:any,deep?:boolean) {
    if(!src) return src;
    let srcT = Object.prototype.toString.call(src);
    if(srcT==="[object String]" || srcT==="[object Number]" || srcT==="[object Boolean]") return src;
    let rs;
    if(srcT==="[object Function]"){
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
// Promise /异步
export type TAsyncStatement=(resolve:(result:any)=>any,reject:(err:any)=>any)=>any;
export interface IThenable{
    then(fulfillCallback:(result)=>any,rejectCallback?:(result)=>any):IThenable;
}
export enum PromiseStates{
    Pending=0,
    Fulfilled=1,
    Rejected=-1
}
export class Promise implements IThenable{
    $_promise_status:PromiseStates;
    $_promise_fulfillCallbacks:{(result:any,isSuccess?:boolean):any}[];
    $_promise_rejectCallbacks:{(result:any,isSuccess?:boolean):any}[];
    $_promise_result:any;
    
    constructor(statement?:TAsyncStatement,sync?:boolean){
        let status =this.$_promise_status= PromiseStates.Pending;
        let result =this.$_promise_result = undefined;
        let fulfillCallbacks:{(result:any,isSuccess?:boolean):any}[] = this.$_promise_fulfillCallbacks=[];
        let rejectCallbacks:{(result:any,isSuccess?:boolean):any}[] = this.$_promise_rejectCallbacks =[];
        //Object.defineProperty(this,"$_promise_status",{enumerable:false,configurable:false,get:()=>status});   
        //Object.defineProperty(this,"$_promise_fulfillCallbacks",{enumerable:false,configurable:false,get:()=>fulfillCallbacks});
        //Object.defineProperty(this,"$_promise_rejectCallbacks",{enumerable:false,configurable:false,get:()=>rejectCallbacks});   
        //Object.defineProperty(this,"$_promise_result",{enumerable:false,configurable:false,get:()=>result});   
    
        let resolve =(result:any):Promise=>{
            if(status!==PromiseStates.Pending){ 
                console.warn("settled状态不应该再调用resolve/reject");
                return this; 
            }
            
            //如果是自己，就丢出错误
            if(result===this) throw new TypeError("不能把自己resolve掉啊.");
            //resolve的结果是了一个thenable
            if(result && typeof result.then ==="function"){
                //让该Promise的状态跟resolve result的状态保持一致
                result.then(
                    (value)=>fulfill(value)
                    ,(value)=>reject(value)
                );
            }else {
                //如果是其他的类型，就让promise 变更为fulfill状态
                fulfill(result);
            }
            
            return this;
        };
        let reject = (value:any):Promise=>{
            if(status!==PromiseStates.Pending){ 
                console.warn("settled状态不应该再调用resolve/reject");
                return this; 
            }
            
            status = this.$_promise_status = PromiseStates.Fulfilled;
            result = this.$_promise_result = value;
            this.resolve = this.reject=function (params:any):Promise { return this; }

            setTimeout(()=>{
                let rejectHandlers = fulfillCallbacks;
                
                this.$_promise_fulfillCallbacks = this.$_promise_rejectCallbacks
                =fulfillCallbacks = rejectCallbacks =null;

                for(const i in rejectHandlers)
                    rejectHandlers[i].call(this,result,false);                    
            },0);
            return this;
        };
        let fulfill = (value:any)=>{
            if(status!==PromiseStates.Pending) {
                //循环引用，给个警告，什么都不做
                console.warn("已经处于Settled状态，无法再更正状态");
                return;
            }

            status = this.$_promise_status = PromiseStates.Fulfilled;
            result = this.$_promise_result = value;
            let complete = ()=>{
                let fulfillHandlers = fulfillCallbacks;
                this.$_promise_fulfillCallbacks = this.$_promise_rejectCallbacks
                =fulfillCallbacks = rejectCallbacks = null;

                for(const i in fulfillHandlers)
                    fulfillHandlers[i].call(this,result,true);
                
            };
            setTimeout(complete,0);

        };
        // ajax().then((rs)=>ajax1()).then
        this.then = (fulfillHandler:(result)=>any,rejectHandler?:(result)=>any):Promise=>{
            if(status ===PromiseStates.Fulfilled && fulfillHandler){
                setTimeout(()=>{
                    fulfillHandler.call(this,result,true);
                },0);
            }
            if(status===PromiseStates.Rejected && rejectHandler){
                setTimeout(()=>{
                    rejectHandler.call(this,result,false);
                },0);
            }
            if(status !==PromiseStates.Pending) return this;
            
            if(!fulfillHandler && !rejectHandler) return this;
            
            let innerResolve;
            let innerReject;
            let newPromise = new Promise((resolve,reject)=>{
                innerResolve = resolve;
                innerResolve =reject;
            });
            
            if(fulfillHandler){
                fulfillCallbacks.push((value:any)=>{
                    let rs = fulfillHandler.call(this,value,true);
                    if(rs && typeof rs.then ==="function"){ rs.then(innerResolve,innerReject); }
                    else innerResolve.call(newPromise,rs);
                });
                
            }
            if(rejectHandler){
                rejectCallbacks.push((value:any)=>{
                    rejectHandler.call(this,value,false);
                    innerResolve(undefined);
                });
            }
            return newPromise;
            
        }

        if(statement){
            if(sync) {
                try{
                    statement.call(this,resolve,reject);
                }catch(ex){
                    reject(ex);
                }
            }else setTimeout(() => {
                try{
                    statement.call(this,resolve,reject);
                }catch(ex){
                    reject(ex);
                }
            }, 0);
        }else{
            this.resolve = (value:any)=>{setTimeout(()=>resolve(value),0);return this};
            this.reject = (value:any)=>{setTimeout(()=>reject(value),0);return this};
        }
        
    }
    then(fulfillCallback:(result)=>any,rejectCallback?:(result)=>any):Promise{
        console.warn("called on placehold method.");
        return this;
    }
    
    resolve(result:any):Promise{
        console.warn("当Promise设置了异步函数时，resolve/reject应该由Promise的异步函数调用");
        return this;
    }
    reject(result:any):Promise{
        console.warn("当Promise设置了异步函数时，resolve/reject应该由Promise的异步函数调用");
        return this;
    }
    success(callback:(result)=>any):Promise{
        return this.then(callback);
    }
    error(callback:(result)=>any):Promise{
        return this.then(undefined,callback);
    }
    complete(callback:(result)=>any):Promise{
        return this.then(callback,callback);
    }
    catch(callback:(result)=>any):Promise{
        return this.then(undefined,callback);
    }
    static resolve(value:any):Promise{
        return new Promise((resolve,reject)=>resolve(value));
    }
    static reject(value:any):Promise{
        return new Promise((resolve,reject)=>reject(value));
    }
    static all(thenables:IThenable[],sync?:boolean):IThenable{
        return new Promise((resolve,reject)=>{
            let waitCount = thenables.length;
            let rs = [];
            for(const i in thenables)((thenable:IThenable,i:number)=>{
                thenables[i].then((value)=>{
                    if(rs){
                        rs[i]=value;
                        if(--waitCount==0) resolve(rs);
                    }
                },(err)=>{
                    rs = undefined;
                    reject(err);
                });
            })(thenables[i],i as any);
        },sync);
    }
}
if(typeof window!=='undefined') {
    if(!(window as any).Promise) (window as any).Promise= Promise;
}

//===========================================================
//事件与监听


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
    

    $__topics__:{[topic:string]:any};
    
    /**
     * 注册监听函数
     * notify的时候，注册了相关主题的监听函数会被调用
     * 如果该主题已经fulfill，该监听会立即执行
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topic 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    subscribe(topic:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}|IDisposiable,disposible?:IDisposiable):ISubject<TEvtArgs>;
    
    /**
     * 取消主题订阅
     * notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topic 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    unsubscribe(topic:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):ISubject<TEvtArgs>;

    /**
     * 发送通知
     * 如果相关主题上有监听器，会逐个调用监听器
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|TEvtArgs)} topic 通知的主题或事件参数
     * @param {TEvtArgs} [evt] 事件参数，只有topicOrEvtArgs是topic才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    notify(topic:string|TEvtArgs,evt?:TEvtArgs):ISubject<TEvtArgs>;

    /**
     * 产生一个终值，以后subscribe会立即执行
     * 
     * @param {(string|TEvtArgs)} topic
     * @param {TEvtArgs} [evt]
     * @returns {ISubject<TEvtArgs>}
     * @memberof ISubject
     */
    fulfill(topic:string|TEvtArgs,evt?:TEvtArgs):ISubject<TEvtArgs>;
}

interface IFulfillTopic{
    $__isFulfilledTopic__:boolean;
    fulfillValue:any;
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
@implicit()
export class Subject<TEvtArgs> implements ISubject<TEvtArgs>{
    /**
     * 内部的主题列表，可以访问它，但不推荐直接使用，主要是debug时使用
     * 如果不指明主题topic，默认topic=""
     * 
     * @type {[topic:string]:Function[]}
     * @memberof Observable
     */
    $__topics__:{[topic:string]:any};
    
    constructor(){
        Object.defineProperty(this,"$__topics__",{enumerable:false,writable:false,configurable:false,value:{}});
    }
    /**
     * 注册监听函数
     * notify的时候，注册了相关主题的监听函数会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    subscribe(topic:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}|IDisposiable,disposible?:IDisposiable):ISubject<TEvtArgs>{
        if(listener===undefined) {
            listener = topic as {(evt:TEvtArgs):any};
            topic="";
        }else if(typeof topic==="function"){
            disposible = listener as IDisposiable;
            listener = topic as {(evt:TEvtArgs):any};
            topic="";
        }
        let topics = this.$__topics__,handlers = topics[topic as string];
        if(handlers){
            if(handlers.$__isFulfilledTopic__) {
                (listener as Function).call(this,handlers.filfillValue);
                return this;
            }
        }else  topics[topic as string] =handlers =[];
        handlers.push(listener as {(evt:TEvtArgs):any});
        if(disposible && disposible.dispose) disposible.dispose((a)=>this.unsubscribe(topic,listener as {(evt:TEvtArgs):any}));
        return this;
    }
    /**
     * 取消主题订阅
     * notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {ISubject<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    unsubscribe(topic:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):ISubject<TEvtArgs>{
        if(listener===undefined) {
            listener = topic as {(evt:TEvtArgs):any};
            topic="";
        }
        let topics = this.$__topics__,handlers = topics[topic as string];
        if(!handlers) return this;
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
    notify(topic:string|TEvtArgs,evtArgs?:TEvtArgs):ISubject<TEvtArgs>{
        if(evtArgs===undefined){
            evtArgs = topic as TEvtArgs;
            topic="";
        }
        let topics=this.$__topics__,handlers=topics[topic as string];
        if(!handlers) return this;
        for(const i in handlers){
            handlers[i].call(this,evtArgs);
        }
        return this;
    }

    fulfill(topic:string|TEvtArgs,evtArgs?:TEvtArgs):ISubject<TEvtArgs>{
        if(evtArgs===undefined){
            evtArgs = topic as TEvtArgs;
            topic="";
        }
        let topics=this.$__topics__,handlers=topics[topic as string];
        if(handlers.$__isFulfilledTopic__) throw new Error(`${topic} 已经具备终值，不可以再发送终值.`);
        topics[topic as string] = {
            $__isFulfilledTopic__:true,$fulfillValue:evtArgs
        };
        let accelerator = (this as any)[topic as string];
        if(accelerator && accelerator.$__isEventAccelerator__){
            Object.defineProperty(this,topic as string,{enumerable:false,writable:true,configurable:true,value:function(handler){
                handler.call(this,evtArgs);return this;
            }});
        }
        if(!handlers) return this;
        for(const i in handlers){
            handlers[i].call(this,evtArgs);
        }
        return this;
    }
}

export function eventable(subject:any,topic:string){
    let accelorator = subject[topic];
    if(accelorator && accelorator.$__isEventAccelerator__) return subject;
    accelorator = function(handler:any){
        let topics = this.$__topics__;
        if(!topics) Object.defineProperty(this,"$__topics__",{enumerable:false,writable:false,configurable:false,value:topics={}});
        let handlers = topics[topic];
        if(typeof handler==="function"){
            if(!handlers) topics[topic]=[];
            handlers.push(handler);
        }else {
            let result = handler;
            Object.defineProperty(this,topic,{enumerable:false,configurable:true,writable:true,value:function(handler){
                handler.call(result);return this;
            }});
            topics[topic]={$__isFulfilledTopic__:true,fulfillValue:handler};
            if(!handlers) return this;
            for(const i in handlers) handlers[i].call(this,result);            

        }
        return this;
    }
    Object.defineProperty(subject,topic,{enumerable:false,writable:true,configurable:true,value:accelorator});
    return subject;
}







let cidSeed = 0;
export function new_cid(){
    if(++cidSeed===2100000000) cidSeed=-cidSeed;
    else if(cidSeed===0) return cidSeed=1;
    return cidSeed;
}
//===============================================================================

export interface IDisposiable{
    dispose(onRelease?:(sender:any,args?:any)=>any);
    $isDisposed:boolean;
}



export class Disposable{
    $isDisposed:boolean;
    private $__onReleases__:Function[];
    constructor(target:any){
        target || (target=this);
        
        
        Object.defineProperty(target,"$isDisposed",{enumerable:false,configurable:true,writable:false,value:false});
        Object.defineProperty(target,"$__onReleases__",{enumerable:false,configurable:false,writable:true,value:undefined});
        
        Object.defineProperty(target,"dispose",{enumerable:false,configurable:false,writable:true,value:function(onRelease?:(obj:any)=>any):IDisposiable{
            if(this.$isDisposed) throw new Error("不能释放已经释放的资源");
            if(onRelease===undefined){
                let onReleases = this.$_onReleases;
                try{
                    for(const release of onReleases){
                        release.call(this,this);
                    }
                }finally{
                    Object.defineProperty(this,"$isDisposed",{enumerable:false,configurable:true,writable:false,value:true});
                }
            }else {
                let onReleases = this.$_onReleases;
                if(!onReleases) Object.defineProperty(this,"$_onrelases",{enumerable:false,configurable:false,writable:false,value:onReleases=[]});
                onReleases.push(onRelease);
            }
            return this;
        }});
        return target;
        
    }
    dispose(onRealse:(obj:any,args?:any)=>any):IDisposiable{
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
    Value,
    Observable,
    Schema
}


export interface IObservable<TData> extends ISubject<IChangeEventArgs<TData>>{
    $type:DataTypes;
    $extras?:any;
    $target?:TData;
    get(accessMode?:ObservableModes):TData|IObservable<TData>|ObservableSchema<TData>;
    set(newValue:TData,updateImmediately?:boolean):IObservable<TData>;
    update():boolean;
}



export function observableMode(mode:ObservableModes,statement:()=>any):any {
    let accessMode = Observable.accessMode;
    try{
        Observable.accessMode=mode;
        return statement();
    }finally{
        Observable.accessMode = accessMode;
    }
}

export function  proxyMode(statement:()=>any):any {
    let accessMode = Observable.accessMode;
    try{
        Observable.accessMode=ObservableModes.Observable;
        return statement();
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
    Item,
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
@implicit()
export class Observable<TData> extends Subject<IChangeEventArgs<TData>> implements IObservable<TData>{
    $type:DataTypes;

    $target:TData;

    $extras?:any;

    $schema?:ObservableSchema<TData>;

    $_index?:number|string;

    $_modifiedValue:TData;
    
    $_owner?:IObservableIndexable<TData>;

    $_raw:(value?:TData)=>any;

    constructor(init:IObservableIndexable<TData>|{(val?:TData):any}|TData,index?:any,extras?:any,initValue?:any){
        super();
        
        if(init instanceof ObservableObject || init instanceof ObservableArray){
            //ctor(owner,index,extras)
            this.$_owner= init as IObservableIndexable<TData>;
            this.$_index = index;
            this.$_raw = (val:TData):any=>observableMode(ObservableModes.Raw,()=>val===undefined
                ?(this.$_owner.$_modifiedValue===undefined
                    ?this.$_owner.$target
                    :(this.$_owner.$_modifiedValue===Undefined?null:this.$_owner.$_modifiedValue)
                )[this.$_index]
                :((this.$_owner.$_modifiedValue===undefined
                    ?this.$_owner.$target
                    :(this.$_owner.$_modifiedValue===Undefined?null:this.$_owner.$_modifiedValue)
                )as any)[this.$_index]=val as any);   
            
            this.$extras = extras;
            if(initValue!==undefined){
                this.$_raw(this.$target= initValue);
            }else{
                this.$target = this.$_raw();
            }
        }else if(typeof init==="function"){
            //ctor(TRaw,extras)
            this.$extras = index;
            this.$_raw = init as {(val?:TData):any};
            if(initValue!==undefined){
                this.$_raw(this.$target= initValue);
            }else{
                this.$target = this.$_raw();
            }
        }else {
            //ctor(initValue,accessor,extras)
            if(typeof index==="function"){
                this.$extras = extras;
                this.$_raw = index;
                this.$target = init as TData;
                index.call(this,init);
            }else {
                //ctor(initValue,extras)
                this.$target=init as TData;
                this.$extras = index;
                this.$_raw =(val:TData)=>val===undefined?init:init=val;
            }
        }
    
        
        implicit(this, {
            $target:this.$target,$extras:this.$extras,$type:DataTypes.Value,$schema:this.$schema
            ,$_raw:this.$_raw,$_index:this.$_index,$_modifiedValue:undefined,$_owner:this.$_owner
        });
        if(this.$target instanceof Observable) 
            throw new Error("不正确的赋值");
    }
    

    get(accessMode?:ObservableModes):TData|IObservable<TData>|ObservableSchema<TData>{
        if(accessMode===undefined) accessMode = Observable.accessMode;
        if(accessMode == ObservableModes.Raw ) return this.$_raw();
        if( accessMode == ObservableModes.Schema ) return this.$schema;
        if( accessMode == ObservableModes.Observable ) return this as IObservable<TData>;
        return (this.$_modifiedValue===undefined)?this.$target:(this.$_modifiedValue===Undefined?undefined:this.$_modifiedValue);
    }

    set(newValue:TData,updateImmediately?:boolean):IObservable<TData>{
        if(newValue && newValue instanceof Observable) newValue = newValue.get(ObservableModes.Value);
        if(Observable.accessMode===ObservableModes.Raw) {this.$_raw.call(this,newValue);return this;}
        this.$_modifiedValue=newValue===undefined?Undefined:newValue;
        if(updateImmediately) this.update();
        return this;
    }
    update():boolean{
        let newValue :any= this.$_modifiedValue;
        if(newValue===undefined) return true;
        this.$_modifiedValue=undefined;
        newValue =newValue===Undefined?undefined:newValue;
        let oldValue = this.$target;
        if(newValue!==oldValue) {
            this.$_raw(this.$target = newValue);
            let evtArgs:IChangeEventArgs<TData> = {type:ChangeTypes.Value,value:newValue,old:oldValue,sender:this};
            this.notify(evtArgs);
            return evtArgs.cancel!==true;
        }
        return true;
        
    }

    toString(){
        let  currentValue = this.get(ObservableModes.Default);
        return currentValue===undefined || currentValue===null?"":currentValue.toString();
    }
    static accessMode:ObservableModes = ObservableModes.Default; 
}


/**
 * 获取Observable的extras的一个辅助方法
 *
 * @export
 * @param {Observable<any>} ob
 * @param {string} [name]
 * @param {*} [dft]
 */
export function extras(ob:Observable<any>,name?:string,dft?:any){
    let extras = ob.$extras || (ob.$extras={});
    if(name!==undefined){
        let val = extras[name];
        if(val===undefined) val = extras[name]=dft;
        return val;
    }
    return extras;
}



export interface IObservableObject<TData extends {[index:string]:any}> extends IObservable<TData>{
    //$prop(name:string,prop:IObservable<TData>|boolean|{(proxy:ObservableObject<TData>,name:string):any}|PropertyDecorator):IObservableObject<TData>;
    [index:string]:any;   
    $prop(name:string):Observable<any>;
}



@implicit()
export class ObservableObject<TData> extends Observable<TData> implements IObservableObject<TData>,IObservableIndexable<TData>{
    [index:string]:any;
    constructor(init:IObservableIndexable<any>|{(val?:TData):any}|TData,index?:any,extras?:any,initValue?:any){
        super(init,index,extras,initValue);
        this.$type = DataTypes.Object;
        if(!this.$target) this.$_raw(this.$target={} as any);
        if(!this.$schema){
            this.$schema = new ObservableSchema<TData>(this.$target);
            this.$schema.initObject(this);
        }
        
        
    }

    $prop(name:string):any{
        observableMode(ObservableModes.Observable,()=>{
            return this[name];
        });
    }

    get(accessMode?:ObservableModes):any{
        if(accessMode===undefined) accessMode = Observable.accessMode;
        if(accessMode=== ObservableModes.Raw ) return this.$_raw();
        if( accessMode == ObservableModes.Schema ) return this.$schema;
        if(accessMode===ObservableModes.Value){
            return observableMode(ObservableModes.Observable,()=>{
                let rs = {} as any;
                for(const n in this){
                    if(n==="constructor" || n[0]==="$") continue;
                    let prop = this[n] as any;
                    rs[n] = prop.get(ObservableModes.Value);
                }
                return rs;
            });
        }
        
        return this;
    }

    set(newValue:TData,updateImmediately?:boolean):IObservableObject<TData>{
        if(newValue && newValue instanceof Observable) newValue = newValue.get(ObservableModes.Value);
        super.set(newValue||null);
        if(!newValue) return this;
        proxyMode(()=>{
            for(const n in this){
                if(n==="constructor" || n[0]==="$") continue;
                let proxy :any= this[n];
                if(proxy instanceof Observable) proxy.set((newValue as any)[n] as any);
            }
        });
        if(updateImmediately) this.$update();
        return this;
    }

    update():boolean{
        let result = super.update();
        if(result===false) return false;
        proxyMode(()=>{
            for(const n in this){
                let proxy :any= this[n];
                if(proxy instanceof Observable) proxy.update();
            }
        });
        return true;
    }
}
export interface IObservableArray<TItem> extends IObservable<TItem[]>{
    [index:number]:any;  
    length:number; 
}
@implicit()
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
        
        implicit(this,{
            $_changes:undefined,$_length:target.length,$_itemSchema:this.$_itemSchema
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
                ret += `${item.get(ObservableModes.Default)}`;
            }
        });
        return ret;
    }
    

    clear():ObservableArray<TItem>{
        let old = this.$target;
        
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

    get(accessMode?:ObservableModes):any{
        if(accessMode===undefined) accessMode = Observable.accessMode;
        if(accessMode=== ObservableModes.Raw ) return this.$_raw();
        if( accessMode == ObservableModes.Schema ) return this.$schema;
        if(accessMode===ObservableModes.Value){
            return observableMode(ObservableModes.Observable,()=>{
                let rs = [] as any;
                for(const n in this){
                    if(n==="constructor" || n[0]==="$") continue;
                    let prop = this[n];
                    rs.push(prop.get(ObservableModes.Value));
                }
                return rs;
            });
        }
        
        return this;
    }

    set(newValue:any,updateImmediately?:boolean):ObservableArray<TItem>{
        if(newValue && newValue instanceof Observable) newValue = newValue.get(ObservableModes.Value);
        else {
            let newArr =[];
            for(let item of newValue){
                if(item instanceof Observable) newArr.push(item.get(ObservableModes.Value));
                else newArr.push(item);
            }
            newValue = newArr;
        }
        newValue || (newValue=[]);
        this.clear();
        super.set(newValue);
        if(Observable.accessMode=== ObservableModes.Raw){
            return this;
        }
        
        for(const i in newValue)makeArrayItem(this,i as any as number);;
        this.$_length = newValue.length;
        if(updateImmediately) this.update();
        return this;
    }

    update():boolean{
        if(!super.update()) return true;
        let changes = this.$_changes;
        if(!changes || this.$_changes.length===0) return true;
        this.$_changes = undefined;

        let arr = this.$target;
        for(const i in changes){
            let change = changes[i];
            switch(change.type){
                case ChangeTypes.Remove:
                    change.sender.notify(change);
                case ChangeTypes.Push:
                    arr.push(change.value);
                    this.notify(change);
                    //if(change.cancel!==true && change.item) change.item.notify(change);
                    break;
                case ChangeTypes.Pop:
                    arr.pop();
                    this.notify(change);
                    if(change.cancel!==true && change.item) {
                        change.sender = change.item;
                        change.item.notify(change);
                    }
                    break;
                case ChangeTypes.Unshift:
                    arr.unshift(change.value);
                    this.notify(change);
                    break;
                case ChangeTypes.Shift:
                    arr.shift();
                    this.notify(change);
                    if(change.cancel!==true && change.item) {
                        change.sender = change.item;
                        change.item.notify(change);
                    }
                    break;
                case ChangeTypes.Item:
                    arr[change.index] = change.value;
                    this.notify(change);
                    if(change.cancel!==true){
                        let itemEvts :any= {};for(const n in change) itemEvts[n]=change[n];
                        itemEvts.sender =change.item;
                        itemEvts.type = ChangeTypes.Value;
                        itemEvts.sender.notify(itemEvts);
                    } 
                    break;
            }
        }
        return true;
    }
    
}

function makeArrayItem<TItem>(obArray:ObservableArray<TItem>,index:number){
    obArray.$_itemSchema.$index = index;
    let item = new obArray.$_itemSchema.$ctor(obArray,index,undefined);
    item.$_index = index;
    Object.defineProperty(obArray,index as any as string,{enumerable:true,configurable:true
        ,get:(mode?:ObservableModes) => item.get(mode)
        ,set:(item_value:TItem)=>{
            (obArray.$_changes || (obArray.$_changes=[])).push({
                sender:obArray,
                type:ChangeTypes.Item,
                index:index,
                item:item,
                value:item_value
            });
            item.set(item_value);
        }
    });
}

function defineProp<TObject>(target:any,name:string,accessorFactory:{(proxy:ObservableObject<TObject>,name:string):any}|PropertyDecorator){
    let rnd = parseInt((Math.random()*1000000).toString());
    let private_prop_name = "$_PRIVATE_" + name + "_" + rnd;
    Object.defineProperty(target,name,{
        enumerable:true,
        configurable:false,
        get:function(param?:any){
            let ob = this[private_prop_name];
            if(!ob) Object.defineProperty(this,private_prop_name,{
                enumerable:false,configurable:false,writable:false,value:ob=accessorFactory.call(this,target,name)
            });
            
            return ob.get(param);
        },
        set:function(val){
            let ob = this[private_prop_name];
            if(!ob) Object.defineProperty(this,private_prop_name,{
                enumerable:false,configurable:false,writable:false,value:ob=accessorFactory.call(this,target,name)
            });
            return ob.set(val);
        }
    });  
    return this;
}


 
//=======================================================================
@implicit()
export class ObservableSchema<TData>{
    [index:string]:any;
    $type:DataTypes;
    $index:string|number;
    
    $paths:string[];
    $ctor:{new (init:TData|{(val?:TData):any}|IObservableIndexable<any>,index?:any,extras?:any,initValue?:any):Observable<any>};
    //$prop_models:{[index:string]:Model};
    $owner?:ObservableSchema<TData>;
    $itemSchema?:ObservableSchema<TData>;
    $initData?:any;
    constructor(initData:TData,index?:string|number,owner?:ObservableSchema<any>){
        let paths=[];
        index = index===undefined|| index===null?"":index;
        if(owner){
            let ppaths = owner.$paths;
            if(ppaths && ppaths.length>0){
                for(const i in ppaths) paths.push(ppaths[i]);
            }
        };
        if(index!=="")paths.push(index);

        implicit(this,{
            "$type":DataTypes.Value
            ,"$index":index
            ,"$paths":paths
            ,"$owner":owner
            ,"$ctor":Observable
            ,"$itemSchema":null
            ,"$initData":initData
        });
        Object.defineProperty(this,"$path",{enumerable:false,configurable:false,get:()=>this.$paths.join(".")});
        if(initData){
            let t = Object.prototype.toString.call(initData);
            if(t==="[object Object]") {
                this.asObject();           
                for(const n in initData){
                    this.defineProp(n,initData[n]);
                }
            }
            else if(t==="[object Array]"){
                this.asArray();
            }else {
                this.$type = DataTypes.Value;
                this.$ctor = Observable;
            }
        }
    }

    

    getFromRoot(root:any ,mode:ObservableModes=ObservableModes.Observable):any{
        return observableMode(mode,()=>{
            let data = root;
            for(const i in this.$paths){
                data = data[this.$paths[i]];
                if(data===undefined || data===Undefined) return undefined;
            }
            return data;
        });
    }

    asObject():ObservableSchema<TData>{
        if(this.$type===DataTypes.Object) return this;
        if(this.$type === DataTypes.Array) throw new Error("无法将ObservableSchema从Array转化成Object.");
        this.$type = DataTypes.Object;
        
        class _ObservableObject extends ObservableObject<TData>{
            constructor(init:ObservableObject<any>|{(val?:TData):any}|TData,index?:any,extras?:any,initValue?:any){
                super(init,index,extras,initValue);
            }
        };
        _ObservableObject.prototype.$schema= this;
        this.$ctor= _ObservableObject;
        return this;
    }

    defineProp<TProp>(propname:string,initValue?:TProp):ObservableSchema<TProp>{
        if(this.$type!==DataTypes.Object) throw new Error("调用$defineProp之前，要首先调用$asObject");
        let propSchema :ObservableSchema<TProp> = new ObservableSchema<TProp>(initValue,propname,this);
        Object.defineProperty(this,propname,{enumerable:true,writable:false,configurable:false,value:propSchema});
        defineProp<TData>(this.$ctor.prototype,propname,function(owner,name){return new propSchema.$ctor(this,name);});        
        return propSchema;
    }


    asArray():ObservableSchema<TData>{
        if(this.$type===DataTypes.Array) return this;
        if(this.$type === DataTypes.Object) throw new Error("无法将ObservableSchema从Object转化成Array.");
        this.$type = DataTypes.Array;
        class _ObservableArray extends ObservableArray<any>{
            constructor(init:ObservableObject<any>|{(val?:TData):any}|TData,index?:any,extras?:any,initValue?:any){
                super(init as any,index,extras,initValue);
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
        this.$ctor=_ObservableArray;

    }

    
    initObject(ob:Observable<TData>){
        for(const n in this){
            if(n==="constructor" || n[0]==="$" || n===ObservableSchema.schemaToken) continue;
            let propSchema = this[n] as any as ObservableSchema<any>;
            defineProp<TData>(ob,n,function(owner,name){return new propSchema.$ctor(this,name);});
        }
    }
    

    

    static schemaToken:string = "$__ONLY_USED_BY_SCHEMA__";
}




//=======================================================================

export enum ReactiveTypes{
    None=0,
    Internal = -1,
    Iterator = -2,
    In = 1,
    Out=2,
    Parameter=3
}
export interface IReactiveInfo{
    name?:string;
    type?:ReactiveTypes;
    schema?:ObservableSchema<any>;
    initData?:any;
}

/**
 * 两种用法:
 * 1 作为class member的装饰器 @reactive()
 * 2 对某个component类手动构建reactive信息，reactive(MyComponent,{name:'model',type:0,schema:null})
 * @param {(ReactiveTypes|Function)} [type]
 * @param {{[prop:string]:IReactiveInfo}} [defs]
 * @returns
 */
export function reactive(type?:ReactiveTypes|Function,defs?:{[prop:string]:IReactiveInfo}):any {
    function makeReactiveInfo(target:any,info:string|IReactiveInfo):any {
        let infos = metaInfo(target,"reactives",{});
        
        if((info as IReactiveInfo).name){
            if(!(info as IReactiveInfo).initData) (info as IReactiveInfo).initData = target[(info as IReactiveInfo).name];
            infos[(info as IReactiveInfo).name]= info as IReactiveInfo;
        }else {
            infos[info as string] = {type :type as ReactiveTypes|| ReactiveTypes.Internal,name:info as string,schema:target[info as string]};
        }
    }
    if(defs){
        let target = (type as Function).prototype;
        for(const n in defs){
            let def = defs[n];def.name = n;
            makeReactiveInfo(target,def);
        } 
    }
    return makeReactiveInfo;
}

export function IN(target:any,name:string) :any{
    let infos = metaInfo(target,"reactives",{});
    infos[name] = {type:ReactiveTypes.In,name:name};
    //return target;
}

export function OUT(target:any,name:string) :any{
    let infos = metaInfo(target,"reactives",{});
    infos[name] = {type:ReactiveTypes.Out,name:name};
    //return target;
}

export function PARAM(target:any,name:string) :any{
    let infos = metaInfo(target,"reactives",{});
    infos[name] = {type:ReactiveTypes.Parameter,name:name};
    //return target;
}

//==========================================================

export interface ITemplateInfo{
    name?:string;
    vnode?:any;
    partial?:string;
    render?:Function;
}

export function template(partial?:string|Function,defs?:{[prop:string]:ITemplateInfo}){
    function markTemplateInfo(target:IComponentInfo,info:string|ITemplateInfo) {
        let infos = metaInfo(target,"templates",{});
        if(defs){
            infos[(info as ITemplateInfo).partial]= info as IReactiveInfo;
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
        let infos = metaInfo(target,"actions",{});

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
    reactives?:{[prop:string]:IReactiveInfo};
    templates?:{[partial:string]:ITemplateInfo};
    actions?:{[methodname:string]:IActionInfo};
    ctor?:TComponentType;
    wrapper?:TComponentType;
    tag?:string;
    render?:Function;
    inited?:boolean;
    explicitMode?:boolean;
}

export interface IComponent extends IDisposiable{
    $meta:IComponentInfo;
    [propname:string]:any; 
}
export type TComponentCtor = {new (...args:any[]):IComponent};
export type TComponentType = TComponentCtor & {prototype:{$meta:IComponentInfo}};
export interface IDisposeInfo{
    activeTime?:Date;
    inactiveTime?:Date;
    checkTime?:Date;
}
export interface IInternalComponent extends IComponent{
    $_disposeInfo:IDisposeInfo; 
    $childNodes:VirtualNode[];
    $reactives:{[name:string]:Observable<any>};
}

function metaInfo(target:any,name?:string,dft?:any){
    let meta = target.$meta;
    if(!meta) Object.defineProperty(target,"$meta",{enumerable:false,configurable:false,writable:true,value:meta={}});
    if(!name) return meta;
    let info = meta[name];
    if(info===undefined && dft!==undefined) Object.defineProperty(meta,name,{enumerable:false,configurable:false,writable:true,value:info=dft});
    return info;
}



let componentInfos : {[tag:string]:IComponentInfo}={};

function inherits(extendCls, basCls) {
    function __() { this.constructor=extendCls;}
    extendCls.prototype = basCls === null ? Object.create(basCls) : (__.prototype = basCls.prototype, new __());
}

export function component(tag:string|{new(...args:any[]):IComponent}|boolean|Function,ComponentType?:{new(...args:any[]):IComponent}|boolean|Function):any{
    let makeComponent = function (componentCtor:TComponentCtor):TComponentType {
        let meta = metaInfo(componentCtor.prototype) as IComponentInfo;
        let _Component = function () {
            let ret = componentCtor.apply(this,arguments);
            if(!this.$meta.inited){
                initComponent(this);
            }
            return ret;
        }
        for(let k in componentCtor) _Component[k] = componentCtor[k];
        inherits(_Component,componentCtor);
        let metaDesc = {enumerable:false,configurable:false,get:()=>componentCtor.prototype.$meta};
        //Object.defineProperty(_Component,"$meta",metaDesc);
        Object.defineProperty(_Component.prototype,"$meta",metaDesc);
       
        //Object.defineProperty(componentCtor.prototype,"$meta",metaDesc);
        
        
        meta.ctor = componentCtor as TComponentType;
        meta.wrapper = _Component as any as TComponentType;
        if(typeof ComponentType==="boolean")meta.explicitMode = ComponentType as boolean;
        if(tag){
            meta.tag = tag as string;
            componentInfos[tag as string]= meta;
        }
        return _Component as any as TComponentType;
    }
    let t = typeof tag;
    if(t ==="function"|| t==="boolean"){ComponentType=tag as Function|boolean;tag="";}
    
    if(ComponentType!==undefined && ComponentType!==true && ComponentType!==false) {
        let wrapped= makeComponent(ComponentType as TComponentCtor);
        return attachManualAPI(wrapped);
    }else return makeComponent;
}

function attachManualAPI(componentType:TComponentType):TComponentType{
    implicit(componentType,"create",function(){ return new componentType();});
    implicit(componentType,"render",function(container?:any){ return new componentType().render(container);});
    return componentType;
}

function createComponent(componentInfo:IComponentInfo,context?:any) {
    //let componentInfo = componentInfos[tag];
    if(!componentInfo) throw new Error(`不是Component,请调用component注册或标记为@component`);
    let instance = new (componentInfo.ctor as TComponentCtor)();
    if(!componentInfo.inited){
        initComponent(instance as IInternalComponent);
    }
    return instance;
}

function initComponent(firstComponent:IInternalComponent){
    let meta:IComponentInfo = firstComponent.$meta;
    if(!meta || meta.inited) return firstComponent;
    if(!meta.explicitMode){
        //let proto = meta.ctor.prototype;
        let reactives = meta.reactives ||(meta.reactives={});
        for(let n in firstComponent){
            if(reactives[n]) continue;
            let member = firstComponent[n];
            if(typeof member ==="function") continue;
            reactives[n] = {name:n,type:ReactiveTypes.Internal};
        }
        let tpls = meta.templates ||(meta.templates={});
        let defaultTemplateName = "render";
        //如果还未定义默认的模板函数
        if(!tpls[defaultTemplateName]){
            let render = firstComponent[defaultTemplateName];
            if(typeof render==="function") {
                tpls[defaultTemplateName] ={name:defaultTemplateName};

            }
        }
        
    }
    for(const name in meta.reactives){
        
        let stateInfo = meta.reactives[name];
        if(stateInfo.type === ReactiveTypes.None) continue;
        let initData = firstComponent[stateInfo.name];
        let schema = stateInfo.schema; 
        if(!schema){
            schema =stateInfo.schema = new ObservableSchema<any>(stateInfo.initData||initData,name);
        }
        stateInfo.initData = initData;
        (schema as ObservableSchema<any>).$index= name;
        initReactive(firstComponent,stateInfo);
    }
    
    for(const name in meta.templates){
        initTemplate(firstComponent,meta.templates[name]);
    }
    if(!meta.templates["render"] && firstComponent.render){
        initTemplate(firstComponent,{name:"render"}); 
    }
    if(!meta.ctor.prototype.dispose){
        Disposable.call(meta.ctor.prototype);
    }
        
    meta.inited=true;
}

function initReactive(firstComponent:IInternalComponent,stateInfo:IReactiveInfo){
    if(stateInfo.type===ReactiveTypes.Iterator)  return initIterator(firstComponent,stateInfo);
    let descriptor = {
        enumerable:true
        ,configurable:false
        ,get:function() {
            if(Observable.accessMode===ObservableModes.Schema) return stateInfo.schema;
            let states = this.$reactives ||(this.$reactives={});
            let ob = states[stateInfo.name];  
            if(!ob) ob = states[stateInfo.name] = new stateInfo.schema.$ctor(stateInfo.initData);
                
            return ob.get();
        }
        ,set:function(val:any){
            let states = this.$reactives ||(this.$reactives={});
            let ob: IObservable<any> = states[stateInfo.name];
            if(val&&val.get) val=val.get(ObservableModes.Value);
            if(ob) ob.set(val);
            else ob = states[stateInfo.name] = new stateInfo.schema.$ctor(val);
        }
    };
    Object.defineProperty(firstComponent,stateInfo.name,descriptor);
    Object.defineProperty(firstComponent.$meta.ctor.prototype,stateInfo.name,descriptor);
    
}

function initIterator(firstComponent:IInternalComponent,stateInfo:IReactiveInfo){
    let descriptor = {
        enumerable:false
        ,configurable:false
        ,get:function() {
            if(Observable.accessMode===ObservableModes.Schema) return stateInfo.schema;
            let states = firstComponent.$reactives ||(firstComponent.$reactives={});
            let ob = states[stateInfo.name]  
            return ob?ob.get():undefined;
        }
        ,set:function(val:any){
            let states = firstComponent.$reactives ||(firstComponent.$reactives={});
            if(val instanceof Observable) {
                states[stateInfo.name] = val;
                return;
            }
            let ob = states[stateInfo.name] = new stateInfo.schema.$ctor(val);  
            
        }
    };
    Object.defineProperty(firstComponent,stateInfo.name,descriptor);
    Object.defineProperty(firstComponent.$meta.ctor.prototype,stateInfo.name,descriptor);
    
}
function setIterator(component:IComponent,schema:ObservableSchema<any>,value:any){
    let meta= component.$meta as IComponentInfo;
    let name = schema.$index;
    let info = meta.reactives[name];
    if(info.type!==ReactiveTypes.Iterator){
        initIterator(component as IInternalComponent,info);
    }
    component[name] = value;
    return component[name];
}
function initTemplate(firstComponent:IInternalComponent,tplInfo:ITemplateInfo){
    let rawMethod = firstComponent[tplInfo.name];
    if((rawMethod as any).$orign) {
        tplInfo.render = (rawMethod as any).$render;
        return;
    };
    let tplMethod = function (container:any) {
        let component = this;
        if(tplInfo.render) return tplInfo.render.call(component,container);
        let result :any;
        observableMode(ObservableModes.Schema,()=>{
            let vnode = rawMethod.call(component,container);
            if(DomUtility.isElement(vnode)) {tplInfo.render = rawMethod;result=vnode;}
            else {tplInfo.vnode = vnode;result=Undefined;}

        });
        if(result===Undefined){
            observableMode(ObservableModes.Observable,()=>{
                result = tplInfo.vnode.render(component,container,tplInfo.vnode);
            });
            tplInfo.render = function (container?:any) {
                return tplInfo.vnode.render(component,container,tplInfo.vnode);
            }
            
        }
        return result;

    }
    Object.defineProperty(tplMethod,"$orign",{configurable:false,writable:false,enumerable:false,value:rawMethod});
    Object.defineProperty(tplMethod,"$render",{configurable:false,writable:false,enumerable:false,value:tplInfo.render});
    let des = {configurable:false,writable:false,enumerable:false,value:tplMethod};
    Object.defineProperty(firstComponent,tplInfo.name,des);
    Object.defineProperty(firstComponent.$meta.ctor.prototype,tplInfo.name,des);
}


function makeAction(component:IComponent,method){
    return function () {
        let rs= method.apply(component,arguments);
        for(const n in component.$reactives){
            component.$reactives[n].update();
        }
        return rs;
    }
}


//=========================================================================

function addRelElements(ob:Observable<any>,elems:any){
    
    if(is_array(elems)) for(const i in elems) addRelElements(ob,elems[i]);
    let extras = ob.$extras || (ob.$extras={});
    if(extras instanceof Observable) debugger;
    let rel_elements = extras.rel_elements || (extras.rel_elements=[]);
    if(extras.last_rel_element===elems) return;
    rel_elements.push(extras.last_rel_element=elems);
}

function getRelElements(ob:Observable<any>,includeSubs?:boolean|any[]){
    let rs = is_array(includeSubs)?includeSubs as any[]:[];
    let extras = ob.$extras;
    if(extras){
        let rel_elements = extras.rel_elements;
        if(rel_elements) for(const i in rel_elements){
            rs.push(rel_elements[i]);
        }
    }
    if(includeSubs){
        observableMode(ObservableModes.Observable,()=>{
            for(const n in ob){
                let sub = ob[n];
                getRelElements(sub,rs);
            }
        });
    }
    return rs;
    
}
export interface IVirtualNode{
    tag?:string;
    id?:string;
    className?:string;
    name?:string;
    value?:string;
    type?:string;
    title?:string;
    placeholder?:string;
    attrs?:{[name:string]:any};
    content?:any;
    children?:IVirtualNode[];
}
export class VirtualNode implements IVirtualNode{
    tag?:string;
    attrs?:{[name:string]:any};
    content?:any;
    children?:VirtualNode[];
    constructor(){}

    

    render(component:IComponent,container?:any):any{
        
    }

    static create(tag:string|TComponentType,attrs:{[attrName:string]:any}){
        
        let vnode :VirtualNode;
        if(tag && (tag as TComponentType).prototype ){
            vnode = new VirtualComponentNode((tag as TComponentType).prototype.$meta ,attrs);
        }else {
            let componentInfo = componentInfos[tag as string];
            if(componentInfo)vnode = new VirtualComponentNode(tag as string,attrs);
            else vnode = new VirtualElementNode(tag as string,attrs);
        }
        
        for(let i=2,j=arguments.length;i<j;i++){
            let childNode = arguments[i];
            if(!(childNode instanceof VirtualNode)) childNode = new VirtualTextNode(childNode);
            (vnode.children || (vnode.children=[])).push(childNode);
        }       
        return vnode;
    }
}
export let virtualNode = VirtualNode.create;

export class VirtualTextNode extends VirtualNode{
    
    constructor(public content:any){
        super();
    }
    render(component:IComponent,container?:any):any{
        let elem;
        if(this.content instanceof ObservableSchema){
            let ob = this.content.getFromRoot(component);
            elem = DomUtility.createText(ob.get());
            ob.subscribe((e)=>{
                elem.nodeValue = e.value;
            });
        }else{
            elem = DomUtility.createText(this.content);
        }
        if(container) DomUtility.appendChild(container,elem);
        return elem;
    }
    
}
export class VirtualElementNode extends VirtualNode{
    
    children?:VirtualNode[];

    constructor(public tag:string,public attrs:{[name:string]:any}){
        super();
    }

    render(component:IComponent,container?:any):any{
        let elem = DomUtility.createElement(this.tag);
        let ignoreChildren:boolean = false;
        if(container)DomUtility.appendChild(container,elem);
        let anchorElem = elem;
        for(const attrName in this.attrs){
            let attrValue= this.attrs[attrName];
            
            let match = attrName.match(evtnameRegx);
            if(match && elem[attrName]!==undefined && typeof attrValue==="function"){
                let evtName = match[1];
                DomUtility.attach(elem,evtName,makeAction(component,attrValue));
                continue;
            }
            let binder:Function = attrBinders[attrName];
            let bindResult:any;
            if(attrValue instanceof ObservableSchema){
                if(binder) bindResult= binder.call(component,elem,attrValue,component,this);
                else (function(name,attrValue) {
                    let ob:IObservable<any> = attrValue.getFromRoot(component);
                    DomUtility.setAttribute(elem,name,ob.get(ObservableModes.Raw));
                    ob.subscribe((e)=>{
                        DomUtility.setAttribute(elem,name,e.value);
                    });
                })(attrName,attrValue);
            }else {
                if(binder) bindResult= binder.call(component,elem,attrValue,component,this);
                else DomUtility.setAttribute(elem,attrName,attrValue);
            }
            if(bindResult === RenderDirectives.IgnoreChildren) ignoreChildren=true;
            
        }
        

        if(!this.children || this.children.length===0) return elem;

        if(!ignoreChildren) {
            for(const i in this.children){
                this.children[i].render(component,elem);
            }
        }

        return elem;

    }
    
}

export class VirtualComponentNode extends VirtualNode{
    children?:VirtualNode[];
    meta:IComponentInfo;
    constructor(tag:string|TComponentType|IComponentInfo,public attrs:{[name:string]:any}){
        super();
        let t = typeof tag;
        if(t==="function"){
            this.meta = (tag as TComponentType).prototype.$meta;
            this.tag = this.meta.tag;
        }else if(t==="object"){
            this.meta = tag as IComponentInfo;

        }else if(t==="string"){
            this.tag = tag as string;
            this.meta = componentInfos[this.tag];
        } else {
            throw new Error("Invalid arguments");
        }
    }

    render(component:IComponent,container?:any):any{
        let subComponent = createComponent(this.meta);
        for(const subAttrName in this.attrs){
            bindComponentAttr(component,subComponent,subAttrName,this.attrs[subAttrName]);
        };
        let subMeta = subComponent.$meta as IComponentInfo;
        let subNodes = [];
        for(const n in subMeta.templates){
            let tpl = subMeta.templates[n];
            let elems = subComponent[tpl.name].call(subComponent,container);
            if(elems){
                if(DomUtility.isElement(elems)){
                    (elems as any).$_YA_COMPONENT = subComponent;
                    subNodes.push(elems);
                }else if(is_array(elems)){
                   
                    for(let i =0,j=elems.length;i<j;i++){
                        let el = elems[i];
                        el.$_YA_COMPONENT = subComponent;
                        subNodes.push(el);
                    }
                    
                }
            }
            return subNodes;
        }

    }
}

function bindComponentAttr(component:IComponent,subComponent:IComponent,subAttrName:string,bindValue:any){
    let subMeta = subComponent.$meta as IComponentInfo;

    let stateInfo = subMeta.reactives[subAttrName];
    let subStateType = stateInfo?stateInfo.type:undefined;
    if(subStateType===ReactiveTypes.Internal || subStateType===ReactiveTypes.Iterator) throw new Error(`${this.tag}.${subAttrName}是内部变量，不可以在外部赋值`);
    
    let subAttr:Observable<any> = subComponent[subAttrName];

    if(subStateType === ReactiveTypes.Out){
        if(bindValue instanceof ObservableSchema){
            subAttr.subscribe(e=>{
                //这里的级联update可能会有性能问题，要优化
                bindValue.getFromRoot(component).set(e.value,true);
            },component);
        }else{
            throw new Error(`无法绑定[OUT]${subMeta.tag}.${subAttrName}属性，父组件赋予该属性的值不是Observable`);
        }
    } else if(subStateType===ReactiveTypes.In){
        if(bindValue instanceof ObservableSchema){
            let bindOb:IObservable<any> = bindValue.getFromRoot(component);
            bindOb.subscribe((e)=>{
                //这里的级联update可能会有性能问题，要优化
                subAttr.set(e.value,true);
            },subComponent);
            subAttr.$_raw(subAttr.$target = clone(bindOb.get(ObservableModes.Raw),true));
        }else{
            subAttr.$_raw(subAttr.$target = bindValue);
            console.warn(`未能绑定[IN]${subMeta.tag}.${subAttrName}属性,父组件赋予该属性的值不是Observable`);
        }
    } else if(subStateType===ReactiveTypes.Parameter){
        if(bindValue instanceof ObservableSchema){
            //这里的级联update可能会有性能问题，要优化
            let bindOb :IObservable<any>= bindValue.getFromRoot(component);
            bindOb.subscribe((e)=>subAttr.set(e.value,true),subComponent);
            subAttr.$_raw(subAttr.$target = bindOb.get(ObservableModes.Raw));
            subAttr.subscribe((e)=>bindValue.getFromRoot(component).set(e.value,true),component);
        }else{
            subAttr.$_raw(subAttr.$target = bindValue);
            console.warn(`未能绑定[REF]${subMeta.tag}.${subAttrName}属性,父组件赋予该属性的值不是Observable`);
        }
    }else{
        let value =bindValue instanceof ObservableSchema?bindValue.getFromRoot(component).get():bindValue;
        value = clone(value,true);
        if(subAttr instanceof Observable) subAttr.$_raw(value);
        else subComponent[subAttrName] = value;
    }
}

export function NOT(params:any) {
    return;
}
export function EXP(...args:any[]) {
    return;
}

let evtnameRegx = /on([a-zA-Z_][a-zA-Z0-9_]*)/;

export enum RenderDirectives{
    Default,
    IgnoreChildren,
    Replaced
}

export class Placeholder{
    constructor(public replace:any,public before?:any,public after?:any){}
}


export let attrBinders:{[name:string]:(elem:any,bindValue:any,component:IComponent,vnode:VirtualNode)=>any}={};

attrBinders.for = function bindFor(elem:any,bindValue:any,component:IComponent,vnode:VirtualNode,ignoreAddRel?:boolean){
    let each = bindValue[0];
    let value = bindValue[1];
    let key = bindValue[2];
    if(each instanceof ObservableSchema){
        each = each.getFromRoot(component) as IObservable<any>;
        if(!ignoreAddRel)addRelElements(each,elem);
        each.subscribe((e:IChangeEventArgs<any>)=>{
            if(e.type===ChangeTypes.Value){
                elem.innerHTML = "";
                observableMode(ObservableModes.Observable,()=>{
                    bindFor.call(component,elem,bindValue,component,vnode,false);
                });
               
                e.cancel = true;
            } 
        });
    }
    if(!(value instanceof ObservableSchema)) throw new Error("迭代变量必须被iterator装饰");
    
    for(const k in each){
        if(k==="constructor" || k[0]==="$") continue;
        
        let item =each[k];

        let obItem :Observable<any>= setIterator(component,value,item);
        for(const i in vnode.children){
            let childElements = vnode.children[i].render(component,elem);
            addRelElements(obItem,childElements);
            obItem.subscribe((e:IChangeEventArgs<any>)=>{
                if(e.type===ChangeTypes.Remove) {
                    let obItem = e.sender;
                    let nodes = getRelElements(obItem);
                    for(const i in nodes) {
                        let node = nodes[i];if(node.parentNode) node.parentNode.removeChild(node);
                        if(node.$_YA_COMPONENT){
                            if(!node.$_YA_COMPONENT.$isDisposed){
                                node.$_YA_COMPONENT.dispose();
                            }
                            node.$_YA_COMPONENT = undefined;
                        }
                    }
                }
            });
        }
    }      
    return RenderDirectives.IgnoreChildren;
}

attrBinders.if = function bindIf(elem:any,bindValue:any,component:IComponent,vnode:VirtualNode) {
    if(bindValue instanceof ObservableSchema){
        let ob = bindValue.getFromRoot(component) as IObservable<any>;
        let placeholder = DomUtility.createPlaceholder();
        let isElementInContainer=ob.get();
        if(!isElementInContainer){
            let p = DomUtility.getParent(elem);
            if(p){
                DomUtility.insertBefore(placeholder,elem);
                DomUtility.remove(elem);
            }else DomUtility.hide(elem);
        }
        ob.subscribe((e)=>{
            if(e.value){
                if(!isElementInContainer){
                    let p = DomUtility.getParent(placeholder);
                    if(p){
                        DomUtility.insertBefore(elem,placeholder);
                        DomUtility.remove(placeholder);
                        isElementInContainer=true;
                    }
                    
                }
            }else{
                if(isElementInContainer){
                    let p = DomUtility.getParent(elem);
                    if(p){
                        DomUtility.insertBefore(placeholder,elem);
                        DomUtility.remove(elem);
                        isElementInContainer=false;
                    }else DomUtility.hide(elem);
                }
            }
        });
    }else {
        if(!bindValue){
            let p = DomUtility.getParent(elem);
            if(p)DomUtility.remove(elem);
        }
    }
}

attrBinders.style=function bindStyle(elem:any,bindValue:any,component:IComponent) {
    let t = typeof bindValue;
    if(t==="string"){
        (elem as HTMLElement).style.cssText = bindValue;
        return;
    }
    if(t!=="object"){
        console.warn("错误的绑定了style属性，必须是string/object");
        return;
    }
    if(bindValue instanceof ObservableSchema){
        let ob :IObservable<any>= bindValue.getFromRoot(component);
        let val = ob.get(ObservableModes.Value);
        if(typeof val==="string") elem.style.cssText = val;
        else {
            for(let n in val){
                let convertor = styleConvertors[n];
                elem.style[n] = convertor?convertor(val[n]):val[n];
            }
        }
        ob.subscribe((e)=>{
            let val = e.value;
            if(typeof val==="string") elem.style.cssText = val;
            else {
                for(let n in val){
                    let convertor = styleConvertors[n];
                    elem.style[n] = convertor?convertor(val[n]):val[n];
                }
            }
        });
    }
    for(const styleName in bindValue)((styleName,subValue,elem,component)=>{
        let ob:Observable<any>;
        let styleValue :any;
        let convertor = styleConvertors[styleName];
        if(subValue instanceof Observable){ ob = subValue; styleValue = ob.get();}
        else if(subValue instanceof ObservableSchema){
            ob = subValue.getFromRoot(component);
            styleValue = ob.get();
        } else styleValue = subValue;
        elem.style[styleName] = convertor?convertor(styleValue):styleValue;

        if(ob){
            addRelElements(ob,elem);
            ob.subscribe((e)=>{
                elem.style[styleName] =convertor?convertor(e.value):e.value;
            });
        }
    })(styleName,bindValue[styleName],elem,component);
}
export let styleConvertors :any= {};

let unitRegx = /(\d+(?:.\d+))(px|em|pt|in|cm|mm|pc|ch|vw|vh|\%)/g;
styleConvertors.left = styleConvertors.right = styleConvertors.top = styleConvertors.bottom = styleConvertors.width = styleConvertors.height = function (value:any) {
    if(!value) return "0";
    if(typeof value==="number"){
        return value + "px";
    }else return value;
}



//////////////////////////////////////////////////////////////////////////////
// DOM操作
//////////////////////////////////////////////////////////////////////////////

export interface IDomNode{
    nodeType:number;
    nodeValue:any;
    tagName:string;
    className:string;
}
export interface IDomDocument{
    createElement(tag:string):IDomNode;
    createTextNode(text:string):IDomNode;

}
export interface IDomUtility{
    isElement(obj:any,includeText?:boolean):boolean;
    isActive(obj:any):boolean;
    createElement(tag:IVirtualNode|string,attrs?:{[name:string]:string}|IDomNode,...children:any[]):IDomNode;
    createText(text:string,parent?:IDomNode):IDomNode;
    createPlaceholder():IDomNode;
    setContent(node:IDomNode,content:string):IDomUtility;
    getContent(node:IDomNode):string;
    setAttribute(node:IDomNode,name:string,value:string):IDomUtility;
    getAttribute(node:IDomNode,name:string):string;
    removeAttribute(node:IDomNode,name:string):IDomUtility;
    setProperty(node:IDomNode,name:string,value:any):IDomUtility;
    getProperty(node:IDomNode,name:string):any;
    appendChild(parent:IDomNode,child:IDomNode):IDomUtility;
    insertBefore(insert:IDomNode,rel:IDomNode):IDomUtility;
    insertAfter(insert:IDomNode,rel:IDomNode):IDomUtility;
    remove(node:IDomNode):IDomUtility;
    getParent(node:IDomNode):IDomNode;
    hide(node:any,immeditately?:boolean):IDomUtility;
    show(node:any,immeditately?:boolean):IDomUtility;
    removeAllChildrens(node:IDomNode):IDomUtility;
    getChildren(node:IDomNode):IDomNode[];
    getStyle(node:IDomNode,name:string):string;
    setStyle(node:IDomNode,name:string,value:string):IDomUtility;
    hasClass(node:IDomNode,cls:string):boolean;
    addClass(node:IDomNode,cls:string):IDomUtility;
    removeClass(node:IDomNode,cls:string):IDomUtility;
    replaceClass(node:IDomNode,oldCls:string,newCls:string,alwaysAdd?:boolean):IDomUtility;

    
    attach(elem:IDomNode,evtname:string,handler:Function);
    detech(elem:IDomNode,evtname:string,handler:Function);
    parse(domString:string):IDomNode[];
    document:IDomDocument;
    global:any;
    window:any;
    wrapper:IDomNode;
    
}
export let DomUtility:IDomUtility={} as any;
DomUtility.isElement=(elem,includeText?:boolean):boolean=>{
    if(!elem) return false;
    if(!(elem as Node).insertBefore || !(elem as Node).ownerDocument)return false;
    return includeText?true:(elem as HTMLElement).nodeType === 1;
};

DomUtility.createElement=function(tag:IVirtualNode|string,attrs?:{[name:string]:string}|IDomNode):any{
    let t= typeof(tag);
    if(t==="string"){
        let elem = DomUtility.document.createElement(tag as string);
        if(DomUtility.isElement(attrs)) DomUtility.appendChild(attrs as any,elem);
        else if(typeof attrs==="object"){
            for(let n in attrs) DomUtility.setAttribute(elem,n,attrs[n]);
            for(let i=2,j=arguments.length;i<j;i++){
                let child = arguments[i];
                if(typeof child==="string") DomUtility.appendChild(elem,DomUtility.createText(child));
                else DomUtility.appendChild(elem,child);
            }
        }
        return elem;
    }
    if(t==="object"){
        let vnode  = tag as IVirtualNode;
        let node = vnode.tag?DomUtility.document.createElement(vnode.tag):DomUtility.createText(vnode.content);
        if(attrs) DomUtility.appendChild(attrs as IDomNode,node);
        let _attrs = vnode.attrs ||{}; 
        if(vnode.className)_attrs["className"] = vnode.className;
        if(vnode.name) _attrs["name"] = vnode.name;
        if(vnode.value) _attrs["value"] = vnode.value;
        if(vnode.id) _attrs["id"] = vnode.id;
        if(vnode.type) _attrs["type"] = vnode.type;
        if(vnode.title) _attrs["title"] = vnode.title;
        if(vnode.placeholder) _attrs["placeholder"] = vnode.placeholder;
        for(let n in _attrs){
            DomUtility.setAttribute(node,n,vnode.attrs[n]);
        }
        if(vnode.children){
            for(const i in vnode.children){
                let child = vnode.children[i];
                if(typeof child==="string")DomUtility.createText(child,node);
                else DomUtility.createElement(child,node);
            }
            
        }
        return node;
    }
    
};

DomUtility.createText=(txt:string,parent?:IDomNode):IDomNode=>{
    let node= DomUtility.document.createTextNode(txt);
    if(parent) DomUtility.appendChild(parent,node);
    return node;
};
DomUtility.createPlaceholder=():IDomNode=>{
    let rs = document.createElement("span");
    rs.className="YA-PLACEHOLDER";
    rs.style.display = "none";
    return rs;
};
DomUtility.setContent=(elem:IDomNode,content:string):IDomUtility=>{
    if(elem.nodeType===1)(elem as any).innerHTML = content;
    else elem.nodeValue = content;
    return DomUtility;
}
DomUtility.getContent=(elem:IDomNode):string=>{
    return elem.nodeType===1?(elem as any).innerHTML:elem.nodeValue;
};

DomUtility.setAttribute=(elem:IDomNode,name:string,value:string):IDomUtility=>{
    (elem as any).setAttribute(name,value);
    return DomUtility;
};
DomUtility.getAttribute=(elem:IDomNode,name:string):string=>{
    return (elem as any).getAttribute(name);
};
DomUtility.removeAttribute=(elem:IDomNode,name:string):IDomUtility=>{
    (elem as any).removeAttribute(name);
    return DomUtility;
};

DomUtility.setProperty=(elem:IDomNode,name:string,value:any):IDomUtility=>{
    (elem as any)[name]=value;
    return DomUtility;
};
DomUtility.getProperty=(elem:IDomNode,name:string):any=>{
    return (elem as any)[name];
};

DomUtility.appendChild=(container:IDomNode,child:IDomNode):IDomUtility=>{
    (container as any).appendChild(child);
    return DomUtility;
};

DomUtility.insertBefore=(insert:IDomNode,rel:IDomNode):IDomUtility=>{
    if((rel as any).parentNode)(rel as any).parentNode.insertBefore(insert,rel);
    return DomUtility;
};

DomUtility.insertAfter=(insert:IDomNode,rel:any):IDomUtility=>{
    if(rel.parentNode)rel.parentNode.insertAfter(insert,rel);
    return DomUtility;
};
DomUtility.getParent=(elem:IDomNode)=>(elem as any).parentNode as IDomNode;
DomUtility.remove = (node:IDomNode):IDomUtility=>{
    if((node as any).parentNode) (node as any).parentNode.removeChild(node);
    return DomUtility;
}
DomUtility.removeAllChildrens=(elem:IDomNode):IDomUtility=>{
    (elem as any).innerHTML = elem.nodeValue="";
    return DomUtility;
};
DomUtility.getChildren=(elem:IDomNode)=>(elem as any).childNodes;

DomUtility.show = (elem:IDomNode,immeditately?:boolean):IDomUtility=>{
    (elem as any).style.display="";
    return DomUtility;
}
DomUtility.hide = (elem:IDomNode,immeditately?:boolean):IDomUtility=>{
    (elem as any).style.display="none";
    return DomUtility;
};

DomUtility.attach = (elem:any,evtname:string,handler:Function):IDomUtility=>{
    if(elem.addEventListener) elem.addEventListener(evtname,handler,false);
    else if(elem.attachEvent) elem.attachEvent('on' + evtname,handler);
    else elem['on'+evtname] = handler;
    return DomUtility;
}
DomUtility.detech = (elem:any,evtname:string,handler:Function)=>{
    if(elem.removeEventListener) elem.removeEventListener(evtname,handler,false);
    else if(elem.detechEvent) elem.detechEvent('on' + evtname,handler);
    else elem['on'+evtname] = null;
    return DomUtility;
}
DomUtility.isActive = (elem:any):boolean=>{
    let doc = (elem as HTMLElement).ownerDocument;
    while(elem){
        elem = elem.parentNode;
        if(elem===doc || elem===doc.body) break;
    }
    if(!elem) return false;
    return true;
}

if(typeof document!=="undefined") DomUtility.document = document as any as IDomDocument;
if(typeof window!=="undefined") DomUtility.global =  DomUtility.window = window;

try{
    let element_wrapper:HTMLElement = DomUtility.wrapper = DomUtility.createElement("div") as any;

    if((element_wrapper as any).currentStyle){
        DomUtility.getStyle = (node,name)=> (node as any).currentStyle[name];
    }else {
        DomUtility.getStyle = (node,name)=>getComputedStyle(node as any,false as any)[name];
    }
    DomUtility.setStyle = (node:IDomNode,name:string,value:string):IDomUtility=>{
        let convertor = styleConvertors[name];
        (node as any).style[name] = convertor?convertor(value):value;
        return DomUtility;
    }
    DomUtility.parse = (domString:string):IDomNode[]=>{
        element_wrapper.innerHTML = domString;
        return element_wrapper.childNodes as any;
    }
}catch(ex){}



let emptyStringRegx = /\s+/g;
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

DomUtility.hasClass=(node:IDomNode,cls:string):boolean=>{
    return findClassAt(node.className,cls)>=0;
}
DomUtility.addClass=(node:IDomNode,cls:string):IDomUtility =>{ //IDom{
    if(findClassAt(node.className,cls)>=0) return DomUtility;
    node.className+= " " + cls;
    return DomUtility;
}
DomUtility.removeClass = (node:IDomNode,cls:string):IDomUtility => { //IDom{
    let clsnames = node.className;
    let at = findClassAt(clsnames,cls);
    if(at<=0) return DomUtility;
    let prev = clsnames.substring(0,at);
    let next =clsnames.substr(at+cls.length);
    node.className= prev.replace(/(\s+$)/g,"") +" "+ next.replace(/(^\s+)/g,"");
}
DomUtility.replaceClass = (node:IDomNode,old_cls:string,new_cls:string,alwaysAdd?:boolean):IDomUtility => { //IDom{
    if((old_cls==="" || old_cls===undefined || old_cls===null) && alwaysAdd) return this.addClass(new_cls);
    let clsnames = node.className;
    let at = findClassAt(clsnames,old_cls);
    if(at<=0) {
        if(alwaysAdd) node.className = clsnames + " " + new_cls;
        return DomUtility;
    }
    let prev = clsnames.substring(0,at);
    let next =clsnames.substr(at+old_cls.length);
    node.className= prev +new_cls+ next;
    
    return DomUtility;
}   


//======================================================================


 


export function THIS(obj:any,name:string|Function){
    let method = name as Function;
    let rpc =false;
    if(typeof name==="string"){
        method = obj[name];rpc=true;
    }
    let fn = function () { return method.apply(obj,arguments); }
    if(rpc) obj[name as string] = fn;
    return fn;
}

//=======================================================================



//=======================================================================

export function queryString(str:string){
    let at = str.indexOf("#");
    if(at>=0) str = str.substr(0,at-1);
    let pairs = str.split('&');
    let rs = {};
    for(let i in pairs){
        let pair = pairs[i].split("=");
        rs[pair[0]] = pair[1];
    }
    return rs;
}


//=======================================================================
let YA={
    Subject, ObservableModes,observableMode,proxyMode,Observable,ObservableObject,ObservableArray, ObservableSchema
    ,component,state: reactive,IN,OUT,PARAM,template,attrBinders
    ,VirtualNode,VirtualTextNode,VirtualElementNode,VirtualComponentNode,virtualNode,NOT,EXP
    ,Host: DomUtility,styleConvertors
    ,intimate: implicit,clone,Promise
    
};
if(typeof window!=='undefined') (window as any).YA = YA;
export default YA;





