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
        define(["require", "exports", "../YA.core", "YA.dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var YA = require("../YA.core");
    var Dom = require("YA.dom");
    var ObservableList = /** @class */ (function (_super) {
        __extends(ObservableList, _super);
        function ObservableList(nodeFactory) {
            var _this = _super.call(this) || this;
            _this.nodeFactory = nodeFactory;
            _this.length = 0;
            return _this;
        }
        ObservableList.prototype.get = function (index) {
            var i = 0;
            var elem = this.first;
            while (elem) {
                if (i == index)
                    return elem;
                elem = elem.next;
                i++;
            }
            return null;
        };
        ObservableList.prototype.set = function (index, item, force) {
            if (index === 0) {
                this.first.prev = item;
                item.next = this.first;
                this.first = item;
                return this;
            }
            var exist = this.first;
            index = index - 1;
            for (var i = 0; i < index; i++) {
                if (exist) {
                    exist = exist.next;
                    continue;
                }
                if (force) {
                    var inserted = this.nodeFactory.createNode(i);
                    this.last.next = inserted;
                    inserted.next = this.last;
                    exist = this.last = inserted;
                }
            }
            var next = exist.next;
            exist.next = item;
            if (next) {
                next.prev = item;
                item.next = next;
            }
            else
                this.last = item;
            return this;
        };
        ObservableList.prototype.append = function (item) {
            if (!this.first)
                this.first = this.last = item;
            else {
                this.last.next = item;
                item.prev = this.last;
                this.last = item;
            }
            this.length++;
            return this;
        };
        ObservableList.prototype.insert = function (newCell, isBefore) {
            var cell = this.first;
            if (!cell) {
                this.first = this.last = newCell;
                return this;
            }
            while (cell) {
                if (isBefore(cell, newCell)) {
                    if (!cell.prev) {
                        this.first = newCell;
                    }
                    else {
                        cell.prev.next = newCell;
                    }
                    cell.prev = newCell;
                    newCell.next = cell;
                    return this;
                }
            }
            this.last.next = newCell;
            newCell.prev = this.last;
            this.last = newCell;
            this.length++;
            return this;
        };
        return ObservableList;
    }(YA.Subject));
    var Column = /** @class */ (function (_super) {
        __extends(Column, _super);
        function Column(grid) {
            var _this = _super.call(this, grid) || this;
            _this.grid = grid;
            return _this;
        }
        Object.defineProperty(Column.prototype, "frozen", {
            get: function () {
                return this.$__frozen__;
            },
            set: function (value) {
                var old = this.$__frozen__;
                this.$__frozen__ = value;
                if (old && !value) {
                }
            },
            enumerable: true,
            configurable: true
        });
        Column.prototype._froze = function () {
            var cell = this.first;
            while (cell) {
                var cellRow = cell.row;
                var cols = this.grid.columns;
                var forzenRowElement = cellRow.elements[1];
                if (!forzenRowElement) {
                    forzenRowElement = forzenRowElement = document.createElement("div");
                    forzenRowElement.className = "row frozen";
                }
                var col = cols.first;
                while (col) {
                    if (!col.$__frozen__) {
                        col.$__frozen__ = true;
                    }
                }
            }
        };
        Column.prototype.renderCaption = function () {
            var _this = this;
            var elem = this.element = document.createElement("div");
            elem.innerHTML = "<label></label><ins></ins>";
            var textOb = this.text;
            textOb.subscribe(function (e) {
                _this.element.firstChild.innerHTML = e.value;
            }, this.grid);
            this.element.firstChild.innerHTML = textOb.get(YA.ObservableModes.Value);
            this.element.firstChild.onclick = function () { };
            return elem;
        };
        Column.prototype.remove = function () {
            this.element.parentElement.removeChild(this.element);
            var cell = this.first;
            while (cell) {
                cell.element.parentNode.removeChild(cell.element);
                cell = cell.next;
            }
        };
        return Column;
    }(ObservableList));
    var ColumnCollection = /** @class */ (function (_super) {
        __extends(ColumnCollection, _super);
        function ColumnCollection(grid) {
            return _super.call(this, grid) || this;
        }
        return ColumnCollection;
    }(ObservableList));
    var Row = /** @class */ (function (_super) {
        __extends(Row, _super);
        function Row() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Row.prototype.remove = function () {
            this.element.parentNode.removeChild(this.element);
            return this;
        };
        Row.prototype.render = function () {
            var normalRow;
            var frozenRow;
            var cols = this.grid.columns;
            this.first = this.last = null;
            for (var i = 0, j = cols.length; i < j; i++) {
                var col = cols.get(i);
                var cell = new Cell(col, this);
                if (!this.first)
                    this.first = this.last = cell;
                else {
                    this.last.next = cell;
                    cell.prev = this.last;
                    this.last = cell;
                }
                var cellElem = cell.render();
                if (col.frozen) {
                    if (!frozenRow) {
                        normalRow == document.createElement("div");
                        normalRow.className = "row normal";
                    }
                    else {
                        frozenRow == document.createElement("div");
                        frozenRow.className = "row frozen";
                    }
                    frozenRow.appendChild(cellElem);
                }
                else {
                    normalRow.appendChild(cellElem);
                }
                col = col.next;
            }
            return this.elements = [normalRow, frozenRow];
        };
        return Row;
    }(ObservableList));
    var Cell = /** @class */ (function () {
        function Cell(column, row) {
            this.column = column;
            this.row = row;
        }
        Cell.prototype.render = function () {
            var cellElem = this.element = document.createElement("div");
            cellElem.className = "cell";
            var innerElement = this.column.renderContent(this.row.data, this);
            cellElem.appendChild(innerElement);
            return cellElem;
        };
        return Cell;
    }());
    var Grid = /** @class */ (function (_super) {
        __extends(Grid, _super);
        function Grid() {
            return _super.call(this) || this;
        }
        Grid.prototype._sureElement = function () {
            if (!this.$__element__) {
                this.$__element__ = document.createElement("div");
                this.$__element__.className = "grid";
                this.$__element__.style.display = "table";
            }
            return this.$__element__;
        };
        Grid.prototype._sureFrozen = function () {
            if (!this.$__frozenElement__) {
                this.$__frozenElement__ = document.createElement("div");
                this.$__frozenElement__.style.display = "table-row";
                this.$__frozenElement__.className = "frozen";
                if (this.$__normalElement__) {
                    this.$__element__.insertBefore(this.$__frozenElement__, this.$__normalElement__);
                }
                else
                    this.$__element__.appendChild(this.$__frozenElement__);
            }
            return this.$__frozenElement__;
        };
        Grid.prototype._sureNormal = function () {
            if (!this.$__normalElement__) {
                this.$__normalElement__ = document.createElement("div");
                this.$__normalElement__.style.display = "table-row";
                this.$__normalElement__.className = "normal";
                this.$__element__.appendChild(this.$__normalElement__);
            }
            return this.$__normalElement__;
        };
        Grid.prototype._sureForzenFrozen = function () {
            if (!this.$__frozenFrozenElement__) {
                var frozenElement = this._sureFrozen();
                var tb = this.$__frozenFrozenElement__ = document.createElement("table");
                tb.style.display = "table-cell";
                tb.className = "frozen-frozen";
                if (this.$__frozenNormalElement__) {
                    frozenElement.insertBefore(tb, this.$__frozenNormalElement__);
                }
                else
                    frozenElement.appendChild(tb);
            }
            return this.$__frozenFrozenElement__;
        };
        Grid.prototype._sureForzenNormal = function () {
            if (!this.$__frozenNormalElement__) {
                var frozenElement = this._sureFrozen();
                var tb = this.$__frozenFrozenElement__ = document.createElement("table");
                tb.style.display = "table-cell";
                tb.className = "frozen-normal";
                frozenElement.appendChild(tb);
            }
            return this.$__frozenNormalElement__;
        };
        Grid.prototype._columnInserted = function (col) {
            var row = this.rows.first;
            while (row) {
                var insertedCell = new Cell(col, row);
                row.insert(insertedCell, function (exist, inserted) { return exist.column.prev === inserted.column.prev; });
                row = row.next;
            }
            return this;
        };
        return Grid;
    }(Dom.Component));
    exports.Grid = Grid;
});
//# sourceMappingURL=YA.grid.js.map