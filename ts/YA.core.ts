
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

//===============================================================================

export interface IObservable<TEvtArgs>{
    $_listeners:Function[];
    $subscribe:(listener:(evt:TEvtArgs)=>any)=>IObservable<TEvtArgs>;
    $unsubscribe:(listener:(evt:TEvtArgs)=>any)=>IObservable<TEvtArgs>;
    $notify:(evt:TEvtArgs)=>IObservable<TEvtArgs>;
}



export function valueObservable<TEvtArgs>(target:any):IObservable<TEvtArgs>{
    target.$subscribe = function(listener:(evt:IChangeEventArgs)=>any):IObservable<TEvtArgs>{
        (this.$_listeners||(this.$_listeners=[])).push(listener);
        return this;
    }
    target.$unsubscribe = function(listener:(evt:IChangeEventArgs)=>any):IObservable<TEvtArgs>{
        if(!this.$_listeners)return this;
        for(let i =0,j=this.$_listeners.length;i<j;i++){
            let existed = this.$_listeners.shift();
            if(existed!==listener) this.$_listeners.push(existed);
        }
        return this;
    } 
    target.$notify = function(evt:IChangeEventArgs):IObservable<TEvtArgs>{
        let listeners = this.$_listeners;
        if(!listeners|| listeners.length===0) return this;
        for(const i in listeners){
            listeners[i].call(this,evt);
        }
        return this;
    }
    return defineMembers(target) as IObservable<TEvtArgs>;
}
export class Observable<TEvtArgs> implements IObservable<TEvtArgs>{
    $_listeners:Function[];
    $subscribe:(listener:(evt:TEvtArgs)=>any)=>IObservable<TEvtArgs>;
    $unsubscribe:(listener:(evt:TEvtArgs)=>any)=>IObservable<TEvtArgs>;
    $notify:(evt:TEvtArgs)=>IObservable<TEvtArgs>;

    constructor(){
        Object.defineProperty(this,"$_listeners",{enumerable:false,writable:true,configurable:false});
    }
}

valueObservable(Observable.prototype);

//================================================================

export enum TargetTypes{
    Value,
    Object,
    Array
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

export interface IChangeEventArgs{
    type:ChangeTypes,
    index?:string|number;
    target?:any;
    value?:any,
    old?:any,
    item?:IObservableProxy,
    sender?:any,
    cancel?:boolean
}


export interface IObservableProxy extends IObservable<IChangeEventArgs>{
    $type:TargetTypes;
    $extras?:any;
    $target?:any;
    $index?:string|number;
    $modifiedValue?:any;
    $owner?:IObservableProxy;
    $raw:(value?:any)=>any;
    $get():any;
    $set(newValue:any):IObservableProxy;
    $update():boolean;
}





let Undefined = {};

export enum ProxyAccessModes{
    Default,
    Raw,
    Proxy
}

export class ObservableProxy extends Observable<IChangeEventArgs> implements IObservableProxy{
    $type:TargetTypes;
    $target:any;
    $index:number|string;
    $modifiedValue:any;
    $extras?:any;
    $owner?:IObservableProxy;
    $raw:(value?:any)=>any;
    constructor(raw:(val?:any)=>any,initValue?:any){
        super();
        let target:any;
        if(initValue!==undefined){
            target = initValue===Undefined?undefined:initValue;
            if(raw) raw.call(this,this.$target);
        }else if(raw) target = raw.call(this);
        defineMembers(this,{
            $raw:raw,
            $target:target,
            $owner:undefined,
            $index:undefined,
            $modifiedValue:undefined,
            $type :TargetTypes.Value
        });
    }

    $get():any{
        if( ObservableProxy.accessMode===ProxyAccessModes.Proxy) return this;
        if(ObservableProxy.accessMode===ProxyAccessModes.Raw) return this.$raw();
        return (this.$modifiedValue===undefined)?this.$target:(this.$modifiedValue===Undefined?undefined:this.$modifiedValue);
    }

