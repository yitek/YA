(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mock-loop1", "mock-fra"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var loop1 = require("mock-loop1");
    var framework = require("mock-fra");
    console.group("mock-loop3.ts");
    console.log("检查循环引用.loop1,framework", loop1, framework);
    exports.mod = {
        modname: "mock-loop3"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-loop3.js.map