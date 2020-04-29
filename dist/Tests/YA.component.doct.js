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
    var ComponentTest = /** @class */ (function () {
        function ComponentTest() {
        }
        ComponentTest.prototype.base = function (assert_statement, demoElement) {
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
        ], ComponentTest.prototype, "base", null);
        ComponentTest = __decorate([
            doct_1.doct({
                title: "YA.component",
                descriptions: [
                    "ts等的支持"
                ]
            })
        ], ComponentTest);
        return ComponentTest;
    }());
    exports.ComponentTest = ComponentTest;
});
//# sourceMappingURL=YA.component.doct.js.map