    $set(newValue:any):IObservableProxy{
        if(ObservableProxy.accessMode===ProxyAccessModes.Raw) {this.$raw.call(this,newValue);return this;}
        this.$modifiedValue=newValue===undefined?Undefined:newValue;
        return this;
    }
    $update():boolean{
        let newValue :any= this.$modifiedValue;
        if(newValue===undefined) return true;
        this.$modifiedValue=undefined;
        newValue =newValue===Undefined?undefined:newValue;
        let oldValue = this.$target;
        if(newValue!==oldValue) {
            this.$raw(this.$target = newValue);
            let evtArgs:IChangeEventArgs = {type:ChangeTypes.Value,value:newValue,old:oldValue,sender:this};
            this.$notify(evtArgs);
            return evtArgs.cancel!==true;
        }
        return true;
        
    }

    toString(){return this.$raw().toString();}
    static accessMode:ProxyAccessModes = ProxyAccessModes.Default; 
}
//let ValueProxyProps = ["$modifiedValue","$type","$raw","$extras","$owner"];
defineMembers(ObservableProxy.prototype,ObservableProxy.prototype);

export interface IObjectMeta{
    propBuilder?:(ownerProxy:IObservableObject,define:(name:string,prop?:IObservableProxy)=>any)=>any;
    fieldnames?:string[];
    methodnames?:string[];
}

export interface IObservableObject extends IObservableProxy{
    [index:string]:any;   
}

function buildNotProperty(name:string,proxy:IObservableObject,enumerable:boolean){
    
    Object.defineProperty(proxy,name,{
        enumerable:enumerable,configurable:false,
        get:()=>(proxy.$modifiedValue===undefined?proxy.$target:(proxy.$modifiedValue===Undefined?null:proxy.$modifiedValue))[name],
        set:(newValue:any)=>(proxy.$modifiedValue===undefined?proxy.$target:(proxy.$modifiedValue===Undefined?null:proxy.$modifiedValue))[name]=newValue
    });
}

function prop_raw(name:string,objProxy:IObservableObject):{(val?:any):any}{
    return function(val?:any){
        return val===undefined
            ?(objProxy.$modifiedValue===undefined
                ?objProxy.$target
                :(objProxy.$modifiedValue===Undefined?null:objProxy.$modifiedValue)
            )[name]
            :(objProxy.$modifiedValue===undefined
                ?objProxy.$target
                :(objProxy.$modifiedValue===Undefined?null:objProxy.$modifiedValue)
            )[name]=val;   
    }      
}

export class ObservableObject extends ObservableProxy implements IObservableObject{
    $target:any;
    [index:string]:any;
    constructor(raw:(val?:any)=>any,meta:IObjectMeta,initValue?:object){
        super(raw,initValue);
        let target = this.$target;
        if(!target) raw.call(this,target=this.$target={});
        defineMembers(this,{
            "$target":target,
            "$type":TargetTypes.Object
        });

        this.$type = TargetTypes.Object;

        if(!meta){

            return;
        }
        if(meta.fieldnames)
            for(const i in meta.fieldnames)
                buildNotProperty(meta.fieldnames[i],this,true);
        
        if(meta.methodnames)    
            for(const i in meta.methodnames)
            buildNotProperty(meta.methodnames[i],this,false);

        if(meta.propBuilder){
            let define = (name:string,prop:IObservableProxy)=>{
                prop ||(prop = new ObservableProxy(prop_raw(name,this)));
                prop.$owner = this;
                prop.$index = name;
                Object.defineProperty(this,name,{
                    enumerable:true,
                    configurable:false,
                    get:prop.$type === TargetTypes.Value?()=>prop.$get():()=>prop,
                    set:(val:any)=>prop.$set(val)
                });                
                
                return define;
            };
            meta.propBuilder.call(this,this,define);
        } 
        
    }

