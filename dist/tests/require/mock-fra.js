(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.group("mock-fra.ts");
    console.log("mock-fra.ts正在执行，该模块为架构模块，应该首先加载");
    exports.mod = {
        modname: "mock-fra"
    };
    console.groupEnd();
});
//# sourceMappingURL=mock-fra.js.map