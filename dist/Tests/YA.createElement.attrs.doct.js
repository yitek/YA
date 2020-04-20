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
        define(["require", "exports", "../doct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var doct_1 = require("../doct");
    var createElementAttrsTest = /** @class */ (function () {
        function createElementAttrsTest() {
        }
        createElementAttrsTest.prototype.if = function (assert_statement, demoElement) {
            assert_statement(function (assert) {
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        __decorate([
            doct_1.doct({
                title: "基本用法",
                descriptions: [
                    "用dispose(callback)注册释放时的回调",
                    "用dispose(any)来释放资源"
                ]
            })
        ], createElementAttrsTest.prototype, "if", null);
        createElementAttrsTest = __decorate([
            doct_1.doct({
                title: "YA.createElement.attrs",
                descriptions: [
                    "某些对象在运行中引用了外部的资源，当这些对象被系统/框架释放时，需要同时释放他们引用的资源。",
                    "该类为这些可释放对象的基类。提供2个函数,dispose跟deteching。",
                    "dispose(callback:Function)表示注册一个回调函数监听资源释放，一旦发生释放，这些回调函数就会被挨个调用;dispose(obj)表示释放资源，该函数完成后，$isDisposed就会变成true",
                    "该类在框架中被应用于Component。框架会定期检查component是否还在alive状态，如果不在，就会自动释放Component"
                ]
            })
        ], createElementAttrsTest);
        return createElementAttrsTest;
    }());
    exports.createElementAttrsTest = createElementAttrsTest;
});
//# sourceMappingURL=YA.createElement.attrs.doct.js.map