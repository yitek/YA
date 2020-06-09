(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./mock-fra", "./libs/mock-framework"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fra = require("./mock-fra");
    var framework = require("./libs/mock-framework");
    console.group("mock-app2.ts");
    console.log("mock-app2.ts正在执行.该模块为应用模块，加载完fra后就要加载该模块");
    console.log("import fra", fra);
    console.log("import framework", framework);
    exports.mod = {
        modname: "mock-app2"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-app2 copy.js.map