/*
要正确编译该文件，tsconfig必须要配置成
"compilerOptions": {
        "module":"None",
        ..
}
*/
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
(function (window) {
    //====================================================================   
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
        var Ready = /** @class */ (function () {
            function Ready(statement) {
                var _this = this;
                var readyCallbacks = this._readyCallbacks = [];
                var failCallbacks = this._failCallbacks = [];
                this.isReady = this.isFailed = this.isCompleted = false;
                var isCompleted, isReady, isFailed, value;
                var ready = function (val) {
                    if (isCompleted) {
                        console.warn('Ready对象已经Complete，又再次调用了ready操作，忽略');
                        return;
                    }
                    console.debug(_this.url + " is called ready.", _this);
                    _this.value = value = val;
                    isCompleted = isReady = _this.isReady = _this.isCompleted = true;
                    var callbacks = readyCallbacks;
                    _this._readyCallbacks = _this._failCallbacks = readyCallbacks = failCallbacks = undefined;
                    for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
                        var callback = callbacks_1[_i];
                        callback.call(_this, val, _this);
                    }
                };
                var fail = function (val) {
                    if (isCompleted) {
                        console.warn('Ready对象已经Complete，又再次调用了fail操作，忽略');
                        return;
                    }
                    console.debug(_this.url + " is called fail.", _this);
                    _this.value = value = val;
                    isCompleted = isFailed = _this.isFailed = _this.isCompleted = true;
                    var callbacks = failCallbacks;
                    _this._readyCallbacks = _this._failCallbacks = readyCallbacks = failCallbacks = undefined;
                    for (var _i = 0, callbacks_2 = callbacks; _i < callbacks_2.length; _i++) {
                        var callback = callbacks_2[_i];
                        callback.call(_this, val, _this);
                    }
                };
                this.ready = function (callback) {
                    if (!isCompleted) {
                        readyCallbacks.push(callback);
                    }
                    else if (isReady) {
                        callback.call(_this, value, _this);
                    }
                    return _this;
                };
                this.fail = function (callback) {
                    if (!isCompleted) {
                        failCallbacks.push(callback);
                    }
                    else if (isFailed) {
                        callback.call(_this, value, _this);
                    }
                    return _this;
                };
                statement.call(this, ready, fail);
            }
            Ready.prototype.ready = function (callback) {
                return this;
            };
            Ready.prototype.fail = function (callback) {
                return this;
            };
            return Ready;
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
        //////////////////////////////////////////////////////////////////////////////////////////
        // Resource
        var Resource = /** @class */ (function (_super) {
            __extends(Resource, _super);
            function Resource(url) {
                var _this = _super.call(this, function (ready, fail) {
                    var _this = this;
                    var self = this;
                    url = self._makeUrl(url);
                    var elem = self.element = self._createElement(url);
                    if (elem.onload !== undefined)
                        elem.onload = function () { return self._loaded(ready); };
                    else
                        elem.onreadystatechange = function () {
                            if (elem.readyState === 4 || elem.readyState === "complete")
                                self._loaded(ready);
                        };
                    elem.onerror = function (err, ex) { console.error(err, ex, _this); fail(err); };
                    self._load();
                }) || this;
                _this.url = url;
                return _this;
            }
            Resource.prototype._makeUrl = function (url) {
                if (url.indexOf("?") > 0)
                    url += "&";
                else
                    url += "?";
                url += Math.random();
                return url;
            };
            Resource.prototype._createElement = function (url) {
                throw new Error("abstract method");
            };
            Resource.prototype._load = function () {
                head().appendChild(this.element);
            };
            Resource.prototype._loaded = function (ready) {
                ready(this.element);
            };
            Resource.load = function (opts) {
                var url, type;
                if (typeof opts === "object") {
                    url = opts.url;
                    type = opts.type;
                }
                else {
                    url = opts;
                }
                if (type) {
                    var ext = "." + type;
                    if (url.substr(url.length - ext.length) !== ext)
                        url += ext;
                }
                else {
                    var at = url.lastIndexOf(".");
                    if (at > 0) {
                        var ext = url.substr(at);
                        if (ext == ".css")
                            type = "css";
                        else if (ext == ".js")
                            type = "js";
                    }
                    if (!type) {
                        type = "js";
                        url += ".js";
                    }
                }
                if (type == "js")
                    return new ScriptResource(url);
                else if (type == "css")
                    return new StylesheetResource(url);
            };
            return Resource;
        }(Ready));
        var ScriptResource = /** @class */ (function (_super) {
            __extends(ScriptResource, _super);
            function ScriptResource(url) {
                var _this = _super.call(this, url) || this;
                _this.type = "js";
                return _this;
            }
            ScriptResource.prototype._createElement = function (url) {
                var elem = document.createElement("script");
                elem.type = "text/javascript";
                elem.src = url;
                return elem;
            };
            return ScriptResource;
        }(Resource));
        var StylesheetResource = /** @class */ (function (_super) {
            __extends(StylesheetResource, _super);
            function StylesheetResource(url) {
                var _this = _super.call(this, url) || this;
                _this.type = "css";
                return _this;
            }
            StylesheetResource.prototype._createElement = function (url) {
                var elem = document.createElement("link");
                elem.type = "text/css";
                elem.href = url;
                elem.rel = "stylesheet";
                return elem;
            };
            return StylesheetResource;
        }(Resource));
        ////////////////////////////////////////////////////////////////
        // Module
        var Module = /** @class */ (function (_super) {
            __extends(Module, _super);
            function Module(opts, uri) {
                var _this = _super.call(this, function (ready, fail) {
                    var _this = this;
                    window.exports = {};
                    var self = this;
                    self.aliases = [];
                    self.deps = {};
                    if (opts.url) {
                        self.uri = uri || (uri = new Uri(opts.url));
                        self.url = uri.url;
                        self.aliases.push(self.url);
                    }
                    if ((self.name = opts.name) && self.url != this.name)
                        self.aliases.push(self.name);
                    var resolve = function (result, module_exports) {
                        self.result = result;
                        self.exports = module_exports;
                        self.value = result || module_exports;
                        if (module_exports)
                            self.default = module_exports.default;
                        ready(self.value);
                    };
                    if (opts.value) {
                        resolve(opts.value);
                    }
                    else {
                        self.resource = Resource.load(this.url).ready(function (elem) {
                            var context = RequireContext.current;
                            var g_exports = window.exports;
                            window.exports = {};
                            RequireContext.current = undefined;
                            if (!context) {
                                var module_exports = {};
                                for (var n in g_exports)
                                    module_exports[n] = g_exports[n];
                                console.warn("\u6A21\u5757" + _this.url + "\u4E2D\u672A\u7528define\u5B9A\u4E49\u6A21\u5757,\u514B\u9686\u5168\u5C40\u7684exports\u4F5C\u4E3A\u8BE5\u6A21\u5757\u7684\u8F93\u51FA\u3002");
                                resolve(module_exports);
                                return;
                            }
                            //把module注入到当前上下文中
                            //上下文会在setTimout(0)后执行模块的factory
                            context.module = _this;
                            context.resolve = resolve;
                        }).fail(fail);
                    }
                }) || this;
                _this.opts = opts;
                return _this;
            }
            Module.prototype.alias = function (name, force) {
                var existed = define.modules[name];
                if (existed) {
                    if (existed === this)
                        return this;
                    if (force) {
                        console.warn("\u6A21\u5757[" + name + "]\u88AB\u66FF\u6362\u6389\u4E86", existed, this);
                    }
                    else
                        throw new Error("\u6A21\u5757[" + name + "]\u88AB\u66FF\u6362\u6389\u4E86");
                }
                else {
                    for (var i = 0, j = this.aliases.length; i < j; i++) {
                        var n = this.aliases.shift();
                        if (n !== name)
                            this.aliases.push(n);
                    }
                    this.aliases.push(name);
                }
                define.modules[name] = this;
            };
            Module.fetch = function (name, requireModule) {
                var _a;
                if (!name)
                    throw new Error("无法获取模块,未指定模块名/url");
                var existed = define.modules[name];
                if (!existed) {
                    var uri = new Uri(name, (_a = requireModule) === null || _a === void 0 ? void 0 : _a.uri.paths);
                    existed = define.modules[uri.url];
                    if (!existed)
                        existed = define.modules[uri.url] = new Module({ name: uri.url, url: name }, uri);
                }
                return existed;
            };
            Module.caches = {};
            return Module;
        }(Ready));
        var resolveUrl = function (url) {
            var at = url.lastIndexOf(".");
            if (at < 0)
                return url;
            var ext = url.substr(at);
            if (ext !== ".js")
                url += ".js";
            return url;
        };
        var RequireException = /** @class */ (function (_super) {
            __extends(RequireException, _super);
            function RequireException(msg, is_in_defination_statement) {
                var _this = _super.call(this, msg) || this;
                _this.is_in_defination_statement = is_in_defination_statement;
                return _this;
            }
            return RequireException;
        }(Error));
        window.exports = {};
        var RequireContext = /** @class */ (function () {
            function RequireContext(name, deps, factory) {
                var _this = this;
                this.name = name;
                this.deps = deps;
                this.factory = factory;
                RequireContext.current = this;
                this.module_exports = {};
                setTimeout(function () {
                    var require = function (name) {
                        var mod = Module.fetch(name, _this.module);
                        if (!mod.isReady) {
                            wait_count++;
                            mod.ready(function (mod) {
                                tryResolve();
                            });
                            throw new RequireException("module[" + name + " is not ready.", true);
                        }
                        return mod.value || mod.exports || mod.default;
                    };
                    require.config = set_config;
                    var args = [];
                    var wait_count = _this.deps.length;
                    var tryResolve = function () {
                        if ((--wait_count) === 0) {
                            var success = false;
                            var result = void 0;
                            try {
                                result = _this.factory.apply(_this, args);
                                success = true;
                            }
                            catch (ex) {
                                if (ex.is_in_defination_statement) {
                                }
                                else
                                    throw ex;
                            }
                            if (success) {
                                _this.resolve(result, _this.module_exports);
                            }
                        }
                    };
                    for (var index in _this.deps)
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
                                var depModule = Module.fetch(depname, _this.module);
                                _this.module.deps[depModule.name] = depModule;
                                depModule.ready(function (mod) {
                                    args[idx] = mod.value;
                                    tryResolve();
                                });
                            }
                        })(_this.deps[index], index);
                    tryResolve();
                }, 0);
            }
            return RequireContext;
        }());
        function boot() {
            var scripts = document.scripts;
            var _loop_1 = function (i, j) {
                var script = scripts[i];
                var require_module = script.getAttribute("require");
                if (require_module) {
                    console.info("YA.require is loading init module[" + require_module + "]");
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
            return define;
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
                    define(opts.name, opts.value);
                    callback(Module.fetch(opts.name, null));
                }
                else {
                    var mod_1 = callback(Module.fetch(opts.url || opts.name, null));
                    if (opts.name)
                        define.modules[opts.name] = mod_1;
                }
            }
        }
        var define = function (name, deps, factory) {
            //整理参数
            //define(name,deps,statement)
            if (factory === undefined) {
                // define(deps,statement) or define(name,value)
                if (typeof name === "string") {
                    //define(name,value);
                    var value = deps;
                    var existed = define.modules[name];
                    if (existed) {
                        if (existed.isReady && existed.value === value)
                            return;
                        console.warn("Module[" + name + "] is replaced.", value, existed);
                    }
                    new Module({ name: name, value: value }, null);
                    return;
                }
                else {
                    factory = deps;
                    deps = name;
                    name = undefined;
                }
                if (factory === undefined) {
                    //define(statement);
                    factory = deps;
                    deps = undefined;
                }
            }
            if (typeof factory !== "function")
                throw new Error("不正确的参数");
            define.context = new RequireContext(name, deps, factory);
        };
        define.modules = {};
        define.create = factory;
        //define.resolveUrl = resolveUrl;
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
//# sourceMappingURL=YA.require copy.js.map