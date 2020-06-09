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
                    this.number1 = parseInt(prompt("修改N1:", this.number1));
                };
                this.changeN2 = function () {
                    this.number2 = parseInt(prompt("修改N2:", this.number2));
                };
                this.render = function (descriptor) {
                    return YA_core_1.default.createElement("div", null,
                        YA_core_1.default.createElement("button", { onclick: this.changeN1 }, "\u4FEE\u6539n1"),
                        YA_core_1.default.createElement("button", { onclick: this.changeN2 }, "\u4FEE\u6539n2"),
                        this.number1,
                        " + ",
                        this.number2,
                        " = ",
                        YA_core_1.default.computed(function (n1, n2) { return n1 + n2; }, this.number1, this.number2));
                };
            }
            ;
            YA_core_1.default.createComponent(CompBase, null, demoElement);
            assert_statement(function (assert) {
            });
        };
        createElementExprTest.prototype.inComp = function (assert_statement, demoElement) {
            function InnerComp() {
                var n2 = YA_core_1.default.observable(1, "number2", this);
                var n3 = YA_core_1.default.observable(2, "number3", this);
                this.changeN3 = function () {
                    this.number3 = parseInt(prompt("修改number3:", this.number3));
                };
                this.render = function (descriptor) {
                    return YA_core_1.default.createElement("div", { class: "yellow-block" },
                        "\u63A7\u4EF6InnerComp:",
                        YA_core_1.default.createElement("button", { onclick: this.changeN3 }, "\u4FEE\u6539InnerComp.number3"),
                        YA_core_1.default.createElement("div", null,
                            "number2(",
                            this.number2,
                            ") + number3(",
                            this.number3,
                            ") = ",
                            YA_core_1.default.computed(function (n1, n2) { return n1 + n2; }, this.number2, this.number3)));
                };
            }
            function OuterComp() {
                var n1 = YA_core_1.default.observable(7, "number1", this);
                this.changeN1 = function () {
                    this.number1 = parseInt(prompt("修改number1:", this.number1));
                };
                this.render = function () {
                    return YA_core_1.default.createElement("div", { class: "red-block" },
                        YA_core_1.default.createElement("button", { onclick: this.changeN1 }, "\u4FEE\u6539OuterComp.number1"),
                        YA_core_1.default.createElement("div", null,
                            "InnerComp.number2 = OuterComp.number1(",
                            this.number1,
                            ") + 100"),
                        YA_core_1.default.createElement(InnerComp, { number2: YA_core_1.default.computed(function (n) { return n + 100; }, this.number1) }));
                };
            }
            ;
            YA_core_1.default.createComponent(OuterComp, null, demoElement);
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
        __decorate([
            doct_1.doct({
                title: "控件值的computed绑定",
                descriptions: [
                    "模板中使用表达式"
                ]
            })
        ], createElementExprTest.prototype, "inComp", null);
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
//# sourceMappingURL=YA.createElement.computed.doct.js.map