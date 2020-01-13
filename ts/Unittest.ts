export interface ITestLogger{
    beginGroup(title:string);
    endGroup();
    info(msg:string);
    assert(condition:boolean,msg:string);
    error(msg:string,err?:Error);
    warn(msg:string);
}
 
export class UnittestError extends Error{
    outerMessage:string;
    constructor(msg:string,outerMessage?:string){
        super(msg);
        this.outerMessage=outerMessage;
    }
    toString(){
        if(this.outerMessage) return this.outerMessage;
        return super.toString();
    }
}

export class Unittest{
    _$members:{[name:string]:any};
    _$errors:{
        Message:string,
        Exception?:Error,
        Name?:string
    }[];
    $NAME:string;
    _$logger:ITestLogger;
    constructor(name?:string,logger?:ITestLogger){
        this.$NAME = name;
        this._$members={};
        this._$errors=[];
        if(!logger) logger={
            info:(msg)=>console.info(msg)
            ,error:(msg,err)=>console.error(msg,err)
            ,assert:(cond,msg)=>console.assert(cond,msg)
            ,warn:(msg)=>console.warn(msg)
            ,beginGroup:(title)=>console.group(title)
            ,endGroup:()=>console.groupEnd()
        };
        this._$logger=logger;
        
    }

    $RUN(target?:any):{
        Message:string,
        Exception?:Error,
        Name?:string
    }[]{
        if(!target) target = this;
        if(typeof target==="function") target = new target();
        let count = 0;
        this._$logger.beginGroup(`{${this.$NAME}}`);
        let assert =(expected?:any,actual?:any,msg?:string,paths?:string[])=>{
            if(!paths && msg) msg = msg.replace(/\{actual\}/g,JSON.stringify(actual)).replace(/\{expected\}/g,JSON.stringify(expected));
            if(actual===expected) {
                if(!Unittest.hiddenSteps && msg && !paths){
                    this._$logger.info(msg);
                }
                return;
            }
            let t = typeof(expected);
            
            if(t==="object"){
                paths||(paths=[]);
                //let nullMsg = msg || "期望有值";
                if(!actual) throw new UnittestError(paths.join(".")+"不应为空.",msg);

                for(let n in expected){
                    paths.push(n);
                    let expectedValue = expected[n];
                    let actualValue = actual[n];
                    if(typeof expectedValue==="object"){
                        assert(actualValue,expectedValue,msg,paths);
                    }else {
                        if(actualValue!==expectedValue){
                            throw new UnittestError(`${paths?paths.join("."):""}期望值为${expectedValue},实际为${actualValue}`,msg);
                        }
                    }
                    paths.pop();
                }
                if(!Unittest.hiddenSteps && msg && !paths.length){
                    this._$logger.info(msg);
                }
            }else if(actual!==expected){
                throw new UnittestError(`${paths?paths.join("."):""}期望值为${expected},实际为${actual}`,msg);
            }else {
                if(!Unittest.hiddenSteps && msg && !paths){
                    this._$logger.info(msg);
                }
            }
        }
        let info = (msg:string,expected?:any)=>{
            msg = msg.replace(/\{variable\}/g,JSON.stringify(expected));
            this._$logger.info(msg);
        }
        for(let name in target){
            if(name==="$RUN" || name==="$NAME") continue;
            let fn = (target as any)[name];
            if(typeof fn !=="function") continue; 
            this._$logger.beginGroup(`(${name})`);
                        
            let ex=undefined;
            try{
                count++;
                fn.call(target,assert,info);
                this._$members[name]=true;
                
            }catch(ex){
                this._$members[name]=false;
                let msg = ex.outerMessage || ex.toString();
                this._$errors.push({
                    Message:msg,
                    Exception:ex,
                    Name:name
                });
                this._$logger.error(msg,ex);
            }
            this._$logger.endGroup();
             
        }
        this._$errors.length?this._$logger.warn(`结束测试{${this.$NAME}},错误率:${this._$errors.length}/${count}=${this._$errors.length*100/count}%.`):this._$logger.info(`结束测试{${this.$NAME}},错误率:${this._$errors.length}/${count}=0%..`);
        this._$logger.endGroup();
        return this._$errors; 
    } 
    static Test(name:string|object|Function,target?:object|Function):Unittest{
        if(target===undefined){
            target = name as Object;
            name=undefined;
        }
        let utest = new Unittest(name as string);
        utest.$RUN(target);
        return utest;

    }

    static hiddenSteps:boolean;
   
}