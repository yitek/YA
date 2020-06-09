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
            function Comp() {
                var swicher = YA_core_1.default.observable(true, "swicher", this);
                this.panel1Click = function () {
                    this.swicher = true;
                };
                this.panel2Click = function () {
                    this.swicher = false;
                };
                this.render = function (descriptor) {
                    return YA_core_1.default.createElement("div", null,
                        YA_core_1.default.createElement("div", null,
                            YA_core_1.default.createElement("span", { onclick: this.panel1Click }, "Panel 1"),
                            YA_core_1.default.createElement("span", { onclick: this.panel2Click }, "Panel 2")),
                        YA_core_1.default.createElement("div", { class: "red-block", if: this.swicher }, "this is the content of Panel1"),
                        YA_core_1.default.createElement("div", { class: "blue-block", if: YA_core_1.default.not(this.swicher) }, "this is the content of Panel2"));
                };
            }
            ;
            YA_core_1.default.createComponent(Comp, null, demoElement);
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
                title: "YA.createElement.if",
                descriptions: [
                    "模板中的if"
                ]
                //,debugging:"complex"
            })
        ], createElementExprTest);
        return createElementExprTest;
    }());
    exports.createElementExprTest = createElementExprTest;
});
//# sourceMappingURL=YA.createElement.if.doct.js.map