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
    var YA_dom_1 = require("YA.dom");
    var Host = YA.Host;
    var Directions;
    (function (Directions) {
        Directions[Directions["Vertical"] = 0] = "Vertical";
        Directions[Directions["Horizontal"] = 1] = "Horizontal";
    })(Directions = exports.Directions || (exports.Directions = {}));
    var ResizerLocations;
    (function (ResizerLocations) {
        ResizerLocations[ResizerLocations["left"] = 0] = "left";
        ResizerLocations[ResizerLocations["leftTop"] = 1] = "leftTop";
        ResizerLocations[ResizerLocations["top"] = 2] = "top";
        ResizerLocations[ResizerLocations["topRight"] = 3] = "topRight";
        ResizerLocations[ResizerLocations["right"] = 4] = "right";
        ResizerLocations[ResizerLocations["rightBottom"] = 5] = "rightBottom";
        ResizerLocations[ResizerLocations["bottom"] = 6] = "bottom";
        ResizerLocations[ResizerLocations["bottomLeft"] = 7] = "bottomLeft";
    })(ResizerLocations = exports.ResizerLocations || (exports.ResizerLocations = {}));
    var ResizerLocationInfos = {
        "left": { zIndex: 9999990, cursor: "w-resize" },
        "leftTop": { zIndex: 9999991, cursor: "nw-resize" },
        "top": { zIndex: 9999990, cursor: "n-resize" },
        "topRight": { zIndex: 9999991, cursor: "ne-resize" },
        "right": { zIndex: 9999990, cursor: "e-resize" },
        "rightBottom": { zIndex: 9999991, cursor: "se-resize" },
        "bottom": { zIndex: 9999990, cursor: "s-resize" },
        "bottomLeft": { zIndex: 9999991, cursor: "sw-resize" }
    };
    var Resizeable = /** @class */ (function () {
        function Resizeable(target) {
            var _this = this;
            this.target = YA_dom_1.dom(target);
            var dock = this._dock;
            this._dock = function () { return dock.call(_this); };
        }
        Resizeable.prototype.enable = function (opts) {
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g, _h;
            (_a = this.left_resizer) === null || _a === void 0 ? void 0 : _a.remove();
            (_b = this.leftTop_resizer) === null || _b === void 0 ? void 0 : _b.remove();
            (_c = this.top_resizer) === null || _c === void 0 ? void 0 : _c.remove();
            (_d = this.topRight_resizer) === null || _d === void 0 ? void 0 : _d.remove();
            (_e = this.right_resizer) === null || _e === void 0 ? void 0 : _e.remove();
            (_f = this.rightBottom_resizer) === null || _f === void 0 ? void 0 : _f.remove();
            (_g = this.bottom_resizer) === null || _g === void 0 ? void 0 : _g.remove();
            (_h = this.bottomLeft_resizer) === null || _h === void 0 ? void 0 : _h.remove();
            if (opts === false) {
                YA_dom_1.dom(window).off("resize", this._dock);
                return this;
            }
            var locations = (YA.is_array(opts.location) ? opts.location : [opts.location]);
            for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
                var loc = locations_1[_i];
                var elem = void 0;
                var name_1 = typeof loc === "string" ? loc : ResizerLocations[loc];
                var info = ResizerLocationInfos[name_1];
                if (!info)
                    throw new Error("错误的位置:" + name_1);
                this[name_1 + "_resizer"] = YA_dom_1.dom("<div style='position:absolute;cursor:" + info.cursor + ";z-index:" + info.zIndex + ";' class=\"" + name_1 + "-resizer\"></div>")
                    .width(this.resizer_size).height(this.resizer_size)
                    .parent(this.target.parent())
                    .prop("_YA_RSZ_LOCATION_NAME", name_1)
                    .on("mousedown", function (evt) { return _this._resizeStart(evt); });
            }
            this._dock();
            YA_dom_1.dom(window).on("resize", this._dock);
            return this;
        };
        Resizeable.prototype._dock = function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var pos = this.target.pos();
            var sz = this.target.size();
            var rw = this.resizer_size / 2 || 1;
            (_a = this.left_resizer) === null || _a === void 0 ? void 0 : _a.left(pos.x - rw).top(pos.x).height(sz.height);
            (_b = this.leftTop_resizer) === null || _b === void 0 ? void 0 : _b.top(pos.y - rw).left(pos.x - rw);
            (_c = this.top_resizer) === null || _c === void 0 ? void 0 : _c.top(-rw).left(pos.x).width(sz.width);
            (_d = this.topRight_resizer) === null || _d === void 0 ? void 0 : _d.top(-rw).left(sz.width - rw);
            (_e = this.right_resizer) === null || _e === void 0 ? void 0 : _e.top(pos.y).left(sz.width - rw).height(sz.height);
            (_f = this.rightBottom_resizer) === null || _f === void 0 ? void 0 : _f.top(sz.height - rw).left(sz.width - rw);
            (_g = this.bottom_resizer) === null || _g === void 0 ? void 0 : _g.top(sz.height - rw).left(-rw).width(sz.width);
            (_h = this.bottomLeft_resizer) === null || _h === void 0 ? void 0 : _h.top(sz.height - rw).left(-rw);
        };
        Resizeable.prototype._resizeStart = function (evt) {
            var _this = this;
            var locname = evt.target["_YA_RSZ_LOCATION_NAME"];
            var move_handler = this["_" + locname + "Resize"];
            var x = evt.clientX;
            var y = evt.clientY;
            var apos = YA_dom_1.dom(evt.target).abs();
            apos.x += evt.clientX;
            apos.y += evt.clientY;
            this._msPos = apos;
            this._msSize = this.target.size();
            var doc = Host.document;
            var msk = YA_dom_1.dom("<div style='position:absolute;top:0;height:0;background-color:#fff;z-index:999999999;'></div>")
                .width(Math.max(doc.body.offsetWidth, doc.documentElement.offsetWidth))
                .height(Math.max(doc.body.offsetHeight, doc.documentElement.offsetHeight))
                .parent(doc.body)
                .on("mousemove", function (evt) { return move_handler.call(_this, evt); })
                .on("mouseup", function (evt) {
                move_handler.call(_this, evt);
                msk.remove();
                msk = undefined;
            }).on("mouseout", function (evt) {
                move_handler.call(_this, evt);
                msk.remove();
                msk = undefined;
            });
        };
        Resizeable.prototype._leftResize = function (evt) {
            var x = evt.offsetX;
            var dw = x - this._msPos.x;
            var w = this._msSize.w + dw;
            if (w > this.max_width || w < this.min_width)
                return;
            this.target.width(this._msSize.w = w).left(this._msPos.x += dw);
            this.left_resizer.left(this._rszrPos.x += dw);
        };
        Resizeable.prototype._leftTopResize = function (evt) {
            var x = evt.offsetX;
            var y = evt.offsetY;
            var dw = x - this._msPos.x;
            var dh = y - this._msPos.y;
            var w = this._msSize.w + dw;
            var h = this._msSize.h + dh;
            if (w <= this.max_width && w >= this.min_width) {
                this.target.width(this._msSize.w = w).left(this._msPos.x += dw);
            }
            if (h <= this.max_height && w >= this.min_height) {
                this.target.height(this._msSize.h = h).top(this._msPos.y += dh);
            }
            this.leftTop_resizer.left(this._rszrPos.x += dw).top(this._rszrPos.y += dh);
        };
        Resizeable.prototype._topResize = function (evt) {
            var y = evt.offsetY;
            var dh = y - this._msPos.y;
            var h = this._msSize.h + dh;
            if (h <= this.max_height) {
                this.target.height(this._msSize.h = h).top(this._msPos.y += dh);
            }
            this.top_resizer.top(this._rszrPos.y += dh);
        };
        Resizeable.prototype._topRightResize = function (evt) {
            var x = evt.offsetX;
            var y = evt.offsetY;
            var dw = x - this._msPos.x;
            var dh = y - this._msPos.y;
            var w = this._msSize.w + dw;
            var h = this._msSize.h + dh;
            if (w <= this.max_width && w >= this.min_width) {
                this.target.width(this._msSize.w = w);
            }
            if (h <= this.max_height && w >= this.min_height) {
                this.target.height(this._msSize.h = h).top(this._msPos.y += dh);
            }
            this.topRight_resizer.left(this._rszrPos.x += dw).top(this._rszrPos.y += dh);
        };
        Resizeable.prototype._rightResize = function (evt) {
            var x = evt.offsetX;
            var dw = x - this._msPos.x;
            var w = this._msSize.w + dw;
            if (w > this.max_width || w < this.min_width)
                return;
            this.target.width(this._msSize.w = w);
            this.right_resizer.left(this._rszrPos.x += dw);
        };
        Resizeable.prototype._rightBottomResize = function (evt) {
            var x = evt.offsetX;
            var y = evt.offsetY;
            var dw = x - this._msPos.x;
            var dh = y - this._msPos.y;
            var w = this._msSize.w + dw;
            var h = this._msSize.h + dh;
            if (w <= this.max_width && w >= this.min_width) {
                this.target.width(this._msSize.w = w);
            }
            if (h <= this.max_height && w >= this.min_height) {
                this.target.height(this._msSize.h = h);
            }
            this.topRight_resizer.left(this._rszrPos.x += dw).top(this._rszrPos.y += dh);
        };
        Resizeable.prototype._bottomResize = function (evt) {
            var y = evt.offsetY;
            var dh = y - this._msPos.y;
            var h = this._msSize.h + dh;
            if (h <= this.max_height) {
                this.target.height(this._msSize.h = h);
            }
            this.bottom_resizer.top(this._rszrPos.y += dh);
        };
        Resizeable.prototype._bottomLeftResize = function (evt) {
            var x = evt.offsetX;
            var y = evt.offsetY;
            var dw = x - this._msPos.x;
            var dh = y - this._msPos.y;
            var w = this._msSize.w + dw;
            var h = this._msSize.h + dh;
            if (w <= this.max_width && w >= this.min_width) {
                this.target.width(this._msSize.w = w).left(this._msPos.x += dw);
            }
            if (h <= this.max_height && w >= this.min_height) {
                this.target.height(this._msSize.h = h);
            }
            this.bottomLeft_resizer.left(this._rszrPos.x += dw).top(this._rszrPos.y += dh);
        };
        return Resizeable;
    }());
    exports.Resizeable = Resizeable;
    var Spliter = /** @class */ (function () {
        function Spliter(target) {
            this.dom = YA_dom_1.dom(target);
        }
        return Spliter;
    }());
    exports.Spliter = Spliter;
    var Anchor = /** @class */ (function () {
        function Anchor(target) {
            this.target = YA_dom_1.dom(target);
            this.target.prop(Anchor.token, this, function (newv, oldv) {
                return newv;
            });
        }
        Anchor.prototype.capture = function (opts) {
            var _this = this;
            if (this.adjust) {
                YA_dom_1.dom(Host.window).off("resize", this.adjust);
            }
            this.adjust = function () {
                var psz = _this.target.parent().size();
            };
        };
        Anchor.token = "$_YA_ANCHOR_INST";
        return Anchor;
    }());
    exports.Anchor = Anchor;
});
//# sourceMappingURL=YA.dom.container.js.map