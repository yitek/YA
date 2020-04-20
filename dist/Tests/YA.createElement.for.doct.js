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
    var createElementAttrsTest = /** @class */ (function () {
        function createElementAttrsTest() {
        }
        createElementAttrsTest.prototype.base = function (assert_statement, demoElement) {
            function comp1() {
                var data = [{ id: 1, name: "yiy1" }, { id: 2, name: "yiy2" }, { id: 3, name: "yiy3" }];
                YA_core_1.default.observable(data, "items", this);
                YA_core_1.default.enumerator({ id: 0, name: "yiy" }, "item", this);
                this.render = function (container, descriptor) {
                    return YA_core_1.default.createElement("ul", { for: [this.items, this.item] },
                        YA_core_1.default.createElement("li", null, this.item.name));
                };
            }
            ;
            var t = new Date();
            YA_core_1.default.createComponentElements(comp1, null, demoElement);
            assert_statement(function (assert) {
                var t1 = new Date();
                var ellapse = t1.valueOf() - t1.valueOf();
                console.log(ellapse);
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        createElementAttrsTest.prototype.filter = function (assert_statement, demoElement) {
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
            YA_core_1.default.createComponentElements(comp1, null, demoElement);
            assert_statement(function (assert) {
                var t1 = new Date();
                var ellapse = t1.valueOf() - t1.valueOf();
                console.log(ellapse);
                //assert(ex!==undefined,"如果第二次调用dispose，会触发一个异常: ex!==undefined");
            });
        };
        __decorate([
            doct_1.doct({
                title: "基本用法",
                descriptions: [
                    "for"
                ]
            })
        ], createElementAttrsTest.prototype, "base", null);
        __decorate([
            doct_1.doct({
                title: "搜索",
                descriptions: [
                    "search"
                ]
            })
        ], createElementAttrsTest.prototype, "filter", null);
        createElementAttrsTest = __decorate([
            doct_1.doct({
                title: "YA.createElement.for",
                descriptions: [
                    "某些对象在运行中引用了外部的资源，当这些对象被系统/框架释放时，需要同时释放他们引用的资源。",
                    "该类为这些可释放对象的基类。提供2个函数,dispose跟deteching。",
                    "dispose(callback:Function)表示注册一个回调函数监听资源释放，一旦发生释放，这些回调函数就会被挨个调用;dispose(obj)表示释放资源，该函数完成后，$isDisposed就会变成true",
                    "该类在框架中被应用于Component。框架会定期检查component是否还在alive状态，如果不在，就会自动释放Component"
                ]
            })
        ], createElementAttrsTest);
        return createElementAttrsTest;
    }());
    exports.createElementAttrsTest = createElementAttrsTest;
});
//# sourceMappingURL=YA.createElement.for.doct.js.map