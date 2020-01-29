
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
export function intimate(strong?:boolean){
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
export interface IObservable<TEvtArgs>{
     
    /**
     * 内部的主题列表，可以访问它，但不推荐直接使用，主要是debug时使用
     * 如果不指明主题topic，默认topic=""
     * @type {[topic:string]:Function[]}
     * @memberof IObservable
     */
    

    $_topics:{[topic:string]:Function[]};
    
    /**
     * 注册监听函数
     * $notify的时候，注册了相关主题的监听函数会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 监听函数或则主题
     * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
     * @returns {IObservable<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $subscribe(topicOrListener:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):IObservable<TEvtArgs>;
    
    /**
     * 取消主题订阅
     * $notify操作时，被取消的监听器不会被调用
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 要需要的主题或监听器
     * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
     * @returns {IObservable<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $unsubscribe(topicOrListener:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):IObservable<TEvtArgs>;

    /**
     * 发送通知
     * 如果相关主题上有监听器，会逐个调用监听器
     * 如果不指明主题topic，默认topic=""
     *
     * @param {(string|TEvtArgs)} topicOrEvtArgs 通知的主题或事件参数
     * @param {TEvtArgs} [evt] 事件参数，只有topicOrEvtArgs是topic才需要该参数
     * @returns {IObservable<TEvtArgs>} 可监听对象
     * @memberof IObservable
     */
    $notify(topicOrEvtArgs:string|TEvtArgs,evt?:TEvtArgs):IObservable<TEvtArgs>;
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
export class Observable<TEvtArgs> implements IObservable<TEvtArgs>{
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
     * @returns {IObservable<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $subscribe(topicOrListener:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):IObservable<TEvtArgs>{
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
     * @returns {IObservable<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $unsubscribe(topicOrListener:string|{(evt:TEvtArgs):any},listener?:{(evt:TEvtArgs):any}):IObservable<TEvtArgs>{
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
     * @returns {IObservable<TEvtArgs>} 可监听对象
     * @memberof Observable
     */
    $notify(topicOrEvtArgs:string|TEvtArgs,evtArgs?:TEvtArgs):IObservable<TEvtArgs>{
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

export enum ProxyAccessModes{
    Default,
    Raw,
    Proxy
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
    $type:DataTypes;
    $extras?:any;
    $target?:any;
    $get():any;
    $set(newValue:any):IObservableProxy;
    $update():boolean;
}

export interface IInternalObservableProxy extends IObservableProxy{
    $_index?:string|number;
    $_modifiedValue?:any;
    $_owner?:IObservableProxy;
    $_raw:(value?:any)=>any;
    
}





let Undefined = {};


@intimate()
export class ObservableProxy extends Observable<IChangeEventArgs> implements IObservableProxy{
    @intimate()
    $type:DataTypes;

    @intimate()
    $target:any;

    @intimate()
    $extras?:any;

    @intimate()
    $_index:number|string;
    @intimate()
    $_modifiedValue:any;
    
    @intimate()
    $_owner?:ObservableProxy;

    @intimate()
    $_raw:(value?:any)=>any;

    constructor(raw?:(val?:any)=>any,initValue?:any,extras?:any){
        super();
        if(initValue!==undefined){
            this.$target = initValue===Undefined?undefined:initValue;
            if(raw) raw.call(this,this.$target);
        }else if(raw) this.$target = raw.call(this);
        this.$_raw = raw;
        this.$extras = extras;
        this.$type= DataTypes.Value;
    }

    $get():any{
        if( ObservableProxy.accessMode===ProxyAccessModes.Proxy) return this;
        if(ObservableProxy.accessMode===ProxyAccessModes.Raw) return this.$_raw();
        return (this.$_modifiedValue===undefined)?this.$target:(this.$_modifiedValue===Undefined?undefined:this.$_modifiedValue);
    }

    $set(newValue:any):IObservableProxy{
        if(ObservableProxy.accessMode===ProxyAccessModes.Raw) {this.$_raw.call(this,newValue);return this;}
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
            let evtArgs:IChangeEventArgs = {type:ChangeTypes.Value,value:newValue,old:oldValue,sender:this};
            this.$notify(evtArgs);
            return evtArgs.cancel!==true;
        }
        return true;
        
    }

    toString(){let rawValue= this.$_raw();return rawValue?rawValue.toString():rawValue;}
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
    $prop(name:string,prop:IObservableProxy|boolean|{(proxy:ObservableObject,name:string):any}|PropertyDecorator):IObservableObject;
    [index:string]:any;   
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
    constructor(raw:(val?:any)=>any,initValue?:object,extras?:any){
        super(raw,initValue,extras);
        let target = this.$target;
        if(!target) raw.call(this,target=this.$target={});
        
        defineMembers(this,{
            "$target":target,
            "$type":DataTypes.Object
        });

        this.$type = DataTypes.Object;
    }

    $prop(name:string,prop:IObservableProxy|boolean|{(proxy:ObservableObject,name:string):any}|PropertyDecorator):ObservableObject{
        if(prop ===false){
            Object.defineProperty(this,name,{
                enumerable:true,configurable:false,
                get:()=>(this.$_modifiedValue===undefined?this.$target:(this.$_modifiedValue===Undefined?null:this.$_modifiedValue))[name],
                set:(newValue:any)=>(this.$_modifiedValue===undefined?this.$target:(this.$_modifiedValue===Undefined?null:this.$_modifiedValue))[name]=newValue
            });
            return this;
        }
        if(prop===true || prop instanceof ObservableProxy){
            prop = prop instanceof ObservableProxy?prop :(new ObservableProxy(prop_raw(name,this)));
            (prop as ObservableProxy).$_owner = this;
            (prop as ObservableProxy).$_index = name;
            Object.defineProperty(this,name,{
                enumerable:true,
                configurable:false,
                get:(prop as IObservableProxy).$type === DataTypes.Value?()=>(prop as IObservableProxy).$get():()=>prop,
                set:(val:any)=>(prop as IObservableProxy).$set(val)
            });                
            
            return this;
        }
        
        if( typeof prop==='function'){
            let prop_value:any;
            Object.defineProperty(this,name,{
                enumerable:false,
                configurable:false,
                get:()=>{
                    if(prop_value===undefined) prop_value=(prop as Function).call(this,this,name);
                    return prop_value.get?prop_value.get():prop_value.$get();
                },
                set:(val)=>{
                    if(prop_value===undefined) prop_value=(prop as Function).call(this,this,name);
                    return prop_value.set?prop_value.set(val):prop_value.$set(val);
                }
            });  
            return this;
        }
        Object.defineProperty(this,name,prop);
        return this;
    }

    $get():any{
        if(ObservableProxy.accessMode===ProxyAccessModes.Raw) return this.$_raw();
        return this;
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

function define_item(arrProxy:ObservableArray,index:number,item:ObservableProxy){
    if(item!==Undefined){
        item.$_index = index;
        item.$_owner = arrProxy;
        Object.defineProperty(arrProxy,index.toString(),{
            enumerable:true,
            configurable:true,
            get:item.$type===DataTypes.Value?()=>item.$get():()=>item,
            set:(val)=>item.$set(val)
        }); 
        
    }
}

export class ObservableArray extends ObservableProxy{
    $itemConvertor:(index:number,item_value:any,proxy:ObservableArray)=>ObservableProxy;
    $changes:IChangeEventArgs[];
    [index:number]:any;
    $length:number;
    length:number;
    constructor(raw:(val?:any)=>any,item_convertor?:(index:number,item_value:any,proxy:ObservableArray)=>IObservableProxy,initValue?:any[],extras?:any){
        let target:any;
        super(raw,initValue,extras);
        target = this.$target;
        if(Object.prototype.toString.call(target)!=="[object Array]") raw.call(this,target=this.$target=[]);
        
        item_convertor ||(item_convertor=(index,item_value,proxy)=>{
            let item = new ObservableProxy(null);
            item.$_index = index;
            item.$_raw = item_raw(this);
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
            "$type":DataTypes.Array,
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
            this.$_raw(newValue);return this;
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
                insertedItem.$_owner = this;
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
        item.$_owner = this;
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
export class ObservableSchema{
    $type:DataTypes;
    $index:string|number;
    $path:string;
    
    //$prop_models:{[index:string]:Model};
    $owner_schema?:ObservableSchema;
    $item_schema?:ObservableSchema;
    $init_data?:any;
    constructor(index?:string|number,owner?:ObservableSchema){
        let path;
        index = index===undefined|| index===null?"":index;
        if(owner){
            let ppath = owner.$path;
            path = ppath?ppath + "." + index:index;
        }else path = index;

        defineMembers(this,{
            "$type":DataTypes.Value
            ,"$index":index
            ,"$path":path
            ,"$owner_schema":owner
            ,"$item_schema":null
            ,"$init_data":undefined
        });
    }
    $init(initData:any):ObservableSchema{
        this.$init_data = initData;
        let t = Object.prototype.toString.call(initData);
        if(t==="[object Object]") {
            this.$type = DataTypes.Object;
            
            for(const n in initData){
                if(n===ObservableArray.structToken) continue;
                let memberSchema = new ObservableSchema(n,this).$init(initData[n]);
                Object.defineProperty(this,n,{enumerable:true,configurable:false,writable:false,value:memberSchema});
            }
        }
        else if(t==="[object Array]"){
            this.$type = DataTypes.Array;
            for(const i in initData){
                let item = initData[i];
                this.$item_schema = new ObservableSchema(-1,this).$init(item);
                break;
            }
        }
        else{
            this.$type = DataTypes.Value;
        }
        return this;
    }
    $createProxy(initData:any,ownerProxy?:IObservableProxy){
        if(!ownerProxy){
            if(initData instanceof ObservableProxy){
                ownerProxy = initData;
                initData=undefined;
            }
        }

        let raw :(val?:any)=>any;
        if(this.$index!==undefined&& this.$owner_schema){
            raw = this.$owner_schema.$type=== DataTypes.Object
                ? prop_raw(this.$index as string,ownerProxy as IObservableObject)
                : item_raw(ownerProxy as IObservableArray);
        } 
        else raw = (val?:any)=>val===undefined?initData:initData=val;    

        let proxy:IObservableProxy;
        let type = this.$type;
        if(type===DataTypes.Value) {
            proxy = new ObservableProxy(raw,initData,this);
        }else if(type === DataTypes.Object){
            //let self:Model;
            proxy = new ObservableObject(raw,initData,this);
            for(const n in this){
                let schema:any = this[n];
                if(schema instanceof ObservableSchema){
                    (proxy as IObservableObject).$prop(n,schema.$createProxy(initData[n],proxy));
                }
            }
        }else if(type===DataTypes.Array){
            let item_convertor:(index:number,item_value:any,proxy:IObservableArray)=>IObservableProxy;
            if(this.$item_schema){
                item_convertor = (index:number,item_value:any,proxy:IObservableArray):IObservableProxy=>
                    this.$item_schema.$createProxy(item_value,proxy);
            }
            proxy = new ObservableArray(raw,item_convertor,initData,this);
            
        }
        return proxy;
    }
}


//=======================================================================




export enum ComponentReadyStates{
    Defined,
    Completed
}

export interface IComponentMeta {
    $reactives?:{[attr:string]:ReactiveTypes};
    $templates?:{[attr:string]:string|Function};
    $actions?:{[attr:string]:string};
    $wrapType?:Function;
    $rawType?:Function;
    $tag?:string;
    $render?:(component:IComponent,partial:string,container:any)=>any;
    $readyState?:ComponentReadyStates;
}

export type TComponentType = {new ():any} & IComponentMeta;



export interface IComponent{
    [attr:string]:any;
}




export enum ReactiveTypes{
    Local,
    In,
    Out,
    Ref,
    Each
}

export const componentTypes: {[tag:string]:{new():{}}}={};

let currentComponentType:TComponentType;

export function reactive(type?:ReactiveTypes|string):any{
    return function(target:any,propName:string){
        type = typeof type ==="string"?ReactiveTypes[type]:type;
        (target.$reactives || (target.$reactives=[]))[propName] = type || ReactiveTypes.Local;
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

export function component(tag:string|TComponentType){
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
                
                intializeActions(this,WrappedType,RawType);
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
        initializeReactives(WrappedType);
        initializeTemplates(WrappedType);
        componentTypes[tag as string] = WrappedType;
        Object.defineProperty(WrappedType,"$readyState",{enumerable:false,configurable:false,writable:false,value:true});
    
        
        return WrappedType;
    }
    
    if(typeof tag==="function"){
        let rawType = tag as Function;
        return decorator(rawType as any);
    }else return decorator;
}
function initializeTemplates(WrappedType:TComponentType){
    let templates = WrappedType.$templates;
    
    Object.defineProperty(WrappedType,"$render",{enumerable:false,configurable:false,writable:false,value:function(component:IComponent,partial?:string,container?:any):any{
        partial||(partial="");
        let nameOrMethod = templates[partial];
        if(nameOrMethod!==undefined){
            if((nameOrMethod as any).$virtual_node!==undefined) return (nameOrMethod as Function).call(component,container);
            let renderMethod = component[nameOrMethod as string] as any;
            if(!renderMethod) return;
            
            let templateMethod:Function;
            let node :any;
            let accessMode = ObservableProxy.accessMode;
            try{
                
                ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                node = renderMethod.call(component,container);
                if(ELEMENT.isElement(node)){
                    templateMethod = renderMethod;
                    Object.defineProperty(templateMethod,"$virtual_node",{enumerable:false,writable:false,configurable:false,value:false});
                }else{
                    templateMethod = (component:IComponent,_container:any)=>(node as VirtualNode).render(component,container);
                    Object.defineProperty(templateMethod,"$virtual_node",{enumerable:false,writable:false,configurable:false,value:node});
                }
            }finally{
                ObservableProxy.accessMode = accessMode;
            }
            component[nameOrMethod as string] = templateMethod;
            return templateMethod === renderMethod?node:templateMethod.call(component,component,container);

        }
        return undefined;
    }});
}

function intializeActions(component:any,WrappedType:TComponentType,RawType:TComponentType){
    Object.defineProperty(component,"$private_updateTick",{
        enumerable:false,configurable:false,writable:true,value:undefined
    });

    let actions = WrappedType.$actions;
    for(const n in actions)((name:string,method:Function,component:any,WrappedType:TComponentType)=>{
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
        Object.defineProperty(action,"$actionName",{
            enumerable:false,configurable:false,writable:false,value:name
        });
    })(n,RawType.prototype[n],component,WrappedType);
}

function initializeReactives(WrappedType:TComponentType){
    let reactives = WrappedType.$reactives;
    if(reactives)for(const n in reactives)((name:string,reactiveType:ReactiveTypes,component:any)=>{
        let privateName = `$private_${name}`;
        let initData = component[name];
        let model = new ObservableSchema(name,initData);
        if(reactiveType=== ReactiveTypes.Each){
            defineReactive(name,privateName,WrappedType,enumerableReactiveCreator(name,()=>model.$createProxy(initData)),true);
        }else {
            defineReactive(name,privateName,WrappedType,()=>model.$createProxy(initData),false);
        }
        
    })(n,reactives[n],WrappedType.prototype);        
}

function enumerableReactiveCreator(name:string,proxyCreator:()=>IObservableProxy):any{
    return function createEnumerableProxy(proxy?:IObservableProxy){
        let component:IComponent= this;
        proxy ||(proxy=proxyCreator()) ;
        Object.defineProperty(proxy,"$new",{
            enumerable:false,configurable:false,writable:false,value:function(){
                let newProxy = proxyCreator();
                createEnumerableProxy.call(component,newProxy);
                Object.defineProperty(component,name,{
                    enumerable:true,configurable:true,get:()=>newProxy.$get(),set:(val)=>newProxy.$set(val)
                });
                return newProxy;
            }
        });
        Object.defineProperty(proxy,"$replace",{
            enumerable:false,configurable:false,writable:false,value:function(newProxy:IObservableProxy){
                createEnumerableProxy.call(component,newProxy);
                Object.defineProperty(component,name,{
                    enumerable:true,configurable:true,get:()=>newProxy.$get(),set:(val)=>newProxy.$set(val)
                });
                return newProxy;
            }
        });
        return proxy;
    }
}



function defineReactive(name:string,privateName:string,WrappedType:TComponentType,proxyCreator:()=>IObservableProxy,configurable:boolean){
    let descriptor = {
        enumerable:true,
        configurable:true,
        get:function(){
            let proxy = this[privateName];
            if(!proxy) Object.defineProperty(this,privateName,{enumerable:false,writable:false,configurable:true,value:proxy=proxyCreator.call(this)});
            else{
                delete this[privateName];
                Object.defineProperty(this,name,{
                    enumerable:true,configurable:configurable,get:()=>proxy.$get(),set:(val)=>proxy.$set(val)
                });
            } 
            return proxy.$get(); 
        },
        set:function(val){
            let proxy = this[privateName];
            if(!proxy) Object.defineProperty(this,privateName,{enumerable:false,writable:false,configurable:true,value:proxy=proxyCreator.call(this)});
            else{
                delete this[privateName];
                Object.defineProperty(this,name,{
                    enumerable:true,configurable:configurable,get:()=>proxy.$get(),set:(val)=>proxy.$set(val)
                });
            } 
            proxy.$set(val); 
        }
    };
    Object.defineProperty(WrappedType.prototype,name,descriptor);
}


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
        let actualRenderFn = new Function("variables","ELEMENT","component","container",codeText) as {(variables,ELEMENT:any,component:IComponent,container?:any):any};
        this.render =(component,container)=> actualRenderFn(variables,ELEMENT,component,container);
        return this.render(component,container);
    }

    renderChildren(component:IComponent,container?:any):any{
        let variables :any[]=[];
        let actualRenderFn = new Function("ELEMENT","component","elem",this.genChildrenCodes(variables).join("")+"return children;\n") as {(ELEMENT:any,component:IComponent,container?:any):any};
        this.renderChildren =(component,container)=> actualRenderFn(ELEMENT,component,container);
        return this.renderChildren(component,container);
    }
}

export class VirtualTextNode extends VirtualNode{
    
    constructor(public content:any){
        super();
    }
    genCodes(variables:any[],codes?:string[],tabs?:string):string[]{
        codes || (codes=[]);tabs || (tabs="");
        if(this.content instanceof ObservableProxy){
            if(this.content.$extras.path==="name") debugger;
            codes.push(`${tabs}var proxy=component.${this.content.$extras.path};\n`);
            codes.push(`${tabs}var elem=ELEMENT.createText(proxy.$get());\n`);
            codes.push(`${tabs}proxy.$subscribe(function(e){elem.nodeValue = ELEMENT.changeEventToText(e);})\n`);
        }else{
            codes.push(`${tabs}var elem = ELEMENT.createText('${this.content.replace(/'/,"\\'")}');\n`);
        }
        codes.push(`${tabs}if(container) ELEMENT.appendChild(container,elem);\n`);
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
        codes.push(`${tabs}var elem=ELEMENT.createElement("${this.tag}");\n`);
        
        let repeatPars :any[];
        for(const attrname in this.attrs){
            let attrValue= this.attrs[attrname];
            if(attrname==="repeat") {
                repeatPars = [];
                for(let i in attrValue) repeatPars.push(`component.${attrValue[i].$extras.path}`);
                continue;
            }
            
            if(attrValue&& attrValue.$actionName){
                let match = attrname.match(evtnameRegx);
                let evtName = match?match[1]:attrname;
                codes.push(`${tabs}ELEMENT.attach(elem,"${evtName}",component.${attrValue.$actionName});\n`);
            }else if(attrValue instanceof ObservableProxy){
                let binder = attrBinders[name];
                if(binder)
                    codes.push(`${tabs}ELEMENT.$attrBinders["${attrname}"].call(component,elem,compnent.${attrValue.$extras.path});\n`);
                else 
                    codes.push(`${tabs}ELEMENT.setAttribute(elem,"${attrname}","${attrValue}");\n`);
            }else {
                codes.push(`${tabs}ELEMENT.setAttribute(elem,"${attrname}","${attrValue}");\n`);
            }
        }
        codes.push(`${tabs}if(container) ELEMENT.appendChild(container,elem);\n`);

        if(repeatPars){
            codes.push(`${tabs}ELEMENT.$repeat(component,elem,vars[${variables.length}],${repeatPars.join(",")});\n`);
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
                codes.push(`${tabs}children.push(child=(function(ELEMENT,component,container){\n`);
                child.genCodes(variables,codes,subTabs);
                codes.push(`${tabs}})(ELEMENT,component,elem));\n`);
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
        let ComponentType = this.content as TComponentType;
        for(const attrName in this.attrs){
            let attrValue = this.attrs[attrName];
            let reactiveType = ComponentType.$reactives[attrName];
            if(reactiveType===ReactiveTypes.Local || reactiveType===ReactiveTypes.Each) throw new Error(`${this.tag}.${attrName}是内部变量，不可以在外部赋值`);
            
            if(reactiveType === ReactiveTypes.Out){
                if(attrValue instanceof ObservableProxy){
                    codes.push(`${tabs}subComponent.${attrName}.$subscribe(function(e){component.${attrValue.$extras.path}.$set(e.item?e.item.$get():e.value);});\n`);
                    
                }else {
                    codes.push(`${tabs}subComponent.${attrName}.$subscribe(function(e){component.${attrName}=e.item?e.item.$get():e.value;});\n`);
                }
            }else if(reactiveType===ReactiveTypes.In){
                if(attrValue instanceof ObservableProxy){
                    codes.push(`${tabs}subComponent.${attrName}.$set(component.${attrValue.$extras.path}.$get());\n`);
                }else{
                    codes.push(`${tabs}subComponent.${attrName}.$set(component.${attrName});\n`);
                }
                
            }else if(reactiveType===ReactiveTypes.Ref){
                if(attrValue instanceof ObservableProxy){
                    codes.push(`${tabs}subComponent.${attrName}.$subscribe(function(e){component.${attrValue.$extras.path}.$set(e.item?e.item.$get():e.value);});\n`);
                    codes.push(`${tabs}component.${attrValue.$extras.path}.$subscribe(function(e){subComponent.${attrName}.$set(e.item?e.item.$get():e.value);});\n`);
                }else {
                    codes.push(`${tabs}subComponent.${attrName}.$subscribe(function(e){component.${attrValue.$extras.path}.$set(e.item?e.item.$get():e.value);});\n`);
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
        codes.push(`${tabs}if(container) ELEMENT.appendChild(container,elem);\n`);
        return codes;
    }
}

function buildRepeat(component:IComponent,container:any,vnode:VirtualNode,each:IObservableProxy,value:IObservableProxy,key:IObservableProxy){
    ELEMENT.removeAllChildrens(container);
    
    for(let k in each){
        if(key)(key as any).$new(k);
        if(value) (value as any).$replace(each[k]);
        vnode.renderChildren(component,container);
    }
}



export let ELEMENT:any =function(tag:string,attrs:{[name:string]:any}){
    //modeling
    if(currentComponentType && (currentComponentType as IComponentMeta).$readyState!==ComponentReadyStates.Completed) {
        return;
    };
    let ComponentType = componentTypes[tag];
    let vnode:VirtualNode =ComponentType?new VirtualComponentNode(tag,attrs,ComponentType): new VirtualElementNode(tag,attrs);
    if(arguments.length>2){
        let children:VirtualNode[] = vnode.children=[];
        for(let i=2,j=arguments.length;i<j;i++){
            let child = arguments[i];
            if(!child) continue;
            if(child.tag)children.push(child);
            else children.push(new VirtualTextNode(child)); 
        }
    }
    return vnode; 
};
ELEMENT.$repeat =buildRepeat;
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

let attrBinders:{[name:string]:{(elem:any,bindValue:IObservableProxy,isBibind?:boolean):any}} ={};
function changeEventToText(e:IChangeEventArgs):string{
    let value = e.value===undefined?(e.item?e.item.$get():e.value):e.value;
    return (value===undefined || value===null)?"":value.toString();
}

attrBinders["value"] = (elem:any,bindValue:IObservableProxy,isBibind?:boolean)=>{
    bindValue.$subscribe((e:IChangeEventArgs)=>{
        (elem as HTMLInputElement).value = changeEventToText(e);
    });
    elem.value = bindValue.toString();
};

attrBinders["repeat"] = (elem:any,bindValue:IObservableProxy,isBibind?:boolean)=>{
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
    Observable, ProxyAccessModes,ObservableProxy,ObservableObject,ObservableArray, ObservableSchema,
    component,reactive,action,
    ELEMENT: ELEMENT
};
if(typeof window!=='undefined') (window as any).YA = YA;
export default YA;





