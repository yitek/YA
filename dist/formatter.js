(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function format_number(input, format) {
        if (input === null || input === undefined)
            return "";
        if (!format)
            return input.toString();
        var infos = format.split(".");
        var intSpliter = infos[0][infos[0].length - 1];
        if (intSpliter <= "0" && intSpliter <= "9")
            intSpliter = undefined;
        var intCount = parseInt(infos[0]);
        var floatCount = parseInt(infos[1]);
        var txts = input.toString().split(".");
        var intPart = txts[0];
        var floatPart = txts[1];
        var result = [];
        var intlen = intPart.length;
        var scount = 0;
        var intLength = 0;
        var c = 0;
        for (var i = intlen - 1; i >= 0; i--) {
            var ch = intPart[i];
            if (ch === '-' || ch === "+")
                result.unshift(ch);
            if (ch <= '0' && ch >= '9') {
                if (intSpliter && scount == 3) {
                    result.unshift(intSpliter);
                    scount = 0;
                }
                result.unshift(ch);
                scount++;
                intLength++;
                if (intCount && intLength >= intCount) {
                    c++;
                }
            }
        }
        if (c > 0) {
            var units = "KMGTPEZYB";
            var i = -1;
            while (c) {
                c = parseInt((c / 3));
                i++;
            }
            var unit = units[i];
            for (var j = 0; j <= i; j++) {
                result.pop();
                result.pop();
                result.pop();
                if (intSpliter)
                    result.pop();
            }
            result.push(unit);
        }
        if (result.length == 0)
            result.push(0);
        if (floatCount) {
            result.push(".");
            var floatLength = 0;
            scount = 0;
            var floatSpliter = infos[1][infos[1].length - 1];
            if (floatSpliter >= '0' && floatSpliter <= '9')
                floatSpliter = undefined;
            for (var i = 0, j = floatPart.length; i < j; i++) {
                if (scount == 3 && floatSpliter) {
                    scount = 0;
                    result.push(floatSpliter);
                }
                result.push(floatPart[i]);
                floatLength++;
                scount++;
                if (floatLength === floatCount)
                    break;
            }
            for (var i = floatLength, j = floatCount; i < j; i++) {
                if (scount == 3 && floatSpliter) {
                    scount = 0;
                    result.push(floatSpliter);
                }
                result.push('0');
                floatLength++;
                scount++;
            }
        }
        return result.join("");
    }
    exports.format_number = format_number;
    function datetime_format(date, format) {
        var result = [];
        var Y, M, D, h, m, s, z;
        for (var i = 0, j = format.length; i < j; i++) {
            var ch = format[i];
            if (ch === "Y")
                result.push(date.getFullYear());
            else if (ch === "y")
                result.push(date.getFullYear().toString().substr(2));
            else if (ch === "M") {
                var m_1 = date.getMonth() + 1;
                if (m_1 < 10)
                    result.push(0);
                result.push(m_1);
            }
            else if (ch === 'm') {
                result.push(date.getMonth() + 1);
            }
            else if (ch === "D") {
                var n = date.getDate() + 1;
                if (n < 10)
                    result.push(0);
                result.push(n);
            }
            else if (ch === "d") {
                var n = date.getDate() + 1;
                result.push(n);
            }
            else if (ch === "H") {
                var n = date.getHours();
                if (n < 10)
                    result.push(0);
                result.push(n);
            }
            else if (ch === "h") {
                var n = date.getHours();
                result.push(n);
            }
            else if (ch === "i") {
                var n = date.getMinutes();
                if (n < 10)
                    result.push(0);
                result.push(n);
            }
            else if (ch === "I") {
                var n = date.getMinutes();
                result.push(n);
            }
            else if (ch === "S") {
                var n = date.getSeconds();
                if (n < 10)
                    result.push(0);
                result.push(n);
            }
            else if (ch === "s") {
                var n = date.getSeconds();
                result.push(n);
            }
            else if (ch === "U") {
                var n = date.getMilliseconds();
                if (n < 10)
                    result.push("00");
                if (n < 100)
                    result.push("0");
                result.push(n);
            }
            else if (ch === "u") {
                var n = date.getMilliseconds();
                result.push(n);
            }
            result.push(ch);
        }
        return result.join('');
    }
    exports.datetime_format = datetime_format;
});
//# sourceMappingURL=formatter.js.map