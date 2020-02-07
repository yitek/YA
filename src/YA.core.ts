

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

export function is_array(obj:any):boolean {
    if(!obj) return false;
    return Object.prototype.toString.call(obj)==="[object Array]";
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
    Value,
    Observable,
    Schema
}


export interface IObservable<TData> extends ISubject<IChangeEventArgs<TData>>{
    $type:DataTypes;
    $extras?:any;
    $target?:TData;
    $get(accessMode?:ObservableModes):TData|IObservable<TData>|ObservableSchema<TData>;
    $set(newValue:TData):IObservable<TData>;
    $update():boolean;
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

    constructor(init:IObservableIndexable<TData>|{(val?:TData):any}|TData,index?:any,extras?:any,initValue?:any){
        super();
        
        if(init instanceof ObservableObject || init instanceof ObservableArray){
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
    
        
        intimate(this, {
            $target:this.$target,$extras:this.$extras,$type:DataTypes.Value,$schema:this.$schema
            ,$_raw:this.$_raw,$_index:this.$_index,$_modifiedValue:undefined,$_owner:this.$_owner
        });
        if(this.$target instanceof Observable) 
            throw new Error("不正确的赋值");
    }
    

    $get(accessMode?:ObservableModes):TData|IObservable<TData>|ObservableSchema<TData>{
        if(accessMode===undefined) accessMode = Observable.accessMode;
        if(accessMode == ObservableModes.Raw ) return this.$_raw();
        if( accessMode == ObservableModes.Schema ) return this.$schema;
        if( accessMode == ObservableModes.Observable ) return this as IObservable<TData>;
        return (this.$_modifiedValue===undefined)?this.$target:(this.$_modifiedValue===Undefined?undefined:this.$_modifiedValue);
    }

    $set(newValue:TData):IObservable<TData>{
        if(newValue && newValue instanceof Observable) newValue = newValue.$get(ObservableModes.Value);
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
        let  currentValue = this.$get(ObservableModes.Default);
        return currentValue===undefined || currentValue===null?"":currentValue.toString();
    }
    static accessMode:ObservableModes = ObservableModes.Default; 
}



export interface IObservableObject<TData extends {[index:string]:any}> extends IObservable<TData>{
    //$prop(name:string,prop:IObservable<TData>|boolean|{(proxy:ObservableObject<TData>,name:string):any}|PropertyDecorator):IObservableObject<TData>;
    [index:string]:any;   
    $prop(name:string):Observable<any>;
}



@intimate()
export class ObservableObject<TData> extends Observable<TData> implements IObservableObject<TData>,IObservableIndexable<TData>{
    [index:string]:any;
    constructor(init:IObservableIndexable<any>|{(val?:TData):any}|TData,index?:any,extras?:any,initValue?:any){
        super(init,index,extras,initValue);
        this.$type = DataTypes.Object;
        if(!this.$target) this.$_raw(this.$target={} as any);
        if(!this.$schema){
            this.$schema = new ObservableSchema<TData>(this.$target);
            this.$schema.$initObject(this);
        }
        
        
    }

    $prop(name:string):any{
        observableMode(ObservableModes.Observable,()=>{
            return this[name];
        });
    }

