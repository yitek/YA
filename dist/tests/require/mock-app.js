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
    console.group("mock-app.ts");
    console.log("mock-app.ts正在执行.该模块为应用模块，加载完fra后就要加载该模块");
    console.log("import fra", fra);
    exports.mod = {
        modname: "mock-app"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-app.js.map