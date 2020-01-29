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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
    function intimate(strong) {
        return function (target, propName) {
            if (propName !== undefined) {
                Object.defineProperty(target, propName, { enumerable: false, writable: !strong, configurable: strong !== true, value: target[propName] });
            }
            else {
                target = typeof target === "function" ? target.prototype : target;
                for (var n in target)
                    Object.defineProperty(target, n, { enumerable: false, writable: !strong, configurable: strong !== true, value: target[n] });
            }
        };
    }
    exports.intimate = intimate;
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
    var Observable = /** @class */ (function () {
        function Observable() {
            Object.defineProperty(this, "$_topics", { enumerable: false, writable: true, configurable: false });
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
        Observable.prototype.$subscribe = function (topicOrListener, listener) {
            if (listener === undefined) {
                listener = topicOrListener;
                topicOrListener = "";
            }
            var topics = this.$_topics || (this.$_topics = {});
            var handlers = topics[topicOrListener] || (topics[topicOrListener] = []);
            handlers.push(listener);
            return this;
        };
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
        Observable.prototype.$unsubscribe = function (topicOrListener, listener) {
            if (listener === undefined) {
                listener = topicOrListener;
                topicOrListener = "";
            }
            var topics, handlers;
            if (!(topics = this.$_topics))
                return this;
            if (!(handlers = topics[topicOrListener]))
                return this;
            for (var i = 0, j = handlers.length; i < j; i++) {
                var existed = handlers.shift();
                if (existed !== listener)
                    handlers.push(existed);
            }
            return this;
        };
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
        Observable.prototype.$notify = function (topicOrEvtArgs, evtArgs) {
            if (evtArgs === undefined) {
                evtArgs = topicOrEvtArgs;
                topicOrEvtArgs = "";
            }
            var topics, handlers;
            if (!(topics = this.$_topics))
                return this;
            if (!(handlers = topics[topicOrEvtArgs]))
                return this;
            for (var i in handlers) {
                handlers[i].call(this, evtArgs);
            }
            return this;
        };
        Observable = __decorate([
            intimate()
        ], Observable);
        return Observable;
    }());
    exports.Observable = Observable;
    //defineMembers(Observable.prototype);
    //================================================================
    var DataTypes;
    (function (DataTypes) {
        DataTypes[DataTypes["Value"] = 0] = "Value";
        DataTypes[DataTypes["Object"] = 1] = "Object";
        DataTypes[DataTypes["Array"] = 2] = "Array";
    })(DataTypes = exports.DataTypes || (exports.DataTypes = {}));
    var ProxyAccessModes;
    (function (ProxyAccessModes) {
        ProxyAccessModes[ProxyAccessModes["Default"] = 0] = "Default";
        ProxyAccessModes[ProxyAccessModes["Raw"] = 1] = "Raw";
        ProxyAccessModes[ProxyAccessModes["Proxy"] = 2] = "Proxy";
    })(ProxyAccessModes = exports.ProxyAccessModes || (exports.ProxyAccessModes = {}));
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
    var ObservableProxy = /** @class */ (function (_super) {
        __extends(ObservableProxy, _super);
        function ObservableProxy(raw, initValue, extras) {
            var _this = _super.call(this) || this;
            if (initValue !== undefined) {
                _this.$target = initValue === Undefined ? undefined : initValue;
                if (raw)
                    raw.call(_this, _this.$target);
            }
            else if (raw)
                _this.$target = raw.call(_this);
            _this.$_raw = raw;
            _this.$extras = extras;
            _this.$type = DataTypes.Value;
            return _this;
        }
        ObservableProxy_1 = ObservableProxy;
        ObservableProxy.prototype.$get = function () {
            if (ObservableProxy_1.accessMode === ProxyAccessModes.Proxy)
                return this;
            if (ObservableProxy_1.accessMode === ProxyAccessModes.Raw)
                return this.$_raw();
            return (this.$_modifiedValue === undefined) ? this.$target : (this.$_modifiedValue === Undefined ? undefined : this.$_modifiedValue);
        };
        ObservableProxy.prototype.$set = function (newValue) {
            if (ObservableProxy_1.accessMode === ProxyAccessModes.Raw) {
                this.$_raw.call(this, newValue);
                return this;
            }
            this.$_modifiedValue = newValue === undefined ? Undefined : newValue;
            return this;
        };
        ObservableProxy.prototype.$update = function () {
            var newValue = this.$_modifiedValue;
            if (newValue === undefined)
                return true;
            this.$_modifiedValue = undefined;
            newValue = newValue === Undefined ? undefined : newValue;
            var oldValue = this.$target;
            if (newValue !== oldValue) {
                this.$_raw(this.$target = newValue);
                var evtArgs = { type: ChangeTypes.Value, value: newValue, old: oldValue, sender: this };
                this.$notify(evtArgs);
                return evtArgs.cancel !== true;
            }
            return true;
        };
        ObservableProxy.prototype.toString = function () { var rawValue = this.$_raw(); return rawValue ? rawValue.toString() : rawValue; };
        ObservableProxy.accessMode = ProxyAccessModes.Default;
        __decorate([
            intimate()
        ], ObservableProxy.prototype, "$type", void 0);
        __decorate([
            intimate()
        ], ObservableProxy.prototype, "$target", void 0);
        __decorate([
            intimate()
        ], ObservableProxy.prototype, "$extras", void 0);
        __decorate([
            intimate()
        ], ObservableProxy.prototype, "$_index", void 0);
        __decorate([
            intimate()
        ], ObservableProxy.prototype, "$_modifiedValue", void 0);
        __decorate([
            intimate()
        ], ObservableProxy.prototype, "$_owner", void 0);
        __decorate([
            intimate()
        ], ObservableProxy.prototype, "$_raw", void 0);
        ObservableProxy = ObservableProxy_1 = __decorate([
            intimate()
        ], ObservableProxy);
        return ObservableProxy;
        var ObservableProxy_1;
    }(Observable));
    exports.ObservableProxy = ObservableProxy;
    //let ValueProxyProps = ["$modifiedValue","$type","$raw","$extras","$owner"];
    defineMembers(ObservableProxy.prototype, ObservableProxy.prototype);
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
        function ObservableObject(raw, initValue, extras) {
            var _this = _super.call(this, raw, initValue, extras) || this;
            var target = _this.$target;
            if (!target)
                raw.call(_this, target = _this.$target = {});
            defineMembers(_this, {
                "$target": target,
                "$type": DataTypes.Object
            });
            _this.$type = DataTypes.Object;
            return _this;
        }
        ObservableObject.prototype.$prop = function (name, prop) {
            var _this = this;
            if (prop === false) {
                Object.defineProperty(this, name, {
                    enumerable: true, configurable: false,
                    get: function () { return (_this.$_modifiedValue === undefined ? _this.$target : (_this.$_modifiedValue === Undefined ? null : _this.$_modifiedValue))[name]; },
                    set: function (newValue) { return (_this.$_modifiedValue === undefined ? _this.$target : (_this.$_modifiedValue === Undefined ? null : _this.$_modifiedValue))[name] = newValue; }
                });
                return this;
            }
            if (prop === true || prop instanceof ObservableProxy) {
                prop = prop instanceof ObservableProxy ? prop : (new ObservableProxy(prop_raw(name, this)));
                prop.$_owner = this;
                prop.$_index = name;
                Object.defineProperty(this, name, {
                    enumerable: true,
                    configurable: false,
                    get: prop.$type === DataTypes.Value ? function () { return prop.$get(); } : function () { return prop; },
                    set: function (val) { return prop.$set(val); }
                });
                return this;
            }
            if (typeof prop === 'function') {
                var prop_value_1;
                Object.defineProperty(this, name, {
                    enumerable: false,
                    configurable: false,
                    get: function () {
                        if (prop_value_1 === undefined)
                            prop_value_1 = prop.call(_this, _this, name);
                        return prop_value_1.get ? prop_value_1.get() : prop_value_1.$get();
                    },
                    set: function (val) {
                        if (prop_value_1 === undefined)
                            prop_value_1 = prop.call(_this, _this, name);
                        return prop_value_1.set ? prop_value_1.set(val) : prop_value_1.$set(val);
                    }
                });
                return this;
            }
            Object.defineProperty(this, name, prop);
            return this;
        };
        ObservableObject.prototype.$get = function () {
            if (ObservableProxy.accessMode === ProxyAccessModes.Raw)
                return this.$_raw();
            return this;
        };
        ObservableObject.prototype.$set = function (newValue) {
            _super.prototype.$set.call(this, newValue || null);
            if (!newValue || ObservableProxy.accessMode === ProxyAccessModes.Raw)
                return this;
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
            item.$_index = index;
            item.$_owner = arrProxy;
            Object.defineProperty(arrProxy, index.toString(), {
                enumerable: true,
                configurable: true,
                get: item.$type === DataTypes.Value ? function () { return item.$get(); } : function () { return item; },
                set: function (val) { return item.$set(val); }
            });
        }
    }
    var ObservableArray = /** @class */ (function (_super) {
        __extends(ObservableArray, _super);
        function ObservableArray(raw, item_convertor, initValue, extras) {
            var _this = this;
            var target;
            _this = _super.call(this, raw, initValue, extras) || this;
            target = _this.$target;
            if (Object.prototype.toString.call(target) !== "[object Array]")
                raw.call(_this, target = _this.$target = []);
            item_convertor || (item_convertor = function (index, item_value, proxy) {
                var item = new ObservableProxy(null);
                item.$_index = index;
                item.$_raw = item_raw(_this);
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
                "$type": DataTypes.Array,
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
            if (ObservableProxy.accessMode === ProxyAccessModes.Raw) {
                this.$_raw(newValue);
                return this;
            }
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
                        insertedItem.$_owner = _this;
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
            item.$_owner = this;
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
    var ObservableSchema = /** @class */ (function () {
        function ObservableSchema(index, owner) {
            var path;
            index = index === undefined || index === null ? "" : index;
            if (owner) {
                var ppath = owner.$path;
                path = ppath ? ppath + "." + index : index;
            }
            else
                path = index;
            defineMembers(this, {
                "$type": DataTypes.Value,
                "$index": index,
                "$path": path,
                "$owner_schema": owner,
                "$item_schema": null,
                "$init_data": undefined
            });
        }
        ObservableSchema.prototype.$init = function (initData) {
            this.$init_data = initData;
            var t = Object.prototype.toString.call(initData);
            if (t === "[object Object]") {
                this.$type = DataTypes.Object;
                for (var n in initData) {
                    if (n === ObservableArray.structToken)
                        continue;
                    var memberSchema = new ObservableSchema(n, this).$init(initData[n]);
                    Object.defineProperty(this, n, { enumerable: true, configurable: false, writable: false, value: memberSchema });
                }
            }
            else if (t === "[object Array]") {
                this.$type = DataTypes.Array;
                for (var i in initData) {
                    var item = initData[i];
                    this.$item_schema = new ObservableSchema(-1, this).$init(item);
                    break;
                }
            }
            else {
                this.$type = DataTypes.Value;
            }
            return this;
        };
        ObservableSchema.prototype.$createProxy = function (initData, ownerProxy) {
            var _this = this;
            if (!ownerProxy) {
                if (initData instanceof ObservableProxy) {
                    ownerProxy = initData;
                    initData = undefined;
                }
            }
            var raw;
            if (this.$index !== undefined && this.$owner_schema) {
                raw = this.$owner_schema.$type === DataTypes.Object
                    ? prop_raw(this.$index, ownerProxy)
                    : item_raw(ownerProxy);
            }
            else
                raw = function (val) { return val === undefined ? initData : initData = val; };
            var proxy;
            var type = this.$type;
            if (type === DataTypes.Value) {
                proxy = new ObservableProxy(raw, initData, this);
            }
            else if (type === DataTypes.Object) {
                //let self:Model;
                proxy = new ObservableObject(raw, initData, this);
                for (var n in this) {
                    var schema = this[n];
                    if (schema instanceof ObservableSchema) {
                        proxy.$prop(n, schema.$createProxy(initData[n], proxy));
                    }
                }
            }
            else if (type === DataTypes.Array) {
                var item_convertor = void 0;
                if (this.$item_schema) {
                    item_convertor = function (index, item_value, proxy) {
                        return _this.$item_schema.$createProxy(item_value, proxy);
                    };
                }
                proxy = new ObservableArray(raw, item_convertor, initData, this);
            }
            return proxy;
        };
        return ObservableSchema;
    }());
    exports.ObservableSchema = ObservableSchema;
    //=======================================================================
    var ComponentReadyStates;
    (function (ComponentReadyStates) {
        ComponentReadyStates[ComponentReadyStates["Defined"] = 0] = "Defined";
        ComponentReadyStates[ComponentReadyStates["Completed"] = 1] = "Completed";
    })(ComponentReadyStates = exports.ComponentReadyStates || (exports.ComponentReadyStates = {}));
    var ReactiveTypes;
    (function (ReactiveTypes) {
        ReactiveTypes[ReactiveTypes["Local"] = 0] = "Local";
        ReactiveTypes[ReactiveTypes["In"] = 1] = "In";
        ReactiveTypes[ReactiveTypes["Out"] = 2] = "Out";
        ReactiveTypes[ReactiveTypes["Ref"] = 3] = "Ref";
        ReactiveTypes[ReactiveTypes["Each"] = 4] = "Each";
    })(ReactiveTypes = exports.ReactiveTypes || (exports.ReactiveTypes = {}));
    exports.componentTypes = {};
    var currentComponentType;
    function reactive(type) {
        return function (target, propName) {
            type = typeof type === "string" ? ReactiveTypes[type] : type;
            (target.$reactives || (target.$reactives = []))[propName] = type || ReactiveTypes.Local;
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
    function component(tag) {
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
                    var _this = this;
                    var accessMode = ObservableProxy.accessMode;
                    try {
                        ObservableProxy.accessMode = ProxyAccessModes.Raw;
                        if (!args.length)
                            _this = _super.call(this) || this;
                        else
                            RawType.apply(_this, args);
                    }
                    finally {
                        ObservableProxy.accessMode = accessMode;
                    }
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
            initializeReactives(WrappedType);
            initializeTemplates(WrappedType);
            exports.componentTypes[tag] = WrappedType;
            Object.defineProperty(WrappedType, "$readyState", { enumerable: false, configurable: false, writable: false, value: true });
            return WrappedType;
        }
        if (typeof tag === "function") {
            var rawType = tag;
            return decorator(rawType);
        }
        else
            return decorator;
    }
    exports.component = component;
    function initializeTemplates(WrappedType) {
        var templates = WrappedType.$templates;
        Object.defineProperty(WrappedType, "$render", { enumerable: false, configurable: false, writable: false, value: function (component, partial, container) {
                partial || (partial = "");
                var nameOrMethod = templates[partial];
                if (nameOrMethod !== undefined) {
                    if (nameOrMethod.$virtual_node !== undefined)
                        return nameOrMethod.call(component, container);
                    var renderMethod = component[nameOrMethod];
                    if (!renderMethod)
                        return;
                    var templateMethod = void 0;
                    var node_1;
                    var accessMode = ObservableProxy.accessMode;
                    try {
                        ObservableProxy.accessMode = ProxyAccessModes.Proxy;
                        node_1 = renderMethod.call(component, container);
                        if (exports.ELEMENT.isElement(node_1)) {
                            templateMethod = renderMethod;
                            Object.defineProperty(templateMethod, "$virtual_node", { enumerable: false, writable: false, configurable: false, value: false });
                        }
                        else {
                            templateMethod = function (component, _container) { return node_1.render(component, container); };
                            Object.defineProperty(templateMethod, "$virtual_node", { enumerable: false, writable: false, configurable: false, value: node_1 });
                        }
                    }
                    finally {
                        ObservableProxy.accessMode = accessMode;
                    }
                    component[nameOrMethod] = templateMethod;
                    return templateMethod === renderMethod ? node_1 : templateMethod.call(component, component, container);
                }
                return undefined;
            } });
    }
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
                Object.defineProperty(action, "$actionName", {
                    enumerable: false, configurable: false, writable: false, value: name
                });
            })(n, RawType.prototype[n], component, WrappedType);
    }
    function initializeReactives(WrappedType) {
        var reactives = WrappedType.$reactives;
        if (reactives)
            for (var n in reactives)
                (function (name, reactiveType, component) {
                    var privateName = "$private_" + name;
                    var initData = component[name];
                    var model = new ObservableSchema(name, initData);
                    if (reactiveType === ReactiveTypes.Each) {
                        defineReactive(name, privateName, WrappedType, enumerableReactiveCreator(name, function () { return model.$createProxy(initData); }), true);
                    }
                    else {
                        defineReactive(name, privateName, WrappedType, function () { return model.$createProxy(initData); }, false);
                    }
                })(n, reactives[n], WrappedType.prototype);
    }
    function enumerableReactiveCreator(name, proxyCreator) {
        return function createEnumerableProxy(proxy) {
            var component = this;
            proxy || (proxy = proxyCreator());
            Object.defineProperty(proxy, "$new", {
                enumerable: false, configurable: false, writable: false, value: function () {
                    var newProxy = proxyCreator();
                    createEnumerableProxy.call(component, newProxy);
                    Object.defineProperty(component, name, {
                        enumerable: true, configurable: true, get: function () { return newProxy.$get(); }, set: function (val) { return newProxy.$set(val); }
                    });
                    return newProxy;
                }
            });
            Object.defineProperty(proxy, "$replace", {
                enumerable: false, configurable: false, writable: false, value: function (newProxy) {
                    createEnumerableProxy.call(component, newProxy);
                    Object.defineProperty(component, name, {
                        enumerable: true, configurable: true, get: function () { return newProxy.$get(); }, set: function (val) { return newProxy.$set(val); }
                    });
                    return newProxy;
                }
            });
            return proxy;
        };
    }
    function defineReactive(name, privateName, WrappedType, proxyCreator, configurable) {
        var descriptor = {
            enumerable: true,
            configurable: true,
            get: function () {
                var proxy = this[privateName];
                if (!proxy)
                    Object.defineProperty(this, privateName, { enumerable: false, writable: false, configurable: true, value: proxy = proxyCreator.call(this) });
                else {
                    delete this[privateName];
                    Object.defineProperty(this, name, {
                        enumerable: true, configurable: configurable, get: function () { return proxy.$get(); }, set: function (val) { return proxy.$set(val); }
                    });
                }
                return proxy.$get();
            },
            set: function (val) {
                var proxy = this[privateName];
                if (!proxy)
                    Object.defineProperty(this, privateName, { enumerable: false, writable: false, configurable: true, value: proxy = proxyCreator.call(this) });
                else {
                    delete this[privateName];
                    Object.defineProperty(this, name, {
                        enumerable: true, configurable: configurable, get: function () { return proxy.$get(); }, set: function (val) { return proxy.$set(val); }
                    });
                }
                proxy.$set(val);
            }
        };
        Object.defineProperty(WrappedType.prototype, name, descriptor);
    }
    var evtnameRegx = /(?:on)?([a-zA-Z_][a-zA-Z0-9_]*)/;
    var VirtualNode = /** @class */ (function () {
        function VirtualNode() {
        }
        VirtualNode.prototype.genCodes = function (variables, codes, tabs) {
            return null;
        };
        VirtualNode.prototype.genChildrenCodes = function (variables, codes, tabs) {
            return null;
        };
        VirtualNode.prototype.render = function (component, container) {
            var variables = [];
            var codeText = this.genCodes(variables).join("");
            console.log(codeText);
            var actualRenderFn = new Function("variables", "ELEMENT", "component", "container", codeText);
            this.render = function (component, container) { return actualRenderFn(variables, exports.ELEMENT, component, container); };
            return this.render(component, container);
        };
        VirtualNode.prototype.renderChildren = function (component, container) {
            var variables = [];
            var actualRenderFn = new Function("ELEMENT", "component", "elem", this.genChildrenCodes(variables).join("") + "return children;\n");
            this.renderChildren = function (component, container) { return actualRenderFn(exports.ELEMENT, component, container); };
            return this.renderChildren(component, container);
        };
        return VirtualNode;
    }());
    exports.VirtualNode = VirtualNode;
    var VirtualTextNode = /** @class */ (function (_super) {
        __extends(VirtualTextNode, _super);
        function VirtualTextNode(content) {
            var _this = _super.call(this) || this;
            _this.content = content;
            return _this;
        }
        VirtualTextNode.prototype.genCodes = function (variables, codes, tabs) {
            codes || (codes = []);
            tabs || (tabs = "");
            if (this.content instanceof ObservableProxy) {
                if (this.content.$extras.path === "name")
                    debugger;
                codes.push(tabs + "var proxy=component." + this.content.$extras.path + ";\n");
                codes.push(tabs + "var elem=ELEMENT.createText(proxy.$get());\n");
                codes.push(tabs + "proxy.$subscribe(function(e){elem.nodeValue = ELEMENT.changeEventToText(e);})\n");
            }
            else {
                codes.push(tabs + "var elem = ELEMENT.createText('" + this.content.replace(/'/, "\\'") + "');\n");
            }
            codes.push(tabs + "if(container) ELEMENT.appendChild(container,elem);\n");
            codes.push(tabs + "return elem;\n");
            return codes;
        };
        return VirtualTextNode;
    }(VirtualNode));
    exports.VirtualTextNode = VirtualTextNode;
    var VirtualElementNode = /** @class */ (function (_super) {
        __extends(VirtualElementNode, _super);
        function VirtualElementNode(tag, attrs) {
            var _this = _super.call(this) || this;
            _this.tag = tag;
            _this.attrs = attrs;
            return _this;
        }
        VirtualElementNode.prototype.genCodes = function (variables, codes, tabs) {
            codes || (codes = []);
            tabs || (tabs = "");
            codes.push(tabs + "var elem=ELEMENT.createElement(\"" + this.tag + "\");\n");
            var repeatPars;
            for (var attrname in this.attrs) {
                var attrValue = this.attrs[attrname];
                if (attrname === "repeat") {
                    repeatPars = [];
                    for (var i in attrValue)
                        repeatPars.push("component." + attrValue[i].$extras.path);
                    continue;
                }
                if (attrValue && attrValue.$actionName) {
                    var match = attrname.match(evtnameRegx);
                    var evtName = match ? match[1] : attrname;
                    codes.push(tabs + "ELEMENT.attach(elem,\"" + evtName + "\",component." + attrValue.$actionName + ");\n");
                }
                else if (attrValue instanceof ObservableProxy) {
                    var binder = attrBinders[name];
                    if (binder)
                        codes.push(tabs + "ELEMENT.$attrBinders[\"" + attrname + "\"].call(component,elem,compnent." + attrValue.$extras.path + ");\n");
                    else
                        codes.push(tabs + "ELEMENT.setAttribute(elem,\"" + attrname + "\",\"" + attrValue + "\");\n");
                }
                else {
                    codes.push(tabs + "ELEMENT.setAttribute(elem,\"" + attrname + "\",\"" + attrValue + "\");\n");
                }
            }
            codes.push(tabs + "if(container) ELEMENT.appendChild(container,elem);\n");
            if (repeatPars) {
                codes.push(tabs + "ELEMENT.$repeat(component,elem,vars[" + variables.length + "]," + repeatPars.join(",") + ");\n");
                variables.push(this);
            }
            else {
                this.genChildrenCodes(variables, codes, tabs);
            }
            codes.push(tabs + "return elem;\n");
            return codes;
        };
        VirtualElementNode.prototype.genChildrenCodes = function (variables, codes, tabs) {
            codes || (codes = []);
            tabs || (tabs = "");
            if (this.children && this.children.length) {
                codes.push(tabs + "var child;var children=[];\n");
                var subTabs = tabs + "\t";
                for (var i in this.children) {
                    var child = this.children[i];
                    codes.push(tabs + "children.push(child=(function(ELEMENT,component,container){\n");
                    child.genCodes(variables, codes, subTabs);
                    codes.push(tabs + "})(ELEMENT,component,elem));\n");
                }
            }
            return codes;
        };
        return VirtualElementNode;
    }(VirtualNode));
    exports.VirtualElementNode = VirtualElementNode;
    var VirtualComponentNode = /** @class */ (function (_super) {
        __extends(VirtualComponentNode, _super);
        function VirtualComponentNode(tag, attrs, content) {
            var _this = _super.call(this) || this;
            _this.tag = tag;
            _this.attrs = attrs;
            _this.content = content;
            return _this;
        }
        VirtualComponentNode.prototype.genCodes = function (variables, codes, tabs) {
            codes || (codes = []);
            tabs || (tabs = "");
            var typeAt = variables.length;
            codes.push(tabs + "var subComponent = variables[" + typeAt + "].$create();\n");
            variables.push(this.content);
            var ComponentType = this.content;
            for (var attrName in this.attrs) {
                var attrValue = this.attrs[attrName];
                var reactiveType = ComponentType.$reactives[attrName];
                if (reactiveType === ReactiveTypes.Local || reactiveType === ReactiveTypes.Each)
                    throw new Error(this.tag + "." + attrName + "\u662F\u5185\u90E8\u53D8\u91CF\uFF0C\u4E0D\u53EF\u4EE5\u5728\u5916\u90E8\u8D4B\u503C");
                if (reactiveType === ReactiveTypes.Out) {
                    if (attrValue instanceof ObservableProxy) {
                        codes.push(tabs + "subComponent." + attrName + ".$subscribe(function(e){component." + attrValue.$extras.path + ".$set(e.item?e.item.$get():e.value);});\n");
                    }
                    else {
                        codes.push(tabs + "subComponent." + attrName + ".$subscribe(function(e){component." + attrName + "=e.item?e.item.$get():e.value;});\n");
                    }
                }
                else if (reactiveType === ReactiveTypes.In) {
                    if (attrValue instanceof ObservableProxy) {
                        codes.push(tabs + "subComponent." + attrName + ".$set(component." + attrValue.$extras.path + ".$get());\n");
                    }
                    else {
                        codes.push(tabs + "subComponent." + attrName + ".$set(component." + attrName + ");\n");
                    }
                }
                else if (reactiveType === ReactiveTypes.Ref) {
                    if (attrValue instanceof ObservableProxy) {
                        codes.push(tabs + "subComponent." + attrName + ".$subscribe(function(e){component." + attrValue.$extras.path + ".$set(e.item?e.item.$get():e.value);});\n");
                        codes.push(tabs + "component." + attrValue.$extras.path + ".$subscribe(function(e){subComponent." + attrName + ".$set(e.item?e.item.$get():e.value);});\n");
                    }
                    else {
                        codes.push(tabs + "subComponent." + attrName + ".$subscribe(function(e){component." + attrValue.$extras.path + ".$set(e.item?e.item.$get():e.value);});\n");
                        console.warn("\u7236\u7EC4\u4EF6\u7684\u5C5E\u6027\u672A\u8BBE\u7F6E\u672A\u53EF\u89C2\u6D4B\u5BF9\u8C61\uFF0C\u7236\u7EC4\u4EF6\u7684\u503C\u53D1\u751F\u53D8\u5316\u540E\uFF0C\u65E0\u6CD5\u4F20\u5165" + this.tag + "." + attrName);
                    }
                }
                else {
                    codes.push(tabs + "if(subComponent." + attrName + ".$set) subComponent." + attrName + ".$set(variables[" + variables.length + "]);else subComponent." + attrName + "=variables[" + variables.length + "];\n");
                    variables.push(attrValue);
                }
            }
            ;
            codes.push(tabs + "if(subComponent.initialize) setTimeout(function(){subComponent.initialize(elem);},0);\n");
            codes.push(tabs + "var elem = variables[" + typeAt + "].$render.call(subComponent,variables[" + variables.length + "]);\n");
            variables.push(this);
            codes.push(tabs + "if(container) ELEMENT.appendChild(container,elem);\n");
            return codes;
        };
        return VirtualComponentNode;
    }(VirtualNode));
    exports.VirtualComponentNode = VirtualComponentNode;
    function buildRepeat(component, container, vnode, each, value, key) {
        exports.ELEMENT.removeAllChildrens(container);
        for (var k in each) {
            if (key)
                key.$new(k);
            if (value)
                value.$replace(each[k]);
            vnode.renderChildren(component, container);
        }
    }
    exports.ELEMENT = function (tag, attrs) {
        //modeling
        if (currentComponentType && currentComponentType.$readyState !== ComponentReadyStates.Completed) {
            return;
        }
        ;
        var ComponentType = exports.componentTypes[tag];
        var vnode = ComponentType ? new VirtualComponentNode(tag, attrs, ComponentType) : new VirtualElementNode(tag, attrs);
        if (arguments.length > 2) {
            var children = vnode.children = [];
            for (var i = 2, j = arguments.length; i < j; i++) {
                var child = arguments[i];
                if (!child)
                    continue;
                if (child.tag)
                    children.push(child);
                else
                    children.push(new VirtualTextNode(child));
            }
        }
        return vnode;
    };
    exports.ELEMENT.$repeat = buildRepeat;
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
    attrBinders["value"] = function (elem, bindValue, isBibind) {
        bindValue.$subscribe(function (e) {
            elem.value = changeEventToText(e);
        });
        elem.value = bindValue.toString();
    };
    attrBinders["repeat"] = function (elem, bindValue, isBibind) {
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
        Observable: Observable, ProxyAccessModes: ProxyAccessModes, ObservableProxy: ObservableProxy, ObservableObject: ObservableObject, ObservableArray: ObservableArray, ObservableSchema: ObservableSchema,
        component: component, reactive: reactive, action: action,
        ELEMENT: exports.ELEMENT
    };
    if (typeof window !== 'undefined')
        window.YA = YA;
    exports.default = YA;
});
//# sourceMappingURL=YA.core.js.map