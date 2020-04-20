
export interface IInfo{

    /**
     * 方法名，在ClassInfo.method参数中使用
     *
     * @type {string}
     * @memberof IInfo
     */
    name?:string;
    title?:string;
    descriptions?:string|any[];
    notices?:string|string[];
    debugging?:string;
}

export type TAssert = (expected:any,actual:any,message?:string)=>any;
export type TAssertStatement = (assert:TAssert,container?:any)=>any;
export type TUsageStatement = (assert_statement:TAssertStatement)=>any;

export interface IDoct{
    (info:IInfo,target?:any):any;
    createDemoElement?:(immediate:boolean)=>any;
    disposeDemoElement?:(elem:any)=>any;
    hasDemo?:(demoElement:any)=>boolean;
    logger?:ILogger;
    debugging?:boolean;
    autoRun?:boolean;

    /**
     * true/false/immediate,如果是immediate字符串，就会在logger输出的时候直接插入到dom中
     *
     * @type {(boolean|string)}
     * @memberof IDoct
     */
    useDemo?:boolean|string;
}



/**
 * unittest类或unittest方法的装饰器
 *
 * @param {string} name
 */
export function doct(info:IInfo,target?:any):any{//ClassInfo| {(target:any,name?:string):BasInfo}
    let callAsDecorator = target===undefined;
    let decorator = function(target:any,propname?:string):BasInfo{
        if(propname===undefined){
            //定义测试类/测试对象
            let cls:Function;
            if(typeof target==='object') {
                cls = function(){};
                cls.prototype = target;  
            }else cls = target;
            let clsInfo = new ClassInfo(cls,info);
            if(Doct.autoRun) {
                setTimeout(()=>{
                    let logger = Doct.logger || new HtmlLogger();
                    executeClass(clsInfo,logger,info);
                },0);
            }
            if(!callAsDecorator)return clsInfo;
        }else {
            
            let clsInfo:ClassInfo = target.$__doctClass__;
            if(!clsInfo) {
                let members = target.$__doctMethods__;
                if(!members) Object.defineProperty(target,"$__doctMethods__",{enumerable:false,writable:false,configurable:false,value:members={}});
                members[propname]=info;
            }else {
                let methodInfo = new MethodInfo(propname,clsInfo,info);
                clsInfo.methods[propname] = methodInfo;
                if(!callAsDecorator)return methodInfo;
            }
            
        }
    }; 
    //被当作装饰器使用
    if(target===undefined) return decorator;
    return decorator(target) as ClassInfo;
}
export let Doct:IDoct = doct;

Doct.createDemoElement = (immediate:boolean)=>{ 
    let elem = document.createElement("div");
    if(!immediate)elem.style.cssText="position:absolute;visibility:hidden;z-index:-1000;";
    document.body.appendChild(elem);
    return elem;

}
Doct.disposeDemoElement=(elem:any):any=>{
    if(elem) {
        elem.style.cssText="";
        if(!elem.$__doctCustomDispose__)elem.parentNode.removeChild(elem);
        
    }
    return elem;
}
Doct.hasDemo = (demoElement:any) =>demoElement?demoElement.hasChildNodes():false;

Doct.debugging =true;
Doct.useDemo =true;
Doct.autoRun= true;




export class BasInfo{
       
    /**
     * 用于文档生成的标题,由装饰器给出
     *
     * @type {string}
     * @memberof MethodInfo
     */
    title:string;

    /**
     * 用于文档生成的描述信息，由装饰器给出
     *
     * @type {string}
     * @memberof BasInfo
     */
    descriptions:string[];


    /**
     * 描述中的注意事项,由装饰器给出
     *
     * @type {string[]}
     * @memberof BasInfo
     */
    notices:string[];

    constructor(info:IInfo){
        this.title = info.title;
        this.descriptions = (typeof info.descriptions ==="string"?[info.descriptions as string]:info.descriptions)||[];
        this.notices = (typeof info.notices==="string"?[info.notices as string]:info.notices)||[];
        
    }

}
export class ClassInfo extends BasInfo{
    ctor:{new(...args):any};
    methods:{[name:string]:MethodInfo};
    constructor(ctor:Function,info:IInfo){
        super(info);
        this.ctor = ctor as any;
        let existed = this.ctor.prototype.$__meta__;
        if(existed){
            if(existed instanceof ClassInfo) throw new Error("重复调用了doct??");
            this.methods = existed.methods;
        }
        if(!this.methods) this.methods = {};
        Object.defineProperty(this.ctor.prototype,"$__meta__",{enumerable:false,configurable:false,writable:false,value:this});
        let members = this.ctor.prototype.$__doctMethods__;
        if(members) 
            for(const n in members){
                
                let methodInfo = new MethodInfo(n,this,members[n]);
                this.methods[n] = methodInfo;
            }
    }

    
    /**
     * 手动添加某些方法为测试方法
     *
     * @param {(string|string[])} methodname
     * @memberof BasInfo
     */
    method(info:IInfo):ClassInfo{
        this.methods[info.name] = new MethodInfo(info.name,this,info);
        return this;
    }
}

