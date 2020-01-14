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
        ChangeTypes[ChangeTypes["Replace"] = 1] = "Replace";
        ChangeTypes[ChangeTypes["Append"] = 2] = "Append";
        ChangeTypes[ChangeTypes["Push"] = 3] = "Push";
        ChangeTypes[ChangeTypes["Pop"] = 4] = "Pop";
        ChangeTypes[ChangeTypes["Shift"] = 5] = "Shift";
        ChangeTypes[ChangeTypes["Unshift"] = 6] = "Unshift";
        ChangeTypes[ChangeTypes["Remove"] = 7] = "Remove";
    })(ChangeTypes = exports.ChangeTypes || (exports.ChangeTypes = {}));
    let Undefined = {};
    let Null = {};
    class ValueProxy extends ValueObservable {
        constructor(raw) {
            super();
            buildHiddenMembers(this, {
                $raw: raw,
                $target: raw ? raw.call(this) : undefined,
                $owner: undefined,
                $index: undefined,
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
            let target = this.$target;
            if (!target)
                raw(target = this.$target = {});
            buildHiddenMembers(this, {
                "$target": target,
                "$props": {},
                "$type": ValueTypes.Object
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
            let target;
            super(raw);
            target = this.$target;
            if (Object.prototype.toString.call(target) !== "[object Array]")
                raw(target = this.$target = []);
            item_convertor || (item_convertor = (index, item_value, proxy) => {
                let item = new ValueProxy(null);
                item.$index = index;
                item.$raw = function (val) { return val === undefined ? proxy.$get()[this.$index] : proxy.$get()[this.$index] = val; };
                item.$target = item_value;
                return item;
            });
            for (let i in target)
                ((index) => {
                    let item = item_convertor.call(this, i, target[index], this);
                    if (item !== Undefined) {
                        item.$index = index;
                        item.$owner = this;
                        Object.defineProperty(this, index.toString(), { enumerable: true, configurable: true, get: () => item.$get(), set: (val) => item.$set(val) });
                    }
                })(i);
            buildHiddenMembers(this, {
                "$type": ValueTypes.Array,
                "$target": target,
                "$length": target.length,
                "$itemConvertor": item_convertor,
                "$changes": undefined
            });
        }
        clear() {
            let old = this.$get();
            let changes = this.$changes || (this.$changes = []);
            let len = old.length;
            if (changes)
                for (let i in changes) {
                    let change = changes[i];
                    if (change.type === ChangeTypes.Push || change.type === ChangeTypes.Unshift) {
                        len++;
                    }
                }
            let swicherValue = ValueProxy.gettingProxy;
            try {
                ValueProxy.gettingProxy = true;
                for (let i = 0; i < len; i++) {
                    let removeItem = this[i];
                    if (removeItem) {
                        delete this[i];
                        changes.push({
                            type: ChangeTypes.Remove,
                            index: i,
                            target: old,
                            item: removeItem,
                            value: removeItem.$get(),
                            sender: removeItem
                        });
                    }
                }
            }
            finally {
                ValueProxy.gettingProxy = swicherValue;
            }
            return this;
        }
        resize(newLength) {
            let arr = this.$get();
            let len = arr.length;
            if (len === newLength)
                return this;
            let changes = this.$changes || (this.$changes = []);
            if (len > newLength) {
                for (let i = newLength; i < len; i++) {
                    let removeItem = this[i];
                    delete this[i];
                    changes.push({
                        type: ChangeTypes.Remove,
                        index: i,
                        item: removeItem,
                        target: arr,
                        value: arr[i]
                    });
                }
                this.$length = newLength;
            }
            else if (len < newLength) {
                for (let i = len; i < newLength; i++)
                    ((idx) => {
                        let appendItem = this.$itemConvertor(idx, undefined, this);
                        Object.defineProperty(this, i, { enumerable: true, configurable: true, get: () => appendItem.$get(), set: (val) => appendItem.$set(val) });
                        changes.push({
                            type: ChangeTypes.Append,
                            index: i,
                            item: appendItem,
                            target: arr
                        });
                    })(i);
                this.$length = newLength;
            }
            return this;
        }
        $set(newValue) {
            newValue || (newValue = []);
            this.clear();
            super.$set(newValue);
            for (let i in newValue)
                ((idx) => {
                    let item = this.$itemConvertor(idx, newValue[idx], this);
                    if (item !== Undefined) {
                        item.$owner = this;
                        Object.defineProperty(this, i.toString(), { enumerable: true, configurable: true, get: () => item.$get(), set: (val) => item.$set(val) });
                    }
                })(i);
            this.$length = newValue.length;
            return this;
        }
        item(index, item_value) {
            if (item_value === undefined) {
                let item = this[index];
                return ValueProxy.gettingProxy ? item : item.$get();
            }
            let len = this.length;
            let size = index >= len ? index + 1 : len;
            let item = this.$itemConvertor(index, item_value, this);
            item.$owner = this;
            let oldItem;
            if (size > len) {
                for (let i = len; i < size; i++)
                    ((idx) => {
                        let insertedItem = this.$itemConvertor(idx, undefined, this);
                        insertedItem.$owner = this;
                        Object.defineProperty(this, idx.toString(), { enumerable: true, configurable: true, get: () => insertedItem.$get(), set: (val) => insertedItem.$set(val) });
                        (this.$changes || (this.$changes = [])).push({
                            sender: this,
                            type: ChangeTypes.Append,
                            index: idx,
                            value: insertedItem,
                            old: undefined
                        });
                    })(i);
                this.$length = size;
            }
            else {
                oldItem = this[index];
            }
            Object.defineProperty(this, index.toString(), { enumerable: true, configurable: true, get: () => item.$get(), set: (val) => item.$set(val) });
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Replace,
                index: index,
                item: item,
                target: this.$get(),
                old: oldItem,
                value: item_value
            });
            return this;
        }
        push(item_value) {
            let index = this.length;
            let item = this.$itemConvertor(index, item_value, this);
            item.$index = index;
            item.$owner = this;
            Object.defineProperty(this, index.toString(), { enumerable: true, configurable: true, get: () => item.$get(), set: (val) => item.$set(val) });
            this.$length++;
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Push,
                index: index,
                item: item,
                value: item_value,
                target: this.$get()
            });
            return this;
        }
        pop() {
            let len = this.length;
            if (!len)
                return this;
            let index = len - 1;
            let removeItem = this[index];
            delete this[index];
            this.$length--;
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Pop,
                item: removeItem,
                index: index,
                target: this.$get(),
                value: removeItem.$get()
            });
            return removeItem.$get();
        }
        unshift(item_value) {
            let item = this.$itemConvertor(0, item_value, this);
            item.$owner = this;
            //let changes = ;
            let len = this.length;
            for (let i = 0; i < len; i++)
                ((index) => {
                    let movedItem = this[index];
                    let newIndex = index + 1;
                    movedItem.$index = newIndex;
                    Object.defineProperty(this, newIndex, {
                        enumerable: true, configurable: true, get: () => movedItem.$get(), set: (val) => movedItem.$set(val)
                    });
                })(i);
            Object.defineProperty(this, 0, {
                enumerable: true, configurable: true, get: () => item.$get(), set: (val) => item.$set(val)
            });
            this.$length++;
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Unshift,
                index: 0,
                item: item,
                value: item_value,
                target: this.$get()
            });
            return this;
        }
        shift() {
            let len = this.length;
            if (len === undefined)
                return;
            let removeItem = this[0];
            for (let i = 1; i < len; i++)
                ((idx) => {
                    let movedItem = this[idx];
                    movedItem.$index = idx - 1;
                    Object.defineProperty(this, (idx - 1), {
                        enumerable: true, configurable: true, get: () => movedItem.$get(), set: (val) => movedItem.$set(val)
                    });
                })(i);
            delete this[len - 1];
            this.$length--;
            (this.$changes || (this.$changes = [])).push({
                sender: this,
                type: ChangeTypes.Shift,
                item: removeItem,
                index: 0,
                //value:removeItem.$get(),
                target: this.$get()
            });
            return removeItem.$get();
        }
        $update() {
            if (!super.$update())
                return true;
            let changes = this.$changes;
            if (!changes || this.$changes.length === 0)
                return true;
            this.$changes = undefined;
            let arr = this.$target;
            for (let i in changes) {
                let change = changes[i];
                switch (change.type) {
                    case ChangeTypes.Push:
                        arr.push(change.value);
                        this.$notify(change);
                        //if(change.cancel!==true && change.item) change.item.$notify(change);
                        break;
                    case ChangeTypes.Pop:
                        arr.pop();
                        this.$notify(change);
                        if (change.cancel !== true && change.item) {
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
                        if (change.cancel !== true && change.item) {
                            change.sender = change.item;
                            change.item.$notify(change);
                        }
                        break;
                    case ChangeTypes.Replace:
                        arr[change.index] = change.value;
                        this.$notify(change);
                        if (change.cancel !== true && change.old) {
                            change.sender = change.item = change.old;
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
    exports.ArrayProxy = ArrayProxy;
    buildHiddenMembers(ArrayProxy.prototype, ArrayProxy.prototype);
    Object.defineProperty(ArrayProxy.prototype, "length", {
        enumerable: false,
        configurable: false,
        get: function () {
            if (this.$length === undefined) {
                this.$length = this.$target.length;
            }
            return this.$length;
        },
        set: function (newLen) {
            this.resize(newLen);
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