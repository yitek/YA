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
        function ObservableTest(doc) {
            doc.description = "\u53EF\u76D1\u542C\u5BF9\u8C61\u7C7B\n\u5B9E\u73B0\u8BA2\u9605/\u53D1\u5E03\u6A21\u5F0F\n\u5B83\u652F\u6301\u8BA2\u9605/\u53D1\u5E03\u67D0\u4E2A\u4E3B\u9898;\u5982\u679C\u672A\u6307\u5B9A\u4E3B\u9898\uFF0C\u9ED8\u8BA4\u4E3B\u9898\u4E3A\"\"\n\u5B83\u7684\u6240\u6709\u5173\u4E8E\u8BA2\u9605\u53D1\u5E03\u7684\u6210\u5458\u5B57\u6BB5/\u51FD\u6570\u90FD\u662Fenumerable=false\u7684\n\u4E00\u822C\u7528\u4F5C\u5176\u4ED6\u7C7B\u578B\u7684\u57FA\u7C7B";
            doc.usage("基本用法", "\u901A\u8FC7$subscribe\u8BA2\u9605\uFF0C$notify\u53D1\u5E03", function (assert_statement) {
                //1 创建一个可监听对象 
                var ob = new YA.Observable();
                //2 定义监听函数
                var listener = function (evt) { argPassToListener = evt; };
                //记录传递给监听函数的参数
                var argPassToListener;
                //3 注册监听器
                ob.$subscribe(listener);
                //4 定义事件参数
                var evtArgs = {};
                //5 发送通知
                ob.$notify(evtArgs);
                assert_statement(function (assert) {
                    assert(true, argPassToListener !== undefined, "监听函数会被调用");
                    assert(evtArgs, argPassToListener, "监听函数中接收到的参数，就是$notify发送的参数");
                });
            });
        }
        ObservableTest.prototype.subscribe = function (mdoc) {
            mdoc.description = "\u652F\u6301\u9ED8\u8BA4\u4E3B\u9898\u4E0E\u6307\u5B9A\u4E3B\u9898\u8BA2\u96052\u79CD\u7528\u6CD5";
            mdoc.usage("订阅默认事件", function (assert_statement) {
                // 1 创建可监听对象
                var ob = new YA.Observable();
                var evtInListener1, evtInListener2;
                // 2 定义2个监听者函数,并订阅默认事件
                var lisenter1 = function (evt) { evtInListener1 = evt; };
                var lisenter2 = function (evt) { evtInListener2 = evt; };
                ob.$subscribe(lisenter1);
                ob.$subscribe(lisenter2);
                //3 定义事件参数，并发布事件
                var evtArgs = {};
                ob.$notify(evtArgs);
                assert_statement(function (assert) {
                    assert(evtArgs, evtInListener1);
                    assert(evtArgs, evtInListener2, "2个监听器都应该被调用且收到相同的事件参数:evtInListener1===evtInListener2===evtArgs");
                });
                evtInListener1 = evtInListener2 = undefined;
                var evtArgs2 = {};
                ob.$notify(evtArgs2);
                assert_statement(function (assert) {
                    assert(evtArgs2, evtInListener1);
                    assert(evtArgs2, evtInListener2, "可以多次发送事件，每次发送所有订阅过的监听器都会被调用:evtInListener1===evtInListener2===evtArgs2");
                });
            });
        };
        ObservableTest.prototype.notify = function (mdoc) {
            mdoc.usage(function (assert_statement) {
                var ob = new Observable();
                var evtArgs = { lisenter1Invoked: 0, lisenter2Invoked: 0 };
                ob.$notify(evtArgs);
                assert_statement(function (assert) {
                    assert(true, true, "不注册任何监听器，observable也可以正常发送事件.");
                });
            });
            mdoc.usage(function (assert_statement) {
                var ob = new Observable();
                var order = [];
                var evtArgs = { lisenter1Invoked: 0, lisenter2Invoked: 0 };
                var lisenter1 = function (evt) { return order.push("listener1"); };
                var lisenter2 = function (evt) { return order.push("listener2"); };
                ob.$subscribe(lisenter1);
                ob.$subscribe(lisenter2);
                ob.$subscribe(lisenter1);
                ob.$notify(evtArgs);
                assert_statement(function (assert) {
                    assert(3, order.length, "注册了3个监听函数，每个监听函数都会被调用.");
                    assert("listener1", order[0], "第一个注册的listener1首先被调用.");
                    assert("listener2", order[1], "第二个注册的listener2接着被调用.");
                    assert("listener1", order[2], "重复注册的listener1最后被调用.");
                });
            });
        };
        ObservableTest.prototype.unsubscribe = function (mdoc) {
            mdoc.usage(function (assert_statement) {
                var ob = new Observable();
                var evtArgs = { lisenter1Invoked: 0, lisenter2Invoked: 0 };
                var lisenter1 = function (evt) { return evt.lisenter1Invoked++; };
                var lisenter2 = function (evt) { return evt.lisenter2Invoked++; };
                ob.$unsubscribe(lisenter1);
                assert_statement(function (assert) {
                    assert(true, true, "即使没有注册任何监听器，也可以正常调用unsubscribe");
                });
            });
            mdoc.usage(function (assert_statement) {
                var ob = new Observable();
                var evtArgs = { lisenter1Invoked: 0, lisenter2Invoked: 0 };
                var lisenter1 = function (evt) { return evt.lisenter1Invoked++; };
                var lisenter2 = function (evt) { return evt.lisenter2Invoked++; };
                ob.$unsubscribe(lisenter1);
                ob.$subscribe(lisenter1);
                ob.$unsubscribe(lisenter2);
                ob.$notify(evtArgs);
                assert_statement(function (assert) {
                    assert(true, true, "注册了listener1,也可以unsubscribe其他函数");
                    assert(1, evtArgs.lisenter1Invoked, "unsubscribe2后，监听器1不受影响收到事件参数");
                    assert(0, evtArgs.lisenter2Invoked, "listener2未被注册，不会被调用");
                });
            });
            mdoc.usage(function (assert_statement) {
                var ob = new Observable();
                var evtArgs = { lisenter1Invoked: 0, lisenter2Invoked: 0 };
                var lisenter1 = function (evt) { return evt.lisenter1Invoked++; };
                var lisenter2 = function (evt) { return evt.lisenter2Invoked++; };
                ob.$subscribe(lisenter1);
                ob.$unsubscribe(lisenter1);
                ob.$subscribe(lisenter2);
                ob.$notify(evtArgs);
                assert_statement(function (assert) {
                    assert(1, evtArgs.lisenter1Invoked, "unsubscribe1后，监听器1不应该收到事件参数");
                    assert(1, evtArgs.lisenter2Invoked, "listener2未调用unsubscribe,监听器2应该能收到事件参数");
                });
            });
            //ob.$unsubscribe(lisenter1);
            //ob.$notify(evtArgs);
            //assert(1,evtArgs.lisenter1Invoked,"两次调用unsubscribe1后，监听器1不应该收到事件参数");
            //assert(2,evtArgs.lisenter2Invoked,"unsubscribe1不影响listener2,监听器2应该能收到事件参数");
            //ob.$unsubscribe(lisenter2);
            //ob.$notify(evtArgs);
            //assert(1,evtArgs.lisenter1Invoked,"两次调用unsubscribe1后，监听器1不应该收到事件参数");
            //assert(2,evtArgs.lisenter2Invoked,"unsubscribe2后,监听器2应该不能收到事件参数");
        };
        __decorate([
            YA_doct_1.doct()
        ], ObservableTest.prototype, "subscribe", null);
        __decorate([
            YA_doct_1.doct()
        ], ObservableTest.prototype, "notify", null);
        __decorate([
            YA_doct_1.doct()
        ], ObservableTest.prototype, "unsubscribe", null);
        ObservableTest = __decorate([
            YA_doct_1.doct("YA.Observable")
        ], ObservableTest);
        return ObservableTest;
    }());
});
//# sourceMappingURL=YA.Observable.doct.js.map