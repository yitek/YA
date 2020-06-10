(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "libs/mock-loop2", "libs/mock-framework"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var loop2 = require("libs/mock-loop2");
    var framework = require("libs/mock-framework");
    console.group("mock-loop1.ts");
    console.log("mock-loop1.ts正在执行,检查循环引用.loop2,framework", loop2, framework);
    exports.mod = {
        modname: "mock-loop1"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-loop1.js.map