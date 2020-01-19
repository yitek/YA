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
    var Unittest = /** @class */ (function () {
        function Unittest(name, logger) {
            this.$NAME = name;
            this._$members = {};
            this._$errors = [];
            if (!logger)
                logger = {
                    info: function (msg) { return console.info(msg); },
                    error: function (msg, err) { return console.error(msg, err); },
                    assert: function (cond, msg) { return console.assert(cond, msg); },
                    warn: function (msg) { return console.warn(msg); },
                    beginGroup: function (title) { return console.group(title); },
                    endGroup: function () { return console.groupEnd(); }
                };
            this._$logger = logger;
        }
        Unittest.prototype.$RUN = function (target) {
            var _this = this;
            if (!target)
                target = this;
            if (typeof target === "function")
                target = new target();
            var count = 0;
            this._$logger.beginGroup("{" + this.$NAME + "}");
            var startTime = (new Date()).valueOf();
            var assert = function (expected, actual, msg, paths) {
                if (!paths && msg)
                    msg = msg.replace(/\{actual\}/g, JSON.stringify(actual)).replace(/\{expected\}/g, JSON.stringify(expected));
                if (actual === expected) {
                    if (!Unittest.hiddenSteps && msg && !paths) {
                        _this._$logger.info(msg);
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
                    if (!Unittest.hiddenSteps && msg && !paths.length) {
                        _this._$logger.info(msg);
                    }
                }
                else if (actual !== expected) {
                    throw new UnittestError((paths ? paths.join(".") : "") + "\u671F\u671B\u503C\u4E3A" + expected + ",\u5B9E\u9645\u4E3A" + actual, msg);
                }
                else {
                    if (!Unittest.hiddenSteps && msg && !paths) {
                        _this._$logger.info(msg);
                    }
                }
            };
            var info = function (msg, expected) {
                msg = msg.replace(/\{variable\}/g, JSON.stringify(expected));
                _this._$logger.info(msg);
            };
            for (var name_1 in target) {
                var ch = name_1[0];
                if (ch === "$" || name_1 === "_")
                    continue;
                var fn = target[name_1];
                if (typeof fn !== "function")
                    continue;
                this._$logger.beginGroup(name_1 + "()");
                var fnStartTime = (new Date()).valueOf();
                var ex = undefined;
                if (Unittest.debugging) {
                    count++;
                    fn.call(target, assert, info);
                    this._$members[name_1] = true;
                }
                else {
                    try {
                        count++;
                        fn.call(target, assert, info);
                        this._$members[name_1] = true;
                    }
                    catch (ex) {
                        this._$members[name_1] = false;
                        var msg = ex.outerMessage || ex.toString();
                        this._$errors.push({
                            Message: msg,
                            Exception: ex,
                            Name: name_1
                        });
                        this._$logger.error(msg, ex);
                    }
                }
                var fnEndTime = (new Date()).valueOf();
                this._$logger.warn("\u8017\u65F6=" + (fnEndTime - fnStartTime));
                this._$logger.endGroup();
            }
            var endTime = (new Date()).valueOf();
            this._$errors.length ? this._$logger.warn("{" + this.$NAME + "}]:\u8017\u65F6=" + (endTime - startTime) + "ms,\u6B63\u786E\u7387=" + (count - this._$errors.length) + "/" + count + "=" + this._$errors.length * 100 / count + "%.") : this._$logger.warn("{" + this.$NAME + "}:\u8017\u65F6=" + (endTime - startTime) + "ms,\u65E0\u9519\u8BEF.");
            this._$logger.endGroup();
            return this._$errors;
        };
        Unittest.Test = function (name, target) {
            if (target === undefined) {
                target = name;
                name = undefined;
            }
            var utest = new Unittest(name);
            utest.$RUN(target);
            return utest;
        };
        return Unittest;
    }());
    exports.Unittest = Unittest;
    function testIgnore(target, propName) {
        target.$_testIgnore = true;
    }
    exports.testIgnore = testIgnore;
});
//# sourceMappingURL=Unittest.js.map