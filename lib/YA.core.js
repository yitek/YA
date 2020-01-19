var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        var descriptor = { enumerable: false, writable: true, configurable: false, value: undefined };
        if (des === true)
            descriptor.writable = true;
        else if (des === false)
            descriptor.writable = false;
        else if (des)
            for (var n in descriptor)
                descriptor[n] = des[n];
        for (var n in props) {
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
            for (var i = 0, j = this.$_listeners.length; i < j; i++) {
                var existed = this.$_listeners.shift();
                if (existed !== listener)
                    this.$_listeners.push(existed);
            }
            return this;
        };
        target.$notify = function (evt) {
            var listeners = this.$_listeners;
            if (!listeners || listeners.length === 0)
                return this;
            for (var i in listeners) {
                listeners[i].call(this, evt);
            }
            return this;
        };
        return defineMembers(target);
    }
    exports.valueObservable = valueObservable;
    var Observable = /** @class */ (function () {
        function Observable() {
            Object.defineProperty(this, "$_listeners", { enumerable: false, writable: true, configurable: false });
        }
        return Observable;
    }());
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
    var Undefined = {};
    var ProxyAccessModes;
    (function (ProxyAccessModes) {
        ProxyAccessModes[ProxyAccessModes["Raw"] = 0] = "Raw";
        ProxyAccessModes[ProxyAccessModes["Proxy"] = 1] = "Proxy";
    })(ProxyAccessModes = exports.ProxyAccessModes || (exports.ProxyAccessModes = {}));
    var ObservableProxy = /** @class */ (function (_super) {
        __extends(ObservableProxy, _super);
        function ObservableProxy(raw, initValue) {
            var _this = _super.call(this) || this;
            var target;
            if (initValue !== undefined) {
                target = initValue === Undefined ? undefined : initValue;
                if (raw)
                    raw.call(_this, _this.$target);
            }
            else if (raw)
                target = raw.call(_this);
            defineMembers(_this, {
                $raw: raw,
                $target: target,
                $owner: undefined,
                $index: undefined,
                $modifiedValue: undefined,
                $type: TargetTypes.Value
            });
            return _this;
        }
        ObservableProxy.prototype.$get = function () {
            if (ObservableProxy.accessMode)
                return this;
            return (this.$modifiedValue === undefined) ? this.$target : (this.$modifiedValue === Undefined ? undefined : this.$modifiedValue);
        };
        ObservableProxy.prototype.$set = function (newValue) {
            //if(ValueProxy.gettingProxy) throw new Error("ValueProxy.gettingProxy=true,不可以给对象属性赋值");
            this.$modifiedValue = newValue === undefined ? Undefined : newValue;
            return this;
        };
        ObservableProxy.prototype.$update = function () {
            var newValue = this.$modifiedValue;
            if (newValue === undefined)
                return true;
            this.$modifiedValue = undefined;
            newValue = newValue === Undefined ? undefined : newValue;
            var oldValue = this.$target;
            if (newValue !== oldValue) {
                this.$raw(this.$target = newValue);
                var evtArgs = { type: ChangeTypes.Value, value: newValue, old: oldValue, sender: this };
                this.$notify(evtArgs);
                return evtArgs.cancel !== true;
            }
            return true;
        };
        ObservableProxy.prototype.toString = function () { return this.$raw().toString(); };
        ObservableProxy.accessMode = ProxyAccessModes.Raw;
        return ObservableProxy;
    }(Observable));
    exports.ObservableProxy = ObservableProxy;
    //let ValueProxyProps = ["$modifiedValue","$type","$raw","$extras","$owner"];
    defineMembers(ObservableProxy.prototype, ObservableProxy.prototype);
    function buildNotProperty(name, proxy, enumerable) {
        Object.defineProperty(proxy, name, {
            enumerable: enumerable, configurable: false,
            get: function () { return (proxy.$modifiedValue === undefined ? proxy.$target : (proxy.$modifiedValue === Undefined ? null : proxy.$modifiedValue))[name]; },
            set: function (newValue) { return (proxy.$modifiedValue === undefined ? proxy.$target : (proxy.$modifiedValue === Undefined ? null : proxy.$modifiedValue))[name] = newValue; }
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
    var ObservableObject = /** @class */ (function (_super) {
        __extends(ObservableObject, _super);
        function ObservableObject(raw, meta, initValue) {
            var _this = _super.call(this, raw, initValue) || this;
            var target = _this.$target;
            if (!target)
                raw.call(_this, target = _this.$target = {});
            defineMembers(_this, {
                "$target": target,
                "$type": TargetTypes.Object
            });
            _this.$type = TargetTypes.Object;
            if (!meta) {
                return _this;
            }
            if (meta.fieldnames)
                for (var i in meta.fieldnames)
                    buildNotProperty(meta.fieldnames[i], _this, true);
            if (meta.methodnames)
                for (var i in meta.methodnames)
                    buildNotProperty(meta.methodnames[i], _this, false);
            if (meta.propBuilder) {
                var define_1 = function (name, prop) {
                    prop || (prop = new ObservableProxy(prop_raw(name, _this)));
                    prop.$owner = _this;
                    prop.$index = name;
                    Object.defineProperty(_this, name, {
                        enumerable: true,
                        configurable: false,
                        get: prop.$type === TargetTypes.Value ? function () { return prop.$get(); } : function () { return prop; },
                        set: function (val) { return prop.$set(val); }
                    });
                    return define_1;
                };
                meta.propBuilder.call(_this, _this, define_1);
            }
            return _this;
        }
        ObservableObject.prototype.$get = function () {
            return this;
            //if(ObservableProxy.accessMode===ProxyAccessModes.Proxy) return this;
            //return this.$modifiedValue===undefined?(this.$target||null):this.$modifiedValue;
        };
        ObservableObject.prototype.$set = function (newValue) {
            _super.prototype.$set.call(this, newValue || null);
            if (!newValue)
                return;
            var accessMode = ObservableProxy.accessMode;
            try {
                ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                for (var n in this) {
                    var proxy = this[n];
                    if (proxy instanceof ObservableProxy)
                        proxy.$set(newValue[n]);
                }
            }
            finally {
                ObservableProxy.accessMode = accessMode;
            }
            return this;
        };
        ObservableObject.prototype.$update = function () {
            var result = _super.prototype.$update.call(this);
            if (result === false)
                return false;
            var accessMode = ObservableProxy.accessMode;
            try {
                ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                for (var n in this) {
                    var proxy = this[n];
                    if (proxy instanceof ObservableProxy)
                        proxy.$update();
                }
            }
            finally {
                ObservableProxy.accessMode = accessMode;
            }
            return true;
        };
        return ObservableObject;
    }(ObservableProxy));
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
                get: item.$type === TargetTypes.Value ? function () { return item.$get(); } : function () { return item; },
                set: function (val) { return item.$set(val); }
            });
        }
    }
    var ObservableArray = /** @class */ (function (_super) {
        __extends(ObservableArray, _super);
        function ObservableArray(raw, item_convertor, initValue) {
            var _this = this;
            var target;
            _this = _super.call(this, raw, initValue) || this;
            target = _this.$target;
            if (Object.prototype.toString.call(target) !== "[object Array]")
                raw.call(_this, target = _this.$target = []);
            item_convertor || (item_convertor = function (index, item_value, proxy) {
                var item = new ObservableProxy(null);
                item.$index = index;
                item.$raw = item_raw(_this);
                item.$target = item_value;
                return item;
            });
            var _loop_1 = function (i, j) {
                (function (index, item_value) {
                    if (item_value && item_value[ObservableArray.structToken] !== undefined)
                        return;
                    target.push(item_value);
                    var item = item_convertor.call(_this, i, item_value, _this);
                    define_item(_this, i, item);
                })(i, target.shift());
            };
            for (var i = 0, j = target.length; i < j; i++) {
                _loop_1(i, j);
            }
            defineMembers(_this, {
                "$type": TargetTypes.Array,
                "$target": target,
                "$length": target.length,
                "$itemConvertor": item_convertor,
                "$changes": undefined
            });
            return _this;
        }
        ObservableArray.prototype.clear = function () {
            var old = this.$get();
            var changes = this.$changes || (this.$changes = []);
            var len = old.length;
            if (changes)
                for (var i in changes) {
                    var change = changes[i];
                    if (change.type === ChangeTypes.Push || change.type === ChangeTypes.Unshift) {
                        len++;
                    }
                }
            var swicherValue = ObservableProxy.accessMode;
            try {
                ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                for (var i = 0; i < len; i++) {
                    var removeItem = this[i];
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
        };
        ObservableArray.prototype.resize = function (newLength) {
            var _this = this;
            var arr = this.$get();
            var len = arr.length;
            if (len === newLength)
                return this;
            var changes = this.$changes || (this.$changes = []);
            if (len > newLength) {
                for (var i = newLength; i < len; i++) {
                    var removeItem = this[i];
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
                var _loop_2 = function (i) {
                    (function (idx) {
                        var appendItem = _this.$itemConvertor(idx, undefined, _this);
                        define_item(_this, i, appendItem);
                        changes.push({
                            type: ChangeTypes.Append,
                            index: i,
                            item: appendItem,
                            target: arr
                        });
                    })(i);
                };
                for (var i = len; i < newLength; i++) {
                    _loop_2(i);
                }
                this.$length = newLength;
            }
            return this;
        };
        ObservableArray.prototype.$set = function (newValue) {
            var _this = this;
            newValue || (newValue = []);
            this.clear();
            _super.prototype.$set.call(this, newValue);
            for (var i in newValue)
                (function (idx) {
                    var item = _this.$itemConvertor(idx, newValue[idx], _this);
                    define_item(_this, idx, item);
                })(i);
            this.$length = newValue.length;
            return this;
        };
        ObservableArray.prototype.item = function (index, item_value) {
            var _this = this;
            if (item_value === undefined) {
                var item_1 = this[index];
                return ObservableProxy.accessMode ? item_1 : item_1.$get();
            }
            var len = this.length;
            var size = index >= len ? index + 1 : len;
            var item = this.$itemConvertor(index, item_value, this);
            var oldItem;
            if (size > len) {
                for (var i = len; i < size; i++)
                    (function (idx) {
                        var insertedItem = _this.$itemConvertor(idx, undefined, _this);
                        insertedItem.$owner = _this;
                        define_item(_this, idx, insertedItem);
                        (_this.$changes || (_this.$changes = [])).push({
                            sender: _this,
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
        };
        ObservableArray.prototype.push = function (item_value) {
            var index = this.length;
            var item = this.$itemConvertor(index, item_value, this);
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
        };
        ObservableArray.prototype.pop = function () {
            var len = this.length;
            if (!len)
                return this;
            var index = len - 1;
            var removeItem = this[index];
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
        };
        ObservableArray.prototype.unshift = function (item_value) {
            var _this = this;
            var item = this.$itemConvertor(0, item_value, this);
            item.$owner = this;
            //let changes = ;
            var len = this.length;
            for (var i = 0; i < len; i++)
                (function (index) {
                    var movedItem = _this[index];
                    var newIndex = index + 1;
                    define_item(_this, newIndex, movedItem);
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
        };
        ObservableArray.prototype.shift = function () {
            var _this = this;
            var len = this.length;
            if (len === undefined)
                return;
            var removeItem = this[0];
            for (var i = 1; i < len; i++)
                (function (idx) {
                    var movedItem = _this[idx];
                    define_item(_this, idx - 1, movedItem);
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
        };
        ObservableArray.prototype.$update = function () {
            if (!_super.prototype.$update.call(this))
                return true;
            var changes = this.$changes;
            if (!changes || this.$changes.length === 0)
                return true;
            this.$changes = undefined;
            var arr = this.$target;
            for (var i in changes) {
                var change = changes[i];
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
        };
        ObservableArray.structToken = "__STRUCT";
        return ObservableArray;
    }(ObservableProxy));
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
        var t = Object.prototype.toString.call(target);
        if (t === "[object Object]")
            return new ObservableObject(function (val) { return target; }, null);
        else if (t === "[object Array]")
            return new ObservableArray(function (val) { return target; });
        else
            return new ObservableProxy(function (val) { return target; });
    }
    exports.observable = observable;
    //=======================================================================
    var Model = /** @class */ (function () {
        function Model(data, index, owner) {
            this.index = index;
            this.owner_model = owner;
            var t = Object.prototype.toString.call(data);
            if (t === "[object Object]") {
                this.type = TargetTypes.Object;
                this.prop_models = {};
                for (var n in data) {
                    if (n === ObservableArray.structToken)
                        continue;
                    this.prop_models[n] = new Model(data[n], n, this);
                }
            }
            else if (t === "[object Array]") {
                this.type = TargetTypes.Array;
                for (var i in data) {
                    var item = data[i];
                    this.item_model = new Model(item, -1, this);
                    break;
                }
            }
            else {
                this.type = TargetTypes.Value;
            }
        }
        Model.prototype.createProxy = function (data, ownerProxy) {
            var _this = this;
            var raw;
            if (this.index !== undefined && this.owner_model) {
                raw = this.owner_model.type === TargetTypes.Object
                    ? prop_raw(this.index, ownerProxy)
                    : item_raw(ownerProxy);
            }
            else
                raw = function (val) { return val === undefined ? data : data = val; };
            var proxy;
            if (this.type === TargetTypes.Value) {
                proxy = new ObservableProxy(raw, data);
            }
            else if (this.type === TargetTypes.Object) {
                //let self:Model;
                proxy = new ObservableObject(raw, {
                    propBuilder: function (ownerProxy, define) {
                        for (var n in _this.prop_models) {
                            var prop_model = _this.prop_models[n];
                            var prop_proxy = prop_model.createProxy(data[n], ownerProxy);
                            define(n, prop_proxy);
                        }
                    }
                }, data);
            }
            else if (this.type === TargetTypes.Array) {
                var item_convertor = void 0;
                if (this.item_model) {
                    item_convertor = function (index, item_value, proxy) {
                        return _this.item_model.createProxy(item_value, proxy);
                    };
                }
                proxy = new ObservableArray(raw, item_convertor, data);
            }
            return proxy;
        };
        return Model;
    }());
    exports.Model = Model;
    //=======================================================================
    var ReactiveTypes;
    (function (ReactiveTypes) {
        ReactiveTypes[ReactiveTypes["Local"] = 0] = "Local";
        ReactiveTypes[ReactiveTypes["In"] = 1] = "In";
        ReactiveTypes[ReactiveTypes["Out"] = 2] = "Out";
        ReactiveTypes[ReactiveTypes["IO"] = 3] = "IO";
    })(ReactiveTypes = exports.ReactiveTypes || (exports.ReactiveTypes = {}));
    var ComponentReadyStates;
    (function (ComponentReadyStates) {
        ComponentReadyStates[ComponentReadyStates["Defined"] = 0] = "Defined";
        ComponentReadyStates[ComponentReadyStates["Completed"] = 1] = "Completed";
    })(ComponentReadyStates = exports.ComponentReadyStates || (exports.ComponentReadyStates = {}));
    exports.componentTypes = {};
    var currentComponentType;
    function component(tag, meta) {
        function decorator(RawType) {
            Object.defineProperty(RawType, "$tag", {
                enumerable: false, writable: false, configurable: false, value: tag
            });
            var WrappedType = /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var _this = _super.call(this) || this;
                    intializeActions(_this, WrappedType, RawType);
                    return _this;
                }
                return class_1;
            }(RawType));
            var info = {
                "$reactives": RawType.prototype.$reactives || RawType.$reactives,
                "$templates": RawType.prototype.$templates || RawType.$templates,
                "$actions": RawType.prototype.$actions || RawType.$actions,
                "$wrapType": WrappedType,
                "$rawType": RawType
                //,"$readyState":ComponentReadyStates.Defined
                ,
                "$tag": tag
            };
            for (var n in info) {
                delete RawType.prototype[n];
            }
            defineMembers(RawType, info, false);
            defineMembers(WrappedType, info, false);
            Object.defineProperty(WrappedType, "$readyState", { enumerable: false, configurable: true, writable: false, value: ComponentReadyStates.Defined });
            Object.defineProperty(RawType, "$readyState", { enumerable: false, configurable: true, writable: false, value: ComponentReadyStates.Defined });
            currentComponentType = WrappedType;
            //let wrappedProto = ;
            try {
                WrappedType.prototype = new RawType();
            }
            finally {
                currentComponentType = undefined;
            }
            initializeComponentType(WrappedType);
            exports.componentTypes[tag] = WrappedType;
            return WrappedType;
        }
        if (meta) {
            var rawType = tag;
            for (var n in meta)
                rawType.prototype[n] = meta[n];
            return decorator(rawType);
        }
        else
            return decorator;
    }
    exports.component = component;
    function intializeActions(component, WrappedType, RawType) {
        Object.defineProperty(component, "$private_updateTick", {
            enumerable: false, configurable: false, writable: true, value: undefined
        });
        var actions = WrappedType.$actions;
        for (var n in actions)
            (function (name, method, component, WrappedType) {
                var action = function () {
                    var rs = method.apply(component, arguments);
                    if (component.$private_updateTick)
                        clearTimeout(component.$private_updateTick);
                    component.$private_updateTick = setTimeout(function () {
                        clearTimeout(component.$private_updateTick);
                        component.$private_updateTick = undefined;
                        var reactives = WrappedType.$reactives;
                        var accessMode = ObservableProxy.accessMode;
                        try {
                            ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                            for (var n_1 in reactives)
                                component[n_1].$update();
                        }
                        finally {
                            ObservableProxy.accessMode = accessMode;
                        }
                    }, 0);
                    return rs;
                };
                Object.defineProperty(component, name, {
                    enumerable: false, configurable: false, writable: false, value: action
                });
                Object.defineProperty(action, "$isAction", {
                    enumerable: false, configurable: false, writable: false, value: true
                });
            })(n, RawType.prototype[n], component, WrappedType);
    }
    function initializeComponentType(WrappedType) {
        //let meta = (WrappedType as any).$meta;
        var reactives = WrappedType.$reactives;
        if (reactives)
            for (var n in reactives)
                (function (name, reactiveType, component) {
                    var privateName = "$private_" + name;
                    var initData = component[name];
                    var model = new Model(initData, name);
                    defineReactive(name, privateName, WrappedType, function () { debugger; return model.createProxy(initData); });
                })(n, reactives[n], WrappedType.prototype);
        var templates = WrappedType.$templates;
        Object.defineProperty(WrappedType.prototype, "$render", { enumerable: false, configurable: false, writable: false, value: function (partial) {
                partial || (partial = "");
                var rendername = templates[partial];
                if (rendername !== undefined) {
                    var render = this[rendername];
                    if (render) {
                        var accessMode = ObservableProxy.accessMode;
                        try {
                            ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                            return render.call(this, this);
                        }
                        finally {
                            ObservableProxy.accessMode = accessMode;
                        }
                    }
                }
                return undefined;
            } });
        Object.defineProperty(WrappedType, "$readyState", { enumerable: false, configurable: false, writable: false, value: true });
        //Object.defineProperty(RawType,"$readyState",{enumerable:false,configurable:false,writable:false,value:true});
    }
    function defineReactive(name, privateName, WrappedType, proxyCreator) {
        var descriptor = {
            enumerable: true,
            configurable: true,
            get: function () {
                debugger;
                var proxy = this[privateName];
                if (!proxy)
                    Object.defineProperty(this, privateName, { enumerable: false, writable: false, configurable: true, value: proxy = proxyCreator() });
                else {
                    delete this[privateName];
                    Object.defineProperty(this, name, {
                        enumerable: true, configurable: false, get: function () { return proxy.$get(); }, set: function (val) { return proxy.$set(val); }
                    });
                }
                return proxy.$get();
            },
            set: function (val) {
                debugger;
                var proxy = this[privateName];
                if (!proxy)
                    Object.defineProperty(this, privateName, { enumerable: false, writable: false, configurable: true, value: proxy = proxyCreator() });
                else {
                    delete this[privateName];
                    Object.defineProperty(this, name, {
                        enumerable: true, configurable: false, get: function () { return proxy.$get(); }, set: function (val) { return proxy.$set(val); }
                    });
                }
                proxy.$set(val);
            }
        };
        Object.defineProperty(WrappedType.prototype, name, descriptor);
        //Object.defineProperty(component,name,descriptor);
        //Object.defineProperty(component,name,descriptor);
    }
    function reactive(type) {
        return function (target, propName) {
            (target.$reactives || (target.$reactives = []))[propName] = ReactiveTypes[type] || type || ReactiveTypes.Local;
        };
    }
    exports.reactive = reactive;
    function action(async) {
        return function (target, propertyName) {
            (target.$actions || (target.$actions = []))[propertyName] = async;
        };
    }
    exports.action = action;
    function template(partial) {
        return function (target, propertyName) {
            (target.$templates || (target.$templates = []))[partial || ""] = propertyName;
        };
    }
    exports.template = template;
    var evtnameRegx = /(?:on)?([a-zA-Z_][a-zA-Z0-9_]*)/;
    exports.ELEMENT = function (tag, attrs) {
        if (currentComponentType && currentComponentType.$readyState !== ComponentReadyStates.Completed) {
            return;
        }
        ;
        var elem = exports.ELEMENT.createElement(tag);
        for (var attrname in attrs) {
            var attrValue = attrs[attrname];
            if (attrValue && attrValue.$isAction) {
                var match = attrname.match(evtnameRegx);
                exports.ELEMENT.attach(elem, match ? match[1] : attrname, attrValue);
                continue;
            }
            if (attrValue instanceof ObservableProxy) {
                var binder = attrBinders[name];
                if (binder) {
                    binder(elem, attrValue);
                    continue;
                }
                else
                    attrValue = attrValue.$get();
            }
            exports.ELEMENT.setAttribute(elem, attrname, attrValue);
        }
        for (var i = 2, j = arguments.length; i < j; i++) {
            var child = arguments[i];
            if (!child)
                continue;
            if (!exports.ELEMENT.isElement(child)) {
                if (child instanceof ObservableProxy) {
                    var proxy = child;
                    child = exports.ELEMENT.createText(child.$get());
                    attrBinders["#text"](child, proxy);
                }
                else {
                    child = exports.ELEMENT.createText(child);
                }
            }
            exports.ELEMENT.appendChild(elem, child);
        }
        return elem;
    };
    exports.ELEMENT.isElement = function (elem) {
        return elem.nodeType === 1;
    };
    exports.ELEMENT.createElement = function (tag) {
        return document.createElement(tag);
    };
    exports.ELEMENT.createText = function (txt) {
        return document.createTextNode(txt);
    };
    exports.ELEMENT.setAttribute = function (elem, name, value) {
        elem.setAttribute(name, value);
    };
    exports.ELEMENT.appendChild = function (elem, child) {
        elem.appendChild(child);
    };
    exports.ELEMENT.removeAllChildrens = function (elem) {
        elem.innerHTML = elem.nodeValue = "";
    };
    exports.ELEMENT.attach = function (elem, evtname, handler) {
        if (elem.addEventListener)
            elem.addEventListener(evtname, handler, false);
        else if (elem.attachEvent)
            elem.attachEvent('on' + evtname, handler);
        else
            elem['on' + evtname] = handler;
    };
    var attrBinders = {};
    function changeEventToText(e) {
        var value = e.value === undefined ? (e.item ? e.item.$get() : e.value) : e.value;
        return (value === undefined || value === null) ? "" : value.toString();
    }
    attrBinders["#text"] = function (elem, bindValue) {
        debugger;
        bindValue.$subscribe(function (e) {
            debugger;
            elem.nodeValue = changeEventToText(e);
        });
    };
    attrBinders["value"] = function (elem, bindValue) {
        debugger;
        bindValue.$subscribe(function (e) {
            elem.value = changeEventToText(e);
        });
        elem.value = bindValue.toString();
    };
    var eventBinders = {};
    eventBinders["onchange"] = function (elem, handler) {
        var bindEdit = function (elem, handler) {
            var tick;
            var evtHandler = function (e) {
                if (tick)
                    clearTimeout(tick);
                tick = setTimeout(function () {
                    clearTimeout(tick);
                    tick = 0;
                    handler(e);
                }, 150);
            };
            exports.ELEMENT.attach(elem, "keydown", evtHandler);
            exports.ELEMENT.attach(elem, "keyup", evtHandler);
            exports.ELEMENT.attach(elem, "keypress", evtHandler);
        };
        if (elem.tagName === "INPUT") {
            if (elem.type === "text")
                bindEdit(elem, handler);
        }
        else if (elem.tagName === "TEXTAREA") {
            bindEdit(elem, handler);
        }
        exports.ELEMENT.attach(elem, "onchange", handler);
        exports.ELEMENT.attach(elem, "focusout", handler);
        exports.ELEMENT.attach(elem, "blur", handler);
    };
    var YA = {
        Observable: Observable, ProxyAccessModes: ProxyAccessModes, ObservableProxy: ObservableProxy, ObservableObject: ObservableObject, ObservableArray: ObservableArray, Model: Model,
        component: component, reactive: reactive, action: action,
        ELEMENT: exports.ELEMENT
    };
    if (typeof window !== 'undefined')
        window.YA = YA;
    exports.default = YA;
});
//# sourceMappingURL=YA.core.js.map