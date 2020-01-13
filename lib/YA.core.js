(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function buildNotPublics(ctor, members) {
        let proto = typeof ctor === "function" ? ctor.prototype : ctor;
        if (Object.prototype.toString.call(members) === "[object Array]")
            for (let i in members)
                Object.defineProperty(proto, members[i], { enumerable: false, writable: true, configurable: false });
        else
            for (let n in members)
                Object.defineProperty(proto, n, { enumerable: false, writable: true, configurable: false, value: members[n] });
        return ctor;
    }
    function buildHiddenMembers(target, props) {
        let descriptor = { enumerable: false, writable: true, configurable: false, value: undefined };
        for (let n in props) {
            descriptor.value = props[n];
            Object.defineProperty(target, n, descriptor);
        }
        return target;
    }
    function valueObservable(target) {
        target.$subscribe = function (listener) {
            (this.$_listeners || (this.$_listeners = [])).push(listener);
            return this;
        };
        target.$unsubscribe = function (listener) {
            if (!this.$_listeners)
                return this;
            for (let i = 0, j = this.$_listeners.length; i < j; i++) {
                let existed = this.$_listeners.shift();
                if (existed !== listener)
                    this.$_listeners.push(existed);
            }
            return this;
        };
        target.$notify = function (evt) {
            let listeners = this.$_listeners;
            if (!listeners || listeners.length === 0)
                return this;
            for (let i in listeners) {
                listeners[i].call(this, evt);
            }
            return this;
        };
        return buildNotPublics(target, [
            "$_listeners",
            "$subscribe",
            "$unsubscribe",
            "$notify"
        ]);
    }
    exports.valueObservable = valueObservable;
    class ValueObservable {
        constructor() {
            Object.defineProperty(this, "$_listeners", { enumerable: false, writable: true, configurable: false });
        }
    }
    exports.ValueObservable = ValueObservable;
    valueObservable(ValueObservable.prototype);
    //================================================================
    var ValueTypes;
    (function (ValueTypes) {
        ValueTypes[ValueTypes["Value"] = 0] = "Value";
        ValueTypes[ValueTypes["Object"] = 1] = "Object";
        ValueTypes[ValueTypes["Array"] = 2] = "Array";
    })(ValueTypes = exports.ValueTypes || (exports.ValueTypes = {}));
    var ChangeTypes;
    (function (ChangeTypes) {
        ChangeTypes[ChangeTypes["Value"] = 0] = "Value";
        ChangeTypes[ChangeTypes["Item"] = 1] = "Item";
        ChangeTypes[ChangeTypes["Push"] = 2] = "Push";
        ChangeTypes[ChangeTypes["Pop"] = 3] = "Pop";
        ChangeTypes[ChangeTypes["Shift"] = 4] = "Shift";
        ChangeTypes[ChangeTypes["Unshift"] = 5] = "Unshift";
        ChangeTypes[ChangeTypes["Clear"] = 6] = "Clear";
    })(ChangeTypes = exports.ChangeTypes || (exports.ChangeTypes = {}));
    let Undefined = {};
    let Null = {};
    class ValueProxy extends ValueObservable {
        constructor(raw) {
            super();
            buildHiddenMembers(this, {
                $raw: raw,
                $target: raw(),
                $owner: undefined,
                $modifiedValue: undefined,
                $type: ValueTypes.Value
            });
        }
        $get() {
            if (ValueProxy.gettingProxy)
                return this;
            return (this.$modifiedValue === undefined) ? this.$target : (this.$modifiedValue === Undefined ? undefined : this.$modifiedValue);
        }
        $set(newValue) {
            if (ValueProxy.gettingProxy)
                throw new Error("ValueProxy.gettingProxy=true,不可以给对象属性赋值");
            this.$modifiedValue = newValue === undefined ? Undefined : newValue;
            return this;
        }
        $update() {
            let newValue = this.$modifiedValue;
            if (newValue === undefined)
                return true;
            this.$modifiedValue = undefined;
            newValue = newValue === Undefined ? undefined : newValue;
            let oldValue = this.$target;
            if (newValue !== oldValue) {
                this.$raw(this.$target = newValue);
                let evtArgs = { type: ChangeTypes.Value, value: newValue, old: oldValue, sender: this };
                this.$notify(evtArgs);
                return evtArgs.cancel !== true;
            }
            return true;
        }
        toString() { return this.$raw().toString(); }
    }
    exports.ValueProxy = ValueProxy;
    //let ValueProxyProps = ["$modifiedValue","$type","$raw","$extras","$owner"];
    buildHiddenMembers(ValueProxy.prototype, ValueProxy.prototype);
    class ObjectProxy extends ValueProxy {
        constructor(raw, meta) {
            super(raw);
            let target = raw();
            if (!target)
                raw(target = {});
            buildHiddenMembers(this, {
                "$target": target,
                "$props": {}
            });
            this.$type = ValueTypes.Object;
            let props = this.$props;
            if (meta.fieldnames)
                for (let i in meta.fieldnames)
                    ((name, proxy) => {
                        Object.defineProperty(this, name, {
                            enumerable: true, configurable: false, get: () => proxy.$get()[name], set: (newValue) => proxy.$get()[name] = newValue
                        });
                    })(meta.fieldnames[i], this);
            if (meta.methodnames)
                for (let i in meta.methodnames)
                    ((name, proxy) => {
                        Object.defineProperty(this, name, {
                            enumerable: false, configurable: false, get: () => proxy.$get()[name], set: (newValue) => proxy.$get()[name] = newValue
                        });
                    })(meta.methodnames[i], this);
            if (meta.propBuilder) {
                let define = (name, prop) => {
                    prop || (prop = new ValueProxy((val) => val === undefined ? this.$get()[name] : this.$get()[name] = val));
                    prop.$owner = this;
                    Object.defineProperty(this, name, {
                        enumerable: true, configurable: false, get: () => prop.$get(), set: (val) => prop.$set(val)
                    });
                    props[name] = prop;
                    return define;
                };
                meta.propBuilder(define);
            }
        }
        $get() {
            if (ValueProxy.gettingProxy)
                return this;
            return this.$modifiedValue === undefined ? (this.$target || null) : this.$modifiedValue;
        }
        $set(newValue) {
            super.$set(newValue || null);
            if (!newValue)
                return;
            for (let n in this.$props) {
                this.$props[n].$set(newValue[n]);
            }
            return this;
        }
        $update() {
            let result = super.$update();
            if (result === false)
                return false;
            for (let n in this.$props) {
                this.$props[n].$update();
            }
            return true;
        }
    }
    exports.ObjectProxy = ObjectProxy;
    buildHiddenMembers(ObjectProxy.prototype, ObjectProxy.prototype);
    class ArrayProxy extends ValueProxy {
        constructor(raw, item_convertor) {
            super(raw);
            this.$type = ValueTypes.Array;
            this.$itemConvertor = item_convertor;
        }
        item(index, item_value) {
            if (item_value === undefined) {
                return this[index];
            }
            let len = this.length;
            let item = this.$itemConvertor ? this.$itemConvertor(item_value, this) : item_value;
            let oldItem;
            if (len - 1 < index) {
                this.$length = index + 1;
                Object.defineProperty(this, index.toString(), { enumerable: true, configurable: true, value: item });
            }
            else {
                oldItem = this[index];
                this[index] = item;
            }
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Push,
                index: index,
                value: item,
                old: oldItem,
                item_value: item_value
            });
        }
        push(item_value) {
            let index = this.length;
            let item = this.$itemConvertor ? this.$itemConvertor(item_value, this) : item_value;
            Object.defineProperty(this, index.toString(), { enumerable: true, configurable: true, value: item });
            this.$length++;
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Push,
                index: index,
                value: item
            });
            return this;
        }
        pop() {
            let len = this.length;
            if (len === undefined)
                return;
            let removeItem = this[len];
            delete this[len];
            this.$length--;
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Pop,
                value: removeItem,
                index: len
            });
            return removeItem;
        }
        unshift(item_value) {
            let item = this.$itemConvertor ? this.$itemConvertor(item_value, this) : item_value;
            //let changes = ;
            let len = this.length;
            Object.defineProperty(this, len.toString(), {
                enumerable: true, configurable: true, value: this[len]
            });
            for (let i = len - 1, j = 1; i >= j; i--) {
                this[i] = this[i];
            }
            Object.defineProperty(this, len.toString(), {
                enumerable: true, configurable: true, value: this[0]
            });
            this.$length++;
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Unshift,
                index: 0,
                value: item,
                item_value: item_value
            });
            return this;
        }
        shift() {
            let len = this.length;
            if (len === undefined)
                return;
            let removeItem = this[0];
            for (let i = 1, j = len; i < j; i++) {
                this[i - 1] = this[i];
            }
            delete this[len];
            this.$length--;
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Shift,
                value: removeItem,
                index: 0
            });
            return removeItem;
        }
        $update() {
            if (!super.$update())
                return true;
            if (!this.$changes)
                return true;
            let arr = this.$raw();
            for (let i in this.$changes) {
                let change = this.$changes[i];
                switch (change.type) {
                    case ChangeTypes.Push:
                        arr.push(change);
                        this.$notify(change);
                        if (change.cancel !== true && change.value && change.value.$notify)
                            change.value.$notify(change);
                        break;
                    case ChangeTypes.Pop:
                        arr.pop(change);
                        this.$notify(change);
                        if (change.cancel !== true && change.value && change.value.$notify)
                            change.value.$notify(change);
                        break;
                    case ChangeTypes.Unshift:
                        arr.unshift(change);
                        this.$notify(change);
                        if (change.cancel !== true && change.value && change.value.$notify)
                            change.value.$notify(change);
                        break;
                    case ChangeTypes.Shift:
                        arr.shift(change);
                        this.$notify(change);
                        if (change.cancel !== true && change.value && change.value.$notify)
                            change.value.$notify(change);
                        break;
                    case ChangeTypes.Item:
                        arr.shift(change);
                        this.$notify(change);
                        if (change.cancel !== true && change.value && change.value.$notify)
                            change.value.$notify(change);
                        break;
                }
            }
            return true;
        }
    }
    exports.ArrayProxy = ArrayProxy;
    buildNotPublics(ArrayProxy, ["push", "pop", "unshift", "shift", "item", "$changes", "$update"]);
    buildNotPublics(ArrayProxy, {
        length: {
            get: function () {
                if (this.$length === undefined) {
                    let raw = this.$raw();
                    this.$length = raw.length;
                    for (let i = 0, j = raw.length; i < j; i++) {
                        Object.defineProperty(this, i.toString(), {
                            enumerable: true, configurable: true, value: this.$itemConvertor ? this.$itemConvertor(raw[i]) : raw[i]
                        });
                    }
                }
                return this.$length;
            },
            set: function (newLen) {
                throw new Error("Not implement");
            }
        }
    });
    function array_in(arr, value) {
        for (let i in arr)
            if (arr[i] === value)
                return true;
        return false;
    }
});
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
//# sourceMappingURL=YA.core.js.map