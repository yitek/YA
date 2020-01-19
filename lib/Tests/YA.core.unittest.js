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
        define(["require", "exports", "../Unittest", "../YA.core", "../YA.core"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Unittest_1 = require("../Unittest");
    var YA_core_1 = require("../YA.core");
    var YA_core_2 = require("../YA.core");
    Unittest_1.Unittest.debugging = true;
    Unittest_1.Unittest.Test("YA.Core", {
        "Observable": function (assert, info) {
            var ob = new YA_core_2.Observable();
            var evtArgs = { lisenter1Invoked: false, lisenter2Invoked: false };
            var lisenter1 = function (evt) { return evt.lisenter1Invoked = true; };
            ob.$subscribe(lisenter1);
            ob.$subscribe(function (evt) { return evt.lisenter2Invoked = true; });
            ob.$notify(evtArgs);
            assert(true, evtArgs.lisenter1Invoked, "监听器1应该能收到事件参数");
            assert(true, evtArgs.lisenter2Invoked, "监听器2应该能收到事件参数");
            evtArgs = { lisenter1Invoked: false, lisenter2Invoked: false };
            ob.$unsubscribe(lisenter1);
            ob.$notify(evtArgs);
            assert(false, evtArgs.lisenter1Invoked, "unsubscribe1后，监听器1不应该收到事件参数");
            assert(true, evtArgs.lisenter2Invoked, "listener2未调用unsubscribe,监听器2应该能收到事件参数");
            var membername;
            for (var n in ob) {
                membername = n;
                break;
            }
            assert(membername, undefined, "用for不能获取到任何的成员");
        },
        "ObservableProxy": function (assert, info) {
            var target = { x: 1 };
            var proxy = new YA_core_2.ObservableProxy(function (value) { return (value === undefined) ? target.x : target.x = value; });
            assert(1, proxy.$get(), "代理应该可以获取到原先的值");
            proxy.$set(2);
            assert(2, proxy.$get(), "在代理上改变值后，重新获取代理的值应该是新值");
            assert(1, target.x, "在代理上调用$set后，原始的值还应该是旧值");
            assert(2, proxy.$modifiedValue, "在代理上调用$set后，代理内部的$modifiedValue记录了改变的值");
            var evtArgs;
            proxy.$subscribe(function (evt) { return evtArgs = evt; });
            proxy.$update();
            assert(2, target.x, "调用$update更新代理后，原始的值变更为新值");
            assert(false, !evtArgs, "事件应该被调用");
            assert(proxy, evtArgs.sender, "事件的发送者应该为代理");
            assert(1, evtArgs.old, "事件对象中应该记录了旧值");
            assert(2, evtArgs.value, "事件对象中应该记录的新值");
            assert(undefined, proxy.$modifiedValue, "$update后，代理内部记录改变的$modifiedValue将会被清空");
            evtArgs = undefined;
            proxy.$update();
            assert(undefined, evtArgs, "虽然调用了$update,由于未对旧值做变更，事件不会触发");
            proxy.$set(2);
            assert(2, proxy.$modifiedValue, "在代理上调用$set后，代理内部的$modifiedValue记录了改变的值");
            proxy.$update();
            assert(undefined, evtArgs, "虽然调用了$update，但新值与旧值一样，监听不会触发");
            var membername;
            for (var n in proxy) {
                membername = n;
                break;
            }
            assert(membername, undefined, "用for不能获取到任何的成员");
        },
        "ObservableObject": function (assert, info) {
            var target = {
                name: "yiy",
                gender: 1,
                age: 38,
                nick: "yy",
                changeNick: function (val) { this.nick = val; }
            };
            var proxy = new YA_core_2.ObservableObject(function (val) { return val === undefined ? target : target = val; }, {
                fieldnames: ["name"],
                methodnames: ["changeNick"],
                propBuilder: function (ownerProxy, define) {
                    define("gender")("age");
                }
            });
            assert("yiy", proxy.name, "代理的字段的值应该跟目标对象的字段的值一样");
            assert(target.changeNick, proxy.changeNick, "代理的方法应该目标对象的方法是同一个");
            assert(38, proxy.age, "代理的属性的值应该跟目标对象的值一样");
            var propAge;
            try {
                YA_core_2.ObservableProxy.accessMode = YA_core_2.ProxyAccessModes.Proxy;
                propAge = proxy.age;
            }
            finally {
                YA_core_2.ObservableProxy.accessMode = YA_core_2.ProxyAccessModes.Default;
            }
            assert(true, propAge instanceof YA_core_2.ObservableProxy, "当ValueProxy.gettingProxy开关打开时，属性返回的的是代理对象本身");
            var evtArgs;
            propAge.$subscribe(function (evt) { return evtArgs = evt; });
            assert(proxy, propAge.$owner, "属性上的$owner应该是对象代理");
            proxy.age = 18;
            assert(18, proxy.age, "对象代理的属性改变后，再次取出的值是改变后的值");
            assert(38, target.age, "目标对象的值应该保持不变");
            assert(undefined, evtArgs, "监听器未被触发");
            proxy.$update();
            assert(18, target.age, "对象代理调用$update更新后，目标对象的字段值获得更新");
            assert(false, !evtArgs, "监听器已经触发");
            var newTarget = {
                name: "yanyi",
                gender: 2,
                age: 28,
                nick: "ya",
                changeNick: function (val) { this.nick = val; }
            };
            evtArgs = undefined;
            proxy.$set(newTarget);
            assert(newTarget, proxy.$modifiedValue, "更换目标对象后，代理对象上的$modifiedValue变更为新对象");
            //assert(target,proxy.$target,"更换目标对象后，代理对象上的$target还保持为原先的对象");
            assert("yanyi", proxy.name, "更换目标对象后，代理上的字段的值是新的对象的字段值");
            assert(2, proxy.gender, "更换目标对象后，属性值是新的对象的字段值");
            assert(28, proxy.age, "更换目标对象后，属性值是新的对象的字段值");
            assert(true, evtArgs === undefined, "更换目标对象后，监听器尚未被调用");
            assert("yiy", target.name, "原始对象的值还未被改变");
            assert(1, target.gender, "原始对象的值还未被改变");
            proxy.$update();
            assert(newTarget, target, "$update后，原始对象应该更换为新的对象");
            assert(28, proxy.age, "更换目标对象，且$update后，属性值是新的对象的字段值");
            assert(true, evtArgs !== undefined, "$update后，代理上的监听器应该被调用");
            var membernames = {
                "name": false,
                "age": false,
                "gender": false
            };
            for (var n in proxy) {
                if (membernames[n] === undefined)
                    assert("name,age,gender", n, "用for应该只能能获取到[name,age,gender]");
                membernames[n] = true;
            }
            for (var n in membernames) {
                if (!membernames[n])
                    assert(n, false, "用for应该能获取到以下成员[name,age,gender]");
            }
        },
        "ObservableArray": function (assert, info) {
            var target = [14, 24, 38, 40];
            var proxy = new YA_core_2.ObservableArray(function (val) { return val === undefined ? target : target = val; });
            assert(4, proxy.length, "代理的length = array.length");
            assert(14, proxy[0], "代理[0]=arr[0]");
            assert(24, proxy[1], "代理[1]=arr[1]");
            assert(38, proxy[2], "代理[2]=arr[2]");
            assert(40, proxy[3], "代理[3]=arr[3]");
            var idx1;
            var idx2;
            try {
                YA_core_2.ObservableProxy.accessMode = YA_core_2.ProxyAccessModes.Proxy;
                idx2 = proxy[2];
                idx1 = proxy[1];
            }
            finally {
                YA_core_2.ObservableProxy.accessMode = YA_core_2.ProxyAccessModes.Default;
            }
            assert(true, idx1 instanceof YA_core_2.ObservableProxy, "可以获取到item代理");
            assert(true, idx2 instanceof YA_core_2.ObservableProxy, "可以获取到item代理");
            var newTarget = [11, 22, 33];
            proxy.$set(newTarget);
            assert(3, proxy.length, "代理的length = newTarget.length");
            assert(11, proxy[0], "更换target后，代理[0]=newTarget[0]");
            assert(22, proxy[1], "更换target后，代理[1]=newTarget[1]");
            assert(33, proxy[2], "更换target后，代理[2]=newTarget[2]");
        },
        "ArrayProxy.push": function (assert, info) {
            var target = [34, 24, 38];
            var proxy = new YA_core_2.ObservableArray(function (val) { return val === undefined ? target : target = val; });
            proxy.push(55);
            assert(4, proxy.length, "push后，代理的length = array.length+1");
            assert(34, proxy[0], "push后，代理[0]=arr[0]");
            assert(24, proxy[1], "push后，代理[1]=arr[1]");
            assert(38, proxy[2], "push后，代理[2]=arr[2]");
            assert(55, proxy[3], "push后，代理[3]=push的值");
            assert(3, target.length, "push后，target没有变化");
            var proxyEvtArgs;
            proxy.$subscribe(function (evt) { return proxyEvtArgs; });
            proxy.$update();
            assert(4, target.length, "更新后，arr的length+1");
        },
        "Model": function (assert, info) {
            var initData = createData();
            var model = new YA_core_2.Model(initData);
            var proxy = model.createProxy(initData);
            assert("k", proxy.queries.name, "模型创建的代理可以访问原始对象proxy.queries.name");
            assert("y", proxy.queries.author, "模型创建的代理可以访问原始对象proxy.queries.author");
            assert(48, proxy.recordCount, "模型创建的代理可以访问原始对象proxy.recordCount");
            assert(0, proxy.rows.length, "模型创建的代理可以访问原始对象proxy.rows.length");
            proxy.queries.name = "YA";
            proxy.rows.push({
                id: "",
                name: "YA.core",
                author: {
                    id: "",
                    name: "yiy",
                    email: "yitek@outlook.com"
                },
                date: null
            });
            assert("YA", proxy.queries.name, "代理上修改值，应该变更为新值proxy.queries.name");
            assert(1, proxy.rows.length, "代理上修改值，应该变更为新值proxy.rows.length");
            assert("YA.core", proxy.rows[0].name, "代理上修改值，应该变更为新值proxy.rows[0].name");
            assert("yitek@outlook.com", proxy.rows[0].author.email, "代理上修改值，应该变更为新值proxy.rows[0].author.email");
            assert("k", initData.queries.name, "代理上修改值，原始的值未变化initData.queries.name");
            assert(0, initData.rows.length, "代理上修改值，原始的值未变化initData.rows.length");
            proxy.$update();
            assert("YA", initData.queries.name, "Update后，原始对象应该变更为新值initData.queries.name");
            assert(1, initData.rows.length, "Update后，原始对象应该变更为新值initData.rows.length");
            assert("YA.core", initData.rows[0].name, "代Update后，原始对象应该变更为新值initData.rows[0].name");
            assert("yitek@outlook.com", initData.rows[0].author.email, "Update后，原始对象应该变更为新值initData.rows[0].author.email");
            //assert(4,proxy.length,"push后，代理的length = array.length+1");
        },
        "component": function (assert, info) {
            var SampleComponent = /** @class */ (function () {
                function SampleComponent() {
                    this.lng = {
                        "name": "标题"
                    };
                    this.model = createData();
                }
                SampleComponent.prototype.template = function () {
                    return YA_core_1.default.ELEMENT("div", null,
                        YA_core_1.default.ELEMENT("div", null,
                            YA_core_1.default.ELEMENT("div", null,
                                YA_core_1.default.ELEMENT("label", null, this.lng.name),
                                YA_core_1.default.ELEMENT("input", { type: "text", onblur: this.nameChanged, value: this.model.queries.name })),
                            YA_core_1.default.ELEMENT("div", null,
                                "\u4F60\u8F93\u5165\u7684\u5B57\u7B26\u662F:",
                                this.model.queries.name)));
                };
                ;
                SampleComponent.prototype.nameChanged = function (e) {
                    debugger;
                    this.model.queries.name = e.target.value;
                };
                __decorate([
                    YA_core_2.reactive()
                ], SampleComponent.prototype, "model", void 0);
                __decorate([
                    YA_core_1.template("")
                ], SampleComponent.prototype, "template", null);
                __decorate([
                    YA_core_1.action()
                ], SampleComponent.prototype, "nameChanged", null);
                SampleComponent = __decorate([
                    YA_core_2.component("A")
                ], SampleComponent);
                return SampleComponent;
            }());
            var a = new SampleComponent();
            var elem = a.$render("");
            document.body.appendChild(elem);
        }
    });
    function createData() {
        return {
            queries: {
                name: "k",
                author: "y",
                min_date: null,
                max_date: null,
            },
            rows: [{
                    __STRUCT: true,
                    id: "",
                    name: "YA.core",
                    author: {
                        id: "",
                        name: "yiy",
                        email: "yitek@outlook.com"
                    },
                    date: null
                }],
            pageSize: 10,
            pageIndex: 1,
            recordCount: 48
        };
    }
});
//# sourceMappingURL=YA.core.unittest.js.map