
function defineMembers(target:any,props?:any,des?:any){
    props ||(props=target);
    let descriptor = {enumerable:false,writable:true,configurable:false,value:undefined};
    if(des) for(let n in descriptor) descriptor[n] = des[n];
    for(let n in props){
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
        for(let i in listeners){
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

export enum MemberTypes{
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
    sender?:any,
    cancel?:boolean
}


export interface IObservableProxy extends IObservable<IChangeEventArgs>{
    $type:MemberTypes;
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
    Raw,
    Proxy
}

export class ObservableProxy extends Observable<IChangeEventArgs> implements IObservableProxy{
    $type:MemberTypes;
    $target:any;
    $index:number|string;
    $modifiedValue:any;
    $extras?:any;
    $owner?:IObservableProxy;
    $raw:(value?:any)=>any;
    constructor(raw:(val?:any)=>any){
        super();
        defineMembers(this,{
            $raw:raw,
            $target:raw?raw.call(this):undefined,
            $owner:undefined,
            $index:undefined,
            $modifiedValue:undefined,
            $type :MemberTypes.Value
        });
    }

    $get():any{
        if(ObservableProxy.accessMode) return this;
        
        return (this.$modifiedValue===undefined)?this.$target:(this.$modifiedValue===Undefined?undefined:this.$modifiedValue);
    }

    $set(newValue:any):IObservableProxy{
        //if(ValueProxy.gettingProxy) throw new Error("ValueProxy.gettingProxy=true,不可以给对象属性赋值");
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
    static accessMode:ProxyAccessModes = ProxyAccessModes.Raw; 
}
//let ValueProxyProps = ["$modifiedValue","$type","$raw","$extras","$owner"];
defineMembers(ObservableProxy.prototype,ObservableProxy.prototype);

export interface IObjectMeta{
    propBuilder?:(define:(name:string,prop?:IObservableProxy)=>any)=>any;
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
    constructor(raw:(val?:any)=>any,meta:IObjectMeta){
        super(raw);
        let target = this.$target;
        if(!target) raw(target=this.$target={});
        defineMembers(this,{
            "$target":target,
            "$type":MemberTypes.Object
        });

        this.$type = MemberTypes.Object;

        if(!meta){

            return;
        }
        if(meta.fieldnames)
            for(let i in meta.fieldnames)
                buildNotProperty(meta.fieldnames[i],this,true);
        
        if(meta.methodnames)    
            for(let i in meta.methodnames)
            buildNotProperty(meta.methodnames[i],this,false);

        if(meta.propBuilder){
            let define = (name:string,prop:IObservableProxy)=>{
                prop ||(prop = new ObservableProxy(prop_raw(name,this)));
                prop.$owner = this;
                Object.defineProperty(this,name,{
                    enumerable:true,configurable:false,get:()=>prop.$get(),set:(val:any)=>prop.$set(val)
                });
                //props[name] = prop;
                return define;
            };
            meta.propBuilder(define);
        } 
        
    }

    $get():any{
        if(ObservableProxy.accessMode===ProxyAccessModes.Proxy) return this;
        return this.$modifiedValue===undefined?(this.$target||null):this.$modifiedValue;
        
    }

    $set(newValue:any):IObservableProxy{
        super.$set(newValue||null);
        if(!newValue) return;
        let accessMode = ObservableProxy.accessMode;
        try{
            ObservableProxy.accessMode = ProxyAccessModes.Proxy;
            for(let n in this){
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
            for(let n in this){
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

export interface IArrayChangeEventArgs extends IChangeEventArgs{
    item?:IObservableProxy;
}

export class ObservableArray extends ObservableProxy{
    $itemConvertor:(index:number,item_value:any,proxy:IObservableArray)=>IObservableProxy;
    $changes:IArrayChangeEventArgs[];
    [index:number]:any;
    $length:number;
    length:number;
    constructor(raw:(val?:any)=>any,item_convertor?:(index:number,item_value:any,proxy:IObservableArray)=>IObservableProxy){
        let target:any;
        super(raw);
        target = this.$target;
        if(Object.prototype.toString.call(target)!=="[object Array]") raw(target=this.$target=[]);
        
        item_convertor ||(item_convertor=(index,item_value,proxy)=>{
            let item = new ObservableProxy(null);
            item.$index = index;
            item.$raw = function(val?:any){return val===undefined?proxy.$target[this.$index]:proxy.$target[this.$index]=val;};
            item.$target = item_value;
            return item;
        });
        for(let i =0,j=target.length;i<j;i++)((index,item_value)=>{
            if(item_value && item_value[ObservableArray.structToken]!==undefined) return;
            target.push(item_value);
            let item =  item_convertor.call(this,i as any as number,item_value,this);
            
            if(item!==Undefined){
                item.$index = index;
                item.$owner = this;
                Object.defineProperty(this,index.toString(),{enumerable:true,configurable:true,get:()=>item.$get(),set:(val)=>item.$set(val)}); 
            }
        })(i,target.shift());

        defineMembers(this,{
            "$type":MemberTypes.Array,
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
        if(changes)for(let i in changes){
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
                        value:removeItem.$get(),
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
                Object.defineProperty(this,i,{enumerable:true,configurable:true,get:()=>appendItem.$get(),set:(val:any)=>appendItem.$set(val)});
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
        
        for(let i in newValue)((idx)=>{
            let item =  this.$itemConvertor(idx as any as number,newValue[idx],this);
            if(item!==Undefined){
                item.$owner = this;
                Object.defineProperty(this,i.toString(),{enumerable:true,configurable:true,get:()=>item.$get(),set:(val)=>item.$set(val)}); 
            }
        })(i);
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
        item.$owner = this;
        let oldItem :any;
        if(size>len){
            for(let i = len;i<size;i++)((idx:number)=>{
                let insertedItem = this.$itemConvertor(idx,undefined,this);
                insertedItem.$owner = this;
                Object.defineProperty(this,idx.toString(),{enumerable:true,configurable:true,get:()=>insertedItem.$get(),set:(val)=>insertedItem.$set(val)});
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

        Object.defineProperty(this,index.toString(),{enumerable:true,configurable:true,get:()=>item.$get(),set:(val)=>item.$set(val)});
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
        (item as any).$index = index;
        item.$owner = this;
        Object.defineProperty(this,index.toString(),{enumerable:true,configurable:true,get:()=>item.$get(),set:(val)=>item.$set(val)});
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
            movedItem.$index = newIndex;
            Object.defineProperty(this,newIndex as any as string,{
                enumerable:true,configurable:true,get:()=>movedItem.$get(),set:(val)=>movedItem.$set(val)
            });
        })(i);
        Object.defineProperty(this,0,{
            enumerable:true,configurable:true,get:()=>item.$get(),set:(val)=>item.$set(val)
        });
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
            movedItem.$index = idx-1;
            Object.defineProperty(this,(idx-1),{
                enumerable:true,configurable:true,get:()=>movedItem.$get(),set:(val)=>movedItem.$set(val)
            });
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
        for(let i in changes){
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
    type:MemberTypes;
    index:string|number;
    item_model:Model;
    prop_models:{[index:string]:Model};
    owner_model:Model;
    constructor(data:any,index:string|number,owner:Model){
        this.index = index;
        this.owner_model = owner;
        let t = Object.prototype.toString.call(data);
        if(t==="[object Object]") {
            this.type = MemberTypes.Object;
            this.prop_models = {};
            for(let n in data){
                if(n===ObservableArray.structToken) continue;
                this.prop_models[n] = new Model(data[n],n,this);
            }
        }
        else if(t==="[object Array]"){
            this.type = MemberTypes.Array;
            for(let i in data){
                let item = data[i];
                this.item_model = new Model(item,-1,this);
                break;
            }
        }
        else{
            this.type = MemberTypes.Value;

        }
    }

    createProxy(data:any):IObservableProxy{
        let raw :(val?:any)=>any;
        if(this.index!==undefined) raw = prop_raw(this.index as string);
        else raw = (val?:any)=>val===undefined?data:data=val;        
        if(this.type===MemberTypes.Value) {
            return new ObservableProxy(raw);
        }else if(this.type === MemberTypes.Object){
            return new ObservableObject(raw,{
                propBuilder:(define:(name,proxy)=>any)=>{
                    for(let n in this.prop_models){
                        let prop_model = this.prop_models[n];
                        let prop_proxy = prop_model.createProxy(data[n]);
                        define(n,prop_proxy);
                    }
                }
            });
        }else if(this.type===MemberTypes.Array){
            let item_convertor:(index:number,item_value:any,proxy:IObservableArray)=>IObservableProxy;
            if(this.item_model){
                item_convertor = (index:number,item_value:any,proxy:IObservableArray):IObservableProxy=>this.item_model.createProxy(item_value);
                
            }
            return new ObservableArray(raw,item_convertor);
        }
    }
}

