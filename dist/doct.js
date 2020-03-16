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
    /**
     * unittest类或unittest方法的装饰器
     *
     * @param {string} name
     */
    function doct(info, target) {
        var callAsDecorator = target === undefined;
        var decorator = function (target, propname) {
            if (propname === undefined) {
                //定义测试类/测试对象
                var cls = void 0;
                if (typeof target === 'object') {
                    cls = function () { };
                    cls.prototype = target;
                }
                else
                    cls = target;
                var clsInfo_1 = new ClassInfo(cls, info);
                if (exports.Doct.autoRun) {
                    setTimeout(function () {
                        var logger = exports.Doct.logger || new HtmlLogger();
                        executeClass(clsInfo_1, logger);
                    }, 0);
                }
                if (!callAsDecorator)
                    return clsInfo_1;
            }
            else {
                var clsInfo = target.$__doctClass__;
                if (!clsInfo) {
                    var members = target.$__doctMethods__;
                    if (!members)
                        Object.defineProperty(target, "$__doctMethods__", { enumerable: false, writable: false, configurable: false, value: members = {} });
                    members[propname] = info;
                }
                else {
                    var methodInfo = new MethodInfo(propname, clsInfo, info);
                    clsInfo.methods[propname] = methodInfo;
                    if (!callAsDecorator)
                        return methodInfo;
                }
            }
        };
        //被当作装饰器使用
        if (target === undefined)
            return decorator;
        return decorator(target);
    }
    exports.doct = doct;
    exports.Doct = doct;
    exports.Doct.createDemoElement = function (immediate) {
        var elem = document.createElement("div");
        if (!immediate)
            elem.style.cssText = "position:absolute;visibility:hidden;z-index:-1000;";
        document.body.appendChild(elem);
        return elem;
    };
    exports.Doct.disposeDemoElement = function (elem) {
        if (elem) {
            elem.style.cssText = "";
            if (!elem.$__doctCustomDispose__)
                elem.parentNode.removeChild(elem);
        }
        return elem;
    };
    exports.Doct.hasDemo = function (demoElement) { return demoElement ? demoElement.hasChildNodes() : false; };
    exports.Doct.debugging = true;
    exports.Doct.useDemo = true;
    exports.Doct.autoRun = true;
    var BasInfo = /** @class */ (function () {
        function BasInfo(info) {
            this.title = info.title;
            this.descriptions = (typeof info.descriptions === "string" ? [info.descriptions] : info.descriptions) || [];
            this.notices = (typeof info.notices === "string" ? [info.notices] : info.notices) || [];
        }
        return BasInfo;
    }());
    exports.BasInfo = BasInfo;
    var ClassInfo = /** @class */ (function (_super) {
        __extends(ClassInfo, _super);
        function ClassInfo(ctor, info) {
            var _this = _super.call(this, info) || this;
            _this.ctor = ctor;
            var existed = _this.ctor.prototype.$__meta__;
            if (existed) {
                if (existed instanceof ClassInfo)
                    throw new Error("重复调用了doct??");
                _this.methods = existed.methods;
            }
            if (!_this.methods)
                _this.methods = {};
            Object.defineProperty(_this.ctor.prototype, "$__meta__", { enumerable: false, configurable: false, writable: false, value: _this });
            var members = _this.ctor.prototype.$__doctMethods__;
            if (members)
                for (var n in members) {
                    var methodInfo = new MethodInfo(n, _this, members[n]);
                    _this.methods[n] = methodInfo;
                }
            return _this;
        }
        /**
         * 手动添加某些方法为测试方法
         *
         * @param {(string|string[])} methodname
         * @memberof BasInfo
         */
        ClassInfo.prototype.method = function (info) {
            this.methods[info.name] = new MethodInfo(info.name, this, info);
            return this;
        };
        return ClassInfo;
    }(BasInfo));
    exports.ClassInfo = ClassInfo;
    var MethodInfo = /** @class */ (function (_super) {
        __extends(MethodInfo, _super);
        function MethodInfo(name, clsInfo, info) {
            var _this = _super.call(this, info) || this;
            _this.name = name;
            _this.classInfo = clsInfo;
            _this.method = clsInfo.ctor.prototype[name];
            if (typeof _this.method !== 'function')
                throw new Error("\u65E0\u6CD5\u5728\u7C7B/\u5BF9\u8C61\u4E0A\u627E\u5230\u65B9\u6CD5" + name);
            _this.codes = _this._makeCodes(_this.method);
            return _this;
        }
        MethodInfo.prototype._makeCodes = function (func) {
            var trimRegx = /(^\s+)|(\s+$)/g;
            //assert是用function开头
            var assert_proc_name_regx = /^function\s*\(([^\)]+)\s*\)\s*\{/;
            var statement_proc = func.toString();
            var assert_proc_name_match = statement_proc.match(assert_proc_name_regx);
            var assert_proce_name = assert_proc_name_match[1];
            if (!assert_proce_name)
                return [statement_proc.substring(assert_proc_name_match[0].length, statement_proc.length - 1)];
            var codes = [];
            var assert_proc_regx = new RegExp("[;\\s]?" + assert_proce_name.split(',')[0].replace(trimRegx, "") + "\\s?\\(");
            statement_proc = statement_proc.substring(assert_proc_name_match[0].length, statement_proc.length - 1);
            var stateBeginAt = 0;
            //let codes = "";
            var c = 0;
            while (true) {
                if (c++ === 10) {
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
            return codes;
        };
        return MethodInfo;
    }(BasInfo));
    exports.MethodInfo = MethodInfo;
    var AssertException = /** @class */ (function (_super) {
        __extends(AssertException, _super);
        function AssertException(msg, outerMessage) {
            var _this = _super.call(this, msg) || this;
            _this.outerMessage = outerMessage;
            return _this;
        }
        AssertException.prototype.toString = function () {
            if (this.outerMessage)
                return this.outerMessage;
            return _super.prototype.toString.call(this);
        };
        return AssertException;
    }(Error));
    exports.AssertException = AssertException;
    function executeClass(clsInfo, logger) {
        logger.beginClass(clsInfo);
        try {
            var instance = new clsInfo.ctor();
            var rs = {};
            for (var n in clsInfo.methods) {
                rs[n] = executeMethod(instance, clsInfo.methods[n], logger);
            }
            return rs;
        }
        finally {
            logger.endClass(clsInfo);
        }
    }
    function executeMethod(instance, methodInfo, logger) {
        var record = { methodInfo: methodInfo, beginTime: new Date(), executeInfos: [] };
        var end;
        var index = 0;
        var assert_proc = function (assert_statement) {
            end = record.endTime = new Date();
            record.ellapse = record.endTime.valueOf() - record.beginTime.valueOf();
            assert_statement(makeAssert(methodInfo, index++, record));
        };
        var demoElement = exports.Doct.useDemo && exports.Doct.createDemoElement ? exports.Doct.createDemoElement(exports.Doct.useDemo === "immediate") : null;
        record.demoElement = demoElement;
        logger.beginMethod(record);
        try {
            if (doct.debugging) {
                methodInfo.method.call(instance, assert_proc, demoElement);
            }
            else {
                try {
                    this.statement.call(this, assert_proc, demoElement);
                }
                catch (ex) {
                    record.errorDetail = ex;
                }
            }
        }
        finally {
            if (end === undefined) {
                end = record.endTime = new Date();
                record.ellapse = record.endTime.valueOf() - record.beginTime.valueOf();
            }
            if (demoElement && exports.Doct.useDemo) {
                exports.Doct.disposeDemoElement(demoElement);
                if (!exports.Doct.hasDemo(demoElement))
                    record.demoElement = null;
            }
            logger.endMethod(record);
        }
        return record;
    }
    function makeAssert(doc, codeIndex, record) {
        var code = doc.codes[codeIndex];
        var assert = function (expected, actual, msg, paths) {
            if (!record.executeInfos)
                record.executeInfos = [];
            var assertInfo = record.executeInfos[codeIndex];
            if (!assertInfo)
                assertInfo = record.executeInfos[codeIndex] = { code: code, asserts: [] };
            var asserts = assertInfo.asserts;
            if (msg === undefined && typeof expected === "boolean" && typeof actual === "string") {
                msg = actual;
                actual = expected;
                expected = true;
            }
            if (!paths && msg)
                msg = msg.replace(/\{actual\}/g, JSON.stringify(actual)).replace(/\{expected\}/g, JSON.stringify(expected));
            if (actual === expected) {
                if (msg)
                    asserts.push(msg);
                return;
            }
            var t = typeof (expected);
            if (t === "object") {
                paths || (paths = []);
                //let nullMsg = msg || "期望有值";
                if (!actual)
                    throw new AssertException(paths.join(".") + "不应为空.", msg);
                for (var n in expected) {
                    paths.push(n);
                    var expectedValue = expected[n];
                    var actualValue = actual[n];
                    if (typeof expectedValue === "object") {
                        assert(actualValue, expectedValue, msg, paths);
                    }
                    else {
                        if (actualValue !== expectedValue) {
                            throw new AssertException((paths ? paths.join(".") : "") + "\u671F\u671B\u503C\u4E3A" + expectedValue + ",\u5B9E\u9645\u4E3A" + actualValue, msg);
                        }
                    }
                    paths.pop();
                }
                if (msg && !paths.length) {
                    asserts.push(msg);
                }
            }
            else if (actual !== expected) {
                throw new AssertException((paths ? paths.join(".") : "") + "\u671F\u671B\u503C\u4E3A" + expected + ",\u5B9E\u9645\u4E3A" + actual, msg);
            }
            else {
                if (msg && !paths) {
                    asserts.push(msg);
                }
            }
        };
        return assert;
    }
    ////////////////////
    // 日志
    var HtmlLogger = /** @class */ (function () {
        function HtmlLogger(container) {
            if (!container) {
                try {
                    container = document.body;
                }
                catch (ex) { }
            }
            this.container = container;
        }
        HtmlLogger.prototype.beginClass = function (clsInfo) {
            var dlist = makeBas(clsInfo, "doct", this.container);
            var dt = createElement("dt", "usages", dlist, "用法说明");
            var dd = createElement("dd", "usages", dlist);
            this._usagesElement = createElement("ol", "usages", dd);
            return this;
        };
        HtmlLogger.prototype.beginMethod = function (record) {
            var li = createElement("li", "usage", this._usagesElement);
            this._usageElement = makeBas(record.methodInfo, "usage", li);
            return this;
        };
        HtmlLogger.prototype.endMethod = function (record) {
            if (record.executeInfos.length == 0) {
                this._usageElement = null;
                return this;
            }
            var dt = createElement("dt", "codes", this._usageElement);
            dt.innerHTML = "代码";
            var dd = createElement("dd", "codes", this._usageElement);
            var codes = createElement("ul", "codes", dd);
            for (var i in record.executeInfos) {
                var execuetInfo = record.executeInfos[i];
                var codeli = createElement("li", "code", codes);
                var cd = createElement("code", "code", codeli);
                var pre = createElement("pre", "code", cd);
                pre.innerHTML = execuetInfo.code;
                if (execuetInfo.asserts.length) {
                    var asserts = createElement("ol", "asserts", codeli);
                    createElement("li", "comment", asserts, "/*");
                    for (var j in execuetInfo.asserts) {
                        var assertLi = createElement("li", "assert", asserts, execuetInfo.asserts[j]);
                    }
                    createElement("li", "comment", asserts, "*/");
                }
            }
            if (record.demoElement) {
                var dt_1 = createElement("dt", "codes", this._usageElement);
                dt_1.innerHTML = "示例";
                var dd_1 = createElement("dd", "codes", this._usageElement);
                dd_1.appendChild(record.demoElement);
                record.demoElement.__doctCustomDispose__ = true;
            }
            return this;
        };
        HtmlLogger.prototype.endClass = function (clsInfo) {
            if (!this._usagesElement.hasChildNodes())
                this._usagesElement.parentNode.removeChild(this._usagesElement);
            return this;
        };
        return HtmlLogger;
    }());
    exports.HtmlLogger = HtmlLogger;
    function createElement(tag, cls, parent, content) {
        var elem = document.createElement(tag);
        if (cls)
            elem.className = cls;
        if (parent)
            parent.appendChild(elem);
        if (content)
            elem.innerHTML = content;
        return elem;
    }
    ;
    function makeBas(basInfo, cls, p) {
        var fs = createElement("fieldset", cls, p);
        var legend = createElement("legend", cls, fs, basInfo.title);
        var dlist = createElement("dl", cls, fs);
        if (basInfo.descriptions.length) {
            var dt = createElement("dt", "descriptions", dlist, "说明");
            var dd = createElement("dd", "descriptions", dlist);
            for (var i in basInfo.descriptions) {
                var content = basInfo.descriptions[i];
                if (content && (content = content.replace(/(^\s+)|(\s+$)/g, "")))
                    createElement("p", "", dd).innerHTML = content;
            }
        }
        if (basInfo.notices.length) {
            var dt = createElement("dt", "notices", dlist, "注意");
            var dd = createElement("dd", "notices", dlist);
            var ol = createElement("ol", "notices", dd);
            for (var i in basInfo.notices) {
                var content = basInfo.notices[i];
                if (content && (content = content.replace(/(^\s+)|(\s+$)/g, "")))
                    createElement("li", "", ol).innerHTML = content;
            }
        }
        return dlist;
    }
});
//# sourceMappingURL=doct.js.map