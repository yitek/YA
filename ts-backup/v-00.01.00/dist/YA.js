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
    if (typeof Proxy === "undefined")
        throw new Error("YA框架使用了当前浏览器不支持的内置对象Proxy");
    ////////////////////////////////////////////////////////////////////////////////////
    //
    // 类型判断
    //
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
    function implicit(target, props, applyFunc) {
        var make = function (target, name, applyFunc) {
            //如果放在函数上，就是对函数的prototype做设置
            var proto = typeof target === "function" ? (applyFunc ? target : target.prototype) : target;
            if (name !== undefined) {
                var t = typeof name;
                if (t === "string") {
                    // @implicit放在成员上
                    // implicit({},"prop") 调用
                    Object.defineProperty(proto, name, { configurable: false, writable: true, enumerable: false, value: proto[name] });
                }
                else if (t === "object") {
                    if (is_array(name)) {
                        // implicit({},["prop1","prop2"])用法
                        for (var i in name) {
                            var n = name[i];
                            Object.defineProperty(proto, n, { configurable: false, writable: true, enumerable: false, value: proto[n] });
                        }
                    }
                    else {
                        // implict({},{"prop":initValue})用法
                        for (var n in name) {
                            Object.defineProperty(proto, n, { configurable: false, writable: true, enumerable: false, value: name[n] });
                        }
                    }
                }
            }
            else {
                for (var n in proto) {
                    Object.defineProperty(proto, n, { configurable: false, writable: true, enumerable: false, value: proto[n] });
                }
            }
            return target;
        };
        //@implicit放在属性位置
        if (target === undefined)
            return make;
        //普通函数调用
        return make(target, props, applyFunc);
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
        ObservableModes[ObservableModes["Raw"] = 2] = "Raw";
        ObservableModes[ObservableModes["Observable"] = 3] = "Observable";
        ObservableModes[ObservableModes["Proxy"] = 4] = "Proxy";
        ObservableModes[ObservableModes["Agent"] = 5] = "Agent";
        //--------
        /**
         * 设置值之后立即触发更新
         */
        ObservableModes[ObservableModes["Imediately"] = 6] = "Imediately";
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
            var obType = ObservableTypes.Value;
            if (typeof value === "object") {
                if (is_array(value))
                    obType = ObservableTypes.Array;
                else
                    obType = ObservableTypes.Object;
            }
            implicit(this, {
                $ob_name: name,
                $ob_type: obType,
                $__ob_target__: target || {},
                $__ob_value__: undefined,
                $__ob_modified__: undefined
            });
        }
        Observable_1 = Observable;
        Observable.prototype.get = function (mode) {
            if (mode === undefined)
                mode = Observable_1.gettingMode;
            if (mode === ObservableModes.Default || mode === ObservableModes.Value) {
                var value = this.$__ob_modified__;
                if (value === undefined) {
                    value = this.$__ob_value__;
                    if (value === undefined) {
                        value = this.$ob_target[this.$__ob_name__];
                        this.$__ob_value__ = value === undefined ? Undefined : value;
                        return value;
                    }
                }
                return value === Undefined ? undefined : value;
            }
            else if (mode === ObservableModes.Raw) {
                return this.$ob_target[this.$__ob_name__];
            }
            return this;
        };
        Observable.prototype.set = function (value, mode) {
            var old = this.$ob_value;
            if (old === Undefined)
                old = undefined;
            if (value === old)
                return this;
            this.$__ob_modified__ = value === undefined ? Undefined : value;
            if (mode === undefined)
                mode = Observable_1.settingMode;
            if (mode === ObservableModes.Imediately || mode === ObservableModes.Default) {
                this.update();
            }
        };
        Observable.prototype.update = function (src) {
            if (this.$__ob_modified__ === undefined)
                return this;
            var old = this.$ob_value;
            var value = this.$__ob_modified__;
            if (value === Undefined)
                value = undefined;
            var evtArgs = {
                value: value,
                old: old,
                sender: this,
                src: src === undefined ? this : src
            };
            //清除掉修改的值
            this.$__ob_modified__ = undefined;
            //设置当前的确定的值
            this.$__ob_value__ = this.$ob_target[this.$ob_name] = value;
            //发送通知
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
            var privateName = "$m__" + name + "__";
            Object.defineProperty(this, name, {
                get: function () {
                    var propOb = _this[privateName];
                    if (!propOb) {
                        propOb = new Observable_1(value, _this.get(), name);
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
        Observable.prototype._resetTarget = function (target, name, mode) {
            var currentTarget = this.$ob_target;
            if (target instanceof Observable_1) {
                this.$ob_own = target;
                target = target.get(ObservableModes.Value);
            }
            //如果一致，就不用做什么额外的操作
            if (currentTarget == target)
                return this;
            var old = this.$ob_value;
            var value = target[this.$ob_name];
            //替换后得到的值跟原先的值一样，就什么都不做
            if (old === value)
                return this;
            //注意:这里灭有修改 $__ob_value__的值，该字段还保留着原先的对象上的值
            this.$__ob_modified__ = value;
            if (mode === undefined)
                mode = Observable_1.settingMode;
            if (mode === ObservableModes.Imediately || mode === ObservableModes.Default) {
                this.update();
            }
            return this;
        };
        Observable.prototype._resetName = function (name, mode) {
            var oldname = this.$__ob_name__;
            if (name === oldname)
                return this;
            this.$__ob_name__ = name;
        };
        var Observable_1;
        Observable.gettingMode = ObservableModes.Default;
        Observable.settingMode = ObservableModes.Default;
        Observable = Observable_1 = __decorate([
            implicit()
        ], Observable);
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
//# sourceMappingURL=YA.js.map