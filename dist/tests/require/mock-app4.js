(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "libs/mock-frcomp1", "./libs/mock-framework"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var comp1 = require("libs/mock-frcomp1");
    var framework = require("./libs/mock-framework");
    console.group("mock-app4.ts");
    console.log("mock-app4.ts正在执行.frcomp1,framework", comp1, framework);
    exports.mod = {
        modname: "mock-app3"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-app4.js.map