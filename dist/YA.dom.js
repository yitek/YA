var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "YA.core"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var YA = require("YA.core");
    var Size = /** @class */ (function () {
        function Size(w, h) {
            this.w = w === undefined ? undefined : parseFloat(w);
            this.h = h === undefined ? undefined : parseFloat(h);
        }
        Object.defineProperty(Size.prototype, "width", {
            get: function () { return this.w; },
            set: function (w) {
                this.w = parseFloat(w);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Size.prototype, "height", {
            get: function () { return this.h; },
            set: function (h) {
                this.h = parseFloat(h);
            },
            enumerable: true,
            configurable: true
        });
        Size.prototype.equal = function (size) {
            return size ? this.w == size.w && this.h == size.h : false;
        };
        return Size;
    }());
    exports.Size = Size;
    var Pointer = /** @class */ (function () {
        function Pointer(x, y) {
            this.x = x === undefined ? undefined : parseFloat(x);
            this.y = y === undefined ? undefined : parseFloat(y);
        }
        Pointer.prototype.equal = function (p) {
            return p ? this.x == p.x && this.y == p.y : false;
        };
        return Pointer;
    }());
    exports.Pointer = Pointer;
    exports.ElementUtility = YA.ElementUtility;
    var getStyle;
    var setStyle;
    try {
        var element_wrapper_1 = exports.ElementUtility.createElement("div");
        if (element_wrapper_1.currentStyle) {
            getStyle = exports.ElementUtility.getStyle = function (node, name) { return node.currentStyle[name]; };
        }
        else {
            getStyle = exports.ElementUtility.getStyle = function (node, name) { return getComputedStyle(node, false)[name]; };
        }
        setStyle = exports.ElementUtility.setStyle = function (node, name, value) {
            if (value === undefined || value === true) {
                for (var n in name) {
                    var convertor = exports.styleConvertors[name];
                    node.style[name] = convertor ? convertor(value) : value;
                }
            }
            else if (value === false) {
                for (var n in name) {
                    node.style[n] = name[n];
                }
            }
            else {
                var convertor = exports.styleConvertors[name];
                node.style[name] = convertor ? convertor(value) : value;
            }
            return exports.ElementUtility;
        };
        exports.ElementUtility.parse = function (domString) {
            element_wrapper_1.innerHTML = domString;
            return element_wrapper_1.childNodes;
        };
    }
    catch (ex) { }
    var emptyStringRegx = /\s+/;
    function findClassAt(clsnames, cls) {
        var at = clsnames.indexOf(cls);
        var len = cls.length;
        while (at >= 0) {
            if (at > 0) {
                var prev = clsnames[at - 1];
                if (!emptyStringRegx.test(prev)) {
                    at = clsnames.indexOf(cls, at + len);
                    continue;
                }
            }
            if ((at + len) !== clsnames.length) {
                var next = clsnames[at + length];
                if (!emptyStringRegx.test(next)) {
                    at = clsnames.indexOf(cls, at + len);
                    continue;
                }
            }
            return at;
        }
        return at;
    }
    var hasClass = exports.ElementUtility.hasClass = function (node, cls) {
        return findClassAt(node.className, cls) >= 0;
    };
    var addClass = exports.ElementUtility.addClass = function (node, cls) {
        if (!cls)
            return exports.ElementUtility;
        if (findClassAt(node.className, cls) >= 0)
            return exports.ElementUtility;
        node.className += " " + cls;
        return exports.ElementUtility;
    };
    var removeClass = exports.ElementUtility.removeClass = function (node, cls) {
        var clsnames = node.className;
        var at = findClassAt(clsnames, cls);
        if (at <= 0)
            return exports.ElementUtility;
        var prev = clsnames.substring(0, at);
        var next = clsnames.substr(at + cls.length);
        node.className = prev.replace(/(\s+$)/g, "") + " " + next.replace(/(^\s+)/g, "");
    };
    var replaceClass = exports.ElementUtility.replaceClass = function (node, old_cls, new_cls, alwaysAdd) {
        if ((old_cls === "" || old_cls === undefined || old_cls === null) && alwaysAdd)
            return addClass(node, new_cls);
        var clsnames = node.className;
        var at = findClassAt(clsnames, old_cls);
        if (at <= 0) {
            if (alwaysAdd)
                node.className = clsnames + " " + new_cls;
            return exports.ElementUtility;
        }
        var prev = clsnames.substring(0, at);
        var next = clsnames.substr(at + old_cls.length);
        node.className = prev + new_cls + next;
        return exports.ElementUtility;
    };
    var getAbs = exports.ElementUtility.getAbs = function getAbs(elem) {
        var p = elem;
        if (!p)
            new Pointer(undefined, undefined);
        var x = 0, y = 0;
        while (p) {
            x += p.offsetLeft;
            y += p.offsetTop;
            p = p.offsetParent;
        }
        return new Pointer(x, y);
    };
    function setAbs(elem, new_pos, old_pos) {
        elem.style.position = "absolute";
        if (!old_pos)
            old_pos = getAbs(elem);
        if (new_pos.x !== undefined) {
            var x = new_pos.x - old_pos.x + elem.clientLeft;
            elem.style.left = x + "px";
        }
        if (new_pos.y !== undefined) {
            var y = new_pos.y - old_pos.y + elem.clientTop;
            elem.style.top = y + "px";
        }
        return exports.ElementUtility;
    }
    exports.ElementUtility.setAbs = setAbs;
    exports.styleConvertors = {};
    var unitRegx = /(\d+(?:.\d+))(px|em|pt|in|cm|mm|pc|ch|vw|vh|\%)/g;
    exports.styleConvertors.left = exports.styleConvertors.right = exports.styleConvertors.top = exports.styleConvertors.bottom = exports.styleConvertors.width = exports.styleConvertors.height = function (value) {
        if (!value)
            return "0";
        if (typeof value === "number") {
            return value + "px";
        }
        else
            return value;
    };
    YA.attrBinders.style = function (elem, bindValue, vnode, compInstance) {
        var t = typeof bindValue;
        if (t === "string") {
            elem.style.cssText = bindValue;
        }
        if (t !== "object") {
            console.warn("给style不正确的style值，忽略", bindValue, elem, vnode, compInstance);
            return;
        }
        if (YA.Observable.isObservable(bindValue)) {
            var value = bindValue.get(YA.ObservableModes.Value);
            if (typeof value === "string") {
                elem.style.cssText = bindValue;
            }
            else {
                for (var n in value)
                    exports.ElementUtility.setStyle(elem, n, value[n]);
            }
            bindValue.subscribe(function (e) {
                var value = e.value;
                if (typeof value === "string") {
                    elem.style.cssText = bindValue;
                }
                else {
                    for (var n in value)
                        exports.ElementUtility.setStyle(elem, n, value[n]);
                }
            }, compInstance);
        }
        else {
            for (var n in bindValue)
                (function (value, name) {
                    if (YA.Observable.isObservable(value)) {
                        value.subscribe(function (e) {
                            exports.ElementUtility.setStyle(elem, name, e.value);
                        }, compInstance);
                        exports.ElementUtility.setStyle(elem, name, value.get(YA.ObservableModes.Value));
                    }
                    else {
                        exports.ElementUtility.setStyle(elem, name, value);
                    }
                })(bindValue[n], n);
        }
    };
    //////////////////////////////////////////////////////////////////////////////
    // Html控件
    //////////////////////////////////////////////////////////////////////////////
    function setElementInstance(elem, inst, token) {
        if (elem[token])
            return false;
        Object.defineProperty(elem, Mask.InstanceToken, { enumerable: false, writable: false, configurable: false, value: inst });
        return true;
    }
    var Mask = /** @class */ (function () {
        function Mask(elem) {
            if (setElementInstance(elem, this, Mask.InstanceToken)) {
                this.element = elem;
            }
            else
                throw new Error("已经有了控件实例");
        }
        Mask.prototype.mask = function (opts) {
            if (opts === false)
                return this.unmask();
            else if (opts === true) {
                opts = this;
            }
            else if (typeof opts === "string") {
                opts = { content: opts };
            }
            return this._init(opts);
        };
        Mask.prototype._init = function (opts) {
            var _this = this;
            var elem = this._sureElements();
            this.__liveCheckCount = 0;
            if (opts.css) {
                elem.className = "ya-mask " + opts.css;
                this.css = opts.css;
            }
            else
                elem.className = "ya-mask";
            var z = (parseInt(getStyle(elem, "zIndex")) || 0) + 1;
            setStyle(elem, "zIndex", z);
            exports.ElementUtility.insertBefore(elem, this.element);
            if (opts.autoCenter !== undefined)
                this.autoCenter = opts.autoCenter;
            else
                this.autoCenter = true;
            var content = opts.content;
            if (content === undefined)
                content = Mask.Message;
            this.content = content;
            this.__frontElement.innerHTML = "";
            if (exports.ElementUtility.isElement(content, true)) {
                this.__frontElement.appendChild(content);
            }
            else
                this.__frontElement.innerHTML = content;
            if (this.top)
                this.top = opts.top;
            this._keepBackend();
            this._keepFront();
            if (this.__centerTimer)
                clearInterval(this.__centerTimer);
            if (this.autoCenter)
                this.__centerTimer = setInterval(function () {
                    if (_this.__liveCheckCount === 1000) {
                        if (!exports.ElementUtility.is_inDocument(_this.element)) {
                            clearInterval(_this.__centerTimer);
                            _this.__centerTimer = 0;
                            return;
                        }
                        else
                            _this.__liveCheckCount = 0;
                    }
                    _this._keepBackend();
                    if (_this.autoCenter)
                        _this._keepFront();
                    _this.__liveCheckCount++;
                }, 50);
            return this;
        };
        Mask.prototype._sureElements = function () {
            if (this.__maskElement)
                return this.__maskElement;
            var elem = exports.ElementUtility.createElement("div");
            //elem.className = "ya-mask";
            elem.style.cssText = "box-sizing:border-box;position:absolute;padding:0;margin:0;left:0;top:0;";
            elem.innerHTML = "<div class='ya-mask-backend' style='box-sizing:border-box;position:absolute;padding:0;margin:0;'></div><div class='ya-mask-front' style='position:absolute;margin:0;box-sizing:border-box;overflow:hidden;word-break:break-all;'></div>";
            this.__backendElement = elem.firstChild;
            this.__frontElement = elem.lastChild;
            return this.__maskElement = elem;
        };
        Mask.prototype._keepBackend = function () {
            var w = this.element.offsetWidth;
            var h = this.element.offsetHeight;
            var x = this.element.offsetLeft;
            var y = this.element.offsetTop;
            setStyle(this.__maskElement, { width: w + "px", height: h + "px", left: x + "px", top: y + "px" }, false);
            setStyle(this.__backendElement, { width: w + "px", height: h + "px" }, false);
        };
        Mask.prototype._keepFront = function () {
            var fe = this.__frontElement;
            var w = this.element.offsetWidth;
            var h = this.element.offsetHeight;
            var fw = fe.offsetWidth; //;+(parseInt(getStyle(fe,"borderLeftWidth"))|0) + ;
            var fh = fe.offsetHeight;
            fw = Math.min(fw, w);
            fh = Math.min(fh, h);
            var x = (w - fw) / 2;
            var y = (this.top !== undefined ? this.top : ((h - fh) / 2));
            setStyle(this.__frontElement, {
                left: x + "px", top: y + "px", width: fw + "px", height: fh + "px"
            }, false);
        };
        Mask.prototype.unmask = function () {
            if (this.__centerTimer)
                clearInterval(this.__centerTimer);
            this.__centerTimer = 0;
            if (this.__maskElement)
                this.__maskElement.parentNode.removeChild(this.__maskElement);
            return this;
        };
        Mask.prototype.dispose = function () {
            if (this.__centerTimer)
                clearInterval(this.__centerTimer);
            this.__centerTimer = 0;
            if (this.__maskElement)
                this.__maskElement.parentNode.removeChild(this.__maskElement);
            this.__maskElement = this.__backendElement = this.__frontElement = undefined;
        };
        Mask.InstanceToken = "YA_MASK_INST";
        Mask.Message = "请等待...";
        return Mask;
    }());
    exports.Mask = Mask;
    YA.attrBinders.mask = function (elem, bindValue, vnode, compInstance) {
        if (YA.Observable.isObservable(bindValue)) {
            bindValue.subscribe(function (e) {
                mask(elem, e.value);
            }, compInstance);
            bindValue = bindValue.get();
        }
        mask(elem, bindValue);
    };
    function mask(elem, opts) {
        var inst = elem[Mask.InstanceToken];
        if (!inst)
            inst = new Mask(elem);
        return inst.mask(opts);
    }
    exports.mask = mask;
    var Component = /** @class */ (function (_super) {
        __extends(Component, _super);
        function Component() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Component.prototype.render = function (descriptor, container) {
            throw new Error("abstract method.");
        };
        return Component;
    }(YA.Component));
    exports.Component = Component;
    Object.defineProperty(Component.prototype, "mask", { enumerable: false, configurable: true,
        get: function () {
            return this.$element ? this.$elements["YA_MASK_OPTS"] : undefined;
        },
        set: function (value) {
            if (!value)
                value = false;
            this.$element["YA_MASK_OPTS"] = value;
            var inst = this.$element[Mask.InstanceToken];
            if (!inst) {
                inst = new Mask(this.$element);
                this.dispose(function () { return inst.dispose(); });
            }
            inst.mask(value);
        }
    });
    //////////////////////////////////////////////////////////////////////////////
    // Tab
    //////////////////////////////////////////////////////////////////////////////
    var TabPanel = /** @class */ (function (_super) {
        __extends(TabPanel, _super);
        function TabPanel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TabPanel.prototype.select = function (selected, onlyHideSelf) {
            if (selected === undefined)
                selected = true;
            if (selected) {
                if (this.$parent.selectedPanel == this)
                    return this;
                //隐藏原先选中的tab，但不做其他工作
                if (this.$parent.selectedPanel) {
                    this.$parent.selectedPanel.select(false, true);
                }
                addClass(this.__captionElement, "selected");
                addClass(this.__contentElement, "selected");
                this.__contentElement.style.display = "block";
                this.$parent.selectedPanel = this;
                if (!this.$parent.defaultPanel)
                    this.$parent.defaultPanel = this;
                this.selected = true;
            }
            else {
                if (this.$parent.selectedPanel !== this)
                    return this;
                removeClass(this.__captionElement, "selected");
                removeClass(this.__contentElement, "selected");
                this.__contentElement.style.display = "none";
                this.selected = false;
                if (!onlyHideSelf)
                    this.$parent.defaultPanel.select();
            }
            return this;
        };
        TabPanel.prototype.render = function (descriptor, container) {
            var _this = this;
            var selected;
            YA.observableMode(YA.ObservableModes.Value, function () {
                selected = _this.selected;
            });
            var titleElem = this.__captionElement = exports.ElementUtility.createElement("li", { "class": "ya-tab-label" }, this.$parent.__captionsElement);
            var txtElem = exports.ElementUtility.createElement("label", null, titleElem);
            var contentElement = this.__contentElement = exports.ElementUtility.createElement("div", { "class": "ya-tab-content" }, this.$parent.__contentsElement);
            contentElement.style.display = "none";
            YA.bindDomAttr(txtElem, "text", this.label, descriptor, this, function (elem, name, value, old) {
                elem.innerHTML = value;
            });
            YA.bindDomAttr(titleElem, "className", this.css, descriptor, this, function (elem, name, value, old) {
                replaceClass(elem, old, value, true);
                //replaceClass(this.__contentElement,old,value,true);
            });
            var selectedAttr = descriptor.selected;
            if (selectedAttr)
                selectedAttr.subscribe(function (e) {
                    _this.select(e.value);
                }, this);
            exports.ElementUtility.attach(titleElem, "click", function () { return _this.select(); });
            YA.bindDomAttr(contentElement, "className", this.css, descriptor, this, function (elem, name, value, old) {
                replaceClass(elem, old, value, true);
            });
            YA.createElements(descriptor.children, contentElement, this);
            var rs = [titleElem, contentElement];
            rs.$__alreadyAppendToContainer = true;
            this.selected.subscribe(function (e) {
                _this.select(e.value);
            }, this);
            if (selected)
                this.select(true);
            return rs;
        };
        __decorate([
            YA.in_parameter()
        ], TabPanel.prototype, "css", void 0);
        __decorate([
            YA.parameter()
        ], TabPanel.prototype, "label", void 0);
        __decorate([
            YA.parameter()
        ], TabPanel.prototype, "selected", void 0);
        return TabPanel;
    }(Component));
    var Tab = /** @class */ (function (_super) {
        __extends(Tab, _super);
        function Tab() {
            return _super.call(this) || this;
        }
        Tab.prototype.render = function (descriptor, container) {
            var elem;
            elem = document.createElement("div");
            elem.className = "ya-tab";
            YA.bindDomAttr(elem, "className", this.css, descriptor, this, function (elem, name, value, old) {
                replaceClass(elem, old, value, true);
            });
            this.__captionsElement = exports.ElementUtility.createElement("ul", { "class": "ya-tab-labels" }, elem);
            this.__contentsElement = exports.ElementUtility.createElement("div", { "class": "ya-tab-contents" }, elem);
            var children = descriptor.children;
            var selectedPanel;
            var _loop_1 = function (child) {
                if (child.Component !== TabPanel)
                    return "continue";
                var panel = YA.createComponent(child.Component, child, null, this_1, { returnInstance: true });
                if (!panel.name)
                    panel.name = "tab-panel-" + YA.cid();
                if (!this_1.panels)
                    this_1.panels = [];
                this_1.panels.push(panel);
                YA.observableMode(YA.ObservableModes.Value, function () {
                    if (!selectedPanel)
                        selectedPanel = panel;
                    else if (!selectedPanel.selected && panel.selected)
                        selectedPanel = panel;
                });
            };
            var this_1 = this;
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];
                _loop_1(child);
            }
            YA.observableMode(YA.ObservableModes.Value, function () {
                if (selectedPanel && !selectedPanel.selected) {
                    selectedPanel.select();
                }
            });
            return elem;
        };
        Tab.Panel = TabPanel;
        __decorate([
            YA.in_parameter()
        ], Tab.prototype, "css", void 0);
        __decorate([
            YA.parameter()
        ], Tab.prototype, "selected", void 0);
        __decorate([
            YA.in_parameter()
        ], Tab.prototype, "defaultPanelName", void 0);
        return Tab;
    }(Component));
    exports.Tab = Tab;
});
//# sourceMappingURL=YA.dom.js.map