    $get():any{
        if(ObservableProxy.accessMode===ProxyAccessModes.Raw) return this.$raw();
        return this;
        //if(ObservableProxy.accessMode===ProxyAccessModes.Proxy) return this;
        //return this.$modifiedValue===undefined?(this.$target||null):this.$modifiedValue;
        
    }

    $set(newValue:any):IObservableProxy{
        super.$set(newValue||null);
        if(!newValue || ObservableProxy.accessMode===ProxyAccessModes.Raw) return this;
        let accessMode = ObservableProxy.accessMode;
        try{
            ObservableProxy.accessMode = ProxyAccessModes.Proxy;
            for(const n in this){
                let proxy :any= this[n];
                if(proxy instanceof ObservableProxy) proxy.$set(newValue[n]);
            }
        }finally{
            ObservableProxy.accessMode=accessMode;
        }
        
        
        return this;
    }
    $update():boolean{
        let result = super.$update();
        if(result===false) return false;
        let accessMode = ObservableProxy.accessMode;
        try{
            ObservableProxy.accessMode = ProxyAccessModes.Proxy;
            for(const n in this){
                let proxy :any= this[n];
                if(proxy instanceof ObservableProxy) proxy.$update();
            }
        }finally{
            ObservableProxy.accessMode=accessMode;
        }
        return true;
    }
}

defineMembers(ObservableObject.prototype,ObservableObject.prototype);


export interface IObservableArray extends IObservableProxy{
    length:number;
    [index:number]:any;
    item(index:number,item_value?:any):any;
    pop():any;
    push(item_value:any):IObservableArray;
    shift():any;
    unshift(item_value:any):IObservableArray;
    $item_convertor?:IObservableProxy;
}



function item_raw(ownerProxy:IObservableArray){
    return function(val?:any){return val===undefined?ownerProxy.$target[this.$index]:ownerProxy.$target[this.$index]=val;}
}

function define_item(arrProxy:IObservableArray,index:number,item:IObservableProxy){
    if(item!==Undefined){
        item.$index = index;
        item.$owner = arrProxy;
        Object.defineProperty(arrProxy,index.toString(),{
            enumerable:true,
            configurable:true,
            get:item.$type===TargetTypes.Value?()=>item.$get():()=>item,
            set:(val)=>item.$set(val)
        }); 
        
    }
}

export class ObservableArray extends ObservableProxy{
    $itemConvertor:(index:number,item_value:any,proxy:IObservableArray)=>IObservableProxy;
    $changes:IChangeEventArgs[];
    [index:number]:any;
    $length:number;
    length:number;
    constructor(raw:(val?:any)=>any,item_convertor?:(index:number,item_value:any,proxy:IObservableArray)=>IObservableProxy,initValue?:any[]){
        let target:any;
        super(raw,initValue);
        target = this.$target;
        if(Object.prototype.toString.call(target)!=="[object Array]") raw.call(this,target=this.$target=[]);
        
        item_convertor ||(item_convertor=(index,item_value,proxy)=>{
            let item = new ObservableProxy(null);
            item.$index = index;
            item.$raw = item_raw(this);
            item.$target = item_value;
            return item;
        });
        for(let i =0,j=target.length;i<j;i++)((index,item_value)=>{
            if(item_value && item_value[ObservableArray.structToken]!==undefined) return;
            target.push(item_value);
            let item =  item_convertor.call(this,i as any as number,item_value,this);
            define_item(this,i,item)
        })(i,target.shift());

        defineMembers(this,{
            "$type":TargetTypes.Array,
            "$target":target,
            "$length":target.length,
            "$itemConvertor":item_convertor,
            "$changes":undefined
        });
    }

