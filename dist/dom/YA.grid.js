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
        define(["require", "exports", "../YA.core", "../YA.dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var YA = require("../YA.core");
    var Dom = require("../YA.dom");
    var ObservableList = /** @class */ (function (_super) {
        __extends(ObservableList, _super);
        function ObservableList(nodeFactory) {
            var _this = _super.call(this) || this;
            _this.nodeFactory = nodeFactory;
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
        Column.prototype.renderCaption = function () {
            var _this = this;
            var elem = document.createElement("div");
            elem.innerHTML = "<label></label><ins></ins>";
            var textOb = this.text;
            textOb.subscribe(function (e) {
                _this.element.firstChild.innerHTML = e.value;
            }, this.grid);
            this.element.firstChild.innerHTML = textOb.get(YA.ObservableModes.Value);
        };
        Column.prototype.remove = function () {
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
        return Row;
    }(ObservableList));
    var Cell = /** @class */ (function () {
        function Cell(column, row) {
            this.column = column;
            this.row = row;
        }
        Cell.prototype.render = function () {
            var cellElem = this.element = document.createElement("div");
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
    }(Dom.Panel));
    exports.Grid = Grid;
});
//# sourceMappingURL=YA.grid.js.map