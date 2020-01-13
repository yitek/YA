
function buildNotPublics(ctor:Function|object,members:{[name:string]:any}|string[]):Function|object{
    let proto = typeof ctor ==="function" ? (ctor as Function).prototype as object:ctor as object;

    if(Object.prototype.toString.call(members)==="[object Array]")
        for(let i in members)
            Object.defineProperty(proto,members[i],{enumerable:false,writable:true,configurable:true});
    else 
        for(let n in members)
            Object.defineProperty(proto,n,{enumerable:false,writable:true,configurable:false,value:members[n]});
        
    return ctor;
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
    $subscribe:(listener:(evt:TEvtArgs)=>any)=>IValueObservable<TEvtArgs>;
    $unsubscribe:(listener:(evt:TEvtArgs)=>any)=>IValueObservable<TEvtArgs>;
    $notify:(evt:TEvtArgs)=>IValueObservable<TEvtArgs>;

    constructor(){}
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
    Item,
    Push,
    Pop,
    Shift,
    Unshift,
    Clear
}

export interface IChangeEventArgs{
    type:ChangeTypes,
    index?:string|number;
    value:any,
    old?:any,
    sender?:any,
    cancel?:boolean
}


export interface IValueProxy extends IValueObservable<IChangeEventArgs>{
    $type:ValueTypes;
    $extras:any;
    $owner?:IValueProxy;
    $raw:(value?:any)=>any;
    $get():any;
    $set(newValue:any):IValueProxy;
    $update():boolean;
}

export interface IObjectProxy extends IValueProxy{
    
}
export interface IArrayProxy extends IValueProxy{
    length:number;
    item(index:number,item_value?:any):any;
    pop():any;
    push(item_value:any):IArrayProxy;
    shift():any;
    unshift(item_value:any):IArrayProxy;
}


let Undefined = {};
let Null={};

export class ValueProxy extends ValueObservable<IChangeEventArgs> implements IValueProxy{
    $type:ValueTypes;
    $modifiedValue:any;
    $extras:any;
    $owner?:IValueProxy;
    $raw:(value?:any)=>any;
    constructor(raw:(val?:any)=>any,owner?:IValueProxy){
        super();
        this.$raw= raw;
        this.$owner = owner;
        this.$type = ValueTypes.Value;
    }

    $get():any{
        if(ValueProxy.gettingProxy) return this;
        
        if(this.$modifiedValue===undefined){
            return this.$raw();
        }
        //返回变更后的属性值
        return this.$modifiedValue===Undefined?undefined:(this.$modifiedValue===Null?null:this.$modifiedValue);
    }

    $set(newValue:any):IValueProxy{
        if(ValueProxy.gettingProxy) throw new Error("ValueProxy.gettingProxy=true,不可以给对象属性赋值");
        this.$modifiedValue=newValue===undefined?Undefined:(newValue===null?Null:newValue);
        return this;
    }
    $update():boolean{
        let newValue = this.$modifiedValue;
        this.$modifiedValue=undefined;
        if(newValue===undefined) return true;
        newValue =newValue===Undefined?undefined:newValue;
        let oldValue = this.$raw();
        if(newValue!==oldValue) {
            this.$raw(newValue);
            let evtArgs:IChangeEventArgs = {type:ChangeTypes.Value,value:newValue,old:oldValue,sender:this};
            this.$notify(evtArgs);
            return !evtArgs.cancel;
        }
        return true;
        
    }

    toString(){return this.$raw().toString();}
    static gettingProxy:boolean;
}
buildNotPublics(ValueProxy,["$modifiedValue","$type","$raw","$get","$set","$update","$extras"]);

export interface IObjectMeta{
    propBuilder?:(proxy:IObjectProxy,props:{[name:string]:ValueProxy})=>any;
    fieldnames?:string[];
    methodnames?:string[];
}

export class ObjectProxy extends ValueProxy implements IObjectProxy{
    $props:{[name:string]:ValueProxy};
    constructor(raw:()=>any,meta:IObjectMeta){
        super(raw);
        this.$type = ValueTypes.Object;
        let props = this.$props={};
        if(meta.fieldnames)
            for(let i in meta.fieldnames)((name:string,proxy:IObjectProxy)=>{
                Object.defineProperty(this,name,{
                    enumerable:true,configurable:false,get:()=>proxy.$get()[name],set:(newValue:any)=>proxy.$get()[name]=newValue
                });
            })(meta.fieldnames[i],this);
        
        if(meta.methodnames)    
            for(let i in meta.methodnames)((name:string,proxy:IObjectProxy)=>{
                Object.defineProperty(this,name,{
                    enumerable:false,configurable:false,get:()=>proxy.$get()[name],set:(newValue:any)=>proxy.$get()[name]=newValue
                });
            })(meta.methodnames[i],this);

        if(meta.propBuilder) meta.propBuilder(this,props);
    }

