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
                var proxy = new YA.ObservableObject({
                    id: 1,
                    title: "YA framework"
                });
                var membernames = [];
                for (var n in proxy)
                    membernames.push(n);
                assert_statement(function (assert) {
                    assert(YA.DataTypes.Object, proxy.$type, "\u4EE3\u7406\u7684\u7C7B\u578B\u4E3A\u503C\u7C7B\u578B:proxy.$type === YA.DataTypes." + YA.DataTypes[proxy.$type]);
                    assert("YA framework", proxy.title, "可以访问对象上的数据:proxy.title==='YA framework'");
                    assert("id,title", membernames.join(","), "可以且只可以枚举原始数据的字段:membernames=['1','title']");
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