    clear():IObservableArray{
        let old = this.$get();
        let changes = this.$changes|| (this.$changes=[]);
        let len = old.length;
        if(changes)for(const i in changes){
            let change = changes[i];
            if(change.type ===ChangeTypes.Push || change.type===ChangeTypes.Unshift){
                len++;
            }
        }
        let swicherValue = ObservableProxy.accessMode;
        try{
            ObservableProxy.accessMode=ProxyAccessModes.Proxy;
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
        }finally{
            ObservableProxy.accessMode = swicherValue;
        }
        

        return this;
    }

    resize(newLength:number):IObservableArray{
        let arr = this.$get();
        let len = arr.length;
        if(len===newLength) return this;
        let changes = this.$changes ||(this.$changes=[]);
        if(len>newLength){
            for(let i =newLength;i<len;i++){
                let removeItem = this[i];
                delete this[i];
                changes.push({
                    type:ChangeTypes.Remove,
                    index:i,
                    item:removeItem,
                    target:arr,
                    value:arr[i]
                });
            }
            this.$length = newLength;
        }else if(len<newLength){
            for(let i =len;i<newLength;i++)((idx)=>{
                let appendItem = this.$itemConvertor(idx,undefined,this);
                define_item(this,i,appendItem);
                changes.push({
                    type:ChangeTypes.Append,
                    index:i,
                    item:appendItem,
                    target:arr
                });
            })(i);
            this.$length = newLength;
        }
        return this;
    }

    $set(newValue:any):IObservableProxy{
        newValue || (newValue=[]);
        this.clear();
        super.$set(newValue);
        if(ObservableProxy.accessMode=== ProxyAccessModes.Raw){
            this.$raw(newValue);return this;
        }
        
        for(const i in newValue)((idx:number)=>{
            let item =  this.$itemConvertor(idx,newValue[idx],this);
            define_item(this,idx,item);
        })(i as any as number);
        this.$length = newValue.length;
        
        return this;
    }

    
    item(index:number,item_value?:any):any{
        if(item_value===undefined){
            let item = (this as any)[index];
            return ObservableProxy.accessMode?item:item.$get();
        }
        let len = this.length;
        let size = index>=len?index+1:len;
        let item = this.$itemConvertor(index,item_value,this);
        let oldItem :any;
        if(size>len){
            for(let i = len;i<size;i++)((idx:number)=>{
                let insertedItem = this.$itemConvertor(idx,undefined,this);
                insertedItem.$owner = this;
                define_item(this,idx,insertedItem);
                (this.$changes || (this.$changes=[])).push({
                    sender:this,
                    type:ChangeTypes.Append,
                    index:idx,
                    value:insertedItem,
                    old:undefined
                });
            })(i);
            this.$length = size;
        }else {
            oldItem = this[index];
            
        }
        define_item(this,index,item);
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Replace,
            index:index,
            item:item,
            target:this.$get(),
            old:oldItem,
            value:item_value
        });

