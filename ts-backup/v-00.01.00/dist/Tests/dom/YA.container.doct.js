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
        define(["require", "exports", "../../doct", "../../YA.core", "../../dom/YA.container"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var doct_1 = require("../../doct");
    var YA = require("../../YA.core");
    var Ctnr = require("../../dom/YA.container");
    var TabTest = /** @class */ (function () {
        function TabTest() {
        }
        TabTest.prototype.base = function (assert_statement, demoElement) {
            var TabBasComp = /** @class */ (function () {
                function TabBasComp() {
                    YA.observable(true, "selectPn2", this);
                }
                TabBasComp.prototype.changeTab = function () {
                    var name = prompt("只能填写tp1,tp2其中一个", this.tab.selected[0]);
                    if (name !== "tp1" && name !== "tp2") {
                        return;
                    }
                    this.tab.selected = [name];
                };
                TabBasComp.prototype.changeAttr = function () {
                    this.selectPn2 = confirm("Yes=显示第二个卡,No=取消第二个卡片的显示");
                };
                TabBasComp.prototype.render = function () {
                    return YA.createElement("div", null,
                        YA.createElement("input", { type: "button", onclick: this.changeTab, value: "\u901A\u8FC7\u4FEE\u6539tab.selected\u9009\u4E2D\u7B2C\u4E00\u4E2A\u5361" }),
                        YA.createElement("input", { type: "button", onclick: this.changeAttr, value: "\u901A\u8FC7\u4FEE\u6539TabBasComp.selectPn2\u9009\u4E2D\u7B2C\u4E8C\u4E2A\u5361" }),
                        YA.createElement(Ctnr.Tab, { name: "tab" },
                            YA.createElement(Ctnr.Tab.Panel, { name: "tp1", text: "\u7B2C\u4E00\u4E2A\u9009\u9879\u5361" }, "\u7B2C\u4E00\u4E2A\u9009\u9879\u5361\u7684\u5185\u5BB9"),
                            YA.createElement(Ctnr.Tab.Panel, { name: "tp2", text: "\u7B2C\u4E8C\u4E2A\u9009\u9879\u5361", selected: this.selectPn2 }, "\u7B2C\u4E8C\u4E2A\u9009\u9879\u5361\u7684\u5185\u5BB9")));
                };
                return TabBasComp;
            }());
            YA.createComponent(TabBasComp, null, demoElement);
            assert_statement(function (assert) {
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        TabTest.prototype.style = function (assert_statement, demoElement) {
            var StyleComp = /** @class */ (function () {
                function StyleComp() {
                    YA.observable("group", "style", this);
                }
                StyleComp.prototype.groupStyle = function () {
                    this.style = "group";
                };
                StyleComp.prototype.tabStyle = function () {
                    this.style = "tab";
                };
                StyleComp.prototype.selectAll = function () {
                    this.pns.selectAll = true;
                };
                StyleComp.prototype.selectNone = function () {
                    this.pns.unselectAll = true;
                };
                StyleComp.prototype.render = function () {
                    return YA.createElement("div", null,
                        YA.createElement("input", { type: "button", onclick: this.tabStyle, value: "\u9009\u9879\u5361\u98CE\u683C" }),
                        YA.createElement("input", { type: "button", onclick: this.groupStyle, value: "\u5206\u7EC4\u98CE\u683C" }),
                        YA.createElement("input", { type: "button", onclick: this.selectAll, value: "\u5168\u9009" }),
                        YA.createElement("input", { type: "button", onclick: this.selectNone, value: "\u5168\u4E0D\u9009" }),
                        YA.createElement(Ctnr.SelectablePanels, { name: "pns", panelStyle: this.style },
                            YA.createElement(Ctnr.SelectablePanel, { name: "tp1", text: "\u7B2C\u4E00\u4E2A\u9009\u9879\u5361" }, "\u7B2C\u4E00\u4E2A\u9009\u9879\u5361\u7684\u5185\u5BB9"),
                            YA.createElement(Ctnr.SelectablePanel, { name: "tp2", text: "\u7B2C\u4E8C\u4E2A\u9009\u9879\u5361" }, "\u7B2C\u4E8C\u4E2A\u9009\u9879\u5361\u7684\u5185\u5BB9")));
                };
                return StyleComp;
            }());
            YA.createComponent(StyleComp, null, demoElement);
            assert_statement(function (assert) {
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        TabTest.prototype.composite = function (assert_statement, demoElement) {
            var CompositeComp = /** @class */ (function () {
                function CompositeComp() {
                }
                CompositeComp.prototype.render = function () {
                    return YA.createElement("div", null,
                        YA.createElement(Ctnr.Tab, { name: "tb1" },
                            YA.createElement(Ctnr.SelectablePanel, { name: "tp1", text: "\u7B2C\u4E00\u4E2A\u9009\u9879\u5361" },
                                YA.createElement(Ctnr.Group, null,
                                    YA.createElement(Ctnr.Group.Panel, { text: "\u7B2C\u4E00\u4E2Agroup" }, "111111111111111111111111111111"),
                                    YA.createElement(Ctnr.Group.Panel, { text: "\u7B2C\u4E8C\u4E2Agroup" },
                                        YA.createElement(Ctnr.Tab, null,
                                            YA.createElement(Ctnr.Tab.Panel, { text: "\u91CC\u9762\u7684\u9009\u9879\u53611" }, "\u91CC\u9762\u7684\u9009\u9879\u53611\u7684\u5185\u5BB9"),
                                            YA.createElement(Ctnr.Tab.Panel, { text: "\u91CC\u9762\u7684\u9009\u9879\u53612" }, "\u91CC\u9762\u7684\u9009\u9879\u53612\u7684\u5185\u5BB9"))),
                                    YA.createElement(Ctnr.Group.Panel, { text: "\u7B2C\u4E09\u4E2Agroup" }, "3"))),
                            YA.createElement(Ctnr.SelectablePanel, { name: "tp2", text: "\u7B2C\u4E8C\u4E2A\u9009\u9879\u5361" }, "\u7B2C\u4E8C\u4E2A\u9009\u9879\u5361\u7684\u5185\u5BB9")));
                };
                return CompositeComp;
            }());
            YA.createComponent(CompositeComp, null, demoElement);
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
        __decorate([
            doct_1.doct({
                title: "风格切换",
                descriptions: [
                    ""
                ]
            })
        ], TabTest.prototype, "style", null);
        __decorate([
            doct_1.doct({
                title: "组合测试",
                descriptions: [
                    ""
                ]
            })
        ], TabTest.prototype, "composite", null);
        TabTest = __decorate([
            doct_1.doct({
                title: "YA.dom.tab",
                descriptions: [
                    "选项卡"
                ],
                debugging: "composite"
            })
        ], TabTest);
        return TabTest;
    }());
    exports.TabTest = TabTest;
});
//# sourceMappingURL=YA.container.doct.js.map