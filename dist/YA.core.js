//implicit 
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
    function intimate(strong, members) {
        if (members) {
            for (var n in members) {
                Object.defineProperty(strong, n, { enumerable: false, writable: true, configurable: true, value: members[n] });
            }
            return;
        }
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
    function is_array(obj) {
        if (!obj)
            return false;
        return Object.prototype.toString.call(obj) === "[object Array]";
    }
    exports.is_array = is_array;
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
    var Subject = /** @class */ (function () {
        function Subject() {
            Object.defineProperty(this, "$_topics", { enumerable: false, writable: true, configurable: false });
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
        Subject.prototype.$subscribe = function (topicOrListener, listener, disposible) {
            var _this = this;
            if (listener === undefined) {
                listener = topicOrListener;
                topicOrListener = "";
            }
            var topics = this.$_topics || (this.$_topics = {});
            var handlers = topics[topicOrListener] || (topics[topicOrListener] = []);
            handlers.push(listener);
            if (disposible)
                disposible.dispose(function (a) { return _this.$unsubscribe(topicOrListener, listener); });
            return this;
        };
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
        Subject.prototype.$unsubscribe = function (topicOrListener, listener) {
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
         * @returns {ISubject<TEvtArgs>} 可监听对象
         * @memberof Observable
         */
        Subject.prototype.$notify = function (topicOrEvtArgs, evtArgs) {
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
        Subject = __decorate([
            intimate()
        ], Subject);
        return Subject;
    }());
    exports.Subject = Subject;
    //defineMembers(Observable.prototype);
    //================================================================
    var DataTypes;
    (function (DataTypes) {
        DataTypes[DataTypes["Value"] = 0] = "Value";
        DataTypes[DataTypes["Object"] = 1] = "Object";
        DataTypes[DataTypes["Array"] = 2] = "Array";
    })(DataTypes = exports.DataTypes || (exports.DataTypes = {}));
    var ObservableModes;
    (function (ObservableModes) {
        ObservableModes[ObservableModes["Default"] = 0] = "Default";
        ObservableModes[ObservableModes["Raw"] = 1] = "Raw";
        ObservableModes[ObservableModes["Value"] = 2] = "Value";
        ObservableModes[ObservableModes["Observable"] = 3] = "Observable";
        ObservableModes[ObservableModes["Schema"] = 4] = "Schema";
    })(ObservableModes = exports.ObservableModes || (exports.ObservableModes = {}));
    function observableMode(mode, statement) {
        var accessMode = Observable.accessMode;
        try {
            Observable.accessMode = mode;
            return statement();
        }
        finally {
            Observable.accessMode = accessMode;
        }
    }
    exports.observableMode = observableMode;
    function proxyMode(statement) {
        var accessMode = Observable.accessMode;
        try {
            Observable.accessMode = ObservableModes.Observable;
            return statement();
        }
        finally {
            Observable.accessMode = accessMode;
        }
    }
    exports.proxyMode = proxyMode;
    var ChangeTypes;
    (function (ChangeTypes) {
        ChangeTypes[ChangeTypes["Value"] = 0] = "Value";
        ChangeTypes[ChangeTypes["Item"] = 1] = "Item";
        ChangeTypes[ChangeTypes["Append"] = 2] = "Append";
        ChangeTypes[ChangeTypes["Push"] = 3] = "Push";
        ChangeTypes[ChangeTypes["Pop"] = 4] = "Pop";
        ChangeTypes[ChangeTypes["Shift"] = 5] = "Shift";
        ChangeTypes[ChangeTypes["Unshift"] = 6] = "Unshift";
        ChangeTypes[ChangeTypes["Remove"] = 7] = "Remove";
    })(ChangeTypes = exports.ChangeTypes || (exports.ChangeTypes = {}));
    var Undefined = {};
    var Observable = /** @class */ (function (_super) {
        __extends(Observable, _super);
        function Observable(init, index, extras, initValue) {
            var _this = _super.call(this) || this;
            if (init instanceof ObservableObject || init instanceof ObservableArray) {
                //ctor(owner,index,extras)
                _this.$_owner = init;
                _this.$_index = index;
                _this.$_raw = function (val) { return observableMode(ObservableModes.Raw, function () { return val === undefined
                    ? (_this.$_owner.$_modifiedValue === undefined
                        ? _this.$_owner.$target
                        : (_this.$_owner.$_modifiedValue === Undefined ? null : _this.$_owner.$_modifiedValue))[_this.$_index]
                    : (_this.$_owner.$_modifiedValue === undefined
                        ? _this.$_owner.$target
                        : (_this.$_owner.$_modifiedValue === Undefined ? null : _this.$_owner.$_modifiedValue))[_this.$_index] = val; }); };
                _this.$extras = extras;
                if (initValue !== undefined) {
                    _this.$_raw(_this.$target = initValue);
                }
                else {
                    _this.$target = _this.$_raw();
                }
            }
            else if (typeof init === "function") {
                //ctor(TRaw,extras)
                _this.$extras = index;
                _this.$_raw = init;
                if (initValue !== undefined) {
                    _this.$_raw(_this.$target = initValue);
                }
                else {
                    _this.$target = _this.$_raw();
                }
            }
            else {
                //ctor(initValue,accessor,extras)
                if (typeof index === "function") {
                    _this.$extras = extras;
                    _this.$_raw = index;
                    _this.$target = init;
                    index.call(_this, init);
                }
                else {
                    //ctor(initValue,extras)
                    _this.$target = init;
                    _this.$extras = index;
                    _this.$_raw = function (val) { return val === undefined ? init : init = val; };
                }
            }
            intimate(_this, {
                $target: _this.$target, $extras: _this.$extras, $type: DataTypes.Value, $schema: _this.$schema,
                $_raw: _this.$_raw, $_index: _this.$_index, $_modifiedValue: undefined, $_owner: _this.$_owner
            });
            if (_this.$target instanceof Observable_1)
                throw new Error("不正确的赋值");
            return _this;
        }
        Observable_1 = Observable;
        Observable.prototype.$get = function (accessMode) {
            if (accessMode === undefined)
                accessMode = Observable_1.accessMode;
            if (accessMode == ObservableModes.Raw)
                return this.$_raw();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            if (accessMode == ObservableModes.Observable)
                return this;
            return (this.$_modifiedValue === undefined) ? this.$target : (this.$_modifiedValue === Undefined ? undefined : this.$_modifiedValue);
        };
        Observable.prototype.$set = function (newValue, updateImmediately) {
            if (newValue && newValue instanceof Observable_1)
                newValue = newValue.$get(ObservableModes.Value);
            if (Observable_1.accessMode === ObservableModes.Raw) {
                this.$_raw.call(this, newValue);
                return this;
            }
            this.$_modifiedValue = newValue === undefined ? Undefined : newValue;
            if (updateImmediately)
                this.$update();
            return this;
        };
        Observable.prototype.$update = function () {
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
        Observable.prototype.toString = function () {
            var currentValue = this.$get(ObservableModes.Default);
            return currentValue === undefined || currentValue === null ? "" : currentValue.toString();
        };
        Observable.accessMode = ObservableModes.Default;
        Observable = Observable_1 = __decorate([
            intimate()
        ], Observable);
        return Observable;
        var Observable_1;
    }(Subject));
    exports.Observable = Observable;
    /**
     * 获取Observable的extras的一个辅助方法
     *
     * @export
     * @param {Observable<any>} ob
     * @param {string} [name]
     * @param {*} [dft]
     */
    function extras(ob, name, dft) {
        var extras = ob.$extras || (ob.$extras = {});
        if (name !== undefined) {
            var val = extras[name];
            if (val === undefined)
                val = extras[name] = dft;
            return val;
        }
        return extras;
    }
    exports.extras = extras;
    var ObservableObject = /** @class */ (function (_super) {
        __extends(ObservableObject, _super);
        function ObservableObject(init, index, extras, initValue) {
            var _this = _super.call(this, init, index, extras, initValue) || this;
            _this.$type = DataTypes.Object;
            if (!_this.$target)
                _this.$_raw(_this.$target = {});
            if (!_this.$schema) {
                _this.$schema = new ObservableSchema(_this.$target);
                _this.$schema.$initObject(_this);
            }
            return _this;
        }
        ObservableObject.prototype.$prop = function (name) {
            var _this = this;
            observableMode(ObservableModes.Observable, function () {
                return _this[name];
            });
        };
        ObservableObject.prototype.$get = function (accessMode) {
            var _this = this;
            if (accessMode === undefined)
                accessMode = Observable.accessMode;
            if (accessMode === ObservableModes.Raw)
                return this.$_raw();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            if (accessMode === ObservableModes.Value) {
                return observableMode(ObservableModes.Observable, function () {
                    var rs = {};
                    for (var n in _this) {
                        if (n === "constructor" || n[0] === "$")
                            continue;
                        var prop = _this[n];
                        rs[n] = prop.$get(ObservableModes.Value);
                    }
                    return rs;
                });
            }
            return this;
        };
        ObservableObject.prototype.$set = function (newValue, updateImmediately) {
            var _this = this;
            if (newValue && newValue instanceof Observable)
                newValue = newValue.$get(ObservableModes.Value);
            _super.prototype.$set.call(this, newValue || null);
            if (!newValue)
                return this;
            proxyMode(function () {
                for (var n in _this) {
                    if (n === "constructor" || n[0] === "$")
                        continue;
                    var proxy = _this[n];
                    if (proxy instanceof Observable)
                        proxy.$set(newValue[n]);
                }
            });
            if (updateImmediately)
                this.$update();
            return this;
        };
        ObservableObject.prototype.$update = function () {
            var _this = this;
            var result = _super.prototype.$update.call(this);
            if (result === false)
                return false;
            proxyMode(function () {
                for (var n in _this) {
                    var proxy = _this[n];
                    if (proxy instanceof Observable)
                        proxy.$update();
                }
            });
            return true;
        };
        ObservableObject = __decorate([
            intimate()
        ], ObservableObject);
        return ObservableObject;
    }(Observable));
    exports.ObservableObject = ObservableObject;
    var ObservableArray = /** @class */ (function (_super) {
        __extends(ObservableArray, _super);
        function ObservableArray(init, index, itemSchemaOrExtras, extras) {
            var _this = this;
            var target;
            _this = _super.call(this, init, index, extras) || this;
            _this.$type = DataTypes.Array;
            target = _this.$target;
            if (Object.prototype.toString.call(target) !== "[object Array]")
                _this.$_raw.call(_this, target = _this.$target = []);
            if (!_this.$schema) {
                _this.$schema = new ObservableSchema(_this.$target);
            }
            var itemSchema;
            if (index instanceof ObservableSchema) {
                extras = itemSchemaOrExtras;
                itemSchema = index;
            }
            else if (itemSchemaOrExtras instanceof ObservableSchema)
                itemSchema = itemSchemaOrExtras;
            else if (extras instanceof ObservableSchema) {
                itemSchema = extras;
                extras = itemSchemaOrExtras;
            }
            _this.$_itemSchema = itemSchema || _this.$schema.$itemSchema;
            var item_index = 0;
            for (var i = 0, j = target.length; i < j; i++)
                makeArrayItem(_this, item_index++);
            intimate(_this, {
                $_changes: undefined, $_length: target.length, $_itemSchema: _this.$_itemSchema
            });
            Object.defineProperty(_this, "length", {
                enumerable: false, configurable: false, get: function () { return _this.$_length; }, set: function (val) { }
            });
            return _this;
        }
        ObservableArray.prototype.toString = function () {
            var _this = this;
            var ret = "";
            proxyMode(function () {
                for (var i = 0, j = _this.$_length; i < j; i++) {
                    var item = _this[i];
                    if (i !== 0)
                        ret += ",";
                    ret += "" + item.$get(ObservableModes.Default);
                }
            });
            return ret;
        };
        ObservableArray.prototype.clear = function () {
            var _this = this;
            var old = this.$target;
            var changes = this.$_changes || (this.$_changes = []);
            var len = old.length;
            if (changes)
                for (var i in changes) {
                    var change = changes[i];
                    if (change.type === ChangeTypes.Push || change.type === ChangeTypes.Unshift) {
                        len++;
                    }
                }
            proxyMode(function () {
                for (var i = 0; i < len; i++) {
                    var removeItem = _this[i];
                    if (removeItem) {
                        delete _this[i];
                        changes.push({
                            type: ChangeTypes.Remove,
                            index: i,
                            target: old,
                            item: removeItem,
                            sender: removeItem
                        });
                    }
                }
            });
            return this;
        };
        ObservableArray.prototype.$get = function (accessMode) {
            var _this = this;
            if (accessMode === undefined)
                accessMode = Observable.accessMode;
            if (accessMode === ObservableModes.Raw)
                return this.$_raw();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            if (accessMode === ObservableModes.Value) {
                return observableMode(ObservableModes.Observable, function () {
                    var rs = [];
                    for (var n in _this) {
                        if (n === "constructor" || n[0] === "$")
                            continue;
                        var prop = _this[n];
                        rs.push(prop.$get(ObservableModes.Value));
                    }
                    return rs;
                });
            }
            return this;
        };
        ObservableArray.prototype.$set = function (newValue, updateImmediately) {
            if (newValue && newValue instanceof Observable)
                newValue = newValue.$get(ObservableModes.Value);
            else {
                var newArr = [];
                for (var _i = 0, newValue_1 = newValue; _i < newValue_1.length; _i++) {
                    var item = newValue_1[_i];
                    if (item instanceof Observable)
                        newArr.push(item.$get(ObservableModes.Value));
                    else
                        newArr.push(item);
                }
                newValue = newArr;
            }
            newValue || (newValue = []);
            this.clear();
            _super.prototype.$set.call(this, newValue);
            if (Observable.accessMode === ObservableModes.Raw) {
                return this;
            }
            for (var i in newValue)
                makeArrayItem(this, i);
            ;
            this.$_length = newValue.length;
            if (updateImmediately)
                this.$update();
            return this;
        };
        ObservableArray.prototype.$update = function () {
            if (!_super.prototype.$update.call(this))
                return true;
            var changes = this.$_changes;
            if (!changes || this.$_changes.length === 0)
                return true;
            this.$_changes = undefined;
            var arr = this.$target;
            for (var i in changes) {
                var change = changes[i];
                switch (change.type) {
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
                    case ChangeTypes.Item:
                        arr[change.index] = change.value;
                        this.$notify(change);
                        if (change.cancel !== true) {
                            var itemEvts = {};
                            for (var n in change)
                                itemEvts[n] = change[n];
                            itemEvts.sender = change.item;
                            itemEvts.type = ChangeTypes.Value;
                            itemEvts.sender.$notify(itemEvts);
                        }
                        break;
                }
            }
            return true;
        };
        ObservableArray = __decorate([
            intimate()
        ], ObservableArray);
        return ObservableArray;
    }(Observable));
    exports.ObservableArray = ObservableArray;
    function makeArrayItem(obArray, index) {
        obArray.$_itemSchema.$index = index;
        var item = new obArray.$_itemSchema.$ctor(obArray, index, undefined);
        item.$_index = index;
        Object.defineProperty(obArray, index, { enumerable: true, configurable: true,
            get: function (mode) { return item.$get(mode); },
            set: function (item_value) {
                (obArray.$_changes || (obArray.$_changes = [])).push({
                    sender: obArray,
                    type: ChangeTypes.Item,
                    index: index,
                    item: item,
                    value: item_value
                });
                item.$set(item_value);
            }
        });
    }
    function defineProp(target, name, accessorFactory) {
        var rnd = parseInt((Math.random() * 1000000).toString());
        var private_prop_name = "$_PRIVATE_" + name + "_" + rnd;
        Object.defineProperty(target, name, {
            enumerable: true,
            configurable: false,
            get: function (param) {
                var ob = this[private_prop_name];
                if (!ob)
                    Object.defineProperty(this, private_prop_name, {
                        enumerable: false, configurable: false, writable: false, value: ob = accessorFactory.call(this, target, name)
                    });
                return ob.get ? ob.get(param) : ob.$get(param);
            },
            set: function (val) {
                var ob = this[private_prop_name];
                if (!ob)
                    Object.defineProperty(this, private_prop_name, {
                        enumerable: false, configurable: false, writable: false, value: ob = accessorFactory.call(this, target, name)
                    });
                return ob.set ? ob.set(val) : ob.$set(val);
            }
        });
        return this;
    }
    //=======================================================================
    var ObservableSchema = /** @class */ (function () {
        function ObservableSchema(initData, index, owner) {
            var _this = this;
            var paths = [];
            index = index === undefined || index === null ? "" : index;
            if (owner) {
                var ppaths = owner.$paths;
                if (ppaths && ppaths.length > 0) {
                    for (var i in ppaths)
                        paths.push(ppaths[i]);
                }
            }
            ;
            if (index !== "")
                paths.push(index);
            intimate(this, {
                "$type": DataTypes.Value,
                "$index": index,
                "$paths": paths,
                "$owner": owner,
                "$ctor": Observable,
                "$itemSchema": null,
                "$initData": initData
            });
            Object.defineProperty(this, "$path", { enumerable: false, configurable: false, get: function () { return _this.$paths.join("."); } });
            if (initData) {
                var t = Object.prototype.toString.call(initData);
                if (t === "[object Object]") {
                    this.$asObject();
                    for (var n in initData) {
                        this.$defineProp(n, initData[n]);
                    }
                }
                else if (t === "[object Array]") {
                    this.$asArray();
                }
                else {
                    this.$type = DataTypes.Value;
                    this.$ctor = Observable;
                }
            }
        }
        ObservableSchema_1 = ObservableSchema;
        ObservableSchema.prototype.$getFromRoot = function (root, mode) {
            var _this = this;
            if (mode === void 0) { mode = ObservableModes.Observable; }
            return observableMode(mode, function () {
                var data = root;
                for (var i in _this.$paths) {
                    data = data[_this.$paths[i]];
                    if (data === undefined || data === Undefined)
                        return undefined;
                }
                return data;
            });
        };
        ObservableSchema.prototype.$asObject = function () {
            if (this.$type === DataTypes.Object)
                return this;
            if (this.$type === DataTypes.Array)
                throw new Error("无法将ObservableSchema从Array转化成Object.");
            this.$type = DataTypes.Object;
            var _ObservableObject = /** @class */ (function (_super) {
                __extends(_ObservableObject, _super);
                function _ObservableObject(init, index, extras, initValue) {
                    return _super.call(this, init, index, extras, initValue) || this;
                }
                return _ObservableObject;
            }(ObservableObject));
            ;
            _ObservableObject.prototype.$schema = this;
            this.$ctor = _ObservableObject;
            return this;
        };
        ObservableSchema.prototype.$defineProp = function (propname, initValue) {
            if (this.$type !== DataTypes.Object)
                throw new Error("调用$defineProp之前，要首先调用$asObject");
            var propSchema = new ObservableSchema_1(initValue, propname, this);
            Object.defineProperty(this, propname, { enumerable: true, writable: false, configurable: false, value: propSchema });
            defineProp(this.$ctor.prototype, propname, function (owner, name) { return new propSchema.$ctor(this, name); });
            return propSchema;
        };
        ObservableSchema.prototype.$asArray = function () {
            if (this.$type === DataTypes.Array)
                return this;
            if (this.$type === DataTypes.Object)
                throw new Error("无法将ObservableSchema从Object转化成Array.");
            this.$type = DataTypes.Array;
            var _ObservableArray = /** @class */ (function (_super) {
                __extends(_ObservableArray, _super);
                function _ObservableArray(init, index, extras, initValue) {
                    return _super.call(this, init, index, extras, initValue) || this;
                }
                return _ObservableArray;
            }(ObservableArray));
            ;
            if (this.$initData) {
                var item = this.$initData.shift();
                if (item) {
                    this.$itemSchema = new ObservableSchema_1(item, -1, this);
                    if (!item[ObservableSchema_1.schemaToken])
                        this.$initData.unshift(item);
                }
            }
            if (!this.$itemSchema)
                this.$itemSchema = new ObservableSchema_1(undefined, -1, this);
            _ObservableArray.prototype.$schema = this;
            this.$ctor = _ObservableArray;
        };
        ObservableSchema.prototype.$initObject = function (ob) {
            var _loop_1 = function (n) {
                if (n === "constructor" || n[0] === "$" || n === ObservableSchema_1.schemaToken)
                    return "continue";
                var propSchema = this_1[n];
                defineProp(ob, n, function (owner, name) { return new propSchema.$ctor(this, name); });
            };
            var this_1 = this;
            for (var n in this) {
                _loop_1(n);
            }
        };
        ObservableSchema.schemaToken = "$__ONLY_USED_BY_SCHEMA__";
        ObservableSchema = ObservableSchema_1 = __decorate([
            intimate()
        ], ObservableSchema);
        return ObservableSchema;
        var ObservableSchema_1;
    }());
    exports.ObservableSchema = ObservableSchema;
    //=======================================================================
    var ReactiveTypes;
    (function (ReactiveTypes) {
        ReactiveTypes[ReactiveTypes["NotReactive"] = 0] = "NotReactive";
        ReactiveTypes[ReactiveTypes["Internal"] = -1] = "Internal";
        ReactiveTypes[ReactiveTypes["Iterator"] = -2] = "Iterator";
        ReactiveTypes[ReactiveTypes["In"] = 1] = "In";
        ReactiveTypes[ReactiveTypes["Out"] = 2] = "Out";
        ReactiveTypes[ReactiveTypes["Parameter"] = 3] = "Parameter";
    })(ReactiveTypes = exports.ReactiveTypes || (exports.ReactiveTypes = {}));
    /**
     * 两种用法:
     * 1 作为class member的装饰器 @reactive()
     * 2 对某个component类手动构建reactive信息，reactive(MyComponent,{name:'model',type:0,schema:null})
     * @param {(ReactiveTypes|Function)} [type]
     * @param {{[prop:string]:IReactiveInfo}} [defs]
     * @returns
     */
    function reactive(type, defs) {
        function makeReactiveInfo(target, info) {
            var infos = metaInfo(target, "reactives", {});
            if (info.name) {
                if (!info.initData)
                    info.initData = target[info.name];
                infos[info.name] = info;
            }
            else {
                infos[info] = { type: type || ReactiveTypes.Internal, name: info, schema: target[info] };
            }
        }
        if (defs) {
            var target = type.prototype;
            for (var n in defs) {
                var def = defs[n];
                def.name = n;
                makeReactiveInfo(target, def);
            }
        }
        return makeReactiveInfo;
    }
    exports.reactive = reactive;
    function IN(target, name) {
        var infos = metaInfo(target, "reactives", {});
        infos[name] = { type: ReactiveTypes.In, name: name };
        //return target;
    }
    exports.IN = IN;
    function OUT(target, name) {
        var infos = metaInfo(target, "reactives", {});
        infos[name] = { type: ReactiveTypes.Out, name: name };
        //return target;
    }
    exports.OUT = OUT;
    function PARAM(target, name) {
        var infos = metaInfo(target, "reactives", {});
        infos[name] = { type: ReactiveTypes.Parameter, name: name };
        //return target;
    }
    exports.PARAM = PARAM;
    function template(partial, defs) {
        function markTemplateInfo(target, info) {
            var infos = metaInfo(target, "templates", {});
            if (defs) {
                infos[info.partial] = info;
            }
            else {
                partial || (partial = info);
                infos[partial] = { name: info, partial: partial };
            }
        }
        if (defs) {
            var target = partial.prototype;
            for (var n in defs) {
                var def = defs[n];
                def.name = n;
                def.partial || (def.partial = n);
                markTemplateInfo(target, def);
            }
        }
        return markTemplateInfo;
    }
    exports.template = template;
    function action(async, defs) {
        function markActionInfo(target, info) {
            var infos = metaInfo(target, "actions", {});
            if (defs) {
                infos[info.name] = info;
            }
            else {
                infos[info] = { name: info, async: async };
            }
        }
        if (defs) {
            var target = async.prototype;
            for (var n in defs) {
                var def = defs[n];
                def.name = n;
                markActionInfo(target, def);
            }
        }
        return markActionInfo;
    }
    function metaInfo(target, name, dft) {
        var meta = target.$meta;
        if (!meta)
            Object.defineProperty(target, "$meta", { enumerable: false, configurable: false, writable: true, value: meta = {} });
        if (!name)
            return meta;
        var info = meta[name];
        if (info === undefined && dft !== undefined)
            Object.defineProperty(meta, name, { enumerable: false, configurable: false, writable: true, value: info = dft });
        return info;
    }
    var componentInfos = {};
    function inherits(extendCls, basCls) {
        function __() { this.constructor = extendCls; }
        extendCls.prototype = basCls === null ? Object.create(basCls) : (__.prototype = basCls.prototype, new __());
    }
    function component(tag, ComponentType) {
        var makeComponent = function (componentCtor) {
            var meta = metaInfo(componentCtor.prototype);
            var _Component = function () {
                var ret = componentCtor.apply(this, arguments);
                if (!this.$meta.inited) {
                    initComponent(this);
                }
                return ret;
            };
            for (var k in componentCtor)
                _Component[k] = componentCtor[k];
            inherits(_Component, componentCtor);
            var metaDesc = { enumerable: false, configurable: false, get: function () { return componentCtor.prototype.$meta; } };
            Object.defineProperty(_Component, "$meta", metaDesc);
            Object.defineProperty(_Component.prototype, "$meta", metaDesc);
            Object.defineProperty(componentCtor, "$meta", metaDesc);
            meta.tag = tag;
            meta.ctor = componentCtor;
            meta.wrapper = _Component;
            meta.explicitMode = ComponentType;
            componentInfos[tag] = meta;
            return _Component;
        };
        if (ComponentType !== undefined && ComponentType !== true && ComponentType !== false) {
            return makeComponent(ComponentType);
        }
        else
            return makeComponent;
    }
    exports.component = component;
    function createComponent(componentInfo, context) {
        //let componentInfo = componentInfos[tag];
        if (!componentInfo)
            throw new Error("\u4E0D\u662FComponent,\u8BF7\u8C03\u7528component\u6CE8\u518C\u6216\u6807\u8BB0\u4E3A@component");
        var instance = new componentInfo.ctor();
        if (!componentInfo.inited) {
            initComponent(instance);
        }
        return instance;
    }
    function initComponent(firstComponent) {
        var meta = firstComponent.$meta;
        if (!meta || meta.inited)
            return firstComponent;
        if (!meta.explicitMode) {
            //let proto = meta.ctor.prototype;
            var reactives = meta.reactives || (meta.reactives = {});
            for (var n in firstComponent) {
                if (reactives[n])
                    continue;
                var member = firstComponent[n];
                if (typeof member === "function")
                    continue;
                reactives[n] = { name: n, type: ReactiveTypes.Internal };
            }
            var tpls = meta.templates || (meta.templates = {});
            var defaultTemplateName = "render";
            //如果还未定义默认的模板函数
            if (!tpls[defaultTemplateName]) {
                var render = firstComponent[defaultTemplateName];
                if (typeof render === "function") {
                    tpls[defaultTemplateName] = { name: defaultTemplateName };
                }
            }
        }
        for (var name_1 in meta.reactives) {
            var stateInfo = meta.reactives[name_1];
            if (stateInfo.type === ReactiveTypes.NotReactive)
                continue;
            var initData = firstComponent[stateInfo.name];
            var schema = stateInfo.schema;
            if (!schema) {
                schema = stateInfo.schema = new ObservableSchema(stateInfo.initData || initData, name_1);
            }
            stateInfo.initData = initData;
            schema.$index = name_1;
            initReactive(firstComponent, stateInfo);
        }
        for (var name_2 in meta.templates) {
            initTemplate(firstComponent, meta.templates[name_2]);
        }
        meta.inited = true;
    }
    function initReactive(firstComponent, stateInfo) {
        if (stateInfo.type === ReactiveTypes.Iterator)
            return initIterator(firstComponent, stateInfo);
        var descriptor = {
            enumerable: true,
            configurable: false,
            get: function () {
                if (Observable.accessMode === ObservableModes.Schema)
                    return stateInfo.schema;
                var states = this.$reactives || (this.$reactives = {});
                var ob = states[stateInfo.name];
                if (!ob)
                    ob = states[stateInfo.name] = new stateInfo.schema.$ctor(stateInfo.initData);
                return ob.$get();
            },
            set: function (val) {
                var states = this.$reactives || (this.$reactives = {});
                var ob = states[stateInfo.name];
                if (val && val.$get)
                    val = val.$get(ObservableModes.Value);
                if (ob)
                    ob.$set(val);
                else
                    ob = states[stateInfo.name] = new stateInfo.schema.$ctor(val);
            }
        };
        Object.defineProperty(firstComponent, stateInfo.name, descriptor);
        Object.defineProperty(firstComponent.$meta.ctor.prototype, stateInfo.name, descriptor);
    }
    function initIterator(firstComponent, stateInfo) {
        var descriptor = {
            enumerable: false,
            configurable: false,
            get: function () {
                if (Observable.accessMode === ObservableModes.Schema)
                    return stateInfo.schema;
                var states = firstComponent.$reactives || (firstComponent.$reactives = {});
                var ob = states[stateInfo.name];
                return ob ? ob.$get() : undefined;
            },
            set: function (val) {
                var states = firstComponent.$reactives || (firstComponent.$reactives = {});
                if (val instanceof Observable) {
                    states[stateInfo.name] = val;
                    return;
                }
                var ob = states[stateInfo.name] = new stateInfo.schema.$ctor(val);
                //ob.$set(val);
            }
        };
        Object.defineProperty(firstComponent, stateInfo.name, descriptor);
        Object.defineProperty(firstComponent.$meta.ctor.prototype, stateInfo.name, descriptor);
    }
    function setIterator(component, schema, value) {
        var meta = component.$meta;
        var name = schema.$index;
        var info = meta.reactives[name];
        if (info.type !== ReactiveTypes.Iterator) {
            initIterator(component, info);
        }
        component[name] = value;
        return component[name];
    }
    //<table rows={rows} take={10} skip={start} ><col name="name" type='text' label='名称' onchange={abc}/></table>
    function initTemplate(firstComponent, tplInfo) {
        var rawMethod = firstComponent[tplInfo.name];
        if (rawMethod.$orign) {
            tplInfo.render = rawMethod.$render;
            return;
        }
        ;
        var tplMethod = function (container) {
            var component = this;
            if (tplInfo.render)
                return tplInfo.render.call(component, container);
            var result;
            observableMode(ObservableModes.Schema, function () {
                var vnode = rawMethod.call(component, container);
                if (Host.isElement(vnode)) {
                    tplInfo.render = rawMethod;
                    result = vnode;
                }
                else {
                    tplInfo.vnode = vnode;
                    result = Undefined;
                }
            });
            if (result === Undefined) {
                observableMode(ObservableModes.Observable, function () {
                    result = tplInfo.vnode.render(component, container, tplInfo.vnode);
                });
                tplInfo.render = function (container) {
                    return tplInfo.vnode.render(component, container, tplInfo.vnode);
                };
            }
            return result;
        };
        Object.defineProperty(tplMethod, "$orign", { configurable: false, writable: false, enumerable: false, value: rawMethod });
        Object.defineProperty(tplMethod, "$render", { configurable: false, writable: false, enumerable: false, value: tplInfo.render });
        var des = { configurable: false, writable: false, enumerable: false, value: tplMethod };
        Object.defineProperty(firstComponent, tplInfo.name, des);
        Object.defineProperty(firstComponent.$meta.ctor.prototype, tplInfo.name, des);
    }
    function makeAction(component, method) {
        return function () {
            var rs = method.apply(component, arguments);
            for (var n in component.$reactives) {
                component.$reactives[n].$update();
            }
            return rs;
        };
    }
    //=========================================================================
    function addRelElements(ob, elems) {
        if (is_array(elems))
            for (var i in elems)
                addRelElements(ob, elems[i]);
        var extras = ob.$extras || (ob.$extras = {});
        if (extras instanceof Observable)
            debugger;
        var rel_elements = extras.rel_elements || (extras.rel_elements = []);
        if (extras.last_rel_element === elems)
            return;
        rel_elements.push(extras.last_rel_element = elems);
    }
    function getRelElements(ob, includeSubs) {
        var rs = is_array(includeSubs) ? includeSubs : [];
        var extras = ob.$extras;
        if (extras) {
            var rel_elements = extras.rel_elements;
            if (rel_elements)
                for (var i in rel_elements) {
                    rs.push(rel_elements[i]);
                }
        }
        if (includeSubs) {
            observableMode(ObservableModes.Observable, function () {
                for (var n in ob) {
                    var sub = ob[n];
                    getRelElements(sub, rs);
                }
            });
        }
        return rs;
    }
    var VirtualNode = /** @class */ (function () {
        function VirtualNode() {
        }
        VirtualNode.prototype.render = function (component, container) {
        };
        VirtualNode.create = function (tag, attrs) {
            var vnode;
            if (tag && tag.$meta) {
                vnode = new VirtualComponentNode(tag, attrs);
            }
            else {
                var componentInfo = componentInfos[tag];
                if (componentInfo)
                    vnode = new VirtualComponentNode(tag, attrs);
                else
                    vnode = new VirtualElementNode(tag, attrs);
            }
            for (var i = 2, j = arguments.length; i < j; i++) {
                var childNode = arguments[i];
                if (!(childNode instanceof VirtualNode))
                    childNode = new VirtualTextNode(childNode);
                (vnode.children || (vnode.children = [])).push(childNode);
            }
            return vnode;
        };
        return VirtualNode;
    }());
    exports.VirtualNode = VirtualNode;
    exports.virtualNode = VirtualNode.create;
    var VirtualTextNode = /** @class */ (function (_super) {
        __extends(VirtualTextNode, _super);
        function VirtualTextNode(content) {
            var _this = _super.call(this) || this;
            _this.content = content;
            return _this;
        }
        VirtualTextNode.prototype.render = function (component, container) {
            var elem;
            if (this.content instanceof ObservableSchema) {
                var ob = this.content.$getFromRoot(component);
                elem = Host.createText(ob.$get());
                ob.$subscribe(function (e) {
                    elem.nodeValue = e.value;
                });
            }
            else {
                elem = Host.createText(this.content);
            }
            if (container)
                Host.appendChild(container, elem);
            return elem;
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
        VirtualElementNode.prototype.render = function (component, container) {
            var elem = Host.createElement(this.tag);
            var ignoreChildren = false;
            if (container)
                Host.appendChild(container, elem);
            var anchorElem = elem;
            for (var attrName in this.attrs) {
                var attrValue = this.attrs[attrName];
                var match = attrName.match(evtnameRegx);
                if (match && elem[attrName] !== undefined && typeof attrValue === "function") {
                    var evtName = match[1];
                    Host.attach(elem, evtName, makeAction(component, attrValue));
                    continue;
                }
                var binder = attrBinders[attrName];
                var bindResult = void 0;
                if (attrValue instanceof ObservableSchema) {
                    if (binder)
                        bindResult = binder.call(component, elem, attrValue, component, this);
                    else
                        (function (name, attrValue) {
                            var ob = attrValue.$getFromRoot(component);
                            Host.setAttribute(elem, name, ob.$get(ObservableModes.Raw));
                            ob.$subscribe(function (e) {
                                Host.setAttribute(elem, name, e.value);
                            });
                        })(attrName, attrValue);
                }
                else {
                    if (binder)
                        bindResult = binder.call(component, elem, attrValue, component, this);
                    else
                        Host.setAttribute(elem, attrName, attrValue);
                }
                if (bindResult === RenderDirectives.IgnoreChildren)
                    ignoreChildren = true;
            }
            if (!this.children || this.children.length === 0)
                return elem;
            if (!ignoreChildren) {
                for (var i in this.children) {
                    this.children[i].render(component, elem);
                }
            }
            return elem;
        };
        return VirtualElementNode;
    }(VirtualNode));
    exports.VirtualElementNode = VirtualElementNode;
    var VirtualComponentNode = /** @class */ (function (_super) {
        __extends(VirtualComponentNode, _super);
        function VirtualComponentNode(tag, attrs) {
            var _this = _super.call(this) || this;
            _this.attrs = attrs;
            if (tag && tag.$meta) {
                _this.meta = tag.$meta;
                _this.tag = _this.meta.tag;
            }
            else {
                _this.tag = tag;
                _this.meta = componentInfos[_this.tag];
            }
            return _this;
        }
        VirtualComponentNode.prototype.render = function (component, container) {
            var subComponent = createComponent(this.meta);
            for (var subAttrName in this.attrs) {
                bindComponentAttr(component, subComponent, subAttrName, this.attrs[subAttrName]);
            }
            ;
            var subMeta = subComponent.$meta;
            for (var n in subMeta.templates) {
                var tpl = subMeta.templates[n];
                subComponent[tpl.name].call(subComponent, container);
            }
        };
        return VirtualComponentNode;
    }(VirtualNode));
    exports.VirtualComponentNode = VirtualComponentNode;
    function bindComponentAttr(component, subComponent, subAttrName, bindValue) {
        var subMeta = subComponent.$meta;
        var stateInfo = subMeta.reactives[subAttrName];
        var subStateType = stateInfo ? stateInfo.type : undefined;
        if (subStateType === ReactiveTypes.Internal || subStateType === ReactiveTypes.Iterator)
            throw new Error(this.tag + "." + subAttrName + "\u662F\u5185\u90E8\u53D8\u91CF\uFF0C\u4E0D\u53EF\u4EE5\u5728\u5916\u90E8\u8D4B\u503C");
        var subAttr = subComponent[subAttrName];
        if (subStateType === ReactiveTypes.Out) {
            if (bindValue instanceof ObservableSchema) {
                subAttr.$subscribe(function (e) {
                    //这里的级联update可能会有性能问题，要优化
                    bindValue.$getFromRoot(component).$set(e.value, true);
                });
            }
            else {
                throw new Error("\u65E0\u6CD5\u7ED1\u5B9A[OUT]" + subMeta.tag + "." + subAttrName + "\u5C5E\u6027\uFF0C\u7236\u7EC4\u4EF6\u8D4B\u4E88\u8BE5\u5C5E\u6027\u7684\u503C\u4E0D\u662FObservable");
            }
        }
        else if (subStateType === ReactiveTypes.In) {
            if (bindValue instanceof ObservableSchema) {
                var bindOb = bindValue.$getFromRoot(component);
                bindOb.$subscribe(function (e) {
                    //这里的级联update可能会有性能问题，要优化
                    subAttr.$set(e.value, true);
                });
                subAttr.$_raw(subAttr.$target = clone(bindOb.$get(ObservableModes.Raw), true));
            }
            else {
                subAttr.$_raw(subAttr.$target = bindValue);
                console.warn("\u672A\u80FD\u7ED1\u5B9A[IN]" + subMeta.tag + "." + subAttrName + "\u5C5E\u6027,\u7236\u7EC4\u4EF6\u8D4B\u4E88\u8BE5\u5C5E\u6027\u7684\u503C\u4E0D\u662FObservable");
            }
        }
        else if (subStateType === ReactiveTypes.Parameter) {
            if (bindValue instanceof ObservableSchema) {
                //这里的级联update可能会有性能问题，要优化
                var bindOb = bindValue.$getFromRoot(component);
                bindOb.$subscribe(function (e) { return subAttr.$set(e.value, true); });
                subAttr.$_raw(subAttr.$target = bindOb.$get(ObservableModes.Raw));
                subAttr.$subscribe(function (e) { return bindValue.$getFromRoot(component).$set(e.value, true); });
            }
            else {
                subAttr.$_raw(subAttr.$target = bindValue);
                console.warn("\u672A\u80FD\u7ED1\u5B9A[REF]" + subMeta.tag + "." + subAttrName + "\u5C5E\u6027,\u7236\u7EC4\u4EF6\u8D4B\u4E88\u8BE5\u5C5E\u6027\u7684\u503C\u4E0D\u662FObservable");
            }
        }
        else {
            var value = bindValue instanceof ObservableSchema ? bindValue.$getFromRoot(component).$get() : bindValue;
            value = clone(value, true);
            if (subAttr instanceof Observable)
                subAttr.$_raw(value);
            else
                subComponent[subAttrName] = value;
        }
    }
    function NOT(params) {
        return;
    }
    exports.NOT = NOT;
    function EXP() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return;
    }
    exports.EXP = EXP;
    var evtnameRegx = /on([a-zA-Z_][a-zA-Z0-9_]*)/;
    var RenderDirectives;
    (function (RenderDirectives) {
        RenderDirectives[RenderDirectives["Default"] = 0] = "Default";
        RenderDirectives[RenderDirectives["IgnoreChildren"] = 1] = "IgnoreChildren";
        RenderDirectives[RenderDirectives["Replaced"] = 2] = "Replaced";
    })(RenderDirectives = exports.RenderDirectives || (exports.RenderDirectives = {}));
    var Placeholder = /** @class */ (function () {
        function Placeholder(replace, before, after) {
            this.replace = replace;
            this.before = before;
            this.after = after;
        }
        return Placeholder;
    }());
    exports.Placeholder = Placeholder;
    var attrBinders = {};
    attrBinders.for = function bindFor(elem, bindValue, component, vnode, ignoreAddRel) {
        var each = bindValue[0];
        var value = bindValue[1];
        var key = bindValue[2];
        if (each instanceof ObservableSchema) {
            each = each.$getFromRoot(component);
            if (!ignoreAddRel)
                addRelElements(each, elem);
            each.$subscribe(function (e) {
                if (e.type === ChangeTypes.Value) {
                    elem.innerHTML = "";
                    observableMode(ObservableModes.Observable, function () {
                        bindFor.call(component, elem, bindValue, component, vnode, false);
                    });
                    e.cancel = true;
                }
            });
        }
        if (!(value instanceof ObservableSchema))
            throw new Error("迭代变量必须被iterator装饰");
        for (var k in each) {
            if (k === "constructor" || k[0] === "$")
                continue;
            //if(key)  key.$getFromRoot(component).$renew(k);
            var item = each[k];
            var obItem = setIterator(component, value, item);
            for (var i in vnode.children) {
                var childElements = vnode.children[i].render(component, elem);
                addRelElements(obItem, childElements);
                obItem.$subscribe(function (e) {
                    if (e.type === ChangeTypes.Remove) {
                        var obItem_1 = e.sender;
                        var nodes = getRelElements(obItem_1);
                        for (var i_1 in nodes) {
                            var node = nodes[i_1];
                            if (node.parentNode)
                                node.parentNode.removeChild(node);
                        }
                    }
                });
            }
        }
        return RenderDirectives.IgnoreChildren;
    };
    attrBinders.if = function bindIf(elem, bindValue, component, vnode) {
        if (bindValue instanceof ObservableSchema) {
            var ob = bindValue.$getFromRoot(component);
            var placeholder_1 = Host.createPlaceholder();
            var isElementInContainer_1 = ob.$get();
            if (!isElementInContainer_1) {
                var p = Host.getParent(elem);
                if (p) {
                    Host.insertBefore(p, placeholder_1, elem);
                    Host.removeChild(p, elem);
                }
                else
                    Host.hide(elem);
            }
            ob.$subscribe(function (e) {
                if (e.value) {
                    if (!isElementInContainer_1) {
                        var p = Host.getParent(placeholder_1);
                        if (p) {
                            Host.insertBefore(p, elem, placeholder_1);
                            Host.removeChild(p, placeholder_1);
                            isElementInContainer_1 = true;
                        }
                    }
                }
                else {
                    if (isElementInContainer_1) {
                        var p = Host.getParent(elem);
                        if (p) {
                            Host.insertBefore(p, placeholder_1, elem);
                            Host.removeChild(p, elem);
                            isElementInContainer_1 = false;
                        }
                        else
                            Host.hide(elem);
                    }
                }
            });
        }
        else {
            if (!bindValue) {
                var p = Host.getParent(elem);
                if (p)
                    Host.removeChild(p, elem);
            }
        }
    };
    attrBinders.style = function bindStyle(elem, bindValue, component) {
        for (var styleName in bindValue)
            (function (styleName, subValue, elem, component) {
                var ob;
                var styleValue;
                var convertor = styleConvertors[styleName];
                if (subValue instanceof Observable) {
                    ob = subValue;
                    styleValue = ob.$get();
                }
                else if (subValue instanceof ObservableSchema) {
                    ob = subValue.$getFromRoot(component);
                    styleValue = ob.$get();
                }
                else
                    styleValue = subValue;
                elem.style[styleName] = convertor ? convertor(styleValue) : styleValue;
                if (ob) {
                    addRelElements(ob, elem);
                    ob.$subscribe(function (e) {
                        elem.style[styleName] = convertor ? convertor(e.value) : e.value;
                    });
                }
            })(styleName, bindValue[styleName], elem, component);
    };
    var styleConvertors = {};
    var unitRegx = /(\d+(?:.\d+))(px|em|pt|in|cm|mm|pc|ch|vw|vh|\%)/g;
    styleConvertors.left = styleConvertors.right = styleConvertors.top = styleConvertors.bottom = styleConvertors.width = styleConvertors.height = function (value) {
        if (!value)
            return "0";
        if (typeof value === "number") {
            return value + "px";
        }
        else
            return value;
    };
    var Host = {};
    Host.isElement = function (elem) {
        return elem.nodeType === 1;
    };
    Host.createElement = function (tag) {
        return document.createElement(tag);
    };
    Host.createText = function (txt) {
        return document.createTextNode(txt);
    };
    Host.createPlaceholder = function () {
        var rs = document.createElement("span");
        rs.className = "YA-PLACEHOLDER";
        rs.style.display = "none";
        return rs;
    };
    Host.setAttribute = function (elem, name, value) {
        elem.setAttribute(name, value);
    };
    Host.appendChild = function (container, child) {
        container.appendChild(child);
    };
    Host.insertBefore = function (container, child, anchor) {
        container.insertBefore(child, anchor);
    };
    Host.insertAfter = function (container, child, anchor) {
        container.insertAfter(child, anchor);
    };
    Host.getParent = function (elem) { return elem.parentNode; };
    Host.removeChild = function (container, child) { return container.removeChild(child); };
    Host.removeAllChildrens = function (elem) {
        elem.innerHTML = elem.nodeValue = "";
    };
    Host.show = function (elem, immeditately) {
        elem.style.display = "";
    };
    Host.hide = function (elem, immeditately) {
        elem.style.display = "none";
    };
    Host.attach = function (elem, evtname, handler) {
        if (elem.addEventListener)
            elem.addEventListener(evtname, handler, false);
        else if (elem.attachEvent)
            elem.attachEvent('on' + evtname, handler);
        else
            elem['on' + evtname] = handler;
    };
    //======================================================================
    function clone(src, deep) {
        if (!src)
            return src;
        var srcT = Object.prototype.toString.call(src);
        if (srcT === "[object String]" || srcT === "[object Number]" || srcT === "[object Boolean]")
            return src;
        var rs;
        if (srcT === "[object Function]") {
            var raw_1 = src;
            if (src.$clone_raw)
                raw_1 = src.$clone_raw;
            var rs_1 = function () { return raw_1.apply(arguments); };
            Object.defineProperty(rs_1, "$clone_raw", { enumerable: false, writable: false, configurable: false, value: raw_1 });
        }
        else if (srcT === "[object Object]")
            rs = {};
        else if (srcT === "[object Array]")
            rs = [];
        if (deep)
            for (var n in src)
                rs[n] = clone(src[n], true);
        else
            for (var n in src)
                rs[n] = src[n];
        return rs;
    }
    exports.clone = clone;
    //=======================================================================
    var YA = {
        Subject: Subject, ObservableModes: ObservableModes, observableMode: observableMode, proxyMode: proxyMode, Observable: Observable, ObservableObject: ObservableObject, ObservableArray: ObservableArray, ObservableSchema: ObservableSchema,
        component: component, state: reactive, IN: IN, OUT: OUT, PARAM: PARAM, template: template,
        VirtualNode: VirtualNode, VirtualTextNode: VirtualTextNode, VirtualElementNode: VirtualElementNode, VirtualComponentNode: VirtualComponentNode, virtualNode: exports.virtualNode, HOST: Host, NOT: NOT, EXP: EXP,
        intimate: intimate, clone: clone
    };
    if (typeof window !== 'undefined')
        window.YA = YA;
    exports.default = YA;
});
//# sourceMappingURL=YA.core.js.map