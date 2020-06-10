(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mock-framework", "../mock-loop3"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fra = require("mock-framework");
    var loop3 = require("../mock-loop3");
    console.group("mock-loop2.ts");
    console.log("依赖项为 framework,loop3", fra, loop3);
    exports.mod = {
        modname: "mock-loop3"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-loop2.js.map