        return this;
    }

    push(item_value:any):ObservableArray{
        let index = this.length;
        let item = this.$itemConvertor(index,item_value,this);
        define_item(this,index,item);
        this.$length++;
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Push,
            index:index,
            item:item,
            value:item_value,
            target:this.$get()
        });
        return this;
    }

    pop():any{
        let len = this.length;
        if(!len)return this;
        let index = len-1;
        let removeItem = this[index];
        delete (this as any)[index];
        this.$length--;
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Pop,
            item:removeItem,
            index:index,
            target:this.$get(),
            value:removeItem.$get()
        });
        
        return removeItem.$get();
    }

    unshift(item_value:any):ObservableArray{
        let item = this.$itemConvertor(0,item_value,this);
        item.$owner = this;
        //let changes = ;
        let len = this.length;
        for(let i =0;i<len;i++)((index)=>{
            let movedItem = this[index];
            let newIndex = index+1;
            define_item(this,newIndex,movedItem);
        })(i);
        define_item(this,0,item);
        
        this.$length++;
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Unshift,
            index:0,
            item:item,
            value:item_value,
            target:this.$get()
        });
        return this;
    }
    shift():any{
        let len = this.length;
        if(len===undefined)return;
        let removeItem = this[0];
        for(let i =1;i<len;i++)((idx)=>{
            let movedItem = this[idx];
            define_item(this,idx-1,movedItem);
        })(i);
        delete (this as any)[len-1];
        this.$length--;
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Shift,
            item:removeItem,
            index:0,
            //value:removeItem.$get(),
            target:this.$get()
        });
        return removeItem.$get();
    }
    $update():boolean{
        if(!super.$update()) return true;
        let changes = this.$changes;
        if(!changes || this.$changes.length===0) return true;
        this.$changes = undefined;

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
                    if(change.cancel!==true && change.old){
                        change.sender =change.item = change.old;
                        change.value = change.old.$get();
                        change.old = undefined;
                        change.sender.$notify(change);
                    } 
                    break;
            }
        }
        return true;
    }
    static structToken:string = "__STRUCT";
}
defineMembers(ObservableArray.prototype,ObservableArray.prototype);
Object.defineProperty(ObservableArray.prototype,"length",{
    enumerable:false,
    configurable:false,
    get:function():number{
        if(this.$length===undefined) {
            this.$length = this.$target.length;
        }
        return this.$length;
    }
    ,set:function(newLen:number){
        this.resize(newLen);
    }
});
 
//=====================================
export function observable(target?:any):IObservable<any>{
    if(target===undefined)return new Observable();
    let t = Object.prototype.toString.call(target);
    if(t==="[object Object]") return new ObservableObject((val?:any)=>target,null);
    else if(t==="[object Array]") return new ObservableArray((val?:any)=>target);
    else return new ObservableProxy((val?:any)=>target);
}
 
//=======================================================================

export class Model{
    type:TargetTypes;
    index:string|number;
    item_model:Model;
    prop_models:{[index:string]:Model};
    owner_model:Model;
    constructor(data:any,index?:string|number,owner?:Model){
        this.index = index;
        this.owner_model = owner;
        let t = Object.prototype.toString.call(data);
        if(t==="[object Object]") {
            this.type = TargetTypes.Object;
            this.prop_models = {};
            for(const n in data){
                if(n===ObservableArray.structToken) continue;
                this.prop_models[n] = new Model(data[n],n,this);
            }
        }
        else if(t==="[object Array]"){
            this.type = TargetTypes.Array;
            for(const i in data){
                let item = data[i];
                this.item_model = new Model(item,-1,this);
                break;
            }
        }
        else{
            this.type = TargetTypes.Value;

        }
    }

    createProxy(data:any,ownerProxy?:IObservableProxy):IObservableProxy{
        let raw :(val?:any)=>any;
        if(this.index!==undefined&& this.owner_model){
            raw = this.owner_model.type=== TargetTypes.Object
                ? prop_raw(this.index as string,ownerProxy)
                : item_raw(ownerProxy as IObservableArray);
        } 
        else raw = (val?:any)=>val===undefined?data:data=val;    
        
        let proxy:IObservableProxy;
        if(this.type===TargetTypes.Value) {
            proxy = new ObservableProxy(raw,data);
        }else if(this.type === TargetTypes.Object){
            //let self:Model;
            proxy = new ObservableObject(raw,{
                propBuilder:(ownerProxy:IObservableObject,define:(name,proxy)=>any)=>{
                    for(const n in this.prop_models){
                        let prop_model = this.prop_models[n];
                        let prop_proxy = prop_model.createProxy(data[n],ownerProxy);
                        define(n,prop_proxy);
                    }
                }
            },data);
        }else if(this.type===TargetTypes.Array){
            let item_convertor:(index:number,item_value:any,proxy:IObservableArray)=>IObservableProxy;
            if(this.item_model){
                item_convertor = (index:number,item_value:any,proxy:IObservableArray):IObservableProxy=>
                    this.item_model.createProxy(item_value,proxy);
            }
            proxy = new ObservableArray(raw,item_convertor,data);
        }
        return proxy;
    }
}

