var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    ////////////////////////////////////////////////////////////////////
    //
    // 语言机制与一些对象上的扩展
    //
    ////////////////////////////////////////////////////////////////////
    //implicit 
    function implicit(strong, members, value) {
        if (members) {
            if (value) {
                Object.defineProperty(strong, members, { enumerable: false, writable: true, configurable: true, value: value });
            }
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
    exports.implicit = implicit;
    ///////////////////////////////////////////////////////////////
    // 类型判断
    function is_string(obj) {
        return typeof obj === "string";
    }
    exports.is_string = is_string;
    function is_bool(obj) {
        return typeof obj === "boolean";
    }
    exports.is_bool = is_bool;
    function is_number(obj) {
        return typeof obj === "number";
    }
    exports.is_number = is_number;
    function is_assoc(obj) {
        if (!obj)
            return false;
        return Object.prototype.toString.call(obj) === "[object Object]";
    }
    exports.is_assoc = is_assoc;
    function is_object(obj) {
        if (!obj)
            return false;
        var t = Object.prototype.toString.call(obj);
        if (t.indexOf("[object ") == 0)
            return true;
    }
    exports.is_object = is_object;
    function is_array(obj) {
        if (!obj)
            return false;
        return Object.prototype.toString.call(obj) === "[object Array]";
    }
    exports.is_array = is_array;
    function is_empty(obj) {
        if (obj === undefined || obj === null || obj === "" || obj === 0)
            return true;
        for (var n in obj)
            return true;
        return false;
    }
    exports.is_empty = is_empty;
    ////////////////////////////////////////////////////////
    // 字符串处理
    var trimreg = /(^\s+)|(\s+$)/g;
    /**
     *  去掉两边空格
     *
     * @export
     * @param {*} text
     * @returns {string}
     */
    function trim(text) {
        if (text === null || text === undefined)
            return "";
        text = text.toString().replace(trimreg, "");
    }
    exports.trim = trim;
    var percentRegx = /([+-]?[\d,]+(?:.\d+))%/g;
    /**
     * 是否是百分数
     *
     * @export
     * @param {*} text
     * @returns {number}
     */
    function is_percent(text) {
        if (text === null || text === undefined)
            return undefined;
        var match = text.toString().match(percentRegx);
        if (match)
            return match[1];
    }
    exports.is_percent = is_percent;
    /////////////////////
    // 数组处理
    function array_index(obj, item, start) {
        if (start === void 0) { start = 0; }
        if (!obj)
            return -1;
        for (var i = start, j = obj.length; i < j; i++) {
            if (obj[i] === item)
                return i;
        }
        return -1;
    }
    exports.array_index = array_index;
    function array_add_unique(arr, item) {
        for (var i = 0, j = arr.length; i < j; i++) {
            if (arr[i] === item)
                return false;
        }
        arr.push(item);
        return true;
    }
    exports.array_add_unique = array_add_unique;
    ///////////////////////////////////////
    // 对象处理
    exports.extend = function () {
        var target = arguments[0] || {};
        for (var i = 1, j = arguments.length; i < j; i++) {
            var o = arguments[i];
            if (o)
                for (var n in o)
                    target[n] = o[n];
        }
        return target;
    };
    var DPath = /** @class */ (function () {
        function DPath(pathtext) {
            this.paths = pathtext.split(".");
        }
        DPath.prototype.getValue = function (data) {
            for (var i in this.paths) {
                if (!data)
                    return undefined;
                data = data[this.paths[i]];
            }
            return data;
        };
        DPath.prototype.setValue = function (data, value) {
            for (var i = 0, j = this.paths.length - 1; i < j; i++) {
                var path = this.paths[i];
                var sub = data[path];
                if (typeof sub !== "object") {
                    sub = {};
                    data[path] = sub;
                }
                data = sub;
            }
            data[this.paths[this.paths.length - 1]] = value;
        };
        DPath.fetch = function (tpath) {
            return DPath.caches[tpath] || (DPath.caches[tpath] = new DPath(tpath));
        };
        DPath.getValue = function (data, tpath) {
            var dpath = DPath.caches[tpath] || (DPath.caches[tpath] = new DPath(tpath));
            return dpath.getValue(data);
        };
        DPath.setValue = function (data, tpath, value) {
            var dpath = DPath.caches[tpath] || (DPath.caches[tpath] = new DPath(tpath));
            return dpath.setValue(data, value);
        };
        DPath.replace = function (template, data) {
            return data ? template.replace(replaceByDataRegx, (function (match) {
                return DPath.getValue(data, match);
            })) : template;
        };
        DPath.caches = {};
        return DPath;
    }());
    exports.DPath = DPath;
    var replaceByDataRegx = /\$\{[a-zA-Z_0-9]+(?:.[a-zA-Z0-9_])\}/g;
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
    var PromiseStates;
    (function (PromiseStates) {
        PromiseStates[PromiseStates["Pending"] = 0] = "Pending";
        PromiseStates[PromiseStates["Fulfilled"] = 1] = "Fulfilled";
        PromiseStates[PromiseStates["Rejected"] = -1] = "Rejected";
    })(PromiseStates = exports.PromiseStates || (exports.PromiseStates = {}));
    var Promise = /** @class */ (function () {
        function Promise(statement, sync) {
            var _this = this;
            var status = this.$_promise_status = PromiseStates.Pending;
            var result = this.$_promise_result = undefined;
            var fulfillCallbacks = this.$_promise_fulfillCallbacks = [];
            var rejectCallbacks = this.$_promise_rejectCallbacks = [];
            //Object.defineProperty(this,"$_promise_status",{enumerable:false,configurable:false,get:()=>status});   
            //Object.defineProperty(this,"$_promise_fulfillCallbacks",{enumerable:false,configurable:false,get:()=>fulfillCallbacks});
            //Object.defineProperty(this,"$_promise_rejectCallbacks",{enumerable:false,configurable:false,get:()=>rejectCallbacks});   
            //Object.defineProperty(this,"$_promise_result",{enumerable:false,configurable:false,get:()=>result});   
            var resolve = function (result) {
                if (status !== PromiseStates.Pending) {
                    console.warn("settled状态不应该再调用resolve/reject");
                    return _this;
                }
                //如果是自己，就丢出错误
                if (result === _this)
                    throw new TypeError("不能把自己resolve掉啊.");
                //resolve的结果是了一个thenable
                if (result && typeof result.then === "function") {
                    //让该Promise的状态跟resolve result的状态保持一致
                    result.then(function (value) { return fulfill(value); }, function (value) { return reject(value); });
                }
                else {
                    //如果是其他的类型，就让promise 变更为fulfill状态
                    fulfill(result);
                }
                return _this;
            };
            var reject = function (value) {
                if (status !== PromiseStates.Pending) {
                    console.warn("settled状态不应该再调用resolve/reject");
                    return _this;
                }
                status = _this.$_promise_status = PromiseStates.Fulfilled;
                result = _this.$_promise_result = value;
                _this.resolve = _this.reject = function (params) { return this; };
                setTimeout(function () {
                    var rejectHandlers = fulfillCallbacks;
                    _this.$_promise_fulfillCallbacks = _this.$_promise_rejectCallbacks
                        = fulfillCallbacks = rejectCallbacks = null;
                    for (var i in rejectHandlers)
                        rejectHandlers[i].call(_this, result, false);
                }, 0);
                return _this;
            };
            var fulfill = function (value) {
                if (status !== PromiseStates.Pending) {
                    //循环引用，给个警告，什么都不做
                    console.warn("已经处于Settled状态，无法再更正状态");
                    return;
                }
                status = _this.$_promise_status = PromiseStates.Fulfilled;
                result = _this.$_promise_result = value;
                var complete = function () {
                    var fulfillHandlers = fulfillCallbacks;
                    _this.$_promise_fulfillCallbacks = _this.$_promise_rejectCallbacks
                        = fulfillCallbacks = rejectCallbacks = null;
                    for (var i in fulfillHandlers)
                        fulfillHandlers[i].call(_this, result, true);
                };
                setTimeout(complete, 0);
            };
            // ajax().then((rs)=>ajax1()).then
            this.then = function (fulfillHandler, rejectHandler) {
                if (status === PromiseStates.Fulfilled && fulfillHandler) {
                    setTimeout(function () {
                        fulfillHandler.call(_this, result, true);
                    }, 0);
                }
                if (status === PromiseStates.Rejected && rejectHandler) {
                    setTimeout(function () {
                        rejectHandler.call(_this, result, false);
                    }, 0);
                }
                if (status !== PromiseStates.Pending)
                    return _this;
                if (!fulfillHandler && !rejectHandler)
                    return _this;
                var innerResolve;
                var innerReject;
                var newPromise = new Promise(function (resolve, reject) {
                    innerResolve = resolve;
                    innerResolve = reject;
                });
                if (fulfillHandler) {
                    fulfillCallbacks.push(function (value) {
                        var rs = fulfillHandler.call(_this, value, true);
                        if (rs && typeof rs.then === "function") {
                            rs.then(innerResolve, innerReject);
                        }
                        else
                            innerResolve.call(newPromise, rs);
                    });
                }
                if (rejectHandler) {
                    rejectCallbacks.push(function (value) {
                        rejectHandler.call(_this, value, false);
                        innerResolve(undefined);
                    });
                }
                return newPromise;
            };
            if (statement) {
                if (sync) {
                    try {
                        statement.call(this, resolve, reject);
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }
                else
                    setTimeout(function () {
                        try {
                            statement.call(_this, resolve, reject);
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    }, 0);
            }
            else {
                this.resolve = function (value) { setTimeout(function () { return resolve(value); }, 0); return _this; };
                this.reject = function (value) { setTimeout(function () { return reject(value); }, 0); return _this; };
            }
        }
        Promise.prototype.then = function (fulfillCallback, rejectCallback) {
            console.warn("called on placehold method.");
            return this;
        };
        Promise.prototype.resolve = function (result) {
            console.warn("当Promise设置了异步函数时，resolve/reject应该由Promise的异步函数调用");
            return this;
        };
        Promise.prototype.reject = function (result) {
            console.warn("当Promise设置了异步函数时，resolve/reject应该由Promise的异步函数调用");
            return this;
        };
        Promise.prototype.success = function (callback) {
            return this.then(callback);
        };
        Promise.prototype.error = function (callback) {
            return this.then(undefined, callback);
        };
        Promise.prototype.complete = function (callback) {
            return this.then(callback, callback);
        };
        Promise.prototype.catch = function (callback) {
            return this.then(undefined, callback);
        };
        Promise.resolve = function (value) {
            return new Promise(function (resolve, reject) { return resolve(value); });
        };
        Promise.reject = function (value) {
            return new Promise(function (resolve, reject) { return reject(value); });
        };
        Promise.all = function (thenables, sync) {
            return new Promise(function (resolve, reject) {
                var waitCount = thenables.length;
                var rs = [];
                for (var i in thenables)
                    (function (thenable, i) {
                        thenables[i].then(function (value) {
                            if (rs) {
                                rs[i] = value;
                                if (--waitCount == 0)
                                    resolve(rs);
                            }
                        }, function (err) {
                            rs = undefined;
                            reject(err);
                        });
                    })(thenables[i], i);
            }, sync);
        };
        return Promise;
    }());
    exports.Promise = Promise;
    if (typeof window !== 'undefined') {
        if (!window.Promise)
            window.Promise = Promise;
    }
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
            Object.defineProperty(this, "$__topics__", { enumerable: false, writable: false, configurable: false, value: {} });
        }
        /**
         * 注册监听函数
         * notify的时候，注册了相关主题的监听函数会被调用
         * 如果不指明主题topic，默认topic=""
         *
         * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 监听函数或则主题
         * @param {{(evt:TEvtArgs):any}} [listener] 监听函数。如果第一个参数是主题，该参数才起作用。
         * @returns {ISubject<TEvtArgs>} 可监听对象
         * @memberof Observable
         */
        Subject.prototype.subscribe = function (topic, listener, disposible) {
            var _this = this;
            if (listener === undefined) {
                listener = topic;
                topic = "";
            }
            else if (typeof topic === "function") {
                disposible = listener;
                listener = topic;
                topic = "";
            }
            var topics = this.$__topics__, handlers = topics[topic];
            if (handlers) {
                if (handlers.$__isFulfilledTopic__) {
                    listener.call(this, handlers.filfillValue);
                    return this;
                }
            }
            else
                topics[topic] = handlers = [];
            handlers.push(listener);
            if (disposible && disposible.dispose)
                disposible.dispose(function (a) { return _this.unsubscribe(topic, listener); });
            return this;
        };
        /**
         * 取消主题订阅
         * notify操作时，被取消的监听器不会被调用
         * 如果不指明主题topic，默认topic=""
         *
         * @param {(string|{(evt:TEvtArgs):any})} topicOrListener 要需要的主题或监听器
         * @param {{(evt:TEvtArgs):any}} [listener] 要取消的监听器，只有当topicOrListner参数为topic时，才需要该参数
         * @returns {ISubject<TEvtArgs>} 可监听对象
         * @memberof Observable
         */
        Subject.prototype.unsubscribe = function (topic, listener) {
            if (listener === undefined) {
                listener = topic;
                topic = "";
            }
            var topics = this.$__topics__, handlers = topics[topic];
            if (!handlers)
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
        Subject.prototype.notify = function (topic, evtArgs) {
            if (evtArgs === undefined) {
                evtArgs = topic;
                topic = "";
            }
            var topics = this.$__topics__, handlers = topics[topic];
            if (!handlers)
                return this;
            for (var i in handlers) {
                handlers[i].call(this, evtArgs);
            }
            return this;
        };
        Subject.prototype.fulfill = function (topic, evtArgs) {
            if (evtArgs === undefined) {
                evtArgs = topic;
                topic = "";
            }
            var topics = this.$__topics__, handlers = topics[topic];
            if (handlers.$__isFulfilledTopic__)
                throw new Error(topic + " \u5DF2\u7ECF\u5177\u5907\u7EC8\u503C\uFF0C\u4E0D\u53EF\u4EE5\u518D\u53D1\u9001\u7EC8\u503C.");
            topics[topic] = {
                $__isFulfilledTopic__: true, $fulfillValue: evtArgs
            };
            var accelerator = this[topic];
            if (accelerator && accelerator.$__isEventAccelerator__) {
                Object.defineProperty(this, topic, { enumerable: false, writable: true, configurable: true, value: function (handler) {
                        handler.call(this, evtArgs);
                        return this;
                    } });
            }
            if (!handlers)
                return this;
            for (var i in handlers) {
                handlers[i].call(this, evtArgs);
            }
            return this;
        };
        Subject = __decorate([
            implicit()
        ], Subject);
        return Subject;
    }());
    exports.Subject = Subject;
    function eventable(subject, topic) {
        var accelorator = subject[topic];
        if (accelorator && accelorator.$__isEventAccelerator__)
            return subject;
        accelorator = function (handler) {
            var topics = this.$__topics__;
            if (!topics)
                Object.defineProperty(this, "$__topics__", { enumerable: false, writable: false, configurable: false, value: topics = {} });
            var handlers = topics[topic];
            if (typeof handler === "function") {
                if (!handlers)
                    topics[topic] = [];
                handlers.push(handler);
            }
            else {
                var result_1 = handler;
                Object.defineProperty(this, topic, { enumerable: false, configurable: true, writable: true, value: function (handler) {
                        handler.call(result_1);
                        return this;
                    } });
                topics[topic] = { $__isFulfilledTopic__: true, fulfillValue: handler };
                if (!handlers)
                    return this;
                for (var i in handlers)
                    handlers[i].call(this, result_1);
            }
            return this;
        };
        Object.defineProperty(subject, topic, { enumerable: false, writable: true, configurable: true, value: accelorator });
        return subject;
    }
    exports.eventable = eventable;
    var cidSeed = 0;
    function new_cid() {
        if (++cidSeed === 2100000000)
            cidSeed = -cidSeed;
        else if (cidSeed === 0)
            return cidSeed = 1;
        return cidSeed;
    }
    exports.new_cid = new_cid;
    var Disposable = /** @class */ (function () {
        function Disposable() {
            disposable(this);
        }
        Disposable.prototype.dispose = function (onRealse) {
            return this;
        };
        Disposable.prototype.deteching = function (onDeteching) {
            return this;
        };
        return Disposable;
    }());
    exports.Disposable = Disposable;
    function disposable(target) {
        target || (target = this);
        Object.defineProperty(target, "$isDisposed", { enumerable: false, configurable: true, writable: false, value: false });
        Object.defineProperty(target, "$__disposings__", { enumerable: false, configurable: false, writable: true, value: undefined });
        Object.defineProperty(target, "$__detechings__", { enumerable: false, configurable: false, writable: true, value: undefined });
        Object.defineProperty(target, "deteching", { enumerable: false, configurable: false, writable: true, value: function (onDeteching) {
                if (this.$isDisposed)
                    throw new Error("该资源已经被释放");
                if (onDeteching !== undefined) {
                    var onDetechings = this.$__detechings__;
                    if (!onDetechings)
                        Object.defineProperty(this, "$__detechings__", { enumerable: false, configurable: false, writable: false, value: onDetechings = [] });
                    onDetechings.push(onDeteching);
                }
                else {
                    var onDetechings = this.$__detechings__;
                    for (var i in onDetechings) {
                        if (onDetechings[i].call(this, this) === false)
                            return false;
                    }
                    return true;
                }
                return this;
            } });
        Object.defineProperty(target, "dispose", { enumerable: false, configurable: false, writable: true, value: function (onRelease) {
                if (this.$isDisposed)
                    throw new Error("不能释放已经释放的资源");
                if (typeof onRelease === "function") {
                    var onReleases_2 = this.$__disposings__;
                    if (!onReleases_2)
                        Object.defineProperty(this, "$__disposings__", { enumerable: false, configurable: false, writable: false, value: onReleases_2 = [] });
                    onReleases_2.push(onRelease);
                    return this;
                }
                Object.defineProperty(this, "$isDisposed", { enumerable: false, configurable: true, writable: false, value: true });
                var onReleases = this.$__disposings__;
                try {
                    for (var _i = 0, onReleases_1 = onReleases; _i < onReleases_1.length; _i++) {
                        var release = onReleases_1[_i];
                        release.call(this, onRelease, this);
                    }
                }
                finally {
                }
                return this;
            } });
        return target;
    }
    exports.disposable = disposable;
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
                _this.$__obOwner__ = init;
                _this.$__obIndex__ = index;
                _this.$__obRaw__ = function (val) { return observableMode(ObservableModes.Raw, function () { return val === undefined
                    ? (_this.$__obOwner__.$__obModifiedValue__ === undefined
                        ? _this.$__obOwner__.$target
                        : (_this.$__obOwner__.$__obModifiedValue__ === Undefined ? null : _this.$__obOwner__.$__obModifiedValue__))[_this.$__obIndex__]
                    : (_this.$__obOwner__.$__obModifiedValue__ === undefined
                        ? _this.$__obOwner__.$target
                        : (_this.$__obOwner__.$__obModifiedValue__ === Undefined ? null : _this.$__obOwner__.$__obModifiedValue__))[_this.$__obIndex__] = val; }); };
                _this.$__obExtras__ = extras;
                if (initValue !== undefined) {
                    _this.$__obRaw__(_this.$target = initValue);
                }
                else {
                    _this.$target = _this.$__obRaw__();
                }
            }
            else if (typeof init === "function") {
                //ctor(TRaw,extras)
                _this.$__obExtras__ = index;
                _this.$__obRaw__ = init;
                if (initValue !== undefined) {
                    _this.$__obRaw__(_this.$target = initValue);
                }
                else {
                    _this.$target = _this.$__obRaw__();
                }
            }
            else {
                //ctor(initValue,accessor,extras)
                if (typeof index === "function") {
                    _this.$__obExtras__ = extras;
                    _this.$__obRaw__ = index;
                    _this.$target = init;
                    index.call(_this, init);
                }
                else {
                    //ctor(initValue,extras)
                    _this.$target = init;
                    _this.$__obExtras__ = index;
                    _this.$__obRaw__ = function (val) { return val === undefined ? init : init = val; };
                }
            }
            if (_this.$target instanceof Observable_1)
                throw new Error("不正确的赋值");
            implicit(_this, {
                $target: _this.$target, $type: DataTypes.Value, $schema: _this.$schema, $isset: false,
                $__obRaw__: _this.$__obRaw__, $__obIndex__: _this.$__obIndex__, $__obModifiedValue__: undefined, $__obOwner__: _this.$__obOwner__, $__obExtras__: _this.$__obExtras__
            });
            Object.defineProperty(_this, "$extras", { enumerable: false, configurable: false,
                get: function () {
                    if (_this.$__obExtras__ !== undefined)
                        return _this.$__obExtras__;
                    if (_this.$__obOwner__)
                        return _this.$__obOwner__.$extras;
                    return undefined;
                },
                set: function (val) { return _this.$__obExtras__ = val; }
            });
            Object.defineProperty(_this, "$root", { enumerable: false, configurable: false,
                get: function () {
                    if (_this.$__obOwner__)
                        return _this.$__obOwner__.$root;
                    return _this;
                }
            });
            return _this;
        }
        Observable_1 = Observable;
        Observable.prototype.get = function (accessMode) {
            if (accessMode === undefined)
                accessMode = Observable_1.accessMode;
            if (accessMode == ObservableModes.Raw)
                return this.$__obRaw__();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            if (accessMode == ObservableModes.Observable)
                return this;
            return (this.$__obModifiedValue__ === undefined) ? this.$target : (this.$__obModifiedValue__ === Undefined ? undefined : this.$__obModifiedValue__);
        };
        Observable.prototype.set = function (newValue, updateImmediately) {
            this.$isset = true;
            if (newValue && newValue instanceof Observable_1)
                newValue = newValue.get(ObservableModes.Value);
            if (Observable_1.accessMode === ObservableModes.Raw) {
                this.$__obRaw__.call(this, newValue);
                return this;
            }
            this.$__obModifiedValue__ = newValue === undefined ? Undefined : newValue;
            if (updateImmediately)
                this.update();
            return this;
        };
        Observable.prototype.update = function () {
            var newValue = this.$__obModifiedValue__;
            if (newValue === undefined)
                return true;
            this.$__obModifiedValue__ = undefined;
            newValue = newValue === Undefined ? undefined : newValue;
            var oldValue = this.$target;
            if (newValue !== oldValue) {
                this.$__obRaw__(this.$target = newValue);
                var evtArgs = { type: ChangeTypes.Value, value: newValue, old: oldValue, sender: this };
                this.notify(evtArgs);
                return evtArgs.cancel !== true;
            }
            return true;
        };
        Observable.prototype.toString = function () {
            var currentValue = this.get(ObservableModes.Default);
            return currentValue === undefined || currentValue === null ? "" : currentValue.toString();
        };
        var Observable_1;
        Observable.accessMode = ObservableModes.Default;
        Observable = Observable_1 = __decorate([
            implicit()
        ], Observable);
        return Observable;
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
                _this.$__obRaw__(_this.$target = {});
            if (!_this.$schema) {
                _this.$schema = new ObservableSchema(_this.$target);
                _this.$schema.initObject(_this);
            }
            return _this;
        }
        ObservableObject.prototype.$prop = function (name) {
            var _this = this;
            observableMode(ObservableModes.Observable, function () {
                return _this[name];
            });
        };
        ObservableObject.prototype.get = function (accessMode) {
            var _this = this;
            if (accessMode === undefined)
                accessMode = Observable.accessMode;
            if (accessMode === ObservableModes.Raw)
                return this.$__obRaw__();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            if (accessMode === ObservableModes.Value) {
                return observableMode(ObservableModes.Observable, function () {
                    var rs = {};
                    for (var n in _this) {
                        if (n === "constructor" || n[0] === "$")
                            continue;
                        var prop = _this[n];
                        rs[n] = prop.get(ObservableModes.Value);
                    }
                    return rs;
                });
            }
            return this;
        };
        ObservableObject.prototype.set = function (newValue, updateImmediately) {
            var _this = this;
            this.$isset = true;
            if (newValue && newValue instanceof Observable)
                newValue = newValue.get(ObservableModes.Value);
            _super.prototype.set.call(this, newValue || null);
            if (!newValue)
                return this;
            proxyMode(function () {
                for (var n in _this) {
                    if (n === "constructor" || n[0] === "$")
                        continue;
                    var proxy = _this[n];
                    if (proxy instanceof Observable)
                        proxy.set(newValue[n]);
                }
            });
            if (updateImmediately)
                this.$update();
            return this;
        };
        ObservableObject.prototype.update = function () {
            var _this = this;
            var result = _super.prototype.update.call(this);
            if (result === false)
                return false;
            proxyMode(function () {
                for (var n in _this) {
                    var proxy = _this[n];
                    if (proxy instanceof Observable)
                        proxy.update();
                }
            });
            return true;
        };
        ObservableObject = __decorate([
            implicit()
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
                _this.$__obRaw__.call(_this, target = _this.$target = []);
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
            implicit(_this, {
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
                    ret += "" + item.get(ObservableModes.Default);
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
        ObservableArray.prototype.get = function (accessMode) {
            var _this = this;
            if (accessMode === undefined)
                accessMode = Observable.accessMode;
            if (accessMode === ObservableModes.Raw)
                return this.$__obRaw__();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            if (accessMode === ObservableModes.Value) {
                return observableMode(ObservableModes.Observable, function () {
                    var rs = [];
                    for (var n in _this) {
                        if (n === "constructor" || n[0] === "$")
                            continue;
                        var prop = _this[n];
                        rs.push(prop.get(ObservableModes.Value));
                    }
                    return rs;
                });
            }
            return this;
        };
        ObservableArray.prototype.set = function (newValue, updateImmediately) {
            this.$isset = true;
            if (newValue && newValue instanceof Observable)
                newValue = newValue.get(ObservableModes.Value);
            else {
                var newArr = [];
                for (var _i = 0, newValue_1 = newValue; _i < newValue_1.length; _i++) {
                    var item = newValue_1[_i];
                    if (item instanceof Observable)
                        newArr.push(item.get(ObservableModes.Value));
                    else
                        newArr.push(item);
                }
                newValue = newArr;
            }
            newValue || (newValue = []);
            this.clear();
            _super.prototype.set.call(this, newValue);
            if (Observable.accessMode === ObservableModes.Raw) {
                return this;
            }
            for (var i in newValue)
                makeArrayItem(this, i);
            ;
            this.$_length = newValue.length;
            if (updateImmediately)
                this.update();
            return this;
        };
        ObservableArray.prototype.update = function () {
            if (!_super.prototype.update.call(this))
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
                        change.sender.notify(change);
                    case ChangeTypes.Push:
                        arr.push(change.value);
                        this.notify(change);
                        //if(change.cancel!==true && change.item) change.item.notify(change);
                        break;
                    case ChangeTypes.Pop:
                        arr.pop();
                        this.notify(change);
                        if (change.cancel !== true && change.item) {
                            change.sender = change.item;
                            change.item.notify(change);
                        }
                        break;
                    case ChangeTypes.Unshift:
                        arr.unshift(change.value);
                        this.notify(change);
                        break;
                    case ChangeTypes.Shift:
                        arr.shift();
                        this.notify(change);
                        if (change.cancel !== true && change.item) {
                            change.sender = change.item;
                            change.item.notify(change);
                        }
                        break;
                    case ChangeTypes.Item:
                        arr[change.index] = change.value;
                        this.notify(change);
                        if (change.cancel !== true) {
                            var itemEvts = {};
                            for (var n in change)
                                itemEvts[n] = change[n];
                            itemEvts.sender = change.item;
                            itemEvts.type = ChangeTypes.Value;
                            itemEvts.sender.notify(itemEvts);
                        }
                        break;
                }
            }
            return true;
        };
        ObservableArray = __decorate([
            implicit()
        ], ObservableArray);
        return ObservableArray;
    }(Observable));
    exports.ObservableArray = ObservableArray;
    function makeArrayItem(obArray, index) {
        obArray.$_itemSchema.$index = index;
        var item = new obArray.$_itemSchema.$ctor(obArray, index, undefined);
        item.$__obIndex__ = index;
        Object.defineProperty(obArray, index, { enumerable: true, configurable: true,
            get: function (mode) { return item.get(mode); },
            set: function (item_value) {
                (obArray.$_changes || (obArray.$_changes = [])).push({
                    sender: obArray,
                    type: ChangeTypes.Item,
                    index: index,
                    item: item,
                    value: item_value
                });
                item.set(item_value);
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
                return ob.get(param);
            },
            set: function (val) {
                var ob = this[private_prop_name];
                if (!ob)
                    Object.defineProperty(this, private_prop_name, {
                        enumerable: false, configurable: false, writable: false, value: ob = accessorFactory.call(this, target, name)
                    });
                return ob.set(val);
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
            implicit(this, {
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
                    this.asObject();
                    for (var n in initData) {
                        this.defineProp(n, initData[n]);
                    }
                }
                else if (t === "[object Array]") {
                    this.asArray();
                }
                else {
                    this.$type = DataTypes.Value;
                    this.$ctor = Observable;
                }
            }
        }
        ObservableSchema_1 = ObservableSchema;
        ObservableSchema.prototype.getFromRoot = function (root, mode) {
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
        ObservableSchema.prototype.asObject = function () {
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
        ObservableSchema.prototype.defineProp = function (propname, initValue) {
            if (this.$type !== DataTypes.Object)
                throw new Error("调用$defineProp之前，要首先调用$asObject");
            var propSchema = new ObservableSchema_1(initValue, propname, this);
            Object.defineProperty(this, propname, { enumerable: true, writable: false, configurable: false, value: propSchema });
            defineProp(this.$ctor.prototype, propname, function (owner, name) { return new propSchema.$ctor(this, name); });
            return propSchema;
        };
        ObservableSchema.prototype.asArray = function () {
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
        ObservableSchema.prototype.initObject = function (ob) {
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
        ObservableSchema.prototype.create = function (val) {
            return new this.$ctor(val);
        };
        var ObservableSchema_1;
        ObservableSchema.schemaToken = "$__ONLY_USED_BY_SCHEMA__";
        ObservableSchema = ObservableSchema_1 = __decorate([
            implicit()
        ], ObservableSchema);
        return ObservableSchema;
    }());
    exports.ObservableSchema = ObservableSchema;
    function observable(initData, index, subject) {
        var t = typeof initData;
        var ob;
        if (t === "object") {
            ob = new ObservableObject(initData);
            if (index) {
                ob.$__obIndex__ = index;
                ob.$target = initData;
            }
        }
        else {
            var schema = new ObservableSchema(initData);
            schema.$index = index;
            ob = schema.create(initData);
        }
        if (index) {
            Object.defineProperty(subject, index, { enumerable: true, configurable: false,
                get: function () {
                    return ob.get();
                },
                set: function (val) { return ob.set(val); }
            });
        }
        ob.$extras = subject;
        return ob;
    }
    exports.observable = observable;
    exports.DomUtility = {};
    exports.DomUtility.isElement = function (elem, includeText) {
        if (!elem)
            return false;
        if (!elem.insertBefore || !elem.ownerDocument)
            return false;
        return includeText ? true : elem.nodeType === 1;
    };
    exports.DomUtility.createElement = function (tag, attrs, parent, content) {
        var elem = document.createElement(tag);
        if (attrs)
            for (var n in attrs)
                elem.setAttribute(n, attrs[n]);
        if (parent)
            parent.appendChild(elem);
        if (content)
            elem.innerHTML = content;
        return elem;
    };
    exports.DomUtility.createText = function (txt, parent) {
        var node = document.createTextNode(txt);
        if (parent)
            parent.appendChild(node);
        return node;
    };
    exports.DomUtility.createPlaceholder = function () {
        var rs = document.createElement("span");
        rs.className = "YA-PLACEHOLDER";
        rs.style.display = "none";
        return rs;
    };
    exports.DomUtility.setContent = function (elem, content) {
        if (elem.nodeType === 1)
            elem.innerHTML = content;
        else
            elem.nodeValue = content;
        return exports.DomUtility;
    };
    exports.DomUtility.getContent = function (elem) {
        return elem.nodeType === 1 ? elem.innerHTML : elem.nodeValue;
    };
    exports.DomUtility.setAttribute = function (elem, name, value) {
        elem[name] = value;
        return exports.DomUtility;
    };
    exports.DomUtility.getAttribute = function (elem, name) {
        return elem.getAttribute(name);
    };
    exports.DomUtility.removeAttribute = function (elem, name) {
        elem.removeAttribute(name);
        return exports.DomUtility;
    };
    exports.DomUtility.setProperty = function (elem, name, value) {
        elem[name] = value;
        return exports.DomUtility;
    };
    exports.DomUtility.getProperty = function (elem, name) {
        return elem[name];
    };
    exports.DomUtility.appendChild = function (container, child) {
        container.appendChild(child);
        return exports.DomUtility;
    };
    exports.DomUtility.insertBefore = function (insert, rel) {
        if (rel.parentNode)
            rel.parentNode.insertBefore(insert, rel);
        return exports.DomUtility;
    };
    exports.DomUtility.insertAfter = function (insert, rel) {
        if (rel.parentNode)
            rel.parentNode.insertAfter(insert, rel);
        return exports.DomUtility;
    };
    exports.DomUtility.getParent = function (elem) { return elem.parentNode; };
    exports.DomUtility.remove = function (node) {
        if (node.parentNode)
            node.parentNode.removeChild(node);
        return exports.DomUtility;
    };
    exports.DomUtility.removeAllChildrens = function (elem) {
        elem.innerHTML = elem.nodeValue = "";
        return exports.DomUtility;
    };
    exports.DomUtility.getChildren = function (elem) { return elem.childNodes; };
    exports.DomUtility.show = function (elem, immeditately) {
        elem.style.display = "";
        return exports.DomUtility;
    };
    exports.DomUtility.hide = function (elem, immeditately) {
        elem.style.display = "none";
        return exports.DomUtility;
    };
    exports.DomUtility.attach = function (elem, evtname, handler) {
        if (elem.addEventListener)
            elem.addEventListener(evtname, handler, false);
        else if (elem.attachEvent)
            elem.attachEvent('on' + evtname, handler);
        else
            elem['on' + evtname] = handler;
        return exports.DomUtility;
    };
    exports.DomUtility.detech = function (elem, evtname, handler) {
        if (elem.removeEventListener)
            elem.removeEventListener(evtname, handler, false);
        else if (elem.detechEvent)
            elem.detechEvent('on' + evtname, handler);
        else
            elem['on' + evtname] = null;
        return exports.DomUtility;
    };
    exports.DomUtility.is_inDocument = function (elem) {
        var doc = elem.ownerDocument;
        while (elem) {
            elem = elem.parentNode;
            if (elem === doc || elem === doc.body)
                break;
        }
        if (!elem)
            return false;
        return true;
    };
    try {
        var element_wrapper_1 = exports.DomUtility.createElement("div");
        if (element_wrapper_1.currentStyle) {
            exports.DomUtility.getStyle = function (node, name) { return node.currentStyle[name]; };
        }
        else {
            exports.DomUtility.getStyle = function (node, name) { return getComputedStyle(node, false)[name]; };
        }
        exports.DomUtility.setStyle = function (node, name, value) {
            var convertor = exports.styleConvertors[name];
            node.style[name] = convertor ? convertor(value) : value;
            return exports.DomUtility;
        };
        exports.DomUtility.parse = function (domString) {
            element_wrapper_1.innerHTML = domString;
            return element_wrapper_1.childNodes;
        };
    }
    catch (ex) { }
    var emptyStringRegx = /\s+/g;
    function findClassAt(clsnames, cls) {
        var at = clsnames.indexOf(cls);
        var len = cls.length;
        while (at >= 0) {
            if (at > 0) {
                var prev = clsnames[at - 1];
                if (!emptyStringRegx.test(prev)) {
                    at = clsnames.indexOf(cls, at + len);
                    continue;
                }
            }
            if ((at + len) !== clsnames.length) {
                var next = clsnames[at + length];
                if (!emptyStringRegx.test(next)) {
                    at = clsnames.indexOf(cls, at + len);
                    continue;
                }
            }
            return at;
        }
        return at;
    }
    exports.DomUtility.hasClass = function (node, cls) {
        return findClassAt(node.className, cls) >= 0;
    };
    exports.DomUtility.addClass = function (node, cls) {
        if (findClassAt(node.className, cls) >= 0)
            return exports.DomUtility;
        node.className += " " + cls;
        return exports.DomUtility;
    };
    exports.DomUtility.removeClass = function (node, cls) {
        var clsnames = node.className;
        var at = findClassAt(clsnames, cls);
        if (at <= 0)
            return exports.DomUtility;
        var prev = clsnames.substring(0, at);
        var next = clsnames.substr(at + cls.length);
        node.className = prev.replace(/(\s+$)/g, "") + " " + next.replace(/(^\s+)/g, "");
    };
    exports.DomUtility.replaceClass = function (node, old_cls, new_cls, alwaysAdd) {
        if ((old_cls === "" || old_cls === undefined || old_cls === null) && alwaysAdd)
            return _this.addClass(new_cls);
        var clsnames = node.className;
        var at = findClassAt(clsnames, old_cls);
        if (at <= 0) {
            if (alwaysAdd)
                node.className = clsnames + " " + new_cls;
            return exports.DomUtility;
        }
        var prev = clsnames.substring(0, at);
        var next = clsnames.substr(at + old_cls.length);
        node.className = prev + new_cls + next;
        return exports.DomUtility;
    };
    var JSXModes;
    (function (JSXModes) {
        JSXModes[JSXModes["vnode"] = 0] = "vnode";
        JSXModes[JSXModes["dnode"] = 1] = "dnode";
    })(JSXModes = exports.JSXModes || (exports.JSXModes = {}));
    var _jsxMode = JSXModes.dnode;
    function jsxMode(mode, statement) {
        var old = _jsxMode;
        try {
            _jsxMode = mode;
            return statement();
        }
        finally {
            _jsxMode = old;
        }
    }
    exports.jsxMode = jsxMode;
    function internalCreateElement(tag, attrs) {
        if (tag === undefined || tag === null || tag === "")
            return;
        var t = typeof tag;
        var descriptor;
        if (t === "string") {
            //构建descriptor
            descriptor = attrs || {};
            descriptor.tag = tag;
            var children = [];
            for (var i = 2, j = arguments.length; i < j; i++) {
                children.push(arguments[i]);
            }
            descriptor.children = children;
            //是否有注册的组件
            var componentType = exports.componentTypes[tag];
            if (componentType) {
                descriptor.tag = componentType;
                //如果要求返回vnode，就直接返回descriptor;
                if (_jsxMode === JSXModes.vnode) {
                    return descriptor;
                }
                //如果直接调用createElement来生成控件，要求vnode里面不能延迟绑(descriptor里面不能有schema,因为它不知道viewmodel到底是那一个)。
                var elems = createComponentElements(componentType, descriptor, null);
                return elems;
            }
            else {
                if (_jsxMode === JSXModes.vnode) {
                    return descriptor;
                }
                return createDomElement(descriptor, null, null);
            }
        }
        else if (t === "function") {
            descriptor = attrs || {};
            descriptor.tag = tag;
            var children = [];
            for (var i = 2, j = arguments.length; i < j; i++) {
                children.push(arguments[i]);
            }
            descriptor.children = children;
            if (_jsxMode === JSXModes.vnode)
                return descriptor;
            return createComponentElements(descriptor.tag, descriptor, null);
        }
        else if (t === "object") {
            var container = void 0;
            if (exports.DomUtility.isElement(attrs)) {
                container = attrs;
            }
            if (is_array(tag)) {
                return createElements(tag, container);
            }
            descriptor = tag;
            var elem_1;
            //没有tag，就是文本
            if (!descriptor.tag) {
                if (descriptor.content instanceof Observable) {
                    var ob = descriptor.content;
                    elem_1 = exports.DomUtility.createText(ob.get(ObservableModes.Value));
                    descriptor.content.subscribe(function (e) { return exports.DomUtility.setContent(elem_1, e.value); }, ob.$root.$extras);
                }
                else {
                    elem_1 = exports.DomUtility.createText(descriptor.content);
                }
                if (container)
                    exports.DomUtility.appendChild(container, elem_1);
                return elem_1;
            }
            else {
                var t_1 = typeof descriptor.tag;
                if (t_1 === "string") {
                    var componentType = exports.componentTypes[descriptor.tag];
                    if (componentType) {
                        descriptor.tag = componentType;
                        t_1 = "function";
                    }
                    else {
                        elem_1 = createDomElement(descriptor, null, null);
                        if (container)
                            exports.DomUtility.appendChild(container, elem_1);
                        return elem_1;
                    }
                }
                if (t_1 === "function") {
                    var elems = createComponentElements(descriptor.tag, descriptor, container);
                    if (container) {
                        if (exports.DomUtility.isElement(elems))
                            exports.DomUtility.appendChild(container, elems);
                        else {
                            for (var _i = 0, _a = elems; _i < _a.length; _i++) {
                                var elem_2 = _a[_i];
                                exports.DomUtility.appendChild(container, elem_2);
                            }
                        }
                    }
                    return elems;
                }
                throw new Error("参数错误");
            }
        }
        else {
            throw new Error("不正确的参数");
        }
    }
    exports.createElement = internalCreateElement;
    function createElements(arr, container) {
        var rs = [];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var child = arr_1[_i];
            var ct = typeof child;
            if (ct === "string") {
                var elem = exports.DomUtility.createText(child);
                if (container)
                    exports.DomUtility.appendChild(container, elem);
                rs.push(elem);
            }
            else if (ct === "object") {
                if (child instanceof Observable)
                    (function (child, rs) {
                        var elem = exports.DomUtility.createText(child.get(ObservableModes.Value), container);
                        child.subscribe(function (e) { return exports.DomUtility.setContent(elem, e.value); }, child.$root.$extras);
                        if (container)
                            exports.DomUtility.appendChild(container, elem);
                        rs.push(elem);
                    })(child, rs);
                else if (exports.DomUtility.isElement(child, true)) {
                    var elem = child;
                    if (container)
                        exports.DomUtility.appendChild(container, elem);
                    rs.push(elem);
                }
                else if (is_array(child)) {
                    var arr_3 = createElements(child, container);
                    for (var _a = 0, arr_2 = arr_3; _a < arr_2.length; _a++) {
                        var arrItem = arr_2[_a];
                        rs.push(arrItem);
                    }
                }
                else {
                    var sub = exports.createElement(child);
                    if (exports.DomUtility.isElement(sub)) {
                        if (container)
                            exports.DomUtility.appendChild(container, sub);
                        rs.push(sub);
                    }
                    else {
                        for (var _b = 0, sub_1 = sub; _b < sub_1.length; _b++) {
                            var item = sub_1[_b];
                            if (container)
                                exports.DomUtility.appendChild(container, item);
                            rs.push(item);
                        }
                    }
                }
            }
            else {
                console.warn("\u4E0D\u6070\u5F53\u7684\u53C2\u6570\uFF0C\u5FFD\u7565", child);
            }
        }
        return rs;
    }
    exports.createElements = createElements;
    function createDomElement(descriptor, parent, compInstance) {
        var elem = exports.DomUtility.createElement(descriptor.tag);
        if (parent)
            exports.DomUtility.appendChild(parent, elem);
        var ignoreChildren = false;
        //let anchorElem = elem;
        for (var attrName in descriptor) {
            //不处理有特殊含义的属性
            if (attrName === "tag" || attrName === "children" || attrName === "content")
                continue;
            var attrValue = descriptor[attrName];
            if (attrName === "class")
                attrName = "className";
            if (bindDomAttr(elem, attrName, attrValue, compInstance) === RenderDirectives.IgnoreChildren)
                ignoreChildren = true;
        }
        if (ignoreChildren)
            return elem;
        if (descriptor.content) {
            if (descriptor.content instanceof Observable) {
                var ob = descriptor.content;
                var txtElem_1 = exports.DomUtility.createText(ob.get(ObservableModes.Value), elem);
                ob.subscribe(function (e) { return exports.DomUtility.setContent(txtElem_1, e.value); }, ob.$root.$extras);
            }
            else {
                var txtElem = exports.DomUtility.createText(descriptor.content, elem);
            }
        }
        var children = descriptor.children;
        if (!children || children.length === 0)
            return elem;
        createElements(children, elem);
        return elem;
    }
    //把属性绑定到element上
    function bindDomAttr(element, attrName, attrValue, compInstance) {
        var match = attrName.match(evtnameRegx);
        if (match && element[attrName] !== undefined && typeof attrValue === "function") {
            var evtName = match[1];
            //DomUtility.attach(element,evtName,makeAction(null,attrValue));
            exports.DomUtility.attach(element, evtName, attrValue);
            return;
        }
        var binder = exports.attrBinders[attrName];
        var bindResult;
        //计算表达式
        if (attrValue && attrValue.lamda && typeof attrValue.lamda === "function") {
            if (binder) {
                bindComputedExpression(attrValue, compInstance, function (val) { return binder.call(component, element, val, compInstance); });
            }
            else {
                bindComputedExpression(attrValue, compInstance, function (val) { return exports.DomUtility.setAttribute(element, attrName, val); });
            }
        }
        else {
            if (binder)
                bindResult = binder.call(component, element, attrValue, compInstance);
            else if (attrValue instanceof Observable) {
                exports.DomUtility.setAttribute(element, attrName, attrValue.get(ObservableModes.Value));
                attrValue.subscribe(function (e) { return exports.DomUtility.setAttribute(element, attrName, e.value); }, compInstance);
            }
            else
                exports.DomUtility.setAttribute(element, attrName, attrValue);
        }
        return bindResult;
    }
    exports.bindDomAttr = bindDomAttr;
    function createComponentElements(componentType, descriptor, container) {
        //获取到vnode，attr-value得到的应该是schema
        var compInstance;
        var renderResult;
        var renderFn = componentType;
        var xmode = _jsxMode;
        var omode = Observable.accessMode;
        try {
            _jsxMode = JSXModes.vnode;
            Observable.accessMode = ObservableModes.Observable;
            compInstance = new componentType(descriptor, container);
            // object-component
            if (typeof compInstance.render === 'function') {
                //绑定属性
                for (var propname in descriptor) {
                    if (propname === "tag" || propname === "children")
                        continue;
                    bindComponentAttr(compInstance, propname, descriptor[propname]);
                }
                ;
                renderFn = compInstance.render;
                _jsxMode = JSXModes.vnode;
                Observable.accessMode = ObservableModes.Observable;
                renderResult = renderFn.call(compInstance, container, descriptor);
            }
            else {
                renderResult = compInstance;
                compInstance = undefined;
            }
        }
        finally {
            _jsxMode = xmode;
            Observable.accessMode = omode;
        }
        return handleRenderResult(renderResult, compInstance, renderFn, descriptor, container);
    }
    /**
     *
     *
     * @param {IViewModel} viewModel
     * @param {IComponent} subComponent
     * @param {string} subAttrName
     * @param {*} bindValue
     */
    function bindComponentAttr(compInstance, propName, propValue) {
        //找到组件的属性
        var prop = compInstance[propName];
        // TODO:找到组件名
        var componentName = "Component";
        if (prop) {
            if (prop instanceof Observable) {
                var meta = compInstance.$meta || {};
                //获取属性的类型
                var propType = meta.reactives ? meta.reactives[propName].type : ReactiveTypes.In;
                var isOb = propValue instanceof Observable;
                if (propType === ReactiveTypes.In) {
                    if (isOb)
                        prop.set(propValue.get(ObservableModes.Value));
                    else
                        prop.set(propValue);
                }
                else if (propType == ReactiveTypes.Out) {
                    if (isOb) {
                        prop.subscribe(function (e) {
                            propValue.set(e.value);
                            propValue.update();
                        }, propValue.$root.$extras);
                    }
                    else {
                        console.warn(propValue + "传入的不是observable,out未能绑定，不能联动");
                    }
                }
                else if (propType == ReactiveTypes.Parameter) {
                    if (isOb) {
                        prop.subscribe(function (e) {
                            propValue.set(e.value);
                            propValue.update();
                        }, propValue.$root.$extras);
                        propValue.subscribe(function (e) {
                            prop.set(e.value);
                            prop.update();
                        }, prop.$root.$extras);
                        prop.set(propValue.get(ObservableModes.Value));
                    }
                    else {
                        prop.set(propValue);
                        console.warn(propValue + "传入的不是observable,paremeter未能绑定，不能联动");
                    }
                }
                else {
                    console.warn(propName + "\u662F\u79C1\u6709\u7C7B\u578B,\u5916\u90E8\u4F20\u5165\u7684\u672A\u8D4B\u503C");
                }
            }
            else {
                if (propValue instanceof Observable) {
                    compInstance[propName] = propValue.get(ObservableModes.Value);
                    propValue.subscribe(function (e) { return compInstance[propName] = e.value; }, compInstance);
                }
                else {
                    compInstance[propName] = propValue;
                }
            }
        }
    }
    function handleRenderResult(renderResult, instance, renderFn, descriptor, container) {
        var isArray = is_array(renderResult);
        var resultIsElement = false;
        if (isArray) {
            for (var _i = 0, renderResult_1 = renderResult; _i < renderResult_1.length; _i++) {
                var val = renderResult_1[_i];
                resultIsElement = exports.DomUtility.isElement(renderResult, true);
                break;
            }
            isArray = true;
        }
        else {
            resultIsElement = exports.DomUtility.isElement(renderResult, true);
        }
        if (resultIsElement) {
            if (container) {
                if (isArray)
                    for (var _a = 0, renderResult_2 = renderResult; _a < renderResult_2.length; _a++) {
                        var elem = renderResult_2[_a];
                        exports.DomUtility.appendChild(container, elem);
                    }
                else
                    exports.DomUtility.appendChild(container, renderResult);
            }
            return renderResult;
        }
        else {
            var renderNode = renderResult;
            if (isArray) {
                var result = [];
                for (var _b = 0, renderNode_1 = renderNode; _b < renderNode_1.length; _b++) {
                    var vnode = renderNode_1[_b];
                    var elem = exports.createElement(vnode, container);
                    //if(container) DomUtility.appendChild(container,elem);
                    result.push(elem);
                }
                renderResult = result;
            }
            else {
                renderResult = exports.createElement(renderNode, container);
            }
            return renderResult;
        }
    }
    function getComputedValue(expr, compInstance) {
        var args = [];
        for (var _i = 0, _a = expr.parameters; _i < _a.length; _i++) {
            var dep = _a[_i];
            var ob = void 0;
            if (dep instanceof Observable)
                ob = dep;
            if (ob)
                args.push(ob.get(ObservableModes.Value));
            else
                args.push(dep);
        }
        return expr.lamda.apply(compInstance, args);
    }
    function bindComputedExpression(expr, instance, setter) {
        for (var _i = 0, _a = expr.parameters; _i < _a.length; _i++) {
            var ob = _a[_i];
            if (ob)
                ob.subscribe(function (e) {
                    setter(getComputedValue(expr, instance));
                }, instance);
        }
    }
    function makeExpr() {
        var expr = { lamda: arguments[arguments.length - 1], parameters: [] };
        for (var i = 0, j = arguments.length - 2; i < j; i++)
            expr.parameters.push(arguments[i]);
        return expr;
    }
    exports.EXP = makeExpr;
    function NOT(param) {
        var expr = { lamda: function (val) { return !param; }, parameters: [] };
        expr.parameters.push(param);
        return expr;
    }
    exports.NOT = NOT;
    var evtnameRegx = /on([a-zA-Z_][a-zA-Z0-9_]*)/;
    function makeAction(component, method) {
        return function () {
            var rs = method.apply(component, arguments);
            var amode = Observable.accessMode;
            Observable.accessMode = ObservableModes.Observable;
            var reactives = [];
            try {
                for (var n in component) {
                    var prop = component[n];
                    if (prop instanceof Observable) {
                        prop.update();
                    }
                }
            }
            finally {
                Observable.accessMode = amode;
            }
            return rs;
        };
    }
    function makeRender(compInstance, rawRender, fnName, isArray) {
        var renderWapper;
        if (isArray) {
            renderWapper = function (container, descriptor) {
                var nodes = rawRender.call(this, container, descriptor);
                return createElements(nodes, container);
            };
        }
        else {
            renderWapper = function (container, descriptor) {
                var node = rawRender.call(this, container, descriptor);
                return exports.createElement(node, container);
            };
        }
        var des = { enumerable: false, writable: true, configurable: false, value: renderWapper };
        Object.defineProperty(rawRender, "$__renderWrappedFn__", des);
        compInstance[fnName] = renderWapper;
        compInstance.constructor.prototype[fnName] = renderWapper;
        des.value = rawRender;
        Object.defineProperty(rawRender, "$__renderRawFn__", des);
        return renderWapper;
    }
    //=======================================================================
    var ReactiveTypes;
    (function (ReactiveTypes) {
        ReactiveTypes[ReactiveTypes["None"] = 0] = "None";
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
    exports.componentTypes = {};
    function inherits(extendCls, basCls) {
        function __() { this.constructor = extendCls; }
        extendCls.prototype = basCls === null ? Object.create(basCls) : (__.prototype = basCls.prototype, new __());
    }
    /**
     * 它有2种用法，
     *
     * @export
     * @param {(string|{new(...args:any[]):IComponent}|boolean|Function)} tag
     * @param {({new(...args:any[]):IComponent}|boolean|Function)} [ComponentType]
     * @returns {*}
     */
    function component(tag, ComponentType) {
        var makeComponent = function (componentCtor) {
            var meta = metaInfo(componentCtor.prototype);
            var _Component = function () {
                var ret = componentCtor.apply(this, arguments);
                //如果类型信息没有初始化，就在第一次运行时做初始化
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
            //Object.defineProperty(componentCtor.prototype,"$meta",metaDesc);
            meta.ctor = componentCtor;
            meta.wrapper = _Component;
            if (typeof ComponentType === "boolean")
                meta.explicitMode = ComponentType;
            if (tag) {
                meta.tag = tag;
                exports.componentTypes[tag] = meta.wrapper;
            }
            return _Component;
        };
        var t = typeof tag;
        if (t === "function" || t === "boolean") {
            ComponentType = tag;
            tag = "";
        }
        if (ComponentType !== undefined && ComponentType !== true && ComponentType !== false) {
            var wrapped = makeComponent(ComponentType);
            return attachManualAPI(wrapped);
        }
        else
            return makeComponent;
    }
    exports.component = component;
    function attachManualAPI(componentType) {
        implicit(componentType, "create", function () { return new componentType(); });
        implicit(componentType, "render", function (container) { return new componentType().render(container); });
        return componentType;
    }
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
            if (stateInfo.type === ReactiveTypes.None)
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
        if (!meta.templates["render"] && firstComponent.render) {
            initTemplate(firstComponent, { name: "render" });
        }
        if (!meta.ctor.prototype.dispose) {
            Disposable.call(meta.ctor.prototype);
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
                return ob.get();
            },
            set: function (val) {
                var states = this.$reactives || (this.$reactives = {});
                var ob = states[stateInfo.name];
                if (val && val.get)
                    val = val.get(ObservableModes.Value);
                if (ob)
                    ob.set(val);
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
                return ob ? ob.get() : undefined;
            },
            set: function (val) {
                var states = firstComponent.$reactives || (firstComponent.$reactives = {});
                if (val instanceof Observable) {
                    states[stateInfo.name] = val;
                    return;
                }
                var ob = states[stateInfo.name] = new stateInfo.schema.$ctor(val);
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
                if (exports.DomUtility.isElement(vnode)) {
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
    ///组件的垃圾释放机制
    var ComponentGarbage = /** @class */ (function () {
        function ComponentGarbage() {
            var _this = this;
            if (ComponentGarbage.singleon !== undefined) {
                throw new Error("ComponentGarbage只能单例运行");
            }
            ComponentGarbage.singleon = this;
            this._toBeChecks = [];
            var clear = function () {
                clearGarbage(_this._toBeChecks, ComponentGarbage.periodicClearCount);
                _this._tick = setTimeout(clear, ComponentGarbage.interval);
            };
            this._tick = setTimeout(clear, ComponentGarbage.interval);
        }
        /**
         * 所有render过的组件都应该调用该函数
         *
         * @type {IComponent[]}
         * @memberof ComponentGarbageDisposer
         */
        ComponentGarbage.prototype.attech = function (compoent) {
            //没有dispose函数的进到垃圾释放器里面来也没用，反而占内存
            //已经释放掉的也不用进来了
            if (compoent.dispose && !compoent.$isDisposed)
                this._toBeChecks.push(compoent);
            return this;
        };
        /**
         * 如果写了参数compoent,就是要手动把某个组件从垃圾回收中，要从垃圾释放器中移除掉
         * 如果不写参数，表示执行释放任务
         * @param {IComponent} component
         * @returns {ComponentAutoDisposer}
         * @memberof ComponentGarbageDisposer
         */
        ComponentGarbage.prototype.detech = function (component) {
            for (var i = 0, j = this._toBeChecks.length; i < j; i++) {
                var existed = this._toBeChecks.shift();
                // 如果相等或则已经dispose掉了，就不再进入队列了
                if (existed === component || existed.$isDisposed)
                    continue;
                this._toBeChecks.push(existed);
            }
            return this;
        };
        /**
         * 手动释放垃圾
         *
         * @returns {ComponentAutoDisposer}
         * @memberof ComponentAutoDisposer
         */
        ComponentGarbage.prototype.clear = function () {
            clearGarbage(this._toBeChecks, this._toBeChecks.length);
            return this;
        };
        ComponentGarbage.interval = 1000 * 30;
        ComponentGarbage.periodicClearCount = 200;
        return ComponentGarbage;
    }());
    exports.ComponentGarbage = ComponentGarbage;
    ComponentGarbage.singleon = new ComponentGarbage();
    function clearGarbage(components, count) {
        for (var i = 0, j = Math.min(count, components.length); i < j; i++) {
            var existed = components.shift();
            // 如果相等或则已经dispose掉了，就不再进入队列了
            if (existed.$isDisposed) {
                continue;
            }
            //垃圾判定
            if (!checkGarbage(existed)) {
                components.push(existed);
                continue;
            }
            if (typeof existed.deteching === "function" && existed.deteching() === false) {
                components.push(existed);
                continue;
            }
            if (typeof existed.dispose === "function") {
                existed.dispose(false);
            }
        }
        return count;
    }
    function checkGarbage(comp) {
        if (!comp || !comp.$__elements__)
            return true;
        if (exports.DomUtility.isElement(comp.$__elements__, true)) {
            if (exports.DomUtility.is_inDocument(comp.$__elements__))
                return false;
            else if (comp.$__placeholder__ && exports.DomUtility.is_inDocument(comp.$__placeholder__))
                return false;
            return true;
        }
        else if (comp.$__elements__.length) {
            for (var i = 0, j = comp.$__elements__.length; i < j; i++) {
                if (exports.DomUtility.is_inDocument(comp.$__elements__[i]))
                    return false;
                else if (comp.$__placeholder__ && exports.DomUtility.is_inDocument(comp.$__placeholder__))
                    return false;
            }
            return true;
        }
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
            if (tag && tag.prototype) {
                vnode = new VirtualComponentNode(tag.prototype.$meta, attrs);
            }
            else {
                var componentInfo = exports.componentTypes[tag];
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
                var ob = this.content.getFromRoot(component);
                elem = exports.DomUtility.createText(ob.get());
                ob.subscribe(function (e) {
                    elem.nodeValue = e.value;
                });
            }
            else {
                elem = exports.DomUtility.createText(this.content);
            }
            if (container)
                exports.DomUtility.appendChild(container, elem);
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
            var elem = exports.DomUtility.createElement(this.tag);
            var ignoreChildren = false;
            if (container)
                exports.DomUtility.appendChild(container, elem);
            var anchorElem = elem;
            for (var attrName in this.attrs) {
                var attrValue = this.attrs[attrName];
                var match = attrName.match(evtnameRegx);
                if (match && elem[attrName] !== undefined && typeof attrValue === "function") {
                    var evtName = match[1];
                    exports.DomUtility.attach(elem, evtName, makeAction(component, attrValue));
                    continue;
                }
                var binder = exports.attrBinders[attrName];
                var bindResult = void 0;
                if (attrValue instanceof ObservableSchema) {
                    if (binder)
                        bindResult = binder.call(component, elem, attrValue, component, this);
                    else
                        (function (name, attrValue) {
                            var ob = attrValue.getFromRoot(component);
                            exports.DomUtility.setAttribute(elem, name, ob.get(ObservableModes.Raw));
                            ob.subscribe(function (e) {
                                exports.DomUtility.setAttribute(elem, name, e.value);
                            });
                        })(attrName, attrValue);
                }
                else {
                    if (binder)
                        bindResult = binder.call(component, elem, attrValue, component, this);
                    else
                        exports.DomUtility.setAttribute(elem, attrName, attrValue);
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
            var _a;
            var _this = _super.call(this) || this;
            _this.attrs = attrs;
            var t = typeof tag;
            if (t === "function") {
                _this.meta = tag.prototype.$meta;
                _this.tag = _this.meta.tag;
            }
            else if (t === "object") {
                _this.meta = tag;
            }
            else if (t === "string") {
                _this.tag = tag;
                _this.meta = (_a = exports.componentTypes[_this.tag]) === null || _a === void 0 ? void 0 : _a.$meta;
                if (!_this.meta)
                    throw new Error("似乎不是component");
            }
            else {
                throw new Error("Invalid arguments");
            }
            return _this;
        }
        VirtualComponentNode.prototype.render = function (component, container) {
            var subComponent = createComponent(this.meta);
            for (var subAttrName in this.attrs) {
                bindComponentAttr(subComponent, subAttrName, this.attrs[subAttrName]);
            }
            ;
            var subMeta = subComponent.$meta;
            var subNodes = [];
            for (var n in subMeta.templates) {
                var tpl = subMeta.templates[n];
                var elems = subComponent[tpl.name].call(subComponent, container);
                if (elems) {
                    if (exports.DomUtility.isElement(elems)) {
                        elems.$_YA_COMPONENT = subComponent;
                        subNodes.push(elems);
                    }
                    else if (is_array(elems)) {
                        for (var i = 0, j = elems.length; i < j; i++) {
                            var el = elems[i];
                            el.$_YA_COMPONENT = subComponent;
                            subNodes.push(el);
                        }
                    }
                }
                return subNodes;
            }
        };
        return VirtualComponentNode;
    }(VirtualNode));
    exports.VirtualComponentNode = VirtualComponentNode;
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
    exports.attrBinders = {};
    exports.attrBinders.for = function bindFor(elem, bindValue, component, vnode, ignoreAddRel) {
        var each = bindValue[0];
        var value = bindValue[1];
        var key = bindValue[2];
        if (each instanceof ObservableSchema) {
            each = each.getFromRoot(component);
            if (!ignoreAddRel)
                addRelElements(each, elem);
            each.subscribe(function (e) {
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
            var item = each[k];
            var obItem = setIterator(component, value, item);
            for (var i in vnode.children) {
                var childElements = vnode.children[i].render(component, elem);
                addRelElements(obItem, childElements);
                obItem.subscribe(function (e) {
                    if (e.type === ChangeTypes.Remove) {
                        var obItem_1 = e.sender;
                        var nodes = getRelElements(obItem_1);
                        for (var i_1 in nodes) {
                            var node = nodes[i_1];
                            if (node.parentNode)
                                node.parentNode.removeChild(node);
                            if (node.$_YA_COMPONENT) {
                                if (!node.$_YA_COMPONENT.$isDisposed) {
                                    node.$_YA_COMPONENT.dispose();
                                }
                                node.$_YA_COMPONENT = undefined;
                            }
                        }
                    }
                });
            }
        }
        return RenderDirectives.IgnoreChildren;
    };
    exports.attrBinders.if = function bindIf(elem, bindValue, component, vnode) {
        if (bindValue instanceof ObservableSchema) {
            var ob = bindValue.getFromRoot(component);
            var placeholder_1 = exports.DomUtility.createPlaceholder();
            var isElementInContainer_1 = ob.get();
            if (!isElementInContainer_1) {
                var p = exports.DomUtility.getParent(elem);
                if (p) {
                    exports.DomUtility.insertBefore(placeholder_1, elem);
                    exports.DomUtility.remove(elem);
                }
                else
                    exports.DomUtility.hide(elem);
            }
            ob.subscribe(function (e) {
                if (e.value) {
                    if (!isElementInContainer_1) {
                        var p = exports.DomUtility.getParent(placeholder_1);
                        if (p) {
                            exports.DomUtility.insertBefore(elem, placeholder_1);
                            exports.DomUtility.remove(placeholder_1);
                            isElementInContainer_1 = true;
                        }
                    }
                }
                else {
                    if (isElementInContainer_1) {
                        var p = exports.DomUtility.getParent(elem);
                        if (p) {
                            exports.DomUtility.insertBefore(placeholder_1, elem);
                            exports.DomUtility.remove(elem);
                            isElementInContainer_1 = false;
                        }
                        else
                            exports.DomUtility.hide(elem);
                    }
                }
            });
        }
        else {
            if (!bindValue) {
                var p = exports.DomUtility.getParent(elem);
                if (p)
                    exports.DomUtility.remove(elem);
            }
        }
    };
    exports.attrBinders.style = function bindStyle(elem, bindValue, component) {
        var t = typeof bindValue;
        if (t === "string") {
            elem.style.cssText = bindValue;
            return;
        }
        if (t !== "object") {
            console.warn("错误的绑定了style属性，必须是string/object");
            return;
        }
        if (bindValue instanceof ObservableSchema) {
            var ob = bindValue.getFromRoot(component);
            var val = ob.get(ObservableModes.Value);
            if (typeof val === "string")
                elem.style.cssText = val;
            else {
                for (var n in val) {
                    var convertor = exports.styleConvertors[n];
                    elem.style[n] = convertor ? convertor(val[n]) : val[n];
                }
            }
            ob.subscribe(function (e) {
                var val = e.value;
                if (typeof val === "string")
                    elem.style.cssText = val;
                else {
                    for (var n in val) {
                        var convertor = exports.styleConvertors[n];
                        elem.style[n] = convertor ? convertor(val[n]) : val[n];
                    }
                }
            });
        }
        for (var styleName in bindValue)
            (function (styleName, subValue, elem, component) {
                var ob;
                var styleValue;
                var convertor = exports.styleConvertors[styleName];
                if (subValue instanceof Observable) {
                    ob = subValue;
                    styleValue = ob.get();
                }
                else if (subValue instanceof ObservableSchema) {
                    ob = subValue.getFromRoot(component);
                    styleValue = ob.get();
                }
                else
                    styleValue = subValue;
                elem.style[styleName] = convertor ? convertor(styleValue) : styleValue;
                if (ob) {
                    addRelElements(ob, elem);
                    ob.subscribe(function (e) {
                        elem.style[styleName] = convertor ? convertor(e.value) : e.value;
                    });
                }
            })(styleName, bindValue[styleName], elem, component);
    };
    exports.styleConvertors = {};
    var unitRegx = /(\d+(?:.\d+))(px|em|pt|in|cm|mm|pc|ch|vw|vh|\%)/g;
    exports.styleConvertors.left = exports.styleConvertors.right = exports.styleConvertors.top = exports.styleConvertors.bottom = exports.styleConvertors.width = exports.styleConvertors.height = function (value) {
        if (!value)
            return "0";
        if (typeof value === "number") {
            return value + "px";
        }
        else
            return value;
    };
    //======================================================================
    function THIS(obj, name) {
        var method = name;
        var rpc = false;
        if (typeof name === "string") {
            method = obj[name];
            rpc = true;
        }
        var fn = function () { return method.apply(obj, arguments); };
        if (rpc)
            obj[name] = fn;
        return fn;
    }
    exports.THIS = THIS;
    //=======================================================================
    //=======================================================================
    function queryString(str) {
        var at = str.indexOf("#");
        if (at >= 0)
            str = str.substr(0, at - 1);
        var pairs = str.split('&');
        var rs = {};
        for (var i in pairs) {
            var pair = pairs[i].split("=");
            rs[pair[0]] = pair[1];
        }
        return rs;
    }
    exports.queryString = queryString;
    //=======================================================================
    var YA = {
        Subject: Subject, Disposable: Disposable, ObservableModes: ObservableModes, observableMode: observableMode, proxyMode: proxyMode, Observable: Observable, ObservableObject: ObservableObject, ObservableArray: ObservableArray, ObservableSchema: ObservableSchema,
        createElement: exports.createElement,
        component: component, state: reactive, IN: IN, OUT: OUT, PARAM: PARAM, template: template, attrBinders: exports.attrBinders, componentInfos: exports.componentTypes,
        VirtualNode: VirtualNode, VirtualTextNode: VirtualTextNode, VirtualElementNode: VirtualElementNode, VirtualComponentNode: VirtualComponentNode, virtualNode: exports.virtualNode, NOT: NOT, EXP: exports.EXP,
        DomUtility: exports.DomUtility, styleConvertors: exports.styleConvertors,
        intimate: implicit, clone: clone, Promise: Promise
    };
    if (typeof window !== 'undefined')
        window.YA = YA;
    exports.default = YA;
});
//# sourceMappingURL=YA.core-00.02.js.map