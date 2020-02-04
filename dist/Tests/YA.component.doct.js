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
    var componentTest = /** @class */ (function () {
        function componentTest(cdoc) {
            cdoc.description = "UI\u63A7\u4EF6";
            cdoc.usage("基本用法", function (assert_statement, container) {
                var MyComponent = /** @class */ (function () {
                    function MyComponent() {
                        this.model = { title: "YA framework" };
                        this.rows = [];
                    }
                    MyComponent.prototype.render = function (container) {
                        return YA.virtualNode("div", { onclick: this.changeTitle },
                            "\u70B9\u51FB\u8FD9\u91CC\u4F1A\u5F39\u51FA\u4E00\u4E2A\u8F93\u5165\u6846,\u8F93\u5165\u7684\u6587\u672C\u5C06\u663E\u793A\u5728\u8FD9\u91CC:[",
                            this.model.title,
                            "].");
                    };
                    MyComponent.prototype.tpl = function (container, outer_vnode) {
                        return YA.virtualNode("table", { class: YA.EXP(this.model.title, function (t) { return t + "px"; }) },
                            YA.virtualNode("thead", null,
                                YA.virtualNode("tr", { for: [outer_vnode.children, this.col] },
                                    YA.virtualNode("th", { if: YA.NOT(this.col.disabled) }, this.col.name))),
                            YA.virtualNode("tbody", { for: [this.rows, this.item] },
                                YA.virtualNode("tr", { for: [outer_vnode.children, this.col] },
                                    YA.virtualNode("td", null, this.item[this.col]))));
                    };
                    MyComponent.prototype.changeTitle = function (e) {
                        var newTitle = window.prompt("请输入新的标题:", this.model.title);
                        this.model.title = newTitle;
                    };
                    __decorate([
                        YA.reactive()
                    ], MyComponent.prototype, "model", void 0);
                    __decorate([
                        YA.template()
                    ], MyComponent.prototype, "render", null);
                    MyComponent = __decorate([
                        YA.component("My")
                    ], MyComponent);
                    return MyComponent;
                }());
                ;
                var myComponent = new MyComponent();
                myComponent.render(container);
                assert_statement(function (assert) {
                    //assert(YA.DataTypes.Object,proxy.$type,`代理的类型为值类型:proxy.$type === YA.DataTypes.${YA.DataTypes[proxy.$type]}`);
                    //assert("YA framework",proxy.title,"可以访问对象上的数据:proxy.title==='YA framework'");
                    //assert("id,title",membernames.join(","),"可以且只可以枚举原始数据的字段:membernames=['1','title']");
                });
            });
        }
        componentTest = __decorate([
            YA_doct_1.doct("YA.component")
        ], componentTest);
        return componentTest;
    }());
    exports.componentTest = componentTest;
});
//# sourceMappingURL=YA.component.doct.js.map