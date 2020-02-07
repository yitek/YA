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
    var ObservableTest = /** @class */ (function () {
        function ObservableTest(cdoc) {
            cdoc.description = "\u53EF\u89C2\u5BDF\u7684\u6570\u636E\u6A21\u578B\uFF0C\u53EF\u4EE5\u901A\u8FC7$get/$set\u6765\u64CD\u4F5C\u5B83\u7684\u503C";
            cdoc.description = "\u5B83\u901A\u5E38\u7528\u4F5Cmvc\u4E2D\u7684\u6A21\u578Bmodel,\u672C\u8D28\u4E0A\u662F\u4E00\u4E2A\u6570\u636E\u4EE3\u7406\u3002\n\u5728\u672C\u6587\u6863\u4E2D\uFF0C\u6709\u65F6\u5019\u4E5F\u7528\u6A21\u578B/\u4EE3\u7406\u7B49\u8BCD\u4EE3\u6307\u8BE5\u7C7B\u578B\u7684\u5B9E\u4F8B";
            cdoc.usage("基本用法", function (assert_statement) {
                //0 定义被代理的数据 
                var raw_data = 12;
                //1 创建一个数据代理,它的第一个参数为读/写原始值的函数
                var proxy = new YA.Observable(function (val) { return val === undefined ? raw_data : raw_data = val; });
                assert_statement(function (assert) {
                    assert(YA.DataTypes.Value, proxy.$type, "\u4EE3\u7406\u7684\u7C7B\u578B\u4E3A\u503C\u7C7B\u578B:proxy.$type === YA.DataTypes." + YA.DataTypes[proxy.$type]);
                    assert(12, proxy.$target, "\u4EE3\u7406\u7684\u76EE\u6807\u4E3A\u5F53\u524D\u7684\u503C:proxy.$target===12");
                });
                //2 可以通过$get()获取到它的值
                var value_beforeSet = proxy.$get();
                assert_statement(function (assert) {
                    assert(12, value_beforeSet, "value_beforeSet===raw_value===12");
                });
                //2 在代理上注册一个监听器,将接收到的事件参数存入changeInfo
                var changeInfo;
                proxy.$subscribe(function (e) { return changeInfo = e; });
                //3 通过$set改变代理的值
                proxy.$set(33);
                var value_afterSet = proxy.$get();
                assert_statement(function (assert) {
                    assert(33, value_afterSet, "set操作后，代理的数据为修改后的值:value_afterSet===33");
                    assert(12, raw_data, "update操作之前，被代理的数据不会变化:raw_value===12");
                    assert(12, proxy.$target, "proxy.$target===12");
                    assert(33, proxy.$_modifiedValue, "代理内部缓存了最新写入的数据");
                    assert(undefined, changeInfo, "监听器也不会触发");
                });
                //4 用最新写入的数据，更新被代理的数据
                proxy.$update();
                assert_statement(function (assert) {
                    assert(33, raw_data, "更新update操作后，被代理的数据变更为修改后的值:raw_data===33");
                    assert(33, proxy.$target, "代理引用的被代理数据变更为新值:proxy.$target===33");
                    assert(true, changeInfo !== undefined, "注册的事件被触发");
                    assert(33, changeInfo.value, "事件参数中带有修改的值:changeInfo.value===33");
                    assert(12, changeInfo.old, "以及修改前的值:changeInfo.old===12");
                    assert(proxy, changeInfo.sender, "事件参数的sender字段指明了事件的发送者:changeInfo.sender===proxy");
                });
            });
            cdoc.usage("成员不可枚举", "所有成员enumerable==false", function (assert_statement) {
                //1 创建一个可观察对象 
                var raw_data = 12;
                var ob = new YA.Observable(function (val) { return val === undefined ? raw_data : raw_data = val; }, {});
                //2 做一些操作
                ob.$subscribe(function () { });
                ob.$set(12);
                //3 给可观察对象赋予一个属性
                ob.name = "test";
                var propnames = [];
                //4 枚举可观察对象，记录获取到的属性名
                for (var n in ob)
                    propnames.push(n);
                assert_statement(function (assert) {
                    assert("name", propnames.join(","), "所有的属性/方法可以使用，但不可枚举:propnames=['name']");
                });
            });
        }
        ObservableTest.prototype.ctor = function (mdoc) {
            mdoc.description = "构造函数的几种用法";
            mdoc.usage("ctor(初始化值,额外信息?)", function (assert_statement) {
                var data = {};
                var ob = new YA.Observable(data, function (val) { return val === undefined ? data : data = val; }, 33);
                assert_statement(function (assert) {
                    assert(data, ob.$target, "指定初值，可观察数据代理的值为初值:ob.$target===data");
                    assert(33, ob.$extras, "额外信息为33:ob.$extras===33");
                });
            });
            mdoc.usage("ctor(原始值访问函数,额外信息?)", function (assert_statement) {
                var data = {};
                var ob = new YA.Observable(function (val) { return val === undefined ? data : data = val; }, 33);
                assert_statement(function (assert) {
                    assert(data, ob.$target, "可观察数据代理的初值从原始值访问函数中获取:ob.$target===data");
                    assert(33, ob.$extras, "额外信息为33:ob.$extras===33");
                });
            });
            mdoc.usage("ctor(初始化值,原始值访问函数,额外信息?)", function (assert_statement) {
                var data = 12;
                var ob = new YA.Observable(22, function (val) { return val === undefined ? data : data = val; }, 33);
                assert_statement(function (assert) {
                    assert(22, ob.$target, "指定初值，可观察数据代理的值为初值:ob1.$target===22");
                    assert(22, data, "代理同时会把初值回写回原始数据中:data2===22");
                });
            });
            mdoc.usage("ctor(上级代理,属性名,额外信息?,初值?)", function (assert_statement) {
                var data = { name: "yiy", title: "YA" };
                var owner = new YA.ObservableObject(data);
                var nameProp = new YA.Observable(owner, "name", 44);
                var titleProp = new YA.Observable(owner, "title", null, "YA framework");
                assert_statement(function (assert) {
                    assert("yiy", nameProp.$target, "nameProp初值从原始对象中来:nameProp.$target==='yiy'");
                    assert(44, nameProp.$extras, "额外信息为44:nameProp.$extras===44");
                    assert(owner, nameProp.$_owner);
                    assert("YA framework", titleProp.$target, "titleProp初值为指定的初值:nameProp.$target==='YA framework'");
                    assert("YA framework", owner.$target.title, "该初值会立即回写回原始数据:data.title==='YA framework'");
                    assert(null, titleProp.$extras, "额外信息为null:titleProp.$extras===null");
                    assert(owner, titleProp.$_owner);
                });
            });
        };
        __decorate([
            YA_doct_1.doct()
        ], ObservableTest.prototype, "ctor", null);
        ObservableTest = __decorate([
            YA_doct_1.doct("YA.ObservableProxy")
        ], ObservableTest);
        return ObservableTest;
    }());
    exports.ObservableTest = ObservableTest;
});
//# sourceMappingURL=YA.Observable.doct.js.map