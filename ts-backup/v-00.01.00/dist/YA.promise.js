var PromiseStates;
(function (PromiseStates) {
    PromiseStates[PromiseStates["Pending"] = 0] = "Pending";
    PromiseStates[PromiseStates["Fulfilled"] = 1] = "Fulfilled";
    PromiseStates[PromiseStates["Rejected"] = -1] = "Rejected";
})(PromiseStates || (PromiseStates = {}));
var PromiseY = /** @class */ (function () {
    function PromiseY(statement) {
        var _this = this;
        var status = this.$_promise_status = PromiseStates.Pending;
        var result = this.$_promise_result = undefined;
        var fulfillCallbacks = this.$_promise_fulfillCallbacks = [];
        var rejectCallbacks = this.$_promise_rejectCallbacks = [];
        //Object.defineProperty(this,"$_promise_status",{enumerable:false,configurable:false,get:()=>status});   
        //Object.defineProperty(this,"$_promise_fulfillCallbacks",{enumerable:false,configurable:false,get:()=>fulfillCallbacks});
        //Object.defineProperty(this,"$_promise_rejectCallbacks",{enumerable:false,configurable:false,get:()=>rejectCallbacks});   
        //Object.defineProperty(this,"$_promise_result",{enumerable:false,configurable:false,get:()=>result});   
        var resolve = function (result) {
            if (status !== PromiseStates.Pending) {
                console.warn("settled状态不应该再调用resolve/reject");
                return _this;
            }
            //如果是自己，就丢出错误
            if (result === _this)
                throw new TypeError("不能把自己resolve掉啊.");
            //resolve的结果是了一个thenable
            if (result && typeof result.then === "function") {
                //让该Promise的状态跟resolve result的状态保持一致
                result.then(function (value) { return fulfill(value); }, function (value) { return reject(value); });
            }
            else {
                //如果是其他的类型，就让promise 变更为fulfill状态
                fulfill(result);
            }
            return _this;
        };
        var reject = function (value) {
            if (status !== PromiseStates.Pending) {
                console.warn("settled状态不应该再调用resolve/reject");
                return _this;
            }
            status = _this.$_promise_status = PromiseStates.Fulfilled;
            result = _this.$_promise_result = value;
            _this.resolve = _this.reject = function (params) { return this; };
            setTimeout(function () {
                var rejectHandlers = fulfillCallbacks;
                _this.$_promise_fulfillCallbacks = _this.$_promise_rejectCallbacks
                    = fulfillCallbacks = rejectCallbacks = null;
                for (var i in rejectHandlers)
                    rejectHandlers[i].call(_this, result, false);
            }, 0);
            return _this;
        };
        var fulfill = function (value) {
            if (status !== PromiseStates.Pending) {
                //循环引用，给个警告，什么都不做
                console.warn("已经处于Settled状态，无法再更正状态");
                return;
            }
            status = _this.$_promise_status = PromiseStates.Fulfilled;
            result = _this.$_promise_result = value;
            setTimeout(function () {
                var fulfillHandlers = fulfillCallbacks;
                _this.$_promise_fulfillCallbacks = _this.$_promise_rejectCallbacks
                    = fulfillCallbacks = rejectCallbacks = null;
                for (var i in fulfillHandlers)
                    fulfillHandlers[i].call(_this, result, true);
            }, 0);
        };
        // ajax().then((rs)=>ajax1()).then
        this.then = function (fulfillHandler, rejectHandler) {
            if (status === PromiseStates.Fulfilled && fulfillHandler) {
                setTimeout(function () {
                    fulfillHandler.call(_this, result, true);
                }, 0);
            }
            if (status === PromiseStates.Rejected && rejectHandler) {
                setTimeout(function () {
                    rejectHandler.call(_this, result, false);
                }, 0);
            }
            if (status !== PromiseStates.Pending)
                return _this;
            if (!fulfillHandler && !rejectHandler)
                return _this;
            var innerResolve;
            var innerReject;
            var newPromise = new PromiseY(function (resolve, reject) {
                innerResolve = resolve;
                innerResolve = reject;
            });
            if (fulfillHandler) {
                fulfillCallbacks.push(function (value) {
                    var rs = fulfillHandler.call(_this, value, true);
                    if (rs && typeof rs.then === "function") {
                        rs.then(innerResolve, innerReject);
                    }
                    else
                        innerResolve.call(newPromise, rs);
                });
            }
            if (rejectHandler) {
                rejectCallbacks.push(function (value) {
                    rejectHandler.call(_this, value, false);
                    innerResolve(undefined);
                });
            }
            return newPromise;
        };
        if (statement) {
            setTimeout(function () {
                try {
                    statement.call(_this, resolve, reject);
                }
                catch (ex) {
                    reject(ex);
                }
            }, 0);
        }
        else {
            this.resolve = resolve;
            this.reject = reject;
        }
    }
    PromiseY.prototype.then = function (fulfillCallback, rejectCallback) {
        console.warn("called on placehold method.");
        return this;
    };
    PromiseY.prototype.resolve = function (result) {
        console.warn("当Promise设置了异步函数时，resolve/reject应该由Promise的异步函数调用");
        return this;
    };
    PromiseY.prototype.reject = function (result) {
        console.warn("当Promise设置了异步函数时，resolve/reject应该由Promise的异步函数调用");
        return this;
    };
    PromiseY.prototype.success = function (callback) {
        return this.then(callback);
    };
    PromiseY.prototype.error = function (callback) {
        return this.then(undefined, callback);
    };
    PromiseY.prototype.complete = function (callback) {
        return this.then(callback, callback);
    };
    PromiseY.prototype.catch = function (callback) {
        return this.then(undefined, callback);
    };
    PromiseY.resolve = function (value) {
        return new PromiseY(function (resolve, reject) { return resolve(value); });
    };
    PromiseY.reject = function (value) {
        return new PromiseY(function (resolve, reject) { return reject(value); });
    };
    return PromiseY;
}());
//# sourceMappingURL=YA.promise.js.map