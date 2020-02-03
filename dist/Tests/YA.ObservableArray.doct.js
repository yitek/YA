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
    var ObservableArrayTest = /** @class */ (function () {
        function ObservableArrayTest(cdoc) {
            cdoc.description = "\u53EF\u89C2\u5BDF\u7684\u6570\u7EC4\u4EE3\u7406";
            cdoc.usage("基本用法", function (assert_statement) {
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
                    proxy[2].$subscribe(function (e) { return evtForIndex2 = e; });
                });
                proxy[2] = "YA framework";
                assert_statement(function (assert) {
                    var str = proxy[0] + "," + proxy[1] + "," + proxy[2];
                    assert("yi,yan,YA framework", str, "数组代理的项值变更为:proxy[0]==='yi',proxy[1]==='yan',proxy[2]==='YA framework'");
                    assert("YA", data[2], "原始数组的项值保持不变:data[2]==='YA'");
                    assert(undefined, evtForIndex2, "监听器未触发");
                });
                //更新数组代理
                proxy.$update();
                assert_statement(function (assert) {
                    assert("yi,yan,YA framework", data.toString(), "原始数据的项值被更新:data==['yi','yan','YA framework']");
                    assert(true, evtForIndex2 !== undefined, "监听器被触发");
                    assert(2, evtForIndex2.index, "事件参数可获得被更新的下标:evtForIndex2.index===2");
                    assert("YA framework", evtForIndex2.value, "新的项值:evtForIndex2.index===2");
                });
            });
        }
        ObservableArrayTest = __decorate([
            YA_doct_1.doct("YA.ObservableArray")
        ], ObservableArrayTest);
        return ObservableArrayTest;
    }());
    exports.ObservableArrayTest = ObservableArrayTest;
});
//# sourceMappingURL=YA.ObservableArray.doct.js.map