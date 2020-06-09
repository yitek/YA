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
    var YA_core_1 = require("../YA.core");
    var createElementForTest = /** @class */ (function () {
        function createElementForTest() {
        }
        createElementForTest.prototype.base = function (assert_statement, demoElement) {
            function comp1() {
                var data = [{ id: 1, name: "yiy1" }, { id: 2, name: "yiy2" }, { id: 3, name: "yiy3" }];
                YA_core_1.default.observable(data, "items", this);
                var item = YA_core_1.default.enumerator({ id: 0, name: "yiy" });
                this.render = function (container, descriptor) {
                    return YA_core_1.default.createElement("ul", { loop: [this.items, item] },
                        YA_core_1.default.createElement("li", null, item.name));
                };
            }
            ;
            var t = new Date();
            YA_core_1.default.createComponent(comp1, null, demoElement);
            assert_statement(function (assert) {
                var t1 = new Date();
                var ellapse = t1.valueOf() - t1.valueOf();
                console.log(ellapse);
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        createElementForTest.prototype.filter = function (assert_statement, demoElement) {
            function comp1() {
                var data = [{ id: 1, name: "yiy11" }, { id: 2, name: "yiy12" }, { id: 3, name: "yiy23" }];
                YA_core_1.default.observable(data, "items", this);
                YA_core_1.default.enumerator({ id: 0, name: "yiy" }, "item", this);
                var self = this;
                this.keywordChange = function (e) {
                    var keyword = YA_core_1.default.trim(e.target.value);
                    if (keyword) {
                        var filteredData = [];
                        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                            var item = data_1[_i];
                            if (item.name.indexOf(keyword) >= 0)
                                filteredData.push(item);
                        }
                        self.items = filteredData;
                    }
                };
                this.render = function (container, descriptor) {
                    return YA_core_1.default.createElement("div", null,
                        YA_core_1.default.createElement("input", { type: "text", placeholder: "\u8BF7\u8F93\u5165\u5173\u952E\u5B57\uFF0C\u6BD4\u59821,2,3\u5176\u4E2D\u4E00\u4E2A\uFF0C\u7136\u540E\u56DE\u8F66", onblur: this.keywordChange }),
                        YA_core_1.default.createElement("ul", { for: [this.items, this.item] },
                            YA_core_1.default.createElement("li", null, this.item.name)));
                };
            }
            ;
            var t = new Date();
            YA_core_1.default.createComponent(comp1, null, demoElement);
            assert_statement(function (assert) {
                var t1 = new Date();
                console.log(t1.valueOf() - t1.valueOf());
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        createElementForTest.prototype.item = function (assert_statement, demoElement) {
            function comp1() {
                var data = [{ id: 1, name: "yiy11" }, { id: 2, name: "yiy12" }, { id: 3, name: "yiy23" }];
                YA_core_1.default.observable(data, "items", this);
                YA_core_1.default.enumerator({ id: 0, name: "yiy" }, "item", this);
                this.nameChange = function (evt, item) {
                    var name = YA_core_1.default.trim(evt.target.value);
                    item.name = name;
                };
                this.showData = function () {
                    var json = JSON.stringify(this.items.get(YA_core_1.default.ObservableModes.Value));
                    console.log(json);
                    alert(json);
                };
                this.render = function (container, descriptor) {
                    return YA_core_1.default.createElement("div", null,
                        YA_core_1.default.createElement("table", { border: "1" },
                            YA_core_1.default.createElement("tbody", { for: [this.items, this.item] },
                                YA_core_1.default.createElement("tr", null,
                                    YA_core_1.default.createElement("td", null, this.item.id),
                                    YA_core_1.default.createElement("td", null,
                                        YA_core_1.default.createElement("input", { type: "text", value: this.item.name, onblur: [this.nameChange, YA_core_1.default.EVENT, this.item] })),
                                    YA_core_1.default.createElement("td", null, this.item.name)))),
                        YA_core_1.default.createElement("button", { onclick: this.showData }, "\u70B9\u51FB\u6211\u67E5\u770B\u53D8\u66F4\u540E\u7684\u6570\u636E"));
                };
            }
            ;
            var t = new Date();
            YA_core_1.default.createComponent(comp1, null, demoElement);
            assert_statement(function (assert) {
                var t1 = new Date();
                console.log(t1.valueOf() - t1.valueOf());
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        createElementForTest.prototype.complex = function (assert_statement, demoElement) {
            function ComplexComp() {
                var provinces = [{ key: "", value: "--" }, { key: "cq", value: "重庆" }, { key: "sc", value: "四川" }, { key: "bj", value: "北京" }];
                var interests = [{ key: "football", value: "足球" }, { key: "basketball", value: "篮球" }, { key: "swimming", value: "游泳" }];
                var data = [
                    { id: 1, name: "yiy11", interests: ["football", "swimming"], province: "cq" },
                    { id: 2, name: "yiy12", interests: ["basketball", "swmming"], province: "sc" },
                    { id: 3, name: "yiy23", interests: ["basketball", "football"], province: "bj" }
                ];
                YA_core_1.default.enumerator(data[0], "item", this);
                YA_core_1.default.enumerator("", "interest", this);
                YA_core_1.default.enumerator(provinces[0], "province", this);
                YA_core_1.default.observable(data, "items", this);
                YA_core_1.default.observable(provinces, "provinces", this);
                this.showData = function () {
                    var json = JSON.stringify(this.items.get(YA_core_1.default.ObservableModes.Value));
                    console.log(json);
                    alert(json);
                };
                this.render = function () {
                    return YA_core_1.default.createElement("div", null,
                        YA_core_1.default.createElement("input", { type: "button", value: "\u70B9\u51FB\u67E5\u770B\u6570\u636E", onclick: this.showData }),
                        YA_core_1.default.createElement("table", { border: "1" },
                            YA_core_1.default.createElement("tbody", { for: [this.items, this.item] },
                                YA_core_1.default.createElement("tr", null,
                                    YA_core_1.default.createElement("td", null, this.item.id),
                                    YA_core_1.default.createElement("td", null, this.item.name),
                                    YA_core_1.default.createElement("td", null,
                                        this.item.interests.length,
                                        YA_core_1.default.createElement("ul", { for: [this.item.interests, this.interest] },
                                            YA_core_1.default.createElement("li", null, this.interest))),
                                    YA_core_1.default.createElement("td", null,
                                        this.item.province,
                                        YA_core_1.default.createElement("select", { for: [this.provinces, this.province], "b-value": this.item.province },
                                            YA_core_1.default.createElement("option", { value: this.province.key }, this.province.value)))))));
                };
            }
            ;
            YA_core_1.default.createComponent(ComplexComp, null, demoElement);
        };
        __decorate([
            doct_1.doct({
                title: "基本用法",
                descriptions: [
                    "for"
                ]
            })
        ], createElementForTest.prototype, "base", null);
        __decorate([
            doct_1.doct({
                title: "搜索",
                descriptions: [
                    "search"
                ]
            })
        ], createElementForTest.prototype, "filter", null);
        __decorate([
            doct_1.doct({
                title: "子项内容变更",
                descriptions: [
                    "search"
                ]
            })
        ], createElementForTest.prototype, "item", null);
        __decorate([
            doct_1.doct({
                title: "复杂的循环",
                descriptions: [
                    "复杂的循环，嵌套，变更子项等"
                ]
            })
        ], createElementForTest.prototype, "complex", null);
        createElementForTest = __decorate([
            doct_1.doct({
                title: "YA.createElement.for",
                descriptions: [
                    "某些对象在运行中引用了外部的资源，当这些对象被系统/框架释放时，需要同时释放他们引用的资源。",
                    "该类为这些可释放对象的基类。提供2个函数,dispose跟deteching。",
                    "dispose(callback:Function)表示注册一个回调函数监听资源释放，一旦发生释放，这些回调函数就会被挨个调用;dispose(obj)表示释放资源，该函数完成后，$isDisposed就会变成true",
                    "该类在框架中被应用于Component。框架会定期检查component是否还在alive状态，如果不在，就会自动释放Component"
                ]
                //,debugging:"base"
            })
        ], createElementForTest);
        return createElementForTest;
    }());
    exports.createElementForTest = createElementForTest;
});
//# sourceMappingURL=YA.createElement.for.doct.js.map