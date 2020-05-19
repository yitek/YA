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
        define(["require", "exports", "../../doct", "../../YA.core", "../../dom/YA.dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var doct_1 = require("../../doct");
    var YA = require("../../YA.core");
    var Dom = require("../../dom/YA.dom");
    var DropdownTest = /** @class */ (function () {
        function DropdownTest() {
        }
        DropdownTest.prototype.base = function (assert_statement, demoElement) {
            var BaseComp = /** @class */ (function () {
                function BaseComp() {
                }
                BaseComp.prototype.render = function () {
                    return YA.createElement("div", null,
                        YA.createElement("input", { type: "text", id: "BaseDropdown", style: { "marginLeft": "300px", width: "100px" } }),
                        YA.createElement("ul", { class: "test-dropdown", style: { "display": "none" } },
                            YA.createElement("li", null, "Item1"),
                            YA.createElement("li", null, "Item2"),
                            YA.createElement("li", null, "Item3"),
                            YA.createElement("li", null, "Item411111111111111111111111111111111")));
                };
                BaseComp.prototype.rendered = function (elem) {
                    var input = elem.firstElementChild;
                    var dropContent = elem.lastElementChild;
                    var dp = new Dom.Dropdownable(input, { content: dropContent });
                };
                return BaseComp;
            }());
            YA.createComponent(BaseComp, null, demoElement);
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
                title: "YA.dom.dropdown",
                descriptions: [
                    "下拉"
                ]
            })
        ], DropdownTest);
        return DropdownTest;
    }());
    exports.DropdownTest = DropdownTest;
});
//# sourceMappingURL=YA.dropdown.doct.js.map