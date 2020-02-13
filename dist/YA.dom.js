"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var YA = require("YA.core");
var Host = YA.Host;
var Dom = /** @class */ (function () {
    function Dom(element) {
        var _this = this;
        this.element = element;
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
                handleStr(item);
            }
        };
        var count = 0;
        if (Host.isElement(element, true)) {
            Object.defineProperty(this, 0, { enumerable: true, writable: false, configurable: false, value: element });
        }
        else {
            handleItem(element);
        }
        Object.defineProperty(this, "length", { enumerable: true, writable: false, configurable: false, value: count });
    }
    Dom.prototype.item = function (index) {
        var elem = this[index];
        var inst = elem[Dom.token];
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
            return { w: this[0].clientWidth, h: this[0].clientHeight };
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
        var x = pos.x === undefined ? undefined : (parseFloat(pos.x) | 0) + "px";
        var y = pos.y === undefined ? undefined : (parseFloat(pos.y) | 0) + "px";
        for (var i = 0, j = this.length; i < j; i++) {
            if (x !== undefined) {
                this[i].style.left = x + "px";
            }
            if (y !== undefined) {
                this[i].style.top = y + "px";
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
    Dom.prototype.prop = function (name, value) {
        if (value === undefined) {
            if (typeof name === "string") {
                return this.length ? this[0][name] : undefined;
            }
            else {
                for (var i = 0, j = this.length; i < j; i++)
                    for (var n in name)
                        this[i][n] = name[n];
                return this;
            }
        }
        else {
            if (this.length)
                for (var i = 0, j = this.length; i < j; i++)
                    this[i][name] = value;
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
    Dom.token = "$_YADOMINST";
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
    return fn.call(this, value);
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
Dom.element("before", function (target) { return target.previousSibling; }, function (target, opEl) { return target.parentNode ? target.parentNode.insertBefore(opEl, target) : undefined; });
Dom.element("after", function (target) { return target.nextSibling; }, function (target, opEl) {
    if (target.parentNode)
        target.nextSibling ? target.parentNode.insertBefore(opEl, target.nextSibling) : target.parentNode.appendChild(opEl);
});
Dom.element("first", function (target) { return target.firstChild; }, function (target, opEl) { return target.firstChild ? target.insertBefore(opEl, target.firstChild) : target.appendChild(opEl); });
Dom.element("last", function (target) { return target.lastChild; }, function (target, opEl) { return target.appendChild(opEl); });
Dom.element("append", null, function (target, opEl) { return target.appendChild(opEl); });
var element_wrapper = YA.Host.document.createElement("div");
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
    return new Dom(dom);
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
var Mask = /** @class */ (function () {
    function Mask(target) {
        this.target = dom(target);
        this.target.prop(Mask.token, this);
        var dm = this.dom = dom("<div style=\"position:absolute;margin:0;padding:0;\" class=\"mask\">\n    <div class=\"mask-backend\" style=\"position:absolute;margin:0;padding:0;left:0,top:0,width:100%;overflow:hidden\"></div>\n    <div class=\"mask-front\" style=\"position:absolute;margin:0;padding:0;overflow:auto;\"></div>\n</div>");
        this.frontDom = dm.last();
        this.bgDom = dm.first();
    }
    Mask.prototype.mask = function (opts) {
        var _this = this;
        if (opts === undefined || opts === null)
            (opts = this.opts);
        if (opts === false || (opts && opts.off))
            this.unmask();
        if (!opts) {
            opts = this.opts;
            if (!opts)
                opts = this.opts = {
                    content: ""
                };
        }
        if (this.adjust) {
            dom(Host.window).off("resize", this.adjust);
        }
        if (this.tick) {
            clearInterval(this.tick);
            this.tick = 0;
        }
        this.frontDom.html("");
        this.target.prev(this.dom);
        if (opts.css)
            this.dom.addClass(opts.css);
        this.frontDom.append(dom(opts.content || ""));
        this.adjust = function () {
            var size = _this.adjustBackend();
            _this.adjustFront(size, opts.keep);
        };
        this.adjust();
        this.tick = setInterval(this.adjust, 80);
        dom(Host.window).on("resize", this.adjust);
        //Host.insertBefore(this.target.parentNode,this.maskElement,this.target);
    };
    Mask.prototype.unmask = function () {
        if (this.adjust) {
            dom(Host.window).off("resize", this.adjust);
        }
        if (this.tick) {
            clearInterval(this.tick);
            this.tick = 0;
        }
        this.dom.remove();
    };
    Mask.prototype.adjustFront = function (size, keep) {
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
                    var pct = YA.percent(keep);
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
    Mask.prototype.adjustBackend = function () {
        var size = this.target.size();
        this.dom.size(size);
        this.bgDom.size(size);
        var tpos = this.target.pos();
        this.dom.pos(tpos);
        return size;
    };
    Mask.token = "$_YA_Mask";
    return Mask;
}());
exports.Mask = Mask;
function mask(target, opts) {
    var inst = target[Mask.token];
    if (!inst) {
        if (opts === false)
            return;
        inst = target[Mask.token] = new Mask(target);
    }
    inst.mask(opts);
}
exports.mask = mask;
Dom.define("mask", function (opts) {
    for (var i = 0, j = this.length; i < j; i++) {
        mask(this[i], opts);
    }
});
//v-huiwan@microsoft.com
YA.attrBinders.mask = function (elem, bindValue, component, vnode) {
    if (bindValue instanceof YA.ObservableSchema) {
        var ob = bindValue.$getFromRoot(component);
        var val = ob.$get();
        mask(elem, val);
        ob.$subscribe(function (e) {
            mask(elem, e.value);
        });
    }
    else {
        mask(elem, bindValue);
    }
};
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
//# sourceMappingURL=YA.dom.js.map