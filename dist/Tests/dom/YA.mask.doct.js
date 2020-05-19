var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    var MaskTest = /** @class */ (function () {
        function MaskTest() {
        }
        MaskTest.prototype.base = function (assert_statement, demoElement) {
            var Comp = /** @class */ (function () {
                function Comp() {
                }
                Comp.prototype.showMask = function () {
                    Dom.mask(document.getElementById("masked"), "前面的消息");
                };
                Comp.prototype.hideMask = function () {
                    Dom.mask(document.getElementById("masked"), false);
                };
                Comp.prototype.render = function () {
                    return YA.createElement("div", null,
                        YA.createElement("button", { onclick: this.showMask }, "show"),
                        YA.createElement("button", { onclick: this.hideMask }, "hide"),
                        YA.createElement("div", { id: "masked" },
                            "\u8FD9\u662F\u4E00\u4E9B\u5185\u5BB9",
                            YA.createElement("br", null),
                            "\u53EF\u80FD\u6709\u4E9B\u957F"));
                };
                return Comp;
            }());
            YA.createComponent(Comp, null, demoElement);
            assert_statement(function (assert) {
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        MaskTest.prototype.attr = function (assert_statement, demoElement) {
            var Comp = /** @class */ (function () {
                function Comp() {
                    this.mask = false;
                }
                Comp.prototype.showMask = function () {
                    this.mask = prompt("请填写消息内容", this.mask);
                };
                Comp.prototype.hideMask = function () {
                    this.mask = false;
                };
                Comp.prototype.render = function () {
                    return YA.createElement("div", null,
                        YA.createElement("button", { onclick: this.showMask }, "show"),
                        YA.createElement("button", { onclick: this.hideMask }, "hide"),
                        YA.createElement("div", { style: { backgroundColor: "green", width: "200px", height: "100px" }, mask: this.mask },
                            "\u8FD9\u662F\u4E00\u4E9B\u5185\u5BB9",
                            YA.createElement("br", null),
                            "\u53EF\u80FD\u6709\u4E9B\u957F"));
                };
                __decorate([
                    YA.reactive()
                ], Comp.prototype, "mask", void 0);
                return Comp;
            }());
            YA.createComponent(Comp, null, demoElement);
            assert_statement(function (assert) {
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        MaskTest.prototype.maskComp = function (assert_statement, demoElement) {
            var MaskableComp = /** @class */ (function (_super) {
                __extends(MaskableComp, _super);
                function MaskableComp() {
                    var _this = _super.call(this) || this;
                    debugger;
                    return _this;
                }
                MaskableComp.prototype.showMask = function () {
                    var _this = this;
                    this.mask = prompt("请填写消息内容", this.mask);
                    setTimeout(function () {
                        _this.mask = false;
                    }, 5000);
                };
                MaskableComp.prototype.render = function () {
                    return YA.createElement("div", null,
                        YA.createElement("button", { onclick: this.showMask }, "show"),
                        YA.createElement("div", { style: { backgroundColor: "green", width: "200px", height: "100px" } },
                            "\u8FD9\u662F\u4E00\u4E9B\u5185\u5BB9",
                            YA.createElement("br", null),
                            "\u53EF\u80FD\u6709\u4E9B\u957F",
                            YA.createElement("br", null),
                            "\u906E\u7F69\u4EA7\u751F\u540E5\u79D2\u4F1A\u9000\u51FA"));
                };
                return MaskableComp;
            }(Dom.Component));
            YA.createComponent(MaskableComp, null, demoElement);
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
        ], MaskTest.prototype, "base", null);
        __decorate([
            doct_1.doct({
                title: "用属性控制遮罩",
                descriptions: [
                    ""
                ]
            })
        ], MaskTest.prototype, "attr", null);
        __decorate([
            doct_1.doct({
                title: "用属性控制遮罩",
                descriptions: [
                    ""
                ]
            })
        ], MaskTest.prototype, "maskComp", null);
        MaskTest = __decorate([
            doct_1.doct({
                title: "YA.dom.mask",
                descriptions: [
                    "遮罩"
                ],
                debugging: "maskComp"
            })
        ], MaskTest);
        return MaskTest;
    }());
    exports.MaskTest = MaskTest;
});
//# sourceMappingURL=YA.mask.doct.js.map