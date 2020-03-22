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
    var CreateElementTest = /** @class */ (function () {
        function CreateElementTest() {
        }
        CreateElementTest.prototype.base_jsx = function (assert_statement, demoElement) {
            //最简单的创建一个div
            var div = YA.createElement("div");
            YA.DomUtility.appendChild(demoElement, div);
            YA.DomUtility.setContent(div, "该div是由YA.createElement('div')产生的");
            //带属性的div
            div = YA.createElement("div", {
                "className": "blue-block"
            });
            YA.DomUtility.appendChild(demoElement, div);
            YA.DomUtility.setContent(div, "该div是由YA.createElement('div',{})产生的");
            //带 children
            div = YA.createElement("div", { "class": "red-block" }, "该div是外面创建的", YA.createElement("div", { className: "blue-block" }, "该div是里面创建的"));
            YA.DomUtility.appendChild(demoElement, div);
        };
        CreateElementTest.prototype.component_jsx = function (assert_statement, demoElement) {
            //创建一个jsx函数风格的组件
            var Component = function (states) {
                var elem = YA.DomUtility.createElement("div");
                YA.DomUtility.setAttribute(elem, "className", states.css);
                YA.DomUtility.setContent(elem, states.text);
                return elem;
            };
            var domNode = YA.createElement(Component, { css: "blue-block", text: "函数风格的jsx组件" });
            YA.DomUtility.appendChild(demoElement, domNode);
            //创建一个面向对象风格的组件
            Component = function (states) {
                this.render = function () {
                    var elem = YA.DomUtility.createElement("div");
                    YA.DomUtility.setAttribute(elem, "className", states.css);
                    YA.DomUtility.setContent(elem, states.text);
                    return elem;
                };
            };
            domNode = YA.createElement(Component, { css: "red-block", text: "对象·风格的jsx组件" });
            YA.DomUtility.appendChild(demoElement, domNode);
        };
        CreateElementTest.prototype.manual = function (assert_statement, demoElement) {
            //构建一个text
            var text = YA.createElement({ content: "该文本由YA.createElement({content:''})方式创建" }, demoElement);
            //构建一个div
            var div = YA.createElement({ tag: "div", className: "blue-block", content: "该div由YA.createElement({})创建" });
            YA.DomUtility.appendChild(demoElement, div);
            //构建一个带children的div
            var hasChildren = YA.createElement({
                tag: "div",
                className: "red-block",
                children: [
                    //可以是文本
                    "这是带children的div"
                    //也可以是一个元素
                    ,
                    YA.DomUtility.createElement("tag", {}, null, "这是children中的元素")
                    //还可以是NodeDescriptor
                    ,
                    {
                        tag: "div",
                        className: "blue-block",
                        content: "这是Descriptor产生的div"
                    }
                ]
            }, demoElement);
        };
        CreateElementTest.prototype.componentLib_jsx = function (assert_statement, demoElement) {
            //创建一个jsx函数风格的组件
            var Component = function (states) {
                var elem = YA.DomUtility.createElement("div");
                YA.DomUtility.setAttribute(elem, "className", states.css);
                YA.DomUtility.setContent(elem, states.text);
                return elem;
            };
            YA.componentTypes["MyComp"] = Component;
            var domNode = YA.createElement({
                tag: "MyComp",
                css: "blue-block",
                text: "从组件库中生成的组件"
            });
            YA.DomUtility.appendChild(demoElement, domNode);
        };
        __decorate([
            doct_1.doct({
                title: "用于jsx factory的重载。",
                descriptions: [
                    "调用方式有:",
                    ["createElement(tag:string)", "createElement(tag:string,attrs:{},...children:IDomNode[])"]
                ]
            })
        ], CreateElementTest.prototype, "base_jsx", null);
        __decorate([
            doct_1.doct({
                title: "带组件的jsx"
            })
        ], CreateElementTest.prototype, "component_jsx", null);
        __decorate([
            doct_1.doct({
                title: "手工/开发者使用的重载。",
                descriptions: [
                    "调用方式为:",
                    ["createElement(tag:INodeDescriptor,parent?:IDomNode,viewModel?:IViewModel)"]
                ]
            })
        ], CreateElementTest.prototype, "manual", null);
        __decorate([
            doct_1.doct({
                title: "用tag调用注册到组件库中的组件"
            })
        ], CreateElementTest.prototype, "componentLib_jsx", null);
        CreateElementTest = __decorate([
            doct_1.doct({
                title: "YA.createElement",
                descriptions: [
                    "该函数为YA的核心函数，其作用为：根据NodeDescription的信息(可能是展开的，该函数有许多的重载),创建真正的dom-node。它的设计目的有:",
                    ["jsx的factory,直接将jsx生成的代码转换成dom-node", "开发人员在某些地方自己构建了一个vnode,想把该vnode转换成Dom-Node", "在vnode中某些属性为Schema,那么就追加一个参数viewModel，可以让viewModel跟生成的dom-node做属性绑定。"]
                ]
            })
        ], CreateElementTest);
        return CreateElementTest;
    }());
    exports.CreateElementTest = CreateElementTest;
});
//# sourceMappingURL=YA.createElement.doct.js.map