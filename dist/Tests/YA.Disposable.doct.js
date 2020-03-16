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
        define(["require", "exports", "../doct", "../YA.core"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var doct_1 = require("../doct");
    var YA_core_1 = require("../YA.core");
    var DisposableTest = /** @class */ (function () {
        function DisposableTest() {
        }
        DisposableTest.prototype.base = function (assert_statement, demoElement) {
            var disposable = new YA_core_1.default.Disposable();
            var dispose1Arg, dispose1Sender;
            var dispose2Arg, dispose2Sender;
            //注册第一个dispose回调，当dispose发生时，它会被调用
            disposable.dispose(function (arg, sender) { dispose1Arg = arg; dispose1Sender = sender; });
            //注册第二个dispose回调，当dispose发生时，它会被调用
            disposable.dispose(function (arg, sender) { dispose2Arg = arg; dispose2Sender = sender; });
            //带参数释放资源
            disposable.dispose("dispose arg");
            assert_statement(function (assert) {
                assert(disposable.$isDisposed === true, "对象处于释放状态，disposable.$isDisposed===true");
                assert(dispose1Arg === "dispose arg", "\u4E00\u4E2A\u56DE\u8C03\u4F1A\u88AB\u8C03\u7528\uFF0C\u63A5\u6536\u5230\u7684\u53C2\u6570\u4E3Adispose\u8C03\u7528\u7684\u53C2\u6570\uFF0Cdispose1Arg===\"dispose arg\"");
                assert(dispose1Sender === disposable, "\u7B2C\u4E00\u4E2A\u56DE\u8C03\u51FD\u6570\u7684\u7B2C\u4E8C\u4E2A\u53C2\u6570\u4E3Adispose\u5BF9\u8C61\uFF0Cdispose1Sender===disposable");
                assert(dispose2Arg === "dispose arg", "\u7B2C\u4E8C\u4E2A\u56DE\u8C03\u51FD\u6570\u4E5F\u4F1A\u88AB\u8C03\u7528dispose2Arg===\"dispose arg\"");
                assert(dispose2Sender === disposable, "dispose2Sender===disposable");
            });
            var ex;
            try {
                disposable.dispose("second");
            }
            catch (ex1) {
                ex = ex1;
            }
            assert_statement(function (assert) {
                assert(ex !== undefined, "如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        __decorate([
            doct_1.doct({
                title: "基本用法"
            })
        ], DisposableTest.prototype, "base", null);
        DisposableTest = __decorate([
            doct_1.doct({
                title: "YA.Disposiable",
                descriptions: [
                    "某些对象在运行中引用了外部的资源，当这些对象被系统/框架释放时，需要同时释放他们引用的资源。",
                    "该类为这些可释放对象的基类。提供2个函数,dispose跟deteching。",
                    "dispose(callback:Function)表示注册一个回调函数监听资源释放，一旦发生释放，这些回调函数就会被挨个调用;dispose(obj)表示释放资源，该函数完成后，$isDisposed就会变成true",
                    "该类在框架中被应用于Component。框架会定期检查component是否还在alive状态，如果不在，就会自动释放Component"
                ]
            })
        ], DisposableTest);
        return DisposableTest;
    }());
    exports.DisposableTest = DisposableTest;
});
//# sourceMappingURL=YA.Disposable.doct.js.map