
function buildNotPublics(ctor:Function|object,members:{[name:string]:any}|string[]):Function|object{
    let proto = typeof ctor ==="function" ? (ctor as Function).prototype as object:ctor as object;

    if(Object.prototype.toString.call(members)==="[object Array]")
        for(let i in members)
            Object.defineProperty(proto,members[i],{enumerable:false,writable:true,configurable:false});
    else 
        for(let n in members)
            Object.defineProperty(proto,n,{enumerable:false,writable:true,configurable:false,value:members[n]});
        
    return ctor;
} 

function buildHiddenMembers(target:any,props:any){
    let descriptor = {enumerable:false,writable:true,configurable:false,value:undefined};
    for(let n in props){
        descriptor.value = props[n];
        Object.defineProperty(target,n,descriptor);
    } 
    return target;
}

//===============================================================================

export interface IValueObservable<TEvtArgs>{
    $subscribe:(listener:(evt:TEvtArgs)=>any)=>IValueObservable<TEvtArgs>;
    $unsubscribe:(listener:(evt:TEvtArgs)=>any)=>IValueObservable<TEvtArgs>;
    $notify:(evt:TEvtArgs)=>IValueObservable<TEvtArgs>;
}



export function valueObservable<TEvtArgs>(target:any):IValueObservable<TEvtArgs>{
    target.$subscribe = function(listener:(evt:IChangeEventArgs)=>any):IValueObservable<TEvtArgs>{
        (this.$_listeners||(this.$_listeners=[])).push(listener);
        return this;
    }
    target.$unsubscribe = function(listener:(evt:IChangeEventArgs)=>any):IValueObservable<TEvtArgs>{
        if(!this.$_listeners)return this;
        for(let i =0,j=this.$_listeners.length;i<j;i++){
            let existed = this.$_listeners.shift();
            if(existed!==listener) this.$_listeners.push(existed);
        }
        return this;
    } 
    target.$notify = function(evt:IChangeEventArgs):IValueObservable<TEvtArgs>{
        let listeners = this.$_listeners;
        if(!listeners|| listeners.length===0) return this;
        for(let i in listeners){
            listeners[i].call(this,evt);
        }
        return this;
    }
    return buildNotPublics(target,[
        "$_listeners"
        ,"$subscribe"
        ,"$unsubscribe"
        ,"$notify"
    ]) as IValueObservable<TEvtArgs>;
}
export class ValueObservable<TEvtArgs> implements IValueObservable<TEvtArgs>{
    $_listeners:Function[];
    $subscribe:(listener:(evt:TEvtArgs)=>any)=>IValueObservable<TEvtArgs>;
    $unsubscribe:(listener:(evt:TEvtArgs)=>any)=>IValueObservable<TEvtArgs>;
    $notify:(evt:TEvtArgs)=>IValueObservable<TEvtArgs>;

    constructor(){
        Object.defineProperty(this,"$_listeners",{enumerable:false,writable:true,configurable:false});
    }
}

valueObservable(ValueObservable.prototype);

//================================================================

export enum ValueTypes{
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


export interface IValueProxy extends IValueObservable<IChangeEventArgs>{
    $type:ValueTypes;
    $extras?:any;
    $target?:any;
    $index?:string|number;
    $modifiedValue?:any;
    $owner?:IValueProxy;
    $raw:(value?:any)=>any;
    $get():any;
    $set(newValue:any):IValueProxy;
    $update():boolean;
}

export interface IObjectProxy extends IValueProxy{
    $props:{[name:string]:IValueProxy};
}
export interface IArrayProxy extends IValueProxy{
    length:number;
    item(index:number,item_value?:any):any;
    pop():any;
    push(item_value:any):IArrayProxy;
    shift():any;
    unshift(item_value:any):IArrayProxy;
    $item_convertor?:IValueProxy;
}


let Undefined = {};
let Null={};

export class ValueProxy extends ValueObservable<IChangeEventArgs> implements IValueProxy{
    $type:ValueTypes;
    $target:any;
    $index:number|string;
    $modifiedValue:any;
    $extras?:any;
    $owner?:IValueProxy;
    $raw:(value?:any)=>any;
    constructor(raw:(val?:any)=>any){
        super();
        buildHiddenMembers(this,{
            $raw:raw,
            $target:raw?raw.call(this):undefined,
            $owner:undefined,
            $index:undefined,
            $modifiedValue:undefined,
            $type :ValueTypes.Value
        });
    }

    $get():any{
        if(ValueProxy.gettingProxy) return this;
        
        return (this.$modifiedValue===undefined)?this.$target:(this.$modifiedValue===Undefined?undefined:this.$modifiedValue);
    }

