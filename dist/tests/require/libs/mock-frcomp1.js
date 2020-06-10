(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mock-framework", "../mock-comp1"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fra = require("mock-framework");
    var comp = require("../mock-comp1");
    console.group("mock-frcomp1.ts");
    console.log("mock-frcomp1.ts正在执行,依赖项为 framework,comp1", fra, comp);
    exports.mod = {
        modname: "mock-framework"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-frcomp1.js.map