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
            var options = {
                "footboall": "足球",
                "basketball": "篮球",
                "swimming": "游泳"
            };
            YA.createElement(YA.createElement(Dom.Dropdown, { id: "sport", options: options, fields: { "Text": "运动" } }), demoElement);
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