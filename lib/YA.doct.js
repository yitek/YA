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
    function enumerable(allow) {
        return function (target, propname) {
            Object.defineProperty(target, propname, { enumerable: allow, writable: true, configurable: true, value: target[propname] });
        };
    }
    var Doctypes;
    (function (Doctypes) {
        Doctypes[Doctypes["Root"] = 0] = "Root";
        Doctypes[Doctypes["Namespace"] = 1] = "Namespace";
        Doctypes[Doctypes["Class"] = 2] = "Class";
        Doctypes[Doctypes["Member"] = 3] = "Member";
        Doctypes[Doctypes["Usage"] = 4] = "Usage";
    })(Doctypes = exports.Doctypes || (exports.Doctypes = {}));
    var Doct = /** @class */ (function () {
        function Doct(type, parent) {
            this.type = type;
            this.parent = parent;
            this.errorCount = this.usageCount = this.ellapse = 0;
            this.descriptions = [];
        }
        Doct.prototype.execute = function (params) {
            return this;
        };
        Doct.prototype.reset = function () {
            this.start = this.end = undefined;
            this.ellapse = this.errorCount = 0;
            return this;
        };
        Object.defineProperty(Doct.prototype, "description", {
            get: function () {
                return this.descriptions.join("\n");
            },
            set: function (value) {
                this.descriptions.push(value);
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            enumerable(false)
        ], Doct.prototype, "execute", null);
        __decorate([
            enumerable(false)
        ], Doct.prototype, "reset", null);
        return Doct;
    }());
    exports.Doct = Doct;
    var NamespaceDoct = /** @class */ (function (_super) {
        __extends(NamespaceDoct, _super);
        function NamespaceDoct(name, type, parent) {
            var _this = _super.call(this, type, parent) || this;
            _this.subs = {};
            if (name && parent)
                _this.name = name;
            return _this;
        }
        NamespaceDoct.prototype._mergeTo = function (target) {
            for (var n in this.subs) {
                var sub = this.subs[n];
                var existed = target.subs[n];
                if (sub.type === Doctypes.Namespace)
                    sub._mergeTo(existed);
                else if (existed.type === Doctypes.Namespace) {
                    existed._mergeTo(sub);
                    target.subs[n] = sub;
                }
                else {
                    throw new Error(sub.fullName + "\u65E0\u6CD5\u5408\u5E76.");
                }
            }
        };
        Object.defineProperty(NamespaceDoct.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                if (this._name && this._name !== value)
                    throw new Error("\u5DF2\u7ECF\u8BBE\u7F6E\u4E86name\u6216\u8005fullName");
                if (this.parent) {
                    var ns = this.parent.subs;
                    var existed = ns[value];
                    if (existed) {
                        if (this === existed)
                            return;
                        if (existed.type === Doctypes.Namespace) {
                            existed._mergeTo(this);
                            ns[value] = this;
                        }
                        else if (this.type === Doctypes.Namespace) {
                            this._mergeTo(existed);
                        }
                        else
                            throw new Error(existed.fullName + "\u5DF2\u7ECF\u5B9A\u4E49\u8FC7\u6587\u6863\uFF0C\u4E14\u65E0\u6CD5\u5408\u5E76.");
                    }
                    else
                        ns[value] = this;
                }
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NamespaceDoct.prototype, "fullName", {
            get: function () {
                if (this._fullName === undefined) {
                    if (this._name && this.parent) {
                        var pname = this.parent.fullName;
                        return pname ? pname + "." + this._name : this._name;
                    }
                }
                return this._fullName;
            },
            set: function (value) {
                if (this._fullName !== undefined)
                    throw new Error("已经设置了fullName,不可以再设置");
                var nms = value.split(".");
                var name = nms[nms.length - 1];
                if (this._name && this._name !== name)
                    throw new Error("\u5DF2\u7ECF\u5B9A\u4E49\u4E86name=" + this._name + ",\u4F46fullName\u53C8\u91CD\u65B0\u5B9A\u4E49\u4E3A" + value);
                var node = rootDoc;
                var ns = node.subs;
                for (var i = 0, j = nms.length - 1; i < j; i++) {
                    var n = nms[i];
                    ns = node.subs;
                    node = ns[n] || (ns[n] = new NamespaceDoct(n, Doctypes.Namespace, node));
                }
                if (this.parent) {
                    if (this.parent !== node)
                        throw new Error("\u6307\u5B9A\u7684parent\u4E0EfullName\u7684parent\u4E0D\u4E00\u81F4");
                }
                else
                    this.parent = node;
                this.name = name;
                this._fullName = value;
            },
            enumerable: true,
            configurable: true
        });
        NamespaceDoct.prototype.execute = function (params) {
            var start = new Date();
            try {
                for (var n in this.subs) {
                    this.subs[n].execute(params);
                }
            }
            finally {
                this.start = start;
                this.end = new Date();
            }
            return this;
        };
        NamespaceDoct.prototype.reset = function () {
            for (var n in this.subs) {
                this.subs[n].reset();
            }
            return this;
        };
        //@enumerable(false)
        NamespaceDoct.prototype.toString = function () {
            return "{" + this.fullName + "," + Doctypes[this.type] + "}";
        };
        __decorate([
            enumerable(false)
        ], NamespaceDoct.prototype, "_fullName", void 0);
        __decorate([
            enumerable(false)
        ], NamespaceDoct.prototype, "_name", void 0);
        __decorate([
            enumerable(false)
        ], NamespaceDoct.prototype, "_mergeTo", null);
        __decorate([
            enumerable(false)
        ], NamespaceDoct.prototype, "execute", null);
        __decorate([
            enumerable(false)
        ], NamespaceDoct.prototype, "reset", null);
        return NamespaceDoct;
    }(Doct));
    exports.NamespaceDoct = NamespaceDoct;
    var UsageDoct = /** @class */ (function (_super) {
        __extends(UsageDoct, _super);
        function UsageDoct(statement, parent, name) {
            var _this = _super.call(this, Doctypes.Usage, parent) || this;
            var p = _this;
            _this.name = name;
            while (p) {
                p.usageCount++;
                p = p.parent;
            }
            _this.statement = statement;
            //this.code = makeCode(statement);
            //this.asserts=[];
            _this.codes = makeCodes(statement);
            return _this;
        }
        UsageDoct.prototype.execute = function (params) {
            var _this = this;
            var end;
            var index = 0;
            var assert_proc = function (assert_statement) {
                end = _this.end = new Date();
                _this.setEllapse(_this.end.valueOf() - _this.start.valueOf());
                assert_statement(makeAssert(_this, index++));
            };
            this.start = new Date();
            try {
                if (exports.doct.debugging) {
                    this.statement.call(this, assert_proc);
                }
                else {
                    try {
                        this.statement.call(this, assert_proc);
                    }
                    catch (ex) {
                        this.exception = ex;
                        var p = this;
                        while (p) {
                            p.errorCount++;
                            p = p.parent;
                        }
                    }
                }
            }
            finally {
                if (end === undefined) {
                    end = this.end = new Date();
                    this.setEllapse(this.end.valueOf() - this.start.valueOf());
                }
            }
            return this;
        };
        UsageDoct.prototype.reset = function () {
            _super.prototype.reset.call(this);
            this.exception = undefined;
            for (var i in this.codes)
                this.codes[i].asserts = [];
            return this;
        };
        UsageDoct.prototype.setEllapse = function (value) {
            var p = this;
            while (p) {
                p.ellapse += value;
                p = p.parent;
            }
            return this;
        };
        __decorate([
            enumerable(false)
        ], UsageDoct.prototype, "codes", void 0);
        __decorate([
            enumerable(false)
        ], UsageDoct.prototype, "statement", void 0);
        __decorate([
            enumerable(false)
        ], UsageDoct.prototype, "execute", null);
        __decorate([
            enumerable(false)
        ], UsageDoct.prototype, "reset", null);
        __decorate([
            enumerable(false)
        ], UsageDoct.prototype, "setEllapse", null);
        return UsageDoct;
    }(Doct));
    exports.UsageDoct = UsageDoct;
    function makeCodes(func) {
        var trimRegx = /(^\s+)|(\s+$)/g;
        var assert_proc_name_regx = /^function\s*\(([^\)]+)\s*\)\s*\{/;
        var statement_proc = func.toString();
        var assert_proc_name_match = statement_proc.match(assert_proc_name_regx);
        var assert_proce_name = assert_proc_name_match[1];
        if (!assert_proce_name)
            return [{ code: statement_proc.substring(assert_proc_name_match[0].length, statement_proc.length - 1) }];
        var rs = [];
        var assert_proc_regx = new RegExp("[;\\s]?" + assert_proce_name + "\\s?\\(");
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
                var stateCode = statement_proc.substring(stateBeginAt, matchAt).replace(/(^\s+)|(\s+$)/g, "");
                if (stateCode)
                    rs.push({ code: stateCode, asserts: [] });
                var BranceCount = 1;
                var isInStr = void 0;
                for (var i = matchAt + match[0].length, j = statement_proc.length; i < j; i++) {
                    var ch = statement_proc[i];
                    if (ch === ")") {
                        if (isInStr)
                            continue;
                        if (--BranceCount == 0) {
                            statement_proc = statement_proc.substring(i + 1).replace(/^\s*;?/g, "");
                            stateBeginAt = 0;
                            break;
                        }
                    }
                    else if (ch === "(") {
                        if (isInStr)
                            continue;
                        BranceCount++;
                    }
                    else if (ch === "'") {
                        if (ch === isInStr)
                            isInStr = undefined;
                        else
                            isInStr = ch;
                    }
                    else if (ch === '"') {
                        if (ch === isInStr)
                            isInStr = undefined;
                        else
                            isInStr = ch;
                    }
                }
                if (BranceCount)
                    throw new Error("无法解析的函数");
            }
            else {
                var stateCode = statement_proc.substring(stateBeginAt, statement_proc.length - 1).replace(/(^\s+)|(\s+$)/g, "");
                if (stateCode)
                    rs.push({ code: stateCode, asserts: [] });
                break;
            }
        }
        return rs;
    }
    function makeAssert(doc, codeIndex) {
        var usageCode = doc.codes[codeIndex];
        var assert = function (expected, actual, msg, paths) {
            var asserts = usageCode.asserts || (usageCode.asserts = []);
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
    var StatementDoct = /** @class */ (function (_super) {
        __extends(StatementDoct, _super);
        function StatementDoct(type, parent, name) {
            var _this = _super.call(this, name, type, parent) || this;
            _this.usages = {};
            return _this;
        }
        StatementDoct.prototype.usage = function (name, description, statement) {
            if (statement === undefined) {
                if (description === undefined) {
                    statement = name;
                    name = (this.usageCount++).toString();
                    description = undefined;
                }
                else {
                    statement = description;
                    description = undefined;
                }
            }
            var usageDoc = new UsageDoct(statement, this, name);
            this.usages[usageDoc.name] = usageDoc;
            usageDoc.description = description;
        };
        StatementDoct.prototype.execute = function (params) {
            var ellapse = 0;
            var start = new Date();
            try {
                for (var n in this.usages) {
                    this.usages[n].execute(params);
                }
                _super.prototype.execute.call(this, params);
            }
            finally {
                this.start = start;
                this.end = new Date();
                this.ellapse = ellapse;
            }
            return this;
        };
        StatementDoct.prototype.reset = function () {
            for (var n in this.usages) {
                this.usages[n].reset();
            }
            _super.prototype.reset.call(this);
            return this;
        };
        StatementDoct.prototype._mergeTo = function (target) {
            for (var n in this.usages) {
                var sub = this.usages[n];
                var existed = target.usages[n];
                if (existed) {
                    var i = 1;
                    while (true) {
                        var newN = n + i.toString();
                        if (!target.usages[newN]) {
                            target.usages[newN] = sub;
                            sub.name = newN;
                            break;
                        }
                        else
                            i++;
                    }
                }
                else
                    target.usages[n] = sub;
                sub.parent = this;
            }
            var p = this.parent;
            while (p) {
                p.usageCount += this.usageCount;
                p = p.parent;
            }
        };
        __decorate([
            enumerable(false)
        ], StatementDoct.prototype, "usage", null);
        __decorate([
            enumerable(false)
        ], StatementDoct.prototype, "execute", null);
        __decorate([
            enumerable(false)
        ], StatementDoct.prototype, "reset", null);
        __decorate([
            enumerable(false)
        ], StatementDoct.prototype, "_mergeTo", null);
        return StatementDoct;
    }(NamespaceDoct));
    exports.StatementDoct = StatementDoct;
    var ClassDoct = /** @class */ (function (_super) {
        __extends(ClassDoct, _super);
        function ClassDoct(ctor, parent) {
            var _this = _super.call(this, Doctypes.Class, parent) || this;
            _this.ctor = ctor;
            return _this;
        }
        ClassDoct.prototype.execute = function (params) {
            var ins = new this.ctor(this);
            if (!this.isInited) {
                for (var n in ins) {
                    var method = ins[n];
                    if (method.$doct_name !== undefined) {
                        var child = new MemberDoct(method, this);
                        child.name = method.$doct_name;
                    }
                }
                this.isInited = true;
            }
            _super.prototype.execute.call(this, ins);
            return this;
        };
        __decorate([
            enumerable(false)
        ], ClassDoct.prototype, "ctor", void 0);
        __decorate([
            enumerable(false)
        ], ClassDoct.prototype, "isInited", void 0);
        __decorate([
            enumerable(false)
        ], ClassDoct.prototype, "execute", null);
        return ClassDoct;
    }(StatementDoct));
    exports.ClassDoct = ClassDoct;
    var MemberDoct = /** @class */ (function (_super) {
        __extends(MemberDoct, _super);
        function MemberDoct(method, parent) {
            var _this = _super.call(this, Doctypes.Member, parent) || this;
            _this.usageCount = 0;
            _this.method = method;
            return _this;
        }
        MemberDoct.prototype.execute = function (self) {
            this.method.call(self, this);
            _super.prototype.execute.call(this);
            return this;
        };
        __decorate([
            enumerable(false)
        ], MemberDoct.prototype, "method", void 0);
        __decorate([
            enumerable(false)
        ], MemberDoct.prototype, "execute", null);
        return MemberDoct;
    }(StatementDoct));
    exports.MemberDoct = MemberDoct;
    function date_format(date) {
        if (!date)
            date = 0;
        if (!(date instanceof Date))
            date = new Date(date);
        return date.getMonth() + 1 + "/" + (date.getDate() + 1) + "/" + date.getFullYear() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
    }
    exports.date_format = date_format;
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
    exports.doct = function (nameOrType) {
        return function (target, propName) {
            if (propName !== undefined) {
                var testMethod = target[propName];
                if (!testMethod) {
                    console.warn(propName + "\u4E0D\u662F\u51FD\u6570\uFF0C\u4E0D\u5E94\u8BE5\u7531doct\u88C5\u9970");
                }
                testMethod.$doct_name = propName;
                //testMethod.$doct_type = 
            }
            else {
                var clsDoct = new ClassDoct(target);
                if (nameOrType)
                    clsDoct.fullName = nameOrType;
            }
        };
    };
    exports.default = exports.doct;
    var rootDoc = new StatementDoct(Doctypes.Root, null);
    exports.doct.reset = function () {
        rootDoc.subs = {};
        rootDoc.usages = {};
        rootDoc.reset();
        return exports.doct;
    };
    exports.doct.output = function (params, doc) {
        if (doc === undefined)
            doc = rootDoc;
        console.group(doc.name + ":<" + Doctypes[doc.type] + ">");
        var desc = doc.description;
        if (desc)
            console.info("#\u8BF4\u660E:" + desc);
        if (doc instanceof UsageDoct) {
            for (var i in doc.codes) {
                var code = doc.codes[i];
                console.info("#\u793A\u4F8B:", code.code);
                if (code.asserts && code.asserts.length) {
                    console.info("/*\u7ED3\u679C:" + code.asserts.join('\n') + "*/");
                }
            }
        }
        if (doc instanceof StatementDoct) {
            for (var n in doc.usages)
                exports.doct.output(params, doc.usages[n]);
        }
        if (doc instanceof NamespaceDoct) {
            for (var n in doc.subs)
                exports.doct.output(params, doc.subs[n]);
        }
        if (doc.type !== Doctypes.Usage) {
            if (doc.errorCount)
                console.warn("#\u6D4B\u8BD5:" + doc.errorCount + "/" + doc.usageCount + "=" + doc.errorCount * 100 / doc.usageCount + "%");
            else
                console.info("#\u6D4B\u8BD5:" + doc.errorCount + "/" + doc.usageCount + "=" + doc.errorCount * 100 / doc.usageCount + "%");
        }
        else {
            if (doc.exception)
                console.error("#\u9519\u8BEF:", doc.exception);
        }
        console.info("#时间:", doc.ellapse + "ms", date_format(doc.start), date_format(doc.end));
        console.groupEnd();
        return exports.doct;
    };
    var isSuspended;
    exports.doct.suspend = function (suppend) {
        if (!(isSuspended = suppend) && isAutoExected) {
            rootDoc.execute();
            exports.doct.output();
        }
    };
    var tryRun = function () {
        if (!isSuspended) {
            rootDoc.execute();
            exports.doct.output();
        }
        isAutoExected = true;
    };
    var isAutoExected = false;
    if (typeof window !== "undefined") {
        if (window.addEventListener)
            window.addEventListener("load", tryRun, false);
        else if (window.attachEvent)
            window.attachEvent("onload", tryRun);
        else
            window.onload = tryRun;
    }
    else
        setTimeout(tryRun, 100);
});
//# sourceMappingURL=YA.doct.js.map