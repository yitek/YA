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
    var DropdownTest = /** @class */ (function () {
        function DropdownTest() {
        }
        DropdownTest.prototype.base = function (assert_statement, demoElement) {
            assert_statement(function (assert) {
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        __decorate([
            doct_1.doct({
                title: "基本用法",
                descriptions: [
                    "直接用mask函数创建遮罩"
                ]
            })
        ], DropdownTest.prototype, "base", null);
        DropdownTest = __decorate([
            doct_1.doct({
                title: "YA.Observable",
                descriptions: [
                    "YA.Observable是YA框架最基本的构成。YA通过该对象来捕捉对象的变化。代表一个number,string,object,array"
                ]
            })
        ], DropdownTest);
        return DropdownTest;
    }());
    exports.DropdownTest = DropdownTest;
});
//# sourceMappingURL=YA.Observable1.doct.js.map