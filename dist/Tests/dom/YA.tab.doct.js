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
        define(["require", "exports", "../../doct", "../../YA.core", "../../YA.dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var doct_1 = require("../../doct");
    var YA = require("../../YA.core");
    var Dom = require("../../YA.dom");
    var TabTest = /** @class */ (function () {
        function TabTest() {
        }
        TabTest.prototype.base = function (assert_statement, demoElement) {
            var TabBasComp = /** @class */ (function () {
                function TabBasComp() {
                }
                TabBasComp.prototype.render = function () {
                    return YA.createElement(Dom.Tab, null,
                        YA.createElement(Dom.Tab.Panel, { name: "tp-1", label: "\u7B2C\u4E00\u4E2A\u9009\u9879\u5361" }, "\u7B2C\u4E00\u4E2A\u9009\u9879\u5361\u7684\u5185\u5BB9"),
                        YA.createElement(Dom.Tab.Panel, { name: "tp-2", label: "\u7B2C\u4E8C\u4E2A\u9009\u9879\u5361" }, "\u7B2C\u4E8C\u4E2A\u9009\u9879\u5361\u7684\u5185\u5BB9"));
                };
                return TabBasComp;
            }());
            YA.createComponent(TabBasComp, null, demoElement);
            assert_statement(function (assert) {
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        __decorate([
            doct_1.doct({
                title: "基本用法",
                descriptions: [
                    ""
                ]
            })
        ], TabTest.prototype, "base", null);
        TabTest = __decorate([
            doct_1.doct({
                title: "YA.dom.tab",
                descriptions: [
                    "选项卡"
                ]
            })
        ], TabTest);
        return TabTest;
    }());
    exports.TabTest = TabTest;
});
//# sourceMappingURL=YA.tab.doct.js.map