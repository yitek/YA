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
        Subject.prototype.$subscribe = function (topicOrListener, listener) {
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
        ObservableModes[ObservableModes["Observable"] = 2] = "Observable";
        ObservableModes[ObservableModes["Schema"] = 3] = "Schema";
    })(ObservableModes = exports.ObservableModes || (exports.ObservableModes = {}));
    function observableMode(mode, statement) {
        var accessMode = Observable.accessMode;
        try {
            Observable.accessMode = mode;
            statement();
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
            statement();
        }
        finally {
            Observable.accessMode = accessMode;
        }
    }
    exports.proxyMode = proxyMode;
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
    var Observable = /** @class */ (function (_super) {
        __extends(Observable, _super);
        function Observable(init, index, extras) {
            var _this = _super.call(this) || this;
            if (init instanceof ObservableObject) {
                //ctor(owner,index,extras)
                _this.$_owner = init;
                _this.$_index = index;
                _this.$_raw = function (val) { return val === undefined
                    ? (_this.$_owner.$_modifiedValue === undefined
                        ? _this.$_owner.$target
                        : (_this.$_owner.$_modifiedValue === Undefined ? null : _this.$_owner.$_modifiedValue))[_this.$_index]
                    : (_this.$_owner.$_modifiedValue === undefined
                        ? _this.$_owner.$target
                        : (_this.$_owner.$_modifiedValue === Undefined ? null : _this.$_owner.$_modifiedValue))[_this.$_index] = val; };
                _this.$target = _this.$_raw();
                _this.$extras = extras;
            }
            else if (typeof init === "function") {
                //ctor(TRaw,extras)
                _this.$extras = index;
                _this.$_raw = init;
                _this.$target = _this.$_raw();
            }
            else {
                if (typeof index === "function") {
                    _this.$extras = extras;
                    _this.$_raw = index;
                    _this.$target = init;
                    index.call(_this, init);
                }
                else {
                    _this.$target = init;
                    _this.$extras = index;
                    _this.$_raw = function (val) { return val === undefined ? init : init = val; };
                }
            }
            intimate(_this, {
                $target: _this.$target, $extras: _this.$extras, $type: DataTypes.Value, $schema: _this.$schema,
                $_raw: _this.$_raw, $_index: _this.$_index, $_modifiedValue: undefined, $_owner: _this.$_owner
            });
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
        Observable.prototype.$set = function (newValue) {
            if (Observable_1.accessMode === ObservableModes.Raw) {
                this.$_raw.call(this, newValue);
                return this;
            }
            this.$_modifiedValue = newValue === undefined ? Undefined : newValue;
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
    var ObservableObject = /** @class */ (function (_super) {
        __extends(ObservableObject, _super);
        function ObservableObject(init, index, extras) {
            var _this = _super.call(this, init, index, extras) || this;
            _this.$type = DataTypes.Object;
            if (!_this.$target)
                _this.$_raw(_this.$target = {});
            if (!_this.$schema) {
                _this.$schema = new ObservableSchema(_this.$target);
                _this.$schema.$initObject(_this);
            }
            return _this;
        }
        ObservableObject.prototype.$get = function (accessMode) {
            if (accessMode === undefined)
                accessMode = Observable.accessMode;
            if (accessMode === ObservableModes.Raw)
                return this.$_raw();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            return this;
        };
        ObservableObject.prototype.$set = function (newValue) {
            var _this = this;
            _super.prototype.$set.call(this, newValue || null);
            if (!newValue || Observable.accessMode === ObservableModes.Raw)
                return this;
            proxyMode(function () {
                for (var n in _this) {
                    var proxy = _this[n];
                    if (proxy instanceof Observable)
                        proxy.$set(newValue[n]);
                }
            });
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
                $_changes: undefined, $_length: target.length, $_itemSchema: undefined
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
            var old = this.$get();
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
                        if (change.cancel !== true) {
                            change.sender = change.item;
                            change.type = ChangeTypes.Value;
                            change.sender.$notify(change);
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
        var item = new obArray.$_itemSchema.$ctor(obArray.$target[index], obArray);
        item.$_index = index;
        Object.defineProperty(obArray, index, { enumerable: true, configurable: true,
            get: function (mode) { return item.$get(mode); },
            set: function (item_value) {
                (obArray.$_changes || (obArray.$_changes = [])).push({
                    sender: obArray,
                    type: ChangeTypes.Replace,
                    index: index,
                    item: item,
                    value: item_value
                });
                item.$set(item_value);
            }
        });
    }
    function defineProp(target, name, accessorFactory) {
        var _this = this;
        var prop_value = Undefined;
        Object.defineProperty(target, name, {
            enumerable: true,
            configurable: false,
            get: function (param) {
                if (prop_value === Undefined)
                    prop_value = accessorFactory.call(this, target, name);
                return prop_value.get ? prop_value.get(param) : prop_value.$get(param);
            },
            set: function (val) {
                if (prop_value === Undefined)
                    prop_value = accessorFactory.call(_this, target, name);
                return prop_value.set ? prop_value.set(val) : prop_value.$set(val);
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
        ObservableSchema.prototype.$getFromRoot = function (root) {
            var data = root;
            for (var i in this.$paths) {
                data = data[this.$paths[i]];
                if (data === undefined || data === Undefined)
                    return undefined;
            }
            return data;
        };
        ObservableSchema.prototype.$asObject = function () {
            if (this.$type === DataTypes.Object)
                return this;
            if (this.$type === DataTypes.Array)
                throw new Error("无法将ObservableSchema从Array转化成Object.");
            this.$type = DataTypes.Object;
            var _ObservableObject = /** @class */ (function (_super) {
                __extends(_ObservableObject, _super);
                function _ObservableObject(init, index, extras) {
                    return _super.call(this, init, index, extras) || this;
                }
                return _ObservableObject;
            }(ObservableObject));
            ;
            _ObservableObject.prototype.$schema = this;
            this.$ctor = _ObservableObject;
            return this;
        };
        ObservableSchema.prototype.$asArray = function () {
            if (this.$type === DataTypes.Array)
                return this;
            if (this.$type === DataTypes.Object)
                throw new Error("无法将ObservableSchema从Object转化成Array.");
            this.$type = DataTypes.Array;
            var _ObservableArray = /** @class */ (function (_super) {
                __extends(_ObservableArray, _super);
                function _ObservableArray(init, index, extras) {
                    return _super.call(this, init, index, extras) || this;
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
        ObservableSchema.prototype.$defineProp = function (propname, initValue) {
            if (this.$type !== DataTypes.Object)
                throw new Error("调用$defineProp之前，要首先调用$asObject");
            var propSchema = new ObservableSchema_1(initValue, propname, this);
            Object.defineProperty(this, propname, { enumerable: true, writable: false, configurable: false, value: propSchema });
            defineProp(this.$ctor.prototype, propname, function (owner, name) { return new propSchema.$ctor(this, name); });
            return propSchema;
        };
        ObservableSchema.prototype.$initObject = function (ob) {
            var _loop_1 = function (n) {
                var propSchema = this_1[n];
                defineProp(ob, n, function (owner, name) { return new propSchema.$ctor(this, name); });
            };
            var this_1 = this;
            for (var n in this) {
                _loop_1(n);
            }
        };
        ObservableSchema.prototype.$create = function (init, extras) {
            return new this.$ctor(clone(this.$initData, true), init, extras);
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
        ReactiveTypes[ReactiveTypes["Internal"] = 0] = "Internal";
        ReactiveTypes[ReactiveTypes["Iterator"] = 1] = "Iterator";
        ReactiveTypes[ReactiveTypes["In"] = 2] = "In";
        ReactiveTypes[ReactiveTypes["Out"] = 3] = "Out";
        ReactiveTypes[ReactiveTypes["Ref"] = 4] = "Ref";
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
            var infos = sureMetaInfo(target, "reactives");
            if (info.name) {
                if (!info.schema)
                    info.schema = target[info.name];
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
    function template(partial, defs) {
        function markTemplateInfo(target, info) {
            var infos = sureMetaInfo(target, "templates");
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
            var infos = sureMetaInfo(target, "actions");
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
    function sureMetaInfo(target, name) {
        var meta = target.$meta;
        if (!meta)
            Object.defineProperty(target, "$meta", { enumerable: false, configurable: false, writable: true, value: meta = {} });
        if (!name)
            return meta;
        var info = meta[name];
        if (!info)
            Object.defineProperty(meta, name, { enumerable: false, configurable: false, writable: true, value: info = {} });
        return info;
    }
    var registeredComponentInfos = {};
    function inherits(extendCls, basCls) {
        function __() { this.constructor = extendCls; }
        extendCls.prototype = basCls === null ? Object.create(basCls) : (__.prototype = basCls.prototype, new __());
    }
    function component(tag, ComponentType) {
        var makeComponent = function (componentType) {
            var meta = sureMetaInfo(componentType.prototype);
            var _Component = function () {
                var ret = componentType.apply(this, arguments);
                if (!this.$meta.inited) {
                    initComponent(this);
                }
                return ret;
            };
            for (var k in ComponentType)
                _Component[k] = componentType[k];
            inherits(_Component, componentType);
            Object.defineProperty(_Component.prototype, "$meta", { enumerable: false, configurable: false, get: function () { return componentType.prototype["$meta"]; }, set: function (val) { return componentType.prototype["$meta"] = val; } });
            meta.tag = tag;
            meta.ctor = componentType;
            meta.wrapper = _Component;
            registeredComponentInfos[tag] = meta;
            return _Component;
        };
        if (ComponentType) {
            return makeComponent(ComponentType);
        }
        else
            return makeComponent;
    }
    exports.component = component;
    function createComponent(tag, context) {
        var componentInfo = registeredComponentInfos[tag];
        if (!componentInfo)
            throw new Error(tag + "\u4E0D\u662FComponent,\u8BF7\u8C03\u7528component\u6CE8\u518C\u6216\u6807\u8BB0\u4E3A@component");
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
        for (var name_1 in meta.reactives) {
            var stateInfo = meta.reactives[name_1];
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
        var descriptor = {
            enumerable: true,
            configurable: false,
            get: function () {
                if (Observable.accessMode === ObservableModes.Schema)
                    return stateInfo.schema;
                var states = firstComponent.$reactives || (firstComponent.$reactives = {});
                var ob = states[stateInfo.name] || (states[stateInfo.name] = new stateInfo.schema.$ctor(stateInfo.initData, stateInfo));
                return ob.$get();
            },
            set: function (val) {
                var states = firstComponent.$reactives || (firstComponent.$reactives = {});
                if (val instanceof Observable) {
                    states[stateInfo.name] = val;
                    return;
                }
                var ob = states[stateInfo.name] || (states[stateInfo.name] = new stateInfo.schema.$ctor(stateInfo.initData, stateInfo));
                ob.$set(val);
            }
        };
        Object.defineProperty(firstComponent, stateInfo.name, descriptor);
        Object.defineProperty(firstComponent.$meta.ctor.prototype, stateInfo.name, descriptor);
    }
    //<table rows={rows} take={10} skip={start} ><col name="name" type='text' label='名称' onchange={abc}/></table>
    function initTemplate(firstComponent, tplInfo) {
        var rawMethod = firstComponent[tplInfo.name];
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
                    result = tplInfo.vnode.render(component, container);
                });
                tplInfo.render = function (container) {
                    return tplInfo.vnode.render.call(this, container, tplInfo.vnode);
                };
            }
            return result;
        };
        Object.defineProperty(tplMethod, "$orign", { configurable: false, writable: false, enumerable: false, value: rawMethod });
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
    var VirtualNode = /** @class */ (function () {
        function VirtualNode() {
        }
        VirtualNode.prototype.render = function (component, container) {
        };
        VirtualNode.create = function (tag, attrs) {
            var vnode;
            var componentInfo = registeredComponentInfos[tag];
            if (componentInfo)
                vnode = new VirtualComponentNode(tag, attrs);
            else
                vnode = new VirtualElementNode(tag, attrs);
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
            var forPars;
            for (var attrName in this.attrs) {
                var attrValue = this.attrs[attrName];
                if (attrName === "for") {
                    forPars = attrValue;
                }
                var match = attrName.match(evtnameRegx);
                if (match) {
                    var evtName = match[1];
                    Host.attach(elem, evtName, makeAction(component, attrValue));
                    continue;
                }
                if (attrValue instanceof ObservableSchema) {
                    var binder = attrBinders[name];
                    var proxy = attrValue.$getFromRoot(component);
                    if (binder)
                        binder.call(component, proxy);
                    else
                        (function (name, value) {
                            Host.setAttribute(elem, name, value.$get());
                            value.$subscribe(function (e) {
                                Host.setAttribute(elem, name, e.value);
                            });
                        })(attrName, proxy);
                }
                else {
                    Host.setAttribute(elem, attrName, attrValue);
                }
            }
            if (container)
                Host.appendChild(container, elem);
            if (!this.children || this.children.length === 0)
                return elem;
            if (forPars) {
                var each = forPars[0];
                var value = forPars[1];
                var key = forPars[2];
                for (var k in each) {
                    if (key)
                        key.$getFromRoot(component).$renew(k);
                    value.$getFromRoot(component).$replace(each[k]);
                    for (var i in this.children) {
                        this.children[i].render(component, elem);
                    }
                }
            }
            else {
                for (var i in this.children) {
                    this.children[i].render(component, elem);
                }
            }
            return elem;
        };
        return VirtualElementNode;
    }(VirtualNode));
    exports.VirtualElementNode = VirtualElementNode;
    function bindComponentAttr(component, subComponent, subAttrName, bindValue) {
        var subMeta = subComponent.$meta;
        var stateInfo = subMeta.reactives[subAttrName];
        var subStateType = stateInfo ? stateInfo.type : undefined;
        if (subStateType === ReactiveTypes.Internal || subStateType === ReactiveTypes.Iterator)
            throw new Error(this.tag + "." + subAttrName + "\u662F\u5185\u90E8\u53D8\u91CF\uFF0C\u4E0D\u53EF\u4EE5\u5728\u5916\u90E8\u8D4B\u503C");
        var subAttr = subComponent[subAttrName];
        if (subStateType === ReactiveTypes.Out) {
            if (bindValue instanceof ObservableSchema) {
                subAttr.$subscribe(function (e) { return bindValue.$getFromRoot(component).$set(e.value); });
            }
            else {
                throw new Error("\u65E0\u6CD5\u7ED1\u5B9A[OUT]" + subMeta.tag + "." + subAttrName + "\u5C5E\u6027\uFF0C\u7236\u7EC4\u4EF6\u8D4B\u4E88\u8BE5\u5C5E\u6027\u7684\u503C\u4E0D\u662FObservable");
            }
        }
        else if (subStateType === ReactiveTypes.In) {
            if (bindValue instanceof ObservableSchema) {
                var bindOb = bindValue.$getFromRoot(component);
                bindOb.$subscribe(function (e) { return subAttr.$set(e.value); });
                subAttr.$_raw(bindOb.$get());
            }
            else {
                subAttr.$_raw(bindValue);
                console.warn("\u672A\u80FD\u7ED1\u5B9A[IN]" + subMeta.tag + "." + subAttrName + "\u5C5E\u6027,\u7236\u7EC4\u4EF6\u8D4B\u4E88\u8BE5\u5C5E\u6027\u7684\u503C\u4E0D\u662FObservable");
            }
        }
        else if (subStateType === ReactiveTypes.Ref) {
            if (bindValue instanceof ObservableSchema) {
                var bindOb = bindValue.$getFromRoot(component);
                bindOb.$subscribe(function (e) { return subAttr.$set(e.value); });
                subAttr.$_raw(bindOb.$get());
                subAttr.$subscribe(function (e) { return bindValue.$getFromRoot(component).$set(e.value); });
            }
            else {
                subAttr.$_raw(bindValue);
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
    var VirtualComponentNode = /** @class */ (function (_super) {
        __extends(VirtualComponentNode, _super);
        function VirtualComponentNode(tag, attrs) {
            var _this = _super.call(this) || this;
            _this.tag = tag;
            _this.attrs = attrs;
            return _this;
        }
        VirtualComponentNode.prototype.render = function (component, container) {
            var subComponent = createComponent(this.tag);
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
    var evtnameRegx = /(?:on)?([a-zA-Z_][a-zA-Z0-9_]*)/;
    var attrBinders = {};
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
    Host.setAttribute = function (elem, name, value) {
        elem.setAttribute(name, value);
    };
    Host.appendChild = function (elem, child) {
        elem.appendChild(child);
    };
    Host.removeAllChildrens = function (elem) {
        elem.innerHTML = elem.nodeValue = "";
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
        if (srcT === "boolean" || srcT === "number" || srcT === "string")
            return src;
        var rs;
        if (srcT === "function") {
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
        component: component, state: reactive, template: template,
        VirtualNode: VirtualNode, VirtualTextNode: VirtualTextNode, VirtualElementNode: VirtualElementNode, VirtualComponentNode: VirtualComponentNode, virtualNode: exports.virtualNode, HOST: Host, NOT: NOT, EXP: EXP,
        intimate: intimate, clone: clone
    };
    if (typeof window !== 'undefined')
        window.YA = YA;
    exports.default = YA;
});
//# sourceMappingURL=YA.core.js.map