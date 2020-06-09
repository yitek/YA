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
    if (typeof Proxy === "undefined")
        throw new Error("YA框架使用了当前浏览器不支持的内置对象Proxy");
    ////////////////////////////////////////////////////////////////////////////////////
    //
    // 一些扩展
    //
    ////////////////////////////////////////////////////////////////////////////////////
    //
    // Object.defineProperty的一些辅助函数
    //
    /**
     * 隐式成员
     * 批量设置 {enumerable:false,configurable:false,writable:true,value:??}
     *
     * @param {*} target
     * @param {*} props
     */
    function implicit(target, props) {
        var make = function (target, name) {
            var proto = typeof target === "function" ? target.prototype : target;
            if (name !== undefined) {
                Object.defineProperty(proto, name, { configurable: false, writable: true, enumerable: false, value: proto[name] });
            }
            else {
                for (var n in proto) {
                    Object.defineProperty(proto, n, { configurable: false, writable: true, enumerable: false, value: proto[n] });
                }
            }
        };
        //@implicit用法
        if (target === undefined)
            return make;
        //普通函数调用
        if ()
            ;
    }
    var _seed;
    function ain() {
        if (++_seed > 2100000000)
            _seed = -210000000;
        return _seed;
    }
    var Undefined = {};
    ////////////////////////////////////////////////////////////////////////////////////
    //
    // YA.Observable
    //
    var ObservableModes;
    (function (ObservableModes) {
        ObservableModes[ObservableModes["Default"] = 0] = "Default";
        ObservableModes[ObservableModes["Value"] = 1] = "Value";
        ObservableModes[ObservableModes["Observable"] = 2] = "Observable";
        ObservableModes[ObservableModes["Proxy"] = 3] = "Proxy";
        ObservableModes[ObservableModes["Agent"] = 4] = "Agent";
        //--------
        /**
         * 设置值之后立即触发更新
         */
        ObservableModes[ObservableModes["Imediately"] = 5] = "Imediately";
    })(ObservableModes || (ObservableModes = {}));
    var ObservableTypes;
    (function (ObservableTypes) {
        ObservableTypes[ObservableTypes["Value"] = 0] = "Value";
        ObservableTypes[ObservableTypes["Object"] = 1] = "Object";
        ObservableTypes[ObservableTypes["Array"] = 2] = "Array";
    })(ObservableTypes || (ObservableTypes = {}));
    var Observable = /** @class */ (function () {
        function Observable(value, name, target) {
            if (name === undefined)
                name = "OB-" + ain();
            Object.defineProperty(this, "$ob_name", { enumerable: false, configurable: false, value: name });
            Object.defineProperty(this, "$__ob_value__", { enumerable: false, configurable: false, value: value === undefined ? Undefined : value });
            Object.defineProperty(this, "$__ob_value__", { enumerable: false, configurable: false, value: value === undefined ? Undefined : value });
            this.$ob_target = target || {};
            var obType = ObservableTypes.Value;
            Object.defineProperty(this, "$ob_type", { enumerable: false, configurable: false, value: obType });
        }
        Observable.prototype.get = function (mode) {
            if (mode === undefined)
                mode = Observable.gettingMode;
            if (mode === ObservableModes.Default || mode === ObservableModes.Value) {
                if (this.$__ob_value__ === undefined) {
                    return this.$ob_target[this.$__ob_name__];
                }
                return this.$__ob_value__;
            }
            return this;
        };
        Observable.prototype.set = function (value, mode) {
            var old = this.$ob_target[this.$__ob_name__];
            if (value === old)
                return this;
            this.$__ob_value__ = value;
            if (mode === undefined)
                mode = Observable.settingMode;
            if (mode === ObservableModes.Imediately || mode === ObservableModes.Default) {
                this.update();
            }
        };
        Observable.prototype.update = function () {
            return this;
        };
        Observable.prototype.asObject = function () {
            if (this.$ob_proxy)
                return this.$ob_proxy;
            var proxy = new Proxy(this, ProxyHandle);
            Object.defineProperty(this, "$ob_proxy", { enumerable: false, configurable: false, writable: false, value: proxy });
            return proxy;
        };
        Observable.prototype.defineProperty = function (name, value) {
            var _this = this;
            var privateName = "$__" + name + "__";
            Object.defineProperty(this, name, {
                get: function () {
                    var propOb = _this[privateName];
                    if (!propOb) {
                        propOb = new Observable(value, _this.get(), name);
                        Object.defineProperty(_this, privateName, { enumerable: true, configurable: false, writable: false, value: propOb });
                    }
                    return propOb.get();
                }
            });
        };
        /**
         * ObservableObject.set(value)的时候，会更新所有的成员
         *
         * @param {*} target
         * @memberof Observable
         */
        Observable.prototype._resetTarget = function (target, mode) {
            var old = this.$__ob_value__ === undefined ? this.$ob_target[this.$ob_name] : this.$__ob_value__;
            if (old)
                return this;
        };
        Observable.gettingMode = ObservableModes.Default;
        Observable.settingMode = ObservableModes.Default;
        return Observable;
    }());
    exports.Observable = Observable;
    //target如果是observable，它会延迟加载
    Object.defineProperty(Observable.prototype, "$ob_target", {
        enumerable: false, configurable: false,
        get: function () {
            var value = this["$__ob__target__"];
            if (isObservable(value)) {
                value = this["$__ob__target__"] = value.get(ObservableModes.Value);
            }
            return value;
        },
        set: function (value) {
            var prop = Object.getOwnPropertyDescriptor(this, "$__ob__target__");
            if (!prop || prop.enumerable)
                Object.defineProperty(this, "$__ob__target__", {
                    enumerable: false, configurable: false, value: value
                });
            else {
                console.warn("做了一个危险的操作，直接替换掉了observable.$ob_target,极大可能引起未知错误");
                this["$__ob__target__"] = value;
            }
        }
    });
    function isObservable(obj) {
        var rs = obj instanceof Observable;
        return rs;
    }
    var ObservableObject = {
        get: function (mode) {
            if (mode === undefined)
                mode = Observable.gettingMode;
            if (mode === ObservableModes.Default || mode === ObservableModes.Proxy) {
                return this.$ob_proxy;
            }
            else if (mode === ObservableModes.Value) {
                if (this.$__ob_value__ === undefined) {
                    return this.$ob_target[this.$__ob_name__];
                }
                return this.$__ob_value__;
            }
            return this;
        },
        set: function (value, mode) {
            var old = this.$ob_target[this.$__ob_name__];
            value || (value = {});
            if (value === old)
                return this;
            this.$__ob_value__ = value;
            if (mode === undefined)
                mode = Observable.settingMode;
            if (mode === ObservableModes.Imediately || mode === ObservableModes.Default) {
                this.update();
            }
            for (var n in this) {
                var obProp = this[n];
                if (obProp instanceof Observable) {
                    obProp.$ob_target = value;
                }
            }
        }
    };
    var ProxyHandle = {
        get: function (target, name) {
            var exist = target[name];
            if (!exist) {
                exist = target.defineProperty(name);
            }
            return exist.get();
        },
        set: function (target, name, value) {
            var exist = target[name];
            if (!exist) {
                exist = target.defineProperty(name, value);
                return;
            }
            return exist.set(value);
        }
    };
});
//# sourceMappingURL=YA.core.observable.js.map