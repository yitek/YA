type TAsyncStatement=(resolve:(result:any)=>any,reject:(err:any)=>any)=>any;
    enum PromiseStates{
        Pending=0,
        Fulfilled=1,
        Rejected=-1
    }
    class PromiseY{
        $_promise_status:PromiseStates;
        $_promise_fulfillCallbacks:{(result:any,isSuccess?:boolean):any}[];
        $_promise_rejectCallbacks:{(result:any,isSuccess?:boolean):any}[];
        $_promise_result:any;
        
        constructor(statement?:TAsyncStatement){
            let status =this.$_promise_status= PromiseStates.Pending;
            let result =this.$_promise_result = undefined;
            let fulfillCallbacks:{(result:any,isSuccess?:boolean):any}[] = this.$_promise_fulfillCallbacks=[];
            let rejectCallbacks:{(result:any,isSuccess?:boolean):any}[] = this.$_promise_rejectCallbacks =[];
            //Object.defineProperty(this,"$_promise_status",{enumerable:false,configurable:false,get:()=>status});   
            //Object.defineProperty(this,"$_promise_fulfillCallbacks",{enumerable:false,configurable:false,get:()=>fulfillCallbacks});
            //Object.defineProperty(this,"$_promise_rejectCallbacks",{enumerable:false,configurable:false,get:()=>rejectCallbacks});   
            //Object.defineProperty(this,"$_promise_result",{enumerable:false,configurable:false,get:()=>result});   
        
            let resolve =(result:any):PromiseY=>{
                if(status!==PromiseStates.Pending){ 
                    console.warn("settled状态不应该再调用resolve/reject");
                    return this; 
                }
                
                //如果是自己，就丢出错误
                if(result===this) throw new TypeError("不能把自己resolve掉啊.");
                //resolve的结果是了一个thenable
                if(result && typeof result.then ==="function"){
                    //让该Promise的状态跟resolve result的状态保持一致
                    result.then(
                        (value)=>fulfill(value)
                        ,(value)=>reject(value)
                    );
                }else {
                    //如果是其他的类型，就让promise 变更为fulfill状态
                    fulfill(result);
                }
                
                return this;
            };
            let reject = (value:any):PromiseY=>{
                if(status!==PromiseStates.Pending){ 
                    console.warn("settled状态不应该再调用resolve/reject");
                    return this; 
                }
                
                status = this.$_promise_status = PromiseStates.Fulfilled;
                result = this.$_promise_result = value;
                this.resolve = this.reject=function (params:any):PromiseY { return this; }

                setTimeout(()=>{
                    let rejectHandlers = fulfillCallbacks;
                    
                    this.$_promise_fulfillCallbacks = this.$_promise_rejectCallbacks
                    =fulfillCallbacks = rejectCallbacks =null;

                    for(const i in rejectHandlers)
                        rejectHandlers[i].call(this,result,false);                    
                },0);
                return this;
            };
            let fulfill = (value:any)=>{
                if(status!==PromiseStates.Pending) {
                    //循环引用，给个警告，什么都不做
                    console.warn("已经处于Settled状态，无法再更正状态");
                    return;
                }

                status = this.$_promise_status = PromiseStates.Fulfilled;
                result = this.$_promise_result = value;
                
                setTimeout(()=>{
                    let fulfillHandlers = fulfillCallbacks;
                    this.$_promise_fulfillCallbacks = this.$_promise_rejectCallbacks
                    =fulfillCallbacks = rejectCallbacks = null;

                    for(const i in fulfillHandlers)
                        fulfillHandlers[i].call(this,result,true);
                    
                },0);

            };
            // ajax().then((rs)=>ajax1()).then
            this.then = (fulfillHandler:(result)=>any,rejectHandler?:(result)=>any):PromiseY=>{
                if(status ===PromiseStates.Fulfilled && fulfillHandler){
                    setTimeout(()=>{
                        fulfillHandler.call(this,result,true);
                    },0);
                }
                if(status===PromiseStates.Rejected && rejectHandler){
                    setTimeout(()=>{
                        rejectHandler.call(this,result,false);
                    },0);
                }
                if(status !==PromiseStates.Pending) return this;
                
                if(!fulfillHandler && !rejectHandler) return this;
                
                let innerResolve;
                let innerReject;
                let newPromise = new PromiseY((resolve,reject)=>{
                    innerResolve = resolve;
                    innerResolve =reject;
                });
                
                if(fulfillHandler){
                    fulfillCallbacks.push((value:any)=>{
                        let rs = fulfillHandler.call(this,value,true);
                        if(rs && typeof rs.then ==="function"){ rs.then(innerResolve,innerReject); }
                        else innerResolve.call(newPromise,rs);
                    });
                    
                }
                if(rejectHandler){
                    rejectCallbacks.push((value:any)=>{
                        rejectHandler.call(this,value,false);
                        innerResolve(undefined);
                    });
                }
                return newPromise;
                
            }

            if(statement){
                setTimeout(() => {
                    try{
                        statement.call(this,resolve,reject);
                    }catch(ex){
                        reject(ex);
                    }
                }, 0);
            }else{
                this.resolve = resolve;
                this.reject = reject;
            }
            
        }
        then(fulfillCallback:(result)=>any,rejectCallback?:(result)=>any):PromiseY{
            console.warn("called on placehold method.");
            return this;
        }
        
        resolve(result:any):PromiseY{
            console.warn("当Promise设置了异步函数时，resolve/reject应该由Promise的异步函数调用");
            return this;
        }
        reject(result:any):PromiseY{
            console.warn("当Promise设置了异步函数时，resolve/reject应该由Promise的异步函数调用");
            return this;
        }
        success(callback:(result)=>any):PromiseY{
            return this.then(callback);
        }
        error(callback:(result)=>any):PromiseY{
            return this.then(undefined,callback);
        }
        complete(callback:(result)=>any):PromiseY{
            return this.then(callback,callback);
        }
        catch(callback:(result)=>any):PromiseY{
            return this.then(undefined,callback);
        }
        static resolve(value:any):PromiseY{
            return new PromiseY((resolve,reject)=>resolve(value));
        }
        static reject(value:any):PromiseY{
            return new PromiseY((resolve,reject)=>reject(value));
        }
    }