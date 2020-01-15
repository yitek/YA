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
    var ProxyAccessModes;
    (function (ProxyAccessModes) {
        ProxyAccessModes[ProxyAccessModes["Raw"] = 0] = "Raw";
        ProxyAccessModes[ProxyAccessModes["Proxy"] = 1] = "Proxy";
    })(ProxyAccessModes = exports.ProxyAccessModes || (exports.ProxyAccessModes = {}));
    class ObservableProxy extends Observable {
        constructor(raw) {
            super();
            defineMembers(this, {
                $raw: raw,
                $target: raw ? raw.call(this) : undefined,
                $owner: undefined,
                $index: undefined,
                $modifiedValue: undefined,
                $type: ValueTypes.Value
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
    class ObservableObject extends ObservableProxy {
        constructor(raw, meta) {
            super(raw);
            let target = this.$target;
            if (!target)
                raw(target = this.$target = {});
            defineMembers(this, {
                "$target": target,
                "$type": ValueTypes.Object
            });
            this.$type = ValueTypes.Object;
            if (meta.fieldnames)
                for (let i in meta.fieldnames)
                    buildNotProperty(meta.fieldnames[i], this, true);
            if (meta.methodnames)
                for (let i in meta.methodnames)
                    buildNotProperty(meta.methodnames[i], this, false);
            if (meta.propBuilder) {
                let define = (name, prop) => {
                    prop || (prop = new ObservableProxy((val) => val === undefined
                        ? (this.$modifiedValue === undefined
                            ? this.$target
                            : (this.$modifiedValue === Undefined ? null : this.$modifiedValue))[name]
                        : (this.$modifiedValue === undefined
                            ? this.$target
                            : (this.$modifiedValue === Undefined ? null : this.$modifiedValue))[name] = val));
                    prop.$owner = this;
                    Object.defineProperty(this, name, {
                        enumerable: true, configurable: false, get: () => prop.$get(), set: (val) => prop.$set(val)
                    });
                    //props[name] = prop;
                    return define;
                };
                meta.propBuilder(define);
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
    class ObservableArray extends ObservableProxy {
        constructor(raw, item_convertor) {
            let target;
            super(raw);
            target = this.$target;
            if (Object.prototype.toString.call(target) !== "[object Array]")
                raw(target = this.$target = []);
            item_convertor || (item_convertor = (index, item_value, proxy) => {
                let item = new ObservableProxy(null);
                item.$index = index;
                item.$raw = function (val) { return val === undefined ? proxy.$target[this.$index] : proxy.$target[this.$index] = val; };
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
            defineMembers(this, {
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
                            value: removeItem.$get(),
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
                return ObservableProxy.accessMode ? item : item.$get();
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
});
//=======================================================================
//# sourceMappingURL=YA.core.js.map