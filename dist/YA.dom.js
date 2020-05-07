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
    var Observable = YA.Observable;
    var isObservable = YA.Observable.isObservable;
    var ObservableModes = YA.ObservableModes;
    var observableMode = YA.observableMode;
    var in_parameter = YA.in_parameter;
    var out_parameter = YA.out_parameter;
    var parameter = YA.parameter;
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
            return false;
        if (findClassAt(node.className, cls) >= 0)
            return false;
        node.className += " " + cls;
        return true;
    };
    var removeClass = exports.ElementUtility.removeClass = function (node, cls) {
        var clsnames = node.className;
        var at = findClassAt(clsnames, cls);
        if (at <= 0)
            return false;
        var prev = clsnames.substring(0, at);
        var next = clsnames.substr(at + cls.length);
        node.className = prev.replace(/(\s+$)/g, "") + " " + next.replace(/(^\s+)/g, "");
        return true;
    };
    var replaceClass = exports.ElementUtility.replaceClass = function (node, old_cls, new_cls, alwaysAdd) {
        if ((old_cls === "" || old_cls === undefined || old_cls === null) && alwaysAdd)
            return addClass(node, new_cls);
        var clsnames = node.className;
        var at = findClassAt(clsnames, old_cls);
        if (at <= 0) {
            if (alwaysAdd)
                node.className = clsnames + " " + new_cls;
            return true;
        }
        var prev = clsnames.substring(0, at);
        var next = clsnames.substr(at + old_cls.length);
        node.className = prev + new_cls + next;
        return true;
    };
    var toggleClass = exports.ElementUtility.toggleClass = function (elem, cls) {
        var at = findClassAt(elem.className, cls);
        if (at >= 0) {
            var prev = cls.substring(0, at);
            var next = cls.substr(at + cls.length);
            elem.className = prev.replace(/(\s+$)/g, "") + " " + next.replace(/(^\s+)/g, "");
            return false;
        }
        else {
            elem.className += " " + cls;
            return true;
        }
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
        if (isObservable(bindValue)) {
            var value = bindValue.get(YA.ObservableModes.Value);
            if (typeof value === "string") {
                elem.style.cssText = bindValue;
            }
            else {
                for (var n in value)
                    setStyle(elem, n, value[n]);
            }
            bindValue.subscribe(function (e) {
                var value = e.value;
                if (typeof value === "string") {
                    elem.style.cssText = bindValue;
                }
                else {
                    for (var n in value)
                        setStyle(elem, n, value[n]);
                }
            }, compInstance);
        }
        else {
            for (var n in bindValue)
                (function (value, name) {
                    if (isObservable(value)) {
                        value.subscribe(function (e) {
                            setStyle(elem, name, e.value);
                        }, compInstance);
                        setStyle(elem, name, value.get(YA.ObservableModes.Value));
                    }
                    else {
                        setStyle(elem, name, value);
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
        if (isObservable(bindValue)) {
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
    var Panel = /** @class */ (function (_super) {
        __extends(Panel, _super);
        function Panel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.label = "";
            return _this;
        }
        Panel.prototype.render = function (descriptor, elementContainer) {
            var panelContainer = this.$parent;
            var titleElem;
            var title = this.label.get(YA.ObservableModes.Value);
            if (title) {
                titleElem = this._labelElement = exports.ElementUtility.createElement("li", { "class": "ya-panel-label" });
                var txtElem = exports.ElementUtility.createElement("label", null, titleElem);
                YA.bindDomAttr(txtElem, "text", this.label, descriptor, this, function (elem, name, value, old) {
                    elem.innerHTML = value;
                });
                YA.bindDomAttr(titleElem, "className", this.css, descriptor, this, function (elem, name, value, old) {
                    replaceClass(elem, old, value, true);
                    //replaceClass(this.__contentElement,old,value,true);
                });
            }
            var contentElement = this._contentElement = exports.ElementUtility.createElement("div", { "class": "ya-panel-content" });
            YA.bindDomAttr(contentElement, "className", this.css, descriptor, this, function (elem, name, value, old) {
                replaceClass(elem, old, value, true);
            });
            YA.createElements(descriptor.children, contentElement, this);
            var mode = Observable.readMode;
            Observable.readMode = ObservableModes.Value;
            try {
                var rs = panelContainer._onPanelRendered(this);
                return rs;
            }
            finally {
                Observable.readMode = mode;
            }
        };
        __decorate([
            in_parameter()
        ], Panel.prototype, "css", void 0);
        __decorate([
            parameter()
        ], Panel.prototype, "label", void 0);
        return Panel;
    }(Component));
    exports.Panel = Panel;
    var Panels = /** @class */ (function (_super) {
        __extends(Panels, _super);
        function Panels() {
            var _this = _super.call(this) || this;
            _this._panelType = Panel;
            _this.css = "";
            Object.defineProperty(_this, "$__panels__", { enumerable: false, writable: false, configurable: false, value: [] });
            return _this;
        }
        Object.defineProperty(Panels.prototype, "panels", {
            get: function () {
                return this.$__panels__;
            },
            enumerable: true,
            configurable: true
        });
        Panels.prototype.render = function (descriptor, container) {
            var elem;
            elem = document.createElement("div");
            YA.bindDomAttr(elem, "className", this.css, descriptor, this, function (elem, name, value, old) {
                replaceClass(elem, old, value, true);
            });
            var mode = Observable.readMode;
            Observable.readMode = ObservableModes.Value;
            try {
                elem = this._onRendering(elem);
            }
            finally {
                Observable.readMode = mode;
            }
            var children = descriptor.children;
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];
                if (this._panelType && child.Component !== this._panelType)
                    continue;
                YA.createComponent(child.Component, child, elem, this, { returnInstance: true });
            }
            mode = Observable.readMode;
            Observable.readMode = ObservableModes.Value;
            try {
                elem = this._onRendered(elem);
            }
            finally {
                Observable.readMode = mode;
            }
            return elem;
        };
        Panels.prototype._onRendering = function (elem) {
            return elem;
        };
        Panels.prototype._onRendered = function (elem) {
            return elem;
        };
        Panels.prototype._onPanelRendered = function (panel) {
            if (!panel.name)
                panel.name = "panel-" + YA.cid();
            this[panel.name] = panel;
            this.panels.push(panel);
            return this.panels.$elements;
        };
        __decorate([
            in_parameter()
        ], Panels.prototype, "css", void 0);
        return Panels;
    }(Component));
    exports.Panels = Panels;
    var SelectablePanel = /** @class */ (function (_super) {
        __extends(SelectablePanel, _super);
        function SelectablePanel() {
            var _this = _super.call(this) || this;
            _this.selected = "";
            return _this;
        }
        SelectablePanel.prototype.render = function (des, container) {
            var _this = this;
            var ret = _super.prototype.render.call(this, des, container);
            var selectedAttr = this.selected;
            if (selectedAttr)
                selectedAttr.subscribe(function (e) {
                    var panels = _this.$parent;
                    e.value ? panels._onPanelSelecting(_this) : panels._onPanelUnselecting(_this);
                }, this);
            return ret;
        };
        __decorate([
            parameter()
        ], SelectablePanel.prototype, "selected", void 0);
        return SelectablePanel;
    }(Panel));
    exports.SelectablePanel = SelectablePanel;
    var SelectablePanels = /** @class */ (function (_super) {
        __extends(SelectablePanels, _super);
        function SelectablePanels() {
            var _this = _super.call(this) || this;
            _this.noselect = "";
            _this.selectAll = "";
            _this.unselectAll = "";
            _this.panelStyle = "tab";
            _this.selected = "";
            _this._panelType = SelectablePanel;
            Object.defineProperty(_this, "$__selectedPanels__", { enumerable: false, writable: false, configurable: false, value: [] });
            Object.defineProperty(_this, "$__styleName__", { enumerable: false, writable: false, configurable: false, value: [] });
            return _this;
        }
        Object.defineProperty(SelectablePanels.prototype, "allowMultiple", {
            get: function () {
                var multiple;
                var currentStyle = this.currentStyle;
                if (currentStyle) {
                    if (currentStyle.multiple !== undefined)
                        multiple = currentStyle.multiple;
                    if (multiple === true) {
                        var v = this.multiple;
                        multiple = v === "" ? true : v;
                    }
                    else
                        multiple = false;
                }
                else {
                    multiple = this.multiple;
                    if (multiple === undefined)
                        multiple = false;
                }
                return multiple;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SelectablePanels.prototype, "allowNoselect", {
            get: function () {
                var allowNoselect;
                var currentStyle = this.currentStyle;
                if (currentStyle) {
                    if (currentStyle.noselect !== undefined)
                        allowNoselect = currentStyle.noselect;
                    if (allowNoselect === true) {
                        allowNoselect = this.noselect;
                        if (allowNoselect === "")
                            allowNoselect = true;
                    }
                    else
                        allowNoselect = false;
                }
                else
                    allowNoselect = false;
                return allowNoselect;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SelectablePanels.prototype, "currentStyle", {
            get: function () {
                var name = this.panelStyle;
                if (name.get)
                    name = name.get(ObservableModes.Value);
                if (this.__currentStyle__ && this.__currentStyle__.name == name)
                    return this.__currentStyle__;
                var ctor = SelectablePanels.styles[name];
                if (!ctor)
                    return;
                this.__currentStyle__ = new ctor(this);
                this.__currentStyle__.name = name;
                return this.__currentStyle__;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SelectablePanels.prototype, "selectedPanels", {
            get: function () {
                return this["$__selectedPanels__"];
            },
            enumerable: true,
            configurable: true
        });
        SelectablePanels.prototype._onRendering = function (elem) {
            elem = _super.prototype._onRendering.call(this, elem);
            var currentStyle = this.currentStyle;
            if (currentStyle)
                elem = currentStyle._onRendering(elem);
            addClass(elem, "ya-selectable-panels");
            var mode = Observable.readMode;
            Observable.readMode = ObservableModes.Observable;
            return elem;
        };
        SelectablePanels.prototype._onRendered = function (elem) {
            var _this = this;
            _super.prototype._onRendered.call(this, elem);
            observableMode(ObservableModes.Observable, function () {
                _this.selected.subscribe(function (e) {
                    if (e.value && e.value.length) {
                        var selectedName = e.value[e.value.length - 1];
                        var panel = _this[selectedName];
                        if (panel)
                            panel.update("selected", true);
                    }
                    if (e.old && e.old.length) {
                        for (var _i = 0, _a = e.old; _i < _a.length; _i++) {
                            var old = _a[_i];
                            if (e.value && YA.array_index(e.value, old) >= 0) {
                                continue;
                            }
                            var panel = _this[old];
                            if (panel)
                                panel.update("selected", false);
                        }
                    }
                }, _this);
                _this.panelStyle.subscribe(function (e) {
                    var ctor = SelectablePanels.styles[e.value];
                    if (!ctor)
                        return;
                    var curr = _this.__currentStyle__;
                    if (curr) {
                        if (curr.name === e.value)
                            return;
                        curr._onExit(null);
                    }
                    var newStyle = new ctor(_this);
                    newStyle.name = e.value;
                    _this.__currentStyle__ = newStyle;
                    newStyle._onApply(curr);
                }, _this);
            });
            var selected = this.selected;
            if (selected) {
                for (var _i = 0, selected_1 = selected; _i < selected_1.length; _i++) {
                    var name_1 = selected_1[_i];
                    this[name_1].update("selected", true);
                }
            }
            if (!this._lastSelectedPanel && !this.allowNoselect) {
                if (!this._defaultPanel) {
                    this._defaultPanel = this.panels[0];
                }
                if (this._defaultPanel)
                    this._defaultPanel.update("selected", true);
            }
            if (this.selectAll === true) {
                var children = this.$children;
                if (children)
                    for (var _a = 0, children_2 = children; _a < children_2.length; _a++) {
                        var child = children_2[_a];
                        child.update("selected", true);
                    }
                this.unselectAll = false;
            }
            if (this.unselectAll === true) {
                var children = this.$children;
                if (children)
                    for (var _b = 0, children_3 = children; _b < children_3.length; _b++) {
                        var child = children_3[_b];
                        child.update("selected", false);
                    }
            }
            observableMode(ObservableModes.Observable, function () {
                _this.selectAll.subscribe(function (e) {
                    if (!_this.allowMultiple || !e.value)
                        return;
                    var children = _this.$children;
                    if (children)
                        for (var _i = 0, children_4 = children; _i < children_4.length; _i++) {
                            var child = children_4[_i];
                            child.update("selected", true);
                        }
                    _this.unselectAll = false;
                }, _this);
                _this.unselectAll.subscribe(function (e) {
                    if (!_this.allowNoselect || !e.value)
                        return;
                    var children = _this.$children;
                    if (children)
                        for (var _i = 0, children_5 = children; _i < children_5.length; _i++) {
                            var child = children_5[_i];
                            child.update("selected", false);
                        }
                    _this.selectAll = false;
                }, _this);
            });
            if (this.currentStyle)
                elem = this.currentStyle._onRendered(elem);
            return elem;
        };
        SelectablePanels.prototype._onPanelRendered = function (panel) {
            var rs = _super.prototype._onPanelRendered.call(this, panel);
            if (this.currentStyle)
                rs = this.currentStyle._onPanelRendered(panel);
            var isSelected = panel.selected;
            if (isSelected === "") {
                if (this.allowMultiple)
                    isSelected = true;
                else
                    isSelected = false;
            }
            if (isSelected) {
                this._onPanelSelecting(panel);
            }
            return rs;
        };
        SelectablePanels.prototype._onPanelSelecting = function (panel) {
            var selectedPanels = this.selectedPanels;
            if (!YA.array_add_unique(selectedPanels, panel))
                return;
            var isChanging = this.$__isChanging__;
            this.$__isChanging__ = true;
            var newSelects = [];
            var selects = this.selected;
            if (selects) {
                for (var _i = 0, selects_1 = selects; _i < selects_1.length; _i++) {
                    var name_2 = selects_1[_i];
                    newSelects.push(name_2);
                }
                newSelects.push(panel.name);
            }
            else {
                newSelects.push(panel.name);
            }
            this.selected = newSelects;
            if (!this.allowMultiple) {
                if (this._lastSelectedPanel && this._lastSelectedPanel.selected) {
                    this._lastSelectedPanel.update("selected", false);
                }
            }
            this._lastSelectedPanel = panel;
            if (!isChanging)
                this.update("selected");
            if (panel._labelElement)
                addClass(panel._labelElement, "selected");
            addClass(panel._contentElement, "selected");
            this.$__isChanging__ = isChanging;
            if (this.currentStyle)
                this.currentStyle._onPanelSelecting(panel);
        };
        SelectablePanels.prototype._onPanelUnselecting = function (panel) {
            if (!YA.array_remove(this.selectedPanels, panel))
                return;
            var isChanging = this.$__isChanging__;
            this.$__isChanging__ = true;
            var newSelects = [];
            var selects = this.selected;
            if (selects)
                for (var _i = 0, selects_2 = selects; _i < selects_2.length; _i++) {
                    var name_3 = selects_2[_i];
                    if (name_3 !== panel.name)
                        newSelects.push(name_3);
                }
            this.selected = newSelects;
            if (newSelects.length === 0) {
                if (!this.allowNoselect) {
                    if (!this._defaultPanel) {
                        this._defaultPanel = this.panels[0];
                    }
                    if (this._defaultPanel)
                        this._defaultPanel.update("selected", true);
                }
            }
            if (!isChanging)
                this.update("selected");
            this.$__isChanging__ = isChanging;
            if (panel._labelElement)
                removeClass(panel._labelElement, "selected");
            removeClass(panel._contentElement, "selected");
            if (this.currentStyle)
                this.currentStyle._onPanelUnselecting(panel);
        };
        SelectablePanels.styles = {};
        __decorate([
            in_parameter()
        ], SelectablePanels.prototype, "multiple", void 0);
        __decorate([
            in_parameter()
        ], SelectablePanels.prototype, "noselect", void 0);
        __decorate([
            in_parameter()
        ], SelectablePanels.prototype, "selectAll", void 0);
        __decorate([
            in_parameter()
        ], SelectablePanels.prototype, "unselectAll", void 0);
        __decorate([
            in_parameter()
        ], SelectablePanels.prototype, "panelStyle", void 0);
        __decorate([
            parameter()
        ], SelectablePanels.prototype, "selected", void 0);
        return SelectablePanels;
    }(Panels));
    exports.SelectablePanels = SelectablePanels;
    var TabStyle = /** @class */ (function () {
        function TabStyle(container) {
            this.container = container;
            this.multiple = false;
            this.noselect = false;
            this.css = "ya-tab";
        }
        TabStyle.prototype._onRendering = function (elem) {
            addClass(elem, this.css);
            this.__captionsElement = exports.ElementUtility.createElement("ul", { "class": "ya-panel-labels" }, elem);
            this.__contentsElement = exports.ElementUtility.createElement("div", { "class": "ya-panel-contents" }, elem);
            return elem;
        };
        TabStyle.prototype._onRendered = function (elem) {
            return elem;
        };
        TabStyle.prototype._onPanelRendered = function (panel) {
            this.__captionsElement.appendChild(panel._labelElement);
            this.__contentsElement.appendChild(panel._contentElement);
            var labelClicked = function () {
                panel.update("selected", true);
            };
            exports.ElementUtility.attach(panel._labelElement, "click", labelClicked);
            panel._labelElement["$__yaLabelClick__"] = labelClicked;
            panel._contentElement.style.display = "none";
            var rs = [panel._labelElement, panel._contentElement];
            rs.$__alreadyAppendToContainer = true;
            return rs;
        };
        TabStyle.prototype._onPanelSelecting = function (panel) {
            panel._contentElement.style.display = "block";
            return true;
        };
        TabStyle.prototype._onPanelUnselecting = function (panel) {
            panel._contentElement.style.display = "none";
        };
        TabStyle.prototype._onExit = function (newStyle) {
            var p = this.__captionsElement.parentNode;
            p.removeChild(this.__captionsElement);
            p.removeChild(this.__contentsElement);
            removeClass(this.container.$element, this.css);
            for (var _i = 0, _a = this.__captionsElement.childNodes; _i < _a.length; _i++) {
                var li = _a[_i];
                var labelClicked = li["$__yaLabelClick__"];
                exports.ElementUtility.detech(li, "click", labelClicked);
                li["$__yaLabelClick__"] = null;
            }
        };
        TabStyle.prototype._onApply = function (oldStyle) {
            var panels = this.container.panels;
            var parent = this.container.$element;
            parent.innerHTML = "";
            addClass(parent, this.css);
            if (!this.__captionsElement) {
                this.__captionsElement = exports.ElementUtility.createElement("ul", { "class": "ya-panel-labels" }, parent);
                this.__contentsElement = exports.ElementUtility.createElement("div", { "class": "ya-panel-contents" }, parent);
            }
            else {
                parent.appendChild(this.__captionsElement);
                parent.appendChild(this.__contentsElement);
            }
            for (var _i = 0, panels_1 = panels; _i < panels_1.length; _i++) {
                var panel = panels_1[_i];
                var elem = this._onPanelRendered(panel);
                if (!elem.$__alreadyAppendToContainer) {
                    if (YA.is_array(elem)) {
                        for (var i = 0, j = elem.length; i < j; i++)
                            parent.appendChild(elem[i]);
                    }
                    else {
                        parent.appendChild(elem);
                    }
                }
            }
            var selectedNames = this.container.selected;
            var selectedName;
            if (!selectedNames || !selectedNames.length) {
                if (this.container._defaultPanel)
                    selectedName = this.container._defaultPanel.name;
                else {
                    this.container._defaultPanel = this.container.panels[0];
                    if (this.container._defaultPanel)
                        selectedName = this.container._defaultPanel.name;
                }
            }
            else {
                selectedName = selectedNames[selectedNames.length - 1];
            }
            if (selectedName) {
                var selects = [selectedName];
                var panel = this.container[selectedName];
                if (panel)
                    panel._contentElement.style.display = "block";
                this.container.update("selected", selects);
            }
            else {
                throw new Error("没有定义panel，无法转换");
            }
        };
        return TabStyle;
    }());
    exports.TabStyle = TabStyle;
    SelectablePanels.styles["tab"] = TabStyle;
    var Tab = /** @class */ (function (_super) {
        __extends(Tab, _super);
        function Tab() {
            var _this = _super.call(this) || this;
            _this.panelStyle = "tab";
            return _this;
        }
        Tab.Panel = SelectablePanel;
        return Tab;
    }(SelectablePanels));
    exports.Tab = Tab;
    var GroupStyle = /** @class */ (function () {
        function GroupStyle(container) {
            this.container = container;
            this.multiple = true;
            this.noselect = true;
            this.css = "ya-group";
        }
        GroupStyle.prototype._onRendering = function (elem) {
            addClass(elem, this.css);
            return elem;
        };
        GroupStyle.prototype._onRendered = function (elem) {
            return elem;
        };
        GroupStyle.prototype._onPanelRendered = function (panel) {
            var elem = panel.$element = exports.ElementUtility.createElement("div", { "class": "ya-panel-item" });
            elem.appendChild(panel._labelElement);
            elem.appendChild(panel._contentElement);
            if (panel.selected === false) {
                panel._contentElement.style.display = "none";
            }
            else {
                addClass(elem, "selected");
            }
            var onclick = elem["$__panelLabelClick__"] = function () {
                panel.update("selected", !hasClass(elem, "selected"));
            };
            exports.ElementUtility.attach(panel._labelElement, "click", onclick);
            return elem;
        };
        GroupStyle.prototype._onPanelSelecting = function (panel) {
            addClass(panel.$element, "selected");
            panel._contentElement.style.display = "block";
            return true;
        };
        GroupStyle.prototype._onPanelUnselecting = function (panel) {
            removeClass(panel.$element, "selected");
            panel._contentElement.style.display = "none";
        };
        GroupStyle.prototype._onExit = function (newStyle) {
            var p = this.container.$element;
            removeClass(p, this.css);
            for (var _i = 0, _a = this.container.panels; _i < _a.length; _i++) {
                var pn = _a[_i];
                exports.ElementUtility.detech(pn._labelElement, "click", pn.$element["$__panelLabelClick__"]);
                pn.$element["$__panelLabelClick__"] = null;
            }
        };
        GroupStyle.prototype._onApply = function (oldStyle) {
            var panels = this.container.panels;
            var parent = this.container.$element;
            parent.innerHTML = "";
            addClass(parent, this.css);
            for (var _i = 0, panels_2 = panels; _i < panels_2.length; _i++) {
                var panel = panels_2[_i];
                var elem = this._onPanelRendered(panel);
                parent.appendChild(elem);
            }
        };
        return GroupStyle;
    }());
    exports.GroupStyle = GroupStyle;
    SelectablePanels.styles["group"] = GroupStyle;
    var Group = /** @class */ (function (_super) {
        __extends(Group, _super);
        function Group() {
            var _this = _super.call(this) || this;
            _this.panelStyle = "group";
            return _this;
        }
        Group.Panel = SelectablePanel;
        return Group;
    }(SelectablePanels));
    exports.Group = Group;
    var GroupPanel = /** @class */ (function (_super) {
        __extends(GroupPanel, _super);
        function GroupPanel() {
            return _super.call(this) || this;
        }
        return GroupPanel;
    }(SelectablePanel));
    exports.GroupPanel = GroupPanel;
    var Group1 = /** @class */ (function (_super) {
        __extends(Group1, _super);
        function Group1() {
            var _this = _super.call(this) || this;
            //static Panel:{new(...args:any[]):SelectablePanel}=TabPanel;
            _this.selectAll = true;
            _this.unselectAll = false;
            _this._panelType = SelectablePanel;
            _this.noselect = true;
            _this.multiple = true;
            return _this;
        }
        Group1.prototype._onRendered = function (elem) {
            var _this = this;
            if (this.selectAll === true) {
                var children = this.$children;
                if (children)
                    for (var _i = 0, children_6 = children; _i < children_6.length; _i++) {
                        var child = children_6[_i];
                        child.update("selected", true);
                    }
            }
            if (this.unselectAll === true) {
                var children = this.$children;
                if (children)
                    for (var _a = 0, children_7 = children; _a < children_7.length; _a++) {
                        var child = children_7[_a];
                        child.update("selected", false);
                    }
            }
            observableMode(ObservableModes.Observable, function () {
                _this.selectAll.subscribe(function (e) {
                    var children = _this.$children;
                    if (children)
                        for (var _i = 0, children_8 = children; _i < children_8.length; _i++) {
                            var child = children_8[_i];
                            child.update("selected", true);
                        }
                }, _this);
                _this.unselectAll.subscribe(function (e) {
                    var children = _this.$children;
                    if (children)
                        for (var _i = 0, children_9 = children; _i < children_9.length; _i++) {
                            var child = children_9[_i];
                            child.update("selected", false);
                        }
                }, _this);
            });
            return elem;
        };
        Group1.prototype._onPanelRendered = function (panel) {
            _super.prototype._onPanelRendered.call(this, panel);
            var elem = exports.ElementUtility.createElement("div", { "class": "group" });
            elem.appendChild(panel._labelElement);
            elem.appendChild(panel._contentElement);
            panel._contentElement.style.display = "none";
            exports.ElementUtility.attach(panel._labelElement, "click", function () {
                panel.update("selected", !hasClass(elem, "selected"));
            });
            return elem;
        };
        Group1.prototype._onPanelSelecting = function (panel) {
            _super.prototype._onPanelSelecting.call(this, panel);
            addClass(panel.$element, "selected");
            panel._contentElement.style.display = "block";
            return true;
        };
        Group1.prototype._onPanelUnselecting = function (panel) {
            _super.prototype._onPanelUnselecting.call(this, panel);
            removeClass(panel.$element, "selected");
            panel._contentElement.style.display = "none";
        };
        __decorate([
            in_parameter()
        ], Group1.prototype, "selectAll", void 0);
        __decorate([
            in_parameter()
        ], Group1.prototype, "unselectAll", void 0);
        return Group1;
    }(SelectablePanels));
    exports.Group1 = Group1;
});
//# sourceMappingURL=YA.dom.js.map