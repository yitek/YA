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
    var ObservableObjectTest = /** @class */ (function () {
        function ObservableObjectTest(cdoc) {
            cdoc.description = "\u53EF\u89C2\u5BDF\u7684\u5BF9\u8C61\u4EE3\u7406";
            cdoc.usage("基本用法", function (assert_statement) {
                var data = {
                    id: 1,
                    title: "YA framework"
                };
                // 1 创建一个Observable代理/模型
                var proxy = new YA.ObservableObject(data);
                var membernames = [];
                for (var n in proxy)
                    membernames.push(n);
                assert_statement(function (assert) {
                    assert(YA.DataTypes.Object, proxy.$type, "\u4EE3\u7406\u7684\u7C7B\u578B\u4E3A\u503C\u7C7B\u578B:proxy.$type === YA.DataTypes." + YA.DataTypes[proxy.$type]);
                    assert("YA framework", proxy.title, "可以访问对象上的数据:proxy.title==='YA framework'");
                    assert("id,title", membernames.join(","), "可以且只可以枚举原始数据的字段:membernames=['1','title']");
                });
                // 2 用usingMode改变ob的访问模式，获取到属性的代理(而不是值)
                // 在title属性上注册一个事件监听
                var titleChangeInfo;
                YA.proxyMode(function () {
                    proxy.title.$subscribe(function (e) {
                        titleChangeInfo = e;
                    });
                });
                //3 改变模型的属性的值
                proxy.title = "YA framework v1.0";
                assert_statement(function (assert) {
                    assert("YA framework v1.0", proxy.title, "模型上的title属性的值变更为新值:proxy.title==='YA framework v1.0'");
                    assert("YA framework", data.title, "更新模型前，原始数据的值不会被改变:data.title === 'YA framework'");
                    assert(undefined, titleChangeInfo, "注册的监听器不会触发");
                });
                //在Proxy访问模式下，可以从模型中获取到原始的值
                var raw_title_value;
                YA.proxyMode(function () {
                    raw_title_value = proxy.title.$get(YA.ObservableModes.Raw);
                });
                assert_statement(function (assert) {
                    assert("YA framework", raw_title_value, "raw_title_vale === 'YA framework'");
                });
                // 4 更新模型
                proxy.$update();
                assert_statement(function (assert) {
                    assert("YA framework v1.0", data.title, "原始数据的属性被写入新值:data.title==='YA framework v1.0'");
                    assert(true, titleChangeInfo !== undefined, "注册在title上的事件被触发");
                    assert(true, titleChangeInfo.old === "YA framework" && titleChangeInfo.value === "YA framework v1.0", "事件参数记录了新值与旧值:evt.value==='YA framework v1.0',evt.old==='YA framework'");
                });
            });
        }
        ObservableObjectTest = __decorate([
            YA_doct_1.doct("YA.ObservableObject")
        ], ObservableObjectTest);
        return ObservableObjectTest;
    }());
    exports.ObservableObjectTest = ObservableObjectTest;
});
//# sourceMappingURL=YA.ObservableObject.doct.js.map