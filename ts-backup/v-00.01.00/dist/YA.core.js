////////////////////////////////////////////////////////////////////
//
// 语言机制与一些对象上的扩展
//
////////////////////////////////////////////////////////////////////
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
    function abstract() {
        return function (proto, name) {
            var method = proto[name];
            if (method)
                Object.defineProperty(method, "$__abstract__", { enumerable: false, writable: false, configurable: false, value: true });
        };
    }
    exports.abstract = abstract;
    function defineSingleonProperty(target, name, getter) {
        if (typeof name === "object") {
            for (var n in name) {
                defineSingleonProperty(target, n, name[n]);
            }
            return;
        }
        var privateName = "$YA__" + name + "__";
        Object.defineProperty(target, name, { configurable: false, get: function () {
                if (this[privateName] === undefined) {
                    Object.defineProperty(target, privateName, { configurable: false, enumerable: false, writable: false, value: getter(this) });
                }
                return this[privateName];
            } });
    }
    exports.defineSingleonProperty = defineSingleonProperty;
    ;
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
        if (!obj)
            return true;
        var t = typeof obj;
        if (t === "function" || t === "number" || t === "boolean")
            return false;
        for (var n in obj)
            return false;
        return true;
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
        return text.toString().replace(trimreg, "");
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
    function array_remove(arr, item) {
        var hasItem = false;
        for (var i = 0, j = arr.length; i < j; i++) {
            var existed = arr.shift();
            if (existed !== item)
                arr.push(existed);
            else
                hasItem = true;
        }
        return hasItem;
    }
    exports.array_remove = array_remove;
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
            if (arguments.length > 2) {
                var datas_1 = [];
                for (var i = 1, j = arguments.length; i < j; i++) {
                    datas_1.push(arguments[i]);
                }
                data = function (path) {
                    var dpath = DPath.fetch(path);
                    for (var i = 1, j = datas_1.length; i < j; i++) {
                        var value = dpath.getValue(datas_1[i]);
                        if (value !== undefined)
                            return value;
                    }
                    return undefined;
                };
            }
            if (data) {
                if (typeof data === "function") {
                    return template.replace(replaceByDataRegx, (function (match) {
                        return data(match);
                    }));
                }
                else {
                    return template.replace(replaceByDataRegx, (function (match) {
                        return DPath.getValue(data, match);
                    }));
                }
            }
            else
                return template;
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
    var _cid = 0;
    /**
     * 获取一个全局唯一的编号
     *
     * @export
     * @returns
     */
    function cid() {
        if (_cid > 2100000000)
            _cid = -210000000;
        return _cid++;
    }
    exports.cid = cid;
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
     * @class Subject
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
    function fulfillable(topic, subject) {
        if (!subject)
            subject = {};
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
    exports.fulfillable = fulfillable;
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
                if (!onReleases)
                    return this;
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
    var ObservableTypes;
    (function (ObservableTypes) {
        ObservableTypes[ObservableTypes["Value"] = 0] = "Value";
        ObservableTypes[ObservableTypes["Object"] = 1] = "Object";
        ObservableTypes[ObservableTypes["Array"] = 2] = "Array";
    })(ObservableTypes = exports.ObservableTypes || (exports.ObservableTypes = {}));
    var ObservableModes;
    (function (ObservableModes) {
        ObservableModes[ObservableModes["Default"] = 0] = "Default";
        ObservableModes[ObservableModes["Raw"] = 1] = "Raw";
        ObservableModes[ObservableModes["Value"] = 2] = "Value";
        ObservableModes[ObservableModes["Observable"] = 3] = "Observable";
        /**
         * 行为基本等同Observable,但如果该变量是Proxy,则会返回Proxy
         */
        ObservableModes[ObservableModes["Proxy"] = 4] = "Proxy";
        ObservableModes[ObservableModes["Schema"] = 5] = "Schema";
        ObservableModes[ObservableModes["Immediate"] = 6] = "Immediate";
    })(ObservableModes = exports.ObservableModes || (exports.ObservableModes = {}));
    function observableMode(mode, statement) {
        var accessMode = Observable.readMode;
        try {
            Observable.readMode = mode;
            return statement();
        }
        finally {
            Observable.readMode = accessMode;
        }
    }
    exports.observableMode = observableMode;
    function proxyMode(statement) {
        var accessMode = Observable.readMode;
        try {
            Observable.readMode = ObservableModes.Observable;
            return statement();
        }
        finally {
            Observable.readMode = accessMode;
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
        ChangeTypes[ChangeTypes["Computed"] = 8] = "Computed";
    })(ChangeTypes = exports.ChangeTypes || (exports.ChangeTypes = {}));
    var Undefined = {};
    var Observable = /** @class */ (function (_super) {
        __extends(Observable, _super);
        function Observable(init, index, initValue) {
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
                //this.$__obExtras__ = extras;
                if (initValue !== undefined) {
                    _this.$__obRaw__(_this.$target = initValue);
                }
                else {
                    _this.$target = _this.$__obRaw__();
                }
            }
            else if (typeof init === "function") {
                //ctor(TRaw,extras)
                //this.$__obExtras__ = index;
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
                    //this.$__obExtras__ = extras;
                    _this.$__obRaw__ = index;
                    _this.$target = init;
                    index.call(_this, init);
                }
                else {
                    //ctor(initValue)
                    _this.$target = init;
                    //this.$__obExtras__ = index;
                    _this.$__obRaw__ = function (val) { return val === undefined ? _this.$target : _this.$target = val; };
                }
            }
            if (_this.$target instanceof Observable_1)
                throw new Error("不正确的赋值");
            if (!_this.$schema)
                _this.$schema = _this.$schema = new ObservableSchema(undefined);
            implicit(_this, {
                $target: _this.$target, $type: ObservableTypes.Value, $schema: _this.$schema, $isset: false,
                $__obRaw__: _this.$__obRaw__, $__obIndex__: _this.$__obIndex__, $__obModifiedValue__: undefined, $__obOwner__: _this.$__obOwner__, $__obExtras__: _this.$__obExtras__
            });
            return _this;
        }
        Observable_1 = Observable;
        Observable.prototype.get = function (accessMode) {
            if (accessMode === undefined)
                accessMode = Observable_1.readMode;
            if (accessMode == ObservableModes.Raw)
                return this.$__obRaw__();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            if (accessMode == ObservableModes.Observable || accessMode == ObservableModes.Proxy)
                return this;
            return (this.$__obModifiedValue__ === undefined) ? this.$target : (this.$__obModifiedValue__ === Undefined ? undefined : this.$__obModifiedValue__);
        };
        Observable.prototype.set = function (newValue, src) {
            if (newValue && newValue instanceof Observable_1)
                newValue = newValue.get(ObservableModes.Value);
            if (Observable_1.writeMode === ObservableModes.Raw) {
                this.$__obRaw__.call(this, this.$target = newValue);
                this.$__obModifiedValue__ = undefined;
                return this;
            }
            this.$__obModifiedValue__ = newValue === undefined ? Undefined : newValue;
            if (src !== undefined || Observable_1.writeMode === ObservableModes.Immediate)
                this.update(src);
            return this;
        };
        /**
         * 更新数据，引发事件，事件会刷新页面
         *
         * @returns {boolean} false=不做后继的操作。event.cancel=true会导致该函数返回false.
         * @memberof Observable
         */
        Observable.prototype.update = function (src) {
            var newValue = this.$__obModifiedValue__;
            if (newValue === undefined)
                return true;
            this.$__obModifiedValue__ = undefined;
            newValue = newValue === Undefined ? undefined : newValue;
            var oldValue = this.$target;
            if (newValue !== oldValue) {
                this.$__obRaw__(this.$target = newValue);
                var evtArgs = { type: ChangeTypes.Value, value: newValue, old: oldValue, sender: this, src: src || this };
                var rmode = Observable_1.readMode;
                Observable_1.readMode = ObservableModes.Value;
                var wmode = Observable_1.writeMode;
                Observable_1.writeMode = ObservableModes.Immediate;
                try {
                    this.notify(evtArgs);
                }
                finally {
                    Observable_1.readMode = rmode;
                    Observable_1.writeMode = wmode;
                }
                return evtArgs.cancel !== true;
            }
            return true;
        };
        Observable.prototype.toString = function () {
            var currentValue = this.get(ObservableModes.Value);
            return currentValue === undefined || currentValue === null ? "" : currentValue.toString();
        };
        Observable.isObservable = function (ob) {
            if (!ob)
                return false;
            return ob.subscribe && ob.get && ob.set && ob.update;
        };
        var Observable_1;
        Observable.readMode = ObservableModes.Default;
        Observable.writeMode = ObservableModes.Default;
        Observable = Observable_1 = __decorate([
            implicit()
        ], Observable);
        return Observable;
    }(Subject));
    exports.Observable = Observable;
    Object.defineProperty(Observable.prototype, "$extras", { enumerable: false, configurable: false,
        get: function () {
            if (this.$__obOwner__)
                return this.$__obOwner__.$extras;
            else {
                if (!this.$__obExtras__) {
                    Object.defineProperty(this, "$__obExtras__", { enumerable: false, writable: false, configurable: false, value: {} });
                    return this.$__obExtras__;
                }
            }
        }
    });
    Object.defineProperty(Observable.prototype, "$root", { enumerable: false, configurable: false,
        get: function () {
            if (_this.$__obOwner__)
                return _this.$__obOwner__.$root;
            return _this;
        }
    });
    var ObservableObject = /** @class */ (function (_super) {
        __extends(ObservableObject, _super);
        function ObservableObject(init, index, initValue) {
            var _this = _super.call(this, init, index, initValue) || this;
            _this.$type = ObservableTypes.Object;
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
                accessMode = Observable.readMode;
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
        ObservableObject.prototype.set = function (newValue, src) {
            this.$isset = true;
            if (newValue && Observable.isObservable(newValue))
                newValue = newValue.get(ObservableModes.Value);
            _super.prototype.set.call(this, newValue || null);
            if (!newValue)
                return this;
            for (var n in this) {
                if (n === "constructor" || n[0] === "$" || n[0] === "_")
                    continue;
                var ob = void 0;
                var mode = Observable.readMode;
                Observable.readMode = ObservableModes.Observable;
                try {
                    ob = this[n];
                }
                finally {
                    Observable.readMode = mode;
                }
                if (Observable.isObservable(ob))
                    ob.set(newValue[n]);
            }
            if (src !== undefined || ObservableModes.Immediate === Observable.writeMode)
                this.update(src);
            return this;
        };
        ObservableObject.prototype.update = function (src) {
            var result = _super.prototype.update.call(this, src);
            if (result === false)
                return false;
            try {
                for (var n in this) {
                    var ob = void 0;
                    var mode = Observable.readMode;
                    Observable.readMode = ObservableModes.Observable;
                    try {
                        ob = this[n];
                    }
                    finally {
                        Observable.readMode = mode;
                    }
                    if (ob instanceof Observable && ob.$__obOwner__ === this)
                        ob.update(src);
                }
            }
            finally {
            }
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
        function ObservableArray(init, index, itemSchemaOrInitData) {
            var _this = this;
            var target;
            _this = _super.call(this, init, index, itemSchemaOrInitData instanceof ObservableSchema ? undefined : itemSchemaOrInitData) || this;
            _this.$type = ObservableTypes.Array;
            target = _this.$target;
            if (Object.prototype.toString.call(target) !== "[object Array]")
                _this.$__obRaw__.call(_this, target = _this.$target = []);
            if (!_this.$schema) {
                _this.$schema = new ObservableSchema(_this.$target);
            }
            var itemSchema;
            if (index instanceof ObservableSchema) {
                itemSchema = index;
            }
            else if (itemSchemaOrInitData instanceof ObservableSchema)
                itemSchema = itemSchemaOrInitData;
            _this.$_itemSchema = itemSchema || _this.$schema.$itemSchema;
            var item_index = 0;
            for (var i = 0, j = target.length; i < j; i++)
                makeArrayItem(_this, item_index++);
            implicit(_this, {
                $_changes: undefined, $_length: target.length, $__length__: undefined, $_itemSchema: _this.$_itemSchema
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
            if (accessMode === undefined)
                accessMode = Observable.readMode;
            if (accessMode === ObservableModes.Raw)
                return this.$__obRaw__();
            if (accessMode == ObservableModes.Schema)
                return this.$schema;
            if (accessMode === ObservableModes.Value) {
                var mode = Observable.readMode;
                Observable.readMode = ObservableModes.Observable;
                try {
                    var rs = [];
                    for (var n in this) {
                        if (n === "constructor" || n[0] === "$" || n[0] === "_")
                            continue;
                        var prop = this[n];
                        rs.push(prop.get(ObservableModes.Value));
                    }
                    return rs;
                }
                finally {
                    Observable.readMode = mode;
                }
            }
            return this;
        };
        ObservableArray.prototype.set = function (newValue, src) {
            this.$isset = true;
            if (newValue && Observable.isObservable(newValue))
                newValue = newValue.get(ObservableModes.Value);
            else {
                var newArr = [];
                for (var _i = 0, newValue_1 = newValue; _i < newValue_1.length; _i++) {
                    var item = newValue_1[_i];
                    if (Observable.isObservable(item))
                        newArr.push(item.get(ObservableModes.Value));
                    else
                        newArr.push(item);
                }
                newValue = newArr;
            }
            newValue || (newValue = []);
            this.clear();
            _super.prototype.set.call(this, newValue);
            for (var i in newValue)
                makeArrayItem(this, i);
            ;
            this.$_length = newValue.length;
            if (src !== undefined || Observable.writeMode === ObservableModes.Immediate)
                this.update(src);
            return this;
        };
        ObservableArray.prototype.update = function (src) {
            //有3种操作
            // 用新数组代替了旧数组
            // push/pop/shift/unshift
            // 子项变更了
            //新数组代替了旧数组，用super处理了。？？这里逻辑有问题，如果数组赋值后又push/pop了会怎么处理？
            if (!_super.prototype.update.call(this, src))
                return true;
            //查看子项变更
            //如果子项是value类型，直接获取会得到值，而不是期望的Observable,所以要强制访问Observable
            try {
                for (var n in this) {
                    var mode = Observable.readMode;
                    Observable.readMode = ObservableModes.Observable;
                    var ob = void 0;
                    try {
                        ob = this[n];
                    }
                    finally {
                        Observable.readMode = mode;
                    }
                    //只有Observable，且所有者为自己的，才更新
                    //防止用户放别的东西在这个ObservableArray上面
                    if (ob instanceof Observable && ob.$__obOwner__ === this)
                        ob.update(src);
                }
            }
            finally {
            }
            //处理push/pop等数组操作
            var changes = this.$_changes;
            if (!changes || this.$_changes.length === 0)
                return true;
            this.$_changes = undefined;
            var arr = this.$target;
            var rmode = Observable.readMode;
            Observable.readMode = ObservableModes.Value;
            var wmode = Observable.writeMode;
            try {
                for (var i in changes) {
                    var change = changes[i];
                    switch (change.type) {
                        case ChangeTypes.Remove:
                            change.sender.notify(change);
                        case ChangeTypes.Push:
                            arr.push(change.value);
                            //this.notify(change);
                            //if(change.cancel!==true && change.item) change.item.notify(change);
                            break;
                        case ChangeTypes.Pop:
                            arr.pop();
                            //this.notify(change);
                            if (change.cancel !== true && change.item) {
                                change.sender = change.item;
                                change.item.notify(change);
                            }
                            break;
                        case ChangeTypes.Unshift:
                            arr.unshift(change.value);
                            //this.notify(change);
                            break;
                        case ChangeTypes.Shift:
                            arr.shift();
                            //this.notify(change);
                            if (change.cancel !== true && change.item) {
                                change.sender = change.item;
                                change.item.notify(change);
                            }
                            break;
                        case ChangeTypes.Item:
                            arr[change.index] = change.value;
                            //this.notify(change);
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
            }
            finally {
                Observable.readMode = rmode;
                Observable.writeMode = wmode;
            }
            return true;
        };
        ObservableArray = __decorate([
            implicit()
        ], ObservableArray);
        return ObservableArray;
    }(Observable));
    exports.ObservableArray = ObservableArray;
    Object.defineProperty(ObservableArray.prototype, "length", {
        enumerable: false, configurable: false, get: function () {
            var _this = this;
            if (Observable.readMode === ObservableModes.Proxy || Observable.readMode === ObservableModes.Observable) {
                if (!this.$__length__) {
                    var len = new Observable(function (val) {
                        if (val === undefined)
                            return _this.$_length;
                        throw "not implemeent";
                    });
                    len.$__obIndex__ = "$__length__";
                    len.$__obOwner__ = this;
                    Object.defineProperty(this, "$__length__", { enumerable: false, writable: false, configurable: false, value: len });
                }
                return this.$__length__;
            }
            else
                return this.$_length;
        }, set: function (val) { throw "not implemeent"; }
    });
    function makeArrayItem(obArray, index) {
        obArray.$_itemSchema.$index = index;
        var item = new obArray.$_itemSchema.$obCtor(obArray, index);
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
    function defineObservableProperty(target, name, factory, onSetting) {
        var schema = factory instanceof ObservableSchema ? factory : undefined;
        var private_name = "$YA__" + name + "__";
        Object.defineProperty(target, name, {
            enumerable: true,
            configurable: false,
            get: function () {
                var ob = this[private_name];
                if (!ob) {
                    if (schema) {
                        if (this instanceof Observable) {
                            ob = new schema.$obCtor(this, name);
                        }
                        else
                            ob = schema.createObservable(exports.Default);
                    }
                    else {
                        ob = factory.call(this);
                    }
                    if (typeof this.dispose === "function")
                        ob.$extras.disposeOwner = this;
                    Object.defineProperty(this, private_name, { enumerable: false, configurable: false, writable: false, value: ob });
                }
                return ob.get();
            },
            set: function (val) {
                if (onSetting)
                    val = onSetting.call(this, val);
                var ob = this[private_name];
                if (!ob) {
                    if (schema) {
                        if (this instanceof Observable) {
                            ob = new schema.$obCtor(this, name);
                        }
                        else
                            ob = schema.createObservable(exports.Default);
                    }
                    else {
                        ob = factory.call(this);
                    }
                    if (typeof this.dispose === "function")
                        ob.$extras.disposeOwner = this;
                    Object.defineProperty(this, private_name, { enumerable: false, configurable: false, writable: false, value: ob });
                }
                return ob.set(val);
            }
        });
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
                "$type": ObservableTypes.Value,
                "$index": index,
                "$paths": paths,
                "$owner": owner,
                "$obCtor": Observable,
                "$proxyCtor": ObservableProxy,
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
                    this.$type = ObservableTypes.Value;
                    this.$obCtor = Observable;
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
                    if (data === undefined || data === Undefined) {
                        console.warn("未能找到数据，提前结束");
                        return undefined;
                    }
                }
                return data;
            });
        };
        ObservableSchema.prototype.asObject = function () {
            if (this.$type === ObservableTypes.Object)
                return this;
            if (this.$type === ObservableTypes.Array)
                throw new Error("无法将ObservableSchema从Array转化成Object.");
            this.$type = ObservableTypes.Object;
            var schema = this;
            var _ObservableObject = /** @class */ (function (_super) {
                __extends(_ObservableObject, _super);
                function _ObservableObject(init, index, initValue) {
                    return _super.call(this, init, index, initValue) || this;
                }
                return _ObservableObject;
            }(ObservableObject));
            ;
            _ObservableObject.prototype.$schema = this;
            this.$obCtor = _ObservableObject;
            var _ObservableObjectProxy = /** @class */ (function (_super) {
                __extends(_ObservableObjectProxy, _super);
                function _ObservableObjectProxy(schema, parent) {
                    return _super.call(this, schema, parent) || this;
                }
                return _ObservableObjectProxy;
            }(ObservableProxy));
            this.$proxyCtor = _ObservableObjectProxy;
            return this;
        };
        ObservableSchema.prototype.defineProp = function (propname, initValue, onSetting) {
            if (this.$type !== ObservableTypes.Object)
                throw new Error("调用$defineProp之前，要首先调用$asObject");
            var propSchema = new ObservableSchema_1(initValue, propname, this);
            var private_prop_name = "$YA__" + propname + "__";
            var self = this;
            Object.defineProperty(this, propname, { enumerable: true, writable: false, configurable: false, value: propSchema });
            defineObservableProperty(this.$obCtor.prototype, propname, propSchema, onSetting);
            defineObservableProperty(this.$proxyCtor.prototype, propname, function (initData) {
                return new propSchema.$proxyCtor(initData, this);
            }, onSetting);
            return propSchema;
        };
        ObservableSchema.prototype.asArray = function (itemSchema) {
            if (this.$type === ObservableTypes.Array)
                return this;
            if (this.$type === ObservableTypes.Object)
                throw new Error("无法将ObservableSchema从Object转化成Array.");
            this.$type = ObservableTypes.Array;
            var schema = this;
            var _ObservableArray = /** @class */ (function (_super) {
                __extends(_ObservableArray, _super);
                function _ObservableArray(init, index, initValue) {
                    return _super.call(this, init, index, initValue) || this;
                }
                return _ObservableArray;
            }(ObservableArray));
            ;
            if (itemSchema instanceof ObservableSchema_1) {
                this.$itemSchema = itemSchema;
            }
            else {
                if (itemSchema === undefined) {
                    itemSchema = this.$initData && this.$initData.shift ? this.$initData.shift() : undefined;
                    this.$itemSchema = new ObservableSchema_1(itemSchema, ObservableSchema_1.arrayItemIndexToken, this);
                    if (!itemSchema[ObservableSchema_1.schemaToken])
                        this.$initData.unshift(itemSchema);
                }
                else {
                    itemSchema[ObservableSchema_1.schemaToken] = true;
                    this.$itemSchema = new ObservableSchema_1(itemSchema, ObservableSchema_1.arrayItemIndexToken, this);
                }
            }
            if (!this.$itemSchema)
                this.$itemSchema = new ObservableSchema_1(undefined, ObservableSchema_1.arrayItemIndexToken, this);
            _ObservableArray.prototype.$schema = this;
            this.$obCtor = _ObservableArray;
            var lengthSchema = new ObservableSchema_1(0, "length", this);
            Object.defineProperty(this, "length", { enumerable: false, configurable: false, get: function () { return lengthSchema; } });
        };
        ObservableSchema.prototype.initObject = function (ob) {
            for (var n in this) {
                if (n === "constructor" || n[0] === "$" || n === ObservableSchema_1.schemaToken)
                    continue;
                var propSchema = this[n];
                defineObservableProperty(ob, n, propSchema);
            }
        };
        ObservableSchema.prototype.createObservable = function (val) {
            return new this.$obCtor(val === exports.Default ? this.$initData : val);
        };
        ObservableSchema.prototype.createProxy = function () {
            return new this.$proxyCtor(this, undefined);
        };
        var ObservableSchema_1;
        ObservableSchema.schemaToken = "$__ONLY_USED_BY_SCHEMA__";
        ObservableSchema.arrayItemIndexToken = "";
        ObservableSchema = ObservableSchema_1 = __decorate([
            implicit()
        ], ObservableSchema);
        return ObservableSchema;
    }());
    exports.ObservableSchema = ObservableSchema;
    exports.Default = {};
    function defineProxyProto(proto, memberNames) {
        for (var _i = 0, memberNames_1 = memberNames; _i < memberNames_1.length; _i++) {
            var n = memberNames_1[_i];
            (function (member, proto) {
                Object.defineProperty(proto, member, { enumerable: false, configurable: true, writable: true, value: function () {
                        var ob;
                        if (this.$parent) {
                            ob = this.$schema.getFromRoot(this.$rootOb, ObservableModes.Observable);
                        }
                        else {
                            ob = this.$rootOb;
                        }
                        var rs = ob[member].apply(ob, arguments);
                        return rs === ob ? this : rs;
                    } });
            })(n, proto);
        }
    }
    var ObservableProxy = /** @class */ (function () {
        function ObservableProxy(param, parent) {
            var schema;
            var rootOb;
            if (param instanceof ObservableSchema)
                schema = param;
            else if (param instanceof Observable) {
                rootOb = param;
                schema = param.$schema;
            }
            else {
                schema = new ObservableSchema(param);
            }
            implicit(this, {
                $parent: parent, $schema: schema, $__rootOb__: rootOb
            });
            Object.defineProperty(this, "$rootOb", { enumerable: false, get: function () {
                    if (this.$__rootOb__)
                        return this.$__rootOb__;
                    return this.$parent ? this.$parent.$rootOb : undefined;
                }
            });
            Object.defineProperty(this, "$root", { enumerable: false, get: function () {
                    var ob = this.$schema.getFromRoot(this.$rootOb, ObservableModes.Observable);
                    return ob.$root;
                }
            });
            if (this.$schema.$itemSchema) {
                var lenSchema = this.$schema.length;
                var lenProxy = new ObservableProxy_1(lenSchema, this);
                Object.defineProperty(this, "length", { enumerable: false, configurable: false, writable: false, value: lenProxy });
                Object.defineProperty(this, "$itemSchema", { enumerable: false, configurable: false, writable: false, value: this.$schema.$itemSchema });
            }
            for (var n in schema) {
                var sub = schema[n];
                Object.defineProperty(this, n, { enumerable: true, writable: false, configurable: false, value: new ObservableProxy_1(sub, this) });
            }
        }
        ObservableProxy_1 = ObservableProxy;
        ObservableProxy.prototype.get = function (accessMode) {
            if (accessMode === undefined)
                accessMode = Observable.readMode;
            if (accessMode === ObservableModes.Proxy)
                return this;
            var ob;
            if (this.$parent) {
                ob = this.$schema.getFromRoot(this.$rootOb, ObservableModes.Observable);
                return ob.get(accessMode);
            }
            else {
                return this.$rootOb.get(accessMode);
            }
        };
        ObservableProxy.prototype.set = function (newValue, updateImmediately) {
            if (this.$parent) {
                var ob = this.$schema.getFromRoot(this.$rootOb, ObservableModes.Observable);
                //if(newValue instanceof Observable) newValue = newValue.get(ObservableModes.Value);
                ob.set(newValue, updateImmediately);
            }
            else {
                if (Observable.isObservable(newValue)) {
                    this.$__rootOb__ = newValue;
                }
                else {
                    newValue = new Observable(newValue);
                    if (this.$__rootOb__)
                        this.$__rootOb__.set(newValue, updateImmediately);
                    else
                        this.$__rootOb__ = newValue;
                }
            }
            return this;
        };
        ObservableProxy.prototype.reset = function (newValue) {
            if (this.$parent)
                throw new Error("只能在根代理上使用reset");
            if (Observable.isObservable(newValue)) {
                this.$__rootOb__ = newValue.get(ObservableModes.Observable);
            }
            else {
                this.$__rootOb__ = this.$schema.createObservable(newValue);
            }
        };
        ObservableProxy.prototype.subscribe = function () { throw new Error("abstract method"); };
        ObservableProxy.prototype.unsubscribe = function () { throw new Error("abstract method"); };
        ObservableProxy.prototype.notify = function () { throw new Error("abstract method"); };
        ObservableProxy.prototype.fulfill = function () { throw new Error("abstract method"); };
        ObservableProxy.prototype.update = function () { throw new Error("abstract method"); };
        ObservableProxy.prototype.pop = function () { throw new Error("abstract method"); };
        ObservableProxy.prototype.push = function () { throw new Error("abstract method"); };
        ObservableProxy.prototype.shift = function () { throw new Error("abstract method"); };
        ObservableProxy.prototype.unshift = function () { throw new Error("abstract method"); };
        var ObservableProxy_1;
        ObservableProxy = ObservableProxy_1 = __decorate([
            implicit()
        ], ObservableProxy);
        return ObservableProxy;
    }());
    exports.ObservableProxy = ObservableProxy;
    defineProxyProto(ObservableProxy.prototype, ["update", "subscribe", "unsubscribe", "notify", "fulfill", "push", "pop", "shift", "unshift", "clear", "$extras"]);
    function observable(schema, index, subject) {
        if (Observable.isObservable(schema))
            throw new Error("不能用Observable构造另一个Observable,或许你想使用的是ObservableProxy?");
        if (!(schema instanceof ObservableSchema)) {
            schema = new ObservableSchema(schema);
        }
        if (subject) {
            defineObservableProperty(subject, index, schema);
        }
        else {
            return schema.createObservable(exports.Default);
        }
    }
    exports.observable = observable;
    function loopar(schema, index, subject) {
        if (schema instanceof Observable) {
            if (schema.$schema.$itemSchema)
                schema = schema.$schema.$itemSchema;
            else {
                for (var n in schema.$schema) {
                    schema = schema.$schema[n];
                    break;
                }
            }
            ;
        }
        else if (!(schema instanceof ObservableSchema)) {
            for (var n in schema) {
                schema = new ObservableSchema(schema[n]);
                break;
            }
            if (!schema)
                schema = new ObservableSchema(undefined);
        }
        return variable(schema, index, subject);
    }
    exports.loopar = loopar;
    function variable(schema, index, subject) {
        if (schema instanceof Observable) {
            schema = schema.$schema;
        }
        else if (!(schema instanceof ObservableSchema)) {
            schema = new ObservableSchema(schema);
        }
        if (subject) {
            defineObservableProperty(subject, index, function (initData) {
                var proxy = new ObservableProxy(schema);
                if (initData !== undefined)
                    proxy.reset(initData);
                return proxy;
            });
        }
        else {
            var proxy = new ObservableProxy(schema);
            return proxy;
        }
    }
    exports.variable = variable;
    exports.ElementUtility = {};
    exports.ElementUtility.isElement = function (elem, includeText) {
        if (!elem)
            return false;
        if (!elem.insertBefore || !elem.ownerDocument)
            return false;
        return includeText ? true : elem.nodeType === 1;
    };
    exports.ElementUtility.createElement = function (tag, attrs, parent, content) {
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
    exports.ElementUtility.createText = function (txt, parent) {
        var node = document.createTextNode(txt);
        if (parent)
            parent.appendChild(node);
        return node;
    };
    exports.ElementUtility.createPlaceholder = function (cmt) {
        var rs = document.createComment(cmt || "PLACEHOLDER");
        //let rs = document.createElement("span");
        //rs.className="YA-PLACEHOLDER";
        //rs.style.display = "none";
        return rs;
    };
    exports.ElementUtility.setContent = function (elem, content) {
        if (elem.nodeType === 1)
            elem.innerHTML = content;
        else
            elem.nodeValue = content;
        return exports.ElementUtility;
    };
    exports.ElementUtility.getContent = function (elem) {
        return elem.nodeType === 1 ? elem.innerHTML : elem.nodeValue;
    };
    exports.ElementUtility.setAttribute = function (elem, name, value) {
        elem[name] = value;
        return exports.ElementUtility;
    };
    exports.ElementUtility.getAttribute = function (elem, name) {
        return elem.getAttribute(name);
    };
    exports.ElementUtility.removeAttribute = function (elem, name) {
        elem.removeAttribute(name);
        return exports.ElementUtility;
    };
    exports.ElementUtility.setProperty = function (elem, name, value) {
        elem[name] = value;
        return exports.ElementUtility;
    };
    exports.ElementUtility.getProperty = function (elem, name) {
        return elem[name];
    };
    exports.ElementUtility.appendChild = function (container, child) {
        container.appendChild(child);
        return exports.ElementUtility;
    };
    exports.ElementUtility.insertBefore = function (insert, rel) {
        if (rel.parentNode)
            rel.parentNode.insertBefore(insert, rel);
        return exports.ElementUtility;
    };
    exports.ElementUtility.insertAfter = function (insert, rel) {
        if (rel.parentNode)
            rel.parentNode.insertAfter(insert, rel);
        return exports.ElementUtility;
    };
    exports.ElementUtility.getParent = function (elem) { return elem.parentNode; };
    exports.ElementUtility.remove = function (node) {
        if (node.parentNode)
            node.parentNode.removeChild(node);
        return exports.ElementUtility;
    };
    exports.ElementUtility.removeAllChildren = function (elem) {
        elem.innerHTML = elem.nodeValue = "";
        return exports.ElementUtility;
    };
    exports.ElementUtility.getChildren = function (elem) { return elem.childNodes; };
    exports.ElementUtility.show = function (elem, immeditately) {
        elem.style.display = "";
        return exports.ElementUtility;
    };
    exports.ElementUtility.hide = function (elem, immeditately) {
        elem.style.display = "none";
        return exports.ElementUtility;
    };
    exports.ElementUtility.attach = function (elem, evtname, handler) {
        if (elem.addEventListener)
            elem.addEventListener(evtname, handler, false);
        else if (elem.attachEvent)
            elem.attachEvent('on' + evtname, handler);
        else
            elem['on' + evtname] = handler;
        return exports.ElementUtility;
    };
    exports.ElementUtility.detech = function (elem, evtname, handler) {
        if (elem.removeEventListener)
            elem.removeEventListener(evtname, handler, false);
        else if (elem.detechEvent)
            elem.detechEvent('on' + evtname, handler);
        else
            elem['on' + evtname] = null;
        return exports.ElementUtility;
    };
    exports.ElementUtility.is_inDocument = function (elem) {
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
    exports.ElementUtility.getValue = function (elem) {
        if (typeof elem.get === "function")
            return elem.get();
        var tag = elem.tagName;
        if (!tag)
            return elem.nodeValue;
        if (tag === "INPUT") {
            var type = elem.type;
            if (type === "radio") {
                if (elem.checked)
                    return elem.value;
                else
                    return undefined;
            }
            else if (type === "checkbox") {
                var p = elem.parentNode;
                if (p) {
                    var name_1 = elem.name;
                    var vals = [];
                    var c = 0;
                    for (var i = 0, j = p.childNodes.length; i < j; i++) {
                        var child = p.childNodes[i];
                        if (child.tagName === "INPUT" && child.type == "checkbox" && child.name === name_1) {
                            c++;
                            if (child.checked)
                                vals.push(child.value);
                        }
                    }
                    if (c === 0)
                        return undefined;
                    else if (c === 1)
                        return vals[0];
                    else
                        return vals;
                }
                else {
                    return elem.checked ? elem.value : undefined;
                }
            }
            else {
                return elem.value;
            }
        }
        else if (tag === "SELECT") {
            var opt = elem.options[elem.selectedIndex];
            if (opt)
                return opt.value;
        }
        else if (tag === "TEXTAREA")
            return elem.value;
        else
            return elem.innerHTML;
    };
    exports.ElementUtility.replace = function (old, newNode) {
        var pa = old.parentNode;
        if (pa) {
            pa.insertBefore(newNode, old);
            pa.removeChild(old);
        }
    };
    exports.ElementUtility.setValue = function (elem, value) {
        if (typeof elem.set === "function")
            return elem.set(value);
        var tag = elem.tagName;
        if (!tag)
            return elem.nodeValue = value;
        if (tag === "INPUT") {
            var type = elem.type;
            if (type === "radio") {
                if (value === true || value === "On" || value === "ON" || value === elem.value) {
                    elem.checked = true;
                }
                else {
                    elem.checked = false;
                    exports.ElementUtility.removeAttribute(elem, "checked");
                }
            }
            else if (type === "checkbox") {
                var p = elem.parentNode;
                if (p) {
                    var name_2 = elem.name;
                    var isArr = is_array(value);
                    var c = 0;
                    for (var i = 0, j = p.childNodes.length; i < j; i++) {
                        var child = p.childNodes[i];
                        if (child.tagName === "INPUT" && child.type == "checkbox" && child.name === name_2) {
                            if (isArr)
                                child.checked = array_index(value, child.value) >= 0;
                            else if (value === true || value === "On" || value === "ON" || value === elem.value) {
                                child.checked = true;
                            }
                            else {
                                child.checked = false;
                                exports.ElementUtility.removeAttribute(child, "checked");
                            }
                        }
                    }
                }
                else {
                    if (value === true || value === "On" || value === "ON" || value === elem.value) {
                        elem.checked = true;
                    }
                    else {
                        elem.checked = false;
                        exports.ElementUtility.removeAttribute(elem, "checked");
                    }
                }
                return;
            }
            else {
                elem.value = value;
                return;
            }
        }
        else if (tag === "SELECT") {
            for (var i = 0, j = elem.options.length; i < j; i++) {
                var opt = elem.options[i];
                if (opt.value === value)
                    opt.selected = true;
                else {
                    opt.selected = false;
                    exports.ElementUtility.removeAttribute(opt, "selected");
                }
            }
        }
        else if (tag === "TEXTAREA")
            return elem.value = value;
        else if (tag === "OPTION")
            return elem.value = value;
        else
            return elem.innerHTML = value;
    };
    exports.ElementUtility.change = function (elem, handler) {
        var tag = elem.tagName;
        if (!tag)
            return false;
        var onchange;
        var isInput = false;
        if (tag === "INPUT") {
            var type = elem.type;
            if (type === "radio") {
                onchange = function () { return handler.call(elem, elem.checked ? elem.value : undefined); };
                exports.ElementUtility.attach(elem, "click", onchange);
                exports.ElementUtility.attach(elem, "blur", onchange);
                return true;
            }
            else if (type === "checkbox") {
                onchange = function () { return handler.call(elem, exports.ElementUtility.getValue(elem)); };
                exports.ElementUtility.attach(elem, "click", onchange);
                exports.ElementUtility.attach(elem, "blur", onchange);
                return true;
            }
            isInput = true;
        }
        else if (tag === "SELECT") {
            onchange = function () { return handler.call(elem, exports.ElementUtility.getValue(elem)); };
            exports.ElementUtility.attach(elem, "change", onchange);
            exports.ElementUtility.attach(elem, "blur", onchange);
            return true;
        }
        else if (tag === "TEXTAREA") {
            isInput = true;
        }
        if (!isInput)
            return false;
        var onkeydown = function () {
            var tick = elem.$__YA_inputTick__;
            if (tick)
                clearTimeout(tick);
            elem.$__YA_inputTick__ = setTimeout(function () {
                delete elem["$__YA_inputTick__"];
                handler.call(elem, exports.ElementUtility.getValue(elem));
            }, 100);
        };
        var onblur = function () {
            var tick = elem.$__YA_inputTick__;
            if (tick) {
                clearTimeout(tick);
                delete elem["$__YA_inputTick__"];
            }
            handler.call(elem, exports.ElementUtility.getValue(elem));
        };
        exports.ElementUtility.attach(elem, "keydown", onkeydown);
        exports.ElementUtility.attach(elem, "blur", onblur);
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
    function _createElement(tag, attrs, compInst, compParent) {
        if (tag === undefined || tag === null || tag === "")
            return;
        var descriptor;
        var t = typeof tag;
        if (t === "string") {
            if (exports.ElementUtility.isElement(attrs)) {
                //一:createElement("hello",container?,comp?);
                return createText(tag, attrs, compInst);
            }
            //二:createElement("hello",{},...children);
            //构建descriptor
            descriptor = {};
            for (var n in attrs)
                descriptor[n] = attrs[n];
            descriptor.tag = tag;
            var children = [];
            for (var i = 2, j = arguments.length; i < j; i++) {
                children.push(arguments[i]);
            }
            descriptor.children = children;
            return (_jsxMode === JSXModes.vnode) ? descriptor : createDescriptor(descriptor, null, null);
        }
        else if (t === "function") {
            if (attrs === undefined || exports.ElementUtility.isElement(attrs)) {
                //三:createElement(Comp,container,compParent);
                return createComponent(tag, null, attrs, compInst);
            }
            if (compInst && exports.ElementUtility.isElement(compInst)) {
                //四:createElement(Comp,attrs,container,compParent);
                return createComponent(tag, attrs, compInst, compParent);
            }
            //五: createElement(Comp:Function,attrs:{},...children);
            descriptor = {};
            for (var n in attrs)
                descriptor[n] = attrs[n];
            descriptor.Component = tag;
            var children = [];
            for (var i = 2, j = arguments.length; i < j; i++) {
                children.push(arguments[i]);
            }
            descriptor.children = children;
            return (_jsxMode === JSXModes.vnode) ? descriptor : createComponent(descriptor.Component, descriptor, null, null);
        }
        else if (t === "object") {
            if (exports.ElementUtility.isElement(tag)) {
                if (attrs)
                    exports.ElementUtility.appendChild(attrs, tag);
                return attrs;
            }
            else if (is_array(tag)) {
                //六:createElement(descriptors:INodeDescriptors[],container,comp);
                return createElements(tag, attrs, compInst);
            }
            else if (tag instanceof Observable || tag instanceof ObservableProxy || tag instanceof Computed) {
                return createText(tag, attrs, compInst);
            }
            else {
                //八:createElement(descriptor:INodeDescriptor,container,comp);
                return createDescriptor(tag, attrs, compInst);
            }
        }
        else {
            throw new Error("不正确的参数");
        }
    }
    function createDescriptor(descriptor, container, comp) {
        var elem;
        //没有tag，就是文本
        if (!descriptor.tag && !descriptor.Component) {
            return createText(descriptor.content, container, comp);
        }
        if (descriptor.tag) {
            var componentType = exports.componentTypes[descriptor.tag];
            if (componentType) {
                descriptor.Component = componentType;
            }
            else {
                elem = createDom(descriptor, container, comp);
                //if(container) DomUtility.appendChild(container,elem);
                return elem;
            }
        }
        var elems = createComponent(descriptor.Component, descriptor, container, comp);
        return elems;
    }
    exports.createDescriptor = createDescriptor;
    exports.createElement = _createElement;
    function createText(value, container, compInstance) {
        var elem;
        if (Observable.isObservable(value)) {
            elem = exports.ElementUtility.createText(value.get(ObservableModes.Value));
            value.subscribe(function (e) { exports.ElementUtility.setContent(elem, e.value); }, compInstance);
        }
        else if (typeof value === "function") {
            value = value();
            elem = exports.ElementUtility.createText(value);
        }
        else {
            elem = exports.ElementUtility.createText(value);
        }
        if (container)
            exports.ElementUtility.appendChild(container, elem);
        return elem;
    }
    function createElements(arr, container, compInstance) {
        var rs = [];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var child = arr_1[_i];
            var node = _createElement(child, container, compInstance);
            if (is_array(node)) {
                for (var _a = 0, _b = node; _a < _b.length; _a++) {
                    var cn = _b[_a];
                    rs.push(cn);
                }
            }
            else
                rs.push(node);
        }
        return rs;
    }
    exports.createElements = createElements;
    function createDom(descriptor, parent, ownComponent) {
        var elem = exports.ElementUtility.createElement(descriptor.tag);
        if (parent)
            exports.ElementUtility.appendChild(parent, elem);
        var ignoreChildren = false;
        //let anchorElem = elem;
        for (var attrName in descriptor) {
            //不处理有特殊含义的属性
            if (attrName === "tag" || attrName === "children" || attrName === "content")
                continue;
            var attrValue = descriptor[attrName];
            if (attrName === "loop") {
                bindDomLoop(elem, attrValue, descriptor, ownComponent);
                ignoreChildren = true;
                continue;
            }
            if (attrName === "c-name" && ownComponent) {
                bindClientName(ownComponent, attrValue, elem);
                continue;
            }
            var match = attrName.match(evtnameRegx);
            if (match && elem[attrName] !== undefined && attrValue) {
                //attrValue可能是function,也可能是一个数组
                var evtName = match[1];
                if (bindDomEvent(elem, evtName, attrValue, descriptor, ownComponent))
                    continue;
            }
            if (attrName === "class")
                attrName = "className";
            if (bindDomAttr(elem, attrName, attrValue, descriptor, ownComponent) === RenderDirectives.IgnoreChildren)
                ignoreChildren = true;
        }
        if (ignoreChildren)
            return elem;
        if (descriptor.content) {
            if (descriptor.content instanceof Computed) {
                var txtElem_1 = exports.ElementUtility.createText(descriptor.content.getValue(ownComponent), elem);
                descriptor.content.bindValue(function (val) {
                    exports.ElementUtility.setContent(txtElem_1, val);
                }, ownComponent);
            }
            if (Observable.isObservable(descriptor.content)) {
                var ob = descriptor.content;
                var txtElem_2 = exports.ElementUtility.createText(ob.get(ObservableModes.Value), elem);
                ob.subscribe(function (e) { return exports.ElementUtility.setContent(txtElem_2, e.value); }, ownComponent);
            }
            else {
                var txtElem = exports.ElementUtility.createText(descriptor.content, elem);
            }
        }
        var children = descriptor.children;
        if (!children || children.length === 0)
            return elem;
        createElements(children, elem, ownComponent);
        return elem;
    }
    function bindDomLoop(elem, bindValue, vnode, compInstance) {
        //if(component) throw new Error("不支持Component上的for标签，请自行在render函数中处理循环");
        var arr = bindValue[0];
        if (arr instanceof ObservableProxy)
            arr = arr.get(ObservableModes.Observable);
        var valVar = bindValue[1];
        var keyVar = bindValue[2];
        if (Observable.isObservable(arr)) {
            arr.subscribe(function (e) {
                var arr = e.sender;
                exports.ElementUtility.removeAllChildren(elem);
                for (var key in arr)
                    (function (key, value) {
                        if (key === "constructor")
                            return;
                        if (keyVar)
                            keyVar.reset(key);
                        if (valVar)
                            valVar.reset(value);
                        var renderRs = createElements(vnode.children, elem, compInstance);
                        if (value instanceof Observable) {
                            value.subscribe(function (e) {
                                if (e.type === ChangeTypes.Remove) {
                                    for (var _i = 0, renderRs_1 = renderRs; _i < renderRs_1.length; _i++) {
                                        var subElem = renderRs_1[_i];
                                        exports.ElementUtility.remove(subElem);
                                    }
                                }
                            }, compInstance);
                        }
                    })(key, arr[key]);
            });
        }
        for (var key in arr)
            (function (key, value) {
                if (key === "constructor")
                    return;
                if (keyVar)
                    keyVar.reset(key);
                if (valVar)
                    valVar.reset(value);
                var renderRs = createElements(vnode.children, elem, compInstance);
                if (value instanceof Observable) {
                    value.subscribe(function (e) {
                        if (e.type === ChangeTypes.Remove) {
                            for (var _i = 0, renderRs_2 = renderRs; _i < renderRs_2.length; _i++) {
                                var subElem = renderRs_2[_i];
                                exports.ElementUtility.remove(subElem);
                            }
                        }
                    }, compInstance);
                }
            })(key, arr[key]);
        return RenderDirectives.IgnoreChildren;
    }
    //把属性绑定到element上
    function bindDomAttr(element, attrName, attrValue, vnode, compInstance, op) {
        if (typeof attrValue === "function") {
            var rmode = Observable.readMode;
            Observable.readMode = ObservableModes.Value;
            try {
                attrValue = attrValue();
            }
            finally {
                Observable.readMode = rmode;
            }
        }
        if (attrValue instanceof ObservableProxy)
            attrValue = attrValue.get(ObservableModes.Observable);
        var binder = exports.attrBinders[attrName];
        var bindResult;
        if (!op)
            op = function (elem, name, value, old) {
                exports.ElementUtility.setProperty(elem, name, value);
            };
        //计算表达式
        if (attrValue instanceof Computed) {
            if (binder) {
                attrValue.bindValue(function (val) { return binder.call(compInstance, element, val, compInstance); }, compInstance);
            }
            else {
                attrValue.bindValue(function (val) { return op(element, attrName, val, undefined); }, compInstance);
            }
        }
        else {
            if (binder)
                bindResult = binder.call(compInstance, element, attrValue, vnode, compInstance);
            else if (attrValue instanceof Observable) {
                op(element, attrName, attrValue.get(ObservableModes.Value), undefined);
                attrValue.subscribe(function (e) { return op(element, attrName, e.value, e.old); }, compInstance);
            }
            else
                op(element, attrName, attrValue, undefined);
        }
        return bindResult;
    }
    exports.bindDomAttr = bindDomAttr;
    function bindDomEvent(element, evtName, params, vnode, compInstance) {
        var handler = params;
        var t = typeof params;
        var pars;
        if (t === "function") {
            handler = params;
            params = null;
        }
        else if (is_array(params) && params.length > 0) {
            handler = params[0];
            if (typeof handler !== "function") {
                return false;
            }
            pars = [];
            for (var i = 1, j = params.length; i < j; i++) {
                var par = params[i];
                if (par instanceof ObservableProxy)
                    pars.push(par.get(ObservableModes.Default));
                else
                    pars.push(par);
            }
        }
        else
            return false;
        var finalHandler = function (e) {
            e = e || window.event;
            var self = compInstance || this;
            //YA.EVENT = e;
            if (!params) {
                handler.call(self, e);
            }
            else {
                var args = [];
                for (var i = 0, j = pars.length; i < j; i++) {
                    var par = pars[i];
                    if (par === YA.EVENT) {
                        args.push(e);
                    }
                    else
                        args.push(par);
                }
                handler.apply(self, args);
            }
            if (compInstance) {
                compInstance.update(compInstance);
            }
        };
        exports.ElementUtility.attach(element, evtName, finalHandler);
        return true;
    }
    exports.EVENT = {};
    function createComponent(componentType, descriptor, container, ownComponent, opts) {
        var xmode = _jsxMode;
        var ormode = Observable.readMode;
        var owmode = Observable.writeMode;
        var compInstance;
        try {
            _jsxMode = JSXModes.vnode;
            Observable.readMode = ObservableModes.Proxy;
            Observable.writeMode = ObservableModes.Raw;
            compInstance = new componentType(descriptor, container);
        }
        finally {
            _jsxMode = xmode;
            Observable.readMode = ormode;
            Observable.writeMode = owmode;
        }
        var renderResult;
        var renderFn = componentType;
        var notDefinedAttrs;
        try {
            _jsxMode = JSXModes.vnode;
            Observable.readMode = ObservableModes.Proxy;
            // object-component
            if (typeof compInstance.render === 'function') {
                buildComponent(compInstance, componentType.prototype);
                if (compInstance.$parent = ownComponent) {
                    ownComponent.$children.push(compInstance);
                    compInstance.dispose(function () {
                        if (this.$parent) {
                            for (var i = 0, j = this.$parent.$children; i < j; i++) {
                                var c = this.$parent.$children.unshift();
                                if (c !== this)
                                    this.$parent.$children.push(c);
                            }
                        }
                    });
                }
                //绑定属性
                for (var propname in descriptor) {
                    if (propname === "tag" || propname === "children" || propname === "Component")
                        continue;
                    var attrValue = descriptor[propname];
                    if (propname === "c-name") {
                        bindClientName(ownComponent, attrValue, compInstance);
                        continue;
                    }
                    if (!bindComponentAttr(compInstance, propname, attrValue)) {
                        (notDefinedAttrs || (notDefinedAttrs = {}))[propname] = attrValue;
                    }
                }
                ;
                if (compInstance.init)
                    compInstance.init(descriptor);
                renderFn = compInstance.render;
                renderResult = renderFn.call(compInstance, descriptor, container);
            }
            else {
                renderResult = compInstance;
                compInstance = undefined;
            }
        }
        finally {
            _jsxMode = xmode;
            Observable.readMode = ormode;
        }
        var elems = handleRenderResult(renderResult, compInstance, renderFn, descriptor, container);
        if (exports.ElementUtility.isElement(elems)) {
            compInstance.$element = elems;
            if (notDefinedAttrs) {
                for (var n in notDefinedAttrs) {
                    var attrValue = notDefinedAttrs[n];
                    bindDomAttr(elems, n, attrValue, descriptor, compInstance);
                }
            }
        }
        else
            compInstance.$elements = elems;
        //绑定if属性
        //每个创建的控件都要定期做垃圾检查
        if (compInstance && (!opts || !opts.noGarbaging))
            ComponentGarbage.singleon.attech(compInstance);
        if (compInstance && compInstance.rendered)
            compInstance.rendered(elems);
        return opts && opts.returnInstance ? compInstance : elems;
    }
    exports.createComponent = createComponent;
    function bindClientName(ownComponent, value, elem) {
        if (!value) {
            console.warn("调用了setCID,但给的值为空,忽略该操作", cid, value);
            return;
        }
        elem["c-name"] = value;
        var existed = ownComponent["c-name"];
        if (!existed) {
            Object.defineProperty(ownComponent, "c-name", { enumerable: false, writable: false, configurable: true, value: value });
        }
        else if (is_array(existed)) {
            for (var i = 0, j = existed.length; i < j; i++) {
                var c = existed.unshift();
                if (c !== value)
                    existed.push(c);
            }
            existed.push(value);
        }
        else {
            var arr = [existed, value];
            Object.defineProperty(ownComponent, "c-name", { enumerable: false, writable: false, configurable: true, value: arr });
        }
    }
    function bindComponentAttr(compInstance, propName, bindValue) {
        // TODO:找到组件名
        var componentName = "Component";
        if (typeof bindValue == "function") {
            var rmode = Observable.readMode;
            Observable.readMode = ObservableModes.Value;
            try {
                bindValue = bindValue();
            }
            finally {
                Observable.readMode = rmode;
            }
        }
        var meta = compInstance.$meta || {};
        if (propName === "_options") {
            debugger;
        }
        var propInfo = meta.reactives ? meta.reactives[propName] : null;
        var isOb = Observable.isObservable(bindValue);
        var actualBindValue = isOb ? bindValue.get(ObservableModes.Value) : bindValue;
        if (propInfo && !propInfo.schema) {
            propInfo.schema = new ObservableSchema(actualBindValue);
        }
        //找到组件的属性
        var prop = compInstance[propName];
        if (prop) {
            if (Observable.isObservable(prop)) {
                //获取属性的类型
                var propType = meta.reactives ? meta.reactives[propName].type : ReactiveTypes.In;
                if (propType === ReactiveTypes.In) {
                    if (isOb) {
                        prop.set(actualBindValue);
                        bindValue.subscribe(function (e) {
                            prop.set(e.value, compInstance);
                        }, compInstance);
                    }
                    else {
                        prop.set(bindValue);
                    }
                }
                else if (propType == ReactiveTypes.Out) {
                    if (isOb) {
                        prop.subscribe(function (e) {
                            bindValue.set(e.value, compInstance);
                        }, bindValue.$extras.disposeOwner);
                    }
                    else {
                        console.warn(propName + "右值不是observable,其值变化后无法按期望out出去", bindValue);
                    }
                }
                else if (propType == ReactiveTypes.Parameter) {
                    if (isOb) {
                        prop.subscribe(function (e) {
                            bindValue.set(e.value, compInstance);
                        }, bindValue.$extras.disposeOwner);
                        bindValue.subscribe(function (e) {
                            prop.set(e.value, bindValue.$extras.disposeOwner);
                        }, compInstance);
                        prop.set(actualBindValue);
                    }
                    else {
                        prop.set(actualBindValue);
                        console.warn(propName + "右值不是observable,当该属性变化后，无法按期望传出", bindValue);
                    }
                }
                else {
                    console.warn(propName + "\u662F\u79C1\u6709\u7C7B\u578B,\u5916\u90E8\u4F20\u5165\u7684\u672A\u8D4B\u503C");
                }
            }
            else {
                compInstance[propName] = actualBindValue;
            }
            return true;
        }
        else {
            compInstance[propName] = bindValue;
            return false;
        }
    }
    function handleRenderResult(renderResult, instance, renderFn, descriptor, container) {
        var isArray = is_array(renderResult);
        var resultIsElement = false;
        if (isArray) {
            for (var _i = 0, renderResult_1 = renderResult; _i < renderResult_1.length; _i++) {
                var val = renderResult_1[_i];
                resultIsElement = exports.ElementUtility.isElement(val, true);
                break;
            }
            isArray = true;
        }
        else {
            resultIsElement = exports.ElementUtility.isElement(renderResult, true);
        }
        if (resultIsElement) {
            if (container && !renderResult.$__alreadyAppendToContainer) {
                if (isArray)
                    for (var _a = 0, renderResult_2 = renderResult; _a < renderResult_2.length; _a++) {
                        var elem = renderResult_2[_a];
                        exports.ElementUtility.appendChild(container, elem);
                    }
                else
                    exports.ElementUtility.appendChild(container, renderResult);
            }
            return renderResult;
        }
        else {
            var renderNode = renderResult;
            if (isArray) {
                var result = [];
                for (var _b = 0, renderNode_1 = renderNode; _b < renderNode_1.length; _b++) {
                    var vnode = renderNode_1[_b];
                    var elem = exports.createElement(vnode, container, instance);
                    //if(container) DomUtility.appendChild(container,elem);
                    result.push(elem);
                }
                renderResult = result;
            }
            else {
                renderResult = createDescriptor(renderNode, container, instance);
            }
            return renderResult;
        }
    }
    var Computed = /** @class */ (function (_super) {
        __extends(Computed, _super);
        function Computed(lamda, parameters) {
            var _this = _super.call(this) || this;
            _this.lamda = lamda;
            _this.parameters = parameters;
            if (!_this.parameters)
                _this.parameters = [];
            Object.defineProperty(_this, "$cid", { enumerable: false, writable: false, configurable: false, value: "$computed_" + cid() });
            return _this;
        }
        Computed.prototype.get = function (mode) {
            if (mode === undefined)
                mode = Observable.readMode;
            if (mode === ObservableModes.Proxy || mode === ObservableModes.Observable)
                return this;
            var args = [];
            for (var _i = 0, _a = this.parameters; _i < _a.length; _i++) {
                var dep = _a[_i];
                var ob = void 0;
                if (Observable.isObservable(dep))
                    ob = dep;
                if (ob)
                    args.push(ob.get(ObservableModes.Value));
                else
                    args.push(dep);
            }
            return this.lamda.apply(undefined, args);
        };
        Computed.prototype.set = function (value) {
            return this;
        };
        Computed.prototype.update = function () { return true; };
        Computed.prototype.subscribe = function (topic, listener, disposible) {
            var _this = this;
            //let args = [];
            var fn;
            var handler;
            for (var _i = 0, _a = this.parameters; _i < _a.length; _i++) {
                var dep = _a[_i];
                if (Observable.isObservable(dep)) {
                    if (!fn) {
                        fn = function (e) {
                            var old;
                            if (disposable)
                                old = disposable[_this.$cid];
                            var value = _this.get(ObservableModes.Default);
                            var evt = { value: value, sender: e.sender, old: old, type: ChangeTypes.Computed };
                            handler.call(_this, evt);
                        };
                        if (typeof topic === "function") {
                            handler = topic;
                            topic = fn;
                        }
                        else {
                            handler = listener;
                            listener = fn;
                        }
                        Object.defineProperty(fn, "$__computed_raw__", { enumerable: false, writable: false, configurable: false, value: handler });
                    }
                    dep.subscribe.call(dep, topic, listener, disposable);
                }
            }
            return this;
        };
        Computed.prototype.unsubscribe = function (topic, listener) {
            if (listener === undefined) {
                listener = topic;
                topic = "";
            }
            var topics = this.$__topics__, handlers = topics[topic];
            if (!handlers)
                return this;
            for (var i = 0, j = handlers.length; i < j; i++) {
                var existed = handlers.shift();
                if (existed.$__computed_raw__ !== listener)
                    handlers.push(existed);
            }
            return this;
        };
        Computed.prototype.fulfill = function (topic, evtArgs) {
            throw "not implement";
            return this;
        };
        Computed.prototype.getValue = function (compInstance) {
            var args = [];
            for (var _i = 0, _a = this.parameters; _i < _a.length; _i++) {
                var dep = _a[_i];
                var ob = void 0;
                if (Observable.isObservable(dep))
                    ob = dep;
                if (ob)
                    args.push(ob.get(ObservableModes.Value));
                else
                    args.push(dep);
            }
            var value = this.lamda.apply(compInstance, args);
            if (compInstance)
                Object.defineProperty(compInstance, this.$cid, { enumerable: false, configurable: true, value: value });
            return value;
        };
        Computed.prototype.bindValue = function (setter, compInstance) {
            var _this = this;
            for (var _i = 0, _a = this.parameters; _i < _a.length; _i++) {
                var ob = _a[_i];
                if (Observable.isObservable(ob))
                    ob.subscribe(function (e) {
                        var old = compInstance ? compInstance[_this.$cid] : undefined;
                        setter(_this.getValue(compInstance), old);
                    }, compInstance);
            }
        };
        return Computed;
    }(Subject));
    function createComputed() {
        var pars = [];
        for (var i = 1, j = arguments.length; i < j; i++)
            pars.push(arguments[i]);
        return new Computed(arguments[0], pars);
    }
    exports.computed = createComputed;
    function not(param, strong) {
        return strong ? new Computed(function (val) { return is_empty(val); }, [param]) : new Computed(function (val) { return !val; }, [param]);
    }
    exports.not = not;
    var evtnameRegx = /on([a-zA-Z_][a-zA-Z0-9_]*)/;
    var ReactiveTypes;
    (function (ReactiveTypes) {
        ReactiveTypes[ReactiveTypes["None"] = 0] = "None";
        ReactiveTypes[ReactiveTypes["Internal"] = -1] = "Internal";
        ReactiveTypes[ReactiveTypes["Iterator"] = -2] = "Iterator";
        ReactiveTypes[ReactiveTypes["In"] = 1] = "In";
        ReactiveTypes[ReactiveTypes["Out"] = 2] = "Out";
        ReactiveTypes[ReactiveTypes["Parameter"] = 3] = "Parameter";
    })(ReactiveTypes = exports.ReactiveTypes || (exports.ReactiveTypes = {}));
    function getElement() {
        if (this.$__element__ === undefined) {
            var elem = void 0;
            if (this.$__elements__) {
                elem = this.$__elements__[0];
            }
            if (!elem)
                elem = null;
            Object.defineProperty(this, "$__element__", { configurable: false, writable: true, enumerable: false, value: elem });
            return elem;
        }
        return this.$__element__;
    }
    function setElement(elem) {
        if (this.$__element__ === undefined) {
            Object.defineProperty(this, "$__element__", { configurable: false, writable: true, enumerable: false, value: elem });
            return;
        }
        this.$__element__ = elem || null;
        if (elem && !this.$__elements__) {
            this.elements = [elem];
        }
    }
    function getElements() {
        if (this.$__elements__ === undefined) {
            var elems = void 0;
            if (this.$__element__) {
                elems = [this.$__element__];
            }
            if (!elems)
                elems = null;
            Object.defineProperty(this, "$__elements__", { configurable: false, writable: true, enumerable: false, value: elems });
            return elems;
        }
        return this.$__elements__;
    }
    function setElements(elems) {
        if (this.$__elements__ === undefined) {
            Object.defineProperty(this, "$__elements__", { configurable: false, writable: true, enumerable: false, value: elems });
            if (elems && elems.length && !this.$__element__)
                this.element = elems[0];
            return;
        }
        this.$__elements__ = elems || null;
        if (elems && elems.length && !this.$__element__) {
            this.element = elems[0];
        }
    }
    function getParent() {
        var p = this.$__parent__;
        if (p === undefined) {
            Object.defineProperty(this, "$__parent__", { enumerable: false, writable: true, configurable: false, value: null });
            return null;
        }
        return p || null;
    }
    function setParent(val) {
        if (this.$__parent__ === undefined) {
            Object.defineProperty(this, "$__parent__", { enumerable: false, writable: true, configurable: false, value: val || null });
        }
        else
            this.$__parent__ = val;
    }
    function getChildren() {
        var children = this.$__children__;
        if (children === undefined) {
            children = [];
            Object.defineProperty(this, "$__children__", { enumerable: false, writable: false, configurable: false, value: children });
        }
        return children;
    }
    function update(path, value, src) {
        var self = this;
        var mode = Observable.readMode;
        Observable.readMode = ObservableModes.Observable;
        try {
            if (typeof path === "string") {
                var ob = DPath.getValue(self, path);
                if (ob) {
                    if (value !== undefined && value != exports.Default && ob.set)
                        ob.set(value);
                    ob.update(src);
                }
            }
            else {
                for (var n in self) {
                    var ob = self[n];
                    if (ob instanceof Observable)
                        ob.update(path || this);
                }
                var children = self.$children;
                if (children)
                    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                        var child = children_1[_i];
                        if (child.name && self[child.name] === child)
                            child.update(path || this);
                    }
            }
        }
        finally {
            Observable.readMode = mode;
        }
        return self;
    }
    function subscribe(tpath, handler, disposable) {
        var self = this;
        var mode = Observable.readMode;
        Observable.readMode = ObservableModes.Observable;
        try {
            var ob = DPath.getValue(self, tpath);
            if (ob instanceof Observable)
                ob.subscribe(handler, disposable);
        }
        finally {
            Observable.readMode = mode;
        }
        return this;
    }
    exports.context = {};
    function getContext() {
        var ctx = this.$__YA_CONTEXT__;
        if (!ctx) {
            var Context = function () { };
            Context.prototype = this.$parent ? this.$parent.context : exports.context;
            ctx = new Context();
            Object.defineProperty(this, "$__YA_CONTEXT__", { enumerable: false, writable: false, configurable: false, value: ctx });
        }
        return ctx;
    }
    function is_define(name, inst) {
        while (inst) {
            if (Object.getOwnPropertyDescriptor(inst, name))
                return true;
            inst = Object.getPrototypeOf(inst);
        }
        return false;
    }
    function buildComponent(inst, proto) {
        if (!proto)
            proto = inst;
        if (!is_define("$element", inst)) {
            Object.defineProperty(proto, "$element", { configurable: false, enumerable: false, get: getElement, set: setElement });
        }
        if (!is_define("$elements", inst)) {
            Object.defineProperty(proto, "$elements", { configurable: false, enumerable: false, get: getElements, set: setElements });
        }
        if (!is_define("$parent", inst)) {
            Object.defineProperty(proto, "$parent", { configurable: false, enumerable: false, get: getParent, set: setParent });
        }
        if (!is_define("$children", inst)) {
            Object.defineProperty(proto, "$children", { configurable: false, enumerable: false, get: getChildren });
        }
        if (!is_define("$context", inst)) {
            Object.defineProperty(proto, "$context", { configurable: false, enumerable: false, get: getContext });
        }
        if (!inst.dispose || inst.dispose.$__abstract__)
            disposable(proto || inst);
        if (!inst.update || inst.update.$__abstract__)
            proto.update = update;
        if (!inst.subscribe || inst.subscribe.$__abstract__)
            proto.subscribe = subscribe;
    }
    var Component = /** @class */ (function (_super) {
        __extends(Component, _super);
        function Component() {
            return _super.call(this) || this;
        }
        Component.prototype.render = function (des, container) {
            throw new Error("abstract method");
        };
        Component.prototype.update = function (tpath, value, src) {
            throw new Error("abstract method");
        };
        Component.prototype.subscribe = function (tpath, handler, disposable) {
            throw new Error("abstract method");
        };
        Component.prototype.context = function (name, value) {
            throw new Error("abstract method");
        };
        __decorate([
            abstract()
        ], Component.prototype, "render", null);
        __decorate([
            abstract()
        ], Component.prototype, "update", null);
        __decorate([
            abstract()
        ], Component.prototype, "subscribe", null);
        __decorate([
            abstract()
        ], Component.prototype, "context", null);
        return Component;
    }(Disposable));
    exports.Component = Component;
    buildComponent(Component.prototype);
    /////////////////////////////////////////////////////////////////////////////
    //
    // ts 装饰器支持
    //
    function reactive(type, schema, name, obj) {
        if (type === undefined)
            type = ReactiveTypes.In;
        if (schema !== undefined) {
            if (!(schema instanceof ObservableSchema)) {
                schema = new ObservableSchema(schema);
            }
        }
        if (name === undefined) {
            var decorator = function (proto, propname) {
                makeReactive(type, proto, propname, schema);
            };
            return decorator;
        }
        if (!obj)
            return schema.createObservable(exports.Default);
        makeReactive(type, obj, name, schema);
        return obj[name];
    }
    exports.reactive = reactive;
    function reactiveInfo(obj, name, value) {
        var meta = (obj.$meta);
        if (!meta)
            Object.defineProperty(obj, "$meta", { enumerable: false, configurable: false, writable: false, value: meta = {} });
        var reactiveInfos = meta.reactives || (meta.reactives = {});
        if (!name)
            return reactiveInfos;
        if (value === undefined)
            return reactiveInfos[name];
        return reactiveInfos[name] = value;
    }
    function makeReactive(rtype, obj, name, schema) {
        var info = reactiveInfo(obj, name, { type: rtype, schema: schema });
        var private_name = "$YA__" + name + "__";
        Object.defineProperty(obj, name, { enumerable: true, configurable: false,
            get: function () {
                var ob = this[private_name];
                if (!ob) {
                    if (!info || !info.schema) {
                        console.warn("\u6CA1\u627E\u5230" + name + "\u7684\u5143\u6570\u636E,\u9ED8\u8BA4\u6570\u636E\u4E3AObservable<string>");
                        info.schema = new ObservableSchema("");
                    }
                    ob = info.schema.createObservable(exports.Default);
                    Object.defineProperty(this, private_name, { enumerable: false, configurable: false, writable: false, value: ob });
                }
                return ob.get();
            },
            set: function (value) {
                var ob = this[private_name];
                if (!ob) {
                    if (!info.schema) {
                        console.warn("\u6CA1\u627E\u5230" + name + "\u7684\u5143\u6570\u636E,\u9ED8\u8BA4\u662F\u6309\u7167\u7B2C\u4E00\u6B21\u8D4B\u503C\u4F5C\u4E3A\u6570\u636E\u7ED3\u6784", value);
                        info.schema = new ObservableSchema(value);
                    }
                    ob = info.schema.createObservable();
                    Object.defineProperty(this, private_name, { enumerable: false, configurable: false, writable: false, value: ob });
                }
                return ob.set(value);
            }
        });
    }
    function in_parameter(schema, name, obj) {
        return reactive(ReactiveTypes.In, schema, name, obj);
    }
    exports.in_parameter = in_parameter;
    function out_parameter(schema, name, obj) {
        return reactive(ReactiveTypes.Out, schema, name, obj);
    }
    exports.out_parameter = out_parameter;
    function parameter(schema, name, obj) {
        return reactive(ReactiveTypes.Parameter, schema, name, obj);
    }
    exports.parameter = parameter;
    function internal(schema, name, obj) {
        return reactive(ReactiveTypes.Internal, schema, name, obj);
    }
    exports.internal = internal;
    exports.componentTypes = {};
    function inherits(extendCls, basCls) {
        function __() { this.constructor = extendCls; }
        extendCls.prototype = basCls === null ? Object.create(basCls) : (__.prototype = basCls.prototype, new __());
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
        ComponentGarbage.prototype.attech = function (component) {
            //没有dispose函数的进到垃圾释放器里面来也没用，反而占内存
            //已经释放掉的也不用进来了
            if (component.dispose && !component.$isDisposed)
                this._toBeChecks.push(component);
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
        if (!comp)
            return true;
        var elems = comp.$elements;
        if (elems)
            for (var i = 0, j = elems.length; i < j; i++) {
                var elem = elems[i];
                if (exports.ElementUtility.is_inDocument(elem))
                    return false;
                else if (elem.$__placeholder__ && exports.ElementUtility.is_inDocument(elem.$__placeholder__))
                    return false;
            }
        return true;
    }
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
    exports.attrBinders.if = function (elem, bindValue, vnode, compInstance) {
        bindDomCondition(elem, bindValue, vnode, compInstance, function (e) { return !e; });
    };
    exports.attrBinders["if-not"] = function (elem, bindValue, vnode, compInstance) {
        bindDomCondition(elem, bindValue, vnode, compInstance, function (e) { return e; });
    };
    exports.attrBinders["empty"] = function (elem, bindValue, vnode, compInstance) {
        bindDomCondition(elem, bindValue, vnode, compInstance, function (e) { return !is_empty(e); });
    };
    exports.attrBinders["not-empty"] = function (elem, bindValue, vnode, compInstance) {
        bindDomCondition(elem, bindValue, vnode, compInstance, function (e) { return is_empty(e); });
    };
    function bindDomCondition(elem, bindValue, vnode, compInstance, isShowPlaceholder) {
        var placeholder = exports.ElementUtility.createPlaceholder(elem.id);
        Object.defineProperty(elem, "$__placeholder__", { enumerable: false, writable: false, configurable: false, value: placeholder });
        if (Observable.isObservable(bindValue)) {
            bindValue.subscribe(function (e) {
                if (isShowPlaceholder(e.value)) {
                    exports.ElementUtility.replace(elem, placeholder);
                }
                else
                    exports.ElementUtility.replace(placeholder, elem);
            }, compInstance);
            bindValue = bindValue.get(ObservableModes.Default);
        }
        else {
            var t = typeof bindValue;
            if (t === "function")
                bindValue = bindValue();
        }
        if (isShowPlaceholder(bindValue)) {
            exports.ElementUtility.replace(elem, placeholder);
        }
        ;
    }
    exports.attrBinders.value = function (elem, bindValue, vnode, compInstance) {
        if (Observable.isObservable(bindValue)) {
            exports.ElementUtility.setValue(elem, bindValue.get(ObservableModes.Value));
            bindValue.subscribe(function (e) {
                exports.ElementUtility.setValue(elem, e.value);
            }, compInstance);
        }
        else {
            exports.ElementUtility.setValue(elem, bindValue);
        }
    };
    exports.attrBinders["b-value"] = function (elem, bindValue, vnode, compInstance) {
        if (Observable.isObservable(bindValue)) {
            exports.ElementUtility.setValue(elem, bindValue.get(ObservableModes.Value));
            bindValue.subscribe(function (e) {
                exports.ElementUtility.setValue(elem, e.value);
            }, compInstance);
            exports.ElementUtility.change(elem, function (value) {
                bindValue.set(value);
                bindValue.update();
            });
        }
        else {
            exports.ElementUtility.setValue(elem, bindValue);
        }
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
    function toJson(obj) {
        if (Observable.isObservable(obj))
            obj = obj.get(ObservableModes.Value);
        return JSON.stringify(obj);
    }
    exports.toJson = toJson;
    //=======================================================================
    var YA = {
        Subject: Subject, Disposable: Disposable, ObservableModes: ObservableModes, observableMode: observableMode, proxyMode: proxyMode, Observable: Observable, ObservableObject: ObservableObject, ObservableArray: ObservableArray, ObservableSchema: ObservableSchema,
        observable: observable, enumerator: variable,
        createElement: exports.createElement, createDescriptor: createDescriptor, createElements: createElements, createComponent: createComponent, EVENT: exports.EVENT,
        bindDomAttr: bindDomAttr, attrBinders: exports.attrBinders, componentInfos: exports.componentTypes,
        not: not, computed: exports.computed,
        ElementUtility: exports.ElementUtility,
        Component: Component, reactive: reactive, ReactiveTypes: ReactiveTypes,
        intimate: implicit, clone: clone, Promise: Promise, trim: trim, is_array: is_array, is_assoc: is_assoc, is_empty: is_empty, Default: exports.Default, toJson: toJson, queryString: queryString
    };
    if (typeof window !== 'undefined')
        window.YA = YA;
    exports.default = YA;
});
//# sourceMappingURL=YA.core.js.map