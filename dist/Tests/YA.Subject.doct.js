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
    var SubjectTest = /** @class */ (function () {
        function SubjectTest(doc) {
            doc.description = "\u4E3B\u9898\u5BF9\u8C61\u7C7B\n\u5B9E\u73B0\u8BA2\u9605/\u53D1\u5E03\u6A21\u5F0F\n\u5B83\u652F\u6301\u8BA2\u9605/\u53D1\u5E03\u67D0\u4E2A\u4E3B\u9898;\u5982\u679C\u672A\u6307\u5B9A\u4E3B\u9898\uFF0C\u9ED8\u8BA4\u4E3B\u9898\u4E3A\"\"\n\u5B83\u7684\u6240\u6709\u5173\u4E8E\u8BA2\u9605\u53D1\u5E03\u7684\u6210\u5458\u5B57\u6BB5/\u51FD\u6570\u90FD\u662Fenumerable=false\u7684\n\u4E00\u822C\u7528\u4F5C\u5176\u4ED6\u7C7B\u578B\u7684\u57FA\u7C7B\n";
            doc.notice = "\u8BE5\u5BF9\u8C61\u5E76\u4E0D\u4F1A\u505A\u5783\u573E\u56DE\u6536\uFF0C\u5982\u679C\u76D1\u542C\u5668\u53CA\u5176\u4E0A\u4E0B\u6587\u5DF2\u7ECF\u5931\u6548\uFF0C\u7531\u4E8E\u5B83\u4F9D\u7136\u88AB\u8BE5\u5BF9\u8C61\u5F15\u7528\uFF0CJS\u7684\u5783\u573E\u56DE\u6536\u5668\u4E0D\u4F1A\u56DE\u6536\u8BE5\u76D1\u542C\u5668\u53CA\u4E0A\u4E0B\u6587\u3002\u8FD9\u5728\u67D0\u4E9B\u60C5\u51B5\u4E0B\u4F1A\u9020\u6210\u60AC\u5782\u5F15\u7528\u95EE\u9898\u3002";
            doc.usage("基本用法", "\u901A\u8FC7$subscribe\u8BA2\u9605\uFF0C$notify\u53D1\u5E03", function (assert_statement) {
                //1 创建一个主题对象 
                var ob = new YA.Subject();
                //2 定义监听函数
                var listener = function (evt) { argPassToListener = evt; };
                //记录传递给监听函数的参数
                var argPassToListener;
                //3 注册监听器
                ob.subscribe(listener);
                //4 定义事件参数
                var evtArgs = {};
                //5 发送/通知事件
                ob.notify(evtArgs);
                assert_statement(function (assert) {
                    assert(true, argPassToListener !== undefined, "监听函数会被调用:evtArgs!==undefined");
                    assert(evtArgs, argPassToListener, "监听函数中接收到的参数，就是$notify发送的参数:evtArgs===argPassToListener");
                });
            });
            doc.usage("成员不可枚举", "所有成员enumerable==false", function (assert_statement) {
                //1 创建一个主题对象 
                var ob = new YA.Subject();
                //2 订阅监听器
                ob.subscribe(function () { });
                //3 给主题对象赋予一个属性
                ob.name = "test";
                var propnames = [];
                //4 枚举主题对象，记录获取到的属性名
                for (var n in ob)
                    propnames.push(n);
                assert_statement(function (assert) {
                    assert("name", propnames.join(","), "所有的属性/方法可以使用，但不可枚举:propnames=['name']");
                });
            });
        }
        SubjectTest.prototype.$subscribe = function (mdoc) {
            mdoc.description = "\u8BA2\u9605/\u6CE8\u518C\u4E8B\u4EF6\u76D1\u542C\u51FD\u6570\n\u5F53\u53EA\u4F20\u9012\u4E00\u4E2A\u53C2\u6570\u65F6\uFF0C\u4E3A\u8BA2\u9605\u9ED8\u8BA4\u4E8B\u4EF6\uFF0C\u53C2\u6570\u4E3A\u76D1\u542C\u5668\u51FD\u6570\n\u4F20\u9012\u4E24\u4E2A\u53C2\u6570\u65F6,\u4E3A\u8BA2\u9605\u4E3B\u9898\u4E8B\u4EF6\uFF0C\u7B2C\u4E00\u4E2A\u53C2\u6570\u4E3A\u4E3B\u9898\u540D\uFF0C\u7B2C\u4E8C\u4E2A\u53C2\u6570\u4E3A\u76D1\u542C\u5668\u51FD\u6570\n";
            mdoc.notice = "\u8BA2\u9605\u5E76\u4E0D\u4F1A\u7ED9\u76D1\u542C\u5668\u6392\u91CD\uFF0C\u7528\u76F8\u540C\u7684\u76D1\u542C\u5668\u51FD\u6570\u91CD\u590D\u8BA2\u9605\u76F8\u540C\u4E3B\u9898\uFF0C\u4F1A\u9020\u6210\u76D1\u542C\u5668\u91CD\u590D\u8C03\u7528";
            mdoc.usage("订阅默认事件", function (assert_statement) {
                // 1 创建主题对象
                var ob = new YA.Subject();
                var evtInListener1, evtInListener2;
                // 2 定义2个监听者函数,并订阅默认事件
                var listener1 = function (evt) { evtInListener1 = evt; };
                var listener2 = function (evt) { evtInListener2 = evt; };
                ob.subscribe(listener1);
                ob.subscribe(listener2);
                //3 定义事件参数，并发布事件
                var evtArgs = {};
                ob.notify(evtArgs);
                assert_statement(function (assert) {
                    assert(evtArgs, evtInListener1);
                    assert(evtArgs, evtInListener2, "2个监听器都应该被调用且收到相同的事件参数:evtInListener1===evtInListener2===evtArgs");
                });
                evtInListener1 = evtInListener2 = undefined;
                var evtArgs2 = {};
                ob.notify(evtArgs2);
                assert_statement(function (assert) {
                    assert(evtArgs2, evtInListener1);
                    assert(evtArgs2, evtInListener2, "可以多次发送事件，每次发送所有订阅过的监听器都会被调用:evtInListener1===evtInListener2===evtArgs2");
                });
            });
            mdoc.usage("订阅主题事件", function (assert_statement) {
                // 1 创建主题对象
                var ob = new YA.Subject();
                var evtInListener1, evtInListener2;
                // 2 定义2个监听者函数,分别订阅topic1跟topic2
                var listener1 = function (evt) { evtInListener1 = evt; };
                var listener2 = function (evt) { evtInListener2 = evt; };
                ob.subscribe("topic1", listener1);
                ob.subscribe("topic2", listener2);
                // 3 发送topic1主题事件
                ob.notify("topic1", "topic1_eventArgs");
                assert_statement(function (assert) {
                    assert("topic1_eventArgs", evtInListener1, "topic1的监听器接收到事件:evtInListener1==='topic1_eventArgs'");
                    assert(undefined, evtInListener2, "topic2的监听器不能接收到事件:evtInListener2===undefined");
                });
                // 清洗数据，准备下一调用
                evtInListener1 = evtInListener2 = undefined;
                // 4 发送topic2 主题事件
                ob.notify("topic2", "topic2_eventArgs");
                assert_statement(function (assert) {
                    assert(undefined, evtInListener1, "topic1的监听器不能接收到事件:evtInListener1===undefined");
                    assert("topic2_eventArgs", evtInListener2, "topic2的监听器接收到事件:evtInListener2==='topic2_eventArgs'");
                });
            });
            mdoc.usage("重复订阅", function (assert_statement) {
                // 1 创建主题对象
                var ob = new YA.Subject();
                var records = [];
                // 2 定义监听者，其功能为向records写入一个字符串。
                var listener = function (evt) { records.push("listener invoked."); };
                //3 用相同的监听器，向同一个主题订阅订阅2次
                ob.subscribe("topic1", listener);
                ob.subscribe("topic1", listener);
                // 4 发布topic1事件
                ob.notify("topic1", null);
                assert_statement(function (assert) {
                    assert("listener invoked.,listener invoked.", records.join(","), "listener被调用了2次:records==['listener invoked.','listener invoked.']");
                });
            });
        };
        SubjectTest.prototype.$notify = function (mdoc) {
            mdoc.description = "\u53D1\u5E03\u4E8B\u4EF6\n\u5F53\u53EA\u4F20\u9012\u4E00\u4E2A\u53C2\u6570\u65F6\uFF0C\u4E3A\u53D1\u5E03\u9ED8\u8BA4\u4E8B\u4EF6\uFF0C\u53C2\u6570\u4E3A\u4E8B\u4EF6\u53C2\u6570\n\u4F20\u90122\u4E2A\u53C2\u6570\u65F6\uFF0C\u4E3A\u53D1\u5E03\u4E3B\u9898\u4E8B\u4EF6\uFF0C\u7B2C\u4E00\u4E2A\u53C2\u6570\u4E3A\u4E3B\u9898\u540D\uFF0C\u7B2C\u4E8C\u4E2A\u53C2\u6570\u4E3A\u4E8B\u4EF6\u53C2\u6570\n\u5176\u57FA\u672C\u7528\u6CD5\u53EF\u53C2\u89C1subscibe\u7684\u793A\u4F8B.\n\u5F53\u4E8B\u4EF6/\u4E3B\u9898\u53D1\u5E03\u65F6\uFF0C\u76D1\u542C\u5668\u7684\u8C03\u7528\u987A\u5E8F\u4E3A\u8BA2\u9605\u7684\u987A\u5E8F\n";
            mdoc.usage("事件发布时，监听器按订阅时的顺序依次被调用", function (assert_statement) {
                // 1 创建主题对象
                var ob = new YA.Subject();
                // 2 创建3个监听器，每个监听器向指定数组add自己的名称
                var order = [];
                var listener1 = function (evt) { return order.push("listener1"); };
                var listener2 = function (evt) { return order.push("listener2"); };
                var listener3 = function (evt) { return order.push("listener3"); };
                // 3 订阅默认事件
                ob.subscribe(listener1);
                ob.subscribe(listener2);
                ob.subscribe(listener3);
                //发布默认事件
                var evtArgs = {};
                ob.notify(evtArgs);
                assert_statement(function (assert) {
                    assert(3, order.length, "每个监听函数都会被调用:order.length===3");
                    assert("listener1", order[0], '第一个注册的listener1首先被调用:order[0]==="listener1"');
                    assert("listener2", order[1], "第二个注册的listener2接着被调用:order[1]==='listener2'");
                    assert("listener3", order[2], "重复注册的listener1最后被调用:order[2]==='listener3'");
                });
            });
            mdoc.usage("没有订阅的发布", "即使主题没有被订阅，也可以发布该主题", function (assert_statement) {
                // 1 创建主题对象
                var ob = new YA.Subject();
                // 2 不订阅默认事件，直接发布默认事件
                var evtArgs = {};
                ob.notify(evtArgs);
                // 3 不订阅topic，但发布了topic
                ob.notify("topic", null);
                // 这些操作是允许的，只是没有任何效果的空操作
            });
        };
        SubjectTest.prototype.$unsubscribe = function (mdoc) {
            mdoc.description = "\n\u53D6\u6D88\u67D0\u4E2A\u76D1\u542C\u5668\u51FD\u6570\u7684\u8BA2\u9605\n\u5F53\u53EA\u4F20\u9012\u4E00\u4E2A\u53C2\u6570\u65F6\uFF0C\u4E3A\u8BA2\u9605\u9ED8\u8BA4\u4E8B\u4EF6\uFF0C\u53C2\u6570\u4E3A\u76D1\u542C\u5668\u51FD\u6570\n\u4F20\u9012\u4E24\u4E2A\u53C2\u6570\u65F6,\u4E3A\u8BA2\u9605\u4E3B\u9898\u4E8B\u4EF6\uFF0C\u7B2C\u4E00\u4E2A\u53C2\u6570\u4E3A\u4E3B\u9898\u540D\uFF0C\u7B2C\u4E8C\u4E2A\u53C2\u6570\u4E3A\u76D1\u542C\u5668\u51FD\u6570\n*\u6CE8\u610F*:\u53D6\u6D88\u8BA2\u9605\u4F1A\u628A\u76F8\u540C\u7684\u76D1\u542C\u5668\u90FD\u53D6\u6D88\u6389\n        ";
            mdoc.usage("取消默认事件的订阅", function (assert_statement) {
                // 1 创建主题对象
                var ob = new YA.Subject();
                // 1 定义2个监听器
                var listener1 = function (evt) { return evt.listener1Invoked = true; };
                var listener2 = function (evt) { return evt.listener2Invoked = true; };
                // 2 用这2个监听器订阅默认事件
                ob.subscribe(listener1);
                ob.subscribe(listener2);
                // 3 取消listener1的订阅
                ob.unsubscribe(listener1);
                // 3 发布默认事件
                var evtArgs = { listener1Invoked: false, listener2Invoked: false };
                ob.notify(evtArgs);
                assert_statement(function (assert) {
                    assert(false, evtArgs.listener1Invoked, "被取消订阅的listener1不会被调用:evtArgs.listener1Invoked===false.");
                    assert(true, evtArgs.listener2Invoked, "未被取消订阅listener2被调用:evtArgs.listener2Invoked===true.");
                });
            });
            mdoc.usage("取消主题事件的订阅", function (assert_statement) {
                // 1 创建主题对象
                var ob = new YA.Subject();
                // 1 定义2个监听器
                var listener1 = function (evt) { return evt.listener1Count++; };
                var listener2 = function (evt) { return evt.listener2Count++; };
                // 2 用这2个监听器订阅topic事件
                ob.subscribe("topic", listener1);
                ob.subscribe("topic", listener2);
                // 3 发布topic事件
                var evtArgs = { listener1Count: 0, listener2Count: 0 };
                ob.notify("topic", evtArgs);
                // 4 取消listener2的订阅
                //   即使发布过事件，也可以取消订阅
                ob.unsubscribe("topic", listener2);
                // 5 再次以相同的事件参数发布topic事件
                ob.notify("topic", evtArgs);
                assert_statement(function (assert) {
                    assert(2, evtArgs.listener1Count, "监听器listener1会被调用2次:evtArgs.listener1Count===2");
                    assert(1, evtArgs.listener2Count, "由于第二次发布前取消了监听器listener2的订阅，listener2只会被调用1次::evtArgs.listener1Count===2");
                });
            });
            mdoc.usage("重复订阅的取消", function (assert_statement) {
                // 1 创建主题对象
                var ob = new YA.Subject();
                var order = [];
                // 1 定义2个监听器
                var listener1 = function (evt) { return order.push("listener1 invoked by " + evt); };
                var listener2 = function (evt) { return order.push("listener2 invoked by " + evt); };
                // 2 用这2个监听器订阅默认事件
                ob.subscribe(listener1);
                ob.subscribe(listener2);
                ob.subscribe(listener1);
                // 3 发布事件
                ob.notify("@notify1");
                // 4 取消listener1的订阅
                //   即使发布过事件，也可以取消订阅
                ob.unsubscribe(listener1);
                // 5 再次以相同的事件参数发布topic事件
                ob.notify("@notify2");
                assert_statement(function (assert) {
                    assert("listener1 invoked by @notify1,listener2 invoked by @notify1,listener1 invoked by @notify1,listener2 invoked by @notify2", order.join(","), "listener1\u4F1A\u5728\u7B2C\u4E00\u6B21notify\u65F6\u88AB\u8C03\u7528\u4E24\u6B21,\u88AB\u53D6\u6D88\u6389\u540E\uFF0C\u7B2C\u4E8C\u6B21notify\u53EA\u8C03\u7528\u4E86\u4E00\u6B21listener2:order==[\"listener1 invoked by @notify1\",\"listener2 invoked by @notify1\",\"listener1 invoked by @notify1\",\"listener2 invoked by @notify2\"]");
                });
            });
        };
        __decorate([
            YA_doct_1.doct()
        ], SubjectTest.prototype, "$subscribe", null);
        __decorate([
            YA_doct_1.doct()
        ], SubjectTest.prototype, "$notify", null);
        __decorate([
            YA_doct_1.doct()
        ], SubjectTest.prototype, "$unsubscribe", null);
        SubjectTest = __decorate([
            YA_doct_1.doct("YA.Observable")
        ], SubjectTest);
        return SubjectTest;
    }());
    exports.SubjectTest = SubjectTest;
});
//# sourceMappingURL=YA.Subject.doct.js.map