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
        CreateElementTest.prototype.composite = function (assert_statement, demoElement) {
            var Comp1 = function (descriptor, container) {
                //return <div class={descriptor.css}>这是Comp1:{descriptor.text}</div>;
                return YA.createElement("div", { class: descriptor.css },
                    "\u8FD9\u662FComp1:",
                    descriptor.text);
            };
            function Comp2() {
                this.render = function (descriptor) {
                    /*return <div class={descriptor.css}>
                        这是COMP2:{descriptor.text}
                        {descriptor.children}
                    </div>; */
                    return YA.createElement("div", { class: descriptor.css },
                        "COMP2.text:",
                        descriptor.text,
                        descriptor.children);
                };
            }
            function Comp3() {
                var _this = this;
                this.comp2 = "green-block";
                this.comp1 = "red-block";
                this.render = function (descriptor) {
                    /* return <div class={descriptor.css}>
                        这是Comp3
                        <Comp2 css ={this.comp2}>
                            <div class="orange-block">这是comp2里面的内容</div>
                            <div class="orange-block">这是comp2里面的内容</div>
                            <Comp1 css={this.comp1} text="这是comp1.text的内容" />
                        </Comp2>
                    </div>; */
                    return YA.createElement("div", { class: descriptor.css },
                        "\u8FD9\u662FComp3",
                        YA.createElement(Comp2, { css: _this.comp2, text: "\u8FD9\u662Fcomp3\u7ED9comp2\u7684\u6587\u672C" },
                            YA.createElement("div", { class: "orange-block" }, "\u8FD9\u662Fcomp2\u91CC\u9762\u7684\u5185\u5BB9"),
                            YA.createElement("div", { class: "orange-block" }, "\u8FD9\u662Fcomp2\u91CC\u9762\u7684\u5185\u5BB9"),
                            YA.createElement(Comp1, { css: _this.comp1, text: "\u8FD9\u662Fcomp1.text\u7684\u5185\u5BB9" })));
                };
            }
            var elem = YA.createElement(Comp3);
            YA.DomUtility.appendChild(demoElement, elem);
        };
        CreateElementTest.prototype.vnode = function (assert_statement, demoElement) {
            var attrs = YA.observable({ css: "green-block", text: "init text" });
            var vnode;
            YA.proxyMode(function () {
                vnode = {
                    tag: "div", className: attrs.css,
                    children: [
                        "这是vnode创建的div",
                        { tag: "br" },
                        "vnode.text=",
                        attrs.text
                    ]
                };
            });
            var elem = YA.createElement(vnode);
            YA.DomUtility.appendChild(demoElement, elem);
        };
        CreateElementTest.prototype.compAttr = function (assert_statement, demoElement) {
            function Comp() {
                var _this = this;
                YA.observable("blue-block", "css", this);
                YA.observable("", "text", this);
                YA.observable("这是comp2自己赋值的文本", "innerText", this);
                this.render = function (descriptor, container) {
                    /*return <div class={this.css}>
                        this.text =  {this.text}<br />
                        this.innerText={this.innerText}
                    </div>;*/
                    return YA.createElement("div", { class: _this.css },
                        "this.text =  ",
                        _this.text,
                        YA.createElement("br", null),
                        "this.innerText=",
                        _this.innerText);
                };
            }
            var node = YA.createElement(Comp, { css: "red-block", "text": "注入的text" });
            YA.DomUtility.appendChild(demoElement, node);
        };
        CreateElementTest.prototype.deep = function (assert_statement, demoElement) {
            var Comp1 = function (descriptor, container) {
                //return <div class={descriptor.css}>这是Comp1:{descriptor.text}</div>;
                return YA.createElement("div", { class: descriptor.css },
                    "\u8FD9\u662FComp1.text:",
                    descriptor.text);
            };
            function Comp2() {
                var _this = this;
                YA.observable("blue-block", "css", this);
                YA.observable("", "text", this);
                YA.observable("这是comp2自己赋值的文本", "innerText", this);
                this.render = function (descriptor) {
                    /*return <div class={this.css}>
                        COMP2.text:{this.text}
                        <div>COMP2.innerText:{this.innerText}</div>
                        {descriptor.children}
                    </div> */
                    return YA.createElement("div", { class: _this.css },
                        "\u8FD9\u662Fcomp2\u521B\u5EFA\u7684div",
                        YA.createElement("br", null),
                        "COMP2.text:",
                        _this.text,
                        YA.createElement("div", null,
                            "COMP2.innerText:",
                            _this.innerText),
                        "\u540E\u9762\u8DDF\u7740comp1\u6CE8\u5165\u7684children",
                        YA.createElement("br", null),
                        descriptor.children);
                };
            }
            function Comp3() {
                var _this = this;
                YA.observable("red-block", "comp1", this);
                YA.observable("blue-block", "comp2", this);
                YA.observable("yellow-block", "comp3", this);
                this.render = function (descriptor) {
                    /* return <div class={this.comp3}>
                        这是Comp3
                        <Comp2 css ={this.comp2}>
                            <div class="orange-block">这是comp2里面的内容</div>
                            <div class="orange-block">这是comp2里面的内容</div>
                            <Comp1 css={this.comp1} text="这是comp1.text的内容" />
                        </Comp2>
                    </div>; */
                    return YA.createElement("div", { class: _this.comp3 },
                        "\u8FD9\u662FComp3\u521B\u5EFA\u7684div",
                        YA.createElement(Comp2, { css: _this.comp2, text: "comp3\u4F20\u9012\u7ED9comp2.text\u7684\u5185\u5BB9" },
                            YA.createElement("div", { class: "orange-block" }, "\u8FD9\u662Fcomp3\u7ED9\u5B9A\u7684comp2.children"),
                            YA.createElement("div", { class: "orange-block" }, "comp3\u91CC\u9762\u5305\u542B\u4E86comp1"),
                            YA.createElement(Comp1, { css: _this.comp1, text: "\u8FD9\u662Fcomp3.text\u7684\u5185\u5BB9,\u8D4B\u4E88\u7ED9\u4E86Comp1.text" })));
                };
            }
            var elem = YA.createElement(Comp3);
            YA.DomUtility.appendChild(demoElement, elem);
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
        __decorate([
            doct_1.doct({
                title: "组件的组合调用"
            })
        ], CreateElementTest.prototype, "composite", null);
        __decorate([
            doct_1.doct({
                title: "vnode&属性绑定"
            })
        ], CreateElementTest.prototype, "vnode", null);
        __decorate([
            doct_1.doct({
                title: "控件与属性绑定"
            })
        ], CreateElementTest.prototype, "compAttr", null);
        __decorate([
            doct_1.doct({
                title: "多层绑定"
            })
        ], CreateElementTest.prototype, "deep", null);
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