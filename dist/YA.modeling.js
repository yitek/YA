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
    var BasField = /** @class */ (function () {
        function BasField(model, opts) {
            this.model = model;
            if (!opts)
                return;
            this.defination = opts;
            this.name = YA.trim(opts.name);
            if (!this.name)
                throw new Error("\u5B57\u6BB5\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A@{model?.fullname}");
            this.description = opts.description;
            if (this.model)
                this.fullname = this.model.fullname + "." + this.name;
        }
        return BasField;
    }());
    exports.BasField = BasField;
    var FieldValueKinds;
    (function (FieldValueKinds) {
        FieldValueKinds[FieldValueKinds["embeded"] = 0] = "embeded";
        FieldValueKinds[FieldValueKinds["customized"] = 1] = "customized";
        FieldValueKinds[FieldValueKinds["enumeration"] = 2] = "enumeration";
    })(FieldValueKinds = exports.FieldValueKinds || (exports.FieldValueKinds = {}));
    var TypedField = /** @class */ (function (_super) {
        __extends(TypedField, _super);
        function TypedField(model, opts) {
            var _this = _super.call(this, model, opts) || this;
            //clone的时候，没有第二个参数，直接返回
            if (!opts)
                return _this;
            //获取类型的fullname
            _this.type = YA.trim(opts.type);
            //默认为string
            if (!_this.type)
                _this.type = "string";
            //内置类型检查
            if (YA.array_index(TypedField.EmbededTypes, _this.type) >= 0)
                _this.valueKind = FieldValueKinds.embeded;
            else {
                //处理枚举类型
                if (opts.enums) {
                    _this.valueKind = FieldValueKinds.enumeration;
                    if (typeof opts.enums === "string") {
                        throw "Not implement";
                    }
                    else {
                        _this.enums = reformEnum(opts.enums, _this.fullname);
                    }
                }
                else {
                    //处理自定义类型
                    _this.fieldType = Model.fetch(_this.type);
                    _this.valueKind = FieldValueKinds.customized;
                    _this.expandable = opts.expandable;
                    _this.collection = opts.collection;
                }
            }
            return _this;
        }
        TypedField.StringTypes = ["string", "text", "email", "password", "mobile", "telephone"];
        TypedField.NumberTypes = ["int", "uint", "long", "ulong", "float", "double", "decimal", "number"];
        TypedField.EmbededTypes = ["string", "text", "email", "password", "mobile", "telephone", "bool", "boolean", "int", "uint", "long", "ulong", "float", "double", "decimal", "number", "date", "datetime", "guid"];
        return TypedField;
    }(BasField));
    exports.TypedField = TypedField;
    function reformEnum(opts, context) {
        var enums = {};
        if (!opts)
            return enums;
        if (typeof opts === "string") {
            enums[opts] = { label: opts, value: opts, name: opts };
            return enums;
        }
        var empty = "";
        var isArr = YA.is_array(opts);
        for (var n in opts) {
            var item = opts[n];
            var itemName = void 0;
            if (!isArr)
                itemName = n;
            var t = typeof item;
            var enumItem = void 0;
            if (t === "string")
                enumItem = { label: item, value: item, name: itemName };
            else if (t === "object")
                enumItem = { label: item.label || item.name || empty, value: item.value, name: itemName || item.name || item.label || empty };
            else
                enumItem = { label: item.toString(), name: itemName || item.toString(), value: item };
            enumItem.name = YA.trim(enumItem.name);
            for (var n_1 in enums) {
                if (enums[n_1].value === enumItem.value)
                    throw new Error("枚举中出现重复的值:" + enumItem.value + ",@" + context);
            }
            var existed = enums[enumItem.name];
            if (existed)
                console.warn("\u679A\u4E3E\u4E2D\u51FA\u73B0\u91CD\u590D\u7684name,\u65B0\u7684\u679A\u4E3E\u9879\u5C06\u4F1A\u66FF\u6362\u6389\u539F\u5148\u7684\u679A\u4E3E\u9879,@" + context, existed, enumItem);
            enums[enumItem.name] = enumItem;
        }
        return enums;
    }
    var ValidatableField = /** @class */ (function (_super) {
        __extends(ValidatableField, _super);
        function ValidatableField(model, opts) {
            var _this = _super.call(this, model, opts) || this;
            if (!opts)
                return _this;
            _this.rules = {};
            //处理required
            if (opts.required !== undefined) {
                var required = opts.required;
                if (required !== false)
                    _this.rules["required"] = require;
            }
            else
                _this.required = false;
            //处理length
            if (opts.length !== undefined) {
                var lengthRule = reformLength(opts.length, _this.fullname);
                if (lengthRule.max)
                    _this.length = lengthRule.max;
                if (lengthRule.min || lengthRule.max)
                    _this.rules["length"] = lengthRule;
            }
            if (_this.valueKind === FieldValueKinds.embeded && YA.array_index(TypedField.NumberTypes, _this.type) >= 0) {
                _this.precision = opts.precision;
            }
            //验证类型
            if (_this.valueKind === FieldValueKinds.embeded)
                _this.rules[_this.type] = true;
            //验证枚举
            else if (_this.valueKind === FieldValueKinds.enumeration)
                _this.rules["enum"] = function () { return _this.enums; };
            for (var n in opts.rules) {
                var rule = opts.rules[n];
                if (n === "required" && rule !== false) {
                    _this.required = true;
                    continue;
                }
                if (n === "length" && !_this.rules["length"]) {
                    var lengthRule = reformLength(rule, _this.fullname);
                    if (lengthRule.max)
                        _this.length = lengthRule.max;
                    if (lengthRule.max || lengthRule.min) {
                        _this.rules["length"] = lengthRule;
                        continue;
                    }
                    continue;
                }
                _this.rules[n] = rule;
            }
            return _this;
        }
        return ValidatableField;
    }(TypedField));
    exports.ValidatableField = ValidatableField;
    function reformLength(length, context) {
        var t = typeof length;
        var min, max;
        if (t === "number") {
            max = length;
        }
        else if (t === "string")
            max = parseInt(length);
        else if (t === "object") {
            if (YA.is_array(length)) {
                min = length[0];
                max = length[1];
            }
            else {
                min = length.min;
                max = length.max;
            }
        }
        else
            throw new Error("\u9519\u8BEF\u7684length\u5B9A\u4E49\uFF0C@" + context + "}");
        return { min: min, max: max };
    }
    var DbIndexTypes;
    (function (DbIndexTypes) {
        DbIndexTypes[DbIndexTypes["none"] = 0] = "none";
        DbIndexTypes[DbIndexTypes["primary"] = 1] = "primary";
        DbIndexTypes[DbIndexTypes["unique"] = 2] = "unique";
        DbIndexTypes[DbIndexTypes["normal"] = 3] = "normal";
    })(DbIndexTypes = exports.DbIndexTypes || (exports.DbIndexTypes = {}));
    var DataField = /** @class */ (function (_super) {
        __extends(DataField, _super);
        function DataField(model, opts) {
            var _this = _super.call(this, model, opts) || this;
            if (!opts)
                return _this;
            if (opts.primary) {
                _this.primary = true;
                _this.index = DbIndexTypes.primary;
            }
            else if (opts.index) {
                if (typeof opts.index === "string")
                    _this.index = DbIndexTypes[opts.index];
                if (DbIndexTypes[_this.index] === undefined)
                    throw new Error("index\u7684\u5B9A\u4E49\u4E0D\u6B63\u786E@" + _this.fullname);
            }
            else
                _this.index = DbIndexTypes.none;
            if (!opts.dataType) {
                if (_this.valueKind === FieldValueKinds.embeded)
                    _this.dataType = _this.type;
            }
            if (_this.valueKind === FieldValueKinds.customized) {
                if (opts.reference) {
                    _this.reference = opts.reference;
                }
                else if (opts.hasOne) {
                    if (opts.hasOne === true) {
                        _this.reference = { hasMany: false, foreignTypeName: _this.type };
                    }
                    else
                        _this.reference = { hasMany: false, foreignTypeName: _this.type, foreignKey: opts.hasOne };
                }
                else if (opts.ownOne) {
                    _this.reference = { hasMany: false, foreignTypeName: _this.type, primaryKey: opts.ownOne };
                }
                else if (opts.hasMany) {
                    if (opts.hasMany === true) {
                        _this.reference = { hasMany: true, foreignTypeName: _this.type };
                    }
                    else
                        _this.reference = { hasMany: true, foreignTypeName: _this.type, foreignKey: opts.hasMany };
                }
                else if (opts.ownMany) {
                    _this.reference = { hasMany: true, foreignTypeName: _this.type, primaryKey: opts.ownMany };
                }
                else if (opts.manyMany) {
                    _this.reference = { hasMany: true, linkName: opts.manyMany[0] };
                }
            }
            return _this;
        }
        return DataField;
    }(ValidatableField));
    exports.DataField = DataField;
    /**
     * 字段查询方式
     *
     * @export
     * @enum {number}
     */
    var FieldQueryMethods;
    (function (FieldQueryMethods) {
        FieldQueryMethods[FieldQueryMethods["none"] = 0] = "none";
        FieldQueryMethods[FieldQueryMethods["equal"] = 1] = "equal";
        FieldQueryMethods[FieldQueryMethods["range"] = 2] = "range";
        FieldQueryMethods[FieldQueryMethods["contains"] = 3] = "contains";
    })(FieldQueryMethods = exports.FieldQueryMethods || (exports.FieldQueryMethods = {}));
    var ViewMember = /** @class */ (function () {
        function ViewMember(defination, field, view) {
            this.defination = defination;
            this.field = field;
            this.view = view;
            this.name = defination.name;
            ViewMember.init(this, defination, field);
        }
        ViewMember.init = function (member, opts, field) {
            member.readonly = opts.readonly;
            var queryable;
            if (opts.keyQueryable !== undefined) {
                queryable = getQueryable(field.keyQueryable, field.type, field.fullname);
                if (queryable)
                    member.keyQueryable = true;
            }
            else if (field) {
                member.keyQueryable = field.keyQueryable;
            }
            if (!queryable) {
                if (field)
                    queryable = field.queryable;
                else
                    queryable = getQueryable(field.queryable, field.type, field.fullname);
            }
            member.queryable = queryable;
            //listable
            if (opts.listable !== undefined) {
                var listable = makeListable(field.listable);
                if (listable === undefined)
                    throw new Error("\u5B57\u6BB5" + field.fullname + "\u7684listable\u8BBE\u7F6E\u4E0D\u6B63\u786E");
                field.listable = listable;
            }
            else {
                if (field)
                    field.listable = field.listable;
            }
        };
        return ViewMember;
    }());
    exports.ViewMember = ViewMember;
    function getQueryable(optValue, type, fieldname) {
        if (optValue === undefined)
            return FieldQueryMethods.none;
        var queryable;
        var t = typeof (optValue);
        if (t === "boolean") {
            if (optValue) {
                if (type === "string")
                    queryable = FieldQueryMethods.contains;
                if (type === "date" || type === "datetime")
                    queryable = FieldQueryMethods.range;
                queryable = FieldQueryMethods.equal;
            }
        }
        else if (t === "string") {
            queryable = FieldQueryMethods[optValue];
            if (queryable === undefined)
                throw new Error("\u5B57\u6BB5" + fieldname + "\u7684queryable/keyQueryable\u7684\u503C\u4E0D\u6B63\u786E");
        }
        else if (t === "number") {
            if (FieldQueryMethods[optValue] !== undefined) {
                queryable = optValue;
            }
            else
                throw new Error("\u5B57\u6BB5" + fieldname + "\u7684queryable/keyQueryable\u7684\u503C\u4E0D\u6B63\u786E");
        }
        else
            throw new Error("\u5B57\u6BB5" + fieldname + "\u7684queryable/keyQueryable\u7684\u503C\u4E0D\u6B63\u786E");
        return queryable;
    }
    function makeListable(optValue) {
        if (!optValue)
            return null;
        var t = typeof (optValue);
        if (t === "boolean") {
            return { sortable: true };
        }
        else if (t === "string") {
            if (optValue === ":hidden")
                return { hidden: true };
            return { sortable: true, url: optValue };
        }
        else if (t === "object") {
            if (optValue.sortable === undefined)
                optValue.sortable = true;
            return optValue;
        }
    }
    var Field = /** @class */ (function (_super) {
        __extends(Field, _super);
        function Field(model, opts) {
            var _this = _super.call(this, model, opts) || this;
            if (!opts)
                return _this;
            _this.inputType = opts.inputType || _this.type;
            _this.displayName = opts.displayName || _this.name;
            ViewMember.init(_this, opts);
            return _this;
        }
        return Field;
    }(DataField));
    exports.Field = Field;
    /**
     * 页面类型
     *
     * @export
     * @enum {number}
     */
    var ViewTypes;
    (function (ViewTypes) {
        /**
         * 编辑页面，默认的字段显示为可编辑的字段，一般用于add/modify
         */
        ViewTypes[ViewTypes["edit"] = 0] = "edit";
        /**
         * 详情页面，默认的字段显示为只读。
         */
        ViewTypes[ViewTypes["detail"] = 1] = "detail";
        /**
         * 列表
         */
        ViewTypes[ViewTypes["list"] = 2] = "list";
        /**
         * 查询，带着一个查询form的列表
         */
        ViewTypes[ViewTypes["query"] = 3] = "query";
    })(ViewTypes = exports.ViewTypes || (exports.ViewTypes = {}));
    var Group = /** @class */ (function () {
        function Group(view, defination) {
            this.view = view;
            this.defination = defination;
            this.name = defination.name;
            this.caption = defination.caption || this.name;
            this.members = {};
            for (var i in defination.members) {
                var membername = defination.members[i];
                var member = view.members[membername];
                if (!member)
                    throw new Error("无法识别的membername");
                this.members[member.name] = member;
            }
            if (defination.headActions)
                this.headActions = initActions(defination.headActions);
            if (defination.footActions)
                this.footActions = initActions(defination.footActions);
        }
        return Group;
    }());
    exports.Group = Group;
    var View = /** @class */ (function () {
        function View(model, defination) {
            this.model = model;
            this.defination = defination;
            this.name = YA.trim(defination.name);
            this.className = this.model.fullname.replace(/./g, "-") + " " + this.name;
            this.caption = defination.caption || this.name;
            if (typeof this.type === "string")
                this.type = ViewTypes[defination.viewType];
            if (ViewTypes[this.type] === undefined)
                throw new Error("无法识别的ViewType,它必须是ViewTypes");
            this.rowsPath = YA.DPath.fetch(defination.rowsPath || "rows");
            this.ascPath = YA.DPath.fetch(defination.ascPath || "asc");
            this.descPath = YA.DPath.fetch(defination.descPath || "desc");
            this.totalPath = YA.DPath.fetch(defination.totalPath || "total");
            this.filterPath = YA.DPath.fetch(defination.filterPath || "filter");
            var members = this.members;
            this.members = {};
            var isArr = YA.is_array(members);
            for (var i in members) {
                var memberOpt = members[i];
                var member = void 0;
                var membername = void 0;
                if (typeof memberOpt === "string") {
                    membername = YA.trim(memberOpt);
                    var field = model.fields[membername];
                    if (!field)
                        continue;
                    member = new ViewMember({ readonly: field.readonly }, field, this);
                }
                else {
                    membername = YA.trim(isArr ? memberOpt.name : i);
                    if (!membername)
                        throw new Error("未能定义membername");
                    var field = model.fields[membername];
                    if (!field)
                        continue;
                    memberOpt.name = membername;
                    member = new ViewMember(memberOpt, field, this);
                }
                this.members[member.name] = member;
                if (member.queryable) {
                    (this.queryMembers || (this.queryMembers = {}))[member.name] = member;
                    if (member.keyQueryable)
                        (this.queryKeyMembers || (this.queryKeyMembers = {}))[member.name] = member;
                }
                if (member.listable) {
                    (this.listMembers || (this.listMembers = {}))[member.name] = member;
                }
            }
            if (defination.headActions)
                this.headActions = initActions(defination.headActions);
            if (defination.bodyActions)
                this.bodyActions = initActions(defination.bodyActions);
            if (defination.footActions)
                this.footActions = initActions(defination.footActions);
            if (this.type === ViewTypes.detail || this.type === ViewTypes.edit) {
                if (defination.groups) {
                    this.groups = { "": null };
                    var isArr_1 = YA.is_array(defination.groups);
                    for (var n in this.groups) {
                        var groupname = "";
                        var groupOpt = this.groups[n];
                        if (isArr_1) {
                            groupname = n;
                        }
                        else
                            groupname = groupOpt.name;
                        groupname = YA.trim(groupname);
                        groupOpt.name = groupname;
                        this.groups[groupOpt.name] = new Group(this, groupOpt);
                    }
                }
                this.modelSchema = this._initDetailSchema();
            }
            else {
                this.listSchema = this._initListSchema();
                if (this.type == ViewTypes.query)
                    this.filterSchema = this._initFilterSchema();
            }
        }
        View.prototype._initDetailSchema = function () {
            var schema = new YA.ObservableSchema({}, "detail");
            var stack = [this.model];
            for (var n in this.members) {
                this._internalInitModelSchema(n, this.members[n].field, schema, stack);
            }
            return schema;
        };
        View.prototype._initFilterSchema = function () {
            var schema = new YA.ObservableSchema({}, "filter");
            var stack = [this.model];
            for (var n in this.queryMembers) {
                var member = this.queryMembers[n];
                if (member.queryable === FieldQueryMethods.range) {
                    this._internalInitModelSchema(n + "_min", member.field, schema, stack);
                    this._internalInitModelSchema(n + "_max", member.field, schema, stack);
                }
                else
                    this._internalInitModelSchema(n, member.field, schema, stack);
            }
            return schema;
        };
        View.prototype._initListSchema = function () {
            var schema = new YA.ObservableSchema([], "rows");
            var itemSchema = schema.asArray();
            var stack = [this.model];
            for (var n in this.listMembers) {
                this._internalInitModelSchema(n, this.members[n].field, itemSchema, stack);
            }
            return schema;
        };
        View.prototype._internalInitModelSchema = function (name, field, parentSchema, stack) {
            //不是引用类型，就直接在parentSchema上添加一个成员就可以了。
            if (!field.model) {
                parentSchema.defineProp(name);
                return;
            }
            //成员是引用类型，就要看
            //看是否已经在前面的类型使用过，要避免循环引用引起的无穷循环
            //
            var usedCount = 0;
            for (var _i = 0, stack_1 = stack; _i < stack_1.length; _i++) {
                var used = stack_1[_i];
                if (used === field.model)
                    usedCount++;
            }
            //前面还没用过0,或者只用过一次 node.parent.parent
            if (usedCount == 0) {
                //把自己的类型加到堆栈中，以便在构造它的属性的schema时做检查
                stack.push(field.model);
                //得到当前这个属性的schema;
                var subSchema = parentSchema.defineProp(name);
                //变成对象
                subSchema.asObject();
                //循环下级字段/属性
                var subFields = field.model.fields;
                for (var n in subFields) {
                    this._internalInitModelSchema(n, subFields[n], subSchema, stack);
                }
                stack.pop();
            }
            else {
                parentSchema.defineProp(field.name);
            }
        };
        return View;
    }());
    exports.View = View;
    var Model = /** @class */ (function (_super) {
        __extends(Model, _super);
        function Model(fullname) {
            var _this = this;
            var done, error;
            _this = _super.call(this, function (resolve, reject) {
                done = resolve;
                error = reject;
            }) || this;
            _this.fullname = YA.trim(fullname);
            _this.fields = {};
            _this.defFields = {};
            _this.expendableFields = {};
            _this.__loadCallbacks = [];
            _this.__readyCallbacks = [];
            _this.__loadDefination(_this.fullname);
            return _this;
        }
        Model.prototype.load = function (callback) {
            if (callback === "complete") {
                for (var i in this.__loadCallbacks) {
                    this.__loadCallbacks[i](this);
                }
                return this;
            }
            if (this.__loadCallbacks)
                this.__loadCallbacks = [];
            callback(this);
            return this;
        };
        Model.prototype.ready = function (callback) {
            if (callback === "complete") {
                for (var i in this.__loadCallbacks) {
                    this.__loadCallbacks[i](this);
                }
                return this;
            }
            if (this.__readyCallbacks)
                this.__readyCallbacks = [];
            callback(this);
            return this;
        };
        Model.prototype.__loadDefination = function (fullname) {
            var _this = this;
            Model.basUrl + "/" + fullname.replace(/./g, "/") + "model.json";
            load(fullname, function (opts, err) {
                if (err)
                    _this.__errorInfo = err;
                else
                    _this.__loadReferences(opts);
            });
        };
        Model.prototype.__loadReferences = function (opts) {
            var _this = this;
            this.references = {};
            var bases = opts.bases;
            this.bases = [];
            var waitingCount = 1;
            if (bases) {
                for (var i in bases) {
                    waitingCount++;
                    var basename = bases[i];
                    var base = Model.fetch(basename).load(function (base) {
                        if (_this.__errorInfo)
                            return;
                        if (--waitingCount === 0 && !_this.__errorInfo) {
                            _this.load("complete");
                            _this.__initInherit();
                        }
                    });
                    if (base === this) {
                        this.__errorInfo = new Error("循环继承");
                        throw this.__errorInfo;
                    }
                    this.references[base.fullname] = base;
                    this.bases[base.fullname] = base;
                    if (!this.base)
                        this.base = base;
                }
            }
            var fields = opts.fields;
            this.defFields = {};
            if (typeof fields !== "object") {
                this.__errorInfo = new Error("fields必须定义成{}或[]");
                throw this.__errorInfo;
            }
            var isArray = YA.is_array(fields);
            for (var i in fields) {
                var fieldOpt = fields[i];
                if (isArray && !fieldOpt.name) {
                    this.__errorInfo = new Error("字段必须要有名称");
                    throw this.__errorInfo;
                }
                var name_1 = YA.trim(isArray ? fieldOpt.name : i);
                if (name_1)
                    throw new Error("字段必须要有名称");
                if (this.defFields[name_1])
                    console.warn("已经有定义过" + name_1 + ",原先的定义");
                fieldOpt.name = name_1;
                var field = this.defFields[name_1] = new Field(this, fieldOpt);
                if (field.fieldType) {
                    waitingCount++;
                    field.fieldType.load(function (fieldModel) {
                        if (--waitingCount === 0 && !_this.__errorInfo) {
                            _this.load("complete");
                            _this.__initInherit();
                        }
                    });
                    if (field.expandable)
                        this.expendableFields[field.name] = field;
                }
            }
            if (--waitingCount === 0 && !this.__errorInfo) {
                this.load("complete");
                this.__initInherit();
            }
            return this;
        };
        Model.prototype.__initInherit = function () {
            var _this = this;
            if (this.base) {
                this.base.ready(function (baseModel) {
                    _this.__expandBase(baseModel);
                    _this.__initFields();
                });
            }
            else {
                this.__initFields();
            }
        };
        Model.prototype.__initFields = function () {
            var _this = this;
            var waitCount = 1;
            for (var n in this.defFields)
                (function (field, n) {
                    if (field.expandable) {
                        var expandFieldnames_1 = field.expandable;
                        if (!YA.is_array(expandFieldnames_1)) {
                            _this.__errorInfo = new Error("expandable\u914D\u7F6E\u4E0D\u6B63\u786E@" + _this.fullname);
                            throw new _this.__errorInfo;
                        }
                        waitCount++;
                        field.fieldType.ready(function (fieldModel) {
                            for (var i in expandFieldnames_1) {
                                var expandFieldname = expandFieldnames_1[i];
                                var expandField = fieldModel.fields[expandFieldname];
                                if (!expandField) {
                                    _this.__errorInfo = new EvalError("\u65E0\u6CD5\u627E\u5230expandable\u4E2D\u5B9A\u4E49\u7684\u5B57\u6BB5@" + _this.fullname);
                                    throw _this.__errorInfo;
                                    return;
                                }
                                var pname = field.name + expandField.name;
                                if (_this.fields[pname])
                                    continue;
                                var meField = new Field(_this, null);
                                for (var pn in expandField)
                                    meField[pn] = expandField[pn];
                                meField.model = _this;
                                meField.refField = expandField;
                                _this.fields[pname] = meField;
                                if (meField.expandable)
                                    _this.expendableFields[pname] = meField;
                            }
                            if (--waitCount == 0) {
                                if (!_this.__errorInfo)
                                    _this.__initBases();
                            }
                        });
                    }
                })(this.defFields[n], n);
            if (--waitCount == 0) {
                if (!this.__errorInfo)
                    this.__initBases();
            }
        };
        Model.prototype.__initBases = function () {
            var _this = this;
            //首先把Id找到
            for (var n in this.fields) {
                var field = this.fields[n];
                if (field.primary)
                    this.primary = field;
            }
            var waitingCount = 1;
            if (this.bases) {
                var index_1 = 0;
                for (var n in this.bases)
                    (function (base, name) {
                        //第一个已经处理过了
                        if (index_1 === 0) {
                            index_1++;
                            return;
                        }
                        waitingCount++;
                        base.ready(function (base) {
                            _this.__expandBase(base);
                            if (--waitingCount === 0 && !_this.__errorInfo)
                                _this.__initViews();
                        });
                    })(this.bases[n], n);
            }
            if (--waitingCount === 0 && !this.__errorInfo)
                this.__initViews();
        };
        Model.prototype.__expandBase = function (baseModel) {
            for (var n in baseModel.fields) {
                var baseField = baseModel.fields[n];
                //因为后面的是混入类，其成员优先级较低，已经存在的就不会覆盖了
                if (this.fields[n])
                    continue;
                var meField = new Field(this, null);
                for (var pn in baseField)
                    meField[pn] = baseField[pn];
                meField.model = this;
                meField.refField = baseField;
                this.fields[n] = meField;
            }
        };
        Model.prototype.__initViews = function () {
            if (!this.primary) {
                var primaryKey = this.defination.primary;
                if (primaryKey)
                    this.primary = this.fields[primaryKey];
            }
            var views = this.views;
            var isArray = YA.is_array(views);
            for (var i in views) {
                var viewOpt = views[i];
                if (isArray && !viewOpt.name)
                    throw new Error("字段必须要有名称");
                var name_2 = YA.trim(isArray ? viewOpt.name : i);
                if (name_2)
                    throw new Error("字段必须要有名称");
                if (this.views[name_2])
                    console.warn("已经有定义过" + name_2 + ",原先的定义");
                viewOpt.name = name_2;
                this.views[name_2] = new View(this, viewOpt);
            }
            this.ready("complete");
        };
        Model.fetch = function (fullname) {
            var existed = Model.models[fullname];
            if (existed)
                return existed;
            return Model.models[fullname] = new Model(fullname);
        };
        return Model;
    }(YA.Promise));
    exports.Model = Model;
    function load(url, callback) {
        var xhr = new XMLHttpRequest();
        //使用变量赋值new个XHR请求
        xhr.open("GET", url, true);
        xhr.responseType = "text";
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var json = JSON.parse(xhr.responseText);
                callback(json, xhr.status == 200 ? true : false);
            }
        };
        xhr.onerror = function () {
            callback(xhr, false);
        };
    }
    var MemberViewPositions;
    (function (MemberViewPositions) {
        MemberViewPositions[MemberViewPositions["fieldset"] = 0] = "fieldset";
        MemberViewPositions[MemberViewPositions["filter"] = 1] = "filter";
        MemberViewPositions[MemberViewPositions["tableHeader"] = 2] = "tableHeader";
        MemberViewPositions[MemberViewPositions["cell"] = 3] = "cell";
    })(MemberViewPositions = exports.MemberViewPositions || (exports.MemberViewPositions = {}));
    var InputViewTypes;
    (function (InputViewTypes) {
        InputViewTypes[InputViewTypes["unknown"] = 0] = "unknown";
        InputViewTypes[InputViewTypes["disable"] = 1] = "disable";
        InputViewTypes[InputViewTypes["hidden"] = 2] = "hidden";
        InputViewTypes[InputViewTypes["readonly"] = 3] = "readonly";
        InputViewTypes[InputViewTypes["editable"] = 4] = "editable";
    })(InputViewTypes = exports.InputViewTypes || (exports.InputViewTypes = {}));
    var Renderer = /** @class */ (function () {
        function Renderer(view) {
            this.view = view;
            this.model = view.model;
            this.elementInfos = {};
        }
        Renderer.prototype.render = function (container) {
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
    var DomUtility = YA.DomUtility;
    var componentFactories = {};
    function textFactory(member, initValue, memberViewType, container) {
    }
    function createFieldInput(member, inputViewType, initValue, container) {
        var info;
        var factory = componentFactories[member.field.type];
        if (factory)
            info = factory(member, initValue, inputViewType, container);
        else {
            if (member.field.enums) {
                initValue = getEnumText(member.field.enums, initValue);
            }
        }
        if (info === undefined) {
            var content = initValue;
            if (content === undefined || content === null)
                content = "";
            var inputElem_1 = DomUtility.createText(content);
            if (container)
                container.appendChild(inputElem_1);
            info = {
                inputElement: inputElem_1,
                getElementValue: function () { return inputElem_1.nodeValue; },
                setElementValue: function (val) { return inputElem_1.nodeValue = val === null || val === undefined ? "" : val.toString(); }
            };
        }
        return info;
    }
    function getEnumText(enumItems, value) {
        for (var n in enumItems) {
            var item = enumItems[n];
            if (item.value === value)
                return item.label;
        }
        return "";
    }
    function getEnumValue(enumItems, name) {
        var item = enumItems[name];
        if (item)
            return item.value;
        return undefined;
    }
    function getEnumItem(enumItems, value) {
        for (var n in enumItems) {
            var item = enumItems[n];
            if (item.value === value || item.name === value)
                return item;
        }
        return undefined;
    }
    var DetailPartial = /** @class */ (function (_super) {
        __extends(DetailPartial, _super);
        function DetailPartial(view) {
            return _super.call(this, view) || this;
        }
        DetailPartial.prototype.render = function (permissions) {
        };
        return DetailPartial;
    }(Renderer));
    exports.DetailPartial = DetailPartial;
    var ListPartial = /** @class */ (function (_super) {
        __extends(ListPartial, _super);
        function ListPartial(view) {
            return _super.call(this, view) || this;
        }
        ListPartial.prototype.render = function (container) {
        };
        return ListPartial;
    }(Renderer));
    exports.ListPartial = ListPartial;
    function initActions(actionsOpts) {
        var actions = [];
        for (var i in actionsOpts) {
            var actionOpt = actionsOpts[i];
            var action = void 0;
            if (typeof actionOpt === "string")
                action = { type: actionOpt };
            else if (YA.is_object(actionOpt))
                action = actionOpt;
            else {
                console.warn("action必须是string/object，该配置不是合适的类型，被忽略");
                continue;
            }
            if (!action.type) {
                if (action.url)
                    action.type = "link";
                else
                    action.type = "button";
            }
            if (!action.displayName)
                action.displayName = action.type;
            actions.push(action);
        }
        return actions;
    }
    exports.validators = {
        "required": function (value, opts) {
            if (opts === false)
                return true;
            if (opts === "strict") {
                if (typeof value === "string")
                    return YA.trim(value) !== "";
                for (var n in value)
                    return true;
                return false;
            }
            return value != 0;
        }
    };
});
//# sourceMappingURL=YA.modeling.js.map