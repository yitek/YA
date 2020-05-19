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
    var createElementLoopTest = /** @class */ (function () {
        function createElementLoopTest() {
        }
        createElementLoopTest.prototype.base = function (assert_statement, demoElement) {
            function BasComp() {
                var data = [{ id: 1, name: "yiy1" }, { id: 2, name: "yiy2" }, { id: 3, name: "yiy3" }];
                YA.observable(data, "items", this);
                var item = YA.loopar(this.items);
                this.render = function (container, descriptor) {
                    return YA.createElement("ul", { loop: [this.items, item] },
                        YA.createElement("li", null, item.name));
                };
            }
            ;
            var t = new Date();
            YA.createComponent(BasComp, null, demoElement);
            assert_statement(function (assert) {
                var t1 = new Date();
                var ellapse = t1.valueOf() - t1.valueOf();
                console.log(ellapse);
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        createElementLoopTest.prototype.filter = function (assert_statement, demoElement) {
            function comp1() {
                var data = [{ id: 1, name: "yiy11" }, { id: 2, name: "yiy12" }, { id: 3, name: "yiy23" }];
                YA.observable(data, "items", this);
                YA.variable({ id: 0, name: "yiy" }, "item", this);
                var self = this;
                this.keywordChange = function (e) {
                    var keyword = YA.trim(e.target.value);
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
                    return YA.createElement("div", null,
                        YA.createElement("input", { type: "text", placeholder: "\u8BF7\u8F93\u5165\u5173\u952E\u5B57\uFF0C\u6BD4\u59821,2,3\u5176\u4E2D\u4E00\u4E2A\uFF0C\u7136\u540E\u56DE\u8F66", onblur: this.keywordChange }),
                        YA.createElement("ul", { loop: [this.items, this.item] },
                            YA.createElement("li", null, this.item.name)));
                };
            }
            ;
            var t = new Date();
            YA.createComponent(comp1, null, demoElement);
            assert_statement(function (assert) {
                var t1 = new Date();
                console.log(t1.valueOf() - t1.valueOf());
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        createElementLoopTest.prototype.item = function (assert_statement, demoElement) {
            function ItemComp() {
                var data = [{ id: 1, name: "yiy11" }, { id: 2, name: "yiy12" }, { id: 3, name: "yiy23" }];
                YA.observable(data, "items", this);
                YA.loopar(this.items, "item", this);
                this.nameChange = function (evt, item) {
                    var name = YA.trim(evt.target.value);
                    item.name = name;
                };
                this.showData = function () {
                    var json = JSON.stringify(this.items.get(YA.ObservableModes.Value));
                    console.log(json);
                    alert(json);
                };
                this.render = function (container, descriptor) {
                    return YA.createElement("div", null,
                        YA.createElement("table", { border: "1" },
                            YA.createElement("tbody", { loop: [this.items, this.item] },
                                YA.createElement("tr", null,
                                    YA.createElement("td", null, this.item.id),
                                    YA.createElement("td", null,
                                        YA.createElement("input", { type: "text", value: this.item.name, onblur: [this.nameChange, YA.EVENT, this.item] })),
                                    YA.createElement("td", null, this.item.name)))),
                        YA.createElement("button", { onclick: this.showData }, "\u70B9\u51FB\u6211\u67E5\u770B\u53D8\u66F4\u540E\u7684\u6570\u636E"));
                };
            }
            ;
            var t = new Date();
            YA.createComponent(ItemComp, null, demoElement);
            assert_statement(function (assert) {
                var t1 = new Date();
                console.log(t1.valueOf() - t1.valueOf());
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        createElementLoopTest.prototype.complex = function (assert_statement, demoElement) {
            function ComplexComp() {
                var provinces = [{ key: "", value: "--" }, { key: "cq", value: "重庆" }, { key: "sc", value: "四川" }, { key: "bj", value: "北京" }];
                var interests = [{ key: "football", value: "足球" }, { key: "basketball", value: "篮球" }, { key: "swimming", value: "游泳" }];
                var data = [
                    { id: 1, name: "yiy11", interests: ["football", "swimming"], province: "cq" },
                    { id: 2, name: "yiy12", interests: ["basketball", "swmming"], province: "sc" },
                    { id: 3, name: "yiy23", interests: ["basketball", "football"], province: "bj" }
                ];
                YA.variable(data[0], "item", this);
                YA.variable("", "interest", this);
                YA.variable(provinces[0], "province", this);
                YA.observable(data, "items", this);
                YA.observable(provinces, "provinces", this);
                this.showData = function () {
                    var json = JSON.stringify(this.items.get(YA.ObservableModes.Value));
                    console.log(json);
                    alert(json);
                };
                this.render = function () {
                    return YA.createElement("div", null,
                        YA.createElement("input", { type: "button", value: "\u70B9\u51FB\u67E5\u770B\u6570\u636E", onclick: this.showData }),
                        YA.createElement("table", { border: "1" },
                            YA.createElement("tbody", { loop: [this.items, this.item] },
                                YA.createElement("tr", null,
                                    YA.createElement("td", { class: "id" }, this.item.id),
                                    YA.createElement("td", { class: "name" }, this.item.name),
                                    YA.createElement("td", { class: "interests" },
                                        "intereests.length=",
                                        this.item.interests.length,
                                        YA.createElement("ul", { loop: [this.item.interests, this.interest] },
                                            YA.createElement("li", null, this.interest))),
                                    YA.createElement("td", { class: "province" },
                                        this.item.province,
                                        YA.createElement("select", { loop: [this.provinces, this.province], "b-value": this.item.province },
                                            YA.createElement("option", { value: this.province.key }, this.province.value)))))));
                };
            }
            ;
            YA.createComponent(ComplexComp, null, demoElement);
        };
        __decorate([
            doct_1.doct({
                title: "基本用法",
                descriptions: [
                    "loop"
                ]
            })
        ], createElementLoopTest.prototype, "base", null);
        __decorate([
            doct_1.doct({
                title: "搜索",
                descriptions: [
                    "search"
                ]
            })
        ], createElementLoopTest.prototype, "filter", null);
        __decorate([
            doct_1.doct({
                title: "子项内容变更",
                descriptions: [
                    "search"
                ]
            })
        ], createElementLoopTest.prototype, "item", null);
        __decorate([
            doct_1.doct({
                title: "复杂的循环",
                descriptions: [
                    "复杂的循环，嵌套，变更子项等"
                ]
            })
        ], createElementLoopTest.prototype, "complex", null);
        createElementLoopTest = __decorate([
            doct_1.doct({
                title: "YA.createElement.loop",
                descriptions: [
                    "loop标签循环测试"
                ]
                //,debugging:"complex"
            })
        ], createElementLoopTest);
        return createElementLoopTest;
    }());
    exports.createElementLoopTest = createElementLoopTest;
});
//# sourceMappingURL=YA.createElement.loop.doct.js.map