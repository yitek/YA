(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./mock-comp1", "./libs/mock-framework"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var comp1 = require("./mock-comp1");
    var framework = require("./libs/mock-framework");
    console.group("mock-app3.ts");
    console.log("mock-app3.ts正在执行.该模块为应用模块，还会加载comp1.依赖项为comp1,framework", comp1, framework);
    exports.mod = {
        modname: "mock-app3"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-app3 copy.js.map