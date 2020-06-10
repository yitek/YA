(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./mock-fra"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fra = require("./mock-fra");
    console.group("mock-comp1.ts");
    console.log("mock-comp1.ts正在执行,该模块为插件模块,依赖项为fra", fra);
    exports.mod = {
        modname: "mock-comp1"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-comp1.js.map