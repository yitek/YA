import { Dom, IDom, dom } from "./dom/YA.dom";
import { IView, Renderer } from "./YA.modeling";

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
    if(!obj) return true;
    let t = typeof obj;
    if(t==="function" || t==="number" || t==="boolean")return false;
    for(let n in obj) return false;
    return true;
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
    return text.toString().replace(trimreg,"");
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
    

    //$__topics__:{[topic:string]:any};
    
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
    subscribe(topic:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}|IDisposable,disposible?:IDisposable):ISubject<TEvtArgs>;
    
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
    subscribe(topic:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}|IDisposable,disposible?:IDisposable):ISubject<TEvtArgs>{
        if(listener===undefined) {
            listener = topic as {(evt:TEvtArgs):any};
            topic="";
        }else if(typeof topic==="function"){
            disposible = listener as IDisposable;
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

export interface IDisposable{
    dispose(onRelease?:any | {(arg:any,sender:IDisposable):any});
    deteching(onDeteching?:{(sender:IDisposable):boolean}):IDisposable|boolean;
    $isDisposed:boolean;
}



export class Disposable implements IDisposable{
    $isDisposed:boolean;
    private $__disposings__:Function[];
    private $__detechings__:Function[];
    constructor(){
        disposable(this);
    }
    dispose(onRealse:any|{(arg:any,sender?:IDisposable):any}):IDisposable{
        return this;
    }

    deteching(onDeteching?:(sender:IDisposable)=>boolean):Disposable|boolean{
        return this;
    }
}
export function disposable(target:any):IDisposable{
    target || (target=this);    
    Object.defineProperty(target,"$isDisposed",{enumerable:false,configurable:true,writable:false,value:false});
    Object.defineProperty(target,"$__disposings__",{enumerable:false,configurable:false,writable:true,value:undefined});
    Object.defineProperty(target,"$__detechings__",{enumerable:false,configurable:false,writable:true,value:undefined});
    Object.defineProperty(target,"deteching",{enumerable:false,configurable:false,writable:true,value:function(onDeteching?:{(sender:IDisposable):boolean}|any):IDisposable|boolean{
        if(this.$isDisposed) throw new Error("该资源已经被释放");
        if(onDeteching!==undefined){
            let onDetechings = this.$__detechings__;
            if(!onDetechings) Object.defineProperty(this,"$__detechings__",{enumerable:false,configurable:false,writable:false,value:onDetechings=[]});
            onDetechings.push(onDeteching);
        }else {
            let onDetechings = this.$__detechings__;
            for(const i in onDetechings){
                if(onDetechings[i].call(this,this)===false)return false;
            }
            return true;
        }
        
        return this;
    }});
    Object.defineProperty(target,"dispose",{enumerable:false,configurable:false,writable:true,value:function(onRelease?:any):IDisposable{
        if(this.$isDisposed) throw new Error("不能释放已经释放的资源");
        if(typeof onRelease==="function"){
            let onReleases = this.$__disposings__;
            if(!onReleases) Object.defineProperty(this,"$__disposings__",{enumerable:false,configurable:false,writable:false,value:onReleases=[]});
            onReleases.push(onRelease);
            return this;
        }
        Object.defineProperty(this,"$isDisposed",{enumerable:false,configurable:true,writable:false,value:true});
        let onReleases = this.$__disposings__;
        try{
            for(const release of onReleases){
                release.call(this,onRelease,this);
            }
        }finally{
            
        }
        return this;
    }});
    return target;
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

    /**
     * 行为基本等同Observable,但如果该变量是Proxy,则会返回Proxy
     */
    Proxy,
    Schema
}


export interface IObservable<TData> extends ISubject<IChangeEventArgs<TData>>{
    $type:DataTypes;
    $extras?:any;
    $target?:TData;
    $isset?:boolean;
    $root?:IObservable<any>;
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
    cancel?:boolean,
    changes?:IChangeEventArgs<any>[]
}

export enum ChangeTypes{
    Value,
    Item,
    Append,
    Push,
    Pop,
    Shift,
    Unshift,
    Remove,
    Computed
}



let Undefined:any = {};

export interface IObservableIndexable<TData extends {[index in keyof object]:any}> extends IObservable<TData>{
    $target:any;
    $__obModifiedValue__:any;
}
@implicit()
export class Observable<TData> extends Subject<IChangeEventArgs<TData>> implements IObservable<TData>{
    $type:DataTypes;

    $target:TData;

    $extras?:any;

    $isset?:boolean;

    $schema?:ObservableSchema<TData>;

    $root:Observable<any>;

    $__obExtras__?:any;

    $__obIndex__?:number|string;

    $__obModifiedValue__:TData;
    
    $__obOwner__?:IObservableIndexable<TData>;

    $__obRaw__:(value?:TData)=>any;

    constructor(init:IObservableIndexable<TData>|{(val?:TData):any}|TData,index?:any,extras?:any,initValue?:any){
        super();
        
        if(init instanceof ObservableObject || init instanceof ObservableArray){
            //ctor(owner,index,extras)
            this.$__obOwner__= init as IObservableIndexable<TData>;
            this.$__obIndex__ = index;
            this.$__obRaw__ = (val:TData):any=>observableMode(ObservableModes.Raw,()=>val===undefined
                ?(this.$__obOwner__.$__obModifiedValue__===undefined
                    ?this.$__obOwner__.$target
                    :(this.$__obOwner__.$__obModifiedValue__===Undefined?null:this.$__obOwner__.$__obModifiedValue__)
                )[this.$__obIndex__]
                :((this.$__obOwner__.$__obModifiedValue__===undefined
                    ?this.$__obOwner__.$target
                    :(this.$__obOwner__.$__obModifiedValue__===Undefined?null:this.$__obOwner__.$__obModifiedValue__)
                )as any)[this.$__obIndex__]=val as any);   
            
            this.$__obExtras__ = extras;
            if(initValue!==undefined){
                this.$__obRaw__(this.$target= initValue);
            }else{
                this.$target = this.$__obRaw__();
            }
        }else if(typeof init==="function"){
            //ctor(TRaw,extras)
            this.$__obExtras__ = index;
            this.$__obRaw__ = init as {(val?:TData):any};
            if(initValue!==undefined){
                this.$__obRaw__(this.$target= initValue);
            }else{
                this.$target = this.$__obRaw__();
            }
        }else {
            //ctor(initValue,accessor,extras)
            if(typeof index==="function"){
                this.$__obExtras__ = extras;
                this.$__obRaw__ = index;
                this.$target = init as TData;
                index.call(this,init);
            }else {
                //ctor(initValue,extras)
                this.$target=init as TData;
                this.$__obExtras__ = index;
                this.$__obRaw__ =(val:TData)=>val===undefined?init:init=val;
            }
        }
        if(this.$target instanceof Observable) 
            throw new Error("不正确的赋值");
        
        implicit(this, {
            $target:this.$target,$type:DataTypes.Value,$schema:this.$schema,$isset:false
            ,$__obRaw__:this.$__obRaw__,$__obIndex__:this.$__obIndex__,$__obModifiedValue__:undefined,$__obOwner__:this.$__obOwner__,$__obExtras__:this.$__obExtras__
        });
        Object.defineProperty(this,"$extras",{enumerable:false,configurable:false,
            get:()=>{
                if(this.$__obExtras__!==undefined) return this.$__obExtras__;
                if(this.$__obOwner__) return this.$__obOwner__.$extras;
                return undefined;
            },
            set:(val)=>this.$__obExtras__ = val
        });
        Object.defineProperty(this,"$root",{enumerable:false,configurable:false,
            get:()=>{
                if(this.$__obOwner__) return this.$__obOwner__.$root;
                return this;
            }
        });
        
    }
    

    get(accessMode?:ObservableModes):TData|IObservable<TData>|ObservableSchema<TData>{
        if(accessMode===undefined) accessMode = Observable.accessMode;
        if(accessMode == ObservableModes.Raw ) return this.$__obRaw__();
        if( accessMode == ObservableModes.Schema ) return this.$schema;
        if( accessMode == ObservableModes.Observable || accessMode == ObservableModes.Proxy ) return this as IObservable<TData>;
        return (this.$__obModifiedValue__===undefined)?this.$target:(this.$__obModifiedValue__===Undefined?undefined:this.$__obModifiedValue__);
    }

    set(newValue:TData,updateImmediately?:boolean):IObservable<TData>{
        this.$isset=true;
        if(newValue && newValue instanceof Observable) newValue = newValue.get(ObservableModes.Value);
        if(Observable.accessMode===ObservableModes.Raw) {this.$__obRaw__.call(this,newValue);return this;}
        this.$__obModifiedValue__=newValue===undefined?Undefined:newValue;
        if(updateImmediately) this.update();
        return this;
    }

    /**
     * 更新数据，引发事件，事件会刷新页面
     *
     * @returns {boolean} false=不做后继的操作。event.cancel=true会导致该函数返回false.
     * @memberof Observable
     */
    update():boolean{
        let newValue :any= this.$__obModifiedValue__;
        if(newValue===undefined) return true;
        this.$__obModifiedValue__=undefined;
        newValue =newValue===Undefined?undefined:newValue;
        let oldValue = this.$target;
        if(newValue!==oldValue) {
            this.$__obRaw__(this.$target = newValue);
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
    static isObservable(ob:any):boolean{
        if(!ob)return false;
        return ob.subscribe && ob.get && ob.set && ob.update;
    }
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
        if(!this.$target) this.$__obRaw__(this.$target={} as any);
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
        if(accessMode=== ObservableModes.Raw ) return this.$__obRaw__();
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

    set(newValue:TData|IObservable<TData>,updateImmediately?:boolean):IObservableObject<TData>{
        this.$isset = true;
        if(newValue && Observable.isObservable(newValue)) newValue = (newValue as IObservable<TData>).get(ObservableModes.Value) as TData;
        super.set(newValue as TData||null);
        if(!newValue) return this;
        proxyMode(()=>{
            for(const n in this){
                if(n==="constructor" || n[0]==="$") continue;
                let proxy :any= this[n];
                if(Observable.isObservable(proxy)) proxy.set((newValue as any)[n] as any);
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
                if(Observable.isObservable(proxy)) proxy.update();
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
    $__length__:Observable<number>;
    $_itemSchema:ObservableSchema<TItem>;
    
    constructor(init:IObservableIndexable<TItem[]>|{(val?:TItem[]):any}|TItem[],index?:any,itemSchemaOrExtras?:any,extras?:any){
        let target:any;
        super(init,index,extras);
        this.$type = DataTypes.Array;
        target = this.$target;
        if(Object.prototype.toString.call(target)!=="[object Array]") this.$__obRaw__.call(this,target=this.$target=[]);

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
            $_changes:undefined,$_length:target.length,$__length__:undefined,$_itemSchema:this.$_itemSchema
        });
        Object.defineProperty(this,"length",{
            enumerable:false,configurable:false,get:()=>{
                if(Observable.accessMode===ObservableModes.Proxy || Observable.accessMode===ObservableModes.Observable){
                    if(!this.$__length__) {
                        let len = new Observable((val)=>{
                            if(val===undefined) return this.$_length;
                            throw "not implemeent";
                        });
                        len.$__obIndex__ = "$__length__";
                        len.$__obOwner__ = this;
                        Object.defineProperty(this,"$__length__",{enumerable:false,writable:false,configurable:false,value:len});
                        
                    }
                    return this.$__length__;
                    
                }
            },set:(val)=>{throw "not implemeent";}
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
        if(accessMode=== ObservableModes.Raw ) return this.$__obRaw__();
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
        this.$isset = true;
        if(newValue && Observable.isObservable(newValue)) newValue = newValue.get(ObservableModes.Value);
        else {
            let newArr =[];
            for(let item of newValue){
                if(Observable.isObservable(item)) newArr.push(item.get(ObservableModes.Value));
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
        //有3种操作
        // 用新数组代替了旧数组
        // push/pop/shift/unshift
        // 子项变更了
        
        //新数组代替了旧数组，用super处理了。？？这里逻辑有问题，如果数组赋值后又push/pop了会怎么处理？
        if(!super.update()) return true;
        //查看子项变更
        for(let n in this){
            if(n==="constructor"){ continue;}
            let item = this[n];
            item.update();
        }
        //处理push/pop等数组操作
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
                    //this.notify(change);
                    //if(change.cancel!==true && change.item) change.item.notify(change);
                    break;
                case ChangeTypes.Pop:
                    arr.pop();
                    //this.notify(change);
                    if(change.cancel!==true && change.item) {
                        change.sender = change.item;
                        change.item.notify(change);
                    }
                    break;
                case ChangeTypes.Unshift:
                    arr.unshift(change.value);
                    //this.notify(change);
                    break;
                case ChangeTypes.Shift:
                    arr.shift();
                    //this.notify(change);
                    if(change.cancel!==true && change.item) {
                        change.sender = change.item;
                        change.item.notify(change);
                    }
                    break;
                case ChangeTypes.Item:
                    arr[change.index] = change.value;
                    //this.notify(change);
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
    let item = new obArray.$_itemSchema.$obCtor(obArray,index,undefined);
    item.$__obIndex__ = index;
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

function defineProp<TObject>(target:any,propname:string,propSchema:ObservableSchema<any>,private_prop_name?:string){
    if(!private_prop_name) private_prop_name = "$__" + propname + "__";
    Object.defineProperty(target,propname,{
        enumerable:true,
        configurable:false,
        get:function(param?:any){
            let ob = this[private_prop_name];
            if(!ob) Object.defineProperty(this,private_prop_name,{
                enumerable:false,configurable:false,writable:false,value:ob=new propSchema.$obCtor(this,propname)
            });
            
            return ob.get(param);
        },
        set:function(val){
            let ob = this[private_prop_name];
            if(!ob) Object.defineProperty(this,private_prop_name,{
                enumerable:false,configurable:false,writable:false,value:ob=new propSchema.$obCtor(this,propname)
            });
            return ob.set(val);
        }
    });
}


 
//=======================================================================
@implicit()
export class ObservableSchema<TData>{
    [index:string]:any;
    $type:DataTypes;
    $index:string|number;
    
    $paths:string[];
    $obCtor:{new (init:TData|{(val?:TData):any}|IObservableIndexable<any>,index?:any,extras?:any,initValue?:any):Observable<any>};
    $proxyCtor:{new (schema:ObservableSchema<any>,parent:ObservableProxy)};
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
            ,"$obCtor":Observable
            ,"$proxyCtor":ObservableProxy
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
                this.$obCtor = Observable;
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
        let schema = this;
        
        class _ObservableObject extends ObservableObject<TData>{
            constructor(init:ObservableObject<any>|{(val?:TData):any}|TData,index?:any,extras?:any,initValue?:any){
                super(init,index,extras,initValue);
            }
        };
        _ObservableObject.prototype.$schema= this;
        this.$obCtor= _ObservableObject;
        class _ObservableObjectProxy extends ObservableProxy{
            constructor(schema:ObservableSchema<any>,parent:ObservableProxy){
                super(schema,parent);
            }
        }
        this.$proxyCtor = _ObservableObjectProxy;
        return this;
    }

    defineProp<TProp>(propname:string,initValue?:TProp):ObservableSchema<TProp>{
        if(this.$type!==DataTypes.Object) throw new Error("调用$defineProp之前，要首先调用$asObject");
        let propSchema :ObservableSchema<TProp> = new ObservableSchema<TProp>(initValue,propname,this);
        let private_prop_name = "$__" + propname + "__";
        let self = this;
        
        Object.defineProperty(this,propname,{enumerable:true,writable:false,configurable:false,value:propSchema});
        defineProp(this.$obCtor.prototype,propname,propSchema,private_prop_name);
        Object.defineProperty(this.$proxyCtor.prototype,propname,{
            enumerable:true,configurable:false,
            get:function(){
                let proxy = this[private_prop_name];
                if(!proxy) Object.defineProperty(this,private_prop_name,{
                    enumerable:false,configurable:false,writable:false,value:proxy=new propSchema.$proxyCtor(self,this)
                });
                
                return proxy.get();
            }
        });   
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
        this.$obCtor=_ObservableArray;
        let lengthSchema = new ObservableSchema(0,"length",this);
        Object.defineProperty(this,"length",{enumerable:false,configurable:false,get:()=>lengthSchema});
    }

    
    initObject(ob:Observable<TData>){
        for(const n in this){
            if(n==="constructor" || n[0]==="$" || n===ObservableSchema.schemaToken) continue;
            let propSchema = this[n] as any as ObservableSchema<any>;
            defineProp<TData>(ob,n,propSchema);
        }
    }
    

    createObservable(val?:any):Observable<TData>{
        return new this.$obCtor(val);
    }
    createProxy():ObservableProxy{
        return new this.$proxyCtor(this,undefined);
    }

    static schemaToken:string = "$__ONLY_USED_BY_SCHEMA__";
}

export interface IObservableProxy<TData> extends ISubject<IChangeEventArgs<TData>>{
    get(accessMode?:ObservableModes):TData|IObservable<TData>|ObservableSchema<TData>;
    set(newValue:TData,updateImmediately?:boolean):IObservable<TData>;
    update():boolean;
}
function defineProxyProto(proto:any,memberNames:string[]){
    for(const n of memberNames)((member:string,proto:any)=>{
        Object.defineProperty(proto,member,{enumerable:false,configurable:true,writable:true,value:function(){
            let ob:IObservable<any>;
            if(this.$parent){
                ob = this.$schema.getFromRoot(this.$rootOb,ObservableModes.Observable);
            }else {
                ob = this.$rootOb;
            }
            let rs = ob[member].apply(ob,arguments);
            return rs ===ob ? this:rs;
        }});
    })(n,proto);
}
@implicit()
export class ObservableProxy implements IObservable<any> {
    $parent:ObservableProxy;
    $schema:ObservableSchema<any>;
    $type:DataTypes;
    $extras?:any;
    $target?:any;
    $isset?:boolean;
    $root?:Observable<any>;
    $__topics__:any;

    $__rootOb__:IObservable<any>;
    $rootOb:IObservable<any>;
    constructor(param:ObservableSchema<any>|Observable<any>|any,parent?:ObservableProxy){
        let schema:ObservableSchema<any>;
        let rootOb :IObservable<any>;
        if(param instanceof ObservableSchema) schema = param;
        else if(param instanceof Observable) {
            rootOb = param;
            schema = param.$schema;
        }else{
            schema = new ObservableSchema(param);
        }
        implicit(this,{
            $parent:parent,$schema:schema,$__rootOb__:rootOb
        });
        
        Object.defineProperty(this,"$rootOb",{enumerable:false,get:function(){
                if(this.$__rootOb__) return this.$__rootOb__;
                return this.$parent?this.$parent.$rootOb:undefined;
            }
        });
        Object.defineProperty(this,"$root",{enumerable:false,get:function(){
                let ob = this.$schema.getFromRoot(this.$rootOb,ObservableModes.Observable);
                return ob.$root;
            }
        });
        if(this.$schema.$itemSchema){
            let lenSchema = this.$schema.length;
            let lenProxy = new ObservableProxy(lenSchema,this);
            Object.defineProperty(this,"length",{enumerable:false,configurable:false,writable:false,value:lenProxy});
        }
        
        for(let n in schema){
            let sub = schema[n];
            Object.defineProperty(this,n,{enumerable:true,writable:false,configurable:false,value:new ObservableProxy(sub,this)});
        }
    }
    get(accessMode?:ObservableModes):any{
        if(accessMode===ObservableModes.Proxy|| Observable.accessMode===ObservableModes.Proxy) return this;
        let ob :IObservable<any>;
        if(this.$parent){
            ob = this.$schema.getFromRoot(this.$rootOb,ObservableModes.Observable);
            return ob.get(accessMode);
        }else{
            return this.$rootOb.get(accessMode);
        }
    }
    set(newValue:any,updateImmediately?:boolean):any{
        
        if(this.$parent){
            let ob:IObservable<any> = this.$schema.getFromRoot(this.$rootOb,ObservableModes.Observable);
            //if(newValue instanceof Observable) newValue = newValue.get(ObservableModes.Value);
            ob.set(newValue,updateImmediately);
        }else {
            if(Observable.isObservable(newValue)){
                this.$__rootOb__ = newValue;
            }else {
                newValue = new Observable<any>(newValue);
                if(this.$__rootOb__)this.$__rootOb__.set(newValue,updateImmediately);
                else this.$__rootOb__ = newValue;
            }
                
        }
        return this;
    } 
    subscribe():any{throw new Error("abstract method");}
    unsubscribe():any{throw new Error("abstract method");}
    notify():any{throw new Error("abstract method");}
    fulfill():any{throw new Error("abstract method");}
    update():any{throw new Error("abstract method");}
    pop():any{throw new Error("abstract method");}
    push():any{throw new Error("abstract method");}
    shift():any{throw new Error("abstract method");}
    unshift():any{throw new Error("abstract method");}
}
defineProxyProto(ObservableProxy.prototype,["update","subscribe","unsubscribe","notify","fulfill","push","pop","shift","unshift","clear"]);



export function observable(initData:any,index?:string,subject?:any){
    if(Observable.isObservable(initData)) throw new Error("不能用Observable构造另一个Observable,或许你想使用的是ObservableProxy?");
    let t = typeof initData;
    let ob :Observable<any>;
    if(t==="object"){
        if(is_array(initData)){
            ob = new ObservableArray<any>(initData);
        }else ob = new ObservableObject<any>(initData);
        if(index){
            ob.$__obIndex__ = index;
            ob.$target = initData;
        }
    }else {
        let schema = new ObservableSchema<any>(initData);
        schema.$index = index;
        ob = schema.createObservable(initData);
    }
    if(subject){
        let privateName = "$__" + index + "__";
        Object.defineProperty(subject,privateName,{enumerable:true,configurable:false,writable:false,value:ob});
        Object.defineProperty(subject,index,{enumerable:true,configurable:false,
            get:function(){
                return ob.get();
            },
            set:(val:any)=> ob.set(val)
        });
    }
    ob.$extras = subject;
    return ob;
}

export function enumerator(initData:any,index?:string,subject?:any):ObservableProxy{
    let proxy = new ObservableProxy(initData);
    if(subject){
        let privateName = "$__" + index + "__";
        Object.defineProperty(subject,privateName,{enumerable:true,configurable:false,writable:false,value:proxy});
        Object.defineProperty(subject,index,{enumerable:true,configurable:false,
            get:function(){
                return proxy;
            },
            set:function(val:any){ proxy.set(val);}
        });
    }
    return proxy;
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
    is_inDocument(obj:any):boolean;
    createElement(tag:string,attrs?:{[name:string]:string},parent?:IDomNode,content?:string):IDomNode;
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
    replaceNode(oldNode:IDomNode,newNode:IDomNode);
    getParent(node:IDomNode):IDomNode;
    hide(node:any,immeditately?:boolean):IDomUtility;
    show(node:any,immeditately?:boolean):IDomUtility;
    removeAllChildren(node:IDomNode):IDomUtility;
    getChildren(node:IDomNode):IDomNode[];
    getStyle(node:IDomNode,name:string):string;
    setStyle(node:IDomNode,name:string,value:string):IDomUtility;
    hasClass(node:IDomNode,cls:string):boolean;
    addClass(node:IDomNode,cls:string):IDomUtility;
    removeClass(node:IDomNode,cls:string):IDomUtility;
    replaceClass(node:IDomNode,oldCls:string,newCls:string,alwaysAdd?:boolean):IDomUtility;
    getValue(node:IDomNode):any;
    setValue(node:IDomNode,value:any);
    change(elem:IDomNode,handler:(value:any)=>void):boolean;
    
    attach(elem:IDomNode,evtname:string,handler:Function);
    detech(elem:IDomNode,evtname:string,handler:Function);
    parse(domString:string):IDomNode[];
    
    
}
export let DomUtility:IDomUtility={} as any;
DomUtility.isElement=(elem,includeText?:boolean):boolean=>{
    if(!elem) return false;
    if(!(elem as Node).insertBefore || !(elem as Node).ownerDocument)return false;
    return includeText?true:(elem as HTMLElement).nodeType === 1;
};

DomUtility.createElement=function(tag:string,attrs?:{[name:string]:string},parent?:IDomNode,content?:string):IDomNode{
    let elem = document.createElement(tag);
    if(attrs) for(const n in attrs) elem.setAttribute(n,attrs[n]);
    if(parent) (parent as any).appendChild(elem);
    if(content) elem.innerHTML = content;
    return elem;
    
};

DomUtility.createText=(txt:string,parent?:IDomNode):IDomNode=>{
    let node= document.createTextNode(txt) as any as IDomNode;
    if(parent) (parent as any).appendChild(node);
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
    (elem as any)[name]=value;
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
DomUtility.removeAllChildren=(elem:IDomNode):IDomUtility=>{
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
DomUtility.is_inDocument = (elem:any):boolean=>{
    let doc = (elem as HTMLElement).ownerDocument;
    while(elem){
        elem = elem.parentNode;
        if(elem===doc || elem===doc.body) break;
    }
    if(!elem) return false;
    return true;
}
DomUtility.getValue = (elem:IDomNode):any=>{
    if(typeof (elem as any).get ==="function") return (elem as any).get();
    let tag = elem.tagName;
    if(!tag) return (elem as any).nodeValue;
    if(tag==="INPUT"){
        let type = (elem as any).type;
        if(type==="radio"){
            if((elem as any).checked) return (elem as any).value;
            else return undefined;
        }else if(type==="checkbox"){
            let p = (elem as any).parentNode;
            if(p){
                let name = (elem as any).name;
                let vals = [];
                let c = 0;
                for(let i =0,j=p.childNodes.length;i<j;i++){
                    let child = p.childNodes[i];
                    if(child.tagName==="INPUT" && child.type=="checkbox" && child.name===name){
                        c++;
                        if(child.checked) vals.push(child.value);
                    }
                }
                if(c===0) return undefined;
                else if(c===1) return vals[0];
                else return vals;
            }else{
                return (elem as any).checked?(elem as any).value:undefined;
            }
        }else{
            return (elem as any).value;
        }
    }else if(tag==="SELECT"){
        let opt = (elem as any).options[(elem as any).selectedIndex];
        if(opt) return opt.value;
    }else if(tag==="TEXTAREA") return (elem as any).value;
    else return (elem as any).innerHTML;
}

DomUtility.replaceNode = (old:IDomNode,newNode:IDomNode)=>{
    let pa = (old as any).parentNode;
    if(pa){
        (pa as HTMLElement).insertBefore(newNode as any,old as any);
        pa.removeChild(old);
    } 

}
DomUtility.setValue = (elem:IDomNode,value:any)=>{
    if(typeof (elem as any).set ==="function") return (elem as any).set(value);
    let tag = elem.tagName;
    if(!tag) return (elem as any).nodeValue=value;
    if(tag==="INPUT"){
        let type = (elem as any).type;
        if(type==="radio"){
            if(value===true || value==="On" || value==="ON" || value===(elem as any).value){
                (elem as any).checked = true;
            }else {
                (elem as any).checked = false;
                DomUtility.removeAttribute(elem,"checked");
            }
        }else if(type==="checkbox"){
            let p = (elem as any).parentNode;
            if(p){
                let name = (elem as any).name;
                let isArr = is_array(value);
                let c = 0;
                for(let i =0,j=p.childNodes.length;i<j;i++){
                    let child = p.childNodes[i];
                    if(child.tagName==="INPUT" && child.type=="checkbox" && child.name===name){
                        if(isArr) child.checked = array_index(value,child.value)>=0; 
                        else if(value===true || value==="On" || value==="ON" || value===(elem as any).value){
                            (child as any).checked = true;
                        }else {
                            (child as any).checked = false;
                            DomUtility.removeAttribute(child,"checked");
                        }
                    }
                }
            }else{
                if(value===true || value==="On" || value==="ON" || value===(elem as any).value){
                    (elem as any).checked = true;
                }else {
                    (elem as any).checked = false;
                    DomUtility.removeAttribute(elem,"checked");
                }
            }
            return;
        }else{
            (elem as any).value=value;
            return;
        }
    }else if(tag==="SELECT"){
        for(let i =0,j=(elem as any).options.length;i<j;i++){
            let opt = (elem as any).options[i];
            if(opt.value===value) opt.selected =true;
            else {
                opt.selected = false;
                DomUtility.removeAttribute(opt,"selected");
            }
        }
    }else if(tag==="TEXTAREA") return (elem as any).value=value;
    else if(tag==="OPTION") return (elem as any).value=value;
    else return  (elem as any).innerHTML=value;
};
DomUtility.change = (elem:IDomNode,handler:(value:any)=>void):boolean=>{
    let tag = elem.tagName;
    if(!tag) return false;
    let onchange:Function;
    let isInput = false;
    if(tag==="INPUT"){
        let type = (elem as any).type;
        if(type==="radio"){
            onchange = ()=>handler.call(elem,(elem as any).checked?(elem as any).value:undefined);
            DomUtility.attach(elem,"click",onchange);
            DomUtility.attach(elem,"blur",onchange);
            return true;

        }else if(type==="checkbox"){
            onchange = ()=>handler.call(elem,DomUtility.getValue(elem));
            DomUtility.attach(elem,"click",onchange);
            DomUtility.attach(elem,"blur",onchange);
            return true;
        }
        isInput = true;
    }else if(tag==="SELECT"){
        onchange = ()=>handler.call(elem,DomUtility.getValue(elem));
        DomUtility.attach(elem,"change",onchange);
        DomUtility.attach(elem,"blur",onchange);
        return true;
    }else if(tag==="TEXTAREA"){
        isInput= true;
    }
    if(!isInput) return false;
    let onkeydown = ()=>{
        let tick = (elem as any).$__YA_inputTick__;
        if(tick) clearTimeout(tick);
        (elem as any).$__YA_inputTick__ =setTimeout(()=>{
            delete (elem as any)["$__YA_inputTick__"];
            handler.call(elem,DomUtility.getValue(elem));
        },100);
    };
    let onblur = ()=>{
        let tick = (elem as any).$__YA_inputTick__;
        if(tick) {
            clearTimeout(tick);
            delete (elem as any)["$__YA_inputTick__"];
        }
        handler.call(elem,DomUtility.getValue(elem));
    };
    DomUtility.attach(elem,"keydown",onkeydown);
    DomUtility.attach(elem,"blur",onblur);
}



try{
    let element_wrapper:HTMLElement =  DomUtility.createElement("div") as any;

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


/////////////////////////////////////////////////////////////////////////////
//
// vnode操作/JSX 与绑定
//


/////////////////////////////////////////////////////////////////////////////
//
// vnode操作/JSX 与绑定
//
export type TChildDescriptor = string | IDomNode | INodeDescriptor;
export interface INodeDescriptor{
    tag?:string;
    Component?:Function;
    content?:any;
    children?:TChildDescriptor[];
    [attr:string]:any;
}



/**
 * TRender render函数
 * functional jsx 跟object jsx的render函数参数顺序正好相反
 * functional 是descriptor,container
 * comp.render 的是container,descriptor
 * 
 * @param {IViewModel}} [viewModel] 视图模型实例，数据来源
 * @param {IDomNode} [container] 父级对象，如果设置了值，会把产生的dom-node加入到该node的子节点中
 * @param {INodeDescriptor} vnode 描述了属性与那些observable关联；当然也可以直接与值关联.这个参数主要是组件用于获取它的children信息
 * @returns {(IDomNode|IDomNode[]|INodeDescriptor|INodeDescriptor[])} 可以返回dom-node或v-node(descriptor),如果返回的是v-node，框架会调用YA.createElement将其转换成dom-node
 */
export type TRender = (descriptor:INodeDescriptor,container?:IDomNode)=>IDomNode|IDomNode[]|INodeDescriptor|INodeDescriptor[];


export enum JSXModes{
    vnode,
    dnode
}

let _jsxMode = JSXModes.dnode;

export function jsxMode(mode:JSXModes,statement:()=>any){
    let old = _jsxMode;
    try{
        _jsxMode = mode;
        return statement();
    }finally{
        _jsxMode = old;
    }
}


function _createElement(
    tag:string|INodeDescriptor|Function|any[],
    attrs?:{[name:string]:any}|IDomNode,
    compInst?:IComponent|IDomNode
    
){
    if(tag===undefined || tag===null || tag === "") return;
    let descriptor:INodeDescriptor;
    let container:IDomNode;
    let t = typeof tag;
    
    if(t==="string"){
        if(DomUtility.isElement(attrs)){
            //一:createElement("hello",container?,comp?);
            return createText(tag,attrs as IDomNode,compInst as IComponent);
        }
        //二:createElement("hello",{},...children);
        //构建descriptor
        descriptor ={};
        for(let n in attrs) descriptor[n] = attrs[n];
        descriptor.tag = tag as string;
        let children :any[] = [];
        for(let i = 2,j=arguments.length;i<j;i++){
            children.push(arguments[i]);
        }
        descriptor.children = children;

        return (_jsxMode===JSXModes.vnode)? descriptor:createDescriptor(descriptor,null,null);
        
    }else if(t==="function"){
        if(attrs===undefined || DomUtility.isElement(attrs)){
            //三:createElement(Comp,container);
            return createComponent(tag as Function,null,attrs as IDomNode);
        }
        if(compInst && DomUtility.isElement(compInst)){
            //四:createElement(Comp,attrs,container);
            return createComponent(tag as Function,attrs,compInst as IDomNode);
        }
        //五: createElement(Comp:Function,attrs:{},...children);
        descriptor = {};
        for(let n in attrs) descriptor[n] = attrs[n];
        descriptor.Component = tag as Function;
        
        let children :any[] = [];
        for(let i = 2,j=arguments.length;i<j;i++){
            children.push(arguments[i]);
        }
        descriptor.children = children;
        return (_jsxMode===JSXModes.vnode) ?descriptor:createComponent(descriptor.Component as any,descriptor,null);
    }else if(t==="object") {
        
        if(is_array(tag)){
            //六:createElement(descriptors:INodeDescriptors[],container,comp);
            return createElements(tag as INodeDescriptor[],attrs as IDomNode,compInst as IComponent);
        }else if(tag instanceof Observable || tag instanceof ObservableProxy|| tag instanceof Computed){
            return createText(tag,attrs as IDomNode,compInst as IComponent);
        }else{
            //八:createElement(descriptor:INodeDescriptor,container,comp);
            return createDescriptor(tag as INodeDescriptor,attrs as IDomNode,compInst as IComponent);
        }
        
    }else {throw new Error("不正确的参数");}
}

function createDescriptor(descriptor:INodeDescriptor,container:IDomNode,comp:IComponent){

    let elem :IDomNode;
    //没有tag，就是文本
    if(!descriptor.tag && !descriptor.Component){
        return createText(descriptor.content,container,comp);
    }
    if(descriptor.tag){
        let componentType = componentTypes[descriptor.tag as string];
        if(componentType){ 
            descriptor.Component = componentType;
            
        }else {
            elem = createDom(descriptor,container,comp);
            //if(container) DomUtility.appendChild(container,elem);
            return elem;
        }
    }
    let elems = createComponent(descriptor.Component as any,descriptor,container);
    return elems;
}


export let createElement:(
    tag:string | Function | INodeDescriptor | any[]
    ,attrs?:{[name:string]:any}|IDomNode
    ,vmOrCtnrOrFirstChild?:IDomNode|any
    ,...otherChildren:any[]
)=>IDomNode|IDomNode[] = _createElement as any;

function createText(value:any,container:IDomNode,compInstance:IComponent){
    let elem:IDomNode;
    if(Observable.isObservable(value)){
        elem = DomUtility.createText(value.get(ObservableModes.Value));
        value.subscribe(e=>DomUtility.setContent(elem,e.value),compInstance);
    }else{
        elem = DomUtility.createText(value);
    }
    if(container) DomUtility.appendChild(container,elem);
        return elem;
}

export function createElements(arr:any[],container:IDomNode,compInstance:IComponent):IDomNode[]{
    let rs = [];
    for(const child of arr){
        let node = _createElement(child,container,compInstance); 
        if(is_array(node)){
            for(const cn of node as any) rs.push(cn);
        }else rs.push(node);
    }
    return rs;
}


function createDom(descriptor:INodeDescriptor,parent?:IDomNode,compInstance?:IComponent):IDomNode{
    let elem = DomUtility.createElement(descriptor.tag as string);
    if(parent) DomUtility.appendChild(parent,elem);
    let ignoreChildren:boolean = false;
    //let anchorElem = elem;
    for(let attrName in descriptor){
        //不处理有特殊含义的属性
        if(attrName==="tag" || attrName==="children" || attrName ==="content") continue;
        
        let attrValue= descriptor[attrName];
        if(attrName==="if"){
            bindDomIf(elem,attrValue,descriptor,compInstance);
            continue;
        }
        if(attrName==="for"){
            bindDomFor(elem,attrValue,descriptor,compInstance);
            ignoreChildren=true;
            continue;
        }

        let match = attrName.match(evtnameRegx);
        if(match && elem[attrName]!==undefined && attrValue){
            let evtName = match[1];
            if(bindDomEvent(elem,evtName,attrValue,descriptor,compInstance)) continue;
        }
        
        if(attrName==="class") attrName = "className";
        if(bindDomAttr(elem,attrName,attrValue,descriptor,compInstance)===RenderDirectives.IgnoreChildren) ignoreChildren=true;
    }
    if(ignoreChildren) return elem;
    if(descriptor.content){
        if(descriptor.content instanceof Computed){
            let txtElem = DomUtility.createText(descriptor.content.getValue(compInstance),elem);
            descriptor.content.bindValue((val)=>{
                DomUtility.setContent(txtElem,val)
            },compInstance);
        } if(Observable.isObservable(descriptor.content)){
            let ob = descriptor.content as Observable<any>;
            let txtElem = DomUtility.createText(ob.get(ObservableModes.Value),elem);
            ob.subscribe(e=>DomUtility.setContent(txtElem,e.value),compInstance);
        }else {
            let txtElem = DomUtility.createText(descriptor.content,elem);
        }
        
    }
    let children = descriptor.children;
    if(!children || children.length===0) return elem;
    createElements(children,elem,compInstance);
    return elem;
}

function bindDomFor(elem:IDomNode,bindValue:any,vnode:INodeDescriptor,compInstance:IComponent){
    //if(component) throw new Error("不支持Component上的for标签，请自行在render函数中处理循环");
    let arr = bindValue[0];
    if(arr instanceof ObservableProxy) arr = arr.get(ObservableModes.Observable);
    let valVar = bindValue[1];
    let keyVar = bindValue[2];
    let each :Function;
    if(Observable.isObservable(arr)){
        
        arr.subscribe((e:IChangeEventArgs<any>)=>{
            let arr = e.sender;
            DomUtility.removeAllChildren(elem);
            
            for(let key in arr)((key,value)=>{
                if(key==="constructor") return;
                if(keyVar) keyVar.set(key);
                if(valVar) valVar.set(value);
                
                let renderRs = createElements(vnode.children,elem,compInstance);
                if(value instanceof Observable){
                    value.subscribe((e:IChangeEventArgs<any>)=>{
                        if(e.type=== ChangeTypes.Remove){
                            for(let subElem of renderRs) {
                                DomUtility.remove(subElem);
                            }
                        }
                    },compInstance);
                }
            })(key,arr[key]);
        });
    }
    for(let key in arr)((key,value)=>{
        if(key==="constructor") return;
        if(keyVar) keyVar.set(key);
        if(valVar) valVar.set(value);
        let renderRs = createElements(vnode.children,elem,compInstance);
        if(value instanceof Observable){
            value.subscribe((e:IChangeEventArgs<any>)=>{
                if(e.type=== ChangeTypes.Remove){
                    for(let subElem of renderRs) {
                        DomUtility.remove(subElem);
                    }
                }
            },compInstance);
        }
    })(key,arr[key]);
    return RenderDirectives.IgnoreChildren;
}

function bindDomIf(elem:IDomNode,bindValue:any,vnode:INodeDescriptor,compInstance:IComponent){
    let placeholder = DomUtility.createPlaceholder();
    Object.defineProperty(elem,"$__placeholder__",{enumerable:false,writable:false,configurable:false,value:placeholder});

    if(Observable.isObservable(bindValue)){
        bindValue.subscribe((e)=>{
            if(e.value){
                DomUtility.replaceNode(placeholder,elem);
            }else DomUtility.replaceNode(elem,placeholder);
        },compInstance);
        bindValue = bindValue.get(ObservableModes.Default);
    }
    if(!bindValue){DomUtility.replaceNode(elem,placeholder);};
}
//把属性绑定到element上
export function bindDomAttr(element:IDomNode,attrName:string,attrValue:any,vnode:INodeDescriptor,compInstance:IComponent){
    if(attrValue instanceof ObservableProxy) attrValue = attrValue.get(ObservableModes.Observable);
    let binder:Function = attrBinders[attrName];
    let bindResult:any;
    //计算表达式
    if(attrValue instanceof Computed){
        if(binder){
            attrValue.bindValue((val)=>binder.call(compInstance,element,val,compInstance),compInstance);
        }else {
            attrValue.bindValue((val)=>DomUtility.setAttribute(element,attrName,val),compInstance);
        }
        
    } else{
        if(binder) bindResult= binder.call(compInstance,element,attrValue,vnode,compInstance);
        else if(attrValue instanceof Observable){
            DomUtility.setAttribute(element,attrName,attrValue.get(ObservableModes.Value));
            attrValue.subscribe((e)=>DomUtility.setAttribute(element,attrName,e.value),compInstance);
        }
        else DomUtility.setAttribute(element,attrName,attrValue);
    }
    return bindResult;
}

function bindDomEvent(element:IDomNode,evtName:string,params:any,vnode:INodeDescriptor,compInstance:IComponent):boolean{
    let handler= params;
    let t = typeof params;
    let pars;
    if(t==="function"){
        handler = params;
        params=null;
    }else if(is_array(params)&& params.length>0){
        handler = params[0];
        if(typeof handler!=="function"){
            return false;
        } 
        pars=[];
        for(let i = 1,j=params.length;i<j;i++){
            let par = params[i];
            if(par instanceof ObservableProxy) pars.push(par.get(ObservableModes.Default));
            else pars.push(par);
        }
    }else return false;
    let finalHandler = function(e){
        e = e||window.event;
        let self = compInstance || this;
        //YA.EVENT = e;
        if(!params){
            handler.call(self,e);
        }else{
            let args=[];
            for(let i=0,j=pars.length;i<j;i++){
                let par = pars[i];
                if(par===YA.EVENT){args.push(e);}
                else args.push(par);
            }
            handler.apply(self,args);
        } 
        if(compInstance)for(let n in compInstance){
            let member = compInstance[n];
            if(member instanceof Observable) member.update();
        }
    };
    DomUtility.attach(element,evtName,finalHandler);
    return true;
}
export let EVENT:any = {};

export function createComponent(componentType:any,descriptor:INodeDescriptor,container?:IDomNode):IDomNode[]|IDomNode{
    
    //获取到vnode，attr-value得到的应该是schema
    let compInstance :any;
    let renderResult:any;
    let renderFn:any = componentType;
    let xmode = _jsxMode;
    let omode = Observable.accessMode;
    let ifAttrValue;
    try{
        _jsxMode = JSXModes.vnode;
        Observable.accessMode = ObservableModes.Proxy;
        compInstance = new componentType(descriptor,container);
        // object-component
        if(typeof compInstance.render==='function'){
            //确定component有dispose函数
            if(typeof compInstance.dispose!=="function"){
                disposable(compInstance);
            }

            //绑定属性
            for(const propname in descriptor){
                if(propname==="tag" || propname==="children") continue;
                if(propname==="if") {
                    ifAttrValue = descriptor[propname];
                    continue;
                }
                bindComponentAttr(compInstance,propname,descriptor[propname]);
            };
            renderFn = compInstance.render;
            Observable.accessMode = ObservableModes.Proxy;
            renderResult = renderFn.call(compInstance,descriptor,container);
        }else {
            renderResult = compInstance;
            compInstance= undefined;
        }
    }finally{
        _jsxMode = xmode;
        Observable.accessMode = omode;
    }


    let elems = handleRenderResult(renderResult,compInstance,renderFn,descriptor,container);
    if(compInstance) Object.defineProperty(compInstance,"$__elements__",{enumerable:false,configurable:false,writable:false,value:elems});
    //绑定if属性
    if(ifAttrValue) bindComponentIf(compInstance,ifAttrValue,elems,container);
    //每个创建的控件都要定期做垃圾检查
    if(compInstance) ComponentGarbage.singleon.attech(compInstance);
    return elems;
}

function bindComponentIf(compInstance:IComponent,bindValue:any,elems:any,container:IDomNode){
    let placeholder = DomUtility.createPlaceholder();
    let isArr = is_array(elems);
    if(isArr){
        for(const elem of elems) Object.defineProperty(elem,"$__placeholder__",{enumerable:false,writable:false,configurable:false,value:placeholder});
    }else{
        Object.defineProperty(elems,"$__placeholder__",{enumerable:false,writable:false,configurable:false,value:placeholder});
    }
    
    if(Observable.isObservable(bindValue)){
        bindValue.subscribe((e)=>{
            if(e.value){
                let p = DomUtility.getParent(placeholder);
                if(p){
                    if(isArr){
                        for(const elem of elems){
                            DomUtility.insertBefore(elem,placeholder);
                            DomUtility.remove(placeholder);
                        }
                    }else{
                        DomUtility.replaceNode(elems,placeholder);
                    }
                }
            }else {
                if(isArr){
                    let inserted = false;
                    for(const elem of elems){
                        if(!inserted){ DomUtility.insertAfter(placeholder,elem);inserted =true;}
                        DomUtility.remove(elem);
                    }
                }else{
                    DomUtility.replaceNode(elems,placeholder);
                }
            }
        },compInstance);
        bindValue = bindValue.get(ObservableModes.Default);
    }
    if(!bindValue){
        if(isArr){
            let inserted = false;
            for(const elem of elems){
                if(!inserted){ DomUtility.insertAfter(placeholder,elem);inserted =true;}
                DomUtility.remove(elem);
            }
        }else{
            DomUtility.replaceNode(elems,placeholder);
        }
    };
}



/**
 * 
 *
 * @param {IViewModel} viewModel
 * @param {IComponent} subComponent
 * @param {string} subAttrName
 * @param {*} bindValue
 */
function bindComponentAttr(compInstance:IComponent,propName:string,propValue:any){
    //找到组件的属性
    let prop = compInstance[propName];
    // TODO:找到组件名
    let componentName = "Component";
    
    if(prop){
        if(Observable.isObservable(prop)){
            let meta:IComponentInfo = compInstance.$_meta || {};
            //获取属性的类型
            let propType :ReactiveTypes = meta.reactives?meta.reactives[propName].type:ReactiveTypes.In;
            let isOb = Observable.isObservable(propValue);
            if(propType===ReactiveTypes.In){
                if(isOb) prop.set(propValue.get(ObservableModes.Value));
                else prop.set(propValue);
            }else if(propType==ReactiveTypes.Out){
                if(isOb){
                    prop.subscribe((e)=>{
                        propValue.set(e.value);
                        propValue.update();
                    },propValue.$root.$extras);
                }else {
                    console.warn(propValue + "传入的不是observable,out未能绑定，不能联动");
                }
            }else if(propType==ReactiveTypes.Parameter){
                if(isOb){
                    prop.subscribe((e)=>{
                        propValue.set(e.value);
                        propValue.update();
                    },propValue.$root.$extras);
                    propValue.subscribe((e)=>{
                        prop.set(e.value);
                        prop.update();
                    },prop.$root.$extras);
                    prop.set(propValue.get(ObservableModes.Value));
                }else{
                    prop.set(propValue);
                    console.warn(propValue + "传入的不是observable,paremeter未能绑定，不能联动");
                }
            }else {
                console.warn(`${propName}是私有类型,外部传入的未赋值`);
            }
        }else {
            if(Observable.isObservable(propValue)){
                compInstance[propName] = propValue.get(ObservableModes.Value);
                propValue.subscribe(e=>compInstance[propName] =e.value,compInstance);
            }else {
                compInstance[propName] = propValue;
            }
        }
    }
}



function handleRenderResult(renderResult:any,instance:any,renderFn:any,descriptor:INodeDescriptor,container:IDomNode){
    
    let isArray = is_array(renderResult);
    
    let resultIsElement = false;
    
    if(isArray){
        for(const val of renderResult){
            resultIsElement = DomUtility.isElement(renderResult,true);
            break;
        }
        isArray = true;
    }else {
        resultIsElement = DomUtility.isElement(renderResult,true);
    }
    if(resultIsElement){
        if(container){
            if(isArray) for(const elem of renderResult) DomUtility.appendChild(container,elem);
            else DomUtility.appendChild(container,renderResult);
        }
        return renderResult;
    }else {
        let renderNode = renderResult;
        if(isArray){
            let result :IDomNode[] =[];
            for(const vnode of renderNode){
                let elem = createElement(vnode,container,instance) as IDomNode;
                //if(container) DomUtility.appendChild(container,elem);
                result.push(elem);
            }
            renderResult = result;
        }else {
            renderResult = createDescriptor(renderNode,container,instance) as IDomNode;
        }
        
        return renderResult;
    }
    
}



export interface IComputedExpression{
    lamda:Function;
    parameters:any[];
}

class Computed extends Subject<IChangeEventArgs<any>> implements IObservable<any>{
    $type:any;
    constructor(public lamda:Function,public parameters:any[]){
        super();
        if(!this.parameters) this.parameters = [];
    }
    get(mode?:ObservableModes){
        if(mode===undefined) mode = Observable.accessMode;
        if(mode===ObservableModes.Proxy || mode===ObservableModes.Observable)return this;
        let args = [];
        for(let dep of this.parameters){
            let ob:Observable<any>;
            if(Observable.isObservable(dep)) ob = dep;

            if(ob) args.push(ob.get(ObservableModes.Value));
            else args.push(dep);
        }
        return this.lamda.apply(undefined,args);
    }
    set(value:any):any{
        return this;
    }
    update():boolean{return true;}
    subscribe(topic:string|{(evt:IChangeEventArgs<any>):any},listener?:{(evt:any):any}|IDisposable,disposible?:IDisposable):ISubject<any>{
        //let args = [];
        let fn:Function;
        let handler:Function;
       
        for(let dep of this.parameters){
            if(Observable.isObservable(dep)){
                
                if(!fn){
                    fn = (e:IChangeEventArgs<any>)=>{
                        let value = this.get(ObservableModes.Default);
                        let evt = {value:value,sender:e.sender,type:ChangeTypes.Computed};
                        handler.call(this,evt);
                    };
                    if(typeof topic ==="function"){
                        handler = topic;
                        topic = fn as any;
                    }else{
                        handler = listener as any;
                        listener = fn as any;
                    }
                    Object.defineProperty(fn,"$__computed_raw__",{enumerable:false,writable:false,configurable:false,value:handler});
                }
                dep.subscribe.call(dep,topic,listener,disposable);
            }
        }
        return this;
    }
    unsubscribe(topic:string|{(evt:IChangeEventArgs<any>):any},listener?:{(evt:IChangeEventArgs<any>):any}):ISubject<any>{
        if(listener===undefined) {
            listener = topic as {(evt:IChangeEventArgs<any>):any};
            topic="";
        }
        let topics = this.$__topics__,handlers = topics[topic as string];
        if(!handlers) return this;
        for(let i =0,j=handlers.length;i<j;i++){
            let existed = handlers.shift();
            if(existed.$__computed_raw__!==listener) handlers.push(existed);
        }
        return this;
    }
    fulfill(topic:string|any,evtArgs?:any):ISubject<any>{
        throw "not implement";
        return this;
    }
    getValue(compInstance:IComponent){
        let args = [];
        for(let dep of this.parameters){
            let ob:Observable<any>;
            if(Observable.isObservable(dep)) ob = dep;

            if(ob) args.push(ob.get(ObservableModes.Value));
            else args.push(dep);
        }
        return this.lamda.apply(compInstance,args);
    }
    bindValue(setter:(val:any)=>any,compInstance:IComponent){
        for(let ob of this.parameters){
            if(Observable.isObservable(ob)) ob.subscribe(e=>{
                setter(this.getValue(compInstance));
            },compInstance);
        }
    }
}


function createComputed(){
    let pars = [];
    for(let i=1,j=arguments.length;i<j;i++) pars.push(arguments[i]);
    return new Computed(arguments[0],pars);
}

export let computed:(...args:any[])=>IComputedExpression = createComputed as any;

export function not(param:any,strong?:boolean) {
    return strong?new Computed((val)=>is_empty(val),[param]):new Computed((val)=>!val,[param]);
}


let evtnameRegx = /on([a-zA-Z_][a-zA-Z0-9_]*)/;








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


export interface IComponentInfo {
    reactives?:{[prop:string]:IReactiveInfo};
    
    ctor?:TComponentType;
    wrapper?:TComponentType;
    tag?:string;
    render?:Function;
    inited?:boolean;
    explicit?:boolean;
}

export interface IComponent extends IDisposable{
    $_meta:IComponentInfo;
    
    render(container?:IDomNode,descriptor?:INodeDescriptor):IDomNode|IDomNode[]|INodeDescriptor|INodeDescriptor[];
    $__elements__:IDomNode | IDomNode[];
    $__placeholder__:IDomNode;

}
export type TComponentCtor = {new (...args:any[]):IComponent};
export type TComponentType = TComponentCtor & {$meta:IComponentInfo,prototype:{$meta:IComponentInfo}};
export interface IDisposeInfo{
    activeTime?:Date;
    inactiveTime?:Date;
    checkTime?:Date;
}




export let componentTypes : {[tag:string]:TComponentType}={};

function inherits(extendCls, basCls) {
    function __() { this.constructor=extendCls;}
    extendCls.prototype = basCls === null ? Object.create(basCls) : (__.prototype = basCls.prototype, new __());
}



///组件的垃圾释放机制

export class ComponentGarbage{
    static singleon:ComponentGarbage;
    private _toBeChecks:IComponent[];
    private _tick;
    constructor(){
        if(ComponentGarbage.singleon!==undefined){
            throw new Error("ComponentGarbage只能单例运行");
        }
        ComponentGarbage.singleon = this;
        this._toBeChecks =[];
        let clear = ()=>{
            clearGarbage(this._toBeChecks,ComponentGarbage.periodicClearCount) ;
            this._tick = setTimeout(clear, ComponentGarbage.interval);           
        };
        this._tick = setTimeout(clear, ComponentGarbage.interval);   
    }
    /**
     * 所有render过的组件都应该调用该函数
     *
     * @type {IComponent[]}
     * @memberof ComponentGarbageDisposer
     */
    
    attech(component:IComponent):ComponentGarbage{
        //没有dispose函数的进到垃圾释放器里面来也没用，反而占内存
        //已经释放掉的也不用进来了
        if(component.dispose && !component.$isDisposed) this._toBeChecks.push(component);
        return this;
    }

    /**
     * 如果写了参数compoent,就是要手动把某个组件从垃圾回收中，要从垃圾释放器中移除掉
     * 如果不写参数，表示执行释放任务
     * @param {IComponent} component
     * @returns {ComponentAutoDisposer}
     * @memberof ComponentGarbageDisposer
     */
    detech(component?:IComponent):ComponentGarbage{
        for(let i =0,j=this._toBeChecks.length;i<j;i++){
            let existed:IComponent = this._toBeChecks.shift();
            // 如果相等或则已经dispose掉了，就不再进入队列了
            if(existed===component || existed.$isDisposed) continue;
            this._toBeChecks.push(existed);
        }
        return this;
    }

    /**
     * 手动释放垃圾
     *
     * @returns {ComponentAutoDisposer}
     * @memberof ComponentAutoDisposer
     */
    clear():ComponentGarbage{
        clearGarbage(this._toBeChecks,this._toBeChecks.length);
        return this;
    }

    static interval:number = 1000*30;
    static periodicClearCount = 200;
}

ComponentGarbage.singleon = new ComponentGarbage();

function clearGarbage(components:IComponent[],count:number):number{
    
    for(let i =0,j=Math.min(count,components.length);i<j;i++){
        let existed:IComponent = components.shift();
        // 如果相等或则已经dispose掉了，就不再进入队列了
        if(existed.$isDisposed) {continue;}
        //垃圾判定
    
        if(!checkGarbage(existed)){
            components.push(existed);continue;
        }
        if(typeof existed.deteching==="function"&&existed.deteching()===false) {
            components.push(existed);continue;
        }
        if(typeof existed.dispose ==="function"){
            existed.dispose(false);
        }
        
    }
    return count;
}

function checkGarbage(comp:IComponent){
    
    if(!comp || !comp.$__elements__) return true;
    if(DomUtility.isElement(comp.$__elements__,true)){
        let elem = comp.$__elements__ as any;
        if(DomUtility.is_inDocument(elem)) return false;
        else if((elem as any).$__placeholder__ && DomUtility.is_inDocument(elem.$__placeholder__)) return false;
        return true;
    }else if((comp.$__elements__ as IDomNode[]).length){
        for(let i =0,j=(comp.$__elements__ as IDomNode[]).length;i<j;i++){
            let elem = comp.$__elements__[i];
            if(DomUtility.is_inDocument(elem)) return false;
            else if(elem.$__placeholder__ && DomUtility.is_inDocument(elem.$__placeholder__)) return false;
        }
        return true;
    }
    
}




export enum RenderDirectives{
    Default,
    IgnoreChildren,
    Replaced
}

export class Placeholder{
    constructor(public replace:any,public before?:any,public after?:any){}
}


export let attrBinders:{[name:string]:(elem:IDomNode,bindValue:any,vnode:INodeDescriptor,compInstance:IComponent)=>any}={};

attrBinders.value = function(elem:IDomNode,bindValue:any,vnode:INodeDescriptor,compInstance:IComponent){
    if(Observable.isObservable(bindValue)){
        DomUtility.setValue(elem,bindValue.get(ObservableModes.Value));
        bindValue.subscribe((e:IChangeEventArgs<any>)=>{
            DomUtility.setValue(elem,e.value);
        },compInstance);
    }else{
        DomUtility.setValue(elem,bindValue);
    }
}

attrBinders["b-value"] = function(elem:IDomNode,bindValue:any,vnode:INodeDescriptor,compInstance:IComponent){
    if(Observable.isObservable(bindValue)){
        DomUtility.setValue(elem,bindValue.get(ObservableModes.Value));
        bindValue.subscribe((e:IChangeEventArgs<any>)=>{
            DomUtility.setValue(elem,e.value);
        },compInstance);
        DomUtility.change(elem,(value)=>{
            bindValue.set(value);
            bindValue.update();
        });
    }else{
        DomUtility.setValue(elem,bindValue);
    }
}


export let styleConvertors :any= {};

let unitRegx = /(\d+(?:.\d+))(px|em|pt|in|cm|mm|pc|ch|vw|vh|\%)/g;
styleConvertors.left = styleConvertors.right = styleConvertors.top = styleConvertors.bottom = styleConvertors.width = styleConvertors.height = function (value:any) {
    if(!value) return "0";
    if(typeof value==="number"){
        return value + "px";
    }else return value;
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

export function toJson(obj:any){
    if(Observable.isObservable(obj)) obj = obj.get(ObservableModes.Value);
    return JSON.stringify(obj);
}




//=======================================================================
let YA={
    Subject,Disposable, ObservableModes,observableMode,proxyMode,Observable,ObservableObject,ObservableArray, ObservableSchema
    ,observable,enumerator
    ,createElement,createDescriptor,createElements,createComponent,EVENT
    ,attrBinders,componentInfos: componentTypes
    ,not,computed
    ,DomUtility: DomUtility,styleConvertors
    ,intimate: implicit,clone,Promise,trim,is_array,is_assoc,is_empty,toJson,queryString
    
};
if(typeof window!=='undefined') (window as any).YA = YA;
export default YA;





