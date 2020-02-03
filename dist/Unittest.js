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
    var TestTargetTypes;
    (function (TestTargetTypes) {
        TestTargetTypes[TestTargetTypes["Root"] = 0] = "Root";
        TestTargetTypes[TestTargetTypes["Namespace"] = 1] = "Namespace";
        TestTargetTypes[TestTargetTypes["Class"] = 2] = "Class";
        TestTargetTypes[TestTargetTypes["Method"] = 3] = "Method";
        TestTargetTypes[TestTargetTypes["Field"] = 4] = "Field";
        TestTargetTypes[TestTargetTypes["Function"] = 5] = "Function";
        TestTargetTypes[TestTargetTypes["Object"] = 6] = "Object";
        TestTargetTypes[TestTargetTypes["Property"] = 7] = "Property";
        TestTargetTypes[TestTargetTypes["Variable"] = 8] = "Variable";
        TestTargetTypes[TestTargetTypes["ObjectLikeFunction"] = 9] = "ObjectLikeFunction";
        TestTargetTypes[TestTargetTypes["Usage"] = 10] = "Usage";
        TestTargetTypes[TestTargetTypes["Section"] = 11] = "Section";
    })(TestTargetTypes = exports.TestTargetTypes || (exports.TestTargetTypes = {}));
    function enumerable(allow) {
        return function (target, propname) {
            Object.defineProperty(target, propname, { enumerable: allow, writable: true, configurable: true, value: target[propname] });
        };
    }
    var UDoc = /** @class */ (function () {
        function UDoc(type, name, description, parent) {
            this.type = type;
            this.name = name;
            this.description = description;
            this.parent = parent;
            if (type === TestTargetTypes.Root)
                return this;
            var nms = name.split(".");
            var node = exports.root;
            var ns;
            if (nms.length > 1) {
                for (var i = 0, j = nms.length - 1; i < j; i++) {
                    var n = nms.shift();
                    ns = node.children || (node.children = {});
                    node = ns[n] || (ns[n] = new UDoc(TestTargetTypes.Namespace, n, undefined, node));
                }
                if (node !== parent) {
                    if (!parent)
                        parent = node;
                    else
                        throw new Error("名字空间冲突,不能重复定义");
                }
            }
            else {
                node = parent;
            }
            var nm = nms.shift();
            ns = node.children || (node.children = {});
            var existed = ns[nm];
            if (existed) {
                if (existed.type !== TestTargetTypes.Namespace)
                    throw new Error("名字空间冲突，不能重复定义");
                this.children = existed.children;
            }
            ns[nm] = this;
            this.name = nm;
        }
        UDoc.prototype.execute = function (params) {
            var ellapse = 0;
            this.start = new Date();
            console.group("<" + TestTargetTypes[this.type] + ">" + this.name + "\u5F00\u59CB\u4E8E:" + this.start);
            try {
                for (var n in this.children) {
                    var child = this.children[n];
                    child.execute(params);
                    ellapse += child.ellapse;
                }
            }
            finally {
                this.end = new Date();
                this.ellapse = ellapse;
                console.warn("[" + this.name + "]\u7ED3\u675F\u4E8E:" + this.start + ",\u8017\u65F6:" + this.ellapse + "ms");
                console.groupEnd();
            }
        };
        __decorate([
            enumerable(false)
        ], UDoc.prototype, "execute", null);
        return UDoc;
    }());
    exports.UDoc = UDoc;
    exports.root = new UDoc(TestTargetTypes.Root, "", "");
    var ClassDoc = /** @class */ (function (_super) {
        __extends(ClassDoc, _super);
        function ClassDoc(name, description, parent, ctor) {
            var _this = this;
            debugger;
            _this = _super.call(this, TestTargetTypes.Class, name, description, parent) || this;
            _this.ctor = ctor;
            return _this;
        }
        ClassDoc.prototype.execute = function (params) {
            var ins = new this.ctor(this);
            if (!this.isInited) {
                for (var n in ins) {
                    var method = ins[n];
                    if (method.$isTestMethod !== undefined) {
                        var child = new MethodDoc(method.$isTestMethod || n, undefined, this, method);
                        (this.children || (this.children = {}))[n] = child;
                    }
                }
                this.isInited = true;
            }
            _super.prototype.execute.call(this, ins);
        };
        __decorate([
            enumerable(false)
        ], ClassDoc.prototype, "ctor", void 0);
        __decorate([
            enumerable(false)
        ], ClassDoc.prototype, "isInited", void 0);
        __decorate([
            enumerable(false)
        ], ClassDoc.prototype, "execute", null);
        return ClassDoc;
    }(UDoc));
    exports.ClassDoc = ClassDoc;
    var MethodDoc = /** @class */ (function (_super) {
        __extends(MethodDoc, _super);
        function MethodDoc(name, description, parent, method) {
            var _this = _super.call(this, TestTargetTypes.Method, name, description, parent) || this;
            _this.statementCount = 0;
            _this.method = method;
            return _this;
        }
        MethodDoc.prototype.statement = function (nameOrStatement, statement) {
            if (statement === undefined) {
                statement = nameOrStatement;
                nameOrStatement = this.statementCount++;
            }
            var statementDoc = new StatementDoc(nameOrStatement, undefined, statement, this);
            (this.children || (this.children = {}))[nameOrStatement] = statementDoc;
        };
        MethodDoc.prototype.execute = function (self) {
            this.method.call(self, this);
            _super.prototype.execute.call(this);
        };
        __decorate([
            enumerable(false)
        ], MethodDoc.prototype, "method", void 0);
        __decorate([
            enumerable(false)
        ], MethodDoc.prototype, "statementCount", void 0);
        __decorate([
            enumerable(false)
        ], MethodDoc.prototype, "statement", null);
        __decorate([
            enumerable(false)
        ], MethodDoc.prototype, "execute", null);
        return MethodDoc;
    }(UDoc));
    exports.MethodDoc = MethodDoc;
    var StatementDoc = /** @class */ (function (_super) {
        __extends(StatementDoc, _super);
        function StatementDoc(name, description, statement, parent) {
            var _this = _super.call(this, TestTargetTypes.Section, name, description, parent) || this;
            Object.defineProperty(_this, "statement", {
                enumerable: false, configurable: false, writable: false, value: statement
            });
            return _this;
        }
        StatementDoc.prototype.execute = function () {
            var _this = this;
            var end;
            var assert_proc = function (assert_statement) {
                end = _this.end = new Date();
                _this.ellapse = _this.end.valueOf() - _this.start.valueOf();
                assert_statement(assert);
                console.warn("#" + _this.name + "\u8017\u65F6:" + _this.ellapse + "ms.");
            };
            this.start = new Date();
            try {
                if (utest.debugging) {
                    this.statement.call(this, assert_proc);
                }
                else {
                    try {
                        this.statement.call(this, assert_proc);
                    }
                    catch (ex) {
                        this.exception = ex;
                        console.error(ex.message, ex);
                    }
                }
            }
            finally {
                if (end === undefined) {
                    end = this.end = new Date();
                    this.ellapse = this.end.valueOf() - this.start.valueOf();
                }
                console.warn("#" + this.name + "\u8017\u65F6:" + this.ellapse + "ms.");
            }
        };
        __decorate([
            enumerable(false)
        ], StatementDoc.prototype, "statement", void 0);
        __decorate([
            enumerable(false)
        ], StatementDoc.prototype, "execute", null);
        return StatementDoc;
    }(UDoc));
    exports.StatementDoc = StatementDoc;
    var assert = function (expected, actual, msg, paths) {
        if (!paths && msg)
            msg = msg.replace(/\{actual\}/g, JSON.stringify(actual)).replace(/\{expected\}/g, JSON.stringify(expected));
        if (actual === expected) {
            if (!utest.hiddenSteps && msg && !paths) {
                console.info(msg);
            }
            return;
        }
        var t = typeof (expected);
        if (t === "object") {
            paths || (paths = []);
            //let nullMsg = msg || "期望有值";
            if (!actual)
                throw new UnittestError(paths.join(".") + "不应为空.", msg);
            for (var n in expected) {
                paths.push(n);
                var expectedValue = expected[n];
                var actualValue = actual[n];
                if (typeof expectedValue === "object") {
                    assert(actualValue, expectedValue, msg, paths);
                }
                else {
                    if (actualValue !== expectedValue) {
                        throw new UnittestError((paths ? paths.join(".") : "") + "\u671F\u671B\u503C\u4E3A" + expectedValue + ",\u5B9E\u9645\u4E3A" + actualValue, msg);
                    }
                }
                paths.pop();
            }
            if (!utest.hiddenSteps && msg && !paths.length) {
                console.info(msg);
            }
        }
        else if (actual !== expected) {
            throw new UnittestError((paths ? paths.join(".") : "") + "\u671F\u671B\u503C\u4E3A" + expected + ",\u5B9E\u9645\u4E3A" + actual, msg);
        }
        else {
            if (!utest.hiddenSteps && msg && !paths) {
                console.info(msg);
            }
        }
    };
    var UnittestError = /** @class */ (function (_super) {
        __extends(UnittestError, _super);
        function UnittestError(msg, outerMessage) {
            var _this = _super.call(this, msg) || this;
            _this.outerMessage = outerMessage;
            return _this;
        }
        UnittestError.prototype.toString = function () {
            if (this.outerMessage)
                return this.outerMessage;
            return _super.prototype.toString.call(this);
        };
        return UnittestError;
    }(Error));
    exports.UnittestError = UnittestError;
    function utest(name) {
        return function (target, propName) {
            if (propName !== undefined) {
                var testMethod = target[propName];
                if (!testMethod) {
                    console.warn(propName + "\u4E0D\u662F\u51FD\u6570\uFF0C\u4E0D\u5E94\u8BE5\u7531utest\u88C5\u9970");
                }
                testMethod.$isTestMethod = name || null;
            }
            else {
                debugger;
                new ClassDoc(name, undefined, null, target);
            }
        };
    }
    exports.utest = utest;
    utest.clear = function () { return exports.root = new UDoc(TestTargetTypes.Root, undefined, undefined, undefined); };
    var isSuspended;
    utest.suspend = function (suppend) {
        if (!(isSuspended = suppend) && isAutoExected) {
            exports.root.execute();
        }
    };
    var isAutoExected = false;
    setTimeout(function () {
        debugger;
        if (!isSuspended)
            exports.root.execute();
        isAutoExected = true;
    }, 0);
});
//# sourceMappingURL=Unittest.js.map