//=======================================================================

export enum ReactiveTypes{
    Local,
    In,
    Out,
    IO
}


export enum ComponentReadyStates{
    Defined,
    Completed
}

export interface IComponentMeta {
    $reactives?:{[attr:string]:ReactiveTypes};
    $templates?:{[attr:string]:string};
    $actions?:{[attr:string]:string};
    $wrapType?:Function;
    $rawType?:Function;
    $tag?:string;
    $readyState?:ComponentReadyStates;
}

export interface IComponent extends IComponentMeta{
    [attr:string]:any;
}

type TRender=(states:any,container:any)=>any;


export const componentTypes: {[tag:string]:{new():{}}}={};

let currentComponentType:Function;

export function component(tag:string|Function,meta?:IComponentMeta){
    function decorator<T extends {new(...args: any[]):{}}>(RawType:T){
        Object.defineProperty(RawType,"$tag",{
            enumerable:false,writable:false,configurable:false,value:tag
        });
        let WrappedType= class extends RawType{
            constructor(...args:any[]){
                let accessMode = ObservableProxy.accessMode;
                try{
                    ObservableProxy.accessMode = ProxyAccessModes.Raw;
                    if(!args.length) super();
                    else RawType.apply(this,args);
                }finally{
                    ObservableProxy.accessMode = accessMode;
                }
                
                intializeActions(this,WrappedType as IComponentMeta,RawType);
            }
        };
        let info:IComponentMeta = {
            "$reactives":RawType.prototype.$reactives || (RawType as any).$reactives
            ,"$templates":RawType.prototype.$templates || (RawType as any).$templates
            ,"$actions":RawType.prototype.$actions || (RawType as any).$actions
            ,"$wrapType":WrappedType
            ,"$rawType":RawType
            //,"$readyState":ComponentReadyStates.Defined
            ,"$tag":tag as string
        };
        for(let n in info){
            delete RawType.prototype[n];
        }
        defineMembers(RawType,info,false);
        defineMembers(WrappedType,info,false);
        Object.defineProperty(WrappedType,"$readyState",{enumerable:false,configurable:true,writable:false,value:ComponentReadyStates.Defined});
        Object.defineProperty(RawType,"$readyState",{enumerable:false,configurable:true,writable:false,value:ComponentReadyStates.Defined});
        
        currentComponentType = WrappedType;
        //let wrappedProto = ;
        try{
            WrappedType.prototype = new RawType();
        }finally{
            currentComponentType=undefined;
        }
        initializeComponentType(WrappedType);
        componentTypes[tag as string] = WrappedType;
        
        return WrappedType;
    }
    if(meta){
        let rawType = tag as Function;
        for(const  n in meta) rawType.prototype[n] = meta[n];
        return decorator(rawType as any);
    }else return decorator;
}

function intializeActions(component:any,WrappedType:IComponentMeta,RawType:Function){
    Object.defineProperty(component,"$private_updateTick",{
        enumerable:false,configurable:false,writable:true,value:undefined
    });

    let actions = WrappedType.$actions;
    for(const n in actions)((name:string,method:Function,component:any,WrappedType:IComponentMeta)=>{
        let action :any= function(){
            let rs= method.apply(component,arguments);
            if(component.$private_updateTick) clearTimeout(component.$private_updateTick);
            component.$private_updateTick = setTimeout(()=>{
                clearTimeout(component.$private_updateTick);
                component.$private_updateTick = undefined;
                let reactives = WrappedType.$reactives;
                let accessMode = ObservableProxy.accessMode;
                try{
                    ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                    for(const n in reactives) component[n].$update();
                }finally{
                    ObservableProxy.accessMode = accessMode;
                }
            },0);
            return rs;
        };
        Object.defineProperty(component,name,{
            enumerable:false,configurable:false,writable:false,value:action
        });
        Object.defineProperty(action,"$isAction",{
            enumerable:false,configurable:false,writable:false,value:true
        });
    })(n,RawType.prototype[n],component,WrappedType);
}

