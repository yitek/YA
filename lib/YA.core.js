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
        ObservableModes[ObservableModes["Proxy"] = 2] = "Proxy";
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
            Observable.accessMode = ObservableModes.Proxy;
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
                _this.$_raw = prop_raw(index);
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
            if (accessMode == ObservableModes.Raw || Observable_1.accessMode === ObservableModes.Raw)
                return this.$_raw();
            if (accessMode == ObservableModes.Proxy || Observable_1.accessMode === ObservableModes.Proxy)
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
        Observable.prototype.toString = function () { var rawValue = this.$_raw(); return rawValue ? rawValue.toString() : rawValue; };
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
            if (!_this.$target)
                _this.$_raw(_this.$target = {});
            if (!_this.$schema) {
                _this.$schema = new ObservableSchema(_this.$target);
                _this.$schema.$initObservable(_this);
            }
            _this.$type = DataTypes.Object;
            return _this;
        }
        ObservableObject.prototype.$get = function (accessMode) {
            if (accessMode === ObservableModes.Raw || Observable.accessMode === ObservableModes.Raw)
                return this.$_raw();
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
    function prop_raw(name) {
        return function (val) {
            var objProxy = this.$_owner;
            return val === undefined
                ? (objProxy.$_modifiedValue === undefined
                    ? objProxy.$target
                    : (objProxy.$_modifiedValue === Undefined ? null : objProxy.$_modifiedValue))[name]
                : (objProxy.$_modifiedValue === undefined
                    ? objProxy.$target
                    : (objProxy.$_modifiedValue === Undefined ? null : objProxy.$_modifiedValue))[name] = val;
        };
    }
    function defineMember(target, name, accessorFactory) {
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
    var ObservableSchema = /** @class */ (function () {
        function ObservableSchema(initData, index, owner) {
            var path;
            index = index === undefined || index === null ? "" : index;
            if (owner) {
                var ppath = owner.$path;
                path = ppath ? ppath + "." + index : index;
            }
            else
                path = index;
            intimate(this, {
                "$type": DataTypes.Value,
                "$index": index,
                "$path": path,
                "$owner": owner,
                "$ctor": Observable,
                "$item_schema": null,
                "$initData": initData
            });
            if (initData) {
                var t = Object.prototype.toString.call(initData);
                if (t === "[object Object]") {
                    this.$asObject();
                    for (var n in initData) {
                        this.$defineProp(n, initData[n]);
                    }
                }
                else if (t === "[object Array]") {
                    throw new Error("not implement.");
                }
            }
        }
        ObservableSchema_1 = ObservableSchema;
        ObservableSchema.prototype.$asObject = function () {
            if (this.$type === DataTypes.Object)
                return this;
            if (this.$type === DataTypes.Array)
                throw new Error("无法将ObservableSchema从Array转化成Object.");
            this.$type = DataTypes.Object;
            var objSchema = this;
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
        ObservableSchema.prototype.$defineProp = function (propname, initValue) {
            if (this.$type !== DataTypes.Object)
                throw new Error("调用$defineProp之前，要首先调用$asObject");
            var propSchema = new ObservableSchema_1(initValue, propname, this);
            Object.defineProperty(this, propname, { enumerable: true, writable: false, configurable: false, value: propSchema });
            defineMember(this.$ctor.prototype, propname, function (owner, name) { return new propSchema.$ctor(this, name); });
            return propSchema;
        };
        ObservableSchema.prototype.$initObservable = function (ob) {
            var _loop_1 = function (n) {
                var propSchema = this_1[n];
                defineMember(ob, n, function (owner, name) { return new propSchema.$ctor(this, name); });
            };
            var this_1 = this;
            for (var n in this) {
                _loop_1(n);
            }
        };
        ObservableSchema.prototype.$create = function (init, extras) {
            return new this.$ctor(clone(this.$initData, true), init, extras);
        };
        ObservableSchema = ObservableSchema_1 = __decorate([
            intimate()
        ], ObservableSchema);
        return ObservableSchema;
        var ObservableSchema_1;
    }());
    exports.ObservableSchema = ObservableSchema;
    //=======================================================================
    var YA = {
        Subject: Subject, ObservableModes: ObservableModes, Observable: Observable, ObservableObject: ObservableObject, ObservableSchema: ObservableSchema
    };
    if (typeof window !== 'undefined')
        window.YA = YA;
    exports.default = YA;
});
//# sourceMappingURL=YA.core.js.map