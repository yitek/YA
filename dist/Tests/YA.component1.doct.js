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
    var YA = require("../YA.core");
    var componentTest = /** @class */ (function () {
        function componentTest() {
        }
        componentTest.prototype.jsRaw = function (assert_statement, container) {
            var comp = YA.component(function () {
                var _this = this;
                this.model = { title: "YA.component的基本用法" };
                this.render = function (container) {
                    return YA.createElement("div", { onclick: _this.changeTitle },
                        "\u70B9\u51FB\u8FD9\u91CC\u4F1A\u5F39\u51FA\u4E00\u4E2A\u8F93\u5165\u6846,\u8F93\u5165\u7684\u6587\u672C\u5C06\u663E\u793A\u5728\u8FD9\u91CC:[",
                        _this.model.title,
                        "].");
                };
                this.changeTitle = function () {
                    var newTitle = window.prompt("请输入新的标题:", _this.model.title);
                    _this.model.title = newTitle;
                };
            });
            comp.render(container);
        };
        componentTest.prototype.ts = function (assert_statement, container) {
            var MyComponent = /** @class */ (function () {
                function MyComponent() {
                    this.model = { title: "YA framework" };
                    this.rows = [];
                }
                MyComponent.prototype.render = function (container) {
                    return YA.createElement("div", { onclick: this.changeTitle },
                        "\u70B9\u51FB\u8FD9\u91CC\u4F1A\u5F39\u51FA\u4E00\u4E2A\u8F93\u5165\u6846,\u8F93\u5165\u7684\u6587\u672C\u5C06\u663E\u793A\u5728\u8FD9\u91CC:[",
                        this.model.title,
                        "].");
                };
                MyComponent.prototype.tpl = function (container, outer_vnode) {
                    return YA.createElement("table", { class: YA.EXP(this.model.title, function (t) { return t + "px"; }) },
                        YA.createElement("thead", null,
                            YA.createElement("tr", { for: [outer_vnode.children, this.col] },
                                YA.createElement("th", { if: YA.NOT(this.col.disabled) }, this.col.name))),
                        YA.createElement("tbody", { for: [this.rows, this.item] },
                            YA.createElement("tr", { for: [outer_vnode.children, this.col] },
                                YA.createElement("td", null, this.item[this.col]))));
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
        };
        componentTest.prototype.IF = function (assert_statement, container) {
            var MyComponent = /** @class */ (function () {
                function MyComponent() {
                    this.model = { title: "YA framework", showTitle: true };
                }
                MyComponent.prototype.render = function (container) {
                    return YA.createElement("div", null,
                        YA.createElement("input", { type: "checkbox", checked: this.model.showTitle, onclick: this.changeState }),
                        "\u53EF\u4EE5\u7528checkbox\u63A7\u5236\u540E\u9762\u7684\u6587\u672C\u7684\u663E\u793A:",
                        YA.createElement("div", { if: this.model.showTitle },
                            "[",
                            this.model.title,
                            "]"),
                        YA.createElement("span", null, "---->\u8FD9\u662F\u6587\u672C\u540E\u9762\u7684\u6587\u5B57"));
                };
                MyComponent.prototype.changeState = function (e) {
                    this.model.showTitle = !this.model.showTitle;
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
        };
        componentTest.prototype.For = function (assert_statement, container) {
            var MyComponent = /** @class */ (function () {
                function MyComponent() {
                    this.queries = { title: "" };
                    this.rows = [{ "$__ONLY_USED_BY_SCHEMA__": true, title: "YA-v1.0", author: { name: "yiy" } }];
                    this.item = this.rows[0];
                    this.data = [
                        { title: "YA-v1.1", author: { name: "yiy1" } },
                        { title: "YA-v2.1", author: { name: "yiy2" } },
                        { title: "YA-v3.2", author: { name: "yiy3" } },
                        { title: "YA-v4.2", author: { name: "yiy1" } },
                        { title: "YA-v5.3", author: { name: "yiy2" } },
                        { title: "YA-v6.4", author: { name: "yiy3" } },
                        { title: "YA-v7.4", author: { name: "yiy1" } }
                    ];
                }
                MyComponent.prototype.render = function (container) {
                    return YA.createElement("div", null,
                        YA.createElement("div", null,
                            YA.createElement("input", { type: "text", placeholder: "\u6807\u9898", value: this.queries.title, onblur: this.changeTitle }),
                            YA.createElement("button", { onclick: this.doFilter }, "\u8FC7\u6EE4")),
                        YA.createElement("table", { border: "1", cellspacing: "0", style: { border: "1px" } },
                            YA.createElement("thead", null,
                                YA.createElement("tr", null,
                                    YA.createElement("th", null, "\u6807\u9898"),
                                    YA.createElement("th", null, "\u4F5C\u8005"))),
                            YA.createElement("tbody", { for: [this.rows, this.item] },
                                YA.createElement("tr", null,
                                    YA.createElement("td", null, this.item.title),
                                    YA.createElement("td", null, this.item.author.name)))));
                };
                MyComponent.prototype.changeTitle = function (e) {
                    this.queries.title = e.target.value;
                };
                MyComponent.prototype.doFilter = function (e) {
                    var rows = [];
                    for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
                        var item = _a[_i];
                        //let item = this.data[i];
                        if (item.title.indexOf(this.queries.title) >= 0)
                            rows.push(item);
                    }
                    this.rows = rows;
                };
                __decorate([
                    YA.reactive()
                ], MyComponent.prototype, "queries", void 0);
                __decorate([
                    YA.reactive()
                ], MyComponent.prototype, "rows", void 0);
                __decorate([
                    YA.reactive(YA.ReactiveTypes.Iterator)
                ], MyComponent.prototype, "item", void 0);
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
            myComponent.rows = myComponent.data;
            myComponent.render(container);
        };
        componentTest.prototype.composite = function (assert_statement, container) {
            var CompA = /** @class */ (function () {
                function CompA() {
                    this.name = "";
                    this.signture = "";
                }
                //@YA.template()
                CompA.prototype.render = function () {
                    return YA.createElement("div", null,
                        "  My name is ",
                        this.name,
                        ",my signture is here:",
                        YA.createElement("input", { type: "text", value: this.signture, onblur: this.onblur }));
                };
                CompA.prototype.onblur = function (e) {
                    this.signture = e.target.value;
                };
                __decorate([
                    YA.IN
                ], CompA.prototype, "name", void 0);
                __decorate([
                    YA.OUT
                ], CompA.prototype, "signture", void 0);
                CompA = __decorate([
                    YA.component("CompA")
                ], CompA);
                return CompA;
            }());
            var CompB = /** @class */ (function () {
                function CompB() {
                    //@YA.reactive()
                    this.myname = "yiy";
                    //@YA.reactive()
                    this.mysignture = "";
                }
                //@YA.template()
                CompB.prototype.render = function (container) {
                    return YA.createElement("div", null,
                        YA.createElement("button", { onclick: this.changeMyName }, "\u70B9\u51FB\u8FD9\u91CC\u4FEE\u6539\u540D\u79F0"),
                        YA.createElement("fieldset", null,
                            YA.createElement("legend", null, "\u7B7E\u540D"),
                            YA.createElement(CompA, { name: this.myname, signture: this.mysignture })),
                        "\u4F60\u7684\u7B7E\u540D:",
                        this.mysignture);
                };
                CompB.prototype.changeMyName = function () {
                    var newName = prompt("修改我的名字", this.myname);
                    this.myname = newName;
                };
                CompB = __decorate([
                    YA.component("CompB")
                ], CompB);
                return CompB;
            }());
            var b = new CompB();
            b.render(container);
        };
        __decorate([
            doct_1.doct({
                title: "js原生"
            })
        ], componentTest.prototype, "jsRaw", null);
        __decorate([
            doct_1.doct({ title: "TS类带装饰器" })
        ], componentTest.prototype, "ts", null);
        __decorate([
            doct_1.doct({
                title: "模板函数中的IF"
            })
        ], componentTest.prototype, "IF", null);
        __decorate([
            doct_1.doct({ title: "模板函数中的for" })
        ], componentTest.prototype, "For", null);
        __decorate([
            doct_1.doct({
                title: "控件组合使用"
            })
        ], componentTest.prototype, "composite", null);
        componentTest = __decorate([
            doct_1.doct({ title: "YA.component" })
        ], componentTest);
        return componentTest;
    }());
    exports.componentTest = componentTest;
});
//# sourceMappingURL=YA.component1.doct.js.map