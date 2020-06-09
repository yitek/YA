import { array_remove, extend } from "./YA.core";

declare const Proxy;
if(typeof Proxy==="undefined") throw new Error("YA框架使用了当前浏览器不支持的内置对象Proxy");

////////////////////////////////////////////////////////////////////////////////////
//
// 类型判断
//

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

export class Exception extends Error{
    constructor(opts){
        if(opts){
            super(opts.message || opts);
            if(typeof opts!=="string") extend(this,opts);
        }else {
           super(opts); 
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////
//
// Object.defineProperty的一些辅助函数
//


/**
 * 隐式成员
 * 批量设置 {enumerable:false,configurable:false,writable:true,value:??}
 *
 * @param {*} target
 * @param {*} props
 */
function implicit(target?,props?,applyFunc?:boolean){
    let make = function(target,name?,applyFunc?:boolean){
        //如果放在函数上，就是对函数的prototype做设置
        let proto = typeof target==="function"?(applyFunc?target:target.prototype):target;
        if(name!==undefined){
            let t = typeof name;
            if(t==="string"){
                // @implicit放在成员上
                // implicit({},"prop") 调用
                Object.defineProperty(proto,name,{configurable:false,writable:true,enumerable:false,value:proto[name]});
            }else if(t==="object"){
                if(is_array(name)){
                    // implicit({},["prop1","prop2"])用法
                    for(const i in name){
                        let n = name[i];
                        Object.defineProperty(proto,n,{configurable:false,writable:true,enumerable:false,value:proto[n]});
                    }
                }else{
                    // implict({},{"prop":initValue})用法
                    for(const n in name){
                        Object.defineProperty(proto,n,{configurable:false,writable:true,enumerable:false,value:name[n]});
                    }
                }
            }
            
        }else {
            for(let n in proto){
                Object.defineProperty(proto,n,{configurable:false,writable:true,enumerable:false,value:proto[n]});
            }
        }
        return target;
    }
    //@implicit放在属性位置
    if(target===undefined) return make;
    //普通函数调用
    return make(target,props,applyFunc);
}




let _seed;
function ain(){
    if(++_seed>2100000000) _seed = -210000000;
    return _seed;
}
const Undefined = {};
////////////////////////////////////////////////////////////////////////////////////
//
// Fulfill
//
export enum FulfillStates{
    padding,
    fulfilled,
    rejected
}
export class Fulfill{
    private $__YA_fulfill_status__:FulfillStates;
    private $__YA_fulfill_value__:any;    
}




export interface IDisposable{
    dispose(listenerOrEvent?:any):IDisposable;
}

////////////////////////////////////////////////////////////////////////////////////
//
// 监听者模式
//
export interface ISubject{

}



@implicit()
export class Subect{
    private $__YA_topics__:{[topic:string]:{(evt:any):any}[]};
    subscribe(topic:string|{(evt:any):any},listener:{(evt:any):any}|IDisposable|string,disposeOwn?:string|IDisposable){
        let t = typeof topic;
        if(t === "function"){
            disposeOwn = listener as IDisposable;
            listener = topic as (evt:any)=>any;
            topic = "";
        } if(t==="string"){
            const lt = typeof listener;
            if(lt==="string"){
                if(!disposeOwn) throw new Error("参数类型不正确,最后一个参数必须是对象:subscribe(string,string,object)");
                listener = disposeOwn[listener as string];
                if(typeof listener!=="function") throw new Error("未能在disposeOwn上找到相关属性");
            }
        }
        
        let topics = this.$__YA_topics__;
        if(!topics) Object.defineProperty(this,"$__YA_topics__",{enumerable:false,writable:false,configurable:false,value:topics=this.$__YA_topics__={}});
        let listeners = topics[topic];
        if(listeners){
            //终值检查
            let fulfillStatus = (listeners as any).$fulfill_status;
            if (fulfillStatus){
                (listener as (evt:any)=>any).call(this,(listeners as any).$fulfill_value);
                return this;
            }
        }else{
            listeners=topics[topic]=[];
        }
        listeners.push(listener as (evt:any)=>any);
        if(disposeOwn && typeof disposeOwn.dispose ==="function"){
            let onDispose = ()=>array_remove(listeners,listener);

            disposeOwn.dispose(onDispose);
        }
        return this;
    }
    unsubscribe(topic:string|{(evt:any):any},listener:{(evt:any):any}|IDisposable):Subect{
        if(typeof topic === "function"){
            disposeOwn = listener as IDisposable;
            listener = topic as (evt:any)=>any;
            topic = "";
        }
        let topics = this.$__YA_topics__;
        if(!topics) Object.defineProperty(this,"$__YA_topics__",{enumerable:false,writable:false,configurable:false,value:topics=this.$__YA_topics__={}});
        let listeners = topics[topic];

        return this;
    }
}
////////////////////////////////////////////////////////////////////////////////////
//
// YA.Observable
//
enum ObservableModes{
    Default,
    Value,
    Raw,
    Observable,
    Proxy,
    Agent,
    //--------

    /**
     * 设置值之后立即触发更新
     */
    Imediately,
}
enum ObservableTypes{
    Value,
    Object,
    Array
}
interface IObservable{
    $ob_target:any;
    $ob_name:string;
    $ob_value:any;
    $ob_Type:ObservableTypes;
}
@implicit()
export class Observable{

    /**
     * 当前的值，外部用$ob_value
     * 在事件对象中的old就是取该值
     * 可能与$__ob_target__[$__ob_name__]的值不一致
     * 因为$__ob_target__会因为父级对象的赋值而变更
     * @private
     * @memberof Observable
     */
    private $__ob_value__;

    /**
     * 修改的值，即set赋予的值
     * update后该字段会被清空，并将其值移到$__ob_value__
     *
     * @private
     * @memberof Observable
     */
    private $__ob_modified__;
    
    /**
     * 该值存放在哪个对象上
     *
     * @private
     * @memberof Observable
     */
    private $__ob_target__;

    /**
     * 该值存放在对象上的属性名
     *
     * @private
     * @memberof Observable
     */
    private $__ob_name__;

    /**
     * 一个observable代表一个值
     * 该值存放在哪个对象上
     * @memberof Observable
     */
    $ob_target;

    /**
     *  该值存放在对象的属性名
     *
     * @memberof Observable
     */
    $ob_name;

    /**
     * 当前确定的值
     * 一般是target[name],但当修改target/name时，他们之间会不一致
     *
     * @memberof Observable
     */
    $ob_value;
    $ob_proxy;
    $ob_own;
    $ob_type:ObservableTypes;
    constructor(value,name,target){
        if(name===undefined) name = "OB-"+ain();
        let obType = ObservableTypes.Value;
        if(typeof value==="object"){
            if(is_array(value)) obType = ObservableTypes.Array;
            else obType = ObservableTypes.Object;
        }
        implicit(this,{
            $ob_name : name
            ,$ob_type : obType
            ,$__ob_target__:target||{}
            ,$__ob_value__ : undefined
            ,$__ob_modified__ :undefined
        });
        
    }
    
    get(mode?:ObservableModes){
        if(mode===undefined) mode = Observable.gettingMode;
        if(mode===ObservableModes.Default || mode===ObservableModes.Value){
            let value = this.$__ob_modified__;
            if(value===undefined){
                value = this.$__ob_value__;
                if(value===undefined){
                    value = this.$ob_target[this.$__ob_name__];
                    this.$__ob_value__ = value===undefined?Undefined:value;
                    return value;
                }
            }
            return value===Undefined?undefined:value;
        }else if(mode===ObservableModes.Raw){
            return this.$ob_target[this.$__ob_name__];
        }
        return this;
    }
    set(value,mode?:ObservableModes):Observable{
        let old = this.$ob_value;if(old===Undefined) old=undefined;
        if(value===old) return this;
        this.$__ob_modified__ = value===undefined?Undefined:value;
        if(mode===undefined) mode = Observable.settingMode;
        if(mode===ObservableModes.Imediately || mode===ObservableModes.Default){
            this.update();
        }
    }
    update(src?:any):Observable{
        if(this.$__ob_modified__===undefined) return this;
        let old = this.$ob_value;
        let value = this.$__ob_modified__;if(value===Undefined) value=undefined;
        let evtArgs = {
            value:value
            ,old:old
            ,sender:this
            ,src:src===undefined?this:src
        };
        //清除掉修改的值
        this.$__ob_modified__=undefined;
        //设置当前的确定的值
        this.$__ob_value__ = this.$ob_target[this.$ob_name] = value;
        //发送通知
        return this;
    }
    asObject(){
        if(this.$ob_proxy) return this.$ob_proxy;
        let proxy = new Proxy(this,ProxyHandle);
        Object.defineProperty(this,"$ob_proxy",{enumerable:false,configurable:false,writable:false,value :proxy});
        return proxy;

    }
    defineProperty(name:string,value?:any){
        let privateName = `$m__${name}__`;
        Object.defineProperty(this,name,{
            get:()=>{
                let propOb = this[privateName];
                if(!propOb){
                    propOb = new Observable(value,this.get(),name);
                    Object.defineProperty(this,privateName,{enumerable:true,configurable:false,writable:false,value:propOb});
                }
                return propOb.get();
            }
        });
    }

    /**
     * ObservableObject.set(value)的时候，会更新所有的成员
     *
     * @param {*} target
     * @memberof Observable
     */
    _resetTarget(target:any,name:string,mode?:ObservableModes):Observable{
        let currentTarget = this.$ob_target;
        if(target instanceof Observable){
            this.$ob_own = target;target = target.get(ObservableModes.Value);
        }
        //如果一致，就不用做什么额外的操作
        if(currentTarget==target) return this;
        let old = this.$ob_value;
        let value = target[this.$ob_name];
        //替换后得到的值跟原先的值一样，就什么都不做
        if(old===value) return this;
        //注意:这里灭有修改 $__ob_value__的值，该字段还保留着原先的对象上的值
        this.$__ob_modified__=value;
        if(mode===undefined) mode = Observable.settingMode;
        if(mode===ObservableModes.Imediately || mode===ObservableModes.Default){
            this.update();
        }
        return this;
    }
    _resetName(name:string,mode?:ObservableModes){
        let oldname = this.$__ob_name__;
        if(name===oldname) return this;
        this.$__ob_name__ = name;
        

    }
    static gettingMode:ObservableModes=ObservableModes.Default;
    static settingMode:ObservableModes=ObservableModes.Default;
}
//target如果是observable，它会延迟加载
Object.defineProperty(Observable.prototype,"$ob_target",{
    enumerable:false,configurable:false,
    get:function(){
        let value = this["$__ob__target__"];
        if(isObservable(value)){
            value = this["$__ob__target__"] = value.get(ObservableModes.Value);
        }
        return value;
    }
    ,set:function(value){
        let prop = Object.getOwnPropertyDescriptor(this,"$__ob__target__");
        if(!prop || prop.enumerable)Object.defineProperty(this,"$__ob__target__",{
            enumerable:false,configurable:false,value:value
        });else {
            console.warn("做了一个危险的操作，直接替换掉了observable.$ob_target,极大可能引起未知错误"); 
            this["$__ob__target__"]=value;
        }
    }
});
function isObservable(obj){
    let rs = obj instanceof Observable;
    return rs;
}
const ObservableObject={
    get:function(mode?:ObservableModes){
        if(mode===undefined) mode = Observable.gettingMode;
        if(mode===ObservableModes.Default || mode===ObservableModes.Proxy){
            return this.$ob_proxy;
        }else if(mode===ObservableModes.Value){
            if(this.$__ob_value__===undefined){
                return this.$ob_target[this.$__ob_name__];
            }
            return this.$__ob_value__;
        }
        return this;
    }
    ,set:function(value,mode?:ObservableModes):Observable{
        let old = this.$ob_target[this.$__ob_name__];
        value || (value ={});
        if(value===old) return this;
        this.$__ob_value__ = value;
        if(mode===undefined) mode = Observable.settingMode;
        if(mode===ObservableModes.Imediately || mode===ObservableModes.Default){
            this.update();
        }
        for(let n in this){
            let obProp = this[n];
            if(obProp instanceof Observable){
                obProp.$ob_target = value;
            }
        }
    }
}
const ProxyHandle = {
    get:(target,name)=>{
        
        let exist = target[name];
        if(!exist){
            exist = target.defineProperty(name);
        }
        return exist.get();
    }
    ,set:(target,name,value)=>{
        let exist = target[name];
        if(!exist){
            exist = target.defineProperty(name,value);
            return;
        }
        return exist.set(value);
    }
}