    $get(accessMode?:ObservableModes):any{
        if(accessMode===undefined) accessMode = Observable.accessMode;
        if(accessMode=== ObservableModes.Raw ) return this.$_raw();
        if( accessMode == ObservableModes.Schema ) return this.$schema;
        if(accessMode===ObservableModes.Value){
            return observableMode(ObservableModes.Observable,()=>{
                let rs = {} as any;
                for(const n in this){
                    let prop = this[n] as any;
                    rs[n] = prop.$get(ObservableModes.Value);
                }
                return rs;
            });
        }
        
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
                ret += `${item.$get(ObservableModes.Default)}`;
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

    $get(accessMode?:ObservableModes):any{
        if(accessMode===undefined) accessMode = Observable.accessMode;
        if(accessMode=== ObservableModes.Raw ) return this.$_raw();
        if( accessMode == ObservableModes.Schema ) return this.$schema;
        if(accessMode===ObservableModes.Value){
            return observableMode(ObservableModes.Observable,()=>{
                let rs = [] as any;
                for(const n in this){
                    let prop = this[n];
                    rs.push(prop.$get(ObservableModes.Value));
                }
                return rs;
            });
        }
        
        return this;
    }

    $set(newValue:any):ObservableArray<TItem>{
        newValue || (newValue=[]);
        this.clear();
        super.$set(newValue);
        if(Observable.accessMode=== ObservableModes.Raw){
            return this;
        }
        
        for(const i in newValue)makeArrayItem(this,i as any as number);;
        this.$_length = newValue.length;
        
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
                case ChangeTypes.Remove:
                    change.sender.$notify(change);
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
                case ChangeTypes.Item:
                    arr[change.index] = change.value;
                    this.$notify(change);
                    if(change.cancel!==true){
                        let itemEvts :any= {};for(const n in change) itemEvts[n]=change[n];
                        itemEvts.sender =change.item;
                        itemEvts.type = ChangeTypes.Value;
                        itemEvts.sender.$notify(itemEvts);
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
        ,get:(mode?:ObservableModes) => item.$get(mode)
        ,set:(item_value:TItem)=>{
            (obArray.$_changes || (obArray.$_changes=[])).push({
                sender:obArray,
                type:ChangeTypes.Item,
                index:index,
                item:item,
                value:item_value
            });
            item.$set(item_value);
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
            
            return ob.get?ob.get(param):ob.$get(param);
        },
        set:function(val){
            let ob = this[private_prop_name];
            if(!ob) Object.defineProperty(this,private_prop_name,{
                enumerable:false,configurable:false,writable:false,value:ob=accessorFactory.call(this,target,name)
            });
            return ob.set?ob.set(val):ob.$set(val);
        }
    });  
    return this;
}


 
//=======================================================================
@intimate()
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

