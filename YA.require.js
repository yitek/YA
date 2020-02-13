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
/*
要正确编译该文件，tsconfig必须要配置成
"compilerOptions": {
        "module":"None",
        ..
}
*/
(function (window) {
    function factory(initModules, window, document) {
        document || (document = window.document);
        var head = function () {
            var elems = document.getElementsByTagName("head");
            if (!elems || elems.length == 0)
                return document.body;
            var headElem = elems[0];
            head = function () { return headElem; };
            return headElem;
        };
        var Resource = /** @class */ (function () {
            function Resource(opts) {
                this.opts = opts;
                var url = opts.url;
                if (url.indexOf("?") > 0)
                    url += "&";
                else
                    url += "?";
                url += Math.random();
                var elem = this.element = this._createElement(url);
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
        function refreshGlobalExports() {
            if (!window.module)
                window.module = {};
            return this.module_exports = window.module.exports = window.exports = {};
        }
        var Defination = /** @class */ (function () {
            function Defination(deps, statement) {
                this.deps = deps;
                this.statement = statement;
            }
            Defination.prototype.execute = function (module, resolve) {
                var _this = this;
                this.module_exports = refreshGlobalExports();
                var require = function (name) {
                    var mod = Module.fetch(name, module);
                    if (!mod.isReady) {
                        wait_count++;
                        mod.ready(function (mod) {
                            tryResolve();
                        });
                        throw new RequireException("module[" + name + " is not ready.", true);
                    }
                    return mod.value || mod.exports || mod["default"];
                };
                require.config = set_config;
                var args = [];
                var wait_count = this.deps.length;
                var tryResolve = function () {
                    if ((--wait_count) === 0) {
                        var success = false;
                        try {
                            define.disabled = true;
                            _this.value = _this.statement.apply(module, args);
                            success = true;
                        }
                        catch (ex) {
                            if (ex.is_in_defination_statement) {
                            }
                            else
                                throw ex;
                        }
                        if (success)
                            resolve(_this.value, _this.module_exports);
                    }
                };
                for (var index in this.deps)
                    (function (depname, idx) {
                        if (depname === "exports") {
                            args.push(_this.module_exports);
                            wait_count--;
                        }
                        else if (depname === "require") {
                            args.push(require);
                            wait_count--;
                        }
                        else {
                            var depModule = Module.fetch(depname, module);
                            depModule.ready(function (mod) {
                                args[idx] = mod.value || mod.exports || mod["default"];
                                tryResolve();
                            });
                        }
                    })(this.deps[index], index);
                tryResolve();
            };
            return Defination;
        }());
        var Module = /** @class */ (function () {
            function Module(opts, uri) {
                var _this = this;
                this.opts = opts;
                if (this.name = opts.name)
                    Module.caches[opts.name] = this;
                if (opts.url) {
                    this.uri = uri || (uri = new Uri(opts.url));
                    Module.caches[this.url = uri.url] = this;
                }
                this._loadCallbacks = [];
                var resolve = function (value, module_exports) {
                    _this.value = value;
                    _this.exports = module_exports;
                    if (module_exports)
                        _this["default"] = module_exports["default"];
                    else if (value)
                        _this["default"] = value["default"];
                    var loadCallbacks = _this._loadCallbacks;
                    _this._loadCallbacks = null;
                    _this.isReady = true;
                    define.disabled = false;
                    for (var _i = 0, loadCallbacks_1 = loadCallbacks; _i < loadCallbacks_1.length; _i++) {
                        var callback = loadCallbacks_1[_i];
                        callback.call(_this, _this);
                    }
                };
                if (opts.value) {
                    resolve(opts.value);
                }
                else {
                    define.disabled = false;
                    this.resource = new Resource({
                        url: this.url,
                        success: function (elem) {
                            var defination = define.defination;
                            define.defination = undefined;
                            if (!defination) {
                                console.warn(_this.url + "\u6CA1\u6709\u8C03\u7528define\u5B9A\u4E49\u6A21\u5757.");
                                var module_exports = window.exports;
                                refreshGlobalExports();
                                resolve(undefined, module_exports);
                            }
                            else {
                                window.exports = {};
                                defination.execute(_this, resolve);
                            }
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
            Module.fetch = function (name, requireModule) {
                var _a;
                if (!name)
                    throw new Error("无法获取模块,未指定模块名/url");
                var existed = Module.caches[name];
                if (!existed) {
                    var uri = new Uri(name, (_a = requireModule) === null || _a === void 0 ? void 0 : _a.uri.paths);
                    existed = Module.caches[uri.url];
                    if (!existed)
                        existed = new Module({ url: name }, uri);
                }
                return existed;
            };
            Module.caches = {};
            return Module;
        }());
        var Uri = /** @class */ (function () {
            function Uri(url, basPaths) {
                this.orignal = url;
                url = this.resolved = resolveUrl(url);
                var paths = this.paths = [];
                if (basPaths)
                    for (var i = 0, j = basPaths.length; i < j; i++)
                        paths.push(basPaths[i]);
                var names = url.split('/');
                for (var i = 0, j = names.length - 1; i < j; i++) {
                    var n = names[i].replace(/(^\s+)|(\s+)$/g, "");
                    if (n === "." && paths.length)
                        continue;
                    else if (n === "..") {
                        if (paths.length) {
                            var n1 = paths.pop();
                            if (n1[0] == '.')
                                paths.push(n1);
                            else
                                continue;
                        }
                    }
                    else if (!n)
                        continue;
                    paths.push(n);
                }
                var name = names[names.length - 1];
                if (name.lastIndexOf(".js") !== name.length - 3)
                    name += ".js";
                this.filename = name;
                if (paths.length)
                    this.url = paths.join("/") + "/" + name;
                else
                    this.url = name;
            }
            return Uri;
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
            var _loop_1 = function (i, j) {
                var script = scripts[i];
                var require_module = script.getAttribute("require");
                if (require_module) {
                    console.info("YA.require is loading init module[" + require_module + "]");
                    debugger;
                    Module.fetch(require_module, null).ready(function () {
                        console.info("init module[" + require_module + "] is loaded.");
                    });
                    return "break";
                }
            };
            for (var i = 0, j = scripts.length; i < j; i++) {
                var state_1 = _loop_1(i, j);
                if (state_1 === "break")
                    break;
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
        function set_config(cfgs) {
            if (cfgs.modules)
                config_modules(cfgs.modules);
        }
        function config_modules(moduleCfgs, progress) {
            var evt = {
                readyCount: 0, loadingCount: 0, totalCount: moduleCfgs.length
            };
            var callback = function (mod) {
                if (mod.isReady)
                    evt.readyCount++;
                else
                    evt.loadingCount++;
                evt.name = mod.name;
                evt.url = mod.url;
                evt.ready = mod.isReady;
                if (progress)
                    progress(evt);
                return mod;
            };
            for (var _i = 0, moduleCfgs_1 = moduleCfgs; _i < moduleCfgs_1.length; _i++) {
                var item = moduleCfgs_1[_i];
                var opts = void 0;
                if (typeof item === "string") {
                    opts = { url: item };
                }
                else
                    opts = item;
                var mod = void 0;
                if (opts.value) {
                    if (!opts.value) {
                        var err = new Error("无法加载模块，未指定名称");
                        err.moduleOpts = opts.value;
                        throw err;
                    }
                    callback(define(opts.name, opts.value));
                }
                else {
                    var mod_1 = callback(Module.fetch(opts.url || opts.name, null));
                    if (opts.name)
                        Module.caches[opts.name] = mod_1;
                }
            }
        }
        var define = function (deps, statement) {
            var t = typeof deps;
            if (t === "function") {
                return deps(global_require);
            }
            if (t === "string") {
                return new Module({ name: deps, value: statement }, null);
            }
            if (define.disabled)
                throw new Error("define模块内部不能再调用define.");
            define.defination = new Defination(deps, statement);
        };
        define.create = factory;
        define.resolveUrl = resolveUrl;
        define.amd = true;
        define.config = set_config;
        window.define = define;
        var global_require = function (name) {
            return Module.fetch(name, null);
        };
        global_require.config = set_config;
        window.require = global_require;
        define("require", global_require);
        return define;
    }
    factory(null, window);
})(typeof window !== 'undefined' ? window : undefined);