function initializeComponentType(WrappedType:Function){
    //let meta = (WrappedType as any).$meta;
    let reactives = (WrappedType as IComponentMeta).$reactives;
    if(reactives)for(const n in reactives)((name:string,reactiveType:ReactiveTypes,component:any)=>{
        let privateName = `$private_${name}`;
        let initData = component[name];
        let model = new Model(initData,name);
        defineReactive(name,privateName,WrappedType,()=>model.createProxy(initData));
    })(n,reactives[n],WrappedType.prototype);

    let templates = (WrappedType as IComponentMeta).$templates;
    Object.defineProperty(WrappedType.prototype,"$render",{enumerable:false,configurable:false,writable:false,value:function(partial?:string):any{
        partial||(partial="");
        let rendername = templates[partial];
        if(rendername!==undefined){
            let render = this[rendername];
            if(render) {
                let accessMode = ObservableProxy.accessMode;
                try{
                    ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                    return render.call(this,this);
                }finally{
                    ObservableProxy.accessMode = accessMode;
                }
            } 
        }
        return undefined;
    }});

    

    Object.defineProperty(WrappedType,"$readyState",{enumerable:false,configurable:false,writable:false,value:true});
    //Object.defineProperty(RawType,"$readyState",{enumerable:false,configurable:false,writable:false,value:true});
        
}

function defineReactive(name:string,privateName:string,WrappedType:Function,proxyCreator:()=>IObservableProxy){
    let descriptor = {
        enumerable:true,
        configurable:true,
        get:function(){
            let proxy = this[privateName];
            if(!proxy) Object.defineProperty(this,privateName,{enumerable:false,writable:false,configurable:true,value:proxy=proxyCreator()});
            else{
                delete this[privateName];
                Object.defineProperty(this,name,{
                    enumerable:true,configurable:false,get:()=>proxy.$get(),set:(val)=>proxy.$set(val)
                });
            } 
            return proxy.$get(); 
        },
        set:function(val){
            let proxy = this[privateName];
            if(!proxy) Object.defineProperty(this,privateName,{enumerable:false,writable:false,configurable:true,value:proxy=proxyCreator()});
            else{
                delete this[privateName];
                Object.defineProperty(this,name,{
                    enumerable:true,configurable:false,get:()=>proxy.$get(),set:(val)=>proxy.$set(val)
                });
            } 
            proxy.$set(val); 
        }
    };
    Object.defineProperty(WrappedType.prototype,name,descriptor);
    //Object.defineProperty(component,name,descriptor);
    //Object.defineProperty(component,name,descriptor);
}


export function reactive(type?:ReactiveTypes|string):any{
    return function(target:any,propName:string){
        (target.$reactives || (target.$reactives=[]))[propName] = ReactiveTypes[type]|| type || ReactiveTypes.Local;
    }
}
export function action(async?:boolean){
    return function(target: any, propertyName: string){
        (target.$actions || (target.$actions=[]))[propertyName] = async;
    };
}

