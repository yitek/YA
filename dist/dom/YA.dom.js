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
    var Host = YA.DomUtility;
    var Dom = /** @class */ (function () {
        function Dom(element) {
            var _this = this;
            var handleItem = function (item) {
                if (!item)
                    return;
                if (typeof item === "string") {
                    handleStr(item);
                }
                else if (item instanceof Dom) {
                    for (var i = 0, j = item.length; i < j; i++) {
                        Object.defineProperty(_this, count, { enumerable: true, writable: false, configurable: false, value: item[i] });
                        count++;
                    }
                }
                else if (Host.isElement(item, true)) {
                    Object.defineProperty(_this, count, { enumerable: true, writable: false, configurable: false, value: item });
                    count++;
                }
                else {
                    //可能是个数组
                    extract(item);
                }
            };
            var handleStr = function (str) {
                if (str[0] === "#") {
                    var elem = Host.document.getElementById(str.substr(1));
                    if (elem) {
                        Object.defineProperty(_this, count, { enumerable: true, writable: false, configurable: false, value: elem });
                        //if(!(elem as any)[Dom.token]) 
                        //    Object.defineProperty(elem,Dom.token,{enumerable:true,writable:false,configurable:false,value:this});
                        count++;
                    }
                    return;
                }
                element_wrapper.innerHTML = str;
                extract(element_wrapper.childNodes);
                element_wrapper.innerHTML = "";
            };
            var extract = function (arr) {
                for (var i = 0, j = arr.length; i < j; i++) {
                    var item = arr[i];
                    handleItem(item);
                }
            };
            var count = 0;
            if (Host.isElement(element, true)) {
                Object.defineProperty(this, 0, { enumerable: true, writable: false, configurable: false, value: element });
                count++;
            }
            else {
                handleItem(element);
            }
            Object.defineProperty(this, "length", { enumerable: true, writable: false, configurable: false, value: count });
        }
        Dom.prototype.item = function (index) {
            var elem = this[index];
            var inst = elem[Dom.dom_inst_token];
            if (!inst) {
                return new Dom(elem);
            }
            return inst;
        };
        Dom.prototype.html = function (val) {
            if (!this.length)
                return val === undefined ? undefined : this;
            if (val === undefined)
                return this[0].innerHTML;
            for (var i = 0, j = this.length; i < j; i++)
                this[i].innerHTML = val;
            return this;
        };
        Dom.prototype.text = function (val) {
            if (!this.length)
                return val === undefined ? undefined : this;
            if (val === undefined)
                return this[0].innerText;
            for (var i = 0, j = this.length; i < j; i++)
                this[i].innerText = val;
            return this;
        };
        Dom.prototype.val = function (val) {
            if (!this.length)
                return value === undefined ? undefined : this;
            if (val === undefined)
                return value.call(this, this[0]);
            for (var i = 0, j = this.length; i < j; i++)
                value.call(this, this[i], val);
            return this;
        };
        Dom.prototype.width = function (value) {
            if (!this.length)
                return value === undefined ? undefined : this;
            if (value === undefined)
                return this[0].clientWidth;
            var w = (parseFloat(value) | 0) + "px";
            for (var i = 0, j = this.length; i < j; i++)
                this[i].style.width = w;
            return this;
        };
        Dom.prototype.height = function (value) {
            if (!this.length)
                return value === undefined ? undefined : this;
            if (value === undefined)
                return this[0].clientHeight;
            var h = (parseFloat(value) | 0) + "px";
            for (var i = 0, j = this.length; i < j; i++)
                this[i].style.height = h;
            return this;
        };
        Dom.prototype.size = function (size) {
            if (!this.length)
                return size === undefined ? undefined : this;
            if (size === undefined)
                return new Size(this[0].offsetWidth, this[0].offsetHeight);
            var h = size.h === undefined ? undefined : (parseFloat(size.h) | 0) + "px";
            var w = size.w === undefined ? undefined : parseFloat(size.w) + "px";
            for (var i = 0, j = this.length; i < j; i++) {
                var elem = this[i];
                if (h !== undefined)
                    elem.style.height = h;
                if (w !== undefined)
                    elem.style.width = w;
            }
            return this;
        };
        Dom.prototype.left = function (value) {
            if (!this.length)
                return value === undefined ? undefined : this;
            if (value === undefined)
                return this[0].offsetLeft;
            var left = (parseFloat(value) | 0) + "px";
            for (var i = 0, j = this.length; i < j; i++)
                this[i].style.left = left;
            return this;
        };
        Dom.prototype.top = function (value) {
            if (!this.length)
                return value === undefined ? undefined : this;
            if (value === undefined)
                return this[0].offsetTop;
            var top = (parseFloat(value) | 0) + "px";
            for (var i = 0, j = this.length; i < j; i++)
                this[i].style.top = top;
            return this;
        };
        Dom.prototype.pos = function (pos) {
            if (!this.length)
                return pos === undefined ? undefined : this;
            if (pos === undefined)
                return new Pointer(this[0].offsetLeft, this[0].offsetTop);
            var x = pos.x === undefined ? undefined : (parseFloat(pos.x) | 0) + "px";
            var y = pos.y === undefined ? undefined : (parseFloat(pos.y) | 0) + "px";
            for (var i = 0, j = this.length; i < j; i++) {
                if (x !== undefined) {
                    this[i].style.left = x;
                }
                if (y !== undefined) {
                    this[i].style.top = y;
                }
            }
            return this;
        };
        Dom.prototype.abs = function (new_pos) {
            if (!this.length)
                return new_pos === undefined ? {} : this;
            if (new_pos === undefined) {
                var p = this[0];
                if (!p)
                    new Pointer(undefined, undefined);
                var x = 0, y = 0;
                while (p) {
                    x += p.offsetLeft;
                    y += p.offsetTop;
                    p = p.offsetParent;
                }
                return new Pointer(x, y);
            }
            for (var i = 0, j = this.length; i < j; i++) {
                this[i].style.position = "absolute";
                var old_pos = this.item(i).abs();
                if (new_pos.x !== undefined) {
                    var x = new_pos.x - old_pos.x + this[i].clientLeft;
                    this[i].style.left = x + "px";
                }
                if (new_pos.y !== undefined) {
                    var y = new_pos.y - old_pos.y + this[i].clientTop;
                    this[i].style.top = y + "px";
                }
            }
            return this;
        };
        Dom.prototype.x = function (value) {
            if (!this.length)
                return value === undefined ? undefined : this;
            if (value === undefined)
                return this.abs().x;
            var x = parseFloat(value);
            var pos = new Pointer(x, undefined);
            for (var i = 0, j = this.length; i < j; i++)
                this.abs(pos);
            return this;
        };
        Dom.prototype.y = function (value) {
            if (!this.length)
                return value === undefined ? undefined : this;
            if (value === undefined)
                return this.abs().x;
            var y = parseFloat(value);
            var pos = new Pointer(undefined, y);
            for (var i = 0, j = this.length; i < j; i++)
                this.abs(pos);
            return this;
        };
        Dom.prototype.prop = function (name, value, replace) {
            if (value === undefined) {
                if (typeof name === "string") {
                    return this.length ? this[0][name] : undefined;
                }
                else {
                    for (var i = 0, j = this.length; i < j; i++) {
                        var elem = this[i];
                        for (var n in name)
                            elem[n] = name[n];
                    }
                    return this;
                }
            }
            else {
                if (this.length)
                    for (var i = 0, j = this.length; i < j; i++) {
                        var elem = this[i];
                        elem[name] = replace ? replace.call(elem, value, elem[name], elem) : value;
                    }
                return this;
            }
        };
        Dom.prototype.attr = function (name, value) {
            if (value === undefined) {
                if (typeof name === "string") {
                    return this.length ? this[0].getAttribute(name) : undefined;
                }
                else {
                    for (var i = 0, j = this.length; i < j; i++)
                        for (var n in name)
                            this[i].setAttribute(n, name[n]);
                    return this;
                }
            }
            else {
                if (this.length) {
                    if (value === null)
                        for (var i = 0, j = this.length; i < j; i++)
                            this[i].removeAttribute(name);
                    else
                        for (var i = 0, j = this.length; i < j; i++)
                            this[i].setAttribute(name, value);
                }
                return this;
            }
        };
        Dom.prototype.style = function (name, value) {
            if (value === undefined) {
                if (typeof name === "string") {
                    return this.length ? exports.style(this[0], name) : undefined;
                }
                else {
                    for (var i = 0, j = this.length; i < j; i++)
                        for (var n in name)
                            exports.style(this[i], n, name[n]);
                    return this;
                }
            }
            else {
                if (this.length) {
                    for (var i = 0, j = this.length; i < j; i++)
                        exports.style(this[i], name, value);
                }
                return this;
            }
        };
        Dom.prototype.hasClass = function (cls) {
            return this.length ? findClassAt(this[0].className, cls) >= 0 : false;
        };
        Dom.prototype.addClass = function (cls) {
            for (var i = 0, j = this.length; i < j; i++) {
                if (findClassAt(this[i].className, cls) >= 0)
                    return this;
                this[i].className += " " + cls;
            }
            return this;
        };
        Dom.prototype.removeClass = function (cls) {
            for (var i = 0, j = this.length; i < j; i++) {
                var clsnames = this[i].className;
                var at = findClassAt(clsnames, cls);
                if (at <= 0)
                    return this;
                var prev = clsnames.substring(0, at);
                var next = clsnames.substr(at + cls.length);
                this[i].className = prev.replace(/(\s+$)/g, "") + " " + next.replace(/(^\s+)/g, "");
            }
            return this;
        };
        Dom.prototype.replaceClass = function (old_cls, new_cls, alwaysAdd) {
            if ((old_cls === "" || old_cls === undefined || old_cls === null) && alwaysAdd)
                return this.addClass(new_cls);
            for (var i = 0, j = this.length; i < j; i++) {
                var clsnames = this[i].className;
                var at = findClassAt(clsnames, old_cls);
                if (at <= 0) {
                    if (alwaysAdd)
                        this[0].className = clsnames + " " + new_cls;
                    return this;
                }
                var prev = clsnames.substring(0, at);
                var next = clsnames.substr(at + old_cls.length);
                this[i].className = prev + new_cls + next;
            }
            return this;
        };
        Dom.prototype.on = function (eventId, listener) {
            for (var i = 0, j = this.length; i < j; i++)
                attach(this[i], eventId, listener);
            return this;
        };
        Dom.prototype.off = function (eventId, listener) {
            for (var i = 0, j = this.length; i < j; i++)
                detech(this[i], eventId, listener);
            return this;
        };
        Dom.prototype.ydata = function (name, value) {
            throw new Error("Called on placehold method");
        };
        Dom.prototype.prev = function (inserted) {
            throw new Error("Called on placehold method");
        };
        Dom.prototype.next = function (inserted) {
            throw new Error("Called on placehold method");
        };
        Dom.prototype.first = function (inserted) {
            throw new Error("Called on placehold method");
        };
        Dom.prototype.last = function (inserted) {
            throw new Error("Called on placehold method");
        };
        Dom.prototype.parent = function (inserted) {
            throw new Error("Called on placehold method");
        };
        Dom.prototype.append = function (inserted) {
            throw new Error("Called on placehold method");
        };
        Dom.prototype.remove = function () {
            for (var i = 0, j = this.length; i < j; i++) {
                var elem = this[i];
                if (elem.parentNode)
                    elem.parentNode.removeChild(elem);
            }
            return this;
        };
        Dom.prototype.children = function () {
            var elem = this[0];
            if (elem.hasChildNodes)
                return new Dom(elem.childNodes);
            else
                return new Dom();
        };
        Dom.prototype.each = function (callback) {
            for (var i = 0, j = this.length; i < j; i++) {
                if (callback(dom(this[i]), i) === false)
                    return this;
            }
            return this;
        };
        Dom.prop = function (prop_name, getter, setter) {
            Dom.prototype[prop_name] = function (value) {
                if (!this.length)
                    return value === undefined ? undefined : this;
                if (value === undefined)
                    return getter.call(this, this[0]);
                for (var i = 0, j = this.length; i < j; i++) {
                    var elem = this[i];
                    setter.call(this, elem, value);
                }
                return this;
            };
            return Dom;
        };
        Dom.object = function (object_name, getter, setter) {
            Dom.prototype[object_name] = function (name, value) {
                if (!this.length)
                    return value === undefined ? undefined : this;
                if (value === undefined) {
                    if (typeof name === "string")
                        return getter.call(this, this[0], name);
                    for (var n in name) {
                        var val = name[n];
                        for (var i = 0, j = this.length; i < j; i++) {
                            var elem = this[i];
                            setter.call(this, elem, name, val);
                        }
                    }
                    return this;
                }
                for (var i = 0, j = this.length; i < j; i++) {
                    var elem = this[i];
                    setter.call(this, elem, name, value);
                }
                return this;
            };
            return Dom;
        };
        Dom.op = function (op_name, method) {
            Dom.prototype[op_name] = function (arg1, arg2, arg3, arg4) {
                for (var i = 0, j = this.length; i < j; i++) {
                    var dom_1 = this[i];
                    dom_1[op_name].call(dom_1, arg1, arg2, arg3, arg4);
                }
                return this;
            };
            return Dom;
        };
        Dom.element = function (name, getter, setter) {
            Dom.prototype[name] = function (inserted) {
                if (inserted === undefined)
                    return getter ? new Dom(getter.call(this, this[0])) : this;
                if (inserted === true || inserted === false)
                    return getter ? new Dom(getter.call(this, this[0], inserted)) : this;
                if (Host.isElement(inserted)) {
                    setter.call(this, this[0], inserted);
                    return this;
                }
                if (typeof inserted === "string") {
                    inserted = dom(inserted);
                }
                if (inserted instanceof Dom) {
                    for (var i = 0, j = this.length; i < j; i++) {
                        var self_1 = this[i];
                        for (var m = 0, n = inserted.length; m < n; m++) {
                            setter.call(this, self_1, inserted[m]);
                        }
                    }
                    return this;
                }
                console.warn("Dom." + name + "不支持该参数，未做任何操作:", inserted);
                return this;
            };
            return Dom;
        };
        Dom.define = function (name, fn) {
            Dom.prototype[name] = fn;
            return Dom;
        };
        Dom.dom_inst_token = "_YADOM_INSTANCE";
        Dom.dom_data_token = "_YADATA";
        return Dom;
    }());
    exports.Dom = Dom;
    function value(elem, value) {
        if (elem.$_YA_valAccessorFn)
            return elem.$_YA_valAccessorFn;
        var tag = elem.tagName;
        var fn;
        if (tag === "INPUT") {
            var type = elem.type;
            if (type === "radio") {
                fn = radioValFn;
            }
            else if (type === "checkbox") {
                fn = checkboxValFn;
            }
            else {
                fn = valFn;
            }
        }
        else if (tag === "SELECT") {
            fn = selectValFn;
        }
        else if (tag === "TEXTAREA") {
            fn = valFn;
        }
        else {
            fn = txtValFn;
        }
        Object.defineProperty(elem, "$_YA_valAccessorFn", {
            enumerable: false, writable: false, configurable: false, value: fn
        });
        return fn.call(this, elem, value);
    }
    function valFn(elem, value) {
        if (value === undefined)
            return elem.value;
        elem.value = value;
        return this;
    }
    function radioValFn(elem, value) {
        if (value === undefined) {
            return elem.checked ? elem.value : null;
        }
        if (value === elem.value) {
            elem.checked = true;
            elem.setAttribute("checked", "checked");
        }
        else {
            elem.checked = false;
            elem.removeAttribute("checked");
        }
        return this;
    }
    function checkboxValFn(elem, value) {
        if (value === undefined) {
            return elem.checked ? elem.value : null;
        }
        if (value === elem.value || YA.array_index(value, elem.value)) {
            elem.checked = true;
            elem.setAttribute("checked", "checked");
        }
        else {
            elem.checked = false;
            elem.removeAttribute("checked");
        }
        return this;
    }
    function selectValFn(elem, value) {
        var isMulti = elem.multiple;
        var opts = elem.options;
        if (value === undefined) {
            if (isMulti) {
                var rs = [];
                for (var _i = 0, opts_1 = opts; _i < opts_1.length; _i++) {
                    var opt = opts_1[_i];
                    if (opt.selected)
                        rs.push(opt.value);
                }
                return rs;
            }
            else {
                var index = this[0].selectedIndex;
                var selectedOpt = this[0].options[index];
                return selectedOpt ? selectedOpt.value : undefined;
            }
        }
        var selectedIndex = -1;
        for (var idx in opts) {
            var opt = opts[idx];
            if (opt.value == value || (isMulti && YA.array_index(value, opt.value))) {
                opt.selected = true;
                opt.setAttribute("selected", "selected");
                selectedIndex = idx;
            }
            else {
                opt.selected = false;
                opt.removeAttribute("selected");
            }
        }
        if (!isMulti)
            elem.selectedIndex = selectedIndex;
        return this;
    }
    function txtValFn(value) {
        if (value === undefined)
            return this[0].nodeValue;
        this[0].nodeValue = value;
        return this;
    }
    Dom.element("prev", function (target, onlyElement) { return (onlyElement ? target.previousElementSibling : target.previousSibling); }, function (target, opEl) { return target.parentNode ? target.parentNode.insertBefore(opEl, target) : undefined; });
    Dom.element("next", function (target, onlyElement) { return (onlyElement ? target.nextElementSibling : target.nextSibling); }, function (target, opEl) {
        if (target.parentNode)
            target.nextSibling ? target.parentNode.insertBefore(opEl, target.nextSibling) : target.parentNode.appendChild(opEl);
    });
    Dom.element("first", function (target, onlyElement) { return (onlyElement ? target.firstElementChild : target.firstChild); }, function (target, opEl) { return target.firstChild ? target.insertBefore(opEl, target.firstChild) : target.appendChild(opEl); });
    Dom.element("last", function (target, onlyElement) { return (onlyElement ? target.lastElementChild : target.lastChild); }, function (target, opEl) { return target.appendChild(opEl); });
    Dom.element("parent", function (target, onlyElement) { return (target.parentNode); }, function (target, opEl) { return opEl.appendChild(target); });
    Dom.object("ydata", function (elem, name) {
        var data = elem[Dom.dom_data_token];
        if (!data)
            return undefined;
        return data[name];
    }, function (elem, name, value) {
        var data = elem[Dom.dom_data_token];
        if (!data)
            Object.defineProperty(elem, Dom.dom_data_token, { enumerable: false, writable: false, configurable: false, value: data = {} });
        data[name] = value;
        return this;
    });
    Dom.element("append", null, function (target, opEl) { return target.appendChild(opEl); });
    var element_wrapper = YA.DomUtility.document.createElement("div");
    var attach;
    var detech;
    if (element_wrapper.addEventListener) {
        attach = function (elem, eventId, listener) { elem.addEventListener(eventId, listener, false); return this; };
        detech = function (elem, eventId, listener) { elem.removeEventListener(eventId, listener, false); return this; };
    }
    else if (element_wrapper.attachEvent) {
        attach = function (elem, eventId, listener) { elem.attachEvent('on' + eventId, listener); return this; };
        detech = function (elem, eventId, listener) { elem.detechEvent('on' + eventId, listener); return this; };
    }
    if (element_wrapper.currentStyle) {
        exports.style = function (obj, attr, value) {
            if (value === undefined)
                return obj.currentStyle[attr];
            var convertor = styleConvertors[attr];
            obj.style[attr] = convertor ? convertor(value) : value;
        };
    }
    else {
        exports.style = function (obj, attr, value) {
            if (value === undefined) {
                var f = false;
                return getComputedStyle(obj, f)[attr];
            }
            var convertor = styleConvertors[attr];
            obj.style[attr] = convertor ? convertor(value) : value;
        };
    }
    var styleConvertors = YA.styleConvertors;
    if (!styleConvertors)
        styleConvertors = YA.styleConvertors = {};
    function dom(element) {
        if (element instanceof Dom)
            return element;
        return new Dom(element);
    }
    exports.dom = dom;
    var emptyStringRegx = /\s+/g;
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
    styleConvertors.left = styleConvertors.right = styleConvertors.top = styleConvertors.bottom
        = styleConvertors.width = styleConvertors.height = function (val) {
            if (val && val.substr)
                return val;
            else
                parseFloat(val) + "px";
        };
    YA.attrBinders["b-value"] = function (elem, bindValue, component, vnode) {
        var dm = dom(elem);
        if (bindValue instanceof YA.ObservableSchema) {
            var ob = bindValue.getFromRoot(component);
            dm.val(ob.get(YA.ObservableModes.Value));
            ob.subscribe("", function (e) { return dm.val(e.value); }, component);
        }
        else {
            dm.val(bindValue);
        }
    };
    YA.attrBinders["value"] = function (elem, bindValue, component, vnode) {
        var dm = dom(elem);
        if (bindValue instanceof YA.ObservableSchema) {
            var ob = bindValue.getFromRoot(component);
            dm.val(ob.get());
        }
        else {
            dm.val(bindValue);
        }
    };
    var Maskable = /** @class */ (function () {
        function Maskable(target) {
            this.target = dom(target);
            var inst = this.target.ydata(Maskable.dom_inst_token);
            if (inst)
                inst.unmask();
            this.target.ydata(Maskable.dom_inst_token, this);
            var dm = this.dom = dom("<div style=\"position:absolute;margin:0;padding:0;\" class=\"ya-mask\">\n    <div class=\"ya-mask-backend\" style=\"position:absolute;margin:0;padding:0;left:0,top:0,width:100%;overflow:hidden\"></div>\n    <div class=\"ya-mask-front\" style=\"position:absolute;margin:0;overflow:auto;\"></div>\n</div>");
            this.frontDom = dm.last(true);
            this.bgDom = dm.first(true);
        }
        Maskable.prototype.mask = function (opts) {
            var _this = this;
            if (opts === undefined || opts === null)
                (opts = this.opts);
            if (opts === false || (opts && opts.off))
                return this.unmask();
            if (typeof opts === "string") {
                opts = { content: opts };
            }
            opts = YA.extend({}, this.opts, opts);
            if (this.adjust) {
                dom(Host.window).off("resize", this.adjust);
            }
            if (this.tick) {
                clearInterval(this.tick);
                this.tick = 0;
            }
            this.frontDom.html("");
            if (opts.css)
                this.dom.replaceClass(this.opts ? this.opts.css : undefined, opts.css, true);
            this.frontDom.append(dom(opts.content || ""));
            this.target.prev(this.dom);
            this.adjust = function () {
                var size = _this.adjustBackend();
                _this.adjustFront(size, opts.keep);
            };
            this.adjust();
            this._userSelectValue = this.target.style("userSelect");
            this.target.style("userSelect", "none");
            this._onselectHandler = this.target.prop("onselectstart");
            var zIndex = parseInt(this.target.style("zIndex")) || 0;
            this.dom.style("zIndex", zIndex);
            this.bgDom.style("zIndex", ++zIndex);
            this.frontDom.style("zIndex", ++zIndex);
            this.tick = setInterval(this.adjust, 80);
            dom(Host.window).on("resize", this.adjust);
            return this;
        };
        Maskable.prototype.unmask = function () {
            if (this.adjust) {
                dom(Host.window).off("resize", this.adjust);
            }
            if (this.tick) {
                clearInterval(this.tick);
                this.tick = 0;
            }
            this.target.style("userSelect", this._userSelectValue);
            this.target.prop("onselectstart", this._onselectHandler);
            this.dom.remove();
            return this;
        };
        Maskable.prototype.adjustFront = function (size, keep) {
            var fSize = this.frontDom.size();
            if (fSize.equal(size))
                return;
            if (fSize.w > size.w)
                fSize.w = size.w;
            if (fSize.h > size.h)
                fSize.h = size.h;
            var x = (size.w - fSize.w) / 2;
            var fpos;
            if (!keep || keep === "center") {
                fpos = new Pointer(x, (size.h - fSize.h) / 2);
            }
            else {
                var y = void 0;
                if (fSize.h != size.h) {
                    var t = typeof keep;
                    if (t === "string") {
                        var pct = YA.is_percent(keep);
                        if (pct !== undefined) {
                            y = size.h * pct;
                        }
                        else
                            y = parseFloat(keep);
                    }
                    else if (t === "number") {
                        y = keep;
                    }
                    else
                        y = 0;
                    if (y + fSize.h > size.h)
                        y = 0;
                }
                else {
                    y = 0;
                }
                fpos = new Pointer(x, y);
            }
            this.frontDom.size(fSize);
            this.frontDom.pos(fpos);
        };
        Maskable.prototype.adjustBackend = function () {
            var size = this.target.size();
            this.dom.size(size);
            this.bgDom.size(size);
            var tpos = this.target.pos();
            this.dom.pos(tpos);
            return size;
        };
        Maskable.dom_inst_token = "_YA_MASKABLE_INSTANCE";
        return Maskable;
    }());
    exports.Maskable = Maskable;
    function mask(target, opts) {
        var inst = target[Maskable.dom_inst_token];
        if (!inst) {
            if (opts === false)
                return;
            inst = target[Maskable.dom_inst_token] = new Maskable(target);
        }
        inst.mask(opts);
    }
    exports.mask = mask;
    Dom.define("mask", function (opts) {
        for (var i = 0, j = this.length; i < j; i++) {
            mask(this[i], opts);
        }
    });
    YA.attrBinders.mask = function (elem, bindValue, component, vnode) {
        if (bindValue instanceof YA.ObservableSchema) {
            var ob = bindValue.getFromRoot(component);
            var val = ob.$get(YA.ObservableModes.Value);
            mask(elem, val);
            ob.$subscribe("", function (e) {
                mask(elem, e.value);
            }, component);
        }
        else {
            mask(elem, bindValue);
        }
    };
    var Dragable = /** @class */ (function () {
        function Dragable(target) {
            var _this = this;
            this.target = dom(target);
            if (this.target.ydata(Dragable.dom_inst_token))
                throw new Error("已经在上面创建了Dragable实例");
            this.cid = YA.new_cid();
            this.target.ydata(Dragable.dom_inst_token, this);
            var mvStart = this._moveStart;
            this._moveStart = function (evt) { return mvStart.call(_this, evt); };
        }
        Dragable.prototype.enable = function (handle) {
            var _this = this;
            var _a;
            if (handle === false) {
                (_a = this.handle) === null || _a === void 0 ? void 0 : _a.off("mousedown", this._moveStart);
                if (this._positionValue !== undefined)
                    this.target.style("position", this._positionValue);
                return this;
            }
            if (!this.handle) {
                this.handle = (handle instanceof Dom) ? handle : Host.isElement(handle) ? dom(handle) : this.target;
            }
            this.handle.on("mousedown", function (evt) { return _this._moveStart(evt); });
            return this;
        };
        Dragable.prototype._moveStart = function (evt) {
            var _this = this;
            var x = evt.clientX;
            var y = evt.clientY;
            this._targetPos = this.target.pos();
            this._msPos = new Pointer(x, y);
            this._positionValue = this.target.style("position");
            var doc = Host.document;
            var msk = dom("<div style='position:absolute;top:0;height:0;background-color:#fff;z-index:999999999;opacity:0.1;user-select:none;margin:0;padding:0;' onselectstart=\"return false;\"></div>")
                .width(Math.max(doc.body.offsetWidth, doc.documentElement.offsetWidth))
                .height(Math.max(doc.body.offsetHeight, doc.documentElement.offsetHeight))
                .parent(doc.body)
                .on("mousemove", function (evt) { return _this._moving(evt); })
                .on("mouseup", function (evt) {
                _this._moving(evt);
                msk.remove();
                msk = undefined;
                return cancelEvent(evt);
            }).on("mouseout", function (evt) {
                _this._moving(evt);
                msk.remove();
                msk = undefined;
            });
            return cancelEvent(evt);
        };
        Dragable.prototype._moving = function (evt) {
            var x = evt.clientX;
            var y = evt.clientY;
            var dx = x - this._msPos.x;
            var dy = y - this._msPos.y;
            this.target.left(this._targetPos.x += dx);
            this.target.top(this._targetPos.y += dy);
            this._msPos.x = x;
            this._msPos.y = y;
            return cancelEvent(evt);
        };
        Dragable.dom_inst_token = "YA_MOVEABLE_INSTANCE";
        return Dragable;
    }());
    exports.Dragable = Dragable;
    Dom.define("dragable", function (handle) {
        this.each(function (item) {
            var _a;
            var inst = (_a = item.ydata(Dragable.dom_inst_token)) === null || _a === void 0 ? void 0 : _a.enable(false);
        });
        if (handle !== false) {
            if (typeof handle === "function") {
                this.each(function (item) {
                    var inst = item.ydata(Dragable.dom_inst_token);
                    if (!inst)
                        inst = new Dragable(item);
                    inst.enable(handle.call(item, item[0]));
                });
            }
            else {
                this.each(function (item) {
                    var inst = item.ydata(Dragable.dom_inst_token);
                    if (!inst)
                        inst = new Dragable(item);
                    inst.enable(handle);
                });
            }
        }
        return this;
    });
    var MessageBox = /** @class */ (function (_super) {
        __extends(MessageBox, _super);
        function MessageBox(opts) {
            var _this = _super.call(this, function (resolve) {
                _this._resolve = resolve;
            }) || this;
            _this.opts = opts;
            var adjBk = _this._adjacentBackend;
            _this._adjacentBackend = function () { return adjBk.call(_this); };
            return _this;
        }
        MessageBox.prototype.open = function () {
            var _this = this;
            var view = document.compatMode === "CSS1Compat" ? Host.document.documentElement : Host.document.body;
            this.box = dom("<div class=\"ya-messageBox " + (this.opts.css ? this.opts.css : "") + "\" style=\"position:fixed;top:0;left:0;widht:" + view.clientWidth + "px;height:" + view.clientHeight + "px;overflow:hidden;z-index:99999990;\">\n<div class=\"ya-messageBox-backend\" style=\"position:fixed;top:0;left:0;width:" + view.clientWidth + "px;height:" + view.clientHeight + "px;overflow:hidden;z-index:99999991;\"></div>\n<div class=\"ya-messageBox-front\" style=\"position:fixed;overflow:hidden;z-index:99999992;margin:0;padding:0;\">\n    <div class='ya-messageBox-head' style='position:relative;user-select:none;' onselectstart=\"return false;\"><a class=\"ya-messageBox-closer\" style=\"position:absolute;right:0;top:0;z-index:99999993;\">X</a><div class='ya-messageBox-title'>&nbsp;" + (this.opts.title || "消息") + "</div></div>\n    <div class=\"ya-messageBox-body\">" + this.opts.content + "</div>\n    <div class=\"ya-messageBox-foot\"></div>\n</div>\n</div>");
            this.box.parent(Host.document.body);
            this.backend = this.box.first(true);
            this.front = this.box.last(true);
            this.head = this.front.first(true);
            this.body = this.head.next(true);
            this.foot = this.front.last(true);
            this.caption = this.head.last(true);
            this.closer = this.head.first(true)
                .on("mousedown", function (e) { return cancelEvent(e); })
                .on("click", function () { return _this.close("close"); });
            var btns = this.opts.btns || [{ text: "确定", value: "comfirm" }, { text: "取消", value: "cancel" }];
            for (var _i = 0, btns_1 = btns; _i < btns_1.length; _i++) {
                var btnInfo = btns_1[_i];
                (function (btnInfo) {
                    if (!btnInfo)
                        return;
                    var btn = dom("<a href=\"#\">" + (btnInfo.text || btnInfo) + "</a>")
                        .on("click", function (evt) {
                        _this.close(btnInfo.value || btnInfo);
                        return cancelEvent(evt);
                    })
                        .parent(_this.foot);
                })(btnInfo);
            }
            this._center();
            if (this.opts.dragable) {
                this.front.dragable(this.caption);
                this.caption.style("cursor", "move");
            }
            dom(window).on("resize", this._adjacentBackend);
            return this;
        };
        MessageBox.prototype.close = function (reason) {
            this.box.remove();
            dom(window).off("resize", this._adjacentBackend);
            this._resolve(reason);
            return this;
        };
        MessageBox.prototype._center = function () {
            var view = document.compatMode === "CSS1Compat" ? Host.document.documentElement : Host.document.body;
            this.front.left((view.clientWidth - this.front.width()) / 2).top((view.clientHeight - this.front.height()) / 2);
        };
        MessageBox.prototype._adjacentBackend = function () {
            var view = document.compatMode === "CSS1Compat" ? Host.document.documentElement : Host.document.body;
            var sz = dom(view).size();
            this.backend.size(sz);
        };
        return MessageBox;
    }(YA.Promise));
    exports.MessageBox = MessageBox;
    function messageBox(msg) {
        return new MessageBox((typeof msg === "string" ? { content: msg, dragable: true } : msg)).open();
    }
    exports.messageBox = messageBox;
    var Button = /** @class */ (function () {
        function Button() {
            this.onclick = null;
            this.text = "";
            this.confirm = undefined;
            this.className = undefined;
        }
        Button.prototype.render = function (p) {
            return YA.virtualNode("button", { class: "", onclick: this._onclick }, this.text);
        };
        Button.prototype._onclick = function (evt) {
            if (this._comfirmed || !this.confirm) {
                this._comfirmed = false;
                if (this.onclick) {
                    this.onclick(evt);
                }
            }
            else {
            }
            return cancelEvent(evt);
        };
        __decorate([
            YA.reactive(YA.ReactiveTypes.In)
        ], Button.prototype, "text", void 0);
        __decorate([
            YA.reactive(YA.ReactiveTypes.In)
        ], Button.prototype, "confirm", void 0);
        __decorate([
            YA.reactive(YA.ReactiveTypes.In)
        ], Button.prototype, "className", void 0);
        Button = __decorate([
            YA.component("Button", false)
        ], Button);
        return Button;
    }());
    exports.Button = Button;
    function cancelEvent(evt) {
        evt || (evt === event);
        if (evt.preventDefault)
            evt.preventDefault();
        if (evt.stopPropagation)
            evt.stopPropagation();
        evt.cancelBubble = true;
        evt.returnValue = false;
        return false;
    }
    exports.cancelEvent = cancelEvent;
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
});
//# sourceMappingURL=YA.dom.js.map