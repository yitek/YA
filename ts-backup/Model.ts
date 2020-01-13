// export interface IObjectProxy{

//     $target:object;
//     $member(name:string,sure?:boolean):Member;
//     $subscribe:(nameOrListener:string|{(evt:IValuechangeEvent):any},listener?:{(evt:IValuechangeEvent):any})=>object;
//     $unsubscribe:(nameOrListener:string|{(evt:IValuechangeEvent):any},listener?:{(evt:IValuechangeEvent):any})=>object;
//     $refresh:()=>object;
// }

// export enum MemberTypes{
//     Value,
//     Object,
//     Array
// }

// export interface IMember{
//     name:string;
//     type:MemberTypes;
//     dpath:string;
//     owner:IObjectProxy;
//     getValue:()=>any;
//     setValue:(value:any,extra?:any)=>IMember;
//     clone(proxy:IObjectProxy):IMember;
//     refresh:()=>IMember;
// }

// export class Observable{
//     private _listeners?:{(evt:IValuechangeEvent):any}[];
//     subscribe(listener:(evt:IValuechangeEvent)=>any):Observable{
//         (this._listeners||(this._listeners=[])).push(listener);
//         return this;
//     }
//     unsubscribe(listener:(evt:IValuechangeEvent)=>any):Observable{
//         if(!this._listeners)return this;
//         for(let i =0,j=this._listeners.length;i<j;i++){
//             let existed = this._listeners.shift();
//             if(existed!==listener) this._listeners.push(existed);
//         }
//         return this;
//     }
//     notify(evt:IValuechangeEvent):Observable{
//         let listeners = this._listeners;
//         if(!listeners|| listeners.length===0) return this;
//         for(let i in listeners){
//             listeners[i].call(this,evt);
//         }
//         return this;
//     }
// }

// export class Member extends Observable implements IMember{
    
//     changeInfo?:IValuechangeEvent;
//     private _objProxy?:IInternalProxy;
//     name:string;
//     type:MemberTypes;
//     dpath:string;
//     owner:IObjectProxy;

    
//     constructor(name?:string,owner?:IInternalProxy){
//         super();
//         if(name===undefined)return this;
//         this.name = name;
//         this.owner = (owner as any) as IObjectProxy;
//         this.dpath = owner.__DPATH__?name:`${owner.__DPATH__}.${name}`;
//         this.type = MemberTypes.Value;
//         this.getValue = this._getByVal;
//         this.setValue = this._setByVal;
//         this.refresh = this._refreshByVal;
//         Object.defineProperty(owner,name,{ configurable:true,writable:false,enumerable:false
//             ,get:()=>this.getValue()
//             ,set:(value:any)=>this.setValue(value)
//         });
//     }

//     getValue:()=>any;
//     setValue:(newValue:any,extra?:any)=>IMember;
//     refresh:()=>IMember;

//     private _getByVal(actual?:boolean):any{
//         if(this.changeInfo===undefined) return (this.owner as any as IInternalProxy).__TARGET__[this.name];
//         return actual?(this.owner as any as IInternalProxy).__TARGET__[this.name]:this.changeInfo.value;
//     }

//     private _setByVal(newValue:any,extra?:any):IMember{
//         let oldValue = null;
//         this.changeInfo= {
//             sender:this,
//             value:newValue,
//             old:oldValue,
//             target:(this.owner as any as IInternalProxy).__TARGET__,
//             name:this.name,
//             extra:extra,
//             reason:"set-value"
//         };
//         return this;
//     }
//     private _compare(newValue:any,oldValue:any,extra?:any):IMember{
        
        

//         //((this.owner as any as IInternalProxy).__CHANGED_PROPS__||((this.owner as any as IInternalProxy).__CHANGED_PROPS__={}))[this.name] = newValue;
//         return this;
//     }

//     private _refreshByVal():Member{
//         let evt = this.changeInfo;
//         this.changeInfo = undefined;
//         if(evt){
//             this.notify(evt);
//         }
//         return this;
//     }
    

//     clone(proxy:IObjectProxy):IMember{
//         let clone= new Member();
//         clone.name=this.name;
//         clone.dpath = this.dpath;
//         clone.type = this.type;
//         clone.owner = proxy;
//         clone.getValue = this.getValue;
//         clone.setValue = this.setValue;
//         clone.refresh = this.refresh;
//         //if(this._objProxy) clone._objProxy = 
//         return clone;
//     }