export function template(partial?:string){
    return function(target: any, propertyName: string){
        (target.$templates || (target.$templates=[]))[partial||""] = propertyName;
    };
}
let evtnameRegx = /(?:on)?([a-zA-Z_][a-zA-Z0-9_]*)/;
export let ELEMENT:any =function(tag:string,attrs:{[name:string]:any}){
    if(currentComponentType && (currentComponentType as IComponentMeta).$readyState!==ComponentReadyStates.Completed) {
        return;
    };
    let elem = ELEMENT.createElement(tag);
    for(const attrname in attrs){
        let attrValue= attrs[attrname];
        if(attrValue&& attrValue.$isAction){
            let match = attrname.match(evtnameRegx);
            ELEMENT.attach(elem,match?match[1]:attrname,attrValue);
            continue;
        }
        if(attrValue instanceof ObservableProxy){
            let binder = attrBinders[name];
            if(binder){
                binder(elem,attrValue);
                continue;
            }
            else attrValue = attrValue.$get();
        }
        ELEMENT.setAttribute(elem,attrname,attrValue);
    }
    for(let i =2,j=arguments.length;i<j;i++){
        let child = arguments[i];
        if(!child) continue;
        if(!ELEMENT.isElement(child)){
            if(child instanceof ObservableProxy){
                let proxy = child;
                child = ELEMENT.createText(child.$get());
                attrBinders["#text"](child,proxy);
            }else{
                child = ELEMENT.createText(child);
            }
        }
        ELEMENT.appendChild(elem,child);
    }
    return elem;
};
ELEMENT.isElement=(elem):any=>{
    return (elem as HTMLElement).nodeType === 1;
};

ELEMENT.createElement=(tag:string):any=>{
    return document.createElement(tag);
};

ELEMENT.createText=(txt:string):any=>{
    return document.createTextNode(txt);
};


ELEMENT.setAttribute=(elem:any,name:string,value:any)=>{
    elem.setAttribute(name,value);
};

ELEMENT.appendChild=(elem:any,child:any)=>{
    elem.appendChild(child);
};

ELEMENT.removeAllChildrens=(elem:any)=>{
    elem.innerHTML = elem.nodeValue="";
};

ELEMENT.attach = (elem:any,evtname:string,handler:Function)=>{
    if(elem.addEventListener) elem.addEventListener(evtname,handler,false);
    else if(elem.attachEvent) elem.attachEvent('on' + evtname,handler);
    else elem['on'+evtname] = handler;
}

let attrBinders:{[name:string]:{(elem:any,bindValue:IObservableProxy):void}} ={};
function changeEventToText(e:IChangeEventArgs):string{
    let value = e.value===undefined?(e.item?e.item.$get():e.value):e.value;
    return (value===undefined || value===null)?"":value.toString();
}
attrBinders["#text"] = (elem:any,bindValue:IObservableProxy)=>{
    debugger;
    bindValue.$subscribe((e:IChangeEventArgs)=>{
        debugger;
        (elem as Node).nodeValue = changeEventToText(e);
    });
};
attrBinders["value"] = (elem:any,bindValue:IObservableProxy)=>{
    debugger;
    bindValue.$subscribe((e:IChangeEventArgs)=>{
        (elem as HTMLInputElement).value = changeEventToText(e);
    });
    elem.value = bindValue.toString();
};

let eventBinders:{[name:string]:{(elem:any,handler:Function):void}} ={};
eventBinders["onchange"] = (elem:any,handler:Function)=>{
    let bindEdit =(elem,handler)=>{
        let tick :number;
        let evtHandler = (e)=>{
            if(tick) clearTimeout(tick);
            tick = setTimeout(() => {
                clearTimeout(tick);tick =0;
                handler(e);
            }, 150);
        };  
        ELEMENT.attach(elem,"keydown",evtHandler);
        ELEMENT.attach(elem,"keyup",evtHandler);
        ELEMENT.attach(elem,"keypress",evtHandler);
    };
    if(elem.tagName==="INPUT"){
        if(elem.type==="text")
            bindEdit(elem,handler);
    } else if(elem.tagName==="TEXTAREA"){
        bindEdit(elem,handler);
    }


    ELEMENT.attach(elem,"onchange",handler);
    ELEMENT.attach(elem,"focusout",handler);
    ELEMENT.attach(elem,"blur",handler);
    
};

let YA={
    Observable, ProxyAccessModes,ObservableProxy,ObservableObject,ObservableArray, Model,
    component,reactive,action,
    ELEMENT: ELEMENT
};
if(typeof window!=='undefined') (window as any).YA = YA;
export default YA;