export class MethodInfo extends BasInfo{
    method:TUsageStatement;
    name:string;
    codes:string[];
    classInfo:ClassInfo;
    constructor(name:string,clsInfo:ClassInfo,info:IInfo){
        super(info);
        this.name = name;
        this.classInfo = clsInfo;
        this.method = clsInfo.ctor.prototype[name];
        if(typeof this.method!=='function') throw new Error(`无法在类/对象上找到方法${name}`);
        this.codes = this._makeCodes(this.method);
    }    

    private _makeCodes(func:Function):string[]{
        let trimRegx = /(^\s+)|(\s+$)/g;
        //assert是用function开头
        let assert_proc_name_regx = /^function\s*\(([^\)]+)\s*\)\s*\{/;

        let statement_proc = func.toString();
        let assert_proc_name_match = statement_proc.match(assert_proc_name_regx);
        let assert_proce_name = assert_proc_name_match[1];
        if(!assert_proce_name) return  [statement_proc.substring(assert_proc_name_match[0].length,statement_proc.length-1)];

        let codes = [];
        
        let assert_proc_regx = new RegExp(`[;\\s]?${assert_proce_name.split(',')[0].replace(trimRegx,"")}\\s?\\(`);
        statement_proc = statement_proc.substring(assert_proc_name_match[0].length,statement_proc.length-1);
        let stateBeginAt = 0;
        //let codes = "";
        let c = 0;
        while(true){
            if(c++===10){debugger;break;}
            //let match = assert_proc_regx.exec(statement_proc);
            let match = statement_proc.match(assert_proc_regx);
            if(match){
                let matchAt = match.index;
                let stateCode = statement_proc.substring(stateBeginAt,matchAt);
                if(stateCode) codes.push(stateCode);
                
                let branceCount =1;
                let isInStr;
                for(let i =matchAt+match[0].length,j=statement_proc.length;i<j;i++){
                    let ch = statement_proc[i];
                    if(ch===")"){
                        if(isInStr) continue;
                        if(--branceCount==0){
                            statement_proc = statement_proc.substring(i+1).replace(/^\s*;?/g,"");
                            stateBeginAt=0;
                            break;
                        }
                    }else if(ch==="("){
                        if(isInStr) continue;
                        branceCount++;
                    }else if(ch==="'" || ch==='"'){
                        if(ch===isInStr) isInStr=undefined;
                        else if(!isInStr) isInStr = ch;
                        else continue;
                    }
                }
                if(branceCount) throw new Error("无法解析的函数");
            }else {
                let stateCode = statement_proc.substring(stateBeginAt,statement_proc.length-1);
                if(stateCode)codes.push(stateCode);
                break;
            }
        }

        return codes;
    }
}


///////
// 执行阶段

export interface ILogger{
    beginClass(clsInfo:ClassInfo):ILogger;
    beginMethod(record:IExecuteRecord):ILogger;
    endMethod(record:IExecuteRecord):ILogger;
    endClass(clsInfo:ClassInfo):ILogger;
}

export class AssertException extends Error{
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



/**
 * 执行记录
 *
 * @export
 * @interface IExecuteRecord
 */
export interface IExecuteRecord{
    methodInfo:MethodInfo;

    /**
     * 测试开始时间
     *
     * @type {Date}
     * @memberof IExecuteResult
     */
    beginTime:Date;

    /**
     * 测试结束时间
     *
     * @type {Date}
     * @memberof IExecuteResult
     */
    endTime?:Date;
    
    /**
     * 测试耗时
     *
     * @type {number}
     * @memberof IExecuteResult
     */
    ellapse?:number;

    errorDetail?:any;    


    /**
     *
     *
     * @type {IUsageAssertInfo[]}
     * @memberof IExecuteRecord
     */
    executeInfos?:IExecuteInfo[];