        intimate(this,{
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

    

    $getFromRoot(root:any):any{
        let data = root;
        for(const i in this.$paths){
            data = data[this.$paths[i]];
            if(data===undefined || data===Undefined) return undefined;
        }
        return data;
    }

    $asObject():ObservableSchema<TData>{
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

    $defineProp<TProp>(propname:string,initValue?:TProp):ObservableSchema<TProp>{
        if(this.$type!==DataTypes.Object) throw new Error("调用$defineProp之前，要首先调用$asObject");
        let propSchema :ObservableSchema<TProp> = new ObservableSchema<TProp>(initValue,propname,this);
        Object.defineProperty(this,propname,{enumerable:true,writable:false,configurable:false,value:propSchema});
        defineProp<TData>(this.$ctor.prototype,propname,function(owner,name){return new propSchema.$ctor(this,name);});        
        return propSchema;
    }


    $asArray():ObservableSchema<TData>{
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

    
    $initObject(ob:Observable<TData>){
        for(const n in this){
            if(n==="constructor" || n[0]==="$") continue;
            let propSchema = this[n] as any as ObservableSchema<any>;
            defineProp<TData>(ob,n,function(owner,name){return new propSchema.$ctor(this,name);});
        }
    }
    

    

    static schemaToken:string = "$__ONLY_USED_BY_SCHEMA__";
}




//=======================================================================

export enum ReactiveTypes{
    Internal,
    Iterator,
    In,
    Out,
    Ref
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
        let infos = sureMetaInfo(target,"reactives");
        
        if((info as IReactiveInfo).name){
            if(!(info as IReactiveInfo).schema) (info as IReactiveInfo).schema = target[(info as IReactiveInfo).name];
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

//==========================================================

export interface ITemplateInfo{
    name?:string;
    vnode?:any;
    partial?:string;
    render?:Function;
}

export function template(partial?:string|Function,defs?:{[prop:string]:ITemplateInfo}){
    function markTemplateInfo(target:IComponentInfo,info:string|ITemplateInfo) {
        let infos = sureMetaInfo(target,"templates");
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
        let infos = sureMetaInfo(target,"actions");

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
    ctor?:{new(...args:any[]):IComponent};
    wrapper?:Function;
    tag?:string;
    render?:Function;
    inited?:boolean;
}
function sureMetaInfo(target?:any,name?:string){
    let meta = target.$meta;
    if(!meta) Object.defineProperty(target,"$meta",{enumerable:false,configurable:false,writable:true,value:meta={}});
    if(!name) return meta;
    let info = meta[name];
    if(!info) Object.defineProperty(meta,name,{enumerable:false,configurable:false,writable:true,value:info={}});
    return info;
}

export interface IComponent{
    [membername:string]:any;
    
}
export interface IInternalComponent extends IComponent{
    $meta:IComponentInfo;
    $childNodes:VirtualNode[];
    $reactives:{[name:string]:Observable<any>};
}

let registeredComponentInfos : {[tag:string]:IComponentInfo}={};

function inherits(extendCls, basCls) {
    function __() { this.constructor = extendCls; }
    extendCls.prototype = basCls === null ? Object.create(basCls) : (__.prototype = basCls.prototype, new __());
}

export function component(tag:string,ComponentType?:{new(...args:any[]):IComponent}):any{
    let makeComponent = function (componentType:{new(...args:any[]):IComponent}) {
        let meta = sureMetaInfo(componentType.prototype) as IComponentInfo;
        let _Component = function () {
            let ret = componentType.apply(this,arguments);
            if(!this.$meta.inited){
                initComponent(this);
            }
            return ret;
        }
        for(let k in ComponentType) _Component[k] = componentType[k];
        inherits(_Component,componentType);
        Object.defineProperty(_Component.prototype,"$meta",{enumerable:false,configurable:false,get:()=>componentType.prototype["$meta"],set:(val)=>componentType.prototype["$meta"]=val});
        meta.tag = tag;
        meta.ctor = componentType;
        meta.wrapper = _Component;
        registeredComponentInfos[tag]= meta;
        return _Component;
    }
    if(ComponentType) {
        return makeComponent(ComponentType);
    }else return makeComponent;
}

function createComponent(tag:string,context?:any) {
    let componentInfo = registeredComponentInfos[tag];
    if(!componentInfo) throw new Error(`${tag}不是Component,请调用component注册或标记为@component`);
    let instance = new componentInfo.ctor();
    if(!componentInfo.inited){
        initComponent(instance as IInternalComponent);
    }
    return instance;
}

function initComponent(firstComponent:IInternalComponent){
    let meta:IComponentInfo = firstComponent.$meta;
    if(!meta || meta.inited) return firstComponent;
    for(const name in meta.reactives){
        let stateInfo = meta.reactives[name];
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
    meta.inited=true;
}

function initReactive(firstComponent:IInternalComponent,stateInfo:IReactiveInfo){
    let descriptor:any;
    if(stateInfo.type!==ReactiveTypes.Iterator) descriptor = {
        enumerable:true
        ,configurable:false
        ,get:function() {
            if(Observable.accessMode===ObservableModes.Schema) return stateInfo.schema;
            let states = this.$reactives ||(this.$reactives={});
            let ob = states[stateInfo.name]|| (states[stateInfo.name] = new stateInfo.schema.$ctor(stateInfo.initData));  
            return ob.$get();
        }
        ,set:function(val:any){
            let states = this.$reactives ||(this.$reactives={});
            let ob = states[stateInfo.name];
            if(val&&val.$get) val=val.$get(ObservableModes.Value);
            if(ob) ob.$set(val);
            else (states[stateInfo.name] = new stateInfo.schema.$ctor(val));  
        }
    };else descriptor = {
        enumerable:false
        ,configurable:false
        ,get:function() {
            if(Observable.accessMode===ObservableModes.Schema) return stateInfo.schema;
            let states = firstComponent.$reactives ||(firstComponent.$reactives={});
            let ob = states[stateInfo.name]  
            return ob?ob.$get():undefined;
        }
        ,set:function(val:any){
            let states = firstComponent.$reactives ||(firstComponent.$reactives={});
            if(val instanceof Observable) {
                states[stateInfo.name] = val;
                return;
            }
            let ob = states[stateInfo.name] = new stateInfo.schema.$ctor(val);  
            //ob.$set(val);
        }
    };
    Object.defineProperty(firstComponent,stateInfo.name,descriptor);
    Object.defineProperty(firstComponent.$meta.ctor.prototype,stateInfo.name,descriptor);
}
//<table rows={rows} take={10} skip={start} ><col name="name" type='text' label='名称' onchange={abc}/></table>
function initTemplate(firstComponent:IInternalComponent,tplInfo:ITemplateInfo){
    let rawMethod = firstComponent[tplInfo.name];
    let tplMethod = function (container:any) {
        let component = this;
        if(tplInfo.render) return tplInfo.render.call(component,container);
        let result :any;
        observableMode(ObservableModes.Schema,()=>{
            let vnode = rawMethod.call(component,container);
            if(Host.isElement(vnode)) {tplInfo.render = rawMethod;result=vnode;}
            else {tplInfo.vnode = vnode;result=Undefined;}

        });
        if(result===Undefined){
            observableMode(ObservableModes.Observable,()=>{
                result = tplInfo.vnode.render(component,container);
            });
            tplInfo.render = function (container?:any) {
                return tplInfo.vnode.render.call(this,container,tplInfo.vnode);
            }
            
        }
        return result;

    }
    Object.defineProperty(tplMethod,"$orign",{configurable:false,writable:false,enumerable:false,value:rawMethod});
    let des = {configurable:false,writable:false,enumerable:false,value:tplMethod};
    Object.defineProperty(firstComponent,tplInfo.name,des);
    Object.defineProperty(firstComponent.$meta.ctor.prototype,tplInfo.name,des);
}


function makeAction(component:IComponent,method){
    return function () {
        let rs= method.apply(component,arguments);
        for(const n in component.$reactives){
            component.$reactives[n].$update();
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

export class VirtualNode{
    tag?:string;
    attrs?:{[name:string]:any};
    content?:any;
    children?:VirtualNode[];
    constructor(){}

    

    render(component:IComponent,container?:any):any{
        
    }

    static create(tag:string,attrs:{[attrName:string]:any}){
        let vnode :VirtualNode;
        let componentInfo = registeredComponentInfos[tag];
        if(componentInfo)vnode = new VirtualComponentNode(tag,attrs);
        else vnode = new VirtualElementNode(tag,attrs);
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
            let ob = this.content.$getFromRoot(component);
            elem = Host.createText(ob.$get());
            ob.$subscribe((e)=>{
                elem.nodeValue = e.value;
            });
        }else{
            elem = Host.createText(this.content);
        }
        if(container) Host.appendChild(container,elem);
        return elem;
    }
    
}
export class VirtualElementNode extends VirtualNode{
    
    children?:VirtualNode[];

    constructor(public tag:string,public attrs:{[name:string]:any}){
        super();
    }

    render(component:IComponent,container?:any):any{
        let elem = Host.createElement(this.tag);
        let ignoreChildren:boolean = false;
        for(const attrName in this.attrs){
            let attrValue= this.attrs[attrName];
            
            let match = attrName.match(evtnameRegx);
            if(match && elem[attrName]!==undefined && typeof attrValue==="function"){
                let evtName = match[1];
                Host.attach(elem,evtName,makeAction(component,attrValue));
                continue;
            }
            let binder:Function = attrBinders[attrName];
            if(attrValue instanceof ObservableSchema){
                
                let proxy = attrValue.$getFromRoot(component);
                if(binder) ignoreChildren = ignoreChildren || binder.call(component,elem,proxy,component,this)===false;
                else (function(name,value) {
                    Host.setAttribute(elem,name,value.$get());
                    value.$subscribe((e)=>{
                        Host.setAttribute(elem,name,e.value);
                    });
                })(attrName,proxy);
            }else {
                if(binder) ignoreChildren = ignoreChildren || binder.call(component,elem,attrValue,component,this)===false;
                else Host.setAttribute(elem,attrName,attrValue);
            }
        }
        if(container)Host.appendChild(container,elem);

        if(!this.children || this.children.length===0) return elem;

        if(!ignoreChildren) {
            for(const i in this.children){
                this.children[i].render(component,elem);
            }
        }

        return elem;

    }
    
}






function bindComponentAttr(component:IComponent,subComponent:IComponent,subAttrName:string,bindValue:any){
    let subMeta = subComponent.$meta as IComponentInfo;

    let stateInfo = subMeta.reactives[subAttrName];
    let subStateType = stateInfo?stateInfo.type:undefined;
    if(subStateType===ReactiveTypes.Internal || subStateType===ReactiveTypes.Iterator) throw new Error(`${this.tag}.${subAttrName}是内部变量，不可以在外部赋值`);
    
    let subAttr = subComponent[subAttrName];

    if(subStateType === ReactiveTypes.Out){
        if(bindValue instanceof ObservableSchema){
            subAttr.$subscribe(e=>bindValue.$getFromRoot(component).$set(e.value));
        }else{
            throw new Error(`无法绑定[OUT]${subMeta.tag}.${subAttrName}属性，父组件赋予该属性的值不是Observable`);
        }
    } else if(subStateType===ReactiveTypes.In){
        if(bindValue instanceof ObservableSchema){
            let bindOb = bindValue.$getFromRoot(component);
            bindOb.$subscribe((e)=>subAttr.$set(e.value));
            subAttr.$_raw(bindOb.$get());
        }else{
            subAttr.$_raw(bindValue);
            console.warn(`未能绑定[IN]${subMeta.tag}.${subAttrName}属性,父组件赋予该属性的值不是Observable`);
        }
    } else if(subStateType===ReactiveTypes.Ref){
        if(bindValue instanceof ObservableSchema){
            let bindOb = bindValue.$getFromRoot(component);
            bindOb.$subscribe((e)=>subAttr.$set(e.value));
            subAttr.$_raw(bindOb.$get());
            subAttr.$subscribe((e)=>bindValue.$getFromRoot(component).$set(e.value));
        }else{
            subAttr.$_raw(bindValue);
            console.warn(`未能绑定[REF]${subMeta.tag}.${subAttrName}属性,父组件赋予该属性的值不是Observable`);
        }
    }else{
        let value =bindValue instanceof ObservableSchema?bindValue.$getFromRoot(component).$get():bindValue;
        value = clone(value,true);
        if(subAttr instanceof Observable) subAttr.$_raw(value);
        else subComponent[subAttrName] = value;
    }
}

export class VirtualComponentNode extends VirtualNode{
    children?:VirtualNode[];
    constructor(public tag:string,public attrs:{[name:string]:any}){
        super();
    }

    render(component:IComponent,container?:any):any{
        let subComponent = createComponent(this.tag);
        for(const subAttrName in this.attrs){
            bindComponentAttr(component,subComponent,subAttrName,this.attrs[subAttrName]);
        };
        let subMeta = subComponent.$meta as IComponentInfo;
        for(const n in subMeta.templates){
            let tpl = subMeta.templates[n];
            subComponent[tpl.name].call(subComponent,container);
        }

    }
}


export function NOT(params:any) {
    return;
}
export function EXP(...args:any[]) {
    return;
}

let evtnameRegx = /on([a-zA-Z_][a-zA-Z0-9_]*)/;


let attrBinders:{[name:string]:(elem:any,bindValue:any,component:IComponent,vnode:VirtualNode)=>any}={};

attrBinders.for = function bindFor(elem:any,bindValue:any,component:IComponent,vnode:VirtualNode,ignoreAddRel?:boolean){
    let each = bindValue[0];
    let value = bindValue[1];
    let key = bindValue[2];
    if(each instanceof ObservableSchema){
        each = each.$getFromRoot(component);
        if(!ignoreAddRel)addRelElements(each,elem);
        each.$subscribe((e:IChangeEventArgs<any>)=>{
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
    let iterator_name = value.$paths[0];
    for(const k in each){
        if(k==="constructor" || k[0]==="$") continue;
        //if(key)  key.$getFromRoot(component).$renew(k);
        let item =each[k];
        component[iterator_name] = item;
        //value.$getFromRoot(component).$replace(each[k]);
        let obItem = component[iterator_name];
        for(const i in vnode.children){
            let childElements = vnode.children[i].render(component,elem);
            addRelElements(obItem,childElements);
            obItem.$subscribe((e:IChangeEventArgs<any>)=>{
                if(e.type===ChangeTypes.Remove) {
                    let obItem = e.sender;
                    let nodes = getRelElements(obItem);
                    for(const i in nodes) {
                        let node = nodes[i];if(node.parentNode) node.parentNode.removeChild(node);
                    }
                }
            });
        }
    }      
    return false;
}

attrBinders.style=function (elem:any,bindValue:any,component:IComponent) {
    for(const styleName in bindValue)((styleName,subValue,elem,component)=>{
        let ob:Observable<any>;
        let styleValue :any;
        let convertor = styleConvertors[styleName];
        if(subValue instanceof Observable){ ob = subValue; styleValue = ob.$get();}
        else if(subValue instanceof ObservableSchema){
            ob = subValue.$getFromRoot(component);
            styleValue = ob.$get();
        } else styleValue = subValue;
        elem.style[styleName] = convertor?convertor(styleValue):styleValue;

        if(ob){
            addRelElements(ob,elem);
            ob.$subscribe((e)=>{
                elem.style[styleName] =convertor?convertor(e.value):e.value;
            });
        }
    })(styleName,bindValue[styleName],elem,component);
}
let styleConvertors :any= {};

let unitRegx = /(\d+(?:.\d+))(px|em|pt|in|cm|mm|pc|ch|vw|vh|\%)/g;
styleConvertors.left = styleConvertors.right = styleConvertors.top = styleConvertors.bottom = styleConvertors.width = styleConvertors.height = function (value:any) {
    if(!value) return "0";
    if(typeof value==="number"){
        return value + "px";
    }else return value;
}

//===========================================================================
export interface IHost{
    isElement(elem):boolean;
    createElement(tag:string):any;
    createText(text:string):any;
    setAttribute(elem:any,name:string,value:any);
    getAttribute(elem:any,name:string):any;
    appendChild(parent:any,child:any);
    removeAllChildrens(parent:any);
    attach(elem:any,evtname:string,handler:Function);
}
let Host:IHost={} as any;
Host.isElement=(elem):boolean=>{
    return (elem as HTMLElement).nodeType === 1;
};

Host.createElement=(tag:string):any=>{
    return document.createElement(tag);
};

Host.createText=(txt:string):any=>{
    return document.createTextNode(txt);
};


Host.setAttribute=(elem:any,name:string,value:any)=>{
    elem.setAttribute(name,value);
};

Host.appendChild=(elem:any,child:any)=>{
    elem.appendChild(child);
};

Host.removeAllChildrens=(elem:any)=>{
    elem.innerHTML = elem.nodeValue="";
};

Host.attach = (elem:any,evtname:string,handler:Function)=>{
    if(elem.addEventListener) elem.addEventListener(evtname,handler,false);
    else if(elem.attachEvent) elem.attachEvent('on' + evtname,handler);
    else elem['on'+evtname] = handler;
}
//======================================================================


 
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

let YA={
    Subject, ObservableModes,observableMode,proxyMode,Observable,ObservableObject,ObservableArray, ObservableSchema
    ,component,state: reactive,template
    ,VirtualNode,VirtualTextNode,VirtualElementNode,VirtualComponentNode,virtualNode,HOST: Host,NOT,EXP
    ,intimate,clone
    
};
if(typeof window!=='undefined') (window as any).YA = YA;
export default YA;