    $set(newValue:any):IValueProxy{
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
    static gettingProxy:boolean;
}
//let ValueProxyProps = ["$modifiedValue","$type","$raw","$extras","$owner"];
buildHiddenMembers(ValueProxy.prototype,ValueProxy.prototype);

export interface IObjectMeta{
    propBuilder?:(define:(name:string,prop?:IValueProxy)=>any)=>any;
    fieldnames?:string[];
    methodnames?:string[];
}

function buildNotProperty(name:string,proxy:IObjectProxy,enumerable:boolean){
    
    Object.defineProperty(proxy,name,{
        enumerable:enumerable,configurable:false,
        get:()=>(proxy.$modifiedValue===undefined?proxy.$target:(proxy.$modifiedValue===Undefined?null:proxy.$modifiedValue))[name],
        set:(newValue:any)=>(proxy.$modifiedValue===undefined?proxy.$target:(proxy.$modifiedValue===Undefined?null:proxy.$modifiedValue))[name]=newValue
    });
}

export class ObjectProxy extends ValueProxy implements IObjectProxy{
    $props:{[name:string]:IValueProxy};
    $target:any;
    constructor(raw:(val?:any)=>any,meta:IObjectMeta){
        super(raw);
        let target = this.$target;
        if(!target) raw(target=this.$target={});
        buildHiddenMembers(this,{
            "$target":target,
            "$props":{},
            "$type":ValueTypes.Object
        });

        this.$type = ValueTypes.Object;
        let props = this.$props;
        if(meta.fieldnames)
            for(let i in meta.fieldnames)
                buildNotProperty(meta.fieldnames[i],this,true);
        
        if(meta.methodnames)    
            for(let i in meta.methodnames)
            buildNotProperty(meta.methodnames[i],this,false);

        if(meta.propBuilder){
            let define = (name:string,prop:IValueProxy)=>{
                prop ||(prop = new ValueProxy((val?:any)=>
                    val===undefined
                        ?(this.$modifiedValue===undefined
                            ?this.$target
                            :(this.$modifiedValue===Undefined?null:this.$modifiedValue)
                        )[name]
                        :(this.$modifiedValue===undefined
                            ?this.$target
                            :(this.$modifiedValue===Undefined?null:this.$modifiedValue)
                        )[name]=val
                ));
                prop.$owner = this;
                Object.defineProperty(this,name,{
                    enumerable:true,configurable:false,get:()=>prop.$get(),set:(val:any)=>prop.$set(val)
                });
                props[name] = prop;
                return define;
            };
            meta.propBuilder(define);
        } 
        
    }

    $get():any{
        if(ValueProxy.gettingProxy) return this;
        return this.$modifiedValue===undefined?(this.$target||null):this.$modifiedValue;
        
    }

    $set(newValue:any):IValueProxy{
        super.$set(newValue||null);
        if(!newValue) return;
        for(let n in this.$props){
            this.$props[n].$set(newValue[n]);
        }
        
        return this;
    }
    $update():boolean{
        let result = super.$update();
        if(result===false) return false;
        for(let n in this.$props){
            this.$props[n].$update();
        }
        return true;
    }
}

buildHiddenMembers(ObjectProxy.prototype,ObjectProxy.prototype);


export interface IArrayChangeEventArgs extends IChangeEventArgs{
    item?:IValueProxy;
}

export class ArrayProxy extends ValueProxy{
    $itemConvertor:(index:number,item_value:any,proxy:IArrayProxy)=>IValueProxy;
    $changes:IArrayChangeEventArgs[];
    $length:number;
    length:number;
    constructor(raw:(val?:any)=>any,item_convertor?:(index:number,item_value:any,proxy:IArrayProxy)=>IValueProxy){
        let target:any;
        super(raw);
        target = this.$target;
        if(Object.prototype.toString.call(target)!=="[object Array]") raw(target=this.$target=[]);
        
        item_convertor ||(item_convertor=(index,item_value,proxy)=>{
            let item = new ValueProxy(null);
            item.$index = index;
            item.$raw = function(val?:any){return val===undefined?proxy.$target[this.$index]:proxy.$target[this.$index]=val;};
            item.$target = item_value;
            return item;
        });
        for(let i in target)((index)=>{
            let item =  item_convertor.call(this,i as any as number,target[index],this);
            
            if(item!==Undefined){
                item.$index = index;
                item.$owner = this;
                Object.defineProperty(this,index.toString(),{enumerable:true,configurable:true,get:()=>item.$get(),set:(val)=>item.$set(val)}); 
            }
        })(i);

        buildHiddenMembers(this,{
            "$type":ValueTypes.Array,
            "$target":target,
            "$length":target.length,
            "$itemConvertor":item_convertor,
            "$changes":undefined
        });
    }

    clear():IArrayProxy{
        let old = this.$get();
        let changes = this.$changes|| (this.$changes=[]);
        let len = old.length;
        if(changes)for(let i in changes){
            let change = changes[i];
            if(change.type ===ChangeTypes.Push || change.type===ChangeTypes.Unshift){
                len++;
            }
        }
        let swicherValue = ValueProxy.gettingProxy;
        try{
            ValueProxy.gettingProxy=true;
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
            ValueProxy.gettingProxy = swicherValue;
        }
        

        return this;
    }

    resize(newLength:number):IArrayProxy{
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

    $set(newValue:any):IValueProxy{
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
            return ValueProxy.gettingProxy?item:item.$get();
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

    push(item_value:any):ArrayProxy{
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

    unshift(item_value:any):ArrayProxy{
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
    
}
buildHiddenMembers(ArrayProxy.prototype,ArrayProxy.prototype);
Object.defineProperty(ArrayProxy.prototype,"length",{
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
 
 
//=======================================================================

