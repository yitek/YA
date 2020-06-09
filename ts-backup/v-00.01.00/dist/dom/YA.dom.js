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
        define(["require", "exports", "../YA.core"], factory);
    }
})(function (require, exports) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    var YA = require("../YA.core");
    var Observable = YA.Observable;
    var isObservable = YA.Observable.isObservable;
    var ObservableModes = YA.ObservableModes;
    var observableMode = YA.observableMode;
    var in_parameter = YA.in_parameter;
    var out_parameter = YA.out_parameter;
    var parameter = YA.parameter;
    try {
        if (typeof Promise !== "function")
            window.Promise = YA.Promise;
    }
    catch (ex) {
        window.Promise = YA.Promise;
    }
    var HttpRequest = /** @class */ (function (_super) {
        __extends(HttpRequest, _super);
        function HttpRequest(opts) {
            var _this = _super.call(this, function (resolve, reject) {
                var xhr = _this.xhr;
                xhr.open(_this.method, _this.url, _this.opts.async !== false);
                var responseType = _this.responseType;
                xhr.responseType = responseType === "xml" ? "" : (responseType === "response" ? "" : responseType);
                var reqHeaders = _this.headers;
                xhr.onreadystatechange = function () {
                    //准备状态改变触发
                    if (xhr.readyState == 4) {
                        if (xhr.status !== 200) {
                            reject("http error:" + xhr.status);
                            return;
                        }
                        else {
                            var result = void 0;
                            try {
                                result = new HttpResponse(xhr, _this);
                            }
                            catch (ex) {
                                return reject(ex);
                            }
                            resolve(result.data);
                        }
                    }
                };
                xhr.onerror = reject;
            }) || this;
            _this.opts = opts;
            return _this;
        }
        HttpRequest.optsToken = "AJAX_OPTS";
        return HttpRequest;
    }(Promise));
    YA.defineSingleonProperty(HttpRequest.prototype, {
        "method": function (self) { return self.opts.method ? self.opts.method.toUpperCase() : "GET"; },
        "type": function (self) { return self.opts.type || "url-encoding"; },
        "url": function (self) {
            var url = self.opts.url;
            if (url === undefined)
                url = window.location.href;
            var method = self.method;
            if (method === "GET" || method === "DELETE" || method === "OPTIONS") {
                if (url.indexOf("?") < 0) {
                    url += "?";
                    url += _this.data;
                }
                else {
                    url += "&" + _this.data;
                }
                if (self.opts.nocache !== false)
                    url += "&__=" + Math.random();
            }
            return url;
        },
        "data": function (self) {
            var data = self.opts.data;
            var type = self.type;
            if (type === "blob")
                return data === undefined ? null : data;
            var t = typeof data;
            if (type === "json") {
                if (t === "string")
                    return data;
                else
                    return JSON.stringify(data);
            }
            else {
                var str = "";
                if (t === "object") {
                    for (var n in data) {
                        if (str)
                            str += "&";
                        str += encodeURIComponent(n);
                        str += "=";
                        str += encodeURIComponent(data[n]);
                    }
                    return str;
                }
                return data === null || data === undefined ? "" : data.toString();
            }
        },
        "xhr": function (self) {
            var xhr = null;
            if (window.XMLHttpRequest) { //判断当前浏览器是否支持XMLHttpRequest
                xhr = new XMLHttpRequest();
            }
            else if (window.XMLHttpRequest) { //判断当前浏览器是否支持XMLHttpRequest，这是对于IE浏览器的判断
                try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP"); //IE6及以后的版本支持的
                }
                catch (e) {
                    try {
                        xhr = new ActiveXObject('Microsoft.XMLHTTP'); //IE6以下版本的支持
                    }
                    catch (e) { }
                }
            }
            return xhr;
        },
        "headers": function (self) {
            var optsHeaders = self.opts.headers;
            var headers = {};
            for (var n in optsHeaders) {
                var value = optsHeaders[n];
                headers[n] = value;
                self.xhr.setRequestHeader(n, value);
            }
            return headers;
        },
        "responseType": function (self) { return self.opts.responseType || "text"; }
    });
    var HttpResponse = /** @class */ (function () {
        function HttpResponse(xhr, request) {
            this.xhr = xhr;
            this.request = request;
            this.status = xhr.status;
            if (this.status !== 200) {
            }
            var responseType = request.responseType;
            if (responseType === "json") {
                this.data = JSON.parse(xhr.responseText);
            }
            else if (responseType === "blob" || responseType == "arraybuffer") {
                this.data = xhr.response;
            }
            else if (responseType === "xml") {
                this.data = xhr.responseXML;
            }
            else if (responseType === "response") {
                this.data = this;
            }
            else if (responseType)
                this.data = xhr.responseText;
        }
        HttpResponse.prototype.header = function (name) {
            return this.xhr.getResponseHeader(name);
        };
        return HttpResponse;
    }());
    exports.HttpResponse = HttpResponse;
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
    exports.ElementUtility.htmlEncode = function (text) {
        if (text === undefined || text === null)
            return "";
        text = text.toString();
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br />").replace(/ /g, "&nbsp;").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
    };
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
                var next = clsnames[at + len];
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
        if (cls === undefined || cls === null || cls === "" || !(cls = YA.trim(cls)))
            return false;
        if (findClassAt(node.className, cls) >= 0)
            return false;
        node.className += " " + cls;
        return true;
    };
    var removeClass = exports.ElementUtility.removeClass = function (node, cls) {
        if (cls === undefined || cls === null || cls === "" || !(cls = YA.trim(cls)))
            return false;
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
    var show = exports.ElementUtility.show = function (elem, immeditately) {
        var value = elem.$__displayValue__;
        if (!value || value == "none")
            value = "";
        elem.style.display = value;
        return exports.ElementUtility;
    };
    var hide = exports.ElementUtility.hide = function (elem, immeditately) {
        var old = getStyle(elem, "display");
        if (old && old !== "none")
            elem.$__displayValue__ = old;
        elem.style.display = "none";
        return exports.ElementUtility;
    };
    var restoredDisplay = function (elem, visible) {
        var curr = getStyle(elem, "display");
        var store = elem.$__storedDisplay__;
        if (visible === false) {
            if (store !== undefined) {
                elem.style.display = store;
                elem.$__storedDisplay__ = undefined;
            }
            else {
                elem.style.display = "none";
                elem.$__storedDisplay__ = curr;
            }
        }
        else {
            if (store !== undefined) {
                elem.style.display = store;
                elem.$__storedDisplay__ = undefined;
            }
            else {
                elem.style.display = "";
                elem.$__storedDisplay__ = curr;
            }
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
    exports.styleConvertors.left = exports.styleConvertors.right = exports.styleConvertors.top = exports.styleConvertors.bottom = exports.styleConvertors.width = exports.styleConvertors.height = exports.styleConvertors.minWidth = exports.styleConvertors.maxWidth = exports.styleConvertors.maxWidth = exports.styleConvertors.maxHeight = function (value) {
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
    YA.attrBinders.css = function (elem, bindValue, vnode, compInstance) {
        var addCss = function (elem, value) {
            if (typeof value === "string") {
                if (elem.className)
                    elem.className += " ";
                elem.className += YA.trim(value);
            }
            else {
                if (!value.join) {
                    console.warn("给class绑定的对象必须是string或array", value, compInstance);
                    return;
                }
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var cssValue = value_1[_i];
                    if (YA.is_array(cssValue))
                        addCss(elem, cssValue);
                    else {
                        if (elem.className)
                            elem.className += " ";
                        elem.className += YA.trim(cssValue);
                    }
                }
            }
        };
        var removeCss = function (elem, value) {
            if (typeof value === "string") {
                removeClass(elem, value);
            }
            else {
                if (!value.join) {
                    console.warn("给class绑定的对象必须是string或array", value, compInstance);
                    return;
                }
                for (var _i = 0, value_2 = value; _i < value_2.length; _i++) {
                    var cssValue = value_2[_i];
                    if (YA.is_array(cssValue))
                        removeCss(elem, cssValue);
                    else {
                        removeClass(elem, cssValue);
                    }
                }
            }
        };
        var t = typeof bindValue;
        if (t === "string") {
            elem.className = bindValue;
        }
        if (YA.is_array(bindValue)) {
            for (var _i = 0, bindValue_1 = bindValue; _i < bindValue_1.length; _i++) {
                var css = bindValue_1[_i];
                (function (value) {
                    var cssText = bindValue;
                    if (isObservable(value)) {
                        value.subscribe(function (e) {
                            if (e.old)
                                removeCss(elem, e.old);
                            addCss(elem, e.value);
                        }, compInstance);
                        cssText = value.get(ObservableModes.Value);
                    }
                    addCss(elem, cssText);
                })(css);
            }
            return;
        }
        if (isObservable(bindValue)) {
            var value = bindValue.get(YA.ObservableModes.Value);
            addCss(elem, value);
            bindValue.subscribe(function (e) {
                removeCss(elem, e.old);
                addCss(elem, e.value);
            }, compInstance);
        }
        console.warn("css属性不支持的数据类型", bindValue);
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
        Component.prototype.request = function (opts, url, data) {
            if (this.$parent)
                return this.$parent.request(opts, url, data);
            if (url !== undefined) {
                opts = { method: opts, url: url, data: data };
            }
            return new HttpRequest(opts);
        };
        Component.initElement = function (elem, attrs, ownComponent) {
            var css = attrs["css"];
            if (css !== undefined) {
                YA.bindDomAttr(elem, "className", css, attrs, ownComponent, function (elem, name, value, old) {
                    replaceClass(elem, old, value, true);
                });
            }
            for (var styleName in stylenames) {
                var value = attrs[styleName];
                if (value !== undefined) {
                    initStyleProp(elem, styleName, value, ownComponent);
                }
            }
        };
        __decorate([
            in_parameter()
        ], Component.prototype, "css", void 0);
        __decorate([
            in_parameter()
        ], Component.prototype, "width", void 0);
        __decorate([
            in_parameter()
        ], Component.prototype, "minWidth", void 0);
        __decorate([
            in_parameter()
        ], Component.prototype, "maxWidth", void 0);
        __decorate([
            in_parameter()
        ], Component.prototype, "height", void 0);
        __decorate([
            in_parameter()
        ], Component.prototype, "minHeight", void 0);
        __decorate([
            in_parameter()
        ], Component.prototype, "maxHeight", void 0);
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
    var stylenames = ["width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight"];
    function initStyleProp(elem, name, value, ownComponent) {
        if (YA.Observable.isObservable(value)) {
            value.subscribe(function (e) {
                setStyle(elem, name, e.value);
            }, ownComponent);
            value = value.get(ObservableModes.Value);
            if (value !== undefined && value !== "")
                setStyle(elem, name, value);
        }
    }
    var popContainer;
    var pageElement;
    function initDom() {
        popContainer = document.createElement("div");
        popContainer.className = "ya-pop-layer";
        popContainer.style.cssText = "position:absolute;left:0;top:0;z-index:999999;background-color:transparent";
        pageElement = document.compatMode == "CSS1Compat" ? document.documentElement : document.body;
        exports.ElementUtility.attach(window, "resize", function () {
            if (popContainer && popContainer.parentNode) {
                popContainer.style.width = pageElement.offsetWidth + "px";
                popContainer.style.height = pageElement.offsetHeight + "px";
            }
        });
    }
    initDom();
    function addPopElement(elem, onRemove) {
        if (!popContainer.parentNode) {
            document.body.appendChild(popContainer);
        }
        popContainer.style.width = pageElement.offsetWidth + "px";
        popContainer.style.height = pageElement.offsetHeight + "px";
        popContainer.appendChild(elem);
        if (onRemove !== false) {
            var handler = elem.$__popElementRemoveHandler__ = function () {
                if (removePopElement(elem)) {
                    if (typeof onRemove === "function")
                        onRemove(elem);
                }
            };
            exports.ElementUtility.attach(popContainer, "click", handler);
        }
    }
    function removePopElement(elem) {
        if (elem.parentNode === popContainer) {
            popContainer.removeChild(elem);
            if (elem.$__popElementRemoveHandler__)
                exports.ElementUtility.detech(popContainer, "click", elem.$__popElementRemoveHandler__);
            if (popContainer.childNodes.length === 0)
                document.body.removeChild(popContainer);
            return true;
        }
        return false;
    }
    var Dropdownable = /** @class */ (function () {
        function Dropdownable(target, opts) {
            this.target = target;
            this.opts = opts;
            Object.defineProperty(target, Dropdownable.token, { enumerable: false, writable: false, configurable: false, value: this });
            var self = this;
            var show = this.show;
            var hide = this.hide;
            var toggle = this.toggle;
            this.show = function () { return show.call(self); };
            this.hide = function () { return hide.call(self); };
            this.toggle = function () { return toggle.call(self); };
            exports.ElementUtility.attach(target, "focus", this.show);
            exports.ElementUtility.attach(target, "blur", this.hide);
            exports.ElementUtility.attach(target, "click", this.toggle);
        }
        Dropdownable.prototype.show = function () {
            var _this = this;
            if (this.$__isShow__)
                return this;
            if (!this.target.parentNode)
                return this;
            if (!this.element)
                this.element = this._initElement();
            addPopElement(this.element, function () { return _this.$__isShow__ = false; });
            this._setPosition();
            this.$__isShow__ = true;
            return this;
        };
        Dropdownable.prototype.hide = function () {
            removePopElement(this.element);
            this.$__isShow__ = false;
            return this;
        };
        Dropdownable.prototype.toggle = function () {
            if (this.$__isShow__)
                this.hide();
            else
                this.show();
            //this.show();
            return this;
        };
        Dropdownable.prototype._initElement = function () {
            var elem = this.element = document.createElement("div");
            elem.className = "dropdown";
            elem.style.cssText = "position:absolute;overflow:auto;";
            var content = this.opts.content;
            if (!exports.ElementUtility.isElement(content)) {
                var ct = typeof content;
                if (ct === "function")
                    content = YA.createComponent(content, null, elem, this.ownComponent);
                else if (YA.is_array(content)) {
                }
                else {
                    content = YA.createDescriptor(content, elem, this.ownComponent);
                }
            }
            else
                elem.appendChild(content);
            content.style.display = "block";
            return elem;
        };
        Dropdownable.prototype._setPosition = function () {
            var targetAbs = getAbs(this.target);
            var size = new Size(this.target.clientWidth, this.target.clientHeight);
            var loc = this.opts.location || "vertical";
            var fn = this["_" + loc];
            if (!fn)
                fn = this._auto;
            fn.call(this, targetAbs, size);
        };
        Dropdownable.prototype._bottom = function (pos, size) {
            this.element.style.top = pos.y + size.h + "px";
            if (this.element.clientWidth < size.w) {
                this.element.style.left = pos.x + "px";
                return;
            }
            var bodyRight = pageElement.scrollLeft + pageElement.clientWidth;
            if (bodyRight < pos.x + this.element.clientWidth) {
                //右边空间不够，向左展开
                this.element.style.left = pos.x + size.w - this.element.clientWidth + "px";
            }
            else {
                this.element.style.left = pos.x + "px";
            }
        };
        Dropdownable.prototype._top = function (pos, size) {
            this.element.style.top = pos.y - this.element.clientHeight + "px";
            if (this.element.clientWidth < size.w) {
                this.element.style.left = pos.x + "px";
                return;
            }
            var bodyRight = pageElement.scrollLeft + pageElement.clientWidth;
            if (bodyRight < pos.x + this.element.clientWidth) {
                //右边空间不够，向左展开
                this.element.style.left = pos.x + size.w - this.element.clientWidth + "px";
            }
            else {
                this.element.style.left = pos.x + "px";
            }
        };
        Dropdownable.prototype._left = function (pos, size) {
            this.element.style.left = pos.x - this.element.clientWidth + "px";
            if (this.element.clientHeight < size.h) {
                this.element.style.top = pos.y + "px";
                return;
            }
            var bodyBottom = pageElement.scrollTop + pageElement.clientHeight;
            if (bodyBottom < pos.y + this.element.clientHeight) {
                //下面空间不够，向上展开
                this.element.style.top = pos.y + size.h - this.element.clientWidth + "px";
            }
            else {
                this.element.style.top = pos.y + "px";
            }
        };
        Dropdownable.prototype._right = function (pos, size) {
            this.element.style.left = pos.x + size.w + "px";
            if (this.element.clientHeight < size.h) {
                this.element.style.top = pos.y + "px";
                return;
            }
            var bodyBottom = pageElement.scrollTop + pageElement.clientHeight;
            if (bodyBottom < pos.y + this.element.clientHeight) {
                //下面空间不够，向上展开
                this.element.style.top = pos.y + size.h - this.element.clientWidth + "px";
            }
            else {
                this.element.style.top = pos.y + "px";
            }
        };
        Dropdownable.prototype._horizen = function (pos, size) {
            var bodyBottom = pageElement.scrollTop + pageElement.clientHeight;
            var bodyRight = pageElement.scrollLeft + pageElement.clientWidth;
            var x, y;
            if (pos.x + size.w + this.element.clientWidth > bodyRight) {
                x = pos.x - this.element.clientWidth;
            }
            else
                x = pos.x + size.w;
            if (x < 0)
                x = 0;
            if (pos.y + this.element.clientHeight > bodyBottom) {
                y = pos.y + size.h - this.element.clientHeight;
            }
            else
                y = pos.y;
            if (y < 0)
                y = 0;
            this.element.style.left = x + "px";
            this.element.style.top = y + "px";
        };
        Dropdownable.prototype._vertical = function (pos, size) {
            var bodyBottom = pageElement.scrollTop + pageElement.clientHeight;
            var bodyRight = pageElement.scrollLeft + pageElement.clientWidth;
            var x, y;
            if (pos.y + size.h + this.element.clientHeight > bodyBottom) {
                y = pos.y - this.element.clientHeight;
            }
            else
                y = pos.y + size.h;
            if (y < 0)
                y = 0;
            if (pos.x + this.element.clientWidth > bodyRight) {
                x = pos.x + size.w - this.element.clientWidth;
            }
            else
                x = pos.x;
            if (x < 0)
                x = 0;
            this.element.style.left = x + "px";
            this.element.style.top = y + "px";
        };
        Dropdownable.prototype._auto = function (pos, size) {
            var bodyBottom = pageElement.scrollTop + pageElement.clientHeight;
            var bodyRight = pageElement.scrollLeft + pageElement.clientWidth;
            var x, y, isComplete; //isComplete 上下展开是否是完全的展开
            if (pos.y + size.h + this.element.clientHeight > bodyBottom) {
                //完全下展空间不够
                if (pos.y + this.element.clientHeight > bodyBottom) {
                    //部分下展空间也不够
                    y = pos.y - this.element.clientHeight;
                    if (y < 0) {
                        y -= size.h;
                        if (y < 0)
                            y = 0;
                    }
                    else {
                        isComplete = true;
                    }
                }
                else
                    y = pos.y;
            }
            else {
                y = pos.x + size.h;
                isComplete = true;
            }
            if (isComplete) {
                if (pos.x + this.element.clientWidth > bodyRight) {
                    x = pos.x - this.element.clientWidth;
                    if (x < 0)
                        x = 0;
                }
                else
                    x = pos.x;
            }
            else {
                if (pos.x + size.w + this.element.clientWidth > bodyRight) {
                    x = pos.x - this.element.clientWidth;
                    if (x < 0)
                        x = 0;
                }
                else {
                    x = pos.x + size.w;
                }
            }
        };
        Dropdownable.token = "$__DROPDOWN_INST__";
        return Dropdownable;
    }());
    exports.Dropdownable = Dropdownable;
    var Dropdown = /** @class */ (function (_super) {
        __extends(Dropdown, _super);
        function Dropdown() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Dropdown.prototype.init = function (descriptor) {
            var _this = this;
            this._initItems(this.options, true).then(function () { return _this._initValueText(); });
        };
        Dropdown.prototype._initItems = function (options, returnPromise) {
            var _this = this;
            var t = typeof options;
            if (t === "object" && !options[HttpRequest.optsToken]) {
                var items = [];
                if (YA.is_array(options)) {
                    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                        var item = options_1[_i];
                        items.push(item);
                    }
                }
                else {
                    for (var value in options) {
                        var item = {};
                        item[this.VALUE_FIELD || "Id"] = value;
                        item[this.TEXT_FIELD || "Text"] = options[value];
                        items.push(item);
                    }
                }
                this._items = items;
                return returnPromise ? new Promise(function (resolve) {
                    resolve(_this._items);
                    if (_this.$element) {
                        exports.ElementUtility.removeClass(_this.$element, "waiting");
                        _this._textEditor.disabled = true;
                    }
                }) : this._items;
            }
            else {
                this.request(options).then(function (optsData) {
                    _this._initItems(optsData);
                    exports.ElementUtility.removeClass(_this.$element, "waiting");
                    _this._textEditor.disabled = true;
                });
            }
        };
        Dropdown.prototype._initValueText = function () {
            var _this = this;
            if (this.value !== undefined) {
                this._setDropdownValue(this.value);
            }
            this.subscribe("value", function (e) {
                _this._setDropdownValue(_this.value);
            });
        };
        Dropdown.prototype._setDropdownValue = function (value) {
            if (Observable.isObservable(value))
                value = value.get(ObservableModes.Value);
            var rm = Observable.readMode;
            Observable.readMode = ObservableModes.Proxy;
            try {
                var opts = this._options.get(ObservableModes.Value);
                var index = 0;
                for (var n in opts) {
                    var opt = this._options[n];
                    var val = opt[this.VALUE_FIELD || "Id" || "id"];
                    if (val.get)
                        val = val.get(ObservableModes.Value);
                    if (value === val) {
                        var lastIndex = this.selectIndex.get(ObservableModes.Value);
                        this.selectIndex.set(index);
                        var text = opt[this.TEXT_FIELD || "Text" || "text"];
                        this.text.set(text);
                        if (this._textText) {
                            this._textText.innerHTML = text;
                            var tbody = this._dropdown_list;
                            if (lastIndex !== undefined) {
                                removeClass(tbody.chidNodes[lastIndex], "selected");
                            }
                            addClass(tbody.childNodes[index], "selected");
                        }
                        break;
                    }
                    index++;
                }
            }
            finally {
                Observable.readMode = rm;
            }
        };
        Dropdown.prototype.selectOpt = function (opt) {
            var value = opt[this.VALUE_FIELD || "Id" || "id"];
            this.value(value);
        };
        Dropdown.prototype.render = function () {
            debugger;
            var opt = YA.loopar(this._options);
            var fieldText = YA.loopar(this.fields);
            var fieldName = YA.variable("");
            var thead = YA.createElement("thead", { if: this.fields },
                YA.createElement("tr", { loop: [this.fields, fieldText, fieldName] },
                    YA.createElement("th", null, fieldText)));
            return YA.createElement("span", { className: ["ya-dropdown", this.css] },
                YA.createElement("input", { if: this.editable, type: "text", "c-name": "$__textEditor__", class: "ya-dorpdown-text", value: this.text }),
                YA.createElement("span", { "if-not": this.editable, "c-name": "$__textText__" }, this.text),
                YA.createElement("table", null,
                    YA.createElement("tbody", { loop: [this._options, opt], "c-name": "$__dropdown_list__" },
                        YA.createElement("tr", { loop: [this.fields, fieldText, fieldName], __opt_data: opt },
                            YA.createElement("td", null, opt[fieldName])))));
        };
        __decorate([
            parameter()
        ], Dropdown.prototype, "value", void 0);
        __decorate([
            out_parameter()
        ], Dropdown.prototype, "text", void 0);
        __decorate([
            in_parameter(false)
        ], Dropdown.prototype, "editable", void 0);
        __decorate([
            YA.internal()
        ], Dropdown.prototype, "selectIndex", void 0);
        __decorate([
            YA.internal()
        ], Dropdown.prototype, "fields", void 0);
        __decorate([
            YA.internal()
        ], Dropdown.prototype, "_options", void 0);
        return Dropdown;
    }(Component));
    exports.Dropdown = Dropdown;
    var Dropdown1 = /** @class */ (function (_super) {
        __extends(Dropdown1, _super);
        function Dropdown1() {
            var _this = _super.call(this) || this;
            _this.editable = true;
            _this.OPTIONVALUE = "Id";
            _this.OPTIONTEXT = "Text";
            return _this;
        }
        Dropdown1.prototype._render = function () {
            var field = YA.variable(undefined);
            var fieldname = YA.variable("");
            var option = YA.variable(null);
            var optionIndex = YA.variable(0);
            return YA.createElement("span", { css: ["ya-dropdown ya-input", this.css] },
                YA.createElement("input", { if: this.editable, type: "text", "b-value": this.text }),
                YA.createElement("span", { if: YA.not(this.editable) }, this.text),
                YA.createElement("a", { href: "#", className: "btn ya-dropdown-btn" }, " "),
                YA.createElement("table", { style: "display:none;position:absolute;" },
                    YA.createElement("thead", { if: this.fields },
                        YA.createElement("tr", { for: [this.fields, field] },
                            YA.createElement("th", null, YA.computed(function (field, fieldname) { return typeof field === "string" ? field : field.text; }, field)))),
                    YA.createElement("tbody", { if: this.fields, for: [this.$__options__, option, optionIndex] },
                        YA.createElement("tr", { className: YA.computed(function (index, selectIndex) { return index === selectIndex ? "selected" : ""; }, optionIndex, this.selectIndex), for: [this.fields, field, fieldname] },
                            YA.createElement("td", null, YA.computed(function () { return option[field.name || fieldname]; }))))));
        };
        Dropdown1.prototype.getFieldText = function (field) {
            if (typeof field === "string")
                return field;
            return field.text;
        };
        Dropdown1.prototype.render = function (descriptor, parentNode) {
            var _this = this;
            var element = document.createElement("SPAN");
            element.className = "ya-input ya-dropdown";
            Component.initElement(element, this, this);
            var editableOb = this.editable;
            if (editableOb.get(ObservableModes.Value)) {
                this._editInput();
            }
            else {
                this._readonlyInput();
            }
            editableOb.subscribe(function (e) {
                e.value ? _this._editInput() : _this._readonlyInput();
            }, this);
            var dropdownBtn = exports.ElementUtility.createElement("a", { "class": "ya-btn ya-dropdown-btn" }, element);
            //ElementUtility.attach(dropdownBtn);
            var options = this.options;
            if (typeof this.options === "string") {
                options = this.request(options, this);
            }
            if (options.then) {
                addClass(element, "ya-loading");
                this.inputElement.disabled = true;
                options.then(function (opts) {
                    _this.setOptions(opts);
                    _this.inputElement.disabled = false;
                    removeClass(element, "ya-loading");
                });
            }
            else {
                this.setOptions(options);
            }
            return element;
        };
        Dropdown1.prototype._setValue = function (value) {
            for (var item in this.$__options__) {
                var text = void 0;
                if (item === value || (this.compare && (text = this.compare(item, value)) !== undefined) || item[this.OPTIONVALUE || "Id"] == value) {
                    if (text === undefined)
                        text = item[this.OPTIONTEXT || "Text"];
                    this._setText(text);
                    break;
                }
            }
            return this;
        };
        Dropdown1.prototype.setOptions = function (opts) {
            var value = this.value.get(ObservableModes.Value);
            if (YA.is_array(opts)) {
                this.$__options__ = [];
                for (var _i = 0, opts_1 = opts; _i < opts_1.length; _i++) {
                    var optionItem = opts_1[_i];
                    this.$__options__.push(optionItem);
                    if (optionItem === value) {
                        this._setText(optionItem[this.OPTIONTEXT || "Text"]);
                    }
                    else if (this.compare) {
                        var text = this.compare(optionItem, value);
                        if (text !== undefined) {
                            this._setText(text);
                            break;
                        }
                    }
                    else if (optionItem[this.OPTIONVALUE] === value) {
                        this._setText(optionItem[this.OPTIONTEXT || "Text"]);
                        break;
                    }
                }
            }
            else {
                for (var key in opts) {
                    var text = opts[key];
                    var opt = {};
                    opt[this.OPTIONVALUE || "Id"] = key;
                    opt[this.OPTIONTEXT || "Text"] = text;
                    if (key === value)
                        this._setText(text);
                }
            }
            return this;
        };
        Dropdown1.prototype._editInput = function () {
            var _this = this;
            if (this.inputElement && this.inputElement.tagName === "INPUT")
                return this.inputElement;
            var inputElement = document.createElement("INPUT");
            inputElement.type = "text";
            inputElement.className = "ya-input";
            inputElement.style.cssText = "display:inline-block;width:100%;";
            inputElement.onkeyup = function (e) {
                if (_this.$__tick__)
                    clearTimeout(_this.$__tick__);
                _this.$__tick__ = setTimeout(function () {
                    if (_this.$__tick__)
                        clearTimeout(_this.$__tick__);
                    _this.$__tick__ = undefined;
                    var keyword = YA.trim(inputElement.value);
                    _this._filter(keyword);
                }, 150);
            };
            inputElement.onblur = function () {
                if (_this.$__tick__)
                    clearTimeout(_this.$__tick__);
                _this.$__tick__ = undefined;
                var keyword = YA.trim(inputElement.value);
                _this._filter(keyword);
            };
            if (this.inputElement) {
                this.$element.replaceChild(inputElement, this.inputElement);
            }
            else
                this.$element.appendChild(inputElement);
            this._setText = function (text) { return inputElement.value = text === undefined || text === null ? "" : text; };
            return this.inputElement = inputElement;
        };
        Dropdown1.prototype._readonlyInput = function () {
            if (this.inputElement && this.inputElement.tagName === "SPAN")
                return this.inputElement;
            var inputElement = document.createElement("SPAN");
            inputElement.className = "ya-input";
            inputElement.style.cssText = "display:inline-block;width:100%;";
            if (this.inputElement) {
                this.$element.replaceChild(inputElement, this.inputElement);
            }
            else
                this.$element.appendChild(inputElement);
            this._setText = function (text) { return inputElement.innerHTML = exports.ElementUtility.htmlEncode(text); };
            return this.inputElement = inputElement;
        };
        Dropdown1.prototype._filter = function (keyword) {
            var _this = this;
            if (!this.$__tbody__)
                return;
            var filter = this.filter || this._defaultFilter;
            var opts = filter.call(this, keyword, this.$__options__, this);
            if (typeof opts.then === "function") {
                var sessionId_1 = this.$__filterSessionId__ = new Date();
                opts.then(function (asyncOpts) {
                    if (sessionId_1 !== _this.$__filterSessionId__)
                        return;
                    _this._makeDropdownRow(opts);
                });
            }
            else {
                this._makeDropdownRow(opts);
            }
        };
        Dropdown1.prototype._defaultFilter = function (keyword, options, dropdown) {
            var filteredOpts = [];
            for (var _i = 0, _a = this.$__options__; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item[this.OPTIONVALUE || "Id"] === keyword)
                    filteredOpts.push(item);
                else {
                    var text = item[this.OPTIONTEXT || "Text"];
                    if (text === keyword || (text && text.indexOf(keyword) >= 0))
                        filteredOpts.push(item);
                }
            }
            return filteredOpts;
        };
        Dropdown1.prototype.expand = function () {
            if (this.$__dropdownable__) {
                this.$__dropdownable__.show();
                addClass(this.$element, "ya-expand");
                return this;
            }
            var tb = document.createElement("table");
            tb.className = "ya-dropdown";
            if (this.fields) {
                var thead = document.createElement("thead");
                tb.appendChild(thead);
                var hrow = document.createElement("tr");
                thead.appendChild(hrow);
                for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
                    var field = _a[_i];
                    if (typeof field === "string") {
                        exports.ElementUtility.createElement("th", { innerHTML: exports.ElementUtility.htmlEncode(field) }, hrow);
                    }
                }
            }
            var tbody = this.$__tbody__ = document.createElement("tbody");
            tb.appendChild(tbody);
            var waitingTr = this.$__waitingTr__ = exports.ElementUtility.createElement("tr", { "class": "waiting-options" }, tbody);
            var td = exports.ElementUtility.createElement("td", null, waitingTr);
            exports.ElementUtility.createElement("div", { "class": "ya-waiting-text" }, td);
            this._makeDropdownRow(this.$__options__);
            this.$__dropdownable__ = new Dropdownable(this.$element, {});
            this.$__dropdownable__.show();
            addClass(this.$element, "ya-expand");
            return this;
        };
        Dropdown1.prototype.collapse = function () {
            if (this.$__dropdownable__) {
                this.$__dropdownable__.hide();
                removeClass(this.$element, "ya-expand");
            }
            return this;
        };
        Dropdown1.prototype._makeDropdownRow = function (options) {
            var self = this;
            this.$__tbody__.innerHTML = "";
            for (var _i = 0, options_2 = options; _i < options_2.length; _i++) {
                var optItem = options_2[_i];
                if (this.fields) {
                    var row = document.createElement("tr");
                    this.$__tbody__.appendChild(row);
                    for (var _a = 0, _b = this.fields; _a < _b.length; _a++) {
                        var field = _b[_a];
                        if (typeof field === "string") {
                            exports.ElementUtility.createElement("td", { innerHTML: exports.ElementUtility.htmlEncode(field) }, row);
                        }
                    }
                    row.$__DROPDOWN_OPTIONITEM__ = optItem;
                    row.onclick = function () {
                        var item = this.$__DROPDOWN_OPTIONITEM__;
                        var readMode = Observable.readMode;
                        Observable.readMode = ObservableModes.Proxy;
                        var ob;
                        try {
                            ob = self.value;
                        }
                        finally {
                            Observable.readMode = readMode;
                        }
                        if (self.selectType === "item")
                            ob.set(item);
                        else
                            ob.set(item[self.OPTIONVALUE || "Id"]);
                        ob.update(self);
                    };
                }
            }
        };
        __decorate([
            parameter()
        ], Dropdown1.prototype, "value", void 0);
        __decorate([
            out_parameter()
        ], Dropdown1.prototype, "text", void 0);
        __decorate([
            in_parameter()
        ], Dropdown1.prototype, "editable", void 0);
        __decorate([
            YA.internal()
        ], Dropdown1.prototype, "selectIndex", void 0);
        return Dropdown1;
    }(Component));
    exports.Dropdown1 = Dropdown1;
    var Field = /** @class */ (function (_super) {
        __extends(Field, _super);
        function Field() {
            return _super.call(this) || this;
        }
        __decorate([
            in_parameter()
        ], Field.prototype, "css", void 0);
        __decorate([
            in_parameter()
        ], Field.prototype, "permission", void 0);
        return Field;
    }(Component));
    exports.Field = Field;
});
//# sourceMappingURL=YA.dom.js.map