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
    var Panel = /** @class */ (function (_super) {
        __extends(Panel, _super);
        function Panel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Panel.prototype.select = function (selected, onlyHideSelf) {
            var container = this.$parent;
            if (container._selectPanelChanging(this, container.lastSelectedPanel, selected === undefined ? true : selected, onlyHideSelf) === false)
                return this;
            return this;
        };
        Panel.prototype.render = function (descriptor, elementContainer) {
            var _this = this;
            var selected;
            var panelContainer = this.$parent;
            var className = (panelContainer.className || "panelContainer");
            YA.observableMode(YA.ObservableModes.Value, function () {
                selected = _this.selected;
            });
            var titleElem = this._labelElement = exports.ElementUtility.createElement("li", { "class": className + "-label" });
            var txtElem = exports.ElementUtility.createElement("label", null, titleElem);
            var contentElement = this._contentElement = exports.ElementUtility.createElement("div", { "class": className + "-content" });
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
            this.selected.subscribe(function (e) {
                _this.select(e.value);
            }, this);
            var rs = panelContainer._panelCreated(this, titleElem, contentElement);
            if (selected)
                this.select(true);
            return rs;
        };
        __decorate([
            YA.in_parameter()
        ], Panel.prototype, "css", void 0);
        __decorate([
            YA.parameter()
        ], Panel.prototype, "label", void 0);
        __decorate([
            YA.parameter()
        ], Panel.prototype, "selected", void 0);
        return Panel;
    }(Component));
    var PanelContainer = /** @class */ (function (_super) {
        __extends(PanelContainer, _super);
        function PanelContainer() {
            var _this = _super.call(this) || this;
            _this.selectedPanels = [];
            _this.css = "";
            return _this;
        }
        PanelContainer.prototype.render = function (descriptor, container) {
            var elem;
            var className = this.className = this.className || "panelContainer";
            elem = document.createElement("div");
            elem.className = className;
            YA.bindDomAttr(elem, "className", this.css, descriptor, this, function (elem, name, value, old) {
                replaceClass(elem, old, value, true);
            });
            this._elementCreated(elem);
            var children = descriptor.children;
            var selectedPanels = [];
            var _loop_1 = function (child) {
                if (this_1._panelType && child.Component !== this_1._panelType)
                    return "continue";
                var panel = YA.createComponent(child.Component, child, null, this_1, { returnInstance: true });
                if (!panel.name)
                    panel.name = className + "-" + YA.cid();
                if (!this_1.panels)
                    this_1.panels = [];
                this_1.panels.push(panel);
                YA.observableMode(YA.ObservableModes.Value, function () {
                    if (panel.selected)
                        selectedPanels.push(panel);
                });
            };
            var this_1 = this;
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];
                _loop_1(child);
            }
            this._rendered(selectedPanels);
            return elem;
        };
        /**
         * 容器div已经创建，主要负责构建容器内部结构
         *
         * @param {IElement} elem
         * @memberof PanelContainer
         */
        PanelContainer.prototype._elementCreated = function (elem) { };
        /**
         * 主要负责把Panel装到正确的容器element中
         *
         * @param {Panel} panel
         * @memberof PanelContainer
         */
        PanelContainer.prototype._panelCreated = function (panel, titleElem, cotnentElem) {
        };
        PanelContainer.prototype._rendered = function (selectedPanels) {
        };
        PanelContainer.prototype._selectPanelChanging = function (panel, lastSelectedPanel, selected, onlyUnselect) {
            return true;
        };
        PanelContainer.Panel = Panel;
        __decorate([
            YA.out_parameter()
        ], PanelContainer.prototype, "selectedPanels", void 0);
        __decorate([
            YA.in_parameter()
        ], PanelContainer.prototype, "css", void 0);
        __decorate([
            YA.parameter()
        ], PanelContainer.prototype, "selected", void 0);
        __decorate([
            YA.in_parameter()
        ], PanelContainer.prototype, "defaultPanelName", void 0);
        return PanelContainer;
    }(Component));
    exports.PanelContainer = PanelContainer;
    var Tab = /** @class */ (function (_super) {
        __extends(Tab, _super);
        function Tab() {
            return _super.call(this) || this;
        }
        /**
         * 容器div已经创建，主要负责构建容器内部结构
         *
         * @param {IElement} elem
         * @memberof PanelContainer
         */
        Tab.prototype._elementCreated = function (elem) {
            this.__captionsElement = exports.ElementUtility.createElement("ul", { "class": "ya-tab-labels" }, elem);
            this.__contentsElement = exports.ElementUtility.createElement("div", { "class": "ya-tab-contents" }, elem);
        };
        /**
         * 主要负责把Panel装到正确的容器element中
         *
         * @param {Panel} panel
         * @memberof PanelContainer
         */
        Tab.prototype._panelCreated = function (panel, labelElem, contentElem) {
            this.__captionsElement.appendChild(labelElem);
            this.__contentsElement.appendChild(contentElem);
            contentElem.style.display = "none";
            var rs = [labelElem, contentElem];
            rs.$__alreadyAppendToContainer = true;
            return rs;
        };
        Tab.prototype._rendered = function (selectedPanels) {
            debugger;
            if (selectedPanels.length) {
                selectedPanels[selectedPanels.length - 1].select(true);
            }
            else {
                if (this.panels.length) {
                    this.panels[0].select(true);
                }
            }
        };
        /**
         * 主要负责panel的elemeent的操作，panel自身的状态已经处于selected
         *
         * @param {Panel} panel
         * @param {Panel} lastSelectedPanel
         * @memberof PanelContainer
         */
        Tab.prototype._selectPanelChanging = function (panel, lastSelectedPanel, selected, onlyUselect) {
            if (selected === undefined)
                selected = true;
            if (selected) {
                if (panel === lastSelectedPanel)
                    return false;
                //隐藏原先选中的tab，但不做其他工作
                if (lastSelectedPanel) {
                    lastSelectedPanel.select(false, true);
                }
                addClass(panel._labelElement, "selected");
                addClass(panel._contentElement, "selected");
                this.lastSelectedPanel = panel;
                if (!this.defaultPanel)
                    this.defaultPanel = panel;
                panel._contentElement.style.display = "block";
                panel.selected = true;
                this.selectedPanels = [panel.name];
            }
            else {
                if (this.lastSelectedPanel !== panel)
                    return false;
                removeClass(panel._labelElement, "selected");
                removeClass(panel._contentElement, "selected");
                panel.selected = false;
                panel._contentElement.style.display = "none";
                if (!onlyUselect)
                    this.$parent.defaultPanel.select();
            }
            return true;
        };
        Tab.Panel = Panel;
        return Tab;
    }(PanelContainer));
    exports.Tab = Tab;
    Tab.prototype.className = "ya-tab";
    var Groups = /** @class */ (function (_super) {
        __extends(Groups, _super);
        function Groups() {
            var _this = _super.call(this) || this;
            _this.multiple = true;
            _this.expanded = true;
            _this.collapsed = false;
            return _this;
        }
        /**
         * 主要负责把Panel装到正确的容器element中
         *
         * @param {Panel} panel
         * @memberof PanelContainer
         */
        Groups.prototype._panelCreated = function (panel, labelElem, contentElem) {
            var panelElem = exports.ElementUtility.createElement("div", { "class": this.className + "-" + "panel" });
            panelElem.appendChild(labelElem);
            panelElem.appendChild(contentElem);
            return panelElem;
        };
        Groups.prototype._rendered = function (selectedPanels) {
            var _this = this;
            YA.observableMode(YA.ObservableModes.Value, function () {
                if (_this.expanded) {
                    for (var _i = 0, _a = _this.panels; _i < _a.length; _i++) {
                        var pn = _a[_i];
                        pn.select(true);
                    }
                }
                else if (_this.collapsed) {
                    for (var _b = 0, _c = _this.panels; _b < _c.length; _b++) {
                        var pn = _c[_b];
                        pn.select(false);
                    }
                }
                else {
                    for (var _d = 0, selectedPanels_1 = selectedPanels; _d < selectedPanels_1.length; _d++) {
                        var pn = selectedPanels_1[_d];
                        pn.select(true);
                    }
                }
            });
        };
        Groups.prototype._selectedPanelChanging = function (panel, oldPanel, selected) {
            var _this = this;
            var elem = panel.$element;
            if (selected === false) {
                if (removeClass(elem, "selected")) {
                    var panels = this.selectedPanels;
                    if (panels) {
                        for (var i = 0, j = panels.length; i < j; i++) {
                            var p = panels.shift();
                            if (p !== panel.name)
                                panels.push(p);
                        }
                    }
                    this.selectedPanels = panels;
                }
                return true;
            }
            YA.observableMode(YA.ObservableModes.Value, function () {
                if (toggleClass(elem, "selected")) {
                    var panels = _this.selectedPanels;
                    if (panels)
                        panels.push(panel.name);
                    else
                        panels = [panel.name];
                    _this.selectedPanels = panels;
                    if (!_this.multiple) {
                        oldPanel.select(false);
                    }
                }
                else {
                    var panels = _this.selectedPanels;
                    if (panels) {
                        for (var i = 0, j = panels.length; i < j; i++) {
                            var p = panels.shift();
                            if (p !== panel.name)
                                panels.push(p);
                        }
                    }
                    _this.selectedPanels = panels;
                }
            });
            return true;
        };
        Groups.Panel = Panel;
        __decorate([
            YA.parameter()
        ], Groups.prototype, "multiple", void 0);
        __decorate([
            YA.in_parameter()
        ], Groups.prototype, "expanded", void 0);
        __decorate([
            YA.in_parameter()
        ], Groups.prototype, "collapsed", void 0);
        return Groups;
    }(PanelContainer));
    exports.Groups = Groups;
});
//# sourceMappingURL=YA.dom.js.map