    demoElement?:any;

}


export interface IExecuteInfo{
    code:string;
    asserts?:string[];
}

function executeClass(clsInfo:ClassInfo ,logger:ILogger,des:IInfo):{[name:string]:IExecuteRecord}{
    logger.beginClass(clsInfo);
    try{
        let instance = new clsInfo.ctor();
        let rs = {};
        for(let n in clsInfo.methods){
            if(des.debugging && n.indexOf(des.debugging)<0) continue;
            rs[n] = executeMethod(instance,clsInfo.methods[n],logger);
        }
        return rs;
    }finally{
        logger.endClass(clsInfo);
    }
    
}

function executeMethod(instance:any,methodInfo:MethodInfo,logger:ILogger):IExecuteRecord{
    let record :IExecuteRecord = {methodInfo:methodInfo,beginTime:new Date(),executeInfos:[]};
    let end:Date;
    let index:number = 0;
    let assert_proc = (assert_statement:(assert:(expected,actual,message)=>any)=>any)=>{
        end = record.endTime = new Date();
        record.ellapse = record.endTime.valueOf()-record.beginTime.valueOf();
        
        assert_statement(makeAssert(methodInfo,index,record));
        index++;
        
    };
    for(const i in methodInfo.codes){
        record.executeInfos[i] = {code:methodInfo.codes[i],asserts:[]};
    }
    let demoElement =Doct.useDemo && Doct.createDemoElement? Doct.createDemoElement(Doct.useDemo==="immediate"):null;
    record.demoElement = demoElement;
    logger.beginMethod(record);
    try{
        if((doct as any).debugging){
            
            methodInfo.method.call(instance,assert_proc,demoElement);
        }else {
            try{
                this.statement.call(this,assert_proc,demoElement);
            }catch(ex){
                record.errorDetail=ex;
                
            }
        }
    }finally{
        if(end===undefined){
            end = record.endTime = new Date();
            record.ellapse = record.endTime.valueOf()-record.beginTime.valueOf();
        }

        if(demoElement && Doct.useDemo){
            Doct.disposeDemoElement(demoElement);
            if(!Doct.hasDemo(demoElement)){
                record.demoElement = null;
                if(demoElement.parentNode) demoElement.parentNode.removeChild(demoElement);
            } 
        } 
        logger.endMethod(record);
        
    }
    
            
    return record;
}

function makeAssert(doc:MethodInfo,codeIndex:number,record:IExecuteRecord){
    let code = doc.codes[codeIndex];
    let assert= (expected:any,actual:any,msg:string,paths?:string[])=>{
        //if(!record.executeInfos) record.executeInfos = [];
        let assertInfo = record.executeInfos[codeIndex] ;
        //if(!assertInfo) assertInfo = record.executeInfos[codeIndex]= {code:code,asserts:[]};
        let asserts :string[] = assertInfo.asserts;
        if(msg===undefined && typeof expected==="boolean" && typeof actual==="string"){
            msg = actual;
            actual = expected;
            expected = true;
        }
        if(!paths && msg) msg = msg.replace(/\{actual\}/g,JSON.stringify(actual)).replace(/\{expected\}/g,JSON.stringify(expected));
        if(actual===expected) {
            if(msg)asserts.push(msg);
            return;
        }
        let t = typeof(expected);
        
        if(t==="object"){
            paths||(paths=[]);
            //let nullMsg = msg || "期望有值";
            if(!actual) throw new AssertException(paths.join(".")+"不应为空.",msg);
    
            for(let n in expected){
                paths.push(n);
                let expectedValue = expected[n];
                let actualValue = actual[n];
                if(typeof expectedValue==="object"){
                    assert(actualValue,expectedValue,msg,paths);
                }else {
                    if(actualValue!==expectedValue){
                        throw new AssertException(`${paths?paths.join("."):""}期望值为${expectedValue},实际为${actualValue}`,msg);
                    }
                }
                paths.pop();
            }
            if(msg && !paths.length){
                asserts.push(msg);
            }
        }else if(actual!==expected){
            throw new AssertException(`${paths?paths.join("."):""}期望值为${expected},实际为${actual}`,msg);
        }else {
            if( msg && !paths){
                asserts.push(msg);
            }
        }
    };
    return assert;
}

////////////////////
// 日志



export class HtmlLogger implements ILogger{
    container:any;
    private _usagesElement;
    private _usageElement;
    constructor(container?:any){
        if(!container){
            try{
                container = document.body;
            }catch(ex){}
        }
        this.container = container;
    }
    beginClass(clsInfo:ClassInfo):ILogger{
        
        let dlist = makeBas(clsInfo,"doct",this.container);
        let dt = createElement("dt","usages",dlist,"用法说明");
        let dd = createElement("dd","usages",dlist);
        this._usagesElement = createElement("ul","usages",dd);
        return this;
    }
    beginMethod(record:IExecuteRecord):ILogger{
        let li = createElement("li","usage",this._usagesElement);
        this._usageElement = makeBas(record.methodInfo,"usage",li);
        
        return this;
    }
    endMethod(record:IExecuteRecord):ILogger{
        if(record.executeInfos.length>0){
            let dt = createElement("dt","codes",this._usageElement);
            dt.innerHTML = "代码";
            let dd = createElement("dd","codes",this._usageElement);
            let codes = createElement("ul","codes",dd);
            for(const i in record.executeInfos){
                let execuetInfo = record.executeInfos[i];
                let codeli = createElement("li","code",codes);
                let cd = createElement("code","code",codeli);
                let pre= createElement("pre","code",cd);
                pre.innerHTML = execuetInfo.code.replace(/</g,"&lt;").replace(/>/g,"&gt;");
                if(execuetInfo.asserts.length){
                    let comment = createElement("div","comments",codeli);
                    createElement("ins","comment",comment,"/*");
                    let asserts = createElement("ol","asserts",comment);
                    
                    for(const j in execuetInfo.asserts){
                        let assertLi = createElement("li","assert",asserts,execuetInfo.asserts[j]);
                    }
                    createElement("ins","comment",comment,"*/");
                }
            }
        }
        

        if(record.demoElement){
            let dt = createElement("dt","demo",this._usageElement);
            dt.innerHTML = "运行效果";
            let dd = createElement("dd","demo",this._usageElement);
            dd.appendChild(record.demoElement);
            (record.demoElement as any).$__doctCustomDispose__=true;
        }

        let ins = createElement("dt","perf",this._usageElement,"性能");
        let dd = createElement("dd","demo",this._usageElement,record.ellapse.toString());

        return this;
    }
    endClass(clsInfo:ClassInfo):ILogger{
        if(!this._usagesElement.hasChildNodes()) this._usagesElement.parentNode.removeChild(this._usagesElement);
        return this;
    }
}

function createElement(tag:string,cls?:string,parent?:any,content?:string):any{
    let elem = document.createElement(tag);
    if(cls) elem.className = cls;
    if(parent) parent.appendChild(elem);
    if(content) elem.innerHTML = content;
    return elem;
};

function makeBas(basInfo:BasInfo,cls:string,p:any){
    let fs = createElement("fieldset",cls,p);
    let legend = createElement("legend",cls,fs,basInfo.title);
    let dlist= createElement("dl",cls,fs);
    if(basInfo.descriptions.length){
        let dt = createElement("dt","descriptions",dlist,"说明");
        let dd = createElement("dd","descriptions",dlist);
        makeDescList(basInfo.descriptions,dd);
    }
    if(basInfo.notices.length){
        let dt = createElement("dt","notices",dlist,"注意");
        let dd = createElement("dd","notices",dlist);
        let ol = createElement("ol","notices",dd);
        for(const i in basInfo.notices){
            let content = basInfo.notices[i];
            if(content && (content = htmlEncode(content.replace(/(^\s+)|(\s+$)/g,""))))
                createElement("li","",ol).innerHTML = content ;
        }
    }
    return dlist;
}
function makeDescList(arr:any[],p:any){
    let ul;
    for(const i in arr){
        let item = arr[i];
        if(typeof item==="string"){
            item = item.replace(/(^\s+)|(\s+$)/g,"");
            if(!item) continue;
            if(!ul) ul = createElement("ul","description-list",p);
            let li = createElement("li","description-paragraph",ul);
            li.innerHTML = "<p>" + item.replace(/\n/g,"</p><p>") + "</p>";
        }else {
            let sub = makeDescList(item,null);
            if(sub){
                if(!ul) ul = createElement("ul","description-list",p);
                let li = createElement("li","description-paragraph",ul);
                li.appendChild(sub);
            }
        }
    }
    return ul;
}

function htmlEncode(content:string){
    if(content===undefined||content===null) return "";
    return content.toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br />");
}