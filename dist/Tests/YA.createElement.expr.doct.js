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
    var createElementExprTest = /** @class */ (function () {
        function createElementExprTest() {
        }
        createElementExprTest.prototype.base = function (assert_statement, demoElement) {
            function CompBase() {
                var n1 = YA_core_1.default.observable(1, "number1", this);
                var n2 = YA_core_1.default.observable(2, "number2", this);
                this.changeN1 = function () {
                    this.number1 = prompt("修改N1:", this.number1);
                };
                this.changeN2 = function () {
                    this.number2 = prompt("修改N2:", this.number2);
                };
                this.render = function (descriptor) {
                    return YA_core_1.default.createElement("div", null,
                        YA_core_1.default.createElement("button", { onclick: this.number1 }, "\u4FEE\u6539n1"),
                        YA_core_1.default.createElement("button", { onclick: this.number2 }, "\u4FEE\u6539n2"),
                        YA_core_1.default.CALL(function (n1, n2) { return n1 + n2; }, this.number1, this.number2));
                };
            }
            ;
            YA_core_1.default.createComponent(CompBase, null, demoElement);
            assert_statement(function (assert) {
            });
        };
        __decorate([
            doct_1.doct({
                title: "基本用法",
                descriptions: [
                    "模板中使用表达式"
                ]
            })
        ], createElementExprTest.prototype, "base", null);
        createElementExprTest = __decorate([
            doct_1.doct({
                title: "YA.createElement.expr",
                descriptions: [
                    "模板中的表达式"
                ]
                //,debugging:"complex"
            })
        ], createElementExprTest);
        return createElementExprTest;
    }());
    exports.createElementExprTest = createElementExprTest;
});
//# sourceMappingURL=YA.createElement.expr.doct.js.map