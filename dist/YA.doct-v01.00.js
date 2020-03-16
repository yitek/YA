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
    var InfoTypes;
    (function (InfoTypes) {
        InfoTypes[InfoTypes["NS"] = 0] = "NS";
        InfoTypes[InfoTypes["Class"] = 1] = "Class";
        InfoTypes[InfoTypes["Method"] = 2] = "Method";
    })(InfoTypes || (InfoTypes = {}));
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
    /**
     * 可以直接对应testclass
     *
     * @class NameInfo
     */
    var NameInfo = /** @class */ (function () {
        /**
         *Creates an instance of Namespace.
         * @param {string} name
         * @param {NameInfo} parent
         * @memberof Namespace
         */
        function NameInfo(name, container) {
            this.name = name;
            this.container = container;
            this.subs = {};
            this.type = InfoTypes.NS;
            if (container)
                container.subs[name] = this;
        }
        Object.defineProperty(NameInfo.prototype, "fullname", {
            get: function () {
                if (this._fullname === undefined) {
                    if (this.container) {
                        this._fullname = this.container.fullname + "." + this.name;
                    }
                    else
                        this._fullname = this.name;
                }
                return this._fullname;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NameInfo.prototype, "description", {
            set: function (content) {
                if (content = trim(content))
                    (this.descriptions || (this.descriptions = [])).push(content);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NameInfo.prototype, "notice", {
            set: function (content) {
                if (content = trim(content))
                    (this.notices || (this.notices = [])).push(content);
            },
            enumerable: true,
            configurable: true
        });
        NameInfo.prototype.execute = function (output) {
            var rs = { name: this.name, type: InfoTypes[this.type], errorCount: 0, usageCount: 0, beginTime: new Date(), ellapse: 0 };
            Doct.beginLog(rs, this, renderElement);
            for (var n in this.subs) {
                if (!rs.subs)
                    rs.subs = {};
                var sub = this.subs[n];
                var subRenderElement = null;
                if (renderElement) {
                    subRenderElement = Doct.createElement(rs.type);
                    Doct.appendChild(renderElement, subRenderElement);
                }
                var subRs = sub.execute(subRenderElement);
                rs.subs[n] = subRs;
                rs.ellapse += rs.ellapse;
                rs.errorCount += rs.errorCount;
                rs.usageCount += rs.usageCount;
            }
            rs.endTime = new Date();
            Doct.endLog(rs, this, param);
            return rs;
        };
        return NameInfo;
    }());
    exports.NameInfo = NameInfo;
    var ClassInfo = /** @class */ (function (_super) {
        __extends(ClassInfo, _super);
        function ClassInfo(ctor, name, container) {
            var _this = _super.call(this, name, container) || this;
            _this.ctor = ctor;
            ctor.prototype.$__dictClsInfo__ = _this;
            _this.type = InfoTypes.Class;
            return _this;
        }
        return ClassInfo;
    }(NameInfo));
    exports.ClassInfo = ClassInfo;
    //可以直接对应testMethod
    var UsageInfo = /** @class */ (function (_super) {
        __extends(UsageInfo, _super);
        function UsageInfo(statement, name, container) {
            var _this = _super.call(this, name, container) || this;
            _this.statement = statement;
            statement.$__dictUsageInfo__ = _this;
            _this.type = InfoTypes.Method;
            _this.codes = makeCodes(statement);
            return _this;
        }
        UsageInfo.prototype.execute = function (param) {
            var _this = this;
            var executeRs = { name: this.name, type: InfoTypes[this.type], errorCount: 0, usageCount: 1, beginTime: new Date() };
            var end;
            var index = 0;
            var assert_proc = function (assert_statement) {
                end = executeRs.endTime = new Date();
                executeRs.ellapse = executeRs.endTime.valueOf() - executeRs.beginTime.valueOf();
                assert_statement(makeAssert(_this, index++, executeRs));
            };
            var domContainer = null;
            try {
                domContainer = document.createElement("div");
                if (param)
                    param.appendChild(domContainer);
            }
            catch (_a) { }
            executeRs.beginTime = new Date();
            try {
                if (Doct.debugging) {
                    this.statement.call(this, assert_proc, this.domContainer);
                }
                else {
                    try {
                        this.statement.call(this, assert_proc, this.domContainer);
                    }
                    catch (ex) {
                        executeRs.errorCount++;
                    }
                }
            }
            finally {
                if (end === undefined) {
                    end = executeRs.endTime = new Date();
                    executeRs.ellapse = executeRs.endTime.valueOf() - executeRs.beginTime.valueOf();
                }
            }
            return executeRs;
        };
        return UsageInfo;
    }(NameInfo));
    exports.UsageInfo = UsageInfo;
    function makeCodes(func) {
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
                var stateCode = statement_proc.substring(stateBeginAt, matchAt).replace(trimRegx, "");
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
                var stateCode = statement_proc.substring(stateBeginAt, statement_proc.length - 1).replace(trimRegx, "");
                if (stateCode)
                    codes.push(stateCode);
                break;
            }
        }
        return codes;
    }
    function makeAssert(doc, codeIndex, record) {
        var code = doc.codes[codeIndex];
        var assert = function (expected, actual, msg, paths) {
            if (!record.codeInfos)
                record.codeInfos = [];
            var assertInfo = record.codeInfos[codeIndex] = { code: code, asserts: [] };
            var asserts = assertInfo.asserts;
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
    function makeClassInfo(ctor, name) {
        var paths = name.split(".");
        var ns = Doct.rootNS;
        //最后一个是自己的名字
        var clsname = trim(paths.pop());
        if (!clsname)
            throw new Error("\u9519\u8BEF\u7684\u540D\u5B57\u7A7A\u95F4" + name);
        //前面的是名字空间
        for (var i in paths) {
            var path = trim(paths[i]);
            if (!path)
                throw new Error("\u9519\u8BEF\u7684\u540D\u5B57\u7A7A\u95F4" + name);
            var existed = ns[path];
            if (!existed)
                existed = ns[path] = new NameInfo(path, ns);
            ns = existed;
        }
        var clsInfo = new ClassInfo(ctor, name, ns);
        return clsInfo;
    }
    function makeUsageInfo(statement, clsInfo, name) {
        if (typeof statement !== "function")
            throw new Error("\u4E0D\u6B63\u786E\u7684\u88C5\u9970\u5668\u4F7F\u7528\uFF0C\u53EA\u80FD\u7528\u5728method\u4E0A");
        if (!clsInfo)
            throw new Error("必须用dict装饰对象或类");
        var usageInfo = new UsageInfo(statement, name, clsInfo);
        return usageInfo;
    }
    function doct(name, description, notices) {
        return function (target, propname) {
            var info;
            if (typeof target === "function") {
                info = makeClassInfo(target, name);
            }
            else {
                info = makeUsageInfo(target[propname], target.$__dictClassInfo__, name);
            }
            this.description = description;
            if (notices) {
                if (notices.push) {
                    for (var i in notices) {
                        info.notice = notices[i];
                    }
                }
            }
        };
    }
    var Doct = doct;
    Doct.rootName = "YA";
    Doct.rootNS = new NameInfo(Doct.rootName, null);
    Doct.debugging = true;
    Doct.beginLog = function (rs, info, extra) {
        console.info();
    };
    Doct.createElement = function (tag, cls, container) {
        var div = document.createElement(tag);
        if (cls)
            div.className = cls;
        if (container)
            container.appendChild(div);
        return div;
    };
    Doct.appendChild = function (p, c) { return p.appendChild(c); };
    Doct.setContent = function (node, cotnent) { return node.innerHTML = cotnent; };
    var ConsoleLogger = /** @class */ (function () {
        function ConsoleLogger() {
        }
        ConsoleLogger.prototype.section = function (info, param, record, statement) {
            console.group(info.name);
            statement.call(this, this);
            if (record.errorDetail)
                console.error(record.errorDetail);
            if (info.type !== InfoTypes.Method) {
                var message = "\u9519\u8BEF=" + record.errorCount + ",\u6267\u884C=" + record.usageCount + ",\u8017\u65F6=" + record.ellapse;
                if (record.errorCount) {
                    console.warn(message);
                }
                else
                    console.log(message);
            }
            console.groupEnd();
            return this;
        };
        ConsoleLogger.prototype.info = function (message) {
            console.info(message);
            return this;
        };
        return ConsoleLogger;
    }());
    exports.ConsoleLogger = ConsoleLogger;
    var HtmlLogger = /** @class */ (function () {
        //parent:HtmlLogger;
        function HtmlLogger(container) {
            this.container = container;
        }
        HtmlLogger.prototype.section = function (info, param, record, statement) {
            var fs = Doct.createElement("fieldset");
            return this;
        };
        HtmlLogger.prototype._renderNS = function (info, container, record) {
        };
        /**
         * 展示Usage信息的代码
         *
         * @param {UsageInfo} info 信息
         * @param {*} container
         * @param {*} demo
         * @param {IExecuteRecord} record
         * @memberof HtmlLogger
         */
        HtmlLogger.prototype._renderUsage = function (info, container, demo, record) {
            var tit = Doct.createElement("dt", "usage-title", container);
            Doct.setContent(tit, info.name);
            var ctnt = Doct.createElement("dd", "content", container);
            if (info.descriptions.length) {
                var des = Doct.createElement("div", "description", ctnt);
                for (var i in info.descriptions) {
                    var p = Doct.createElement("p", "", des);
                    Doct.setContent(p, info.descriptions[i]);
                }
            }
            if (info.notices.length) {
                var notice = Doct.createElement("ol", "notice", ctnt);
                for (var i in info.notices) {
                    var p = Doct.createElement("li", "", notice);
                    Doct.setContent(p, info.notices[i]);
                }
            }
            var sample = Doct.createElement("dl", "sample", ctnt);
            if (record.codeInfos) {
                var dt = Doct.createElement("dt", "label", sample);
                Doct.setContent(dt, "代码");
                var dd = Doct.createElement("dd", "codes", sample);
                var codes = Doct.createElement("ul", "codes", dd);
                for (var i in record.codeInfos) {
                    var assertInfo = record.codeInfos[i];
                    var item = Doct.createElement("li", "code", codes);
                    var pre = Doct.createElement("pre", "code", item);
                    var code = Doct.createElement("code", "code", pre);
                    Doct.setContent(code, assertInfo.code);
                    if (assertInfo.asserts.length) {
                        var asserts = Doct.createElement("ol", "asserts", item);
                        for (var j in assertInfo.asserts) {
                            var assert = Doct.createElement("li", "assert", asserts);
                            Doct.setContent(assert, assertInfo.asserts[j]);
                        }
                    }
                }
            }
            if (demo) {
                var dt = Doct.createElement("dt", "label", sample);
                Doct.setContent(dt, "示例");
                var dd = Doct.createElement("dd", "demo", sample);
                Doct.appendChild(dd, demo);
            }
        };
        return HtmlLogger;
    }());
    exports.HtmlLogger = HtmlLogger;
    function trim(text) {
        if (text === undefined || Text === null)
            return "";
        text.toString().replace(/(^\s+)|(\s+$)/g, "");
    }
});
//# sourceMappingURL=YA.doct-v01.00.js.map