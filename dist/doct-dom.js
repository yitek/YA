(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "doct"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dt = require("doct");
    exports.Doct = dt.Doct;
    exports.doct = dt.doct;
    function execute(cls, parent) {
        if (!(cls instanceof dt.TestClass))
            cls = new dt.TestClass(cls);
        var output = cls.run();
        render(output, exports.Doct.rootElement || document.body, false);
    }
    exports.execute = execute;
    var currentDemo;
    exports.Doct.methodExecuting = function (opts) {
        currentDemo = document.createElement("div");
        return;
    };
    exports.Doct.methodExecuted = function (section, opts) {
        if (currentDemo.innerHTML) {
            section.content.push({ contentType: "demo", element: currentDemo });
        }
        currentDemo = null;
    };
    exports.Doct.classExecuted = function (output, cls) {
        render(output, exports.Doct.rootElement || document.body, false);
    };
    function render(section, parent, insub) {
        var elem;
        if (section.push && section.pop) {
            if (insub) {
                elem = document.createElement("ol");
                for (var _i = 0, _a = section; _i < _a.length; _i++) {
                    var sub = _a[_i];
                    var li = document.createElement("li");
                    elem.appendChild(li);
                    render(sub, li, true);
                }
            }
            else {
                elem = document.createElement("section");
                elem.className = "section";
                for (var _b = 0, _c = section; _b < _c.length; _b++) {
                    var sub = _c[_b];
                    render(sub, elem, true);
                }
            }
        }
        else if (section.content) {
            elem = document.createElement("section");
            elem.className = "section ";
            var ct = section.contentType;
            if (ct) {
                if (ct.push && ct.pop) {
                    elem.className += ct.join(" ");
                }
                else
                    elem.className += ct;
            }
        }
        else if (section.element) {
            elem = document.createElement("aside");
            elem.className = "demo";
            elem.appendChild(section.element);
        }
        if (parent)
            parent.appendChild(elem);
        return elem;
    }
});
//# sourceMappingURL=doct-dom.js.map