    $get():any{
        if(ValueProxy.gettingProxy) return this;
        return this.$modifiedValue===undefined?(this.$raw()||null):this.$modifiedValue;
        
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
        if(!result) return false;
        for(let n in this.$props){
            this.$props[n].$update();
        }
        return result;
    }
}

buildNotPublics(ObjectProxy,["$modifiedValue","$raw","$get","$set","$update","$props"]);


export interface IArrayChangeEventArgs extends IChangeEventArgs{
    
    item_value?:any;
}

export class ArrayProxy extends ValueProxy{
    $itemConvertor:(item_value:any,proxy:IArrayProxy)=>any;
    $changes:IArrayChangeEventArgs[];
    $length:number;
    length:number;
    constructor(raw:()=>any,item_convertor?:(item_value:any,proxy:IArrayProxy)=>any){
        super(raw);
        this.$type = ValueTypes.Array;
        this.$itemConvertor = item_convertor;
    }
    
    item(index:number,item_value?:any):any{
        if(item_value===undefined){
            return (this as any)[index];
        }
        let len = this.length;
        let item = this.$itemConvertor?this.$itemConvertor(item_value,this):item_value;
        let oldItem :any;
        if(len-1<index)  {
            this.$length = index+1;
            Object.defineProperty(this,index.toString(),{enumerable:true,configurable:true,value:item});
        }else {
            oldItem = this[index];
            this[index] = item;
        }
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Push,
            index:index,
            value:item,
            old:oldItem,
            item_value:item_value
        });
    }

    push(item_value:any):ArrayProxy{
        let index = this.length;
        let item = this.$itemConvertor?this.$itemConvertor(item_value,this):item_value;
        Object.defineProperty(this,index.toString(),{enumerable:true,configurable:true,value:item});
        this.$length++;
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Push,
            index:index,
            value:item
        });
        return this;
    }

    pop():any{
        let len = this.length;
        if(len===undefined)return;
        let removeItem = this[len];
        delete (this as any)[len];
        this.$length--;
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Pop,
            value:removeItem,
            index:len
        });
        
        return removeItem;
    }

    unshift(item_value:any):ArrayProxy{
        let item = this.$itemConvertor?this.$itemConvertor(item_value,this):item_value;
        //let changes = ;
        let len = this.length;
       
        Object.defineProperty(this,len.toString(),{
            enumerable:true,configurable:true,value:(this as any)[len]
        });
        for(let i =len-1,j=1;i>=j;i--){
            (this as any)[i]=(this as any)[i];
        }
        Object.defineProperty(this,len.toString(),{
            enumerable:true,configurable:true,value:(this as any)[0]
        });
        this.$length++;
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Unshift,
            index:0,
            value:item,
            item_value:item_value
        });
        return this;
    }
    shift():any{
        let len = this.length;
        if(len===undefined)return;
        let removeItem = this[0];
        for(let i =1,j=len;i<j;i++){
            (this as any)[i-1] = (this as any)[i];
        }
        delete (this as any)[len];
        this.$length--;
        (this.$changes || (this.$changes=[])).push({
            sender:this,
            type:ChangeTypes.Shift,
            value:removeItem,
            index:0
        });
        return removeItem;
    }
    $update():boolean{
        if(!super.$update()) return true;
        if(!this.$changes) return true;
        
        let arr = this.$raw();
        for(let i in this.$changes){
            let change = this.$changes[i];
            switch(change.type){
                case ChangeTypes.Push:
                    arr.push(change);
                    this.$notify(change);
                    if(change.cancel!==true && change.value && change.value.$notify) change.value.$notify(change);
                    break;
                case ChangeTypes.Pop:
                    arr.pop(change);
                    this.$notify(change);
                    if(change.cancel!==true && change.value && change.value.$notify) change.value.$notify(change);
                    break;
                case ChangeTypes.Unshift:
                    arr.unshift(change);
                    this.$notify(change);
                    if(change.cancel!==true && change.value && change.value.$notify) change.value.$notify(change);
                    break;
                case ChangeTypes.Shift:
                    arr.shift(change);
                    this.$notify(change);
                    if(change.cancel!==true && change.value && change.value.$notify) change.value.$notify(change);
                    break;
                case ChangeTypes.Item:
                    arr.shift(change);
                    this.$notify(change);
                    if(change.cancel!==true && change.value && change.value.$notify) change.value.$notify(change);
                    break;
            }
        }
        return true;
    }
    
}
buildNotPublics(ArrayProxy,["push","pop","unshift","shift","item","$changes","$update"]);
buildNotPublics(ArrayProxy,{
    length:{
        get:function():number{
            if(this.$length===undefined) {
                let raw = this.$raw();
                this.$length = raw.length;
                for(let i =0,j=raw.length;i<j;i++){
                    Object.defineProperty(this,i.toString(),{
                        enumerable:true,configurable:true,value:this.$itemConvertor?this.$itemConvertor(raw[i]):raw[i]
                    });
                }
            }
            return this.$length;
        }
        ,set:function(newLen:number){
            throw new Error("Not implement");
        }
    }
});
 
 
//================================================
 

