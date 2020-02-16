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
        define(["require", "exports", "../YA.doct", "../YA.core"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var YA_doct_1 = require("../YA.doct");
    var YA = require("../YA.core");
    YA_doct_1.doct.output = YA_doct_1.outputToElement;
    var DomTest = /** @class */ (function () {
        function DomTest(cdoc) {
            cdoc.description = "UI\u63A7\u4EF6";
            cdoc.usage("基本用法", function (assert_statement, container) {
            });
        }
        DomTest.prototype.mask = function (mdoc) {
            mdoc.usage("遮挡", function (assert_statement, container) {
                var Comp = /** @class */ (function () {
                    function Comp() {
                        this.maskText = false;
                    }
                    Comp.prototype.render = function (container) {
                        return YA.virtualNode("div", null,
                            YA.virtualNode("div", { style: "width:200px;height:200px;padding:10px;background-color:#ffffff;border:2px solid black;color:black;font-size:24px;font-weight:bold;", mask: this.maskText }, "\u88AB\u906E\u6321\u7684\u5185\u5BB9"),
                            YA.virtualNode("a", { onclick: this.changeMask }, "\u70B9\u51FB\u6211\u53EF\u4EE5\u4EA4\u66FF\u906E\u7F69\u6548\u679C"));
                    };
                    Comp.prototype.changeMask = function (e) {
                        if (this.maskText)
                            this.maskText = false;
                        else
                            this.maskText = "遮挡";
                    };
                    Comp = __decorate([
                        YA.component("CompA")
                    ], Comp);
                    return Comp;
                }());
                var b = new Comp();
                b.render(container);
            });
        };
        __decorate([
            YA_doct_1.doct()
        ], DomTest.prototype, "mask", null);
        DomTest = __decorate([
            YA_doct_1.doct("YA.dom")
        ], DomTest);
        return DomTest;
    }());
    exports.DomTest = DomTest;
});
//# sourceMappingURL=YA.dom.doct.js.map