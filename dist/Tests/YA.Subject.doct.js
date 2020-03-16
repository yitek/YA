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
    var SubjectTest = /** @class */ (function () {
        function SubjectTest() {
        }
        SubjectTest.prototype.base = function (assert_statement) {
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
        };
        SubjectTest.prototype.noenumerable = function (assert_statement) {
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
        };
        SubjectTest.prototype.subscribeDefault = function (assert_statement) {
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
        };
        SubjectTest.prototype.subscribe = function (assert_statement) {
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
        };
        SubjectTest.prototype.subscribeTimes = function (assert_statement) {
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
        };
        SubjectTest.prototype.notify = function (assert_statement) {
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
        };
        SubjectTest.prototype.notifyNoSubscribe = function (assert_statement) {
            // 1 创建主题对象
            var ob = new YA.Subject();
            // 2 不订阅默认事件，直接发布默认事件
            var evtArgs = {};
            ob.notify(evtArgs);
            // 3 不订阅topic，但发布了topic
            ob.notify("topic", null);
            // 这些操作是允许的，只是没有任何效果的空操作
        };
        SubjectTest.prototype.usubscribeDefault = function (assert_statement) {
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
        };
        SubjectTest.prototype.unsubscribeTopic = function (assert_statement) {
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
        };
        SubjectTest.prototype.unsubscribeMore = function (assert_statement) {
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
        };
        SubjectTest.prototype.invalidReference = function (assert_statement) {
            //创建一个观察者对象，
            var observer = {
                lastEvent: null,
                listener: function (evt) { this.lastEvent = evt; }
            };
            //使其变成可释放资源对象
            YA.disposable(observer);
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
        };
        __decorate([
            doct_1.doct({
                title: "基本用法"
            })
        ], SubjectTest.prototype, "base", null);
        __decorate([
            doct_1.doct({
                title: "subject的成员不可枚举",
                descriptions: ["\u7531\u4E8E\u8BE5\u7C7B\u53EF\u80FD\u4F1A\u88AB\u7528\u4E8Eentity/model\u7B49\u6570\u636E\u5BF9\u8C61\u7684\u57FA\u7C7B\uFF0C\u5B83\u7684\u6210\u5458\u5982\u679C\u88AB\u679A\u4E3E\u51FA\u6765\u4F1A\u7ED9\u540E\u7EE7\u5F00\u53D1\u5E26\u6765\u8BB8\u591A\u9EBB\u70E6\u3002\u6BD4\u5982\u7528for\u53BB\u679A\u4E3Eentity\u7684\u5B57\u6BB5\uFF0C\u4F46\u4E0D\u60F3\u8981$subscribe\u7B49\u51FD\u6570\u51FA\u73B0\u5728\u679A\u4E3E\u4E2D\uFF0C\u6545ISubect\u7684\u6240\u6709\u6210\u5458\u90FD\u662F\u4E0D\u53EF\u679A\u4E3E\u7684"]
            })
        ], SubjectTest.prototype, "noenumerable", null);
        __decorate([
            doct_1.doct({
                title: "订阅默认主题/注册默认事件的监听",
                descriptions: ["\u8BA2\u9605/\u6CE8\u518C\u4E8B\u4EF6\u76D1\u542C\u51FD\u6570\n        \u5F53\u53EA\u4F20\u9012\u4E00\u4E2A\u53C2\u6570\u65F6\uFF0C\u4E3A\u8BA2\u9605\u9ED8\u8BA4\u4E8B\u4EF6\uFF0C\u53C2\u6570\u4E3A\u76D1\u542C\u5668\u51FD\u6570\n        \u4F20\u9012\u4E24\u4E2A\u53C2\u6570\u65F6,\u4E3A\u8BA2\u9605\u4E3B\u9898\u4E8B\u4EF6\uFF0C\u7B2C\u4E00\u4E2A\u53C2\u6570\u4E3A\u4E3B\u9898\u540D\uFF0C\u7B2C\u4E8C\u4E2A\u53C2\u6570\u4E3A\u76D1\u542C\u5668\u51FD\u6570"],
                notices: "\u8BA2\u9605\u5E76\u4E0D\u4F1A\u7ED9\u76D1\u542C\u5668\u6392\u91CD\uFF0C\u7528\u76F8\u540C\u7684\u76D1\u542C\u5668\u51FD\u6570\u91CD\u590D\u8BA2\u9605\u76F8\u540C\u4E3B\u9898\uFF0C\u4F1A\u9020\u6210\u76D1\u542C\u5668\u91CD\u590D\u8C03\u7528"
            })
        ], SubjectTest.prototype, "subscribeDefault", null);
        __decorate([
            doct_1.doct({
                title: "订阅指定的主题"
            })
        ], SubjectTest.prototype, "subscribe", null);
        __decorate([
            doct_1.doct({
                title: "重复订阅",
                descriptions: "\u7528\u76F8\u540C\u7684\u76D1\u542C\u5668\u51FD\u6570\u53EF\u4EE5\u53CD\u590D\u8BA2\u9605\u540C\u4E00\u4E2A\u4E3B\u9898\uFF0Csubscribe\u4E0D\u4F1A\u505A\u6392\u91CD\u5904\u7406\u3002notify\u7684\u65F6\u5019\u4F1A\u91CD\u590D\u8C03\u7528\u8BE5\u76D1\u542C\u51FD\u6570"
            })
        ], SubjectTest.prototype, "subscribeTimes", null);
        __decorate([
            doct_1.doct({
                title: "发布主题",
                descriptions: [
                    "\u53D1\u5E03\u4E8B\u4EF6/\u4E3B\u9898\n            \u5F53\u53EA\u4F20\u9012\u4E00\u4E2A\u53C2\u6570\u65F6\uFF0C\u4E3A\u53D1\u5E03\u9ED8\u8BA4\u4E8B\u4EF6\uFF0C\u53C2\u6570\u4E3A\u4E8B\u4EF6\u53C2\u6570\n            \u4F20\u90122\u4E2A\u53C2\u6570\u65F6\uFF0C\u4E3A\u53D1\u5E03\u4E3B\u9898\u4E8B\u4EF6\uFF0C\u7B2C\u4E00\u4E2A\u53C2\u6570\u4E3A\u4E3B\u9898\u540D\uFF0C\u7B2C\u4E8C\u4E2A\u53C2\u6570\u4E3A\u4E8B\u4EF6\u53C2\u6570\n            \u5176\u57FA\u672C\u7528\u6CD5\u53EF\u53C2\u89C1subscibe\u7684\u793A\u4F8B.",
                    "\u5F53\u4E8B\u4EF6/\u4E3B\u9898\u53D1\u5E03\u65F6\uFF0C\u76D1\u542C\u5668\u7684\u8C03\u7528\u987A\u5E8F\u4E3A\u8BA2\u9605\u7684\u987A\u5E8F"
                ]
            })
        ], SubjectTest.prototype, "notify", null);
        __decorate([
            doct_1.doct({
                title: "未被订阅的主题也可以发布",
                descriptions: "\u5373\u4F7F\u4E3B\u9898\u6CA1\u6709\u88AB\u8BA2\u9605\uFF0C\u4E5F\u53EF\u4EE5\u53D1\u5E03\u8BE5\u4E3B\u9898"
            })
        ], SubjectTest.prototype, "notifyNoSubscribe", null);
        __decorate([
            doct_1.doct({
                title: "取消订阅",
                descriptions: ["\n        \u53D6\u6D88\u67D0\u4E2A\u76D1\u542C\u5668\u51FD\u6570\u7684\u8BA2\u9605\n        \u5F53\u53EA\u4F20\u9012\u4E00\u4E2A\u53C2\u6570\u65F6\uFF0C\u4E3A\u8BA2\u9605\u9ED8\u8BA4\u4E8B\u4EF6\uFF0C\u53C2\u6570\u4E3A\u76D1\u542C\u5668\u51FD\u6570\n        \u4F20\u9012\u4E24\u4E2A\u53C2\u6570\u65F6,\u4E3A\u8BA2\u9605\u4E3B\u9898\u4E8B\u4EF6\uFF0C\u7B2C\u4E00\u4E2A\u53C2\u6570\u4E3A\u4E3B\u9898\u540D\uFF0C\u7B2C\u4E8C\u4E2A\u53C2\u6570\u4E3A\u76D1\u542C\u5668\u51FD\u6570"],
                notices: ["\u91CD\u590D\u6CE8\u518C\u7684\u76D1\u542C\u51FD\u6570\u4F1A\u88AB\u4E00\u6B21\u6027\u53D6\u6D88\u6389"]
            })
        ], SubjectTest.prototype, "usubscribeDefault", null);
        __decorate([
            doct_1.doct({
                title: "取消主题事件的订阅"
            })
        ], SubjectTest.prototype, "unsubscribeTopic", null);
        __decorate([
            doct_1.doct({
                title: "重复订阅会一次性取消掉"
            })
        ], SubjectTest.prototype, "unsubscribeMore", null);
        __decorate([
            doct_1.doct({
                title: "自动释放监听函数(自动释放对观察者的引用)",
                descriptions: [
                    "\u89C2\u5BDF\u8005\u6A21\u5F0F\u5982\u679C\u4E0D\u505A\u7279\u6B8A\u5904\u7406\uFF0C\u4F1A\u9020\u6210\u4E00\u79CD\u79F0\u4E3A\u60AC\u5782\u5F15\u7528\u7684\u5185\u5B58\u6CC4\u9732\u95EE\u9898\u3002\u89C2\u5BDF\u8005\u5C06\u76D1\u542C\u5668\u52A0\u5165\u5230\u88AB\u89C2\u5BDF\u5BF9\u8C61\u65F6\uFF0C\u88AB\u89C2\u5BDF\u5BF9\u8C61\u7EF4\u7CFB\u7740\u4E00\u4E2A\u5BF9\u89C2\u5BDF\u8005\u7684\u5F15\u7528\u3002\u5982\u679C\u89C2\u5BDF\u8005\u5DF2\u7ECF\u88AB\u9500\u6BC1\uFF0C\u88AB\u89C2\u5BDF\u8005\u65E0\u6CD5\u77E5\u9053\u89C2\u5BDF\u8005\u5DF2\u7ECF\u9500\u6BC1\u4E86\uFF0C\u5B83\u8FD8\u53EF\u4EE5\u901A\u8FC7\u8BE5\u5F15\u7528\u8BBF\u95EE\u5230\u88AB\u89C2\u5BDF\u8005\u3002\u5BF9\u4E8E\u8BB8\u591A\u6709\u81EA\u52A8\u56DE\u6536\u673A\u5236\u7684\u8BED\u8A00\u6765\u8BF4\uFF0C\u7531\u4E8E\u89C2\u5BDF\u8005\u8FD8\u88AB\u5F15\u7528\uFF0C\u5B83\u5C06\u6C38\u8FDC\u65E0\u6CD5\u88AB\u56DE\u6536\u3002",
                    "\u4E3A\u89E3\u51B3\u8BE5\u95EE\u9898\uFF0C\u672C\u6846\u67B6\u7684\u89C2\u5BDF\u8005\u6A21\u5F0F\u5B9E\u73B0\u4E2D\uFF0Csubscribe\u51FD\u6570\u53EF\u4EE5\u4F7F\u7528\u7B2C\u4E09\u4E2A\u53C2\u6570observer.\u8BE5observer\u5FC5\u987B\u4E3AIDisposable\u3002\u5982\u679C\u6211\u4EEC\u5728\u8BA2\u9605\u65F6\u4F7F\u7528\u4E86observer\u53C2\u6570\uFF0C\u5728observer\u9500\u6BC1\u65F6\uFF0C\u4F1A\u81EA\u52A8\u89E3\u9664\u5BF9\u8BE5subject\u7684\u76D1\u542C\u4E0E\u5F15\u7528\u3002"
                ]
            })
        ], SubjectTest.prototype, "invalidReference", null);
        SubjectTest = __decorate([
            doct_1.doct({
                title: "YA.Observable",
                descriptions: [
                    "主题对象类,实现订阅/发布模式,通常用作用作其他类型的基类。",
                    "\u5B83\u652F\u6301\u8BA2\u9605/\u53D1\u5E03\u67D0\u4E2A\u4E3B\u9898;\u5982\u679C\u672A\u6307\u5B9A\u4E3B\u9898\uFF0C\u9ED8\u8BA4\u4E3B\u9898\u4E3A\"\"",
                    "\u5B83\u7684\u6240\u6709\u5173\u4E8E\u8BA2\u9605\u53D1\u5E03\u7684\u6210\u5458\u5B57\u6BB5/\u51FD\u6570\u90FD\u662Fenumerable=false\u7684"
                ],
                notices: [
                    "\u8BE5\u5BF9\u8C61\u5E76\u4E0D\u4F1A\u505A\u5783\u573E\u56DE\u6536\uFF0C\u5982\u679C\u76D1\u542C\u5668\u53CA\u5176\u4E0A\u4E0B\u6587\u5DF2\u7ECF\u5931\u6548\uFF0C\u7531\u4E8E\u5B83\u4F9D\u7136\u88AB\u8BE5\u5BF9\u8C61\u5F15\u7528\uFF0CJS\u7684\u5783\u573E\u56DE\u6536\u5668\u4E0D\u4F1A\u56DE\u6536\u8BE5\u76D1\u542C\u5668\u53CA\u4E0A\u4E0B\u6587\u3002\u8FD9\u5728\u67D0\u4E9B\u60C5\u51B5\u4E0B\u4F1A\u9020\u6210\u60AC\u5782\u5F15\u7528\u95EE\u9898\u3002"
                ]
            })
        ], SubjectTest);
        return SubjectTest;
    }());
    exports.SubjectTest = SubjectTest;
});
//# sourceMappingURL=YA.Subject.doct.js.map