export interface IModel {
    parent?:IModel;
    props:{[propName:string]:IProperty};
    path:string;
    ref_prop?:IProperty;
    prop:(name:string,sure?:boolean)=>IProperty;
    createProxy(raw:(value?:any)=>any):IValueProxy;
    asArray:()=>IModel;
}



export interface IProperty{
    name:string;
    path:string;
    model:IModel;
    type:ValueTypes;
    value_model?:IModel;
    item_model?:IModel;
    //buildPropertyProxy(proxy:IModelProxy):IPropertyProxy;
    asObject():IModel;
    asArray():IModel;
    //getValue:(actual?:boolean)=>IProperty;
    //setValue:(newValue:any,extra?:any)=>IProperty;
    //clone:(proxy:any)=>IProperty;
    //update:()=>boolean;
}








function array_in(arr:any[],value:any):boolean{
    for(let i in arr) if(arr[i]===value) return true;
    return false;
}



/*

export class Model implements IModel{
    type:ValueTypes;
    props:{[propName:string]:IProperty};
    item_model?:IModel;
    path:string;
    parent?:IModel;
    ref_prop?:IProperty;
    constructor(name?:string,refProp?:IProperty){
        this.type = ValueTypes.Value;
        this.path = name;
        this.props={};
        if(this.ref_prop = refProp) this.parent = refProp.model;
        
    }
    
    createProxy(raw:(value?:any)=>any):IValueProxy{
        
        return null;
        
    }

    private _createObjectProxy(raw:(value?:any)=>any):IObjectProxy{
        let fieldnames :string[]=[];
        let target = raw();
        if(!target) raw(target = {});
        let methodnames :string[]= [];
        for(let n in target){
            if(!this.props[n]) (typeof target[n]==="function"?methodnames:fieldnames).push(n);
        }

        let objectProxyBuilder = (proxy:IObjectProxy,propMaker:(name:string,prop:IValueProxy)=>void)=>{
            for(let i in methodnames){
                let methodname = methodnames[i];
                proxy[methodname] = target[methodname];
            }
            for(let i in fieldnames)((fieldname:string,target:any)=>{
                Object.defineProperty(proxy,fieldname,{
                    get:()=>target[fieldname],
                    set:(value) =>target[fieldname] = value
                });
            })(fieldnames[i],target);
            for(let n in this.props)((propName:string,prop:IProperty,target:any)=>{
                let propProxy:IValueProxy;
                let propRaw :(value?:any)=>any;
                if(prop.type=== ValueTypes.Object){
                    propRaw = (propValue?:any)=>{
                        if(propValue===undefined) {
                            let value = raw()[propName];
                            if(!value) raw(value={});
                            return value;
                        } 
                        raw()[propName] = propValue||{};
                    };
                    propProxy = prop.value_model.createProxy(propRaw);
                } 
                else if(prop.type == ValueTypes.Array) {
                    propRaw = (propValue?:any)=>{
                        if(propValue===undefined) {
                            let value = raw()[propName];
                            if(!value) raw(value=[]);
                            return value;
                        } 
                        raw()[propName] = propValue||[];
                    };
                    propProxy = new ArrayProxy(propRaw);
                }else{
                    propRaw = (propValue?:any)=>{
                        if(propValue===undefined) {
                            return raw()[propName];
                        } 
                        raw()[propName] = propValue;
                    };
                    propProxy = new ValueProxy(propRaw);
                }
                propMaker(propName,propProxy);
            })(n,this.props[n],target);

            
        };

        this.createProxy = (target:any):IObjectProxy=>new ObjectProxy(raw,objectProxyBuilder);
        return new ObjectProxy(raw,objectProxyBuilder);
    }
    private _createArrayProxy(raw:(value?:any)=>any):IArrayProxy{
        let itemConvertor = this.item_model?(item_value)=>this.item_model.createProxy(()=>item_value):null;
        return new ArrayProxy(()=>raw);
    }
    prop:(name:string,sure?:boolean)=>IProperty;
    asArray:()=>IModel;
}


export class Property implements IProperty{
    model:IModel;
    name:string;
    path:string;
    type:ValueTypes;
    value_model?:IModel;
    item_model?:IModel;
    constructor(model:IModel,name:string){
        this.model= model;
        this.name = name;
        this.type = ValueTypes.Value;
        if(name){
            this.path= model.path ? model.path+"."+name : name;
        }
    }

    buildPropertyProxy(proxy:IModelProxy):IPropertyProxy{
        return null;
    }
    
    asObject():IModel{
        this.type = ValueTypes.Object;
        return this.value_model = new Model(this.path,this);
        
    }

    asArray():IModel{
        this.type = ValueTypes.Array;
        return this.item_model = new Model(this.path,this);
        
    }
    

}




export class PropertyProxy extends ValueObservable implements IPropertyProxy{
    $prop:IProperty;
    $proxy:IModelProxy;
    $name:string;
    $target:any;
    $modifiedValue:any;
    
    constructor(prop:IProperty,proxy:IModelProxy){
        super();
        this.$prop = prop;
        this.$proxy = proxy;
        this.$name = prop.name;
    }

    $getValue(actual?:boolean):any{
        if(PropertyProxy.gettingAccessor) return this;
        
        //要求真实数据，或者属性值未变更，就返回原先的值
        if(actual ) return this.$proxy.$target[this.$name];
        if(this.$modifiedValue===undefined){
            let actualValue =  this.$proxy.$target[this.$name];
            this.$modifiedValue = actualValue===undefined?Undefined:this.$prop.value_model.createModelProxy(actual);
        }
        //返回变更后的属性值
        return this.$modifiedValue===Undefined?undefined:this.$modifiedValue;
    }

    $setValue(newValue:any):IPropertyProxy{
        if(PropertyProxy.gettingAccessor) throw new Error("PropertyProxy.gettingAccessor=true,不可以给对象属性赋值");
        this.$modifiedValue=newValue;
        return this;
    }
    $update():boolean{
        let newValue = this.$modifiedValue;
        this.$modifiedValue=undefined;
        if(newValue===undefined) return false;
        newValue =newValue===Undefined?undefined:newValue;
        let oldValue = this.$proxy.$target[this.$name];
        if(newValue!==oldValue) this.$proxy.$target[this.$name] = newValue;
        let evtArgs:IChangeEventArgs = {value:newValue,old:oldValue,sender:this};
        this.$notify(evtArgs);
        return true;
    }
    static gettingAccessor:boolean;
}

buildNotPublics(PropertyProxy,false,["$modifiedValue","$property","$proxy","$name"]);
buildNotPublics(PropertyProxy,true,["$getValue","$setValue","$update"]);

export class ObjectPropertyProxy extends PropertyProxy{
    constructor(prop:IProperty,proxy:IModelProxy){
        super(prop,proxy);
    }

    $getValue(actual?:boolean):any{
        if(PropertyProxy.gettingAccessor) return this;
        //要求真实数据，或者属性值未变更，就返回原先的值
        if(actual ) return this.$proxy.$target[this.$name];
        if(this.$modifiedValue===undefined){
            this.$modifiedValue = actualValue===undefined?Undefined:this.$prop.value_model.createModelProxy(actual);
        }
        //返回变更后的属性值
        return this.$modifiedValue===Undefined?undefined:this.$modifiedValue;
    }
}

function getByVal(actual?:boolean):any{
    if(PropertyProxy.gettingAccessor) return this as IPropertyProxy;
    //要求真实数据，或者属性值未变更，就返回原先的值
    if(actual || this.$_cachedValue===undefined) return (this as IPropertyProxy).$proxy.$target[(this as IPropertyProxy).$name];
    //返回变更后的属性值
    return this.$_cachedValue===Undefined?undefined:this.$_cachedValue;
}


function getByArr(actual?:boolean):any{
    if(PropertyProxy.gettingAccessor) return this as IPropertyProxy;
    let actualValue =  (this as IPropertyProxy).$proxy.$target[(this as IPropertyProxy).$name];
    //要求真实数据，或者属性值未变更，就返回原先的值
    if(actual ) return actualValue;
    if(this.$_cachedValue===undefined){
        this.$_cachedValue = actualValue===undefined?Undefined:(this as IPropertyProxy).$prop.value_model.createModelProxy(actual);
    }
    //返回变更后的属性值
    return this.$_cachedValue===Undefined?undefined:this.$_cachedValue;
}






export function Action() { 
    return function (target:any, methodName: string, descriptor: PropertyDescriptor) {
        descriptor.configurable=descriptor.enumerable=descriptor.writable=false;
        let actual :Function= target[methodName];
        let wrapper = function(){
            let actionResult = actual.apply(target,arguments);
            if(target.refresh) target.refresh();
        };
    }
}

export function component(target:Function){
    //找到view函数
    let views :{[viewName:string]:any} = (target as any).views;
    for(let n in views){
        let view = views[n];

    }
}

export class Component{

}

function createComponent(component:Function,context:any){
    let instance = (component as any).createProxy(context);
}

*/