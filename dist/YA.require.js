var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (window) {
    //====================================================================
    function factory(initModules, window, document) {
        document || (document = window.document);
        var head = function () {
            var elems = document.getElementsByTagName("head");
            if (!elems || elems.length == 0)
                return document.body;
            var headElem = elems[0];
            head = function () { return head; };
            return headElem;
        };
        var Resource = /** @class */ (function () {
            function Resource(opts) {
                this.opts = opts;
                var elem = this.element = this._createElement(opts.url);
                if (opts.success) {
                    if (elem.onreadystatechange === null) {
                        elem.onreadystatechange = function (e) {
                            if (elem.readyState === 4 || elem.readyState === "complete") {
                                opts.success(elem);
                            }
                        };
                    }
                    else
                        elem.onload = function () { return opts.success(elem); };
                }
                if (opts.error)
                    elem.onerror = function (err) { return opts.error(err); };
                this._load(elem);
            }
            Resource.prototype._createElement = function (url) {
                var elem = document.createElement("script");
                elem.type = "text/javascript";
                elem.src = url;
                return elem;
            };
            Resource.prototype._load = function (elem) {
                head().appendChild(elem);
            };
            return Resource;
        }());
        var RequireException = /** @class */ (function (_super) {
            __extends(RequireException, _super);
            function RequireException(msg, is_in_defination_statement) {
                var _this = _super.call(this, msg) || this;
                _this.is_in_defination_statement = is_in_defination_statement;
                return _this;
            }
            return RequireException;
        }(Error));
        var Defination = /** @class */ (function () {
            function Defination(deps, statement) {
                this.deps = deps;
                this.statement = statement;
            }
            Defination.prototype.execute = function (module, resolve) {
                var _this = this;
                if (!window.module)
                    window.module = {};
                var module_exports = this.module_exports = window.module.exports = window.exports = {};
                var require = function (name) {
                    var mod = Module.fetch(name);
                    if (!mod.isReady) {
                        wait_count++;
                        mod.ready(function (mod) {
                            tryResolve();
                        });
                        throw new RequireException("module[" + name + " is not ready.", true);
                    }
                    return mod.value || mod.exports || mod.default;
                };
                var args = [];
                var wait_count = this.deps.length;
                var tryResolve = function () {
                    if ((--wait_count) === 0) {
                        try {
                            _this.value = _this.statement.apply(module, args);
                        }
                        catch (ex) {
                            if (ex.is_in_defination_statement) {
                            }
                            else
                                throw ex;
                        }
                        resolve(_this.value, _this.module_exports);
                    }
                };
                for (var index in this.deps)
                    (function (depname, idx) {
                        if (depname === "exports") {
                            args.push(module_exports);
                            wait_count--;
                        }
                        else if (depname === "require") {
                            args.push(require);
                            wait_count--;
                        }
                        var depModule = Module.fetch(depname);
                        depModule.ready(function (mod) {
                            args[idx] = mod.value || mod.exports || mod.default;
                            tryResolve();
                        });
                    })(this.deps[index], index);
                tryResolve();
            };
            return Defination;
        }());
        var Module = /** @class */ (function () {
            function Module(opts) {
                var _this = this;
                this.opts = opts;
                if (this.name = opts.name)
                    Module.caches[opts.name] = this;
                if (this.url = opts.url)
                    Module.caches[opts.url] = this;
                var resolve = function (value, module_exports) {
                    _this.value = value;
                    _this.exports = module_exports;
                    if (module_exports)
                        _this.default = module_exports.default;
                    else if (value)
                        _this.default = value.default;
                    var loadCallbacks = _this._loadCallbacks;
                    _this._loadCallbacks = null;
                    _this.isReady = true;
                    for (var _i = 0, loadCallbacks_1 = loadCallbacks; _i < loadCallbacks_1.length; _i++) {
                        var callback = loadCallbacks_1[_i];
                        callback.call(_this, _this);
                    }
                };
                if (opts.value) {
                    resolve(opts.value);
                }
                else {
                    this._loadCallbacks = [];
                    var url = this.resolvedUrl = resolveUrl(opts.url);
                    Module.caches[url] = this;
                    this.resource = new Resource({
                        url: url,
                        success: function (elem) {
                            define.defination.execute(_this, resolve);
                        },
                        error: function (e) {
                            throw e;
                        }
                    });
                }
            }
            Module.prototype.ready = function (callback) {
                if (this._loadCallbacks) {
                    this._loadCallbacks.push(callback);
                }
                else {
                    callback.call(this, this);
                }
                return this;
            };
            Module.prototype.alias = function (name, force) {
                var existed = Module.caches[name];
                if (existed) {
                    if (existed === this)
                        return this;
                    if (force) {
                        console.warn("\u6A21\u5757[" + name + "]\u88AB\u66FF\u6362\u6389\u4E86", existed, this);
                    }
                    else
                        throw new Error("\u6A21\u5757[" + name + "]\u88AB\u66FF\u6362\u6389\u4E86");
                }
                Module.caches[name] = this;
            };
            Module.fetch = function (name) {
                var existed = Module.caches[name];
                if (!existed)
                    existed = new Module({ url: name });
                return existed;
            };
            Module.caches = {};
            return Module;
        }());
        var resolveUrl = function (url) {
            var at = url.lastIndexOf(".");
            if (at < 0)
                return url;
            var ext = url.substr(at);
            if (ext !== ".js")
                url += ".js";
            return url;
        };
        function boot() {
            var scripts = document.scripts;
            for (var i in scripts) {
                var script = scripts[i];
                var require_module = script.getAttribute("require");
                if (require_module) {
                    Module.fetch(require_module);
                    break;
                }
            }
            if (window.removeEventListener)
                window.removeEventListener("load", boot, false);
            else if (window.detechEvent)
                window.detechEvent("onload", boot);
        }
        if (window.addEventListener)
            window.addEventListener("load", boot, false);
        else if (window.attachEvent)
            window.attachEvent("onload", boot);
        else
            window.onload = boot;
        var define = function (deps, statement) {
            if (typeof deps === "string") {
                new Module({ name: deps, value: statement });
                return;
            }
            define.defination = new Defination(deps, statement);
        };
        define.create = factory;
        define.resolveUrl = resolveUrl;
        define.amd = true;
        window.define = define;
        return define;
    }
    factory(null, window);
})(typeof window !== 'undefined' ? window : undefined);
//# sourceMappingURL=YA.require.js.map