//     toObject(){
//         if(this._objProxy) return this._objProxy;
//         this.getValue = this._getByRef;
//         this.setValue = this._setByRef;
//         this.refresh =this._refreshByRef;
//         return this._objProxy;
//     }

//     private _getByRef(actual?:boolean):any{
        
//         return actual?(this.owner as any as IInternalProxy).__TARGET__[this.name]:this._objProxy;
//     }

//     private _setByRef(newValue:object,extra?:any):IMember{
//         let oldValue = null;
//         this.changeInfo= {
//             sender:this,
//             value:newValue,
//             old:oldValue,
//             target:(this.owner as any as IInternalProxy).__TARGET__,
//             name:this.name,
//             extra:extra,
//             reason:"set-value"
//         };
        
//         return this;
//     }

//     private _refreshByRef():IMember{
//         return this;
//     }
// }

// class InternalObjectProxy extends Observable{
//     _target:object;
//     _changedTarget:object;
//     members:{[name:string]:Member};
//     parent:InternalObjectProxy;
//     constructor(target:object,parent?:InternalObjectProxy){
//         super();
//         this._target=target||{};
//         this.parent = parent;
//     }

//     member(name:string,sure?:boolean):Member{
//         let members = this.members;
//         if(!members){
//             if(sure) members = this.members={};
//             else return;
//         }
//         let member = members[name];
//         if(!member){
//             if(sure){
//                 member = members[name] = new Member(name,this);
//             } 
//         }
//         return member;
//     }
//     get(name:string):any{
//         let member = this.members[name];
//         if(member) return member.getValue();
//         return this._target[name];
//     }
//     set(name:string,value:any,extra?:any):InternalObjectProxy{
//         let member = this.members[name];
//         if(member){ member.setValue(value,extra);return this;}
//         this._target[name] = value;
//         return this;
//     }

//     refresh(){
//         for(let n in this.members){
//             let member = this.members[n];
//             member.refresh();
//         }
//     }

    
// }

// export class ObjectProxy{
//     private __TARGET__:object;
//     private __MEMBERS__:{[name:string]:Member};
//     private __OBSERVERS__:{[name:string]:{(evt:IValuechangeEvent):any}[]};
//     private __CHANGED_PROPS__:{[name:string]:Member};

//     constructor(data:object){
//         Object.defineProperty(this,"__TARGET__",{ configurable:false,writable:true,enumerable:false,value:data});
//         Object.defineProperty(this,"$member",{ configurable:true,writable:true,enumerable:false,value:findMember});

//         Object.defineProperty(this,"$subscribe",{ configurable:false,writable:false,enumerable:false,value:subscribe});
//         Object.defineProperty(this,"$unsubscribe",{ configurable:false,writable:false,enumerable:false,value:unsubscribe});
//         Object.defineProperty(this,"$target",{ configurable:false,writable:false,enumerable:false,
//             get:()=>this.__TARGET__,
//             set:setTarget
//         });
//         Object.defineProperty(this,"$byval",{ configurable:false,writable:false,enumerable:false,value:makeByvalProp});
//         Object.defineProperty(this,"$refresh",{ configurable:false,writable:false,enumerable:false,value:refresh});
//     }

//     $target:(target?:any)=>object;
//     $member:(name:string,sure?:boolean)=>Member;
//     $subscribe:(nameOrListener:string|{(evt:IValuechangeEvent):any},listener?:{(evt:IValuechangeEvent):any})=>object;
//     $unsubscribe:(nameOrListener:string|{(evt:IValuechangeEvent):any},listener?:{(evt:IValuechangeEvent):any})=>object;
//     $refresh:()=>object;
// }

// interface IValuechangeEvent{
//     sender:Member;
//     old?:any;
//     value:any;
//     target?:object;
//     name?:string;
//     index?:number;
//     reason?:any;
//     extra?:any;
// }

// interface IInternalProxy{
//     __DPATH__:string;
//     __TARGET__:object;
//     __MEMBERS__:{[name:string]:Member};
//     __OBSERVERS__:{[name:string]:Function[]};
//     __CHANGED_PROPS__:{[name:string]:Member};
// }


