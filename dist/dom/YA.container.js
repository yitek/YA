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
        define(["require", "exports", "../YA.core", "YA.dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var YA = require("../YA.core");
    var Dom = require("YA.dom");
    var Observable = YA.Observable;
    var isObservable = YA.Observable.isObservable;
    var ObservableModes = YA.ObservableModes;
    var observableMode = YA.observableMode;
    var in_parameter = YA.in_parameter;
    var out_parameter = YA.out_parameter;
    var parameter = YA.parameter;
    var Component = Dom.Component;
    var ElementUtility = Dom.ElementUtility;
    var hasClass = ElementUtility.hasClass;
    var replaceClass = ElementUtility.replaceClass;
    var addClass = ElementUtility.addClass;
    var removeClass = ElementUtility.removeClass;
    var Panel = /** @class */ (function (_super) {
        __extends(Panel, _super);
        function Panel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.text = "";
            return _this;
        }
        Panel.prototype.render = function (descriptor, elementContainer) {
            var panelContainer = this.$parent;
            var titleElem;
            var title = this.text.get(YA.ObservableModes.Value);
            if (title) {
                titleElem = this._labelElement = ElementUtility.createElement("li", { "class": "ya-panel-label" });
                var txtElem = ElementUtility.createElement("label", null, titleElem);
                YA.bindDomAttr(txtElem, "text", this.text, descriptor, this, function (elem, name, value, old) {
                    elem.innerHTML = value;
                });
            }
            var contentElement = this._contentElement = ElementUtility.createElement("div", { "class": "ya-panel-content" });
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
            parameter()
        ], Panel.prototype, "text", void 0);
        __decorate([
            parameter()
        ], Panel.prototype, "width", void 0);
        __decorate([
            parameter()
        ], Panel.prototype, "height", void 0);
        return Panel;
    }(Component));
    exports.Panel = Panel;
    var Container = /** @class */ (function (_super) {
        __extends(Container, _super);
        function Container() {
            var _this = _super.call(this) || this;
            _this._panelType = Panel;
            Object.defineProperty(_this, "$__panels__", { enumerable: false, writable: false, configurable: false, value: [] });
            return _this;
        }
        Object.defineProperty(Container.prototype, "panels", {
            get: function () {
                return this.$__panels__;
            },
            enumerable: true,
            configurable: true
        });
        Container.prototype.render = function (descriptor, container) {
            var elem;
            elem = document.createElement("div");
            elem.className = "ya-container";
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
        Container.prototype._onRendering = function (elem) {
            return elem;
        };
        Container.prototype._onRendered = function (elem) {
            return elem;
        };
        Container.prototype._onPanelRendered = function (panel) {
            if (!panel.name)
                panel.name = "panel-" + YA.cid();
            this[panel.name] = panel;
            this.panels.push(panel);
            return this.panels.$elements;
        };
        return Container;
    }(Panel));
    exports.Container = Container;
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
            _this.multiple = "";
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
                    var mode = Observable.writeMode;
                    Observable.writeMode = ObservableModes.Raw;
                    try {
                        _this.unselectAll = false;
                    }
                    finally {
                        Observable.writeMode = mode;
                    }
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
                    var mode = Observable.writeMode;
                    Observable.writeMode = ObservableModes.Raw;
                    try {
                        _this.selectAll = false;
                    }
                    finally {
                        Observable.writeMode = mode;
                    }
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
            if (panel._labelElement)
                addClass(panel._labelElement, "selected");
            addClass(panel._contentElement, "selected");
            if (!isChanging)
                this.update("selected");
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
    }(Container));
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
            this.__captionsElement = ElementUtility.createElement("ul", { "class": "ya-container-labels" }, elem);
            this.__contentsElement = ElementUtility.createElement("div", { "class": "ya-container-contents" }, elem);
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
            ElementUtility.attach(panel._labelElement, "click", labelClicked);
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
                ElementUtility.detech(li, "click", labelClicked);
                li["$__yaLabelClick__"] = null;
            }
        };
        TabStyle.prototype._onApply = function (oldStyle) {
            var panels = this.container.panels;
            var parent = this.container.$element;
            parent.innerHTML = "";
            addClass(parent, this.css);
            if (!this.__captionsElement) {
                this.__captionsElement = ElementUtility.createElement("ul", { "class": "ya-panel-labels" }, parent);
                this.__contentsElement = ElementUtility.createElement("div", { "class": "ya-container-contents" }, parent);
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
            var elem = panel.$element = ElementUtility.createElement("div", { "class": "ya-container-panel" });
            elem.appendChild(panel._labelElement);
            var wrapper = ElementUtility.createElement("div", { "class": "ya-container-contents" }, elem);
            wrapper.appendChild(panel._contentElement);
            if (panel.selected === false) {
                panel._contentElement.style.display = "none";
            }
            else {
                addClass(elem, "selected");
            }
            var onclick = elem["$__panelLabelClick__"] = function () {
                panel.update("selected", !hasClass(elem, "selected"));
            };
            ElementUtility.attach(panel._labelElement, "click", onclick);
            return elem;
        };
        GroupStyle.prototype._onPanelSelecting = function (panel) {
            addClass(panel.$element, "selected");
            //panel._contentElement.style.display="block";
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
                ElementUtility.detech(pn._labelElement, "click", pn.$element["$__panelLabelClick__"]);
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
});
//# sourceMappingURL=YA.container.js.map