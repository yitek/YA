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
    var ObservableSchema = YA.ObservableSchema;
    var ObservableModes = YA.ObservableModes;
    function fulfillable(target, name) {
        var handler_prop = "$__" + name + "Fulfill__";
        Object.defineProperty(target, handler_prop, { enumerable: false, configurable: false, value: null });
        target[name] = function (value) {
            var handlers = this[handler_prop];
            if (typeof value === "function") {
                if (!handlers)
                    handlers = this[handler_prop] = [];
                handlers.push(value);
                return this;
            }
            else {
                target[name] = function (value) {
                    value.call(this, this[handler_prop]);
                    return this;
                };
                var handlers_2 = this[handler_prop];
                this[handler_prop] = value;
                if (!handlers_2)
                    return this;
                for (var _i = 0, handlers_1 = handlers_2; _i < handlers_1.length; _i++) {
                    var handler = handlers_1[_i];
                    handler.call(this, value);
                }
                return this;
            }
        };
    }
    exports.fulfillable = fulfillable;
    var FieldValueKinds;
    (function (FieldValueKinds) {
        FieldValueKinds[FieldValueKinds["value"] = 0] = "value";
        FieldValueKinds[FieldValueKinds["enum"] = 1] = "enum";
        FieldValueKinds[FieldValueKinds["collection"] = 2] = "collection";
    })(FieldValueKinds = exports.FieldValueKinds || (exports.FieldValueKinds = {}));
    var Permissions;
    (function (Permissions) {
        Permissions[Permissions["disable"] = 0] = "disable";
        Permissions[Permissions["hidden"] = 1] = "hidden";
        Permissions[Permissions["readonly"] = 2] = "readonly";
        Permissions[Permissions["writable"] = 3] = "writable";
    })(Permissions = exports.Permissions || (exports.Permissions = {}));
    var Field = /** @class */ (function () {
        function Field(name, opts, model) {
            this.name = name;
            this.opts = opts;
            this.model = model;
            if (!name)
                throw Error("字段定义必须要有name");
            this.description = opts.description;
            this.sortable = opts.sortable === undefined ? false : opts.sortable;
            this.queryable = opts.queryable;
            this.permission = opts.permission === undefined ? undefined : Permissions[opts.permission];
            this.kind = opts.kind === undefined ? FieldValueKinds.value : FieldValueKinds[opts.kind];
            this.usual = opts.usual;
            this.valueModel = Model.model(this.type || "string");
        }
        return Field;
    }());
    exports.Field = Field;
    var Model = /** @class */ (function () {
        function Model(fullname, opts) {
            this.fullname = fullname;
            this.opts = opts;
            if (!fullname)
                throw new Error("未定义模型的fullname");
        }
        Model.prototype.each = function (callback) {
            var _this = this;
            this.ready(function () {
                for (var n in _this.fields)
                    callback(_this.fields[n]);
            });
            return this;
        };
        Model.prototype.buildSchema = function (filter, schema) {
            if (!schema)
                schema = new ObservableSchema(null);
            this.each(function (field) {
                if (filter && filter(field) === false)
                    return;
                Model.defineProp(schema, field);
            });
            return schema;
        };
        Model.defineProp = function (schema, field) {
            if (schema.$type !== YA.ObservableTypes.Object)
                schema.asObject();
            if (field.expends) {
                Model._initExpandableFieldSchema(schema, field);
            }
            else if (field.expanded) {
                Model._initExpandedFieldSchema(schema, field);
            }
            else {
                schema.defineProp(field.name);
            }
        };
        Model._initExpandableFieldSchema = function (targetSchema, field) {
            var setter = function (value) {
                var rmode = Observable.readMode;
                Observable.readMode = ObservableModes.Value;
                try {
                    for (var n in field.expends) {
                        var expandedField = field.expends[n];
                        this[expandedField.name] = value ? value[n] : undefined;
                    }
                }
                finally {
                    Observable.readMode = rmode;
                }
            };
            var fieldSchema = targetSchema.defineProp(field.name, null, setter);
            fieldSchema.asObject();
            for (var n in field.expends) {
                var expandedField = field.expends[n];
                fieldSchema.defineProp(expandedField.name);
            }
            return fieldSchema;
        };
        Model._initExpandedFieldSchema = function (targetSchema, field) {
            var setter = function (value) {
                var rmode = Observable.readMode;
                Observable.readMode = ObservableModes.Default;
                try {
                    var collapsedValue = this[field.expanded.prinField.name];
                    if (!collapsedValue) {
                        var newValue = {};
                        newValue[field.expanded.relField.name] = value;
                        this[field.expanded.prinField.name] = newValue;
                    }
                    else {
                        collapsedValue[field.expanded.relField.name] = value;
                    }
                }
                finally {
                    Observable.readMode = rmode;
                }
            };
            var fieldSchema = targetSchema.defineProp(field.name, undefined, setter);
            return fieldSchema;
        };
        Model.model = function (type) {
            var existed = this.$__caches__[type];
            if (!existed) {
                if (YA.array_index(exports.valueTypenames, type)) {
                    existed = new ValModel(type);
                }
                else {
                    existed = this.$__caches__[type] = new RefModel(type);
                }
            }
            return existed;
        };
        Model.define = function (opts) {
            var fullname = opts.fullname;
            var existed = this.$__caches__[fullname];
            if (existed)
                console.warn("正在重复定义模型", opts);
            this.$__caches__[fullname] = new RefModel(opts);
        };
        Model.$__caches__ = {};
        return Model;
    }());
    exports.Model = Model;
    fulfillable(Model.prototype, "load");
    fulfillable(Model.prototype, "ready");
    exports.valueTypenames = ["boolean", "string", "text", "number", "int", "float", "decimal", "date", "datetime", "guid"];
    var ValModel = /** @class */ (function (_super) {
        __extends(ValModel, _super);
        function ValModel(fullname) {
            var _this = _super.call(this, fullname, { fullname: fullname }) || this;
            var fields = {};
            _this.load([]);
            _this.fieldnames = [];
            _this.views = {};
            _this.dependences = [];
            _this.ready(_this);
            return _this;
        }
        return ValModel;
    }(Model));
    exports.ValModel = ValModel;
    var RefModel = /** @class */ (function (_super) {
        __extends(RefModel, _super);
        function RefModel(opts) {
            var _this = this;
            if (typeof opts === "string") {
                _this = _super.call(this, opts, null) || this;
                Model.loadModelDefination(opts, function (loadedOpts) {
                    _this.opts = loadedOpts;
                    _this._init(loadedOpts);
                });
            }
            else {
                _this = _super.call(this, opts.fullname, opts) || this;
                _this._init(_this.opts);
            }
            return _this;
        }
        RefModel.prototype._init = function (opts) {
            this._initFields();
        };
        RefModel.prototype._initFields = function () {
            var _this = this;
            this.base = this.opts.base ? Model.model(this.opts.base) : null;
            if (this.base) {
                this.dependences.push(this.base);
                this.base.load(function (baseFields) {
                    _this._initThisFields(baseFields);
                });
            }
            else {
                this._initThisFields(null);
            }
        };
        RefModel.prototype._initThisFields = function (baseFields) {
            var fields = [];
            if (baseFields)
                for (var _i = 0, baseFields_1 = baseFields; _i < baseFields_1.length; _i++) {
                    var bField = baseFields_1[_i];
                    this._initField(bField.name, bField.opt, fields);
                }
            var fieldDefs = this.opts.fields;
            if (YA.is_array(fieldDefs)) {
                for (var _a = 0, fieldDefs_1 = fieldDefs; _a < fieldDefs_1.length; _a++) {
                    var def = fieldDefs_1[_a];
                    this._initField(def.name, def, fields);
                }
            }
            else {
                for (var n in fieldDefs) {
                    this._initField(n, fieldDefs[n], fields);
                }
            }
            this.load(fields);
            if (this.$__depPaddingCount__ === 0)
                this._completeFields(fields);
        };
        RefModel.prototype._initField = function (name, fieldOpt, fields) {
            var _this = this;
            var field = new Field(name, fieldOpt, this);
            fields.push(field);
            if (field.opts.expandable) {
                if (field.valueModel instanceof ValModel) {
                    console.error("Val类型不可以展开", fieldOpt, this);
                    throw new Error("Val类型不可以展开");
                }
                this.$__depPaddingCount__++;
                field.valueModel.load(function (relFields) {
                    _this._expandField(field, relFields);
                    if (--_this.$__depPaddingCount__ == 0)
                        _this._completeFields(fields);
                });
            }
        };
        RefModel.prototype._expandField = function (field, fieldFields) {
            for (var _i = 0, _a = field.opts.expandable; _i < _a.length; _i++) {
                var relName = _a[_i];
                var refField = field.valueModel.fields[relName];
                if (!refField) {
                    console.warn("expands使用了不存在的字段:" + relName, field);
                    continue;
                }
                var expandedName = field.name + relName;
                var expandedField = void 0;
                for (var _b = 0, fieldFields_1 = fieldFields; _b < fieldFields_1.length; _b++) {
                    var existed = fieldFields_1[_b];
                    if (existed.name === name) {
                        expandedField = existed;
                        break;
                    }
                }
                if (!expandedField)
                    expandedField = new Field(expandedName, refField.opts, this);
                var expands = (field.expends || (field.expends = {}));
                expands[relName] = expandedField;
                expandedField.collapse = { prinField: field, relField: refField };
            }
        };
        RefModel.prototype._completeFields = function (fields) {
            var selfFields = this.fields = {};
            for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                var existed = fields_1[_i];
                if (existed.expends) {
                    for (var n in existed.expends) {
                        var expandedField = existed.expends[n];
                        selfFields[expandedField.name] = expandedField;
                    }
                }
                selfFields[existed.name] = existed;
            }
            this._initViews();
        };
        RefModel.prototype._initViews = function () {
            this.views = {};
            this.views["detail"] = new View({ name: "detail", kind: "detail", fields: this.fieldnames }, this);
            this.views["edit"] = new View({ name: "edit", kind: "edit", fields: this.fieldnames }, this);
            this.views["list"] = new View({ name: "list", kind: "list", fields: this.fieldnames }, this);
            this.views["query"] = new View({ name: "query", kind: "query", fields: this.fieldnames }, this);
            if (this.opts.views) {
                var views = buildViews.call(this, "views", function (n, opt, model) { return new View(opt, model); });
                for (var n in views)
                    this.views[n] = views[n];
            }
            this.ready(this);
        };
        return RefModel;
    }(Model));
    exports.RefModel = RefModel;
    var ViewKinds;
    (function (ViewKinds) {
        ViewKinds[ViewKinds["detail"] = 0] = "detail";
        ViewKinds[ViewKinds["edit"] = 1] = "edit";
        ViewKinds[ViewKinds["list"] = 2] = "list";
        ViewKinds[ViewKinds["query"] = 3] = "query";
    })(ViewKinds = exports.ViewKinds || (exports.ViewKinds = {}));
    var FieldView = /** @class */ (function () {
        function FieldView(name, opts, panel) {
            this.name = name;
            this.opts = opts;
            this.panel = panel;
            var field = this.field = panel.model.fields.fields[name];
            if (!this.field)
                throw new Error("未能在模型" + this.panel.model.fullname + "中找到字段：" + name);
            this.sortable = opts.sortable === undefined ? field.sortable : opts.sortable;
            this.queryable = opts.queryable === undefined ? field.queryable : opts.queryable;
            if (opts.permission === undefined) {
                //其他的Permission如果放在Field上面就具有强制性
                if (this.field.permission === undefined || this.field.permission === null || this.field.permission === Permissions.writable) {
                    var panelPermission = panel.permission;
                    this.permission = panelPermission === undefined || null ? this.field.permission : panelPermission;
                }
                else
                    this.permission = this.field.permission;
            }
            else {
                this.permission = Permissions[opts.permission];
            }
            this.viewType = opts.viewType;
            this.usual = opts.usual === undefined ? this.field.usual : opts.usual;
            if (this.panel instanceof View) {
                if (this.usual) {
                    var usuals = this.panel.usualFieldViews || (this.panel.usualFieldViews = {});
                    usuals[this.name] = this;
                }
                if (this.queryable !== undefined) {
                    var queryables = this.panel.queryableFieldViews || (this.panel.queryableFieldViews = {});
                    queryables[this.name] = this;
                }
            }
        }
        return FieldView;
    }());
    var PanelTypes;
    (function (PanelTypes) {
        PanelTypes[PanelTypes["normal"] = 0] = "normal";
        PanelTypes[PanelTypes["group"] = 1] = "group";
        PanelTypes[PanelTypes["tab"] = 2] = "tab";
    })(PanelTypes = exports.PanelTypes || (exports.PanelTypes = {}));
    var PanelView = /** @class */ (function () {
        function PanelView(opts, model, panel) {
            var _this = this;
            this.opts = opts;
            this.model = model;
            this.panel = panel;
            this.panelType = PanelTypes.normal;
            this.name = opts.name;
            this.text = opts.text;
            this.kind = opts.kind === undefined ? undefined : ViewKinds[opts.kind];
            this.permission = opts.permission === undefined ? undefined : Permissions[opts.permission];
            if (this.permission === undefined && this.kind !== undefined) {
                switch (this.kind) {
                    case ViewKinds.detail: this.permission = Permissions.readonly;
                    case ViewKinds.edit: this.permission = Permissions.writable;
                    case ViewKinds.list: this.permission = Permissions.readonly;
                    case ViewKinds.query: this.permission = Permissions.readonly;
                }
            }
            model.ready(function () {
                _this.views = buildViews.call(_this, "fields", function (n, opt, panel) { return new FieldView(n, opt, panel); });
            });
        }
        PanelView.prototype.each = function (callback) {
            for (var n in this.views) {
                callback(this.views[n], this);
            }
            return this;
        };
        return PanelView;
    }());
    exports.PanelView = PanelView;
    fulfillable(Model.prototype, "ready");
    function buildViews(optName, factory) {
        var views = {};
        var viewOpts = this.opts[optName];
        if (!viewOpts)
            return views;
        if (YA.is_array(viewOpts)) {
            for (var _i = 0, _a = viewOpts; _i < _a.length; _i++) {
                var opt = _a[_i];
                if (typeof opt === "string") {
                    var view = factory(opt, {}, this);
                    views[view.name] = view;
                }
                else {
                    var name_1 = opt.name;
                    var field = factory(name_1, opt, this);
                    views[field.name] = field;
                }
            }
        }
        else {
            for (var name_2 in viewOpts) {
                var view = factory(name_2, viewOpts[name_2], this);
                views[view.name] = view;
            }
        }
        return views;
    }
    var GroupView = /** @class */ (function (_super) {
        __extends(GroupView, _super);
        function GroupView(opts, model, panel) {
            var _this = _super.call(this, opts, model, panel) || this;
            var panels = _this.panels = {};
            if (opts.panels) {
                model.ready(function (model) {
                    _this.panels = buildViews.call("panels", function (n, opt, panel) { return new PanelView(opt, model, _this); });
                });
            }
            return _this;
        }
        GroupView.prototype.each = function (callback) {
            _super.prototype.each.call(this, callback);
            for (var n in this.panels)
                this.panels[n].each(callback);
            return this;
        };
        return GroupView;
    }(PanelView));
    exports.GroupView = GroupView;
    var TabView = /** @class */ (function (_super) {
        __extends(TabView, _super);
        function TabView(opts, model, panel) {
            var _this = _super.call(this, opts, model, panel) || this;
            var panels = _this.tabs = {};
            if (opts.panels) {
                model.ready(function (model) {
                    _this.tabs = buildViews("tabs", function (n, opt, panel) { return new GroupView(opt, model, _this); });
                });
            }
            return _this;
        }
        TabView.prototype.each = function (callback) {
            _super.prototype.each.call(this, callback);
            for (var n in this.tabs)
                this.tabs[n].each(callback);
            return this;
        };
        return TabView;
    }(PanelView));
    exports.TabView = TabView;
    var View = /** @class */ (function (_super) {
        __extends(View, _super);
        function View(opts, model) {
            var _this = _super.call(this, opts, model, null) || this;
            _this.queryableFieldViews = null;
            _this.usualFieldViews = null;
            return _this;
        }
        View.prototype._initSchema = function () {
            var schema = this.modelSchema = new ObservableSchema(null);
            schema.asObject();
            var querySchema;
            if (this.kind == ViewKinds.query) {
                this.querySchema = new ObservableSchema(null);
                querySchema.asObject();
            }
            var listSchema;
            if (this.kind === ViewKinds.query || this.kind === ViewKinds.list) {
                listSchema = this.listSchema = new ObservableSchema([]);
                listSchema.$itemSchema.asObject();
            }
            this.each(function (fieldView) {
                Model.defineProp(schema, fieldView.field);
                if (listSchema) {
                    var prop = listSchema.$itemSchema.defineProp(fieldView.name);
                    if (fieldView.field.valueModel instanceof RefModel) {
                        fieldView.field.valueModel.buildSchema(null, prop);
                    }
                }
                if (fieldView.queryable !== undefined && querySchema) {
                    if (fieldView.queryable === "range") {
                        querySchema.defineProp(fieldView.name + "_min");
                        querySchema.defineProp(fieldView.name + "_max");
                    }
                    else {
                        querySchema.defineProp(fieldView.name);
                    }
                }
            });
            return schema;
        };
        return View;
    }(TabView));
    exports.View = View;
});
//# sourceMappingURL=YA.modeling.js.map