// function subscribe(nameOrListener:string|{(evt:IValuechangeEvent):any},listener?:{(evt:IValuechangeEvent):any}):object{
//     let self:IInternalProxy = this;
//     if(listener===undefined){
//         listener = nameOrListener as (evt:IValuechangeEvent)=>any;
//         nameOrListener = "";
//     }else if(!nameOrListener) nameOrListener="";
//     let obs = (self.__OBSERVERS__ || (self.__OBSERVERS__={}));
//     let listeners = obs[nameOrListener as string] || (obs[nameOrListener as string]=[]);
//     listeners.push(listener);
//     return this;
// }

// function unsubscribe(nameOrListener:string|{(evt:IValuechangeEvent):any},listener?:{(evt:IValuechangeEvent):any}):object{
//     let self:IInternalProxy = this;
//     if(listener===undefined){
//         listener = nameOrListener as (evt:IValuechangeEvent)=>any;
//         nameOrListener = "";
//     }else if(!nameOrListener) nameOrListener="";
//     let obs = self.__OBSERVERS__;if(!obs) return this;
//     let listeners = obs[nameOrListener as string];if(!listeners || listeners.length===0) return this;
//     for(let i =0,j=listeners.length;i<j;i++){
//         let existed = listeners.shift();
//         if(existed!==listener) listeners.push(existed);
//     }
//     return this;
// }




// function makeByvalProp(propName:string){
//     Object.defineProperty(this,propName,{ configurable:true,writable:false,enumerable:true
//         ,get:function(){
//             let self:IInternalProxy = this;
//             let changed = self.__CHANGEDVALUES__;
//             let evt:IValuechangeEvent = changed[propName];
//             let value:any;
//             if(evt===undefined){
//                 value = self.__TARGET__[propName];
//             }else value = evt.value;
//             return value;
//         }
//         ,set:function(newValue:any){
//             let self:IInternalProxy = this;
//             let oldValue = self.__TARGET__[propName];
            
//             if(newValue===oldValue) {
//                 delete self.__CHANGEDVALUES__[name];
//                 return;
//             }
            
//             (self.__CHANGEDVALUES__||(self.__CHANGEDVALUES__={}))[propName]={
//                 value:newValue,old:oldValue,target:self.__TARGET__,name:propName
//             };
            
//         }
//     });
// }



// function setTarget(value:any){
//     let self = this as IInternalProxy;
//     let old = self.__TARGET__;
//     if(value===old)return this;
//     value = self.__TARGET__ = value||{};
//     self.__CHANGEDVALUES__ = undefined;
//     for(let n in this){
//         let oldPropValue = old[n];
//         let newPropValue = value[n];
//         if(oldPropValue!==newPropValue){
//             let changed = self.__CHANGEDVALUES__ ||(self.__CHANGEDVALUES__={});
//             changed[n]={
//                 value:newPropValue,
//                 old:oldPropValue,
//                 target:value,
//                 name:n,
//                 reason:"target"
//             };
//         }
//     }
//     return this;
// }

// function makeByrefProp(propName:string){
//     let proxy = new Proxy(undefined);
//     Object.defineProperty(this,propName,{ configurable:true,writable:false,enumerable:true
//         ,get:function(){
//             return proxy;
//         }
//         ,set:function(newValue:any){
//             let self:IInternalProxy = this;
//             proxy.$target = newValue;
            
//         }
//     });
// }

// function toArray(){
//     Object.defineProperty(this,"length",{ configurable:false,writable:false,enumerable:false
//         ,get:function(){
//             return ((this as IInternalProxy).__TARGET__ as any[]).length;
//         }
        
//     });

//     Object.defineProperty(this,"push",{ configurable:false,writable:false,enumerable:false
//         ,value:function(item:any){

//         }
        
//     });
// }



// function refresh(){
//     let self:IInternalProxy = this;
//     let changed = this.__CHANGEDVALUES__;
//     let observers = this.__OBSERVERS__;
//     //没有变化，或者没有观察者，就什么都不做
//     if(!changed || !observers) return this;
//     this.__CHANGEDVALUES__=undefined;
//     let all = observers[""];
//     for(let n in changed){
//         let obs = observers[n];
//         let evt = changed[n];
//         if(obs) for(let i in obs){
//             obs[i].call(this,evt);
//         } 
//         if(all) for(let i in all){
//             all[i].call(this,evt);
//         }
//     }
//     return this;
// }


