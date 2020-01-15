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
    function defineMembers(target, props, des) {
        props || (props = target);
        let descriptor = { enumerable: false, writable: true, configurable: false, value: undefined };
        if (des)
            for (let n in descriptor)
                descriptor[n] = des[n];
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
        return defineMembers(target);
    }
    exports.valueObservable = valueObservable;
    class Observable {
        constructor() {
            Object.defineProperty(this, "$_listeners", { enumerable: false, writable: true, configurable: false });
        }
    }
    exports.Observable = Observable;
    valueObservable(Observable.prototype);
    //================================================================
    var TargetTypes;
    (function (TargetTypes) {
        TargetTypes[TargetTypes["Value"] = 0] = "Value";
        TargetTypes[TargetTypes["Object"] = 1] = "Object";
        TargetTypes[TargetTypes["Array"] = 2] = "Array";
    })(TargetTypes = exports.TargetTypes || (exports.TargetTypes = {}));
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
    var ProxyAccessModes;
    (function (ProxyAccessModes) {
        ProxyAccessModes[ProxyAccessModes["Raw"] = 0] = "Raw";
        ProxyAccessModes[ProxyAccessModes["Proxy"] = 1] = "Proxy";
    })(ProxyAccessModes = exports.ProxyAccessModes || (exports.ProxyAccessModes = {}));
    class ObservableProxy extends Observable {
        constructor(raw, initValue) {
            super();
            let target;
            if (initValue !== undefined) {
                target = initValue === Undefined ? undefined : initValue;
                if (raw)
                    raw.call(this, this.$target);
            }
            else if (raw)
                target = raw.call(this);
            defineMembers(this, {
                $raw: raw,
                $target: target,
                $owner: undefined,
                $index: undefined,
                $modifiedValue: undefined,
                $type: TargetTypes.Value
            });
        }
        $get() {
            if (ObservableProxy.accessMode)
                return this;
            return (this.$modifiedValue === undefined) ? this.$target : (this.$modifiedValue === Undefined ? undefined : this.$modifiedValue);
        }
        $set(newValue) {
            //if(ValueProxy.gettingProxy) throw new Error("ValueProxy.gettingProxy=true,不可以给对象属性赋值");
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
    ObservableProxy.accessMode = ProxyAccessModes.Raw;
    exports.ObservableProxy = ObservableProxy;
    //let ValueProxyProps = ["$modifiedValue","$type","$raw","$extras","$owner"];
    defineMembers(ObservableProxy.prototype, ObservableProxy.prototype);
    function buildNotProperty(name, proxy, enumerable) {
        Object.defineProperty(proxy, name, {
            enumerable: enumerable, configurable: false,
            get: () => (proxy.$modifiedValue === undefined ? proxy.$target : (proxy.$modifiedValue === Undefined ? null : proxy.$modifiedValue))[name],
            set: (newValue) => (proxy.$modifiedValue === undefined ? proxy.$target : (proxy.$modifiedValue === Undefined ? null : proxy.$modifiedValue))[name] = newValue
        });
    }
    function prop_raw(name, objProxy) {
        return function (val) {
            return val === undefined
                ? (objProxy.$modifiedValue === undefined
                    ? objProxy.$target
                    : (objProxy.$modifiedValue === Undefined ? null : objProxy.$modifiedValue))[name]
                : (objProxy.$modifiedValue === undefined
                    ? objProxy.$target
                    : (objProxy.$modifiedValue === Undefined ? null : objProxy.$modifiedValue))[name] = val;
        };
    }
    class ObservableObject extends ObservableProxy {
        constructor(raw, meta, initValue) {
            super(raw, initValue);
            let target = this.$target;
            if (!target)
                raw.call(this, target = this.$target = {});
            defineMembers(this, {
                "$target": target,
                "$type": TargetTypes.Object
            });
            this.$type = TargetTypes.Object;
            if (!meta) {
                return;
            }
            if (meta.fieldnames)
                for (let i in meta.fieldnames)
                    buildNotProperty(meta.fieldnames[i], this, true);
            if (meta.methodnames)
                for (let i in meta.methodnames)
                    buildNotProperty(meta.methodnames[i], this, false);
            if (meta.propBuilder) {
                let define = (name, prop) => {
                    prop || (prop = new ObservableProxy(prop_raw(name, this)));
                    prop.$owner = this;
                    prop.$index = name;
                    Object.defineProperty(this, name, {
                        enumerable: true,
                        configurable: false,
                        get: prop.$type === TargetTypes.Value ? () => prop.$get() : () => prop,
                        set: (val) => prop.$set(val)
                    });
                    return define;
                };
                meta.propBuilder.call(this, this, define);
            }
        }
        $get() {
            if (ObservableProxy.accessMode === ProxyAccessModes.Proxy)
                return this;
            return this.$modifiedValue === undefined ? (this.$target || null) : this.$modifiedValue;
        }
        $set(newValue) {
            super.$set(newValue || null);
            if (!newValue)
                return;
            let accessMode = ObservableProxy.accessMode;
            try {
                ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                for (let n in this) {
                    let proxy = this[n];
                    if (proxy instanceof ObservableProxy)
                        proxy.$set(newValue[n]);
                }
            }
            finally {
                ObservableProxy.accessMode = accessMode;
            }
            return this;
        }
        $update() {
            let result = super.$update();
            if (result === false)
                return false;
            let accessMode = ObservableProxy.accessMode;
            try {
                ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                for (let n in this) {
                    let proxy = this[n];
                    if (proxy instanceof ObservableProxy)
                        proxy.$update();
                }
            }
            finally {
                ObservableProxy.accessMode = accessMode;
            }
            return true;
        }
    }
    exports.ObservableObject = ObservableObject;
    defineMembers(ObservableObject.prototype, ObservableObject.prototype);
    function item_raw(ownerProxy) {
        return function (val) { return val === undefined ? ownerProxy.$target[this.$index] : ownerProxy.$target[this.$index] = val; };
    }
    function define_item(arrProxy, index, item) {
        if (item !== Undefined) {
            item.$index = index;
            item.$owner = arrProxy;
            Object.defineProperty(arrProxy, index.toString(), {
                enumerable: true,
                configurable: true,
                get: item.$type === TargetTypes.Value ? () => item.$get() : () => item,
                set: (val) => item.$set(val)
            });
        }
    }
    class ObservableArray extends ObservableProxy {
        constructor(raw, item_convertor, initValue) {
            let target;
            super(raw, initValue);
            target = this.$target;
            if (Object.prototype.toString.call(target) !== "[object Array]")
                raw.call(this, target = this.$target = []);
            item_convertor || (item_convertor = (index, item_value, proxy) => {
                let item = new ObservableProxy(null);
                item.$index = index;
                item.$raw = item_raw(this);
                item.$target = item_value;
                return item;
            });
            for (let i = 0, j = target.length; i < j; i++)
                ((index, item_value) => {
                    if (item_value && item_value[ObservableArray.structToken] !== undefined)
                        return;
                    target.push(item_value);
                    let item = item_convertor.call(this, i, item_value, this);
                    define_item(this, i, item);
                })(i, target.shift());
            defineMembers(this, {
                "$type": TargetTypes.Array,
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
            let swicherValue = ObservableProxy.accessMode;
            try {
                ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                for (let i = 0; i < len; i++) {
                    let removeItem = this[i];
                    if (removeItem) {
                        delete this[i];
                        changes.push({
                            type: ChangeTypes.Remove,
                            index: i,
                            target: old,
                            item: removeItem,
                            sender: removeItem
                        });
                    }
                }
            }
            finally {
                ObservableProxy.accessMode = swicherValue;
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
                        define_item(this, i, appendItem);
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
                    define_item(this, idx, item);
                })(i);
            this.$length = newValue.length;
            return this;
        }
        item(index, item_value) {
            if (item_value === undefined) {
                let item = this[index];
                return ObservableProxy.accessMode ? item : item.$get();
            }
            let len = this.length;
            let size = index >= len ? index + 1 : len;
            let item = this.$itemConvertor(index, item_value, this);
            let oldItem;
            if (size > len) {
                for (let i = len; i < size; i++)
                    ((idx) => {
                        let insertedItem = this.$itemConvertor(idx, undefined, this);
                        insertedItem.$owner = this;
                        define_item(this, idx, insertedItem);
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
            define_item(this, index, item);
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
            define_item(this, index, item);
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
                    define_item(this, newIndex, movedItem);
                })(i);
            define_item(this, 0, item);
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
                    define_item(this, idx - 1, movedItem);
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
    ObservableArray.structToken = "__STRUCT";
    exports.ObservableArray = ObservableArray;
    defineMembers(ObservableArray.prototype, ObservableArray.prototype);
    Object.defineProperty(ObservableArray.prototype, "length", {
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
    //=====================================
    function observable(target) {
        if (target === undefined)
            return new Observable();
        let t = Object.prototype.toString.call(target);
        if (t === "[object Object]")
            return new ObservableObject((val) => target, null);
        else if (t === "[object Array]")
            return new ObservableArray((val) => target);
        else
            return new ObservableProxy((val) => target);
    }
    exports.observable = observable;
    //=======================================================================
    class Model {
        constructor(data, index, owner) {
            this.index = index;
            this.owner_model = owner;
            let t = Object.prototype.toString.call(data);
            if (t === "[object Object]") {
                this.type = TargetTypes.Object;
                this.prop_models = {};
                for (let n in data) {
                    if (n === ObservableArray.structToken)
                        continue;
                    this.prop_models[n] = new Model(data[n], n, this);
                }
            }
            else if (t === "[object Array]") {
                this.type = TargetTypes.Array;
                for (let i in data) {
                    let item = data[i];
                    this.item_model = new Model(item, -1, this);
                    break;
                }
            }
            else {
                this.type = TargetTypes.Value;
            }
        }
        createProxy(data, ownerProxy) {
            let raw;
            if (this.index !== undefined) {
                raw = this.owner_model.type === TargetTypes.Object
                    ? prop_raw(this.index, ownerProxy)
                    : item_raw(ownerProxy);
            }
            else
                raw = (val) => val === undefined ? data : data = val;
            let proxy;
            if (this.type === TargetTypes.Value) {
                proxy = new ObservableProxy(raw);
            }
            else if (this.type === TargetTypes.Object) {
                //let self:Model;
                proxy = new ObservableObject(raw, {
                    propBuilder: (ownerProxy, define) => {
                        for (let n in this.prop_models) {
                            let prop_model = this.prop_models[n];
                            let prop_proxy = prop_model.createProxy(data[n], ownerProxy);
                            define(n, prop_proxy);
                        }
                    }
                });
            }
            else if (this.type === TargetTypes.Array) {
                let item_convertor;
                if (this.item_model) {
                    item_convertor = (index, item_value, proxy) => this.item_model.createProxy(item_value, proxy);
                }
                proxy = new ObservableArray(raw, item_convertor);
            }
            proxy.$target = data;
            return proxy;
        }
    }
    exports.Model = Model;
});
//# sourceMappingURL=YA.core.js.map