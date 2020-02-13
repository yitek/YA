declare type TAsyncStatement = (resolve: (result: any) => any, reject: (err: any) => any) => any;
declare enum PromiseStates {
    Pending = 0,
    Fulfilled = 1,
    Rejected = -1
}
declare class PromiseY {
    $_promise_status: PromiseStates;
    $_promise_fulfillCallbacks: {
        (result: any, isSuccess?: boolean): any;
    }[];
    $_promise_rejectCallbacks: {
        (result: any, isSuccess?: boolean): any;
    }[];
    $_promise_result: any;
    constructor(statement?: TAsyncStatement);
    then(fulfillCallback: (result: any) => any, rejectCallback?: (result: any) => any): PromiseY;
    resolve(result: any): PromiseY;
    reject(result: any): PromiseY;
    success(callback: (result: any) => any): PromiseY;
    error(callback: (result: any) => any): PromiseY;
    complete(callback: (result: any) => any): PromiseY;
    catch(callback: (result: any) => any): PromiseY;
    static resolve(value: any): PromiseY;
    static reject(value: any): PromiseY;
}
