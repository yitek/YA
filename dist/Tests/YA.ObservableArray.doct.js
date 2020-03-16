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
    var ObservableArrayTest = /** @class */ (function () {
        function ObservableArrayTest() {
        }
        ObservableArrayTest.prototype.base = function (assert_statement) {
            var data = ["yi", "yan", "YA"];
            // 1 创建一个Observable代理/模型
            var proxy = new YA.ObservableArray(data);
            var membernames = [];
            for (var n in proxy)
                membernames.push(n);
            assert_statement(function (assert) {
                assert(YA.DataTypes.Array, proxy.$type, "\u4EE3\u7406\u7684\u7C7B\u578B\u4E3A\u503C\u7C7B\u578B:proxy.$type === YA.DataTypes." + YA.DataTypes[proxy.$type]);
                var str = proxy[0] + "," + proxy[1] + "," + proxy[2];
                assert(3, proxy.length, "\u4EE3\u7406\u7684\u7C7B\u578B\u4E3A\u503C\u7C7B\u578B:proxy.length === 3");
                assert("yi,yan,YA", str, "通过下标访问数组项的值:proxy[0]==='yi',proxy[1]==='yan',proxy[2]==='YA'");
                assert("0,1,2", membernames.join(","), "可以且只可以枚举下标:membernames=[0,1,2]");
            });
            var evtForIndex2;
            YA.proxyMode(function () {
                proxy[2].subscribe(function (e) { return evtForIndex2 = e; });
            });
            proxy[2] = "YA framework";
            assert_statement(function (assert) {
                var str = proxy[0] + "," + proxy[1] + "," + proxy[2];
                assert("yi,yan,YA framework", str, "数组代理的项值变更为:proxy[0]==='yi',proxy[1]==='yan',proxy[2]==='YA framework'");
                assert("YA", data[2], "原始数组的项值保持不变:data[2]==='YA'");
                assert(undefined, evtForIndex2, "监听器未触发");
            });
            //更新数组代理
            proxy.update();
            assert_statement(function (assert) {
                assert("yi,yan,YA framework", data.toString(), "原始数据的项值被更新:data==['yi','yan','YA framework']");
                assert(true, evtForIndex2 !== undefined, "监听器被触发");
                assert(2, evtForIndex2.index, "事件参数可获得被更新的下标:evtForIndex2.index===2");
                assert("YA framework", evtForIndex2.value, "新的项值:evtForIndex2.index===2");
            });
        };
        ObservableArrayTest.prototype.objectArray = function (assert_statement) {
            var data = [
                { title: "YA-v1.0", author: { name: "yiy1" } },
                { title: "YA-v2.0", author: { name: "yiy2" } },
                { title: "YA-v3.0", author: { name: "yiy3" } },
                { title: "YA-v4.0", author: { name: "yiy1" } }
            ];
            // 1 创建一个ObservableArray代理/模型
            var obArray = new YA.ObservableArray(data);
            assert_statement(function (assert) {
                assert(4, obArray.length, "有4个项:proxy.length===4");
                var item0 = obArray[0];
                var item0Value = item0.title + item0.author.name;
                assert("YA-v1.0yiy1", item0Value, "obArray[0]=={title:'YA-v1.0',author:{name:'yiy1'}}");
                var item3 = obArray[3];
                var item3Value = item3.title + item3.author.name;
                assert("YA-v4.0yiy1", item3Value, "obArray[3]=={title:'YA-v4.0',author:{name:'yiy1'}}");
            });
            //在数组本身与数组项上注册事件
            var item3EvtArgs;
            var arrEvtArgs;
            YA.observableMode(YA.ObservableModes.Observable, function () {
                obArray[3].subscribe(function (e) { return item3EvtArgs = e; });
                obArray.subscribe(function (e) { arrEvtArgs = e; });
            });
            //给数组的某个项赋值
            obArray[3] = { author: { name: "yiy4" }, title: "new YA" };
            assert_statement(function (assert) {
                assert("yiy4", obArray[3].author.name, "\u4EE3\u7406\u4E0A\u7684\u503C\u53D8\u66F4\u4E3A\u65B0\u503C:obArray[3].author.name=\"yiy4\"");
                assert("yiy1", data[3].author.name, "\u539F\u59CB\u6570\u636E\u7684\u503C\u8FD8\u672A\u53D8\u5316:data[3].author.name=\"yiy1\"");
                assert(true, item3EvtArgs === undefined && arrEvtArgs === undefined, "\u6240\u6709\u7684\u4E8B\u4EF6\u90FD\u672A\u89E6\u53D1");
            });
            //更新数组数据
            obArray.update();
            assert_statement(function (assert) {
                assert("yiy4new YA", data[3].author.name + data[3].title, "\u539F\u59CB\u6570\u636E\u5F97\u5230\u66F4\u65B0:data[3]=={title:\"new YA\",author:{name:\"yiy4\"}}");
                assert(true, arrEvtArgs !== undefined, "注册在obArray上的事件被触发：arrEvtArgs!==undefined");
                assert(YA.ChangeTypes.Item, arrEvtArgs.type, "事件类型为Value:arrEvtArgs.type===YA.ChangeTypes.Item");
                assert(true, item3EvtArgs !== undefined, "注册在obArray[3]上的事件被触发");
                assert(YA.ChangeTypes.Value, item3EvtArgs.type, "事件类型为Value:item3EvtArgs.type===YA.ChangeTypes.Value");
            });
            var newData = [
                { title: "YA-v5.0", author: { name: "yiy2" } },
                { title: "YA-v6.0", author: { name: "yiy3" } },
                { title: "YA-v7.0", author: { name: "yiy1" } }
            ];
            item3EvtArgs = arrEvtArgs = undefined;
            //整个的重设数组的值,并更新数组
            obArray.set(newData).update();
            assert_statement(function (assert) {
                assert(true, item3EvtArgs !== undefined, "注册在obArray[3]上的事件被触发");
                assert(YA.ChangeTypes.Remove, item3EvtArgs.type, "事件类型为Value:item3EvtArgs.type===YA.ChangeTypes.Remove");
            });
        };
        __decorate([
            doct_1.doct({
                title: '基本用法'
            })
        ], ObservableArrayTest.prototype, "base", null);
        __decorate([
            doct_1.doct({
                title: '数组项为对象的ObservableArray'
            })
        ], ObservableArrayTest.prototype, "objectArray", null);
        ObservableArrayTest = __decorate([
            doct_1.doct({ title: "YA.ObservableArray" })
        ], ObservableArrayTest);
        return ObservableArrayTest;
    }());
    exports.ObservableArrayTest = ObservableArrayTest;
});
//# sourceMappingURL=YA.ObservableArray.doct.js.map