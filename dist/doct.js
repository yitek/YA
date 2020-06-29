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
    var AssertException = /** @class */ (function (_super) {
        __extends(AssertException, _super);
        function AssertException(type, message, params) {
            var _this = _super.call(this, buildMessage(message, params)) || this;
            _this.type = type;
            _this.params = params;
            _this.result = false;
            return _this;
        }
        return AssertException;
    }(Error));
    exports.AssertException = AssertException;
    var Assert = /** @class */ (function () {
        function Assert() {
            this.outputs = [];
        }
        Assert.prototype.eq = function (actual, expected, message) {
            return this._checkAndRecord("eq", message, { actual: actual, expected: expected }, function (p) { return actual === expected; });
        };
        Assert.prototype.neq = function (actual, expected, message) {
            return this._checkAndRecord("neq", message, { actual: actual, expected: expected }, function (p) { return actual !== expected; });
        };
        Assert.prototype.hasKey = function (key, assoc, message) {
            return this._checkAndRecord("hasKey", message, { key: key, assoc: assoc }, function (p) {
                for (var n in assoc)
                    if (n === key)
                        return true;
                return false;
            });
        };
        Assert.prototype.hasValue = function (value, assoc, message) {
            return this._checkAndRecord("hasValue", message, { value: value, assoc: assoc }, function (p) {
                for (var n in assoc)
                    if (assoc[n] === value)
                        return true;
                return false;
            });
        };
        Assert.prototype.contains = function (key, subject, message) {
            return this._checkAndRecord("neq", message, { key: key, subject: subject }, function (p) {
                if (!subject)
                    return false;
                if (typeof subject === "string")
                    return subject.indexOf(key) >= 0;
                if (subject[key] !== undefined)
                    return true;
                return false;
            });
        };
        Assert.prototype.True = function (value, message) {
            return this._checkAndRecord("True", message, { value: value }, function (p) { return value === true; });
        };
        Assert.prototype.False = function (value, message) {
            return this._checkAndRecord("False", message, { value: value }, function (p) { return value === false; });
        };
        Assert.prototype.Null = function (value, message) {
            return this._checkAndRecord("Null", message, { value: value }, function (p) { return value === null; });
        };
        Assert.prototype.Undefined = function (value, message) {
            return this._checkAndRecord("Undefined", message, { value: value }, function (p) { return value === undefined; });
        };
        Assert.prototype.isset = function (value, message) {
            return this._checkAndRecord("isset", message, { value: value }, function (p) { return value; });
        };
        Assert.prototype.unset = function (value, message) {
            return this._checkAndRecord("unset", message, { value: value }, function (p) { return !value; });
        };
        Assert.prototype.empty = function (value, message) {
            return this._checkAndRecord("empty", message, { value: value }, function (p) { return empty(value); });
        };
        Assert.prototype.notEmpty = function (value, message) {
            return this._checkAndRecord("notEmpty", message, { value: value }, function (p) { return !empty(value); });
        };
        Assert.prototype._checkAndRecord = function (type, message, params, checker) {
            var rs;
            if (!checker(params)) {
                rs = new AssertException(type, message, params);
                if (this._debugging())
                    throw rs;
            }
            else {
                rs = { type: type, message: buildMessage(message, params), result: true, params: params };
            }
            if (rs.result && this._recordSuccessInfo()) {
                this.outputs.push({
                    contentType: "text/assert-pass",
                    content: rs.message
                });
            }
            else {
                this.outputs.push({
                    contentType: "text/assert-fail",
                    content: rs.message
                });
            }
            return this;
        };
        /**
         * 是否是调试状态，如果是，断言不通过会抛出异常
         *
         * @private
         * @returns {boolean}
         * @memberof Assert
         */
        Assert.prototype._debugging = function () {
            return exports.Doct.debugging;
        };
        /**
         * 是否会记录成功的断言
         *
         * @private
         * @returns {boolean}
         * @memberof Assert
         */
        Assert.prototype._recordSuccessInfo = function () { return true; };
        return Assert;
    }());
    function buildMessage(message, params) {
        if (!params)
            return message;
        return message.replace(branceRegx, function (match) {
            var name = match[1].replace(trimRegx, "");
            var val = params[name];
            return val;
        });
    }
    function empty(value) {
        if (value === null || value === undefined)
            return true;
        var t = typeof value;
        if (t === "function" || t === "object") {
            for (var n in value) {
                return false;
            }
            return true;
        }
        return false;
    }
    var branceRegx = /\{\s*([a-zA-Z0-9_\-\$]+)\s*\}/;
    var TestMethod = /** @class */ (function () {
        function TestMethod(raw, name) {
            this.raw = raw;
            this.name = name;
            this.descriptor = raw[exports.Doct.descriptorToken] || {};
        }
        TestMethod.prototype._initCodes = function () {
            if (this._codes)
                return this._codes;
            var statement_proc = this.raw.toString();
            var assert_proc_name_match = statement_proc.match(assert_proc_name_regx);
            var assert_proce_name = assert_proc_name_match[1];
            if (!assert_proce_name) {
                this._codes = [statement_proc.substring(assert_proc_name_match[0].length, statement_proc.length - 1)];
                return;
            }
            var codes = this._codes = [];
            var assert_proc_regx = new RegExp("[;\\s]?" + assert_proce_name.split(',')[0].replace(trimRegx, "") + "\\s?\\(");
            statement_proc = statement_proc.substring(assert_proc_name_match[0].length, statement_proc.length - 1);
            var stateBeginAt = 0;
            var c = 0;
            while (true) {
                if (c++ === 10) {
                    console.error("已经进入无穷循环了，代码有问题。");
                    debugger;
                    break;
                }
                //let match = assert_proc_regx.exec(statement_proc);
                var match = statement_proc.match(assert_proc_regx);
                if (match) {
                    var matchAt = match.index;
                    var stateCode = statement_proc.substring(stateBeginAt, matchAt);
                    if (stateCode)
                        codes.push(stateCode);
                    var branceCount = 1;
                    var isInStr = void 0;
                    for (var i = matchAt + match[0].length, j = statement_proc.length; i < j; i++) {
                        var ch = statement_proc[i];
                        if (ch === ")") {
                            if (isInStr)
                                continue;
                            if (--branceCount == 0) {
                                statement_proc = statement_proc.substring(i + 1).replace(/^\s*;?/g, "");
                                stateBeginAt = 0;
                                break;
                            }
                        }
                        else if (ch === "(") {
                            if (isInStr)
                                continue;
                            branceCount++;
                        }
                        else if (ch === "'" || ch === '"') {
                            if (ch === isInStr)
                                isInStr = undefined;
                            else if (!isInStr)
                                isInStr = ch;
                            else
                                continue;
                        }
                    }
                    if (branceCount)
                        throw new Error("无法解析的函数");
                }
                else {
                    var stateCode = statement_proc.substring(stateBeginAt, statement_proc.length - 1);
                    if (stateCode)
                        codes.push(stateCode);
                    break;
                }
            }
            return this._codes;
        };
        TestMethod.prototype.build = function () {
            var _this = this;
            if (this._wrappedMethod)
                return this._wrappedMethod;
            this._initCodes();
            var wrapped = function (self, context) {
                var step = 0;
                var fragments = [];
                var assert;
                var test = function (statement) {
                    //上次调用的test产生的assert
                    if (assert && assert.outputs.length) {
                        fragments.push({
                            contentType: "asserts",
                            content: assert.outputs
                        });
                    }
                    assert = new Assert();
                    fragments.push({
                        language: "js",
                        content: _this._codes[step]
                    });
                    step++;
                };
                _this.raw.call(self, test, context);
                fragments.push({
                    language: "js",
                    content: _this._codes[step]
                });
                return { contentType: "test-method-return", content: fragments };
            };
            return this._wrappedMethod = wrapped;
        };
        TestMethod.prototype.call = function (context, self) {
            return this.build().call(self, self, context);
        };
        return TestMethod;
    }());
    exports.TestMethod = TestMethod;
    var trimRegx = /(^\s+)|(\s+$)/g;
    //assert是用function开头
    var assert_proc_name_regx = /^function\s*\(([^\)]+)\s*\)\s*\{/;
    var TestClass = /** @class */ (function () {
        function TestClass(ctor) {
            this.ctor = ctor;
            this.methods = {};
            this.descriptor = this.ctor[exports.Doct.descriptorToken] || {};
            exports.Doct.testClasses.push(this);
            tryDeferExecute();
        }
        TestClass.prototype.run = function () {
            var docClass = this.buildDescriptor(this.descriptor);
            if (exports.Doct.classExecuting)
                exports.Doct.classExecuting(this);
            var instance = new this.ctor();
            var docMembers = {
                contentType: "test-methods",
                content: []
            };
            docClass.content.push(docMembers);
            var debugging = typeof exports.Doct.debugging === "string" ? exports.Doct.debugging.replace(trimRegx, "") : null;
            for (var n in instance) {
                if (debugging && n.indexOf(debugging) < 0)
                    continue;
                var method = instance[n];
                var methodDescriptor = void 0;
                if (method && (methodDescriptor = method[exports.Doct.descriptorToken])) {
                    var docMethod = this.buildDescriptor(methodDescriptor);
                    if (!docMethod.title)
                        docMethod.title = n;
                    var testMethod = this.methods[n] = new TestMethod(method);
                    var opts = {
                        testMethod: testMethod,
                        testClass: this,
                        instance: instance
                    };
                    var context = opts.context = exports.Doct.methodExecuting ? exports.Doct.methodExecuting(opts) : undefined;
                    var methodSection = testMethod.call(instance, context);
                    if (exports.Doct.methodExecuted)
                        exports.Doct.methodExecuted(methodSection, opts);
                    docMembers.content.push(methodSection);
                }
            }
            if (exports.Doct.classExecuted)
                exports.Doct.classExecuted(docClass, this);
            return docClass;
        };
        TestClass.prototype.buildDescriptor = function (descriptor) {
            var fragment = {
                title: descriptor.title,
                content: []
            };
            if (descriptor.description) {
                var section = { contentType: "description" };
                this.buildSectionContents(section, descriptor.description);
            }
            if (descriptor.notice) {
                var section = { contentType: "description", content: [] };
                this.buildSectionContents(section, descriptor.notice);
            }
            return fragment;
        };
        TestClass.prototype.buildSectionContents = function (section, desContent) {
            if (desContent && desContent.push && desContent.pop) {
                var subs = void 0;
                if (!section.content)
                    subs = section.content = [];
                if (!section.content.push)
                    subs = section.content = [section.content];
                else
                    subs = section.content;
                for (var _i = 0, desContent_1 = desContent; _i < desContent_1.length; _i++) {
                    var c = desContent_1[_i];
                    if (c === undefined || c === null)
                        continue;
                    if (c.push && c.pop) {
                        var sub = {};
                        subs.push(sub);
                        this.buildSectionContents(sub, c);
                    }
                    else
                        subs.push(c);
                }
            }
        };
        return TestClass;
    }());
    exports.TestClass = TestClass;
    function doct(descriptor) {
        return function (subject, propname) {
            if (propname === undefined) {
                subject[exports.Doct.descriptorToken] = descriptor || {};
            }
            else {
                var method = subject[propname];
                method[exports.Doct.descriptorToken] = descriptor || {};
            }
        };
    }
    exports.doct = doct;
    exports.Doct = doct;
    exports.Doct.debugging = true;
    exports.Doct.descriptorToken = "$__doct_descriptor__";
    exports.Doct.autoRun = true;
    exports.Doct.testClasses = [];
    var tick;
    function tryDeferExecute() {
        if (exports.Doct.autoRun) {
            if (!tick)
                tick = setTimeout(function () {
                    for (var _i = 0, _a = exports.Doct.testClasses; _i < _a.length; _i++) {
                        var cls = _a[_i];
                        var rs = cls.run();
                    }
                }, 0);
        }
        else {
            if (tick) {
                clearTimeout(tick);
                tick = 0;
            }
        }
    }
});
//# sourceMappingURL=doct.js.map